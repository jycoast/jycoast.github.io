## Java并发

### 并发编程的三要素？

线程安全性的问题主要体现在：

- 原子性
- 有序性
- 可见性

出现线程安全问题的原因：

- 线程切换带来的原子性问题
- 缓存导致的可见性问题
- 编译优化带来的有序性问题

解决办法：

- JDK Atomic开头的原子类、synchronized、Lock可以解决原子性的问题
- synchronized、volatile、Lock可以解决可见性的问题
- Happers-before规则可以解决有序性的问题

### 线程和进程的区别？

进程是程序运行时的状态，是操作系统分配资源的最小单元，进程的主要作用是管理资源。线程是操作系统调度的最小的单元，一个程序至少有一个进程，一个进程至少有一个线程，线程是进程当中的一条执行流程。

### 守护线程和用户线程的区别？

Java中的线程分为两种：守护线程（Daemon）和用户线程（User），其中用户线程又称本地线程。守护线程可以理解为JVM自动创建的线程（通常），用户线程是程序创建的线程。一般情况下，两者的区别在于，当JVM中所有的线程都是守护线程的时候，JVM就可以退出，如果还有一个或以上的非守护线程则不会退出。

可以通过 `java.lang.Thread#setDaemon `方法设置线程为守护线程或者用户线程。

### 什么是线程安全？

指某个函数、函数库在多线程的环境中被调用时，能够正确地处理多个线程之间的共享变量，使程序功能正确完成。

### Java如何开启线程？怎么保证线程安全？

这里首先得明确一下线程和进程的区别，进程是操作系统进行资源分配的最小单位，线程是操作系统任务分配的最小单位，线程隶属于进程。

开启线程的具体方式：

  - 继承Thread类，重写run方法
  - 实现Runnable接口，实现run方法
  - 实现Callable接口，实现call方法，通过FutureTask创建一个线程，获取到线程执行的返回值
  - 通过线程池来开启线程

那么如何保证线程安全呢？

采用加锁的方式：使用JVM提供的Synchronized关键字或者JDK提供的各种锁Lock。

### 线程有哪些状态？

如图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210817203732.png" alt="线程状态示意图" style="zoom: 50%;" />

### 如何停止一个正在运行的线程？

在java中有以下3种方法可以终止正在运行的线程：

- 使用退出标志，使线程正常退出，也就是当run方法完成后线程终止
- 使用stop方法强行终止，但是这个方法并不安全
- 使用interrupt方法中断线程

### notify和notifyAll有什么区别？

notify会随机唤醒一个阻塞的线程，而notifyAll会唤醒所有线程。

### wait和sleep方法有什么区别？

调用wait方法之前，线程必须持有对象的锁，在调用wait方法之后，线程就会释放锁，而sleep方法则不会释放掉锁。

### 为什么wait和notify方法要在同步块中调用？

使用wait和notify方法首先要必须要获取到当前对象的锁，如果没有获取到锁会抛出异常，因此需要在同步块中调用。

### Thread类中的yield方法有什么作用？

当一个线程调用yield方法时，当前线程会让出CPU使用权，然后处于就绪状态，线程调度器会从线程就绪队列里面获取一个线程优先级最高的线程，当然也有可能会调度到刚刚让出CPU的那个线程来获取CPU执行权。

### volatile和synchronized有什么区别？

synchronized关键是用来加锁，volatile只是保持变量的线程可见性，通常适用于一个线程写，多个线程读的场景。

### volatile变量和atomic变量什么不同？

volatile变量可以确保写操作发生在后续的读操作之前，但它并不能保证原子性，例如，即便是使用volatile修饰，count++的操作也不是原子性的，而atomic变量可以让这种操作具有原子性。

### interrupted和isInterrupted方法的区别？

interrupted与isInterrupted方法不同是，interrupted方法会清除中断标志，而isInterrupted方法则不会，并且interrupted方法是static方法，可以通过Thread类直接调用。

### volatile能不能保证线程安全？

不能。volatile关键字只能保证线程可见性，不能保证原子性，相关的示例：

```java
public class VolatileDemo {
    private static volatile boolean flag = true;

//    private static boolean flag = true;

    public static void main(String[] args) {
        new Thread(() -> {
            while (flag) {
                // ..
            }
            System.out.println("=============");
        }).start();
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        flag = false;
    }
}
```

### DCL单例为什么加volatile？

volatile防止指令重排，在DCL中，防止高并发情况，指令重排造成的线程安全问题，相关示例代码：

```java
public class SingleDemo {

    private volatile SingleDemo singleDemo;

    private SingleDemo() {}

    public SingleDemo getInstance() {
        if (null == this.singleDemo) {
           synchronized (SingleDemo.class) {
              if (null == this.singleDemo) {
                    singleDemo = new SingleDemo();
                }
            }
        singleDemo = new SingleDemo();
        return singleDemo;
    }
}
```

### 死锁与活锁的区别？

死锁：线程1等待线程2互斥持有的资源，而线程2也在等待线程1互斥持有的资源，两个线程都无法继续执行。

活锁：线程持续重试一个总是失败的操作，导致无法继续执行；

### 死锁与饥饿的区别？

饥饿：线程一直被调度器延迟访问其赖以执行的资源，也许是调度器先于低优先级的线程而执行高优先级的线程，同时总是会有一个高优先级的线程可以执行，饿死也叫做无限延迟。

### 按照线程安全的强度来区分，分为哪几类？

| 分类         | 特点                                                         |
| ------------ | ------------------------------------------------------------ |
| 不可变       | 不可变的对象一定是线程安全的，并且永远也不需要额外的同步。Java类库中大多数基本数值类如Integer、String、BigInteger都是不可变的。 |
| 绝对线程安全 | 由类的规格说明所规定的约束在对象被多个线程访问时仍然有效，不管运行时环境如何排列，线程都不需要任何额外的同步。 |
| 相对线程安全 | 相对线程安全类对于单独的操作可以是线程安全的，但是某些操作序列可能需要外部同步。 |
| 线程兼容     | 线程兼容类不是线程安全的，但是可以通过正确使用同步而在并发环境中安全地使用，例如使用sychronized代码块。 |
| 线程对立     | 线程对立是那些不管是否采用了同步措施，都不能在多线程环境中并发使用的代码，这通常是有害的，应当尽量避免。 |

### 线程安全的实现方法有哪些？

1. 互斥同步
2. 非阻塞同步
3. 无同步方案
	- 可重入代码
	- 线程本地存储

### 锁优化技术你了解什么？

锁优化技术主要有锁消除与锁粗化两种。

- 通过逃逸分析技术判别程序中所使用的锁对象是否只被一个线程所使用，而没有散布到其他线程当中，如果情况就是这样的话，那么JIT编译器在编译这个同步代码时就不会生成synchronized关键字所标识的锁的申请与释放机器码，从而消除了锁的使用流程，这就是锁的消除。
- JIT编译器在执行动态编译时，若发现前后相邻的synchronized块使用的是同一个锁对象，那么它就会把这几个synchronized块合并为一个较大的同步块，这就是锁的粗化。

### Lock与synchronized有什么区别？

- 锁的获取方式：Lock是通过程序代码的方式由开发者手工获取，而synchronized是通过JVM来获取的（无需开发者干预）。
- 具体的实现方式：Lock是通过Java代码的方式来实现，synchronized是通过JVM底层来实现（无需开发者关注）。
- 锁的释放方式：Lock务必通过unlock()方法在finally块中手工释放，synchronized是通过JVM来释放（无需开发者关注）。
- 锁的具体类型：Lock提供了多种，如公平锁、非公平锁，synchronized与Lock都提供了可重入锁。

### 什么是阻塞队列？阻塞队列的实现原理是什么？

阻塞队列是一个支持两个附加操作的队列。这两个附加的操作是：

- 当队列为空时，获取元素的线程会等待队列变为非空
- 当队列满时，存储的线程会等待队列可用

阻塞队列一览：

| 类型                  | 特点                                 |
| --------------------- | ------------------------------------ |
| ArrayBlockingQueue    | 一个由数组结构组成的有界阻塞队列     |
| LinkedBlockingQueue   | 一个由链表结构组成的有界阻塞队列     |
| PriorityBlockingQueue | 一个支持优先级排序的无界阻塞队列     |
| DelayQueue            | 一个使用优先级队列实现的无界阻塞队列 |
| SynchronousQueue      | 一个不存储元素的阻塞队列             |
| LinkedTransferQueue   | 一个由链表结构组成的无界阻塞队列     |
| LinkedBlockingDeque   | 一个由链表结构组成的双向阻塞队列     |

### 什么是Callable和Future？

Future接口标识异步任务，是还没有完成的任务给出的未来结果，Callable用于产生结果，Future用来获取结果。

### Java线程锁机制是怎样的？偏向锁、轻量级锁、重量级锁有什么区别？锁机制是如何升级的？

Java的锁就是在对象的MarkWord中记录一个锁状态、无锁、偏向锁、轻量级锁、重量级锁对应不同锁状态，Java的锁机制就是根据资源竞争的激烈程度不断进行锁升级的过程。

  偏向锁、轻量级锁、重量级锁及锁机制具体如下图：

![1623338358489](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/%E9%94%81%E6%9C%BA%E5%88%B6.png)

### 什么是可重入锁？有哪些实现？

 相同的线程可以直接进入已经获取锁的同步代码块，而无需重复获取锁。代表实现：synchronized、ReentrantLock。

### 什么是悲观锁？什么是乐观锁？

悲观锁：总是假设最坏的情况，每次获取数据都认为其它线程会修改，所以都会加锁（读锁、写锁、行锁等），当其它线程想要访问数据时，都需要阻塞挂起，例如synchronized。

乐观锁：总是认为不会产生并发问题，每次获取数据的时候总认为不会有其它线程对数据进行修改，因此不会上锁，但是在更新是会判断其它线程在这之前有没有对数据进行修改，一般使用版本号机制或CAS操作实现。

### 谈谈你对AQS的理解，AQS如何实现可重入锁？

队列同步器AQS，是Lock实现的模板类。它使用一个int类型的成员变量表示同步状态，通过内置的双向链表来完成资源获取的线程的排队工作。AQS使用模板方法的设计模式，使用者需要继承AQS并重写指定的方法（通常是获取锁和释放锁的方法）。随后AQS会调用重写的模板方法，完成对数据的加锁/解锁操作。

<img src="https://throwable-blog-1256189093.cos.ap-guangzhou.myqcloud.com/202008/j-a-q-s-ex-9.png" style="zoom:67%;" />

### SynchronizedMap和ConcurrentHashMap有什么区别？

SynchronizedMap依次锁住整张表来保证线程安全，所以每次只能有一个线程来访问map，而ConcurrentHashMap使用分段锁来保证在多线程下的性能（JDK1.7）。

### ConcurrentHashMap的并发度是什么？

默认值是16，这样能在多线程情况下避免争用。

### CopyOnWriteArrayList可以用于什么应用场景？

读多写少，并且写入慢也没有关系的场景。本质上是使用ReentrantLock完成并发操作。

### 有A、B、C三个线程，如何保证三个线程同时执行？如何在并发情况下保证三个线程依次执行？如何保证三个线程有序交错进行？

  可以使用三大工具：CountDownLatch，CylicBarrier，Semaphore

  - 保证三个线程同时执行的示例：

```java
public class ThreadSafeDemo {

    private int count = 0;

    private void add() {
        count ++;
    }

    public static void main(String[] args) throws InterruptedException {
        int size = 3;
        ThreadSafeDemo threadSafeDemo = new ThreadSafeDemo();

        CountDownLatch countDownLatch = new CountDownLatch(1);

        for (int i = 0; i < size; i++) {
            new Thread(() -> {
                try {
                    countDownLatch.await();
                    System.out.println(System.currentTimeMillis());
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }).start();
        }
        System.out.println("wait");
        Thread.sleep(5000);
        countDownLatch.countDown();
    }

```

  - 保证三个线程依次执行的示例

```java
public class OrderThread2 {
    static volatile int ticket = 1;

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            while (true) {
                if (ticket == 1) {
                    try {
                        Thread.sleep(100);
                        for (int i = 0; i < 10; i++) {
                            System.out.println("a" + i);
                        }
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    ticket = 2;
                    return;
                }
            }
        });

        Thread t2 = new Thread(() -> {
            while (true) {
                if (ticket == 2) {
                    try {
                        Thread.sleep(100);
                        for (int i = 0; i < 10; i++) {
                            System.out.println("b" + i);
                        }
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    ticket = 3;
                    return;
                }
            }
        });

        Thread t3 = new Thread(() -> {
            while (true) {
                if (ticket == 3) {
                    try {
                        Thread.sleep(100);
                        for (int i = 0; i < 10; i++) {
                            System.out.println("c" + i);
                        }
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    return;
                }
            }
        });

        t1.start();
        t2.start();
        t3.start();
    }
}
```

  - 保证三个线程有序交错进行的示例：

```java
public class OrderThread {
    // 利用信号量来限制
    private static Semaphore s1 = new Semaphore(1);
    private static Semaphore s2 = new Semaphore(1);
    private static Semaphore s3 = new Semaphore(1);

    public static void main(String[] args) {
        try {
            s1.acquire();
            s2.acquire();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        new Thread(() -> {
            while (true) {
                try {
                    s1.acquire();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("A");
                s2.release();
            }
        }).start();

        new Thread(() -> {
            while (true) {
                try {
                    s2.acquire();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("B");
                s3.release();
            }
        }).start();

        new Thread(() -> {
            while (true) {
                try {
                    s3.acquire();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("C");
                s1.release();
            }
        }).start();
    }
}
```

### 什么是指令重排序？

为了使处理器内部的运算单元能尽量被充分利用，处理器可能会对输入的代码进行乱序执行优化，处理器会在计算之后将乱序执行的结果重组，并确保这一结果和顺序执行的结果是一直的，但是这个过程并不保证各个语句计算的先后顺序和输入代码中的顺序一致，简单来说，就是指程序中写的代码，在执行时并不一定按照写的顺序就叫做指令重排序。

Java中的指令重排序有两次，第一次发生在将字节码编译成机器码的阶段，第二次发生在CPU执行的时候，也会适当对指令进行重排。

### ThreadLocal的作用？导致内存泄漏的原因是什么？

ThreadLocal可以为每一个线程拷贝变量的副本，让变量“私有化”，导致内存泄漏的主要原因是在内部维护的Map结构，当key被GC之后，value还存在，无法自动进行GC，就会导致内存泄漏。

### 使用线程池有什么好处？

- 降低资源消耗：通过重复利用已创建的线程降低线程创建和销毁造成的消耗
- 提高响应速度：当任务到达时，可以不需要等待线程创建就能立即执行
- 提高线程的可管理性：线程是稀缺资源，如果无限制的创建，不仅会消耗系统资源，还会降低系统的稳定性，使用线程池可以进行同一的分配，监控和调优

### 线程池中submit()和execute()方法有什么区别？

execute和submit都属于线程池的方法，两者的区别在于：

- execute只能提交Runnable类型的任务，而submit既能提交Runnable类型的任务也能提交Callable类型任务
- execute会直接抛出任务运行时的异常，submit会吃掉异常，可通过Future的get方法将任务执行时的异常重新抛出
- execute所属顶层接口时Executor，submit所属顶层接口是ExecutorService，实现类ThreadPoolExecutor重写了execute方法，抽象类AbstractExecutorService重写了submit方法

### 什么是Executors框架？

Executor工具类的不同方法按照我们的需求创建了不同的线程池，来满足业务的需求。

### 线程池的拒绝策略？

当提交的线程填满核心线程数，并且塞满了队列缓冲区，并且超过了最大线程数时，就会触发拒绝策略，具体有以下几种：

| 拒绝策略            | 含义                                                         |
| ------------------- | ------------------------------------------------------------ |
| AbortPolicy         | 当任务添加到线程池中被拒绝时，它将抛出RejectedExecutionException异常 |
| CallerRunsPolicy    | 当任务添加到线程池中被拒绝时，会在线程池当前正在运行的Thread线程池中处理被拒绝的任务 |
| DiscardOldestPolicy | 当任务添加到线程池中被拒绝时，线程池会放弃等待队列中最旧的未处理任务，然后将被拒绝的任务添加到等待队列中 |
| DiscardPolicy       | 当任务添加到线程池中被拒绝时，线程池将丢弃被拒绝的任务       |

什么时候触发拒绝策略，是三个参数总体协调的结果，当提交的任务大于corePoolSize时，会优化放到队列缓冲区，值由填满了缓冲区之后，才会判断当前任务是否大于maxPoolSize，小于的时候会创建新的线程进行处理，大于时就触发了拒绝策略。简单来说，当前提交任务数大于(maxPoolSize + queueCapacity)时就会触发线程的拒绝策略。

### 如何获取子线程的执行结果？

- 使用join方法变量传递
- FutureTask

### 如何对一个字符串快速进行排序？

  可以使用Fork/Join框架来完成，相关代码示例：

```java
class Fibonacci extends RecursiveTask<Integer> {
   final int n;
   Fibonacci(int n) { this.n = n; }
   Integer compute() {
     if (n <= 1)
       return n;
     Fibonacci f1 = new Fibonacci(n - 1);
     f1.fork();
     Fibonacci f2 = new Fibonacci(n - 2);
     return f2.compute() + f1.join();
   }
 }
```

### 线程池的参数如何设置？

详细参见：[Java线程池实现原理及其在美团业务中的实践](https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html)。

### 子线程中如何获取父线程的 `ThreadLocal` 中的值、`ThreadLocal` 的数据结构？



### 高并发下，如何保证接口的幂等性？

[高并发下如何保证接口的幂等性？](https://segmentfault.com/a/1190000039737646)

### 除了Lock和synchronized，还有什么方式可以保障线程安全？

- 使用Atomic原子类，它通过CAS操作，保障线程安全
- 使用线程安全的集合类，例如ConcurrentHashMap、CopyOnWriteArrayList
- 使用volatile，如果是共享变量引起的线程安全问题，volatile可以共享保障变量的可见性
- 使用ThreadLocal，使得每个线程都可以独立地访问和修改自己的变量副本
- 使用不可变的变量，例如String，使用final关键字修饰的变量等
