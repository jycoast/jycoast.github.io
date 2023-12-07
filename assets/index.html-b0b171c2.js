import{_ as o,r as p,o as t,c as r,f as h,a as e,b as a,d as c,e as d}from"./app-12019664.js";const n={},l=d('<h1 id="java学习路线" tabindex="-1"><a class="header-anchor" href="#java学习路线" aria-hidden="true">#</a> Java学习路线</h1><p>一入Java深似海。</p><h2 id="学习路线概览" tabindex="-1"><a class="header-anchor" href="#学习路线概览" aria-hidden="true">#</a> 学习路线概览</h2><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/687474703a2f2f626c6f672d696d672e636f6f6c73656e2e636e2f696d672f4a6176612545352541442541362545342542392541302545382542372541462545372542412542462e706e67" alt="img" style="zoom:67%;"><p>首先，我先分享下自己对不同学习方式的理解，小伙伴们可以根据自己情况选择。</p><ul><li>看视频系统学习，比如培训机构的课程、MOOC的课程等。看视频的好处就是有老师带着，易于理解和掌握，非常适合初学者。</li><li>看书学习，如《Redis设计与实现》、《 Java 并发编程的艺术》，便于了解技术脉络和深入学习知识点。</li><li>看博客和源码精进学习。博客的好处是有些知识点会以很通俗的方式讲解出来，我们很好理解。</li></ul><h2 id="第一阶段-java-基础" tabindex="-1"><a class="header-anchor" href="#第一阶段-java-基础" aria-hidden="true">#</a> 第一阶段：Java 基础</h2><p>最开始要学习的是 Java 基础，学习了这部分，就会对 Java 语言有一个初步的了解。其实大部分语言的基础知识都是大同小异，如果之前已经学习过其他语言如C、C++，那学习这部分会更快。</p><p>这部分主要学习的内容有：基本程序结构，类与对象，接口，泛型，反射，集合，异常， Java 网络编程， Java I/O和多线程。<strong>对于实习和校招的小伙伴来讲一定要好好学这部分的内容，前面学的越好，后面会越轻松，并且这部分内容面试也经常被问到</strong>。</p><p>学 Java 基础，推荐大家看尚硅谷宋红康老师的 Java 教程，宋老师的课程更适合零基础学员，从 Java 语言起源开始，循序渐进，知识点剖析细致。</p><blockquote><p>宋老师的 Java 基础教程：https://www.bilibili.com/video/BV1Kb411W75N</p></blockquote><p>除此之外，还可以阅读《 Java 核心技术 卷I》，这本书偏向实用，广度和深度都恰到好处。其中，第7-9章讲述了 Java 的GUI编程， Java 的GUI开发使用并不多，这部分可以先跳过。</p><p>网上也有一些不错的文档教程网站，可以辅助学习：</p><blockquote><p>廖雪峰 Java 教程：https://www.liaoxuefeng.com/wiki/1252599548343744</p><p>菜鸟教程 Java ：https://www.runoob.com/Java/Java-tutorial.html</p></blockquote><p>当学完了这部分，就可以做个图书管理系统、学生管理系统这样的小项目了。</p><p>当然，时间有限的小伙伴，可以不用做这块的项目，直接做 Java Web 项目就好了。</p><h2 id="第二阶段-数据库" tabindex="-1"><a class="header-anchor" href="#第二阶段-数据库" aria-hidden="true">#</a> 第二阶段：数据库</h2><h3 id="mysql" tabindex="-1"><a class="header-anchor" href="#mysql" aria-hidden="true">#</a> MySQL</h3><p>MySQL 和 Oracle 都是广受企业欢迎的数据库，其中 MySQL 是目前应用最广泛的开源关系数据库，对于新手或者校招的小伙伴，我们目前只学习 MySQL 就可以了。</p><p>这部分主要学习的内容有：数据库的CRUD操作、JDBC API、数据库特性和数据库连接池。</p><p>其中，数据库连接池是为了避免频繁地创建和销毁 JDBC 连接，常见连接池包括 C3P0，Druid 和 HikariCP，目前使用最广泛的是Druid。</p><blockquote><p>尚硅谷的MySQL入门视频：https://www.bilibili.com/video/BV12b411K7Zu</p></blockquote><p>学完基本知识之后，一定要找一些题目练习一下，巩固成果，下面的SQL问题经常出现在面试当中。</p><blockquote><p>SQL经典练习题（老师、学生、成绩）：https://segmentfault.com/a/1190000022279128)https://segmentfault.com/a/1190000022279128</p></blockquote><p>书籍方面，推荐入门的小伙伴看《MySQL必知必会》，是一本小册子，这本书实践性很强，基本没有什么理论的堆砌，非常适合入门。</p><p>如果想要深入学习，可以看《高性能 MySQL》，这本书是MySQL领域的经典之作，不过就是太厚了，面试重点看索引部分就可以了。</p><p>除此之外，如果要深入学习MySQL的使用和原理，可以看极客时间的专栏《MySQL实战45讲》，阿里资深技术专家讲解的课程，有很多生产经常遇到的问题，非常有深度。</p><h3 id="redis" tabindex="-1"><a class="header-anchor" href="#redis" aria-hidden="true">#</a> Redis</h3><p>Redis 是一个 key-value 存储系统，是跨平台的非关系型数据库，可用作数据库，高速缓存和消息队列代理。</p><p>Redis作为当下主流的缓存技术，已经成为互联网企业的不二首选。</p><blockquote><p>Redis入门到精通课程：https://www.bilibili.com/video/BV1CJ411m7Gc</p></blockquote><p>想深入学习的小伙伴，推荐阅读《Redis设计与实现》，知识点非常丰富，讲了很多底层的原理，我曾经看了三遍，对我面试帮助很大，非常推荐！</p><blockquote><p>Redis 设计与实现在线版：http://redisbook.com/</p></blockquote><blockquote><p>查询Redis命令的中文网站：https://www.redis.com.cn/tutorial.html</p></blockquote><h2 id="第三阶段-java-web" tabindex="-1"><a class="header-anchor" href="#第三阶段-java-web" aria-hidden="true">#</a> 第三阶段：Java Web</h2><p>这一阶段的内容均以了解为主，不作为学习的重点，很少有公司需要前后端都掌握，大概了解每种技术有什么作用即可，可以不用学的特别细致。</p><h3 id="web前端" tabindex="-1"><a class="header-anchor" href="#web前端" aria-hidden="true">#</a> web前端</h3><p>前端有三大基础技术 Html、CSS和 Java Script，初学的话，学习这些就可以了。如果想做出更好的交互式效果，可以再学习Vue和React等前端技术。</p><h3 id="web后端" tabindex="-1"><a class="header-anchor" href="#web后端" aria-hidden="true">#</a> web后端</h3><p>后端 Java 技术包括 Servlet、Filter、Listener、Session、Cookie、JSP、EL 表达式和 JSTL 等。</p><p>其中，像 <strong>JSP</strong> 这样比较老的技术，目前在各大互联网公司基本不再使用，已经被 <strong>Freemark</strong>、<strong>Thymeleaf</strong> 这样的模板引擎所替代，我们只需要了解基本使用即可。</p><p>入门 Java Web，推荐尚硅谷的 Java Web 教程，教程不仅包括前端三大技术，还有后端 Java 技术，最后还会带大家做一个书城项目。</p><blockquote><p>Java Web教程：https://www.bilibili.com/video/BV1Y7411K7zz</p></blockquote><h2 id="第四阶段-主流框架" tabindex="-1"><a class="header-anchor" href="#第四阶段-主流框架" aria-hidden="true">#</a> 第四阶段：主流框架</h2><p>这部分我们要学习的主流框架主要有 Spring、Spring MVC 和 MyBatis，俗称 SSM 框架。</p><p>曾经的 SSH 框架，即 Struts2、Spring、Hibernate 框架，已经逐渐被 SSM 替代，现在可以不用再学 Struts2 和 Hibernate 框架了。</p><p>学习这些框架之前，我们先来学习项目管理利器Maven和Git。</p><h3 id="maven" tabindex="-1"><a class="header-anchor" href="#maven" aria-hidden="true">#</a> Maven</h3><p>Maven 是一个项目管理工具，它基于项目对象模型(POM)的概念，它可以管理项目的构建、报告和文档。</p><p>Maven 本质就是一个巨大的 jar 包资源库，使用 Maven 构建项目，只需在项目的 pom.xml 中配置相关依赖后，就可以直接从远程仓库同步到本地，再也不用满世界搜索下载 jar 包了，省了很多查找和下载的烦恼。</p><blockquote><p>动力结点的Maven实战入门视频：https://www.bilibili.com/video/BV1dp4y1Q7Hf?p=29</p></blockquote><h3 id="git" tabindex="-1"><a class="header-anchor" href="#git" aria-hidden="true">#</a> Git</h3><p>Git 是一个开源的分布式版本控制系统，最大作用就是对文件进行版本管理，方便在不同版本进行切换修改，还可以很方便的协作开发。</p><p>GitHub 是基于 Git 的代码库托管站，学会了 Git ，我们就能愉快地上 Github 交友了。</p><blockquote><p>狂神说的 Git 视频： https://www.bilibili.com/video/BV1FE411P7B3</p></blockquote><p>喜欢文字版的小伙伴，推荐看廖雪峰的 Git 教程，很浅显易懂</p><blockquote><p>廖雪峰的 Git 教程：https://www.liaoxuefeng.com/wiki/896043488029600</p></blockquote><blockquote><p>方便查阅的 Git 中文手册：https://git-scm.com/book/zh/v2</p></blockquote><h3 id="ssm框架" tabindex="-1"><a class="header-anchor" href="#ssm框架" aria-hidden="true">#</a> SSM框架</h3><p>Spring 是一个轻量级的 Java 开发框架，现在已经是最受欢迎的企业级 Java 应用程序开发框架，也是 Java 能在服务端具有统治地位的重要原因之一。</p><p>Spring 框架的核心特性是依赖注入(DI)与面向切面编程(AOP)，Spring 框架的组成结构图如下所示：</p><p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20231206104724550.png" alt="image-20231206104724550"></p><p>Spring MVC 是一个基于MVC架构，用来简化web应用程序开发的框架，它是 Spring 的一部分，SpringMVC 已经成为目前最主流的 MVC 框架之一。</p><p>MyBatis 是一款优秀的持久层框架，它支持自定义 SQL、存储过程以及高级映射。</p><p>在使用传统JDBC时，往往需要写很多JDBC代码，需要自己写SQL语句以及自己装配参数，然后自己对结果集进行封装处理。</p><p>而Mybatis则帮我们简化了以上功能，只需要一些配置文件（xml）或是注解即可完成对数据库的查询以及结果的映射封装。</p><p>学习SSM框架，推荐使用一整套课程进行学习，会有更好的连贯性，而且还会学习整合SSM框架。</p><blockquote><p>SSM框架视频：https://www.bilibili.com/video/BV1Tv411b7Dp</p></blockquote><p>整合SSM框架还是比较繁琐的，时间紧张的小伙伴可以不用在整合这里花费时间，因为这种整合方式目前也不在流行了，现在直接使用更强大的利器Spring Boot就可以了。</p><h3 id="spring-boot" tabindex="-1"><a class="header-anchor" href="#spring-boot" aria-hidden="true">#</a> Spring Boot</h3><p>Spring Boot 采用约定大约配置的方式，大量的减少了配置文件的使用，从而使开发人员不再需要定义样板化的配置。</p><p>学习 Spring Boot，推荐雷丰阳老师的 Spring Boot 课程，课程基于 SpringBoot2.3与2.4 版本，包含核心基础、Web原理、单元测试、数据访问、指标监控等章节。</p><p><strong>那要不要跳过了 SSM 直接去学习 Spring Boot呢？</strong></p><p>如果只是为了使用 Spring Boot，当然可以跳过，毕竟 SSM 配置太繁琐了。</p><p>如果想深入学习，尤其是找 Java 开发的工作，面试中会出现很多 Spring 的底层问题，因此还是要学习 SSM 的，如果跳过了不利于学习原理。</p><blockquote><p>雷老师的 Spring Boot 课程：https://www.bilibili.com/video/BV19K4y1L7MT</p></blockquote><h2 id="第五阶段-服务器中间件" tabindex="-1"><a class="header-anchor" href="#第五阶段-服务器中间件" aria-hidden="true">#</a> 第五阶段：服务器中间件</h2><p>学完上面的内容，我们已经具备实际项目的开发能力了，但是要解决些复杂的业务场景，我们还要学习MQ、Elasticsearch这些中间件。</p><h3 id="mq" tabindex="-1"><a class="header-anchor" href="#mq" aria-hidden="true">#</a> MQ</h3><p>MQ（Message Queue）是一种跨进程的通信机制，用于传递消息。通俗点说，就是一个先进先出的数据结构。MQ有三大主要作用分别为解耦、异步、削峰/限流。</p><p>目前业界有很多MQ产品，比较出名的有以下四种：</p><p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20210201162342647.png" alt=""></p><p>我最开始学习的是Kafka，因为做的项目中使用到了，小伙伴们根据喜好或者项目需要，选择一款MQ学习就可以了。</p><blockquote><p>Kafka 教程：https://www.bilibili.com/video/BV1a4411B7V9</p><p>RabbitMQ教程：https://www.bilibili.com/video/BV14A411q7pF</p></blockquote><p>目前企业里用的比较多的是RocketMQ和Kafka。</p><h3 id="elasticsearch" tabindex="-1"><a class="header-anchor" href="#elasticsearch" aria-hidden="true">#</a> Elasticsearch</h3><p>全文搜索属于最常见的需求，开源的 Elasticsearch是目前全文搜索引擎的首选，这个作为学习的可选项，因为并不是所有的公司都有全文检索的需求，面试中Elasticsearch出现的概率也不高。</p><p>它可以快速地储存、搜索和分析海量数据。维基百科、Stack Overflow、Github 都采用它。</p><p>Elasticsearch的底层是开源库 Lucene。但是，必须自己写代码去调用Lucene的接口。Elastic 是 Lucene 的封装，提供了 REST API 的操作接口，开箱即用。</p><blockquote><p>ElasticSearch7.6.x最新完整教程：https://www.bilibili.com/video/BV17a4y1x7zq</p></blockquote><h3 id="项目实践" tabindex="-1"><a class="header-anchor" href="#项目实践" aria-hidden="true">#</a> 项目实践</h3><p>学完了这些，就可以把这些技术整合起来做个项目，这里推荐个我做过的社区论坛项目。</p><p>这个论坛项目不仅实现了基本的注册，登录，发帖，评论，点赞，回复功能，同时使用前缀树实现敏感词过滤，使用wkhtmltopdf生成长图和pdf，实现网站UV和DAU统计，并将用户头像等信息存于七牛云服务器。</p><p>这是项目使用到的相关技术：</p><p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20210201190237382.png" alt=""></p><p>这个项目作为Spring Boot实战练手很不错，老师讲解的很清晰，课程的深度和广度都有，而且课程最后还会手把手教大家将项目部署在云服务器。</p><p>课程中也会简要讲解Redis、Kafka和Elasticsearch，即使没有学过这些技术，仍然可以学习这个项目。</p><blockquote><p>社区论坛项目：https://www.bilibili.com/video/BV1AZ4y1u7n3</p></blockquote><p>补充一点，现在的服务器基本都是Linux系统，将项目部署在服务器，学习些基本的Linux命令是必不可少的。</p><blockquote><p>韩顺平 一周学会Linux视频：https://www.bilibili.com/video/BV1Sv411r7vd</p><p>Linux命令在线查询：https://wangchujiang.com/linux-command/</p></blockquote><h2 id="第六阶段-微服务和分布式" tabindex="-1"><a class="header-anchor" href="#第六阶段-微服务和分布式" aria-hidden="true">#</a> 第六阶段：微服务和分布式</h2><p><strong>对于实习和校招的小伙伴来讲，学好前五阶段的技术知识，再深入学习个技术点就可以了</strong>，如果还有时间和精力的小伙伴，可以学习微服务和分布式的内容。</p><h3 id="spring-cloud" tabindex="-1"><a class="header-anchor" href="#spring-cloud" aria-hidden="true">#</a> Spring Cloud</h3><p>Spring Cloud 是一套完整的微服务解决方案，基于 Spring Boot框架。</p><p>准确的说，Spring Cloud 是一系列框架的有序集合，它利用 Spring Boot 的开发便利性简化了分布式系统的开发，比如服务发现、服务网关、服务路由、链路追踪等。</p><blockquote><p>SpringCloud alibaba框架开发教程：https://www.bilibili.com/video/BV18E411x7eT</p></blockquote><h3 id="dubbo" tabindex="-1"><a class="header-anchor" href="#dubbo" aria-hidden="true">#</a> Dubbo</h3><p>值得一提的是，还有阿里开源Dubbo，Dubbo一个高性能优秀的服务框架。简单地说，Dubbo是一个基于Spring的RPC（远程过程调用）框架，能够实现服务的远程调用、服务的治理。</p><p>至于Spring Cloud 和Dubbo 有什么区别，大家可以搜索下。这里用网络上一个台式电脑的比喻来说就是：Dubbo 是品牌机，Spring Cloud 是组装机。</p><blockquote><p>Dubbo 视频：https://www.bilibili.com/video/BV1Gb411T7Ha</p></blockquote><h3 id="zookeeper" tabindex="-1"><a class="header-anchor" href="#zookeeper" aria-hidden="true">#</a> ZooKeeper</h3><p>ZooKeeper是一个高可用的分布式管理与协调框架，基于ZAB算法（原子消息广播协议）的实现。该框架能够保证分布式环境中数据的一致性，使得ZooKeeper成为了解决分布式一致性问题的利器。</p><blockquote><p>zookeeper视频：https://www.bilibili.com/video/BV1M741137qY</p></blockquote><h2 id="第七阶段-进阶优化" tabindex="-1"><a class="header-anchor" href="#第七阶段-进阶优化" aria-hidden="true">#</a> 第七阶段：进阶优化</h2><p>学会前面这些，我们就可以独立完成一个小项目，独立完成项目组分配给你的开发任务。</p><p>但是这还不足以写出好的代码，我们要想写出好的代码，还需要学习设计模式，学习多线程，以及JVM的内部原理等。同样，这些也是面试的必考点。</p><p>设计模式的书籍推荐《HeadFirst设计模式》，这是一本图文并茂的书籍，适合入门。</p><p>JVM 的书籍推荐《深入理解 Java 虚拟机》，这本书是 Java 开发者必看的书，很多 JVM 的文章都是来自这本书。</p><p>Java 并发方面，可以看《 Java 并发编程的艺术》，这本书深入到JVM、CPU层面讲解了 Java 并发框架、线程池的原理等，面对面试足够了；还有《并发编程实战》，这是一本不错的 Java 并发参考手册。</p><p>部分视频课程如下：</p><blockquote><p>Java 并发编程视频：https://www.bilibili.com/video/BV16J411h7Rd</p><p>JVM教程：https://www.bilibili.com/video/BV1PJ411n7xZ</p></blockquote><h2 id="end" tabindex="-1"><a class="header-anchor" href="#end" aria-hidden="true">#</a> End</h2><p>以上就是 Java 路线的全部内容了，刚入门的小伙伴可能都看头晕了，觉得好多知识点要学。</p><p>Java 技术栈知识的确是多，但只要按部就班、由浅入深的学习就会轻松一些，还会比较有成就感，即先学会用这个技术，再做个系统性的项目把技术融合起来，最后再来看原理部分。</p>',124),s={href:"https://github.com/cosen1024/Java-Interview/blob/main/%E9%9B%B6%E5%9F%BA%E7%A1%80Java%E5%AD%A6%E4%B9%A0%E8%B7%AF%E7%BA%BF.md",target:"_blank",rel:"noopener noreferrer"};function b(u,v){const i=p("ExternalLinkIcon");return t(),r("div",null,[h(` ---
sidebar: true
--- `),l,e("p",null,[a("特别感谢："),e("a",s,[a("零基础Java学习路线"),c(i)]),a(" 提供的资料。")])])}const m=o(n,[["render",b],["__file","index.html.vue"]]);export{m as default};
