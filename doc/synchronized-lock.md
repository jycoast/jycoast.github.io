# 并发编程基础

## 锁的分类

相同的锁从不同的角度进行划分，也可能属于不同的种类。锁的种类大致如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208071654956.png" alt="image-20220807165413925" style="zoom: 33%;" />

## 锁的基本原理

### Monitor与锁

Monitor（管程）是Java锁机制的基石，JVM中的锁，本质上都是通过Monitor来实现的。每一个对象实例都会有一个Monitor对象，Monitor对象会和Java对象一同创建，一同销毁。Monitor中有两个非常重要的元素：

- EntryList、WaitSet：用来存放没有获取到锁的线程
- 锁机制：通过互斥锁来保证共享数据不会被并发访问

Monitor的整体结构如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208032352311.png" alt="image-20220803235232275" style="zoom: 33%;" />

Monitor和普通的Java对象没有什么区别，其本身是由C++来实现的。

```c++
// Monitor对象
class ObjectMonitor {

  // 成员方法...

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
 // 成员属性...

 // 锁的持有者
 protected:
  void *  volatile _owner;

 // 没获取到锁的线程
 protected:
  ObjectWaiter * volatile _EntryList ;
 // 等待集合定义
 protected:
  ObjectWaiter * volatile _WaitSet; // LL of threads wait()ing on the monitor
 // 等待队列,简单的自旋锁
 private:
  volatile int _WaitSetLock;
  
 // 一些方法...
  
};
```

其中ObjectWaiter的定义如下：

```c++
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
  Sorted        _Sorted ;
  bool          _active ;
 public:
  ObjectWaiter(Thread* thread);

  void wait_reenter_begin(ObjectMonitor *mon);
  void wait_reenter_end(ObjectMonitor *mon);
};
```

当多个线程同时访问一段同步代码时，这些线程会被放进一个EntryList集合中。处于阻塞状态的线程都会被放入该集合中。当某一个线程获取对象的Monitor时，其他线程就无法再获取到对象的Monitor。这一点是依赖于底层操作系统的`mutex lock`（互斥锁）来实现互斥的。 Monitor通过对象互斥锁来保证共享数据操作的完整性，每个对象都有一个互斥锁的标记，这个标记用于保证在任何时刻，只能有一个线程访问该对象的共享数据。

如果调用了该线程的wait方法或者该线程顺利执行完毕，那么该线程就会释放掉所持有的互斥锁，并进入WaitSet中，等待下一次被其他线程调用notify/notifyAll唤醒。

那些处于EntryList与WaitSet中的线程均处于阻塞状态，阻塞操作是由操作系统来完成的，在linux下是通过`pthread_mutex_lock`函数实现的。线程被阻塞之后便会进入到内核调度方法，这会导致系统在用户态和内核态之间来回切换，严重影响锁的性能。

解决上述问题的办法便是自旋，如果锁的持有者（Owner）能够在很短的时间内释放掉锁，那么那些正在争用的线程如果稍微等待一下，在Owner线程释放锁之后，争用的线程就立刻获取到锁，从而避免了系统阻塞。不过，当Owner运行的时间超过了临界值，争用线程自旋一段时间后依然无法获取到锁，这时争用的线程就会停止自旋进入阻塞状态。总而言之，先进行自旋，不成功再进入阻塞状态，尽可能降低阻塞的可能性，这对那些执行时间很短的代码块来说由极大的性能提升。

### Java中的内存可见性

Java内存模型规定，将所有的变量都存放在主内存中，当线程使用变量时，会把主内存里面的变量复制到自己的工作内存，线程读写变量时操作的是自己工作内存中的变量。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202207312306066.png" alt="image-20220731230615014" style="zoom: 50%;" />

以双核CPU系统架构为例，每个核都有自己的控制器和运算器，其中控制器包含一组寄存器和操作控制器，运算器执行算数逻辑运算。每个CPU内核都有自己的一级缓存，在有些架构中还有一个所有CPU都共享的二级缓存。那么Java内存模型里面的工作内存，就对应这里的L1或者L2缓存或者CPU的寄存器。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202207312325654.png" alt="image-20220731232536623" style="zoom:50%;" />

当一个线程操作共享变量时，它首先从主内存复制共享变量到自己的工作内存，然后在工作内存里的变量进行处理，处理完后将变量的值更新到主内存。当线程A和线程B同时处理一个共享变量，这时候，由于Cache的存在，将会导致内存不可见的问题。

从内存的角度来看，sychronized的语义就是将sychronized块内使用到的变量从线程的工作内存中清除，这样做的目的是，在sychronized代码块中使用到该变量时就不会从线程的工作内存中获取，而是直接从主内存中获取，在退出sychronized代码块的时候，将在sychronized块内对共享变量的修改刷新到主内存。

# sychronized与Lock的实现原理

## synchronized的实现原理

synchronized是Java中非常古老的关键字，从诞生之日起，JVM对其做了大量关于性能上的优化，单论性能，它并不比Lock要差，通常而言，synchronized能满足我们对于绝大部分对于锁的需求。

### synchronized字节码分析

synchronized关键字有三种使用方法：

- 作用在代码块上
- 作用在实例方法上
- 作用在静态方法上

让我们来看看，这几种不同的方法的原理。

当synchronized作用在代码块上：

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

当线程进入到monitorenter指令后，线程将会持有Monitor对象；执行monitorexit指令后，线程将会释放Monitor对象。这里有两个monitorexit的原因是，程序退出有两种可能，一种是程序正常执行结束退出，另一种是程序抛出了异常退出，无论哪种情况，都会释放掉锁住的对象。

上述的例子还说明了另外一点，一个monitorenter可能对应一个或者多个monitorexit，为了说明这一点，我们将示例代码修改如下：

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

此时，反编译的结果：

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
      // 此时只有唯一一个monitorexit指令
      25: monitorexit
      26: aload_2
      27: athrow
    Exception table:
       from    to  target type
           7    26    23   any
}
```

为什么这里只有一个monitorexit呢？因为此时程序的执行结果一定是抛出异常，换句话说，程序的出口只有一个，因此只有唯一的一个monitorexit。一个monitorenter会对应多少个monitorexit，Java编译器会帮我们自动完成。

synchronized关键字除了可以作用在代码块上，还可以作用在实例方法上：

```java
public class MyTest3 {
    public synchronized void method() {
        System.out.println("hello world");
    }
}
```

反编译之后的结果：

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

Synchronized关键字修饰方法与代码块不同之处在于，Synchronized并没有通过monitor与monitorexit指令来描述，而是使用`ACC_SYNCHRONIZED`表示该方法被Sychronized修饰。当方法被调用的时候，JVM会检查该方法是否拥有`ACC_SYNCHRONIZED`标志，如果有，那么执行线程将会持有方法所在的对象的Monitor，然后再去执行方法体，在该方法执行期间，其他线程均无法获取到这个Monitor对象，当线程执行完该方法后，它就会释放掉这个Monitor对象。

Synchronized关键字还可能作用在静态方法上面：

```java
public class SynchronizedStaticMethodTest {
    public static synchronized void method() {
        System.out.println("hello world");
    }
}
```

反编译的结果：

```java
{                                                                                                          
  public concurrency2.SynchronizedStaticMethodTest();                                                                           
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

可以看到，静态方法的表示和实力方法类似，都是通过`ACC_SYNCHRONIZED`来实现的。此外，静态方法还会增加`ACC_STATIC`的访问标志来表示是静态方法。

### synchronized实例

为了进一步理解Synchronized关键字的原理和作用，我们使用synchronized锁住一个方法，目标是按照线程进入的顺序依次执行完方法的所有代码：

```java
public class SyncDemo {

    static class Sync {
        public synchronized void method() {
            System.out.println("method begin");
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("method end");
        }
    }


    static class MyThread extends Thread {
        @Override
        public void run() {
          	//　每个线程都创建一个新的Sync对象
            Sync sync = new Sync();
            sync.method();
        }
    }


    public static void main(String[] args) {
      // 模拟多线程环境
        for (int i = 0; i < 3; i++) {
            Thread thread = new MyThread();
            thread.start();
        }
    }
}

```

运行结果：

```txt
method begin
method begin
method begin
method end
method end
method end
```

不难看出，并没有达到我们预期的效果，即一次一个begin和一个end一起打印。前面我们提到过，synchronized除了可以作用在实例方法上，也可以作用在代码块上，因此，我们对上面的例子做如下修改：

```java
static class Sync{
        public void method() {
            synchronized (this) {
                System.out.println("method begin");
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("method end");
            }
        }
  }
```

运行结果：

```txt
method begin
method begin
method begin
method end
method end
method end
```

可以发现，结果依旧没有任何变化。为了说明原因，我们对示例做如下修改：

```java
static class Sync {
        public synchronized void method() {
            System.out.println("method begin");
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("method end");
        }
    }

    static class MyThread extends Thread {
      
        // 使用同一个Sync对象
        private final Sync sync;

        public MyThread(Sync sync) {
            this.sync = sync;
        }

        @Override
        public void run() {
            sync.method();
        }
    }


    public static void main(String[] args) {
        // 唯一性
        Sync sync = new Sync();
        for (int i = 0; i < 3; i++) {
            Thread thread = new MyThread(sync);
            thread.start();
        }
    }
```

运行结果：

```txt
method begin
method end
method begin
method end
method begin
method end
```

终于达到了效果，这说明synchronized锁住的是括号里面的对象，而不是代码段。对于非static的sync方法，锁住的就是对象本身，也就是this。对于synchronized关键字的作用我们做如下总结：

- 对于普通方法，锁住的是当前实例对象
- 对于静态同步方法，锁住的是当前类的class对象
- 对于同步方法块，锁住的是括号里面的对象

### synchronized锁升级

随着JDK版本的不断更新迭代，sychronized关键字的实现方式也在不断地进行调整。在JDK1.5之前，要实现线程同步，只能通过sychronized关键字来实现，Java底层也是通过sychronized关键字来做到数据的原子性维护，sychronized是JVM实现的一种内置锁，这种锁的获取与释放都是由JVM来帮助我们隐式完成的。sychronized基于底层操作系统的mutex Lock来实现，每次对锁的获取与释放动作都会带来用户态和内核态之间的切换，这种切换回极大的增加系统的负担。在并发量较高的时候，sychronized锁在性能上的表现就会很差。

从JDK1.6开始，sychronized锁的实现发生了很大的变化，JVM引入了相应的优化手段来提升sychronized锁的性能，这种提升涉及到偏向锁、轻量级锁、重量级锁等，从而减少锁竞争带来的用户态和内核态之间频繁的切换。

这种优化手段是通过Java对象头中的一些标志位来完成，从JDK1.6开始，对象实例在堆中会被划分为三个组成部分：对象头、实例数据与对齐填充。其中对象头主要由Mark Word、指向类的指针和数组的长度3部分内容构成。Mark Word包含了如下组成部分：

<img src="https://img-blog.csdnimg.cn/20200619123714116.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM2NDM0NzQy,size_16,color_FFFFFF,t_70#pic_center" alt="在这里插入图片描述" style="zoom:67%;" />

sychronized锁的升级主要是通过Mark Word中的锁的标志位与是否是偏向锁的标志位来达成的。sychronized锁都是从偏向锁开始，随着锁竞争的不断升级，逐步演化至轻量级锁，最终变为重量级锁。

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208071148376.png)

偏向锁的作用是优化同一个线程多次获取一个锁的情况。如果一个sychronized方法被同一个线程访问，那么这个方法所在的对象就会在其Mark Word中将偏向锁进行标记，同时还会有一个字段来存储该线程的ID，当这个线程再次访问同一个sychronized方法时，如果这个对象的Mark Word有偏向锁标记并且其线程ID与当前线程相等，那么该线程回直接进入到该方法体中。如果另外一个线程访问这个sychronized方法，那么偏向锁的标记就被去掉，变为轻量级锁。

若第一个线程已经获取到了当前的锁，这时，第二个线程又开始尝试争抢该对象的锁，由于该对象的锁已经被第一个线程获取到，因此它是偏向锁，而第二个线程在争抢时，会发现该对象头中的Mark Word已经是偏向锁，但里面存储的线程ID不是自己（第一个线程），那么它会进行CAS，从而获取到锁，此时，会有两种情况：

- 获取锁成功，那么它会直接将Mark、 Word中的线程ID由第一个线程变成自己（偏向锁标志位保持不变），这样该对象依然会保持偏向锁的状态
- 获取锁失败，表示这时可能会有多个线程同时在尝试争抢该对象的锁，那么这时偏向锁会进行升级，升级为轻量级锁

重量级锁：线程最终从用户态进入到了内核态。

## Lock的实现原理

从JDK1.5开始，引入了JUC包，使得我们可以通过Java代码来获取与释放锁。它提供了与sychronized关键字类似的功能，不过在使用的时候的需要显式地获取和释放锁。虽然这样缺少了释放锁的便捷性，但是也拥有了锁获取与释放的可操作性、可中断的获取锁以及超时获取锁等多种sychronized关键字所不具备的同步特性。

### Lock与Condition

Lock是一个接口，它定义了锁获取和释放的基本操作：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208071724275.png" alt="image-20220807172457245" style="zoom: 50%;" />

Lock最常用的使用方式：

```java
// 声明锁的类型
Lock lock = new ReentrantLock();
// 获取锁
lock.lock();  
try {  
    // ..
} finally {
  	// 释放锁
    lock.unlock();
}
```

在finally块中释放锁，目的是保证在获取到锁之后，最终一定能够被释放。

每一个Java对象，都拥有一组Monitor方法，包括wait()、notify()、notifyAll()方法，这些方法与synchronized关键字配合，可以实现等待/通知模式。Condition接口也提供了类似对象的Monitor的方法，与Lock配合可以实现等待/通知模式：

```java
public interface Condition {

    // 等待，当前线程在接到信号或被中断之前一直处于等待状态
    void await() throws InterruptedException;
    
    // 等待，当前线程在接到信号之前一直处于等待状态，不响应中断
    void awaitUninterruptibly();
    
    //等待，当前线程在接到信号、被中断或到达指定等待时间之前一直处于等待状态 
    long awaitNanos(long nanosTimeout) throws InterruptedException;
    
    // 等待，当前线程在接到信号、被中断或到达指定等待时间之前一直处于等待状态。此方法在行为上等效于: awaitNanos(unit.toNanos(time)) > 0
    boolean await(long time, TimeUnit unit) throws InterruptedException;
    
    // 等待，当前线程在接到信号、被中断或到达指定最后期限之前一直处于等待状态
    boolean awaitUntil(Date deadline) throws InterruptedException;
    
    // 唤醒一个等待线程。如果所有的线程都在等待此条件，则选择其中的一个唤醒。在从 await 返回之前，该线程必须重新获取锁。
    void signal();
    
    // 唤醒所有等待线程。如果所有的线程都在等待此条件，则唤醒所有线程。在从 await 返回之前，每个线程都必须重新获取锁。
    void signalAll();
}
```

两者在使用方式以及功能特性有所差别：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208071709505.png" alt="image-20220807170954478" style="zoom:50%;" />

简单来说，就是一个锁对应一个AQS阻塞队列，对应多个条件变量，每个条件变量都有自己的一个条件队列。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208071651285.png" alt="image-20220807165145255" style="zoom:67%;" />

举例来说：

```java
public class BoundedContainer {

 private final String[] elements = new String[10];

    private final Lock lock = new ReentrantLock();

    /**
     * 非空的条件队列
     */
    private final Condition notEmptyCondition = lock.newCondition();

    /**
     * 非满的条件队列
     */
    private final Condition notFullCondition = lock.newCondition();

    // 数组中已有元素的数量
    private int elementCount;

    // 放置元素索引
    private int putIndex;

    // 提取元素索引
    private int takeIndex;

    /**
     * 放置元素的方法
     *
     * @param element 需要放置的目标元素
     */
    public void put(String element) throws Exception {
        this.lock.lock();
        try {
            // 如果数组已经满了，就先等待
            while (this.elementCount == this.elements.length) {
                notFullCondition.await();
            }
            elements[putIndex] = element;

            if (putIndex++ == this.elements.length) {
                putIndex = 0;
            }
            elementCount++;
            System.out.println("put method: " + Arrays.toString(elements));
            notEmptyCondition.signal();
        } finally {
            this.lock.unlock();
        }
    }

    /**
     * 获取元素的方法
     */
    public void take() throws Exception {
        this.lock.lock();
        try {
            while (this.elementCount == 0) {
                notEmptyCondition.await();
            }
            elements[takeIndex] = null;
            if (takeIndex++ == this.elements.length) {
                takeIndex = 0;
            }
            elementCount--;
            System.out.println("take method: " + Arrays.asList(elements));
            notFullCondition.signal();
        } finally {
            this.lock.unlock();
        }
    }
}
```

程序的入口类：

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
        }).start());
    }
}
```

程序运行的结果：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208112351337.png" alt="image-20220811235100270" style="zoom: 50%;" />

这样我们就在一个锁（ReentrantLock）上绑定了多个条件队列，在不同的条件下使用不同的Condition对象，完成了锁的唤醒与阻塞。

### 队列同步器AQS

#### AQS概览

队列同步器AbstractOwnableSynchronizer简称AQS，是Lock实现的核心类，它是如此的重要，又是如此的难以理解。我们将浅要的分析其实现的关键点，从宏观上理解AQS的实现过程。

AQS使用了一个int成员变量表示同步状态，通过内置的双向链表来完成资源获取线程的排队工作。AQS使用CAS对该同步状态进行原子操作实现对其值的修改。

```java
private volatile int state;//共享变量，使用volatile修饰保证线程可见性 
```

可以这样理解AQS与Lock的关系：Lock是面向使用者的，它定义了使用者与锁交互的接口（比如可以允许两个线程并行访问），隐藏了实现细节；AQS面向的是锁的实现者，它简化了锁的实现方式，屏蔽了同步状态管理、线程的排队、等待与唤醒等底层操作。锁和同步器很好地隔离了使用者和实现者所需要关注的领域。

AQS的设计是基于模版方法模式的，也就是说，使用者需要继承AQS并重写指定的方法，随后将同步器组合在自定义同步组件的实现中，并调用同步器提供的模版方法，而这些模版方法将会调用使用者重写的方法。重写AQS指定的方法时，需要使用同步器提供的如下3个方法来访问或修改同步状态：

- getState()：获取当前同步状态
- setState(int newState)：设置当前同步状态
- compareAndSetState(int expect, int update)：使用CAS设置当前状态，该当法能够保证状态设置的原子性

不同的自定义同步器争用共享资源的方式也不同。自定义同步器在实现时只需要实现共享资源state的获取与释放方式即可，至于具体线程等待队列的维护（如获取资源失败入队/唤醒出队等），AQS中已经实现好了。

自定义同步器通常需要重写下面几个ASQ提供的模版方法：

```java
// 独占方式。尝试获取资源，成功则返回true，失败则返回false。
tryAcquire(int);
// 独占方式。尝试释放资源，成功则返回true，失败则返回false。
tryRelease(int);
//共享方式。尝试获取资源。负数表示失败；0表示成功，但没有剩余可用资源；正数表示成功，且有剩余资源。
tryAcquireShared(int);
//共享方式。尝试释放资源，成功则返回true，失败则返回false。 
tryReleaseShared(int);
// 该线程是否正在独占资源。只有用到condition才需要去实现它。
isHeldExclusively();
```

通常我们并不会直接使用AQS，而是使用AQS的子类：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208102321059.png" alt="image-20220810232130007" style="zoom:50%;" />

以可重入锁ReentrantLock的实现为例，state初始化的值为0，表示未锁定状态，当A线程调用lock()方法时，会调用tryAcquire()方法获取锁并将state加1。此后，其他线程再调用tryAcquire()时就会失败，知道A线程调用unlock()将state的值修改为0，其他线程才有机会获取到该锁。不过，对于ReentrantLock而言，在没有调用unlock()之前，A线程是可以重复获取锁的，这就是可重入锁的含义。需要注意的是，获取多少次就需要释放多少次，这样才能保证state最终等于0。

#### CLH队列

CLH是单项链表实现的队列。在队列中的等待线程只在本地变量上自旋，它不断轮询前驱的状态，如果发现前驱结点释放了锁就结束自旋。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208112307862.png" alt="image-20220811230745794" style="zoom:50%;" />

CLH队列的特性：

1. CLH队列是一个单项链表，保持FIFO先进先出的队列特性
2. 通过Tail尾节点来构建队列，总是指向最后一个节点
3. 未获得锁的节点会进行自旋，而不是切换线程状态
4. 并发较高时，性能较差，因为未获取锁的节点会不断轮询前驱节点的状态来查看是否获得锁

AQS队列是CLH变体的虚拟双向队列，通过将每条请求共享资源的线程封装成一个节点来实现锁的分配。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208112311784.png" alt="image-20220811231130720" style="zoom:50%;" />

相较于CLH队列而言，AQS中的CLH队列拥有以下特性：

1. AQS中的队列是双向链表
2. 通过Head、Tail头尾两个节点来组成队列结构，通过volatile修饰保证可见性
3. Head节点为已获取锁的节点，是一个虚拟节点，节点本身不持有具体的线程对象
4. 获取不到同步状态，会将节点进行自旋获取锁，自旋一定次数失败后会将线程阻塞，相对于CLH队列性能较好

并且，在AQS中，节点的状态也不再仅仅是true或者false，而是被定义成了：

![image-20220814212943010](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208142129050.png)

接下来，我们将以ReentrantLock为例，分析如何使用AQS进行加锁和解锁。	

#### AQS的解锁过程

在了解加锁的过程前，我们先对AQS整体的过程有一个初步的理解，避免过度陷入细节：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208102317701.png" alt="image-20220810231719664" style="zoom:50%;" />

整个加锁的过程大致可以分为三个部分：

1. 加入阻塞队列
2. 阻塞队列调度
3. 异常处理

在加入阻塞队列之前，首先会查看头节点是否为null，如果是null的话，就新建waitStatus为0的头结点，然后将当前节点添加至阻塞队列的尾部（结点的初始化、向尾部节点追加新节点都是通过CAS操作）。当阻塞队列中加入一个节点之后，阻塞队列就变成了：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208102335738.png" alt="image-20220810233505669" style="zoom:50%;" />

首先看加锁成功的情况，一旦加锁成功，当前节点就变成了头结点，而原头结点的引用会被修改为null，当所有结点都加锁成功，阻塞队列便为空了，需要注意的是，此时阻塞队列的长度不等于0，由于头结点的存在，所以阻塞队列的长度是1，加锁过程的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208102341591.png" alt="image-20220810234121525" style="zoom: 50%;" />

当加锁失败或当前节点的前结点不是头结点，此时是否要将线程挂起，取决于前结点的waitStatus的值：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208102343764.png" alt="image-20220810234303705" style="zoom:50%;" />

除此之外，还会将当前节点之前的所有已取消节点从阻塞队列中剔除。

如果阶段被唤醒，在加锁阶段发生了异常，如果没有处理异常，这个异常节点将永远处于阻塞队列，成为”僵尸节点“，且后续节点也不会被唤起。发生异常的场景可能有”等待超时”、“打断”等。

#### AQS的解锁过程

解锁的过程相对加锁简单很多：

```java
protected final boolean tryRelease(int releases) {
    int c = getState() - releases;
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    boolean free = false;
    if (c == 0) {
        free = true;
        setExclusiveOwnerThread(null);
    }
    setState(c);
    return free;
}
```

由于RenentrantLock可重入的特性，所以当前线程每次加锁都会对state累加，而每次tryRelease()方法则会对state累减，直到state变为初始状态0时，tryRelease()方法才会返回true，当tryRelease()方法返回true，就意味着唤醒等待队列上的下一个结点。	

我们一直在分析的tryRelease()的方法实际上就是所谓的独占锁（或排他锁），这种类型的锁，是指锁对象只能被一个线程锁持有，如果别的线程想要获取锁，只能等到持有锁的线程释放锁；与独占锁相对的就是共享锁，共享锁，是指锁对象可以被多个线程锁持有，获取共享锁的线程只能读数据，不能修改数据。独占锁典型的实现有RentrantLock，共享锁的典型实现有CountDownLatch、Semaphore、CyclicBarrier等。

附AQS完整的流程图：

<img src="https://img2020.cnblogs.com/blog/2109301/202103/2109301-20210325204703110-854718401.png" alt="img" style="zoom: 33%;" />

### LockSupport

当AQS需要阻塞或唤醒一个线程的时候，都会使用LockSupport工具类来完成相应的工作，LockSupport定义了一组的公共静态方法，这些方法提供了线程阻塞、唤醒等基本功能。以park开头的方法用来阻塞当前线程，以unpark(Thread thread)方法来唤醒一个被阻塞的线程。

```java
public static void park(Object blocker) {  
    Thread t = Thread.currentThread();
    // blocker在什么对象上进行的阻塞操作
    setBlocker(t, blocker);
    UNSAFE.park(false, 0L);
    setBlocker(t, null);
}

public static void parkNanos(Object blocker, long nanos) {  
    if (nanos > 0) {
        Thread t = Thread.currentThread();
        setBlocker(t, blocker);
        // 超时阻塞
        UNSAFE.park(false, nanos);
        setBlocker(t, null);
    }
}

public static void unpark(Thread thread) {  
    if (thread != null)
        UNSAFE.unpark(thread);
}
```

UNSAFE使用park和unpark进行线程的阻塞和唤醒操作，park和unpark底层是借助操作系统（Linux）方法`pthread_mutex_trylock`和`pthread_cond`来实现的，通过`pthread_cond_wait`函数可以对一个线程进行阻塞操作，在这之前，必须先获取`pthread_mutex`，通过`pthread_cond_signal`函数对一个线程进行唤醒操作。	

# sychronized与Lock的对比

Java提供了种类丰富的锁，每种锁的特性都有所不同，因此，在合适的场景选择合适的锁非常重要。

Lock相较于sychronized优势如下：

- 可中断获取锁：使用sychronized关键字获取锁的时候，如果线程没有获取到被阻塞了，
- 可非阻塞获取锁：使用sychronized关键字获取锁的时候，如果没有成功获取，只有被阻塞，而使用Lock.tryLock()获取锁时，如果没有成功也不会阻塞，而是直接返回false
- 可限定获取锁的超时时间：使用Lock.tryLock(long time, TimeUnit unit)
- 同一个对象上可以有多个等待队列（Condition）

## sychronized与Lock用法区别

- sychronized：可以作用在方法或代码块上，加锁和解锁由JVM自动完成，无需开发者干预
- Lock：加锁（lock）和解锁（unlock）操作需要显示声明，解锁方法要写在finally代码块中，以防止死锁

## sychronized与Lock原理区别

- sychronized使用monitorenter与monitorexit指令，获取操作系统的互斥锁来完成同步操作
- sychnized使用的CPU的悲观锁机制，即线程获得的是排他锁。排他锁意味着其他线程只能依靠阻塞来等待线程释放锁，而在CPU转换线程阻塞时会引起线程上下文切换，当有很多线程竞争锁的时候，会引起CPU频繁的上下文切换导致效率很低
- Lock使用的乐观锁机制，实现的原理是通过CAS操作，本质是调用CPU提供的特殊指令

关于乐观锁和悲观锁的图示：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202208072340707.png" alt="image-20220807234008675" style="zoom:33%;" />

## sychronized与Lock性能区别

- 在JDK1.5之前，sychronized是重量级锁
- 在JDK1.6之后，sychronized得到很多的优化，如轻量级锁、自旋锁、偏向锁、锁消除、锁粗化等，所以性能与Lock相差无几
- Lock可以提高多个线程进行读操作的效率（可以通过ReadWriteLock实现读写分离）
- 如果竞争资源部激烈，两者的性能差不多，当竞争资源非常激烈时（即有大量线程同时竞争），Lock的性能要远远优于sychronized，需要在具体使用时根据实际情况选择

## sychronized与Lock使用场景

sychronized与Lock一般情况下并没有什么区别，但在如下的场景，需要考虑使用Lock：

- 某个线程在等待一个锁的控制权的时间内需要中断
- 条件队列有多个，需要使用condition对象
- 公平锁功能，每个新来的线程都需要排队等候

## 总结

1. 锁的获取方式：Lock时通过程序代码的方式由开发者手工获取，而sychronized是通过JVM来获取的（无需开发者干预）
2. 具体的实现方式：Lock是通过Java代码的方式来实现，sychronized是通过JVM底层来实现（无需开发者关注）
3. 锁的释放方式：Lock务必通过unlock（）方法在finally块中手工释放，sychronized是通过JVM来释放（无需开发者关注）
4. 锁的具体类型：Lock提供了多种锁类型，如公平锁、非公平锁，sychronized与Lock都提供了可重入锁

# 参考文献

- [Java并发编程](https://jycoder.club/2020/10/05/Concurrency/)
- [深入理解Java之synchronized到底锁住了什么](https://allenwu.itscoder.com/sync-in-dcl)
- [不可不说的Java“锁”事](https://tech.meituan.com/2018/11/15/java-lock.html)
- [Synchronized和lock 区别](https://xie.infoq.cn/article/4e370ded27e4419d2a94a44b3)
- [Java锁的那些事儿](https://tech.youzan.com/javasuo-de-na-xie-shi-er/)
- [浅谈JUC锁核心类AQS](https://blog.51cto.com/dsjprs/5254115)
- [聊一聊ReentrantLock和AQS那点事](https://xie.infoq.cn/article/8c8de2eab6cf13a5d922d0491)