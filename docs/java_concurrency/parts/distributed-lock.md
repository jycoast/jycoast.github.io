---
title: 分布式锁的实现
---

前面讲的锁——`synchronized`、`ReentrantLock`、AQS——都只能锁住**同一个 JVM 内的线程**。单体应用里够用，但服务一旦拆成多个实例部署，这些锁就全部失效了：实例 A 和实例 B 是两个不同的 JVM，各自锁各自的，谁也不知道对方在干什么。

这时候需要的是能跨越进程、跨越机器的锁，也就是**分布式锁**。

### 为什么单机锁不够用

假设有一个扣库存的接口，部署了 3 个实例：

```java
// 单机锁：只能挡住本实例内的并发
public synchronized void deductStock(Long skuId, int count) {
    int stock = getStock(skuId);
    if (stock >= count) {
        setStock(skuId, stock - count);
    }
}
```

同一时刻，实例 1 的线程拿到锁在读库存，实例 2 的另一个线程**也在读同一个库存**——两把锁互不相干。结果就是超卖。锁的作用域和需要互斥的资源范围不匹配了。

分布式锁要做的，是把「锁」这个状态放到一个**所有实例都能访问到的、具备原子性的地方**。

### 一个合格的分布式锁要满足什么

| 特性 | 要求 | 为什么 |
| --- | --- | --- |
| **互斥** | 任意时刻只有一个客户端能持有锁 | 这是锁的定义 |
| **可重入** | 同一客户端的同一线程可以重复获取 | 否则递归或嵌套调用自己会死锁 |
| **锁超时** | 持有者崩溃时锁能自动释放 | 否则一个宕机就是永久死锁 |
| **高可用** | 存储锁的服务不能是单点 | 锁服务挂了会导致整个业务不可用 |
| **阻塞/非阻塞** | 支持等待获取，也支持快速失败 | 不同业务语义不同 |
| **锁标识** | 释放时必须校验持有者 | 防止误删别人的锁 |

这里的**锁标识**经常被忽略，但它是实现里最关键的一个细节：A 获取了锁但因为执行太久超时释放了，B 拿到了锁，这时 A 执行完去释放锁——**如果 A 不校验就直接删，删掉的是 B 的锁**。

### 基于数据库

最容易想到的方案——数据库是所有实例都能访问的，而且它自带事务和唯一约束。

#### 唯一索引

利用**唯一索引天然具有排他性**：往一张带唯一索引的表里插一条记录，成功了就代表拿到锁，插失败（重复键）就代表锁被别人占着。

```sql
CREATE TABLE distributed_lock (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    lock_key    VARCHAR(64)  NOT NULL COMMENT '锁的标识，如 order:12345',
    holder      VARCHAR(128) NOT NULL COMMENT '持有者标识：机器 IP + 线程 ID',
    expire_at   BIGINT       NOT NULL COMMENT '过期时间戳',
    UNIQUE KEY uk_lock_key (lock_key)
);
```

加锁就是一次 `insert`：

```java
public boolean tryLock(String lockKey, String holder) {
    try {
        jdbcTemplate.update(
            "INSERT INTO distributed_lock (lock_key, holder, expire_at) VALUES (?, ?, ?)",
            lockKey, holder, System.currentTimeMillis() + 30_000);
        return true;
    } catch (DuplicateKeyException e) {
        // 插入失败说明已经有锁了
        return false;
    }
}
```

解锁就是 `delete`，但**必须带上 holder 条件**：

```java
public void unlock(String lockKey, String holder) {
    // WHERE 里带 holder，防止误删别人的锁
    jdbcTemplate.update(
        "DELETE FROM distributed_lock WHERE lock_key = ? AND holder = ?",
        lockKey, holder);
}
```

还要有个兜底：持有者崩溃后记录不会自己消失，需要一个定时任务定期清理 `expire_at` 已过期的行。

**优点**：实现简单，不引入新组件，靠数据库事务保证可靠性。

**缺点**：

- **性能差**：数据库操作是磁盘级别的，QPS 上不去，而且锁竞争会直接转化为数据库的写竞争
- **有锁表风险**：高并发下大量 `insert` 同一行会造成行锁等待甚至死锁
- **没有阻塞语义**：拿不到只能自己轮询重试，轮询间隔不好定——太密浪费资源，太疏响应慢
- **不够可靠**：数据库本身的主从切换、连接超时都会影响锁的正确性

所以数据库锁一般是**兜底方案**或者**并发量很低**的场景才用。

#### 悲观锁与乐观锁

顺带提两种更常见的数据库层面并发控制，它们不是严格意义的分布式锁，但常被拿来对比：

**悲观锁**：`SELECT ... FOR UPDATE`，直接给行加排他锁，其他事务必须等。

```sql
BEGIN;
SELECT stock FROM product WHERE id = 1 FOR UPDATE;  -- 锁住这一行
UPDATE product SET stock = stock - 1 WHERE id = 1;
COMMIT;  -- 释放
```

适合写冲突频繁的场景，但要注意**必须走索引**，否则会退化成表锁。

**乐观锁**：不加锁，靠版本号在提交时校验有没有被别人改过。

```sql
UPDATE product
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 5;   -- 版本不匹配就更新 0 行
```

```java
int rows = jdbcTemplate.update(sql, stock, version);
if (rows == 0) {
    // 更新失败，说明被别人抢先改了，重试
}
```

乐观锁适合**读多写少**（冲突少，重试成本低），它在业务上比分布式锁更轻量——很多「超卖」问题用一行 `WHERE stock >= count` 就能解决，根本不需要锁。

### 基于 Redis

Redis 的性能是数据库的另一个量级，而且它天然适合存这种「临时状态」。这是目前最主流的方案。

#### setnx + 过期时间

核心是两个命令：`SETNX`（SET if Not eXists，不存在才设置）和 `EXPIRE`（过期时间）。

```bash
SETNX lock_key holder_value    # 返回 1 表示拿到锁，0 表示锁已被占用
EXPIRE lock_key 30             # 30 秒后自动释放，防止持有者崩溃导致死锁
```

但**这两条命令分开写是有问题的**：如果执行完 `SETNX` 之后、`EXPIRE` 之前服务宕机了，这把锁就永远不会过期，变成死锁。

Redis 2.6.12 之后可以用一条原子命令搞定：

```bash
SET lock_key holder_value NX PX 30000
# NX：不存在才设置
# PX 30000：30 秒后自动过期
```

在 Java 里：

```java
public boolean tryLock(String lockKey, String holder, long expireMillis) {
    Boolean ok = redisTemplate.opsForValue().setIfAbsent(
        lockKey, holder, Duration.ofMillis(expireMillis));
    return Boolean.TRUE.equals(ok);
}
```

#### 解锁必须用 Lua

解锁看起来就是 `DEL lock_key`，但这里藏着前面提到的**误删别人的锁**问题：

```text
时刻 T1：A 拿到锁，过期时间 30s
时刻 T2：A 执行了 35s（还没结束），锁自动过期
时刻 T3：B 拿到锁
时刻 T4：A 执行完了，执行 DEL lock_key  → 删掉了 B 的锁！
时刻 T5：C 拿到锁 → 现在 B 和 C 同时持有锁
```

解法有两步：

**第一步，值里存持有者标识，删之前先校验**。但「校验 + 删除」是两个操作，中间可能被其他命令插入，所以：

**第二步，用 Lua 脚本保证校验和删除的原子性**：

```java
private static final String UNLOCK_SCRIPT =
    "if redis.call('get', KEYS[1]) == ARGV[1] then " +
    "    return redis.call('del', KEYS[1]) " +
    "else " +
    "    return 0 " +
    "end";

public boolean unlock(String lockKey, String holder) {
    // 同一段脚本在 Redis 里是原子执行的
    Long result = redisTemplate.execute(
        new DefaultRedisScript<>(UNLOCK_SCRIPT, Long.class),
        Collections.singletonList(lockKey),
        holder);
    return result != null && result == 1L;
}
```

Lua 脚本在 Redis 里是**原子执行**的，执行期间不会插入其他命令，所以「判断是不是自己的锁」和「删除」这两步不会被打断。

#### 锁续期与看门狗

设置了过期时间，新的问题又来了：**如果业务执行时间超过锁的过期时间怎么办？**

30 秒的锁，业务跑了 40 秒，锁在第 30 秒就被别人拿走了，互斥性被破坏。

思路是**自动续期**：锁还在用的时候，定期把过期时间往后延长。Redisson 的「看门狗」（watchdog）就是干这个的：

```java
RLock lock = redissonClient.getLock("order:12345");
lock.lock();          // 不传过期时间，默认 30 秒，并启动看门狗
try {
    // 业务逻辑
} finally {
    lock.unlock();
}
```

看门狗的机制：

1. 加锁成功时，默认过期时间 30 秒
2. 同时起一个后台定时任务，**每 10 秒**（过期时间的 1/3）检查锁是否还持有
3. 如果还持有，就把过期时间重置回 30 秒
4. 直到显式 `unlock()`，定时任务取消，锁被删除

注意最后一点很重要：**看门狗只在没有显式指定过期时间时生效**。如果你写 `lock.lock(30, TimeUnit.SECONDS)`，Redisson 认为你明确知道业务要跑多久，不会再自动续期。

不过实际项目里更稳妥的做法往往是**不用看门狗**，而是合理估计业务耗时并设置足够长的过期时间——因为看门狗本身依赖客户端存活，客户端网络分区时续期会失败，而续期失败的表现就是锁提前释放。

#### 可重入

用 Redis 实现可重入，需要记录「谁持有了锁、持有多少次」。数据结构上要用 Hash：

```text
lock_key → { holder_value: 重入次数 }
```

加锁逻辑变成：如果锁不存在就创建并计数为 1；如果锁存在且持有者是自己，计数 +1；否则失败。解锁时计数 -1，减到 0 才真正删除。这一整套同样要用 Lua 保证原子性——`Redisson` 的 `RLock` 已经实现好了，自己手写很容易出错。

#### Redlock 与它的争议

Redis 主从架构下，锁存在**丢锁**风险：

```text
1. 客户端 A 向 master 写入锁
2. master 还没来得及把数据同步给 slave，就宕机了
3. slave 被提升为新 master ——新 master 上没有这把锁
4. 客户端 B 来加锁，成功了
5. A 和 B 同时持有锁
```

Redis 作者 antirez 提出了 **Redlock** 算法来应对：向 N 个（通常 5 个）**相互独立**的 Redis 实例申请加锁，只有在**超过半数**（N/2 + 1）的实例上成功、且总耗时小于锁的有效时间，才算真正拿到锁。

但分布式系统专家 Martin Kleppmann 提出了著名质疑，核心论点是：

- **Redlock 没有 fencing token 机制**，无法解决「锁过期后旧持有者仍在写」的问题
- 它依赖各实例的**时钟大致同步**，而时钟漂移在分布式系统里不可靠
- 对**效率**场景（避免重复劳动）它够用，但对**正确性**场景（必须严格互斥）它不够

这个争论到目前也没有公认结论。工程上的务实态度是：

- **如果锁只是为了避免重复计算、控制成本**，Redlock 或单实例 Redis 加合理超时足够
- **如果锁关系到数据正确性**（比如扣款），应该引入 **fencing token**——每次获取锁返回一个单调递增的编号，写数据时带上它，存储端拒绝比已见过的编号更小的写入。这才是分布式锁的正确打开方式，而它需要在**被保护的资源侧**做校验，光靠锁服务本身做不到

### 基于 ZooKeeper

ZooKeeper 的强一致性让它天然适合做协调服务。

#### 临时顺序节点实现公平锁

ZK 的节点类型里，**临时节点**（Ephemeral）在客户端会话断开时会自动删除——这天然解决了「持有者崩溃后锁不释放」的问题，不需要过期时间那套机制。

**设计思路一**：所有申请者都去创建同一个临时节点，创建成功的拿到锁。

```text
所有客户端 competing for /lock
  ├─ 客户端 A：create /lock 成功 → 拿到锁
  ├─ 客户端 B：create /lock 失败（节点已存在）→ 等待
  └─ 客户端 C：create /lock 失败 → 等待
```

问题是**所有等待者都 watch 这个节点**：锁释放（节点被删除）时，所有等待者同时被唤醒，然后一起去抢——这就是**惊群效应**（Herd Effect），一瞬间的流量尖峰打在 ZK 上。

**设计思路二**（正常做法）：用**临时有序节点**。

每个申请者创建一个**临时有序节点**，节点名带自动递增的序号：

```text
/create_lock/lock-0000000001   ← 客户端 A
/create_lock/lock-0000000002   ← 客户端 B
/create_lock/lock-0000000003   ← 客户端 C
```

规则是：**序号最小的那个持有锁**。其他客户端不 watch 锁节点，而是 **watch 自己前一个序号的节点**：

- A 拿到锁（序号最小）
- B 只监听 `lock-0000000001`，也就是 A 的节点
- C 只监听 `lock-0000000002`，也就是 B 的节点

A 释放锁 → 只有 B 被唤醒 → B 成为序号最小的 → B 拿到锁 → C 继续等。

**每个客户端只被前一个节点唤醒，没有惊群，而且是公平锁**（先到先得，按序号排队）。

#### 临时节点的自动清理

这套机制有一个前提：**客户端会正确关闭会话**。如果客户端进程被 `kill -9`，TCP 连接不会立刻断开，ZK 要等到会话超时（默认 2×tickTime）才发现，这段时间锁仍然被占着。

所以用 ZK 做锁时，`sessionTimeout` 的设置需要权衡：设太短，网络抖动会误判会话失效导致锁被提前释放；设太长，客户端真宕机时要等很久。

#### Curator InterProcessMutex

实际开发中**不建议自己造轮子**，直接用 Curator 提供的实现：

```java
CuratorFramework client = CuratorFrameworkFactory.newClient(
    "zk1:2181,zk2:2181,zk3:2181",
    new ExponentialBackoffRetry(1000, 3));
client.start();

// InterProcessMutex 是可重入的分布式锁
InterProcessMutex lock = new InterProcessMutex(client, "/order-lock-12345");

if (lock.acquire(10, TimeUnit.SECONDS)) {   // 支持超时获取
    try {
        doBusiness();
    } finally {
        lock.release();   // 必须在 finally 里释放
    }
}
```

`InterProcessMutex` 内部用的正是**临时顺序节点 + watch 前一个节点**的方案，并且实现了可重入（内部记录重入次数）。

#### ZK 锁的优缺点

**优点**：

- 高可用、可重入、阻塞锁，能解决锁失效导致的死锁问题（临时节点自动清理）
- 强一致性，不会出现 Redis 主从切换那样的丢锁
- 天然公平（有序节点按序排队）

**缺点**：

- **性能不如 Redis**：每次加锁解锁都要在集群里创建/删除节点并同步给所有 follower，这是写操作，开销远大于 Redis 的一次内存操作
- 需要额外维护一套 ZK 集群
- 会话超时的参数不好调

**选型上的结论**：

> 在高性能、高并发的场景下，不建议使用 ZooKeeper 分布式锁。而由于 ZooKeeper 的高可靠性，在并发量不是太高的场景中，还是推荐使用 ZooKeeper 分布式锁。

### 方案对比与选型

| | 数据库 | Redis | ZooKeeper |
| --- | --- | --- | --- |
| 性能 | 低 | **高** | 中 |
| 可靠性 | 中 | 中（主从切换有丢锁风险） | **高** |
| 是否阻塞 | 需自己轮询 | 需自己轮询（Redisson 已封装） | 支持阻塞等待 |
| 可重入 | 需自己实现 | 需自己实现（Redisson 已封装） | Curator 已实现 |
| 死锁风险 | 需定时清理 | 靠过期时间 | 临时节点自动清理 |
| 公平性 | 非公平 | 非公平 | **公平** |
| 额外依赖 | 无需（已有 DB） | 已有 Redis | 需部署 ZK |
| 实现复杂度 | 简单 | 简单（用 Redisson 更简单） | 需 Curator |

选型的经验法则：

- **已经有 Redis，追求性能** → Redis + Redisson（`RLock`）
- **对正确性要求极高、并发量不大** → ZooKeeper + Curator
- **不想引入新组件、并发量很低** → 数据库唯一索引
- **涉及资金等强一致场景** → 除了选 ZK 或 Redisson，还要在**被保护的资源侧**加 fencing token 校验

最后一句判断标准值得单独强调：**在任何分布式锁方案里，锁的超时释放都意味着「锁可能提前失效」。如果你的业务绝对无法容忍两个线程同时进入临界区，那么锁本身不足以保证正确性——必须由数据层做最终校验。** 比如扣库存，即使锁失效，`UPDATE ... WHERE stock >= count` 也能兜住；而如果只有锁这一道防线，那就是在赌。

### 小结

- 分布式锁的本质是把锁的状态放到一个**所有实例共享、且具备原子操作能力**的存储上
- 三个必答题：**互斥怎么保证、超时怎么处理、释放时怎么确认是自己的锁**
- Redis 方案里 **`SET NX PX` 保证加锁原子性，Lua 脚本保证解锁原子性**，这两点是关键
- ZK 方案的核心是**临时顺序节点 + 只 watch 前一个节点**，避免了惊群，同时天然公平
- 所有方案都逃不开「锁超时 = 锁可能提前失效」这个根本限制，**最终一致性要靠数据层兜底**
