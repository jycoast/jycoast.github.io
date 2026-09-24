---
title: JUC中的并发容器与工具类
---

前面讲的都是「怎么自己保证线程安全」：加锁、用 volatile、写 CAS 循环。但工程里更常见的情况是——我需要一个线程安全的 `HashMap`，总不能每次都自己包一层 `synchronized` 吧。

`java.util.concurrent`（JUC）包就是为这个准备的。它提供两类东西：**并发容器**（线程安全的集合），和**同步工具类**（协调多线程的工具）。

### 从同步容器到并发容器

Java 的集合框架有四大类别：`List`、`Set`、`Queue`、`Map`。我们最熟悉的 `ArrayList`、`LinkedList`、`HashMap` 都不是线程安全的。

最早的解决方案是**同步容器**：`Vector`、`Hashtable`，以及 `Collections.synchronizedXxx()` 包装出来的 `SynchronizedList` 等。它们本质上就是给每个方法加 `synchronized`。

问题在于粒度：**锁的是整个容器**。多个线程哪怕读的是不同位置的数据，也要排队抢同一把锁，并发性被彻底削弱，吞吐量随线程数增加不升反降。

并发容器的思路是把锁的粒度做细，或者干脆在某些路径上不加锁：

| 并发容器 | 对应的非并发容器 | 主要用途 |
| --- | --- | --- |
| `CopyOnWriteArrayList` | `ArrayList` | 替代 `Vector`、`SynchronizedList` |
| `CopyOnWriteArraySet` | `HashSet` | 替代 `SynchronizedSet` |
| `ConcurrentHashMap` | `HashMap` | 替代 `Hashtable`、`SynchronizedMap` |
| `ConcurrentSkipListMap` | `TreeMap` | 替代 `SynchronizedSortedMap` |
| `ConcurrentLinkedQueue` | `LinkedList` | 无界非阻塞队列 |
| `BlockingQueue` 家族 | — | 阻塞队列，另开一节 |

### CopyOnWriteArrayList

`CopyOnWriteArrayList` 利用了一个观察：很多场景是**读多写少**的。既然读远多于写，那就让读操作完全不加锁，代价由写操作来承担。

**原理**：写的时候先把底层数组整体复制一份，在副本上修改，改完之后把新数组的引用赋回去。读操作永远读那个引用指向的数组，不加锁。

因为数组引用是 `volatile` 的，写线程改完之后，读线程能立刻看到新数组——这里就用上了我们前面讲的 volatile 可见性和传递性。

```java
public boolean add(E e) {
    synchronized (lock) {
        Object[] es = getArray();
        int len = es.length;
        // 复制一份，长度 +1
        Object[] newElements = Arrays.copyOf(es, len + 1);
        newElements[len] = e;
        // 引用切换，volatile 写
        setArray(newElements);
        return true;
    }
}
```

读写分离带来的特性：

- **读不加锁**，并发读性能极高
- **读写不互斥**，读线程看到的是「读的那一刻」的那个快照，不会读到写了一半的状态
- **写操作开销大**，每次都要复制整个数组，元素多的时候很昂贵
- **读到的数据可能不是最新的**，因为写完成之前读方看到的还是旧数组

适用场景：

- **读多写少**：像配置、白名单、监听器列表这种「偶尔变一次，频繁被读」的数据
- **不需要实时一致**：读方拿到旧值可以接受

不适合的场景也很明确：写频繁、元素数量大、或者要求读到的一定是最新值。

#### 一个实战场景：IP 黑名单

典型的用法是「频繁判断，偶尔更新」——比如 IP 黑名单拦截：

```java
public class IpBlackList {

    private final CopyOnWriteArrayList<String> blackList = new CopyOnWriteArrayList<>();

    /** 高频调用：判断是否在黑名单中 */
    public boolean isBlocked(String ip) {
        return blackList.contains(ip);
    }

    /** 低频调用：新增封禁 */
    public void block(String ip) {
        blackList.addIfAbsent(ip);
    }
}
```

拦截是每次请求都要做的事，封禁可能一天才发生几次。这个读写比例正是 `CopyOnWriteArrayList` 的主场。

如果换成 `Collections.synchronizedList()`，每次拦截都要抢锁，所有请求串行化，性能会差一个数量级；而这个场景下 `CopyOnWriteArrayList` 的「读到的可能不是最新值」又完全可以接受。

#### fail-fast 与 fail-safe

`CopyOnWriteArrayList` 的迭代器还有一个重要特性，值得单独说，因为它经常出现在面试里。

`ArrayList` 的迭代器是 **fail-fast** 的：迭代过程中如果集合被修改，会立刻抛 `ConcurrentModificationException`。它靠维护一个 `modCount` 计数器实现，每次迭代时比对，发现不一致就抛异常——这是**尽力而为的错误检测**，不是并发安全的保证。

`CopyOnWriteArrayList` 的迭代器是 **fail-safe** 的：迭代器持有的是创建它那一刻的数组快照，整个迭代过程中都读这个快照。

```java
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
list.add("a");
list.add("b");

for (String s : list) {
    list.add("c");        // 不会抛异常
    System.out.println(s); // 只会打印 a、b
}
```

所以 fail-safe 的代价是：**迭代过程中看不到后来的修改**。好处是永远不会抛并发修改异常，缺点是你以为的「遍历全部元素」可能只是某个历史时刻的全部元素。

### ConcurrentHashMap

`ConcurrentHashMap` 是 JUC 里最常用的容器，它的实现思路随 JDK 版本演进了两次，每次都是在解决同一个问题：**怎么让并发的读写尽量不互相阻塞**。

`Hashtable` 和 `SynchronizedMap` 的做法是给整个表加一把锁，所有操作串行，读读之间也互斥。`ConcurrentHashMap` 要做的就是把锁的粒度降下来。

#### JDK 1.7：分段锁

JDK 1.7 引入了 **Segment** 的概念，把整个哈希表拆成若干段，每段是一把独立的可重入锁，段内还各自维护一个 `HashEntry` 数组：

```text
ConcurrentHashMap
  └── Segment[]（默认 16 个，每段一把 ReentrantLock）
        └── HashEntry[]（每段自己的桶数组）
```

定位过程是两次哈希：先按 hash 的高位找到 `Segment`，再按低位找到段内的桶。**不同 Segment 之间的读写是完全并行的**，并发度等于 Segment 的数量（默认 16），理论上可以同时支持 16 个线程写入。

`size()` 也做了优化：不直接加锁统计，而是先尝试无锁累加，失败重试，重试到一定次数才给所有 Segment 加锁统计。

#### JDK 1.8：CAS + synchronized

JDK 1.8 放弃了 Segment，改用和 `HashMap` 一致的「数组 + 链表 + 红黑树」结构，并发控制换成更细粒度的方式：

- **空桶插入**：用 CAS 直接写入，无锁
- **桶内已有节点**：只对**这一个桶的头节点**加 `synchronized`，不影响其他桶
- **链表过长**（超过 8）且数组长度达标时转红黑树，避免极端情况下的查询退化

粒度从「一段（多个桶）」降到了「一个桶」，并发度大幅提升，而且锁的实现也从 `ReentrantLock` 换成了内置的 `synchronized`（JVM 对偏向锁/轻量锁的优化让它在低竞争下更划算）。

#### 复合操作的坑

有一点必须记住：**`ConcurrentHashMap` 保证的只是单个操作的原子性，复合操作依然不安全**。

```java
// 错误：先检查再操作，两步之间可能被其他线程插入
if (!map.containsKey(key)) {
    map.put(key, value);
}
```

正确做法是用 `putIfAbsent`、`computeIfAbsent`、`replace` 这些原子复合方法：

```java
// 正确
map.putIfAbsent(key, value);

// 或者
map.computeIfAbsent(key, k -> createValue(k));
```

这类方法内部是在同一个桶锁的保护下完成「检查 + 写入」的，不会被打断。

### ConcurrentSkipListMap

对应 `TreeMap`，但 `TreeMap` 没法简单并发化——红黑树在插入时需要旋转平衡，旋转会影响一大片节点，很难把锁限制在局部。

`ConcurrentSkipListMap` 换了一种数据结构：**跳表**（Skip List）。

跳表是在有序链表基础上加多级索引：最底层是完整的有序链表，上面每层都是下层的「抽样」，查找时从最高层开始，能跳就跳：

```text
Level 2:  1 ──────────────→ 9
Level 1:  1 ──────→ 5 ────→ 9
Level 0:  1 → 3 → 5 → 7 → 9   （完整链表）
```

查找一个值，从顶层往下走，每层做一次「跳到下一个节点还是下降一层」的判断。平均查找复杂度是 O(log n)，和平衡树相当，但**插入只需要改动局部的指针**，并发控制容易得多，天然适合无锁实现。

跳表的缺点是实现比红黑树直观但常数项偏大，空间上因为多级索引也要多花一些。

需要**并发 + 有序**时（比如按时间排序的订单、排行榜）才用它；只要并发不需要有序，`ConcurrentHashMap` 更快。

### 同步工具类

并发容器解决的是「共享数据」，同步工具类解决的是「线程之间的协作」。它们都在 `java.util.concurrent` 下。

| 工具类 | 作用 | 典型场景 |
| --- | --- | --- |
| `ReentrantLock` | 可重入的显式锁 | 需要可中断、超时、公平锁、多条件变量时替代 `synchronized` |
| `Semaphore` | 控制同时访问资源的线程数 | 接口限流、数据库连接池 |
| `CountDownLatch` | 一个线程等 N 个线程完成 | 主线程汇总多个子任务的结果 |
| `CyclicBarrier` | N 个线程互相等待到齐 | 分阶段并行计算，用人满发车理解 |
| `Exchanger` | 两个线程交换数据 | 对账、双缓冲 |
| `Phaser` | 可重用的、分阶段的屏障 | 多阶段任务，比 `CyclicBarrier` 更灵活 |

关于这几把锁本身的实现（AQS、条件变量、可重入），前面几节已经讲过，这里补充两个容易混的点。

#### CountDownLatch 与 CyclicBarrier 的区别

这是最常被问到的对比，核心差异有两点：

**一是等待的方向不同。**

- `CountDownLatch` 是「**一个等多个**」：主线程调 `await()` 等在那里，N 个工作线程各自 `countDown()`，计数归零后主线程继续
- `CyclicBarrier` 是「**多个互相等**」：N 个线程各自调 `await()`，等到 N 个都到了，大家**一起**继续

**二是能否重复使用。**

- `CountDownLatch` 是**一次性的**，计数归零后就废了，想再用只能新建一个
- `CyclicBarrier` 可以**循环使用**（名字里的 Cyclic 就是这个意思），每凑齐一轮就重置一次，还能传一个 `Runnable` 在每轮到齐时执行

类比一下：`CountDownLatch` 像等所有人到齐才能开饭，`CyclicBarrier` 像人满发车，发完一趟车还能继续等下一趟。

#### Semaphore

`Semaphore` 管的是**许可（permit）**，可以理解成一个能容纳 N 个许可的池子：

- 线程执行前调 `acquire()` 拿许可，拿到才能往下走
- 执行完调 `release()` 还回去
- 许可被拿光后，`acquire()` 会阻塞直到有人归还

限流是它最典型的用法，用一个固定容量保护下游：

```java
public class RateLimiter {

    // 最多允许 10 个线程同时调用下游接口
    private final Semaphore semaphore = new Semaphore(10);

    public String callDownstream() throws InterruptedException {
        semaphore.acquire();
        try {
            return doCall();
        } finally {
            semaphore.release();  // 必须放在 finally，否则异常时许可泄漏
        }
    }
}
```

这里有个坑值得强调：**`release()` 一定要放在 `finally` 里**。如果业务代码抛异常导致许可没能归还，池子会越来越少，最后所有线程都阻塞在 `acquire()` 上——这种问题在压测之外的场景很难暴露，一上线就是死锁。

用 `Semaphore(1)` 还能当互斥锁用，效果类似 `ReentrantLock`，但不能重入。区别是 `Semaphore` 的获释不要求是同一个线程（A 线程 `acquire`、B 线程 `release` 是合法的），而 `ReentrantLock` 要求谁加锁谁解锁。

### 怎么选

| 需求 | 选择 |
| --- | --- |
| 并发 Map，不需要有序 | `ConcurrentHashMap` |
| 并发 Map，需要有序 | `ConcurrentSkipListMap` |
| 读多写少的 List | `CopyOnWriteArrayList` |
| 需要队列 | 见《阻塞队列》一节 |
| 一个线程等多个线程 | `CountDownLatch` |
| 多个线程互相等 | `CyclicBarrier` / `Phaser` |
| 控制并发度 | `Semaphore` |
| 两个线程交换数据 | `Exchanger` |

选型的核心永远是先想清楚**读写比例**和**一致性要求**：读多写少可以用空间换时间（CopyOnWrite），写多则要控制锁粒度（ConcurrentHashMap 的分桶），而一旦要求强一致，往往就得回到加锁的老路上。
