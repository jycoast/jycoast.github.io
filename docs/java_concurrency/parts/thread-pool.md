---
title: 线程池
---

线程池是并发编程里最「工程」的一环。它解决的问题很朴素：线程的创建和销毁都要消耗系统资源，如果每个任务都新建一个线程，高并发下光线程开销就能压垮服务。线程池把这些线程管起来复用，顺带解决了资源可控、任务排队、优雅关闭这些问题。

### 为什么需要线程池

自己 `new Thread()` 的问题：

1. **开销大**：创建一个线程要分配栈空间、在内核里注册，销毁也要回收，任务本身可能只跑几毫秒，开销比任务还大
2. **不可控**：请求量一上来就无限创建线程，很快耗尽内存或触发 `OutOfMemoryError: unable to create new native thread`
3. **没法管理**：任务排队、超时、拒绝、优雅关闭这些都得自己实现

线程池把「线程的创建」和「任务的提交」解耦：线程预先创建好复用，任务来了丢进队列等线程来取。

### 七个核心参数

```java
public ThreadPoolExecutor(int corePoolSize,        // 核心线程数
                          int maximumPoolSize,     // 最大线程数
                          long keepAliveTime,      // 非核心线程空闲存活时间
                          TimeUnit unit,           // 上述时间的单位
                          BlockingQueue<Runnable> workQueue,  // 任务队列
                          ThreadFactory threadFactory,        // 线程工厂
                          RejectedExecutionHandler handler)   // 拒绝策略
```

| 参数 | 含义 | 注意点 |
| --- | --- | --- |
| `corePoolSize` | 核心线程数 | 默认会一直存活（除非开了 `allowCoreThreadTimeOut`） |
| `maximumPoolSize` | 最大线程数 | 队列满了才会往这个数扩容 |
| `keepAliveTime` | 空闲存活时间 | 只对超出核心数的线程生效 |
| `workQueue` | 任务队列 | 必须是**阻塞队列**，为何见下节 |
| `threadFactory` | 线程工厂 | 可以在这里给线程起名，排查问题时非常有用 |
| `handler` | 拒绝策略 | 队列满且线程数达上限后触发 |

`threadFactory` 这个参数经常被忽略，但生产环境强烈建议自定义：

```java
ThreadFactory factory = new ThreadFactoryBuilder()
    .setNameFormat("order-pool-%d")   // 线程名带业务前缀
    .setUncaughtExceptionHandler((t, e) -> log.error("线程 {} 异常", t.getName(), e))
    .build();
```

默认工厂产生的线程名是 `pool-1-thread-1` 这种，线上看 `jstack` 时根本分不清是谁。

### 任务提交后发生了什么

这是线程池最核心的一段逻辑，`execute()` 里判断了三次：

```java
public void execute(Runnable command) {
    int c = ctl.get();

    // 1. 线程数 < 核心线程数：直接新建核心线程执行
    if (workerCountOf(c) < corePoolSize) {
        if (addWorker(command, true)) return;
        c = ctl.get();
    }

    // 2. 线程数已达核心数：尝试入队
    if (isRunning(c) && workQueue.offer(command)) {
        // 入队成功，但线程池可能刚刚关闭，二次检查
        int recheck = ctl.get();
        if (!isRunning(recheck) && remove(command))
            reject(command);
        else if (workerCountOf(recheck) == 0)
            addWorker(null, false);
    }
    // 3. 入队失败（队列满）：尝试扩容到最大线程数
    else if (!addWorker(command, false)) {
        // 4. 扩容也失败（已达 maximumPoolSize）：拒绝
        reject(command);
    }
}
```

把它画成流程图更清楚：

```text
提交任务
   │
   ├─ 线程数 < corePoolSize ? ──是──→ 新建核心线程执行
   │                             否
   ├─ 队列未满 ? ──────是──→ 入队，等空闲线程来取
   │                    否
   ├─ 线程数 < maximumPoolSize ? ──是──→ 新建非核心线程执行
   │                             否
   └─ 执行拒绝策略
```

**顺序是「先核心、再入队、后扩容、最后拒绝」**，这个顺序必须记牢，因为它和直觉相反：不是「核心满了就扩容」，而是「核心满了先排队，排不下才扩容」。

这个设计是有意的：新建线程的成本远高于排队。只有当队列也满了（说明任务积压严重），才值得付出新建线程的代价去救急。

反过来也解释了一个常见困惑：**为什么把 `maximumPoolSize` 设得很大却没生效？** 因为队列是无界的，永远满不了，第 3 步永远走不到。

### 五种状态如何流转

`ThreadPoolExecutor` 用一个 `ctl`（AtomicInteger）同时存状态和线程数：高 3 位是状态，低 29 位是线程数。这种「一个字段存两样东西」的做法保证了状态和线程数的原子性——不用加锁就能读到一致的一对值。

| 状态 | 值 | 含义 |
| --- | --- | --- |
| `RUNNING` | 111 | 接受新任务，处理队列中的任务 |
| `SHUTDOWN` | 000 | **不接受**新任务，但**会处理完**队列中的任务 |
| `STOP` | 001 | **不接受**新任务，**不处理**队列任务，并中断正在执行的线程 |
| `TIDYING` | 010 | 所有任务已终止，线程数归零，准备执行 `terminated()` |
| `TERMINATED` | 011 | `terminated()` 执行完毕 |

流转路径：

```text
RUNNING ──shutdown()──→ SHUTDOWN ──队列空且线程空──→ TIDYING ──→ TERMINATED
   │
   └────shutdownNow()──→ STOP ────所有线程已退出────→ TIDYING ──→ TERMINATED
```

两个入口方法的区别就在这里：

- `shutdown()`：温和关闭。已提交的任务（包括队列里的）会执行完，只拒绝新任务
- `shutdownNow()`：强制关闭。队列里的任务被丢弃（作为返回值返回），正在执行的线程被打上中断标记

注意 `shutdownNow()` 只是**发中断信号**，不等于任务立刻停止。如果任务里不响应中断（比如阻塞在 `sleep` 之外的地方，或者捕获了 `InterruptedException` 却没重新抛出），线程不会退出，`TIDYING` 也就到不了，线程池会一直卡在 `STOP`。

### 线程发生异常会被移出线程池吗

会，而且这是线程池一个容易踩的坑。

工作线程的主循环在 `runWorker()` 里：

```java
final void runWorker(Worker w) {
    try {
        while (task != null || (task = getTask()) != null) {
            try {
                task.run();          // 执行任务
            } catch (RuntimeException | Error x) {
                thrown = x;
                throw x;             // 异常往上抛
            } finally {
                // 无论如何都要清理
                processWorkerExit(w, completedAbruptly);
            }
        }
    }
}
```

任务抛出未捕获的异常时：

1. `run()` 抛出异常，退出 `while` 循环
2. `finally` 里执行 `processWorkerExit()`，把这个 `Worker` 从工作线程集合里移除
3. 线程结束

**问题在于：这一步只减不加**。线程池不会自动补一个新线程顶上（除非触发条件满足），所以如果某个任务因为 `NullPointerException` 大量失败，池子里的线程会被一个个「吃掉」，最终线程池里一个线程都不剩，但队列里还积压着任务，表现为**服务静默地不再处理任何请求**。

这对生产环境非常致命，因为它不会报错，只是悄悄失去处理能力。

三种防护办法：

**一、任务内部自己捕获异常**（最常用）：

```java
executor.execute(() -> {
    try {
        doSomething();
    } catch (Exception e) {
        log.error("任务执行失败", e);  // 异常不外溢，线程不会被回收
    }
});
```

**二、用 `submit()` 代替 `execute()`**。`submit()` 会把任务包成 `FutureTask`，异常被捕获后存进 `Future`，只有调用 `get()` 时才会以 `ExecutionException` 形式抛出：

```java
Future<?> future = executor.submit(() -> doSomething());
// 不调用 get()，异常就被静默吞掉了——这反而是另一个坑
```

注意 `submit()` 是双刃剑：**异常不会杀掉线程，但如果你不调 `get()`，异常就彻底消失了**。所以要么调用 `get()`，要么在任务内部打好日志。

**三、设置 `UncaughtExceptionHandler`**，通过自定义 `ThreadFactory` 挂上，兜住所有漏网的异常。

### 为什么必须用阻塞队列

线程池的 `workQueue` 类型是 `BlockingQueue` 而不是普通的 `Queue`，原因在于空闲线程的取任务逻辑。

工作线程用完一个任务后，需要去队列里拿下一个（`getTask()`）：

```java
private Runnable getTask() {
    for (;;) {
        // 超时控制，允许返回 null 让线程退出
        boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;
        Runnable r = timed
            ? workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS)  // 非核心线程：超时去等
            : workQueue.take();                                    // 核心线程：无限阻塞等
        if (r != null) return r;
        // 超时还没拿到任务，说明该退出这个线程了
        if (timed && (wc > maximumPoolSize || ...)) {
            if (compareAndDecrementWorkerCount(c)) return null;
        }
    }
}
```

如果队列是非阻塞的，`take()` 就无从谈起——取不到任务时只能返回 `null`，工作线程要么立刻退出（线程池白建了），要么就得自己写个循环轮询（CPU 空转）。

**阻塞队列让空闲线程在队列上安静地等待，有新任务时被自动唤醒**——这正好是上一节讲的等待通知机制在起作用。所以线程池「必须」用阻塞队列，是语义上的必然，不只是实现上的选择。

### 四种拒绝策略

队列满且线程数已达 `maximumPoolSize` 时，`reject()` 被调用。JDK 内置四种：

| 策略 | 行为 | 适用场景 |
| --- | --- | --- |
| `AbortPolicy`（默认） | 抛 `RejectedExecutionException` | 需要感知失败、让调用方决定怎么办 |
| `CallerRunsPolicy` | 由**提交任务的线程自己执行** | 需要平滑降级，不能丢任务、也不能抛异常 |
| `DiscardPolicy` | 静默丢弃，不抛异常 | 任务可丢且能接受无感知（慎用） |
| `DiscardOldestPolicy` | 丢掉队列里最老的一个，再尝试提交 | 只要最新数据 |

`CallerRunsPolicy` 值得多说一句，它是四种里最常用的：

```java
public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
    if (!e.isShutdown()) {
        r.run();   // 谁提交谁执行
    }
}
```

它的巧妙之处在于**自带背压**：让提交任务的线程（往往是 Tomcat 的工作线程）自己去跑这个任务，它就腾不出手提交新任务了，任务积压的速度自然降下来。这是一种「拒绝服务但不丢数据」的降级方案。

而 `DiscardPolicy` 和 `DiscardOldestPolicy` 在生产环境基本等于埋雷——静默丢任务，出问题时毫无痕迹，除非你明确知道这些任务可以丢。

实际项目里更常见的做法是自定义拒绝策略，至少把「被拒绝」这件事记录下来：

```java
new RejectedExecutionHandler() {
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        log.warn("任务被拒绝，当前线程数 {}，队列大小 {}",
                 e.getPoolSize(), e.getQueue().size());
        // 落库、发告警、或者降级到备用线程池
    }
}
```

### 线程数怎么设

这是被问得最多的问题，也是没有标准答案的问题。先看两类任务：

- **CPU 密集型**：任务几乎全在计算，线程数不应超过核数，否则只会增加上下文切换的开销
  - 经验值：`N + 1`（N 为核数），多出的 1 用于在偶发缺页时顶上
- **IO 密集型**：任务大部分时间在等 IO，线程大部分时候是空闲的，可以多开
  - 经验值：`2N`，或者按公式 `N × (1 + 等待时间 / 计算时间)`

但这个公式的参考价值有限，原因很实在：

1. **等待时间/计算时间没法准确测量**，这个比值本身就得靠压测得出
2. **任务往往不是纯 CPU 或纯 IO**，一次请求可能既有计算又有数据库调用
3. **瓶颈可能根本不在线程池**：线程数加到 200 时，瓶颈早跑到数据库连接池或者下游接口上了

所以工程上的正确姿势是：**先用经验值定个起点，再通过压测找拐点**。

判断方法是看两组指标：

- **吞吐量**：线程数增加时，QPS 是否继续上升？如果不再上升甚至下降，说明到拐点了
- **系统负载**：CPU 使用率、上下文切换次数、以及线程池的 `getQueue().size()`（队列一直积压说明线程不够）

另外，压测时特别要盯住**下游**。线程池设得太大，压力会转移给数据库或下游服务——自己的 QPS 上去了，把别人打挂了，这种事故并不少见。**线程数不是越大越好，它应该匹配整个链路上最窄的那个环节。**

### 为什么不推荐 Executors

`Executors` 的快捷方法看着方便，但都有坑：

| 方法 | 问题 |
| --- | --- |
| `newFixedThreadPool` | 无界队列，任务积压导致 OOM，且 `maximumPoolSize` 失效 |
| `newSingleThreadExecutor` | 同上，无界队列 |
| `newCachedThreadPool` | `maximumPoolSize` 是 `Integer.MAX_VALUE`，可能创建海量线程 |
| `newScheduledThreadPool` | 队列无界，同样有 OOM 风险 |

共同的问题是**关键参数被隐藏了**，使用者看不到队列有多大、最大能开多少线程。

`newCachedThreadPool` 用 `SynchronousQueue`（不存储元素），每个任务都要立刻找到线程执行，找不到就新建。理论上线程数没有上限，任务量大时线程数会爆炸——不过它配合了 60 秒的空闲回收，所以实际风险比前两个小，但仍然不可控。

**结论：手动 `new ThreadPoolExecutor`，把七个参数显式写清楚。** 阿里 Java 开发手册也是这条建议——用 `Executors` 创建线程池，你不知道自己用的是无界队列。

### 优雅关闭

线上发版时线程池的处理方式，直接决定了会不会丢任务或报错。

```java
public void shutdownGracefully(ThreadPoolExecutor pool, long timeout, TimeUnit unit) {
    pool.shutdown();                 // 1. 拒收新任务，队列里的继续处理
    try {
        // 2. 等待已有任务执行完
        if (!pool.awaitTermination(timeout, unit)) {
            // 3. 超时还没结束，强制关闭并打印未完成的任务
            List<Runnable> dropped = pool.shutdownNow();
            log.warn("强制关闭线程池，丢弃 {} 个任务", dropped.size());
        }
    } catch (InterruptedException e) {
        pool.shutdownNow();
        Thread.currentThread().interrupt();
    }
}
```

标准流程是「`shutdown()` → `awaitTermination()` → 超时再 `shutdownNow()`」：

1. `shutdown()` 拒收新任务，队列里的任务继续执行完
2. `awaitTermination()` 给一段缓冲时间（通常是几秒到几十秒）
3. 超时后 `shutdownNow()` 强制中断，并把没执行的任务返回出来，至少能记个日志

这里要注意两点：

- **`awaitTermination` 不调用的话，`shutdown()` 是异步的**，主线程不会等，直接往下走。注册成 JVM 钩子或者容器销毁回调才来得及
- **`shutdownNow()` 之后任务可能执行到一半被中断**，所以业务代码里要对中断有正确响应（不能吞掉 `InterruptedException`）

### 监控

线程池上线之后必须能观测，最少要暴露这几个指标：

```java
ThreadPoolExecutor pool = ...;

// 当前线程数
pool.getPoolSize();
// 活跃线程数
pool.getActiveCount();
// 队列积压任务数 —— 最关键的指标
pool.getQueue().size();
// 历史完成任务总数
pool.getCompletedTaskCount();
// 历史最大线程数
pool.getLargestPoolSize();
```

其中**队列积压数**是最该告警的：它持续增长意味着处理速度跟不上提交速度，接下来就是拒绝和雪崩。通常的做法是把这些指标通过 Micrometer 之类的库上报到监控系统，配一条「队列长度 > 阈值持续 1 分钟」的告警。

### 小结

- 七个参数里，**`workQueue` 的选择最影响行为**：队列容量决定了 `maximumPoolSize` 有没有机会生效
- 执行顺序是**核心线程 → 入队 → 扩容 → 拒绝**，不是「核心满了就扩容」
- **任务抛未捕获异常会吃掉工作线程**，必须用 try-catch 或 `Future.get()` 兜住
- `CallerRunsPolicy` 自带背压，是不丢任务的降级首选
- 线程数没有万能公式，**用压测找拐点，并盯住下游瓶颈**
- 别用 `Executors`，手动构造并显式指定每一个参数
