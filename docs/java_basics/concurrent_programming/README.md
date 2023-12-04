# Java并发编程

## JMM实现原理

JMM即Java多线程通信模型-共享内存模型，包含三个方面：

- Java层面
- Jvm层面
- 硬件层面

并发与并行：

- 并行：指同一时刻，有多条指令在多个处理器上同时执行。无论从微观还是宏观来看，二者都是一起执行的
- 并发：指同一时刻，只能有一条执行执行，但多个进程指令会被快速的轮换执行，使得在宏观上具有多个进程同时执行的效果，但在微观上并不是同时执行的，只是把时间分成若干段，使得多个进程快速交替的执行

 并发三大特性：可见性、有序性、原子性；并发要解决的三大问题：同步问题、互斥问题、分工问题。

### 可见性

当一个线程修改了共享变量的值，其他线程能够看到修改的值。Java内存模型是通过在变量修改后将新值同步回主内存，在变量读取前从主内存刷新变量值这种依赖主内存作为传递没接的方法来实现可见性的。

保证可见性的方法：

- 通过volatile关键字保证可见性
- 通过内存屏障保障可见性
- 通过sychronized关键字保证可见性
- 通过Lock保证可见性
- 通过final关键字保证可见性



### 原子性



### 有序性

Java虚拟机规范中定义了Java内存模型，用于屏蔽掉各种硬件和操作系统内存访问差异，以实现让Java程序在各种平台下都能达到一致的并发效果，JMM规范了Java虚拟机与计算机内存是如何协同工作的，即一个线程如何和何时可以看到由其他线程修改过后的共享变量的值，以及在必须时如何同步的访问共享变量。JMM描述的是一种抽象的概念，一组规则，通过这组规则控制程序中各个变量在共享数据区域和私有数据区域的访问方式，JMM是围绕原子性、有序性、可见性展开的。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192143288.png" alt="image-20230119214301158" style="zoom: 67%;" />

Java内存模型与硬件内存架构之间存在差异。硬件内存架构没有区分线程栈和堆。对于硬件，所有的线程栈和堆都分布在主内存中。部分线程栈和堆可能有时候会出现在CPU缓存中和CPU内部的寄存器中。如下图所示，Java内存模型和计算机硬件内存架构是一个交叉关系：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192151147.png" alt="image-20230119215101088" style="zoom:67%;" />

关于主内存和工作内存之间的具体交互协议，即一个变量如何才主内存拷贝到工作内存、如何从工作内存到主内存之间的实现细节，Java内存模型定义了以下八种操作来完成；

- lock（锁定）：作用于主内存的变量，把一个变量标识为一条线程独占状态
- unlock（解锁）作用于主内存变量，把一个处于锁定状态的变量释放出来，释放后的变量才可以被其他线程锁定
- read（读取）：作用于主内存变量，把一个变量值从主内存传输到线程的工作内存中，以便随后的load动作使用
- load（载入）：作用于工作内存的变量，它把read操作从主内存中得到的变量值放入工作内存的变量副本中
- use（使用）：作用于工作内存的变量，把工作内存中一个变量值传递给执行引擎，每当虚拟机遇到一个需要使用变量的值的字节码指令时将会执行这个操作
- assign（赋值）：作用于工作内存的变量，它把一个从执行引擎接收到的值赋值给工作内存的变量，每当虚拟机遇到一个给变量赋值的字节码指令时执行这个操作
- store（存储）；作用于工作内存的变量，把工作内存中的一个变量的值传送到主内存中，以便随后的write的操作
- write（写入）：作用于主内存的变量，它把store操作从工作内存中一个变量的值传送到主内存的变量中

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192202949.png" alt="image-20230119220218821" style="zoom:67%;" />

volatile关键字的C++实现源码：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192236622.png" alt="image-20230119223620590" style="zoom: 33%;" />

可以发现当变量被volitle关键字修饰后，在变量被修改后，会添加一个内存屏障。

内存屏障在Linux系统x86中的实现：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192241561.png" alt="image-20230119224144530" style="zoom: 50%;" />

汇编层面volatile的实现：

```c++
lock;addl $0,0(%%rsp)
```

模板解释器(templateInterpreter)，其对每个指令都写了一段对应的汇编代码，启动时将每个指令与对应汇编代码入口绑定，可以说是效率做到了极致。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192325517.png" alt="image-20230119232513483" style="zoom:67%;" />

lock前缀指令的作用：

1. 确保后续指令执行的原子性。在Pentium及之前的处理器中，带有lock前缀的指令在执行期间会锁住总线，使得其它处理器暂时无法通过总线访问内存，很显然，这个开销很大。在新的处理器中，Intel使用缓存锁定来保证指令执行的原子性，缓存锁定将大大降低lock前缀指令的执行开销
2. lock前缀指令具有类似内存屏障的功能，禁止该指令与前面和后面的读写指令重排序
3. lock前缀指令会等待它之前所有的指令完成、并且所有缓冲的写操作写回内存（也就是将store buffer中的内容写入内存）之后才开始执行，并且根据缓存一执行协议，刷新store buffer的操作会导致其他cache中的副本失效。

<div class="note info">Java中，保证可见性的方式有两种，一种是内存屏障（JVM利用storeLoad，硬件层面利用lock或mfence），另一种是利用上下文切换。</div>

#### 缓存一致性

CPU缓存即高速缓冲存储器，是位于CPU与主存之间的一种容量较小但速度很高的存储器。由于CPU的速度远高于主内存，CPU直接从内存中存取数据需要等待一定时间周期，Cache中保存着CPU刚刚用过或循环使用的一部分数据，当CPU再次使用该部分数据时可以从Cache中直接调用，减少CPU等待时间，提高了系统的效率。

三级缓存的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301281107659.png" alt="image-20230128110746610" style="zoom:50%;" />

计算机体系结构中，缓存一致性是共享资源数据的一致性，这些数据最终存储在多个本地缓存中。当系统中的客户机维护公共内存资源的缓存时，可能会出现数据不一致的问题，这在多处理系统中的CPU尤其如此。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301281116503.png" alt="image-20230128111645468" style="zoom:50%;" />

在共享内存多处理器系统中，每个处理器都有一个单独的缓存内存，共享数据可能有多个副本：一个副本在主内存中，一个副本在请求它的每个处理器的本地缓存中。当数据的一个副本发生更改时，其他副本必须反映该更改。缓存一致性是确保共享操作数（数据）值的变化能够及时地在整个系统中传播的规程。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301281121470.png" alt="image-20230128112108434" style="zoom:50%;" />

缓存一致性的要求：

- 写传播

  对任何缓存中的数据的更改都必须传播到对等缓冲中的其他副本（该缓存中的副本）

- 事务串行化

  对单个内存位置的读/写必须被所有处理器以相同的顺序看到。理论上，一致性可以在加载/存储粒度上执行。然而，在实践中，它通常在缓存块的粒度上执行

- 一致性机制

  确保一致性的两种最常见的机制是窥探机制和基于目录的机制，这两种机制各有优缺点。如果有足够的带宽可用，基于协议的窥探往往会更快，因为所有事务都是处理器看到的请求/响应。其缺点是窥探是不可扩展的。每个请求都必须广播到系统中的所有节点，这意味着随着系统变大，（逻辑或物理）总线的大小及其提供的带宽也必须增加。另一方面，目录往往有更长的延迟（3跳 请求/转发/响应），但使用更少的带宽，因为消息是点对点的，而不是广播的。由于这个原因，许多较大的系统（大于64位处理器）使用这种类型的缓存一致性

JMM的内存可见性保证：

- 单线程程序
- 正确同步的多线程程序
- 未同步/未正确同步的多线程程序

volatile的内存语义总结：

- 可见性：
- 原子性：
- 有序性：

## List、Set、HashMap底层原理

数组查找公式：$a[n]=起始地址+（n*字节数）$。

数组的底层实现：

```java
transient Object[] elementData;
```

ArrayList的扩容机制：

```java
private Object[] grow(int minCapacity) {
  return elementData = Arrays.copyOf(elementData, newCapacity(minCapacity));
}
```

主要思想：空间换时间。

集合类实现序列化接口的目的：

- 网络传输
- 硬盘持久化

<div class="note info">	LinkedList是双向链表。</div>

添加元素效率的对比：如果ArrayList指定了初始容量，那么效率会比LinkedList高，如果ArrayList没有指定初始容量，添加效率会比LinkedList低。

HashMap的特点：key、value存储，key可以为null，同样的key会被覆盖掉。

HashMap的底层存储结构：底层采用数据、链表、红黑树来实现。

用链表是来解决数组小表覆盖的问题（哈希冲突的问题），红黑树是为了解决当哈希冲突比较多的时候，查询效率降低的问题。

HashMap插入元素的方式，JDK7之前：头插法，JDK8以后：尾插法。

头插法和尾插法的对比：[HashMap 链表插入方式](https://www.cnblogs.com/youzhibing/p/13915116.html)。

链表转红黑树的阈值：

```java
static final int TREEIFY_THRESHOLD = 8;
```

当红黑树的元素小于6的时候，又会退化成链表结构：

```java
static final int TREEIFY_THRESHOLD = 8;
```

扩容因子：

```java
static final float DEFAULT_LOAD_FACTOR = 0.75f;
```

JDK8 HashMap put的流程图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301282234950.png" alt="image-20230128223430909" style="zoom: 50%;" />

并发安全的HashMap主要有两个，HashTable和ConcurrentHashMap，HashTable是基于方法级别的synchronized的来实现的。ConcurrentHashMap是基于Node + CAS + Synchronized来实现的。

<div class="note info">ConcurrentHashMap在JDK1.7分段锁来实现。ConcurrentHashMap只是在链表的头结点加锁，锁的粒度更小了。</div>

## 线程池底层原理

线程池执行过程示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301291555948.png" alt="img202301291555948" style="zoom: 67%;" />

线程池底层原理：

```java
    public ThreadPoolExecutor(int corePoolSize,
                              int maximumPoolSize,
                              long keepAliveTime,
                              TimeUnit unit,
                              BlockingQueue<Runnable> workQueue,
                              ThreadFactory threadFactory,
                              RejectedExecutionHandler handler) {
    }
```

线程池参数解析：

- corePoolSize：核心线程数
- maximumPoolSize：最大线程数
- keepAliveTime：最大线程数的存活时间
- unit：时间单位
- workQueue：阻塞队列
- threadFactory：线程工厂
- handler：拒绝策略

提交任务的源码：

```java
public void execute(Runnable command) {
    if (command == null)
        throw new NullPointerException();
    
    int c = ctl.get();
    if (workerCountOf(c) < corePoolSize) {
        if (addWorker(command, true))
            return;
        c = ctl.get();
    }
    // offer方法和add方法的区别在于，add方法会抛出非法一场，offer方法则会返回false
    if (isRunning(c) && workQueue.offer(command)) {
        int recheck = ctl.get();
        // 双重检测
        if (! isRunning(recheck) && remove(command))
            reject(command);
        else if (workerCountOf(recheck) == 0)
            addWorker(null, false);
    }
    else if (!addWorker(command, false))
        // 拒绝方法
        reject(command);
}
```

ThreadPoolExecutor的拒绝策略：

- AbortPolicy
- CallerRunsPolicy
- DiscardOldestPolicy
- DiscardPolicy

## 深入理解Java线程

一个线程就是一个CPU可以执行的指令序列。

从操作系统的视角来看，分配资源的最小单位是进程，线程是CPU调度的最小单位。

进程间通信方式：

- 管道及有名管道
- 信号
- 消息队列
- 共享内存
- 信号量
- 套接字

线程同步：是指线程之间所具有的一种制约关系，一个线程的执行依赖于另一个线程的消息，当它没有得到另一个线程的消息时应等待，直到消息到达时才被唤醒。

线程互斥是指对于共享的进程系统资源，在各单个线程访问时的排他性。当有若干个线程都要使用某一共享资源时，任何时刻最多只允许一个线程去使用，其他要使用该资源的线程必须等待，直到占用资源者释放该资源，线程互斥可以看成是一种特殊的线程同步。

四种线程同步互斥的控制方法：

- 临界区：通过对多线程的串行化来访问公共资源或一段代码，速度快，适合控制数据访问（在一段时间内只允许一个线程访问的资源就称为临界资源）
- 互斥量：为协调共同对一个共享资源的单独访问而设计的
- 信号量：为控制一个具有有限数量用户资源而设计
- 事件：用来通知线程有一些事件已发生，从而启动后继任务的开始

操作系统层面的线程生命周期可以用“五态模型”来描述，这个五种状态分别是：初始状态、可运行状态、运行状态、休眠状态和终止状态。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301292249000.png" alt="image-20230129224929932" style="zoom:50%;" />

Java层面线程共有六种状态：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301292250307.png" alt="img" style="zoom:60%;" />



Java中创建线程的方式：

- Thread
- Runnable
- Callable

本质上都是调用Thread#start方法，线程真正创建线程的过程如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301292337187.png" alt="image-20230129233740130" style="zoom:67%;" />

Java的线程是内核级别的线程，而不是用户态的线程，这就是为什么说Java的线程比较重的原因。

![img202301292342409](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301292342409.png)

协程是轻量级的线程，是用户态的，不会切换到内核态。

优雅的停止线程：

- ~~stop方法，过于暴力，会释放对象锁，可能会造成数据不一致的问题。~~
- interrupt，将线程的中断标志和设置为true，不会停止线程
- java.lang.Thread#isInterrupted()，判断当前线程的中断标志位是否位true，并清除中断标志位，重置为fasle

可以手动判断线程的中断标识位，停止线程。

<div class="note info">Thread#sleep方法会清除中断标识。</div>

Java线程间通信主要有两种：

- volatile
- 等待唤醒机制
  - wait和notify
  - AQS中的await和signal
- 管道输入输出流
- Thread#join（基于等待唤醒机制）

notify主要两个缺陷：一个是必须配合sychronized使用，另一个是无法指令唤醒的线程具体是哪一个，但LockSupport可以解决这两个问题：

```java
LockSupport.unpark(threadName);
```

## CAS与Atomic实现原理

### CAS源码解析

CAS通常指的是这样一种原子操作，针对一个变量，首先比较它的内存值与某个期望值是否相同，如果相同，就给他赋一个新值。

CAS的伪代码如下：

```java
if (value == expectedValue) {
  value = newValue;
}
```

CAS的过程如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301312308092.jpeg" alt="img" style="zoom: 67%;" />

Java中的CAS操作：

![img202301312316047](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301312316047.png)

Hotspot 虚拟机对compareAndSwapInt 方法的实现如下：

```c++
#unsafe.cpp
UNSAFE_ENTRY(jboolean, Unsafe_CompareAndSwapInt(JNIEnv *env, jobject unsafe, jobject obj, jlong offset, jint e, jint x))
  UnsafeWrapper("Unsafe_CompareAndSwapInt");
  oop p = JNIHandles::resolve(obj);
  // 根据偏移量，计算value的地址
  jint* addr = (jint *) index_oop_from_field_offset_long(p, offset);
  // Atomic::cmpxchg(x, addr, e) cas逻辑 x:要交换的值   e:要比较的值
  //cas成功，返回期望值e，等于e,此方法返回true 
  //cas失败，返回内存中的value值，不等于e，此方法返回false
  return (jint)(Atomic::cmpxchg(x, addr, e)) == e;
```

核心逻辑在Atomic::cmpxchg方法中，这个根据不同操作系统和不同CPU会有不同的实现。这里我们以linux_64x的为例，查看Atomic::cmpxchg的实现：

```java
#atomic_linux_x86.inline.hpp
inline jint     Atomic::cmpxchg    (jint     exchange_value, volatile jint*     dest, jint     compare_value) {
  //判断当前执行环境是否为多处理器环境
  int mp = os::is_MP();
  //LOCK_IF_MP(%4) 在多处理器环境下，为 cmpxchgl 指令添加 lock 前缀，以达到内存屏障的效果
  //cmpxchgl 指令是包含在 x86 架构及 IA-64 架构中的一个原子条件指令，
  //它会首先比较 dest 指针指向的内存值是否和 compare_value 的值相等，
  //如果相等，则双向交换 dest 与 exchange_value，否则就单方面地将 dest 指向的内存值交给exchange_value。
  //这条指令完成了整个 CAS 操作，因此它也被称为 CAS 指令。
  __asm__ volatile (LOCK_IF_MP(%4) "cmpxchgl %1,(%3)"
                    : "=a" (exchange_value)
                    : "r" (exchange_value), "a" (compare_value), "r" (dest), "r" (mp)
                    : "cc", "memory");
  return exchange_value;
```

> cmpxchgl的详细执行过程：
>
> 首先，输入是"r" (exchange_value), “a” (compare_value), “r” (dest), “r” (mp)，表示compare_value存入eax寄存器，而exchange_value、dest、mp的值存入任意的通用寄存器。嵌入式汇编规定把输出和输入寄存器按统一顺序编号，顺序是从输出寄存器序列从左到右从上到下以“%0”开始，分别记为%0、%1···%9。也就是说，输出的eax是%0，输入的exchange_value、compare_value、dest、mp分别是%1、%2、%3、%4。
>
> 因此，cmpxchg %1,(%3)实际上表示cmpxchg exchange_value,(dest)
>
> 需要注意的是cmpxchg有个隐含操作数eax，其实际过程是先比较eax的值(也就是compare_value)和dest地址所存的值是否相等，
>
> 输出是"=a" (exchange_value)，表示把eax中存的值写入exchange_value变量中。
>
> Atomic::cmpxchg这个函数最终返回值是exchange_value，也就是说，如果cmpxchgl执行时compare_value和dest指针指向内存值相等则会使得dest指针指向内存值变成exchange_value，最终eax存的compare_value赋值给了exchange_value变量，即函数最终返回的值是原先的compare_value。此时Unsafe_CompareAndSwapInt的返回值(jint)(Atomic::cmpxchg(x, addr, e)) == e就是true，表明CAS成功。如果cmpxchgl执行时compare_value和(dest)不等则会把当前dest指针指向内存的值写入eax，最终输出时赋值给exchange_value变量作为返回值，导致(jint)(Atomic::cmpxchg(x, addr, e)) == e得到false，表明CAS失败。

现代处理器指令集架构基本上都会提供 CAS 指令，例如 x86 和 IA-64 架构中的 cmpxchgl 指令和 comxchgq 指令，sparc 架构中的 cas 指令和 casx 指令。

不管是 Hotspot 中的 Atomic::cmpxchg 方法，还是 Java 中的 compareAndSwapInt 方法，它们本质上都是对相应平台的 CAS 指令的一层简单封装。CAS 指令作为一种硬件原语，有着天然的原子性，这也正是 CAS 的价值所在。

CAS 虽然高效地解决了原子操作，但是还是存在一些缺陷的，主要表现在三个方面：

- 自旋 CAS 长时间地不成功，则会给 CPU 带来非常大的开销
- 只能保证一个共享变量原子操作
- ABA 问题

ABA问题：当有多个线程对一个原子类进行操作的时候，某个线程在短时间内将原子类的值A修改为B，又马上将其修改为A，此时其他线程不感知，还是会修改成功。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302012315195.png" alt="image-20230201231526120" style="zoom:50%;" />

ABA问题示例：

```java
package com.concurrent;

import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.atomic.AtomicMarkableReference;
import java.util.concurrent.atomic.AtomicStampedReference;
import java.util.concurrent.locks.LockSupport;

/**
 * 与钱相关的业务 ABA问题比较重要
 * 也可以使用{@link AtomicMarkableReference} 简化，这样可以不关心修改过几次，仅仅关心是否修改过。因此变量mark是boolean类型，仅记录值是否有过修改。
 */
@Slf4j
public class AtomicStampedReferenceTest {

    public static void main(String[] args) {
        // 定义AtomicStampedReference    Pair.reference值为1, Pair.stamp为1
        AtomicStampedReference atomicStampedReference = new AtomicStampedReference(1, 1);

        new Thread(() -> {
            int[] stampHolder = new int[1];
            int value = (int) atomicStampedReference.get(stampHolder);
            int stamp = stampHolder[0];
            log.debug("Thread1 read value: " + value + ", stamp: " + stamp);

            // 阻塞1s
            LockSupport.parkNanos(1000000000L);
            // Thread1通过CAS修改value值为3
            if (atomicStampedReference.compareAndSet(value, 3, stamp, stamp + 1)) {
                log.debug("Thread1 update from " + value + " to 3");
            } else {
                log.debug("Thread1 update fail!");
            }
        }, "Thread1").start();

        new Thread(() -> {
            int[] stampHolder = new int[1];
            int value = (int) atomicStampedReference.get(stampHolder);
            int stamp = stampHolder[0];
            log.debug("Thread2 read value: " + value + ", stamp: " + stamp);
            // Thread2通过CAS修改value值为2
            if (atomicStampedReference.compareAndSet(value, 2, stamp, stamp + 1)) {
                log.debug("Thread2 update from " + value + " to 2");

                // do something

                value = (int) atomicStampedReference.get(stampHolder);
                stamp = stampHolder[0];
                log.debug("Thread2 read value: " + value + ", stamp: " + stamp);
                // Thread2通过CAS修改value值为1
                if (atomicStampedReference.compareAndSet(value, 1, stamp, stamp + 1)) {
                    log.debug("Thread2 update from " + value + " to 1");
                }
            }
        }, "Thread2").start();
    }
}
```

### Atomic源码解析

在java.util.concurrent.atomic包里提供了一组原子操作类：

- 基本类型：AtomicInteger、AtomicLong、AtomicBoolean；
- 引用类型：AtomicReference、AtomicStampedRerence、AtomicMarkableReference；
- 数组类型：AtomicIntegerArray、AtomicLongArray、AtomicReferenceArray
- 对象属性原子修改器：AtomicIntegerFieldUpdater、AtomicLongFieldUpdater、AtomicReferenceFieldUpdater
- 原子类型累加器（jdk1.8增加的类）：DoubleAccumulator、DoubleAdder、LongAccumulator、LongAdder、Striped64

LongAdder和DoubleAdder在高并发的情况下，性能提升明显：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302012355003.png" alt="image-20230201235524933" style="zoom: 50%;" />

LongAdder内部有一个base变量，一个cell[]数组：

- base变量：非竞态条件下，直接累加到该变量上
- Cell[]数组：竞态条件下，累加个各个线程自己的槽Cell[i]中

```java
/** Number of CPUS, to place bound on table size */
// CPU核数，用来决定槽数组的大小
static final int NCPU = Runtime.getRuntime().availableProcessors();

/**
 * Table of cells. When non-null, size is a power of 2.
 */
 // 数组槽，大小为2的次幂
transient volatile Cell[] cells;

/**
 * Base value, used mainly when there is no contention, but also as
 * a fallback during table initialization races. Updated via CAS.
 */
 /**
 *  基数，在两种情况下会使用：
 *  1. 没有遇到并发竞争时，直接使用base累加数值
 *  2. 初始化cells数组时，必须要保证cells数组只能被初始化一次（即只有一个线程能对cells初始化），
 *  其他竞争失败的线程会讲数值累加到base上
 */
transient volatile long base;

/**
 * Spinlock (locked via CAS) used when resizing and/or creating Cells.
 */
```

定义了一个内部Cell类，这就是我们之前所说的槽，每个Cell对象存有一个value值，可以通过Unsafe来CAS操作它的值：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302020002185.png" style="zoom:60%;" />

添加方法的源代码：

```java
    public void add(long x) {
        Cell[] cs; long b, v; int m; Cell c;
        if ((cs = cells) != null || !casBase(b = base, b + x)) {
            boolean uncontended = true;
            if (cs == null || (m = cs.length - 1) < 0 ||
                (c = cs[getProbe() & m]) == null ||
                !(uncontended = c.cas(v = c.value, v + x)))
                longAccumulate(x, null, uncontended);
        }
    }
```

LongAdder#add方法的逻辑如下图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302022326869.png" alt="image-20230202232649807" style="zoom:50%;" />

只有从未出现过并发冲突的时候，base基数才会使用到，一旦出现了并发冲突，之后所有的操作都只针对Cell[]数组中的单元Cell。

如果Cell[]数组未初始化，会调用父类的longAccumelate去初始化Cell[]，如果Cell[]已经初始化但是冲突发生在Cell单元内，则也调用父类的longAccumelate，此时可能就需要对Cell[]扩容了。

这也是LongAdder设计的精妙之处：尽量减少热点冲突，不到最后万不得已，尽量将CAS操作延迟。

整个Striped64#longAccumulate的流程图如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302022326537.png" alt="image-20230202232604460" style="zoom:67%;" />

## synchronized实现原理

### synchronized基础

Java中对静态变量的自增、自减并不是原子操作。

i++的JVM字节码指令：

```java
getstatic i // 获取静态变量i的值 
iconst_1 // 将int常量1压入操作数栈
iadd // 自增 
```

i--的JVM字节码指令：

```java
getstatic i // 获取静态变量i的值 
iconst_1 // 将int常量1压入操作数栈
isub // 自减 
```

一个程序运行多个线程本身是没有问题的，问题出在多个线程访问共享资源：

- 多个线程读共享其实也没有问题
- 在多个线程对共享资源读写操作时发生指令交错，就会出现问题

一段代码块如果存在对共享资源的多线程读写操作，就称这段代码块为临界区，其共享资源为临界资源。

```java
//临界资源
private static int counter = 0;

public static void increment() { //临界区
    counter++;
}

public static void decrement() {//临界区
    counter--;
}
```

多个线程在临界区内执行，由于代码的执行序列不同而导致结果无法预测，称之为发生了竞态条件，为了避免临界区的竞态条件发生，有多种手段可以达到目的：

- 阻塞式的解决方案：synchronized、Lock
- 非阻塞式的解决方案：原子变量（CAS）

<div class="note warning">虽然Java中互斥和同步都可以采用synchronized关键字来完成，但它们还是有区别的：互斥是保证临界区的竞态条件发生，同一时刻只能有一个线程执行临界区代码，同步是由于线程执行的先后、顺序不同、需要一个线程等待其它线程运行到某个点。</div>

synchronized同步块是Java提供的一种原子性内置锁，Java中的每个对象都可以把它当作一个同步锁来使用，这些Java内置的使用者看不到的锁被称为内置锁，也叫做监视器锁。

synchronized加锁方式：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302051057440.png" style="zoom:67%;" />

对于上面的例子，可以使用synchroized来解决临界区资源共享的问题：

```java
/*********************
 *  方式一
*******************/
public static synchronized void increment() {
    counter++;
}

public static synchronized void decrement() {
    counter--;
}
/*********************
 *  方式二
*******************/
private static String lock = "";

public static void increment() {
    synchronized (lock){
        counter++;
    }
}

public static void decrement() {
    synchronized (lock) {
        counter--;
    }
}
```

### Monitor机制

synchronized是JVM内置锁，基于Monitor机制实现，依赖底层操作系统的互斥原语Mutex（互斥量），它是一个重量级锁，性能较低。后来，synchronized在JDK1.5之后版本做了重大的优化，如锁粗化、锁消除、轻量级锁、偏向锁、自适应自旋等技术来减少锁操作的开销，内置锁的并发性能已经基本与Lock持平。

同步方法是通过方法中的access_flags中设置ACC_SYNCHRONIZED标志来实现；同步代码块是通过monitorenter和monitorexit来实现。两个指令的执行是JVM通过调用操作系统的互斥源于meutex来实现。被阻塞的线程会被挂起、等待重新调度，会导致“用户态”和“内核态”两个态之间来回切换，对性能有较大影响。

Monitor，直译为“监视器”，在操作系统领域一般翻译为“管程“。管程是指管理共享变量以及对共享变量操作的过程，让它们支持并发。在Java1.5之前，Java语言提供的唯一并发语言就是管程，Java1.5之后提供的SDK并发包也是以管程为基础的。除了Java之外，C/C++、C#等高级语言也都是支持管程的。sychronized关键字和wait()、notify()、notifyAll()这三个方法是Java中管程技术的组成部分。

在管程的发展史上，先后出现过三种不同的管程模型，分别是Hasen模型、Hoare模型和MESA模型。现在广泛使用的是MESA模型。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302051126471.png" alt="img202302051126471" style="zoom:67%;" />

管程中引入了条件变量的概念，而且每个条件变量都对应有一个等待队列。条件变量个等待队列的作用是解决线程之间的同步问题。

对于MESA管程来说，有一个编程范式：

```java
while(条件不满足) {
  wait();
}
```

唤醒时间和获取到锁继续执行的时间是不一致的，被唤醒的线程再次执行时可能条件又不满足了，所以循环校验条件。MESA模型的wait()方法还有一个超时参数，为了避免线程进入等待队列永久阻塞。

notify和notifyAll分别何时使用：

- 所有等待线程拥有相同的等待条件
- 所有等待线程被唤醒后，执行相同的操作
- 只需要唤醒一个线程

```c++
ObjectMonitor() {
    _header       = NULL; //对象头  markOop
    _count        = 0;  
    _waiters      = 0,   
    _recursions   = 0;   // 锁的重入次数 
    _object       = NULL;  //存储锁对象
    _owner        = NULL;  // 标识拥有该monitor的线程（当前获取锁的线程） 
    _WaitSet      = NULL;  // 等待线程（调用wait）组成的双向循环链表，_WaitSet是第一个节点
    _WaitSetLock  = 0 ;    
    _Responsible  = NULL ;
    _succ         = NULL ;
    _cxq          = NULL ; //多线程竞争锁会先存到这个单向链表中 （FILO栈结构）
    FreeNext      = NULL ;
    _EntryList    = NULL ; //存放在进入或重新进入时被阻塞(blocked)的线程 (也是存竞争锁失败的线程)
    _SpinFreq     = 0 ;
    _SpinClock    = 0 ;
    OwnerIsThread = 0 ;
    _previous_owner_tid = 0;
}
```

Java中Monitor的工作流程：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302051156728.png" alt="img202302051156728" style="zoom: 67%;" />

>在获取锁时，是将当前线程插入到cxq的头部，而释放锁时，默认策略（QMode=0）是：如果EntryList为空，则将cxq中的元素按原有顺序插入到EntryList，并唤醒第一个线程，也就是当EntryList为空时，是后来的线程先获取锁。_EntryList不为空，直接从_EntryList中唤醒线程。

重量级锁阻塞挂起的方法：`pthread_cond_wait`。

### 对象头

Hotspot虚拟机中，对象在内存中存储的布局可以分为三块区域：对象头（Header）、实例数据（Instance Data）和对其填充（Padding）。

- 对象头：比如hash码，对象所属的年代，对象锁，锁状态标志，偏向锁（线程）ID，偏向时间，数组长度（数组对象才有）等
- 实例数据：存放类的属性数据信息，包括父类的属性信息
- 对其填充：由于虚拟机要求对象起始地址必须是8字节的整数倍。填充数据不是必须存在的，仅仅是为了字节对齐

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302051752044.png" alt="img202302051752044" style="zoom:67%;" />

HotSpot虚拟机的对象头包括：

- Mark Word

  用于存储对象自身的运行时数据，如哈希码（HashCode）、GC分代年龄、锁状态标志、线程持有的锁、偏向线程ID、偏向时间戳等，这部分数据的长度在32位和64位虚拟机中分别为32bit和64bit，官方称它为“Mark Word”

- Klass Pointer

  对象头的另一部分是klass类型指针，即对象指向它的类元数据的指针，虚拟机通过这个指针来确定这个对象是哪个类的实例。32位4字节，64位开启指针压缩或最大堆内存<32g时4字节，否则8字节。JDK默认开启指针压缩后位4字节，当在JVM参数中关闭指针压缩（`-XX:-UseCompressedOops`）后，长度为8字节

- 数组长度（只有数组对象有）

  如果对象是一个数组，那还在对象头中还必须有一块数据用于记录数组长度。占据4字节

<div class="note info">new Object()在64位的操作系统的内存中占几8（对象头）+4（元数据指针）+4（对齐填充）=16个字节。</div>

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302051801632.png" alt="img" style="zoom:67%;" />

32位JVM下的对象结构描述：

![img202302051803988](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302051803988.png)

64位JVM下的对象结构描述：

![img202302051804552](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302051804552.png)

Mark Word中锁标记枚举：

```java
enum { locked_value             = 0,    //00 轻量级锁 
         unlocked_value           = 1,   //001 无锁
         monitor_value            = 2,   //10 监视器锁，也叫膨胀锁，也叫重量级锁
         marked_value             = 3,   //11 GC标记
         biased_lock_pattern      = 5    //101 偏向锁
     }
```

含义如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302051813472.png" alt="img202302051813472" style="zoom:80%;" />

### 偏向锁

偏向锁是一种针对加锁操作的优化手段，经过研究发现，在大多数情况下，锁不仅不存在多线程竞争，而且总是由同一线程多次获得，因此为了消除数据在无竞争情况下锁重入（CAS操作）的开销而引入偏向锁。对于没有锁竞争的场合，偏向锁有很好的优化效果。

```java
/***StringBuffer内部同步***/
public synchronized int length() { 
   return count; 
} 
//System.out.println 无意识的使用锁 
public void println(String x) { 
  synchronized (this) {
     print(x); newLine(); 
  } 
}
```

当JVM启用了偏向锁模式（jdk6默认开启），新创建对象的Mark Word中的Thread ID为0，说明此时处于可偏向但未偏向任何线程，也叫做匿名偏向状态。

偏向锁模式存在偏向锁延迟机制：HotSpot虚拟机在启动后有4s的延迟才会对每个新建的对象开启偏向锁模式。JVM启动时会进行一系列的复杂活动，比如装在配置，系统类初始化等等。在这个过程中会使用大量synchronized关键字对对象加锁，且这些锁大多数都不是偏向锁。为了减少初始化时间，JVM默认延时加载偏向锁。

```bash
/关闭延迟开启偏向锁
-XX:BiasedLockingStartupDelay=0
//禁止偏向锁
-XX:-UseBiasedLocking 
//启用偏向锁
-XX:+UseBiasedLocking
```

倘若偏向锁失败，虚拟机并不会立即升级为重量级锁，它还会尝试使用一种称为轻量级锁的优化手段，此时Mark Word的结构也变为轻量级锁的结构。轻量级锁所适应的场景是线程交替执行同步块的场合，如果存在同一时间多个线程访问同一把锁的场合，就会导致轻量级锁膨胀为重量级锁。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302052052179.png" alt="img202302052052179" style="zoom:67%;" />

锁升级过程：

![50983e6e-6943-4291-97ee-8288eeb40be2](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302052351892.jpg)

从偏向锁的加锁和解锁过程中可以看出，当只有一个线程反复进入同步块时，偏向锁带来的性能开销基本可以忽略，但是当有其他线程尝试获取锁时，JVM就需要等到安全点时，再将偏向锁撤销为无锁状态或升级为轻量级锁，这个过程会消耗一定的性能，所以在多线程竞争频繁的情况下，偏向锁不仅不能提高性能，还会导致性能下降。于是，就有了批量重偏向与批量撤销的机制。

以class为单位，为每个class维护一个偏向锁撤销计数器，每一次该class的对象发生偏向锁撤销操作时，该计数器+1，当这个值达到重偏向阈值（默认20）时，JVM就认为该class的偏向锁有问题，因此会进行批量重偏向。

每个class对象会有一个对应的epoch字段，每个处于偏向锁状态对象的Mark Word中也有该字段，其初始值为创建该对象时class中的epoch的值。每次发生批量重偏向时，就将该值+1，同时遍历JVM中所有线程的栈，找到该class所有正在加锁状态的偏向锁，将其epoch字段改为新值。下次获得锁时，发生当前对象的epoch值和class的epoch不想等，那就算当前已经偏向了其他线程，也不会执行撤销操作，而是直接通过CAS操作将其Mark Word的Thread Id改成当前线程Id。

当达到重偏向阈值（默认20）后，假设该class计数器继续增长，当其达到批量撤销的阈值后（默认40），JVM就认为该class的使用场景存在多线程竞争，会标记该class为不可偏向，之后，对于该class的锁，直接走轻量级锁的逻辑。

设置JVM参数-XX:+PrintFlagsFinal，在项目启动时即可输出JVM的默认参数值

```java
intx BiasedLockingBulkRebiasThreshold = 20 // 默认偏向锁批量重偏向阈值
intx BiasedLockingBulkRevokeThreshold = 40 //默认偏向锁批量撤销阈值
```

可以通过JVM参数`XX:BiasedLockingBulkRebiasThreshold`和`XX:BiasedLockingBulkRevokeThreshold`来手动设置阈值。

当撤销偏向锁阈值超过40次后，JVM会认为不该偏向，于是整个类的所有对象都会变为不可偏向的，新建的对象也是不可偏向的。

注意；时间`-XX:BiasedLockingDecayTime=25000ms`范围内没有达到40次，撤销次数清0，重新计时。

批量重偏向和批量撤销的总结：

- 批量重偏向和批量撤销是针对类的优化，和对象无关
- 偏向锁重偏向一次之后不可再次重偏向
- 当某个类已经触发批量撤销机制后，JVM会默认当前类产生了严重的问题，剥夺了该类的新实例对象使用偏向锁的权利

重量级锁竞争的时候，还可以使用自旋来进行优化，如果当前线程自旋成功（即这时候线持有锁的线程已经退出了同步块，释放了锁），这时当前线程就可以避免阻塞。

- 自旋会占用CPU时间，单核CPU自旋就是浪费，多核CPU自旋才能发挥优势
- 在Java6之后自旋是自适应的，比如对象刚刚一次自旋操作成功过，那么认为这次自旋成功的可能性高，就会多自旋几次；繁殖，就少自旋身之不自旋，比较智能
- Java7之后不能控制是否开启自旋功能

<div class="note info">自旋的目的是为了减少线程挂起的次数，尽量避免直接挂起线程（挂起操作涉及系统调用，存在用户态和内核态切换，这才是重量级锁最大的开销）。</div>

### 锁粗化

假设一系列的连续操作都会对同一个对象反复加锁及解锁，甚至加锁的操作是出现在循环体中的，即使没有出现线程竞争，频繁地互斥同步操作也会导致不必要的性能损耗。如果JVM检测到有一连串零碎的操作都是对同一对象的加锁，将会扩大加锁同步的范围（即锁粗化）到整个操作序列的外部。

```java
StringBuffer buffer = new StringBuffer();
/**
 * 锁粗化
 */
public void append(){
    buffer.append("aaa").append(" bbb").append(" ccc");
}
```

上述代码每次调用buffer.append方法都需要加锁和解锁，如果JVM检测到有一连串的对同一个对象的加锁和解锁的操作，就会将其合并称一次范围更大的加锁和解锁操作，即在第一次append方法时进行加锁，最后一次append方法结束后进行解锁。

### 锁消除

锁消除即删除不必要的加锁操作。锁消除是Java虚拟机在JIT编译期间，通过对运行上下文的扫描，去除不可能存在共享资源竞争的锁，通过锁消除，可以节省毫无意义的请求锁时间。

```java
public class LockEliminationTest {
    /**
     * 锁消除
     * -XX:+EliminateLocks 开启锁消除(jdk8默认开启）
     * -XX:-EliminateLocks 关闭锁消除
     * @param str1
     * @param str2
     */
    public void append(String str1, String str2) {
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append(str1).append(str2);
    }

    public static void main(String[] args) throws InterruptedException {
        LockEliminationTest demo = new LockEliminationTest();
        long start = System.currentTimeMillis();
        for (int i = 0; i < 100000000; i++) {
            demo.append("aaa", "bbb");
        }
        long end = System.currentTimeMillis();
        System.out.println("执行时间：" + (end - start) + " ms");
    }
}
```

StringBuffer的append是个同步方法，但是append方法中的StringBuffer属于一个局部变量，不可能从该方法中逃逸出去，因此其实这个过程是线程安全的，可以将锁消除。

### 逃逸分析

逃逸分析，是一种可以有效减少Java程序中同步负载和内存堆分配压力的跨函数全局数据流分析算法。通过逃逸分析，Java HotSpot编译器能够分析出一个新的对象的引用的使用范围从而决定是否要将这个对象分配到堆上。逃逸分析的基本行为就是分析对象动态作用域。

逃逸分析分为方法逃逸和线程逃逸：

- 方法逃逸：当一个对象在方法中被定义后，它可能被外部方法所引用，例如作为调用参数传递到其他方法中
- 线程逃逸：这个对象甚至可能被其它线程访问到，例如赋值给类变量或可以在其它线程中访问的实例变量

使用逃逸分析，编译器可以对代码做如下优化：

1. 同步省略或锁消除。如果一个对象被发现只能从一个线程被访问到，那么对于这个对象的操作可以不考虑同步
2. 将堆分配转化为栈分配。如果一个对象在子程序中被分配，要使指向该对象的指针永远不会逃逸，对象可能是栈分配的候选，而不是堆分配
3. 分离对象或标量替换。有的对象可能不需要作为一个连续的内存结构存在也可以被访问到，那么对象的部分（或全部）可以不存储在内存，而是存储在CPU寄存器中

### synchronized的优化

JVM对synchronized做了如下优化：

- 针对偏向锁（偏向锁撤销存在性能问题），有批量重偏向，批量撤销
- 针对重量级锁，有自旋优化，自适应自旋
- 锁的粗化和锁的消除

## AQS与ReentrantLock实现原理

AQS的核心：

- 同步等待队列（单向链表）：主要用于维护获取锁失败时的入队的线程
- 条件等待队列（双向链表）：调用await()的时候会释放锁，然后线程会加入到条件队列，调用signal唤醒的时候会把条件队列中的线程节点移动到同步队列中，等待再次获得锁

JUC包中的大多数同步器实现都是围绕着共同的基础行为，比如等待队列，条件队列，独占获取，共享获取等，而这些行为的抽象就是基于`AbstractQueuedSynchronizer`实现的，AQS是一个抽象同步框架，可以用来实现一个依赖状态的同步器。

JDK中提供的大多数的同步器如Lock，Latch，Barrier等，都是基于AQS框架来实现的

- 一般是通过一个内部类Sync继承AQS
- 将同步器所有调用都映射到Sync对应的方法

AQS具备的特性：

- 阻塞等待队列
- 共享/独占
- 公平/非公平
- 可重入
- 允许中断

AQS内部维护属性volatile int state：

- state表示资源的可用状态

state属性三种访问方式：

- getState()
- setState()
- compareAndSetState()

AQS定义两种资源共享方式：

- Exclusive-独占，只有一个线程能执行，如ReentrantLock
- Share-共享，多个线程可以同时执行，如Semaphore/CountDownLatch

AQS定义了5个队列中节点的状态：

1. 值为0，初始化状态，表示当前节点在sync队列中，等到着获取锁。
2. CANCELLED，值为1，表示当前的线程被取消
3. SIGNAL，值为-1，表示当前节点的后继节点包含的线程需要运行，也就是unpark
4. CONDITION，值为-2，表示当前节点在等待condition，也就是在condition队列中
5. PROPAGATE，值为-3，表示当前场景下后续的acquireShared能够得以执行

### 同步等待队列

AQS当中的同步等待队列也称CLH队列，CLH队列是一种基于双向链表数据结构的队列，是FIFO先进先出线程等待队列，Java中的CLH队列是原CLH队列的一个变种，线程由原自旋机制改为阻塞机制。

AQS依赖CLH同步队列来完成同步状态的管理：

- 当前线程如果获取同步状态失败时，AQS则会将当前线程已经等待状态信息构造成一个节点（Node）并将其加入到CLH同步队列，同时会阻塞当前线程
- 当同步状态释放时，会把首节点唤醒（公平锁），使其再次尝试获取同步状态
- 通过signal或signalAll将条件队列中的节点转移到同步队列（由条件队列转移到同步队列）

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302082350259.png" alt="image-20230208235033176" style="zoom:67%;" />

### 条件等待队列

AQS中条件队列是使用单向列表保存的，用nextWaiter来连接：

- 调用await方法阻塞线程
- 当前线程存在于同步队列的头结点，调用await方法进行阻塞（从同步队列转移到条件队列）

### Condition接口

1. 调用Condition#await方法会释放当前持有的锁，然后阻塞当前线程，同时向Condition队列尾部添加一个节点，所以调用Condition#await方法的时候必须持有锁
2. 调用Condition#signal方法会将Condition队列的首节点移动到阻塞队列尾部，然后唤醒因调用Condition#await方法而阻塞的线程（唤醒之后这个线程就可以去竞争锁了），所以调用Condition#signal方法的时候必须持有锁，持有锁的线程唤醒被因调用Condition#await方法而阻塞的线程

### ReentrantLock详解

ReentrantLock是一种互斥锁，相比于synchronized，ReentrantLock具备如下特点：

- 可中断
- 可以设置超时时间
- 可以设置为公平锁
- 支持多个条件变量
- 与synchronized一样，都支持可重入

我们主要的关注点：

- ReentrantLock加锁解锁的逻辑
- 公平和非公平，可重入锁的实现
- 线程竞争锁失败入队阻塞逻辑和获取锁的线程释放锁唤醒阻塞线程竞争锁的逻辑实现

完成的流程图：https://www.processon.com/view/link/6191f070079129330ada1209

### synchronized和ReentrantLock

- synchronized是JVM层次的锁实现，ReentrantLock是JDK层次的锁实现；
- synchronized的锁状态是无法在代码中直接判断的，但是ReentrantLock可以通过ReentrantLock#isLocked判断；
- synchronized是非公平锁，ReentrantLock是可以是公平也可以是非公平的；
- synchronized是不可以被中断的，而ReentrantLock#lockInterruptibly方法是可以被中断的；
- 在发生异常时synchronized会自动释放锁，而ReentrantLock需要开发者在finally块中显示释放锁；
- ReentrantLock获取锁的形式有多种：如立即返回是否成功的tryLock(),以及等待指定时长的获取，更加灵活；
- synchronized在特定的情况下对于已经在等待的线程是后来的线程先获得锁（回顾一下sychronized的唤醒策略），而ReentrantLock对于已经在等待的线程是先来的线程先获得锁；

## Semaphore与CountDownLatch

Semaphore，俗称信号量，它是操作系统中PV操作的源语在Java中的实现，它也是基于AQS来实现的。

Semaphore可以用于做流量控制，特别是公共资源有限的应用场景。

Semaphore与ReentantLock的逻辑实现区别在于Semaphore是共享锁。

共享锁的模式，会一直尝试唤醒后续节点。

CyclicBarrier与CountDownLatch的区别：

- CountDownLatch的计数器只能使用一次，而CyclicBarrier的计数器可以使用reset()方法重置。所以CyclicBarrier能处理更为复杂的业务场景，比如如果计算发生错误，可以重置计数器，并让线程们重新执行一次
- CyclicBarrier是通过ReentranLock的“独占锁”和Condition来实现一组线程的阻塞唤醒的，而CountDownLatch则是通过AQS的“共享锁”实现

## CylicBarrier实现原理



![image-20230212224934975](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302122249039.png)

## ReentrantReadWriteLock

在没有写操作的时候，多个线程同时读一个资源没有任何问题，所以应该允许多个线程同时读取共享资源（读读可以并发）；但是如果一个线程想去写这些共享资源，就不应该允许其他线程对该资源进行读和写操作了（读写，写读，写写互斥）。在读多写少的情况下，读写锁能够提供比拍他锁更好的并发性和吞吐量。

针对这种场景，Java并发包提供了读写锁ReentrantReadWriteLock，在它内部，维护了一对相关的锁，一个用于只读操作；一个用于写入操作，成为写锁。

线程进入读锁的前提条件：

- 没有其他线程的写锁
- 没有写请求或者有写请求，但是调用线程和持有锁的线程是同一个

线程进入写锁的前提条件：

- 没有其他线程的读锁
- 没有其他线程的写锁

读写锁有一下三个重要的特性：

- 公平选择性：支持非公平（默认）和公平的锁获取方式，吞吐量还是非公平优于公平
- 可重入：读锁和写锁都支持线程重入。读线程获取读锁后，能够再次获取读锁。写线程在获取写锁之后能够再次获取写锁，同时也可以获取读锁
- 锁降级：遵循获取写锁、再获取读锁最后释放写锁的次序，写锁能够降级成为读锁

ReentrantReadWriteLock是可重入的读写锁实现类。在它内部，维护了一对相关的锁，一个用于只读操作，另一个用于写入操作。只要没有Writer线程，读锁可以由多个Reader线程同时持有。也就是说，写锁是独占的，读锁是共享的。

锁降级中的读锁获取是否必要呢？必要，这样做的目的是为了保证数据的可见性。如果当前线程不获取读锁而是直接释放写锁，假设此刻另一个线程（记为线程T）获取了写锁并修改了数据，那么当前线程无法感知线程T的数据更新。如果当前线程获取读锁，即遵循锁降级的步骤，则线程T将会被阻塞，直到线程使用的数据并释放读锁之后，线程T才能获取写锁进行数据更新。

ReentrantReadWriteLock不支持锁升级（把持读锁、获取写锁，最后释放读锁的过程）。目的也是保证数据的可见性，如果读锁已被多个线程获取，其中任意线程成功获取了写锁并更新了数据，则其对其他获取到读锁的线程是不可见的。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302150003478.png" alt="img" style="zoom:67%;" />

悲观锁：考虑最坏的场景，为了保证线程安全，每次操作都会上锁；

乐观锁的例子：

```sql
select count, version from table where id = ?
version = 100;
update table set count = count - 1, version = version + 1 where id = ? and version = 100;
```

此时假设有三个线程同时执行这条更新语句：

```sql
# T1 操作
update success 返回值为1，version此时为101
# T2 操作
update success 返回值为0，这意味着加锁失败，返回的成功的行数值可以作为加锁成功的依据，可以在业务逻辑里面判断是否返回0
# T3操作
update 成功 返回值为0
```

乐观锁又被称为无锁算法。

JDK乐观锁的实现：java.util.concurrent.locks.StampedLock。

## BlockingQueue实现原理

阻塞队列的总结：https://www.processon.com/view/link/618ce3941e0853689b0818e2

### Queue队列

```java
public interface Queue<E> extends Collection<E> {
    //添加一个元素，添加成功返回true, 如果队列满了，就会抛出异常
    boolean add(E e);
    //添加一个元素，添加成功返回true, 如果队列满了，返回false
    boolean offer(E e);
    //返回并删除队首元素，队列为空则抛出异常
    E remove();
    //返回并删除队首元素，队列为空则返回null
    E poll();
    //返回队首元素，但不移除，队列为空则抛出异常
    E element();
    //获取队首元素，但不移除，队列为空则返回null
    E peek();
}
```

### BlockingQueue

BlockingQueue和JDK集合包中的Queue接口兼容，同时在其基础上增加了阻塞功能。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302170003145.png" alt="img" style="zoom:60%;" />

**入队：**

（1）offer(E e)：如果队列没满，返回true，如果队列已满，返回false（不阻塞）

（2）offer(E e, long timeout, TimeUnit unit)：可以设置阻塞时间，如果队列已满，则进行阻塞。超过阻塞时间，则返回false

（3）put(E e)：队列没满的时候是正常的插入，如果队列已满，则阻塞，直至队列空出位置 

**出队：**

（1）poll()：如果有数据，出队，如果没有数据，返回null   （不阻塞）

（2）poll(long timeout, TimeUnit unit)：可以设置阻塞时间，如果没有数据，则阻塞，超过阻塞时间，则返回null

（3）take()：队列里有数据会正常取出数据并删除；但是如果队列里无数据，则阻塞，直到队列里有数据



当队列满了无法添加元素，或者是队列空了无法移除元素时：

1. 抛出异常：add、remove、element
2. 返回结果但不抛出异常：offer、poll、peek
3. 阻塞：put、take

| 方法         | 抛出异常  | 返回特定值 | 阻塞   | 阻塞特定时间         |
| ------------ | --------- | ---------- | ------ | -------------------- |
| 入队         | add(e)    | offer(e)   | put(e) | offer(e, time, unit) |
| 出队         | remove()  | poll()     | take() | poll(time, unit)     |
| 获取队首元素 | element() | peek()     | 不支持 | 不支持               |

阻塞队列出了阻塞外还有一个非常重要的属性，那就是容量的大小，分为有界和无界两种。无界队列意味着里面可以容纳非常多的元素，例如LinkedBlockingQueue的上限是Integer.MAX_VALUE，是非常大的一个数，可以近似认为是无限容量，因为我们几乎无法把这个容量装满。但是有的阻塞队列是有界的，例如ArrayBlockingQueue如果容量满了，也不会扩容，所以一旦满了就无法再往里放数据了。

```java
public LinkedBlockingQueue() {
    this(Integer.MAX_VALUE);
}
```

BlockingQueue是线程安全的，我们在很多场景下都可以利用线程安全的队列来优雅地解决我们业务自身的线程安全问题。比如说，使用生产者/消费者模式的时候，我们生产者只需要从队列里取出它们就可以了，如图所示；

![img202302182341448](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302182341448.png)

因为阻塞队列是线程安全的，所以生产者和消费者都可以是多线程的，不会发生线程安全问题。生产者/消费者直接使用线程安全的队列就可以，而不需要自己去考虑更多的线程安全问题。这也就意味着，考虑锁等线程安全问题的重任从开发者转移到了“队列”上，降低了我们开发的难度和工作量。

同时，队列它还能起到一个隔离的作用。比如说我们开发一个银行转账的程序，那么生产者不需要关心具体的转账逻辑，只需要把转帐任务，如账户和金额等信息放到队列中就可以，而不需要去关心银行这个类如何实现具体的转账业务。而作为银行这个类来讲，它会从队列里取出来将要执行的具体任务，再去通过自己的各种方式来完成本次转账。这样就实现了具体任务与执行任务类之间的结偶，任务被放在了阻塞队列中，而负责放任务的线程是无法直接访问到我们银行具体实现转账操作的对象的，实现了隔离，提高了安全性。

常见的阻塞队列：

| **队列**                  | 描述                                                      |
| ------------------------- | --------------------------------------------------------- |
| **ArrayBlockingQueue**    | 基于数组结构实现的一个有界阻塞队列                        |
| **LinkedBlockingQueue**   | 基于链表结构实现的一个有界阻塞队列                        |
| **PriorityBlockingQueue** | 支持按优先级排序的无界阻塞队列                            |
| **DelayQueue**            | 基于优先级队列（PriorityBlockingQueue）实现的无界阻塞队列 |
| **SynchronousQueue**      | 不存储元素的阻塞队列                                      |
| **LinkedTransferQueue**   | 基于链表结构实现的一个无界阻塞队列                        |
| **LinkedBlockingDeque**   | 基于链表结构实现的一个双端阻塞队列                        |

### ArrayBlockingQueue

ArrayBlockingQueue是典型的有界阻塞队列，其内部是用数组存储元素的，初始化时需要指定容量大小，利用ReentrantLock实现线程安全。

在生产者-消费者模型中使用时，如果生产速度和消费速度基本匹配的情况下，使用ArrayBlockingQueue是个不错的选择；当如果生产速度远远大于消费速度，则会导致队列填满，大量生产线程被阻塞。

使用独占锁ReentrantLock实现线程安全，入队和出队操作使用同一个锁对象，也就是说只能有一个线程可以进行入队或者出队操作；这也就意味着生产者和消费者无法并行操作，在高并发场景下会成为性能瓶颈。

数据结构如下：

```java
//数据元素数组
final Object[] items;
//下一个待取出元素索引
int takeIndex;
//下一个待添加元素索引
int putIndex;
//元素个数
int count;
//内部锁
final ReentrantLock lock;
//消费者
private final Condition notEmpty;
//生产者
private final Condition notFull;  

public ArrayBlockingQueue(int capacity) {
    this(capacity, false);
}
public ArrayBlockingQueue(int capacity, boolean fair) {
    ...
    lock = new ReentrantLock(fair); //公平，非公平
    notEmpty = lock.newCondition();
    notFull =  lock.newCondition();
}
```

入队put方法：

```java
public void put(E e) throws InterruptedException {
	//检查是否为空
    checkNotNull(e);
    final ReentrantLock lock = this.lock;
    //加锁，如果线程中断抛出异常 
    lock.lockInterruptibly();
    try {
       //阻塞队列已满，则将生产者挂起，等待消费者唤醒
       //设计注意点： 用while不用if是为了防止虚假唤醒
        while (count == items.length)
            notFull.await(); //队列满了，使用notFull等待（生产者阻塞）
        // 入队
        enqueue(e);
    } finally {
        lock.unlock(); // 唤醒消费者线程
    }
}
    
private void enqueue(E x) {
    final Object[] items = this.items;
    //入队   使用的putIndex
    items[putIndex] = x;
    if (++putIndex == items.length) 
        putIndex = 0;  //设计的精髓： 环形数组，putIndex指针到数组尽头了，返回头部
    count++;
    //notEmpty条件队列转同步队列，准备唤醒消费者线程，因为入队了一个元素，肯定不为空了
    notEmpty.signal();
}
```

出队操作：

```java
public E take() throws InterruptedException {
    final ReentrantLock lock = this.lock;
    //加锁，如果线程中断抛出异常 
    lock.lockInterruptibly();
    try {
       //如果队列为空，则消费者挂起
        while (count == 0)
            notEmpty.await();
        //出队
        return dequeue();
    } finally {
        lock.unlock();// 唤醒生产者线程
    }
}
private E dequeue() {
    final Object[] items = this.items;
    @SuppressWarnings("unchecked")
    E x = (E) items[takeIndex]; //取出takeIndex位置的元素
    items[takeIndex] = null;
    if (++takeIndex == items.length)
        takeIndex = 0; //设计的精髓： 环形数组，takeIndex 指针到数组尽头了，返回头部
    count--;
    if (itrs != null)
        itrs.elementDequeued();
    //notFull条件队列转同步队列，准备唤醒生产者线程，此时队列有空位
    notFull.signal();
    return x;
}
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302182355988.png" alt="img202302182355988" style="zoom:67%;" />

这里设计成环形链表的原因是基于效率的考量，这样，当去除takeIndex对应的元素之后，就不需要移动它后面的元素，而是直接移动takeIndex的指针，即takeIndex++，这样的话，删除元素的时间复杂度也变为了O(1)。

### LinkedBlockingQueue

LinkedBlockingQueue是一个基于链表实现的阻塞队列，默认情况下，该阻塞队列的大小为Integer.MAX_VALUE，由于这个数值特别大，所以LinkedBlockingQueue也被称作无界队列，代表它几乎没有界限，队列可以随着元素的添加而动态增长，但是如果没有剩余内存，则队列抛出OOM错误。所以为了避免队列过大造成机器负载或者内存爆满的情况出现，我们在使用的时候建议手动传一个队列的大小。

LinkedBlockingQueue内存由单链表实现，只能从head取元素，从tail添加元素。LinkedBlockingQueue采用两把锁的锁分离技术实现入队出队互不阻塞，添加元素和获取元素都有独立的锁，也就是说LinkedBlockingQueue是读写分离的，读写操作可以并发执行。

![img202302191114250](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302191114250.png)

LinkedBlockingQueue使用：

```java
//指定队列的大小创建有界队列
BlockingQueue<Integer> boundedQueue = new LinkedBlockingQueue<>(100);
//无界队列
BlockingQueue<Integer> unboundedQueue = new LinkedBlockingQueue<>();
```

数据结构：

```java
// 容量,指定容量就是有界队列
private final int capacity;
// 元素数量
private final AtomicInteger count = new AtomicInteger();
// 链表头  本身是不存储任何元素的，初始化时item指向null
transient Node<E> head;
// 链表尾
private transient Node<E> last;
// take锁   锁分离，提高效率
private final ReentrantLock takeLock = new ReentrantLock();
// notEmpty条件
// 当队列无元素时，take锁会阻塞在notEmpty条件上，等待其它线程唤醒
private final Condition notEmpty = takeLock.newCondition();
// put锁
private final ReentrantLock putLock = new ReentrantLock();
// notFull条件
// 当队列满了时，put锁会会阻塞在notFull上，等待其它线程唤醒
private final Condition notFull = putLock.newCondition();

//典型的单链表结构
static class Node<E> {
    E item;  //存储元素
    Node<E> next;  //后继节点    单链表结构
    Node(E x) { item = x; }
}
```

构造器：

```java
public LinkedBlockingQueue() {
    // 如果没传容量，就使用最大int值初始化其容量
    this(Integer.MAX_VALUE);
}

public LinkedBlockingQueue(int capacity) {
    if (capacity <= 0) throw new IllegalArgumentException();
    this.capacity = capacity;
    // 初始化head和last指针为空值节点
    last = head = new Node<E>(null);
}
```

入队put方法：

```java
public void put(E e) throws InterruptedException {    
    // 不允许null元素
    if (e == null) throw new NullPointerException();
    int c = -1;
    // 新建一个节点
    Node<E> node = new Node<E>(e);
    final ReentrantLock putLock = this.putLock;
    final AtomicInteger count = this.count;
    // 使用put锁加锁
    putLock.lockInterruptibly();
    try {
        // 如果队列满了，就阻塞在notFull上等待被其它线程唤醒（阻塞生产者线程）
        while (count.get() == capacity) {
            notFull.await();
        }  
        // 队列不满，就入队
        enqueue(node);
        c = count.getAndIncrement();// 队列长度加1，返回原值
        // 如果现队列长度小于容量，notFull条件队列转同步队列，准备唤醒一个阻塞在notFull条件上的线程(可以继续入队) 
        // 这里为啥要唤醒一下呢？
        // 因为可能有很多线程阻塞在notFull这个条件上,而取元素时只有取之前队列是满的才会唤醒notFull,此处不用等到取元素时才唤醒
        if (c + 1 < capacity)
            notFull.signal();
    } finally {
        putLock.unlock(); // 真正唤醒生产者线程
    }  
    // 如果原队列长度为0，现在加了一个元素后立即唤醒阻塞在notEmpty上的线程
    if (c == 0)
        signalNotEmpty();
}
private void enqueue(Node<E> node) { 
    // 直接加到last后面,last指向入队元素
    last = last.next = node;
}    
private void signalNotEmpty() {
    final ReentrantLock takeLock = this.takeLock; 
    takeLock.lock();// 加take锁
    try {  
        notEmpty.signal();// notEmpty条件队列转同步队列，准备唤醒阻塞在notEmpty上的线程
    } finally {
        takeLock.unlock();  // 真正唤醒消费者线程
    }
```

出队方法：

```java
public E take() throws InterruptedException {
    E x;
    int c = -1;
    final AtomicInteger count = this.count;
    final ReentrantLock takeLock = this.takeLock;
    // 使用takeLock加锁
    takeLock.lockInterruptibly();
    try {
        // 如果队列无元素，则阻塞在notEmpty条件上（消费者线程阻塞）
        while (count.get() == 0) {
            notEmpty.await();
        }
        // 否则，出队
        x = dequeue();
        c = count.getAndDecrement();//长度-1，返回原值
        if (c > 1)// 如果取之前队列长度大于1，notEmpty条件队列转同步队列，准备唤醒阻塞在notEmpty上的线程，原因与入队同理
            notEmpty.signal();
    } finally {
        takeLock.unlock(); // 真正唤醒消费者线程
    }
    // 为什么队列是满的才唤醒阻塞在notFull上的线程呢？
    // 因为唤醒是需要加putLock的，这是为了减少锁的次数,所以，这里索性在放完元素就检测一下，未满就唤醒其它notFull上的线程,
    // 这也是锁分离带来的代价
    // 如果取之前队列长度等于容量（已满），则唤醒阻塞在notFull的线程
    if (c == capacity)
        signalNotFull();
    return x;
}
private E dequeue() {
     // head节点本身是不存储任何元素的
    // 这里把head删除，并把head下一个节点作为新的值
    // 并把其值置空，返回原来的值
    Node<E> h = head;
    Node<E> first = h.next;
    h.next = h; // 方便GC
    head = first;
    E x = first.item;
    first.item = null;
    return x;
}
private void signalNotFull() {
    final ReentrantLock putLock = this.putLock;
    putLock.lock();
    try {
        notFull.signal();// notFull条件队列转同步队列，准备唤醒阻塞在notFull上的线程
    } finally {
        putLock.unlock(); // 解锁，这才会真正的唤醒生产者线程
    }
```

LinkedBlockingQueue的总结：

![image-20230219121037945](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302191210992.png)

### LinkedBlockingDeque

LinkedBlockingDeque的总结：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302191204083.png" alt="image-20230219120413030" style="zoom:67%;" />

### SynchronousQueue

SynchronousQueue非常适合传递性场景做交换工作，生产者的线程和消费者的线程同步传递某些信息、事件或者任务。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302191741565.png" alt="image-20230219174116511" style="zoom:67%;" />

### PriorityBlockingQueue

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302192125774.png" alt="image-20230219212544722" style="zoom:67%;" />

优先级队列采用二叉堆的数据结构。

大顶堆和小顶堆：

- 大顶堆：父结点的键值总是大于或等于任何一个子结点的键值
- 小顶堆：父结点的键值总是小于或等于任何一个子结点的键值

扩容的算法：

```java
int newCap = oldCap + ((oldCap < 64) ? (oldCap + 2) : (oldCap >> 1));
```

构造小顶堆的方法：

```java
    private static <T> void siftUpComparable(int k, T x, Object[] es) {
        Comparable<? super T> key = (Comparable<? super T>) x;
        while (k > 0) {
            int parent = (k - 1) >>> 1;
            Object e = es[parent];
            if (key.compareTo((T) e) >= 0)
                break;
            es[k] = e;
            k = parent;
        }
        es[k] = key;
    }
```

### LinkedTransferQueue

![image-20230219214233931](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302192142986.png)

### DelayQueue

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302192319177.png" alt="image-20230219231952124" style="zoom: 50%;" />

### 如何选择合适的阻塞队列

通常我们可以从以下5个角度考虑，来选择合适的阻塞队列：

- 功能：首先需要考虑的就是功能层面，比如是否需要阻塞队列帮我们排序，如优先级队列、延迟执行等。如果有这个需要，我们就必须选择类似于PriorityBlockingQueue之类的有序排序能力的阻塞队列
- 容量：其次要 考虑的是容量，或者说是否有存储的要求，还是只需要“直接传递”。在考虑这一点的时候，我们知道前面介绍的那几种阻塞队列，有的是容量固定的，如ArrayBlockingQueue；有的默认是容量无限的，如LinkedBlockingQueue；而有的里面没有任何容量，如SynchronousQueue；而对于DelayQueue而言，它的容量固定就是Integer.MAX_VALUE。所以不同阻塞队列的容量是千差万别的，我们需要根据任务数量来推算出合适的容量，从而去选择合适的BlockingQueue
- 能否扩容：接着要考虑的就是能否扩容，因为有时我们并不能在出事的时候很好的准确估计队列的大小，因为业务可能有高峰期、低谷期。如果一开始就固定一个容量，可能无法应对所有的情况，也是不合适的，有可能需要动态扩容。如果我们需要动态扩容的话，那么就不能选择ArrrayBlockingQueue，因为它的容量在创建时就确定了，无法扩容。相反，PriorityBlockingQueue即使在指定了初始容量之后，后续如果有需要，也可以自动扩容。所以我们可以根据是否需要扩容来选择合适的队列
- 内存结构：相对使用数组实现的阻塞队列，使用链表实现需要额外的“节点”，因此空间利用率更高
- 性能：最后一点是从性能的角度去考虑，比如LinkedBlockingQueue，由于拥有两把锁，它的操作力度更细，在并发程度高的时候，相对于只有一把锁的ArrayBlockingQueue性能会更好。另外，SynchronousQueue性能往往优于其他实现，因为它只需要“直接传递”，而不需要存储过程。如果我们的场景需要直接传递的话，可以优先考虑SynchronousQueue

## ForkJoin实现原理

任务类型：

- CPU密集型任务
- IO密集型任务

CPU密集型任务也叫计算密集型任务，比如加密、解密、压缩、计算等一系列需要大量耗费CPU资源的任务。对于这样的任务最佳的线程数为CPU核心数的1～2倍，如果设置过多的线程数，实际上并不会起到很好的效果。此时假设我们设置的线程数量是CPU核心数的2倍以上，因为计算任务非常重，会占用大量的CPU资源，所以这时CPU的每个核心工作基本都是满负荷的，而我们又设置了过多的线程，每个线程都想去利用CPU资源来执行自己的任务，这就会造成不必要的上下文切换，此时线程数的增多并没有让性能提升，反而由于线程数量过多会导致性能下降。

IO密集型任务，比如数据库、文件的读写，网络通信等任务，这种任务的特点是并不会特别消耗CPU资源，但是IO操作很耗时，总体会占用比较多的时间。对于这种任务最大线程数一般会大于CPU核心数很多倍，因为IO读写速度相比于CPU的速度是比较慢的，如果我们设置过少的线程数，就可能导致CPU资源的浪费。而如果我们设置更多的线程数，那么当一部分线程正在等待IO的时候，它们此时并不需要CPU来计算，那么另外的线程边可以利用CPU去执行其他的任务，互不影响，这样的话在工作队列中等待的任务就会减少，可以更好地利用资源。

线程数计算方法：$线程数=CPU核心线程数*（1+平均等待时间/平均工作时间）$。

这个公式的含义是，如果任务的平均等待时间长，线程数就随之增加，而如果平均工作时间长，也就是对于CPU密集型任务，线程数就随之减少。

太少的线程数会使得程序整体性能降低，而过多的线程的也会消耗内存等其他资源。

ForkJoin的基本思想是分治：

1. 分解：将要解决的问题划分为若干规模较小的同类问题
2. 求解：当子问题划分得足够小时，用较简单的方法解决
3. 合并：按原问题的要求，将子问题的解逐层合并构成原问题的解

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302202252668.png" alt="image-20230220225218612" style="zoom:67%;" />

传统线程池ThreadPoolExecutor有两个明显的缺点：一是无法对大任务进行拆分，对于某些任务只能单线程执行；二是工作线程从队列中获取任务时存在竞争情况。这两个缺点都会影响任务的执行效率。为了解决传统线程池的缺陷，Java7中引入了Fork/Join框架，并在Java8中得到广泛应用。Fork/Join框架的核心是ForkJoinPool类，它是对AbstractExecutorService类的扩展。ForkJoinPool允许其他线程向它提交任务，并根据设定将这些任务拆分为粒度更细的子任务，这些子任务将由ForkJoinPool内部的工作线程来并行执行，并且工作线程之间可以窃取彼此之间的任务。

ForkJoinPool最适合计算密集型任务，而且最好是非阻塞任务。ForkJoinPool是ThreadPoolExecutor线程池的一种补充，是对计算密集型场景的加强。

根据经验和实验，任务总数，单任务执行耗时以及并行数都会影响到Fork/Join的性能。所以，当使用Fork/Join框架时，需要谨慎评估这三个指标，最好能通过模拟对比评估，不要冒然在生产环境中使用。

ForkJoinPool中有四个核心参数，用于控制线程池的并行数、工作线程的创建、异常处理和模式指定。各种参数解释如下：

- int parallelism：
- ForkJoinWorkerThreadFactory factory：
- UncaughtExceptionHandler handler：指定异常处理器，当任务在运行中出错时，将由设定的处理器处理
- boolean asyncMode：设置队列的工作模式：asyncMode？FIDO_QUEUE:LIFO_QUEUE。

ForkJoinPool多个线程，每个线程维护一个队列workQueue。

### 工作窃取

ForkJoinPool与ThreadPoolExecutor有个很大的不同之处在于，ForkJoinPool引入了工作窃取设计，它是性能保证的关键之一。工作窃取，就是允许空闲线程从繁忙的双端队列中窃取任务。默认情况下，工作线程从它自己的双端队列的头部获取任务。但是，当自己的任务为空时，线程会从其他繁忙线程双端队列的尾部中获取任务。这种方法，最大限度地减少了线程竞争任务的可能性。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302212304975.png" alt="img202302212304975" style="zoom:67%;" />

### 工作队列

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302212308629.png" alt="https://note.youdao.com/yws/public/resource/8ec38757b59cbf6b14a7204fd5b9d65c/xmlnote/18ED560EBB3042F1B519A8838FF43ABF/1924" style="zoom:67%;" />

### ForkJoinWorkThread

ForkJoinWorkThread是用于执行任务的线程，用于区别使用非ForkJoinWorkThread线程提交task，启动一个该Thread，会自动注册一个WorkQueue到Pool，拥有Thread的WorkQueue只能出现在WorkQueues[]的奇数位。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302212310083.png" alt="img202302212310083" style="zoom:67%;" />

### 原理分析

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302222314499.png" alt="image-20230222231408440" style="zoom: 50%;" />

ForkJoin是一种基于分治算法的模型，在并发处理计算型任务时有着显著的优势。其效率的提升主要得益于两个方面：

- 任务切分：将大的任务分割为更小力度的小任务，让更多的线程参与执行
- 任务窃取：通过任务窃取，充分地利用空闲线程，并减少竞争

## CompletableFuture实现原理

### Future

Future的局限性：

- 并发执行多任务：Future只提供了get()方法来获取结果，并且是阻塞的。所以，除了等待没有其他方式
- 无法对多个任务进行链式调用：如果希望在计算任务完成后执行特定动作，比如发邮件，但Future没有提供这样的能力
- 无法组合多个任务：如果运行了10个任务，并期望它们全部执行结束后执行特定动作，那么在Future也没有办法做到
- 没有异常处理：Future接口中没有关于异常处理的方法

### CompletionService

CompletionService内部通过阻塞队列+FutureTask，实现了任务先完成可以优先获取到，即记过按照完成先后顺序排序，内部有一个先进先出的阻塞队列，用于保存已经执行完成的Future，通过调用它的take方法或poll方法可以获取到一个已经执行完成的Future，进而通过调用Future接口实现类的get方法获取最终的结果。

使用场景：向不同的电商平台询价，并保存价格。

假设我们采用线程池+Future的方案，异步执行询价然后再保存：

```java
//    创建线程池 
ExecutorService    executor = Executors.newFixedThreadPool(3); 
//    异步向电商S1询价 
Future<Integer>    f1 = executor.submit(()->getPriceByS1()); 
//    异步向电商S2询价 
Future<Integer>    f2=    executor.submit(()->getPriceByS2());             
//    获取电商S1报价并异步保存 
executor.execute(()->save(f1.get()));        
//    获取电商S2报价并异步保存 
executor.execute(()->save(f2.get());   
```

如果获取电商s1报价的耗时很长，那么即便获取电商s2报价的耗时很短，也无法让保存s2报价的操作先执行，因为这个线程都阻塞在了f1.get()操作上。

使用CompetionService实现先获取的报价先保存到数据库：

```java
//创建线程池
ExecutorService executor = Executors.newFixedThreadPool(10);
//创建CompletionService
CompletionService<Integer> cs = new ExecutorCompletionService<>(executor);
//异步向电商S1询价
cs.submit(() -> getPriceByS1());
//异步向电商S2询价
cs.submit(() -> getPriceByS2());
//异步向电商S3询价
cs.submit(() -> getPriceByS3());
//将询价结果异步保存到数据库
for (int i = 0; i < 3; i++) {
    Integer r = cs.take().get();
    executor.execute(() -> save(r));
}
```

如果我们只需要最快的那一个结果，就可以：

```java
// 创建线程池
ExecutorService executor = Executors.newFixedThreadPool(3);
// 创建CompletionService
CompletionService<Integer> cs = new ExecutorCompletionService<>(executor);
// 用于保存Future对象
List<Future<Integer>> futures = new ArrayList<>(3);
//提交异步任务，并保存future到futures 
futures.add(cs.submit(()->geocoderByS1()));
futures.add(cs.submit(()->geocoderByS2()));
futures.add(cs.submit(()->geocoderByS3()));
// 获取最快返回的任务执行结果
Integer r = 0;
try {
  // 只要有一个成功返回，则break
  for (int i = 0; i < 3; ++i) {
    r = cs.take().get();
    //简单地通过判空来检查是否成功返回
    if (r != null) {
      break;
    }
  }
} finally {
  //取消所有任务
  for(Future<Integer> f : futures)
    f.cancel(true);
}
// 返回结果
```

Dubbo中有一种叫做Forking的集群模式，这种集群模式下，支持并行地调用度多个服务实例，只要有一个成功就返回结果。

```java
geocoder(addr) {
  //并行执行以下3个查询服务， 
  r1=geocoderByS1(addr);
  r2=geocoderByS2(addr);
  r3=geocoderByS3(addr);
  //只要r1,r2,r3有一个返回
  //则返回
  return r1|r2|r3;
}
```

CompletionService的应用场景总结：

- 当需要批量提交异步任务的时候建议使用CompletionService，CompletionService将线程池和阻塞队列BlockingQueue的功能融合在了一起，能够让批量异步任务的管理更简单
- CompletionService能够让异步任务的执行结果有序化。先执行完的先进入阻塞队列，利用这个特性，可以轻松实现后续处理的有序性
- 线程池隔离：CompletionService支持自己创建线程池，这种隔离性能避免几个特别耗时的任务拖垮整个应用的风险。

### CompletableFuture

简单的任务，用Future获取结果还好，但是并行提交多个异步任务，往往并不是独立的，很多时候业务逻辑处理存在串行[依赖]、并行、聚合的关系。如果要我们手动用Future实现，是非常麻烦的。

CompletableFuture是Future接口的扩展和增强。CompletableFuture实现了Future接口，并在此基础上进行了丰富地扩展，完美地弥补了Future上述的种种问题，更为重要的是，CompletableFuture实现了对任务的编排能力。借助这项能力，我们可以轻松地组织不同任务的运行顺序、规则以及方式。从某种程度上说，这项能力是它的核心能力。而在以往，虽然通过CountDownLatch等工具类也可以实现任务的编排，但需要复杂的逻辑处理，不仅耗费精力且难以维护。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302251103393.png" alt="img202302251103393" style="zoom: 100%;" />

CompletionStage接口：执行某一个阶段，可向下执行后续阶段。异步执行，默认线程池是ForkJoinPool.commonPool()。

应用场景：

- 描述依赖关系

  - thenApply()：把前面异步任务的结果，交给后面的Function
  - thenCompose()：用来连接两个有依赖关系的任务，结果由第二个任务返回

- 描述and聚合关系

  - thenCombine：任务合并，有返回值
  - thenAcceptBoth：两个任务执行完成后，将结果交给thenAcceptBoth消耗，无返回值
  - runAfterBothEither：两个任务都执行完成后，执行下一步操作（Runnable）

- 描述or聚合关系

  - applyToEither：两个任务谁执行的快，就使用那一个结果，有返回值
  - acceptEither：两个任务谁执行的快，就消耗那一个结果，无返回值
  - runAfterEither：任意一个任务执行完成，进行下一步操作

- 并行执行

  CompletableFuture类自己也提供了anyOf()和allOf用于支持多个CompletableFuture并行执行

常用方法总结：

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302251153874.png)

## 高性能队列Disruptor

Disruptor是一个高性能的队列，研发的初衷是为了解决内存队列的延迟问题，基于Disruptor开发的系统但线程能支撑每秒600万订单。目前Apache Storm、Camel、Log4j在内的很多知名项目都应用了Disruptor以获取高性能。注意，这里所说的队列是系统内存的内存队列，而不是Kafka这样的分布式队列。

Disruptor本质上是一个有界队列，可以用于生产者-消费者模型。

JUC下的队列大部分采用ReentrantLock锁的方式保证线程安全。在稳定性要求特别高的系统中，为了防止生产者速度过快，导致内存溢出，只能选择有界队列。加锁的方式通常会严重影响性能，线程会因为竞争不到锁而被挂起，等待其他线程释放锁而唤醒，这个过程存在很大的开销，而且存在死锁的隐患。有界队列通常采用数组实现，但是采用数组实现引发另外一个问题false sharing（伪共享）。

<div class="note info">CPU缓存是以缓存行为最小数据单位，缓存行是2的整数幂个连续字节，主流大小是64个字节。如果多个变量同属于一个缓存行，在并发环境下同时修改，因为写屏障即内存一致性协议会导致同一时间只能一个线程操作该缓存行，进而因为竞争导致性能下降，这就是“伪共享”。“伪共享”是高并发场景下一个底层细节问题。</div>

Disruptor通过以下设计来解决队列速度慢的问题：

- 环形数组结构

  为了避免垃圾回收，采用数组而非链表。同时，数组对于处理器的缓存机制更加友好（空间局部性原理）

- 元素位置定位

  数组长度$2^n$，通过位运算，加速定位的速度，下标采取递增的形式。不用担心index溢出的问题。index是long类型，即使100万QPS的处理速度，也需要30万年才能用完

- 无锁设计

  每个生产者或消费者线程，会先申请可以操作的元素在数组中的问题，申请到之后，直接在该位置写入或者读取数据

- 利用缓存行填充解决伪共享的问题

- 实现了基于事件驱动的生产者消费者模型（观察者模式）

消费者时刻关注着队列里有没有消息，一旦有新消息产生，消费者线程就会立刻消费。

### RingBuffer

使用RingBuffer来作为队列的数据结构，RingBuffer就是一个可自定义大小的环形数组。除数组之外还有一个序列号（sequence），用以指向下一个可用的元素，供生产者与消费者使用，原理图如下所示：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302251645969.png" alt="img202302251645969" style="zoom:67%;" />

当需要覆盖数据时，会执行一个策略，Disruptor会提供多种策略，比较常用的有：

- BlockingWaitStrategy策略，常见且默认的等待测了，当这个队列满了，不执行覆盖，而是阻塞等待。使用ReentrantLock+Condition实现阻塞，最节省CPU，但高并发场景下性能最差。适合CPU资源紧缺，吞吐量和延迟并不重要的场景
- SleepingWaitStrategy策略，会在循环中不断等待数据。先进行自旋等待，如果不成功，则使用Thread.yield()并让出CPU，并最终使用LockSupport.parkNanos(1L)进行线程休眠，以确保不占用太多的CPU资源。因此这个策略会产生比较高的平均延时。典型的应用场景就是异步日志
- YieldingWaitStrategy策略，这个策略用于低延时的场合。消费者线程会不断地监控缓冲区变化，在循环内部使用Thread.yield()让出CPU给别的线程执行时间。如果需要一个高性能的系统，并且对延时有比较严格的要求，可以考虑这种策略。
- BusySpinWaitStrategy策略，采用死循环，消费者线程会尽最大努力监控缓冲区的变化。适用于对延时要求非常苛刻的场景，CPU核数大于消费者线程数量。推荐在线程绑定到固定的CPU的场景下使用

Disruptor的核心概念：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302251737077.png" alt="img202302251737077" style="zoom:67%;" />

Disruptor的构造方法：

```java
public Disruptor(
        final EventFactory<T> eventFactory,
        final int ringBufferSize,
        final ThreadFactory threadFactory,
        final ProducerType producerType,
  			final WaitStrategy WaitStrategy
  }
```

- EventFactory：创建事件（任务）的工厂类
- ringBufferSize：容器的长度
- ThreadFatory：用于创建执行任务的线程
- ProductType：生产者类型：单生产者、多生产者
- WaitStrategy：等待策略

### Disruptor实战

使用案例：

```java
public class DisruptorDemo {

    public static void main(String[] args) throws Exception {

        //创建disruptor
        Disruptor<OrderEvent> disruptor = new Disruptor<>(
                OrderEvent::new,
                1024 * 1024,
                Executors.defaultThreadFactory(),
                ProducerType.SINGLE, //单生产者
                new YieldingWaitStrategy()  //等待策略
        );

        //设置消费者用于处理RingBuffer的事件
        disruptor.handleEventsWith(new OrderEventHandler());
        //设置多消费者,消息会被重复消费
        //disruptor.handleEventsWith(new OrderEventHandler(),new OrderEventHandler());
        //设置多消费者,消费者要实现WorkHandler接口，一条消息只会被一个消费者消费
        //disruptor.handleEventsWithWorkerPool(new OrderEventHandler(), new OrderEventHandler());

        //启动disruptor
        disruptor.start();

        //创建ringbuffer容器
        RingBuffer<OrderEvent> ringBuffer = disruptor.getRingBuffer();
        //创建生产者
        OrderEventProducer eventProducer = new OrderEventProducer(ringBuffer);
        // 发送消息
        for(int i=0;i<100;i++){
            eventProducer.onData(i,"Fox"+i);
        }

        disruptor.shutdown();

    }
}
```

## 并发设计模式

### 终止线程模式

#### 两阶段终止模式

两阶段终止模式，将终止过程分成两个阶段，其中第一个阶段主要是线程T1向线程T2发送终止指令，而第二阶段则是线程T2响应终止指令。

Java线程进入终止状态的前提是线程进入RUNNABLE状态，而利用java线程中断机制的interrupt()方法，可以让线程从休眠状态转换到RUNNABLE状态。RUNNABLE状态转换到终止状态，优雅的方式是让Java线程自己执行完run()方法，所以一般我们采用的方法是设置一个标志位，然后线程会在合适的时机检查这个标志位，如果发现符合终止条件，则自动退出run()方法。

两阶段终止模式是一种应用很广泛的并发设计模式，在Java语言中使用两阶段终止模式来优雅地终止线程，需要注意两个关键点：一个是仅检查终止标志位是不够的，因为线程的状态可能处于休眠态；另一个是仅检查线程的中断状态也是不够的，因为我们依赖的第三方库很可能没有正确处理中断一场，例如第三方库在捕获到Thread.sleep()方法抛出的中断异常后，没有重新设置线程的中断状态，那么就会导致线程不能够正常终止。*所以我们可以自定义线程的终止标志位用于终止线程。*

### 避免共享的设计模式

#### Immutability模式

Immutability模式即不变性模式，“多个线程同时读写同一共享变量存在并发问题”，这里的必要条件之一是读写，如果只有读，而没有写，是没有并发问题的。解决并发问题，其实最简单的办法是让共享变量只有读操作，而没有写操作，这种解决并发问题的设计模式被称为不变性模式。所谓不变性，简单来讲，就是对象一旦被创建之后，状态就不再发生变化。换句话说，就是变量一旦被赋值，就不允许修改了（没有写操作）；没有修改操作，也就是保持了不变性。

JDK中很多类都具备不变性，例如常用的String、Long、Integer和Double等基础类型的包装类都具备不可变性，这些对象的线程安全性都是靠不可变性来保证的。它们都严格遵守了不可变类的三点要求：类和属性都是final的，所有方法均是只读的。

在使用不变性模式的时候，需要注意以下两点：

- 对象的所有属性都是final的，并不能保证不可变性
- 不可变对象也需要正确发布

在使用不可变性模式的时候一定要确认保持不变性的边界在哪里，是否要求属性对象也具备不可变性。

下面的代码中，Bar的属性foo虽然是final的，但是依然可以通过setAge()方法来设置foo的属性age。

```java
class Foo {
  int age=0;
  int name="abc";
}
final class Bar {
  final Foo foo;
  void setAge(int a){
    foo.age=a;
}
```

可变对象虽然是线程安全的，但是并不意味着引用这些不可变对象的对象就是线程安全的。下面的代码中，Foo具备不可变性，线程安全，但是类Bar并不是线程安全的，类Bar中持有对Foo的引用foo，对foo这个引用的修改在多线程中并不能保证可见性和原子性。

```java
//Foo线程安全
final class Foo {
  final int age=0;
  final String name="abc";
}
//Bar线程不安全
class Bar {
  Foo foo;
  void setFoo(Foo f){
    this.foo=f;
  }
}
```

#### Copy-on-Write模式

写时复制模式。Java中的String在实现replace()方法的时候，并没有更改原字符串里面value[]数组的内容，而是创建了一个新字符串，这种方法在解决不可变对象的修改问题时经常用到。它本质上是一种Copy-on-Write方法。所谓Copy-on-Write，经常被缩写为COW，或者CoW。

Copy-on-Write缺点就是消耗内存，每次修改都需要复制一个新的对象出来，好在随着自动垃圾回收（GC）算法的成熟以及硬件的发展，这种内存消耗已经渐渐可以接受了。所以在实际工作中，如果写操作非常少（读多写少的场景），可以尝试使用Copy-on-Write。

在Java中，CopyOnWriteArrayList和CopyOnWriteArraySet这两个Copy-on-Write容器，它们背后的设计思想就是Copy-on-Write，通过Copy-on-Write这两个容器实现读操作是无锁的，由于无锁，所以将读操作的性能发挥到了极致。

Copy-on-Write在操作系统领域中也有广泛的应用。类Unix的操作系统中创建进行的API是fork()，传统的fork()函数会创建父进程的一个完整副本，例如父进程的地址空间用到了1G的内存，那么fork()子进程的时候要复制父进程整个进程的地址空间（占有1G内存）给子进程，这个过程是很耗时的。而Linux中fork()子进程的时候，并不复制整个进程的地址空间，而是让父子进程共享同一个地址空间；只有在父进程或者子进程需要写入的时候才会复制地址空间，从而使父子进程拥有各自的地址空间。

Copy-on-Write最大的应用领域还是在函数式编程领域。函数式编程的基础是不可变性，所以函数式编程的所有的修改操作都需要Copy-on-Write来解决。

像一些RPC框架还有服务注册中心，也会利用Copy-on-Write设计思想维护服务路由表。路由表是典型的读多写少，而且路由表对数据的一致性要求并不高，一个服务提供方从上线到反馈到客户端的路由表里，即便有5秒钟延迟，很多时候也是能够接受的。

#### Thread-Specific Storage模式

线程本地存储模式，即只有一个入口，也会在内部为每个线程分配持有的存储空间的模式。在Java中，ThreadLocal类实现了该模式。

线程本地存储模式本质上就是一种避免共享的方法，由于没有共享，所以自然也就没有并发问题。如果需要在并发场景中使用一个线程不安全的工具类，最简单的方案就是避免共享。避免共享有两种方案，一种方案是将这个工具类作为局部变量使用，另外一种方案就是线程本地存储模式。这两种方案，局部变量方案的缺点是在高并发场景下会频繁创建对象，而线程本地存储方案，每个线程只需要创建一个工具类的实例，所以不存在频繁创建对象的问题。

```java
static class SafeDateFormat {
  //定义ThreadLocal变量
  static final ThreadLocal<DateFormat> tl=ThreadLocal.withInitial(
    ()-> new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
      
  static DateFormat get(){
    return tl.get();
  }
}
//不同线程执行下面代码，返回的df是不同的
DateFormat df = SafeDateFormat.get()；
// 注意：在线程池中使用ThreadLocal 需要避免内存泄漏和线程安全的问题
ExecutorService es;
ThreadLocal tl;
es.execute(()->{
  //ThreadLocal增加变量
  tl.set(obj);
  try {
    // 省略业务逻辑代码
  } finally {
    //手动清理ThreadLocal 
    tl.remove();
  }
});
```

### 多线程版本的if模式

#### Guarded Suspension模式

保护性暂停模式，是通过让线程等待来保护实例的安全性，即守护-挂起模式。在多线程开发中，常常为了提高应用程序的并发性，会将一个任务分解为多个子任务交给多分线程并行执行，而多个线程之间相互协作时，仍然会存在一个线程需要等待另外的线程完成后继续下一步操作。而保护性暂停模式可以帮助我们解决上述的等待问题。

Guarded Suspension模式允许多个线程对实例资源进行访问，但是实例资源需要对资源的分配做出管理。

Guarded Suspension模式也常被称为Guarded Wait模式、Spin Lock模式（因为使用了while循环去等待），也被称为多线程版本的if。

- 有一个结果需要从一个线程传递到另一个线程，让它们关联同一个GuardedObject
- 如果有结果不断从一个线程到另一个线程那么可以使用消息队列
- JDK中，join实现，Future的实现，采用的就是此模式
- 等待唤醒机制规范实现，此模式依赖于Java线程的阻塞唤醒机制
  - sychronized+wait/notify/notifyAll
  - ReentrantLock+Condition（await/singal/singalAll）
  - cas+park/unpark

阻塞唤醒机制机制底层原理：在linux操作系统中，pthread_mutex_lock/unlock，pthread_cond_wait/singal。

解决线程之间的协作不可避免会用到阻塞唤醒机制。

#### Balking模式

Balking是“退缩不前”的意思。如果现在不适合执行这个操作，或者没必要执行这个操作，就停止处理，直接返回。当流程的执行顺序依赖于某个共享变量的场景，可以归纳为多线程if模式。Balking模式常用于一个线程发现另一个线程已经做了某一件相同的事，那么本线程就无需再做了，直接结束返回。

Balking模式一种多个线程执行同一操作A时可以考虑的模式；在某一个线程B被阻塞或者执行其他操作时，其他线程同样可以完成操作A，而当线程B恢复执行或者执行操作A时，因A已被执行，而无需线程B再执行，从而提高了B的执行效率。

Balking模式和Guard Suspension模式一样，存在守护条件，如果守护条件不满足，则中断处理；这与Guard Suspension模式不同，Guard Suspension模式在守护条件不满足的时候会一直等待至可以运行，

```java
boolean changed=false;
// 自动存盘操作
void autoSave(){
  synchronized(this){
    if (!changed) {
      return;
    }
    changed = false;
  }
  // 执行存盘操作
  // 省略且实现
  this.execSave();
}
// 编辑操作
void edit(){
  // 省略编辑逻辑
  ......
  change();
}
// 改变状态
void change(){
  synchronized(this){
    changed = true;
  }
}
Balking 模式有一个非常典型的应用场景就是单次初始化。
boolean inited = false;
synchronized void init(){
    if(inited){
      return;
    }
    //省略doInit的实现
    doInit();
    inited=true;
}
```

### 多线程分工模式

#### Thread-Per-Message模式

一个线程处理一个任务，Thread-Per-Message 模式的一个最经典的应用场景是网络编程里服务端的实现，服务端为每个客户端请求创建一个独立的线程，当线程处理完请求后，自动销毁，这是一种最简单的并发处理网络请求的方法。

```java
final ServerSocketChannel  ssc= ServerSocketChannel.open().bind(new InetSocketAddress(8080));
//处理请求    
try {
  while (true) {
    // 接收请求
    SocketChannel sc = ssc.accept();
    // 每个请求都创建一个线程
    new Thread(()->{
      try {
        // 读Socket
        ByteBuffer rb = ByteBuffer.allocateDirect(1024);
        sc.read(rb);
        //模拟处理请求
        Thread.sleep(2000);
        // 写Socket
        ByteBuffer wb = (ByteBuffer)rb.flip();
        sc.write(wb);
        // 关闭Socket
        sc.close();
      }catch(Exception e){
        throw new UncheckedIOException(e);
      }
    }).start();
  }
} finally {
  ssc.close();
}   
```

Thread-Per-Message模式作为一种最简单的分工方案，Java中使用会存在性能缺陷。在Java中的线程是一个重量级的对象，创建成本很高，一方面创建线程比较耗时，另一方面线程占用的内存也比较大。所以为每个请求创建一个新的线程并不适合高并发场景。为了解决这个缺点，Java并发包里提供了线程池等工具类。

在其他编程语言里，例如Go语言，基于轻量级线程实现Thread-Per-Message模式就完全没有问题。

对于一些并发度没那么高的异步场景，例如定时任务，采用Thread-Per-Message模式是完全没有问题的。

#### Worker Thread模式

线程工厂模式，能避免线程频繁创建、销毁的问题，而且能够限制线程的最大数量。Java语言中可以直接使用线程池来实现Worker Thread模式。

```java
ExecutorService es = Executors.newFixedThreadPool(200);
final ServerSocketChannel ssc = ServerSocketChannel.open().bind(new InetSocketAddress(8080));
//处理请求    
try {
  while (true) {
    // 接收请求
    SocketChannel sc = ssc.accept();
    // 将请求处理任务提交给线程池
    es.execute(()->{
      try {
        // 读Socket
        ByteBuffer rb = ByteBuffer.allocateDirect(1024);
        sc.read(rb);
        //模拟处理请求
        Thread.sleep(2000);
        // 写Socket
        ByteBuffer wb = 
          (ByteBuffer)rb.flip();
        sc.write(wb);
        // 关闭Socket
        sc.close();
      }catch(Exception e){
        throw new UncheckedIOException(e);
      }
    });
  }
} finally {
  ssc.close();
  es.shutdown();
}   
```

#### 生产者-消费者模式

生产者-消费者模式的核心是一个任务队列，生产者线程生产任务，并将任务添加到任务队列中，而消费者线程从任务队列中获取任务并执行。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302261644855.png" alt="https://note.youdao.com/yws/public/resource/cb3a8a333b5abdc55eae03d16b16faff/xmlnote/6CF9FB3FBF3541A4AC4B8323CDEE54F6/2019" style="zoom:67%;" />

```java
public class Test {
    public static void main(String[] args) {
        // 生产者线程池
        ExecutorService producerThreads = Executors.newFixedThreadPool(3);
        // 消费者线程池
        ExecutorService consumerThreads = Executors.newFixedThreadPool(2);
        // 任务队列，长度为10
        ArrayBlockingQueue<Task> taskQueue = new ArrayBlockingQueue<Task>(10);
        // 生产者提交任务
        producerThreads.submit(() -> {
            try {
                taskQueue.put(new Task("任务"));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        // 消费者处理任务
        consumerThreads.submit(() -> {
            try {
                Task task = taskQueue.take();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
    }
    static class Task {
        // 任务名称
        private String taskName;
        public Task(String taskName) {
            this.taskName = taskName;
        }
    }
}

```

#### 过饱问题解决方案

  在实际生产项目中会有些极端的情况，导致生产者/消费者模式可能出现过饱的问题。单位时间内，生产者生产的速度大于消费者消费的速度，导致任务不断堆积到阻塞队列中，队列堆满只是时间问题。

场景一：消费者每天能处理的量比生产者生产的少；如生产者每天1万条，消费者每天只能消费5千条。

解决办法：消费者加机器

原因：生产者没法限流，因为要一天内处理完，只能消费者加机器

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302261647121.png" alt="img202302261647121" style="zoom:67%;" />

场景二：消费者每天能处理的量比生产者生产的多。系统高峰期生产者速度太快，把队列塞爆了

解决办法：适当的加大队列

原因：消费者一天的消费能力已经高于生产者，那说明一天之内肯定能处理完，保证高峰期别把队列塞满就好

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302261647286.png" alt="img202302261647286" style="zoom:67%;" />

场景三：消费者每天能处理的量比生产者生产的多。条件有限或其他原因，队列没法设置特别大。系统高峰期生产者速度太快，把队列塞爆了

解决办法：生产者限流

原因：消费者一天的消费能力高于生产者，说明一天内能处理完，队列又太小，那只能限流生产者，让高峰期塞队列的速度慢点

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302261648369.png" alt="img202302261648369" style="zoom:67%;" />
