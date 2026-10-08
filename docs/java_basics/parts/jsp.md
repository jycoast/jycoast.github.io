---
title: JSP
---

JSP（JavaServer Pages）看起来是一门「在 HTML 里写 Java」的模板语言，实际上它只是 Servlet 的一层语法糖：**容器会把 JSP 文件翻译成一个 Servlet 源文件，再编译成 class 执行**。抓住这条主线，九大内置对象、四大作用域这些看似零散的知识点就都有了解释。

## 本质：JSP 就是 Servlet

用户访问 `hello.jsp` 时，容器内部的完整过程是：

1. **翻译**：把 `.jsp` 转成 `hello_jsp.java`（一个继承 `HttpJspBase` 的类，而 `HttpJspBase` 又实现了 `Servlet`）。
2. **编译**：把 `.java` 编译成 `.class`。
3. **加载与初始化**：与普通 Servlet 一样，`jspInit()` 只执行一次。
4. **服务**：每次请求执行 `_jspService()`。
5. **销毁**：应用卸载时执行 `jspDestroy()`。

所以 JSP 与 Servlet 的能力完全相同，区别只在「谁更适合写什么」：

| 维度 | Servlet | JSP |
| --- | --- | --- |
| 适合输出 | 少量、二进制、纯 JSON | 大量 HTML 模板 |
| 写法 | Java 里拼 HTML | HTML 里嵌 Java |
| 生命周期方法 | `init` / `service` / `destroy` | `jspInit` / `_jspService` / `jspDestroy` |
| 本质 | — | 编译后就是 Servlet |

<div class="note info"><p>翻译后的源文件可以在容器的 work 目录里找到，例如 Tomcat 的 <code>work/Catalina/localhost/应用名/org/apache/jsp/</code>。出问题（如编译报错、行号对不上）时，直接看这个生成的文件是最快的排查方式。</p></div>

## 为什么 JSP 会被淘汰

- **职责混乱**：JSP 把视图和逻辑混在一起，稍不注意就写出「页面里连数据库」的代码。
- **前后端分离**：视图渲染转移到浏览器，服务端只返回 JSON，模板引擎的需求消失了。
- **工程效率**：JSP 的调试、热部署、国际化体验都不如现代前端工具链。
- **规范停滞**：JSP 本身已不再演进。

<div class="note warning"><p>JSP 是服务端能力，一旦被用户上传/写入，等同直接拿到服务器权限。所以生产环境有两条硬约束：JSP 文件放在 <code>WEB-INF</code> 下（外部不可直接访问），并且**绝不允许用户上传的文件落在能被解析为 JSP 的目录里**——这是许多上传漏洞的成因。</p></div>

## 九大内置对象

JSP 能直接用 `request`、`session` 这些变量，是因为翻译时容器已经在 `_jspService()` 里声明好了。九个对象中前四个是**作用域对象**（作用范围由小到大），后五个是**功能对象**：

- `pageContext`（`PageContext`）：page 作用域；唯一能访问其他作用域的入口
- `request`（`HttpServletRequest`）：request 作用域，一次请求（转发仍在）
- `session`（`HttpSession`）：session 作用域，一次会话
- `application`（`ServletContext`）：application 作用域，整个应用
- `out`（`JspWriter`）：输出内容到客户端
- `response`（`HttpServletResponse`）：设置响应头、状态码
- `config`（`ServletConfig`）：读取初始化参数
- `exception`（`Throwable`）：仅在错误页可用（页面标记 `isErrorPage`）
- `page`（`Object`）：当前页面实例，等价于 `this`

```jsp
<%
    pageContext.setAttribute("a", "page 级");
    request.setAttribute("b", "request 级");
    session.setAttribute("c", "session 级");
    application.setAttribute("d", "application 级");
    // 查找顺序：page → request → session → application
    out.println(pageContext.findAttribute("b"));
%>
```

<div class="note info"><p><code>pageContext</code> 是唯一能访问其他三个作用域的入口（<code>getRequest()</code>、<code>getSession()</code>、<code>getServletContext()</code>），也是 JSP 里获取「当前页面上下文」的统一抽象。EL 表达式的属性查找顺序就是上面这条链。</p></div>

## 四大作用域的选择

作用域用错会直接导致两类问题：数据串号（作用域太大）或数据拿不到（作用域太小）。

- **page**：页面内部临时变量，出了当前页面就没了。
- **request**：一次请求链路内的数据传递，**转发时最常用**。请求结束即销毁。
- **session**：与某个用户绑定的状态，如登录信息、购物车。注意敏感数据不要放这里，且要控制超时时间。
- **application**：全局共享，如配置、缓存、访问计数器。**多线程并发访问，必须考虑线程安全**。

## 指令、脚本与动作

**三种指令**（`<%@ %>`，作用于翻译阶段）：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" errorPage="/error.jsp" %>
<%@ page import="java.util.List, com.example.User" %>
<%@ include file="header.jsp" %>          <%-- 静态包含：翻译期合并到一个文件 --%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
```

区分两种包含是高频考点：

| | 静态包含 `<%@ include %>` | 动态包含 `<jsp:include />` |
| --- | --- | --- |
| 发生时机 | 翻译期 | 运行期 |
| 生成文件数 | 1（合并后） | 多个（各自独立编译） |
| 变量共享 | 共享（同一作用域） | 不共享（通过 request 传参） |
| 效率 | 高（只编译一次） | 略低（每次请求调用） |

**三种脚本元素**（`<% %>` / `<%= %>` / `<%! %>`）：

```jsp
<%-- 注释：翻译期丢弃，不会出现在响应里 --%>
<%! int count = 0; %>                       <%-- 声明：编译成类的成员变量，全局共享，危险 --%>
<%  int local = 1; %>                       <%-- 脚本片段：编译进 _jspService --%>
<%= local + count %>                        <%-- 表达式：等价于 out.print(...) --%>
```

<div class="note warning"><p><code>&lt;%! %&gt;</code> 声明的变量是 Servlet 的<b>成员变量</b>，所有请求线程共享，与 Servlet 的线程安全问题同源。JSP 里出现 <code>&lt;%! %&gt;</code> 基本就是代码异味，应该改成局部变量或干脆把逻辑移到 Servlet / Controller。</p></div>

**动作标签**（`<jsp:xxx>`，作用于运行期）：

```jsp
<jsp:include page="footer.jsp" />                    <%-- 动态包含 --%>
<jsp:forward page="/result.jsp" />                    <%-- 转发 --%>
<jsp:useBean id="user" class="com.example.User" scope="request" />
<jsp:setProperty name="user" property="name" value="jy" />
<jsp:getProperty name="user" property="name" />
```

## EL 表达式

EL（Expression Language）用来替代 `<%= %>`，让页面里不再出现 Java 代码片段：

```jsp
${user.name}                              <%-- 属性访问 --%>
${user["name"]}                           <%-- 等价写法，key 含特殊字符时用 --%>
${list[0]}                                <%-- 集合索引 --%>
${empty cart}                             <%-- null 或空集合都为 true --%>
${not empty cart} ${cart != null}
${a > b ? "大" : "小"}
${pageContext.request.contextPath}         <%-- 取当前应用路径 --%>
```

EL 的两条关键规则：

- **属性查找顺序**：page → request → session → application，命中即返回。
- **`null` 不报错**：`${user.address.city}` 中若 `address` 为 null，结果就是空字符串，而不是 NPE——这是 EL 比脚本片段更安全的地方。

```jsp
<%-- 取不到时给默认值 --%>
${empty user.nickname ? "游客" : user.nickname}
```

<div class="note info"><p>EL 访问属性走的是 <code>getXxx()</code> 而不是字段，所以 <code>${user.name}</code> 实际调用 <code>getName()</code>。字段名与 getter 不一致（如 <code>getName()</code> 返回 <code>name</code> 但字段叫 <code>username</code>）时，要以 getter 为准——这是「明明有值却取不到」的常见原因。</p></div>

## JSTL 标签库

JSTL 提供流程控制与格式化标签，让 JSP 彻底摆脱脚本片段：

```jsp
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<c:if test="${empty sessionScope.user}">
    <a href="${pageContext.request.contextPath}/login">请登录</a>
</c:if>

<c:choose>
    <c:when test="${user.level == 1}">管理员</c:when>
    <c:when test="${user.level == 2}">编辑</c:when>
    <c:otherwise>普通用户</c:otherwise>
</c:choose>

<ul>
    <c:forEach items="${users}" var="u" varStatus="st">
        <li>${st.index} - ${u.name}</li>
    </c:forEach>
</ul>

<fmt:formatDate value="${user.createTime}" pattern="yyyy-MM-dd HH:mm:ss" />
```

JSTL 的五个标签库：`core`（流程控制）、`fmt`（格式化与国际化）、`fn`（字符串函数）、`sql`（数据库操作，**生产环境禁用**）、`xml`（XML 处理，很少用）。

<div class="note warning"><p><code>&lt;c:out&gt;</code> 与 <code>${}</code> 的转义行为不同：<code>&lt;c:out value="${input}" /&gt;</code> 默认转义 HTML，而 <code>${input}</code> 直接输出。用户可控内容必须走 <code>&lt;c:out&gt;</code> 或 <code>&lt;c:out&gt;</code> 的 <code>escapeXml="true"</code>，否则就是 XSS 漏洞。</p></div>

## 三层架构中的位置

JSP 时代最主流的组织方式是 **MVC + 三层架构**：

```text
浏览器 → Servlet(控制器) → Service(业务) → DAO(数据) → DB
                ↓ 转发并携带 request 属性
              JSP(视图)：只负责展示，不写业务逻辑
```

对应的项目目录：

```text
src/main/java/com/example/       # 控制器、Service、DAO
src/main/webapp/
├── WEB-INF/
│   ├── web.xml
│   └── views/                   # JSP 放在 WEB-INF 下，禁止外部直接访问
│       └── user/list.jsp
├── static/                      # CSS / JS / 图片
└── index.jsp
```

```java
// 控制器：查数据 → 存 request → 转发到视图
List<User> users = userService.list();
req.setAttribute("users", users);
req.getRequestDispatcher("/WEB-INF/views/user/list.jsp").forward(req, resp);
```

<div class="note info"><p>JSP 放在 <code>WEB-INF</code> 下有两个好处：外部无法通过 URL 直接访问（必须经控制器转发），且 URL 里不会暴露 <code>.jsp</code> 后缀。这是「只有经过控制器才能看到页面」的简单实现，也让权限校验无法被绕过。</p></div>

## 现代替代方案

| 方案 | 说明 | 现状 |
| --- | --- | --- |
| Thymeleaf | 纯 HTML 模板，可静态预览，Spring 官方推荐 | 服务端渲染的主流选择 |
| Freemarker | 老牌模板引擎，性能好 | 仍有存量项目 |
| JSP | 编译器与 IDE 支持仍最成熟 | 存量维护 |
| 前后端分离 | 服务端只出 JSON，Vue/React 渲染 | 新项目主流 |

迁移时有一条实用原则：**新项目不要再引入 JSP**，存量项目只在必须改动时局部替换，不值得为了「技术新」做全量重写。

## 面试问答

### JSP 和 Servlet 的关系是什么？

JSP 编译后就是 Servlet：容器先把 `.jsp` 翻译成继承 `HttpJspBase` 的 Java 类，再编译加载，生命周期与普通 Servlet 一致（`jspInit` → `_jspService` → `jspDestroy`）。两者能力等价，区别只在适用场景——JSP 适合输出大段 HTML，Servlet 适合处理逻辑与输出少量数据。

### JSP 有哪九大内置对象，哪些是作用域对象？

作用域对象四个：`pageContext`(page)、`request`(request)、`session`(session)、`application`(application)；功能对象五个：`out`、`response`、`config`、`exception`、`page`。它们都是容器在 `_jspService()` 里预先声明的局部变量，所以能直接使用而无需声明。

### 静态包含和动态包含的区别？

`<%@ include %>` 在翻译期把文件内容合并进同一个生成文件，最终只有一个 Servlet，变量共享；`<jsp:include />` 在运行期调用另一个页面的输出并插入，各自独立编译，通过 `request` 传参。前者更快，后者更灵活（可以包含动态页面名）。

### `<%@ page %>`、`<%! %>`、`<% %>`、`<%= %>` 分别是什么？

`<%@ page %>` 是指令，在翻译期影响生成文件的属性（如 `import`、`errorPage`）；`<%! %>` 是声明语句，编译成类的成员变量或方法；`<% %>` 是脚本片段，编译进 `_jspService()` 方法体；`<%= %>` 是表达式，等价于 `out.print()`。后两者在方法内，`<%! %>` 在方法外，这是它们线程安全表现不同的根源。

### EL 表达式取不到值怎么办？

按顺序排查：① 属性名是否与 getter 对应（EL 走 getter 而非字段）；② 对象是否真的存在目标作用域里（page → request → session → application 依次查找，可以用 `${sessionScope.user}` 显式限定作用域缩小范围）；③ 是否缺少 `isELIgnored="false"` 或 JSP 版本过低；④ 集合/Map 的取值方式是否用对（`${map["key"]}` 而非 `${map.key}`）。

### 为什么线上 JSP 要放在 WEB-INF 下？

放在 `WEB-INF` 之外时，`/views/list.jsp` 这类路径可以被浏览器直接请求，绕过控制器的权限校验和数据准备，既可能越权看到内容，也可能因缺少必要数据而报错甚至泄露堆栈。放进 `WEB-INF` 后只能通过 `RequestDispatcher` 转发访问，访问入口收敛到控制器一处。
