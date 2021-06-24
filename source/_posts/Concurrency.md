---
title: Java并发编程
date: 2020-10-05
categories:
- Java
author: 吉永超
---

# 前言

并发编程相比于Java中其他知识点的学习门槛要高很多，从而导致很多人望而却步，但无论是职场面试，还是高并发/高流量系统的实现，却都离不开并发编程。

<!-- more -->
全文大致共分为三个部分，第一部分为Java并发编程基础篇，主要讲解Java并发编程的基础知识、线程有关的知识和并发编程中的其他概念，这些知识在后续的章节中都会用到。第二部分为Java并发编程的高级篇，讲解Java并发包中的核心组件的实现原理。第三部分为Java并发编程实践篇，主要讲解并发组件的使用方法，以及一些注意事项。

本文主要结合张龙老师的视频：[精通Java并发](https://www.bilibili.com/video/BV1qK4y1t78Z?from=search&seid=2031440298446612503)，以及《Java并发编程之美》，系统而全面的介绍Java并发的方方面面。

# 并发编程基础

## Java并发编程

在正式开始并发编程的基础内容的学习之前，有必要讨论两个核心的问题，第一是什么是并发编程，第二为什么要学习并发编程。

## 线程简介

在讨论什么是线程前有必要先说下什么是进程，因为线程是进程中的一个实体，线程本身是不会独立存在的。
进程是代码在数据集合上的一次运行活动，是系统进行资源分配和调度的基本单位，线程则是进程一个执行路径，一个
进程中至少有一个线程，进程中的多个线程共享进程的资源。

## Thread和Runnable

Thread类和Runnable接口无疑是了解Java并发编程的入口，Thread类本身是实现了Runnable接口的：

```java
public class Thread implements Runnable {
    // ...
}
```

首先我们来阅读以下Thread类的文档说明：

```txt
A thread is a thread of execution in a program. The Java Virtual Machine allows an application to have 
multiple threads of execution running concurrently.
```

一个thread指的是程序执行中的一个线程，Java虚拟机支持一个应用可以有多个并发执行的线程。

```txt
Every thread has a priority. Threads with higher priority are executed in preference to threads with 
lower priority. Each thread may or may not also be marked as a daemon. When code running in some thread 
creates a new Thread object, the new thread has its priority initially set equal to the priority of the 
creating thread, and is a daemon thread if and only if the creating thread is a daemon.
```

每一个线程都会有一个优先级，拥有高优先级的线程在执行的时候就会比低优先级的线程优先级要高，每一个线程也可以被标记为daemon（后台线程），当运行在某一个线程中的代码创建了一个新的线程，默认情况下，新的线程的优先级会和创建它的线程优先级相同，并且只有创建它的线程是daemon线程时，新的线程才会是daemon。

```txt
When a Java Virtual Machine starts up, there is usually a single non-daemon thread (which typically calls 
the method named main of some designated class). The Java Virtual Machine continues to execute threads 
until either of the following occurs:
```

当Java虚拟机启动的时候，通常会有一个单个的、非daemon线程（通常情况会调用某一个被指定类的main方法），Java虚拟机会继续执行线程，直到下面的两种情况发生：

```txt
The exit method of class Runtime has been called and the security manager has permitted the exit 
operation to take place.
All threads that are not daemon threads have died, either by returning from the call to the run method or 
by throwing an exception that propagates beyond the run method.
```

- 类的Runtime方法被调用，并且安全管理器允许退出操作发生。
- 所有的非后台线程都已经消亡了，要么是通过run方法的调用返回了，要么是run方法外面抛出了异常。

```txt
There are two ways to create a new thread of execution. One is to declare a class to be a subclass of 
Thread. This subclass should override the run method of class Thread. An instance of the subclass can 
then be allocated and started. For example, a thread that computes primes larger than a stated value 
could be written as follows:
```

有两种方式来创建一个新的执行线程，一种是继承Thread类，这个子类应该重写Thread类的run方法，这个子类就可以创建实例并且执行，比如，一个线程计算大于某一个状态值的，可以这样做：

```java
class PrimeThread extends Thread {
           long minPrime;
           PrimeThread(long minPrime) {
               this.minPrime = minPrime;
           }
  
           public void run() {
               // compute primes larger than minPrime
                . . .
           }
       }
```

如下代码将会生成线程并且使用start方法开始执行：

```java
 PrimeThread p = new PrimeThread(143);
 p.start();
```

接下来是另外一种创建线程的方式：

```txt
The other way to create a thread is to declare a class that implements the Runnable interface. That class 
then implements the run method. An instance of the class can then be allocated, passed as an argument 
when creating Thread, and started. The same example in this other style looks like the following:
```

另一种创建线程的方式就是声明一个类并且实现Runnable接口，在这个类实现了run方法之后，就可以创建实例。当创建Thread的时候把这个类作为一个参数传入并启动，相同的例子用这个方式来实现，代码如下：

```java
 class PrimeRun implements Runnable {
           long minPrime;
           PrimeRun(long minPrime) {
               this.minPrime = minPrime;
           }
  
           public void run() {
               // compute primes larger than minPrime
                . . .
           }
       }
```

如下代码就会创建一个线程并执行：

```java
PrimeRun p = new PrimeRun(143);
new Thread(p).start();
```

```txt
Every thread has a name for identification purposes. More than one thread may have the same name. If a 
name is not specified when a thread is created, a new name is generated for it.
Unless otherwise noted, passing a null argument to a constructor or method in this class will cause a 
NullPointerException to be thrown.
```

每个线程都有一个名称用于标识，不同的线程可能会有相同的名称，如果创建线程的时候没有指定名称，就会产生一个新的名称，如无特别说明，将null参数传递给构造方法或者这个类的其他方法就会导致空指针异常。

这里用到了start方法来启动线程，我们来阅读以下start方法的说明：

```txt
Causes this thread to begin execution; the Java Virtual Machine calls the run method of this thread.
The result is that two threads are running concurrently: the current thread (which returns from the call 
to the start method) and the other thread (which executes its run method).
It is never legal to start a thread more than once. In particular, a thread may not be restarted once it
has completed execution.
```

当调用了start方法意味这个这个线程开始执行了，Java虚拟机会调用这个线程的run方法，结果是当前线程（调用start方法所返回的线程）和另外一个线程（执行run方法的线程）会并发的运行，多次启动一个线程是不合法的，特别的，一个线程已经执行完成之后不可以被重新启动。

Runnable接口本身是一个函数式接口，里面有且仅有一个抽象方法run方法：

```java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```

接下来我们阅读以下Runnable接口的文档说明：

```txt
The Runnable interface should be implemented by any class whose instances are intended to be executed by 
a thread. The class must define a method of no arguments called run.
This interface is designed to provide a common protocol for objects that wish to execute code while they 
are active. For example, Runnable is implemented by class Thread. Being active simply means that a thread 
has been started and has not yet been stopped.
```

任何一个执行线程的类都应该实现Runnable接口，这个类必须定义一个无参的run方法。设计这个接口是为了，给执行处在激活状态的代码的时候，提供一种公共的协议，比如说，Runnable是被Thread类所实现出来了。处于激活状态表示一个线程被启动了，而且没有停止。

```txt
In addition, Runnable provides the means for a class to be active while not subclassing Thread. A class 
that implements Runnable can run without subclassing Thread by instantiating a Thread instance and 
passing itself in as the target. In most cases, the Runnable interface should be used if you are only 
planning to override the run() method and no other Thread methods. This is important because classes 
should not be subclassed unless the programmer intends on modifying or enhancing the fundamental behavior
of the class.
```

此外，Runnable提供了让一个类处在激活状态同时又没有子类化的方式，一个类实现了Runnable可以不用通过子类化来运行，这是通过初始化一个Thread实例，然后将它自己作为目标传入，如果你只是计划重写run方法，而不打算重写Thread类其他的方法，一般情况下，都应该使用Runnable，这是非常重要的，除非程序员打算增强或修改一些基础的行为，因为类不应该被子类化。

接下来我们阅读以下run方法的说明：

```txt
When an object implementing interface Runnable is used to create a thread, starting the thread causes the 
object's run method to be called in that separately executing thread.
The general contract of the method run is that it may take any action whatsoever.
```

当使用实现了Runnable接口的对象创建了一个线程，启动这个线程，就会在单独执行的线程上执行这个类的run方法，run方法一种通用的锲约是它可以接口任何的动作。

同样的在Thread类中也有一个run方法：

```txt
If this thread was constructed using a separate Runnable run object, then that Runnable object's run 
method is called; otherwise, this method does nothing and returns.
Subclasses of Thread should override this method.
```

如果这个线程是通过单独的Runnable接口对象来构建的话，那么Runnable对象的run方法就会被调用，否则，这个方法什么都不做，直接返回。Thread的子类应该重写这个方法。

方法的实现：

```java
    @Override
    public void run() {
        // private Runnable target;
        if (target != null) {
            target.run();
        }
    }
```

Thread类的run方法会判断本地的Runnable对象是否已经被赋值，如果已经赋值了就执行里面的run方法。

Thread类的构造方法都会调用init方法：

```java
    public Thread(Runnable target) {
        init(null, target, "Thread-" + nextThreadNum(), 0);
    }
```

这里我们先了解以下这个init方法，方法的参数说明：

```java
// 线程组
g – the Thread group
// 这个对象的run将会被调用
target – the object whose run将会被调用() method gets called
// 新创建的线程的名称
name – the name of the new Thread
// 新的线程所需要的栈的大小，0表示这个参数会忽略掉
stackSize – the desired stack size for the new thread, or zero to indicate that this parameter is to be ignored.
```

## wait、sleep和notify

### 方法简介

在Object类中有几个与线程相关的方法：notify、notifyAll、wait，这几个方法非常的重要，接下来我们分析一下这个几个方法，首先从wait方法开始，wait方法又有几个重载的方法，首先来看不带参数的wait方法：

```txt
Causes the current thread to wait until another thread invokes the notify() method or the notifyAll() 
method for this object. In other words, this method behaves exactly as if it simply performs the call 
wait(0).
```

wait方法会导致当前的线程进入等待状态，直到另外一个线程调用了这个对象的notify或者notifyAll方法，换言之，这个方法的行为是与wait(0)是等价的。

```txt
The current thread must own this object's monitor. The thread releases ownership of this monitor and 
waits until another thread notifies threads waiting on this object's monitor to wake up either through a 
call to the notify method or the notifyAll method. The thread then waits until it can re-obtain ownership
of the monitor and resumes execution.
As in the one argument version, interrupts and spurious wakeups are possible, and this method should 
always be used in a loop:
```

要调用当前对象wait方法，当前线程必须要拥有这个对象的锁，这个线程在调用了wait方法之后，就会释放掉锁的控制权，并且进行等待，直到另外的线程通知在这个锁上等待的所有线程。唤醒的方式要么是通过notify方法或者是notifyAll方法。接下来，这个线程还是会继续等待，直到它可以重新获取锁的有用权，并且恢复执行。对于一个参数的版本来说，终端和一些虚假的唤醒是可能发生的，这个方法应该只在循环当中使用：

```java
synchronized (obj) {
               while (<condition does not hold>)
                   obj.wait();
               ... // Perform action appropriate to condition
           }
```

```txt
This method should only be called by a thread that is the owner of this object's monitor. See the notify 
method for a description of the ways in which a thread can become the owner of a monitor.
```

这个方法应该只是被拥有了这个对象的锁的线程去调用，参考notify方法来查看什么情况下，一个线程可以成为锁的拥有者。

如果没有锁直接调用wait方法会怎么样呢？

```java
public class MyTest1 {
    public static void main(String[] args) throws Exception{
        Object object = new Object();
        object.wait();
    }
}
```

程序就会直接抛出异常：

```java
Exception in thread "main" java.lang.IllegalMonitorStateException
```

按照给出的示例，我们将程序改写如下：

```java
public class MyTest1 {
    public static void main(String[] args) throws Exception{
        Object object = new Object();
        synchronized (object) {
            object.wait();
        }
    }
}
```

程序并没有抛出异常，而是进入进入了一直等待的状态。在Thread类中有一个sleep方法：

```txt
Causes the currently executing thread to sleep (temporarily cease execution) for the specified number of
milliseconds, subject to the precision and accuracy of system timers and schedulers. The thread does not 
lose ownership of any monitors.
```

它会导致当前正在执行的线程进入到休眠的状态（临时的终止执行）一段指定的毫秒数，它会收到系统定时器和调度器的精度的限制，线程并不会失去任何锁的所有权。

这里其实就是wait方法和sleep方法的最明显的区别，调用wait方法之前，线程必须持有对象的锁，在调用wait方法之后，线程就会释放锁，而sleep方法则不会释放掉锁。

前面我们提到过，不带参数的wait方法会调用他的重载方法：

```java
    public final void wait() throws InterruptedException {
        wait(0);
    }
```

wait方法本身又有两个重载的方法，我们首先来阅读一下只有一个参数的相关文档：

首先是方法的定义：

```java
  public final native void wait(long timeout) throws InterruptedException;
```

方法的说明：

```txt
Causes the current thread to wait until either another thread invokes the notify() method or the 
notifyAll() method for this object, or a specified amount of time has elapsed.
The current thread must own this object's monitor.
```

这个方法会让当前的线程进入等待状态，除非对当前这个对象使用notify或者notifyAll方法，或者已经到了指定的超时时间，当前对象必须要拥有当前对象的锁。

```txt
This method causes the current thread (call it T) to place itself in the wait set for this object and 
then to relinquish any and all synchronization claims on this object. Thread T becomes disabled for 
thread scheduling purposes and lies dormant until one of four things happens:
```

这个方法会导致当前的线程（T），将它自身放置到一个这个对象的等待集合当中，然后放弃任何同步的声明，线程T将无法再进行调度，处在休眠状态，直到下面的四种情况发生：

```txt
Some other thread invokes the notify method for this object and thread T happens to be arbitrarily chosen
as the thread to be awakened.
Some other thread invokes the notifyAll method for this object.
Some other thread interrupts thread T.
The specified amount of real time has elapsed, more or less. If timeout is zero, however, then real time
is not taken into consideration and the thread simply waits until notified.
```

- 另外一个线程调用了这个对象的notify方法，当前的线程T碰巧是要被选择唤醒的线程；
- 其他的线程调用了这个对象的notifyAll方法；
- 其他的线程中断了T线程
- 指定的时间已经过去了，不过如果时间设置为0的话，线程会一直进入等待直到被通知，而不会再去计算时间。

```txt
The thread T is then removed from the wait set for this object and re-enabled for thread scheduling. It 
then competes in the usual manner with other threads for the right to synchronize on the object; once it 
has gained control of the object, all its synchronization claims on the object are restored to the status 
quo ante - that is, to the situation as of the time that the wait method was invoked. Thread T then 
returns from the invocation of the wait method. Thus, on return from the wait method, the synchronization 
state of the object and of thread T is exactly as it was when the wait method was invoked.
```

接下来线程T会从对象等待集合中移除掉，然后，重新又可以进行线程的调度了。它会按照通常的方式与其他的线程竞争对于对象的同步权，一旦获得了对象的同步权，所有它的对这个对象同步的声明又会恢复到之前的同步声明状态，也就是说恢复到wait方法被调用的时候所处的状态，接下来线程T就会从wait方法的调用当中去返回，返回的时候，对象的同步状态以及线程T的同步状态与wait方法被调用的时候的状态是一模一样的。

```txt
A thread can also wake up without being notified, interrupted, or timing out, a so-called spurious 
wakeup. While this will rarely occur in practice, applications must guard against it by testing for the 
condition that should have caused the thread to be awakened, and continuing to wait if the condition is 
not satisfied. In other words, waits should always occur in loops, like this one:
```

一个线程还可以被唤醒无需被通知、中断或者超时，这个称之为虚假的唤醒，虽然这种实际情况下很少发生，但是应用还是应该通过测试条件保证这一点，并且如果条件没有被满足的时候就持续处于等待状态，换句话说，等待总是应该发生在循环当中，就向下面的代码：

```java
 synchronized (obj) {
               while (<condition does not hold>)
                   obj.wait(timeout);
               ... // Perform action appropriate to condition
           }
```

```txt
If the current thread is interrupted by any thread before or while it is waiting, then an 
InterruptedException is thrown. This exception is not thrown until the lock status of this object has 
been restored as described above.
```

如果当前的线程被别的线程在它等待之前或等待当中的时候被中断了，这个锁状态恢复之后才会被正常的抛出InterruptedException异常。

```txt
Note that the wait method, as it places the current thread into the wait set for this object, unlocks 
only this object; any other objects on which the current thread may be synchronized remain locked while 
the thread waits.
```

wait方法会将当前的线程放置到它的等待的对象集合当中，只会解锁当前的对象，当这个线程等待的时候，任何其它的对象对象可能会依然处于锁定的状态。

```txt
This method should only be called by a thread that is the owner of this object's monitor. See the notify 
method for a description of the ways in which a thread can become the owner of a monitor.
```

这个方法应该只被持有对象锁的线程所调用，请查看notify方法来查看如何让一个线程成为锁的拥有者。

接下来我们查看wait方法另外一个重载的方法：

```java
    public final void wait(long timeout, int nanos) throws InterruptedException {
        if (timeout < 0) {
            throw new IllegalArgumentException("timeout value is negative");
        }

        if (nanos < 0 || nanos > 999999) {
            throw new IllegalArgumentException(
                                "nanosecond timeout value out of range");
        }

        if (nanos > 0) {
            timeout++;
        }
        // 底层实现还是调用wait(long timeout)方法

        wait(timeout);
    }
```

wait方法和notify方法总是成对出现的，notify方法也是一个native方法：

```java
 public final native void notify();
```

我们来了解一下notify方法的作用：

```AsciiDoc
Wakes up a single thread that is waiting on this object's monitor. If any threads are waiting on this 
object, one of them is chosen to be awakened. The choice is arbitrary and occurs at the discretion of the
implementation. A thread waits on an object's monitor by calling one of the wait methods.
```

它会唤醒正在等待这个对象的锁的单个线程，如果有多个线程都在等待这个对象的锁，那么就会选择其中的一个进行唤醒，选择是随机的，并且是根据实现来决定的，一个线程会通过调用某一个wait方法进入等待状态。

```txt
The awakened thread will not be able to proceed until the current thread relinquishes the lock on this
object. The awakened thread will compete in the usual manner with any other threads that might be 
actively competing to synchronize on this object; for example, the awakened thread enjoys no reliable
privilege or disadvantage in being the next thread to lock this object.
This method should only be called by a thread that is the owner of this object's monitor. A thread  
becomes the owner of the object's monitor in one of three ways:    
```

被唤醒的线程是无法执行的，直到当前的线程放弃了这个对象的锁，被唤醒的线程会按照常规的方式与其他的线程进行对象同步的竞争，比如说，被唤醒的线程它是没有任何的特权，也没有任何不足的地方，都有可能会获得当前对象的锁。notify方法只能被这个对象的持有者来进行调用，一个线程获取对象锁有以下三种方式：

```text
By executing a synchronized instance method of that object.
By executing the body of a synchronized statement that synchronizes on the object.
For objects of type Class, by executing a synchronized static method of that class.
```

- 通过执行对象的synchronized实例方法来获取
- 通过执行这个对象的synchronized语句块来获取
- 对于Class类型的对象，通过执行这个class中synchronized静态方法来获取

```txt
Only one thread at a time can own an object's monitor.  
```

在某一个时刻只有一个线程拥有一个对象的锁。

同样的，notifyAll方法也是一个本地方法：

```java
  public final native void notifyAll();
```

方法的说明：

```txt
Wakes up all threads that are waiting on this object's monitor. A thread waits on an object's monitor by
calling one of the wait methods.
```

notifyAll方法会唤醒在这个对象的锁上等待的所有的线程，线程可以通过调用这个对象的wait方法等待这个对象的锁。

```txt
The awakened threads will not be able to proceed until the current thread relinquishes the lock on this 
object. The awakened threads will compete in the usual manner with any other threads that might be 
actively competing to synchronize on this object; for example, the awakened threads enjoy no reliable 
privilege or disadvantage in being the next thread to lock this object.
```

被唤醒的线程只有在当前对象释放掉锁的时候才能继续执行，它会按照通常的方式与其他的线程竞争对象的同步，既没有什么特权，也没有什么缺陷，都有可能是下一个给当前对象上锁的线程。

```txt
This method should only be called by a thread that is the owner of this object's monitor. See the notify
method for a description of the ways in which a thread can become the owner of a monitor.
```

这个方法只能被持有锁的对象锁调用，查看notify方法获取对象锁的方式。

我们可以用一张表格来总结以下wait、notify、notifyAll方法的区别：

|  方法名   |                             特点                             |
| :-------: | :----------------------------------------------------------: |
|   wait    | 1、当调用wait方法时，首先需要确保wait方法的线程已经持有了对象的锁<br>2、当调用wait后，该线程会释放掉这个对象的锁，然后进入到等待状态（wait set）<br>3、当线程调用了wait后进入等待状态时，它就可以等待线程调用相同对象的notify和notifyAll方法来使得自己被唤醒<br>4、一旦这个线程被其他线程唤醒后，该线程就会与其他线程一同开始竞争这个对象的锁（公平竞争）；只有当该线程获取到了这个对象的锁后，线程才会继续往下执行<br>5、调用wait方法的代码片段需要放在synchronize代码块或者synchronized方法中，这样才可以确保线程在调用wait方法前已经获取到了对象的锁 |
|  notify   | 1、当调用对象的notify方法时，它会随机唤醒该对象等待集合（wait set）中的任意一个线程，当某个线程被唤醒后，它就会与其他线程一同竞争对象的锁<br>2、在某一时刻只有唯一一个线程可以拥有对象的锁 |
| notifyAll | 1、当调用对象的notifyAll方法时，它会唤醒该对象集合（wait set）中所有的线程，这些线程被唤醒后，又会开始竞争对象的锁 |

### 方法实践

我们来看一个需要运用并发编程的实际的需求：

 1、存在一个对象，该对象有个int类型的成员变量counter，该成员变量的初始值为0；

2、创建两个线程，其中一个线程对该对象的成员变量counter加1，另一个线程对该对象的成员变量减1；

3、输出该对象成员变量counter每次变化后的值；

4、最终输出的结果应为：1010101010...。

首先是我们需要操作的对象：

```java
public class MyObject {
    // 需要操作的成员变量
    private int counter;

    public synchronized void increase() {
        if (counter != 0) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        counter++;
        System.out.println(counter);
        notify();
    }

    public synchronized void decrease() {
        if (counter == 0) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        counter--;
        System.out.println(counter);
        notify();
    }
}
```

增加的线程类：

```java
public class IncreaseThread extends Thread {
    private MyObject myObject;

    public IncreaseThread(MyObject myObject) {
        this.myObject = myObject;
    }

    @Override
    public void run() {
        for (int i = 0; i < 30; i++) {
            try {
                Thread.sleep((long) (Math.random() * 1000));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
             myObject.increase();
        }
    }
}
```

减少的线程类：

```java
public class DecreaseThread extends Thread {
    private MyObject myObject;

    public DecreaseThread(MyObject myObject) {
        this.myObject = myObject;
    }

    @Override
    public void run() {
        for (int i = 0; i < 30; i++) {
            try {
                Thread.sleep((long) (Math.random() * 1000));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            myObject.decrease();
        }
    }
}
```

我们使用客户端来进行测试：

```java
public class client {
    public static void main(String[] args) {
        MyObject myObject = new MyObject();
        Thread increaseThread = new IncreaseThread(myObject);
        Thread decreaseThread = new DecreaseThread(myObject);
        // 这里先启动哪个线程结果都是相同的
        increaseThread.start();
        decreaseThread.start();
    }
}
```

程序也正如我们所愿，输出了：

```txt
> Task :client.main()
1
0
1
0
1
0
1
0
1
0
1
0
1
0
```

接下来我们尝试创建多个线程

```java
public class client {
    public static void main(String[] args) {
        MyObject myObject = new MyObject();
        Thread increaseThread = new IncreaseThread(myObject);
        Thread increaseThread2 = new IncreaseThread(myObject);
        Thread decreaseThread = new DecreaseThread(myObject);
        Thread decreaseThread2 = new DecreaseThread(myObject);
        increaseThread.start();
        increaseThread2.start();
        decreaseThread.start();
        decreaseThread2.start();
    }
}
```

程序输出的结果：

```txt
> Task :client.main()
1
0
1
0
1
0
1
0
1
0
1
0
1
0
1
0
1
0
1
0
1
0
-1
-2
-3
-2
-1
-2
-3
-4
```

可以看到这个时候，输入的结果其实已经是没有规律的了。这是因为在之前只有两个线程的时候，调用notify方法一定会唤醒唯一的另外一个方法，而在上面的这个例子中，被唤醒的线程实际上是随机的。

为了避免这种情况的发生，我们应该使用while来进行判断，而不是使用if：

```java
public class MyObject {
    private int counter;

    public synchronized void increase() {
        while (counter != 0) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        counter++;
        System.out.println(counter);
        notify();
    }

    public synchronized void decrease() {
        while (counter == 0) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        counter--;
        System.out.println(counter);
        notify();
    }
}
```

 ## synchronized详解

### synchronized简介

我们首先来看一个例子：

```java
public class MyThreadTest {
    public static void main(String[] args) {
        Runnable r = new MyThread();
        // 传入的是同一个Runnable实例，都可以访问到成员变量x
        Thread t1 = new Thread(r);
        Thread t2 = new Thread(r);

        t1.start();
        t2.start();
    }
}

class MyThread implements Runnable {
    int x;

    @Override
    public void run() {
        x = 0;
        while (true) {
            System.out.println("result: " + x++);
            try {
                Thread.sleep((long) (Math.random() * 1000));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            if (x == 30) {
                break;
            }
        }
    }
}
```

运行这个程序，实际上每次输出的结果都是不相同的，这两个线程实际上共享了成员变量x，如果一个对象有可以被修改的成员变量，我们就认为这个对象是可变的对象，或者称之为有状态的，反之，如果一个对象没有被修改的成员变量，那么我们称这个对象是无状态的。

```java
public class MyThreadTest2 {
    public static void main(String[] args) {
        MyClass myClass = new MyClass();
        Thread t1 = new Thread1(myClass);
        Thread t2 = new Thread2(myClass);
        t1.start();
        try {
            Thread.sleep(700);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        t2.start();
    }
}

class MyClass {
    public synchronized void hello() {
        try {
            Thread.sleep(400);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("hello");
    }

    public synchronized void world() {
        System.out.println("world");
    }
}

class Thread1 extends Thread {

    private MyClass myClass;

    public Thread1(MyClass myClass) {
        this.myClass = myClass;
    }

    @Override
    public void run() {
        myClass.hello();
    }
}

class Thread2 extends Thread {
    private MyClass myClass;

    public Thread2(MyClass myClass) {
        this.myClass = myClass;
    }

    @Override
    public void run() {
        myClass.world();
    }
}
```

程序输出：

```txt
> Task :MyThreadTest2.main()
hello
world
```

如果一个对象有若个synchronized方法，在某一个时刻只会有唯一的一个synchronized方法会被某一个线程访问，原因就在于当前对象的锁只有一个。当方法是static的时候，获取的锁不再是当前对象的锁，而是当前对象的Class的锁。

### synchronized字节码分析

synchronized关键字一般来说可以作用在代码块和方法当中，当作用在代码块的中的时候，一般会使用如下的方式：

```java
public class MyTest2 {
    private Object object = new Object();

    public void method() {
        // 获取到object对象的锁
        synchronized (object) {
            System.out.println("hello world");
        }
    }
}
```

使用命令进行反编译：

```shell
javap -c MyTest2.class
```

反编译的结果：

```java
public class concurrency2.MyTest2 {
  // 构造方法
  public concurrency2.MyTest2();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: aload_0
       5: new           #2                  // class java/lang/Object
       8: dup
       9: invokespecial #1                  // Method java/lang/Object."<init>":()V
      12: putfield      #3                  // Field object:Ljava/lang/Object;
      15: return

  public void method();
    Code:
       0: aload_0
       // 获取当前对象的成员变量
       1: getfield      #3                  // Field object:Ljava/lang/Object;
       4: dup
       5: astore_1
       // 锁进入
       6: monitorenter
       // 开始执行代码
       7: getstatic     #4                  // Field java/lang/System.out:Ljava/io/PrintStream;
      10: ldc           #5                  // String hello world
      12: invokevirtual #6                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
      15: aload_1
      // 锁退出
      16: monitorexit
      17: goto          25
      20: astore_2
      21: aload_1
      // 处理异常退出锁的释放
      22: monitorexit
      23: aload_2
      24: athrow
      25: return
    Exception table:
       from    to  target type
           7    17    20   any
          20    23    20   any
}
```

这里有两个monitorexit的原因是，无论代码执行是否抛出了异常，都会释放掉锁的对象，这部分是由Java编译器所做的工作。

当我们使用synchronized关键字来修饰代码块时，字节码层面上是通过monitor与monitorexit指令来实现的锁的获取与释放动作，一个monitor可能对应一个或者多个monitorexit，为了说明这一点，我们修改一下代码：

```java
public class MyTest2 {
    private Object object = new Object();

    public void method() {
        // 获取到object对象的锁
        synchronized (object) {
            System.out.println("hello world");
            throw new RuntimeException();
        }
    }
}
```

这个时候反编译字节码就会得到：

```java
public class concurrency2.MyTest2 {
  public concurrency2.MyTest2();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: aload_0
       5: new           #2                  // class java/lang/Object
       8: dup
       9: invokespecial #1                  // Method java/lang/Object."<init>":()V
      12: putfield      #3                  // Field object:Ljava/lang/Object;
      15: return

  public void method();
    Code:
       0: aload_0
       1: getfield      #3                  // Field object:Ljava/lang/Object;
       4: dup
       5: astore_1
       6: monitorenter
       7: getstatic     #4                  // Field java/lang/System.out:Ljava/io/PrintStream;
      10: ldc           #5                  // String hello world
      12: invokevirtual #6                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
      15: new           #7                  // class java/lang/RuntimeException
      18: dup
      // RuntimeException的构造方法
      19: invokespecial #8                  // Method java/lang/RuntimeException."<init>":()V
      22: athrow
      23: astore_2
      24: aload_1
      25: monitorexit
      26: aload_2
      27: athrow
    Exception table:
       from    to  target type
           7    26    23   any
}
```

为什么只有一个monitorexit呢？因为程序的出口只有一种，或者说程序运行的最终结果一定会抛出异常，这个时候athrow是一定会执行的，因此只有唯一的一个monitorexit。

当线程进入到monitorenter指令后，线程将会持有Monitor对象，退出monitorenter指令后，线程将会释放Moniter对象。

synchronized关键字除了可以作用在代码块上，还可以作用在方法上：

```java
public class MyTest3 {
    public synchronized void method() {
        System.out.println("hello world");
    }
}
```

同样反编译之后：

```java
{                                                                                                         
  public concurrency2.MyTest3();                                                                          
    descriptor: ()V                                                                                       
    flags: ACC_PUBLIC                                                                                     
    Code:                                                                                                 
      stack=1, locals=1, args_size=1                                                                      
         0: aload_0                                                                                       
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V                     
         4: return                                                                                        
      LineNumberTable:                                                                                    
        line 8: 0                                                                                         
      LocalVariableTable:                                                                                 
        Start  Length  Slot  Name   Signature                                                             
            0       5     0  this   Lconcurrency2/MyTest3;                                                
                                                                                                          
  public synchronized void method();                                                                      
    descriptor: ()V                                                                                       	// ACC_SYNCHRONIZED表示这是一个synchronized方法
    flags: ACC_PUBLIC, ACC_SYNCHRONIZED                                                                   
    Code:                                                                                                 	//默认情况下参数的长度为1，是因为传入了当前对象
      stack=2, locals=1, args_size=1                                                                      
         0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;         
         3: ldc           #3                  // String hello world                                       
         5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V 
         8: return                                                                                        
      LineNumberTable:                                                                                    
        line 10: 0                                                                                        
        line 11: 8                                                                                        
      LocalVariableTable:                                                                                 
        Start  Length  Slot  Name   Signature                                                             
            0       9     0  this   Lconcurrency2/MyTest3;                                                
}                                                                                                       
```

synchronized关键字修饰方法与代码块不同的地方是，并没有通过monitorenter与monitorexit指令来描述，而是使用ACC_SYNCHRONIZED表示该方法被synchronized修饰。当方法被调用的时候，JVM会检查该方法是否拥有ACC_SYNCHRONIZED标志，如果有，那么执行线程将会持有方法所在的Monitor对象，然后再去执行方法体，在该方法执行期间，其他线程均无法再获取到这个Monitor对象，当线程执行完该方法后，它会释放掉这个Monitor对象。

synchronized关键字还有可能作用在静态方法上面：

```java
public class MyTest4 {
    public static synchronized void method() {
        System.out.println("hello world");
    }
}
```

反编译的结果：

```java
{                                                                                                          
  public concurrency2.MyTest4();                                                                           
    descriptor: ()V                                                                                        
    flags: ACC_PUBLIC                                                                                      
    Code:                                                                                                  
      stack=1, locals=1, args_size=1                                                                       
         0: aload_0                                                                                        
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V                      
         4: return                                                                                         
      LineNumberTable:                                                                                     
        line 8: 0                                                                                          
      LocalVariableTable:                                                                                  
        Start  Length  Slot  Name   Signature                                                              
            0       5     0  this   Lconcurrency2/MyTest4;                                                 
                                                                                                           
  public static synchronized void method();                                                                
    descriptor: ()V
    //  ACC_STATIC表示静态的同步方法
    flags: ACC_PUBLIC, ACC_STATIC, ACC_SYNCHRONIZED                                                        
    Code:                                                                                                  
      stack=2, locals=0, args_size=0                                                                       
         0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;          
         3: ldc           #3                  // String hello world                                        
         5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V  
         8: return                                                                                         
      LineNumberTable:                                                                                     
        line 10: 0                                                                                         
        line 11: 8                                                                                         
}                                                                                                          
```

可以看到无论是修改实例方法还是静态方法，都是通过ACC_SYNCHRONIZED来实现的，静态方法还会增加ACC_STATIC来表示是静态方法。

## Monitor

### 自旋

JVM中的同步是基于进入与退出监视器对象（管程对象）（Monitor）来实现的，每个对象实例都会有一个Monitor对象，Monitor对象会和Java对象一同创建，一同销毁，Monitor对象是由C++来实现的。

当多个线程同时访问一段同步代码时，这些线程会被方法一个EntryList集合当中，处于阻塞状态的线程都会被方法该列表中。接下来，当线程获取到对象的Monitor时，Monitor是依赖于底层操作系统的mutex lock（互斥锁）来实现互斥的，线程获取mutex成功，则会持有mutex，这时其他线程就无法再获取到该mutex。

如果线程调用了wait方法，那么该线程就会释放掉所持有的mutex，并且该线程会进入到WaitSet集合（等待集合）中，等待下一次被其他线程调用notify/notifyAll唤醒。如果当前线程顺利执行完毕方法，那么它也会释放掉所持有的mutex。

同步锁再这种实现方式当中，因为Monitor是依赖于底层的操作系统实现，因此存在用户态与内核态之间的切换，所以会增加性能开销，通过对象互斥锁的概念来保证共享数据操作的完整性。每个对象都对应于一个可称为互斥锁的标记，这个标记用于保证在任何时刻，只能有一个线程访问该对象。

那些处于EntryList与WaitSet中的线程均处于阻塞状态，阻塞操作是由操作系统来完成的，在linux下是通过pthread_ mutex_lock函数实现的。线程被阻塞之后便会进入到内核调度方法，这会导致系统在用户态与内核态之间来回切换，严重影响锁的性能。

解决上述问题的办法便是自旋（Spin），其原理是：当发生对Monitor的争用时，如果Owner能够在很短的时间内释放掉锁，则那些正在争用的线程就是稍微等待一下（即自旋），在Owner线程释放锁之后，争用线程就有可能会立刻获取到锁，从而避免了系统阻塞。不过，当Owner运行的时间超过了临界值后，争用线程自旋一段时间后依然无法获取到锁，这时争用线程则会停止自旋进入到阻塞状态，所的来说：先自旋，不成功再进入阻塞状态，尽量降低阻塞的可能性，这对那些执行时间很短的代码块来说有极大的性能提升。显然，自旋在多核心处理器上才有意义。

### 互斥锁

互斥锁的属性：

1. PTHREAD_MUTEX_TIME_NP：这是缺省值，也就是普通锁，当一个线程加锁以后，其余请求锁的线程将会形成一个等待队列，并且在解锁后按照优先级获取到锁。这种策略可以确保资源分配的公平性。
2. PTHREAD_MUTEX_RECURSIVE_NP：嵌套锁，允许一个线程对同一个锁成功获取多次，并且通过unlock解锁，如果是不同线程请求，则在加锁线程解锁时重新进行竞争。
3. PTHREAD_MUTEX_ERRORCHECK_NP：检错锁，如果一个线程请求同一个锁，则返回EDEADLK，否则与PTHREAD_MUTEX_TIME_NP类型相同，这样就保证了当不允许多次加锁时出现最简单情况下的死锁。
4. PTHREAD_MUTEX_ADAPTIVE_NP：适应锁，动作最简单的锁类型，仅仅等待解锁后重新竞争。

### Monitor源码分析

接下来我们通过[openjdk](http://hg.openjdk.java.net/jdk8u/jdk8u/hotspot/file/73f624a2488d/src/share/vm/runtime)的源代码来分析Monitor底层的实现。

objectMonitor.hpp（头文件）和objectMonitor.cpp（具体的实现）这两个文件是关于Monitor的底层实现：

```c++
#ifndef SHARE_VM_RUNTIME_OBJECTMONITOR_HPP
#define SHARE_VM_RUNTIME_OBJECTMONITOR_HPP

#include "runtime/os.hpp"
#include "runtime/park.hpp"
#include "runtime/perfData.hpp"

// 阻塞在当前的Monitor上的线程的封装，是一种链表的结构：
class ObjectWaiter : public StackObj {
 public:
  enum TStates { TS_UNDEF, TS_READY, TS_RUN, TS_WAIT, TS_ENTER, TS_CXQ } ;
  enum Sorted  { PREPEND, APPEND, SORTED } ;
  // 前一个ObjectWaiter
  ObjectWaiter * volatile _next;
  // 后一个ObjectWaiter
  ObjectWaiter * volatile _prev;
  Thread*       _thread;
  jlong         _notifier_tid;
  ParkEvent *   _event;
  volatile int  _notified ;
  volatile TStates TState ;
  Sorted        _Sorted ;           // List placement disposition
  bool          _active ;           // Contention monitoring is enabled
 public:
  ObjectWaiter(Thread* thread);

  void wait_reenter_begin(ObjectMonitor *mon);
  void wait_reenter_end(ObjectMonitor *mon);
};

// Monitor对象
class ObjectMonitor {
 public:
  enum {
    OM_OK,                    // no error
    OM_SYSTEM_ERROR,          // operating system error
    OM_ILLEGAL_MONITOR_STATE, // IllegalMonitorStateException
    OM_INTERRUPTED,           // Thread.interrupt()
    OM_TIMED_OUT              // Object.wait() timed out
  };

 public:
  static int header_offset_in_bytes()      { return offset_of(ObjectMonitor, _header);     }
  static int object_offset_in_bytes()      { return offset_of(ObjectMonitor, _object);     }
  static int owner_offset_in_bytes()       { return offset_of(ObjectMonitor, _owner);      }
  static int count_offset_in_bytes()       { return offset_of(ObjectMonitor, _count);      }
  static int recursions_offset_in_bytes()  { return offset_of(ObjectMonitor, _recursions); }
  static int cxq_offset_in_bytes()         { return offset_of(ObjectMonitor, _cxq) ;       }
  static int succ_offset_in_bytes()        { return offset_of(ObjectMonitor, _succ) ;      }
  static int EntryList_offset_in_bytes()   { return offset_of(ObjectMonitor, _EntryList);  }
  static int FreeNext_offset_in_bytes()    { return offset_of(ObjectMonitor, FreeNext);    }
  static int WaitSet_offset_in_bytes()     { return offset_of(ObjectMonitor, _WaitSet) ;   }
  static int Responsible_offset_in_bytes() { return offset_of(ObjectMonitor, _Responsible);}
  static int Spinner_offset_in_bytes()     { return offset_of(ObjectMonitor, _Spinner);    }

 public:
  static int (*SpinCallbackFunction)(intptr_t, int) ;
  static intptr_t SpinCallbackArgument ;


 public:
  markOop   header() const;
  void      set_header(markOop hdr);

  intptr_t is_busy() const {
    return _count|_waiters|intptr_t(_owner)|intptr_t(_cxq)|intptr_t(_EntryList ) ;
  }

  intptr_t  is_entered(Thread* current) const;

  void*     owner() const;
  void      set_owner(void* owner);

  intptr_t  waiters() const;

  intptr_t  count() const;
  void      set_count(intptr_t count);
  intptr_t  contentions() const ;
  intptr_t  recursions() const                                         { return _recursions; }

  // JVM/DI GetMonitorInfo() needs this
  ObjectWaiter* first_waiter()                                         { return _WaitSet; }
  ObjectWaiter* next_waiter(ObjectWaiter* o)                           { return o->_next; }
  Thread* thread_of_waiter(ObjectWaiter* o)                            { return o->_thread; }

  // 初始化Monitor对象，除了semaphore都是简单的对象或者指针
  ObjectMonitor() {
    _header       = NULL;
    _count        = 0;
    _waiters      = 0,
    _recursions   = 0;
    _object       = NULL;
    _owner        = NULL;
    // 等待集合
    _WaitSet      = NULL;
    _WaitSetLock  = 0 ;
    _Responsible  = NULL ;
    _succ         = NULL ;
    _cxq          = NULL ;
    FreeNext      = NULL ;
     // 等待集合
    _EntryList    = NULL ;
    _SpinFreq     = 0 ;
    _SpinClock    = 0 ;
    OwnerIsThread = 0 ;
    _previous_owner_tid = 0;
  }

  ~ObjectMonitor() {
   // TODO: Add asserts ...
   // _cxq == 0 _succ == NULL _owner == NULL _waiters == 0
   // _count == 0 _EntryList  == NULL etc
  }

private:
  void Recycle () {
    // TODO: add stronger asserts ...
    // _cxq == 0 _succ == NULL _owner == NULL _waiters == 0
    // _count == 0 EntryList  == NULL
    // _recursions == 0 _WaitSet == NULL
    // TODO: assert (is_busy()|_recursions) == 0
    _succ          = NULL ;
    _EntryList     = NULL ;
    _cxq           = NULL ;
    _WaitSet       = NULL ;
    _recursions    = 0 ;
    _SpinFreq      = 0 ;
    _SpinClock     = 0 ;
    OwnerIsThread  = 0 ;
  }

public:

  void*     object() const;
  void*     object_addr();
  void      set_object(void* obj);

  bool      check(TRAPS);       // true if the thread owns the monitor.
  void      check_slow(TRAPS);
  void      clear();
  static void sanity_checks();  // public for -XX:+ExecuteInternalVMTests
                                // in PRODUCT for -XX:SyncKnobs=Verbose=1
#ifndef PRODUCT
  void      verify();
  void      print();
#endif

  bool      try_enter (TRAPS) ;
  void      enter(TRAPS);
  void      exit(bool not_suspended, TRAPS);
  void      wait(jlong millis, bool interruptable, TRAPS);
  void      notify(TRAPS);
  void      notifyAll(TRAPS);

// Use the following at your own risk
  intptr_t  complete_exit(TRAPS);
  void      reenter(intptr_t recursions, TRAPS);

 private:
  void      AddWaiter (ObjectWaiter * waiter) ;
  static    void DeferredInitialize();

  ObjectWaiter * DequeueWaiter () ;
  void      DequeueSpecificWaiter (ObjectWaiter * waiter) ;
  void      EnterI (TRAPS) ;
  void      ReenterI (Thread * Self, ObjectWaiter * SelfNode) ;
  void      UnlinkAfterAcquire (Thread * Self, ObjectWaiter * SelfNode) ;
  int       TryLock (Thread * Self) ;
  int       NotRunnable (Thread * Self, Thread * Owner) ;
  int       TrySpin_Fixed (Thread * Self) ;
  int       TrySpin_VaryFrequency (Thread * Self) ;
  int       TrySpin_VaryDuration  (Thread * Self) ;
  void      ctAsserts () ;
  void      ExitEpilog (Thread * Self, ObjectWaiter * Wakee) ;
  bool      ExitSuspendEquivalent (JavaThread * Self) ;

 private:
  friend class ObjectSynchronizer;
  friend class ObjectWaiter;
  friend class VMStructs;

  // WARNING: this must be the very first word of ObjectMonitor
  // This means this class can't use any virtual member functions.

  volatile markOop   _header;       // displaced object header word - mark
  void*     volatile _object;       // backward object pointer - strong root

  double SharingPad [1] ;           // temp to reduce false sharing

  // All the following fields must be machine word aligned
  // The VM assumes write ordering wrt these fields, which can be
  // read from other threads.
 // 锁的持有者
 protected:                         // protected for jvmtiRawMonitor
  void *  volatile _owner;          // pointer to owning thread OR BasicLock
  volatile jlong _previous_owner_tid; // thread id of the previous owner of the monitor
  volatile intptr_t  _recursions;   // recursion count, 0 for first entry
 private:
  int OwnerIsThread ;               // _owner is (Thread *) vs SP/BasicLock
  ObjectWaiter * volatile _cxq ;    // LL of recently-arrived threads blocked on entry.
                                    // The list is actually composed of WaitNodes, acting
 // 没获取到锁的线程                                   // as proxies for Threads.
 protected:
  ObjectWaiter * volatile _EntryList ;     // Threads blocked on entry or reentry.
 private:
  Thread * volatile _succ ;          // Heir presumptive thread - used for futile wakeup throttling
  Thread * volatile _Responsible ;
  int _PromptDrain ;                // rqst to drain cxq into EntryList ASAP

  volatile int _Spinner ;           // for exit->spinner handoff optimization
  volatile int _SpinFreq ;          // Spin 1-out-of-N attempts: success rate
  volatile int _SpinClock ;
  volatile int _SpinDuration ;
  volatile intptr_t _SpinState ;    // MCS/CLH list of spinners

  // TODO-FIXME: _count, _waiters and _recursions should be of
  // type int, or int32_t but not intptr_t.  There's no reason
  // to use 64-bit fields for these variables on a 64-bit JVM.

  volatile intptr_t  _count;        // reference count to prevent reclaimation/deflation
                                    // at stop-the-world time.  See deflate_idle_monitors().
                                    // _count is approximately |_WaitSet| + |_EntryList|
 protected:
  volatile intptr_t  _waiters;      // number of waiting threads
 private:
    // 等待集合定义
 protected:
  ObjectWaiter * volatile _WaitSet; // LL of threads wait()ing on the monitor
    // 等待队列,简单的自旋锁
 private:
  volatile int _WaitSetLock;        // protects Wait Queue - simple spinlock

 public:
  int _QMix ;                       // Mixed prepend queue discipline
  ObjectMonitor * FreeNext ;        // Free list linkage
  intptr_t StatA, StatsB ;

 public:
  static void Initialize () ;
  static PerfCounter * _sync_ContendedLockAttempts ;
  static PerfCounter * _sync_FutileWakeups ;
  static PerfCounter * _sync_Parks ;
  static PerfCounter * _sync_EmptyNotifications ;
  static PerfCounter * _sync_Notifications ;
  static PerfCounter * _sync_SlowEnter ;
  static PerfCounter * _sync_SlowExit ;
  static PerfCounter * _sync_SlowNotify ;
  static PerfCounter * _sync_SlowNotifyAll ;
  static PerfCounter * _sync_FailedSpins ;
  static PerfCounter * _sync_SuccessfulSpins ;
  static PerfCounter * _sync_PrivateA ;
  static PerfCounter * _sync_PrivateB ;
  static PerfCounter * _sync_MonInCirculation ;
  static PerfCounter * _sync_MonScavenged ;
  static PerfCounter * _sync_Inflations ;
  static PerfCounter * _sync_Deflations ;
  static PerfLongVariable * _sync_MonExtant ;

 public:
  static int Knob_Verbose;
  static int Knob_SpinLimit;
  void* operator new (size_t size) throw() {
    return AllocateHeap(size, mtInternal);
  }
  void* operator new[] (size_t size) throw() {
    return operator new (size);
  }
  void operator delete(void* p) {
    FreeHeap(p, mtInternal);
  }
  void operator delete[] (void *p) {
    operator delete(p);
  }
};

#undef TEVENT
#define TEVENT(nom) {if (SyncVerbose) FEVENT(nom); }

#define FEVENT(nom) { static volatile int ctr = 0 ; int v = ++ctr ; if ((v & (v-1)) == 0) { ::printf (#nom " : %d \n", v); ::fflush(stdout); }}

#undef  TEVENT
#define TEVENT(nom) {;}

#endif
```

EntryList、WaitSet采用链表的方式是因为在这个链表中，要根据某一定的规则查找、删除、增加线程比较容易。只有经过wait方法调用的时候，才会进入到WaitSet集合当中。

### wait、notify源码分析

wait方法的实现：

```c++
void ObjectMonitor::wait(jlong millis, bool interruptible, TRAPS) {
   Thread * const Self = THREAD ;
   assert(Self->is_Java_thread(), "Must be Java thread!");
   JavaThread *jt = (JavaThread *)THREAD;

   DeferredInitialize () ;

   // Throw IMSX or IEX.
   CHECK_OWNER();

   EventJavaMonitorWait event;

   // check for a pending interrupt
   if (interruptible && Thread::is_interrupted(Self, true) && !HAS_PENDING_EXCEPTION) {
     // post monitor waited event.  Note that this is past-tense, we are done waiting.
     if (JvmtiExport::should_post_monitor_waited()) {
        // Note: 'false' parameter is passed here because the
        // wait was not timed out due to thread interrupt.
        JvmtiExport::post_monitor_waited(jt, this, false);

        // In this short circuit of the monitor wait protocol, the
        // current thread never drops ownership of the monitor and
        // never gets added to the wait queue so the current thread
        // cannot be made the successor. This means that the
        // JVMTI_EVENT_MONITOR_WAITED event handler cannot accidentally
        // consume an unpark() meant for the ParkEvent associated with
        // this ObjectMonitor.
     }
     if (event.should_commit()) {
       post_monitor_wait_event(&event, this, 0, millis, false);
     }
     TEVENT (Wait - Throw IEX) ;
     THROW(vmSymbols::java_lang_InterruptedException());
     return ;
   }

   TEVENT (Wait) ;

   assert (Self->_Stalled == 0, "invariant") ;
   Self->_Stalled = intptr_t(this) ;
   jt->set_current_waiting_monitor(this);

   // create a node to be put into the queue
   // Critically, after we reset() the event but prior to park(), we must check
   // for a pending interrupt.
   ObjectWaiter node(Self);
   node.TState = ObjectWaiter::TS_WAIT ;
   Self->_ParkEvent->reset() ;
   OrderAccess::fence();          // ST into Event; membar ; LD interrupted-flag

   // Enter the waiting queue, which is a circular doubly linked list in this case
   // but it could be a priority queue or any data structure.
   // _WaitSetLock protects the wait queue.  Normally the wait queue is accessed only
   // by the the owner of the monitor *except* in the case where park()
   // returns because of a timeout of interrupt.  Contention is exceptionally rare
   // so we use a simple spin-lock instead of a heavier-weight blocking lock.

   Thread::SpinAcquire (&_WaitSetLock, "WaitSet - add") ;
    // 将封装好的node对象放到队列中，通过双向链表实现的
   AddWaiter (&node) ;
   Thread::SpinRelease (&_WaitSetLock) ;

   if ((SyncFlags & 4) == 0) {
      _Responsible = NULL ;
   }
   intptr_t save = _recursions; // record the old recursion count
   _waiters++;                  // increment the number of waiters
   _recursions = 0;             // set the recursion level to be 1
    // 释放掉锁
   exit (true, Self) ;                    // exit the monitor
   guarantee (_owner != Self, "invariant") ;

   // The thread is on the WaitSet list - now park() it.
   // On MP systems it's conceivable that a brief spin before we park
   // could be profitable.
   //
   // TODO-FIXME: change the following logic to a loop of the form
   //   while (!timeout && !interrupted && _notified == 0) park()

   int ret = OS_OK ;
   int WasNotified = 0 ;
   { // State transition wrappers
     OSThread* osthread = Self->osthread();
     OSThreadWaitState osts(osthread, true);
     {
       ThreadBlockInVM tbivm(jt);
       // Thread is in thread_blocked state and oop access is unsafe.
       jt->set_suspend_equivalent();

       if (interruptible && (Thread::is_interrupted(THREAD, false) || HAS_PENDING_EXCEPTION)) {
           // Intentionally empty
       } else
       if (node._notified == 0) {
         if (millis <= 0) {
            Self->_ParkEvent->park () ;
         } else {
            ret = Self->_ParkEvent->park (millis) ;
         }
       }

       // were we externally suspended while we were waiting?
       if (ExitSuspendEquivalent (jt)) {
          // TODO-FIXME: add -- if succ == Self then succ = null.
          jt->java_suspend_self();
       }

     } // Exit thread safepoint: transition _thread_blocked -> _thread_in_vm


     // Node may be on the WaitSet, the EntryList (or cxq), or in transition
     // from the WaitSet to the EntryList.
     // See if we need to remove Node from the WaitSet.
     // We use double-checked locking to avoid grabbing _WaitSetLock
     // if the thread is not on the wait queue.
     //
     // Note that we don't need a fence before the fetch of TState.
     // In the worst case we'll fetch a old-stale value of TS_WAIT previously
     // written by the is thread. (perhaps the fetch might even be satisfied
     // by a look-aside into the processor's own store buffer, although given
     // the length of the code path between the prior ST and this load that's
     // highly unlikely).  If the following LD fetches a stale TS_WAIT value
     // then we'll acquire the lock and then re-fetch a fresh TState value.
     // That is, we fail toward safety.

     if (node.TState == ObjectWaiter::TS_WAIT) {
         Thread::SpinAcquire (&_WaitSetLock, "WaitSet - unlink") ;
         if (node.TState == ObjectWaiter::TS_WAIT) {
            DequeueSpecificWaiter (&node) ;       // unlink from WaitSet
            assert(node._notified == 0, "invariant");
            node.TState = ObjectWaiter::TS_RUN ;
         }
         Thread::SpinRelease (&_WaitSetLock) ;
     }

     // The thread is now either on off-list (TS_RUN),
     // on the EntryList (TS_ENTER), or on the cxq (TS_CXQ).
     // The Node's TState variable is stable from the perspective of this thread.
     // No other threads will asynchronously modify TState.
     guarantee (node.TState != ObjectWaiter::TS_WAIT, "invariant") ;
     OrderAccess::loadload() ;
     if (_succ == Self) _succ = NULL ;
     WasNotified = node._notified ;

     // Reentry phase -- reacquire the monitor.
     // re-enter contended monitor after object.wait().
     // retain OBJECT_WAIT state until re-enter successfully completes
     // Thread state is thread_in_vm and oop access is again safe,
     // although the raw address of the object may have changed.
     // (Don't cache naked oops over safepoints, of course).

     // post monitor waited event. Note that this is past-tense, we are done waiting.
     if (JvmtiExport::should_post_monitor_waited()) {
       JvmtiExport::post_monitor_waited(jt, this, ret == OS_TIMEOUT);

       if (node._notified != 0 && _succ == Self) {
         // In this part of the monitor wait-notify-reenter protocol it
         // is possible (and normal) for another thread to do a fastpath
         // monitor enter-exit while this thread is still trying to get
         // to the reenter portion of the protocol.
         //
         // The ObjectMonitor was notified and the current thread is
         // the successor which also means that an unpark() has already
         // been done. The JVMTI_EVENT_MONITOR_WAITED event handler can
         // consume the unpark() that was done when the successor was
         // set because the same ParkEvent is shared between Java
         // monitors and JVM/TI RawMonitors (for now).
         //
         // We redo the unpark() to ensure forward progress, i.e., we
         // don't want all pending threads hanging (parked) with none
         // entering the unlocked monitor.
         node._event->unpark();
       }
     }

     if (event.should_commit()) {
       post_monitor_wait_event(&event, this, node._notifier_tid, millis, ret == OS_TIMEOUT);
     }

     OrderAccess::fence() ;

     assert (Self->_Stalled != 0, "invariant") ;
     Self->_Stalled = 0 ;

     assert (_owner != Self, "invariant") ;
     ObjectWaiter::TStates v = node.TState ;
     if (v == ObjectWaiter::TS_RUN) {
         enter (Self) ;
     } else {
         guarantee (v == ObjectWaiter::TS_ENTER || v == ObjectWaiter::TS_CXQ, "invariant") ;
         ReenterI (Self, &node) ;
         node.wait_reenter_end(this);
     }

     // Self has reacquired the lock.
     // Lifecycle - the node representing Self must not appear on any queues.
     // Node is about to go out-of-scope, but even if it were immortal we wouldn't
     // want residual elements associated with this thread left on any lists.
     guarantee (node.TState == ObjectWaiter::TS_RUN, "invariant") ;
     assert    (_owner == Self, "invariant") ;
     assert    (_succ != Self , "invariant") ;
   } // OSThreadWaitState()

   jt->set_current_waiting_monitor(NULL);

   guarantee (_recursions == 0, "invariant") ;
   _recursions = save;     // restore the old recursion count
   _waiters--;             // decrement the number of waiters

   // Verify a few postconditions
   assert (_owner == Self       , "invariant") ;
   assert (_succ  != Self       , "invariant") ;
   assert (((oop)(object()))->mark() == markOopDesc::encode(this), "invariant") ;

   if (SyncFlags & 32) {
      OrderAccess::fence() ;
   }

   // check if the notification happened
   if (!WasNotified) {
     // no, it could be timeout or Thread.interrupt() or both
     // check for interrupt event, otherwise it is timeout
     if (interruptible && Thread::is_interrupted(Self, true) && !HAS_PENDING_EXCEPTION) {
       TEVENT (Wait - throw IEX from epilog) ;
       THROW(vmSymbols::java_lang_InterruptedException());
     }
   }

   // NOTE: Spurious wake up will be consider as timeout.
   // Monitor notify has precedence over thread interrupt.
}
```

notify方法的实现：

```c++
void ObjectMonitor::notify(TRAPS) {
  CHECK_OWNER();
    // 等待集合为空
  if (_WaitSet == NULL) {
     TEVENT (Empty-Notify) ;
     return ;
  }
  DTRACE_MONITOR_PROBE(notify, this, object(), THREAD);
	// 不同的调度策略（具体唤醒哪一个线程），使用调度策略将这个ObjectWaiter放置到EntryList
  int Policy = Knob_MoveNotifyee ;

  Thread::SpinAcquire (&_WaitSetLock, "WaitSet - notify") ;
  ObjectWaiter * iterator = DequeueWaiter() ;
  if (iterator != NULL) {
     TEVENT (Notify1 - Transfer) ;
     guarantee (iterator->TState == ObjectWaiter::TS_WAIT, "invariant") ;
     guarantee (iterator->_notified == 0, "invariant") ;
     if (Policy != 4) {
        iterator->TState = ObjectWaiter::TS_ENTER ;
     }
     iterator->_notified = 1 ;
     Thread * Self = THREAD;
     iterator->_notifier_tid = JFR_THREAD_ID(Self);

     ObjectWaiter * List = _EntryList ;
     if (List != NULL) {
        assert (List->_prev == NULL, "invariant") ;
        assert (List->TState == ObjectWaiter::TS_ENTER, "invariant") ;
        assert (List != iterator, "invariant") ;
     }

     if (Policy == 0) {       // prepend to EntryList
         if (List == NULL) {
             iterator->_next = iterator->_prev = NULL ;
             _EntryList = iterator ;
         } else {
             List->_prev = iterator ;
             iterator->_next = List ;
             iterator->_prev = NULL ;
             _EntryList = iterator ;
        }
     } else
     if (Policy == 1) {      // append to EntryList
         if (List == NULL) {
             iterator->_next = iterator->_prev = NULL ;
             _EntryList = iterator ;
         } else {
            // CONSIDER:  finding the tail currently requires a linear-time walk of
            // the EntryList.  We can make tail access constant-time by converting to
            // a CDLL instead of using our current DLL.
            ObjectWaiter * Tail ;
            for (Tail = List ; Tail->_next != NULL ; Tail = Tail->_next) ;
            assert (Tail != NULL && Tail->_next == NULL, "invariant") ;
            Tail->_next = iterator ;
            iterator->_prev = Tail ;
            iterator->_next = NULL ;
        }
     } else
     if (Policy == 2) {      // prepend to cxq
         // prepend to cxq
         if (List == NULL) {
             iterator->_next = iterator->_prev = NULL ;
             _EntryList = iterator ;
         } else {
            iterator->TState = ObjectWaiter::TS_CXQ ;
            for (;;) {
                ObjectWaiter * Front = _cxq ;
                iterator->_next = Front ;
                if (Atomic::cmpxchg_ptr (iterator, &_cxq, Front) == Front) {
                    break ;
                }
            }
         }
     } else
     if (Policy == 3) {      // append to cxq
        iterator->TState = ObjectWaiter::TS_CXQ ;
        for (;;) {
            ObjectWaiter * Tail ;
            Tail = _cxq ;
            if (Tail == NULL) {
                iterator->_next = NULL ;
                if (Atomic::cmpxchg_ptr (iterator, &_cxq, NULL) == NULL) {
                   break ;
                }
            } else {
                while (Tail->_next != NULL) Tail = Tail->_next ;
                Tail->_next = iterator ;
                iterator->_prev = Tail ;
                iterator->_next = NULL ;
                break ;
            }
        }
     } else {
        ParkEvent * ev = iterator->_event ;
        iterator->TState = ObjectWaiter::TS_RUN ;
        OrderAccess::fence() ;
        ev->unpark() ;
     }

     if (Policy < 4) {
       iterator->wait_reenter_begin(this);
     }

     // _WaitSetLock protects the wait queue, not the EntryList.  We could
     // move the add-to-EntryList operation, above, outside the critical section
     // protected by _WaitSetLock.  In practice that's not useful.  With the
     // exception of  wait() timeouts and interrupts the monitor owner
     // is the only thread that grabs _WaitSetLock.  There's almost no contention
     // on _WaitSetLock so it's not profitable to reduce the length of the
     // critical section.
  }

  Thread::SpinRelease (&_WaitSetLock) ;

  if (iterator != NULL && ObjectMonitor::_sync_Notifications != NULL) {
     ObjectMonitor::_sync_Notifications->inc() ;
  }
}
```

### 锁升级与偏向锁

随着JDK版本的不断更迭，底层对于synchronized关键字的实现方式也不断地在进行调整。在JDK1.5之前，要实现线程同步，只能通过synchronized关键字来实现，Java底层也是通过synchronized关键字来做到数据的原子性维护，synchronized关键字是JVM实现的一种内置锁，从底层角度来说，这种锁的获取与释放都是由JVM帮助我们隐式实现的。从JDK1.5开始，并发包引入了Lock锁，Lock同步锁是基于Java来实现的，因此锁的获取与释放都是通过Java代码来实现与控制的，synchronized是基于底层操作系统Mutex Lock来实现的，每次对锁的获取与释放动作都会带来用户态与内核态之间的切换，这种切换会极大的增加系统的负担。在并发量较高时，也就是说锁的竞争比较激烈的时候，synchronized锁在性能上的表现就非常差。

从JDK1.6开始，synchronized锁的实现发生了很大的变化，JVM引入了相应的优化手段来提升synchronized锁的性能，这种提升涉及到偏向锁、轻量级锁、重量级锁等，从而减少锁的竞争锁带来的用户态与内核态之前的切换，这种锁的优化是通过Java对象头中的一些标志位来去实现的。对于锁的访问与改变，实际上都与Java对象头息息相关。

从JDK1.6开始，对象实例在堆当中会被划分为三个组成部分：对象头、实例数据与对齐填充。

对象头主要由3块内容来构成：

1. Mark Word 
2. 指向类的指针
3. 数组的长度

其中Mark Word （它记录了对象、锁及垃圾回收相关的信息，在64位的JVM中，其长度也是64bit）的位信息包括了如下的组成部分：

1. 无锁标记
2. 偏向锁标记
3. 轻量级锁标记
4. 重量级锁标记
5. GC标记

对于synchronized锁来说，锁的升级主要是通过Mark Word中的锁的标志位与是否是偏向锁标志位来达成的；synchronized关键字锁对应的锁都是从偏向锁开始，随着锁竞争的不断升级，逐步演化至轻量级锁，最后则变成了重量级锁。

对于锁的演化来说，它会经历如下阶段：

无锁 -> 偏向锁 -> 轻量级锁 -> 重量级锁

偏向锁：针对于一个线程来说，它的作用就是优化同一个线程多次获取一个锁的情况；如果一个synchronized方法被一个线程访问，那么这个方法所在的对象就会在其Mark Word中将偏向锁进行标记，同时还会有一个字段来存储该线程的ID；当这个线程再次访问同一个synchronized方法时，它会检查这个对象的Mark Word的偏向锁标记以及是否指向了其线程ID，如果是的话，那么该线程就无需进行管程（Monitor）了，而是直接进入到该方法体中。如果是另外一个线程访问这个synchronized方法，那么偏向锁的标记就会被去掉。

轻量级锁：若第一个线程已经获取到了当前对象的锁，这是第二个线程又开始尝试争抢该对象的锁，由于该对象的锁已经被第一个线程获取到，因此它是偏向锁，而第二个线程在争抢时，会发现该对象头中的Mark Word已经是偏向锁，但里面存储的线程ID不是自己（第一个线程），那么它会进行CAS（Compare and Swap），从而获取到锁，这里面存在两种情况：

1. 获取锁成功，那么它会直接将Mark Word中的线程ID由第一个线程变成自己（偏向锁标记位保持不变），这样该对象依然会保持偏向锁的状态
2. 获取锁失败，表示这时可能会有多个线程同时在尝试争抢该对象的锁，那么这时偏向锁会进行升级，升级为轻量级锁

自旋锁：若自旋失败（依然无法获取到锁），那么锁就会转化为重量级锁，在这种情况下，无法获取到锁的线程都会进入到Monitor（即内核态）。自旋最大的一个特点就是避免了线程从用户态进入到内核态。

重量级锁：线程最终从用户态进入到了内核态。

### 锁粗化与锁消除

```java
public class MyTest5 {
    private Object object = new Object();

    public void method() {
        synchronized (object) {
            System.out.println("hello world");
        }
    }
}
```

编译器对于锁的优化措施：JIT编译器（Just In Time编译器）可以在动态编译同步代码时，使用一种叫做逃逸分析的技术，来通过该项技术判别程序中所使用的锁对象是否只被一个线程所使用，而没有散布到其他线程当中，如果情况就是这样的话，那么JIT编译器在编译这个同步代码时就不会生成synchronized关键字所标识的锁的申请与释放机器码，从而消除了锁的使用流程，这就是锁的消除。

```java
public class MyTest6 {
    public void method() {
        Object object = new Object();
        synchronized (object) {
            System.out.println("hello world");
        }

        synchronized (object) {
            System.out.println("welcome");
        }

        synchronized (object) {
            System.out.println("person");
        }
    }
}
```

如果object是成员变量：

```java
public class MyTest6 {
    Object object = new Object();
    
    public void method() {
        synchronized (object) {
            System.out.println("hello world");
        }

        synchronized (object) {
            System.out.println("welcome");
        }

        synchronized (object) {
            System.out.println("person");
        }
    }
}
```

这种情况下就发生了：锁粗化，JIT编译器在执行动态编译时，若发现前后相邻的synchronized块使用的是同一个锁对象，那么它就会把这几个synchronized块合并为一个较大的同步块，这样做的好处在于线程在执行这些代码的时候，就无需频繁的申请与释放锁了，从而达到申请与释放锁一次，就可以执行完全部的同步代码块，从而提升了性能。

### 死锁及死锁检测

- 死锁：线程1等待线程2互斥持有的资源，而线程2也在等待线程1互斥持有的资源，两个线程都无法继续执行；
- 活锁：线程持续重试一个总是失败的操作，导致无法继续执行；
- 饿死：线程一直被调度器延迟访问其赖以执行的资源，也许是调度器先于低优先级的线程而执行高优先级的线程，同时总是会有一个高优先级的线程可以执行，饿死也叫做无限延迟。

首先来看一下可能会发生死锁的情况：

```java
public class MyTest7 {
    private Object lock1 = new Object();
    private Object lock2 = new Object();

    public void method1() {
        synchronized (lock1) {
            synchronized (lock2) {
                System.out.println("myMethod1 invoked");
            }
        }
    }

    public void method2() {
        synchronized (lock2) {
            synchronized (lock1) {
                System.out.println("myMethod2 invoked");
            }
        }
    }

    public static void main(String[] args) {
        MyTest7 myTest7 = new MyTest7();
        Runnable runnable1 = () -> {
            while (true) {
                myTest7.method1();
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };
        Thread thread1 = new Thread(runnable1, "myThread1");

        Runnable runnable2 = () -> {
            while (true) {
                myTest7.method2();
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };
        Thread thread2 = new Thread(runnable2, "myThread2");
        thread1.start();
        thread2.start();
    }
}
```

程序在运行一段时间之后就发生死锁的现象，发生死锁之后可以使用JVM自带的一些工具来进行检测。

首先是jvisualvm:

![1605541454922](./assets/1605541454922.png)

可以看到，已经检测到死锁的情况，点击线程Dump可以查看详情。

![1605541658677](./assets/1605541658677.png)

除了使用可视化界面之外，也可以使用命令行的工具来进行检测死锁：

```shell
D:\code\java8\jyc>jps -l
9104
12212 concurrency2.MyTest7
11656 org.jetbrains.idea.maven.server.RemoteMavenServer
16428 org.gradle.launcher.daemon.bootstrap.GradleDaemon
3468 sun.tools.jps.Jps
```

可以看到运行我们程序的进行号为12212，继续使用jstack来查看当前线程的执行详情：

```shell
D:\code\java8\jyc>jstack 12212
2020-11-16 23:50:41
Full thread dump Java HotSpot(TM) 64-Bit Server VM (25.212-b10 mixed mode):

"JMX server connection timeout 18" #18 daemon prio=5 os_prio=0 tid=0x0000000019fca800 nid=0x25ec in Object.wait() [0x000000001b9de000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
        at java.lang.Object.wait(Native Method)
        at com.sun.jmx.remote.internal.ServerCommunicatorAdmin$Timeout.run(ServerCommunicatorAdmin.java:168)
        - locked <0x00000000d8408178> (a [I)
        at java.lang.Thread.run(Thread.java:748)

"RMI Scheduler(0)" #17 daemon prio=5 os_prio=0 tid=0x0000000019fc9800 nid=0x36a0 waiting on condition [0x000000001b8df000]
   java.lang.Thread.State: TIMED_WAITING (parking)
        at sun.misc.Unsafe.park(Native Method)
        - parking to wait for  <0x00000000d8410188> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
        at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
        at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
        at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1093)
        at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
        at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
        at java.lang.Thread.run(Thread.java:748)

"RMI TCP Accept-0" #15 daemon prio=5 os_prio=0 tid=0x0000000019f5f000 nid=0x4270 runnable [0x000000001b6df000]
   java.lang.Thread.State: RUNNABLE
        at java.net.DualStackPlainSocketImpl.accept0(Native Method)
        at java.net.DualStackPlainSocketImpl.socketAccept(DualStackPlainSocketImpl.java:131)
        at java.net.AbstractPlainSocketImpl.accept(AbstractPlainSocketImpl.java:409)
        at java.net.PlainSocketImpl.accept(PlainSocketImpl.java:199)
        - locked <0x00000000d84182b0> (a java.net.SocksSocketImpl)
        at java.net.ServerSocket.implAccept(ServerSocket.java:545)
        at java.net.ServerSocket.accept(ServerSocket.java:513)
        at sun.management.jmxremote.LocalRMIServerSocketFactory$1.accept(LocalRMIServerSocketFactory.java:52)
        at sun.rmi.transport.tcp.TCPTransport$AcceptLoop.executeAcceptLoop(TCPTransport.java:405)
        at sun.rmi.transport.tcp.TCPTransport$AcceptLoop.run(TCPTransport.java:377)
        at java.lang.Thread.run(Thread.java:748)

"DestroyJavaVM" #13 prio=5 os_prio=0 tid=0x0000000002a6e000 nid=0x19c0 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

"myThread2" #12 prio=5 os_prio=0 tid=0x000000001a17e000 nid=0x3290 waiting for monitor entry [0x000000001b58f000]
   java.lang.Thread.State: BLOCKED (on object monitor)
        at concurrency2.MyTest7.method2(MyTest7.java:23)
        - waiting to lock <0x00000000d84202f0> (a java.lang.Object)
        - locked <0x00000000d8420300> (a java.lang.Object)
        at concurrency2.MyTest7.lambda$main$1(MyTest7.java:44)
        at concurrency2.MyTest7$$Lambda$2/1418481495.run(Unknown Source)
        at java.lang.Thread.run(Thread.java:748)

"myThread1" #11 prio=5 os_prio=0 tid=0x000000001a17d800 nid=0x3b8c waiting for monitor entry [0x000000001b48f000]
   java.lang.Thread.State: BLOCKED (on object monitor)
        at concurrency2.MyTest7.method1(MyTest7.java:15)
        - waiting to lock <0x00000000d8420300> (a java.lang.Object)
        - locked <0x00000000d84202f0> (a java.lang.Object)
        at concurrency2.MyTest7.lambda$main$0(MyTest7.java:32)
        at concurrency2.MyTest7$$Lambda$1/471910020.run(Unknown Source)
        at java.lang.Thread.run(Thread.java:748)

"Service Thread" #10 daemon prio=9 os_prio=0 tid=0x0000000019ebf000 nid=0x3194 runnable [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

"C1 CompilerThread3" #9 daemon prio=9 os_prio=2 tid=0x0000000019e28800 nid=0x48c0 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

"C2 CompilerThread2" #8 daemon prio=9 os_prio=2 tid=0x0000000019e28000 nid=0x219c waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

"C2 CompilerThread1" #7 daemon prio=9 os_prio=2 tid=0x0000000019e26800 nid=0x39c waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

"C2 CompilerThread0" #6 daemon prio=9 os_prio=2 tid=0x0000000019e1f800 nid=0x22c waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

"Attach Listener" #5 daemon prio=5 os_prio=2 tid=0x0000000019e1d800 nid=0x898 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

"Signal Dispatcher" #4 daemon prio=9 os_prio=2 tid=0x0000000019e1c800 nid=0x3174 runnable [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

"Finalizer" #3 daemon prio=8 os_prio=1 tid=0x0000000019db1000 nid=0x40e4 in Object.wait() [0x000000001a38e000]
   java.lang.Thread.State: WAITING (on object monitor)
        at java.lang.Object.wait(Native Method)
        at java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:144)
        - locked <0x00000000d84385e8> (a java.lang.ref.ReferenceQueue$Lock)
        at java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:165)
        at java.lang.ref.Finalizer$FinalizerThread.run(Finalizer.java:216)

"Reference Handler" #2 daemon prio=10 os_prio=2 tid=0x0000000019db0800 nid=0x23e4 in Object.wait() [0x000000001a28e000]
   java.lang.Thread.State: WAITING (on object monitor)
        at java.lang.Object.wait(Native Method)
        at java.lang.Object.wait(Object.java:502)
        at java.lang.ref.Reference.tryHandlePending(Reference.java:191)
        - locked <0x00000000d8430758> (a java.lang.ref.Reference$Lock)
        at java.lang.ref.Reference$ReferenceHandler.run(Reference.java:153)

"VM Thread" os_prio=2 tid=0x0000000017fb8800 nid=0x1f84 runnable

"GC task thread#0 (ParallelGC)" os_prio=0 tid=0x0000000003008000 nid=0x2d74 runnable

"GC task thread#1 (ParallelGC)" os_prio=0 tid=0x0000000003009800 nid=0x5374 runnable

"GC task thread#2 (ParallelGC)" os_prio=0 tid=0x000000000300b000 nid=0x21ec runnable

"GC task thread#3 (ParallelGC)" os_prio=0 tid=0x000000000300c800 nid=0x4064 runnable

"GC task thread#4 (ParallelGC)" os_prio=0 tid=0x000000000300f000 nid=0x234c runnable

"GC task thread#5 (ParallelGC)" os_prio=0 tid=0x0000000003011000 nid=0x2ea8 runnable

"GC task thread#6 (ParallelGC)" os_prio=0 tid=0x0000000003014000 nid=0x14a0 runnable

"GC task thread#7 (ParallelGC)" os_prio=0 tid=0x0000000003015800 nid=0x39d4 runnable

"VM Periodic Task Thread" os_prio=2 tid=0x0000000019ed4000 nid=0x1d40 waiting on condition

JNI global references: 232

# 找到一个Java级别的死锁
Found one Java-level deadlock:
=============================
"myThread2":
  waiting to lock monitor 0x00000000030ee6c8 (object 0x00000000d84202f0, a java.lang.Object),
  which is held by "myThread1"
"myThread1":
  waiting to lock monitor 0x00000000030ed228 (object 0x00000000d8420300, a java.lang.Object),
  which is held by "myThread2"

Java stack information for the threads listed above:
===================================================
"myThread2":
        at concurrency2.MyTest7.method2(MyTest7.java:23)
        - waiting to lock <0x00000000d84202f0> (a java.lang.Object)
        - locked <0x00000000d8420300> (a java.lang.Object)
        at concurrency2.MyTest7.lambda$main$1(MyTest7.java:44)
        at concurrency2.MyTest7$$Lambda$2/1418481495.run(Unknown Source)
        at java.lang.Thread.run(Thread.java:748)
"myThread1":
        at concurrency2.MyTest7.method1(MyTest7.java:15)
        - waiting to lock <0x00000000d8420300> (a java.lang.Object)
        - locked <0x00000000d84202f0> (a java.lang.Object)
        at concurrency2.MyTest7.lambda$main$0(MyTest7.java:32)
        at concurrency2.MyTest7$$Lambda$1/471910020.run(Unknown Source)
        at java.lang.Thread.run(Thread.java:748)

Found 1 deadlock.
```

# concurrent并发包

## Lock

### 锁的机制与原理

Lock是非常重要的顶级接口，接下来我们阅读一下关于它的说明：

```txt
Lock implementations provide more extensive locking operations than can be obtained using synchronized 
methods and statements. They allow more flexible structuring, may have quite different properties, and 
may support multiple associated Condition objects.
```

Lock实现了要比使用synchronized关键字修饰的方法及语句用途更为广泛的锁的操作，它们支持更为灵活的结构化，拥有很多不同的属性，支持多种相关联的Condition对象。

```txt
A lock is a tool for controlling access to a shared resource by multiple threads. Commonly, a lock 
provides exclusive access to a shared resource: only one thread at a time can acquire the lock and all 
access to the shared resource requires that the lock be acquired first. However, some locks may allow 
concurrent access to a shared resource, such as the read lock of a ReadWriteLock.
```

锁是一种多个线程对于一个共享资源的访问，通常情况下，一个锁会对共享资源提供一种排它性的访问，这意味着在同一个时刻，只能有一个线程获取到锁，其他线程必须要先获取到锁才能访问共享资源。然而，某些锁可以对于共享资源的并发访问，比如读锁中的ReadWriteLock（读写锁）。

```txt
The use of synchronized methods or statements provides access to the implicit monitor lock associated 
with every object, but forces all lock acquisition and release to occur in a block-structured way: when 
multiple locks are acquired they must be released in the opposite order, and all locks must be released 
in the same lexical scope in which they were acquired.
```

使用synchronized方法或者synchronized代码块提供了对于每一个对象的所关联的隐式的monitor对象的访问，但是它会强制所有锁的获取和释放都发生在块结构的方式中，当多个锁被获取的时候，必须要以相反的顺序释放，而且所有的锁必须以获取的相同的作用域释放掉。

```txt
While the scoping mechanism for synchronized methods and statements makes it much easier to program with monitor locks, and helps avoid many common programming errors involving locks, there are occasions where you need to work with locks in a more flexible way. For example, some algorithms for traversing concurrently accessed data structures require the use of "hand-over-hand" or "chain locking": you acquire the lock of node A, then node B, then release A and acquire C, then release B and acquire D and so on. Implementations of the Lock interface enable the use of such techniques by allowing a lock to be acquired and released in different scopes, and allowing multiple locks to be acquired and released in any order.
```

虽然synchronized方法和代码块的作用域使得我们对于monitor锁的编程更加轻松，而且还会避免与锁相关的编码错误，但是存在一些场景，需要更加灵活的处理锁，比如某些算法需要并发的遍历被访问的数据结构，他们需要需要使用hand-over-hand或者chain locking：你需要首先获取到node A的锁，然后是node B的锁，紧接着释放A，然后获取到C，然后释放掉B，然后获取到D等等，Lock接口的实现使得这种技术的使用成为可能，它可以使得锁的获取和释放不在同一个作用域，也可以不再按照顺序。

```txt
With this increased flexibility comes additional responsibility. The absence of block-structured locking 
removes the automatic release of locks that occurs with synchronized methods and statements. In most 
cases, the following idiom should be used:
```

但是如果我们不使用这种块结构的锁的话，就没法再使用synchronized提供的自动释放锁的功能，在大多数情况下按照如下的方式使用：

```java
Lock l = ...;
 l.lock();
 try {
   // access the resource protected by this lock
 } finally {
   l.unlock();
 }
```

```txt
When locking and unlocking occur in different scopes, care must be taken to ensure that all code that is 
executed while the lock is held is protected by try-finally or try-catch to ensure that the lock is 
released when necessary.
```

当加锁和解锁出现在不同的作用域当中，我们必须要非常小心的确保被执行的所有的代码都是在try-finally 或者try-catch的保护当中，从而保证锁在必要的时候可以被释放掉。

```txt
Lock implementations provide additional functionality over the use of synchronized methods and 
statements by providing a non-blocking attempt to acquire a lock (tryLock()), an attempt to acquire the 
lock that can be interrupted (lockInterruptibly, and an attempt to acquire the lock that can timeout 
(tryLock(long, TimeUnit)).
```

Lock的实现相比于synchronized方法和语句的实现提供了一些额外的功能，它是通过一种非阻塞的方式获取到锁，并且还提供了获取锁的操作是可以被中断的，可以设置锁的超时时间。

```txt
A Lock class can also provide behavior and semantics that is quite different from that of the implicit 
monitor lock, such as guaranteed ordering, non-reentrant usage, or deadlock detection. If an 
implementation provides such specialized semantics then the implementation must document those 
semantics.
```

一个Lock的类还可以提供一些与隐式的monitor锁的完全不同的行为和语义，比如可以确保顺序性、可重入的使用或者死锁检测。如果一种实现实现了这种特殊的语气，那么实现就必须将这个语义清楚的记录下来。

```txt
Note that Lock instances are just normal objects and can themselves be used as the target in a 
synchronized statement. Acquiring the monitor lock of a Lock instance has no specified relationship with
invoking any of the lock methods of that instance. It is recommended that to avoid confusion you never
use Lock instances in this way, except within their own implementation.
```

Lock实例仅仅是一个普通的对象而已，它们本身也可以被synchronized语句修饰，因为每个对象都会有一个与之相关的monitor存在，对于Lock实例对象也不例外，获取到Lock实例的monitor锁，与调用这个Lock方法之间没有什么特殊的关联关系。换言之，我们如果将一个Lock实例作为synchronized使用的对象的话，JVM会获取到Lock实例的monitor对象，它与Lock是两个层面的东西，推荐的做法是避免这种混淆，除了在它们自己的底层实现当中，永远不要通过这种方式使用Lock实例。

```txt
All Lock implementations must enforce the same memory synchronization semantics as provided by the built-in monitor lock, as described in The Java Language Specification (17.4 Memory Model) :
```

所有的Lock的实现都必须强制与内建的monitor锁的内存同步语义是一致的，这一点是在Java语言规范中明确的。

```txt
A successful lock operation has the same memory synchronization effects as a successful Lock action.
A successful unlock operation has the same memory synchronization effects as a successful Unlock action.
```

- 一个成功的加锁的操作与成功的synchronization拥有相同的同步效果
- 一个成功的释放锁的操作与成功的synchronization拥有相同的释放锁的效果

```txt
Unsuccessful locking and unlocking operations, and reentrant locking/unlocking operations, do not require any memory synchronization effects.
```

（可重入的）加锁和释放锁不成功的操作，它们是不要求任何的内存同步的效果的。

```txt
The three forms of lock acquisition (interruptible, non-interruptible, and timed) may differ in their performance 
characteristics, ordering guarantees, or other implementation qualities.
```

获取lock的三种方式（可中断的，非可中断的，基于时间的）在性能上、顺序上的保证还有一些其他的特性上可能有所不同。

```txt
Further, the ability to interrupt the ongoing acquisition of a lock may not be available in a given Lock class. Consequently, 
an implementation is not required to define exactly the same guarantees or semantics for all three forms of lock acquisition, 
nor is it required to support interruption of an ongoing lock acquisition. An implementation is required to clearly document 
the semantics and guarantees provided by each of the locking methods. It must also obey the interruption semantics as defined 
in this interface, to the extent that interruption of lock acquisition is supported: which is either totally, or only on 
method entry.
```

进一步而言，这种能力可以中断锁获取可能不在给定的lock类当中，因此一种实现并不要求精确的定义相同的这种语义针对于这三种实现。

```txt
As interruption generally implies cancellation, and checks for interruption are often infrequent, an implementation can favor 
responding to an interrupt over normal method return. This is true even if it can be shown that the interrupt occurred after 
another action may have unblocked the thread. An implementation should document this behavior.
```

由于中断通常意味着取消，因此检查这个中断通常不是一个频繁的操作，实现可以对一个中断进行响应，而不是等待一个正常的方法的返回。即便中断可能出现在另外一个动作之后有可能解锁这个线程，实现应该将这种行为记录下来。

以上是Lock接口的说明，接下来我们了解一下其中部分的核心方法：

```java
   void lock();
```

方法的说明：

```txt
Acquires the lock.
If the lock is not available then the current thread becomes disabled for thread scheduling purposes and lies dormant until 
the lock has been acquired.
```

该方法用于获取到锁，如果获取不到锁，当前的线程将会无法被用于线程调度，线程会进入睡眠状态，直到获取到锁。

```txt
A Lock implementation may be able to detect erroneous use of the lock, such as an invocation that would cause deadlock, and 
may throw an (unchecked) exception in such circumstances. The circumstances and the exception type must be documented by that
Lock implementation.
```

Lock实现可以检测锁的错误的使用，比如可能导致死锁的调用。

```java
void lockInterruptibly() throws InterruptedException;
```

方法的说明：

```txt
Acquires the lock unless the current thread is interrupted.
Acquires the lock if it is available and returns immediately.
If the lock is not available then the current thread becomes disabled for thread scheduling purposes and lies dormant until one of two things happens:
```

如果当前线程没有被中断就尝试获取到锁。如果锁是可以获取，就会立刻返回。如果这个锁是不可用的，那么当前线程也无法进行调度，而且会陷入到睡眠状态，直到下面两种情况发生：

```txt
The lock is acquired by the current thread; or
Some other thread interrupts the current thread, and interruption of lock acquisition is supported.
```

- 当前线程获取到锁
- 其他的线程中断了当前线程，而且锁获取的过程的是支持的中断的

如果当前线程：

```txt
has its interrupted status set on entry to this method; or
is interrupted while acquiring the lock, and interruption of lock acquisition is supported,
```

- 在这个方法的入口中拥有自己的被中断的状态
- 在获取锁的过程被中断了，并且这种在获取锁的时候的中断是被支持的

那么 InterruptedException 会被抛出，并且当前线程的状态会被清理掉。

```java
 boolean tryLock();
```

方法的说明

```txt
Acquires the lock only if it is free at the time of invocation.
Acquires the lock if it is available and returns immediately with the value true. If the lock is not available then this 
method will return immediately with the value false.
A typical usage idiom for this method would be:
```

调用的时候，只有当可以获取的锁的时候，才获取到锁。如果获取可以获取到锁，就会立刻返回true，如果获取不到，就会立刻返回false，一中典型的使用方式：

```java
Lock lock = ...;
 if (lock.tryLock()) {
   try {
     // manipulate protected state
   } finally {
     lock.unlock();
   }
 } else {
   // perform alternative actions
 }
```

```txt
This usage ensures that the lock is unlocked if it was acquired, and doesn't try to unlock if the lock was not acquired.
```

这种用法可以保证如果锁被获取了，那么锁是会被释放掉的，如果没有获取到锁，就不用去释放锁。

```java
boolean tryLock(long time, TimeUnit unit) throws InterruptedException;
```

这是另外一个重载的方法：

```txt
Acquires the lock if it is free within the given waiting time and the current thread has not been interrupted.
If the lock is available this method returns immediately with the value true. If the lock is not available then the current thread becomes disabled for thread scheduling purposes and lies dormant until one of three things happens:
```

在给定的等待时间之内，如果线程没有被中断并且锁是可以获取的，那么就获取到锁。如果锁拿到了，就会立刻返回true，如果没有获取到，那么线程就无法再进行调度，进入睡眠状态，直到如下三种情况发生：

```txt
The lock is acquired by the current thread; or
Some other thread interrupts the current thread, and interruption of lock acquisition is supported; or
The specified waiting time elapses
```

- 当前线程获取到了锁
- 其他线程中断了当前的线程，并且在锁获取的过程中，中断是被支持的
- 指定的时间到了

如果获取到了锁则立刻返回true，如果当前线程被中断了，并且这种中断是被允许的，那么：

```txt
then InterruptedException is thrown and the current thread's interrupted status is cleared.
If the specified waiting time elapses then the value false is returned. If the time is less than or equal to zero, the method will not wait at all.
```

当前线程就会抛出InterruptedException，并且当前线程的状态也会被清理掉。如果过了指定的时间，那么就会返回false，如果指定时间小于或者等于0，那么这个方法就会做任何的等待。

```java
  void unlock();
```

方法的说明：

```txt
A Lock implementation will usually impose restrictions on which thread can release a lock (typically only the holder of the lock can release it) and may throw an (unchecked) exception if the restriction is violated. Any restrictions and the exception type must be documented by that Lock implementation.
```

该方法用来释放掉锁。

```java
   Condition newCondition();
```

方法的说明：

```txt
Returns a new Condition instance that is bound to this Lock instance.
Before waiting on the condition the lock must be held by the current thread. A call to Condition.await() will atomically release the lock before waiting and re-acquire the lock before the wait returns.
```

它会返回一个新的绑定到当前Lock上的Condition实例，在等待condition之前，当前线程必须持有锁，调用Condition.await()会自动地释放掉锁。

接下来我们看一个有关于锁的使用的实际案例。

  ```java
public class MyTest1 {
    // 可重入锁
    private Lock lock = new ReentrantLock();

    public void myMethod1() {
        try {
            lock.lock();
            System.out.println("myMethod1 invoked");
        } finally {
            // 如果注释掉这行代码，程序仍然可以访问到此线程的锁，即上一行的输出会打印，但myMethod2因为获取不到锁，因此不会执行。
            // lock.unlock();
        }
    }

    public void myMethod2() {
        try {
            lock.lock();
            System.out.println("myMethod2 invoked");
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        MyTest1 myTest1 = new MyTest1();
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 10; ++i) {
                myTest1.myMethod1();
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 10; ++i) {
                myTest1.myMethod2();
                try {
                    Thread.sleep(300);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        t1.start();
        t2.start();
    }
}
  ```

对myMethod2进行一定的改进：

```java
    public void myMethod2() {
        boolean result;
        try {
            lock.tryLock(800, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
```

程序就可以正常的往下执行，可以看出Lock为我们提供了一种更为优雅的方式来获取锁，本小节的最后，我们对于Lock和synchronized关键字的区别进行归纳总结。

1. 锁的获取方式：Lock是通过程序代码的方式由开发者手工获取，而synchronized是通过JVM来获取的（无需开发者干预）。
2. 具体的实现方式：Lock是通过Java代码的方式来实现，synchronized是通过JVM底层来实现（无需开发者关注）。
3. 锁的释放方式：Lock务必通过unlock()方法在finally块中手工释放，synchronized是通过JVM来释放（无需开发者关注）。
4. 锁的具体类型：Lock提供了多种，如公平锁、非公平锁，synchronized与Lock都提供了可重入锁。

### Condition简介

在Lock接口中，有一个方法的返回值是Condition，在之前的例子中，我们可以通过sychronized+wait+notify/notifyAll来实现多个线程之间的协调与通信，整个过程都是由JVM来帮助我们实现的，开发者无需（也无法）了解底层的实现细节，从JDK5开始，并发包提供了Lock，Condition(await与signal/signalAll)来实现多个线程之间的协调与通信，整个过程都是由开发者来控制的，相比于传统的方式，更加的灵活，功能也更加强大。接下来我们就来了解一下这个接口的详细信息。

```txt
Condition factors out the Object monitor methods (wait, notify and notifyAll) into distinct objects to 
give the effect of having multiple wait-sets per object, by combining them with the use of arbitrary 
Lock implementations. Where a Lock replaces the use of synchronized methods and statements, a Condition
replaces the use of the Object monitor methods.
```

Condition本质上类似于Object对象的监控器的方法（wait,notify和notifyAll），可以让各种不同的对象拥有多个等待集合，是通过使用任意的一个Lock的实现将他们组合起来，我们会使用Lock来替代synchronized方法和代码块的使用，Condition来替换Object对象中的监控器方法的使用。

```txt
Conditions (also known as condition queues or condition variables) provide a means for one thread to 
suspend execution (to "wait") until notified by another thread that some state condition may now be 
true. Because access to this shared state information occurs in different threads, it must be protected,
so a lock of some form is associated with the condition. The key property that waiting for a condition
provides is that it atomically releases the associated lock and suspends the current thread, just like 
Object.wait.
```

Conditions(也叫做条件队列或者条件变量)提供了一种让一个线程可以挂起执行（让线程进入等待状态）直到另外一个condition为true的线程通知当前线程的方式，由于对于共享的状态信息的访问是发生在不同的线程当中的，因此它必须受到保护，即Lock就一定要关联到一个某个Condition上面，一个关键的属性是，它会自动的释放掉关联的锁然后挂起当前的线程，就行Object.wait方法一样。

```txt
A Condition instance is intrinsically bound to a lock. To obtain a Condition instance for a particular Lock instance use its newCondition() method.
```

一个Condition实例会被天然的绑定到一个lock上面，要想获得一个特定的Lock实例对应的Condition实例的话，需要使用newCondition()方法。

```txt
As an example, suppose we have a bounded buffer which supports put and take methods. If a take is 
attempted on an empty buffer, then the thread will block until an item becomes available; if a put is 
attempted on a full buffer, then the thread will block until a space becomes available. We would like to 
keep waiting put threads and take threads in separate wait-sets so that we can use the optimization of 
only notifying a single thread at a time when items or spaces become available in the buffer. This can 
be achieved using two Condition instances.
```

举个例子，加我们我们有一个有界的缓冲区，支持put和take方法，如果一个take尝试从空的缓冲区获取元素就会被阻塞，直到缓冲区中有新的元素，如果一个put尝试向一个满的缓冲区中添加元素，这个线程也会被阻塞，直到有可用的空闲空间为止，我们将会让等待的put线程和take线程放置在两个等待集合当中，这样我们就可以在条目存在或者空间存在的时候，只通知一个线程，这个是可以通过使用两个Condition实例来做到的。

```java
   class BoundedBuffer {
     final Lock lock = new ReentrantLock();
     final Condition notFull  = lock.newCondition(); 
     final Condition notEmpty = lock.newCondition(); 
  
     final Object[] items = new Object[100];
     int putptr, takeptr, count;
  
     public void put(Object x) throws InterruptedException {
       lock.lock();
       try {
         while (count == items.length)
           notFull.await();
         items[putptr] = x;
         if (++putptr == items.length) putptr = 0;
         ++count;
         notEmpty.signal();
       } finally {
         lock.unlock();
       }
     }
  
     public Object take() throws InterruptedException {
       lock.lock();
       try {
         while (count == 0)
           notEmpty.await();
         Object x = items[takeptr];
         if (++takeptr == items.length) takeptr = 0;
         --count;
         notFull.signal();
         return x;
       } finally {
         lock.unlock();
       }
     }
   }
```

```txt
A Condition implementation can provide behavior and semantics that is different from that of the Object 
monitor methods, such as guaranteed ordering for notifications, or not requiring a lock to be held when
performing notifications. If an implementation provides such specialized semantics then the 
implementation must document those semantics.
```

Condition实现可以提供与Object的monitor方法是不一样的行为，比如对于通知的确定性的排序，或者在执行通知的时候不要求持有锁，如果某一个实现提供了这样一些专门化的语义，在实现的时候，需要在文档当中记录下来。

```txt
Note that Condition instances are just normal objects and can themselves be used as the target in a 
synchronized statement, and can have their own monitor wait and notification methods invoked. Acquiring
the monitor lock of a Condition instance, or using its monitor methods, has no specified relationship 
with acquiring the Lock associated with that Condition or the use of its waiting and signalling methods. 
It is recommended that to avoid confusion you never use Condition instances in this way, except perhaps
within their own implementation.
```

注意Condition实例仅仅就是一个普通的obeject对象，它们自己也可以使用sychronized代码块当中，并且拥有自己的monitor方法，比如wait和notification方法。使用Condition实例获取锁对象，其中的waiting和signalling方法与monitor对象中的方法是没有任何关系的，推荐的做法是避免这种混淆，永远不应该在除了内部实现的地方外使用这种方式。

```txt
When waiting upon a Condition, a "spurious wakeup" is permitted to occur, in general, as a concession to the underlying 
platform semantics. This has little practical impact on most application programs as a Condition should always be waited upon 
in a loop, testing the state predicate that is being waited for. An implementation is free to remove the possibility of 
spurious wakeups but it is recommended that applications programmers always assume that they can occur and so always wait in a 
loop.
```

当我们在等待一个Condition为真的时候，一个假的唤醒是允许发生的，通常情况下，作为平台的一种底层的语义，这种对于大多数的程序不会产生什么实际的影响，因为Condition总是在一个while循环当中去等待，去测试这个被唤醒的条件是否被满足了。实现可以自由的移除这种假的唤醒的可能性，但是推荐的做法是开发者确保程序总是能够执行的并且总是放在循环当中的。

```txt
The three forms of condition waiting (interruptible, non-interruptible, and timed) may differ in their ease of implementation
on some platforms and in their performance characteristics. In particular, it may be difficult to provide these features and 
maintain specific semantics such as ordering guarantees. Further, the ability to interrupt the actual suspension of the thread 
may not always be feasible to implement on all platforms.
```

三种Condition等待的方式（可中断的、不可中断的、基于时间的）在不同的平台上的实现和性能是不一样的，特别的，我们很难去提供这些特性，并且维护具体的语义，比如说排序的保证，更进一步，这种中断进程的挂起实际是要想在所有平台都实现是难做到非常灵活的。

```txt
Consequently, an implementation is not required to define exactly the same guarantees or semantics for all three forms of 
waiting, nor is it required to support interruption of the actual suspension of the thread
```

因此，一个实现针对于这几种方式的等待并不要求精确的定义相同的语义或者相同的保证，同样的，也不要求线程实际的挂起的中断。

```txt
An implementation is required to clearly document the semantics and guarantees provided by each of the waiting methods, and when an implementation does support interruption of thread suspension then it must obey the interruption semantics as defined in this interface.
```

实现可以被要求清晰的定义这些语义和保证由每一个等待方法，当一个实现并不支持线程中断的话，必须要遵循定义在这个接口中中断的语义。

```txt
As interruption generally implies cancellation, and checks for interruption are often infrequent, an implementation can favor 
responding to an interrupt over normal method return. This is true even if it can be shown that the interrupt occurred after
another action that may have unblocked the thread. An implementation should document this behavior.
```

由于中断通常暗示着一种取消，因此检查这个中断不是一个频繁的操作，实现可以自由决定，它可以去响应中断，而非正常的这种方法返回，即便是中断是发生在另一个动作之后，实现需要把这个行为记录下来。

以上就是Condition类的所有的说明，接下来我们来阅读一下Condition接口中的方法。

```java
void await() throws InterruptedException;
```

方法的说明：

```txt
Causes the current thread to wait until it is signalled or interrupted.
```

这个方法会使得当前线程进入等待状态，直到signal方法被调用或者被中断。

```txt
The lock associated with this Condition is atomically released and the current thread becomes disabled for thread scheduling 
purposes and lies dormant until one of four things happens:
```

调用了await方法之后，与Condition所关联的lock会被自动的释放，当前的线程将无法进行线程调度，并且进入休眠状态，直到下面的四种情况之一发生：

```txt
Some other thread invokes the signal method for this Condition and the current thread happens to be chosen as the thread to be 
awakened; or
Some other thread invokes the signalAll method for this Condition; or
Some other thread interrupts the current thread, and interruption of thread suspension is supported; or
A "spurious wakeup" occurs.
```

- 另外一个线程调用了当前线程的signal方法，并且当前的线程恰好是被选中的线程；
- 另外一个线程调用了signalAll方法；
- 另外一个线程中断了当前的线程，并且线程是可以中断的；
- 虚假唤醒出现了。

```txt
In all cases, before this method can return the current thread must re-acquire the lock associated with this condition. When 
the thread returns it is guaranteed to hold this lock.
```

在以上的四种情况中，在调用了await方法能够返回之前，当前的线程必须要重新获取到与这个condition对应的lock。当线程返回的时候，我们可以保证获取到了lock。

如果当前的线程：

```txt
has its interrupted status set on entry to this method; or
is interrupted while waiting and interruption of thread suspension is supported,
```

- 当前的线程在进入到这个方法的时候，已经设置了中断的状态；
- 等待的时候被中断了，并且线程的中断是支持的。

```txt
then InterruptedException is thrown and the current thread's interrupted status is cleared. It is not specified, in the first
case, whether or not the test for interruption occurs before the lock is released.
```

就会抛出InterruptedException异常，当前线程的状态也会被清理掉，在一种情况下，在释放锁之前，无论是否测试了中断，都是如此。

```txt
The current thread is assumed to hold the lock associated with this Condition when this method is called. It is up to the 
implementation to determine if this is the case and if not, how to respond. Typically, an exception will be thrown (such as 
IllegalMonitorStateException) and the implementation must document that fact.
```

当前线程在调用await方法的时候，被假定要持有与Condition相关联的锁，这个取决于具体的实现是否要满足这种条件，如果不满足，应该如何应对，典型的，可以抛出异常（IllegalMonitorStateException），实现必须要将这个情况记录下来。

```txt
An implementation can favor responding to an interrupt over normal method return in response to a signal. In that case the 
implementation must ensure that the signal is redirected to another waiting thread, if there is one
```

实现也可以选择去响应一个中断而不是通常的方法的返回，在这种情况下，如果有的另外一个线程，实现也必须signal会重定向到另外一个线程。

接下来是awaitUninterruptibly方法：

```java
  void awaitUninterruptibly();
```

awaitUninterruptibly方法会使得线程进入等待状态，直到下面三种情况之一发生：

```txt
Some other thread invokes the signal method for this Condition and the current thread happens to be chosen as the thread to be awakened; or
Some other thread invokes the signalAll method for this Condition; or
A "spurious wakeup" occurs.
```

与await方法唯一不同的是，这个方法并不回应中断。

接下来是awaitNanos方法：

```java
    long awaitNanos(long nanosTimeout) throws InterruptedException;
```

方法的说明：

```txt
Causes the current thread to wait until it is signalled or interrupted, or the specified waiting time elapses.
```

调用awaitNanos，会导致当前的线程进入等待状态直到被signal或者被中断或者指定的时间已经过去了，直到下面五种情况有一个发生：

```txt
Some other thread invokes the signal method for this Condition and the current thread happens to be chosen as the thread to be awakened; or
Some other thread invokes the signalAll method for this Condition; or
Some other thread interrupts the current thread, and interruption of thread suspension is supported; or
The specified waiting time elapses; or
A "spurious wakeup" occurs.
```

可以看到与await方法不同的地方在于，指定的等待时间已经过去了，就会返回。

```txt
The method returns an estimate of the number of nanoseconds remaining to wait given the supplied nanosTimeout value upon
return, or a value less than or equal to zero if it timed out. This value can be used to determine whether and how long to re-
wait in cases where the wait returns but an awaited condition still does not hold. Typical uses of this method take the 
following form:
```

这个方法会返回一个近似的纳秒的时间，这个时间是给定时间的剩余的时间，还有可能返回的是一个小于或者等于零的值，这意味着超时了。这个值可以用来是否以及多长时间重新的等待，典型的使用场景是这样的：

```java
 boolean aMethod(long timeout, TimeUnit unit) {
   long nanos = unit.toNanos(timeout);
   lock.lock();
   try {
     while (!conditionBeingWaitedFor()) {
       if (nanos <= 0L)
         return false;
       nanos = theCondition.awaitNanos(nanos);
     }
     // ...
   } finally {
     lock.unlock();
   }
 }
```

```txt
This method requires a nanosecond argument so as to avoid truncation errors in reporting remaining times. Such precision loss 
would make it difficult for programmers to ensure that total waiting times are not systematically shorter than specified when 
re-waits occur.
```

这个方法需要的是一个纳秒的参数来去避免一个截断上的错误再去返回剩余时间，使用它来确保整体的等待时间，这种精度的损失可能对于程序员而言是非常困难的。

接下来是另外一个await方法的重载：

```java
boolean await(long time, TimeUnit unit) throws InterruptedException;
```

```txt
Causes the current thread to wait until it is signalled or interrupted, or the specified waiting time elapses. This method is behaviorally equivalent to:
  awaitNanos(unit.toNanos(time)) > 0
```

这个方法实际上是awaitNanos方法的一个变形，实际上的实现等价于：

```java
awaitNanos(unit.toNanos(time)) > 0
```

接下来是awaitUntil方法：

```java
 boolean awaitUntil(Date deadline) throws InterruptedException;
```

一种典型的使用：

```java
 boolean aMethod(Date deadline) {
   boolean stillWaiting = true;
   lock.lock();
   try {
     while (!conditionBeingWaitedFor()) {
       if (!stillWaiting)
         return false;
       stillWaiting = theCondition.awaitUntil(deadline);
     }
     // ...
   } finally {
     lock.unlock();
   }
 }
```

以上都是针对于await方法的一些变形和衍生，本质上并没有什么差别。

接下来是signal方法：

```java
    void signal();
```

方法的说明：

```txt
Wakes up one waiting thread.
If any threads are waiting on this condition then one is selected for waking up. That thread must then re-acquire the lock 
before returning from await.
```

该方法用于唤醒一个等待的线程，如果有多个线程在condition上等待，那么就会选择其中的一个进行唤醒，在返回await方法之前，被唤醒的线程必须获取到lock，而具体唤醒哪一个线程取决于具体的实现。

最后是signalAll方法：

```java
void signalAll();
```

方法的说明：

```txt
Wakes up all waiting threads.
If any threads are waiting on this condition then they are all woken up. Each thread must re-acquire the lock before it can return from await.
```

该方法会唤醒所有处于等待状态的线程，如果有多个线程在condition上等待，那么它们都会被唤醒。每个线程都要获取到lcok才能从awit方法返回。

### Condition实践

Thread.sleep与await（或是Object的wait方法）的本质区别：sleep方法本质上不会释放锁，而await会释放锁，并且在signal后，还需要重新获取到锁才能继续执行（该行为与Object的wait方法完全一致）。

接下来我们通过一个具体的例子来了解Condition的使用。

```java
class BoundedContainer {

    private String[] elements = new String[10];

    private Lock lock = new ReentrantLock();

    private Condition notEmptyCondition = lock.newCondition();

    private Condition notFullCondition = lock.newCondition();

    // 数组中已有元素的数量
    private int elementCount;

    // 放置元素索引
    private int putIndex;

    // 提取元素索引
    private int takeIndex;

    /**
     * 放置元素的方法
     * @param element 需要放置的目标元素
     * @throws Exception
     */
    public void put(String element) throws Exception{
        this.lock.lock();
        try {
            while (this.elementCount == this.elements.length) {
                notFullCondition.await();
            }
            elements[putIndex] = element;

            if (++putIndex == this.elements.length) {
                putIndex = 0;
            }
            ++elementCount;
            System.out.println("put method: " + Arrays.toString(elements));
            notEmptyCondition.signal();
        }finally {
            this.lock.unlock();
        }
    }

    /**
     * 获取元素的方法
     * @return 获取元素
     * @throws Exception
     */
    public String take() throws Exception{
        this.lock.lock();
        try {
            while (this.elementCount == 0) {
                notEmptyCondition.await();
            }
            String element = elements[takeIndex];
            elements[takeIndex] = null;
            if (++takeIndex == this.elements.length) {
                takeIndex = 0;
            }
            --elementCount;
            System.out.println("take method: " + Arrays.asList(elements));
            notFullCondition.signal();
            return element;
        } finally {
            this.lock.unlock();
        }
    }
}
```

编写入口类：

```java
public class MyTest1 {
    public static void main(String[] args) {
        BoundedContainer boundedContainer = new BoundedContainer();
        IntStream.range(0, 10).forEach(i -> new Thread(() -> {
            try {
                boundedContainer.put("hello");
            } catch (Exception exception) {
                exception.printStackTrace();
            }
        }).start());

        IntStream.range(0, 10).forEach(i -> new Thread(() -> {
            try {
                boundedContainer.take();
            } catch (Exception exception) {
                exception.printStackTrace();
            }
        }));
    }
}
```

控制台输出：

```txt
put method: [hello, null, null, null, null, null, null, null, null, null]
put method: [hello, hello, null, null, null, null, null, null, null, null]
put method: [hello, hello, hello, null, null, null, null, null, null, null]
put method: [hello, hello, hello, hello, null, null, null, null, null, null]
put method: [hello, hello, hello, hello, hello, null, null, null, null, null]
put method: [hello, hello, hello, hello, hello, hello, null, null, null, null]
put method: [hello, hello, hello, hello, hello, hello, hello, null, null, null]
put method: [hello, hello, hello, hello, hello, hello, hello, hello, null, null]
put method: [hello, hello, hello, hello, hello, hello, hello, hello, hello, null]
put method: [hello, hello, hello, hello, hello, hello, hello, hello, hello, hello]
take method: [null, hello, hello, hello, hello, hello, hello, hello, hello, hello]
take method: [null, null, hello, hello, hello, hello, hello, hello, hello, hello]
take method: [null, null, null, hello, hello, hello, hello, hello, hello, hello]
take method: [null, null, null, null, hello, hello, hello, hello, hello, hello]
take method: [null, null, null, null, null, hello, hello, hello, hello, hello]
take method: [null, null, null, null, null, null, hello, hello, hello, hello]
take method: [null, null, null, null, null, null, null, hello, hello, hello]
take method: [null, null, null, null, null, null, null, null, hello, hello]
take method: [null, null, null, null, null, null, null, null, null, hello]
take method: [null, null, null, null, null, null, null, null, null, null]
```

### Volatile关键字

volatile本身的含义的是不稳定的意思，总体而言，volitle关键字主要有三方面的作用：

1. 实现long/double类型变量的原子操作
2. 防止指令重排序
3. 实现变量的可变性

