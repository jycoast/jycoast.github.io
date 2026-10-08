---
title: RMI
---

RMI（Remote Method Invocation）是 Java 原生的远程调用方案：让调用远程对象的方法，写起来和调用本地对象一样。它是 Java 分布式最早的基石——EJB 的远程调用底层就是 RMI。理解它的价值不在今天还在用，而在于「存根 + 序列化 + 传输协议」这套结构，是后来所有 RPC 框架的共同骨架。

## 解决什么问题

本地方法调用时，调用方与被调方在同一个 JVM 里，参数通过栈传递。RMI 要跨越进程与网络，就必须解决三件事：

1. **地址问题**：调用方怎么知道远程对象在哪 → 注册表（Registry）。
2. **寻址问题**：怎么让调用看起来像本地调用 → 代理对象（Stub）。
3. **数据问题**：参数和返回值怎么过网络 → 序列化（Serialization）。

## 核心角色

```text
调用方 JVM                                  服务方 JVM
┌──────────┐   ┌──────┐   ┌─────────┐   ┌──────────┐   ┌────────────┐
│ 客户端   │ → │ Stub │ → │  网络   │ → │ Skeleton │ → │ 真正的实现 │
│ 代码     │   │ 存根 │   │  JRMP   │   │ （骨架） │   │ 对象       │
└──────────┘   └──────┘   └─────────┘   └──────────┘   └────────────┘
                  代理                      转发
```

- **Stub（存根）**：运行在客户端，长得和远程接口一模一样。它把「方法名 + 参数」打包成消息发给服务端，再把回包解包成返回值。对调用方来说，它就是那个「远程对象」。
- **Skeleton（骨架）**：运行在服务端，接收网络消息、解包、调用真正的实现对象、再把结果打包回去。JDK 5 之后由动态代理取代，不再需要手工生成（也不再需要 `rmic` 工具）。
- **Registry（注册表）**：名字服务，默认监听 1099 端口，保存「名字 → 远程对象引用」的映射。
- **JRMP**（Java Remote Method Protocol）：RMI 自有的传输协议，建立在 TCP 之上；也可以换用 IIOP 与其他语言互通（RMI-IIOP）。

## 一个完整的例子

**第一步：定义远程接口**，必须继承 `Remote`，且每个方法都要声明 `RemoteException`：

```java
import java.rmi.Remote;
import java.rmi.RemoteException;

public interface HelloService extends Remote {
    String sayHello(String name) throws RemoteException;
    User findUser(long id) throws RemoteException;
}
```

**第二步：实现接口**，继承 `UnicastRemoteObject` 把自身导出为远程对象：

```java
import java.rmi.server.UnicastRemoteObject;

public class HelloServiceImpl extends UnicastRemoteObject implements HelloService {

    protected HelloServiceImpl() throws RemoteException {
        super();   // 相当于「导出」：分配端口、注册到 RMI 运行时
    }

    @Override
    public String sayHello(String name) {
        return "hello " + name;
    }

    @Override
    public User findUser(long id) {
        return new User(id, "jy");   // User 必须可序列化
    }
}
```

**第三步：启动注册表并绑定对象**：

```java
public static void main(String[] args) throws Exception {
    LocateRegistry.createRegistry(1099);          // 启动注册表（也可用 rmiregistry 命令）
    Naming.rebind("rmi://127.0.0.1:1099/Hello", new HelloServiceImpl());
    System.out.println("RMI server ready");
}
```

**第四步：客户端查找并调用**：

```java
public static void main(String[] args) throws Exception {
    HelloService service = (HelloService) Naming.lookup("rmi://127.0.0.1:1099/Hello");
    System.out.println(service.sayHello("jy"));   // 看起来像本地调用
    System.out.println(service.findUser(1L).getName());
}
```

<div class="note info"><p>客户端拿到的是 <code>HelloService</code> 类型但实际是 Stub 实例（JDK 5+ 由 <code>java.lang.reflect.Proxy</code> 动态生成）。所以客户端必须能拿到<b>接口</b>（单独打成 API jar），而不需要实现类——这是「接口与实现分离」在 RPC 上的最早体现。</p></div>

## 序列化要求

RMI 的所有参数与返回值都要在网络上传输，因此都必须实现 `java.io.Serializable`。这带来几条常被忽略的约束：

- **字符串、基本类型包装类、集合**天然可序列化。
- **自定义类**必须 `implements Serializable`，并建议显式声明 `serialVersionUID`。
- **不可序列化的字段**要标 `transient`（如 `Connection`、`Thread`），否则会抛 `NotSerializableException`。
- **序列化是深拷贝**：对象在网络上是一份副本，服务端对参数的修改不会影响客户端。这与本地调用「传引用」的语义不同，是认知偏差最大的地方。

```java
public class User implements Serializable {
    private static final long serialVersionUID = 1L;   // 显式声明，避免兼容性断裂
    private long id;
    private String name;
    private transient String cached;                   // 不参与序列化
}
```

<div class="note warning"><p><code>serialVersionUID</code> 不是可选项：不显式声明时，JVM 会根据类的结构（字段、方法签名）自动生成一个哈希值。任何一次「加个字段、改个方法」都会让新旧版本的 UID 不一致，跨版本反序列化直接抛 <code>InvalidClassException</code>。分布式环境下客户端与服务端发布不同步，就会踩到这个坑。</p></div>

## RMI 与其他远程调用

| 维度 | RMI | Web Service | gRPC |
| --- | --- | --- | --- |
| 抽象层次 | 方法调用（像本地） | HTTP + XML/JSON | 方法调用 + IDL |
| 跨语言 | 不支持（仅 Java） | 支持 | 支持 |
| 传输 | JRMP（TCP） | HTTP | HTTP/2 或私有协议 |
| 序列化 | Java 原生 | XML / JSON | Protobuf |
| 服务治理 | 无 | 无 | 负载均衡、熔断、注册中心 |

<div class="note info"><p>表里的 gRPC 一列同样适用于 Dubbo（支持跨语言、二进制序列化、完整的服务治理）。更底层的 Socket 没有方法调用级的抽象，属于字节流编程，不在同一比较维度上。</p></div>

由此也能看出 RMI 的局限，正是它被取代的原因：

- **只支持 Java**，异构系统无法互通。
- **Java 原生序列化脆弱且危险**：反序列化链是大量远程代码执行漏洞的来源；同时序列化体积大、性能一般。
- **缺乏服务治理**：没有负载均衡、注册中心、超时重试、熔断降级——这些是 Dubbo 相对 RMI 的核心增量。
- **对防火墙不友好**：除注册表端口外还会动态分配端口，需要固定端口配置（`-Djava.rmi.server.hostname` 与固定 `export` 端口）。

<div class="note warning"><p>RMI 默认监听 1099 且常常缺少认证与访问控制，历史上被大量用于攻击 Java 应用（如通过反序列化在服务端执行代码）。运维层面最基本的要求是：<b>RMI 端口绝不暴露到公网</b>，并在服务端设置 <code>java.rmi.server.useCodebaseOnly=true</code> 禁止从远端加载类。</p></div>

## 与 JNDI、EJB 的关系

三者常一起出现，边界其实很清楚：

- **RMI** 提供「远程方法调用」这一能力。
- **JNDI** 提供「按名字找对象」的入口。RMI 的对象通过 JNDI（或 RMI Registry）暴露名字，客户端用 `Naming.lookup("rmi://...")` 来定位。所以 JNDI 是「怎么找」，RMI 是「找到之后怎么调」。
- **EJB** 的远程接口基于 RMI：容器为 Session Bean 生成 Stub，客户端通过 JNDI 拿到它再调用。

```text
客户端 → JNDI 查找（名字解析） → 拿到 RMI Stub → 通过 JRMP 调用 → EJB 容器内的实现
```

## 面试问答

### RMI 的调用原理是什么？

客户端持有 Stub（远程对象的代理），调用方法时 Stub 把方法名与参数序列化后通过 JRMP 协议发到服务端；服务端的 Skeleton 反序列化、调用真正的实现对象，再把返回值序列化回传，由 Stub 解包返回给调用方。整个过程的目的是让远程调用在代码上等同于本地调用。

### RMI 与 RPC 有什么区别？

RPC 是「远程过程调用」的通用概念，RMI 是它在 Java 上的具体实现之一。可以理解为：RPC 是抽象，RMI 是 Java 原生的落地形式；Dubbo、gRPC 也是 RPC，但支持跨语言、体积更小、并带有服务治理能力。所以「RMI 与 RPC」不是并列关系，而是「实现与概念」的关系。

### RMI 为什么现在很少用？

三个硬伤：只支持 Java 语言（无法与其他技术栈互通）；依赖 Java 原生序列化（体积大、性能一般，且反序列化漏洞风险高）；没有任何服务治理能力（负载均衡、超时、重试、熔断都要自己实现）。工程上已被 Dubbo、gRPC、HTTP+JSON 取代，RMI 更多作为理解 RPC 原理的教学素材存在。

### 什么情况下不能使用 RMI？

参数或返回值不可序列化时（如包含 `Connection`、线程、流对象）；需要跨语言调用时；需要跨公网或穿透防火墙时（RMI 的动态端口分配与 JRMP 协议都不友好）；需要细粒度的超时、重试与熔断控制时。

### RMI 和序列化是什么关系？

RMI 依赖 Java 原生序列化完成数据编解码，因此所有跨网络传输的对象都必须是可序列化的（`Serializable`），这也是 `NotSerializableException` 的常见来源。反过来说，正因为使用了原生序列化，RMI 才会成为反序列化攻击的常见入口——序列化机制本身「根据字节流还原对象」的能力，就是攻击者可以利用的构造入口。
