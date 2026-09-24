---
title: 阻塞队列
---

阻塞队列是线程池的底座，也是生产者—消费者模式最现成的实现。理解它，就理解了「为什么线程池一定得用阻塞队列」以及「为什么 `LinkedBlockingQueue` 比 `ArrayBlockingQueue` 吞吐量高」这类问题。

### 队列与阻塞队列

队列（Queue）大家都不陌生：先进先出，从尾部入队，从头部出队。Java 里 `Queue` 接口定义了三类操作，每类都有「抛异常」和「返回特殊值」两种形式：

| 操作 | 抛异常 | 返回特殊值 |
| --- | --- | --- |
| 入队 | `add(e)` | `offer(e)`（失败返回 `false`） |
| 出队 | `remove()` | `poll()`（队空返回 `null`） |
| 查看队头 | `element()` | `peek()`（队空返回 `null`） |

**阻塞队列**（`BlockingQueue`）在此基础上加了「阻塞」这一种处理方式，因为它要解决的是线程协作问题：队满和队空不该是错误，而应该是「等一下」。

`BlockingQueue` 在 `Queue` 之上补了四个方法：

| 操作 | 阻塞 | 超时 |
| --- | --- | --- |
| 入队 | `put(e)`：队满则阻塞等待 | `offer(e, time, unit)`：等一段时间，仍失败返回 `false` |
| 出队 | `take()`：队空则阻塞等待 | `poll(time, unit)`：等一段时间，仍失败返回 `null` |

于是**四种处理策略**凑齐了：抛异常、返回特殊值、无限阻塞、超时放弃。选哪种取决于业务上「队满/队空算不算异常」。

阻塞队列的价值在于它天然实现了生产者—消费者的完整语义：生产者满了就等，消费者空了就等，入队成功自动唤醒等待的消费者，出队成功自动唤醒等待的生产者。**你不用再手写 `wait` / `notifyAll`，队列内部已经处理好了**——而且处理得比手写更准确，因为它知道该唤醒的是生产者还是消费者。

### JUC 里的阻塞队列家族

| 实现 | 数据结构 | 是否有界 | 特点 |
| --- | --- | --- | --- |
| `ArrayBlockingQueue` | 数组 | 有界 | 必须指定容量，一把锁 + 两个条件变量 |
| `LinkedBlockingQueue` | 链表 | 可选 | 默认 `Integer.MAX_VALUE`（相当于无界），两把锁 |
| `SynchronousQueue` | 不存储 | — | 没有容量，一次配对一次传递 |
| `PriorityBlockingQueue` | 堆 | 无界 | 按优先级出队，不是 FIFO |
| `DelayQueue` | 堆 + 延迟 | 无界 | 只有到期元素才能出队 |
| `LinkedTransferQueue` | 链表 | 无界 | 多了 `transfer()`，生产者可直接交给消费者 |

下面看两个最常用的。

### ArrayBlockingQueue

基于数组的有界队列，容量在构造时确定，之后不可变。

```java
// 构造时必须指定容量
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(100);
```

它的核心是**一把锁 + 两个条件变量**：

```java
final ReentrantLock lock;
private final Condition notEmpty;  // 队列非空，消费者等这个
private final Condition notFull;   // 队列未满，生产者等这个

public void put(E e) throws InterruptedException {
    lock.lockInterruptibly();
    try {
        // 队列满了，在 notFull 上等待
        while (count == items.length) {
            notFull.await();
        }
        enqueue(e);
        // 入队成功，唤醒等待非空的消费者
        notEmpty.signal();
    } finally {
        lock.unlock();
    }
}

public E take() throws InterruptedException {
    lock.lockInterruptibly();
    try {
        // 队列空了，在 notEmpty 上等待
        while (count == 0) {
            notEmpty.await();
        }
        E e = dequeue();
        // 出队成功，唤醒等待未满的生产者
        notFull.signal();
        return e;
    } finally {
        lock.unlock();
    }
}
```

注意这里的两个细节，它们和上一节讲等待通知机制时说的完全对应：

- **`while` 而不是 `if`**：被唤醒后条件可能又变了，必须重新检查
- **两个条件变量**：生产者和消费者各自等在不同的 `Condition` 上，所以入队后只需要 `signal()` 唤醒一个消费者，不用 `signalAll()` 唤醒所有人

这正是 `Condition` 相比 `wait`/`notify` 的优势——`Object` 上只有一个等待队列，只能用 `notifyAll` 广播；`Condition` 可以按条件分队列，唤醒更精确。

数组实现的好处是内存连续、无额外节点开销，缺点是**入队出队共用一把锁**，读写不能并行。

### LinkedBlockingQueue

基于链表的队列，默认容量是 `Integer.MAX_VALUE`——**这实际上等于无界**，除非你在构造时显式指定容量。

```java
// 默认无界，务必慎用
BlockingQueue<Task> unbounded = new LinkedBlockingQueue<>();

// 指定容量，这才是有界队列
BlockingQueue<Task> bounded = new LinkedBlockingQueue<>(1000);
```

它和 `ArrayBlockingQueue` 最大的区别是**用了两把锁**：

```java
/** 出队锁，保护 head */
private final ReentrantLock takeLock = new ReentrantLock();
private final Condition notEmpty = takeLock.newCondition();

/** 入队锁，保护 last */
private final ReentrantLock putLock = new ReentrantLock();
private final Condition notFull = putLock.newCondition();
```

入队只锁 `putLock`，出队只锁 `takeLock`，**入队和出队可以真正并行**。这是它吞吐量高于 `ArrayBlockingQueue` 的根本原因——在生产者消费者数量都不少的情况下，读写不再互相阻塞。

代价是复杂度上升：`count` 这个计数器被两把锁共享，所以它必须是 `AtomicInteger`；入队后如果发现队列还没满，还得再唤醒一个生产者（因为可能还有生产者在上一个时刻被阻塞着）：

```java
public void put(E e) throws InterruptedException {
    int c = -1;
    Node<E> node = new Node<>(e);
    final ReentrantLock putLock = this.putLock;
    final AtomicInteger count = this.count;
    putLock.lockInterruptibly();
    try {
        while (count.get() == capacity) {
            notFull.await();
        }
        enqueue(node);
        c = count.getAndIncrement();
        // 入队后还有空位，唤醒其他等待的生产者
        if (c + 1 < capacity) {
            notFull.signal();
        }
    } finally {
        putLock.unlock();
    }
    // c == 0 说明入队前队列是空的，可能有消费者在等，唤醒它
    if (c == 0) {
        signalNotEmpty();
    }
}
```

#### 两者对比

| | `ArrayBlockingQueue` | `LinkedBlockingQueue` |
| --- | --- | --- |
| 数据结构 | 数组，预先分配 | 链表，按需创建节点 |
| 锁 | 一把锁 | 两把锁（入队/出队分离） |
| 吞吐量 | 较低 | 较高 |
| 内存 | 固定，无额外开销 | 每个元素一个 Node 对象 |
| GC 压力 | 小 | 大（频繁创建/回收节点） |
| 是否有界 | 必须指定容量 | 默认可视为无界 |

选择上：**明确用有界队列就用 `ArrayBlockingQueue`**（内存可控、GC 友好）；**追求吞吐量且能接受链表开销用 `LinkedBlockingQueue`**，但一定要显式指定容量。

### DelayQueue：延迟任务

`DelayQueue` 是一个无界队列，但**只有到期（延迟时间已过）的元素才能被取出**。队头永远是最早到期的那个元素。

它要求入队元素实现 `Delayed` 接口：

```java
public interface Delayed extends Comparable<Delayed> {
    // 返回剩余延迟时间，<=0 表示已到期
    long getDelay(TimeUnit unit);
}
```

最典型的场景是**订单超时自动取消**：

```java
public class OrderDelayTask implements Delayed {

    private final String orderId;
    /** 任务到期时刻（毫秒时间戳） */
    private final long expireAt;

    public OrderDelayTask(String orderId, long delayMillis) {
        this.orderId = orderId;
        this.expireAt = System.currentTimeMillis() + delayMillis;
    }

    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(expireAt - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }

    @Override
    public int compareTo(Delayed o) {
        // 按到期时间排序，越早到期越靠前
        return Long.compare(this.expireAt, ((OrderDelayTask) o).expireAt);
    }
}
```

消费端就是一个 `take()` 循环——队列空或者队头没到期时，`take()` 会一直阻塞：

```java
public void start() {
    new Thread(() -> {
        while (true) {
            try {
                // 队头没到期就一直阻塞，到点了才返回
                OrderDelayTask task = delayQueue.take();
                cancelOrder(task.getOrderId());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }, "order-expire").start();
}
```

底层是**优先队列（堆）**，所以它的出队顺序由 `compareTo` 决定而不是入队时间。这也意味着 `DelayQueue` 本身不保证 FIFO。

实际生产里，订单超时更常用的方案是 Redis 过期回调或者定时任务扫表，`DelayQueue` 的问题在于**数据在内存里**——服务重启就丢了，多实例也无法共享。它适合单机、可接受丢失的延迟场景（比如本地缓存刷新）。

### 如何选择

#### 选型策略

| 需求 | 选择 |
| --- | --- |
| 明确容量、内存敏感 | `ArrayBlockingQueue` |
| 追求吞吐量 | `LinkedBlockingQueue`（指定容量） |
| 需要优先级 | `PriorityBlockingQueue` |
| 需要延迟执行 | `DelayQueue` |
| 线程之间直接传递、不存储 | `SynchronousQueue` |

#### 线程池如何选队列

这一条很关键，因为它决定了线程池的行为——回想线程池的执行流程：**核心线程满了之后任务先进队列，队列也满了才扩容到最大线程数**。所以队列的选择直接改变了扩容时机。

JDK 的 `Executors` 给出了默认搭配：

| 线程池 | 使用的队列 |
| --- | --- |
| `FixedThreadPool` | `LinkedBlockingQueue`（无界） |
| `SingleThreadExecutor` | `LinkedBlockingQueue`（无界） |
| `CachedThreadPool` | `SynchronousQueue` |
| `ScheduledThreadPool` | `DelayedWorkQueue` |

这里的坑值得单独说：**`FixedThreadPool` 和 `SingleThreadExecutor` 用的是无界队列，配合它们固定的 `maximumPoolSize`，会导致 `maximumPoolSize` 这个参数完全失效**——因为队列永远满不了，永远不会触发扩容到最大线程数。

结果就是：任务持续堆积时，线程数停在核心线程数不变，队列无限增长，最终 `OutOfMemoryError`。

```java
// 有 OOM 风险：无界队列 + 最大线程数形同虚设
ExecutorService pool = Executors.newFixedThreadPool(10);

// 正确做法：手动构造，显式指定有界队列和拒绝策略
ExecutorService pool = new ThreadPoolExecutor(
    10, 20,
    60L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(1000),          // 有界
    Executors.defaultThreadFactory(),
    new ThreadPoolExecutor.CallerRunsPolicy() // 明确的拒绝策略
);
```

这就是「不建议用 `Executors` 快捷方法创建线程池」的核心原因。关于线程池的参数怎么设、拒绝策略怎么选，是下一节的内容。
