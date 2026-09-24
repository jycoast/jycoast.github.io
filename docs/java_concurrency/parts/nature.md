---
title: 并发编程的本质
---

回到最开始提出的三个核心问题——**分工、同步、互斥**。前面十几节把每个具体的技术都拆开看过了，这一节把它们收拢起来。

并发编程的本质，就是解决多线程之间的**同步、互斥、分工**问题。而所有技术手段，最终都可以归到两条路线上：**加锁**，或者**不加锁**。

### 加锁过程总结

从 `synchronized` 到 `ReentrantLock`，中间隔着管程模型和 AQS，但把加锁这件事串起来看，它始终是同一套流程：

**第一步，尝试获取锁。**

- `synchronized` 编译成 `monitorenter` 指令，由 JVM 在对象头（Mark Word）上记录锁状态
- `ReentrantLock` 调用 `AQS.acquire()`，用 CAS 尝试把 `state` 从 0 改成 1

两者的共同点是都**先做一次乐观尝试**：`synchronized` 有偏向锁/轻量级锁，`AQS` 有 `tryAcquire`。低竞争时根本不会真的进入内核挂起线程。

**第二步，记录持有者。**

拿到锁的线程把自己的标识写进去：

- `synchronized` 把线程 ID 写进 `ObjectMonitor` 的 `_owner`
- `AQS` 把 `state` 置为 1，并把 `exclusiveOwnerThread` 指向自己

**第三步，处理重入。**

如果是同一个线程再次申请：

- `ObjectMonitor` 把 `_count` 加 1
- `AQS` 把 `state` 加 1

这就是「可重入」的实现——不靠额外的标识，靠一个计数器。相应地，释放时也必须减到 0 才真正释放。

**第四步，竞争失败则入队等待。**

- `synchronized` 竞争失败先自旋，自旋失败后升级为重量级锁，线程进入 `ObjectMonitor` 的 `_EntryList`，被挂起
- `AQS` 把线程包成 `Node` 加入 CLH 队列尾部，然后 `LockSupport.park()` 挂起

注意两者的**队列语义不同**：`ObjectMonitor` 的 `EntryList` 是不公平的（唤醒后要重新抢），而 `AQS` 既支持公平也支持非公平，由 `tryAcquire` 里要不要检查前驱节点决定。

**第五步，释放并唤醒。**

- `monitorexit` 减少 `_count`，减到 0 时唤醒 `_EntryList` 中的线程
- `AQS.release()` 减少 `state`，减到 0 时把队列中第一个有效节点唤醒（`unparkSuccessor`）

**加锁的代价到底在哪？** 不在「拿到锁」这个动作，而在**竞争失败后的挂起与唤醒**——那是一次系统调用，需要陷入内核、保存和恢复线程上下文。所以优化锁的核心思路永远是：**尽量别让线程真的去排队**。偏向锁、轻量级锁、自旋、CAS 无锁，都是在做这件事。

### 无锁保证线程安全总结

不加锁也能保证线程安全，思路只有两条：**不共享可变状态**，或者**把「检查 + 更新」变成一次原子操作**。

下面按「共享程度」从小到大排一遍。

#### 单线程

最彻底的无锁：数据只被一个线程访问，自然不存在并发问题。

- **线程封闭**：把对象限制在单个线程内使用，不发布出去
- **栈封闭**：局部变量天生就在栈上，每个线程一份，天然安全
- **不可变对象**：状态创建后不再改变，多个线程同时读没有风险

Java 里典型的不可变类：`String`、`Integer` 等包装类、`LocalDate` 等时间类。

让对象不可变需要满足几个条件：

1. 对象创建后状态不能修改（所有字段 `final`）
2. 所有字段都是 `final` 的
3. 对象创建期间 `this` 引用没有逸出（构造方法里别把 `this` 传出去）
4. 如果字段是引用类型，指向的对象本身也必须不可变

不可变对象的线程安全是「免费」的，但代价是每次修改都要创建新对象——`String` 拼接的坑就来自这里。

#### ThreadLocal

`ThreadLocal` 提供的是**线程级别的变量副本**：每个线程都有自己独立的一份，互不干扰。

它的用法很简单：

```java
public class UserContext {

    private static final ThreadLocal<User> CURRENT = new ThreadLocal<>();

    public static void set(User user) {
        CURRENT.set(user);
    }

    public static User get() {
        return CURRENT.get();
    }

    public static void remove() {
        CURRENT.remove();
    }
}
```

理解它必须理解它的设计：**`ThreadLocal` 本身不存数据，数据存在 `Thread` 对象里**。

每个 `Thread` 内部有一个 `ThreadLocalMap` 字段，`ThreadLocal` 实例只是作为这个 Map 的 key：

```java
// Thread 类里
ThreadLocal.ThreadLocalMap threadLocals = null;

// ThreadLocal.get() 的实质
public T get() {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);      // 拿当前线程自己的 Map
    if (map != null) {
        ThreadLocalMap.Entry e = map.getEntry(this);
        if (e != null) return (T) e.value;
    }
    return setInitialValue();
}
```

所以「线程隔离」不是 `ThreadLocal` 做的，是 `Thread` 自带的那个 Map 做的。这个设计的好处是：**线程死了，副本跟着一起没**，不需要额外的清理机制。

Spring 的事务管理用的就是它。回顾一下前面提到的场景：业务方法要在一个连接里完成「开启事务 → 执行多条 SQL → 提交」，「把连接当参数逐层传递」显然不现实。Spring 的做法就是在事务开始时把连接**绑定到当前线程**：

```java
// DataSourceTransactionManager#doBegin 的核心
Connection newCon = dataSource.getConnection();
// 把连接和当前线程绑定
TransactionSynchronizationManager.bindResource(dataSource, new ConnectionHolder(newCon));
```

`bindResource` 内部就是一个 `ThreadLocal`。于是同一线程里任何地方调 `DataSourceUtils.getConnection()` 拿到的都是同一个连接，事务才能生效。

**它的代价是内存泄漏。** `ThreadLocalMap` 的 key 是 `ThreadLocal` 实例本身的**弱引用**，而 value 是**强引用**：

```text
Thread → ThreadLocalMap → Entry → (弱) ThreadLocal 实例
                                 → (强) value 对象
```

当外部的 `ThreadLocal` 强引用被清掉（比如类被卸载、或者 `ThreadLocal` 是局部变量），key 会被 GC 回收，但 value 还挂在 Entry 上——而 Entry 被 Map 强引用，Map 被 Thread 强引用。

在**线程池**场景下这尤其致命：线程是复用的，不会结束，于是这些 value 就永远留在堆里，积少成多就是 OOM。

标准解法是**用完必须 `remove()`**：

```java
try {
    UserContext.set(user);
    doBusiness();
} finally {
    UserContext.remove();   // 必须放在 finally
}
```

特别注意：`ThreadLocalMap` 在 set/get 时确实会顺手清理一部分 key 为 null 的 Entry（探测式清理/启发式清理），但这是**附带的、不可靠的**——它只清理碰巧遇到的那些，不能指望它兜底。

#### final 关键字

`final` 修饰变量时，初衷是告诉编译器「这个变量生而不变」。

它的可见性由 JMM 的**初始化安全性**保证：正确构造的对象，只要没有 `this` 逸出，那么所有线程都能看到构造方法里对 `final` 字段的写入，**不需要额外同步**。

效果类似内存屏障，但实现上依赖编译器约束和硬件内存模型。在 x86 这种强内存模型上通常不需要显式屏障；在 ARM 等弱内存模型架构上，可能需要在 `final` 字段写入后插入 StoreStore 屏障。

#### CAS 乐观锁

CAS 的思路是把「检查 + 更新」压缩成一条硬件指令：只有当内存里的值等于预期值时才写入新值，整个过程不可分割。

```java
// 伪代码，实际由 CPU 的 cmpxchg 指令完成
boolean cas(address, expect, update) {
    if (*address == expect) {
        *address = update;
        return true;
    }
    return false;
}
```

它建立在一个前提上：**大多数竞争其实并不发生**。所以不做加锁这种悲观假设，而是先直接改，改了发现冲突再重试。

#### 什么是原子操作

并发里的原子性和事务里的原子性是完全一样的概念。假定有两个操作 A 和 B 都包含多个步骤，如果从执行 A 的线程来看，当另一个线程执行 B 时，要么 B 全部执行完，要么完全不执行 B，执行 B 的线程看 A 也一样——那么 A 和 B 对彼此来说就是原子的。

用锁能实现原子操作，但 `synchronized` 是基于阻塞的：一个线程持有锁时，其他线程必须等待直到锁释放。CAS 想避免的正是这个等待。

#### 三大问题

**一、ABA 问题。**

线程 1 读到值是 A，准备 CAS 成 C。这期间线程 2 把 A 改成 B，又改回 A。线程 1 的 CAS 成功执行——它以为值没变过，实际上已经被改了两轮。

多数场景下这无所谓（值对就行），但如果是链表节点之类的引用，中间那轮改动可能已经破坏了结构。

解法是给变量加递增的**版本号**（stamp），每次修改都同时更新版本号：

```text
1A → 2B → 3A
```

即使值又回到 A，版本号不同，CAS 也能识别出中间被改过。

Java 直接提供了这个机制：

- `AtomicStampedReference<V>`（值 + int 版本号）
- `AtomicMarkableReference<V>`（值 + boolean 标记位，简化版）

用它们实现 CAS，就彻底杜绝 ABA 问题。

**二、循环时间长开销大。**

自旋 CAS 如果长时间不成功，会给 CPU 带来非常大的执行开销。这也是 `LongAdder` 存在的理由——它把单点热点拆成多个 `Cell`，让不同线程分散累加，最后汇总，避免了所有线程自旋在同一个变量上。

**三、只能保证一个共享变量的原子操作。**

CAS 原生只能保证**单个共享变量**的原子性：

- 对单个变量，可通过循环 CAS（自旋）实现原子更新
- 对多个共享变量，循环 CAS 无法保证整体原子性，此时需使用锁
- 替代方案：将多个共享变量合并为一个对象，通过 `AtomicReference<V>` 对该对象整体进行 CAS，从而实现多变量的复合原子操作

Java 1.5 引入的 `AtomicReference` 正是为此设计：把任意数量的变量封装进一个对象，用一次引用 CAS 完成「多字段」原子更新，巧妙规避了传统锁。

#### Atomic 原子类

原子类是把 CAS 包装成易用 API 的产物，可以按用途分几类：

| 类别 | 代表类 |
| --- | --- |
| 基本类型 | `AtomicInteger`、`AtomicLong`、`AtomicBoolean` |
| 数组 | `AtomicIntegerArray`、`AtomicLongArray`、`AtomicReferenceArray` |
| 引用类型 | `AtomicReference`、`AtomicStampedReference`、`AtomicMarkableReference` |
| 字段更新器 | `AtomicIntegerFieldUpdater`、`AtomicReferenceFieldUpdater` |
| 累加器 | `LongAdder`、`DoubleAdder`、`LongAccumulator` |

以 `AtomicInteger` 为例，自增用的是「CAS + 自旋」：

```java
public final int getAndIncrement() {
    return U.getAndAddInt(this, VALUE, 1);
}

// Unsafe 里
public final int getAndAddInt(Object o, long offset, int delta) {
    int v;
    do {
        v = getIntVolatile(o, offset);   // 读当前值
    } while (!compareAndSwapInt(o, offset, v, v + delta));  // CAS 失败就重试
    return v;
}
```

两个细节值得注意：

- 读用了 `getIntVolatile`，因为要保证读到的是**最新值**，否则 `v` 是过期的，CAS 必然失败
- 循环没有退避策略，高竞争下会大量空转——这正是 `LongAdder` 要解决的问题

`LongAdder` 的思路是**分散热点**：内部维护一个 `base` 变量和一个 `Cell[]` 数组，没有竞争时直接 CAS `base`，出现竞争时把线程按哈希分散到不同的 `Cell` 上各自累加，求总和时再把它们加起来。

代价是 `sum()` 只能返回**一个近似一致的快照**（累加过程中其他线程还在写），所以 `LongAdder` 适合「统计计数」这类场景，不适合「需要精确值」的场景。

### 小结

| 路线 | 手段 | 适用条件 |
| --- | --- | --- |
| **不共享** | 单线程、线程封闭、不可变对象 | 数据本来就只被一个线程用，或不需要修改 |
| **隔离副本** | `ThreadLocal` | 状态天然属于单个线程（连接、上下文），且用完能正确 `remove` |
| **不修改** | `final` | 对象构造后状态不变 |
| **原子操作** | CAS、原子类 | 单变量更新，竞争不激烈 |
| **分散热点** | `LongAdder` | 高频累加统计，不需要精确读 |
| **加锁** | `synchronized`、`Lock` | 多变量复合操作，或临界区较长 |

选型的顺序应该是：**先问能不能不共享，再问能不能只读不改，再问能不能用原子操作解决单变量，最后才考虑加锁。**

之所以把加锁放在最后，是因为它的代价最高——挂起和唤醒是内核级的操作。但也要清楚它的优势：**锁是唯一能保证「多步操作整体原子」的手段**，这恰恰是 CAS 做不到的。

到这里，Java 并发编程的核心问题就讲完了。往后再遇到并发问题，先回到这三个问题上问一遍：**分工分清楚了吗？该同步的地方同步了吗？互斥的范围对不对？**
