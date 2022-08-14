---
title: leetcode in Java
date: 2021-06-24 15:33:37
tags:
 - 分布式事务
author: 吉永超
---

# 分布式事务概览

事务有一个重要的特点，就是无法跨线程使用，然而，随着业务的规模和复杂度的提升，系统面临的环境也会更加复杂，为了应对这种情况，多线程技术、微服务架构，这些技术的引入虽然解决了单体架构的某些弊端，但是也带来了诸多问题，而分布式事务就是其中最难的问题之一。本文将介绍相关的理论基础，并探讨一些典型实现的原理。

## 分布式事务

分布式事务就是指事务的参与者、支持事物的服务器、资源服务器以及事物管理器分别位于不同的分布式系统的不同节点上。简单的说，就是一次大的操作由不同的小操作组成，这些小的操作分布在不同的服务器上，且属于不同的应用，分布式事务需要保证这些小操作要么全部成功，要么全部失败。

分布式事务的类型可能有：

- 跨库的分布式事务
- 跨服务的分布式事务
- 跨库、跨服务的混合型分布式事务

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206181737880.png" alt="image-20220618173702848" style="zoom: 50%;" />

分布式事务的参与者分布在异步的网络上，它们通过网络通信来实现一致性，故障和超时是不可避免的，也正因如此，分布式事务没有一种完美的解决方案，需要我们在应用的时候，选择合适的方案。

## CAP理论

CAP 理论是分布式系统设计领域的基石理论，CAP是consistency（一致性）、availability（可用性）和partition tolerance（分区容错性）的首字母的缩写，它们具体的含义如下：

- consistency：一致性指的是，在分布式系统中的多个节点上，同时读取数据都会得到一样的结果
- availability：可用性指的是，在任何时间访问分布式系统中的任一节点，都可以得到响应，不过，可用性并不保证一致性，也就是不保证同时读取不同结点获取到的数据是一样的
- partition tolerance：分区容错性指的是，当分布式系统中的节点之间的通信中断，仍然可以访问系统

CAP理论的具体内容是，在分布式系统中，一致性、可用性、分区容错性最多只能满足两个，三者无法共存。在分布式系统中，由于网络的不确定性，分区容错性是必须选择的，也就是说，分布式系统理论上无法选择CA架构，只能选择CP或者AP架构。

# 分布式事务的实现原理

## 解决方案

### XA

XA规范中设计了几个关键的角色：

- RM（Resource Manager）：资源管理器，提供数据操作的接口，并确保数据的一致性和完整性。通常而言，数据管理系统、某些文件管理系统、消息队列等都是比较常见的RM的例子
- TM（Transaction Manager）：事务管理器，各个本地事务之间的协调者
- AP（Application Program）：应用程序，在根据业务规则调用RM接口修改业务模型数据的时候，如果数据的修改涉及到了多个RM，那么就要保证数据的一致性和完整性，AP通过TM来确定一个事务的边界，它负责协调事务中涉及的RM来完成一个全局事务
- CRM（Communication Resource Manager）：负责跨服务传递事务



<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206181814210.png" alt="image-20220618181430187" style="zoom:50%;" />

在XA规范中，分布式事务建立在RM的本地事务之上，然后被视为分支事务。TM负责协调这些分支事务并确保它们全部成功提交或全部回滚。XA规范将分布式事务处理过程分为准备阶段和提交或回滚阶段两个阶段，因此也被称为两阶段提交协议：

在准备阶段，会执行如下操作：

1. TM记录事务启动并查询每个RM是否准备好执行预备的操作
2. 当RM收到执行的指令，会先执行一些预备操作，例如预留资源、锁定资源，接着执行预备好的操作，但是并不提交事务，继续等待来自TM后续的指令。如果前面的这个过程发生了异常，则RM会通知TM该阶段的执行失败并会滚已执行的操作，然后退出全局事务

在提交或回滚阶段，如果所有的RM都返回了成功，那么就会执行如下操作：

1. TM将会事务标记为已提交，并向所有的RM发出提交事务的指令
2. 当RM收到提交事务的指令，它们就会提交本地事务并释放资源，然后通知TM“事务已提交“
3. 当TM收到所有的RM的响应，它就会记录这个事务的状态为已完成

如果任意一个RM的响应内容是执行失败或者执行超时，TM就会认为这个事务执行失败，然后，做如下操作：

1. TM将会记录这个事务的状态为终止，然后向所有的RM发出回滚的执行
2. 当收到执行，RM会回滚事务，释放资源，并且通知TM“回滚已完成”
3. 如果TM收到RM的响应，它就会记录事务的状态为已完成

XA的整个执行过程如下图所示：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206181839089.png" alt="image-20220618183912068" style="zoom:50%;" />

针对某些特定的场景，XA规范做了如下优化措施：

- 如果TM发现在全局事务中只有一个RM，则整个过程会变为一阶段提交
- 如果RM接收到的来自AP的数据操作是只读操作，则RM可以在第一阶段完成事务，并通知TM不再需要第二阶段。如果是这种情况，可能会发生脏读
- 如果RM在第一阶段完成后很长时间没有收到进入第二阶段的命令，它可以自行提交或回滚本地事务。这种情况称为启发式完成。需要注意的是，这可能会破坏事务的一致性从而导致异常

XA规范详细定义了两个组件之间交互的接口，以TM和RM为例，可以看出，在一个完整的全局事务中，TM和RM通过交互接口通信是非常频繁的：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206182312936.png" alt="image-20220618231252895" style="zoom:50%;" />

当在发生错误和网络超时的时候执行事务，对于不同的异常场景，不同的实现会有不同的处理方式：

- 如果RM在第一阶段查询RM之前遇到停机，则从停机恢复后将不需要任何操作
- 如果TM在第一阶段查询RM后遇到停机，此时部分RM可能已经收到查询，需要向这些RM发送回滚请求
- 如果TM在RM查询完成但在记录事务状态前遇到停机，需要在RM恢复正常后发送回滚请求，因为此时TM无法获取查询到的数据
- 如果TM在第一阶段的事务状态记录为已完成时遇到停机时间，则可以根据从停机时间恢复后产生的日志发出命令或回滚命令
- 如果TM在第二阶段提交或中止记录的时候遇到停机，那么可以在RM在恢复正常后，根据日志继续发送commit或者rollback命令
- 如果TM在第二阶段的事务状态记录为已完成时遇到停机时间，则可以根据从停机时间恢复后产生的日志发出命令或回滚命令
- 如果TM在第二阶段将事务标记为已完成后遇到停机，RM恢复服务后将不需要任何操作
- 如果任何一个RM在第一阶段没有及时响应，TM会向所有RM发出回滚命令
- 如果在第二阶段，RM没有及时收到响应，TM就会不断地向RM会送回滚请求

XA规范的两阶段提交的设计保证了事务的ACID特性：

- 原子性：在第一阶段确保所有的待提交的本地事务都是原子性的
- 一致性：XA协议保证了数据的强一致性
- 隔离性：XA规范在完成提交之前会一直持有资源的锁，从而达到写隔离
- 持久性：本地事务的持久性就可以保证全局事务的持久性

XA是最早的分布式事务规范，Oracle、MySQL、SQL Server等主流数据库产品都支持XA规范。JTA规范也是基于XA规范的，因此与XA规范兼容。

XA是从资源管理这个层面实现的分布式事务管理模型，对业务代码有较低的入侵性。

XA规范的两阶段提交能够覆盖分布式事务的绝大数场景。然而，当执行全局事务的时候，RM会持有资源的锁，如果一个事务比较大，涉及到多个RM，RM会长期占有资源的锁，尤其在跨服务的场景下，网络通信的次数和时间消耗会迅速增加，会导致系统的吞吐量下降，死锁的概率增加。因此，两阶段提交协议并不适用于在微服务架构下的跨服务的分布式事务场景。

每个TM的作用域都会创建一个单点，这可能会导致单点故障。如果TM在第一阶段之后崩溃，参与的RM将不会收到第二阶段的指令，因此会长时间持有资源锁，这会影响业务的吞吐量。另一方面，在一个完整的全局事务中，TM和RM的交互次数很多，这也会导致系统复杂性的提高和性能的下降。

此外，两阶段协议可能会导致裂脑异常。如果TM在第二阶段RM提交事务后出现故障，并且只有部分RM收到提交的指令，那么当TM恢复时，它无法保证所有RM事务的一致性。

> 裂脑（split-brain）： 所谓裂脑，是指HA的节点之间彼此失去了联系，但是单个节点的HA仍然运行正常。

XA必须在框架层面实现许多异常场景的处理方法，这对框架的实现具有一定的复杂性，相关的开源实现可以参考`Atomikos`和`Bitronix`。

针对两阶段提交协议中存在的问题，提出了一种改进的三阶段提交方案。这种新的解决方案消除了单点故障，并为RM添加了超时机制，依次避免长期锁定资源的问题。但三阶段提交的方案无法解决裂脑问题，很少应用于实际案例。

### TCC

TCC（try、commit和cancel）是一种补偿机制的分布式事务模型。使用TCC的应用程序的服务需要提供三个接口，即try、commit、cancel接口。该模型的核心思想是通过预留资源（提供中间状态），以最快的速度释放资源的锁定。如果可以提交事务，则确认保留的资源；如果事务需要回滚，则释放保留的资源。

TCC也是两阶段提交协议，可以认为它是XA两阶段提交协议的变种，不过，它不会长时间的锁住资源。

TCC将事务的提交分为了两个阶段：

第一阶段：

在第一阶段，TCC进行业务检查（一致性）和业务资源预留（准隔离），也就是TCC中的try方法。

第二阶段：

如果第一阶段的方法正常执行，那么就执行确认操作，否则，就执行取消操作：

- 确认操作：确认操作只作用于预留的资源，不会检查业务。如果确认操作失败，系统会不断重试
- 取消操作：取消操作会取消业务操作的执行，并且释放资源，当取消失败的时候，系统将会重试

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206191655571.png" alt="image-20220619165538531" style="zoom:50%;" />

在TCC模型中，事务的发起者和参与者都需要记录事务的状态，发起者会记录全局事务的状态和分支事务的信息，参与者会记录分支事务的状态。

在TCC事务执行过程中的任何阶段，都可能会出现停机、重启、断网等异常场景。一旦出现，事务就会进入非原子且不一致的状态。因此，需要根据主事务和分支事务的日志来提交或回滚剩余的分支事务。从而，整个分布式系统中的所有事务都可以达到最终的一致性和原子性。

TCC是这样保证事务的ACID的特性：

- 原子性：事务的发起者协调并确保所有分支事务都提交或全部回滚
- 一致性：TCC可以保证事务的最终一致性
- 隔离性：TCC通过在try阶段分配资源来实现数据隔离
- 持久性：TCC协调每个分支事务来保证持久性

TCC事务模型对业务来说是侵入式的，业务方需要将一个接口拆分为三个，开发成本高。以电子商务系统为例，小明在淘宝上花了100元买了一本书，这次购买获得了10积分，购买涉及系统中的以下操作：

- 订单系统创建商品订单
- 支付系统完成支付/扣款操作
- 库存系统扣除商品库存
- 会员系统增加小明的积分

这些操作需要在一个事务中完成，要么全部成功，要么全部回滚。如果系统采用TCC的分布式解决方案，那么必须做如下改造：

对于订单系统：

- try：系统创建一个状态为“待支付”的订单
- commit：系统将订单状态更新为“已完成”
- cancel：系统将订单状态更新为“已取消”

对于支付系统：

- try：假设小明账户里有1000元，购买时系统冻结了100元。此时，小明账户里面还有1000元的余额
- commit：系统将账户余额更改为900元，并清楚冻结记录
- cancel：系统清除冻结记录

对于库存系统：

- try：假设仓库里此时有10本书，冻结其中一本，此时，仓库里还有10本书
- commit：系统将仓库中的书的数量更新为9本，并且清除冻结状态
- cancel：系统清除冻结记录

对于会员系统：

- try：假设小明此时会员积分有3000分，系统将要给他增加10积分，此时，小明的会员积分还是3000分
- commit：系统将小明的积分更新为3010，并且清除准备记录
- cancel：系统清除准备记录

同时，为了避免异步网络中通信失败或超时导致的异常，TCC要求业务方在设计和实现上遵循三个策略：

- 允许空回滚：当一些参与者在第一阶段，没有收到调用try方法的请求，系统将会取消加入事务。如果事务的参与者执行失败或者未执行try方法的参与者收到取消请求，则需要进行空回滚操作
- 保持幂等性：当在第二阶段发生超时等异常的时候，确认和取消的方法会被重复调用，因此，commit方法和cancel必须要具有幂等性
- 防止资源悬挂：当网络异常打乱了两阶段的执行顺序，使得参与者端的try请求比cancel请求晚到达。取消操作会进行空回滚，以保证事务的正确性，不会执行try操作

<div class="note info"><p>所谓空补偿，就是原服务没有执行，执行了补偿服务，因此在设计的时候，即使没有找到要补偿的业务主键时返回成功并将原业务主键记录下来；所谓悬挂，是指补偿服务比原服务先执行，因此要检查当前业务主键是否已经在空补偿记录下来的业务主键存在，如果存在则要拒绝服务的执行。</p></div>

TCC在业务层而不是资源层实现分布式事务，允许业务灵活选择资源的锁定力度。另外，在全局事务执行过程中并不会一直锁定资源，因此，系统的吞吐两远高于两阶段提交的XA模式。

支持TCC模式的开源框架有：`ByteTCC`、`Himly`、`TCC-transaction`。

### SAGA

Saga和TCC类似，也是一种补偿类型的分布式事务的模型，它并不是一个新的概念，与Saga相关的论文发表于1987年，和XA的发表时间大致相同。它与TCC不同的是，Saga没有try的阶段，Saga将分布式事务视为由一组本地事务组成的事务链。

每个正向的事务操作都对应一个可逆的事务操作。Saga事务协调器按照顺序执行事务链中的分支事务。在执行完成所有的分支事务后，释放资源，如果分支事务执行失败，则在相反方向进行补偿操作。

假设分布式事务是由这样的分支事务构成：[T<sub>1</sub>，T<sub>2</sub>，...，T<sub>n</sub>]，那么这个事务链执行的可能情况有：

- T<sub>1</sub>，T<sub>2</sub>，...，T<sub>n</sub>：分支事务全部都执行成功
- T1，T2，...，T<sub>i</sub>，C<sub>i</sub>，...，C<sub>2</sub>，C<sub>1</sub>：i-th（i<=n）的事务执行失败，此时就需要补偿序列中i到1的操作，如果补偿失败，系统会自动重试直到成功，补偿的操作可以优化为并行的操作
- T1，T2，...，T<sub>i</sub>，T<sub>i</sub>（重试），T<sub>i</sub>（重试），T<sub>i</sub>（重试），...，T<sub>n</sub>：适用于事务必须成功的场景。如果执行失败，事务会一直充实，不会进行补偿操作

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206192104197.png" alt="image-20220619210459166" style="zoom:50%;" />

假设小明想在国庆假期去旅行，他计划离开北京，花费三天时间到达伦敦，然后去巴黎，在巴黎待三天以后最后返回北京。整个旅行，小明需要预订三张机票和两张酒店的票，如果其中任意一趟航班的机票预定失败，小明就不得不取消计划。现在假设有一个综合旅游服务平台可以一键完成所有的预订，如下图所示。当任何一个预定失败的时候，就会通过补偿操作取消所有的行程预订，这就是Saga模型的执行过程：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206192109999.png" alt="image-20220619210949972" style="zoom:67%;" />

Saga模式下的事务的ACID特性：

- 原子性：事务的协调者会确保本地的事务链全部提交或者全部回滚
- 一致性：Saga保证事务的最终一致性
- 持久性：Saga通过每个分支事务的持久性来保证系统的持久性

需要注意的是，Saga模式并不保证事务的隔离性，一个本地事务提交后，那么他提交的结果对其他新的事务就是可见的。如果其他事务也成功地修改了同一份数据，对于这种场景，我们就必须在业务的设计的时候就要避免这个问题。

类似TCC模式，Saga模式也需要业务设计的时候遵循这三个原则：

- 允许空补偿：由于网络异常，事务的参与者可能在执行正常操作之前收到补偿指令，在这种情况下，需要进行空补偿
- 保持幂等性：正向操作和补偿操作都可能重复触发，因此，操作必须保证幂等性
- 防止资源悬挂：如果由于网络异常导致前置操作晚于补偿操作到达，则前置操作必须被丢弃，否则，可能会发生资源悬挂

尽管Saga和TCC都是补偿类型的事务模型，但是，它们在事务的提交的阶段的设计是不同的：

- Saga采用不完全补偿机制，补偿操作会留下原始交易操作的痕迹，因此，必须考虑对业务的影响
- TCC采用完美补偿机制，会彻底清理原有的交易操作，用户将无法感知交易取消前的状态信息
- TCC能更好的支持异步，Saga通常只能在补偿的阶段使用异步

Saga模式更适合长事务和微服务，它对业务的侵入性很小。另外，Saga单阶段提交的模式并不会锁定资源，也没有“木桶效应”，因此，使用Saga模式的系统具有高性能和高吞吐量。

### 基于消息的分布式事务

基于消息的分布式事务模式的核心理念是通过消息系统通知其他事务参与者自己的执行状态。消息系统最大的作用是可以将事务的参与者解耦，从而使得每个参与者可以异步执行操作。这种模式实现的难点在于保证事务的执行和消息的发送之间的一致性。因为这两个动作必须全部成功或全部取消。

两种主流的基于消息的分布式事务的解决方法：

- 基于事务消息的解决方案
- 基于本地消息的解决方案

#### 基于事务消息的分布式事务

一般的消息不能保证事务的执行和消息发送的一致性的原因是，消息发送需要通过网络通信，在这期间可能会发生错误或者超时。如果在发送消息的时候发生了超时，消息的发送者就无法检测到消息是否成功送达。因此，消息发送者的事务无论是提交或者回滚，数据都有可能发生不一致的情况。

下图显示了发送本地事务和事务消息的流程。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206192203714.png" alt="image-20220619220306693" style="zoom:50%;" />

1. 事务的发起者提交发送事务消息
2. 当MQ收到事务消息，他会先将消息保存，并更新消息的状态为“to be sent”，并且向消息的发送者发送ACK消息
3. 如果事务的发起者没有收到ACK消息，那么本地事务就会被取消执行，如果发起者收到了ACK消息，本地事务会被执行，并向MQ系统发送已经执行了本地事务的通知
4. MQ收到通知后，会根据本地事务的执行结果改变事务的消息状态。如果执行成功，MQ将消息状态变为“consumable”并传递给订阅者，如果执行失败，则删除该消息
5. 当执行本地事务的时候，发送到MQ的通知消息可能会丢失。因此，支持事物性消息的MQ具有定期的扫描逻辑。通过扫描，MQ识别出处于“待发送”状态的消息，并向消息的发送者发起查询，以了解消息的最终状态。MQ会根据查询结果更新相应的消息状态。因此，事务的发起者需要为MQ系统提供查询事务消息状态的接口
6. 如果事务消息的状态是“ready to send”，MQ会将消息推送给下游的参与者，如果推送失败，系统将会重试
7. 下游参与者在收到消息后，开始执行本地事务，如果本地事务执行成功，则向MQ系统发送ACK消息。如果执行失败，则不发送ACK消息。在这种情况下，MQ会不断地向不返回ACK消息的下游参与者推送消息

#### 基于本地消息的分布式事务

基于本地消息的事务模型必须依赖于MQ系统，并不是所有的MQ系统都支持消息，RocketMQ就是其中之一。如果你使用的MQ并不支持事务消息，那么可以考虑基于本地消息的分布式事务解决方案。

这种模式的核心概念是事务发起者需要维护一个本地消息表。在这种模式下，事务的执行过程如下图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206192329632.png" alt="image-20220619232953599" style="zoom:25%;" />

业务和本地消息表的操作在同一个本地事务中执行。如果服务执行成功，本地消息表中也会记录一条状态为“ready to send”的消息。系统启动定时任务，定期扫描本地消息表中处于“ready to send”状态的消息发送给MQ。如果发送失败或超时，消息将被重新发送，直到发送成功，然后，删除该任务在本地消息表中的记录。后续的消费和订阅过程与事务性消息模式类似。

基于消息的分布式事务的ACID：

- 原子性：分支事务要么全部执行，要么全部取消
- 一致性：保证事务的最终一致性
- 隔离性：并不保证隔离性
- 持久性：通过本地事务的持久化来保证全局事务的持久化

基于消息的分布式事务模型可以有效的解耦分布式系统的耦合性，因为事务的发起方和参与发并不是同步调用的。与此同时，基于消息的分布式事务对MQ系统的要求很高，给业务带来了一定的侵入性。对于此类事务，要么必须提供查询事务消息状态的接口，要么需要维护本地消息表。此外，基于消息的分布式事务不支持事物回滚。如果事务失败，它必须重试直到成功。这个也行使得这种方案适用于对最终一致性不太敏感的有限业务场景，例如，跨企业系统之间的调用。

#### 最大努力通知

最大努力通知是另外一种基于MQ的分布式事务的解决方案，它并不要要求MQ消息的可靠性。

假设小明使用联通手机APP支付花费，提前还款方式为支付宝。整个过程如下：

1. 小明选择支付宝支付的方式来提前还款，金额为50元人民币
2. 联通APP会创建一个状态是代还款的提前还款的订单，然后页面会跳转到支付宝支付的页面，流程进入到支付宝系统
3. 支付宝确认小明的支付，然后从小明的账号里扣除50元，再转账给联通的账户50元，执行完成后，向MQ系统发送支付是否成功的消息。需要注意的是，支付是否成功的消息并不保证可靠性
4. 如果消息发送成功，支付宝会通过调用联通服务的接口通知小明支付的结果。如果联通服务的接口失败了，支付宝会增加一定的时间间隔进行重试，从5分钟，20分钟，30分钟，一个小时，...，24个小时，直到接口成功的调用或者达到设定好的时间阈值，这个过程体现了最大努力通知的含义
5. 当联通服务恢复正常，并收到支付宝的通知的时候，它会认为提前还款完成，否则，就会取消提前还款。联通操作完成后，向支付宝通知服务恢复确认，如果确认失败，支付宝将重试请求。所以联通的提前还款接口需要保持幂等性
6. 如果联通的服务在支付宝设置的时间阈值之后恢复，它会扫描还在支付中的订单，对这些订单向支付宝发起新的验证请求

最大努力通知的解决方案本质上是通过引入周期性验证的机制来保证事务的最终一致性。该解决方案相对来说容易实施，因为它对业务的侵入性较少，并且对MQ系统的要求不高。该当法适用于对事务的最终一致性敏感度不高、业务路径较短的场景，如系统间跨平台、跨企业的业务交互。

## Seata

Seata是一款开源的分布式事务解决方案，致力于提供高性能和简单易用的分布式事务服务。Seata为用户提供了AT、TCC、SAGA和XA事务模式。前文中我们介绍了XA、TCC、SAGA模式的原理，那么让我们一起看看在Seata中如何实践这些理论吧。

### Seata XA模式

Seata XA模式是对分布式事务XA模式的一种完整实现，其原理如下图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206292306374.png" alt="image-20220629230644342" style="zoom:50%;" />

执行步骤：

1. 首先由TM开启全局分布式事务
2. 各个不同的业务操作分别在不同的分支事务中执行
3. 将分支事务执行的状态报告给TC
4. 当所有的分支事务执行完毕后，TC会收到各个分支事务报告上来的执行状态，如果所有状态都OK，则TC通知所有RM执行commit完成事务的最终提交，否则，TC通知所有RM执行回滚操作

和AT模式相比，不用创建`UNDO_LOG`表，AT模式第二阶段回滚使用的是反向补偿（通过更新语句将数据复原），而XA则是利用数据库自己的XA模式，通过命令回滚的，所以XA模式不需要`UNDO_LOG`表。

接下来我们看一个实际的例子，假设有如下场景：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206282328484.png" alt="image-20220628232813453" style="zoom: 33%;" />

相应业务关键代码的实现如下，业务服务（business-xa）：

```java
@Service
public class BusinessService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BusinessService.class);

    public static final String SUCCESS = "SUCCESS";
    public static final String FAIL = "FAIL";
		// 库存服务（stock-xa）
    @Autowired
    private StockFeignClient stockFeignClient;
    @Autowired
    private OrderFeignClient orderFeignClient;

    @GlobalTransactional
    public void purchase(String userId, String commodityCode, int orderCount, boolean rollback) {
        String xid = RootContext.getXID();
        LOGGER.info("New Transaction Begins: " + xid);
				// 扣除库存
        String result = stockFeignClient.deduct(commodityCode, orderCount);

        if (!SUCCESS.equals(result)) {
            throw new RuntimeException("库存服务调用失败,事务回滚!");
        }
				// 订单
        result = orderFeignClient.create(userId, commodityCode, orderCount);

        if (!SUCCESS.equals(result)) {
            throw new RuntimeException("订单服务调用失败,事务回滚!");
        }

        if (rollback) {
            throw new RuntimeException("Force rollback ... ");
        }
    }
}
```

其中订单服务（order-xa）：

```java
@Service
public class OrderService {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderService.class);

    public static final String SUCCESS = "SUCCESS";
    public static final String FAIL = "FAIL";

    @Autowired
    private AccountFeignClient accountFeignClient;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void create(String userId, String commodityCode, Integer count) {
        String xid = RootContext.getXID();
        LOGGER.info("create order in transaction: " + xid);

        // 定单总价 = 订购数量(count) * 商品单价(100)
        int orderMoney = count * 100;
        // 生成订单
        jdbcTemplate.update("insert order_tbl(user_id,commodity_code,count,money) values(?,?,?,?)",
            new Object[] {userId, commodityCode, count, orderMoney});
        // 调用账户余额扣减
        String result = accountFeignClient.reduce(userId, orderMoney);
        if (!SUCCESS.equals(result)) {
            throw new RuntimeException("Failed to call Account Service. ");
        }

    }

}
```

在订单服务中会调用账户服务（account-xa）扣减余额：

```java
@Service
public class AccountService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AccountService.class);

    public static final String SUCCESS = "SUCCESS";
    public static final String FAIL = "FAIL";

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional
    public void reduce(String userId, int money) {
        String xid = RootContext.getXID();
        LOGGER.info("reduce account balance in transaction: " + xid);
        jdbcTemplate.update("update account_tbl set money = money - ? where user_id = ?", new Object[] {money, userId});
        int balance = jdbcTemplate.queryForObject("select money from account_tbl where user_id = ?",
            new Object[] {userId}, Integer.class);
        LOGGER.info("balance after transaction: " + balance);
        if (balance < 0) {
            throw new RuntimeException("Not Enough Money ...");
        }
    }
}
```

这里我们使用的数据源的方式是（以账户服务为例，其他服务类似）：

```java
@Configuration
public class AccountXADataSourceConfiguration {

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DruidDataSource druidDataSource() {
        return new DruidDataSource();
    }

    @Bean("dataSourceProxy")
    public DataSource dataSource(DruidDataSource druidDataSource) {
        // DataSourceProxy for AT mode
        // return new DataSourceProxy(druidDataSource);

        // DataSourceProxyXA for XA mode
        return new DataSourceProxyXA(druidDataSource);
    }

    @Bean("jdbcTemplate")
    public JdbcTemplate jdbcTemplate(DataSource dataSourceProxy) {
        return new JdbcTemplate(dataSourceProxy);
    }

    @Bean
    public PlatformTransactionManager txManager(DataSource dataSourceProxy) {
        return new DataSourceTransactionManager(dataSourceProxy);
    }

}
```

XA的阻塞带来的性能下降是非常厉害的，特别是当分支事务非常多，每个资源的释放必须等到每个分支的数据库去单独释放，后续的事务才能进入。虽然XA模式对业务的入侵性很低，但是性能下降的程度很高，这也促使了AT模式的诞生，AT可以看作是由Seata社区对XA模式的全方位的优化的产物，AT模式的最大优点是解决了XA模式的性能差的问题。

### Seata AT模式

AT模式也是两阶段提交协议的演变：

- 一阶段：业务数据和回滚日志记录在同一个本地事务中提交，释放本地锁和连接资源
- 二阶段：
  - 提交异步化，非常快速地完成
  - 回滚通过一阶段的回滚日志进行反向补偿

在AT模式下，用户只需关注自己的业务SQL，用户的业务SQL作为一阶段，Seata会自动生成事务的二阶段提交和回滚操作。事务由TM全局事务发起者，向TC发起事务请求，会返回全局事务XID。AT模式每个步骤的详细介绍：

第一阶段：

1. 解析SQL，得到SQL类型、操作的表、SQL条件等相关信息
2. 根据解析得到的条件信息，生成查询语句，得到数据更新前的数据（查询的时候使用`for update`行锁）
3. 执行业务SQL，更新记录
4. 查询更新后的数据镜像（根据前镜像的结果的主键来定位数据）
5. 将前后镜像数据以及业务SQL相关的信息组成一条回滚日志记录，插入到`UNDO_LOG`表中
6. 提交前，向TC注册分支事务，返回BranchID
7. 本地事务提交：业务数据的更新和前面步骤5中生成的`UNDO_LOG`数据一起提交
8. 将本地事务提交的结果上报给TC

第一阶段对应的图解：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206292341718.png" alt="image-20220629234103685" style="zoom:50%;" />

基于这样的机制，分支的本地事务便可以在全局事务的第一阶段提交，并马上释放本地事务锁定的资源，这也是AT模式和XA模式不同之处，XA对资源的锁定需要持续到第二阶段实际的提交或者回滚操作，AT模式通过记录回滚日志，可以在第一阶段就释放对资源的锁定，降低了锁的范围。

第二阶段：

- 提交：

  1. 收到TC的分支提交请求，把请求放入到一个异步任务队列中，马上返回提交成功的结果给TC
  2. 异步任务阶段的分支提交请求将一步和批量地删除相应的`UNDO LOG`记录

  <img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206292354469.png" alt="image-20220629235419436" style="zoom:67%;" />

- 回滚：

  1. 收到TC的分支回滚请求，开启一个本地事务，然后执行如下步骤的操作
  2. 通过XID和BranchID查找到相应的`UNDO LOG`记录
  3. 进行数据校验：比较`UNDO LOG`中更新后数据的镜像与当前数据，不一致的不能进行回滚，证明数据已经被修改过了
  4. 根据`UNDO LOG`中的前镜像和业务SQL的相关信息生成并执行回滚语句
  5. 提交本地事务，并把事务的执行结果（即分支事务回滚的结果）上报给TC

  <img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206292344788.png" alt="image-20220629234438754" style="zoom: 50%;" />

可以看到，即使第二阶段发生回滚异常，也只需要找到对应的`UNDO_LOG`中的数据并反解析成SQL来达到回滚的目的；同时，这种模式对业务的入侵性也很低，通过代理数据源将业务SQL的执行解析成`UNDO_LOG`来与业务数据的更新同时入库，达到了对业务无侵入的效果。`UNDO_LOG`中的记录大致如下：

```json
{
	"branchId": 641789253,
	"undoItems": [{
		"afterImage": {
			"rows": [{
				"fields": [{
					"name": "id",
					"type": 4,
					"value": 1
				}, {
					"name": "name",
					"type": 12,
					"value": "GTS"
				}, {
					"name": "since",
					"type": 12,
					"value": "2014"
				}]
			}],
			"tableName": "product"
		},
		"beforeImage": {
			"rows": [{
				"fields": [{
					"name": "id",
					"type": 4,
					"value": 1
				}, {
					"name": "name",
					"type": 12,
					"value": "TXC"
				}, {
					"name": "since",
					"type": 12,
					"value": "2014"
				}]
			}],
			"tableName": "product"
		},
		"sqlType": "UPDATE"
	}],
	"xid": "xid:xxx"
}
```

实际上，AT模式的从使用上与XA模式非常类似，除了需要`UNDO_LOG`表之外，仅需要切换数据源为`DataSourceProxy`，就可以完成事务的管理:

```java
@Configuration
public class AccountXADataSourceConfiguration {

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DruidDataSource druidDataSource() {
        return new DruidDataSource();
    }

    @Bean("dataSourceProxy")
    public DataSource dataSource(DruidDataSource druidDataSource) {
        // DataSourceProxy for AT mode
        return new DataSourceProxy(druidDataSource);
    }

    @Bean("jdbcTemplate")
    public JdbcTemplate jdbcTemplate(DataSource dataSourceProxy) {
        return new JdbcTemplate(dataSourceProxy);
    }

    @Bean
    public PlatformTransactionManager txManager(DataSource dataSourceProxy) {
        return new DataSourceTransactionManager(dataSourceProxy);
    }

}
```

### Seata TCC模式

实际上，Seata的AT模式基本上能满足我们分布式事务80%的需求，但涉及不支持事务的数据库与中间件（如redis）等的操作，或AT模式暂未支持的数据库（目前AT支持MySQL、Oracle与PostgreSQL）、跨公司服务的调用、跨语言的应用调用或有手动控制整个二阶段提交的需求，则需要结合TCC模式，不仅如此，TCC模式还支持与AT模式混合使用。

一个分布式的全局事务，整体是两阶段提交Try-[Confirm/cancel]的模型。在Seata中，AT模式与TCC模式事实上也是两阶段提交的具体实现，它们的区别在于：AT模式基于支持本地ACID事务的关系型数据库（目前支持MySQL、Oracle与PostgreSLQ）：

一阶段prepare行为：在本地事务中，一并提交业务数据更新和相应回滚日志记录。二阶段commit行为：马上成功结束，自动异步批量清理回滚日志。二阶段rollback行为：通过回滚日志，自动生成补偿操作，完成数据回滚。

相应的，TCC模式，不依赖于底层数据源的事务支持：

一阶段prepare行为：调用自定义的prepare逻辑。二阶段commit行为：调用自定义的commit逻辑。二阶段rollback行为：调用自定义的rollback逻辑。

所以TCC模式，本质上来说，是指支持把自定义的分支事务纳入到全局事务的管理中。简单来讲，可以说Seata的TCC模式就是手工的AT模式，它允许自定义两阶段的处理逻辑而不依赖AT模式的`UNDO_LOG`。

这里我们使用Spring Cloud + Feign，此处使用`@LocalTCC`注解，值得注意的是`@LocalTCC`一定要注解在接口上，此接口可以是寻常的业务接口，只要实现了TCC的两阶段提交对应方法即可，TCC相关的注解如下：

- `@LocalTCC`适用于Spring Cloud + Feign模式下的TCC
- `@TwoPhaseBusinessAction`注解try方法，其中那么为当前tcc方法的bean名称，写方法名便可（全局唯一），CommitMethod指向提交方法，rollbackMethod指向事务回滚方法。指定好三个方法之后，seata会根据全局事务的成功或失败，去帮我们自动调用提交方法或者回滚方法
- `@BusinessActionContextParamter`注解可以将参数传递到二阶段
- `BusinessActionContext`指的是TCC事务的上下文

实例如下：

```java
/**
 * 这里定义tcc的接口
 * 一定要定义在接口上
 * 我们使用springCloud的远程调用
 * 那么这里使用LocalTCC便可
 *
 * @author tanzj
 */
@LocalTCC
public interface TccService {
 
    /**
     * 定义两阶段提交
     * name = 该tcc的bean名称,全局唯一
     * commitMethod = commit 为二阶段确认方法
     * rollbackMethod = rollback 为二阶段取消方法
     * BusinessActionContextParameter注解 传递参数到二阶段中
     *
     * @param params  -入参
     * @return String
     */
    @TwoPhaseBusinessAction(name = "insert", commitMethod = "commitTcc", rollbackMethod = "cancel")
    String insert(
            @BusinessActionContextParameter(paramName = "params") Map<String, String> params
    );
 
    /**
     * 确认方法、可以另命名，但要保证与commitMethod一致
     * context可以传递try方法的参数
     *
     * @param context 上下文
     * @return boolean
     */
    boolean commitTcc(BusinessActionContext context);
 
    /**
     * 二阶段取消方法
     *
     * @param context 上下文
     * @return boolean
     */
    boolean cancel(BusinessActionContext context);
}
```



```java
@Slf4j
@RestController
public class TccServiceImpl implements  TccService {
 
    @Autowired
    TccDAO tccDAO;
 
    /**
     * tcc服务t（try）方法
     * 根据实际业务场景选择实际业务执行逻辑或者资源预留逻辑
     *
     * @param params - name
     * @return String
     */
    @Override
    @PostMapping("/tcc-insert")
    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public String insert(@RequestBody Map<String, String> params) {
        log.info("xid = " + RootContext.getXID());
        //todo 实际的操作，或操作MQ、redis等
        tccDAO.insert(params);
        //放开以下注解抛出异常
        //throw new RuntimeException("服务tcc测试回滚");
        return "success";
    }
 
    /**
     * tcc服务 confirm方法
     * 若一阶段采用资源预留，在二阶段确认时要提交预留的资源
     *
     * @param context 上下文
     * @return boolean
     */
    @Override
    public boolean commitTcc(BusinessActionContext context) {
        log.info("xid = " + context.getXid() + "提交成功");
        //todo 若一阶段资源预留，这里则要提交资源
        return true;
    }
 
    /**
     * tcc 服务 cancel方法
     *
     * @param context 上下文
     * @return boolean
     */
    @Override
    public boolean cancel(BusinessActionContext context) {
        //todo 这里写中间件、非关系型数据库的回滚操作
        System.out.println("please manually rollback this data:" + context.getActionContext("params"));
        return true;
    }
}
```

### Seata Saga模式

Saga模式是Seata提供的长事务解决方案，在Saga模式中，业务流程中的每个参与者都提交本地事务，当出现某一个参与者失败则补偿前面已经成功的参与者，一阶段正向服务和二阶段补偿服务都由业务开发实现，其整个过程可以如下所示：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202207042333555.png" alt="image-20220704233329517" style="zoom:33%;" />

目前Seata提供的Saga模式是基于状态机引擎来实现的，机制是：

1. 通过状态图来定义服务调用的流程并生成json状态语言定义文件

2. 状态图中的一个节点可以是调用一个服务，节点可以配置它的补偿节点

3. 状态图json由状态机引擎驱动执行，当出现异常时状态引擎反向执行已成功节点对应的补偿节点将事务回滚

   > 注意：异常发生时是否进行补偿也可由用户自定义决定

4. 可以实现服务编排需求，支持单项选择、并发、子流程、参数转换、参数映射、服务执行状态判断、异常捕获等功能

状态图示例：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202207042343857.png" alt="image-20220704234350818" style="zoom:50%;" />

下面我们来看一个具体的例子，假设业务流程如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202207010011608.png" alt="image-20220701001139566" style="zoom: 50%;" />

在这例子中，一个分布式事务内有两个参与者，分别是InventoryAction和BalanceAction；当分布式事务提交则两者均提交，回滚时则两者均回滚。

InventoryAction接口的定义如下：

```java
public interface InventoryAction {

    /**
     * reduce
     * @param businessKey
     * @param amount
     * @param params
     * @return
     */
    boolean reduce(String businessKey, BigDecimal amount, Map<String, Object> params);

    /**
     * compensateReduce
     * @param businessKey
     * @param params
     * @return
     */
    boolean compensateReduce(String businessKey, Map<String, Object> params);
}
```

其对应的实现如下：

```java
public class InventoryActionImpl implements InventoryAction {

    private static final Logger LOGGER = LoggerFactory.getLogger(InventoryActionImpl.class);

    @Override
    public boolean reduce(String businessKey, int count) {
        LOGGER.info("reduce inventory succeed, count: " + count + ", businessKey:" + businessKey);
        return true;
    }

    @Override
    public boolean compensateReduce(String businessKey) {
        LOGGER.info("compensate reduce inventory succeed, businessKey:" + businessKey);
        return true;
    }
}
```

BalanceAction接口的定义如下：

```java
public interface BalanceAction {

    /**
     * reduce
     *
     * @param businessKey
     * @param amount
     * @param params
     * @return
     */
    boolean reduce(String businessKey, BigDecimal amount, Map<String, Object> params);

    /**
     * compensateReduce
     *
     * @param businessKey
     * @param params
     * @return
     */
    boolean compensateReduce(String businessKey, Map<String, Object> params);

}
```

其对应的实现如下：

```java
public class BalanceActionImpl implements BalanceAction {

    private static final Logger LOGGER = LoggerFactory.getLogger(BalanceActionImpl.class);

    @Override
    public boolean reduce(String businessKey, BigDecimal amount, Map<String, Object> params) {
        if(params != null) {
            Object throwException = params.get("throwException");
            if (throwException != null && "true".equals(throwException.toString())) {
                throw new RuntimeException("reduce balance failed");
            }
        }
        LOGGER.info("reduce balance succeed, amount: " + amount + ", businessKey:" + businessKey);
        return true;
    }

    @Override
    public boolean compensateReduce(String businessKey, Map<String, Object> params) {
        if(params != null) {
            Object throwException = params.get("throwException");
            if (throwException != null && "true".equals(throwException.toString())) {
                throw new RuntimeException("compensate reduce balance failed");
            }
        }
        LOGGER.info("compensate reduce balance succeed, businessKey:" + businessKey);
        return true;
    }
}
```

这个场景对应的状态图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202207042347780.png" alt="image-20220704234721744" style="zoom: 50%;" />

如果用json来表示：

```json
{
    "Name": "reduceInventoryAndBalance",
    "Comment": "reduce inventory then reduce balance in a transaction",
    "StartState": "ReduceInventory",
    "Version": "0.0.1",
    "States": {
        "ReduceInventory": {
            "Type": "ServiceTask",
            "ServiceName": "inventoryAction",
            "ServiceMethod": "reduce",
            "CompensateState": "CompensateReduceInventory",
            "Next": "ChoiceState",
            "Input": [
                "$.[businessKey]",
                "$.[count]"
            ],
            "Output": {
                "reduceInventoryResult": "$.#root"
            },
            "Status": {
                "#root == true": "SU",
                "#root == false": "FA",
                "$Exception{java.lang.Throwable}": "UN"
            }
        },
        "ChoiceState":{
            "Type": "Choice",
            "Choices":[
                {
                    "Expression":"[reduceInventoryResult] == true",
                    "Next":"ReduceBalance"
                }
            ],
            "Default":"Fail"
        },
        "ReduceBalance": {
            "Type": "ServiceTask",
            "ServiceName": "balanceAction",
            "ServiceMethod": "reduce",
            "CompensateState": "CompensateReduceBalance",
            "Input": [
                "$.[businessKey]",
                "$.[amount]",
                {
                    "throwException" : "$.[mockReduceBalanceFail]"
                }
            ],
            "Output": {
                "compensateReduceBalanceResult": "$.#root"
            },
            "Status": {
                "#root == true": "SU",
                "#root == false": "FA",
                "$Exception{java.lang.Throwable}": "UN"
            },
            "Catch": [
                {
                    "Exceptions": [
                        "java.lang.Throwable"
                    ],
                    "Next": "CompensationTrigger"
                }
            ],
            "Next": "Succeed"
        },
        "CompensateReduceInventory": {
            "Type": "ServiceTask",
            "ServiceName": "inventoryAction",
            "ServiceMethod": "compensateReduce",
            "Input": [
                "$.[businessKey]"
            ]
        },
        "CompensateReduceBalance": {
            "Type": "ServiceTask",
            "ServiceName": "balanceAction",
            "ServiceMethod": "compensateReduce",
            "Input": [
                "$.[businessKey]"
            ]
        },
        "CompensationTrigger": {
            "Type": "CompensationTrigger",
            "Next": "Fail"
        },
        "Succeed": {
            "Type":"Succeed"
        },
        "Fail": {
            "Type":"Fail",
            "ErrorCode": "PURCHASE_FAILED",
            "Message": "purchase failed"
        }
    }
}
```

由于Saga事务不保证事务的隔离性，在极端情况下可能由于脏写无法完成回滚操作，比如一个极端的例子，分布式事务内先给用户A充值，然后给用户B扣减余额，如果在给A用户充值成功，在事务提交以前，A用户把余额消费掉了，如果事务发生回滚，这时就没有办法进行补偿了。这就是缺乏隔离性造成的典型问题，实践中一般的应对方法时：

- 业务流程设计时遵循“宁可长款，不可短款”的原则，长款意思是客户少了钱，机构多了钱，以机构信誉可以给客户退款，反之则是短款，少的钱可能追不回来了。所以在业务流程设计上一定是先扣款
- 有些业务场景可以允许让业务最终成功，在回滚不了的情况下可以继续重试完成后面的流程，所以状态机引擎出了提供“回滚”能力还需要提供“向前”恢复上下文继续执行的能力，让业务最终执行成功，达到最终一致性的目的

### Seata总结

截止目前为止，不存在一个分布式事务机制可以完美满足所有场景的需求。一致性、可靠性、易用性、性能等诸多方面的系统设计约束，需要用不同的事务处理机制去满足。Seata项目最核心的价值在于：构建一个全面解决分布式事务问题的标准化平台。基于Seata，上层应用架构可以根据实际场景需求，灵活选择合适的分布式事务解决方案。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206292329285.png" alt="image-20220629232951248" style="zoom:50%;" />

不同模式的详细对比：

| 模式     | 优点                                                         | 缺点                                                         | 适用场景                                                     |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| XA模式   | 可以保证事务的强一致性；对业务代码的入侵性低；               | 会长期占有资源的锁，在跨服务的场景下，网络通信的次数和时间消耗会迅速增加，导致系统的吞吐量下降 | 需要保证事务的强一致性；并发量要求不高                       |
| AT模式   | 对资源的锁持续时间较短；对业务代码的入侵性低；               | 不保证事务的强一致性                                         | 适用于绝大部分场景                                           |
| TCC模式  | 无需依赖本地事务；可以手动控制事务的颗粒度                   | 代码具有入侵性；只保证最终一致性的场景                       | 事务的参与者涉及不支持事务的数据库或中间件；跨公司服务、跨语言调用或有手动控制二阶段提交的需求 |
| Saga模式 | 一阶段提交本地事务，无锁，高性能；事件驱动架构，参与者可异步执行，高吞吐；补偿服务易于实现 | 不保证隔离性；代码具有入侵性                                 | 业务流程长、业务流程多；参与者包含其他公司或遗留系统，无法提供TCC模式要求的三个接口 |

# 参考

- [CAP理论](https://www.educative.io/blog/what-is-cap-theorem)
- [分布式事务最经典的七种解决方案](https://segmentfault.com/a/1190000040321750)
- [深入分析分布式事务](https://www.alibabacloud.com/blog/an-in-depth-analysis-of-distributed-transaction-solutions_597232)
- [看了5种分布式事务方案，我司最终选择了 Seata，真香！](https://www.cnblogs.com/chengxy-nds/p/14046856.html)
- [seata官方文档](https://seata.io/zh-cn/docs/dev/mode/at-mode.html)
- [分布式事务 阿里 Seata 参考博客整理](https://www.cxyzjd.com/article/peishaokai/115672235)
- http://seata.io/zh-cn/blog/integrate-seata-tcc-mode-with-spring-cloud.html
