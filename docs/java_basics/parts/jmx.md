---
title: JMX
---

JMX（Java Management Extensions）是 Java 的管理与监控规范：**把程序内部的状态和操作暴露成标准接口，让外部工具能读取和调用**。我们天天用的 JConsole、VisualVM、`jstat` 能看到的堆内存、线程数、GC 次数，本质上都是 JMX 暴露出来的 MBean 属性。它是 Java 里「可观测性」的最底层机制。

## 要解决什么问题

一个运行中的 JVM 对外是个黑盒：堆用了多少、线程池队列积压多少、某个业务开关是开还是关。JMX 提供的答案是统一协议化的「管理接口」：

- **对 JVM**：JVM 自身通过 JMX 暴露内存、GC、线程、类加载等 MXBean。
- **对应用**：开发者自定义 MBean，把业务指标与运维开关暴露出来。
- **对中间件**：Tomcat、Kafka、RocketMQ 等均通过 JMX 暴露内部状态，这也是各类监控系统能采集它们指标的原因。

<div class="note info"><p>JMX 与日志、指标（Metrics）是同一目标的三条路径：日志记录离散事件，指标做数值聚合，JMX 提供<b>可查询、可调用的运行时对象</b>——它不仅能「读」，还能「写」（比如动态调整日志级别、清空缓存、触发一次 GC）。这是它区别于纯指标上报的地方。</p></div>

## 三层架构

JMX 规范把管理能力分成三层，理解这三层就理解了 JMX 的全貌：

| 层次 | 名称 | 职责 |
| --- | --- | --- |
| 第一层 | Instrumentation（探测层） | 定义 MBean，即「能被管理的对象」 |
| 第二层 | Agent（代理层） | 由 `MBeanServer` 注册与调度 MBean，是核心 |
| 第三层 | Distributed（分布层） | 让远程客户端访问 Agent（RMI、JMXMP 等） |

```text
远程客户端(JConsole)  ──RMI/JMXMP──▶  Distributed 层
                                          │
                                          ▼
                                  MBeanServer(Agent)     ← 所有 MBean 都注册在这里
                                          │
                       ┌──────────────────┼──────────────────┐
                       ▼                  ▼                  ▼
                  自定义 MBean        JVM MXBean        Tomcat/Kafka MBean
```

## MBean 的四种类型

MBean 是「可被管理的 Java 对象」，按实现方式分四类：

| 类型 | 约定 | 需实现接口 | 用途 |
| --- | --- | --- | --- |
| Standard | 类 `Xxx` 配接口 `XxxMBean`，属性由 getter/setter 推导 | 需 | 最常用 |
| MXBean | 类 `Xxx` 配接口 `XxxMXBean`，复杂类型自动映射为开放类型 | 需 | 跨版本兼容推荐 |
| Dynamic | 实现 `DynamicMBean`，运行时决定暴露什么 | 需 | 动态发现 |
| Open | 只使用预定义的开放类型 | — | 保证可跨网络传输 |

四类的完整名称依次是 Standard MBean、MXBean、Dynamic MBean、Open MBean。

<div class="note info"><p>Standard MBean 的命名约定不是可选风格而是规范要求：<b>类 <code>Foo</code> 必须实现接口 <code>FooMBean</code></b>，MBeanServer 靠这个命名规则识别它是 MBean。推荐优先用 <b>MXBean</b>——它把自定义类型自动映射为通用类型，不会因为客户端缺少你的类而失败。</p></div>

## 一个完整的例子

**第一步：定义接口**，命名必须是 `类名MBean`：

```java
public interface QueueMonitorMBean {
    int getQueueSize();                    // 只读属性
    long getProcessedCount();
    String getState();                     // 只读属性
    void clear();                          // 操作（方法）
    void setThreshold(int threshold);      // 可写属性（setter）
}
```

**第二步：实现类**，类名与接口前缀一致（`QueueMonitor` / `QueueMonitorMBean`）：

```java
public class QueueMonitor implements QueueMonitorMBean {

    private final AtomicInteger queueSize = new AtomicInteger();
    private final AtomicLong processed = new AtomicLong();
    private volatile int threshold = 1000;

    @Override public int getQueueSize() { return queueSize.get(); }
    @Override public long getProcessedCount() { return processed.get(); }
    @Override public String getState() { return queueSize.get() > threshold ? "BACKLOG" : "NORMAL"; }
    @Override public void clear() { queueSize.set(0); }
    @Override public void setThreshold(int t) { this.threshold = t; }

    // 业务代码调用这两个方法维护内部状态
    public void onEnqueue() { queueSize.incrementAndGet(); }
    public void onProcessed() { queueSize.decrementAndGet(); processed.incrementAndGet(); }
}
```

**第三步：注册到 MBeanServer**，并启动一个 RMI 连接器供远程访问：

```java
public class JmxExporter {
    public static void main(String[] args) throws Exception {
        MBeanServer server = ManagementFactory.getPlatformMBeanServer();

        // ObjectName 是 MBean 在 MBeanServer 中的唯一标识：domain:key=value
        ObjectName name = new ObjectName("com.example:type=QueueMonitor,name=orderQueue");
        server.registerMBean(new QueueMonitor(), name);

        // 开放 RMI 连接器（端口固定，便于监控系统连接）
        LocateRegistry.createRegistry(9999);
        JMXServiceURL url = new JMXServiceURL("service:jmx:rmi:///jndi/rmi://127.0.0.1:9999/jmxrmi");
        JMXConnectorServer connector = JMXConnectorServerFactory.newJMXConnectorServer(url, null, server);
        connector.start();

        System.out.println("JMX ready: " + url);
        Thread.sleep(Long.MAX_VALUE);
    }
}
```

**第四步：本地或远程读取**：

```java
// 本地直接拿平台 MBeanServer
MBeanServer server = ManagementFactory.getPlatformMBeanServer();
int size = (int) server.getAttribute(
        new ObjectName("com.example:type=QueueMonitor,name=orderQueue"), "QueueSize");
System.out.println("queue size = " + size);

// 远程通过 RMI 连接
JMXConnector connector = JMXConnectorFactory.connect(
        new JMXServiceURL("service:jmx:rmi:///jndi/rmi://127.0.0.1:9999/jmxrmi"));
MBeanServerConnection remote = connector.getMBeanServerConnection();
remote.invoke(new ObjectName("com.example:type=QueueMonitor,name=orderQueue"), "clear", null, null);
```

## ObjectName 与查询

`ObjectName` 采用 `域名:属性=值,属性=值` 的格式，支持通配符查询：

```java
ObjectName name = new ObjectName("com.example:type=QueueMonitor,name=orderQueue");

// 按模式查询一批 MBean
Set<ObjectName> all = server.queryNames(new ObjectName("com.example:type=*"), null);
Set<ObjectName> memory = server.queryNames(new ObjectName("java.lang:type=Memory"), null);
```

JVM 自带的 MBean 都在 `java.lang` 域名下（下表省略该前缀），这是排查问题的常用入口：

| ObjectName | 能读到什么 |
| --- | --- |
| `type=Memory` | 堆/非堆使用量、GC 后的回收量 |
| `type=MemoryPool` | 各内存区（Eden、Old、Metaspace，按 `name` 区分） |
| `type=GarbageCollector` | GC 次数与耗时（按 `name` 区分收集器） |
| `type=Threading` | 线程数、死锁检测 |
| `type=ClassLoading` | 已加载类数量 |
| `type=OperatingSystem` | CPU、负载、文件描述符 |

```java
// 顺手做一个死锁检测，比翻日志快得多
ObjectName threading = new ObjectName("java.lang:type=Threading");
long[] deadlocked = (long[]) server.invoke(threading, "findDeadlockedThreads", null, null);
System.out.println(deadlocked == null ? "no deadlock" : "deadlocked threads: " + deadlocked.length);
```

<div class="note info"><p><code>Memory</code> 这类 JVM 自带的 MBean 实际上都是 <b>MXBean</b>（名字里的 X 表示 eXtended），所以像 <code>MemoryUsage</code> 这种复合类型在 JConsole 里能正常展开显示，而不需要客户端有对应的类。</p></div>

## 客户端工具

| 工具 | 特点 |
| --- | --- |
| JConsole | JDK 自带，`jconsole` 启动，图形化查看 MBean 树 |
| VisualVM | 功能更全，可装插件扩展，支持采样与堆转储 |
| JMXTerm | 命令行交互，适合无图形界面的服务器 |
| Prometheus JMX Exporter | 把 MBean 转成 Prometheus 指标，接入监控体系 |

Prometheus 的 JMX Exporter 是最常见的生产用法：以 Java Agent 方式挂载或独立进程连接，把指定 MBean 的属性按规则映射成指标。

```yaml
# jmx_exporter 配置：把队列长度暴露成 Prometheus 指标
rules:
  - pattern: 'com\.example<type=QueueMonitor, name=orderQueue><>(\w+)'
    name: order_queue_$1
    type: GAUGE
    labels:
      queue: order
```

<div class="note warning"><p>JMX 连接器默认<b>没有认证与加密</b>，任何能连上端口的人都能读取内部状态、调用 MBean 上的任意方法（包括 <code>clear()</code> 这类破坏性操作）。生产环境必须：不对外暴露端口、启用认证与 SSL（<code>jmxremote.password</code> / <code>jmxremote.access</code>）、或用只读的 exporter 代理访问。</p></div>

## 与 Spring 的集成

Spring 对 JMX 提供了完整支持，可以把任意 Bean 声明式地暴露为 MBean，无需手写接口：

```java
@Component
@ManagedResource(objectName = "com.example:type=OrderStats", description = "订单统计")
public class OrderStats {

    private final AtomicLong total = new AtomicLong();

    @ManagedAttribute(description = "累计订单数")
    public long getTotal() { return total.get(); }

    @ManagedOperation(description = "重置计数")
    public void reset() { total.set(0); }
}
```

## 为什么需要它

回到实用角度，JMX 在工程中的三个具体价值：

- **运行时诊断**：堆内存、GC、线程与死锁状态都是现成的 MBean，排查线上问题不必先加埋点。
- **动态调参**：日志级别、限流阈值、开关状态可以通过 MBean 的 setter 或操作在运行时修改，不必重启（Logback 的 `JMXConfigurator` 就是典型实现）。
- **标准化的监控接入**：中间件普遍已暴露 JMX，监控系统只需一套采集方式就能覆盖 JVM、Tomcat、Kafka，不需要为每个组件写适配。

<div class="note info"><p>JMX 在可观测性中的定位可以这样概括：<b>Metrics 告诉你「出问题了」，日志告诉你「细节是什么」，JMX 让你能「现场动手」</b>。三者互补，而 JMX 的独特之处是可写、可调用。</p></div>

## 面试问答

### JMX 是什么，有什么用？

JMX 是 Java 的管理与监控规范，把程序内部状态与操作暴露成标准接口（MBean），外部工具通过 MBeanServer 读写。三大用途：读取 JVM 与中间件的运行时指标（堆、GC、线程、连接池）；在运行期动态调整参数或执行管理操作；作为统一的监控接入点，让监控系统用一套方式采集不同组件的指标。

### JMX 有四层还是三层？分别是什么？

三层：**Instrumentation**（探测层，定义 MBean）、**Agent**（代理层，MBeanServer 负责注册与调度，是核心）、**Distributed**（分布层，通过 RMI/JMXMP 让远程客户端访问）。有时会把「客户端」也算作一层，但规范里是三层。

### Standard MBean 和 MXBean 的区别？

两者都需要「类 `Xxx` + 接口 `XxxMBean`/`XxxMXBean`」的命名约定。区别在于 MXBean 会把自定义类型自动映射为通用开放类型，所以客户端不需要拥有你的类定义就能正确解析——JVM 自带的 `Memory`、`Threading` 都是 MXBean。跨 JVM 版本或需要远程访问时优先用 MXBean。

### JMX 和 JConsole/VisualVM 是什么关系？

JConsole、VisualVM 是 JMX 的**客户端**。它们连接目标 JVM 的 MBeanServer，以树形展示 MBean，并在属性页提供读写与操作调用。所以「JConsole 里能看到什么」取决于目标 JVM 注册了哪些 MBean——本地连接看到的是平台 MBeanServer 全部内容，远程连接则受连接器开放范围与权限限制。

### 如何用 JMX 排查线上问题？

典型路径：连上目标 JVM 的 MBeanServer，先看 `java.lang:type=Memory` 与各 `MemoryPool` 判断是否内存问题，再看 `GarbageCollector` 的 GC 次数与耗时判断是否频繁 Full GC，然后调 `Threading.findDeadlockedThreads()` 一步确认有没有死锁。这套顺序比在日志里翻找快得多，而且不需要事先埋点。

### JMX 有哪些安全风险？

连接器默认无认证与加密，任何能访问端口的人都能读取内部数据并调用 MBean 上的方法（包括清理缓存、关闭组件等破坏性操作）。此外历史上 JMX 连接器在 RMI 之上实现，也会受反序列化问题影响。防护措施是不对外暴露端口、启用认证与 SSL、尽量通过只读的 JMX Exporter 代理访问而非直接开放连接器。
