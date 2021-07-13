---
title: Spring AOP
date: 2021-06-29
tags: Spring
author: 吉永超
---

AOP（Aspect Oriented Programming）面向切面编程，是针对面向对象编程的一种补充，同时也是spring中第二个最核心的功能。

<!-- more -->

# Spring AOP总览

## 知识储备

### Java 基础部分

- Java 类加载器
- Java 动态代理
- Java 反射
- 字节码框架：ASM、CGLB

类加载器的示例：

```java
public class ClassLoaderDemo {
    public static void main(String[] args) {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        System.out.println(classLoader);

        ClassLoader parent = classLoader;
        while (true) {
            parent = parent.getParent();
            if (parent == null) {
                break;
            }
            System.out.println(parent);
        }
    }
}
```

可以看到，这里我们使用的其实就是AppClassLoader，而AppClassLoader又继承了URLClassLoader，因此在使用loadClass方法加载类文件的时候，通过我们只需要传递类全名即可，而无需获取全路径。

关于字节码框架部分，Spring内连了ASM框架。

![image-20210712104930912](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210712104931.png)

### OOP 部分

- 封装
- 继承
- 多态

### GOF23 设计模式

创建模式：

- 抽象工程模式
- 构建器模式
- 工厂方法模式
- 原型模式
- 单例模式

结构模式：

- 适配器模式
- 桥接模式
- 组合模式
- 装饰器模式
- 门面模式
- 亨元模式
- 代理模式

行为模式：

- 模板方法模式
- 中继器模式
- 责任链模式
- 观察者模式
- 策略模式
- 命令模式
- 状态模式
- 访问者模式
- 解释器模式、迭代器模式、备忘录模式

### Spring 核心基础

- Spring IoC容器
- Spring Bean生命周期
- Spring 配置元信息
- Spring 事件
- Spring 注解

## OOP局限性

Java OOP存在哪些局限性？

- 静态化语言：类结构一旦定义，不容易被修改
- 侵入性扩展：通过继承和组合组织新的类结构

> 静态语言即强类型语言，是指在编译时变量的数据类型即可确定的语言，典型的代表有C++、Java、Delphi、C#等。

## AOP常见使用场景

### 日志场景

- 诊断上下文，如：log4j或logback中的MDC
- 辅助信息，如：方法执行时间

### 统计场景

- 方法调用次数
- 执行异常次数
- 数据抽样
- 数值累加

### 安防场景

- 熔断，如：Netflix Hystrix
- 限流和降级：如：Ablibba Sentinel
- 认证和授权，如：Spring Security
- 监控，如JMX

### 性能场景

- 缓存，如Spring Cache
- 超时控制

## AOP概念

- 切面（Aspect）：一个关注点的模块化，在Spring AOP中。
- 连接点（Join Point）：在程序执行过程中某个特定的点，比如方法调用的时候或异常处理的时候。
- 通知（Advice）：在切面的某个特定的连接点上执行的动作。
- 切入点（Pointcut）：匹配连接点的断言，通知和一个切入点表达式关联，并在满足这个切入点的连接点上运行。
- 织入（Weaving）：把切面连接到其他应用程序类型或者对象上，并创建一个被通知的对象。

## Java AOP设计模式

代理模式：静态和动态代理

判断模式：类、方法、注解、参数、异常....

拦截模式：前置、后置、返回、异常

## 代理模式

Java静态代理的实现方式：

- 常用OOP继承和组合相结合

Java动态代理的实现方式：

- JDK动态代理
- 字节码提升，如CGLIB

无论是静态代理还是动态代理都是基于接口，首先定义一个接口：

```java
public interface EchoService {

    String echo(String message) throws NullPointerException;
}

```

编写这个接口的默认实现：

```java
public class DefaultEchoService implements EchoService {
    @Override
    public String echo(String message) {
        return "[ECHO]" + message;
    }
}
```

静态代理类：

```java
public class ProxyEchoService implements EchoService {

    private EchoService echoService;

    public ProxyEchoService(EchoService echoService) {
        this.echoService = echoService;
    }

    @Override
    public String echo(String message) {
        long startTime = System.currentTimeMillis();
        String result = echoService.echo(message);
        long costTime = System.currentTimeMillis() - startTime;
        System.out.println("echo方法执行时间: " + costTime);
        return result;
    }
}
```

使用静态代理类的示例：

```java
public class StaticProxyDemo {
    public static void main(String[] args) {
        ProxyEchoService proxyEchoService = new ProxyEchoService(new DefaultEchoService());
        proxyEchoService.echo("hello world");
    }
}
```

动态代理的示例：

```java
public class JdkDynamicProxyDemo {
    public static void main(String[] args) {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Object proxy = Proxy.newProxyInstance(classLoader, new Class[]{EchoService.class}, new InvocationHandler() {

            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                if (EchoService.class.isAssignableFrom(method.getDeclaringClass())) {
                    ProxyEchoService echoService = new ProxyEchoService(new DefaultEchoService());
                    return echoService.echo((String) args[0]);
                }
                return null;
            }
        });
        EchoService echoService = (EchoService) proxy;
        echoService.echo("hello world");
    }
}
```

## 判断模式

判断来源：

类型（Class）、方法（Method）、注解（Annotation）、参数（Parameter）、异常（Exception）

在EchoService#echo中抛出一个异常：

```java
public interface EchoService {

    String echo(String message) throws NullPointerException;
}

```

判断模式的示例：

```java
public class TargetFilterDemo {
    public static void main(String[] args) throws ClassNotFoundException {
        String targetClassName = "org.jyc.thinking.in.spring.aop.overview.EchoService";
        // 获取当前线程ClassLoader
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        // 获取目标类
        Class<?> targetClass = classLoader.loadClass(targetClassName);
        // 过滤名称
        Method method = ReflectionUtils.findMethod(targetClass, "echo", String.class);
        System.out.println(method);

        // 查找方法throws类型为 NullPointerException
        ReflectionUtils.doWithMethods(targetClass, method1 -> {
            System.out.println("仅抛出NullPointerException的方法为：" + method1);
        }, method2 -> {
            Class<?>[] parameterTypes = method2.getParameterTypes();
            Class<?>[] exceptionTypes = method2.getExceptionTypes();
            // 异常列表长度为1并且异常类型为NullPointerException，参数列表为1并且，参数类型为String的方法
            return exceptionTypes.length == 1 && NullPointerException.class.equals(exceptionTypes[0])
                    && parameterTypes.length == 1 && String.class.equals(parameterTypes[0]);
        });
    }
}
```

## 拦截模式

