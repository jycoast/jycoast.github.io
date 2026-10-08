---
title: JMS
---

JMS（Java Message Service）是 Java EE 面向**消息中间件**的访问规范。它定义的是「应用怎么收发消息」的接口，而不是消息中间件本身——真正投递消息的是 ActiveMQ、RocketMQ 这类 Broker。理解 JMS 的价值在于：今天用的 RocketMQ、Kafka，消息模型、确认机制、事务语义几乎都能在 JMS 里找到原型。

## 要解决什么问题

同步调用（RPC）在服务之间建立的是强耦合：调用方必须等被调方返回，被调方挂掉调用方就失败。消息中间件把它改成异步：

| 维度 | 同步调用 | 基于消息 |
| --- | --- | --- |
| 耦合 | 调用方需知道被调方地址 | 只依赖消息目的地 |
| 可用性 | 被调方故障即失败 | 消息暂存，恢复后继续处理 |
| 流量削峰 | 无法缓冲 | 队列天然缓冲 |
| 调用结果 | 立即返回 | 异步，需回执机制 |

代价是：系统变复杂，需要处理重复消费、消息丢失、顺序性问题。

## 两种消息模型

JMS 规范定义了两种模型，这是最核心的概念区分：

| 维度 | 点对点 P2P (Queue) | 发布订阅 Pub/Sub (Topic) |
| --- | --- | --- |
| 目的地 | Queue（队列） | Topic（主题） |
| 消费关系 | 一条消息只被一个消费者消费 | 一条消息被所有订阅者消费 |
| 广播能力 | 无 | 有 |
| 典型场景 | 任务分发、削峰 | 事件通知、缓存刷新 |
| 是否持久 | 队列持久化，离线消费者上线后仍可消费 | 默认不持久，订阅者不在线就错过 |

对应到工程实践，就是「做任务」用队列，「做通知」用主题。

<div class="note info"><p>Pub/Sub 的「错过就没了」在生产里通常不可接受，所以 JMS 提供了<b>持久订阅（Durable Subscription）</b>：订阅者离线期间，Broker 会代为保存消息，重新上线后补投。代价是 Broker 需要为每个持久订阅者维护消息存储。</p></div>

## 核心 API

JMS 的编程模型有一条固定链路，记顺序即可：

```text
ConnectionFactory → Connection → Session → { Destination + Producer / Consumer } → Message
```

```java
// 1. 连接工厂：通常从 JNDI 获取，或由框架注入
ConnectionFactory factory = new ActiveMQConnectionFactory("tcp://127.0.0.1:61616");

// 2. 连接：与 Broker 之间的物理连接，重量级，应复用
try (Connection connection = factory.createConnection()) {
    connection.start();

    // 3. 会话：发送/接收消息的上下文，非线程安全
    //    参数一：是否启用事务；参数二：确认模式
    Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);

    // 4. 目的地
    Queue queue = session.createQueue("order.created");
    // Topic topic = session.createTopic("cache.refresh");   // Pub/Sub 换这个

    // 5. 生产者发送
    MessageProducer producer = session.createProducer(queue);
    producer.setDeliveryMode(DeliveryMode.PERSISTENT);
    producer.send(session.createTextMessage("order-1001"));

    // 6. 消费者接收
    MessageConsumer consumer = session.createConsumer(queue);
    consumer.setMessageListener(message -> {
        TextMessage text = (TextMessage) message;
        try {
            System.out.println("收到: " + text.getText());
        } catch (JMSException e) {
            throw new RuntimeException(e);
        }
    });

    // 保持进程存活以便接收（异步监听模式下必须有）
    Thread.sleep(5_000);
}
```

<div class="note warning"><p><code>Session</code> <b>不是线程安全的</b>。多线程共用一个 Session 并发发送会导致消息错乱或抛异常，正确做法是每个线程各自创建 Session（连接 Connection 是线程安全的，可以共享）。这是 JMS 使用中最常见的一类线上问题。</p></div>

## 消息类型

JMS 规范固定了五种消息体，前四种最常用：

| 类型 | 内容 | 典型场景 |
| --- | --- | --- |
| `TextMessage` | 字符串 | JSON 报文（最常用） |
| `MapMessage` | 键值对（键为 String，值可为基本类型） | 结构化字段 |
| `BytesMessage` | 字节流 | 文件、二进制 |
| `ObjectMessage` | 可序列化对象 | 不推荐，反序列化风险 |
| `StreamMessage` | 基本类型流 | 少见 |

除了消息体，消息还可以带**属性（Properties）**，供消费者做选择器过滤：

```java
Message msg = session.createTextMessage(json);
msg.setStringProperty("region", "cn-hangzhou");
msg.setIntProperty("retry", 0);
producer.send(msg);

// 消费者只接收特定属性的消息
MessageConsumer consumer = session.createConsumer(queue, "region = 'cn-hangzhou' AND retry < 3");
```

<div class="note warning"><p><code>ObjectMessage</code> 依赖 Java 原生反序列化，接收方会反序列化不可信数据，历史上多次成为远程代码执行漏洞的入口（与 RMI 同源）。除非完全可控的内部系统，否则<b>统一用 <code>TextMessage</code> 传 JSON</b> 是更安全的约定。</p></div>

## 确认机制

消费者何时告诉 Broker「这条消息我处理完了」，直接决定消息会不会丢、会不会重复。JMS 定义了三种模式（`createSession` 的第二个参数）：

| 模式 | 确认时机 | 风险 | 适用性 |
| --- | --- | --- | --- |
| `AUTO_ACKNOWLEDGE` | 消息交给消费者后自动确认 | 可能丢失（处理失败时已确认） | 允许少量丢失 |
| `CLIENT_ACKNOWLEDGE` | 业务处理成功后显式确认 | 可能重复（确认前崩溃） | **推荐** |
| `DUPS_OK_ACKNOWLEDGE` | 批量延迟确认 | 允许重复 | 能容忍重复的场景 |

```java
Session session = connection.createSession(false, Session.CLIENT_ACKNOWLEDGE);
MessageConsumer consumer = session.createConsumer(queue);
Message message = consumer.receive();
try {
    handle(message);                 // 先处理业务
    message.acknowledge();           // 处理成功后再确认
} catch (Exception e) {
    // 不确认 → 消息会在会话关闭或超时后重新投递
    log.error("处理失败，等待重投", e);
}
```

由此推出消息系统的根本矛盾：**「至少一次」与「至多一次」只能选一个，绝大多数实现选择「至少一次」**，因此消费端必须具备**幂等能力**——用业务唯一键（订单号、消息 ID）做去重，而不是期待消息只来一次。

<div class="note info"><p>确认模式的差异可以这样理解：<code>AUTO_ACKNOWLEDGE</code> 是「发出去就算收到」，<code>CLIENT_ACKNOWLEDGE</code> 是「我明确说收到了才算收到」。后者把确认时机交给业务代码，因此在处理成功后确认才能真正避免消息丢失。</p></div>

## 事务性会话

`createSession(true, ...)` 创建一个事务性会话：消息的发送与确认进入同一个事务，直到 `commit()` 才生效。

```java
Session session = connection.createSession(true, Session.SESSION_TRANSACTED);
try {
    producer.send(session.createTextMessage("a"));
    producer.send(session.createTextMessage("b"));
    session.commit();          // 两条消息原子投递，要么都发出，要么都不发
} catch (Exception e) {
    session.rollback();        // 回滚：已发送的消息被撤销
}
```

会话事务只保证「消息收发这一侧」的原子性，**不跨越数据库**。真正的「数据库写入 + 消息发送」一致性是分布式事务问题，工程上的常见做法是：

- **本地消息表**：业务操作与「待发消息」写入同一个数据库事务，再由定时任务或 CDC 投递。
- **事务消息**：RocketMQ 等的两阶段提交（半消息 → 本地事务 → 提交/回滚），本质是把 JMS 的会话事务扩展成跨系统协议。
- **最大努力通知**：允许最终不一致，用对账兜底。

## 消息的可靠性属性

`MessageProducer` 上有三个属性，决定了消息的「重量」：

```java
producer.setDeliveryMode(DeliveryMode.PERSISTENT);   // 持久化：Broker 宕机不丢
producer.setPriority(9);                             // 0~9，越大越优先（需 Broker 支持）
producer.setTimeToLive(60_000);                      // 过期时间，超时进死信队列
```

- **持久化 vs 非持久化**：非持久化消息只存内存，Broker 重启即丢，但吞吐更高。**资金、订单类必须持久化**。
- **优先级**：多数 Broker 只是有限支持，不能作为业务逻辑的依赖。
- **过期与死信**：超过 `timeToLive` 或重试次数上限的消息进入死信队列（DLQ），需要专门的监控与人工/自动补偿流程——**没有死信处理方案就等于消息会静默丢失**。

## JMS 与主流中间件

JMS 是规范，各中间件的对应关系是理解选型的关键：

| 中间件 | 是否遵循 JMS | 模型 | 特点 |
| --- | --- | --- | --- |
| ActiveMQ | 是（1.1 完整实现） | Queue / Topic | 老牌、规范兼容好，性能一般 |
| RabbitMQ | 否（遵循 AMQP） | 更灵活的 Exchange 路由 | 可靠、路由能力强 |
| RocketMQ | 否（兼容部分 JMS 语义） | 主题 + 队列 | 高吞吐、支持事务消息 |
| Kafka | 否 | 分区日志（发布订阅） | 极高吞吐，适合流式与日志 |

<div class="note info"><p>虽然多数新中间件不严格实现 JMS 接口，但概念是通的：JMS 的 <code>Queue</code> ≈ RocketMQ 的队列（同一消费组内竞争消费），<code>Topic</code> ≈ RocketMQ 的主题 / Kafka 的 topic（不同消费组各自消费全量）。<b>先掌握 JMS 的模型，再看具体中间件，认知成本会低得多。</b></p></div>

Spring 里这些细节被进一步封装：

```java
@Component
public class OrderNotifier {
    @Autowired
    private JmsTemplate jmsTemplate;        // 或 RocketMQTemplate / KafkaTemplate

    public void send(Order order) {
        jmsTemplate.convertAndSend("order.created", order);
    }

    @JmsListener(destination = "order.created")
    public void onMessage(Order order) {
        // 收到消息；确认与重试由监听容器按配置处理
    }
}
```

## 顺序与重复

两个逃不掉的问题，也是面试常问：

- **顺序性**：队列本身是 FIFO，但一旦有多个消费者并发消费，顺序就无法保证。要做到局部有序，需要按业务键（如订单号）哈希到同一个队列，且该队列同一时刻只有一个消费者在工作。全局有序代价极高，通常不需要。
- **重复消费**：由「至少一次」投递语义决定，属于正常现象而非故障。解决方案是幂等——唯一索引约束、去重表、状态机判断（只允许从「待支付」流转到「已支付」），而不是试图让 Broker 保证不重复。

## 面试问答

### JMS 的两种消息模型有什么区别？

点对点（Queue）中一条消息只由队列上的一个消费者消费，消费者之间是竞争关系，适合任务分发与削峰；发布订阅（Topic）中一条消息会投递给所有订阅者，适合事件通知。前者天然持久（离线消费者上线后能消费积压消息），后者默认不持久，需要持久订阅才能保证离线期间不丢消息。

### JMS 的确认模式有哪几种？

三种：`AUTO_ACKNOWLEDGE` 在消息送达消费者后自动确认，处理失败会丢消息；`CLIENT_ACKNOWLEDGE` 由业务代码在处理成功后调用 `acknowledge()`，能真正避免丢失，是推荐模式；`DUPS_OK_ACKNOWLEDGE` 延迟批量确认，性能换重复。要避免丢消息就用 `CLIENT_ACKNOWLEDGE`，并且消费端必须幂等。

### 如何保证消息不丢？

分三段看：生产端用持久化投递（`PERSISTENT`）+ 发送确认（或在事务/本地消息表内发送）；Broker 端开启持久化存储与主从/副本；消费端在处理成功后再确认，并配合重试与死信队列兜底。三段缺任何一段，消息都可能在对应环节丢失——只做其中一段往往给人「已经可靠了」的错觉。

### 消息重复怎么处理？

重复是「至少一次」投递语义的必然结果，正确做法是消费端幂等而非要求不重复：用业务唯一键（订单号 / 消息 ID）建唯一索引或去重表，或用状态机限制流转（如只允许「待支付 → 已支付」一次），使重复执行的结果与执行一次一致。

### JMS 事务能保证数据库和消息的一致性吗？

不能。JMS 的事务只覆盖消息的发送与确认，不跨数据库。要保证「数据库写入成功且消息发出」需要额外机制：本地消息表（与业务同库同事务，再异步投递）、事务消息（两阶段提交的半消息方案），或接受最终一致并用对账补偿。

### 为什么新项目多用 RocketMQ/Kafka 而不是 JMS？

JMS 是接口规范，性能与扩展性受具体实现限制，且规范本身演进缓慢。RocketMQ、Kafka 虽不实现 JMS 接口，但提供了更高的吞吐、更好的水平扩展、事务消息与流式处理能力，同时生态（监控、运维、客户端）更完善。不过它们的消息模型、确认语义与 JMS 一脉相承，理解 JMS 有助于快速掌握它们。
