
## 设计模式

### 列举一些JDK中用到的设计模式？



### 列举一些Spring当中用到的设计模式？



### 项目中有用过设计模式吗？



### 单例模式有哪些实现方式？

#### 懒汉式

```java
public class Singleton {
    private static Singleton uniqueInstance;

    private Singleton() {
    }

    public static Singleton getUniqueInstance() {
        if (uniqueInstance == null) {
            uniqueInstance = new Singleton();
        }
        return uniqueInstance;
    }
}
```

说明：先不创建实例，当第一次被调用的时候，再创建实例，所以被称为懒汉式。

优点：延迟了实例化，如果不需要使用该类，就不会被实例化，节约了系统资源。

缺点：线程不安全，如果多个线程同时进入了`if(uniqueInstance == null)`，若此时还未实例化，就会有多个线程同时执行`uniqueInstance = new Singleton()`，会实例化多个对象。

#### 饿汉式

```java
public class Singleton {
    private static Singleton uniqueInstance = new Singleton();

    private Singleton() {
    }

    public static Singleton getUniqueInstance() {
        return uniqueInstance;
    }
}
```

说明：

优点：

缺点：

#### 双重检查锁

```java
public class Singleton {

    private volatile Singleton uniqueInstance;

    private Singleton() {}

    public Singleton getInstance() {
        if (null == this.uniqueInstance) {
           synchronized (Singleton.class) {
              if (null == this.singleDemo) {
                    uniqueInstance = new Singleton();
                }
            }
        Singleton = new Singleton();
        return uniqueInstance;
    }
}
```

说明：

优点：

缺点：

#### 静态内部类

```java
public class Singleton {

    private Singleton() {
    }

    public static Singleton getUniqueInstance() {
        return SingletonHolder.uniqueInstance;
    }

    private static class SingletonHolder {
        private static final Singleton uniqueInstance = new Singleton();
    }
}
```

说明：

优点：延迟实例化，节约了资源，且线程安全，性能也提高了。

#### 枚举类

```java
public enum Singleton {

    UNIQUE_INSTANCE;

    // 添加自己需要的操作
    public void doSomething() {

    }
}
```

说明：枚举类的实例就是线程安全的，且在任何情况下都是单例的。

优点：写法简单且线程安全。

### 单例模式有什么应用场景？

- 数据库连接池
- 线程池
- 网站计数器
- 应用的配置
