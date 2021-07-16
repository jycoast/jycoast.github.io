---
title: Spring AOP
tags: Spring
author: 吉永超
date: 2021-06-29 00:00:00
---


AOP（Aspect Oriented Programming）面向切面编程，是针对面向对象编程的一种补充，同时也是Spring中第二个最核心的功能。

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

可以看到所有的信息均已成功打印，这是因为，@Around需要去显式的触发目标方法的区别，而@Before则不用。

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



