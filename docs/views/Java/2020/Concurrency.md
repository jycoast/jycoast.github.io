---
title: Java并发编程
date: 2020-10-05
categories:
- Java
	author: jyc
---

# 前言

并发编程相比于Java中其他知识点的学习门槛要高很多，从而导致很多人望而却步，但无论是职场面试，还是高并发/高流量系统的实现，却都离不开并发编程。

全文大致共分为三个部分，第一部分为Java并发编程基础篇，主要讲解Java并发编程的基础知识、线程有关的知识和并发编程中的其他概念，这些知识在后续的章节中都会用到。第二部分为Java并发编程的高级篇，讲解Java并发包中的核心组件的实现原理。第三部分为Java并发编程实践篇，主要讲解并发组件的使用方法，以及一些注意事项。

本文主要结合张龙老师的视频：https://www.bilibili.com/video/BV1qK4y1t78Z?from=search&seid=2031440298446612503，以及《Java并发编程之美》，系统而全面的介绍Java并发的方方面面。

# 并发编程基础

## Thread和Runnable

Thread类和Runnable接口无疑是了解Java并发编程的入口，Thread类本身是实现了Runnable接口的：

```java
public class Thread implements Runnable {
    // ...
}
```

首先我们来阅读以下Thread类的文档说明：

```txt
A thread is a thread of execution in a program. The Java Virtual Machine allows an application to have multiple threads of execution running concurrently.
```

一个thread指的是程序执行中的一个线程，Java虚拟机支持一个应用可以有多个并发执行的线程。

```txt
Every thread has a priority. Threads with higher priority are executed in preference to threads with lower priority. Each thread may or may not also be marked as a daemon. When code running in some thread creates a new Thread object, the new thread has its priority initially set equal to the priority of the creating thread, and is a daemon thread if and only if the creating thread is a daemon.
```

每一个线程都会有一个优先级，拥有高优先级的线程在执行的时候就会比低优先级的线程优先级要高，每一个线程也可以被标记为daemon（后台线程），当运行在某一个线程中的代码创建了一个新的线程，默认情况下，新的线程的优先级会和创建它的线程优先级相同，并且只有创建它的线程是daemon线程时，新的线程才会是daemon。

```txt
When a Java Virtual Machine starts up, there is usually a single non-daemon thread (which typically calls the method named main of some designated class). The Java Virtual Machine continues to execute threads until either of the following occurs:
```

当Java虚拟机启动的时候，通常会有一个单个的、非daemon线程（通常情况会调用某一个被指定类的main方法），Java虚拟机会继续执行线程，直到下面的两种情况发生：

```txt
The exit method of class Runtime has been called and the security manager has permitted the exit operation to take place.
All threads that are not daemon threads have died, either by returning from the call to the run method or by throwing an exception that propagates beyond the run method.
```

- 类的Runtime方法被调用，并且安全管理器允许退出操作发生。
- 所有的非后台线程都已经消亡了，要么是通过run方法的调用返回了，要么是run方法外面抛出了异常。

```txt
There are two ways to create a new thread of execution. One is to declare a class to be a subclass of Thread. This subclass should override the run method of class Thread. An instance of the subclass can then be allocated and started. For example, a thread that computes primes larger than a stated value could be written as follows:
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
The other way to create a thread is to declare a class that implements the Runnable interface. That class then implements the run method. An instance of the class can then be allocated, passed as an argument when creating Thread, and started. The same example in this other style looks like the following:
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
Every thread has a name for identification purposes. More than one thread may have the same name. If a name is not specified when a thread is created, a new name is generated for it.
Unless otherwise noted, passing a null argument to a constructor or method in this class will cause a NullPointerException to be thrown.
```

每个线程都有一个名称用于标识，不同的线程可能会有相同的名称，如果创建线程的时候没有指定名称，就会产生一个新的名称，如无特别说明，将null参数传递给构造方法或者这个类的其他方法就会导致空指针异常。

这里用到了start方法来启动线程，我们来阅读以下start方法的说明：

```txt
Causes this thread to begin execution; the Java Virtual Machine calls the run method of this thread.
The result is that two threads are running concurrently: the current thread (which returns from the call to the start method) and the other thread (which executes its run method).
It is never legal to start a thread more than once. In particular, a thread may not be restarted once it has completed execution.
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
The Runnable interface should be implemented by any class whose instances are intended to be executed by a thread. The class must define a method of no arguments called run.
This interface is designed to provide a common protocol for objects that wish to execute code while they are active. For example, Runnable is implemented by class Thread. Being active simply means that a thread has been started and has not yet been stopped.
```

任何一个执行线程的类都应该实现Runnable接口，这个类必须定义一个无参的run方法。设计这个接口是为了，给执行处在激活状态的代码的时候，提供一种公共的协议，比如说，Runnable是被Thread类所实现出来了。处于激活状态表示一个线程被启动了，而且没有停止。

```txt
In addition, Runnable provides the means for a class to be active while not subclassing Thread. A class that implements Runnable can run without subclassing Thread by instantiating a Thread instance and passing itself in as the target. In most cases, the Runnable interface should be used if you are only planning to override the run() method and no other Thread methods. This is important because classes should not be subclassed unless the programmer intends on modifying or enhancing the fundamental behavior of the class.
```

此外，Runnable提供了让一个类处在激活状态同时又没有子类化的方式，一个类实现了Runnable可以不用通过子类化来运行，这是通过初始化一个Thread实例，然后将它自己作为目标传入，如果你只是计划重写run方法，而不打算重写Thread类其他的方法，一般情况下，都应该使用Runnable，这是非常重要的，除非程序员打算增强或修改一些基础的行为，因为类不应该被子类化。

接下来我们阅读以下run方法的说明：

```txt
When an object implementing interface Runnable is used to create a thread, starting the thread causes the object's run method to be called in that separately executing thread.
The general contract of the method run is that it may take any action whatsoever.
```

当使用实现了Runnable接口的对象创建了一个线程，启动这个线程，就会在单独执行的线程上执行这个类的run方法，run方法一种通用的锲约是它可以接口任何的动作。

同样的在Thread类中也有一个run方法：

```txt
If this thread was constructed using a separate Runnable run object, then that Runnable object's run method is called; otherwise, this method does nothing and returns.
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

## wait和sleep

在Object类中有几个与线程相关的方法：notify、notifyAll、wait，这几个方法非常的重要，接下来我们分析一下这个几个方法，首先从wait方法开始，wait方法又有几个重载的方法，首先来看不带参数的wait方法：

```txt
Causes the current thread to wait until another thread invokes the notify() method or the notifyAll() method for this object. In other words, this method behaves exactly as if it simply performs the call wait(0).
```

wait方法会导致当前的线程进入等待状态，直到另外一个线程调用了这个对象的notify或者notifyAll方法，换言之，这个方法的行为是与wait(0)是等价的。

```txt
The current thread must own this object's monitor. The thread releases ownership of this monitor and waits until another thread notifies threads waiting on this object's monitor to wake up either through a call to the notify method or the notifyAll method. The thread then waits until it can re-obtain ownership of the monitor and resumes execution.
As in the one argument version, interrupts and spurious wakeups are possible, and this method should always be used in a loop:
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
This method should only be called by a thread that is the owner of this object's monitor. See the notify method for a description of the ways in which a thread can become the owner of a monitor.
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
Causes the currently executing thread to sleep (temporarily cease execution) for the specified number of milliseconds, subject to the precision and accuracy of system timers and schedulers. The thread does not lose ownership of any monitors.
```

它会导致当前正在执行的线程进入到休眠的状态（临时的终止执行）一段指定的毫秒数，它会收到系统定时器和调度器的精度的限制，线程并不会失去任何锁的所有权。

这里其实就是wait方法和sleep方法的最明显的区别，调用wait方法之前，线程必须持有对象的锁，在调用wait方法之后，线程就会释放锁，而sleep方法则不会释放掉锁。



