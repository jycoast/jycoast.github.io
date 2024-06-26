## Spring面试题

### Spring框架中Bean的创建过程是怎样的？

首先，简单来说，Spring框架中的Bean经历过四个阶段：实例化 -> 属性赋值 -> 初始化 -> 销毁

然后，具体来说Spring中Bean经过了以下几个步骤：

1. 实例化：new **()两个时机，1、当客户端向容器申请一个Bean时，2、当容器在初始化一个Bean时还需要依赖一个Bean，BeanDefinition对象保存。
2. 设置对象属性（依赖注入）：Spring通过BeanDefinition找到对象依赖的其他对象，并将这些对象赋予当前对象。
3. 处理Aware接口，Spring会检测对象是否实现了***Aware接口，如果实现了，就会调用对应的方法。BeanNameAware、BeanClassLoaderAware、BeanFactoryAware、ApplicationContextAware。
4. BeanPostProcess，Bean创建的前置处理。调用BeanPostProcess的初始化前的方法。
5. InitializingBean：Spring检测对象如果实现了这个接口，就会执行afterPropertiesSet()方法
6. init-method：自定义的初始化回调方法
7. BeanPorcess的后处理的方法，到这里，这个Bean创建过程就完成了，Bean就可以正常使用了。
8. DisposableBean，当Bena实现了这个接口，在对象销毁前就会调用destory()方法。
9. destory-method：自定义Bean销毁的回调方法。

### Spring中Bean的作用域？

|    来源     | 说明                                                   |
| :---------: | ------------------------------------------------------ |
|  singleton  | 默认Spring Bean作用域，一个BeanFactory有且仅有一个实例 |
|  prototype  | 原型作用域，每次依赖查找和依赖注入生成新Bean对象       |
|   request   | 将Spring Bean存储在ServletRequest上下文中              |
|   session   | 将Spring Bean存储在HttpSession中                       |
| application | 将Spring Bean存储在ServletContext中                    |

笼统而言，我们只要记住单例和原型两种即可，其余三种主要是为了服务端模板引擎渲染，包括JSP、Velocity、FreeMarker。

### Spring框架中的Bean是线程安全的吗？如果线程不安全，如何处理？

Spring容器本身没有提供Bean的线程安全策略，因此，也可以说Spring容器中的Bean不是线程安全的。要如何处理线程安全问题。就要分情况来分析。对于线程安全问题：

1. 对于prototype作用域，每次都生成一个新的对象，所以不存在线程安全问题
2. 对于sington作用域，默认就是线程不安全的。但是对于开发中大部分的Bean，其实是无状态的，不需要保证线程安全

>  无状态表示这个实例没有属性对象，不能保存数据，是不变的，比如：controller、service、dao；有状态表示实例有属性对象，可以保存数据，是线程不安全的，比如POJO。

如果要保证线程安全，可以将Bean的作用改为prototype。也可以采用ThreadLocal来解决线程安全的问题，ThreadLocal为每一个线程保存一个副本变量，每个线程只操作自己的副本变量。

### Spring是如何处理循环依赖问题的？

一种是使用@Lazy注解，另一种是使用三级缓存。

循环依赖：多个对象之间存在循环的引用关系。在初始化过程中，就会出现”先有蛋还是先有鸡“的问题。

@Lazy注解：解决构造方法造成的循环依赖问题

对于对象之前的普通引用，二级缓存会保存new出来的不完整对象，这样当单例池中找不到依赖的属性时，就可以先从二级缓存中获取到不完整对象，完成对象的创建，在后续的依赖注入过程中，将单例池中对象的引用关系调整完成。

三级缓存：如果引用的对象配置了AOP，那在单例池中最终就会需要注入动态代理对象，而不是原对象，而生成动态代理是要在对象初始化完成之后才开始的。于是Spring增加了三级缓存，保存所有对象的动态代理配置信息，在发现有循环依赖时，将这个对象的动态代理信息获取出来，提前进行AOP，生成动态代理。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210630003757.png" alt="img" style="zoom:67%;" />

### Spring如何处理事务?

Spring当中支持编程式事务管理和声明式事务管理两种方式。

1、编程式事务可以用TransactionTemlate

2、声明式事务：是Spring在AOP基础上提供的事务实现机制，他的最大优点是不需要在业务代码中添加事务管理的代码，只需要在配置文件中做相关的事务规则声明就可以了，但是声明式事务只能针对方法级别，无法控制代码块级别的事务管理。Spring中对事务定义了不同的传播级别：

- PROPAGATION_REQUIRED：默认传播行为。如果当前没有事务，就创建一个新事务，如果当前存在事务，就加入到事务中
- PROPAGATION_SUPPORTS：如果当前存在事务，就加入到该事务，如果当前不存在事务，就以非事务方式运行
- PROPAGATION_MANDATORY:如果当前存在事务，就加入到该事务，如果当前不存在事务，就抛出异常
- PROPAGATION_REQUIRES_NEW：无论当前存不存在事务，都创建新事务进行执行
- PROPAGATION_NOT_SUPPORTS：以非事务方式运行，如果当前存在事务，就将当前事务挂起
- PROPAGATION_NEVER：以非事务方式运行，如果当前存在事务，就抛出异常
- PROPAGATION_NESTED：如果当前存在事务，则在嵌套事务内执行；如果当前没有事务，则按REQUIRED属性执行

Spring中事务的隔离级别：

- ISOLATIUON_DEFAULT：使用数据库默认的事务隔离级别。
- ISOLATION_READ_UNCOMMITED：读未提交，允许事务在执行过程中，读取其他事务未提交的数据
- ISOLATION_READ_COMMITED：读已提交，允许事务在执行过程中，独去其他事务已经提交的数据
- ISOLATION_REPEATABLE_UNCOMMITED：可重复度，在同一个事务内，任意时刻的查询结果是一致的
- ISOLATION_READ_SERIALIZABLE：所有事务依次执行

更多内容参考：[深入浅出Spring事务的实现原理](https://juejin.cn/post/7106158883055353870)。

### Spring事务失效的场景有哪些？

- 注解@Transactional配置的方法并非public权限修饰
- 注解@Transactional所在类非Spring容器管理的Bean
- 注解@Transactional所在类中，注解修饰的方法被类内部方法调用
- 业务代码抛出异常类型非RuntimeException，事务失效
- 业务代码中存在异常时，使用try...catch...语句块捕获，而catch语句块没有throw new RuntimeException异常
- 注解@Transactional中Propagation属性值设置错误即Propagation.NOT_SUPPORTED

### Spring MVC中的控制器是不是单例模式？如果是，如何保证线程安全？

控制器是单例模式，单例模式下就会有线程安全问题。

Spring中保证线程安全的方法

1、将scope设置成singleton，propotype，request。

2、最好的方式是将控制器设计成无状态模式。在控制器中不要携带数据，但是可以引用无状态的service和dao。

### Spring MVC原理？

核心原理的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210825110153.png" alt="Spring MVC示意图" style="zoom:50%;" />



过程描述：

- 将Spring MVC处理的请求映射到DispatcherServlet的servlet上
- DispatcherServlet通过HandlerMapping去查找当前请求URL对应的Handler（通常是Controller中对应的一个方法）
- 执行对应的Handler方法
- 执行的过程中可能会调用若干的Service来完成业务的处理
- DispatcherServlet根据ModelAndView中的ViewResolver（视图解析器）中找到对应的视图
- DispatcherServlet将ModelAndView中的Model交给对应的View进行视图的渲染
- 渲染后，将视图转为HTTP响应流返回给客户端

详细的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210825111017.png" alt="Spring MVC详细示意图" style="zoom:50%;" />

### Spring中的Service有多个实现类，怎么注入？

- 使用@Qualifier("BeanId")来指定注入哪一个
- 使用@Resource(type="类名.class")来指定注入哪一个
- 每个Service的impl都可以指定名称（使用@Service("名称")），在Controller中注入service的时候使用名称来指定注入哪一个（使用@Resource(name="名称")）

### Spring Sercuity 和 Shiro有什么区别？