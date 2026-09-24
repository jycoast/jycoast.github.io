---
title: happens-before：如何判断程序有没有并发安全问题
---

上一节讲了 JMM 靠内存屏障来保证可见性和禁止重排序。但内存屏障是给编译器和处理器看的，程序员不可能每次都去数「这里该插几个屏障」——太底层，也太容易错。为此 JSR-133 提出了 **happens-before**：一套用起来简单、又能覆盖内存可见性全部要求的规则。

### 为什么需要 happens-before

`happens-before` 的含义很直白：**前面一个操作的结果，对后续操作是可见的**。

它同时约束了两件事：

- 对程序员：如果 A happens-before B，那么 A 的执行结果对 B 可见，且 A 的执行顺序排在 B 之前。这是 JMM 给程序员的**承诺**。
- 对编译器和处理器：JMM **允许**重排序，只要重排序后的执行结果与按 happens-before 关系执行的结果一致。换句话说 happens-before 不要求真实执行顺序，只要求结果一致。

第二条经常被误解。两个操作之间存在 happens-before 关系，**并不意味着** Java 平台的具体实现必须按这个顺序执行指令。JMM 遵循一个基本原则：只要不改变程序的执行结果，编译器和处理器怎么优化都行。

- `as-if-serial` 语义保证单线程内程序执行结果不被改变
- happens-before 关系保证正确同步的多线程程序执行结果不被改变

这样做的目的，是在不改变结果的前提下尽可能提高并行度。

### 八条规则

JSR-133 定义了八条 happens-before 规则，这就是判断程序有没有并发安全问题的工具箱：

| # | 规则 | 内容 |
| --- | --- | --- |
| 1 | **程序顺序规则** | 一个线程中的每个操作，happens-before 于该线程中的任意后续操作 |
| 2 | **锁定规则** | 对一个锁的解锁，happens-before 于随后对这个锁的加锁 |
| 3 | **volatile 变量规则** | 对一个 volatile 变量的写，happens-before 于任意后续对这个变量的读 |
| 4 | **传递规则** | 如果 A happens-before B，且 B happens-before C，那么 A happens-before C |
| 5 | **线程启动规则** | 线程 A 调用线程 B 的 `start()`，则该操作 happens-before 于线程 B 中的任意操作 |
| 6 | **线程中断规则** | 对线程 `interrupt()` 的调用 happens-before 于被中断线程检测到中断事件 |
| 7 | **线程终结规则** | 线程 B 中的任意操作 happens-before 于线程 A 从 `ThreadB.join()` 成功返回 |
| 8 | **对象终结规则** | 一个对象的初始化完成 happens-before 于它的 `finalize()` 方法开始 |

前四条是最常用的，尤其是**传递规则**——它把单条规则串成链条，让可见性能够跨线程传递。

### 规则 1：程序顺序规则

在一个线程中，按程序顺序，前面的操作 happens-before 于后续的任意操作。

```java
class VolatileExample {
    int x = 0;
    volatile boolean v = false;

    public void writer() {
        x = 42;      // 这一行
        v = true;    // happens-before 这一行
    }

    public void reader() {
        if (v == true) {
            // 这里 x 会是多少？
        }
    }
}
```

这符合单线程的直觉：前面对某个变量的修改，一定对后续操作可见。

### 规则 3：volatile 变量规则

对一个 volatile 变量的写，happens-before 于后续对这个变量的读。

单看这条好像只是「禁用了缓存」，和 Java 5 之前的语义没区别。但它和程序顺序规则、传递规则组合起来，效果就完全不同了。

### 规则 4：传递性

如果 A happens-before B，且 B happens-before C，那么 A happens-before C。

把传递性用到上面的例子上：

- `x = 42` happens-before 写 `v = true` —— 这是规则 1
- 写 `v = true` happens-before 读 `v == true` —— 这是规则 3
- 由传递性推出：**`x = 42` happens-before 读 `v == true`**

意味着如果线程 B 读到了 `v == true`，那么线程 A 设置的 `x = 42` 对线程 B 就是可见的，线程 B 一定能看到 `x == 42`。

```java
public class Transitivity {

    int x = 0;
    volatile boolean v = false;

    public static void main(String[] args) throws InterruptedException {
        Transitivity transitivity = new Transitivity();
        Thread threadA = new Thread(() -> transitivity.writer());
        Thread threadB = new Thread(() -> transitivity.reader());

        threadA.start();
        threadA.join();
        threadB.start();
        threadB.join();
    }

    public void writer() {
        x = 42;
        v = true;
    }

    public void reader() {
        if (v == true) {
            // 这里 x 会是 42
            System.out.println(x);
        }
    }
}
```

这也是「volatile 能保证它之前的所有写操作对后续读线程可见」这个常见说法的由来——**volatile 本身只保证它自己那一个变量，是传递性把范围扩大了**。

### 规则 2：管程中锁的规则

对一个锁的解锁，happens-before 于随后对这个锁的加锁。

这里的「管程」在 Java 里就是 `synchronized`。管程的加锁解锁是隐式实现的：进入同步块前自动加锁，离开时自动解锁，都是编译器帮我们做的。

```java
synchronized (this) { // 此处自动加锁
  // x 是共享变量，初始值 = 10
  if (this.x < 12) {
    this.x = 12;
  }
} // 此处自动解锁
```

假设 x 初始值是 10。线程 A 执行完代码块，x 变成 12，同时自动释放锁；线程 B 进入代码块时能读到线程 A 对 x 的写，也就是看到 `x == 12`。这就是锁的可见性保证。

### 规则 5：线程 start() 规则

主线程 A 启动子线程 B 后，子线程 B 能看到主线程在启动它**之前**做的所有操作。

```java
public class StartHappenBefore {

    public static void main(String[] args) {
        int i = 0;
        Thread B = new Thread(() -> {
            // 主线程调用 B.start() 之前
            // 所有对共享变量的修改，此处皆可见
            // 此例中 i == 1
            System.out.println(i);
        });

        i = 1;      // 此处对共享变量 i 修改
        B.start();  // 主线程启动子线程
    }
}
```

### 规则 7：线程 join() 规则

主线程 A 调用子线程 B 的 `join()` 并成功返回后，线程 B 中的所有操作对主线程 A 可见。

```java
public class JoinHappenBefore {

    public static void main(String[] args) {
        int i = 0;
        Thread B = new Thread(() -> {
            i = 1;  // 此处对共享变量 i 修改
        });

        B.start();
        B.join();
        // 子线程所有对共享变量的修改
        // 在主线程调用 B.join() 之后皆可见
        // 此例中 i == 1
        System.out.println(i);
    }
}
```

### 怎么用它判断并发安全

有了这八条规则，判断一段代码有没有并发安全问题就有了可操作的路径：

1. **找出所有共享可变变量**——被多个线程读写、且至少有一个线程会写
2. **看每对「写 → 读」之间有没有 happens-before 关系**
3. **如果能用这八条规则串出关系**，那读线程就能看到写线程的值，是安全的
4. **如果串不出关系**，就存在可见性问题，需要补上 `volatile`、`synchronized` 或 `Lock` 来建立关系

最常见的误用，是**把 happens-before 当成「代码执行顺序」**。它的本质是可见性，不是时序：

> happens-before 的语义是一种因果关系。现实中如果 A 是 B 的起因，那么 A 一定先于 B 发生——这是它的现实理解。在 Java 里，A happens-before B 意味着 A 事件对 B 事件**可见**，无论两者是否在同一个线程。A 在线程 1、B 在线程 2 也一样，规则保证线程 2 能看到 A 的发生。

所以看到 `happens-before`，脑子里该浮现的是「可见」，而不是「先后」。真正的执行顺序，只要不改变结果，JVM 怎么排都可以。
