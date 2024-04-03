## 网络安全

### 什么是认证和授权？如何设计一个权限认证框架？

认证：就是对系统访问者的身份进行确认（用户名密码登录、二维码登录、指纹、刷脸...）。

授权：就是对系统访问者的行为进行控制，授权通常是在认证之后，对系统内的隐私数据进行保护，后台接口访问权限，前台控件的访问权限。

通常情况下我们通过RBAC模型，也就是用户关联角色 ，而角色访问不同的资源，从而控制用户访问系统的行为。

认证和授权也是对一个权限认证框架进行评估的两个主要的方面。

### Cookie和Session有什么区别？如果没有Cookie、Seesion还能进行身份验证吗？

当服务器tomcat第一次接收到客户端的请求时，会开辟一块独立的session空间，建立一个session对象，同时会生成session id，通过响应头的方式保存到客户端浏览器的cookie当中，以后客户端的每次请求，都会在请求头部带上这个session id，这样就可以对应上服务端的一些会话信息，比如用户的登录状态。

  如果没有客户端的cookie，session是无法进行身份验证的。

  当服务端从单体应用升级为分布式之后，cookie + session要如何扩展？

- session黏贴，在负载均衡中，通过某种机制，保证同一个客户端的所有请求都会转发到同一个tomcat实例当中。当这个tomcat实例出现问题之后，请求就会被转发到其他实例，这时候用户的session用户信息就丢失了。
- session复制：当一个tomcat实例上保存了session信息后，主动将session复制到集群中的其他实例。问题：复制是需要时间的，在复制的过程中，容器产生session信息丢失。
- session共享，就是将服务端的session信息保存到一个第三方中，比如Redis

### 什么是CSRF攻击？如何防止？

CSRF：Cross Site Request Forgery 跨站请求伪造。

一个正常的请求会将合法用户的session id保存到浏览器的cookie，这时候，如果用户在浏览器中打开另一个Tab页，那这个tab页也是可以获得浏览器的cookie，黑客就可以利用这个cookie信息进行攻击

攻击过程：

1. 某银行网站A可以以GET请求的方式发起转账操作。*www.xxx.com/transfor.do?accountNum=100&money=1000* accountNum表示目标账户，这个请求肯定是需要登录才可以正常访问的，
2. 攻击者在某个论坛或者网站上上传一个图片，链接地址是 *www.xxx.com/transfor.do?accountNum=100&money=1000*，其中accountNum就是攻击者自己的银行账户。

3. 如果有一个用户，登录了银行网站，然后又打开浏览器的另一个Tab页，点击了这个图片，这时，银行就会受理到一个带了正确的cookie的请求，就会完成转账，用户的钱就被盗了。

 防止CSRF的方式：

1. 尽量使用POST请求，限制GET请求，POST请求可以带请求体，攻击者就不容易伪造出请求。
2. 将cookie设置为HttpOnly：response.setHeader("Set-Cookie","cookiename=cookievalue;HttpOnly")。
3. 增加token：在请求中放入一个攻击者无法伪造的信息，并且该信息不存在于cookie当中。
4. 增加一个额外的隐藏信息`<input type='hidden' value='demo'>`这也是Spring Security框架中采用的防范方式。

### 什么是OAuth2？有哪几种认证方式？

OAuth2.0是一个开放标准，允许用户授权在第三方应用程序访问他们存储在另外的服务提供者上的信息，而不需要将用户名和密码提供给第三方应用分享他们数据的所有内容。

OAuth2.0的协议认证流程，简单理解，就是允许我们将之前的授权和认证过程交给一个独立的第三方进行担保。

OAuth2.0协议有四种模式：

授权码模式：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210630010003.png" alt="img" style="zoom:67%;" />

简化模式：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210630010013.png" alt="img" style="zoom:67%;" />

密码模式：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210630010023.png" alt="img" style="zoom:67%;" />

客户端模式：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210630010030.png" alt="img" style="zoom:67%;" />

在梳理OAuth2.0协议流程的过程中，其实有一个主线，就是三方参与者的信任程度。

### 什么是JWT令牌？和普通令牌有什么区别？

普通令牌只是一个普通的字符串，没有特殊的意义，这就意味着，当客户端带上令牌去访问应用的接口时，应用本身无法判断这个令牌是否正确，他就需要到授权服务器上去拍段令牌是否有效，在高并发的场景下，检查令牌的网络请求就有可能成为一个性能瓶颈。

改良的方式就是JWT令牌，将令牌对应的相关信息全部冗余到令牌本身，这样资源服务器就不再需要发送求请给授权服务器去检查令牌了，他自己就可以读取到令牌的授权信息。JWT令牌的本质就是一个加密的字符串。

### 什么是SSO？与OAuth2.0有什么关系？

  OAuth2.0的使用场景通常称为联合登录，一处注册，多处使用。

  SSO：Single Sign ON：一处登录，多处同时登录。

  SSO的实现关键是将Seesion信息几种存储，通常使用Spring Security实现

### 如何实现单点登录系统？

[单点登录系统是怎么做的？](https://ke.boxuegu.com/barrier.html#/browse?courseId=3870&barrierId=5043&chapterId=1016)
