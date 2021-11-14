---
title: RocketMQ从理论到实践
date: 2021-10-24 19:12:43
tags: Java
categories:
 - 中间件
author: 吉永超
---

RocketMQ是一个分布式消息和流数据平台，具有低延迟、高性能、高可靠性、万亿级容量和灵活的可扩展性。RcoketMQ是2012年阿里巴巴开源的第三代分布式消息中间，2017年2月20日，Apache软件基金会宣布Apache RocketMQ成为顶级项目。
<!-- more -->

# 概念和特性

## 概念

### 消息模型

RocketMQ主要由Producer、Broker、Consumer三部分组成，其中Producer负责生产消息，Consumer负责消费消息，Broker负责存储消息，Broker在实际部署过程中对应一台服务器，每个Broker可以存储多个Topic的消息，每个Topic的消息也可以分片存储于不同的Broker。Message Queue用于存储消息的物理地址，每个Topic中的消息地址存储于多个Message Queue中。ConsumerGroup由多个Consumer实例构成。

### 生产者组

同一类Producer的集合，这类Producer发送同一类消息且发送逻辑一致。如果发送的是事务消息且原始生产者在发送之后崩溃，则Broker服务器会联系同一生产者组的其他生产者实例以提交或回溯消费。

### 消费者组

同一类Consumer的集合，这类Consumer通常消费同一类消息且消费逻辑一致。消费者组使得在消息消费方面，实现负载均衡和容错变的容易。特别需要注意的是，**消费者组的消费者实例必须订阅完全相同的Topic。**

<div class="note info"><p>一个生产者可以同时发送多种Topic消息；而一个消费者只对某种特定的Topic感兴趣，即只可以订阅和消费一种Topic消息。</p></div>

### 集群消费

集群消费模式下，相同的Consumer Group的每个Consumer实例平均分摊消息。

### 广播消息

广播消费模式下，相同的Consumer Group的每个Consumer实例都接收全量的消息。

### 标签

为消息设置的标志，用于同一主题下区分不同类型的消息。来自同一业务单元的消息，可以根据不同业务目的在同一主题下设置不同标签。标签能够有效地保持代码的清晰度和连贯性，并优化RocketMQ提供的查询系统。消费者可以根据Tag实现对不同子主题的不同消费逻辑，实现更好的扩展性。

### 队列

队列是存储消息的物理实体。一个Topic中可以包含多个Queue，每个Queue中存放的就是该Topic的消息。一个Topic的Queue也被称为一个Topic中消息的分区（Partition）。

一个Topic的Queue中的消息只能被一个消费者组中的一个消费者消费。一个Queue中的消息不允许同一个消费者组中的多个消费者同时消费。

与分区相关的还有一个概念：分片（Sharding）。分片不同于分区。在RocketMQ中，分片指的是存放相同Topic的Broker。每个分片中会创建相应数量的分区，即Queue，每个Queue的大小都是相同的。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211104235000.png" alt="分片" style="zoom: 67%;" />

### 协议

常见MQ的实现都遵循一些常规性的协议，例如：JMS、STOMP、AMQP、MQTT，它们的具体含义如下：

- JMS（Java Messaging Service即Java消息服务），是Java平台上有关MOM（Message Oriented Middleware，面向消息的中间件PO/OO/AO）的技术规范，它便于消息系统中的Java应用程序进行消息交换，并且通过提供标准的产生、发送、接收消息的接口，简化企业应用的开发，ActiveMQ是该协议的典型实现
- STOMP（Streaming Text Oriented Message Protocol即面向流文本的消息协议），是一种MOM设计的简单文本协议，STOMP提供一个可互操作的连接格式，允许客户端与任意STOMP消息代理（Broker）进行交互。ActiveMQ是该协议的典型实现，RabbitMQ通过插件可以支持该协议
- AMQP（Advanced Message Queuing Protocol即高级消息队列协议），一个提供统一消息服务的应用层便准，是应用层协议的一个开放标准，是一种MOM设计。基于此协议的客户端与消息中间件可传递消息，并不受客户端/中间件不同产品，不同开发语言等条件的限制。RabbitMQ是该协议的典型实现
- MQTT（Message Queuing Telemetry Transport即消息队列遥测传输），是IBM开发的一个即时通讯协议，是一种二进制协议，主要用于服务器和低功耗IOT（物联网）设备间的通信。该协议支持所有平台，几乎可以把所有物联网物品和外部连接起来，被用来当作传感器和致动器的通信协议。RabbitMQ通过插件可以支持该协议

## 特性

### 消息顺序

消息有序指的是一类消息消费时，能按照发送来的顺序来消费。例如：一个订单产生了三条消息分别是订单创建、订单付款、订单完成。消费要按照这个顺序消费才能有意义，但是同时订单之间是可以并行消费的。

顺序消息分为全局顺序消息与分区顺序消息，全局顺序是指某个Topic下所有的消息都要保证顺序；部分顺序消息只要保证每一组消息被顺序消费即可。

- 全局顺序是指对于指定的一个Topic，所有消息按照严格的先入先出的顺序发布和消费，适用于性能要求不高，所有的消息严格按照FIFO原则进行消息发布和消费的场景
- 分区顺序对于指定一个Topic，所有的消息根据sharding key进行区块分区。同一个分区内的消息按照严格的FIFO顺序进行发布和消费

### 消息重试

Consumer消费消息失败后，要提供一种重试机制，让消息再消费一次。Consumer消费消息失败通常可以认为有以下几种情况：

- 由于消息本身的原因，例如反序列化失败，消息数据本身无法处理（例如话费充值，当前消息的手机号被注销，无法充值）等。这种错误通常需要跳过这条消息，再消费其它消息，而这条失败的消息即使立刻重试消息，也大概率不会成功，所以最好提供一种定时重试机制，即过10秒后再重试
- 由于依赖的下游应用服务不可用，例如db连接不可用，外系统网络不可达等。遇到这种错误，即使跳过当前失败的消息，消费其它消息同样也会报错。这种情况建议应用sleep 30s，再消费下一条消息，这样可以减轻Broker重试消息的压力

RocketMQ会为每个消费组都设置一个Topic名称为“%RETRY%+consumerGroup”的重试队列（这里需要注意的是，这个Topic的重试队列是针对消费组，而不是针对每个Topic设置的），用于暂时保存因为各种异常而导致Consumer端无法消费的消息。考虑到异常恢复起来需要一些时间，会为重试队列设置多个重试级别，每个重试级别都有与之对应的重新投递延时，重试次数越多投递延时就越大。RocketMQ对于重试消息的处理是先保存至Topic名称为“SCHEDULE_TOPIC_XXXX”的延迟队列中，后台定时任务按照对应的时间进行Delay后重新保存至“%RETRY%+consumerGroup”的重试队列中。

### 延迟队列

延迟队列（定时消息）是指消息发送到broker后，不会立即被消费，等待特定时间投递给真正的topic，broker有配置项messageDelayLevel，默认值为“1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h”，18个level。可以配置自定义messageDelayLevel。注意，messageDelayLevel是broker的属性，不属于某个topic。

### 死信队列

死信队列用于处理无法被正常消费的消息，当一条消息初次消费失败，消费队列会自动进行消息重试；达到最大重试次数后，若消费依然失败，则表明消费者在正常情况下无法正确地消费该消息，此时，消息队列不会立刻将消息丢弃，而是将其发送到该消费者对应的特殊队列中。

RocketMQ将这种正常情况下无法被消费的消息称为死信消息（Dead-Letter Message），将存储死信消息的特殊队列称为死信队列（Dead Letter Queue）。在RocketMQ中，可以通过使用console控制台对死信队列中的消息进行重发来使得消费者实例再次进行消费。

# 架构和设计

## 技术架构

RocketMQ架构上主要分为四部分，如下图所示：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211102235603.png" alt="RocketMQ架构" />

其中各个部分的详细作用：

- Producer：消息发布的角色，支持分布式集群方式部署。Producer通过MQ的负载均衡模块选择相应的Broker集群队列进行消息投递，投递的过程支持快速失败并且低延迟

- Consumer：消息消费的角色，支持分布式集群方式部署；支持以push、pull两种模块消费消息；同时也支持集群方式和广播方式的消费，它提供实时消息订阅机制，可以满足大多数用户的需求

- NameServer：NameServer是一个非常简单的Topic路由注册中心，其角色类似Dubbo中的zookeeper，支持Broker的动态注册与发现。主要包括两个功能：

	- Broker管理：NameServer接收Broker集群的注册信息并且保存下来作为路由信息的基本数据。然后提供心跳检测机制，检查Broker是否还存活
	- 路由信息管理：每个NameServer将保存关于Broker集群的整个路由信息和用于客户端查询的队列信息。然后Producer和Consumer通过NameServer就可以知道整个Broker集群的路由信息，从而进行消息的投递和消费

	NameServer通常也是集群的方式部署，各实例间互相不进行信息通讯。Broker是向每一台NameServer注册自己的路由信息，所以每一个NameServer实例上面都保存一份完整的路由信息。当某个NameServer因某种原因下线了，Broker仍然可以向其它NameServer同步其路由信息，Producer，Consumer仍然可以动态感知Broker的路由信息

- BrokerServer：Broker主要负责消息的存储、投递和查询以及服务高可用保证，为了实现这些功能，Broker包含了以下几个重要的子模块

### 集群工作流程

集合部署架构图，描述集群工作流程：

- 启动NameServer，NameServer起来后监听端口，等待Broker、Producer、Conusmer连接上来，相当于一个路由控制中心
- Broker启动，跟所有的NameServer保持长连接，定时发送心跳包。心跳包中包含当前Broker信息（IP+端口等）以及存储所有Topic信息。注册成功后，NameServer集群中就有Topic跟Broker的映射关系
- 收发消息前，先创建Topic，创建Topic时需要指定该Topic要存储在哪些Broker上，也可以在发送消息时自动创建Topic
- Producer发送消息，启动时先跟NamerServer集群中的其中一台建立长连接，并从NameServer中获取当前发送的Topic存在哪些Broker上，轮询从队列列表中选择一个队列，然后与队列所在的Broker建立长连接从而向Broker发消息
- Consumer跟Producer类似，跟其中一台NameServer建立长连接，获取当前订阅Topic存在哪些Broker上，然后直接跟Broker建立连接通道，开始消费消息

## 架构设计

### 消息存储

#### 消息存储整体架构

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211031234114.png" alt="RockeMQ消息存储" style="zoom:100%;" />

消息存储的架构中主要由三个部分构成：

- CommitLog：消息主体以及元数据的存储主体，存储Producer端写入的消息主题内容，消息内容不是定长的。单个文件大小默认1G，文件名长度为20位，左边补零，剩余为起始偏移量，比如00000000000000000000代表了第一个文件，起始偏移量为0，文件大小为1G=1073741824；当第一个文件写满了，第二个文件为00000000001073741824，起始偏移量为1073741824，以此类推。消息主要是顺序写入日志文件，当文件满了，写入下一个文件；
- ConsumeQueue：消息消费队列，引入的目的主要是提高消息消费的性能，由于RocketMQ是基于主题topic的订阅模式，消息消费是针对主题进行的，如果要遍历CommitLog文件中根据Topic检索消息是非常低效的。Conusmer即可根据ConsumerQueue来查找待消费的消息。其中，ConsumerQueue（逻辑消费队列）作为消费消息的索引，保存了指定Topic下队列消息在CommitLog中的起始物理偏移量offset，消息大小size和消息Tag的HashCode值。ConsumerQueue文件可以堪称是基于Topic的CommitLog索引文件，故ConsumerQueue文件夹的组织方式是：topic/queue/file三层组织结构，具体存储路径为：`$HOME/store/consumequeue/{topic}/{queueId}/{fileName}`。同样ConsumerQueue文件采取定长设计，每一个条目共20个字节，分别为8个字节的CommitLog物理偏移量，4字节的消息长度，8字节的tag hashcode，单个文件由30w个条目组成，可以像数组一样随机访问每一个条目，每个ConsumerQueue文件大小约5.72M；
- IndexFile：IndexFile（索引文件）提供了一种可以通过key或者时间区间来查询消息的方法。Index文件的存储位置是：`$HOME \store\index${fileName}`，文件名fileName是以创建时的时间戳命名的，固定的单个IndexFile文件大小约为400M，一个IndexFile可以保存2000W个索引，IndexFile的底层存储设计为在文件系统中实现HashMap结构，故RocketMQ的索引文件其底层实现为hash索引。

从以上RocketMQ的消息存储整体架构图可以看出，RocketMQ采用的是混合型的存储结构，即单个实例下所有的队列共用一个日志数据文件（CommitLog）来存储。RocketMQ的混合型存储结构（多个Topic的消息实体内容都存储于一个CommitLog文件中）针对Producer和Consumer分别采用了数据和索引部分相分离的存储结构，Producer发送消息至Broker端，然后Broker端使用或者异步的方式对消息刷盘持久化，保存至CommitLog中。只要消息被刷盘持久化至磁盘文件CommitLog中，那么Producer发送的消息就不会丢失。正因为如此，Consumer也就肯定有机会去消费这条消息。当无法拉取到消息后，可以等下一次消息拉取，同时服务端也支持长轮询模式，如果一个消息拉取请求未拉取到消息，Broker允许等待30s的时间，只要这段时间内有新消息到达，将直接返回给消费端。这里，RocketMQ的具体做法是，使用Broker端的后台服务线程——ReputMessageService不停地分发请求并异步构建ConsumeQueue（逻辑消费队列）和IndexFile（索引文件）数据。

#### 页缓存与内存映射

页缓存（PageCache）是OS对文件地缓存，用于加速对文件的读写。一般来说，程序对文件进行顺序读写的速度几乎接近于内存的读写速度，主要原因就是由于OS使用PageCache机制对读写访问操作进行了性能优化，将一部分的内存用作PageCache。对于数据的读写，OS会先写入至Cache内，随后通过异步的方式由pdflush内核线程将Cache内的数据刷盘至物理磁盘上。对于数据的读取，如果一次读取文件时出现未命中PageCache的情况，OS从物理磁盘上访问读取文件的同时，会顺序对其它相邻块的数据文件进行预读取。

在RocketMQ中，ConsumeQueue逻辑消费队列存储的数据较少，并且是顺序读取，在PageCache机制的预读取作用下，ConsumeQueue文件的读性能几乎接近内存，即使在有消息堆积的情况下也不会影响性能，而对于CommitLog消息存储的日志数据来说，读取消息内容的时候会产生较多的随机访问读取，严重影响性能。如果选择合适的系统IO调度算法，比如设置调度算法为“Deadline”（此时块存储采用SSD的话），随机读的性能也会有所提升。

另外，RocketMQ主要通过MappedByteBuffer对文件进行读写操作。其中，利用了NIO中的FileChannel模型将磁盘上的物理文件直接映射到用户态的内存地址中（这种Mmap的方式减少了传统IO将磁盘文件数据在操作系统内核地址空间的缓冲区和用户应用程序地址空间的缓冲区之间来回进行拷贝的性能开销），将对文件的操作转化为直接对内存地址进行操作，从而极大地提高了文件的读写效率（正因为需要使用内存映射机制，故RocketMQ的文件存储都使用定长结构来存储，方便一次将整个文件映射至内存）。

#### 消息刷盘

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211101233904.png" alt="RocketMQ消息刷盘" style="zoom:67%;" />

刷盘的方式有以下两种：

- 同步刷盘：如上图所示，只有在消息真正持久化至磁盘后RocketMQ的Broker端才会真正返回给Producer端一个成功的ACK响应。同步刷盘时MQ消息可靠性来说是一种不错的保障，但是性能上会有较大的影响，一般适用于金融业务应用该模式较多
- 异步刷盘：能够充分利用OS的PageCache的优势，只要消息写入PageCache即可将成功的ACK返回给Producer端。消息刷盘采用后台异步线程提交的方式进行，降低了读写延迟，提高了MQ的性能和吞吐量

### 通信机制

RocketMQ消息队列集群主要包括NameServer、Broker（Master、Slave）、Producer、Consumer4个角色，基本通讯流程如下：

- Broker启动后需要完成一次将自己注册至NameServer的操作；随后每隔30s时间定时向NameServer上报Topic路由信息
- 消息生产者Producer作为客户端发送消息的时候，需要根据消息的Topic从本地缓存的TopicPublishInfoTable获取路由消息。如果没有则更新路由信息会从NameServer上重新拉取，同时Producer会默认每隔30s向NameServer拉取一次路由信息
- 消息生产者Producer会根据第二步中获取的路由信息选择一个队列（MessageQueue）进行消息发送；Broker作为消息的接收者接收消息并落盘存储
- 消息消费者Consumer会根据第二步中获取的路由信息，并在完成客户端的负载均衡后，选择其中的某一个或者几个消费队列来拉取消息并进行消费

RoketMQ集群中的角色几乎都会进行通信，rocketmq-remoting模块是RocketMQ消息队列中负责网络通信的模块，它几乎被其它所有需要网络通信的模块（诸如rocketmq-client、rocketmq-broker、rocketmq-namesrv）所依赖和引用。为了实现客户端与服务器之间的高效的数据请求与结构，RocketMQ消息队列自定义了通信协议并在Netty的基础之上扩展了通信模块。

#### RocketMQ通信类结构

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211102232119.png" alt="RocketMQ通信"  />

在RocketMQ中使用了自定义协议，RemotingCommand这个类在消息传输过程中对所有数据内容的封装，不但包含了所有的数据结构，还包含了编解码的操作。

传输的内容主要分为4个部分：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211102232727.png" alt="传输内容" style="zoom:67%;" />

详细含义如下：

- 消息长度：总长度，四个字节存储，占用一个int类型
- 序列化类型&消息长度：同样占用一个int类型，第一个字节表示序列化类型，后面三个字节表示消息头长度
- 消息头数据：经过序列化后的消息头数据
- 消息主体数据：消息主体的二进制字节数据内容

#### Reactor线程设计

RocketMQ的RPC通信采用Netty组件作为底层通信库，同样也遵循了Reactor线程模型，同时又在这之上做了一些扩展和优化。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211102233040.png" alt="Reactor线程模型"  />



### 消息过滤

RocketMQ分布式消息队列的消息过滤方式有别于其它MQ中间件，是在Consumer端订阅消息时再做消息过滤的。RocketMQ这么做是在于其Producer端写入消息和Consumer订阅消息采用分离存储的机制来实现的。Consumer端订阅消息是需要通过ConsumerQueue这个消息消费的逻辑队列拿到一个索引，然后再从CommitLog里面读取真正的消息实体内容，所以说到底也还是绕不开其存储结构。其ConsumerQueue的存储结构如下，可以看到其中有8个字节存储的Message Tag的哈希值，基于Tag的消息过滤正是基于这个字段值的。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211102233703.png" alt="ConsumerQueue的存储结构" style="zoom:100%;" />

主要支持如下两种的方式的过滤：

- Tag过滤方式：Consumer端在订阅消息时除了指定Topic还可以指定Tag，如果一个消息有多个TAG，可以用“||”分隔。其中，Conusmer端会将这个订阅请求构建成一个SubscriptionData，发送一个pull消息的请求给Broker端。Broker端从RocketMQ的文件存储层——Store读取数据之前，会用这些数据先构建一个MessageFilter，然后传给Store。Store从ConsumerQueue读取到一条记录后，会用它记录的消息tag hash值去做过滤，由于在服务端只是根据hashcode进行判断，无法精确对tag原始字符串进行过滤，故消息消费端拉取到消息后，还需要对消息的原始tag字符串进行比对，如果不同，则丢弃该消息，不进行消息消费
- SQL92的过滤方式：这种方式的大致做法和上面Tag过滤方式一样，只是在Store层的具体过滤过程不太一样，真正的SQL expression的构建和执行由rocketmq-filter模块负责的。每次过滤都去执行SQL表达式会影响效率，所以RocketMQ使用了BloomFilter避免了每次都去执行。SQL92的表达式上下文为消息的属性

### 负载均衡

<div class="note info"><p>消息消费队列在同一消费者组不同消费者之间的负载均衡，其核心设计理念是在一个消息队列时间在同一时间只允许被同一消费者组的一个消费者消费，一个消息消费者能同时消费多个消息队列。</p></div>



# 最佳实践

## 生产者

### Tags的使用

一个应用尽可能用一个Topic，而消息子类型则可以用tags来标识。tags可以由应用自由设置，只有生产者在发送消息设置了tags，消费方在订阅消息时才可以利用tags通过broker做消息过滤：message.setTags("TagsA||TagsB")。

### Keys的使用

每个消息在业务层面的唯一标识码要设置到keys字段，方便来定位消息丢失问题。服务器会为每个消息创建索引（哈希索引），应用可以通过topic、key来查询这条消息内容，以及消息被谁消费。由于是哈希索引，请务必保证key尽可能唯一，这样可以避免潜在的哈希冲突。

### 选择oneway形式发送

通常消息的发送时这样的一个过程：

- 客户端发送请求到服务器
- 服务器处理请求
- 服务器向客户端返回应答

所以，一次消息发送的耗时时间时上述三个步骤的总和，而某些场景要求耗时非常短，但是对可靠性要求并不高，例如日志收集类应用，此类应用可以采用oneway形式调用，oneway形式只发送请求不等待应答，而发送请求在客户端实现层面仅仅是一个操作系统调用的开销，即将数据写入客户端的socket缓冲区，此过程通常在微秒级。

## 消费者

### 消费过程幂等

RocketMQ无法避免消息重复（Exactly-Once），所以如果业务对消费重复非常敏感，务必要在业务层面进行去重处理。可以借助关系数据库进行去重。首先需要确定消息的唯一键，可以是msgId，也可以是消息内容中的唯一标识字段，例如订单id等。在消费之前判断唯一键是否在关系数据库中存在，如果不存在则插入，并消费，否则跳过（实际过程要考虑原子性问题，判断是否存在可以尝试插入，如果报主键冲突，则插入失败，直接跳过）。

msgId一定是全局唯一标识符，但是实际使用中，可能会存在相同的消息有两个不同的msgId的情况（消息主动重发、因客户端重投机制导致重复等），这种情况就需要业务字段进行重复消费。

### 提升消费速度

- 提高消费并行度

	绝大部分消息消费行为都属于IO密集型，即可能是操作数据库，或者调用RPC，这类消费行为的消费速度取决于后端数据库或者外部系统的吞吐量，通过增加消费并行度，可以提高总的消费吞吐量，但是并行度增加到一定程度，反而会下降。所以，应用必须设置合理的并行度，可以通过如下几种方式修改消费并行度的方法：

	- 同一个ConsumerGroup下，通过增加Consumer实例数量来提高并行度（需要注意的是超过订阅队列数的Consumer实例无效）。可以通过增加及其或者在已有机器启动多个进程的方式
	- 提高单个Consumer的消费并行线程，通过修改参数consumerThreadMin、consumerThreadMax实现

- 批量方式消费

	- 某些业务流程如果支持批量方式消费，则可以很大程度上提高消费吞吐量，例如订单扣款类应用，一次处理一个订单耗时1s，一次处理10个订单可能也只耗时2s，这样即可大幅度提高消费的吞吐量，通过设置consumer的consumerMessageBatchMaxSize参数，默认是1，即一次只消费一条消息，例如设置为N，那么每次消费的消息数小于等于N

- 跳过非重要消息

	发生消息堆积时，如果消费速度一直追不上发送的速度，如果业务对数据的要求不高的话，可以选择丢弃不重要的消息。例如，当队列的消息数堆积到100000条以上，则尝试丢弃部分或全部消息，这样就可以快速追上发送消息的速度，示例代码如下：

	```java
	    public ConsumeConcurrentlyStatus consumeMessage(
	            List<MessageExt> msgs,
	            ConsumeConcurrentlyContext context) {
	        long offset = msgs.get(0).getQueueOffset();
	        String maxOffset =
	                msgs.get(0).getProperty(Message.PROPERTY_MAX_OFFSET);
	        long diff = Long.parseLong(maxOffset) - offset;
	        if (diff > 100000) {
	            // TODO 消息堆积情况的特殊处理
	            return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
	        }
	        // TODO 正常消费过程
	        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
	    }   
	```

- 优化每条消息消费过程

	优化消息消费时的速度，可以优化消费流程，也可以将部分耗时的操作交由线程池处理

## 顺序消费

### 并发消费

无序消息也指普通消息，Producer只管发送消息，Consumer只管接收消息，至于消息和消息之间的顺序并没有保证。

生产者并发消费的示例：

```java
@Slf4j
public class concurrentProducer {

    public static void main(String[] args) throws Exception {
        DefaultMQProducer producer = new DefaultMQProducer("op");
        producer.setNamespace("localhost:9876");
        producer.start();
        for (int i = 0; i < 100; i++) {
            byte[] body = ("Hi" + i).getBytes();
            Message msg = new Message("TopicA", "TagA", body);
            SendResult sendResult = producer.send(msg);
            log.info("发送结果: {}", sendResult);
        }
        producer.shutdown();
    }
}
```

消费者并发消费的示例：

```java
@Slf4j
public class ConcurrentConsumer {

    public static void main(String[] args) throws Exception {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("op");
        consumer.setNamespace("localhost:9876");
        consumer.start();
        consumer.registerMessageListener(new MessageListenerConcurrently() {
            @Override
            public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
                for (MessageExt messageExt : list) {
                    log.info("并发消费: {}", messageExt);
                }
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });
        consumer.shutdown();
    }
}
```

### 顺序消费

顺序消息指的是，严格按照消息的发送顺序进行消费的消息（FIFO）。

默认情况下生产者会把消息以Round Robin轮询方式发送到不同的Queue分区队列；而消费消息时会从多个Queue上拉取消息，这种情况下的发送和消费是不能保证顺序的。如果将消息仅发送到同一个Queue中，消费时也只从这个Queue上拉取消息，就严格保证了消息的顺序性。

#### 全局有序

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211104235910.png" alt="RocketMQ全局有序" style="zoom: 67%;" />

当发送和消费参与的Queue只有一个时所保证的有序是整个Topic中消息的顺序，称为全局有序。创建Topic时指定Queue的数量有以下三种方式：

- 在代码中创建Producer时，可以指定其自动创建的Topic的Queue的数量
- 在RocketMQ可视化控制台中手动创建Topic时指定Queue的数量
- 使用mqadmin命令手动创建Topic时指定Queue的数量

#### 分区有序

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211105000246.png" alt="RocketMQ分区有序" style="zoom:67%;" />

如果有多个Queue参与，其仅可保证在该Queue分区队列上的消息顺序，则称为分区有序。那么我们该如何Queue的选择呢？在定义Producer的时候我们可以指定消息队列选择器，这个选择器是我们自己实现了MessageQueueSelector接口定义的。

```java
public class CustomMessageQueueSelector implements MessageQueueSelector {

    /**
     * @param list    该Topic下所有可选的MessageQueue
     * @param message 待发送的消息
     * @param o       send方法传入的第三个参数
     */
    @Override
    public MessageQueue select(List<MessageQueue> list, Message message, Object o) {
        return null;
    }
}
```

在定义选择器的选择算法时，一般需要使用选择key。这个选择key可以是消息key也可以是其它数据。但无论谁做选择key，都不能重复，都是唯一的。

取模算法存在一个问题：不同选择key与Queue数量取模结果可能会是相同的，即不同选择key的消息可能会出现相同的Queue，即同一个Consumer可能会消费到不同选择key的消息。解决这个问题的一般性做法是，从消息中获取到选择key，对其进行判断，若是当前Consumer需要消费的消息，则直接消费。否则，什么也不做。这种做法要求选择key要能够随着消息一起被Consumer获取到，此时使用消息key作为选择key是比较好的做法。

以上做法会不会出现如下新的问题呢？不属于那个Consumer的消息被拉取走了，那么应该消费该消息的Consumer是否还能再消费该消息呢？同一个Queue中的消息不可能被同一个Group中的不同Consumer同时消费。所以，消费同一个Queue的不同选择key的消息的Consumer一定属于不同的Group，而不同的Group中的Consumer间的消费是相互隔离的，互不影响。

生产者顺序消费的示例：

```java
@Slf4j
public class OrderedProducer {

    public static void main(String[] args) throws Exception {
        DefaultMQProducer producer = new DefaultMQProducer("op");
        producer.setNamespace("localhost:9876");
        producer.start();
        for (int i = 0; i < 100; i++) {
            Integer orderId = i;
            byte[] body = ("Hi" + i).getBytes();
            Message msg = new Message("TopicA", "TagA", body);
            // 实现自定义的队列选择器
            SendResult sendResult = producer.send(msg, new MessageQueueSelector() {
                @Override
                public MessageQueue select(List<MessageQueue> list, Message message, Object o) {
                    Integer id = (Integer) o;
                    int index = id % list.size();
                    return list.get(index);
                }
            }, orderId);
            log.info("发送结果: {}", sendResult);
        }
        producer.shutdown();
    }
}
```

消费者顺序消费的示例：

```java
@Slf4j
public class OrderedConsumer {

    public static void main(String[] args) throws Exception {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("op");
        consumer.setNamespace("localhost:9876");
        consumer.start();
        // 这里必须是MessageListenerOrderly才会保证接收到的消息是有序的
        consumer.registerMessageListener(new MessageListenerOrderly() {
            @Override
            public ConsumeOrderlyStatus consumeMessage(List<MessageExt> list, ConsumeOrderlyContext consumeOrderlyContext) {
                for (MessageExt messageExt : list) {
                    log.info("顺序消费: {}", messageExt);
                }
                consumeOrderlyContext.setAutoCommit(true);
                return ConsumeOrderlyStatus.SUCCESS;
            }
        });
        consumer.shutdown();
    }
}
```

## 订阅关系的一致性

在使用RocketMQ可能会出现消费者无法消费的情况，即`consume but filter`，这是因为订阅关系不一致导致的，订阅关系的一致性指的是，同一个消费者组（Group ID相同）下所有的Consumer实例所订阅的Topic与Tag及对消息的处理逻辑必须完全一致。否则，消息消费的逻辑就会混乱，甚至导致消息丢失。

### 正确的订阅关系

多个消费者组订阅了多个Topic，并且每个消费者组里的多个消费者实例的订阅关系保持了一致。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107115839.png" alt="正确的订阅关系" style="zoom:67%;" />

### 错误的订阅关系

一个消费者组订阅了多个Topic，但是该消费者组里的多个Consumer实例的订阅关系并没有保持一致。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107120022.png" alt="错误的订阅关系" style="zoom:67%;" />

#### 订阅了不同的Topic

实例1：

```java
@Slf4j
public class differentTopicConsumer {
    public static void main(String[] args) throws Exception {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group1");
        consumer.subscribe("test_topic_A", "*");
        consumer.registerMessageListener(new MessageListenerConcurrently() {
            @Override
            public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
                log.info("消费消息: {}", list);
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });
    }
}
```

实例2：

```java
@Slf4j
public class differentTopicConsumer {
    public static void main(String[] args) throws Exception {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group1");
        consumer.subscribe("test_topic_B", "*");
        consumer.registerMessageListener(new MessageListenerConcurrently() {
            @Override
            public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
                log.info("消费消息: {}", list);
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });
    }
}
```

以上在同一个消费者组中的两个相同的Consumer实例订阅了不同的Topic，就会导致无法消费消息。

#### 订阅了不同Tag

实例1：

```java
@Slf4j
public class differentTagsConsumer {
    public static void main(String[] args) throws Exception {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group2");
        consumer.subscribe("test_topic_A", "TagA");
        consumer.registerMessageListener(new MessageListenerConcurrently() {
            @Override
            public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
                log.info("消费消息: {}", list);
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });
    }
}
```

实例2：

```java
@Slf4j
public class differentTagsConsumer {
    public static void main(String[] args) throws Exception {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group2");
        consumer.subscribe("test_topic_A", "TagB");
        consumer.registerMessageListener(new MessageListenerConcurrently() {
            @Override
            public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
                log.info("消费消息: {}", list);
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });
    }
}

```

同一个消费者组中的两个Consumer订阅了相同Topic的不同Tag也会导致无法消费，这也是实际开发中比较容易犯得错误。

#### 订阅不同数量的Topic

实例1：

```java
@Slf4j
public class differentNumberTopicConsumer {
    public static void main(String[] args) throws Exception {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group3");
        consumer.subscribe("test_topic_B", "TagA");
        consumer.subscribe("test_topic_B", "TagB");
        consumer.registerMessageListener(new MessageListenerConcurrently() {
            @Override
            public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
                log.info("消费消息: {}", list);
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });
    }
}
```

实例2：

```java
@Slf4j
public class differentNumberTopicConsumer {
    public static void main(String[] args) throws Exception {
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("group3");
        consumer.subscribe("test_topic_B", "TagA");
        consumer.registerMessageListener(new MessageListenerConcurrently() {
            @Override
            public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
                log.info("消费消息: {}", list);
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });
    }
}
```

同一个消费者中的两个Consumer订阅了不同数量的Topic也会导致消费失败。

# SpringBoot整合RocketMQ

在之前的例子当中，我们都使用的是DefaultMQProducer/DefaultMQPushConsumer，通过设置一些参数来改变MQ的行为，但这种方式并没有那么的“Spring”，实际上，RocketMQ针对于SpringBoot也提供了相应的starter，使得RocketMQ可以做到“开箱即用”。

## 配置管理

### 依赖管理

```xml
<!-- https://mvnrepository.com/artifact/org.apache.rocketmq/rocketmq-spring-boot-starter -->
<dependency>
   <groupId>org.apache.rocketmq</groupId>
   <artifactId>rocketmq-spring-boot-starter</artifactId>
   <version>2.2.1</version>
</dependency>
```

引入了这个依赖之后，就无需再引入rocketmq-client相应的依赖了。

### 外部化配置

在SpringBoot中，我们可以通过内置的配置项来改变Producer和Consumer的行为：

```yml
rocketmq:
  # 可以有多个，多个的情况使用;隔开
  name-server: 127.0.0.1:9876
  producer:
    group: my-group
    # 开启消息轨迹，消费端需要在消费者中指定
    enable-msg-trace: true
    customized-trace-topic: my-trace-topic
    # ACL功能，消费端需要在消费者中指定
    access-key: AK
    secret-key: SK
```

### 配置类

如果想要自定义更多的DefaultMQPushConsumer的其它配置，我们就需要采用如下的方式：

```java
@Slf4j
@Component
@RocketMQMessageListener(topic = "test-topic-1", consumerGroup = "my-consumer_test-topic-1")
public class MyConsumer1 implements RocketMQListener<String>, RocketMQPushConsumerLifecycleListener {
    @Override
    public void onMessage(String message) {
        log.info("received message: {}", message);
    }

    @Override
    public void prepareStart(final DefaultMQPushConsumer consumer) {
        // set consumer consume message from now
        consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_TIMESTAMP);
        	  consumer.setConsumeTimestamp(UtilAll.timeMillisToHumanString3(System.currentTimeMillis()));
    }
}
```

消费消息的时候，除了获取消息payload外，还想获取RocketMQ消息的其它系统属性，那么我们在实现RocketMQListener接口时，只需要指定泛型为MessageExt即可，这样在onMessage方法就可以接收到RocketMQ原生的MessageExt消息：

```java
@Slf4j
@Service
@RocketMQMessageListener(topic = "test-topic-1", consumerGroup = "my-consumer_test-topic-1")
public class MyConsumer2 implements RocketMQListener<MessageExt> {
    public void onMessage(MessageExt messageExt) {
        log.info("received messageExt: {}", messageExt);
    }
}
```

## 发送消息

### 发送普通消息

发送消息的示例：

```java
@Component
public class ProducerDemo implements CommandLineRunner {

    @Resource
    private RocketMQTemplate rocketMQTemplate;

    @Override
    public void run(String... args) throws Exception {
        // 同步发送消息
        rocketMQTemplate.convertAndSend("test-topic-1", "Hello, World!");
        //send spring message
        rocketMQTemplate.send("test-topic-1", MessageBuilder.withPayload("Hello, World! I'm from spring message").build());
        // 异步发送消息
        rocketMQTemplate.asyncSend("test-topic-2", new OrderPaidEvent("T_001", new BigDecimal("88.00")), new SendCallback() {
            @Override
            public void onSuccess(SendResult var1) {
                System.out.printf("async onSucess SendResult=%s %n", var1);
            }

            @Override
            public void onException(Throwable var1) {
                System.out.printf("async onException Throwable=%s %n", var1);
            }

        });

        // 发送单向消息
        rocketMQTemplate.sendOneWay("springboot-topic:tag1", "这是一条单向消息");

        // 同步顺序发送
        rocketMQTemplate.syncSendOrderly("orderly_topic", MessageBuilder.withPayload("Hello, World").build(), "hashkey");

        // 发送多条
        for (int i = 0; i < 10; i++) {
            rocketMQTemplate.sendOneWayOrderly("springboot-topic:tag1", "这是一条顺序消息" + i, "2673");
            rocketMQTemplate.sendOneWayOrderly("springboot-topic:tag1", "这是一条顺序消息" + i, "2673");
        }
        
        // 延迟发送
        // messageDelayLevel=1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h
        // 这里设置4，即30s的延迟
        Message<String> msg = new GenericMessage<>("我是一条延迟消息");
        rocketMQTemplate.asyncSend("topic-delay", msg, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                //发送成功
            }

            @Override
            public void onException(Throwable throwable) {
                //发送失败
            }
        }, 100, 4);

        //rocketMQTemplate.destroy(); // notes: 一旦rocketMQTemplate被销毁了，就无法使用它来发送消息了
    }

    @Data
    @AllArgsConstructor
    public static class OrderPaidEvent implements Serializable {
        private String orderId;

        private BigDecimal paidMoney;
    }
}
```

### 发送事务消息

发送事务消息的示例：

```java
@Component
public class TransactionProducer implements CommandLineRunner {

    @Resource
    private RocketMQTemplate rocketMQTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Build a SpringMessage for sending in transaction
        Message<String> msg = MessageBuilder.withPayload("...").build();
        // In sendMessageInTransaction(), the first parameter transaction name ("test")
        // must be same with the @RocketMQTransactionListener's member field 'transName'
        rocketMQTemplate.sendMessageInTransaction("test", msg, null);
    }

    // Define transaction listener with the annotation @RocketMQTransactionListener
    @RocketMQTransactionListener
    static class TransactionListenerImpl implements RocketMQLocalTransactionListener {
        @Override
        public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
            // ... local transaction process, return bollback, commit or unknown
            return RocketMQLocalTransactionState.UNKNOWN;
        }

        @Override
        public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
            // ... check transaction status and return bollback, commit or unknown
            return RocketMQLocalTransactionState.COMMIT;
        }
    }
}
```

## 接收消息

### 接收普通消息

接收普通消息的示例：

```java
@Component
public class ConsumerApplication{
    
    @Slf4j
    @Component
    @RocketMQMessageListener(topic = "test-topic-1", consumerGroup = "my-consumer_test-topic-1")
    public class MyConsumer1 implements RocketMQListener<String>{
        public void onMessage(String message) {
            log.info("received message: {}", message);
        }
    }
    
    @Slf4j
    @Component
    @RocketMQMessageListener(topic = "test-topic-2", consumerGroup = "my-consumer_test-topic-2")
    public class MyConsumer2 implements RocketMQListener<OrderPaidEvent>{
        public void onMessage(OrderPaidEvent orderPaidEvent) {
            log.info("received orderPaidEvent: {}", orderPaidEvent);
        }
    }
    
     /**
     * MessageModel：集群模式；广播模式
     * ConsumeMode：顺序消费；无序消费
     */
    @Component
    @RocketMQMessageListener(topic = "springboot-topic", consumerGroup = "consumer-group",
            //selectorExpression = "tag1",selectorType = SelectorType.TAG,
            messageModel = MessageModel.CLUSTERING, consumeMode = ConsumeMode.CONCURRENTLY)
    public class MessageConsumer implements RocketMQListener<String> {
        @Override
        public void onMessage(String message) {
            System.out.println("----------接收到rocketmq消息:" + message);
            // rocketmq会自动捕获异常回滚  (官方默认会重复消费16次)
            int a = 1 / 0;
        }
    }
}
```

### 接收事务消息

接收事务的示例：

```java
@Component
public class ProducerApplication implements CommandLineRunner{
    
    @Resource
    private RocketMQTemplate rocketMQTemplate;

    public void run(String... args) throws Exception {
        try {
            // Build a SpringMessage for sending in transaction
            Message msg = MessageBuilder.withPayload(..)...;
            // In sendMessageInTransaction(), the first parameter transaction name ("test")
            // must be same with the @RocketMQTransactionListener's member field 'transName'
            rocketMQTemplate.sendMessageInTransaction("test", "test-topic", msg, null);
        } catch (MQClientException e) {
            e.printStackTrace(System.out);
        }
    }

    // Define transaction listener with the annotation @RocketMQTransactionListener
    @RocketMQTransactionListener
    class TransactionListenerImpl implements RocketMQLocalTransactionListener {
          @Override
          public RocketMQLocalTransactionState executeLocalTransaction(Message msg, Object arg) {
            // ... local transaction process, return bollback, commit or unknown
            return RocketMQLocalTransactionState.UNKNOWN;
          }

          @Override
          public RocketMQLocalTransactionState checkLocalTransaction(Message msg) {
            // ... check transaction status and return bollback, commit or unknown
            return RocketMQLocalTransactionState.COMMIT;
          }
    }
}
```

# RocketMQ原理分析

RocketMQ也遵循了模块化设计，其核心模块有：

- namesrv：命名发现服务，broker 服务的管理与路由
- broker：核心组件，接收 producer发送的消息和消息的存储与consumer`的消息消费
- client：客户端实现，producer和 consumer的实现模块
- store：存储层实现，消息持久化、索引服务、高可用 HA 服务实现
- remoting：通信层实现，基于 Netty 的底层封装，服务间的交互通讯都依赖此模块
- filter：消息过滤服务，相当于在broker和consumer中间加入了一个 filter 代理
- common：模块间通用的功能类、方法、配置文件、常量等
- tools：命令管理工具，提供了消息查询、topic 管理等功能
- example：官方提供的例子，对典型的功能比如 order message，push consumer，pull consumer 的用法进行了示范

## 消息发送过程

首先创建一条即将发送的消息：

```java
Message msg = new Message("Test", "Hello World".getBytes());
```

然后定义好消息的发送者：

```java
DefaultMQProducer producer = new DefaultMQProducer();
producer.start();
```

发送消息的整体流程如下：

![image-20211107223834662](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107223834.png)

### 选择发送的路由

使用RocketMQ的时候通常我们都会使用集群部署：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107215834.png" style="zoom:67%;" />

客户端在发送消息之前首先要询问NameServer才能确定一个合适的Broker以进行消息的发送：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107215941.png" alt="image-20211107215941618" style="zoom:67%;" />

显然，所有的NameServer中的数据都是一致的，在Broker启动的时候，其会将自己在本地存储的Topic配置文件（默认位于`$HOME/store/config/topics.json`目录）中所有的Topic加载到内存中去，然后会将这些所有的Topic全部同步到所有的NameServer中，与此同时，Broker也会启动一个定时任务，默认每隔30s来执行一次Topic同步：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107220352.png" alt="image-20211107220352693" style="zoom:67%;" />

由于NameServer服务去中每台机器存储的数据都是一致的，因为客户端任意选择一台服务器进行发送即可。客户端选择NameServer的源码如下：

```java
public class NettyRemotingClient extends NettyRemotingAbstract implements RemotingClient {

    private final AtomicInteger namesrvIndex = new AtomicInteger(initValueIndex());

    private static int initValueIndex() {
        Random r = new Random();
        return Math.abs(r.nextInt() % 999) % 999;
    }

    private Channel getAndCreateNameserverChannel() throws InterruptedException {
        String addr = this.namesrvAddrChoosed.get();
        if (addr != null) {
            ChannelWrapper cw = this.channelTables.get(addr);
            if (cw != null && cw.isOK()) {
                return cw.getChannel();
            }
        }

        // ...
        
        for (int i = 0; i < addrList.size(); i++) {
            int index = this.namesrvIndex.incrementAndGet();
            index = Math.abs(index);
            index = index % addrList.size();
            String newAddr = addrList.get(index);

            this.namesrvAddrChoosed.set(newAddr);
            Channel channelNew = this.createChannel(newAddr);
            if (channelNew != null)
                return channelNew;
        }

        // ...
    }
    
}
```

以后，如果NamenamesrvAddrChoosed选择的服务器如果一直处于连接状态，那么客户端就会一直与这台服务器进行沟通。否则的话，如上源代码所示，就会自动轮询下一台可用的服务器。

在客户端发送消息的时候，其首先会尝试寻找话题路由信息，即这条消息应该被发送到哪个地方去。客户端在内存中维护了一份和Topic相关的路由信息表topicPublishInfoTable，当发送消息的时候，会首先尝试从表中获取信息。如果此表中不存在这条话题的话，那么便会从NameServer获取路由信息。

![image-20211107221722033](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107221722.png)

源码如下：

```java
public class DefaultMQProducerImpl implements MQProducerInner {

    private TopicPublishInfo tryToFindTopicPublishInfo(final String topic) {
        TopicPublishInfo topicPublishInfo = this.topicPublishInfoTable.get(topic);
        if (null == topicPublishInfo || !topicPublishInfo.ok()) {
            this.topicPublishInfoTable.putIfAbsent(topic, new TopicPublishInfo());
            this.mQClientFactory.updateTopicRouteInfoFromNameServer(topic);
            topicPublishInfo = this.topicPublishInfoTable.get(topic);
        }

        // ...
        
    }
}
```

当尝试从NameServer服务器获取路由的时候，其可能会返回两种情况：

- 新建Topic
- 已存Topic

当Topic是新建的，NameServer不存在和此Topic相关的信息：

![image-20211107222224495](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107222224.png)

Topic之前已经创建过，NameServer存在此Topic的信息：

![image-20211107222435046](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107222435.png)

服务器返回的Topic路由信息包括以下内容：

![image-20211107222558636](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107222558.png)

“Broker-1”、“Broker-2”分别为两个Broker服务器的名称，相同名称下可以有主从Broker，因此每个Broker又都有brokerId，默认情况下，BokerId如果为MixAll.Master_ID（值为0）的话，那么认为这个Broker为MASTER主机，其余位于相同名称下的Broker为这台MASTER主机的SLAVE从机。

```java
public class MQClientInstance {

    public String findBrokerAddressInPublish(final String brokerName) {
        HashMap<Long/* brokerId */, String/* address */> map = this.brokerAddrTable.get(brokerName);
        if (map != null && !map.isEmpty()) {
            return map.get(MixAll.MASTER_ID);
        }

        return null;
    }
    
}
```

每个Broker上面可以绑定多个可写消息队列和多个可读消息队列，客户端根据返回的所有Broker地址列表和每个Broker的可写消息队列列表会在内存中构建一份所有的消息队列列表。之后客户端每次发送消息，都会在消息队列列表上轮询选择队列（这里我们假设返回了两个Broker，每个Broker均又4个可写消息队列）：

![image-20211107223431720](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107223431.png)

### 向Broker发送消息

在确定了Master Broker地址和这个Broker的消息队列之后，客户端才开始真正地发送消息给这个Broker，也是从这里客户端才开始与Broker进行交互：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107223723.png" alt="image-20211107223723904" style="zoom:67%;" />

上节说到，如果Topic的信息在NameServer不存在的话，那么会使用默认的Topic信息进行消息的发送。然而一旦这条消息到来之后，Broker端还没有这个话题，所以Broker需要检查Topic的存在性：

```java
public abstract class AbstractSendMessageProcessor implements NettyRequestProcessor {

    protected RemotingCommand msgCheck(final ChannelHandlerContext ctx,
                                       final SendMessageRequestHeader requestHeader, final RemotingCommand response) {

        // ...

        TopicConfig topicConfig =
            this.brokerController
                .getTopicConfigManager()
                .selectTopicConfig(requestHeader.getTopic());
        if (null == topicConfig) {

            // ...

            topicConfig = this.brokerController
                .getTopicConfigManager()
                .createTopicInSendMessageMethod( ... );
            
        }
        
    }
    
}
```

如果Topic不存在的话，那么便会创建一个Topic信息存储到本地，并将所有Topic同步给所有的NameServer：

```java
public class TopicConfigManager extends ConfigManager {

    public TopicConfig createTopicInSendMessageMethod(final String topic, /** params **/) {
        // ...
        topicConfig = new TopicConfig(topic);
        
        this.topicConfigTable.put(topic, topicConfig);
        this.persist();

        // ...
        
        this.brokerController.registerBrokerAll(false, true);

        return topicConfig;
    }
    
}
```

Topic检查的整体的流程如下图：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107224552.png" alt="Topic检查"  />

当Broker对消息的一些字段做过一番必要的检查之后，便会存储到磁盘中去：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107223937.png" alt="消息存盘" style="zoom:67%;" />



## 消息存储过程

### 写入文件

当有一条消息过来之后，Broker首先需要做的就是确定这条消息应该存储在哪个文件里面。在RokcetMQ中，这个用来存储消息的文件被称为MappedFile。这个文件默认创建的大小为1GB。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107225625.png" alt="image-20211107225625058" style="zoom:67%;" />

一个文件为1GB大小，也即1024\*1024\*1024 = 1073741824字节，每个文件的命名是按照总的字节偏移量来命名的。例如一个第一个文件偏移量为0，那么它的名字为00000000000000000000，当这个1G文件被存储满了之后，就会创建下以恶搞文件，下一个文件的偏移量为1GB，那么它的名字为00000000001073741824，一次类推。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107230004.png" alt="image-20211107230004089" style="zoom:67%;" />

默认情况下这些消息文件位于 `$HOME/store/commitlog` 目录下，如下图所示:

![image-20211107230106222](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107230106.png)

当Broker启动的时候，其会将位于存储目录下的所有消息文件加载到一个列表中：

![image-20211107230237636](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211107230237.png)

当有新的消息到来的时候，其会默认选择列表中的最后一个文件来进行消息的保存：

```java
public class MappedFileQueue {

    public MappedFile getLastMappedFile() {
        MappedFile mappedFileLast = null;

        while (!this.mappedFiles.isEmpty()) {
            try {
                mappedFileLast = this.mappedFiles.get(this.mappedFiles.size() - 1);
                break;
            } catch (IndexOutOfBoundsException e) {
                //continue;
            } catch (Exception e) {
                log.error("getLastMappedFile has exception.", e);
                break;
            }
        }

        return mappedFileLast;
    }
    
}
```

如果这个Broker之前从未接收过消息的话，当有新的消息需要存储的时候，就需要立即创建一个MappedFile文件来存储消息。

RocketMQ提供了一个专门用来实例化MappedFile文件的服务类AllocateMappedFileService。在内存中，也同时也维护了一张请求表requestTable和一个优先级请求队列requestQueue。当需要创建文件的时候，Broker会创建一个AllocateRequest对象，其包含了文件的路径、大小等信息，然后将其存入requestTable表中，再将其放入优先级请求队列requestQueue中：

```java
public class AllocateMappedFileService extends ServiceThread {

    public MappedFile putRequestAndReturnMappedFile(String nextFilePath,
                                                    String nextNextFilePath,
                                                    int fileSize) {

        // ...

        AllocateRequest nextReq = new AllocateRequest(nextFilePath, fileSize);
        boolean nextPutOK = this.requestTable.putIfAbsent(nextFilePath, nextReq) == null;
        if (nextPutOK) {
            // ...
            boolean offerOK = this.requestQueue.offer(nextReq);
        }
        
    }
    
}
```

服务类会一直等待优先级队列是否有新的请求到来，如果有，便会从队列中取出请求，然后创建对应的MappedFile，并将请求表requestTable中AllocateRequest对象的字段mappedFile设置上值。最后将AllocateRequest对象上CountDownLatch的计数器减1，以表明此分配申请的MappedFile已经创建完毕了：

```java
public class AllocateMappedFileService extends ServiceThread {

    public void run() {
        // 一直运行
        while (!this.isStopped() && this.mmapOperation()) {
        }
    }

    private boolean mmapOperation() {
        req = this.requestQueue.take();

        if (req.getMappedFile() == null) {
            MappedFile mappedFile;
            // ...
            mappedFile = new MappedFile(req.getFilePath(), req.getFileSize());
            // 设置上值
            req.setMappedFile(mappedFile);
        }

        // ...
        // 计数器减 1
        req.getCountDownLatch().countDown();

        // ...
        return true;
    }
    
}
```

整体流程如下：

![image-20211108233122734](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211108233122.png)

等待MappedFIle创建完毕之后，其便会从请求表requestTable中取出并删除表中记录：

```java
public class AllocateMappedFileService extends ServiceThread {

    public MappedFile putRequestAndReturnMappedFile(String nextFilePath,
                                                    String nextNextFilePath,
                                                    int fileSize) {
        // ...
        AllocateRequest result = this.requestTable.get(nextFilePath);
        if (result != null) {
            // 等待 MappedFile 的创建完成
            boolean waitOK = result.getCountDownLatch().await(waitTimeOut, TimeUnit.MILLISECONDS);
            if (!waitOK) {
                return null;
            } else {
                // 从请求表中删除
                this.requestTable.remove(nextFilePath);
                return result.getMappedFile();
            }
        }
    }
    
}
```

然后再将其放到列表中去:

```java
public class MappedFileQueue {

    public MappedFile getLastMappedFile(final long startOffset, boolean needCreate) {
        MappedFile mappedFile = null;

        if (this.allocateMappedFileService != null) {
            // 创建 MappedFile
            mappedFile = this.allocateMappedFileService
                .putRequestAndReturnMappedFile(nextFilePath,
                                               nextNextFilePath,
                                               this.mappedFileSize);
        }

        if (mappedFile != null) {
            // ...
            // 添加至列表中
            this.mappedFiles.add(mappedFile);
        }

        return mappedFile;

    }
    
}
```

![image-20211108233313275](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211108233313.png)

至此，`MappedFile` 已经创建完毕，也即可以进行下一步的操作了。

在MappedFile的构造函数中，其使用了FileChannel类提供的map函数来将磁盘上的这个文件映射到进程地址空间中。然后当通过MappedByteBuffer来读入或写入文件的时候，磁盘上也会有相应的改动。采用这种方式，通常比传统的基于文件IO流的方式读取效率高。

一旦我们获取到了MappedFile文件之后，便可以往这个文件里面写入消息了。写入消息可能会遇见如下两种情况，一种是这条消息可以完全追加到这个文件中，另一种是这条消息完全不能或者只有一小部分只能存放到这个文件中，其余的需要放到新的文件中，需要分为两种情况分别讨论。

#### 文件可以完全存储消息

MappedFile类维护了一个用以标识当前写位置的指针wrotePosition，以及一个用来映射文件到进程地址空间的mappedByteBuffer：

```java
public class MappedFile extends ReferenceResource {

    protected final AtomicInteger wrotePosition = new AtomicInteger(0);
    private MappedByteBuffer mappedByteBuffer;
    
}
```

由这两个数据结构我们可以看出来，单个文件的消息写入过程其实非常简单，首先获取到这个文件的写位置，然后将消息内容追加到byteBuffer中，然后再更新写入位置。

```java
public class MappedFile extends ReferenceResource {

    public AppendMessageResult appendMessagesInner(final MessageExt messageExt, final AppendMessageCallback cb) {
        // ...
    
        int currentPos = this.wrotePosition.get();

        if (currentPos < this.fileSize) {
            ByteBuffer byteBuffer =
                writeBuffer != null ?
                writeBuffer.slice() :
                this.mappedByteBuffer.slice();

            // 更新 byteBuffer 位置
            byteBuffer.position(currentPos);

            // 写入消息内容
            // ...

            // 更新 wrotePosition 指针的位置
            this.wrotePosition.addAndGet(result.getWroteBytes());

            return result;
        }

    }
    
}
```

整体的流程图如下：

![image-20211108235023817](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211108235023.png)

#### 文件不可以完全存储消息

在写入消息之前，如果判断出文件已经满了的情况下，其会直接尝试创建一个新的MappedFile：

```java
public class CommitLog {

    public PutMessageResult putMessage(final MessageExtBrokerInner msg) {

        // 文件为空 || 文件已经满了
        if (null == mappedFile || mappedFile.isFull()) {
            mappedFile = this.mappedFileQueue.getLastMappedFile(0);
        }

        // ...
        
        result = mappedFile.appendMessage(msg, this.appendMessageCallback);
        
    }
    
}
```

如果文件未满，那么在写入之前会先计算出消息长度msgLen，然后判断这个文件剩下的空间是否有能容纳这条消息。在这个地方我们还需要介绍下每条消息的存储方式。

每条消息的存储是按照一个4字节的长度来做界限的，这个长度本身就是整个消息体的长度，当读完这整条消息体的长度之后，下一次再取出来的一个4字节的数字，便又是下一条消息的长度：

![image-20211113112431832](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211113112431.png)

围绕一条消息，还会存储许多其它内容，我们这里只需要了解前两位是4字节的长度和4字节的MAGICCODE（魔数）即可：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211113112616.png" alt="image-20211113112616916" style="zoom: 80%;" />

MAGICCODE的值可能会是：

- `CommitLog.MESSAGE_MAGIC_CODE`
- `CommitLog.BLANK_MAGIC_CODE`

当这个文件有能力容纳这条消息体的情况下，其便会存储CommitLog.MESSAGE_MAGIC_CODE值；当这个没有能力容纳这条消息的情况下，其便会存储CommitLog.BLANK_MAGIC_CODE值，所以这个MAGICCODE是用来界定这是空消息还是一条正常的消息。

```java
// CommitLog.java
class DefaultAppendMessageCallback implements AppendMessageCallback {

    // File at the end of the minimum fixed length empty
    private static final int END_FILE_MIN_BLANK_LENGTH = 4 + 4;
    
    public AppendMessageResult doAppend(final long fileFromOffset,
                                        final ByteBuffer byteBuffer,
                                        final int maxBlank,
                                        final MessageExtBrokerInner msgInner) {

        // ...
        
        if ((msgLen + END_FILE_MIN_BLANK_LENGTH) > maxBlank) {
            // ...

            // 1 TOTALSIZE
            this.msgStoreItemMemory.putInt(maxBlank);
            // 2 MAGICCODE
            this.msgStoreItemMemory.putInt(CommitLog.BLANK_MAGIC_CODE);
            // 3 The remaining space may be any value
            byteBuffer.put(this.msgStoreItemMemory.array(), 0, maxBlank);
            
            return new AppendMessageResult(AppendMessageStatus.END_OF_FILE,
                                           /** other params **/ );
        }
        
    }
    
}
```

由上述方法我们看出在这种情况下返回的结果是END_OF_FILE。当检测到这种返回结果的时候，CommitLog接着又会申请创建新的MappedFile并尝试写入消息：

![image-20211113114410647](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211113114410.png)

<div class="note info"><p>在消息文件加载的过程中，其也是通过判断MAGICCODE的类型，来判断是否继续读取下一个MappedFile来计算整体消息偏移量的。</p></div>

### 消息刷盘

当消息体追加到MappedFile以后，这条消息实际上还只是存储在内存中，因此还需要将内存中的内存刷到磁盘上才算真正的存储下来，才能确保消息不丢失。一般而言，刷盘有两种策略：异步刷盘和同步刷盘。

当配置为异步刷盘的时候，Broker会运行一个服务FlushRealTimeService用来刷新缓冲区的消息内容到磁盘，这个服务使用一个独立的线程来做刷盘这件事情，默认情况下每隔500ms来检查一次是否需要刷盘：

```java
class FlushRealTimeService extends FlushCommitLogService {

    public void run() {

        // 不停运行
        while (!this.isStopped()) {

            // interval 默认值是 500ms
            if (flushCommitLogTimed) {
                Thread.sleep(interval);
            } else {
                this.waitForRunning(interval);
            }

            // 刷盘
            CommitLog.this.mappedFileQueue.flush(flushPhysicQueueLeastPages);

        }
        
    }
    
}
```

在追加消息完毕之后，通过唤醒这个服务立即检查以下是否需要刷盘：

```java
public class CommitLog {

    public void handleDiskFlush(AppendMessageResult result,
                                PutMessageResult putMessageResult,
                                MessageExt messageExt) {
        // Synchronization flush
        if (FlushDiskType.SYNC_FLUSH == this.defaultMessageStore.getMessageStoreConfig().getFlushDiskType()) {
            // ...
        }
        // Asynchronous flush
        else {
            if (!this.defaultMessageStore.getMessageStoreConfig().isTransientStorePoolEnable()) {
                // 消息追加成功后，立即唤醒服务
                flushCommitLogService.wakeup();
            } else {
                // ...
            }
        }
    }
    
}
```

当配置为同步刷盘策略的时候，Broker运行一个叫做GroupCommitService服务。在这个服务内部维护了写请求队列和一个读请求队列，其中这两个队列每隔10ms就交换一下“身份”，这么做的目的就是为了读写分离：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211108235940.png" alt="image-20211108235940275" style="zoom:67%;" />

在这个服务内部，每隔10ms就会检查读请求队列是否不为空，如果不为空，则会将读队列中的所有请求执行刷盘，并清空读请求队列：

```java
class GroupCommitService extends FlushCommitLogService {

    private void doCommit() {
        // 检查所有读队列中的请求
        for (GroupCommitRequest req : this.requestsRead) {
            // 每个请求执行刷盘
            CommitLog.this.mappedFileQueue.flush(0);
            req.wakeupCustomer(flushOK);
        }

        this.requestsRead.clear();
    }
    
}
```

在追加消息完毕之后，通常创建一个请求刷盘的对象，然后通过putRequest()方法放入写请求队列中，这个时候会立即唤醒这个服务，写队列和读队列的角色会进行交换，交换角色之后，读请求队列就不为空，继而可以执行所有刷盘请求了。而在这期间，Broker会一直阻塞等待最多5秒钟，在这期间如果完不成刷盘请求的话，那么视作刷盘超时：

```java
public class CommitLog {

    public void handleDiskFlush(AppendMessageResult result,
                                PutMessageResult putMessageResult,
                                MessageExt messageExt) {
        // Synchronization flush
        if (FlushDiskType.SYNC_FLUSH == this.defaultMessageStore.getMessageStoreConfig().getFlushDiskType()) {
            // ...
            if (messageExt.isWaitStoreMsgOK()) {
                GroupCommitRequest request = new GroupCommitRequest(result.getWroteOffset() + result.getWroteBytes());
                service.putRequest(request);
                // 等待刷盘成功
                boolean flushOK = request.waitForFlush(this.defaultMessageStore.getMessageStoreConfig().getSyncFlushTimeout());
                if (!flushOK) {
                    // 刷盘超时
                    putMessageResult.setPutMessageStatus(PutMessageStatus.FLUSH_DISK_TIMEOUT);
                }
            } else {
                // ...
            }
        }
        // Asynchronous flush
        else {
            // ...
        }
    }
    
}
```

通过方法 `putRequest` 放入请求后的服务执行流程：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211109234713.png" alt="image-20211109234713144" style="zoom:67%;" />

这里我们已经知道消息刷盘有同步刷盘和异步刷盘策略，对应的是GroupCommitService和FlushRealTimeService这两种不同的服务。这两种服务都有定时请求刷盘的机制，但是机制背后最终调用的方式都是flush方法：

```java
public class MappedFileQueue {

    public boolean flush(final int flushLeastPages) {
        // ...
    }
    
}
```

再继续向下分析这个方法之前，我们先对照这这张图说明一下使用MappedByteBuffer来简要阐述读和写文件的简单过程：

![image-20211109235137409](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211109235137.png)

操作系统为了能够使多个进程同时使用内存，又保证各个进程访问内存互相独立，于是为每个进程引入了地址空间的概念，地址空间上的地址叫做虚拟地址，而程序想要运行必须放到物理地址上运行才可以。地址空间为进程营造了一种假象：“整台计算机只有我一个程序在运行，这台计算机内存很大”。一个地址空间内包含这个进程所需要的全部状态信息。通常一个进程的地址空间会按照逻辑分为好多段，比如代码段、堆段、栈段等。为了进一步有效利用内存，每一段又细分成了不同的页（Page）。与此相对对应，计算机的物理内存被切成了页帧（page frame），文件被分成了不同的页（Page）。与此相对应，计算机的物理内存被切成了页帧（Page frame），文件被分成了块（block）。既然程序实际运行的时候还是得依赖物理内存的地址，那么就需要将虚拟地址转换为物理地址，这个映射关系是由**页表（Page table）\*\*来完成的。

另外在操作系统中，还有一层磁盘缓存（disk cache）的概念，它主要是用来减少对磁盘的I/O操作。磁盘缓存是以页为单位的，内容就是磁盘上的物理块，所以又称为页缓存（Page chae）。当进程发起一个读操作（比如，进行发起了一个read()系统调用），它首先会检查需要的数据是否在页缓存中。如果在，则放弃访问磁盘，而直接从页缓存中读取。如果数据没有在缓存中，那么内核必须调度块I/O操作从磁盘去读取数据，然后将读来的数据放入页缓冲中。系统并不一定要将整个文件都缓存，它可以只存储一个文件的一页或者几页。

如图所示，当调用FileChannel.map()方法的时候，会将这个文件映射进用户空间的地址空间中，注意，建立映射不会拷贝任何数据。我们前面提到过Broker启动的时候会有一个消息文件加载的过程，当第一次开始读取数据的时候：

```java
// 首次读取数据
int totalSize = byteBuffer.getInt();
```

这个时候，操作系统通过查询页表，会发现文件的这部分数据还不在内存中。于是就会触发一个缺页异常（page faults），这个时候操作系统会开始从磁盘读取这一页数据，然后放入到页缓存中，然后再放入内存中。在第一次读取文件的时候，操作系统会读入所请求的页面，并读入紧随其后的少数几个页面（不少于一个页面，通常是三个页面），这时的预读称为同步预读（如下图所示，红色部分是需要读取的页面，蓝色的那三个框是操作系统预先读取的）：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211111233553.png" alt="image-20211111233552919" style="zoom:67%;" />

当随着时间推移，预读命中的话，那么相应的预读页面数量也会增加，但是能够确认的是，一个文件至少有4个页面处于页缓存中。当文件一直处于顺序读取的情况下，那么基本上可以保证每次预读命中：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211111233846.png" alt="image-20211111233846690" style="zoom:67%;" />

下面我们来说文件写，正常情况下，当尝试调用writeInt()写数据到文件里面的话，其写到页缓存层，这个方法就会返回了，这个时候数据还没有真正的保存到文件中去，Linux仅仅将页缓存中的这一页数据标记为“脏”，并且被加入到脏页链表中，然后由一群进程（flusher回写进程）周期性将脏页链表中的页写到磁盘，从而让磁盘中的数据和内存中保持一致，最后清理“脏”标识。在以下三种情况下，脏页会被写回磁盘：

- 空闲内存低于一个特定阈值
- 脏页在内存中驻留超过一个特定的阈值时
- 当用户进程调用sync()和fsync系统调用时

可见，在正常情况下，即使不采用刷盘策略，数据最终也是会被同步到磁盘中去的：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211111234937.png" alt="image-20211111234937867" style="zoom:67%;" />

但是，即便由flusher线程来定时同步数据，如果此时机器断电的话，消息依然有可能丢失。RocketMQ为了保证消息尽可能的不丢失，为了最大的高可靠性，做了同步和异步刷盘策略，来手动进行同步：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211111235132.png" alt="image-20211111235132052" style="zoom:67%;" />

在理解了消息刷盘背后的一些机制和理念后，我们再来分析刷盘的整个过程。首先，无论同步刷盘还是异步刷盘，其线程都在一直周期性的尝试执行刷盘，在真正执行刷盘函数的调用之前，Broker会检查文件的写位置是否大于flush位置，避免执行无意义的刷盘：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211111235433.png" alt="image-20211111235433232" style="zoom:67%;" />

其次，对于异步刷盘来讲，Broker执行了更为严格的刷盘限制策略，当在某个时间点尝试执行刷盘之后，在接下来10秒内，如果想要继刷盘，那么脏页面数量必须不小于4页，如下图所示：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211111235602.png" alt="image-20211111235602869" style="zoom:67%;" />

下面时执行刷盘前最后检查的刷盘条件：

```java
public class MappedFile extends ReferenceResource {

    private boolean isAbleToFlush(final int flushLeastPages) {
        int flush = this.flushedPosition.get();
        int write = getReadPosition();

        if (this.isFull()) {
            return true;
        }

        if (flushLeastPages > 0) {
            // 计算当前脏页面算法
            return ((write / OS_PAGE_SIZE) - (flush / OS_PAGE_SIZE)) >= flushLeastPages;
        }

        // wrotePosition > flushedPosition
        return write > flush;
    }
    
}
```

当刷盘完毕之后，首先会更新这个文件的flush位置，然后再更新MappedFileQueue的整体的flush位置：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211111235758.png" alt="image-20211111235758236" style="zoom:67%;" />

当刷盘完毕之后，便会将结果通知给客户端，告知发送消息成功，至此，整个存储过程完毕。

## 消息接收过程

### 消费者注册

生产者负责往服务器Broker发送消息，消费者则从Broker获取消息。消费者获取消息采用的订阅者模式，即消费者客户端可以订阅一个或者多个Topic来消费消息：

```java
public class Consumer {

    public static void main(String[] args) throws InterruptedException, MQClientException {
        /*
         * 订阅一个或者多个Topic
         */
        consumer.subscribe("TopicTest", "*");
    }
}
```

当消费者客户端启动以后，其会每隔30s从命名服务器查询一次用户订阅的所有topic路由信息：

```java
public class MQClientInstance {

    private void startScheduledTask() {
        this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {
                @Override
                public void run() {
                    // 从命名服务器拉取话题信息
                    MQClientInstance.this.updateTopicRouteInfoFromNameServer();
                }
            }, 10, this.clientConfig.getPollNameServerInterval(), TimeUnit.MILLISECONDS);
    }
    
}
```

前面我们提到过，RocketMQ在发送消息的时候，每条消息会以轮询的方式均衡地分发到不同Broker的不同队列去。因此，消费者客户端从服务器获取下来的便是Topic的所有消息队列：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211113115530.png" alt="image-20211113115530436" style="zoom:67%;" />

在获取话题路由信息的时候，客户端还会将Topic的路由信息中所有Broker地址保存到本地：

```java
public class MQClientInstance {

    public boolean updateTopicRouteInfoFromNameServer(final String topic,
                                                      boolean isDefault,
                                                      DefaultMQProducer defaultMQProducer) {

        // ...
        
        if (changed) {
            TopicRouteData cloneTopicRouteData = topicRouteData.cloneTopicRouteData();

            // 更新 Broker 地址列表
            for (BrokerData bd : topicRouteData.getBrokerDatas()) {
                this.brokerAddrTable.put(bd.getBrokerName(), bd.getBrokerAddrs());
            }

            return true;
        }

        // ...
    }
    
}
```

当消费者客户端获取到了Broker地址列表之后，其便会每隔30s给服务器发送一条心跳数据包，告知所有Broker服务器这台消费者客户端的存在。在每次发送心跳包的同时，其数据包内还会捎带这个客户端消息订阅的一些组信息，比如用户订阅了哪些topic等，与此相对应，每台Broker服务器会在内存中维护一份当前所有的消费者客户端列表信息：

```java
public class ConsumerManager {
 
    private final ConcurrentMap<String/* Group */, ConsumerGroupInfo> consumerTable =
        new ConcurrentHashMap<String, ConsumerGroupInfo>(1024);
    
}
```

消费者客户端与 Broker 服务器进行沟通的整体流程如下图所示：

![image-20211113120120162](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211113120120.png)

### 消息队列

我们知道无论发送消息还是接收消息都需要指定消息的topic，然后实际上消息在Broker服务器上并不是以topic为单位进行存储的，而是采用了比topic更细粒度的队列来进行存储的。当发送了10条相同topic的消息，这10条topic可能存储在了不同的Broker服务器的不同的队列中，因此，RokcetMQ管理消息的单位不是topic，而是队列。

当我们讨论消息队列负载均衡的时候，就是在讨论服务器端的所有队列如何给所有消费者消费的问题。在RocketMQ中，客户端有两种消费模式，一种是广播模式，另一种是集群模式。

我们现在假设总共有两台Broker服务器，假设用户使用Producer已经发送了8条消息，这8条消息现在均衡的分布在两台Broker服务器的8个队列中，每个队列中有一个消息。现在有3台都订阅了Test topic的消费者实例，我们来看在不同消费模式下，不同的消费者会收到那几条消息。

#### 广播模式

广播模式是指所有消息队列中的消息都会广播给所有的消费者客户端，如下图所示，每一个消费者都能收到这8条消息：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114125450.png" alt="image-20211114125450124" style="zoom:67%;" />

#### 集群模式

集群模式是指所有的消息队列会按照某种分配策略来分配给不同的消费者客户端，比如消费者A消费前3个队列中的消息，消费者B消费中间3个队列中的消息等等。RocketMQ为我们提供了三个比较重要的消息队列分配策略：

- 平均分配策略
- 平均分配轮询策略
- 一致性哈希策略

##### 平均分配策略

在平均分配策略下，三个消费者的消费情况如下所示：

- Consumer-1消费前3个消息队列中的消息
- Consumer-2消费中间3个消息队列中的消息
- Consumer-3消费最后2个消息队列中的消息

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114130108.png" alt="image-20211114130108058" style="zoom:67%;" />

##### 平均分配轮询策略

平均分配轮询策略下，三个消费者的消费情况如下所示：

- Consumer-1消费1、4、7消息队列中的消息
- Consumer-2消费2、5、8消息队列中的消息
- Consumer-3消费3、6消息队列中的消息

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114130507.png" alt="image-20211114130506983" style="zoom:67%;" />

##### 一致性哈希策略

一致性哈希算法是根据这三台消费者各自的某个有代表性的属性（我们假设就是客户端ID）来计算出Hash值，此处为了减少由于哈希函数选取不理想的情况，RocketMQ算法对于每个消费者通过在客户端ID后面添加1、2、3索引来使每一个消费者多生成几个哈希值。那么现在我们需要哈希的就是九个字符串：

- Consumer-1-1
- Consumer-1-2
- Consumer-1-3
- Consumer-2-1
- Consumer-2-2
- Consumer-2-3
- Consumer-3-1
- Consumer-3-2
- Consumer-3-3

计算完这9个哈希值以后，我们按照从到大的顺序来排列成一个环（如图所示）。这个时候我们需要对这个8个消息队列也计算一下哈希值，当哈希值落在两个圈之间的时候，我们就选取沿着环的方向的那个结点作为这个消息队列的消费者。如下图所示（注意：图只是示例，并非真正的消费情况）：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114131458.png" alt="image-20211114131458279" style="zoom:67%;" />

消息队列的负载均衡是由一个不停运行的均衡服务来定时执行的：

```java
public class RebalanceService extends ServiceThread {
    // 默认 20 秒一次
    private static long waitInterval =
        Long.parseLong(System.getProperty("rocketmq.client.rebalance.waitInterval", "20000"));

    @Override
    public void run() {
        while (!this.isStopped()) {
            this.waitForRunning(waitInterval);
            // 重新执行消息队列的负载均衡
            this.mqClientFactory.doRebalance();
        }
    }

}
```

在广播模式下，当前这台消费者消费和Topic相关的所有消息队列，而集群模式会先按照某种分配策略来进行消息队列的分配，得到的结果就是当前这台消费者需要消费的消息队列：

```java
public abstract class RebalanceImpl {

    private void rebalanceByTopic(final String topic, final boolean isOrder) {
        switch (messageModel) {
            // 广播模式
        case BROADCASTING: {
            // 消费这个话题的所有消息队列
            Set<MessageQueue> mqSet = this.topicSubscribeInfoTable.get(topic);
            if (mqSet != null) {
                // ...
            }
            break;
        }
            // 集群模式
        case CLUSTERING: {
            // ...

            // 按照某种负载均衡策略进行消息队列和消费客户端之间的分配
            // allocateResult 就是当前这台消费者被分配到的消息队列
            allocateResult = strategy.allocate(
                                               this.consumerGroup,
                                               this.mQClientFactory.getClientId(),
                                               mqAll,
                                               cidAll);

            // ...
            }
            break;
        }

    }
    
}
```

### Broker消费队列

我们再来看Broker服务器端，首先我们应该知道，消息往Broker存储就是在向CommitLog消息文件中写入数据的一个过程。在Broker启动过程中，其会启动一个叫做ReputMessageService的服务，这个服务每隔1秒就会检查一下这个CommitLog是否有新的数据写入。ReputMessageService自身维护了一个偏移量reputFromOffset，用以对比和CommitLog文件中的消息总偏移量的差距。当这两个偏移量不同的时候，就代表有新的消息到来了：

```java
class ReputMessageService extends ServiceThread {

    private volatile long reputFromOffset = 0;

    private boolean isCommitLogAvailable() {
        // 看当前有没有新的消息到来
        return this.reputFromOffset < DefaultMessageStore.this.commitLog.getMaxOffset();
    }

    @Override
    public void run() {
        while (!this.isStopped()) {
            try {
                Thread.sleep(1);
                this.doReput();
            } catch (Exception e) {
                DefaultMessageStore.log.warn(this.getServiceName() + " service has exception. ", e);
            }
        }
    }
    
}
```

在有新的消息到来之后，doReput函数会取出新到来的所有消息，每一条消息都会封装为一个DispatchRequest请求，进行将这条请求分发给不同的请求消费者，这里我们只关注利用消息创建消息队列的服务CommitLogDispatcherBuildConsumeQueue：

```java
class ReputMessageService extends ServiceThread {

    // ... 部分代码有删减
    private void doReput() {
        SelectMappedBufferResult result = DefaultMessageStore.this.commitLog.getData(reputFromOffset);
        if (result != null) {
            this.reputFromOffset = result.getStartOffset();

            for (int readSize = 0; readSize < result.getSize() && doNext; ) {
                // 读取一条消息，然后封装为 DispatchRequest
                DispatchRequest dispatchRequest =
                    DefaultMessageStore.this.commitLog.checkMessageAndReturnSize(result.getByteBuffer(), false, false);
                int size = dispatchRequest.getMsgSize();

                if (dispatchRequest.isSuccess()) {
                    // 分发这个 DispatchRequest 请求
                    DefaultMessageStore.this.doDispatch(dispatchRequest);
                    this.reputFromOffset += size;
                    readSize += size;
                }

                // ...
            }
        }
    }

}
```

CommitLogDispatcherBuildConsumeQueue服务会根据这条请求按照不同的队列ID创建不同的消费队列文件，并在内存中维护一份消费队列列表。然后将DispatchRequest请求中这条消息的消息偏移量、消息大小以及消息在发送的时候附带的标签的哈希值写入到相应的消费队列文件中去。

寻找消费队列的代码如下：

```java
public class DefaultMessageStore implements MessageStore {

    private final ConcurrentMap<String/* topic */, ConcurrentMap<Integer/* queueId */, ConsumeQueue>> consumeQueueTable;
    
    public void putMessagePositionInfo(DispatchRequest dispatchRequest) {
        ConsumeQueue cq = this.findConsumeQueue(dispatchRequest.getTopic(), dispatchRequest.getQueueId());
        cq.putMessagePositionInfoWrapper(dispatchRequest);
    }
    
}
```

向消费队列文件中存储数据的代码如下：

```java
public class ConsumeQueue {

    private boolean putMessagePositionInfo(final long offset, final int size, final long tagsCode,
                                           final long cqOffset) {

        // 存储偏移量、大小、标签码
        this.byteBufferIndex.flip();
        this.byteBufferIndex.limit(CQ_STORE_UNIT_SIZE);
        this.byteBufferIndex.putLong(offset);
        this.byteBufferIndex.putInt(size);
        this.byteBufferIndex.putLong(tagsCode);

        // 获取消费队列文件
        final long expectLogicOffset = cqOffset * CQ_STORE_UNIT_SIZE;
        MappedFile mappedFile = this.mappedFileQueue.getLastMappedFile(expectLogicOffset);
        
        if (mappedFile != null) {
            // ...
            return mappedFile.appendMessage(this.byteBufferIndex.array());
        }
        return false;
    }
    
}
```

以上阐述了消费队列创建并存储消息的一个过程，但是消费队列中的消息是需要持久化到磁盘中去的。持久化的过程是通过后台服务FlushConsumeQueueService来定时持久化的：

```java
class FlushConsumeQueueService extends ServiceThread {

    private void doFlush(int retryTimes) {
        // ...
        ConcurrentMap<String, ConcurrentMap<Integer, ConsumeQueue>> tables = DefaultMessageStore.this.consumeQueueTable;
        for (ConcurrentMap<Integer, ConsumeQueue> maps : tables.values()) {
            for (ConsumeQueue cq : maps.values()) {
                boolean result = false;
                for (int i = 0; i < retryTimes && !result; i++) {
                    // 刷新到磁盘
                    result = cq.flush(flushConsumeQueueLeastPages);
                }
            }
        }
        // ...
    }

}
```

上述过程体现在磁盘文件的变化如下图所示，commitLog文件夹下面存放的是完整的消息，来一条消息，向文件中追加一条消息。同时，根据这一条消息属于TopicTest Topic下的哪一个队列，又会往相应的consumequeue文件下的相应消费队列文件中追加消息的偏移量、消息大小和标签码：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114151056.png" alt="image-20211114151056635" style="zoom:67%;" />

总流程图如下所示：

![image-20211114151123921](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114151124.png)

Broker服务器存储了各个消息队列，客户端需要消费每隔消费队列中的消息。消费模式的不同，每个客户端所消费的消息队列也不同，那么客户端如何记录自己所消费得队列消费到哪里了呢？答案就是消费队列偏移量。

针对同一个Topic，在集群模式下，由于每个客户端所消费的消息队列不同，所以每个消息队列已经消费到哪里的消费偏移量是记录在Broker服务器端的。而在广播模式下，由于每个客户端分配消费这个Topic的所有消息队列，所以每个消息队列已经消费到哪里的消费偏移量是记录在客户端本地的。

下面分别讲述两种模式下偏移量是如何获取和更新的。

#### 集群模式

在集群模式下，消费者客户端在内存中维护了一个offsetTable表：

```java
public class RemoteBrokerOffsetStore implements OffsetStore {

    private ConcurrentMap<MessageQueue, AtomicLong> offsetTable =
        new ConcurrentHashMap<MessageQueue, AtomicLong>();
    
}
```

同样在Broker服务器端也维护了一个偏移量表：

```java
public class ConsumerOffsetManager extends ConfigManager {

    private ConcurrentMap<String/* topic@group */, ConcurrentMap<Integer, Long>> offsetTable =
        new ConcurrentHashMap<String, ConcurrentMap<Integer, Long>>(512);
    
}
```

在消费者客户端，RebalanceService服务会定时地（默认20秒）从Broker服务器获取当前客户端所需要消费的消息队列，并于当前消费客户端的消费队列进行对比，看是否有变化。对于每个消费队列，会从Broker服务器查询这个队列当前的消费偏移量。然后根据这几个消费队列，创建对应的拉取请求PullRequest准备从Broker服务器拉取消息，如下图所示：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114152641.png" alt="image-20211114152641194" style="zoom:67%;" />

当从Broker服务器拉取下来消息以后，只有当用户成功消费的时候，才会更新本地的偏移量表。本地的偏移量表再通过定时服务每隔5s同步到Broker服务器端：

```java
public class MQClientInstance {

    private void startScheduledTask() {

        this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {
                @Override
                public void run() {
                    MQClientInstance.this.persistAllConsumerOffset();
                }
            }, 1000 * 10, this.clientConfig.getPersistConsumerOffsetInterval(), TimeUnit.MILLISECONDS);
        
    }
    
}
```

而维护在 Broker 服务器端的偏移量表也会每隔 5 秒钟序列化到磁盘中:

```java
public class BrokerController {

    public boolean initialize() throws CloneNotSupportedException {
        this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {
                @Override
                public void run() {
                    BrokerController.this.consumerOffsetManager.persist();
                }
            }, 1000 * 10, this.brokerConfig.getFlushConsumerOffsetInterval(), TimeUnit.MILLISECONDS);
    }
    
}
```

保存的格式如下：

![](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114152848.png)

上述整体流程如下所示，红框框住的是这个Topic下面的队列的id，箭头指向的分别是每个队列的消费偏移量：

![](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114153026.png)

#### 广播模式

对于广播模式而言，每个消费队列的偏移量肯定不能存储在Broker服务器端，因为多个消费者对于同一个队列的消费可能是不一致的，偏移量会互相覆盖掉。因此，在广播模式下，每个客户端的消费偏移量是存储在本地的，然后每隔5将内存中的offsetTable持久化到磁盘中。当首次从服务器获取可消费队列的时候，偏移量不像集群模式下是从Broker服务器读取的，而是直接从本地文件读取的：

```java
public class LocalFileOffsetStore implements OffsetStore {

    @Override
    public long readOffset(final MessageQueue mq, final ReadOffsetType type) {
        if (mq != null) {
            switch (type) {
             case READ_FROM_STORE: {
                // 本地读取
                offsetSerializeWrapper = this.readLocalOffset();
                // ...
            }
            }
        }
        // ...
    }
    
}
```

![image-20211114163325520](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114163325.png)

当消息消费成功后，偏移量的更新也是持久化到本地，而非更新到Broker服务器中。在广播模式下，消息队列的偏移量默认是放在用户目录下的.rocketmq_offsets目录下：

```java
public class LocalFileOffsetStore implements OffsetStore {

    @Override
    public void persistAll(Set<MessageQueue> mqs) {
        // ...
        String jsonString = offsetSerializeWrapper.toJson(true);
        MixAll.string2File(jsonString, this.storePath);
        // ...
    }
    
}
```

存储格式如下：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114163639.png" alt="image-20211114163638987" style="zoom:67%;" />

简要流程如下：

![image-20211114163703851](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114163703.png)

### 消费消息

RocketMQ在客户端运行着一个专门用来拉取消息的后台服务PullMessageService，其接受每个队列创建PullRequest拉取消息请求，然后拉取消息：

```java
public class PullMessageService extends ServiceThread {

    @Override
    public void run() {
        while (!this.isStopped()) {
            PullRequest pullRequest = this.pullRequestQueue.take();
            if (pullRequest != null) {
                this.pullMessage(pullRequest);
            }
        }
    }
    
}
```

每一个PullRequest都关联着一个MessageQueue和一个ProcessQueue，在ProcessQueue的内部还维护了一个用来等待用户消费的消息树，如下代码所示：

```java
public class PullRequest {

    private MessageQueue messageQueue;
    private ProcessQueue processQueue;
    
}

public class ProcessQueue {

    private final TreeMap<Long, MessageExt> msgTreeMap = new TreeMap<Long, MessageExt>();
    
}
```

当真正尝试拉取消息之前，其会检查当前请求的内部缓存的消息数量、消息大小、消息阈值跨度是否超过了某个阈值，如果超过某个阈值，则推迟50毫秒重新执行这个请求：

```java
public class DefaultMQPushConsumerImpl implements MQConsumerInner {
    
    public void pullMessage(final PullRequest pullRequest) {
        // ...
    
        final ProcessQueue processQueue = pullRequest.getProcessQueue();
        long cachedMessageCount = processQueue.getMsgCount().get();
        long cachedMessageSizeInMiB = processQueue.getMsgSize().get() / (1024 * 1024);

        // 缓存消息数量阈值，默认为 1000
        if (cachedMessageCount > this.defaultMQPushConsumer.getPullThresholdForQueue()) {
            this.executePullRequestLater(pullRequest, PULL_TIME_DELAY_MILLS_WHEN_FLOW_CONTROL);
            return;
        }

        // 缓存消息大小阈值，默认为 100 MB
        if (cachedMessageSizeInMiB > this.defaultMQPushConsumer.getPullThresholdSizeForQueue()) {
            this.executePullRequestLater(pullRequest, PULL_TIME_DELAY_MILLS_WHEN_FLOW_CONTROL);
            return;
        }

        if (!this.consumeOrderly) {
            // 最小偏移量和最大偏移量的阈值跨度，默认为 2000 偏移量，消费速度不能太慢
            if (processQueue.getMaxSpan() > this.defaultMQPushConsumer.getConsumeConcurrentlyMaxSpan()) {
                this.executePullRequestLater(pullRequest, PULL_TIME_DELAY_MILLS_WHEN_FLOW_CONTROL);
                return;
            }
        }

        // ...
    }
    
}
```

当执行完一些必要的检查之后，客户端会将用户指定的过滤信息以及一些其它必要消费字段封装到请求信息体中，然后才开始从Broker服务器拉取这个请求从当前偏移量开始的消息，默认一次性最多拉取32条，服务器返回的响应会告诉客户端这个队列下次开始拉取时的偏移量。客户端每次都会注册一个PullCallback回调，用以接收服务器返回的响应信息，根据响应信息的不同状态信息，然后修正这个请求的偏移量，并进行下次请求：

```java
public void pullMessage(final PullRequest pullRequest) {
    PullCallback pullCallback = new PullCallback() {
            @Override
            public void onSuccess(PullResult pullResult) {
                if (pullResult != null) {
                    // ...
                    switch (pullResult.getPullStatus()) {
                    case FOUND:
                        // ...
                        break;
                        
                    case NO_NEW_MSG:
                        // ...
                        break;
                        
                    case NO_MATCHED_MSG:
                        // ...
                        break;
                        
                    case OFFSET_ILLEGAL:
                        // ...
                        break;
                        
                    default:
                        break;
                    }
                }
            }

            @Override
            public void onException(Throwable e) {
                // ...
            }
        };

}
```

上述是客户端拉取消息时的一些机制，现在再说一下Broker服务器端于此相对应的逻辑。

服务器在收到客户端的请求之后，会根据Topic和队列ID定位到对应的消费队列。然后根据这条请求传入的offset消费队列偏移量，定位到对应的消费队列文件。偏移量指定的是消费队列文件的消费下限，而最大上限是由如下算法来进行约束的：

```java
final int maxFilterMessageCount = Math.max(16000, maxMsgNums * ConsumeQueue.CQ_STORE_UNIT_SIZE);
```

有了上限和下限，客户端便会开始从消费队列文件中取出每个消息的偏移量和消息大小，然后再根据这两个值去CommitLog文件中寻找相应的完整的消息，并添加到最后的消息队列中，精简过的代码如下所示：

```java
public class DefaultMessageStore implements MessageStore {

    public GetMessageResult getMessage(final String group, final String topic, final int queueId, final long offset,
                                       final int maxMsgNums,
                                       final MessageFilter messageFilter) {
        // ...
        ConsumeQueue consumeQueue = findConsumeQueue(topic, queueId);
    
        if (consumeQueue != null) {
            // 首先根据消费队列的偏移量定位消费队列
            SelectMappedBufferResult bufferConsumeQueue = consumeQueue.getIndexBuffer(offset);
            if (bufferConsumeQueue != null) {
                try {
                    status = GetMessageStatus.NO_MATCHED_MESSAGE;

                    // 最大消息长度
                    final int maxFilterMessageCount = Math.max(16000, maxMsgNums * ConsumeQueue.CQ_STORE_UNIT_SIZE);
                    // 取消息
                    for (; i < bufferConsumeQueue.getSize() && i < maxFilterMessageCount; i += ConsumeQueue.CQ_STORE_UNIT_SIZE) {
                        long offsetPy = bufferConsumeQueue.getByteBuffer().getLong();
                        int sizePy = bufferConsumeQueue.getByteBuffer().getInt();

                        // 根据消息的偏移量和消息的大小从 CommitLog 文件中取出一条消息
                        SelectMappedBufferResult selectResult = this.commitLog.getMessage(offsetPy, sizePy);
                        getResult.addMessage(selectResult);
                        
                        status = GetMessageStatus.FOUND;
                    }

                    // 增加下次开始的偏移量
                    nextBeginOffset = offset + (i / ConsumeQueue.CQ_STORE_UNIT_SIZE);
                } finally {
                    bufferConsumeQueue.release();
                }
            }
        }
        // ...
    }
    
}
```

客户端和 Broker 服务器端完整拉取消息的流程图如下所示：

![image-20211114170044849](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114170044.png)

根据用户指定的消息回调函数的不同，消息的消费方式可以分为两种：并发消费和有序消费。

并发消费没有考虑消息发送的顺序，客户端从服务器获取消息就会直接回调给用户。而有序消费会考虑每个队列消息发送的顺序，注意此处并不是每个Topic消息发送的顺序，一定要记住RocketMQ控制消息的最细粒度是消息队列。当我们讲有序消费的时候，就是在说对于某个Topic的某个队列，发往这个队列的消息，客户端接收消息的顺序与发送的顺序完全一致。

#### 并发消费

当用户注册消息回调类的时候，如果注册的是MessageListenerConcurrently回调类，那么就认为用户不关心消息的顺序问题。上文提到，每个PullRequest都关联了一个处理队列ProcessQueue，而每个处理队列又都关联了一颗消息树msgTreeMap。当客户端拉取到新的消息以后，其先将消息放入到这个请求所关联的处理队列的消息树中，然后提交一个消息消费请求，用以回调用户端的代码消费消息：

```java
public class DefaultMQPushConsumerImpl implements MQConsumerInner {

    public void pullMessage(final PullRequest pullRequest) {
        PullCallback pullCallback = new PullCallback() {
                @Override
                public void onSuccess(PullResult pullResult) {
                    if (pullResult != null) {
                        switch (pullResult.getPullStatus()) {
                        case FOUND:
                            // 消息放入处理队列的消息树中
                            boolean dispathToConsume = processQueue
                                .putMessage(pullResult.getMsgFoundList());

                            // 提交一个消息消费请求
                            DefaultMQPushConsumerImpl.this
                                .consumeMessageService
                                .submitConsumeRequest(
                                                      pullResult.getMsgFoundList(),
                                                      processQueue,
                                                      pullRequest.getMessageQueue(),
                                                      dispathToConsume);
                            break;
                        }
                    }
                }

            };

    }
    
}
```

当提交一个消息消费请求后，对于并发消费，其实现如下:

```java
public class ConsumeMessageConcurrentlyService implements ConsumeMessageService {

    class ConsumeRequest implements Runnable {

        @Override
        public void run() {
            // ...
            status = listener.consumeMessage(Collections.unmodifiableList(msgs), context);
            // ...
        }

    }
    
}
```

我们可以看到msgs是直接从服务器端拿到的最新消息，直接喂给了客户端进行消费，并未做任何有序处理。当消费成功后，会从消息树中将这些消息再给删除掉：

```java
public class ConsumeMessageConcurrentlyService implements ConsumeMessageService {

    public void processConsumeResult(final ConsumeConcurrentlyStatus status, /** 其它参数 **/) {
        // 从消息树中删除消息
        long offset = consumeRequest.getProcessQueue().removeMessage(consumeRequest.getMsgs());
        if (offset >= 0 && !consumeRequest.getProcessQueue().isDropped()) {
            this.defaultMQPushConsumerImpl.getOffsetStore()
                .updateOffset(consumeRequest.getMessageQueue(), offset, true);
        }
    }
    
}
```

![image-20211114171439076](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114171439.png)

#### 有序消费

RocketMQ的有序消费主要依靠两把锁，一把是维护在Broker端，一把维护在消费者客户端。Broker端有一个RebalanceLockManager服务，其内部维护了一个mqLockTable消息队列锁表：

```java
public class RebalanceLockManager {

    private final ConcurrentMap<String/* group */, ConcurrentHashMap<MessageQueue, LockEntry>> mqLockTable =
        new ConcurrentHashMap<String, ConcurrentHashMap<MessageQueue, LockEntry>>(1024);
    
}
```

在有序消费的时候，Broekr需要确保任何一个队列在任何时候都只有一个客户端在消费它，都在被一个客户端所锁定。当客户端在本地根据消息队列构建PullRequest之前，会与Broker沟通尝试锁定这个队列，另外当进行有序消费的时候，客户端也会周期性地（默认是20s）锁定当前需要消费的消息队列：

```java
public class ConsumeMessageOrderlyService implements ConsumeMessageService {

    public void start() {
        if (MessageModel.CLUSTERING.equals(ConsumeMessageOrderlyService.this.defaultMQPushConsumerImpl.messageModel())) {
            this.scheduledExecutorService.scheduleAtFixedRate(new Runnable() {
                    @Override
                    public void run() {
                        ConsumeMessageOrderlyService.this.lockMQPeriodically();
                    }
                }, 1000 * 1, ProcessQueue.REBALANCE_LOCK_INTERVAL, TimeUnit.MILLISECONDS);
        }
    }
    
}
```

<div class="note info"><p>只有在集群模式下才会周期性地锁定Broker端的消息队列，因此在广播模式下是不支持进行有序消费的。</p></div>

在Broker这端，每个客户端所锁定的消息队列对应的锁项LogEntry有一个上次锁定是的时间戳，当超过锁定的超时时间（默认是60s）后，也会判定这个客户端已经不再持有这把锁，以让其它客户端能够有序消费这个队列。

前面我们说到RebalanceService均衡服务会定时地依据不同消费者数量分配消费队列。我们假设Consumer-1消费者客户端一开始需要3个消费队列，这个时候又加入了Consumer-2消费者客户端，并且分配到了MessageQueue-2消费队列。当Consumer-1内部的均衡服务检测到当前队列需要移除MessageQueue-2队列，这个时候，会首先解除Broker端的锁，确保新加入的Consumer-2消费者客户端能够成功锁住这个队列，以进行有序消费。

```java
public abstract class RebalanceImpl {

    private boolean updateProcessQueueTableInRebalance(final String topic,
                                                       final Set<MessageQueue> mqSet,
                                                       final boolean isOrder) {
        while (it.hasNext()) {
            // ...
            
            if (mq.getTopic().equals(topic)) {
                // 当前客户端不需要处理这个消息队列了
                if (!mqSet.contains(mq)) {
                    pq.setDropped(true);
                    // 解锁
                    if (this.removeUnnecessaryMessageQueue(mq, pq)) {
                        // ...
                    }
                }

                // ...
            }
        }
    }
    
}
```

![image-20211114175130250](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114175130.png)

RocketMQ的消息树是用TreeMap实现的，其内部基于消息偏移量维护了消息的有序性。每次消费请求都会从消息树中拿去偏移量最小的几条消息（默认为1条）给用户，以此来达到有序消费的目的：

```java
public class ConsumeMessageOrderlyService implements ConsumeMessageService {

    class ConsumeRequest implements Runnable {
        @Override
        public void run() {
            // ...
            final int consumeBatchSize =
                ConsumeMessageOrderlyService.this
                .defaultMQPushConsumer
                .getConsumeMessageBatchMaxSize();
            List<MessageExt> msgs = this.processQueue.takeMessags(consumeBatchSize);
            
        }
    }
    
}
```

![image-20211114175326325](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114175326.png)

## 消息过滤过程

### 消息过滤类型

Producer在发送消息的时候可以指定消息的标签类型，还可以为每一个消息添加一个或者多个额外的属性：

```java
// 指定标签
Message msg = new Message("TopicTest", "TagA", ("Hello RocketMQ").getBytes(RemotingHelper.DEFAULT_CHARSET));
// 添加属性 a
msg.putUserProperty("a", 5);
```

根据标签和属性的不同，RocketMQ客户端在消费消息的时候有三种消息过滤的类型：

- Tag过滤

	```java
	consumer.subscribe("TopicTest", "TagA | TagB | TagC");
	```

- SQL匹配

	```java
	consumer.subscribe("TopicTest",
	                MessageSelector.bySql(
	                    "(TAGS is not null and TAGS in ('TagA', 'TagB'))" + 
	                "and (a is not null and a between 0  3)"));
	```

- 自定义匹配

	客户端实现 `MessageFilter` 类，自定义过滤逻辑:

	```java
	ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
	File classFile = new File(classLoader.getResource("MessageFilterImpl.java").getFile());
	
	String filterCode = MixAll.file2String(classFile);
	consumer.subscribe("TopicTest", "org.apache.rocketmq.example.filter.MessageFilterImpl",filterCode);
	```

	对于 `MessageFilter` 类实现 `match` 方法即可:

	```java
	public class MessageFilterImpl implements MessageFilter {
	
	    @Override
	    public boolean match(MessageExt msg, FilterContext context) {
	        String property = msg.getProperty("SequenceId");
	        if (property != null) {
	            int id = Integer.parseInt(property);
	            if (((id % 10) == 0) &&
	                (id > 100)) {
	                return true;
	            }
	        }
	
	        return false;
	    }
	    
	}
	```

### 标签匹配

当为消息指定消息标签类型的时候，实际上所指定的标签例如TagA是作为一个属性放入到了这条消息中的：

```java
public class Message implements Serializable {

    public void setTags(String tags) {
        this.putProperty(MessageConst.PROPERTY_TAGS, tags);
    }
    
}
```

当这条消息到达Broker服务器端后，用户设置的标签会计算为标签码，默认的计算方式采用的标签字符串的hashCode()作为计算结果的：

```java
public class CommitLog {

    public DispatchRequest checkMessageAndReturnSize(java.nio.ByteBuffer byteBuffer,
                                                     final boolean checkCRC,
                                                     final boolean readBody) {
        // ...
        String tags = propertiesMap.get(MessageConst.PROPERTY_TAGS);
        if (tags != null && tags.length() > 0) {
            tagsCode = MessageExtBrokerInner
                .tagsString2tagsCode(MessageExt.parseTopicFilterType(sysFlag), tags);
        }
        // ...
    }
    
}
```

当计算出来标签码之后，这条消息的标签码会被存放到消息队列文件中，用来与消费者客户端消费队列的标签码进行匹配。消费者客户端订阅消费Topic的时候，会指定想要匹配的标签类型：

```java
consumer.subscribe("TopicTest", "TagA | TagB | TagC");
```

这段代码在内部实现中利用FilterAPI构建了一个SubscriptionData对象：

```java
public class DefaultMQPushConsumerImpl implements MQConsumerInner {

    public void subscribe(String topic, String subExpression) throws MQClientException {
        SubscriptionData subscriptionData = FilterAPI
            .buildSubscriptionData(this.defaultMQPushConsumer.getConsumerGroup(),
                                   topic,
                                   subExpression);
        // ...
    }
    
}
```

当用户未指定标签或者指定为星号标签的时候，则代表用户接收所有标签的消息。如果用户指定了一个或者多个标签，那么会将每一个标签取其hashCode()放入到codeSet中。SubscriptionData还有一个expressionType字段，在使用标签匹配的时候，其不会设置这个字段的值，因此其保留为null。在这些信息设置好以后，当客户端发送心跳包的时候，会将这些Topic的注册信息一并上传至Broker服务器端，方便在Broker端进行匹配。

```java
public class SubscriptionData implements Comparable<SubscriptionData> {

    public final static String SUB_ALL = "*";

    private Set<String> tagsSet = new HashSet<String>();
    private Set<Integer> codeSet = new HashSet<Integer>();

    private String expressionType;
    
}
```

当 Broker 端服务器在取消息的时候，每取出来一条消息，都会执行两道过滤机制:

- ConsumeQueue文件匹配
- CommitLog文件匹配

任一检查没有通过后，绝不会放行这条消息给客户端：

```java
public class DefaultMessageStore implements MessageStore {

    public GetMessageResult getMessage(final String group, /** 其他参数 **/) {

        for (; i < bufferConsumeQueue.getSize() && i < maxFilterMessageCount; i += ConsumeQueue.CQ_STORE_UNIT_SIZE) {

            // ConsumeQueue 文件匹配
            if (messageFilter != null
                && !messageFilter.isMatchedByConsumeQueue(isTagsCodeLegal ? tagsCode : null, extRet ? cqExtUnit : null)) {
                if (getResult.getBufferTotalSize() == 0) {
                    status = GetMessageStatus.NO_MATCHED_MESSAGE;
                }

                continue;
            }

            // CommitLog 文件匹配
            if (messageFilter != null
                && !messageFilter.isMatchedByCommitLog(selectResult.getByteBuffer().slice(), null)) {
                if (getResult.getBufferTotalSize() == 0) {
                    status = GetMessageStatus.NO_MATCHED_MESSAGE;
                }
                // release...
                selectResult.release();
                continue;
            }

        }
        
    }
    
}
```

消息过滤器的默认实现是ExpressionMessageFilter，消息过滤的默认实现策略就是看这个Topic的标签码集合中是否包含当前这条消息的标签码：

```java
public class ExpressionMessageFilter implements MessageFilter {

    @Override
    public boolean isMatchedByConsumeQueue(Long tagsCode, ConsumeQueueExt.CqExtUnit cqExtUnit) {
        // ...
        if (ExpressionType.isTagType(subscriptionData.getExpressionType())) {

            if (tagsCode == null) {
                return true;
            }

            if (subscriptionData.getSubString().equals(SubscriptionData.SUB_ALL)) {
                return true;
            }

            return subscriptionData.getCodeSet().contains(tagsCode.intValue());
        }

        // ...
        return true;
    }

    @Override
    public boolean isMatchedByCommitLog(ByteBuffer msgBuffer, Map<String, String> properties) {
        if (ExpressionType.isTagType(subscriptionData.getExpressionType())) {
            return true;
        }

        // ...
    }
    
}
```

下图是一幅标签匹配的简要流程图:

![image-20211114181150764](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211114181150.png)

### SQL匹配



## 消息索引流程

## 定时消息和重试消息

## 主备同步

## 事务消息

## ACL权限控制

## 逻辑队列

# RocketMQ中的设计模式

## 监听者模式

# 参考文献

[1] [RocketMQ官方文档](https://rocketmq.apache.org/docs/quick-start/)

[2] [RocketMQ源码分析](https://kunzhao.org/docs/rocketmq/rocketmq-send-message-flow/)

