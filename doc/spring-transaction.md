# 事务的基本原理

## 数据库事务

事务的全称是数据库事务，它是数据库管理系统执行过程中的一个逻辑单位，由一个有限的数据库操作序列构成。数据库事务通常包含了一个序列的对数据库的读/写操作。使用事务，是为了达到以下两个目的：

1. 为数据库操作序列提供了一个从失败中恢复到正常状态的方法，同时提供了数据库即使在异常状态下仍能保持一致性的方法
2. 当多个应用程序在并发访问数据库时，可以在这些应用程序之间提供一个隔离方法，以防止彼此的操作互相干扰

当事务被提交给了数据库管理系统， 则数据库管理系统需要确保该事务中的所有操作都完成且其结果被永久保存在数据库中，如果事务中有的操作没有成功完成，则事务中的所有操作都需要回滚，回到事务执行前的状态；同时，该事务对数据库或者其他事务的执行无影响，所有的事务都好像在独立的运行。

举例来说，某人在商店使用电子货币购买100元的东西，当中至少包括两个操作：

1. 该人账户减少100元
2. 商店账户增加100元

那么此时，这个交易系统的数据库管理系统，就必须要确保以上两个操作同时成功或者同时失败。在现实情况中，失败的风险其实是很高的，网络环境、程序代码的漏洞、数据库系统/操作系统出错、甚至存储介质出错等都有可能引起其中某一方失败的情况。因此，这就需要数据库管理系统对一个执行失败的事务执行恢复操作，将数据库恢复到数据一致的状态。为了实现将数据库恢复到一致状态的功能，数据库管理系统通常都需要维护事务日志，以追踪事务中所有影响数据库数据的操作。

开启事务开使用语句`BEGIN`，提交事务可以使用`COMMIT`。默认情况下，MySQL（`innodb`）会启用后自动提交模式（`autocommit=ON`），这意味着，只要执行DML操作的语句，MySQL会立即隐式地提交事务，相比之下，oracle则需要手动开启/提交事务。

并非所有对数据库的操作都需要开启事务，只有那些需要保证一致性的场景，才考虑使用事务。如果你的程序只是执行单条查询，则没有必要使用事务，即时是多条语句，很多情况下也是不需要事务的。简言之，每次在程序中要使用事务前都应该做好评估，而不是不加思索的使用事务，不应该在程序代码中泛滥的使用事务。另外，如果开启了事务，而没有即时提交，就可能会导致数据库事务提交异常，从而引起无法预料的错误。

## 事务的特性

数据库事务拥有以下四个特性，习惯上被称为ACID特性：

- 原子性（Atomicity）：事务作为一个整体被执行，包括在其中的对数据库的操作要么全部被执行，要么都不执行
- 一致性（Consistency）：事务应确保数据库的状态从一个一致状态转变为另一个一致状态。一致状态的含义是数据库中的数据应满足完整性约束
- 隔离性（Isolation）：多个事务并发执行时，一个事务的执行不应该影响其他事务的执行
- 持久性（Durability）：已被提交的事务对数据的修改应该永久保存在数据库中

# Spring 中的事务

Spring为事务提供了完整的支持，使用Spring来管理事务有以下好处：

- Spring为不同的编程模型如JTA、JDBC、Hibernate、JPA等，提供了统一的事务API
- 支持声明式事务，更容易的管理事务
- 相比于 JTA，Spring为编程式事务提供更加简单的API

统一事务的编程模型的好处：

- 

## 声明式事务管理

使用@Transactional注解来管理事务比较简单，示例如下：

```java
@Service
public class TransactionDemo {

    @Transactional
    public void declarativeUpdate() {
        updateOperation1();
        updateOperation2();
    }
}
```

这样的写法相当于在进入`declarativeUpdate()`方法前，使用`BEGIN`开启了事务，在执行完方法后，使用`COMMIT`提交事务。

## 编程式事务管理

相比之下，使用编程式事务要略微复杂一些：

```java
@Service
public class TransactionDemo {
    
    @Autowired
    private TransactionTemplate transactionTemplate;

    public void programmaticUpdate() {
        // 这里也可以使用Lambda表达式
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                updateOperation1();
                updateOperation2();
            }
        });
    }
}

```

如果你的程序中需要指定某种异常发生后才回滚，那么可以使用try...catch，切记此时需要调用TransactionStatus的setRollbackOnly方法：

```java
package com.example.transaction;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@Slf4j
public class TransactionDemo {

    @Autowired
    private TransactionTemplate transactionTemplate;

    public void programmaticUpdate() {
        
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                try {
                    updateOperation1();
                    updateOperation2();
                    // 指定异常类型
                } catch (Exception ex) {
                    log.info("exception happen ....");
                    status.setRollbackOnly();
                }
            }
        });
    }
}

```

如果需要获取事务的执行结果，那么可以使用：

```java
package com.example.transaction;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class TransactionDemo {

    @Autowired
    private TransactionTemplate transactionTemplate;

    public void programmaticUpdate() {
        String result = transactionTemplate.execute(new TransactionCallback<String>() {
            @Override
            public String doInTransaction(TransactionStatus status) {
                updateOperation1();
                updateOperation2();
                // 返回执行的结果
                return "ok";
            }
        });
    }
}
```

## 声明式事务还是编程式事务？

|          | 编程式事务                                                   | 声明式事务                                                   |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 使用方法 | @Transactional                                               | TransactionTemplate                                          |
| 优点     | 使用简单                                                     | 可以控制事务提交的开启和提交时机，能够更小粒度的控制事务的范围，也更加直观 |
| 缺点     | 使用不当事务可能失效；多个事务性操作可能导致事务无法正常提交，导致长事务 | 需要硬编码来控制事务                                         |
| 适用场景 | 同一个方法中，事务操作比较多                                 | 当事务操作的数量很少                                         |

在合适的场景使用合适的方式非常重要，在一些场景下，当对事务操作非常频繁，特别是在递归、外部通讯等耗时的场景中使用事务，很有可能就会引发长事务，那么应该考虑将非事务的部分放在前面执行，最后在写入数据环节时再开启事务。

## 事务传播行为

完整文档：[Spring事务](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#tx-propagation)

https://www.javainuse.com/spring/boot-transaction-propagation

### PROPAGATION_REQUIRED

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202205232300625.png" alt="image-20220523230017497" style="zoom:67%;" />

### PROPAGATION_REQUIRES_NEW

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202205232304567.png" alt="image-20220523230418503" style="zoom:67%;" />

这种传播级别会在每个方法开启独立的事务，事务的回滚与调用它的方法无关。

### PROPAGATION_NESTED

在这种隔离级别下，内部事务回滚并不会影响外部事务的执行。

# Spring 事务的实现原理

了解他们的基本使用方法，接下来我们将一起分析Spring事务的实现原理。在正式分析实现过程前，我们首先需要了解一些比较核心API，这将帮助抽丝剥茧的理解Spring事务的实现原理。

## Spring 事务的核心API

事务操作相关的API：

- Spring事务@Enanle模块驱动 - @EnableTranSactionManagement
- Spring事务注解 - @Transactional
- Spring事务事件监听器 - @TransactionalEventListener

事务抽象相关的API

- Spring平台事务管理器 - PlatformTransactionManager

- Spring事务定义 - TransactionDefinition
- Spring事务状态 - TransactionStatus

- Spring事务代理配置 - ProxyTransactionManagementConfiguration

AOP相关的API：

- Spring事务PointcutAdvisor实现 - BeanFactoryTransactionAttrubuteSourceAdvisor
- Spring事务MethodInterceptor实现 - TransactionInterceptor
- Spring事务属性源 - TransactionAttributeSource

其中，PlatformTransactionManager、TransactionDefinition、TransactionStatus最为重要，他们之间的关系如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/imgimage-20220530234248183.png" alt="image-20220530234248183" style="zoom: 80%;" />

### PlatformTransactionManager

PlatformTransactionManager是Spring对于事务模型的抽象，它代表事务的整体执行过程。通常事务都应用在关系型数据库中，Spring对于事务的读写的模型做了更高层次的抽象，使得其可以应用在任何需要数据一致性的场景，比如JMX等，Spring将这些场景统一的抽象为commit和rollback两个核心方法。

PlatformTransactionManager的核心方法：

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface PlatformTransactionManager {
    // 获取事务的执行状态
    TransactionStatus getTransaction(@Nullable TransactionDefinition var1) throws TransactionException;
    // 提交事务
    void commit(TransactionStatus var1) throws TransactionException;
    // 回滚事务
    void rollback(TransactionStatus var1) throws TransactionException;
}
```

这里需要注意的是，如果有@Transactional注解的方法，如果他们对应的传播行为不同，那么其对应的TransactionDefinition也是不同的，这也就是说getTransaction这个方法获取到的并不是物理事务，而是某个具体方法的逻辑事务，同理，commit和rollback也是对应的这个逻辑事务。

### TransactionDefinition

TransactionDefinition是事务的元信息定义，类似于Spring IOC中BeanDefinition。实际上，Spring中事务的定义参考了EJB中对于事务的定义，TransactionDefinition的核心方法有：

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface TransactionDefinition {
    
    int PROPAGATION_REQUIRED = 0;
    
    int PROPAGATION_SUPPORTS = 1;
    
    int PROPAGATION_MANDATORY = 2;
    
    int PROPAGATION_REQUIRES_NEW = 3;
    
    int PROPAGATION_NOT_SUPPORTED = 4;
    
    int PROPAGATION_NEVER = 5;
    
    int PROPAGATION_NESTED = 6;
    
    int ISOLATION_DEFAULT = -1;
    
    int ISOLATION_READ_UNCOMMITTED = 1;
    
    int ISOLATION_READ_COMMITTED = 2;
    
    int ISOLATION_REPEATABLE_READ = 4;
    
    int ISOLATION_SERIALIZABLE = 8;
    
    int TIMEOUT_DEFAULT = -1;
    // 返回事务的传播行为，默认值为 REQUIRED。
    int getPropagationBehavior();
    //返回事务的隔离级别，默认值是 DEFAULT
    int getIsolationLevel();
    // 返回事务的超时时间，默认值为-1。如果超过该时间限制但事务还没有完成，则自动回滚事务。
    int getTimeout();
    // 返回是否为只读事务，默认值为 false
    boolean isReadOnly();

    @Nullable
    String getName();
}
```

### TransactionStatus

事务分为逻辑事务和物理事务，逻辑事务是指代码中事务的操作；物理事务是通过数据库连接来获取相关的物理的连接以及相关的数据库的事务。TransactionStatus是用来描述当前逻辑事务的执行情况，其核心方法及含义：

```java
public interface TransactionStatus {
    // 当前事务执行是否在新的事务
    boolean isNewTransaction();
    // 是否有恢复点（小范围的回滚）
    boolean hasSavepoint();
    // 设置当前事务为只回滚
    void setRollbackOnly();
    // 当前事务是否为只回滚
    boolean isRollbackOnly(); 
    // 当前事务是否已完成
    boolean isCompleted;
}
```

从Spring5.2开始，对这个接口进行了拆分，将部分方法放置在了TransactionExecution中：

```java
/**
 * @since 5.2
 */
public interface TransactionExecution {
	boolean isNewTransaction();
	void setRollbackOnly();
	boolean isRollbackOnly();
	boolean isCompleted();
}
```

## 事务实现过程分析

### @Transactional与AOP

@Transactional基于Spring AOP实现，其执行流程大致如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/imgimage-20220530234841511.png" alt="image-20220530234841511" style="zoom:80%;" />

针对于@Transactional的实现，几个关键点是：

- Spring中是如何定义Interceptor的？也就是说，哪些方法会被拦截？
- 拦截后，代理类中invoke方法是如何执行的？
- 当有多个逻辑事务时，Spring是如何保证物理事务正确提交的？
- 事务的传播行为的处理细节是怎么样的？

### @Transactional的实现原理

首先我们来观察@Transactional的定义：

```java
// 可以作用在类上面，也可以作用在方法上
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Transactional {

	// 事务管理器（PlatformTransactionManager），和transactionManager互为别名
	@AliasFor("transactionManager")
    
	String value() default "";

	@AliasFor("value")
	String transactionManager() default "";

	// 事务的传播行为
	Propagation propagation() default Propagation.REQUIRED;

	// 事务的超时时间，默认是-1，表示永远不会超时
	int timeout() default TransactionDefinition.TIMEOUT_DEFAULT;

    // 是否只读事务，如果是只读事务，Spring会在执行事务的时候会做相应的优化
	boolean readOnly() default false;

    // 回滚的异常类型
	Class<? extends Throwable>[] rollbackFor() default {};
}
```

如果需要在SpringBoot中要使用@Transactional，我们需要添加@EnableTransactionManagement注解：

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
// 自动装配类
@Import(TransactionManagementConfigurationSelector.class)
public @interface EnableTransactionManagement {
    // ...
}
```

进入这个注解对应的自动装配类：

```java
public class TransactionManagementConfigurationSelector extends AdviceModeImportSelector<EnableTransactionManagement> {

	@Override
	protected String[] selectImports(AdviceMode adviceMode) {
        // 支持动态代理和ASPECTJ两种AOP的实现方法，默认是代理的方式
		switch (adviceMode) {
			case PROXY:
				return new String[] {AutoProxyRegistrar.class.getName(),
						ProxyTransactionManagementConfiguration.class.getName()};
			case ASPECTJ:
				return new String[] {determineTransactionAspectClass()};
			default:
				return null;
		}
	}
}
```

进入代理模式的配置类ProxyTransactionManagementConfiguration，这是一个标准的SpringBoot的配置类：

```java
@Configuration(proxyBeanMethods = false)
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
public class ProxyTransactionManagementConfiguration extends AbstractTransactionManagementConfiguration {

	@Bean(name = TransactionManagementConfigUtils.TRANSACTION_ADVISOR_BEAN_NAME)
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public BeanFactoryTransactionAttributeSourceAdvisor transactionAdvisor(
			TransactionAttributeSource transactionAttributeSource, TransactionInterceptor transactionInterceptor) {

		BeanFactoryTransactionAttributeSourceAdvisor advisor = new BeanFactoryTransactionAttributeSourceAdvisor();
		advisor.setTransactionAttributeSource(transactionAttributeSource);
		advisor.setAdvice(transactionInterceptor);
		if (this.enableTx != null) {
			advisor.setOrder(this.enableTx.<Integer>getNumber("order"));
		}
		return advisor;
	}

    // 获取AOP的注解
	@Bean
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public TransactionAttributeSource transactionAttributeSource() {
		return new AnnotationTransactionAttributeSource();
	}

	@Bean
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public TransactionInterceptor transactionInterceptor(TransactionAttributeSource transactionAttributeSource) {
		TransactionInterceptor interceptor = new TransactionInterceptor();
		interceptor.setTransactionAttributeSource(transactionAttributeSource);
		if (this.txManager != null) {
			interceptor.setTransactionManager(this.txManager);
		}
		return interceptor;
	}

}
```

TransactionAttributeSource前面我们介绍过，它是Spring事务属性源 ，进入AnnotationTransactionAttributeSource的构造方法，我们可以看到：

```java
	public AnnotationTransactionAttributeSource(boolean publicMethodsOnly) {
		this.publicMethodsOnly = publicMethodsOnly;
		if (jta12Present || ejb3Present) {
			this.annotationParsers = new LinkedHashSet<>(4);
			this.annotationParsers.add(new SpringTransactionAnnotationParser());
			if (jta12Present) {
				this.annotationParsers.add(new JtaTransactionAnnotationParser());
			}
			if (ejb3Present) {
				this.annotationParsers.add(new Ejb3TransactionAnnotationParser());
			}
		}
		else {
			this.annotationParsers = Collections.singleton(new SpringTransactionAnnotationParser());
		}
	}
```

这里会将一些注解解析类添加到AnnotationTransactionAttributeSource的annotationParsers中，这里以默认的SpringTransactionAnnotationParser为例：

```java
	@Override
	@Nullable
	public TransactionAttribute parseTransactionAnnotation(AnnotatedElement element) {
        // 获取拥有@Transactional注解的类或方法
		AnnotationAttributes attributes = AnnotatedElementUtils.findMergedAnnotationAttributes(
				element, Transactional.class, false, false);
		if (attributes != null) {
			return parseTransactionAnnotation(attributes);
		}
		else {
			return null;
		}
	}
```

JtaTransactionAnnotationParser和Ejb3TransactionAnnotationParser也是类似的实现，也就是说Spring不仅支持`org.springframework.transaction.annotation.Transactional`还支持`javax.transaction.Transactional.class`和`javax.ejb.TransactionAttribute`，在Spring统一的编程模型下，这三个注解都可以通用。

接下来我们查看执行的核心方法，即TransactionInterceptor的invoke方法：

```java
@Override
	@Nullable
	public Object invoke(MethodInvocation invocation) throws Throwable {
        
		// ...
        
		return invokeWithinTransaction(invocation.getMethod(), targetClass, new CoroutinesInvocationCallback() {
			@Override
			@Nullable
			public Object proceedWithInvocation() throws Throwable {
				return invocation.proceed();
			}
			@Override
			public Object getTarget() {
				return invocation.getThis();
			}
			@Override
			public Object[] getArguments() {
				return invocation.getArguments();
			}
		});
	}
```

进入invokeWithinTransaction方法：

```java
	@Nullable
	protected Object invokeWithinTransaction(Method method, @Nullable Class<?> targetClass,
			final InvocationCallback invocation) throws Throwable {

		// If the transaction attribute is null, the method is non-transactional.
		TransactionAttributeSource tas = getTransactionAttributeSource();
		final TransactionAttribute txAttr = (tas != null ? tas.getTransactionAttribute(method, targetClass) : null);
		final TransactionManager tm = determineTransactionManager(txAttr);
		PlatformTransactionManager ptm = asPlatformTransactionManager(tm);
        
		final String joinpointIdentification = methodIdentification(method, targetClass, txAttr);

		if (txAttr == null || !(ptm instanceof CallbackPreferringPlatformTransactionManager)) {
			TransactionInfo txInfo = createTransactionIfNecessary(ptm, txAttr, joinpointIdentification);

			Object retVal;
			try {
				// 环绕通知
				retVal = invocation.proceedWithInvocation();
			}
			catch (Throwable ex) {
				// target invocation exception
                // 发生异常
				completeTransactionAfterThrowing(txInfo, ex);
				throw ex;
			}
			finally {
				cleanupTransactionInfo(txInfo);
			}

			if (retVal != null && vavrPresent && VavrDelegate.isVavrTry(retVal)) {
				// Set rollback-only in case of Vavr failure matching our rollback rules...
				TransactionStatus status = txInfo.getTransactionStatus();
				if (status != null && txAttr != null) {
					retVal = VavrDelegate.evaluateTryFailure(retVal, txAttr, status);
				}
			}
			// 正常提交
			commitTransactionAfterReturning(txInfo);
			return retVal;
		}
		// 异常回滚
		else {
			Object result;
			final ThrowableHolder throwableHolder = new ThrowableHolder();

			// It's a CallbackPreferringPlatformTransactionManager: pass a TransactionCallback in.
			try {
				result = ((CallbackPreferringPlatformTransactionManager) ptm).execute(txAttr, status -> {
					TransactionInfo txInfo = prepareTransactionInfo(ptm, txAttr, joinpointIdentification, status);
					try {
						Object retVal = invocation.proceedWithInvocation();
						if (retVal != null && vavrPresent && VavrDelegate.isVavrTry(retVal)) {
							// Set rollback-only in case of Vavr failure matching our rollback rules...
							retVal = VavrDelegate.evaluateTryFailure(retVal, txAttr, status);
						}
						return retVal;
					}
					catch (Throwable ex) {
						if (txAttr.rollbackOn(ex)) {
							// A RuntimeException: will lead to a rollback.
							if (ex instanceof RuntimeException) {
								throw (RuntimeException) ex;
							}
							else {
								throw new ThrowableHolderException(ex);
							}
						}
						else {
							// A normal return value: will lead to a commit.
							throwableHolder.throwable = ex;
							return null;
						}
					}
					finally {
						cleanupTransactionInfo(txInfo);
					}
				});
			}
			catch (ThrowableHolderException ex) {
				throw ex.getCause();
			}
			catch (TransactionSystemException ex2) {
				if (throwableHolder.throwable != null) {
					logger.error("Application exception overridden by commit exception", throwableHolder.throwable);
					ex2.initApplicationException(throwableHolder.throwable);
				}
				throw ex2;
			}
			catch (Throwable ex2) {
				if (throwableHolder.throwable != null) {
					logger.error("Application exception overridden by commit exception", throwableHolder.throwable);
				}
				throw ex2;
			}

			// Check result state: It might indicate a Throwable to rethrow.
			if (throwableHolder.throwable != null) {
				throw throwableHolder.throwable;
			}
			return result;
		}
	}
```

其中：

```java
protected void commitTransactionAfterReturning(@Nullable TransactionInfo txInfo) {
		if (txInfo != null && txInfo.getTransactionStatus() != null) {
			txInfo.getTransactionManager().commit(txInfo.getTransactionStatus());
		}
	}
```

进入commit方法：

```java
	@Override
	public final void commit(TransactionStatus status) throws TransactionException {
		if (status.isCompleted()) {
			throw new IllegalTransactionStateException(
					"Transaction is already completed - do not call commit or rollback more than once per transaction");
		}

		DefaultTransactionStatus defStatus = (DefaultTransactionStatus) status;
		if (defStatus.isLocalRollbackOnly()) {
			if (defStatus.isDebug()) {
				logger.debug("Transactional code has requested rollback");
			}
			processRollback(defStatus, false);
			return;
		}

		if (!shouldCommitOnGlobalRollbackOnly() && defStatus.isGlobalRollbackOnly()) {
			if (defStatus.isDebug()) {
				logger.debug("Global transaction is marked as rollback-only but transactional code requested commit");
			}
			processRollback(defStatus, true);
			return;
		}

		processCommit(defStatus);
	}
```

继续进入processCommit方法：

```java
private void processCommit(DefaultTransactionStatus status) throws TransactionException {
		try {
			boolean beforeCompletionInvoked = false;

			try {
				boolean unexpectedRollback = false;
				prepareForCommit(status);
				triggerBeforeCommit(status);
				triggerBeforeCompletion(status);
				beforeCompletionInvoked = true;

				if (status.hasSavepoint()) {
					if (status.isDebug()) {
						logger.debug("Releasing transaction savepoint");
					}
					unexpectedRollback = status.isGlobalRollbackOnly();
					status.releaseHeldSavepoint();
				}
				else if (status.isNewTransaction()) {
					if (status.isDebug()) {
						logger.debug("Initiating transaction commit");
					}
					unexpectedRollback = status.isGlobalRollbackOnly();
                    // 真正提交事务的方法
					doCommit(status);
				}
				else if (isFailEarlyOnGlobalRollbackOnly()) {
					unexpectedRollback = status.isGlobalRollbackOnly();
				}

				// Throw UnexpectedRollbackException if we have a global rollback-only
				// marker but still didn't get a corresponding exception from commit.
				if (unexpectedRollback) {
					throw new UnexpectedRollbackException(
							"Transaction silently rolled back because it has been marked as rollback-only");
				}
			}
			catch (UnexpectedRollbackException ex) {
				// can only be caused by doCommit
				triggerAfterCompletion(status, TransactionSynchronization.STATUS_ROLLED_BACK);
				throw ex;
			}
			catch (TransactionException ex) {
				// can only be caused by doCommit
				if (isRollbackOnCommitFailure()) {
					doRollbackOnCommitException(status, ex);
				}
				else {
					triggerAfterCompletion(status, TransactionSynchronization.STATUS_UNKNOWN);
				}
				throw ex;
			}
			catch (RuntimeException | Error ex) {
				if (!beforeCompletionInvoked) {
					triggerBeforeCompletion(status);
				}
				doRollbackOnCommitException(status, ex);
				throw ex;
			}

			// Trigger afterCommit callbacks, with an exception thrown there
			// propagated to callers but the transaction still considered as committed.
			try {
				triggerAfterCommit(status);
			}
			finally {
				triggerAfterCompletion(status, TransactionSynchronization.STATUS_COMMITTED);
			}

		}
		finally {
			cleanupAfterCompletion(status);
		}
	}

```

以`DataSourceTransactionManager`中的doCommit为例：

```java
	@Override
	protected void doCommit(DefaultTransactionStatus status) {
		DataSourceTransactionObject txObject = (DataSourceTransactionObject) status.getTransaction();
        // 获取数据库连接
		Connection con = txObject.getConnectionHolder().getConnection();
		try {
            // 提交事务
			con.commit();
		}
		catch (SQLException ex) {
			throw translateException("JDBC commit", ex);
		}
	}
```

可以看到，这里才是物理事务的提交。类似的，回滚也是获取数据库的连接，然后调用回滚的方法：

```java
	@Override
	protected void doRollback(DefaultTransactionStatus status) {
		DataSourceTransactionObject txObject = (DataSourceTransactionObject) status.getTransaction();
		Connection con = txObject.getConnectionHolder().getConnection();
		try {
            // 回滚事务
			con.rollback();
		}
		catch (SQLException ex) {
			throw translateException("JDBC rollback", ex);
		}
	}
```

### TransactionTemplate的实现原理

有了@Transactional实现过程的基础，TransactionTemplate的实现就比较容易理解了，TransactionTemplate本质上是一种模板方法的设计模式的应用：

```java
	@SuppressWarnings("serial")
public class TransactionTemplate extends DefaultTransactionDefinition
		implements TransactionOperations, InitializingBean {
    @Override
	@Nullable
	public <T> T execute(TransactionCallback<T> action) throws TransactionException {
       		 // ...
			TransactionStatus status = this.transactionManager.getTransaction(this);
			T result;
			try {
                // 模板方法
				result = action.doInTransaction(status);
			}
			catch (RuntimeException | Error ex) {
                // 发生异常即回滚
				rollbackOnException(status, ex);
				throw ex;
			}
			catch (Throwable ex) {
				rollbackOnException(status, ex);
				throw new UndeclaredThrowableException(ex, "TransactionCallback threw undeclared checked exception");
			}
            // 没有发生异常就提交事务
			this.transactionManager.commit(status);
			return result;
		}
}
```

这一点可以从TransactionCallbackWithoutResult这个抽象类中就可以看出：

```java
public abstract class TransactionCallbackWithoutResult implements TransactionCallback<Object> {

	@Override
	@Nullable
	public final Object doInTransaction(TransactionStatus status) {
		doInTransactionWithoutResult(status);
		return null;
	}

	// 方法的实现就是我们需要执行的业务代码
	protected abstract void doInTransactionWithoutResult(TransactionStatus status);

}
```

# 事务失效及长事务



## 如何避免长事务



## 多线程中的事务