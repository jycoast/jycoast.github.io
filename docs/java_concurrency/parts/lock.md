---
title: Lock 入门
---

#### Lock接口的使用

```java
Lock l = ...;

l.lock();
try {
    // access the resource protected by this lock
} finally {
    l.unlock();
}
```
### Lock的由来

前面我们提到过在并发编程领域，有两大核心问题：一个是**互斥**，即同一时刻只允许一个线程访问共享资源；另一个是**同步**，即线程之间如何通信、协作。这两大问题，管程都是能够解决的。**Java SDK 并发包通过 Lock 和 Condition 两个接口来实现管程，其中 Lock 用于解决互斥问题，Condition 用于解决同步问题**。

Java 语言本身提供的 synchronized 也是管程的一种实现，既然 Java 从语言层面已经实现了管程了，那为什么还要在 SDK 里提供另外一种实现呢？

#### 再造管程的理由

对于死锁问题，可以采用**破坏不可抢占条件**方案，即占用部分资源的线程进一步申请其他资源时，如果申请不到，可以主动释放它占有的资源。

但synchronized 没有办法解决。原因是 synchronized 申请资源的时候，如果申请不到，线程直接进入阻塞状态了，而线程进入阻塞状态，啥都干不了，也释放不了线程已经占有的资源。

如果我们重新设计一把互斥锁去解决这个问题，那该怎么设计呢？

**能够响应中断**。synchronized 的问题是，持有锁 A 后，如果尝试获取锁 B 失败，那么线程就进入阻塞状态，一旦发生死锁，就没有任何机会来唤醒阻塞的线程。但如果阻塞状态的线程能够响应中断信号，也就是说当我们给阻塞的线程发送中断信号的时候，能够唤醒它，那它就有机会释放曾经持有的锁 A。这样就破坏了不可抢占条件了。

**支持超时**。如果线程在一段时间之内没有获取到锁，不是进入阻塞状态，而是返回一个错误，那这个线程也有机会释放曾经持有的锁。这样也能破坏不可抢占条件。

**非阻塞地获取锁**。如果尝试获取锁失败，并不进入阻塞状态，而是直接返回，那这个线程也有机会释放曾经持有的锁。这样也能破坏不可抢占条件。

这三种方案可以全面弥补 synchronized 的问题。

```java
// 支持中断的API
void lockInterruptibly() throws InterruptedException;

// 支持超时的API
boolean tryLock(long time, TimeUnit unit) throws InterruptedException;

// 支持非阻塞获取锁的API
boolean tryLock();
```

来源：JDK注释。

### MESA 与 Java中的锁机制

#### MESA 与 synchronized

![image-20250427210623235](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20250427210623235.png)

#### MESA 与 Lock

![image-20250428171338046](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20250428171338046.png)

### 可重入锁

#### Synchronized 与可重入锁

```java
public class SynchronizedDemo {

    public synchronized void methodA() {
        System.out.println("进入 methodA");
        methodB();
        System.out.println("退出 methodA");
    }

    public synchronized void methodB() {
        System.out.println("进入 methodB");
    }

    public static void main(String[] args) {
        SynchronizedDemo demo = new SynchronizedDemo();
        demo.methodA();
    }
}
```

#### ReentrantLock 与可重入锁

```java
public class ReentrantLockDemo {

    private final ReentrantLock lock = new ReentrantLock();

    public void methodA() {
        lock.lock();
        try {
            System.out.println("进入 methodA");
            methodB();
            System.out.println("退出 methodA");
        } finally {
            lock.unlock();
        }
    }

    public void methodB() {
        lock.lock();
        try {
            System.out.println("进入 methodB");
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        ReentrantLockDemo demo = new ReentrantLockDemo();
        demo.methodA();
    }
}
```

### 公平锁与非公平锁

```java
import java.util.concurrent.locks.ReentrantLock;

public class FairAndNonFairLockDemo {

    public static void main(String[] args) throws InterruptedException {

        System.out.println("====== 公平锁 ======");
        testLock(new ReentrantLock(true));

        Thread.sleep(3000);

        System.out.println("\n====== 非公平锁 ======");
        testLock(new ReentrantLock(false));
    }

    private static void testLock(ReentrantLock lock) {
        for (int i = 1; i <= 5; i++) {
            final int threadNum = i;

            new Thread(() -> {
                System.out.println(Thread.currentThread().getName() + " 等待获取锁");

                lock.lock();
                try {
                    System.out.println(Thread.currentThread().getName() + " 获取到锁");

                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                } finally {
                    System.out.println(Thread.currentThread().getName() + " 释放锁");
                    lock.unlock();
                }

            }, "Thread-" + threadNum).start();

            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
```
