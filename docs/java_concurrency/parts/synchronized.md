---
title: synchronized 的用法
---

### synchronized 关键字

**思考：有了分布式锁，还有必要学习使用synchronized 和 Lock吗？**

#### synchronized 简介

synchronized 是 Java 的内置锁机制，用于实现线程同步，防止并发问题。它可作用于方法或代码块，确保同一时刻只有一个线程访问受保护代码。

#### 用法一：作用于实例方法

```java
public synchronized void instanceMethod() {
    // 代码
}
```

**效果**：锁定当前实例对象（this）。不同实例可并发执行同一方法，但同一实例的多个 synchronized 实例方法互斥。

**适用**：保护实例变量。

#### 用法二：作用于静态方法

```java
public static synchronized void staticMethod() {
    // 代码
}
```

**效果**：锁定类对象（Class）。所有实例共享此锁，静态方法互斥执行。

**适用**：保护静态变量。

#### 用法三：作用于类

```java
synchronized (ClassName.class) {
    // 代码
}
```

**效果**：等同静态方法锁，锁定类对象。用于非静态方法中实现类级同步。

**适用**：跨实例同步。

#### 用法四：作用于任意对象

```java
private final Object lock = new Object();

public void doSomething() {
    synchronized (lock) {
        // 受保护的代码
        count++;
    }
}
```

效果：锁定指定的对象（lock）。只有持有同一对象锁的线程才能互斥执行该代码块。

适用：细粒度控制、保护特定资源、不想锁整个实例或类时使用。

#### synchronized 与 Integer

```java
public class SynchronizedInteger {

    static void test() throws Exception {
        Integer lock1 = 100;           // 缓存对象
        Integer lock2 = 100;           // 同一个对象

        Thread t1 = new Thread(() -> {
            synchronized (lock1) {
                System.out.println("T1 got lock");
                sleep();
                System.out.println("T1 release");
            }
        });

        Thread t2 = new Thread(() -> {
            synchronized (lock2) {
                System.out.println("T2 got lock");
            }
        });

        t1.start();
        Thread.sleep(100);
        t2.start();
    }

    static void sleep() {
        try {
            Thread.sleep(3000);
        } catch (Exception ignored) {
        }
    }

    public static void main(String[] args) throws Exception {
        test();
    }
}
```

结果：T2 必须等 T1 睡完 3 秒才能打印，意外串行。

#### synchronized 与 String

```java
public class SynchronizedString {

    static void test() throws Exception {
        String lockA = "GLOBAL_LOCK";   // 常量池同一对象
        String lockB = "GLOBAL_LOCK";   // 同一对象

        Thread t1 = new Thread(() -> {
            synchronized (lockA) {
                System.out.println("T1 got lock");
                sleep();
                System.out.println("T1 release");
            }
        });

        Thread t2 = new Thread(() -> {
            synchronized (lockB) {
                System.out.println("T2 got lock");
            }
        });

        t1.start();
        Thread.sleep(100);
        t2.start();
    }

    static void sleep() {
        try {
            Thread.sleep(3000);
        } catch (Exception ignored) {
        }
    }

    public static void main(String[] args) throws Exception {
        test();
    }
}
```

结果：T2 被阻塞，直到 T1 结束 ，不同类/模块间意外互斥。

#### synchronized 使用总结

| 使用场景     | 锁对象      | 适用情况                       |
| ------------ | ----------- | ------------------------------ |
| 同步实例方法 | this        | 保护整个实例方法               |
| 同步代码块   | 自定义对象  | 保护部分代码，灵活性更高       |
| 同步静态方法 | Class 对象  | 保护类级别的静态资源           |
| 同步类对象   | Class 对象  | 在实例方法中保护静态资源       |
| 同步不同实例 | 各自的 this | 实例级独立同步，不干扰其他实例 |
