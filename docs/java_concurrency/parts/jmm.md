---
title: Jvm是如何解决线程安全问题的？
---

上一节说清楚了问题的根源：可见性、原子性、有序性。接下来的问题是，Java 语言层面给出了 `volatile`、`synchronized` 这些关键字，它们背后的 JVM 到底做了什么，才能让这些关键字在不同的 CPU 上有统一的行为？答案就是 **Java 内存模型**（Java Memory Model，JMM）。

### JMM 的由来

编程语言其实可以直接复用操作系统的内存模型，但不同的操作系统内存模型不一样。直接复用会导致同一份代码换个系统就行为不同——而 Java 的立身之本就是跨平台，所以它必须自己提供一套内存模型来屏蔽系统差异。

这就是 JMM 存在的第一个理由。把它说得更准确一点：**JMM 不是一块内存，而是 Java 定义的一组并发规范**（[JSR-133](http://ifeve.com/wp-content/uploads/2014/03/JSR133%E4%B8%AD%E6%96%87%E7%89%88.pdf)）。它除了抽象出线程与主内存的关系，还规定了从 Java 源码到 CPU 可执行指令这个转化过程中，必须遵守哪些并发相关的原则。目的很明确：简化多线程编程，增强程序的可移植性。

### 主内存与工作内存

JMM 的核心是它定义的抽象关系：**所有共享变量存在主内存，每个线程有一个私有的本地内存，本地内存里放的是共享变量的副本。**

- **主内存**：所有线程创建的实例对象都在这里，不管是成员变量还是局部变量，类信息、常量、静态变量也都放这儿。为了更快的访问速度，虚拟机和硬件系统可能让工作内存优先落在寄存器和高速缓存里。
- **本地内存**：每个线程私有的抽象概念，存的是该线程读写的共享变量副本。**它并不真实存在**，涵盖的是缓存、写缓冲区、寄存器以及其他的硬件和编译器优化。

从这张抽象图里能得到两条关键结论：

1. 所有共享变量都存在主内存；
2. 每个线程都保存了一份自己用到的共享变量的副本。

所以线程 A 和线程 B 要通信，必须走两步：

1. 线程 A 把本地内存中更新过的共享变量刷新到主内存；
2. 线程 B 到主内存去读取这个更新过的值（或者，根据协议让本地副本失效后重新加载）。

**线程之间无法直接互相访问工作内存，通信必须经过主内存。** 这解释了为什么两个线程对着同一个变量写，对方却可能看不见——它们各自改的是自己那份副本。

#### 八种交互操作

一个变量怎么从主内存拷到工作内存、又怎么同步回去，JMM 定义了八种原子操作来描述：

| 操作 | 作用对象 | 含义 |
| --- | --- | --- |
| `lock`（锁定） | 主内存变量 | 把一个变量标识为一条线程独占 |
| `unlock`（解锁） | 主内存变量 | 释放锁定状态，释放后其他线程才能锁定它 |
| `read`（读取） | 主内存变量 | 把变量值从主内存传到工作内存，供后续 `load` 使用 |
| `load`（载入） | 工作内存变量 | 把 `read` 得到的值放进工作内存的变量副本 |
| `use`（使用） | 工作内存变量 | 把变量值传给执行引擎 |
| `assign`（赋值） | 工作内存变量 | 把执行引擎接收到的值赋给工作内存变量 |
| `store`（存储） | 工作内存变量 | 把工作内存的值传送到主内存，供后续 `write` 使用 |
| `write`（写入） | 主内存变量 | 把 `store` 传来的值写入主内存变量 |

这些操作本身是原子的，但它们之间还必须满足一些规则：

- `read` 和 `load`、`store` 和 `write` 必须按顺序执行且不允许单独出现（不允许读了不载入，也不允许存了不写入）
- 不允许丢弃最近的 `assign` 操作——工作内存改了就必须同步回主内存
- 不允许无原因地把数据从工作内存同步回主内存（没发生过 `assign` 就不该 `store`）
- 新变量只能在主内存诞生，`use` 和 `store` 之前必须先执行过 `assign` 和 `load`
- 同一个变量同一时刻只允许一条线程 `lock`，但同一条线程可以重复 `lock` 多次，**必须执行相同次数的 `unlock` 才真正解锁**（这就是锁可重入的规范来源）
- `lock` 会清空工作内存中该变量的值，用之前必须重新 `load` 或 `assign`
- 没有 `lock` 过的变量不允许 `unlock`，也不允许 `unlock` 别人锁住的变量
- `unlock` 之前必须先把变量同步回主内存

> 有一点容易混淆：问到「Java 内存模型」时，面试官想问的通常是多线程和并发，而不是堆、栈、GC 那套**内存结构**。两者名字像，说的完全是两回事。

### 三大特性在 JMM 中如何落地

#### 原子性

一个或多个操作要么全部执行且不被任何因素打断，要么全部不执行。Java 中基本数据类型的读取和赋值是原子操作（64 位处理器下 `long`/`double` 也是），但 `i++` 这种复合操作不是——它包含读、加、写三步，多线程下必然出错。

保证手段有三个层次：`synchronized`、`Lock` 锁，以及 CAS。CAS 我们已经在前面单独讲过，它依赖硬件原子指令，是原子类的基石。

#### 可见性

一个线程修改变量后，其他线程能立即看到。底层有两条实现路径：

1. **内存屏障**：`volatile`、`synchronized`、`Thread.sleep(10)` 都走这条
2. **CPU 上下文切换**：`Thread.yield()`、`Thread.sleep(0)` 这类让出 CPU 的操作，会顺带让其他线程看到更新的值

实现可见性的关键字有 `volatile`、`synchronized`、`Lock`，`final` 的可见性则由 JMM 的初始化安全性保证。

#### 有序性

程序按代码先后顺序执行。为了性能，编译器和处理器都会做指令重排序，所以存在有序性问题。保证手段是 `volatile`、内存屏障、`synchronized` 和 `Lock`。

### 锁的内存语义

加锁和解锁不只是互斥，它还带着内存语义：

- **线程获取锁时**，JMM 会把这个线程对应的本地内存置为无效
- **线程释放锁时**，JMM 会把本地内存中的共享变量刷新到主内存

所以 `synchronized` 的可见性不是额外赠品，而是锁语义的一部分：进入同步块必须重新从主内存读，离开同步块必须把改动写回主内存。

### volatile 的内存语义

`volatile` 有两件事：保证**内存可见性**、禁止**重排序**。

- **写一个 volatile 变量**：JMM 会把该线程本地内存中的共享变量值刷新到主内存
- **读一个 volatile 变量**：JMM 会把该线程的本地内存置为无效，接下来从主内存重新读

这两句话比它的实际作用要窄。真正关键的是「禁止重排序」这一半，它是 JSR-133 才补上的——Java 5 才开始有「增强的 volatile 内存语义」。

在 JSR-133 之前，volatile 变量和普通变量之间是允许重排序的，于是下面这个经典的例子会出问题：

```java
public class VolatileExample {
    int a = 0;
    volatile boolean flag = false;

    public void writer() {
        a = 1;        // step 1
        flag = true;  // step 2
    }

    public void reader() {
        if (flag) {          // step 3
            System.out.println(a);  // step 4
        }
    }
}
```

如果 step 1 和 step 2 被重排序，执行时序可能变成：线程 A 先写 flag（step 2），线程 B 读到 flag 为 true（step 3），然后读到 `a = 0`（step 4），最后线程 A 才写 `a = 1`（step 1）。volatile 变量本身可见，普通变量却读错了。

JSR-133 因此严格限制 volatile 与普通变量之间的重排序。规则可以总结成三条：

1. 第二个操作是 volatile 写时，不管第一个操作是什么，都不能重排序
2. 第一个操作是 volatile 读时，不管第二个操作是什么，都不能重排序
3. 第一个操作是 volatile 写、第二个操作是 volatile 读时，不能重排序

反过来说，第一个是普通变量读、第二个是 volatile 读，这种是可以重排序的：

```java
int a = 0;                     // 普通变量
volatile boolean flag = false; // volatile 变量

// 这两个读操作允许重排序
int i = a;
boolean j = flag;
```

#### 双重检查锁为什么需要 volatile

这是 volatile 禁止重排序最经典的应用场景。下面这个写法是**错误**的：

```java
public class Singleton {

    private static Singleton singleton;   // 少了 volatile

    public static Singleton getSingleton() {
        if (singleton == null) {
            synchronized (Singleton.class) {
                if (singleton == null) {
                    singleton = new Singleton();
                }
            }
        }
        return singleton;
    }
}
```

问题出在 `singleton = new Singleton()` 这行，它其实是三步伪代码：

```text
memory = allocate();   // 1. 分配对象内存空间
ctorInstance(memory);  // 2. 初始化对象
singleton = memory;    // 3. 设置 singleton 指向刚分配的内存地址
```

**2 和 3 之间可以重排序**。重排之后变成：

```text
memory = allocate();   // 1. 分配内存
singleton = memory;    // 3. 先让 singleton 指向内存地址（对象还没初始化！）
ctorInstance(memory);  // 2. 才初始化对象
```

这时候线程 B 进到第一个 `if (singleton == null)`，发现 singleton 已经不为 null，直接返回——**拿到的是一个构造到一半的对象**。

加上 `volatile` 就是为了禁止这个重排序：

```java
private volatile static Singleton singleton;
```

### JMM 的内存屏障插入策略

编译器是通过在字节码指令序列里插入**内存屏障**来禁止特定类型的处理器重排序的。JMM 给出的策略比较保守：

1. 每个 volatile 写操作**前面**插入 StoreStore 屏障
2. 每个 volatile 写操作**后面**插入 StoreLoad 屏障
3. 每个 volatile 读操作**后面**插入 LoadLoad 屏障
4. 每个 volatile 读操作**后面**再插入 LoadStore 屏障

保守的意思是：在任何处理器平台上、任何程序里，这套策略都能得到正确的 volatile 语义。

但不同处理器的内存模型松紧程度不同，可以在此基础上优化。以 x86 为例，x86 本身不会对读-读、读-写、写-写做重排序，所以这三类屏障在 x86 上会被省略，**只保留写-读这一类**。这也是为什么同一段并发代码在不同架构上性能表现不一样。

HotSpot 在 x86 上实现屏障用的是 lock 前缀指令而非 mfence——因为 `mfence` 在某些场景下更慢：

```c++
inline void OrderAccess::storeload()  { fence(); }
inline void OrderAccess::fence() {
  if (os::is_MP()) {
    // always use locked addl since mfence is sometimes expensive
#ifdef AMD64
    __asm__ volatile ("lock; addl $0,0(%%rsp)" : : : "cc", "memory");
#else
    __asm__ volatile ("lock; addl $0,0(%%esp)" : : : "cc", "memory");
#endif
  }
}
```

lock 前缀指令做了三件事：

1. 确保后续指令执行的原子性（新处理器上用缓存锁定而非锁总线，开销小得多）
2. 具有类似内存屏障的功能，禁止该指令与前后读写指令重排序
3. 等待它之前的所有指令完成、所有写缓冲写回内存之后才开始执行，并按缓存一致性协议让其他核心的副本失效

### 总结

**`volatile` 保证多线程下共享变量的可见性、禁止指令重排序；`synchronized` 除了可见性还保证原子性（互斥性）。再往下，JMM 通过内存屏障实现可见性和禁止重排序。**

为了让程序员不必直接面对重排序规则和屏障指令，JMM 又提供了 happens-before 这套更易懂的规则——这是下一节的内容。
