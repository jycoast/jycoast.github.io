## 微服务

### 谈谈你对微服务的理解，微服务有哪些优缺点？

  微服务是由Martin Flowler大师提出的。微服务是一种架构风格，通过将大型的单体应用划分为比较小的服务单元，从而降低整个系统的复杂度。

  具有以下优点：

  - 服务部署更灵活：每个应用都可以是一个独立的项目，可以独立部署，不依赖其他服务，耦合性降低。
  - 技术选型更加灵活，在大型大体应用中，技术要进行更新，往往是非常困难的。而微服务可以根据业务特点，灵活选择技术栈。
  - 应用的性能得到提高，大型单体应用中，往往启动就会成为一个很大的难关，而采用微服务之后，整个系统的性能是能够提高的。
  - 更容易组合专门的团队，在单体应用中，团队成员往往需要对系统的各个部分都要有深入的了解，门槛是很高的。而采用微服务之后，可以给每个微服务组件专门的团队
  - 代码复用：很多底层服务可以以REST API的方式对外提供统一的服务，所有基础服务可以在整个微服务系统中调用。 

  对应的有以下缺点：

  - 服务调用的复杂性提高了，面临网络问题、容错问题、负载问题、高并发等等问题
  - 分布式事务，尽量不要使用微服务的分布式事务
  - 测试的难度提升了
  - 运维的难度提升了，单体架构只要维护一个环节，而到了微服务是很多个环境，并且运维方式还都不一样。所以对部署、监控、告警等要求就会变得非常困难

### SpringCloud和SpringCloudAlibaba有哪些组件？都解决了什么问题？

SpringCloud是提供了构建微服务系统所需要的一组通用开发模式以及一系列快速实现这些开发模式的工具。通常所说的SpringCloud是指SpringCloud NetFlix，它和SpringCloudAlibaba都是SpringCloud这一系列开发模式的具体实现。

SpringCloud NetFlix架构图：

<img src="https://raw.githubusercontent.com/yidongnan/spring-cloud-netflix-example/master/screenshots/Architecture.png" style="zoom:67%;" />

SpringCloudAlibaba架构图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206142320702.png" alt="image-20220614232037661" style="zoom: 50%;" />

### SpringCloud和Dubbo的区别？

SpringCloud使用基于HTTP的REST方式，而Dubbo采用RPC通信。这两种方式各有优劣，前者牺牲了服务调用的性能，但也能避免原生RPC带来的问题，不存在代码级别的强依赖。

### 分布式事务如何处理？怎么保证事务一致性？

详细参见：[深入浅出分布式事务的实现原理](https://juejin.cn/post/7116916308825866254)。

### 怎么拆分微服务？怎样设计出高内聚、低耦合的微服务？

拆分微服务的时候，为了保证微服务的稳定，会有一些基本的准则：

- 微服务之间尽量不要有业务交叉。
- 微服务之间只能通过接口进行服务调用，而不能绕过接口直接访问对方的数据
- 高内聚，低耦合。

> 高内聚低耦合，是一种从上而下指导微服务设计的方法。·实现高内聚低耦合的工具主要有同步的接口调用和异步的事件驱动（MQ）两种方式。

### 有没有了解通过DDD领域驱动设计？

什么是DDD：在2004年，由Eric Evans提出的，DDD是面对软件复杂之道。Domain-Driven-Design

Martin Flowler - 贫血模型 - 贫血失忆症 充血模型

MVC架构 -> 领域优先的四层架构

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210630002318.png" alt="img" style="zoom: 67%;" />

大泥团：不利于微服务的拆分，大泥团结构拆分出来的微服务就是泥团结构，当服务业务逐渐复杂，这个泥团又会膨胀成为大泥团。

DDD只是一种方法论，没有一个稳定的技术框架。DDD要求领域是跟技术无关、跟存储无关、跟通信无关。

### 微服务的链路追踪、持续集成、AB发布要怎么做？

链路追踪：

- 基于日志，形成全局事务ID，落地到日志文件。filebeat -logstash- Elaticsearch形成大型报表
- 基于MQ，往往需要架构支持，经过流式计算形成一些可视化的结果

持续集成：通过jenkins自动化构建任务

AB发布：

- AB发布又称蓝绿发布：红黑发布。老版本和新版本是同时存在的
- 灰度发布：金丝雀发布

### Nacos和Eureka的区别？

- Nacos提供了服务的注册与发现，同时也提供了配置中心，而Eureka只提供了服务注册与发现
- Nacos本身支持负载均衡，而Eureka不支持
- Nacos同时支持AP和CP模式，而Eureka只满足AP模式

<div class="note info"><p>CAP原则又称为CAP定理，指的是在一个分布式系统中，Consistency（一致性），Availability（可用性）、Partition tolerance（分区容错性），三者不可得兼。</p></div>

### Nacos配置中心，本地Resource，jar包中同级目录的配置文件加载优先级？



### Nacos的配置动态更新原理？

[nacos配置动态更新原理](https://juejin.cn/s/nacos%E9%85%8D%E7%BD%AE%E5%8A%A8%E6%80%81%E6%9B%B4%E6%96%B0%E5%8E%9F%E7%90%86)

### 使用Nacos配置中心，@Value对应的配置项如何动态更新？



### Nacos中命名空间和分组的概念及区别？



### Nacos同一个namespace中的不同的group注册的服务可以相互访问吗？



### Nacos服务注册的流程是怎么样的？



### 微服务下服务a调用服务b的流程？



### 注册中心，如何通过服务名找到服务实例？



### 熔断和限流有什么区别？

[降级-熔断-限流](https://zhuanlan.zhihu.com/p/61363959)

### 雪花算法有什么缺点？



### Gateway有哪些功能？如何配置动态路由？



### 如何手写一个注册中心？


