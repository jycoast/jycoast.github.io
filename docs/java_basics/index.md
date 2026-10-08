---
title: Java EE 总览
date: 2026-10-08
categories:
 - Java
tags:
 - JavaEE
 - Servlet
 - EJB
author: 吉永超
description: "Java EE 完整梳理：J2EE 到 Jakarta EE 的演进与 javax/jakarta 包名迁移、容器与规范的关系、十三项核心技术，以及 Servlet、JSP、JNDI、JMX、RMI、JMS、EJB 七篇详解的合辑。"
series: ./series.mjs
---

# Java EE 总览

Java EE（Java Platform, Enterprise Edition）是 Java 面向**企业级应用**的一套规范集合。它本身不是产品，而是一批接口标准（JSR）——真正干活的是各家厂商的**实现**：Tomcat、Jetty、WildFly、WebLogic、WebSphere……理解了「规范 + 容器 + 实现」这三层，Java EE 的每个技术点都能落到同一个框架里去理解。

## 从 J2EE 到 Jakarta EE

名字变过三次，包名也换过，这是老项目升级时最容易踩的坑：

| 时间 | 名称 | 说明 |
| --- | --- | --- |
| 1999 | J2EE 1.2 | Java 2 Platform, Enterprise Edition |
| 2006 | Java EE 5 | 去掉「2」，大量引入注解，EJB 3.0 大幅简化 |
| 2017 | — | Oracle 把 Java EE 捐给 Eclipse 基金会 |
| 2018 | Jakarta EE 8 | 与 Java EE 8 内容一致，仅换名 |
| 2019 | Jakarta EE 9 | 包名 `javax.*` 迁移到 `jakarta.*` |

<div class="note warning"><p>包名迁移是硬切换，不是别名：<code>javax.servlet</code> 与 <code>jakarta.servlet</code> 是两个完全不同的类型，不能互相赋值。对应关系是 Tomcat 10+、Spring 6+、Spring Boot 3+ 用 <code>jakarta.*</code>；Tomcat 9 及以下、Spring 5 用 <code>javax.*</code>。升级时先升容器，再升框架，最后改自己的 import。</p></div>

## Java SE / Java EE / Java ME

三个版本面向不同规模的运行环境，但 Java EE 建立在 Java SE 之上——它不重复定义语言和基础类库，只在其上叠加企业级能力。

| 版本 | 定位 | 核心内容 |
| --- | --- | --- |
| Java SE | 标准版，桌面与通用应用 | 语言、集合、IO、并发、JVM |
| Java EE | 企业版，服务端应用 | Servlet、JSP、EJB、JMS、JTA…… |
| Java ME | 微型版，嵌入式设备 | 已被 Android / IoT 平台取代 |

Java EE 需要 JDK 和 Java SE 的完整支持，反过来则不成立。

## 核心思想：容器

Java EE 最关键的设计不是某个 API，而是**容器（Container）**。

开发者只写业务代码，容器负责给它「套上」各种横切能力：

- **生命周期管理**：对象的创建、初始化、销毁由容器驱动，开发者不写 `new`。
- **事务管理**：声明式事务——打个注解就自动开启/提交/回滚。
- **安全管理**：认证与授权由容器统一拦截。
- **并发与线程**：线程池、并发控制由容器托管。
- **资源池化**：数据库连接、JMS 连接交给容器统一管理。

不同的容器托管不同类型的组件：

| 容器 | 托管组件 | 代表实现 |
| --- | --- | --- |
| Web 容器（Servlet 容器） | Servlet、Filter、Listener | Tomcat、Jetty |
| EJB 容器 | Session Bean、MDB | WildFly、WebLogic |
| 完整应用服务器 | 上述全部 | WebLogic、WebSphere |

<div class="note info"><p>Tomcat 只是 Web 容器，不带 EJB 支持；WebLogic 这类「应用服务器」才是完整实现 Java EE 全规范。这也是为什么早期 Java EE 项目常常和昂贵的商业中间件绑定在一起。</p></div>

## 十三项核心技术

Java EE 号称有十三种核心技术。它们分别是：JDBC、JNDI、EJB、RMI、Servlet、JSP、XML、JMS、Java IDL、JTS、JTA、JavaMail 和 JAF。按职责分层看会清晰很多：

| 层次 | 技术 | 作用 |
| --- | --- | --- |
| Web 表现层 | Servlet | 服务端请求处理的标准入口 |
| Web 表现层 | JSP | 以模板方式生成 HTML（本质是 Servlet） |
| Web 表现层 | JavaMail、JAF | 邮件发送与数据类型识别 |
| 组件业务层 | EJB | 分布式业务组件，带事务与安全 |
| 组件业务层 | RMI、Java IDL | 远程调用（Java 原生 / CORBA 跨语言） |
| 组件业务层 | JNDI | 统一命名与目录访问 |
| 数据访问层 | JDBC | 数据库访问统一接口 |
| 服务与事务 | JTA、JTS | 分布式事务的 API 与实现规范 |
| 集成与消息 | JMS | 面向消息的中间件访问规范 |
| 数据描述 | XML | 配置与数据交换格式 |

其中 **Servlet、JSP、JDBC** 是使用频率最高的三件套，**EJB、JMS、JTA** 代表 Java EE 最强调的「企业级」能力，**JNDI、RMI、JMX** 则是支撑这些能力的底层设施。

## 规范与实现的关系

这是理解 Java EE 最容易被问的一点。

以 Servlet 为例：`javax.servlet.Servlet` 只是接口，`Servlet 规范` 规定了这套接口的语义（比如生命周期方法的调用时机、Filter 的执行顺序）。Tomcat 提供实现，并保证：

- 编译期：你的代码只依赖接口（`servlet-api.jar`，通常由容器提供，`scope=provided`）。
- 运行期：容器按规范调用你的 `init` / `service` / `destroy`。

所以**换容器不用改代码**——这正是规范存在的意义。

<div class="note info"><p>由此可以推出一个实用结论：项目里不该把 <code>servlet-api</code> 打进 war 包（应由容器提供），否则容器版本升级时容易出现类冲突（比如老包带 <code>javax.servlet</code>、新 Tomcat 只认 <code>jakarta.servlet</code>）。</p></div>

## 为什么现在很少直接写 Java EE

Spring 生态几乎取代了 Java EE 规范在业务代码中的位置，但原因是「写法」而非「能力」：

- **EJB 太重**：EJB 2.x 要求组件继承特定基类、实现多个接口，还要写部署描述符，单元测试几乎无法进行。Spring 用 POJO + 注解 + AOP 达到了同样的声明式事务和依赖注入效果。
- **JSP 被前后端分离取代**：视图渲染转移到浏览器端，服务端只提供 JSON。
- **规范演进缓慢**：JSR 流程漫长，而 Spring 一年一个新版本。

但**规范的思想没有消失，只是换了载体**：

| Java EE 规范 | 今天对应什么 |
| --- | --- |
| Servlet 容器 | 仍是 Spring MVC / Spring Boot 的运行基础 |
| JTA 分布式事务 | Seata、Spring 的 `@Transactional` |
| JMS | RocketMQ、Kafka 等消息中间件 |
| JNDI | 配置中心、`spring.datasource` 绑定 |
| EJB 事务与安全 | Spring AOP + Spring Security |
| JAX-RS / JAX-WS | Spring Web、gRPC、OpenFeign |

## 面试重点

1. **Java EE 是什么**：规范集合，不是产品；「容器 + 组件」是核心思想。
2. **J2EE/Jakarta EE 与 `javax`/`jakarta` 包名**：升级路径上的高频考点。
3. **Servlet 生命周期与线程安全**：单实例多线程是绕不开的问题。
4. **JSP 本质**：编译期翻译成 Servlet，所以 JSP 能做的事 Servlet 都能做，反之亦然。
5. **重定向与转发的区别**：发生在客户端还是服务端，是两道完全不同的请求。
6. **EJB 与 Spring 的关系**：EJB 太重，Spring 用 POJO + AOP 实现了等价能力。
7. **JNDI 注入**：不只是面试题，是真实存在的高危漏洞类型。

## 本系列文章

以下七篇文章按 Servlet → JSP → JNDI → JMX → RMI → JMS → EJB 的顺序全部收录在本页，直接向下滚动即可阅读，无需跳转。

<!-- series -->
