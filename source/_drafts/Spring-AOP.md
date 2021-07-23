---
title: Spring AOP
date: 2021-06-29
tags: Spring
author: 吉永超
---

AOP（Aspect Oriented Programming）面向切面编程，是针对面向对象编程的一种补充，同时也是Spring中第二个最核心的功能。在学习AOP之前，可以首先了解有关于Spring IoC的相关内容：[Spring Framework](https://jycoder.club/2020/07/16/SpringFramework/)

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

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210718125653.jpeg" style="zoom:50%;" />

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
- AspectJ

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

拦截类型大致分为三种：

- 前置拦截（Before）
- 后置拦截（After）
- 异常拦截（Exception）

定义前置拦截器：

```java
public interface BeforeInterceptor {
    Object before(Object proxy, Method method,Object[] args);
}
```

定义后置拦截器：

```java
public interface FinallyInterceptor {
    /**
     * @param returnResult 方法的返回结果
     */
    Object finalize(Object proxy, Method method, Object[] args, Object returnResult);
}
```

定义异常拦截器：

```java
public interface FinallyInterceptor {
    /**
     * @param returnResult 方法的返回结果
     */
    Object finalize(Object proxy, Method method, Object[] args, Object returnResult);
}
```

使用以上拦截器的示例：

```java
public class AopInterceptorDemo {
    public static void main(String[] args2) {
        // 前置模式 + 后置模式
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        Object proxy2 = Proxy.newProxyInstance(classLoader, new Class[]{EchoService.class}, (proxy, method, args) -> {
            if (EchoService.class.isAssignableFrom(method.getDeclaringClass())) {
                // 前置拦截器
                BeforeInterceptor beforeInterceptor = new BeforeInterceptor() {
                    @Override
                    public Object before(Object proxy, Method method, Object[] args) {
                        return System.currentTimeMillis();
                    }
                };
                Long startTime = 0L;
                Long endTime = 0L;
                Object result = null;
                try {
                    // 前置拦截
                    startTime = (Long) beforeInterceptor.before(proxy, method, args);
                    EchoService echoService = new DefaultEchoService();
                    result = echoService.echo((String) args[0]);
                    // 方法执行后置拦截器
                    AfterReturnInterceptor afterReturnInterceptor = new AfterReturnInterceptor() {
                        @Override
                        public Object after(Object proxy, Method method, Object[] args, Object returnResult) {
                            return System.currentTimeMillis();
                        }
                    };
                    endTime = (Long) afterReturnInterceptor.after(proxy, method, args, result);
                } catch (Exception e) {
                    // 异常拦截器
                    ExceptionInterceptor exceptionInterceptor = new ExceptionInterceptor() {
                        @Override
                        public void intercpt(Object proxy, Method method, Object[] args, Throwable throwable) {
                            // ...
                        }
                    };
                } finally {
                    // finally 后置拦截器
                    FinallyInterceptor finallyInterceptor = new TimeFinallyInterceptor(startTime, endTime);
                    Long costTime = (Long) finallyInterceptor.finalize(proxy, method, args, result);
                    System.out.println("echo方法执行时间: " + costTime);
                }
            }
            return null;
        });
        EchoService echoService = (EchoService) proxy2;
        echoService.echo("hello world");
    }
}

class TimeFinallyInterceptor implements FinallyInterceptor {

    private Long startTime;

    private Long endTime;

    public TimeFinallyInterceptor(Long startTime, Long endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    @Override
    public Object finalize(Object proxy, Method method, Object[] args, Object returnResult) {
        return endTime - startTime;
    }
}
```

## Spring AOP 功能概述

核心特性：

- 纯Java实现、无编译时特殊处理，不修改和控制ClassLoader
- 仅支持方法级别的Join Points
- 非完整AOP实现框架
- Spring IoC容器整合
- AspectJ注解驱动整合（非竞争关系）

## Spring AOP编程模型

Spring AOP编程模型也主要分为三种：注解驱动、XML配置驱动和底层API

注解驱动：

- 实现：Enable模块驱动，@EnableAspectJAutpProxy
- 注解：
	- 激活AspectJ自动代理：@EnableAspectJAutoProxy
	- Aspect：@Aspect
	- pointcut：@Pointcut
	- Advice：@Before、@AfterReturning、@AfterThrowing、@After、@Around
	- introduction：@DeclareParents

XML配置驱动：

- 实现：Spring Extensble XML Authoring
- XML元素
	- 激活AspectJ自动代理：<aop:aspectj-autoproxy />
	- 配置：<aop:config />
	- Aspect：<aop:aspect />
	- Pointcut：<aop:pointcut />
	- Advice：<aop:around />、<aop:before />、<aop:after-returning />、<aop:after-throwing />和<aop:after />
	- introduction：<aop:declare-parents />
	- 代理Scope：<aop:scoped-proxy />

底层API：

- 实现：JDK动态代理、CGLIB以及AspectJ

- API：

	- 代理：AopProxy
	- 配置：ProxyConfig
	- Join Point：JoinPoint
	- Pointcut：Ponintcut
	- Advice：Advice、BeforeAdvice、AfterAdvice、AfterReturningAdvice、ThrowsAdvice

## Spring AOP Advice类型

Advice类型：环绕（Around）、前置（Before）、后置（After）、异常（Exception），其中后置又包括了方法执行和finally执行两种。

## Spring AOP代理实现

Spring AOP的代理实现主要有三种：

- JDK动态代理实现 - 基于接口代理
	- org.springframework.aop.framework.JdkDynamicAopProxy
- CGLIB动态代理实现 - 基于类代理（字节码提升）
	- org.springframework.aop.framework.CglibAopProxy
- AspectJ适配实现
	- org.springframework.aop.aspectj.annotation.AspectJProxyFactory

无论是哪一种实现，都实现了AopProxy接口，并且实现类都是非public的。

## JDK动态代理

为什么Proxy.newProxyInstance会生成新的字节码？

![image-20210714132854720](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210714132854.png)

JDK会操作字符数组，生成一个代理类的Class对象。

## CGLIB动态代理

在Java中，面向对象通常而言指的是面向接口编程，或者也可以认为是面向锲约编程，JDK的动态代理会依赖于接口的定义，在没有定义接口的情况，还要实现AOP的功能，就需要CGLIB动态代理来实现。

使用CGLIB动态代理的示例：

```java
public class CglibDynamicProxyDemo {
    public static void main(String[] args) {
        Enhancer enhancer = new Enhancer();
        // 指定super Class = DefaultEchoService.class
        Class<DefaultEchoService> superClass = DefaultEchoService.class;
        enhancer.setSuperclass(superClass);
        // 指定拦截接口
        enhancer.setInterfaces(new Class[]{EchoService.class});
        enhancer.setCallback(new MethodInterceptor() {
            @Override
            public Object intercept(Object source, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
                long startTime = System.currentTimeMillis();
                // Source -> CGLIB子类
                // 目标类 -> DefaultEchoService
                // 错误使用
//                Object result = method.invoke(source, args);
                Object result = methodProxy.invokeSuper(source, args);
                long costTime = System.currentTimeMillis() - startTime;
                System.out.println("[CGLIB字节码提升]echo方法执行时间: " + costTime);
                return result;
            }
        });
        // 创建代理对象
        EchoService echoService = (EchoService)enhancer.create();
        // 输出结果
        System.out.println(echoService.echo("hello world"));
    }
}
```

## AspectJ代理

借助于AspectJ强大的编译器，AspectJ有一套自己的语法，AspectJ的主要语法有：Aspect、Join Points、Pointcuts、Advice、introduction。

在注解方面，Spring和AspectJ的注解名称是相同的，不过在具体处理的时候略有差异。

## 面试题

### Spring AOP和AspectJ AOP存在哪些差别？

- Aspect是AOP完整实现，Spring AOP则是部分实现
- Spring AOP比AspectJ使用更简单
- Spring AOP整合AspectJ注解与Spring IoC容器
- Spring AOP仅支持基于代理模式的AOP
- Spring AOP仅支持方法级别的Pointcuts

# Spring AOP基础

## @AspectJ注解驱动

激活@AspectJ模块的方式：

- 注解激活 - @EnableAspectJAutoProxy
- XML配置 - <aop:aspectj-autoproxy />

> 如果使用的是SpringBoot，直接引入相关依赖就会自动激活，无需上述操作。

声明Aspect：

- @Aspect

使用注解激活的示例：

```java
@Configuration
@Aspect // 声名为切面类
@EnableAspectJAutoProxy // 激活Aspect 注解自动代理
public class AspectJAnnotationDemo {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(AspectJAnnotationDemo.class);
        context.refresh();
        AspectJAnnotationDemo aspectJAnnotationDemo = context.getBean(AspectJAnnotationDemo.class);
        System.out.println(aspectJAnnotationDemo);
        context.close();
    }
}
```

类似的，使用XML方式激活：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/aop
       http://www.springframework.org/schema/beans/spring-aop.xsd">

    <aop:aspectj-autoproxy />
</beans>
```

测试激活结果：

```java
@Configuration
@Aspect // 声名为切面类
public class AspectJXmlDemo {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath:/META-INF/spring-aop-context.xml");
        AspectJXmlDemo aspectJXmlDemo = context.getBean(AspectJXmlDemo.class);
        System.out.println(aspectJXmlDemo);
        context.close();
    }
}
```

## 编程方式创建@AspectJ代理

实现类：org.springframework.aop.aspectj.annotation.AspectJProxyFactory

使用的示例：

```java
public class AspectJAnnotationUsingAPIDemo {
    public static void main(String[] args) {
        // 通过创建一个HashMap的缓存
        Map<String, Object> cache = new HashMap<>();
        // 创建proxy
        AspectJProxyFactory proxyFactory = new AspectJProxyFactory();
        // 增加Aspect 配置类
        proxyFactory.addAspect(AspectConfiguration.class);

        proxyFactory.addAdvice(new MethodBeforeAdvice() {
            @Override
            public void before(Method method, Object[] args, Object target) throws Throwable {
                if ("put".equals(method.getName()) && args.length == 2) {
                    System.out.printf("当前存放是key：%s，value：%s \n", args[0], args[1]);
                }
            }
        });
        // 直接存储
//        cache.put("1", "A");
        // 通过代理对象存储
        Map<String, Object> proxy = proxyFactory.getProxy();
        proxy.put("1", "A");
        System.out.println(cache.get("1"));
    }
}
```

## 标准工厂API

实现类：org.springframework.aop.framework.ProxyFactory

相关的示例：

```java
public class ProxyFactoryDemo {
    public static void main(String[] args) {
        DefaultEchoService defaultEchoService = new DefaultEchoService();
        // 注入目标对象（被代理）
        ProxyFactory proxyFactory = new ProxyFactory(defaultEchoService);
        // 如果对象存在接口的话，生成的代理对象还是JDK动态代理的
        proxyFactory.setTarget(DefaultEchoService.class);
        // 添加Advice
        proxyFactory.addAdvice(new EchoServiceMethodInterceptor());
        // 获取代理对象
        EchoService echoService = (EchoService)proxyFactory.getProxy();
        System.out.println(echoService.echo("hello world"));
    }
}
```

## @AspectJ Pointcut指令与表达式



支持的指令：execution、within、this、target、args。

> pointcut只是用来筛选，而不会执行具体的动作，具体的动作由advice来执行，并且是一对多的关系。在Spring当中，pointcut的名称就是对应方法的名称。

首先完善之前的Aspect的配置类：

```java
@Aspect
public class AspectConfiguration {

    @Pointcut("execution(public * *(..))")  // 匹配Join Point
    private void anyPublicMethod() { // 方法名即Pointcut名称
        System.out.println("@Pointcut at any public method");
    }

    @Before("anyPublicMethod()") // Join Point拦截动作
    public void beforeAnyPublicMethod() {
        System.out.println("@Before any public method.");
    }
}
```

观察配置类的起的作用：

```java
@Configuration
@EnableAspectJAutoProxy
public class AspectJAnnotatedPointcutDemo {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(AspectJAnnotatedPointcutDemo.class, AspectConfiguration.class);
        context.refresh();
        AspectJAnnotatedPointcutDemo aspectJAnnotationDemo = context.getBean(AspectJAnnotatedPointcutDemo.class);
        aspectJAnnotationDemo.execute();
        context.close();
    }

    public void execute() {
        System.out.println("execute()...");
    }
}
```

可以看到Pointcut对应的方法并没有被执行，这也验证了我们前面的结论。通常情况下，我们会将这个Pointcut声明的方法定义为private，并且方法当中没有实现，然后再advice当中引用。

## XML配置Pointcut

XML配置的方式：<aop:pointcut />

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans
        xmlns="http://www.springframework.org/schema/beans"
        xmlns:aop="http://www.springframework.org/schema/aop"
        xmlns:context="http://www.springframework.org/schema/context"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/aop
        https://www.springframework.org/schema/aop/spring-aop.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd">

    <aop:aspectj-autoproxy/>

    <bean id="aspectXmlConfig" class="org.jyc.thinking.in.spring.aop.features.aspect.AspectXmlConfiguration"/>

    <aop:config>
        <aop:aspect id="AspectXmlConfig" ref="aspectXmlConfig">
            <aop:pointcut id="anyPublicMethod" expression="execution(public * *(..))"/>
            <aop:before method="beforeAnyPublicMethod" pointcut-ref="anyPublicMethod"/>
        </aop:aspect>
    </aop:config>


    <bean id="echoService" class="org.jyc.thinking.in.spring.aop.overview.DefaultEchoService"/>

</beans>
```

观察使用XML方式来实现Pointcut：

```java
@Configuration
public class AspectJSchemaBasedPointcutDemo {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath:/META-INF/spring-aop-context.xml");
        context.refresh();
        EchoService echoService = context.getBean(EchoService.class);
        System.out.println(echoService.echo("hello world"));
        context.close();
    }
}
```

使用注解能够实现的，XML方式也都能实现。

## API实现Pointcut

核心API - org.springframework.aop.Pointcut，其中有两个方法：

- org.springframework.aop.ClassFilter
- org.springframework.aop.MethodMatcher

适配实现 - DefaultPointcutAdvisor

相关的示例：

```java
public class PointcutApiDemo {
    public static void main(String[] args) {
        EchoServicePointcut pointcut = new EchoServicePointcut("echo", EchoService.class);
        // 将Pointcut适配成Advisor
        DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, new EchoServiceMethodInterceptor());
        DefaultEchoService defaultEchoService = new DefaultEchoService();
        ProxyFactory proxyFactory = new ProxyFactory(defaultEchoService);
        // 添加Advisor
        proxyFactory.addAdvisor(advisor);
        EchoService echoService = (EchoService) proxyFactory.getProxy();
        System.out.println(echoService.echo("hello world"));
    }
}
```

这里要注意的是，不能直接创建Pointcut对象，而是要通过适配的方式间接实现。

## @AspectJ拦截动作

@Around 与@Before有什么区别呢？

首先我们在AspectConfiguration中定义一个@Around：

```java
    @Around("anyPublicMethod()")
    public void aroundAnyPublicMethod() {
        System.out.println("@Around any public method.");
    }
```

运行时会发现，除了这行输出外没有其他任何信息，修改这个方法：

```java
    @Around("anyPublicMethod()")
    public Object aroundAnyPublicMethod(ProceedingJoinPoint pjp) throws Throwable{
        System.out.println("@Around any public method.");
        return pjp.proceed();
    }
```

可以看到所有的信息均已成功打印，这是因为，@Around需要去显式的触发目标方法，而@Before则不用。

## XML配置Around Advice

XML配置方式：<aop:around />

类似的，我们将之前的aroundAnyPublicMethod方法添加到AspectXmlConfiguration，然后在XML中配置

```xml
  <aop:around method="aroundAnyPublicMethod" pointcut-ref="anyPublicMethod"/>
```

## @AspectJ的前置动作

Before Advice注解 - org.aspectj.lang.annotation.Before

@Before与@Around谁优先执行？

通过输出结果可以观察到，@Around先于@Before执行，这也是为什么Spring API里面没有提供@Around的Advice接口，因为它实际上都是通过拦截模式来操作的，只是@Before和@After以及@Around是不同的实现，所以不需要每一个单独有一个接口。

如果有多个@Before声明后，如何控制它们的顺序呢？答案是可以通过实现org.springframework.core.Ordered接口，或者使用@Order注解。

```java
@Aspect
public class AspectConfiguration2 implements Ordered {

    @Pointcut("execution(public * *(..))")
    private void anyPublicMethod() {
    }

    @Before("anyPublicMethod()") // Join Point拦截动作
    public void beforeAnyPublicMethod2() {
        System.out.println("@Before any public method.(2)");
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
```

这个时候程序执行的顺序就发生了变化，beforeAnyPublicMethod2优先于@Around方法执行了。要注意的是，这里不能定义最高优先级HIGHEST_PRECEDENCE。

## XML配置Before Advice

XML元素的标签 - <aop:before >

- 声明规则

	```xml
	<aop:config>
	    <aop:aspect>
	        <aop:before>
	```

- 属性设置（来源于Spring AOP Schema类型basicAdviceType）

	- pointcut：Pointcut表达式内容
	- pointcut-ref：Pointcut表达式名称

	## API实现Before Advice

	

 核心接口 - org.springframework.aop.BeforeAdvice

- 类型：标记接口，与org.aopalliance.aop.Advice类似
- 方法JoinPoint扩展 - org.springframework.aop.MethodBeforeAdvice
- 接收对象 - org.springframework.aop.framework.AdvisedSupport
	- 基础实现类 - org.springframework.aop.framework.ProxyCreatorSupport
		- 常见实现类：
			- org.springframework.aop.framework.ProxyFactory
			- org.springframework.aop.framework.ProxyFactoryBean
			- org.springframework.aop.aspectj.annotation.AspectJProxyFactory

## @Aspect后置动作

After Advice注解：

- 方法返回后：@org.aspectj.lang.annotation.AfterReturning
- 异常发生后：@org.aspectj.lang.annotation.AfterThrowing
- finally执行：org.aspectj.lang.annotation.After

```java
	@After("anyPublicMethod()")
    public void finalizeAnyPublicMethod() {
        System.out.println("@After any public method.");
    }
    
    @AfterReturning("anyPublicMethod()")
    public void afterAnyPublicMethod() {
        System.out.println("@AfterReturning any public method.");
    }

    @AfterThrowing("anyPublicMethod()")
    public void afterThrowingAnyPublicMethod() {
        System.out.println("@AfterThrowing any public method.");
    }
```

其中@After方法会最后会被执行， @AfterThrowing会在方法抛出异常的时候执行。

## XML配置After Advice

XML元素 - <aop:after >

- 声明规则

	```xml
	<aop:config>
	    <aop:aspect>
	        <aop:after>
	```

- 属性设置（来源于Spring AOP Schema类型 basicAdviceType）

	- pointcut：Pointcut表达式内容
	- pointcut-ref：Pointcut表达式名称

 配置示例：

```xml
<aop:after method="finalizeAnyPublicMethod" pointcut-ref="anyPublicMethod"/>
<aop:after-returning method="afterAnyPublicMethod" pointcut-ref="anyPublicMethod"/>
<aop:after-throwing method="afterThrowingAnyPublicMethod" pointcut-ref="anyPublicMethod"/>
```

## API实现After Advice

核心接口 - org.springframework.aop.AfterAdvice

- 类型：标记接口，与org.aopalliance.aop.Advice类似
- 扩展
	- org.springframework.aop.AfterReturningAdvice
	- org.springframework.aop.ThrowsAdvice
- 接收对象 - org.springframework.aop.framework.AdvisedSupport
	- 基础实现类 - org.springframework.aop.framework.ProxyCreatorSupport
		- 常见实现类
			- org.springframework.aop.framework.ProxyFactory
			- org.springframework.aop.framework.ProxyFactoryBean
			- org.springframework.aop.aspectj.annotation.AspectJProxyFactory

相关的示例：

```java
    proxyFactory.addAdvice(new AfterReturningAdvice() {
        @Override
        public void afterReturning(Object returnValue, Method method, Object[] args, Object target) throws Throwable {
            if ("put".equals(method.getName()) && args.length == 2) {
                System.out.printf("[AfterReturningAdvice]当前存放是key：%s，新存放的value：%s \n,之前关联的Value：%s",
                                  args[0], // key
                                  args[1], // new value
                                  returnValue // old value
                                 );
            }
        }
    });
```

## 自动动态代理

代表实现

- org.springframework.aop.framework.autoproxy.BeanNameAutoProxyCreator
- org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator
- org.springframework.aop.aspectj.annotation.AnnotationAwareAspectJAutoProxyCreator

相关的示例：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans
        xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="echoService" class="org.jyc.thinking.in.spring.aop.overview.DefaultEchoService"/>

    <!-- Advice Bean = MethodInterceptor Bean -->
    <bean id="echoServiceMethodInterceptor"
          class="org.jyc.thinking.in.spring.aop.features.interceptor.EchoServiceMethodInterceptor"/>

<!--        <bean class="org.springframework.aop.framework.autoproxy.BeanNameAutoProxyCreator">-->
<!--            <property name="beanNames" value="*"/>-->
<!--            <property name="interceptorNames">-->
<!--                <value>echoServiceMethodInterceptor</value>-->
<!--            </property>-->
<!--        </bean>-->

    <!--  AutoProxy Bean  -->
    <bean class="org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator"/>

    <!-- Pointcut Bean -->
    <bean id="echoServicePointcut" class="org.jyc.thinking.in.spring.aop.features.pointcut.EchoServicePointcut">
        <constructor-arg index="0" value="echo"/>
        <constructor-arg index="1" value="org.jyc.thinking.in.spring.aop.overview.EchoService"/>

    </bean>

    <!-- PointcutAdvisor Bean -->
    <bean class="org.springframework.aop.support.DefaultPointcutAdvisor">
        <constructor-arg index="0" ref="echoServicePointcut"/>
        <constructor-arg index="1" ref="echoServiceMethodInterceptor"/>
    </bean>
</beans>
```

## 替换TargetSource

TargetSource（目标源）是被代理的target（目标对象）实例的来源。TargetSource被用于获取当前MethodInvocation（方法调用）所需要的目标对象target。换句话说，proxy代理的并不是target，而是targetSource对象。

通常情况下，一个代理对象只能代理一个target，每次方法调用目标也是唯一的target。但是如果让proxy代理TargetSource，可以使得每次方法调用的target实例都不相同。采用这种机制，可以使得方法的调用更加灵活。

代表实现：

- org.springframework.aop.target.HotSwappableTargetSource
- org.springframework.aop.target.AbstractPoolingTargetSource
- org.springframework.aop.target.PrototypeTargetSource
- org.springframework.aop.target.ThreadLocalTargetSource
- org.springframework.aop.target.SingletonTargetSource

## 面试题

### Spring AOP支持哪些类型的Advice？

- Around Advice
- Before Advice
- After Advice
	- After
	- AfterReturning
	- AfterThrowing

### Spring AOP编程模型有哪些，代表组件有哪些？

注解驱动：解释和整合AspectJ注解，如@EnableAspectJAutoProxy

XML配置：AOP与IoC Schema-Based相结合

API编程：如JoinPoint、Pointcut、Advice和ProxyFactory等

### Spring AOP三种实现方式是如何进行设计的？

// ...

# Spring AOP设计与实现

## API整体设计



- Join Point - Joinpoint
- Pointcut - Pointcut
- Advice执行动作 - Advice
- Advice容器 - Advisor
- Introduction - IntroductionInfo
- 代理对象创建基础类 - ProxyCreatorSupport
- 代理工厂 - ProxyFactory、ProxyFactorySupport
- IoC容器自动代理抽象 - AbstractAutoProxyCreator

## 接入点接口Joinpoint

Interceptor执行上下文 - Invocation

- 方法拦截器上下文 - MethodInvocation
- ~~构造器拦截器执行上下文 - ContructorInvocation~~

MethodInvocation实现

- 基于反射 - ReflectiveMethodInvocation
- 基于CGLIB实现 - CglibMethodInvocation

> Spring AOP仅支持方法级别的拦截，构造器拦截只有在AspectJ中有相应的实现。

## Joinpoint条件接口

核心组件：

- 类过滤器 - ClassFilter
- 方法匹配器 - MethodMatcher

可以直接实现这个接口：

```java
public class EchoServiceEchoMethodPointcut implements Pointcut {

    public static final EchoServiceEchoMethodPointcut INSTANCE = new EchoServiceEchoMethodPointcut();

    private EchoServiceEchoMethodPointcut() {
        
    }

    @Override
    public ClassFilter getClassFilter() {

        return new ClassFilter() {
            @Override
            public boolean matches(Class<?> clazz) {
                return EchoService.class.isAssignableFrom(clazz); // 凡是EchoService接口或者子接口，子类均可
            }
        };
    }

    @Override
    public MethodMatcher getMethodMatcher() {
        return new MethodMatcher() {
            @Override
            public boolean matches(Method method, Class<?> targetClass) { // echo(String)
                return "echo".equals(method.getName()) &&
                        method.getParameterTypes().length == 1 &&
                        Objects.equals(String.class, method.getParameterTypes()[0]);
            }

            @Override
            public boolean isRuntime() {
                return false;
            }

            @Override
            public boolean matches(Method method, Class<?> targetClass, Object... args) {
                return false;
            }
        };
    }
}
```

测试拦截的效果：

```java
public class PointcutApiDemo {
    public static void main(String[] args) {
        EchoServiceEchoMethodPointcut pointcut = EchoServiceEchoMethodPointcut.INSTANCE;
        // 将Pointcut适配成Advisor
        DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, new EchoServiceMethodInterceptor());
        DefaultEchoService defaultEchoService = new DefaultEchoService();
        ProxyFactory proxyFactory = new ProxyFactory(defaultEchoService);
        // 添加Advisor
        proxyFactory.addAdvisor(advisor);
        EchoService echoService = (EchoService) proxyFactory.getProxy();
        System.out.println(echoService.echo("hello world"));
    }
}
```

## Pointcut组合实现

组合实现 - org.springframework.aop.support.ComposablePointcut

这个API在实现的时候使用了一些工具类：

- ClassFilter工具类 - ClassFilters
- MethodMatcher工具类 - MethodMatchers
- Pointcut工具类 - Pointcuts

其中有两个核心方法：

```java
	/**
	 * 求并集
	*/
	public ComposablePointcut union(Pointcut other) {
		this.methodMatcher = MethodMatchers.union(
				this.methodMatcher, this.classFilter, other.getMethodMatcher(), other.getClassFilter());
		this.classFilter = ClassFilters.union(this.classFilter, other.getClassFilter());
		return this;
	}

	/**
	 * 求交集
	 */
	public ComposablePointcut intersection(Pointcut other) {
		this.classFilter = ClassFilters.intersection(this.classFilter, other.getClassFilter());
		this.methodMatcher = MethodMatchers.intersection(this.methodMatcher, other.getMethodMatcher());
		return this;
	}
```

组合Pointcut的示例：

```java
public class PointcutApiDemo {
    public static void main(String[] args) {
        EchoServicePointcut echoServicePointcut = new EchoServicePointcut("echo", EchoService.class);
        ComposablePointcut pointcut = new ComposablePointcut(EchoServiceEchoMethodPointcut.INSTANCE);
        // 组合实现
        pointcut.intersection(echoServicePointcut.getClassFilter());
        pointcut.intersection(echoServicePointcut.getMethodMatcher());
        // 将Pointcut适配成Advisor
        DefaultPointcutAdvisor advisor = new DefaultPointcutAdvisor(pointcut, new EchoServiceMethodInterceptor());
        DefaultEchoService defaultEchoService = new DefaultEchoService();
        ProxyFactory proxyFactory = new ProxyFactory(defaultEchoService);
        // 添加Advisor
        proxyFactory.addAdvisor(advisor);
        EchoService echoService = (EchoService) proxyFactory.getProxy();
        System.out.println(echoService.echo("hello world"));
    }
}
```

## Pointcut便利实现

通常而言，有三种Pointcut便利实现：

- 静态Pointcut - StaticMethodMatcherPointcut
- 正则表达式Pointcut - JdkRegexpMethodPointcut
- 控制流Pointcut - ControlFlowPointcut

## Pointcut AspectJ实现

实现类 - org.springframework.aop.aspectj.AspectJExpressionPointcut

指令支持 - SUPPORTED_PRIMITIVES字段

表达式 - org.aspectj.weaver.tools.PointcutExpression

> Spring当中并没有定义新的AOP表达式，而是使用了AspectJ的实现。

## Joinpoint执行动作接口

Around Advice - Interceptor

- 方法拦截器 - MethodInterceptor
- 构造器拦截器 - ControInterceptor

前置动作

- 标准接口 - org.springframework.aop.BeforeAdvice
- 方法级别 - org.springframework.aop.MethodBeforeAdvice

后置动作

- org.springframework.aop.AfterAdvice
- org.springframework.aop.AfterReturningAdvice
- org.springframework.aop.ThrowsAdvice

> Interceptor就可以认为是AroundAdvice。

## Before Advice标准实现

所谓标准实现，是指Spring在引入AspectJ之前的AOP实现。

- 标准接口 - org.springframework.aop.BeforeAdvice
- 方法级别 - org.springframework.aop.MethodBeforeAdvice

实现：org.springframework.aop.framework.adapter.MethodBeforeAdviceInterceptor

> 用户实现的BeforeAdvice和MethodBeforeAdvice会被包装成MethodBeforeAdviceInterceptor，在Spring AOP框架内部进行执行。

## Before Advice AspectJ实现

实现类 - org.springframework.aop.aspectj.AspectJMethodBeforeAdvice

## After Advice标准实现

相关的接口：

- org.springframework.aop.AfterAdvice
- org.springframework.aop.AfterReturningAdvice
- org.springframework.aop.ThrowsAdvice

实现类：

- org.springframework.aop.framework.adapter.ThrowsAdviceInterceptor
- org.springframework.aop.framework.adapter.AfterReturningAdviceInterceptor

我们可以自己实现一个ThrowsAdvice：

```java
public class MyThrowsAdvice implements ThrowsAdvice {
    // 方法名称必须为afterThrowing
    public void afterThrowing(RuntimeException e) {
        System.out.printf("Exception: %S/n", e);
    }

    public void afterThrowing(Method method, Object[] args, Object target, Exception e) {
        System.out.printf("method : %s,args: %s,Exception: %S/n",
                method,
                Arrays.asList(args),
                target,
                e);
    }
}
```

观察结果：

```java
public class ThrowsAdviceDemo {
    public static void main(String[] args) {
        ThrowsAdviceDemo instance = new ThrowsAdviceDemo();
        ProxyFactory proxyFactory = new ProxyFactory(instance);
        proxyFactory.addAdvice(new MyThrowsAdvice());
        ThrowsAdviceDemo proxy = (ThrowsAdviceDemo) proxyFactory.getProxy();
        proxy.execute();
        proxy.execute();
    }

    public void execute() {
        Random random = new Random();
        if (random.nextBoolean()) {
            throw new RuntimeException("For Purpose");
        }
        System.out.println("Executing...");
    }
}

```

## After Advice AspectJ实现

实现的接口与Spring标准实现没有什么区别：

- org.springframework.aop.AfterAdvice
- org.springframework.aop.AfterReturningAdvice
- org.springframework.aop.ThrowsAdvice

实现：

- org.springframework.aop.aspectj.AspectJAfterAdvice
- org.springframework.aop.aspectj.AspectJAfterReturningAdvice
- org.springframework.aop.aspectj.AspectJAfterThrowingAdvice

## Advisor接口

Advisor是AOP概念中没有的，只在Spring当中有这个概念。

接口 - org.springframework.aop.Advisor

通用实现 - org.springframework.aop.support.DefaultPointcutAdvisor

> Advisor可以认为是Advice的容器，并且是一对一的关系，即一个Advisor持有一个Advice。实际上，在Spring内部传递Advice的时候都传递的是Advisor对象。

## PointcutAdvisor接口

接口 - org.springframework.aop.PointcutAdvisor

通用实现 ：

- org.springframework.aop.support.DefaultPointcutAdvisor

AspectJ实现：

- org.springframework.aop.aspectj.AspectJExpressionPointcutAdvisor
- org.springframework.aop.aspectj.AspectJPointcutAdvisor

静态方法实现：

- org.springframework.aop.support.StaticMethodMatcherPointcutAdvisor

IoC容器实现：

- org.springframework.aop.support.AbstractBeanFactoryPointcutAdvisor

基本所有的PointcutAdvisor实现可以看成是一个容器，其中包含了Pointcut与Advice，并且具备相对顺序的特性。

## IntorductionAdvisor接口

接口 - org.springframework.aop.IntroductionAdvisor

元信息：

- org.springframework.aop.IntroductionInfo

通用实现：

- org.springframework.aop.support.DefaultIntroductionAdvisor

AspectJ实现：

- org.springframework.aop.aspectj.DeclareParentsAdvisor

IntroductionAdvisor只过滤类型，而不关心方法。其中IntroductionAdvisor实现了IntroductionInfo：

```java
public interface IntroductionInfo {

   /**
    * Return the additional interfaces introduced by this Advisor or Advice.
    * @return the introduced interfaces
    */
   Class<?>[] getInterfaces();

}
```

当一个类实现了多个接口，如果只想对其中部分接口进行代理，就可以使用IntroductionInfo来进行过滤。

```java
public class IntroductionAdvisorDemo implements EchoService, Comparable {
    public static void main(String[] args) {
        IntroductionAdvisorDemo target = new IntroductionAdvisorDemo();
        // 使用该都构造器会使得IntroductionInfo失效
        // ProxyFactory proxyFactory = new ProxyFactory(target);
        ProxyFactory proxyFactory = new ProxyFactory();
        proxyFactory.setTarget(target);
        // 添加Advisor
        proxyFactory.addAdvisor(new DefaultIntroductionAdvisor(new MethodBeforeAdvice() {
            @Override
            public void before(Method method, Object[] args, Object target) throws Throwable {
                System.out.println("BeforeAdvice: " + method);
            }
        }, new IntroductionInfo() {
            @Override
            public Class<?>[] getInterfaces() {
                return new Class[]{EchoService.class, Map.class};
            }
        }));

        Object proxy = proxyFactory.getProxy();
        EchoService echoService = (EchoService) proxy;
        echoService.echo("hello world");

        Map map = (Map)proxy;
        map.put("1","A");
        
        // 如果IntroductionInfo#getInterfaces未传入Comparable,这里会无法转换
        Comparable comparable = (Comparable) proxy;
        comparable.compareTo(null);
    }

    @Override
    public int compareTo(Object o) {
        return 0;
    }

    @Override
    public String echo(String message) throws NullPointerException {
        return "IntroductionAdvisorDemo: " + message;
    }
}
```

## AdvisorAdapter接口

AdvisorAdapter的作用是将Advice适配成MethodInterceptor。

接口 - org.springframework.aop.framework.adapter.AdvisorAdapter

MethodBeforeAdvice实现：

- org.springframework.aop.framework.adapter.MethodBeforeAdviceAdapter

AfterReturningAdvice实现：

- org.springframework.aop.framework.adapter.AfterReturningAdviceAdapter

ThrowsAdvice实现：

- org.springframework.aop.framework.adapter.ThrowsAdviceAdapter

> 除了使用默认的Advice，我们还可以使用DefaultAdvisorAdapterRegistry#registerAdvisorAdapter方法扩展自定义的Advice，于此同时，还需要实现一个Adapter。

## AopProxy接口

AopProxy接口的作用是一个返回配置好的AOP代理对象。

接口 - org.springframework.aop.framework.AopProxy

实现方式：

- JDK动态代理
	- org.springframework.aop.framework.JdkDynamicAopProxy
- CGLIB字节码提升
	- org.springframework.aop.framework.CglibAopProxy
		- org.springframework.aop.framework.ObjenesisCglibAopProxy

## AopProxyFactory

AopProxyFactory是AopProxy的工厂实现。

接口 - org.springframework.aop.framework.AopProxyFactory

默认实现：org.springframework.aop.framework.DefaultAopProxyFactory

> 除了DefaultAopProxyFactory还可以通过扩展AopProxyFactory增加AOP代理的方式。

## JDK AopProxy实现

实现 - org.springframework.aop.framework.JdkDynamicAopProxy

- 配置 - org.springframework.aop.framework.AdvisedSupport
- 来源 - org.springframework.aop.framework.DefaultAopProxyFactory

## CGLIB AopProxy实现

实现 - org.springframework.aop.framework.CglibAopProxy

- 配置 - org.springframework.aop.framework.AdvisedSupport
- 来源 - org.springframework.aop.framework.DefaultAopProxyFactory

> 无论是JDK的动态代理还是CGLIB都用到了ReflectiveMethodInvocation。

## AdvisedSupport

接口 - org.springframework.aop.framework.AdvisedSupport

- 语义 - 代理配置
- 基类 - org.springframework.aop.framework.ProxyConfig
- 实现接口 - org.springframework.aop.framework.Advised
- 使用场景 - org.springframework.aop.framework.AopProxy实现

> AdvisedSupport提供了诸多的能力，比如POJO的配置，添加Advisor等，之前在调用ProxyFactory的时候，实际上很多能力都是由AdvisedSupport来提供的。

## AdvisorChainFactory接口

核心API - org.springframework.aop.framework.AdvisorChainFactory

- 默认实现 - org.springframework.aop.framework.DefaultAdvisorChainFactory
- 特殊实现 - org.springframework.aop.framework.InterceptorAndDynamicMethodMatcher

## TargetSource接口

核心API - org.springframework.aop.TargetSource

典型实现：

- org.springframework.aop.target.HotSwappableTargetSource
- org.springframework.aop.target.AbstractPoolingTargetSource
- org.springframework.aop.target.PrototypeTargetSource
- org.springframework.aop.target.ThreadLocalTargetSource
- org.springframework.aop.target.SingletonTargetSource

> TargetSource实际上与BeanFactory有着密切的关系，在与Spring IoC容器进行整合的时候，目标对象的来源都是来自于BeanFactory。

## ProxyCreatorSupport

这个类用来创建代理对象。

核心API - org.springframework.aop.framework.ProxyCreatorSupport

- 语义 - 代理对象创建基类
- 基类 - org.springframework.aop.framework.AdvisedSupport

> 对于ProxyCreatorSupport而言，它更关心AopProxyFactory对象的创建，所以会关联一个AopProxyFactory对象。

## AdvisedSupportListener

核心API - org.springframework.aop.framework.AdvisedSupportListener

- 事件对象 - org.springframework.aop.framework.AdvisedSupport
- 事件来源 - org.springframework.aop.framework.ProxyCreatorSupport
- 激活事件触发 - ProxyCreatorSupport#createAopProxy
- 变更事件触发 - 代理接口变化时、Advisor变化时、配置复制

相关的示例：

```java
public class AdvisedSupportListener {
    public static void main(String[] args) {
        DefaultEchoService defaultEchoService = new DefaultEchoService();
        // 注入目标对象（被代理）
        ProxyFactory proxyFactory = new ProxyFactory(defaultEchoService);
        // 如果对象存在接口的话，生成的代理对象还是JDK动态代理的
        proxyFactory.setTarget(DefaultEchoService.class);
        // 添加Advice
        proxyFactory.addAdvice(new EchoServiceMethodInterceptor());
        proxyFactory.addListener(new AdvisedSupportListener() {
            @Override
            public void activated(AdvisedSupport advised) {
                System.out.println("AOP配置对象：" + advised + "已激活");
            }

            @Override
            public void adviceChanged(AdvisedSupport advised) {
                System.out.println("AOP配置对象：" + advised + "已变化");
            }
        });
        // 获取代理对象
        // 激活事件触发 createAopProxy <- getProxy()
        EchoService echoService = (EchoService) proxyFactory.getProxy();
        proxyFactory.addAdvice(new Advice() {
        });
    }
}
```

## ProxyFactory

ProxyFactory是ProxyCreatorSupport的标准实现。

核心API - org.springframework.aop.framework.ProxyFactory

- 基类 - org.springframework.aop.framework.ProxyCreatorSupport
- 特性增强，提供一些便利操作

> ProxyCreatorSupport#createAopProxy方法是一个典型的模板设计模式。

ProxyFactory与ProxyCreatorSupport有三大特性：配置、产生代理对象、有事件关联。

## ProxyFactoryBean

核心API - org.springframework.aop.framework.ProxyFactoryBean

- 基类 - org.springframework.aop.framework.ProxyCreatorSupport
- 特点，与Spring IoC容器整合：
	- org.springframework.beans.factory.BeanClassLoaderAware
	- org.springframework.beans.factory.BeanFactoryAware
- 特性增强：
	- 实现org.springframework.beans.factory.FactoryBean

## AspectJProxyFactory

 核心API - org.springframework.aop.aspectj.annotation.AspectJProxyFactory

- 基类 - org.springframework.aop.framework.ProxyCreatorSupport
- 特点：AspectJ注解整合
- 相关API：
	- AspectJ元数据 - org.springframework.aop.aspectj.annotation.AspectMetadata
	- AspectJ Advisor工厂 - org.springframework.aop.aspectj.annotation.AspectJAdvisorFactory

> AspectJ是通过反射找到Aspect Class，定位到它相关的注解上面的方法，通过注解上面的方法找到表达式，然后通过表达式筛选出对应的目标方法。

## AbstractAutoProxyCreator

前面的API都是通过手动插入的方式创建代理对象，有没有自动创建代理对象的方式呢？

API - org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator

- 基类 - org.springframework.aop.framework.ProxyProcessorSupport
- 特点：与Spring Bean生命周期整合
	- org.springframework.beans.factory.config.SmartInstantiationAwareBeanPostProcessor

## IoC容器自动代理标准实现

基类 - org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator

- 默认实现 - DefaultAdvisorAutoProxyCreator
- Bean名称匹配实现 - BeanNameAutoProxyCreator
- Infrastructure Bean实现 - InfrastructureAdvisorAutoProxyCreator

> InfrastructureAdvisorAutoProxyCreator是跟Bean的Role有关。

## AspectJAwareAdvisorAutoProxyCreator

AspectJAwareAdvisorAutoProxyCreator是IoC容器自动代理AspectJ的实现。

基类 - org.springframework.aop.framework.autoproxy.AbstractAdvisorAutoProxyCreator

## AopInfrastructureBean接口

接口 - org.springframework.aop.framework.AopInfrastructureBean

- 语义 - Spring AOP基础Bean标记接口
- 实现
	- org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator
	- org.springframework.aop.scope.ScopedProxyFactoryBean
- 判断逻辑
	- AbstractAutoProxyCreator#isInfrastructureClass
	- ConfigurationClassUtils#checkConfigurationClassCandidate

> AopInfrastructureBean是一个标记接口，如果实现了这个接口，表示这个Bean是Spring 基础建设的类，这个类就不会被自动代理。

## AopContext

API - org.springframework.aop.framework.AopContext

- 语义 - ThreadLocal的扩展，临时存储AOP对象

> 如果要使用AopContext，需要提前打开exposeProxy开关。

## AopProxyUtils

这个工具类是AOP代理的工具类。

API - org.springframework.aop.framework.AopProxyUtils

代表方法：

- getSingletonTarget - 从实例中获取单例对象
- ultimateTargetClass - 从实例中获取最终目标类
- completeProxiedInterfaces - 计算AdvisedSupport配置中所有被代理的接口
- proxiedUserInterfaces - 从代理对象中获取代理接口

## AopUtils

API - org.springframework.aop.support.AopUtils

代表方法：

- isAopProxy - 判断对象是否为代理对象
- isJdkDynamicProxy - 判断对象是否为JDK动态代理对象
- isCglibProxy - 判断对象是否为CGLIB代理对象
- getTargetClass - 从对象中获取目标类型
- invokeJoinpointUsingReflection - 使用Java反射调用Joinpoint（目标方法）

## AspectJ Enable模块驱动

注解 - org.springframework.context.annotation.EnableAspectJAutoProxy

- 属性方法
	- proxyTargetClass - 默认情况下是JDK动态代理，如果为true就会变成CGLIB代理
	- exposeProxy - 是否将代理对象暴露在AopContext中
- 设计模式 - @Enable模块驱动
	- org.springframework.context.annotation.AspectJAutoProxyRegistrar
- 底层实现
	- org.springframework.aop.aspectj.annotation.AnnotationAwareAspectJAutoProxyCreator

## AspectJ XML配置驱动实现

XML元素 - <aop:aspectj-autoproxy />

- 属性
	- proxy-target-class - 是否已类型代理
	- expose-proxy - 是否将代理对象暴露在AopContext中
- 设计模式 - Extensible XML Authoring
- 底层实现
	- org.springframework.aop.config.AspectJAutoProxyBeanDefinitionParser

XML标签元素的Schema实现：

```xml
	<xsd:element name="aspectj-autoproxy">
		<xsd:annotation>
			<xsd:documentation source="java:org.springframework.aop.aspectj.annotation.AnnotationAwareAspectJAutoProxyCreator"><![CDATA[
	Enables the use of the @AspectJ style of Spring AOP.

	See org.springframework.context.annotation.EnableAspectJAutoProxy Javadoc
	for information on code-based alternatives to this XML element.
			]]></xsd:documentation>
		</xsd:annotation>
		<xsd:complexType>
			<xsd:sequence>
				<xsd:element name="include" type="includeType" minOccurs="0" maxOccurs="unbounded">
					<xsd:annotation>
						<xsd:documentation><![CDATA[
	Indicates that only @AspectJ beans with names matched by the (regex)
	pattern will be considered as defining aspects to use for Spring autoproxying.
						]]></xsd:documentation>
					</xsd:annotation>
				</xsd:element>
			</xsd:sequence>
			<xsd:attribute name="proxy-target-class" type="xsd:boolean" default="false">
				<xsd:annotation>
					<xsd:documentation><![CDATA[
	Are class-based (CGLIB) proxies to be created? By default, standard
	Java interface-based proxies are created.
					]]></xsd:documentation>
				</xsd:annotation>
			</xsd:attribute>
			<xsd:attribute name="expose-proxy" type="xsd:boolean" default="false">
				<xsd:annotation>
					<xsd:documentation><![CDATA[
	Indicate that the proxy should be exposed by the AOP framework as a
	ThreadLocal for retrieval via the AopContext class. Off by default,
	i.e. no guarantees that AopContext access will work.
					]]></xsd:documentation>
				</xsd:annotation>
			</xsd:attribute>
		</xsd:complexType>
	</xsd:element>
```

## <aop:config /> Schema-based实现

XML元素 - <aop:config />

- 属性
	- proxy-target-class - 是否已类型代理
	- expose-proxy - 是否将代理对象暴露在AopContext中
- 嵌套元素
	- pointcut
	- advisor
	- aspect
- 底层实现
	- org.springframework.aop.config.ConfigBeanDefinitionParser

Schema的定义：

```xml
	<xsd:element name="config">
		<xsd:annotation>
			<xsd:documentation><![CDATA[
	A section (compartmentalization) of AOP-specific configuration (including
	aspects, pointcuts, etc).
			]]></xsd:documentation>
		</xsd:annotation>
		<xsd:complexType>
			<xsd:sequence>
				<xsd:element name="pointcut" type="pointcutType" minOccurs="0" maxOccurs="unbounded">
					<xsd:annotation>
						<xsd:documentation><![CDATA[
	A named pointcut definition.
						]]></xsd:documentation>
					</xsd:annotation>
				</xsd:element>
				<xsd:element name="advisor" type="advisorType" minOccurs="0" maxOccurs="unbounded">
					<xsd:annotation>
						<xsd:documentation source="java:org.springframework.aop.Advisor"><![CDATA[
	A named advisor definition.
						]]></xsd:documentation>
					</xsd:annotation>
				</xsd:element>
				<xsd:element name="aspect" type="aspectType" minOccurs="0" maxOccurs="unbounded">
					<xsd:annotation>
						<xsd:documentation><![CDATA[
	A named aspect definition.
						]]></xsd:documentation>
					</xsd:annotation>
				</xsd:element>
			</xsd:sequence>
			<xsd:attribute name="proxy-target-class" type="xsd:boolean" default="false">
				<xsd:annotation>
					<xsd:documentation><![CDATA[
	Are class-based (CGLIB) proxies to be created? By default, standard
	Java interface-based proxies are created.
					]]></xsd:documentation>
				</xsd:annotation>
			</xsd:attribute>
			<xsd:attribute name="expose-proxy" type="xsd:boolean" default="false">
				<xsd:annotation>
					<xsd:documentation><![CDATA[
	Indicate that the proxy should be exposed by the AOP framework as a
	ThreadLocal for retrieval via the AopContext class. Off by default,
	i.e. no guarantees that AopContext access will work.
					]]></xsd:documentation>
				</xsd:annotation>
			</xsd:attribute>
		</xsd:complexType>
	</xsd:element>
```

## <aop:aspect /> Schema-based实现

XML元素 - <aop:aspect />

- 父元素 - <aop:config />
- 属性
	- ref - Spring Bean引用的名称
	- order - Aspect顺序数
- 嵌套元素
	- pointcut
	- declare-parents
	- before
	- after
	- after-returning
	- after-throwing
	- around

schema定义：

```xml
<xsd:element name="aspect" type="aspectType" minOccurs="0" maxOccurs="unbounded">
	<xsd:annotation>
		<xsd:documentation><![CDATA[
	A named aspect definition.
			]]></xsd:documentation>
	</xsd:annotation>
</xsd:element>
```

## Pointcut Schema-based实现

XML元素 - <aop:pointcut />

- 父元素 - <aop:aspect />或<aop:config />
- 属性
	- id - Pointcut ID
	- expression - （必须）AspectJ表达式
- 底层实现
	- org.aspectj.lang.annotation.Pointcut

  schema定义：

```xml
	<xsd:complexType name="pointcutType">
		<xsd:annotation>
			<xsd:appinfo>
				<tool:annotation>
					<tool:exports type="org.springframework.aop.Pointcut"/>
				</tool:annotation>
			</xsd:appinfo>
		</xsd:annotation>
		<xsd:attribute name="id" type="xsd:string" use="required">
			<xsd:annotation>
				<xsd:documentation><![CDATA[
	The unique identifier for a pointcut.
				]]></xsd:documentation>
			</xsd:annotation>
		</xsd:attribute>
		<xsd:attribute name="expression" use="required" type="xsd:string">
			<xsd:annotation>
				<xsd:documentation><![CDATA[
	The pointcut expression.

	For example : 'execution(* com.xyz.myapp.service.*.*(..))'
				]]></xsd:documentation>
			</xsd:annotation>
		</xsd:attribute>
	</xsd:complexType>
```

## Around Advice Schema-based实现

XML元素 - <aop:around />

- 父元素- <aop:aspect />
- 属性
	- pointcut - AspectJ Pointcut表达式
	- pointcut-ref - 引用的AspectJ Pointcut名称
	- method - 拦截目标方法
	- arg-names - 目标方法参数名称

schema定义：

```xml
    <xsd:element name="around" type="basicAdviceType">
        <xsd:annotation>
            <xsd:documentation><![CDATA[
     An around advice definition.
         ]]></xsd:documentation>
        </xsd:annotation>
    </xsd:element>
```

## Before Advice Schema-based实现

XML元素 - <aop:before />

- 父元素 - <aop:aspect />
- 属性
	- pointcut - AspectJ pointcut表达式
	- pointcut-ref - 引用的AspectJ Pointcut名称
	- method - 拦截目标方法
	- arg-names - 目标方法参数名称

## After Advice Schema-based实现

XML元素 - <aop:after />

- 父元素 - <aop:aspect />
- 属性
	- pointcut - AspectJ Pointcut表达式
	- pointcut-ref - 引用的AspectJ Pointcut名称
	- method - 拦截目标方法
	- arg-names - 目标方法参数名称

## After Returning Advice Schema-based实现

XML元素 - <aop:after-returning />

- 父元素 - <aop:aspect />
- 属性
	- pointcut - AspectJ Pointcut表达式
	- pointcut-ref - 引用的AspectJ Pointcut名称
	- method - 拦截目标方法
	- arg-names - 目标方法参数名称
	- returning - 方法参数名称

schema定义：

```xml
	<xsd:complexType name="afterReturningAdviceType">
		<xsd:complexContent>
			<xsd:extension base="basicAdviceType">
				<xsd:attribute name="returning" type="xsd:string">
					<xsd:annotation>
						<xsd:documentation><![CDATA[
	The name of the method parameter to which the return value must
	be passed.
						]]></xsd:documentation>
					</xsd:annotation>
				</xsd:attribute>
			</xsd:extension>
		</xsd:complexContent>
	</xsd:complexType>
```

## After Throwing Advice Schema-based实现

XML元素 - <aop:after-throwing />

- 父元素 - <aop:aspect />
- 属性
	- pointcut - AspectJ Pointcut表达式
	- pointcut-ref - 引用的AspectJ Pointcut名称
	- method - 拦截目标方法
	- arg-names - 目标方法参数名称
	- throwing方法参数名称

schema定义：

```xml
	<xsd:complexType name="afterThrowingAdviceType">
		<xsd:complexContent>
			<xsd:extension base="basicAdviceType">
				<xsd:attribute name="throwing" type="xsd:string">
					<xsd:annotation>
						<xsd:documentation><![CDATA[
	The name of the method parameter to which the thrown exception must
	be passed.
						]]></xsd:documentation>
					</xsd:annotation>
				</xsd:attribute>
			</xsd:extension>
		</xsd:complexContent>
	</xsd:complexType>
```

## Advisor Schema-based实现

XML元素 - <aop:advisor />

- 父元素 - <aop:config />
- 属性
	- advice-ref - Advice Bean引用
	- pointcut - AspectJ Pointcut表达式
	- pointcut-ref - AspectJ Pointcut Bean引用
	- order - Advisor顺序数

## Introduction Schema-based实现

XML元素 - <aop:declare-parents />

- 父元素 - <aop:aspect />
- 属性
	- types-matching - 是否已类型代理
	- implement-interface - 实现接口全类名
	- default-impl - 默认实现全类名
	- delegate-ref - 委派实现Bean引用

## 作用域代理Schema-based实现

XML元素 - <aop:scoped-proxy />

- 属性
	- proxy-target-class - 是否已类型代理

## 面试题

### Spring AOP Advice XML标签有哪些？

- Around Advice：<aop:around />
- Before：<aop:before />
- After：<aop:after/ >
- AfterReturning：<aop:after-returning />
- AfterThrowing：<aop:after-throwing />

### 请解释Spring @EnbaleAspectJAutoProxy的原理？

通过BeandefinitionRegistrar注册相应的Bean。

### Spring Configuration Class CGLIB提升与AOP类代理的关系？

@Configuration需要@ComponetScan才可以生效。

Spring Configuration Class CGLIB提升的原因是，方便Spring AOP的操作，无需显式的注册代理类，注入Advisor也比较容易，相当于天然的装配。

# Spring AOP设计模式

总的来说，设计模式没有绝对的标准，像雨像雾又像风。

## 抽象工厂模式

基本概念：抽象工厂模式（Abstract factory）提供了一组具有同一主题的单独的工厂封装起来。在正常使用中，客户端程序需要创建抽象工厂的具体实现，然后使用抽象工厂作为接口来创建这一主题的具体对象。客户端程序不需要知道（或关心）它从这些内部工厂方法中获得对象的具体类型，因为客户端程序仅使用这些对象的通用接口。抽象工厂模式将一组对象的实现细节与他们的一般使用分离开来。

Spring AOP举例实现：

- 接口 - org.springframework.aop.framework.AopProxyFactory
- 实现 - org.springframework.aop.framework.DefaultAopProxyFactory

## 构建器模式

基本概念：构建器模式（Builder）又名建造模式，是一种对象构建模式。它可以将复杂对象的建造过程抽象出来（抽象类别），使这个抽象过程的不同实现方法可以构造出不同表现（属性）的对象

Spring AOP举例实现：

- 实现 - org.springframework.aop.aspectj.annotation.BeanFactoryAspectJAdvisorsBuilder

> 通常而言，构建器模式有两种实现，一种是线程安全的，一种是非线程安全的，不过大多数场景下，使用的都是非线程安全的，例如StringBuilder。

## 工厂方法模式

基本概念：工厂方法模式（Factory method）就像其他创建型模式一样，它也是处理在不指定对象具体类型的情况下创建对象的问题。工厂方法模式的实质是“定义一个创建对象的接口，但让实现这个接口的类来决定实例化哪个类。工厂方法让类的实例化推迟到子类中进行。”

Spring AOP举例实现：

- 实现 - org.springframework.aop.framework.ProxyFactory

> 工厂方法也分为两种，静态工厂和动态工厂，也就是说类的工厂方法或者对象的工厂方法。抽象工厂与工厂方法的区别在于，抽象工厂要求必须是抽象的，也就是说它必须是抽象类或者接口，但工厂可以是一个具体的类。

## 原型模式

基本概念：原型模式（Prototype）其特点在于通过`复制`一个已经存在的实例来返回新的实例，而不是新建实例。被复制的实例就是我们所称的`原型`，这个原型是可定制的。

原型模式多用于创建复杂的或者耗时的实例，因为这种情况下，复制一个已经存在的实例使程序运行更高效；或者创建值相等，只是命名不一样的同类数据。

Spring AOP举例实现：

- 实现 - org.springframework.aop.target.PrototypeTargetSource

## 单例模式

基本概念：单例模式（Singleton）属于创建型模式的一种。在应用这个模式时，单例对象的类必须保证只有一个实例存在。许多时候整个系统只需要一个的全局对象，这样有利于我们协调系统整体的行为。比如在某个服务器程序中，该服务器的配置信息存放在一个文件中，这些配置数据由一个单例对象统一读取，然后服务器进程中的其他对象再通过这个单例对象或者这些配置信息。这种方式简化了在复杂环境下的配置管理。

Spring AOP举例实现：

- 实现 - org.springframework.aop.target.SingletonTargetSource

> 单例模式中需要注意对象存在的范围。

## 适配器模式

基本概念：适配器模式（Adapter）有时候也称包装模式或者包装（Wrapper）。将一个类转换成另外一个类，通过适配器包装的方式可以使得本来不兼容的接口变得兼容。

Spring AOP举例实现：

- 实现 - org.springframework.aop.framework.adapter.AdvisorAdapter
- 适配对象 - org.aopalliance.aop.Advice
- 目标对象 - org.aopalliance.intercept.MethodInterceptor

## 组合模式

基本概念：组合模式（Composite）是把一组对象当成一个实例来进行处理，这个实例和这组对象时相同类型的。

Spring AOP举例实现：

- 实现 - org.springframework.aop.support.ComposablePointcut
- 接口 - org.aspectj.lang.annotation.Pointcut
- 成员 - org.aspectj.lang.annotation.Pointcut

## 装饰器模式

基本概念：装饰器模式（Decorator）是一种动态地往一个类中添加新的行为的设计模式。就功能而言，修饰模式相比生成子类更为灵活，这样可以给某个对象而不是整个类添加一些功能。

Spring AOP举例实现：

- 实现 - org.springframework.aop.aspectj.annotation.LazySingletonAspectInstanceFactoryDecorator

JDK举例实现：

- 实现 - java.io.BufferedInputStream

## 享元模式

基本概念：享元，即共享的单元。享元模式（Flyweight）使用对象来尽可能减少内存的使用量，便于分享更多的数据。常见的作法是对象放在数据结构外部，等需要的时候在将它们传递给享元。

Spring AOP举例实现：

- 实现 - org.springframework.aop.framework.adapter.AdvisorAdapterRegistry

> 享元模式与单例模式的区别在于，享元模式不一定是单例本身，它可能只是一个代理或者门面。

## 代理模式

基本概念：代理模式（Proxy）是指一个类型可以作为其他东西的界面。代理者可以作任何东西的介面：网络连接、内存等资源。

Spring AOP举例实现：

- 实现 - org.springframework.aop.framework.AopProxy
	- JDK - org.springframework.aop.framework.JdkDynamicAopProxy
	- CGLIB - org.springframework.aop.framework.CglibAopProxy

> 装饰器模式和代理模式的区别在于，通常装饰器模式是静态的一种（比如植入一些辅助性的代码去修饰一些行为），而代理模式既有动态的也有静态的。

## 模板方法模式

基本概念：模板方法（Template Method）是一个定义在父类里面的方法，这个方法可能没有具体的实现，需要在子类中重写父类中这个方法，而父类已经安排好了这些抽象方法的执行顺序以及调用逻辑。

Spring AOP举例实现：

- 模板类 - org.springframework.aop.framework.autoproxy.AbstractAutoProxyCreator
- 模板方法 - getAdvicesAndAdvisorsForBean(Class, String,TargetSource) 
- 子类实现：
	- org.springframework.aop.framework.autoproxy.InfrastructureAdvisorAutoProxyCreator
	- org.springframework.aop.aspectj.annotation.AnnotationAwareAspectJAutoProxyCreator

## 责任链模式

基本概念：责任链模式（Chain of Responsibility）包含了一些命令对象和一系列的处理对象。每一个处理对象决定它能处理哪些命令对象，它也知道如何将它不能处理的命令对象传递给该链中的下一个对象。该模式还描述了往该处理链的末尾添加新的处理对象的方法。

Spring AOP举例实现：

- org.springframework.aop.framework.AdvisorChainFactory
- org.springframework.aop.framework.DefaultAdvisorChainFactory

> 责任链模式有时候有称为Pipline。

## 观察者模式

基本概念：观察者模式（Observer）是指一个目标对象管理所有依赖它的观察者对象，并且在它本身的状态改变时主动发出通知。通常伴随着事件或者消息的方式来进行传递。

Spring AOP举例实现：

- 观察者 - org.springframework.aop.framework.ProxyCreatorSupport
- 被观察者 - org.springframework.aop.framework.AdvisedSupportListener
- 通知对象 - org.springframework.aop.framework.AdvisedSupport

## 策略模式

基本概念：策略模式（Strategy）是指对象具有某个行为，但是在不同的场景中，该行为有不同的实现算法。

Spring AOP举例实现：

- org.springframework.aop.framework.DefaultAopProxyFactory#createAopProxy
- org.springframework.aop.config.ConfigBeanDefinitionParser#getAdviceClass

> 策略模式通常被认为是面向对象多态的体现。

## 命令模式

基本概念：命令模式（Strategy）是以对象为代表实际行动，命令对象可以把方法及其参数封装起来，于是这些方法（动作）可以被：

- 重复多次
- 取消
- 取消后又再重做

Spring AOP举例实现：

- org.aopalliance.intercept.MethodInvocation
- org.aspectj.lang.ProceedingJoinPoint

## 状态模式

基本概念：状态模式（State）允许对象在内部状态发生变化时更改其行为。这种模式接近于有限状态机的概念，状态模式可以解释为策略模式，它能够通过调用模式接口中定义的方法来切换策略。

Spring AOP举例实现：

- 状态对象 - org.springframework.aop.framework.ProxyConfig
- 影响对象 - org.springframework.aop.framework.AopProxy
	- org.springframework.aop.framework.JdkDynamicAopProxy
	- org.springframework.aop.framework.CglibAopProxy

> 状态模式可以和策略模式相互配合。

## 面试题

### GOF 23设计模式和它的归类？

- 创建模式：抽象工厂、构建器模式、工厂方法、原型模式、单例模式
- 结构模式：适配器模式、桥接模式、组合模式、门面模式、轻量级模式、代理模式
- 行为模式：责任链模式、命令模式、解释器模式、迭代器模式、中介者模式、备忘录模式、观察者模式、策略模式、状态模式、模板方法模式、访问模式。

### 举例装饰器模式和代理模式的区别？

代理模式不要求和被代理对象存在层次关系，装饰器模式则需要和被装饰者存在层次关系。装饰器模式通常会扩展一些行为，这些行为并不隶属于被装饰者之间，而代理模式的功能通常时被代理者的子集或者全集，不会超集。

装饰器模式：BufferedInputStream和InputStream；代理模式：Proxy

### 请举例说明Spring Framework中使用设计模式的实现？

ApplicationContext就是一种门面模式的实现......

# Spring AOP内部应用

## Spring 事件中的应用

核心API - org.springframework.context.event.EventPublicationInterceptor

特殊描述：当Spring AOP代理Bean中的JoinPoint方法执行后，Spring ApplicationContext将发布一个自定义事件（ApplicationEvent子类）

使用限制：

- EventPublicationInterceptor关联的ApplicationEvent子类必须存在单参数的构造器，参数类型必须是Object
- EventPublicationInterceptor需要被声明为Spring Bean

其中第一点是因为：

![image-20210723140848060](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210723140848.png)

需要被声明为Spring Bean的原因是：

![image-20210723140929830](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210723140929.png)

接下来我们通过实例的方式演示EventPublicationInterceptor这个API的使用，首先定义好事件：

```java
public class ExecutedEvent extends ApplicationEvent {
    public ExecutedEvent(Object source) {
        super(source);
    }
}
```

为了参照对比，这里使用传统的事务发送方式和AOP拦截的方式两种：

```java
public class StaticExecutor implements ApplicationEventPublisherAware {

    private ApplicationEventPublisher applicationEventPublisher;

    public void execute() {
        System.out.println("StaticExecutor Executing...");
        applicationEventPublisher.publishEvent(new ExecutedEvent(this));
    }

    @Override
    public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }
}
```

使用AOP方式的执行器：

```java
public class Executor { // ClassFilter
    public void execute() { // MethodMatcher：Join Point方法（需要Pointcut来匹配）
        System.out.println("Executor Executing...");
    }
}

```

最终的效果：

```java
@Configuration // Configuration Class
@EnableAspectJAutoProxy
public class EventPublicationInterceptorDemo {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(EventPublicationInterceptorDemo.class, Executor.class, StaticExecutor.class);
        context.refresh();
        // 5.执行目标方法
        Executor executor = context.getBean(Executor.class);
        StaticExecutor staticExecutor = context.getBean(StaticExecutor.class);
//        System.out.println(executor);
//        System.out.println(staticExecutor);
        context.close();
    }

    // 1.将EventPublicationInterceptor声明为Spring Bean
    @Bean
    public static EventPublicationInterceptor eventPublicationInterceptor() {
        EventPublicationInterceptor eventPublicationInterceptor = new EventPublicationInterceptor();
        // 关联目标（自定义）事件类型
        eventPublicationInterceptor.setApplicationEventClass(ExecutedEvent.class);
        return eventPublicationInterceptor;
    }

    // 2.实现 Pointcut(这一步可以没有)
    @Bean
    public static Pointcut pointcut() {
        return new StaticMethodMatcherPointcut() {
            @Override
            public boolean matches(Method method, Class<?> targetClass) {
                return "execute".equals(method.getName()) && Executor.class.equals(targetClass);
            }
        };
    }

    // 3.声明一个Advisor Bean
    @Bean
    public static PointcutAdvisor pointcutAdvisor(Pointcut pointcut, EventPublicationInterceptor eventPublicationInterceptor) {
        // EventPublicationInterceptor is MethodInterceptor is Advice
        return new DefaultPointcutAdvisor(pointcut, eventPublicationInterceptor);
    }

    // 4.处理事件
    @EventListener(ExecutedEvent.class)
    public void executed(ExecutedEvent event) {
        System.out.println("Executed: " + event);
    }
}
```

## Spring事务中的应用

### 核心API

- Spring事务@Enanle模块驱动 - @EnableTranSactionManagement
- Spring事务注解 - @Transactional
- Spring事务事件监听器 - @TransactionalEventListener
- Spring事务定义 - TransactionDefinition
- Spring事务状态 - TransactionStatus
- Spring平台事务管理 - PlatformTransactionManager
- Spring事务代理配置 - ProxyTransactionManagementConfiguration
- Spring事务PointcutAdvisor实现 - BeanFactoryTransactionAttrubuteSourceAdvisor
- Spring事务MethodInterceptor实现 - TransactionInterceptor
- Spring事务属性源 - TransactionAttributeSource

### 理解TransactionDefinition

说明：Spring事务定义

核心方法：

- getIsolationLevel()：获取隔离级别，默认值ISOLATION_DEFAULT常量，参考org.springframework.transaction.annotation.Isolation
- getPropagationBehavior()：获取事务传播，默认值：PROPAGATION_REQUIRED常量，参考org.springframework.transaction.annotation.Propagation
- getTimeout()：获取事务执行超时事件，默认值：TIMEOUT_DEFAULT常量
- isReadOnly：是否为只读事务，默认值：false

### 理解PlatformTransactionManager

说明：平台事务管理器

核心方法：

- getTransaction(TransactionDefinition)：获取事务状态（逻辑事务）
- commit(TransactionStatus)：提交事务
- rollback(TransactionStatus)：回滚事务

### 理解事务传播

官网链接：[Spring事务传播](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#tx-propagation)

## Spring 缓存中的应用

核心API：

- Spring缓存@Enable模块驱动 - @EnableCaching
- 缓存操作注解 - @Caching、@Cachable、@CachePut、@CacheEvict
- 缓存配置注解 - @CacheConfig
- 缓存注解操作数据源 - AnnotationCacheOperationSource
- Spring缓存注解解析器 - SpringCacheAnnotationParser
- Spring缓存管理器 - CacheManager
- Spring缓存接口 - Cache
- Spring缓存代理配置 - ProxyCachingConfiguration
- Spring缓存PointcutAdvisor实现 - BeanFactoryCacheOperationSourceAdvisor
- Spring缓存MethodInterceptor实现 - CacheInterceptor

## 面试题

### 请举例说明Spring AOP在Spring Framework特性运用？

- Spring 事件（Events）
- Spring 事务（Transaction）
- Spring 缓存（Caching）
- Spring 本地调度（Scheduling）
- Spring远程（Remoting）

### 请解释Spring事务传播的原理？

// ...

### 请总结Spring AOP与IoC功能整合的设计模式？

- 实现Advice或MethodInterceptor
- 实现PointcutAdvisor
- 实现Spring AOP代理配置类
- （可选）实现注解和注解元信息的解析以及处理
- （可选）实现XML与其元信息的解析以及处理
