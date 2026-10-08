---
title: EJB
---

EJB（Enterprise JavaBeans）是 Java EE 中承载业务逻辑的**分布式组件模型**。它曾经是 Java EE 的核心与代名词，也曾经因为「写一个 Hello World 要一堆接口和描述符」而声名狼藉。理解 EJB 的意义在于两点：**声明式事务、容器托管组件**这两个今天仍在使用的思想由它确立；而 Spring 之所以流行，正是因为用 POJO 重新实现了同样的能力。

## EJB 是什么

EJB 不是一个「类」，而是一类**由容器托管的业务组件**，运行在 EJB 容器中（WildFly、WebLogic、WebSphere 等完整 Java EE 应用服务器）。

容器为 EJB 提供的横切能力：

| 能力 | 说明 |
| --- | --- |
| 生命周期管理 | 实例创建、池化、销毁由容器负责，开发者不写 `new` |
| 声明式事务 | 加注解即自动开启/提交/回滚事务 |
| 安全管理 | 基于角色的方法级权限，由容器拦截 |
| 并发与线程 | 容器保证单线程访问，开发者不必处理并发 |
| 远程调用 | 自动生成 Stub，支持远程访问 |
| 资源注入 | 数据源、JMS、其他 EJB 通过注解注入 |

<div class="note info"><p>EJB 的「单线程模型」是一条硬约定：容器保证任一时刻<b>只有一个线程</b>在执行某个 EJB 实例的方法。因此 EJB 里可以安全地把状态放在成员变量上（这也是 Stateful Bean 成立的前提），不需要自己加锁。这与 Servlet「单实例多线程」的模型正好相反。</p></div>

## 三次版本演进

EJB 的历史就是「如何把复杂的东西变简单」的历史，也是它被 Spring 取代的过程：

| 版本 | 关键变化 | 开发者感受 |
| --- | --- | --- |
| EJB 2.x | 组件必须继承容器基类、实现多个接口，还要写部署描述符 | 极重，无法脱离容器单测 |
| EJB 3.0 | 引入注解（`@Stateless` 等）；POJO + 接口；用 JPA 取代 Entity Bean；支持依赖注入 | 明显简化，但生态已被 Spring 占据 |
| EJB 3.1+ | 支持无接口 Bean（`@LocalBean`）、异步方法、单例 Bean、可嵌入容器（便于测试） | 追上 Spring，时机已晚 |

## 三种 Bean

EJB 3.x 有三种业务 Bean（原来的 Entity Bean 已被 JPA 取代，不再是 EJB）：

| 类型 | 注解 | 实例与状态 | 典型用途 |
| --- | --- | --- | --- |
| 无状态会话 Bean | `@Stateless` | 池化多实例，无状态 | 业务服务、事务边界（最常用） |
| 有状态会话 Bean | `@Stateful` | 每客户端一实例，有状态 | 购物车、多步向导 |
| 单例会话 Bean | `@Singleton` | 全局唯一，有状态 | 缓存、全局配置、启动初始化 |
| 消息驱动 Bean | `@MessageDriven` | 池化多实例，无状态 | 异步消费 JMS 消息 |

**无状态会话 Bean** 是最常用的一种，池化复用、性能最好：

```java
@Stateless
public class OrderService {

    @PersistenceContext
    private EntityManager em;           // 容器注入，事务内自动管理

    @Resource
    private DataSource dataSource;      // 按名字注入资源

    public Order create(OrderRequest req) {
        Order order = new Order(req);
        em.persist(order);
        return order;
    }
}
```

<div class="note warning"><p>无状态 Bean 的「无状态」指的是<b>不保存与特定客户端相关的会话状态</b>，不是「不能有字段」。容器会把同一个实例轮流给不同客户端使用，所以成员变量里绝不能放用户数据——这与 Servlet 的线程安全问题同源，只是 EJB 用池化替代了并发调用。</p></div>

**有状态会话 Bean** 为每个客户端维护独立实例，实例会被容器「钝化」（序列化到磁盘）与「激活」（恢复到内存）以节省资源：

```java
@Stateful
public class ShoppingCartBean implements ShoppingCart {

    private final List<Item> items = new ArrayList<>();   // 属于某一个客户端

    @Override
    public void add(Item item) { items.add(item); }

    @Override
    public List<Item> list() { return List.copyOf(items); }

    @Remove                                            // 调用后容器销毁实例
    public void checkout() { /* 下单 */ }
}
```

因为需要钝化/激活，有状态 Bean 的字段必须可序列化，且实例不能过多——这也是它使用较少的原因。

**单例会话 Bean** 全局唯一，常用于缓存与启动初始化，并发访问需要 `@Lock` 控制：

```java
@Singleton
@Startup                                   // 应用启动时立即创建
public class ConfigCache {

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    @PostConstruct
    public void load() { /* 启动时加载配置 */ }

    @Lock(LockType.READ)                   // 默认是 WRITE，读多写少时改为 READ 提升并发
    public String get(String key) { return cache.get(key); }
}
```

**消息驱动 Bean** 是 JMS 的消费者封装，由容器管理并发与事务：

```java
@MessageDriven(activationConfig = {
    @ActivationConfigProperty(propertyName = "destinationType", propertyValue = "javax.jms.Queue"),
    @ActivationConfigProperty(propertyName = "destination", propertyValue = "queue/order.created")
})
public class OrderMessageBean implements MessageListener {

    @Override
    public void onMessage(Message message) {
        // 收到消息即在一个容器管理的事务中执行
    }
}
```

## 声明式事务

EJB 确立的最有价值的思想：**事务不由业务代码控制，而由容器根据元数据在方法边界处自动处理**。

```java
@Stateless
public class TransferService {

    @TransactionAttribute(TransactionAttributeType.REQUIRED)   // 默认值
    public void transfer(Long from, Long to, BigDecimal amount) {
        accountDao.debit(from, amount);
        accountDao.credit(to, amount);
        // 正常返回 → 容器提交；抛 RuntimeException → 容器回滚
    }
}
```

六种事务属性，覆盖了所有「方法被调用时已有事务该怎么办」的情形：

| 属性 | 已有事务时 | 无事务时 | 适用场景 |
| --- | --- | --- | --- |
| `REQUIRED` | 加入 | 新建 | 默认，绝大多数业务方法 |
| `REQUIRES_NEW` | 挂起原有，新建 | 新建 | 必须独立提交/回滚（如日志记录） |
| `SUPPORTS` | 加入 | 不开启 | 可选事务的查询 |
| `NOT_SUPPORTED` | 挂起原有 | 不开启 | 明确不能有事务的操作 |
| `MANDATORY` | 加入 | 抛异常 | 强制要求调用方开启事务 |
| `NEVER` | 抛异常 | 不开启 | 禁止事务 |

回滚规则要特别记住：**默认只有 `RuntimeException` 和 `Error` 触发回滚**，受检异常不会。需要受检异常也回滚时必须显式声明：

```java
@TransactionAttribute(TransactionAttributeType.REQUIRED)
@ApplicationException(rollback = true)      // 受检异常也回滚
public void doWork() throws BizException { /* ... */ }
```

<div class="note warning"><p>「事务为什么不回滚」的根因几乎都在这里：受检异常默认不回滚、异常被 <code>try-catch</code> 吞掉、或者自调用（<code>this.method()</code>）绕过了容器代理。<b>Spring 的 <code>@Transactional</code> 语义与 EJB 完全一致</b>——它继承了 EJB 的事务属性定义，包括这条默认回滚规则。</p></div>

## 为什么被 Spring 取代

EJB 在技术上并非失败，它输在**开发体验与生态**：

| 维度 | EJB | Spring |
| --- | --- | --- |
| 组件模型 | 必须运行在 EJB 容器中 | POJO，普通 Java 对象 |
| 单元测试 | 早期必须依赖容器（后期有嵌入式容器改善） | 直接 `new` 或轻量容器，无需容器 |
| AOP | 仅容器提供的有限能力 | 完整的 AOP，可自定义切面 |
| 编程模型 | 规范驱动，改动受 JSR 流程约束 | 库驱动，版本迭代快 |
| 依赖注入 | `@EJB` / `@Resource`（仅容器资源） | `@Autowired`，任意 Bean |

```java
// EJB 写法：容器托管，事务靠注解
@Stateless
public class OrderService { /* ... */ }

// Spring 写法：普通 POJO，能力等价
@Service
public class OrderService { /* ... */ }
```

关键差异不在功能列表，而在**可测试性**：POJO 意味着业务逻辑可以在普通 JVM 里跑测试，不需要启动应用服务器。这一点在持续集成的时代是决定性的。

后续的故事是相互吸收：EJB 3.x 借鉴了 Spring 的 POJO 与注解思路；Spring 也实现了 JSR-330（`@Inject`）与 JSR-250（`@Resource`）等 Java EE 标准注解，甚至提供了 EJB 的调用代理（`@EJB` 支持）。所以**面试里问 EJB，重点不在「EJB 有哪些类型」，而在「它的哪些思想存活到了今天」**。

## 相关知识

- **JPA**：取代了 EJB 2.x 的 Entity Bean。Hibernate 是 JPA 最流行的实现，Spring Data JPA 在其之上再封装。
- **JTA**：EJB 容器管理的分布式事务 API，跨多个资源（数据库 + 消息队列）提交。
- **JMS**：消息驱动 Bean 的底层规范，见 [JMS](#jms)。
- **JNDI**：EJB 的查找入口，见 [JNDI](#jndi)。

## 面试问答

### EJB 和 Spring 的关系是什么？

Spring 的出现很大程度上是为了替代 EJB：用普通 POJO + 注解 + AOP 实现了 EJB 提供的容器托管、声明式事务、声明式安全等能力，同时摆脱了对重量级应用服务器的依赖，使业务逻辑可以脱离容器进行单元测试。后来两者互相借鉴——EJB 3.x 引入了 POJO 与注解，Spring 也支持了 Java EE 的标准注解（`@Resource`、`@Inject`）。

### Session Bean 有哪几种，区别是什么？

三种：无状态（`@Stateless`）不保存客户端状态，实例池化复用，性能最好，最常用；有状态（`@Stateful`）为每个客户端维护独立实例，可被容器钝化/激活，适合购物车这类多步会话；单例（`@Singleton`）全局唯一，适合缓存与启动初始化，并发访问需用 `@Lock` 控制。它们的共同点是由容器管理生命周期，且容器保证单线程访问。

### EJB 的事务属性和 Spring 的一样吗？

语义完全一致，Spring 的传播行为定义直接继承了 EJB：`REQUIRED`(默认) 加入或新建、`REQUIRES_NEW` 挂起原有并新建、`SUPPORTS`、`NOT_SUPPORTED`、`MANDATORY`、`NEVER`。回滚规则也相同：默认只有 `RuntimeException` 与 `Error` 触发回滚，受检异常需要显式声明（EJB 用 `@ApplicationException(rollback = true)`，Spring 用 `@Transactional(rollbackFor = ...)`）。

### Entity Bean 去哪了？

EJB 2.x 的 Entity Bean 把数据库行映射成容器管理的对象，但它依赖容器、无法脱离应用服务器测试，且 ORM 能力远逊于 Hibernate。EJB 3.0 用 **JPA** 规范取代了它，Entity Bean 不再是 EJB 的一部分。所以「EJB 的实体 Bean」在今天应理解为「JPA 实体」，实现框架通常是 Hibernate，再由 Spring Data JPA 提供仓储抽象。

### 为什么说 EJB 的线程模型和 Servlet 相反？

Servlet 是单实例多线程：一个实例被多个请求线程并发调用，所以成员变量有线程安全问题；EJB 是实例池 + 容器保证单线程访问：任一实例同一时刻只被一个线程执行，所以可以有状态、可以放心用成员变量（有状态 Bean 正是靠这一点成立）。理解这个差异，两类组件的「能不能写成员变量」就不再是靠记忆的结论了。
