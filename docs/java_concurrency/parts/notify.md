---
title: 并发、线程与等待通知机制
---

前面几节都在讲「怎么让线程之间不打架」——互斥。但线程之间不只有竞争，还有**协作**：一个线程要等另一个线程准备好才能继续。这就是并发编程的另一个核心问题：同步。

Java 里实现线程协作的原语是 `wait` / `notify`，它和管程是同一套东西的两个面。这一节先把线程本身说清楚，再看等待通知机制是怎么工作的。

### 并发与并行

这两个词经常被混用，但说的不是一件事：

- **并发**：多个事情在**同一时间段内**同时发生了。多个任务之间互相抢占资源，宏观上像同时进行，微观上仍是交替执行。
- **并行**：多个事情在**同一时间点上**同时发生了。真正的同时执行，需要多核支持。

并发是一种程序结构，并行是一种执行方式。单核 CPU 上也能写并发程序，只是不会有真正的并行。

### 生产者—消费者模式

理解等待通知机制最好的入口是生产者—消费者模式。这是并发协作里最经典的场景：

- **生产者线程**生产数据
- **消费者线程**消费数据
- 两者不直接打交道，而是通过一个**共享数据区**（相当于仓库）解耦

生产者把数据放进仓库就不用管谁来消费，消费者从仓库取数据也不用管谁生产的。但这个共享区必须具备线程间协作的能力：

- **仓库满了**，生产者必须停下来等，不能继续往里塞
- **仓库空了**，消费者必须停下来等，不能空转取
- **生产者放进一个数据后**，要通知等待的消费者可以取了
- **消费者取走一个数据后**，要通知等待的生产者可以放了

「停下來等」和「被唤醒」这两个动作，就是 `wait` 和 `notify` 要解决的事。

### 用 wait/notify 实现生产者—消费者

`wait`、`notify`、`notifyAll` 都是 `Object` 上的方法（不是 `Thread` 的），因为它们操作的是对象的**监视器**。使用它们有三条铁律：

1. **必须在 `synchronized` 块或方法中调用**，否则抛 `IllegalMonitorStateException`
2. `wait()` 会**释放锁**并进入等待队列，被唤醒后**重新竞争锁**，拿到锁才从 `wait()` 返回
3. **必须在循环里判断条件**，用 `while` 而不是 `if`

第三条最容易写错，原因在下一节解释。

```java
public class ProducerConsumer {

    private final int[] buffer;
    private int count = 0;

    public ProducerConsumer(int size) {
        this.buffer = new int[size];
    }

    public synchronized void produce(int value) throws InterruptedException {
        // 仓库满：生产者等待，且必须用 while 循环判断
        while (count == buffer.length) {
            wait();
        }
        buffer[count++] = value;
        System.out.println("生产：" + value);
        // 通知等待的消费者
        notifyAll();
    }

    public synchronized int consume() throws InterruptedException {
        // 仓库空：消费者等待
        while (count == 0) {
            wait();
        }
        int value = buffer[--count];
        System.out.println("消费：" + value);
        // 通知等待的生产者
        notifyAll();
        return value;
    }
}
```

用起来是这样：

```java
public static void main(String[] args) {
    ProducerConsumer pc = new ProducerConsumer(5);

    new Thread(() -> {
        for (int i = 0; i < 20; i++) {
            try {
                pc.produce(i);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }, "producer").start();

    new Thread(() -> {
        for (int i = 0; i < 20; i++) {
            try {
                pc.consume();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }, "consumer").start();
}
```

#### 为什么必须用 while 而不是 if

这是 `wait` 最容易踩的坑。`if` 看起来更直观——「条件不满足就等一下」，但它是错的：

```java
// 错误写法
if (count == 0) {
    wait();
}
```

原因有两层：

**第一，被唤醒不代表条件成立。** `notifyAll()` 唤醒的是所有等待线程，它们会一起去抢锁，只有一个能抢到。抢到锁的线程从 `wait()` 返回时，条件可能已经被别的线程改回去了——比如消费者 A 被唤醒拿到锁，发现仓库又空了。用 `if` 的话它会直接往下执行，从空仓库里取数据，直接出错。

**第二，唤醒可能是「假的」。** 虽然 Java 里没有 spurious wakeup 的正式保证问题，但把条件检查放在循环里是操作系统层面的通行做法，`wait` 的语义从来不保证「唤醒时条件一定成立」。

所以正确姿势是：**在循环中检查条件，不满足就继续 wait**。

#### notify 还是 notifyAll

`notify()` 只唤醒一个等待线程，`notifyAll()` 唤醒全部。**默认应该用 `notifyAll()`。**

因为 `notify()` 唤醒哪个线程是不确定的。在生产者—消费者里，如果仓库状态变化后只唤醒了一个同类线程（比如仓库从满变成不满，却唤醒了一个生产者——如果当时等待队列里既有生产者又有消费者），条件不匹配的线程醒来后会重新 wait，而真正该被唤醒的线程可能永远等不到。用 `notifyAll()` 就没这个问题，代价是多了几次无意义的竞争和重检查。

只有在**等待队列中所有线程等待的条件完全相同**时，`notify()` 才是安全的。这个前提很容易在不经意间被打破，所以除非有明确的性能理由，一律用 `notifyAll()`。

#### wait 会释放锁，sleep 不会

这是另一个高频混淆点：

| 方法 | 所属 | 是否释放锁 | 是否可被中断 | 何时使用 |
| --- | --- | --- | --- | --- |
| `wait()` | `Object` | **会释放** | 会 | 等待某个条件成立 |
| `sleep()` | `Thread` | **不释放** | 会 | 单纯想让当前线程停一会儿 |
| `join()` | `Thread` | 内部用 `wait` 实现，会释放 | 会 | 等另一个线程执行完 |

`wait` 必须释放锁，否则别的线程永远进不来改条件，就会死等下去——这也是「`wait` 必须在同步块里」的根本原因：**不持有锁，就无从谈释放锁**。

### wait/notify 的实现原理

`wait` 和 `notify` 在 JVM 层面对应的是 `ObjectMonitor` 上的操作。理解它需要管程模型，这部分我们已经在《管程》和《Jvm层面的管程实现-synchronized》里详细讲过，这里只补一句关键结论：

`synchronized` 的监视器里有两类队列：

- **入口队列**（EntryList）：等着抢锁的线程
- **等待队列**（WaitSet）：调用了 `wait()` 后挂起的线程

`wait()` 做的事是：把当前线程放进 `WaitSet`，释放监视器，然后挂起；`notify()` 做的事是：从 `WaitSet` 里挑一个（或全部）线程移到 `EntryList`，让它重新参与抢锁。**唤醒不等于立即继续执行**，被唤醒的线程还得再去抢一次锁——这正好解释了为什么醒来后条件可能又变了，也再次说明了为什么必须用 `while`。

### LockSupport：更底层的等待通知

`wait` / `notify` 有两个限制：必须在 `synchronized` 里用，且唤醒必须在等待之后发生（先 `notify` 后 `wait`，那个 `notify` 就丢了）。

`LockSupport` 绕开了这两点，它提供的是线程级别的阻塞与唤醒：

```java
public class LockSupportDemo {

    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            System.out.println("线程开始等待");
            // 阻塞当前线程，不要求持有任何锁
            LockSupport.park();
            System.out.println("线程被唤醒");
        });
        t.start();

        Thread.sleep(1000);
        System.out.println("主线程发起唤醒");
        // 唤醒指定线程
        LockSupport.unpark(t);
    }
}
```

关键差异：

| | `wait` / `notify` | `LockSupport.park` / `unpark` |
| --- | --- | --- |
| 是否必须在 `synchronized` 内 | 必须 | 不需要 |
| 唤醒对象 | 只能唤醒等待同一个监视器的线程 | 可以直接指定线程 |
| 先唤醒后等待 | 唤醒会丢失 | **许可机制**，`unpark` 先调用，`park` 会立即返回 |
| 中断表现 | 抛 `InterruptedException` | 直接返回，不抛异常 |

最后一点很重要：`LockSupport` 内部用一个「许可」（permit）来记录状态，`unpark` 相当于发放许可，`park` 消费许可。许可最多一个，这点和 `Semaphore(1)` 类似。

`LockSupport` 是 `AQS` 里阻塞线程的实现基础——`ReentrantLock` 在抢不到锁时，最终就是通过 `LockSupport.park()` 挂起的，这部分我们在 AQS 源码那节看过。

### 小结

- 并发编程有两大核心问题：**互斥**和**同步**（协作）。前面几节讲互斥，这节讲同步。
- 等待通知机制的载体是对象的**监视器**，所以 `wait` / `notify` 定义在 `Object` 上。
- 三条铁律：必须在 `synchronized` 内；`wait` 释放锁；**条件判断必须用 `while` 循环**。
- 默认用 `notifyAll()`，`notify()` 只有在等待条件完全相同时才安全。
- 需要更底层的控制（不持有锁、指定线程、不丢失唤醒）时，用 `LockSupport`。
