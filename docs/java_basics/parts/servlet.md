---
title: Servlet
---

Servlet 是 Java EE 中处理 HTTP 请求的标准入口。理解它的关键是一句话：**Servlet 是规范里的一个接口，真正调用它的是容器**。把这句话拆开，生命周期、线程安全、会话跟踪就都能顺理成章地讲通了。

## Servlet 是什么

Servlet 是运行在 Web 容器（Servlet 容器）中的 Java 组件，用于接收 HTTP 请求并生成响应。它不依赖具体的通信协议实现，也不负责网络监听——那些是容器的事。

三者的分工：

- **规范**：定义 `Servlet`、`Filter`、`Listener` 等接口与调用语义。
- **容器**（Tomcat、Jetty）：监听端口、解析 HTTP、管理线程池、按规范调用 Servlet。
- **开发者**：只实现业务逻辑，不关心 socket。

```java
public interface Servlet {
    void init(ServletConfig config) throws ServletException;
    void service(ServletRequest req, ServletResponse res) throws ServletException, IOException;
    void destroy();
    ServletConfig getServletConfig();
    String getServletInfo();
}
```

日常开发不直接实现 `Servlet`，而是继承 `HttpServlet`——它已经按 HTTP 方法把 `service()` 分发到 `doGet()`、`doPost()` 等方法。

## 生命周期

容器决定 Servlet 何时被创建、初始化、服务和销毁，共四个阶段：

| 阶段 | 时机 | 调用次数 |
| --- | --- | --- |
| 加载与实例化 | 首次请求（或容器启动，取决于 `load-on-startup`） | 1 |
| 初始化 `init()` | 实例化之后，服务之前 | 1 |
| 服务 `service()` | 每次请求 | N |
| 销毁 `destroy()` | 容器关闭或应用卸载 | 1 |

```java
@WebServlet(urlPatterns = "/hello", loadOnStartup = 1)
public class HelloServlet extends HttpServlet {

    @Override
    public void init() {
        // 只执行一次：适合加载配置、初始化连接池
        System.out.println("init once");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain;charset=UTF-8");
        resp.getWriter().write("hello " + req.getParameter("name"));
    }

    @Override
    public void destroy() {
        // 只执行一次：释放资源
        System.out.println("destroy once");
    }
}
```

<div class="note info"><p><code>init()</code> 只会被调用一次，且早于任何 <code>service()</code>；容器保证 <code>init()</code> 完成前不会把请求交给该 Servlet。因此 <code>init()</code> 里做的一次性初始化天然是线程安全的，而 <code>service()</code> 里对成员变量的写操作不是。</p></div>

`loadOnStartup` 决定初始化时机：值为非负整数表示容器启动时就加载（值越小优先级越高），不配置则首次访问才加载——这会让第一个请求承担初始化开销。

## 线程安全

Servlet 的线程模型是面试必问，结论也很简单：**容器只会创建该 Servlet 的一个实例，所有请求由线程池中的不同线程并发调用同一个实例的 `service()`**。

由此推出：

- **局部变量安全**：每个线程自己的栈，天然隔离。
- **成员变量危险**：多个线程共享，没有同步就会出问题。
- **容器对象安全**：`HttpServletRequest` / `HttpServletResponse` 是每个请求独立的，可放心读写。

```java
public class CounterServlet extends HttpServlet {
    // 危险：并发自增会丢更新
    private int count = 0;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        count++;                    // 非原子操作，结果不可预期
        resp.getWriter().write("count=" + count);
    }
}
```

正确的几种写法：

- **首选**：不定义可变成员变量，状态放到方法参数或 `request` 作用域。
- **需要共享**：用 `AtomicInteger`、`ConcurrentHashMap` 等并发容器，而非裸变量。
- **确实要加锁**：缩小同步范围，避免用 `synchronized` 修饰 `doGet`——那会把并发请求串行化，等于放弃了 Servlet 的并发能力。
- **特例**：实现 `SingleThreadModel` 可以让容器串行化请求，但它已被标记为废弃——性能损失大且不能真正解决共享状态问题。

<div class="note warning"><p><code>SingleThreadModel</code> 是典型的历史包袱：容器可能为它维护实例池，一个请求一个实例，内存和创建开销都显著上升，也无法阻止对 <code>ServletContext</code> 等跨实例共享资源的并发访问。看到老代码里用它，正确做法是重构掉。</p></div>

## 请求与响应

`HttpServletRequest` 的常用能力按来源分三类：

```java
// 请求行与协议信息
req.getMethod();         // GET / POST
req.getRequestURI();     // /app/user/list（不含协议主机端口）
req.getQueryString();    // id=1&name=jy
req.getContextPath();    // /app（应用部署路径）
req.getServletPath();    // /user

// 请求头
req.getHeader("User-Agent");
req.getContentType();

// 参数与属性
req.getParameter("id");              // 查询串或表单体
req.getParameterValues("tag");       // 多值
req.setAttribute("user", user);      // 仅在服务端内部传递，客户端不可见
```

<div class="note info"><p>区分 <code>getParameter()</code> 与 <code>getAttribute()</code>：前者读客户端传来的数据，后者在服务端组件之间传递对象。转发能带上属性，重定向不能——因为重定向是让浏览器发一个新请求。</p></div>

`HttpServletResponse` 用来写回结果。有几个顺序陷阱要注意：

- `setContentType()` / `setCharacterEncoding()` 必须在 `getWriter()` **之前**调用，否则会被忽略，中文就会乱码。
- 响应一旦提交（缓冲区刷出），后续的头设置与 `sendRedirect()` 都会抛 `IllegalStateException`。

## 转发与重定向

这是高频面试题，差别可以归结为「服务端跳转」还是「客户端跳转」：

| 维度 | 转发 forward | 重定向 redirect |
| --- | --- | --- |
| 发起方 | 服务端内部 | 服务端告诉浏览器 |
| 请求次数 | 1 次 | 2 次 |
| 地址栏 | 不变 | 变为新地址 |
| `request` 属性 | 保留 | 丢失 |
| 能否跨域 | 不能（仅本应用） | 可以 |
| 状态码 | 无（内部机制） | 302 / 301 |

```java
// 转发：同一个请求，路径不变
req.getRequestDispatcher("/WEB-INF/result.jsp").forward(req, resp);

// 重定向：浏览器发起新请求，路径变化
resp.sendRedirect(req.getContextPath() + "/login");
```

选择标准很简单：**跳转后需要保留请求数据、且不改变用户看到的 URL（比如表单提交后展示结果页），用转发；需要换 URL、防止刷新重复提交（PRG 模式）、或者跳到其他应用，用重定向。**

<div class="note warning"><p>重定向要带 <code>contextPath</code>，否则会跳到域名根路径而不是当前应用下。这是部署到非根路径（如 <code>/app</code>）时最常见的 404 来源。</p></div>

## Filter 与 Listener

除了 Servlet 本身，容器还托管另外两类组件。

**Filter（过滤器）**：在请求到达 Servlet 之前、响应返回客户端之前插入处理逻辑，多个 Filter 组成链式调用。

```java
@WebFilter(urlPatterns = "/*")
public class AuthFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        if (req.getSession().getAttribute("user") == null) {
            ((HttpServletResponse) response).sendRedirect(req.getContextPath() + "/login");
            return;                       // 不放行，请求到此为止
        }
        chain.doFilter(request, response); // 放行到下一个 Filter / Servlet
    }
}
```

典型用途：字符编码统一处理、权限校验、日志、跨域头、请求体包装。Filter 对**所有**匹配的请求生效，比在每个 Servlet 里重复判断合理得多。

**Listener（监听器）**：监听容器或会话的生命周期事件，常用于初始化和资源清理。

```java
public class StartupListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // 应用启动：加载全局配置
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // 应用关闭：释放线程池、连接池
    }
}
```

<div class="note info"><p>Filter 与 Spring 的 Interceptor 容易混淆：<b>Filter 属于 Servlet 规范，由容器调用，早于 DispatcherServlet；Interceptor 属于 Spring MVC，由 DispatcherServlet 调用，在 Handler 之前。</b>所以 Filter 拿不到 Spring 的 <code>HandlerMethod</code>，也无法直接使用注入的 Bean（除非用 <code>DelegatingFilterProxy</code>）。</p></div>

## 会话跟踪

HTTP 是无状态的协议，服务端要「记住」用户，必须在多次请求之间关联同一个客户端。可用的手段有四类：

| 方式 | 存储位置 | 生命周期 | 说明 |
| --- | --- | --- | --- |
| Cookie | 客户端 | 可设 `maxAge` | 明文可见，容量约 4KB |
| Session | 服务端 | 默认 30 分钟不活动 | 客户端只保存 `JSESSIONID` |
| URL 重写 | URL 上 | 同 Session | `jsessionid` 追加在地址后，兜底方案 |
| 隐藏表单域 | 页面 | 单次请求 | 仅适合单步流程 |

**Cookie** 是客户端存储，服务端通过响应头下发：

```java
Cookie cookie = new Cookie("theme", "dark");
cookie.setMaxAge(7 * 24 * 3600);   // 秒；0 表示删除，负数表示仅当前会话
cookie.setHttpOnly(true);          // 禁止 JS 读取，防 XSS 窃取
cookie.setSecure(true);            // 仅 HTTPS 传输
cookie.setPath("/");
resp.addCookie(cookie);
```

**Session** 是服务端存储，客户端只持有一个会话 ID：

```java
HttpSession session = req.getSession();          // 不存在则创建
session.setAttribute("user", user);              // 存入
Object user = session.getAttribute("user");      // 读取
session.invalidate();                            // 注销时销毁
```

<div class="note warning"><p>容器默认的会话跟踪方式是 Cookie（<code>JSESSIONID</code>）。如果禁用 Cookie，就只能退化成 URL 重写，会话 ID 会出现在地址栏、浏览器历史和日志里，泄露风险显著上升。所以生产环境应确保 Cookie 可用，并给会话 Cookie 加上 <code>HttpOnly</code> 与 <code>Secure</code>。</p></div>

Session 失效的三种情形：超过 `session-timeout` 不活动、显式调用 `invalidate()`、应用被卸载。

分布式环境下 Session 不共享是常见故障：用户在第一台机器登录，第二次请求被负载均衡打到第二台机器就「掉登录」。解决方案按代价从低到高是：会话粘滞（sticky session，简单但不均衡）、Session 复制（机器间同步，适合小集群）、集中式存储（Redis 保存 Session，最常用）、无状态 Token（JWT，服务端不存会话）。

## 一个完整的部署描述

Servlet 3.0 起可以用注解声明，不再强制写 `web.xml`。但当需要更细的控制（Filter 顺序、多环境配置）时，`web.xml` 仍然有用：

```xml
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee" version="4.0">
  <servlet>
    <servlet-name>hello</servlet-name>
    <servlet-class>com.example.HelloServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>hello</servlet-name>
    <url-pattern>/hello</url-pattern>
  </servlet-mapping>

  <session-config>
    <session-timeout>30</session-timeout>
    <cookie-config><http-only>true</http-only></cookie-config>
  </session-config>
</web-app>
```

<div class="note info"><p>注解与 <code>web.xml</code> 同时存在时，配置会合并而不是覆盖：<code>web.xml</code> 中同名 <code>servlet-name</code> 的 <code>init-param</code> 会覆盖注解，但注解声明的 <code>url-pattern</code> 也不会被清掉——所以同一路径可能映射到两处。排查「请求进了意料之外的 Servlet」时，先确认两处配置是否冲突。</p></div>

单实例与多线程也带来了一个重要约束：**ServletRequest 及其流不能被另起线程异步读取**（Servlet 3.1 的异步 Servlet 除外），标准 `getInputStream()` 与 `getReader()` 也互斥，只能选其一。

## 与 Spring MVC 的关系

Spring MVC 并非取代 Servlet，而是**在 Servlet 之上做了一层分发**：

```text
浏览器 → Tomcat(Connector) → FilterChain → DispatcherServlet(一个 Servlet)
                                              ↓ 按 HandlerMapping 找 Controller
                                            Controller → Service → DAO
```

`DispatcherServlet` 本身就是一个注册在 `/` 上的 Servlet，由它统一接住所有请求，再按注解路由分发给 `@Controller`。这也解释了两个常见现象：

- Spring MVC 项目里 `doGet()` 这类方法不再需要写——请求处理被注解方法取代了。
- 内置 Tomcat 的 Spring Boot 应用，本质上仍然是「Servlet 容器 + 若干 Servlet」。

## 面试问答

### Servlet 是线程安全的吗？

不是。容器只创建一个实例，多个请求线程并发调用同一个实例的 `service()`。方法内的局部变量与每个请求独立的 `HttpServletRequest` 是安全的，但 Servlet 的成员变量是所有线程共享的。所以不要把可变的用户数据放在成员变量上，需要用并发容器或同步。

### 为什么 Servlet 不设计成多实例？

单实例既省内存又避免反复初始化，配合线程池可以达到最高的吞吐。多实例（如 `SingleThreadModel` 那样的思路）会把并发压力转化成实例创建与内存开销，并不可取。Servlet 的并发来自「容器线程池 + 无共享状态的单实例」这个组合。

### 转发和重定向的区别，各用在什么场景？

转发是服务端内部跳转，一次请求、地址栏不变、`request` 属性保留；重定向是让浏览器重新发请求，两次请求、地址栏变化、属性丢失。转发用于「同一请求内继续处理」（如表单校验失败回显），重定向用于「换 URL 防重复提交（PRG）」与跨应用跳转。

### Cookie 和 Session 的关系是什么？

Session 存在服务端，客户端只保存会话 ID（默认放在名为 `JSESSIONID` 的 Cookie 里）。Cookie 是 Session 的默认载体，但不是唯一载体。Cookie 是客户端可见可改的，Session 数据在服务端、相对安全，但 Session 不天然支持分布式，需要额外方案（Redis 集中存储等）解决共享问题。

### Filter 和 Interceptor 有什么区别？

Filter 属于 Servlet 规范，由容器在进入 Servlet 前调用，作用于所有请求（包括静态资源），能拿到 `ServletRequest`；Interceptor 属于 Spring MVC，由 `DispatcherServlet` 调用，能访问 `HandlerMethod` 与 Spring 容器中的 Bean，且能在 Handler 执行前后、视图渲染后介入。需要 Spring 上下文时用 Interceptor，需要更早、更全局地拦截时用 Filter。

### 如何防止表单重复提交？

服务端生成一次性 token 存入 Session 并写入表单隐藏域，提交时校验并立即失效该 token；同时提交成功后用重定向（PRG 模式）避免用户刷新重放 POST；对关键接口再叠加幂等设计（唯一业务键 + 数据库唯一索引）。前两条解决「用户误操作」，最后一条才能防住真正的重复请求。
