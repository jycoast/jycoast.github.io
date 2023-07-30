import{_ as i,o as a,c as e,f as l}from"./app-bdb0fa56.js";const r={},d=l('<h1 id="微服务" tabindex="-1"><a class="header-anchor" href="#微服务" aria-hidden="true">#</a> 微服务</h1><h2 id="谈谈你对微服务的理解-微服务有哪些优缺点" tabindex="-1"><a class="header-anchor" href="#谈谈你对微服务的理解-微服务有哪些优缺点" aria-hidden="true">#</a> 谈谈你对微服务的理解，微服务有哪些优缺点？</h2><p>微服务是由Martin Flowler大师提出的。微服务是一种架构风格，通过将大型的单体应用划分为比较小的服务单元，从而降低整个系统的复杂度。</p><p>具有以下优点：</p><ul><li>服务部署更灵活：每个应用都可以是一个独立的项目，可以独立部署，不依赖其他服务，耦合性降低。</li><li>技术选型更加灵活，在大型大体应用中，技术要进行更新，往往是非常困难的。而微服务可以根据业务特点，灵活选择技术栈。</li><li>应用的性能得到提高，大型单体应用中，往往启动就会成为一个很大的难关，而采用微服务之后，整个系统的性能是能够提高的。</li><li>更容易组合专门的团队，在单体应用中，团队成员往往需要对系统的各个部分都要有深入的了解，门槛是很高的。而采用微服务之后，可以给每个微服务组件专门的团队</li><li>代码复用：很多底层服务可以以REST API的方式对外提供统一的服务，所有基础服务可以在整个微服务系统中调用。</li></ul><p>对应的有以下缺点：</p><ul><li>服务调用的复杂性提高了，面临网络问题、容错问题、负载问题、高并发等等问题</li><li>分布式事务，尽量不要使用微服务的分布式事务</li><li>测试的难度提升了</li><li>运维的难度提升了，单体架构只要维护一个环节，而到了微服务是很多个环境，并且运维方式还都不一样。所以对部署、监控、告警等要求就会变得非常困难</li></ul><h2 id="springcloud和springcloudalibaba有哪些组件-都解决了什么问题" tabindex="-1"><a class="header-anchor" href="#springcloud和springcloudalibaba有哪些组件-都解决了什么问题" aria-hidden="true">#</a> SpringCloud和SpringCloudAlibaba有哪些组件？都解决了什么问题？</h2><p>SpringCloud是提供了构建微服务系统所需要的一组通用开发模式以及一系列快速实现这些开发模式的工具。通常所说的SpringCloud是指SpringCloud NetFlix，它和SpringCloudAlibaba都是SpringCloud这一系列开发模式的具体实现。</p><p>SpringCloud NetFlix架构图：</p><img src="https://raw.githubusercontent.com/yidongnan/spring-cloud-netflix-example/master/screenshots/Architecture.png" style="zoom:67%;"><p>SpringCloudAlibaba架构图：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206142320702.png" alt="image-20220614232037661" style="zoom:50%;"><h2 id="springcloud和dubbo的区别" tabindex="-1"><a class="header-anchor" href="#springcloud和dubbo的区别" aria-hidden="true">#</a> SpringCloud和Dubbo的区别？</h2><p>SpringCloud使用基于HTTP的REST方式，而Dubbo采用RPC通信。这两种方式各有优劣，前者牺牲了服务调用的性能，但也能避免原生RPC带来的问题，不存在代码级别的强依赖。</p><h2 id="分布式事务如何处理-怎么保证事务一致性" tabindex="-1"><a class="header-anchor" href="#分布式事务如何处理-怎么保证事务一致性" aria-hidden="true">#</a> 分布式事务如何处理？怎么保证事务一致性？</h2><p>分布式事务：就是要将不同节点上的事务操作，提供操作的原子性保证，同时成功或者同时失败，分布式事务的第一个要点就是要在原本没有直接关联的事务之间建立联系，分布式事务的实现可以基于：</p><ul><li>HTTP连接：最大努力通知 --事后补偿</li><li>MQ：事务消息机制</li><li>Redis：也可以定制出分布式事务机制。</li><li>Seata：是通过TC来在多个事务之间建立联系的。</li></ul><p>两阶段：AT XA 核心在于要锁资源，数据库提供了对于事务和锁良好的支持，因此使用AT模式的前题是要应用能够访问到数据库。</p><p>三阶段：TCC 在两阶段的基础上增加一个准备阶段，在准备阶段是不锁资源的，只是表示初始化连接。</p><p>SAGA模式：类似于熔断。业务自己实现正向操作和补偿的逻辑。只保证了事务的最终一致性</p><h2 id="怎么拆分微服务-怎样设计出高内聚、低耦合的微服务" tabindex="-1"><a class="header-anchor" href="#怎么拆分微服务-怎样设计出高内聚、低耦合的微服务" aria-hidden="true">#</a> 怎么拆分微服务？怎样设计出高内聚、低耦合的微服务？</h2><p>拆分微服务的时候，为了保证微服务的稳定，会有一些基本的准则：</p><ul><li>微服务之间尽量不要有业务交叉。</li><li>微服务之间只能通过接口进行服务调用，而不能绕过接口直接访问对方的数据</li><li>高内聚，低耦合。</li></ul><blockquote><p>高内聚低耦合，是一种从上而下指导微服务设计的方法。·实现高内聚低耦合的工具主要有同步的接口调用和异步的事件驱动（MQ）两种方式。</p></blockquote><h2 id="有没有了解通过ddd领域驱动设计" tabindex="-1"><a class="header-anchor" href="#有没有了解通过ddd领域驱动设计" aria-hidden="true">#</a> 有没有了解通过DDD领域驱动设计？</h2><p>什么是DDD：在2004年，由Eric Evans提出的，DDD是面对软件复杂之道。Domain-Driven-Design</p><p>Martin Flowler - 贫血模型 - 贫血失忆症 充血模型</p><p>MVC架构 -&gt; 领域优先的四层架构</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210630002318.png" alt="img" style="zoom:67%;"><p>大泥团：不利于微服务的拆分，大泥团结构拆分出来的微服务就是泥团结构，当服务业务逐渐复杂，这个泥团又会膨胀成为大泥团。</p><p>DDD只是一种方法论，没有一个稳定的技术框架。DDD要求领域是跟技术无关、跟存储无关、跟通信无关。</p><h2 id="什么是中台-中台和微服务有什么关系" tabindex="-1"><a class="header-anchor" href="#什么是中台-中台和微服务有什么关系" aria-hidden="true">#</a> 什么是中台？中台和微服务有什么关系？</h2><p>中台这个概念是阿里在2015年提出“小前台、大中台”战略思想。所谓中台，就是将各个业务线中可以复用的一些功能抽取出来，剥离个性，提取共性，形成一些可以可复用的组件，例如：盒马鲜生、团购。大体上，中台可以分为三类：业务中台、数据中台和技术中台。数据中台、收银中台、支付风控中台。</p><p>中台跟DDD结合：DDD会通过限界上下文将系统拆分成一个一个领域，而这种限界上下文，天生就成了中台之间的逻辑屏障。DDD在技术与资源调度方面都能够给中台建设提供不错的指导。上层的战略设计能够很好的指导中台划分，下层的战术设计能够很好的指导微服务搭建。在目前阶段，DDD还大都处在小范围实验的阶段。</p><h2 id="你的项目中是怎么保证微服务敏捷开发的" tabindex="-1"><a class="header-anchor" href="#你的项目中是怎么保证微服务敏捷开发的" aria-hidden="true">#</a> 你的项目中是怎么保证微服务敏捷开发的？</h2><p>开发运维一体化。</p><p>敏捷开发：目的就是为了提高团队的交付效率，快速迭代，快速试错。</p><p>每个月固定发布新版本，以分支的形式保存到代码仓库中，快速入职。任务面板、站立会议。团队人员灵活流动，同时形成各个专家代表。</p><p>测试环境 -&gt; 开发测试环境 -&gt; 集成测试环境 -&gt; 压测环境 -&gt; 预投产环境 -&gt; 生产环境。</p><p>文档优先。晨会、周会、需求拆分会。</p><h2 id="微服务的链路追踪、持续集成、ab发布要怎么做" tabindex="-1"><a class="header-anchor" href="#微服务的链路追踪、持续集成、ab发布要怎么做" aria-hidden="true">#</a> 微服务的链路追踪、持续集成、AB发布要怎么做？</h2><p>链路追踪：</p><ul><li>基于日志，形成全局事务ID，落地到日志文件。filebeat -logstash- Elaticsearch形成大型报表</li><li>基于MQ，往往需要架构支持，经过流式计算形成一些可视化的结果</li></ul><p>持续集成：通过jenkins自动化构建任务</p><p>AB发布：</p><ul><li>AB发布又称蓝绿发布：红黑发布。老版本和新版本是同时存在的</li><li>灰度发布：金丝雀发布</li></ul><h2 id="nacos和eureka的区别" tabindex="-1"><a class="header-anchor" href="#nacos和eureka的区别" aria-hidden="true">#</a> Nacos和Eureka的区别？</h2><ul><li>Nacos提供了服务的注册与发现，同时也提供了配置中心，而Eureka只提供了服务注册与发现</li><li>Nacos本身支持负载均衡，而Eureka不支持</li><li>Nacos同时支持AP和CP模式，而Eureka只满足AP模式</li></ul><div class="note info"><p>CAP原则又称为CAP定理，指的是在一个分布式系统中，Consistency（一致性），Availability（可用性）、Partition tolerance（分区容错性），三者不可得兼。</p></div><h2 id="熔断和限流有什么区别" tabindex="-1"><a class="header-anchor" href="#熔断和限流有什么区别" aria-hidden="true">#</a> 熔断和限流有什么区别？</h2><p>https://zhuanlan.zhihu.com/p/61363959</p>',52),n=[d];function o(p,h){return a(),e("div",null,n)}const c=i(r,[["render",o],["__file","microservice.html.vue"]]);export{c as default};