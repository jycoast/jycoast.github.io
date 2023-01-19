---
title: Java知识体系专辑
categories:
  - 面试题
author: 吉永超
date: 2022-11-07 00:00:00
tags:
- 面试
- Java
---

一入Java深似海。

<!-- more -->

# 框架源码分析

## Spring源码分析

### Spring核心原理概览

Spring Framework的核心知识点：

- Bean的生命周期底层原理
- 依赖注入底层实现原理
- 初始化底层原理
- 推断构造方法底层原理
- AOP底层原理
- Spring事务底层原理

推断构造方法：先根据类型进行依赖查找，如果找到多个，那么再根据名称查找，直到找到唯一的Bean，如果要指定构造方法，需要添加@Autowried注解来实现。

AOP大致的实现原理：先使用cglib生成代理类，将代理对象的target属性赋值为IOC容器中的普通对象（普通对象是依赖注入的后的对象），然后再执行切面的逻辑，最后调用普通对象的方法。

如何判断当前Bean对象需不需要进行AOP：

1. 找出所有的切面Bean
2. 遍历切面中的每个方法，查看是否有@Before、@After等注解
3. 如果有，则判断对应的Pointcut是否和当前Bean对象的类是否匹配
4. 如果匹配则表示当前Bean对象有匹配的Pointcut，表示需要进行AOP，会将AOP需要执行的方法缓存

Spring 自动事务的大致实现过程：

1. 判读方法是否含有@Transactional注解
2. 通过事务管理器（dataSource）创建一个数据库连接
3. 设置`conn.autocommit=false`
4. 执行目标方法，提交事务结果

解决事务失效的核心思路：只要是调用代理对象的方法，事务就可以生效。

### Spring核心概念

#### BeanDefinition

BeanDefinition表示Bean的元信息定义，BeanDefition中存在很多属性用来描述一个Bean的特点。比如：

- class，表示Bean的类型
- scope，表示Bean的作用域（单例或圆形）
- lazyInit：表示Bean是否是懒加载
- initMethodName：表示Bean初始化时要执行的方法
- destoreMethodName：表示Bean销毁时要执行的方法
- ......

通过XML方式配置和使用注解等方式声明的Bean，都会被Spring解析为对应的BeanDefinition对象，并放入Spring容器中。

通过编程式声明Bean对象：

```java
AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

// 生成一个BeanDefinition对象，并设置beanClass为User.class，并注册到ApplicationContext中
AbstractBeanDefinition beanDefinition = BeanDefinitionBuilder.genericBeanDefinition().getBeanDefinition();
beanDefinition.setBeanClass(User.class);
context.registerBeanDefinition("user", beanDefinition);

System.out.println(context.getBean("user"));
```

BeanDefinition的典型实现：

- org.springframework.beans.factory.support.GenericBeanDefinition
- org.springframework.beans.factory.annotation.AnnotatedGenericBeanDefinition
- org.springframework.context.annotation.ScannedGenericBeanDefinition
- org.springframework.beans.factory.support.RootBeanDefinition
- org.springframework.beans.factory.support.ChildBeanDefinition

#### AnnotatedBeanDefinitionReader

AnnotatedBeanDefinitionReader可以直接把某个类转换为BeanDefition，并且会解析该类上的注解，比如：

```java
AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

AnnotatedBeanDefinitionReader annotatedBeanDefinitionReader = new AnnotatedBeanDefinitionReader(context);

// 将User.class解析为BeanDefinition
annotatedBeanDefinitionReader.register(User.class);

System.out.println(context.getBean("user"));
```

注意，它能解析的注解有：@Conditional、@Scope、@Lazy、@Primary、@DependsOn、@Role、@Description

#### XmlBeanDefinitionReader

XmlBeanDefinitionReader可以用来解析<bean/>标签

```java
AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

XmlBeanDefinitionReader xmlBeanDefinitionReader = new XmlBeanDefinitionReader(context);
int i = xmlBeanDefinitionReader.loadBeanDefinitions("spring.xml");

System.out.println(context.getBean("user"));
```

#### ClassPathBeanDefinitionScanner

ClassPathBeanDefinitionScanner是扫描器，作用和BeanDefinitionReader类似，它可以扫描某个包路径，对扫描到的类进行解析，比如，扫描到的类上如果存在@Component注解，那么就会把这个类解析为一个BeanDefition，比如：

```java
AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
context.refresh();

ClassPathBeanDefinitionScanner scanner = new ClassPathBeanDefinitionScanner(context);
scanner.scan("com.jyc");

System.out.println(context.getBean("userService"));
```

#### BeanFactory

BeanFactory表示Bean工厂，BeanFactory会负责创建Bean，并且提供获取Bean的API。

ApplicationContext继承了BeanFactory，ApplicationContext除了BeanFactory提供的基础功能外，还提供了国际化、事件发布、获取环境变量等功能。

BeanFactory的类图如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202211132330370.png" alt="img" style="zoom:67%;" />

其中DefaultListableBeanFactory是最重要的实现之一。其余接口的主要功能如下：

1. AliasRegistry：支持别名功能，一个名字可以对应多个别名
2. BeanDefinitionRegistry：可以注册、保存、移除、获取某个BeanDefinition
3. BeanFactory：Bean工厂，可以根据某个bean的名字、或类型、或别名获取某个Bean对象
4. SingletonBeanRegistry：可以直接注册、获取某个**单例**Bean
5. SimpleAliasRegistry：它是一个类，实现了AliasRegistry接口中所定义的功能，支持别名功能
6. ListableBeanFactory：在BeanFactory的基础上，增加了其他功能，可以获取所有BeanDefinition的beanNames，可以根据某个类型获取对应的beanNames，可以根据某个类型获取{类型：对应的Bean}的映射关系
7. HierarchicalBeanFactory：在BeanFactory的基础上，添加了获取父BeanFactory的功能
8. DefaultSingletonBeanRegistry：它是一个类，实现了SingletonBeanRegistry接口，拥有了直接注册、获取某个**单例**Bean的功能
9. ConfigurableBeanFactory：在HierarchicalBeanFactory和SingletonBeanRegistry的基础上，添加了设置父BeanFactory、类加载器（表示可以指定某个类加载器进行类的加载）、设置Spring EL表达式解析器（表示该BeanFactory可以解析EL表达式）、设置类型转化服务（表示该BeanFactory可以进行类型转化）、可以添加BeanPostProcessor（表示该BeanFactory支持Bean的后置处理器），可以合并BeanDefinition，可以销毁某个Bean等等功能
10. FactoryBeanRegistrySupport：支持了FactoryBean的功能
11. AutowireCapableBeanFactory：是直接继承了BeanFactory，在BeanFactory的基础上，支持在创建Bean的过程中能对Bean进行自动装配
12. AbstractBeanFactory：实现了ConfigurableBeanFactory接口，继承了FactoryBeanRegistrySupport，这个BeanFactory的功能已经很全面了，但是不能自动装配和获取beanNames
13. ConfigurableListableBeanFactory：继承了ListableBeanFactory、AutowireCapableBeanFactory、ConfigurableBeanFactory
14. AbstractAutowireCapableBeanFactory：继承了AbstractBeanFactory，实现了AutowireCapableBeanFactory，拥有了自动装配的功能
15. DefaultListableBeanFactory：继承了AbstractAutowireCapableBeanFactory，实现了ConfigurableListableBeanFactory接口和BeanDefinitionRegistry接口，所以DefaultListableBeanFactory的功能很强大

#### ApplicationContext

ApplicationContext提供了如下功能：

- HierachicalBeanFactory：拥有获取父BeanFactory的功能
- ListableBeanFactory：拥有获取beanNames的功能
- ResourcePatternResolver：资源加载器，可以一次性获取多个资源（文件资源等等）
- EnvironmentCapable：可以获取运行时环境（没有设置运行时环境的功能）
- ApplicationEventPublisher：拥有广播事件的功能（没有添加事件监听器的功能）
- MessageSource：拥有国际化功能

ApplicationContext的典型实现：

- org.springframework.context.annotation.AnnotationConfigApplicationContext
- org.springframework.context.support.ClassPathXmlApplicationContext

#### PropertyEditor

PropertyEditor是JDK中提供的类型转化工具类。

通常我们会定义一个类型转换器：

```java
// 继承PropertyEditorSupport
public class StringToUserPropertyEditor extends PropertyEditorSupport {

	@Override
	public void setAsText(String text) throws IllegalArgumentException {
		User user = new User();
		user.setName(text);
		this.setValue(user);
	}
}
```

向Spring中注册PropertyEditor：

```java
@Bean
public CustomEditorConfigurer customEditorConfigurer() {
	CustomEditorConfigurer customEditorConfigurer = new CustomEditorConfigurer();
	Map<Class<?>, Class<? extends PropertyEditor>> propertyEditorMap = new HashMap<>();
  // 表示StringToUserPropertyEditor可以将String转化成User类型，在Spring源码中，如果发现当前对象是String，而需要的类型是User，就会使用该PropertyEditor来做类型转化
	propertyEditorMap.put(User.class, StringToUserPropertyEditor.class);
	customEditorConfigurer.setCustomEditors(propertyEditorMap);
	return customEditorConfigurer;
}
```

假设有如下Bean：

```java
@Component
public class UserService {

	@Value("xxx")
	private User user;

	public void test() {
		System.out.println(user);
	}

}
```

那么user这个属性就会按照StringToUserPropertyEditor中定义好的规则来进行属性赋值。

#### ConversionService

ConversionService是Spring中提供的类型转化服务，它比PropertyEditor更加强大。与PropertyEditor类似，首先定义一个转换器。

```java
	public class StringToUserConverter implements ConditionalGenericConverter {

	@Override
	public boolean matches(TypeDescriptor sourceType, TypeDescriptor targetType) {
		return sourceType.getType().equals(String.class) && targetType.getType().equals(User.class);
	}

	@Override
	public Set<ConvertiblePair> getConvertibleTypes() {
		return Collections.singleton(new ConvertiblePair(String.class, User.class));
	}

	@Override
	public Object convert(Object source, TypeDescriptor sourceType, TypeDescriptor targetType) {
		User user = new User();
		user.setName((String)source);
		return user;
	}
}
```

与PropertyEditor相比，conversionService可以自定义转换类型，PropertyEditor仅仅支持String类型转换成其他的类型。

向Spring中注册conversionService：

```java
@Bean
public ConversionServiceFactoryBean conversionService() {
	ConversionServiceFactoryBean conversionServiceFactoryBean = new ConversionServiceFactoryBean();
	conversionServiceFactoryBean.setConverters(Collections.singleton(new StringToUserConverter()));
	return conversionServiceFactoryBean;
}
```

#### TypeConverter

TypeConverter整合了PropertyEditor和conversionService的功能，在Spring内部使用：

```java
SimpleTypeConverter typeConverter = new SimpleTypeConverter();
typeConverter.registerCustomEditor(User.class, new StringToUserPropertyEditor());
User value = typeConverter.convertIfNecessary("1", User.class);
System.out.println(value);
```

typeConverter本身使用了委托的设计模式，其类型转换的功能实际上委托给了内部的propertyEditor和conversionService对象，这样做的好处是使用者无需关心内部转换细节。

#### OrderComparator

OrderComparator是Spring所提供的一种比较器，可以根据@Order注解或实现Ordered接口来执行值进行比较，从而可以进行排序。

另外，Spring中还提供了OrderComparator的子类：AnnotationAwareOrderComparator，它支持使用注解@Order来指定order的值。

#### BeanPostProcessor



#### BeanFactoryPostProcessor



#### FactoryBean

除了可以通过BeanPostProcessor来自定义Spring创建Bean的过程，但是如果我们想要一个Bean完全由我们自己来创造，就可以通过FactoryBean来实现：

```java
@Component
public class JycFactoryBean implements FactoryBean {

	@Override
	public Object getObject() throws Exception {
		UserService userService = new UserService();

		return userService;
	}

	@Override
	public Class<?> getObjectType() {
		return UserService.class;
	}
}
```

在大多数场景下可以与@Bean替换使用，唯一的区别在于，这样产生的Bean不会经过Spring的生命周期步骤，只会进入初始化后的阶段，以便AOP操作。

#### ExcludeFilter和IncludeFilter

这两个Filter是Spring扫描过程中用来过滤的。ExcludeFilter表示排除过滤器，IncludeFilter表示包含过滤器。

在如下配置中，表示扫描com.jyc这个包下面所有的类，但是排除UserService类，即便它上面有@Component注解也不会注册为Bean。

```java
@ComponentScan(value = "com.jyc",
		excludeFilters = {@ComponentScan.Filter(
            	type = FilterType.ASSIGNABLE_TYPE, 
            	classes = UserService.class)}.)
public class AppConfig {
}
```

在如下配置中，即便Uservice类上没有@Component注解，它也会扫描成为一个Bean。

```java
@ComponentScan(value = "com.jyc",
		includeFilters = {@ComponentScan.Filter(
            	type = FilterType.ASSIGNABLE_TYPE, 
            	classes = UserService.class)})
public class AppConfig {
}
```

在Spring的扫描逻辑中，默认会添加一个AnnotationTypeFilter给includeFilters，表示默认情况下Spring扫描过程中会认为类上有@Component注解的就是Bean。

#### MetadataReader、ClassMetadata、AnnotationMetadata

在Spring中需要去解析类的信息，比如类名，类中的方法、类上的注解，这些都可以称之为类的元数据，所以Spring中对类的元数据做了抽象，并提供了一些工具类。

MetadataReader表示类的元数据读取器，默认实现类为SimpleMetadataReader。比如：

```java
public class Test {

	public static void main(String[] args) throws IOException {
    	SimpleMetadataReaderFactory simpleMetadataReaderFactory = new SimpleMetadataReaderFactory();
		
        // 构造一个MetadataReader
        MetadataReader metadataReader = simpleMetadataReaderFactory.getMetadataReader("com.jyc.service.UserService");
		
        // 得到一个ClassMetadata，并获取了类名
        ClassMetadata classMetadata = metadataReader.getClassMetadata();
	
        System.out.println(classMetadata.getClassName());
        
        // 获取一个AnnotationMetadata，并获取类上的注解信息
        AnnotationMetadata annotationMetadata = metadataReader.getAnnotationMetadata();
		for (String annotationType : annotationMetadata.getAnnotationTypes()) {
			System.out.println(annotationType);
		}

	}
}
```

需要注意的是，SimpleMetadataReader去解析类时，使用的是ASM技术。使用ASM技术的原因是，Spring启动的时候需要去扫描，如果指定的包路径比较宽泛，那么扫描的类是非常多的，这样会把这些类全部加载进JVM。

### Bean的生命周期

生命周期的整体流程：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202211212323410.png" alt="image-20221121232326365" style="zoom: 50%;" />

过程描述如下：

1. InstantiationAwareBeanPostProcessor#postProcessBeforeInstantiation
2. 实例化
3. MergedBeanDefinitionPostProcessor#postProcessMergedBeanDefinition
4. InstantiationAwareBeanPostProcessor#postProcessAfterInstantiation
5. 属性赋值（Spring自带的依赖注入）
6. InstantiationAwareBeanPostProcessor#postProcessProperties
7. 初始化前
8. 初始化
9. 初始化后

```java
	public AnnotationConfigApplicationContext() {
    // JFR 特性，用来记录时间
		StartupStep createAnnotatedBeanDefReader = this.getApplicationStartup().start("spring.context.annotated-bean-reader.create");
    // 构造一个reader和scanner
		this.reader = new AnnotatedBeanDefinitionReader(this);
		createAnnotatedBeanDefReader.end();
		this.scanner = new ClassPathBeanDefinitionScanner(this);
	}

```

```java
	public void refresh() throws BeansException, IllegalStateException {
		synchronized (this.startupShutdownMonitor) {
			StartupStep contextRefresh = this.applicationStartup.start("spring.context.refresh");

			// Prepare this context for refreshing.
			prepareRefresh();

			// Tell the subclass to refresh the internal bean factory.
			ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();

			// Prepare the bean factory for use in this context.
			prepareBeanFactory(beanFactory);

			try {
				// Allows post-processing of the bean factory in context subclasses.
				postProcessBeanFactory(beanFactory);

				StartupStep beanPostProcess = this.applicationStartup.start("spring.context.beans.post-process");
				// Invoke factory processors registered as beans in the context.
				invokeBeanFactoryPostProcessors(beanFactory);

				// Register bean processors that intercept bean creation.
				registerBeanPostProcessors(beanFactory);
				beanPostProcess.end();

				// Initialize message source for this context.
				initMessageSource();

				// Initialize event multicaster for this context.
				initApplicationEventMulticaster();

				// Initialize other special beans in specific context subclasses.
				onRefresh();

				// Check for listener beans and register them.
				registerListeners();

				// Instantiate all remaining (non-lazy-init) singletons.
				finishBeanFactoryInitialization(beanFactory);

				// Last step: publish corresponding event.
				finishRefresh();
			}

			catch (BeansException ex) {
				if (logger.isWarnEnabled()) {
					logger.warn("Exception encountered during context initialization - " +
							"cancelling refresh attempt: " + ex);
				}

				// Destroy already created singletons to avoid dangling resources.
				destroyBeans();

				// Reset 'active' flag.
				cancelRefresh(ex);

				// Propagate exception to caller.
				throw ex;
			}

			finally {
				// Reset common introspection caches in Spring's core, since we
				// might not ever need metadata for singleton beans anymore...
				resetCommonCaches();
				contextRefresh.end();
			}
		}
	}
```

扫描的整体过程：

```java
	protected Set<BeanDefinitionHolder> doScan(String... basePackages) {
		Assert.notEmpty(basePackages, "At least one base package must be specified");
		Set<BeanDefinitionHolder> beanDefinitions = new LinkedHashSet<>();
		for (String basePackage : basePackages) {
			Set<BeanDefinition> candidates = findCandidateComponents(basePackage);
			for (BeanDefinition candidate : candidates) {
				ScopeMetadata scopeMetadata = this.scopeMetadataResolver.resolveScopeMetadata(candidate);
				candidate.setScope(scopeMetadata.getScopeName());
				String beanName = this.beanNameGenerator.generateBeanName(candidate, this.registry);
				if (candidate instanceof AbstractBeanDefinition) {
					postProcessBeanDefinition((AbstractBeanDefinition) candidate, beanName);
				}
        			// 为BeanDefinition设置属性的初始值，当命名出现重复，如果不是扫描出现的情况，就会直接抛出异常，否则，则会判断新扫描的BeanDefinition与原来的BeanDefinition是否兼容
				if (candidate instanceof AnnotatedBeanDefinition) {
					AnnotationConfigUtils.processCommonDefinitionAnnotations((AnnotatedBeanDefinition) candidate);
				}
        			// 检查Spring容器中是否已经含有这个名字的Bean
				if (checkCandidate(beanName, candidate)) {
					BeanDefinitionHolder definitionHolder = new BeanDefinitionHolder(candidate, beanName);
					definitionHolder =
							AnnotationConfigUtils.applyScopedProxyMode(scopeMetadata, definitionHolder, this.registry);
					beanDefinitions.add(definitionHolder);
          			// 将BeanDefinition注册到beanDefinitionMap中
					registerBeanDefinition(definitionHolder, this.registry);
				}
			}
		}
		return beanDefinitions;
	}
```

扫描的核心方法：

```java
 	private Set<BeanDefinition> scanCandidateComponents(String basePackage) {
        Set<BeanDefinition> candidates = new LinkedHashSet<>();
        try {
            String packageSearchPath = ResourcePatternResolver.CLASSPATH_ALL_URL_PREFIX +
                    resolveBasePackage(basePackage) + '/' + this.resourcePattern;
            // 获取给定包路径下面的Class文件的Resource对象
            Resource[] resources = getResourcePatternResolver().getResources(packageSearchPath);
            for (Resource resource : resources) {
                try {
                  // 元数据读取器，使用ASM技术读取当前类的名称、注解等信息
                    MetadataReader metadataReader = getMetadataReaderFactory().getMetadataReader(resource);
                  	// 是否是一个Bean
                    if (isCandidateComponent(metadataReader)) {
                      // 扫描的时候并不会解析，此时只会将Bean的名称设置给beanClass属性，后续真正加载的时候会被替换为Class对象，因此beanClass是Object类型的属性
                        ScannedGenericBeanDefinition sbd = new ScannedGenericBeanDefinition(metadataReader);
                        sbd.setSource(resource);
                      // 有可能是内部类或其他虽然有@Component注解，但不是一个Bean的情况
                        if (isCandidateComponent(sbd)) {
                            candidates.add(sbd);
                        }
                    }
                } catch (FileNotFoundException ignored) {
                } catch (Throwable ex) {
                    throw new BeanDefinitionStoreException(
                            "Failed to read candidate component class: " + resource, ex);
                }
            }
        } catch (IOException ex) {
            throw new BeanDefinitionStoreException("I/O failure during classpath scanning", ex);
        }
        return candidates;
    }
```

其中isCandidateComponent方法表示当前类是否是一个Bean：

```java
	protected boolean isCandidateComponent(MetadataReader metadataReader) throws IOException {
    	// 处理排除过滤器和包含过滤器，默认会有一个@Component注解的包含过滤器
		for (TypeFilter tf : this.excludeFilters) {
			if (tf.match(metadataReader, getMetadataReaderFactory())) {
				return false;
			}
		}
		for (TypeFilter tf : this.includeFilters) {
			if (tf.match(metadataReader, getMetadataReaderFactory())) {
        			// 条件匹配，条件注解@Condition
				return isConditionMatch(metadataReader);
			}
		}
		return false;
	}
```

判断BeanDefinition是否是一个Bean：

```java
	protected boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
		AnnotationMetadata metadata = beanDefinition.getMetadata();
        // 1.不是内部类或static类
        // 2.不是接口或抽象类
        // 3.如果是抽象类的话方法上面需要有@Lookup注解的方法
		return (metadata.isIndependent() && (metadata.isConcrete() ||
				(metadata.isAbstract() && metadata.hasAnnotatedMethods(Lookup.class.getName()))));
	}
```

创建非懒加载的单例Bean：

```java
	@Override
	public void preInstantiateSingletons() throws BeansException {
    // 扫描的时候也会把Bean的名字也存下来
		List<String> beanNames = new ArrayList<>(this.beanDefinitionNames);

		for (String beanName : beanNames) {
      // 合并BeanDefition，将父BeanDefinition的属性继承，合并会生成一个新的BeanDefition，存储在mergedBeanDefinitions这个Map中
			RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);
      // 如果是抽象的BeanDefinition不会创建Bean，abstractFlag是BeanDefinition的内部属性，抽象的BeanDifition表示BeanDifition之间有父子关系
			if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
        // FactoryBean的处理逻辑，如果在当前的beanFactory中没有找到，就会递归在父beanFactory中查找
				if (isFactoryBean(beanName)) {
          // 创建实现FactoryBean的实例对象
					Object bean = getBean(FACTORY_BEAN_PREFIX + beanName);
					if (bean instanceof FactoryBean) {
						FactoryBean<?> factory = (FactoryBean<?>) bean;
						boolean isEagerInit;
						if (System.getSecurityManager() != null && factory instanceof SmartFactoryBean) {
							isEagerInit = AccessController.doPrivileged(
									(PrivilegedAction<Boolean>) ((SmartFactoryBean<?>) factory)::isEagerInit,
									getAccessControlContext());
						}
						else {
							isEagerInit = (factory instanceof SmartFactoryBean &&
									((SmartFactoryBean<?>) factory).isEagerInit());
						}
						if (isEagerInit) {
              // 调用getBean方法才会调用FactoryBean#getObject方法
							getBean(beanName);
						}
					}
				}
				else {
          // 创建Bean
					getBean(beanName);
				}
			}
		}

    // 在单例池中查找单例Bean，这里会处理循环依赖问题
		for (String beanName : beanNames) {
			Object singletonInstance = getSingleton(beanName);
			if (singletonInstance instanceof SmartInitializingSingleton) {
				StartupStep smartInitialize = this.getApplicationStartup().start("spring.beans.smart-initialize")
						.tag("beanName", beanName);
				SmartInitializingSingleton smartSingleton = (SmartInitializingSingleton) singletonInstance;
				if (System.getSecurityManager() != null) {
					AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
						smartSingleton.afterSingletonsInstantiated();
						return null;
					}, getAccessControlContext());
				}
				else {
          // 所有的非懒加载的单例Bean都创建完成之后，会调用每个单例Bean的afterSingletonsInstantiated方法
					smartSingleton.afterSingletonsInstantiated();
				}
				smartInitialize.end();
			}
		}
	}
```

合并BeanDifinition的方法：

```java
    protected RootBeanDefinition getMergedBeanDefinition(
            String beanName, BeanDefinition bd, @Nullable BeanDefinition containingBd)
            throws BeanDefinitionStoreException {

        synchronized (this.mergedBeanDefinitions) {
            RootBeanDefinition mbd = null;
            RootBeanDefinition previous = null;

            // Check with full lock now in order to enforce the same merged instance.
            if (containingBd == null) {
                mbd = this.mergedBeanDefinitions.get(beanName);
            }

            if (mbd == null || mbd.stale) {
                previous = mbd;
                if (bd.getParentName() == null) {
                    // 如果能在mergedBeanDefinitions找得到父BeanDifinition，直接新建一个RootBeanDefinition
                    if (bd instanceof RootBeanDefinition) {
                        mbd = ((RootBeanDefinition) bd).cloneBeanDefinition();
                    } else {
                        mbd = new RootBeanDefinition(bd);
                    }
                } else {
                    // Child bean definition: needs to be merged with parent.
                    BeanDefinition pbd;
                    try {
                        String parentBeanName = transformedBeanName(bd.getParentName());
                        // 递归查找合并
                        if (!beanName.equals(parentBeanName)) {
                            pbd = getMergedBeanDefinition(parentBeanName);
                        } else {
                            BeanFactory parent = getParentBeanFactory();
                            if (parent instanceof ConfigurableBeanFactory) {
                                pbd = ((ConfigurableBeanFactory) parent).getMergedBeanDefinition(parentBeanName);
                            } else {
                                throw new NoSuchBeanDefinitionException(parentBeanName,
                                        "Parent name '" + parentBeanName + "' is equal to bean name '" + beanName +
                                                "': cannot be resolved without a ConfigurableBeanFactory parent");
                            }
                        }
                    } catch (NoSuchBeanDefinitionException ex) {
                        throw new BeanDefinitionStoreException(bd.getResourceDescription(), beanName,
                                "Could not resolve parent bean definition '" + bd.getParentName() + "'", ex);
                    }
                    // 先合并父的BeanDefinition，然后合并子类的BeanDifition
                    mbd = new RootBeanDefinition(pbd);
                    // 属性覆盖，子类中有的属性设置会父类的属性
                    mbd.overrideFrom(bd);
                }

                // Set default singleton scope, if not configured before.
                if (!StringUtils.hasLength(mbd.getScope())) {
                    mbd.setScope(SCOPE_SINGLETON);
                }

                // A bean contained in a non-singleton bean cannot be a singleton itself.
                // Let's correct this on the fly here, since this might be the result of
                // parent-child merging for the outer bean, in which case the original inner bean
                // definition will not have inherited the merged outer bean's singleton status.
                if (containingBd != null && !containingBd.isSingleton() && mbd.isSingleton()) {
                    mbd.setScope(containingBd.getScope());
                }

                // Cache the merged bean definition for the time being
                // (it might still get re-merged later on in order to pick up metadata changes)
                if (containingBd == null && isCacheBeanMetadata()) {
                    this.mergedBeanDefinitions.put(beanName, mbd);
                }
            }
            if (previous != null) {
                copyRelevantMergedBeanDefinitionCaches(previous, mbd);
            }
            return mbd;
        }
    }
```

doGetBean方法是创建Bean的核心方法：

```java
    @SuppressWarnings("unchecked")
    protected <T> T doGetBean(
            String name, @Nullable Class<T> requiredType, @Nullable Object[] args, boolean typeCheckOnly)
            throws BeansException {

        // 如果传入的名称是“&***”，表示要获取的对象是FactoryBean本身的对象，它存储在单例池中，如果传入的是普通名称，则表示要获取的对象是Factory#getObject方法返回的对象
        String beanName = transformedBeanName(name);
        Object beanInstance;

        // Eagerly check singleton cache for manually registered singletons.
        Object sharedInstance = getSingleton(beanName);
        if (sharedInstance != null && args == null) {
            if (logger.isTraceEnabled()) {
                if (isSingletonCurrentlyInCreation(beanName)) {
                    logger.trace("Returning eagerly cached instance of singleton bean '" + beanName +
                            "' that is not fully initialized yet - a consequence of a circular reference");
                } else {
                    logger.trace("Returning cached instance of singleton bean '" + beanName + "'");
                }
            }
            beanInstance = getObjectForBeanInstance(sharedInstance, name, beanName, null);
        } else {
            // Fail if we're already creating this bean instance:
            // We're assumably within a circular reference.
            if (isPrototypeCurrentlyInCreation(beanName)) {
                throw new BeanCurrentlyInCreationException(beanName);
            }

            // Check if bean definition exists in this factory.
            BeanFactory parentBeanFactory = getParentBeanFactory();
            if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
                // Not found -> check parent.
                String nameToLookup = originalBeanName(name);
                if (parentBeanFactory instanceof AbstractBeanFactory) {
                    return ((AbstractBeanFactory) parentBeanFactory).doGetBean(
                            nameToLookup, requiredType, args, typeCheckOnly);
                } else if (args != null) {
                    // Delegation to parent with explicit args.
                    return (T) parentBeanFactory.getBean(nameToLookup, args);
                } else if (requiredType != null) {
                    // No args -> delegate to standard getBean method.
                    return parentBeanFactory.getBean(nameToLookup, requiredType);
                } else {
                    return (T) parentBeanFactory.getBean(nameToLookup);
                }
            }

            if (!typeCheckOnly) {
                markBeanAsCreated(beanName);
            }

            StartupStep beanCreation = this.applicationStartup.start("spring.beans.instantiate")
                    .tag("beanName", name);
            try {
                if (requiredType != null) {
                    beanCreation.tag("beanType", requiredType::toString);
                }
              	// 拿到合并后的Beanfinition
                RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
                checkMergedBeanDefinition(mbd, beanName, args);

                // 处理@Depensdon注解，查看当前指定的所依赖的Bean是否都已经注入完成
                String[] dependsOn = mbd.getDependsOn();
                if (dependsOn != null) {
                    for (String dep : dependsOn) {
                        if (isDependent(beanName, dep)) {
                          	// 这也是循环依赖的一种情况
                            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                                    "Circular depends-on relationship between '" + beanName + "' and '" + dep + "'");
                        }
                      	// 还没有的话，就注册到depentBeanMap中
                        registerDependentBean(dep, beanName);
                        try {
                          	// getBean会首先创建所依赖的Bean
                            getBean(dep);
                        } catch (NoSuchBeanDefinitionException ex) {
                            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                                    "'" + beanName + "' depends on missing bean '" + dep + "'", ex);
                        }
                    }
                }

                // Create bean instance.
                if (mbd.isSingleton()) {
                    sharedInstance = getSingleton(beanName, () -> {
                        try {
                            return createBean(beanName, mbd, args);
                        } catch (BeansException ex) {
                            // Explicitly remove instance from singleton cache: It might have been put there
                            // eagerly by the creation process, to allow for circular reference resolution.
                            // Also remove any beans that received a temporary reference to the bean.
                            destroySingleton(beanName);
                            throw ex;
                        }
                    });
                    beanInstance = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
                } else if (mbd.isPrototype()) {
                    // It's a prototype -> create a new instance.
                    Object prototypeInstance = null;
                    try {
                        beforePrototypeCreation(beanName);
                        prototypeInstance = createBean(beanName, mbd, args);
                    } finally {
                        afterPrototypeCreation(beanName);
                    }
                    beanInstance = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
                } else {
                  	// 除了singleton和prototype，还有request、session、application作用域
                    String scopeName = mbd.getScope();
                    if (!StringUtils.hasLength(scopeName)) {
                        throw new IllegalStateException("No scope name defined for bean '" + beanName + "'");
                    }
                    Scope scope = this.scopes.get(scopeName);
                    if (scope == null) {
                        throw new IllegalStateException("No Scope registered for scope name '" + scopeName + "'");
                    }
                    try {
                        Object scopedInstance = scope.get(beanName, () -> {
                            beforePrototypeCreation(beanName);
                            try {
                                return createBean(beanName, mbd, args);
                            } finally {
                                afterPrototypeCreation(beanName);
                            }
                        });
                        beanInstance = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
                    } catch (IllegalStateException ex) {
                        throw new ScopeNotActiveException(beanName, scopeName, ex);
                    }
                }
            } catch (BeansException ex) {
                beanCreation.tag("exception", ex.getClass().toString());
                beanCreation.tag("message", String.valueOf(ex.getMessage()));
                cleanupAfterBeanCreationFailure(beanName);
                throw ex;
            } finally {
                beanCreation.end();
            }
        }
      	// 检查通过name查找到的Bean是否是requiredType类型的Bean
        return adaptBeanInstance(name, beanInstance, requiredType);
    }
}
```

创建Bean的方法：

```java
    @Override
    protected Object createBean(String beanName, RootBeanDefinition mbd, @Nullable Object[] args)
            throws BeanCreationException {
        RootBeanDefinition mbdToUse = mbd;

        // Make sure bean class is actually resolved at this point, and
        // clone the bean definition in case of a dynamically resolved Class
        // which cannot be stored in the shared merged bean definition.
      	// 类加载，这里可以使用自定义的ClassLoader，默认是APP ClassLoader
        Class<?> resolvedClass = resolveBeanClass(mbd, beanName);
        if (resolvedClass != null && !mbd.hasBeanClass() && mbd.getBeanClassName() != null) {
            mbdToUse = new RootBeanDefinition(mbd);
          	// 将加载到的Class对象设置给beanClass属性
            mbdToUse.setBeanClass(resolvedClass);
        }

        // Prepare method overrides.
        try {
          	// 与@Lookup注解有关
            mbdToUse.prepareMethodOverrides();
        } catch (BeanDefinitionValidationException ex) {
            throw new BeanDefinitionStoreException(mbdToUse.getResourceDescription(),
                    beanName, "Validation of method overrides failed", ex);
        }

        try {
            // Give BeanPostProcessors a chance to return a proxy instead of the target bean instance.
          	// 实例化前
            Object bean = resolveBeforeInstantiation(beanName, mbdToUse);
            if (bean != null) {
                return bean;
            }
        } catch (Throwable ex) {
            throw new BeanCreationException(mbdToUse.getResourceDescription(), beanName,
                    "BeanPostProcessor before instantiation of bean failed", ex);
        }

        try {
          	// 实例化
            Object beanInstance = doCreateBean(beanName, mbdToUse, args);
            return beanInstance;
        } catch (BeanCreationException | ImplicitlyAppearedSingletonException ex) {
            // A previously detected exception with proper bean creation context already,
            // or illegal singleton state to be communicated up to DefaultSingletonBeanRegistry.
            throw ex;
        } catch (Throwable ex) {
            throw new BeanCreationException(
                    mbdToUse.getResourceDescription(), beanName, "Unexpected exception during bean creation", ex);
        }
    }
```

实例化前方法：

```java
	// 支持BeanPostPropcessor
	protected Object resolveBeforeInstantiation(String beanName, RootBeanDefinition mbd) {
		Object bean = null;
		if (!Boolean.FALSE.equals(mbd.beforeInstantiationResolved)) {
			// Make sure bean class is actually resolved at this point.
			if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
				Class<?> targetType = determineTargetType(beanName, mbd);
				if (targetType != null) {
					bean = applyBeanPostProcessorsBeforeInstantiation(targetType, beanName);
					if (bean != null) {
						bean = applyBeanPostProcessorsAfterInitialization(bean, beanName);
					}
				}
			}
			mbd.beforeInstantiationResolved = (bean != null);
		}
		return bean;
	}
```

实例化方法：

```java
		protected Object doCreateBean(String beanName, RootBeanDefinition mbd, @Nullable Object[] args)
            throws BeanCreationException {

        // Instantiate the bean.
        BeanWrapper instanceWrapper = null;
        if (mbd.isSingleton()) {
            instanceWrapper = this.factoryBeanInstanceCache.remove(beanName);
        }
        if (instanceWrapper == null) {
            instanceWrapper = createBeanInstance(beanName, mbd, args);
        }
        Object bean = instanceWrapper.getWrappedInstance();
        Class<?> beanType = instanceWrapper.getWrappedClass();
        if (beanType != NullBean.class) {
            mbd.resolvedTargetType = beanType;
        }

        // Allow post-processors to modify the merged bean definition.
        synchronized (mbd.postProcessingLock) {
            if (!mbd.postProcessed) {
                try {
                    applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
                } catch (Throwable ex) {
                    throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                            "Post-processing of merged bean definition failed", ex);
                }
                mbd.postProcessed = true;
            }
        }

        // Eagerly cache singletons to be able to resolve circular references
        // even when triggered by lifecycle interfaces like BeanFactoryAware.
        boolean earlySingletonExposure = (mbd.isSingleton() && this.allowCircularReferences &&
                isSingletonCurrentlyInCreation(beanName));
        if (earlySingletonExposure) {
            if (logger.isTraceEnabled()) {
                logger.trace("Eagerly caching bean '" + beanName +
                        "' to allow for resolving potential circular references");
            }
            addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
        }

        // Initialize the bean instance.
        Object exposedObject = bean;
        try {
          	// 填充属性
            populateBean(beanName, mbd, instanceWrapper);
          	// 初始化
            exposedObject = initializeBean(beanName, exposedObject, mbd);
        } catch (Throwable ex) {
            if (ex instanceof BeanCreationException && beanName.equals(((BeanCreationException) ex).getBeanName())) {
                throw (BeanCreationException) ex;
            } else {
                throw new BeanCreationException(
                        mbd.getResourceDescription(), beanName, "Initialization of bean failed", ex);
            }
        }

        if (earlySingletonExposure) {
            Object earlySingletonReference = getSingleton(beanName, false);
            if (earlySingletonReference != null) {
                if (exposedObject == bean) {
                    exposedObject = earlySingletonReference;
                } else if (!this.allowRawInjectionDespiteWrapping && hasDependentBean(beanName)) {
                    String[] dependentBeans = getDependentBeans(beanName);
                    Set<String> actualDependentBeans = new LinkedHashSet<>(dependentBeans.length);
                    for (String dependentBean : dependentBeans) {
                        if (!removeSingletonIfCreatedForTypeCheckOnly(dependentBean)) {
                            actualDependentBeans.add(dependentBean);
                        }
                    }
                    if (!actualDependentBeans.isEmpty()) {
                        throw new BeanCurrentlyInCreationException(beanName,
                                "Bean with name '" + beanName + "' has been injected into other beans [" +
                                        StringUtils.collectionToCommaDelimitedString(actualDependentBeans) +
                                        "] in its raw version as part of a circular reference, but has eventually been " +
                                        "wrapped. This means that said other beans do not use the final version of the " +
                                        "bean. This is often the result of over-eager type matching - consider using " +
                                        "'getBeanNamesForType' with the 'allowEagerInit' flag turned off, for example.");
                    }
                }
            }
        }

        // Register bean as disposable.
        try {
          	// Bean销毁的逻辑，当Spring容器关闭的时候，会调用销毁方法
            registerDisposableBeanIfNecessary(beanName, bean, mbd);
        } catch (BeanDefinitionValidationException ex) {
            throw new BeanCreationException(
                    mbd.getResourceDescription(), beanName, "Invalid destruction signature", ex);
        }

        return exposedObject;
    }
```

属性绑定：

```java
    protected void populateBean(String beanName, RootBeanDefinition mbd, @Nullable BeanWrapper bw) {
        if (bw == null) {
            if (mbd.hasPropertyValues()) {
                throw new BeanCreationException(
                        mbd.getResourceDescription(), beanName, "Cannot apply property values to null instance");
            } else {
                // Skip property population phase for null instance.
                return;
            }
        }

        // Give any InstantiationAwareBeanPostProcessors the opportunity to modify the
        // state of the bean before properties are set. This can be used, for example,
        // to support styles of field injection.
        if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
            for (InstantiationAwareBeanPostProcessor bp : getBeanPostProcessorCache().instantiationAware) {
                if (!bp.postProcessAfterInstantiation(bw.getWrappedInstance(), beanName)) {
                    return;
                }
            }
        }

        PropertyValues pvs = (mbd.hasPropertyValues() ? mbd.getPropertyValues() : null);

        int resolvedAutowireMode = mbd.getResolvedAutowireMode();
      	// Spring内建的依赖注入，可以根据类型或者名称进行查找，但由于过于灵活，现已废弃
        if (resolvedAutowireMode == AUTOWIRE_BY_NAME || resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
            MutablePropertyValues newPvs = new MutablePropertyValues(pvs);
            // Add property values based on autowire by name if applicable.
            if (resolvedAutowireMode == AUTOWIRE_BY_NAME) {
                autowireByName(beanName, mbd, bw, newPvs);
            }
            // Add property values based on autowire by type if applicable.
            if (resolvedAutowireMode == AUTOWIRE_BY_TYPE) {
                autowireByType(beanName, mbd, bw, newPvs);
            }
            pvs = newPvs;
        }

        boolean hasInstAwareBpps = hasInstantiationAwareBeanPostProcessors();
        boolean needsDepCheck = (mbd.getDependencyCheck() != AbstractBeanDefinition.DEPENDENCY_CHECK_NONE);

        PropertyDescriptor[] filteredPds = null;
        if (hasInstAwareBpps) {
            if (pvs == null) {
                pvs = mbd.getPropertyValues();
            }
            for (InstantiationAwareBeanPostProcessor bp : getBeanPostProcessorCache().instantiationAware) {
              	// 处理属性回调，会检查BeanDefinition的属性是否已经被赋值过了
                PropertyValues pvsToUse = bp.postProcessProperties(pvs, bw.getWrappedInstance(), beanName);
                if (pvsToUse == null) {
                    if (filteredPds == null) {
                        filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
                    }
                    pvsToUse = bp.postProcessPropertyValues(pvs, filteredPds, bw.getWrappedInstance(), beanName);
                    if (pvsToUse == null) {
                        return;
                    }
                }
                pvs = pvsToUse;
            }
        }
        if (needsDepCheck) {
            if (filteredPds == null) {
                filteredPds = filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
            }
            checkDependencies(beanName, mbd, filteredPds, pvs);
        }

        if (pvs != null) {
            applyPropertyValues(beanName, mbd, bw, pvs);
        }
    }
```

销毁方法只是针对于单例的Bean而言，原型Bean的销毁方法并不会被Spring所调用。

### 依赖注入源码解析

@Autowired注解的实现类：org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor：

```java
public class AutowiredAnnotationBeanPostProcessor implements SmartInstantiationAwareBeanPostProcessor,
        MergedBeanDefinitionPostProcessor, PriorityOrdered, BeanFactoryAware {
    @Override
    public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
        // 查找注入点：
        InjectionMetadata metadata = findAutowiringMetadata(beanName, beanType, null);
        metadata.checkConfigMembers(beanDefinition);
    }

    @Override
    public PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName) {
      	// 给字段赋值
        InjectionMetadata metadata = findAutowiringMetadata(beanName, bean.getClass(), pvs);
        try {
          	// 处理@Value注解的方法
            metadata.inject(bean, beanName, pvs);
        } catch (BeanCreationException ex) {
            throw ex;
        } catch (Throwable ex) {
            throw new BeanCreationException(beanName, "Injection of autowired dependencies failed", ex);
        }
        return pvs;
    }

}
```

静态属性和静态方法会跳过，无法依赖注入。

```java
    private InjectionMetadata buildAutowiringMetadata(Class<?> clazz) {
        // 当前类是否
        if (!AnnotationUtils.isCandidateClass(clazz, this.autowiredAnnotationTypes)) {
            return InjectionMetadata.EMPTY;
        }

        List<InjectionMetadata.InjectedElement> elements = new ArrayList<>();
        Class<?> targetClass = clazz;

        do {
            final List<InjectionMetadata.InjectedElement> currElements = new ArrayList<>();

            ReflectionUtils.doWithLocalFields(targetClass, field -> {
                MergedAnnotation<?> ann = findAutowiredAnnotation(field);
                if (ann != null) {
                    // 静态属性跳过
                    if (Modifier.isStatic(field.getModifiers())) {
                        if (logger.isInfoEnabled()) {
                            logger.info("Autowired annotation is not supported on static fields: " + field);
                        }
                        return;
                    }
                    boolean required = determineRequiredStatus(ann);
                    currElements.add(new AutowiredFieldElement(field, required));
                }
            });

            ReflectionUtils.doWithLocalMethods(targetClass, method -> {
                // 处理桥接方法，找到被桥接的方法，然后处理
                Method bridgedMethod = BridgeMethodResolver.findBridgedMethod(method);
                if (!BridgeMethodResolver.isVisibilityBridgeMethodPair(method, bridgedMethod)) {
                    return;
                }
                MergedAnnotation<?> ann = findAutowiredAnnotation(bridgedMethod);
                if (ann != null && method.equals(ClassUtils.getMostSpecificMethod(method, clazz))) {
                    // 静态方法跳过
                    if (Modifier.isStatic(method.getModifiers())) {
                        if (logger.isInfoEnabled()) {
                            logger.info("Autowired annotation is not supported on static methods: " + method);
                        }
                        return;
                    }
                    if (method.getParameterCount() == 0) {
                        if (logger.isInfoEnabled()) {
                            logger.info("Autowired annotation should only be used on methods with parameters: " +
                                    method);
                        }
                    }
                    boolean required = determineRequiredStatus(ann);
                    PropertyDescriptor pd = BeanUtils.findPropertyForMethod(bridgedMethod, clazz);
                    currElements.add(new AutowiredMethodElement(method, required, pd));
                }
            });

            elements.addAll(0, currElements);
            targetClass = targetClass.getSuperclass();
        }
        while (targetClass != null && targetClass != Object.class);

        return InjectionMetadata.forElements(elements, clazz);
    }
```

注入字段：

```java
    @Nullable
   private Object resolveFieldValue(Field field, Object bean, @Nullable String beanName) {
      DependencyDescriptor desc = new DependencyDescriptor(field, this.required);
      desc.setContainingClass(bean.getClass());
      Set<String> autowiredBeanNames = new LinkedHashSet<>(1);
      Assert.state(beanFactory != null, "No BeanFactory available");
      TypeConverter typeConverter = beanFactory.getTypeConverter();
      Object value;
      try {
         // 找到需要注入的字段的值
         value = beanFactory.resolveDependency(desc, beanName, autowiredBeanNames, typeConverter);
      }
      catch (BeansException ex) {
         throw new UnsatisfiedDependencyException(null, beanName, new InjectionPoint(field), ex);
      }
      synchronized (this) {
         if (!this.cached) {
            Object cachedFieldValue = null;
            if (value != null || this.required) {
               cachedFieldValue = desc;
               registerDependentBeans(beanName, autowiredBeanNames);
               if (autowiredBeanNames.size() == 1) {
                  String autowiredBeanName = autowiredBeanNames.iterator().next();
                  if (beanFactory.containsBean(autowiredBeanName) &&
                        beanFactory.isTypeMatch(autowiredBeanName, field.getType())) {
                     cachedFieldValue = new ShortcutDependencyDescriptor(
                           desc, autowiredBeanName, field.getType());
                  }
               }
            }
            this.cachedFieldValue = cachedFieldValue;
            this.cached = true;
         }
      }
      return value;
   }
}
```

类似的，也有注入方法的方法：org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor.AutowiredMethodElement。

其中核心方法就是beanFactory的resolveDependency方法：

```java
	public Object resolveDependency(DependencyDescriptor descriptor, @Nullable String requestingBeanName,
			@Nullable Set<String> autowiredBeanNames, @Nullable TypeConverter typeConverter) throws BeansException {
		// 用来获取方法入参名称
		descriptor.initParameterNameDiscovery(getParameterNameDiscoverer());
    // 所需要的类型是Optional类型的
		if (Optional.class == descriptor.getDependencyType()) {
			return createOptionalDependency(descriptor, requestingBeanName);
		}
    // 所需要的类型是ObectFactory或ObjectProvider的
		else if (ObjectFactory.class == descriptor.getDependencyType() ||
				ObjectProvider.class == descriptor.getDependencyType()) {
			return new DependencyObjectProvider(descriptor, requestingBeanName);
		}
		else if (javaxInjectProviderClass == descriptor.getDependencyType()) {
			return new Jsr330Factory().createDependencyProvider(descriptor, requestingBeanName);
		}
		else {
      // 在属性或set方法上使用了@Lazy注解，那么则构造一个代理对象并返回，真正使用该代理对象时才进行类型筛选Bean
			Object result = getAutowireCandidateResolver().getLazyResolutionProxyIfNecessary(
					descriptor, requestingBeanName);
			if (result == null) {
				result = doResolveDependency(descriptor, requestingBeanName, autowiredBeanNames, typeConverter);
			}
			return result;
		}
	}
```

方法形参名称获取：

```java
public class DefaultParameterNameDiscoverer extends PrioritizedParameterNameDiscoverer {
    public DefaultParameterNameDiscoverer() {
        // JDK1.8以后可以获取方法的形参名称，1.8之前可以通过字节码的本地变量表来获取
        addDiscoverer(new StandardReflectionParameterNameDiscoverer());
        addDiscoverer(new LocalVariableTableParameterNameDiscoverer());
    }
}
```

核心方法doResolveDependency的源代码：

```java
    @Nullable
    public Object doResolveDependency(DependencyDescriptor descriptor, @Nullable String beanName,
                                      @Nullable Set<String> autowiredBeanNames, @Nullable TypeConverter typeConverter) throws BeansException {

        InjectionPoint previousInjectionPoint = ConstructorResolver.setCurrentInjectionPoint(descriptor);
        try {
            Object shortcut = descriptor.resolveShortcut(this);
            if (shortcut != null) {
                return shortcut;
            }

            Class<?> type = descriptor.getDependencyType();
            // 处理@Value注解
            Object value = getAutowireCandidateResolver().getSuggestedValue(descriptor);
            if (value != null) {
                if (value instanceof String) {
                    // 占位符的填充（${}）
                    String strVal = resolveEmbeddedValue((String) value);
                    BeanDefinition bd = (beanName != null && containsBean(beanName) ?
                            getMergedBeanDefinition(beanName) : null);
                    // 解析Spring表达式（#{}，也可以用来以来注入）
                    value = evaluateBeanDefinitionString(strVal, bd);
                }
              	// 将value转化为descriptor所对应的类型
                TypeConverter converter = (typeConverter != null ? typeConverter : getTypeConverter());
                try {
                    return converter.convertIfNecessary(value, type, descriptor.getTypeDescriptor());
                } catch (UnsupportedOperationException ex) {
                    return (descriptor.getField() != null ?
                            converter.convertIfNecessary(value, type, descriptor.getField()) :
                            converter.convertIfNecessary(value, type, descriptor.getMethodParameter()));
                }
            }
          	// 如果descriptor所对应的类型是数组、Map、List等类型，就将descriptor对应的类型所匹配的所有Bean方法，不用进一步做筛选了
            Object multipleBeans = resolveMultipleBeans(descriptor, beanName, autowiredBeanNames, typeConverter);
            if (multipleBeans != null) {
                return multipleBeans;
            }
          	// 找到所有Bean，key是beanName，value有可能是bean对象，有可能是beanClass
            Map<String, Object> matchingBeans = findAutowireCandidates(beanName, type, descriptor);
            if (matchingBeans.isEmpty()) {
              	// 如果没有找到Bean，但是required属性为true，则直接抛出异常
                if (isRequired(descriptor)) {
                    raiseNoMatchingBeanFound(type, descriptor.getResolvableType(), descriptor);
                }
                return null;
            }

            String autowiredBeanName;
            Object instanceCandidate;

          	// 找到的是多个，再根据名称进行过滤
            if (matchingBeans.size() > 1) {
              	// 这里会处理@Primary注解，如果有一个bean有@Primary注解，则返回，也会处理@Priority注解，优先级
                autowiredBeanName = determineAutowireCandidate(matchingBeans, descriptor);
                if (autowiredBeanName == null) {
                    if (isRequired(descriptor) || !indicatesMultipleBeans(type)) {
                        return descriptor.resolveNotUnique(descriptor.getResolvableType(), matchingBeans);
                    } else {
                        return null;
                    }
                }
                instanceCandidate = matchingBeans.get(autowiredBeanName);
            } else {
                // We have exactly one match.
                Map.Entry<String, Object> entry = matchingBeans.entrySet().iterator().next();
                autowiredBeanName = entry.getKey();
                instanceCandidate = entry.getValue();
            }

            if (autowiredBeanNames != null) {
                autowiredBeanNames.add(autowiredBeanName);
            }
          	// 有可能筛选出来的是某个bean的类型，此处就进行实例化，调用getBean
            if (instanceCandidate instanceof Class) {
                instanceCandidate = descriptor.resolveCandidate(autowiredBeanName, type, this);
            }
            Object result = instanceCandidate;
            if (result instanceof NullBean) {
                if (isRequired(descriptor)) {
                    raiseNoMatchingBeanFound(type, descriptor.getResolvableType(), descriptor);
                }
                result = null;
            }
            if (!ClassUtils.isAssignableValue(type, result)) {
                throw new BeanNotOfRequiredTypeException(autowiredBeanName, type, instanceCandidate.getClass());
            }
            return result;
        } finally {
            ConstructorResolver.setCurrentInjectionPoint(previousInjectionPoint);
        }
    }
```

当找到多个对象的时候，并不是所有的都需要实例化，如果不需要创建，findAutowireCandidates方法会返回Class对象。

```java
    protected Map<String, Object> findAutowireCandidates(
            @Nullable String beanName, Class<?> requiredType, DependencyDescriptor descriptor) {
				// 在所有的beanDefinition找到符合这个类型的所有bean的名称
        String[] candidateNames = BeanFactoryUtils.beanNamesForTypeIncludingAncestors(
                this, requiredType, true, descriptor.isEager());
        Map<String, Object> result = CollectionUtils.newLinkedHashMap(candidateNames.length);
        for (Map.Entry<Class<?>, Object> classObjectEntry : this.resolvableDependencies.entrySet()) {
            Class<?> autowiringType = classObjectEntry.getKey();
            if (autowiringType.isAssignableFrom(requiredType)) {
                Object autowiringValue = classObjectEntry.getValue();
                autowiringValue = AutowireUtils.resolveAutowiringValue(autowiringValue, requiredType);
                if (requiredType.isInstance(autowiringValue)) {
                    result.put(ObjectUtils.identityToString(autowiringValue), autowiringValue);
                    break;
                }
            }
        }
      	// candidateNames存的就是找到的和所给类型匹配的所有的bean
        for (String candidate : candidateNames) {
          	// 如果有多个，优先考虑注入不是自己的那个bean
            if (!isSelfReference(beanName, candidate) && isAutowireCandidate(candidate, descriptor)) {
                addCandidateEntry(result, candidate, descriptor, requiredType);
            }
        }
        if (result.isEmpty()) {
            boolean multiple = indicatesMultipleBeans(requiredType);
            // Consider fallback matches if the first pass failed to find anything...
            DependencyDescriptor fallbackDescriptor = descriptor.forFallbackMatch();
            for (String candidate : candidateNames) {
                if (!isSelfReference(beanName, candidate) && isAutowireCandidate(candidate, fallbackDescriptor) &&
                        (!multiple || getAutowireCandidateResolver().hasQualifier(descriptor))) {
                    addCandidateEntry(result, candidate, descriptor, requiredType);
                }
            }
            if (result.isEmpty() && !multiple) {
                // Consider self references as a final pass...
                // but in the case of a dependency collection, not the very same bean itself.
                for (String candidate : candidateNames) {
                    if (isSelfReference(beanName, candidate) &&
                            (!(descriptor instanceof MultiElementDescriptor) || !beanName.equals(candidate)) &&
                            isAutowireCandidate(candidate, fallbackDescriptor)) {
                        addCandidateEntry(result, candidate, descriptor, requiredType);
                    }
                }
            }
        }
        return result;
    }
```

isAutowireCandidate方法的作用是用来判断给定的bean是否可以用来依赖注入：

```java
    protected boolean isAutowireCandidate(
            String beanName, DependencyDescriptor descriptor, AutowireCandidateResolver resolver)
            throws NoSuchBeanDefinitionException {

        String bdName = BeanFactoryUtils.transformedBeanName(beanName);
        // 根据BeanDefinition的autowireCandidate属性来判断是否可以用来依赖注入
        if (containsBeanDefinition(bdName)) {
            return isAutowireCandidate(beanName, getMergedLocalBeanDefinition(bdName), descriptor, resolver);
        } else if (containsSingleton(beanName)) {
            return isAutowireCandidate(beanName, new RootBeanDefinition(getType(beanName)), descriptor, resolver);
        }

        BeanFactory parent = getParentBeanFactory();
        if (parent instanceof DefaultListableBeanFactory) {
            // No bean definition found in this factory -> delegate to parent.
            return ((DefaultListableBeanFactory) parent).isAutowireCandidate(beanName, descriptor, resolver);
        } else if (parent instanceof ConfigurableListableBeanFactory) {
            // If no DefaultListableBeanFactory, can't pass the resolver along.
            return ((ConfigurableListableBeanFactory) parent).isAutowireCandidate(beanName, descriptor);
        } else {
            return true;
        }
    }
```

依赖注入的判断条件：

1. BeanDefinition的autowireCandidate属性
2. 泛型条件判断
3. @Qualifier
4. @Primary
5. @Priority
6. bean的名称

Spring会在找到注入点之后，将其beanName缓存起来。对于单例bean，并不会触发这个缓存，对于原型bean，在第二次调用getBean方法的时候就会触发。之所以只缓存beanName，是因为依赖注入的可能也是原型bean，这种情况下，每次依赖注入获取bean都应该是一个新的bean。

@Resource和@Autowired注解的区别在于，@Resource是Java规范支持的注解，主要是通过CommonAnnotationBeanPostProcessor来实现，而@Autowired是Spring的注解。之所以会支持@Resource注解是因为，Spring考虑到如果开发者要迁移到其他支持依赖注入的框架，使用Java标准的@Resource注解可以在不修改源码的情况下完成迁移。

### 循环依赖解析

解决循环依赖，主要思路是利用三级缓存：

1. singletonObjects（经历过完整生命周期的Bean对象）
2. earlySingletonObjects（用于缓存AOP对象，里面存的是部分属性为空的对象，）
3. singletonFactories（key是beanName，value是一段lamda表达式，用来获取原始对象）

额外辅助：singletonCurrentlyIncreation，可以通过这个集合查找到正在创建的bean。

之所以需要第三个Map才能解决循环依赖的根本原因是存在代理。原本Spring会在初始化后进行AOP操作，但因为循环依赖的存在，不得不提前缓存AOP的对象。

详细解析：https://blog.csdn.net/hao134838/article/details/121239018

第三个Map，singletonFactories的主要逻辑：

```java
        boolean earlySingletonExposure = (mbd.isSingleton() && this.allowCircularReferences &&
                isSingletonCurrentlyInCreation(beanName));
        if (earlySingletonExposure) {
            // 判断是否需要进行AOP，如果需要进行AOP，则返回代理对象，如果不需要，则返回原始对象，执行完这个lambda表达式，会将返回的对象放置到earlySingletonObjects中。
            // 之后进行AOP的操作的时候，会根据earlyProxyReferences这个Map来判断是否需要AOP操作。
            addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
        }
```

打破循环最关键的点是singletonFactories。

@Lazy注解的作用，是在属性填充的时候会直接生成一个代理对象，在使用这个代理对象的方法的时候才会去创建属性的实例对象。

@Transactional注解并不会影响循环依赖，因为@Transactional注解并不会注入一个新的BeanPostProcessor，而是向Spring容器中添加了一个advisor。

### 推断构造源码解析

Spring使用构造方法的原则如下：

- 默认情况下，使用无参构造方法，或者只要一个构造方法的情况下，就使用唯一的构造方法
- 如果制定了构造方法的入参值，通过getBean()或者BeanDefinition.getConstructorArgumentValues()指定，那么就会使用所匹配的构造方法
- 如果想让Spring自动选择构造方法以及构造方法的入参值，可以通过设置`autowire="constructor"`来实现
- 如果使用@Autowired注解制定了某个构造方法，但是希望Spring自动找该构造方法的入参值

推断构造方法的核心源码如下：

```java
    protected BeanWrapper createBeanInstance(String beanName, RootBeanDefinition mbd, @Nullable Object[] args) {
        // Make sure bean class is actually resolved at this point.
        Class<?> beanClass = resolveBeanClass(mbd, beanName);

        if (beanClass != null && !Modifier.isPublic(beanClass.getModifiers()) && !mbd.isNonPublicAccessAllowed()) {
            throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                    "Bean class isn't public, and non-public access not allowed: " + beanClass.getName());
        }

        Supplier<?> instanceSupplier = mbd.getInstanceSupplier();
        if (instanceSupplier != null) {
            return obtainFromSupplier(instanceSupplier, beanName);
        }
      	// 处理@Bean对应的BeanDefinition
        if (mbd.getFactoryMethodName() != null) {
            return instantiateUsingFactoryMethod(beanName, mbd, args);
        }

        // Shortcut when re-creating the same bean...
        boolean resolved = false;
        boolean autowireNecessary = false;
        if (args == null) {
            synchronized (mbd.constructorArgumentLock) {
              	// 缓存BeanDefition的属性，缓存好的构造方法和参数值
                if (mbd.resolvedConstructorOrFactoryMethod != null) {
                    resolved = true;
                    autowireNecessary = mbd.constructorArgumentsResolved;
                }
            }
        }
        if (resolved) {
          	// 如果确定了当前BeanDefinition的构造方法，那么看是否需要进行对构造方法进行参数的依赖注入（构造方法注入）
            if (autowireNecessary) {
              	// 这里会拿到缓存好的构造方法入参，实例化bean对象
                return autowireConstructor(beanName, mbd, null, null);
            } else {
              	// 构造方法已经找到了，但是没有参数，直接进行实例化
                return instantiateBean(beanName, mbd);
            }
        }

        // 这里主要是通过AutowiredAnnotationBeanPostProcessor查找构造方法，当有多个构造方法和只有一个无参的构造方法都会返回null，这个时候，Spring会优先使用无参的构造方法。
        Constructor<?>[] ctors = determineConstructorsFromBeanPostProcessors(beanClass, beanName);
        if (ctors != null || mbd.getResolvedAutowireMode() == AUTOWIRE_CONSTRUCTOR ||
                mbd.hasConstructorArgumentValues() || !ObjectUtils.isEmpty(args)) {
            return autowireConstructor(beanName, mbd, ctors, args);
        }

        // Preferred constructors for default construction?
        ctors = mbd.getPreferredConstructors();
        if (ctors != null) {
            return autowireConstructor(beanName, mbd, ctors, null);
        }

        // No special handling: simply use no-arg constructor.
        return instantiateBean(beanName, mbd);
    }
```

有@Lookup注解的时候，在推断构造方法之后，会生成cglib的代理对象。

### Spring启动过程

Spring启动的过程其实就是需要做一些准备工作，好方便后续的相关操作。

1. 创建BeanFactory实例对象，DefaultListableBeanFactory
2. 解析配置类
3. 扫描得到BeanDefinition，存入beanDefitionMap
4. beanBostprocess
5. 单例池

创建BeanFactory的实例对象：

```java
public GenericApplicationContext() {
   this.beanFactory = new DefaultListableBeanFactory();
}
```

于此同时，DefaultListableBeanFactory的父类AbstractAutowireCapableBeanFactory的构造方法：

```java
	public AbstractAutowireCapableBeanFactory() {
		super();
		ignoreDependencyInterface(BeanNameAware.class);
		ignoreDependencyInterface(BeanFactoryAware.class);
		ignoreDependencyInterface(BeanClassLoaderAware.class);
		if (NativeDetector.inNativeImage()) {
			this.instantiationStrategy = new SimpleInstantiationStrategy();
		}
		else {
      // 初始化cglib策略
			this.instantiationStrategy = new CglibSubclassingInstantiationStrategy();
		}
	}
```

```java
public AnnotationConfigApplicationContext() {
   StartupStep createAnnotatedBeanDefReader = this.getApplicationStartup().start("spring.context.annotated-bean-reader.create");
   // 创建读取器，同时也会创建StandardEnvironment对象
   this.reader = new AnnotatedBeanDefinitionReader(this);
   createAnnotatedBeanDefReader.end();
   this.scanner = new ClassPathBeanDefinitionScanner(this);
}
```

可以重复调用refresh方法的ApplicationContext的执行逻辑是，先执行bean的销毁方法，然后将beanFactory关闭，最后创建一个新的beanFactory。

```java
protected final void refreshBeanFactory() throws BeansException {
   if (hasBeanFactory()) {
      destroyBeans();
      closeBeanFactory();
   }
   try {
      DefaultListableBeanFactory beanFactory = createBeanFactory();
      beanFactory.setSerializationId(getId());
      customizeBeanFactory(beanFactory);
      loadBeanDefinitions(beanFactory);
      this.beanFactory = beanFactory;
   }
   catch (IOException ex) {
      throw new ApplicationContextException("I/O error parsing bean definition source for " + getDisplayName(), ex);
   }
}
```

启动过程的完整代码：

```java
    @Override
    public void refresh() throws BeansException, IllegalStateException {
        synchronized (this.startupShutdownMonitor) {
            StartupStep contextRefresh = this.applicationStartup.start("spring.context.refresh");

            // 准备一些资源，设置一些基础属性，主要是加载Properties资源
            prepareRefresh();

            // 是否可以重复刷新的应用上下文
            ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();

            // 往BeanFactory工厂中添加如下对象：
            // 1.设置BeanFactory的类加载器，Spring EL表达式解析器，类型转化注册器
            // 2.添三个BeanPostProcessor，注意是具体的BeanPostProcessor实例对象
            // 3.记录ignoreDependencyInterface
            // 4.记录ResolvableDependency
            // 5. 添加三个单例Bean
            prepareBeanFactory(beanFactory);

            try {
                // 模版方法，供子类调用
                postProcessBeanFactory(beanFactory);

                StartupStep beanPostProcess = this.applicationStartup.start("spring.context.beans.post-process");
                // 扫描得到BeanDefinition，放到Bean工厂当中
                invokeBeanFactoryPostProcessors(beanFactory);

                // 将扫描到的BeanPostProcessors实例化并排序，并添加到BeanFactory的BeanPostProcessors属性中去
                registerBeanPostProcessors(beanFactory);
                beanPostProcess.end();

                // 初始化国际化相关的内容
                initMessageSource();

                // 初始化事件广播器
                initApplicationEventMulticaster();

                // 模版方法，给子类扩展
                onRefresh();

                // 注册时间监听器
                registerListeners();

                // 实例化懒加载的Bean
                finishBeanFactoryInitialization(beanFactory);

                // Spring容器生命周期处理
                finishRefresh();
            } catch (BeansException ex) {
                if (logger.isWarnEnabled()) {
                    logger.warn("Exception encountered during context initialization - " +
                            "cancelling refresh attempt: " + ex);
                }

                // Destroy already created singletons to avoid dangling resources.
                destroyBeans();

                // Reset 'active' flag.
                cancelRefresh(ex);

                // Propagate exception to caller.
                throw ex;
            } finally {
                // Reset common introspection caches in Spring's core, since we
                // might not ever need metadata for singleton beans anymore...
                resetCommonCaches();
                contextRefresh.end();
            }
        }
    }
```

处理Spring容器的生命周期：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301092343140.png" alt="image-20230109234308080" style="zoom:50%;" />

### 配置类解析与扫描过程源码解析

![image-20230110233458445](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301102334496.png)

BeanDefinitionRegistryPostProcessor与BeanFactoryPostProcessor的区别在于，BeanDefinitionRegistryPostProcessor可以向BeanFactory中注册BeanDefinition，BeanFactoryPostProcessor只可以拿到BeanDifinition。通常会先先执行postProcessBeanDefinitionRegistry方法，然后再执行postProcessBeanFactory方法。

扫描的整个过程说白了，其实就是向BeanFatory中添加各种各样的BeanDifinition。

配置类加载的主要的类：org.springframework.context.annotation.ConfigurationClassPostProcessor

实现了MergedBeanDefinitionPostProcessor接口的BeanPostProcessor的postProcessMergedBeanDefinition会被放到最后再执行。

完整的解析配置类流程图：https://www.processon.com/view/link/5f9512d5e401fd06fda0b2dd

只要给定的Bean对象，有以下四个注解之一，就可以认为是配置类。

```java
static {
   candidateIndicators.add(Component.class.getName());
   candidateIndicators.add(ComponentScan.class.getName());
   candidateIndicators.add(Import.class.getName());
   candidateIndicators.add(ImportResource.class.getName());
}
```

除了上述的情况外，在类（也可以是接口的实现类或者内部类）的任意一个方法上面添加了@Bean的也是配置类。

扫描处理的核心类：

- org.springframework.context.annotation.ConfigurationClassParser

@Import注解的处理过程如下：

![image-20230114230527924](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301142305971.png)

整个完整的解析过程如下：

![image-20230114230600922](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301142306969.png)

在解析的时候，是一批一批进行解析的，实现DeferredImportSelector接口的类，会在每一批的最后执行selectImports方法。

默认情况下，@Bean的会覆盖掉@Component的BeanDefinition。

`@Configuration(proxyBeanMethods = true)`表示要增强这个配置类，会生成代理类，主要是为了解决@Bean注解方法返回的单例对象的问题。

### 整合Mybatis底层源码解析

Spring整合其他的框架本质上就是让其他的框架所产生的对象成为Spring IOC容器中的Bean。

1. 通过@MapperScan导入了MapperScannerRegistrar类
2. MapperScannerRegistrar类实现了ImportBeanDefinitionRegistrar接口，所以Spring在启动时会调用MapperScannerRegistrar类中的registerBeanDefinitions方法
3. 在registerBeanDefinitions方法中定义了一个ClassPathMapperScanner对象，用来扫描mapper
4. 设置ClassPathMapperScanner对象可以扫描到接口，因为在Spring中是不会扫描接口的
5. 同时因为ClassPathMapperScanner中重写了isCandidateComponent方法，导致isCandidateComponent只会认为接口是备选者Component
6. 通过利用Spring的扫描后，会把接口扫描出来并且得到对应的BeanDefinition
7. 接下来把扫描得到的BeanDefinition进行修改，把BeanClass修改为MapperFactoryBean，把AutowireMode修改为byType
8. 扫描完成后，Spring就会基于BeanDefinition去创建Bean了，相当于每个Mapper对应一个FactoryBean
9. 在MapperFactoryBean中的getObject方法中，调用了getSqlSession()去得到一个sqlSession对象，然后根据对应的Mapper接口生成一个Mapper接口代理对象，这个代理对象就成为Spring容器中的Bean
10. sqlSession对象是Mybatis中的，一个sqlSession对象需要SqlSessionFactory来产生
11. MapperFactoryBean的AutowireMode为byType，所以Spring会自动调用set方法，有两个set方法，一个setSqlSessionFactory，一个setSqlSessionTemplate，而这两个方法执行的前提是根据方法参数类型能找到对应的bean，所以Spring容器中要存在SqlSessionFactory类型的bean或者SqlSessionTemplate类型的bean。
12. 如果你定义的是一个SqlSessionFactory类型的bean，那么最终也会被包装为一个SqlSessionTemplate对象，并且赋值给sqlSession属性
13. 而在SqlSessionTemplate类中就存在一个getMapper方法，这个方法中就产生一个Mapper接口代理对象
14. 到时候，当执行该代理对象的某个方法时，就会进入到Mybatis框架的底层执行流程，详细的请看下图

Spring整合Mybatis之后SQL执行流程：https://www.processon.com/view/link/6152cc385653bb6791db436c

<div class="note info">如果Spring整合Mybatis之后，开启了事务，则一级缓存生效，如果没有开启事务，一级缓存就会失效。</div>

### Spring AOP源码解析

CGLIB和JDK的动态代理示例：

```java
public class ProxyTest {

    public static void main(String[] args) {

        /***********************
         * CGLIB动态代理
         ***********************/

        UserService target = new UserService();

        // 通过cglib技术
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(UserService.class);

        // 定义额外逻辑，也就是代理逻辑
        enhancer.setCallbacks(new Callback[]{new MethodInterceptor() {
            // o表示的就是代理对象，target是被代理的对象爱过你
            @Override
            public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
                System.out.println("before...");
                // 被代理的方法，目标对象
                Object result = methodProxy.invoke(target, objects);
                // 执行原始对象的方法
//                Object result = methodProxy.invokeSuper(target, objects);
                System.out.println("after...");
                return result;
            }
        }, NoOp.INSTANCE});

        // 设置哪些方法不被代理
        enhancer.setCallbackFilter(new CallbackFilter() {
            @Override
            public int accept(Method method) {
                if (method.getName().equals("test")) {
                    return 0;
                } else {
                    return 1;
                }
            }
        });

        // 动态代理所创建出来的UserService对象
        UserService userService = (UserService) enhancer.create();

        // 执行这个userService的test方法时，就会额外会执行一些其他逻辑
        userService.test();

        /***********************
         * JDK动态代理
         ***********************/

        UserService target2 = new UserService();

        // UserInterface接口的代理对象
        Object proxy = Proxy.newProxyInstance(UserService.class.getClassLoader(), new Class[]{UserInterface.class}, new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                System.out.println("before...");
                Object result = method.invoke(target2, args);
                System.out.println("after...");
                return result;
            }
        });

        // 这里只能是UserInterface类型的，产生的代理对象一定是传入的接口的类型
        UserInterface userService2 = (UserInterface) proxy;
        userService2.test();
    }
}
```

在Spring中，对这两项技术做了一定程度的封装，使用ProxyFactory获取代理对象。

```java
public class SpringProxyTest {

    public static void main(String[] args) {

        UserService target = new UserService();
        ProxyFactory proxyFactory = new ProxyFactory();
        proxyFactory.setTarget(target);
        // 指定接口的时候，就会返回JDK动态代理的对象
//        proxyFactory.setInterfaces(UserInterface.class);
        // 会被封装成MethodInterceptor，有多个Advice会按照顺序进行执行
        proxyFactory.addAdvice(new MethodBeforeAdvice() {
            @Override
            public void before(Method method, Object[] args, Object target) throws Throwable {

            }
        });

        UserService proxy = (UserService) proxyFactory.getProxy();
        proxy.test();
    }
}
```

除了直接使用API的方式来生成代理对象，也可以使用@Bean的方式代理对象：

```java
    @Bean
    public DefaultPointcutAdvisor defaultPointcutAdvisor(){
        NameMatchMethodPointcut pointcut = new NameMatchMethodPointcut();
        pointcut.addMethodName("test");

        DefaultPointcutAdvisor defaultPointcutAdvisor = new DefaultPointcutAdvisor();
        defaultPointcutAdvisor.setPointcut(pointcut);
        defaultPointcutAdvisor.setAdvice(new AfterReturningAdvice() {
            @Override
            public void afterReturning(Object returnValue, Method method, Object[] args, Object target) throws Throwable {
                
            }
        });

        return defaultPointcutAdvisor;
    }

    @Bean
    public DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator() {

        DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator = new DefaultAdvisorAutoProxyCreator();

        return defaultAdvisorAutoProxyCreator;
    }
```

DefaultAdvisorAutoProxyCreator实际上是一个BeanPostProcessor，会查找Advisor类型的Bean，就确定了哪些对象是需要生成代理对象的。

<div class="note info">AOP还有一种AspectJ的实现，Spring AOP参照了AspectJ的实现，复用了AspectJ中的几个核心注解，AspectJ是在编译期间就增强了对应的方法，Spring 则是在启动的过程中，通过CGLIB或者JDK的动态代理来实现AOP。Spring 会通过AnnotationAwareAspectJAutoProxyCreator将@Aspect注解扫描到Spring容器中。</div>

被代理的对象通常称为target，被代理的方法通常被称为Join point（连接点）。

<div class="note info">除了增强某个类中的某个方法，还可以通过@DeclareParents动态的为被代理对象增加接口和接口中定义的方法。但是这么做的缺点是，代码的可读性较差。</div>

创建代理对象的核心方法：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301161022572.png" alt="image-20230116102220524" style="zoom:67%;" />

可以通过设置`exposeProxy=true`，将代理对象暴露在ThreadLocal中，通过`AopContext.currentProxy()`就可以获取到被代理的对象。

在ProxyFactory筛选代理对象的被代理的方法：

```java
	List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
```

<div class="note info">Advice的底层是通过MethodInterceptor来实现的。</div>

```java
@Override
public List<Object> getInterceptorsAndDynamicInterceptionAdvice(
        Advised config, Method method, @Nullable Class<?> targetClass) {

    AdvisorAdapterRegistry registry = GlobalAdvisorAdapterRegistry.getInstance();
    // config 其实就是ProxyFactory
    Advisor[] advisors = config.getAdvisors();
    List<Object> interceptorList = new ArrayList<>(advisors.length);
    Class<?> actualClass = (targetClass != null ? targetClass : method.getDeclaringClass());
    Boolean hasIntroductions = null;

    for (Advisor advisor : advisors) {
        if (advisor instanceof PointcutAdvisor) {
            // 取出Pointcut，根据ClassFilter和MethodMatcher来进行过滤
            PointcutAdvisor pointcutAdvisor = (PointcutAdvisor) advisor;
            if (config.isPreFiltered() || pointcutAdvisor.getPointcut().getClassFilter().matches(actualClass)) {
                MethodMatcher mm = pointcutAdvisor.getPointcut().getMethodMatcher();
                boolean match;
                if (mm instanceof IntroductionAwareMethodMatcher) {
                    if (hasIntroductions == null) {
                        hasIntroductions = hasMatchingIntroductions(advisors, actualClass);
                    }
                    match = ((IntroductionAwareMethodMatcher) mm).matches(method, actualClass, hasIntroductions);
                }
                else {
                    match = mm.matches(method, actualClass);
                }
                if (match) {
                    // 适配成MethodInterceptor，通常情况都是一对一的，interceptors只会有一个元素
                    MethodInterceptor[] interceptors = registry.getInterceptors(advisor);
                    // 运行时会封装成为InterceptorAndDynamicMethodMatcher
                    // 真正执行的时候，会再检查MethodMatcher里带参数matches的方法是否返回true
                    if (mm.isRuntime()) {
                        for (MethodInterceptor interceptor : interceptors) {
                            interceptorList.add(new InterceptorAndDynamicMethodMatcher(interceptor, mm));
                        }
                    }
                    else {
                        interceptorList.addAll(Arrays.asList(interceptors));
                    }
                }
            }
        }
        else if (advisor instanceof IntroductionAdvisor) {
            IntroductionAdvisor ia = (IntroductionAdvisor) advisor;
            if (config.isPreFiltered() || ia.getClassFilter().matches(actualClass)) {
                Interceptor[] interceptors = registry.getInterceptors(advisor);
                interceptorList.addAll(Arrays.asList(interceptors));
            }
        }
        else {
            Interceptor[] interceptors = registry.getInterceptors(advisor);
            interceptorList.addAll(Arrays.asList(interceptors));
        }
    }

    return interceptorList;
}
```

一个切面中 ，有@Before，@After（只有AspectJ才有），@Around等注解的方法，他们的执行顺序是由一个比较器来决定的：

```java
static {
   Comparator<Method> adviceKindComparator = new ConvertingComparator<>(
         new InstanceComparator<>(
               Around.class, Before.class, After.class, AfterReturning.class, AfterThrowing.class),
         (Converter<Method, Annotation>) method -> {
            AspectJAnnotation<?> ann = AbstractAspectJAdvisorFactory.findAspectJAnnotationOnMethod(method);
            return (ann != null ? ann.getAnnotation() : null);
         });
   Comparator<Method> methodNameComparator = new ConvertingComparator<>(Method::getName);
   adviceMethodComparator = adviceKindComparator.thenComparing(methodNameComparator);
}
```

即按照Around、Before、After、AfterReturning、AfterThrowing的顺序进行执行。出现重复的注解修饰的方法，会按照自然排序进行执行。

### Spring事务源码解析

开启Spring事务本质上就是增加了一个Advisor，但我们使用@EnableTransactionManagement注解来开启Spring事务是，该注解代理的功能就是向Spring容器中添加了两个Bean：

- AutoProxyRegistrar
- ProxyTransactionManagementConfiguration

AutoProxyRegistrar主要的作用是向Spring容器中注册了一个InfrastructureAdvisorAutoProxyCreator的Bean。

而InfrastructureAdvisorAutoProxyCreator继承了AbstractAdvisorAutoProxyCreator，所以这个类的主要作用就是**开启自动代理**的作用，也就是一个BeanPostProcessor，会在初始化后步骤中去寻找Advisor类型的Bean，并判断当前某个Bean是否有匹配的Advisor，是否需要利用动态代理产生一个代理对象。

ProxyTransactionManagementConfiguration是一个配置类，它又定义了另外三个bean：

1. BeanFactoryTransactionAttributeSourceAdvisor：一个Advisor
2. AnnotationTransactionAttributeSource：相当于BeanFactoryTransactionAttributeSourceAdvisor中的Pointcut
3. TransactionInterceptor：相当于BeanFactoryTransactionAttributeSourceAdvisor中的Advice

AnnotationTransactionAttributeSource就是用来判断某个类上是否存在@Transactional注解，或者判断某个方法上是否存在@Transactional注解的。

TransactionInterceptor就是代理逻辑，当某个类中存在@Transactional注解时，到时就产生一个代理对象作为Bean，代理对象在执行某个方法时，最终就会进入到TransactionInterceptor的invoke()方法。

核心API：org.springframework.transaction.annotation.ProxyTransactionManagementConfiguration#transactionInterceptor

事务的执行过程：

1. Spring事务管理器，创建数据库连接conn
2. `conn.autocommit=flase`
3. 将数据库连接conn放入ThreadLocal（key是DataSource，value是conn连接，这就要求Spring事务管理器中的DataSource和JDBC Tmeplate中的DataSource是同一个，否则，事务可能就会失效）
4. 执行业务方法
5. 如果执行成功，则提交事务
6. 如果抛出了异常，则回滚

隔离级别会依赖于数据库，传播行为是Spring事务管理中的难点。

<div class="note info">同一个数据连接（或事务），要么一起提交，要么一起回滚。</div>

执行的核心逻辑：

```java
    @Nullable
    protected Object invokeWithinTransaction(Method method, @Nullable Class<?> targetClass,
                                             final TransactionAspectSupport.InvocationCallback invocation) throws Throwable {

        // If the transaction attribute is null, the method is non-transactional.
        TransactionAttributeSource tas = getTransactionAttributeSource();
        // 获取@Transactional注解的属性值
        final TransactionAttribute txAttr = (tas != null ? tas.getTransactionAttribute(method, targetClass) : null);

        // 获取Spring 容器中的事务管理器
        final TransactionManager tm = determineTransactionManager(txAttr);

        // ReactiveTransactionManager用的比较少，通常都走else的逻辑
        if (this.reactiveAdapterRegistry != null && tm instanceof ReactiveTransactionManager) {
            boolean isSuspendingFunction = KotlinDetector.isSuspendingFunction(method);
            boolean hasSuspendingFlowReturnType = isSuspendingFunction &&
                    COROUTINES_FLOW_CLASS_NAME.equals(new MethodParameter(method, -1).getParameterType().getName());
            if (isSuspendingFunction && !(invocation instanceof TransactionAspectSupport.CoroutinesInvocationCallback)) {
                throw new IllegalStateException("Coroutines invocation not supported: " + method);
            }
            TransactionAspectSupport.CoroutinesInvocationCallback corInv = (isSuspendingFunction ? (TransactionAspectSupport.CoroutinesInvocationCallback) invocation : null);

            TransactionAspectSupport.ReactiveTransactionSupport txSupport = this.transactionSupportCache.computeIfAbsent(method, key -> {
                Class<?> reactiveType =
                        (isSuspendingFunction ? (hasSuspendingFlowReturnType ? Flux.class : Mono.class) : method.getReturnType());
                ReactiveAdapter adapter = this.reactiveAdapterRegistry.getAdapter(reactiveType);
                if (adapter == null) {
                    throw new IllegalStateException("Cannot apply reactive transaction to non-reactive return type: " +
                            method.getReturnType());
                }
                return new TransactionAspectSupport.ReactiveTransactionSupport(adapter);
            });

            TransactionAspectSupport.InvocationCallback callback = invocation;
            if (corInv != null) {
                callback = () -> CoroutinesUtils.invokeSuspendingFunction(method, corInv.getTarget(), corInv.getArguments());
            }
            Object result = txSupport.invokeWithinTransaction(method, targetClass, callback, txAttr, (ReactiveTransactionManager) tm);
            if (corInv != null) {
                Publisher<?> pr = (Publisher<?>) result;
                return (hasSuspendingFlowReturnType ? TransactionAspectSupport.KotlinDelegate.asFlow(pr) :
                        TransactionAspectSupport.KotlinDelegate.awaitSingleOrNull(pr, corInv.getContinuation()));
            }
            return result;
        }

        PlatformTransactionManager ptm = asPlatformTransactionManager(tm);

        // 会将执行的方法名称设置为事务的名称
        final String joinpointIdentification = methodIdentification(method, targetClass, txAttr);

        if (txAttr == null || !(ptm instanceof CallbackPreferringPlatformTransactionManager)) {
            // 开启一个事务
            TransactionAspectSupport.TransactionInfo txInfo = createTransactionIfNecessary(ptm, txAttr, joinpointIdentification);

            Object retVal;
            try {

                // 执行被代理对象中的方法
                retVal = invocation.proceedWithInvocation();
            } catch (Throwable ex) {
                // 抛出异常，则回滚
                completeTransactionAfterThrowing(txInfo, ex);
                throw ex;
            } finally {
                cleanupTransactionInfo(txInfo);
            }

            if (retVal != null && vavrPresent && TransactionAspectSupport.VavrDelegate.isVavrTry(retVal)) {
                // Set rollback-only in case of Vavr failure matching our rollback rules...
                TransactionStatus status = txInfo.getTransactionStatus();
                if (status != null && txAttr != null) {
                    retVal = TransactionAspectSupport.VavrDelegate.evaluateTryFailure(retVal, txAttr, status);
                }
            }
            // 提交事务
            commitTransactionAfterReturning(txInfo);
            return retVal;
        } else {
            Object result;
            final TransactionAspectSupport.ThrowableHolder throwableHolder = new TransactionAspectSupport.ThrowableHolder();

            // It's a CallbackPreferringPlatformTransactionManager: pass a TransactionCallback in.
            try {
                result = ((CallbackPreferringPlatformTransactionManager) ptm).execute(txAttr, status -> {
                    TransactionAspectSupport.TransactionInfo txInfo = prepareTransactionInfo(ptm, txAttr, joinpointIdentification, status);
                    try {
                        Object retVal = invocation.proceedWithInvocation();
                        if (retVal != null && vavrPresent && TransactionAspectSupport.VavrDelegate.isVavrTry(retVal)) {
                            // Set rollback-only in case of Vavr failure matching our rollback rules...
                            retVal = TransactionAspectSupport.VavrDelegate.evaluateTryFailure(retVal, txAttr, status);
                        }
                        return retVal;
                    } catch (Throwable ex) {
                        if (txAttr.rollbackOn(ex)) {
                            // A RuntimeException: will lead to a rollback.
                            if (ex instanceof RuntimeException) {
                                throw (RuntimeException) ex;
                            } else {
                                throw new TransactionAspectSupport.ThrowableHolderException(ex);
                            }
                        } else {
                            // A normal return value: will lead to a commit.
                            throwableHolder.throwable = ex;
                            return null;
                        }
                    } finally {
                        cleanupTransactionInfo(txInfo);
                    }
                });
            } catch (TransactionAspectSupport.ThrowableHolderException ex) {
                throw ex.getCause();
            } catch (TransactionSystemException ex2) {
                if (throwableHolder.throwable != null) {
                    logger.error("Application exception overridden by commit exception", throwableHolder.throwable);
                    ex2.initApplicationException(throwableHolder.throwable);
                }
                throw ex2;
            } catch (Throwable ex2) {
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

## Spring MVC源码分析

Spring MVC本质上是基于Servlet API构建的原始Web框架。

### Spring MVC执行流程

最典型的MVC就是JSP+Servlet+javabean的模式。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301171017775.png" alt="image-20230117101715723" style="zoom:67%;" />

所有的请求都会经过DispatcherServlet。

Spring MVC的请求执行过程：

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301171042925.jpeg)

HandlerMapping的典型实现：

- org.springframework.web.servlet.handler.BeanNameUrlHandlerMapping
- org.springframework.web.servlet.handler.SimpleUrlHandlerMapping

HandlerAdapter的典型实现：

- org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter

ViewResoler的典型实现：

- org.springframework.web.servlet.view.BeanNameViewResolver

处理请求的方法：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301171134195.png" alt="image-20230117113413140" style="zoom: 67%;" />

可以发现，一旦有一个Handler成功匹配，就会直接返回，不会再往下匹配了。

@RequestMapping的完成流程：https://www.processon.com/view/link/615ea79e1efad4070b2d6707

参数解析转换核心API：

- org.springframework.http.converter.HttpMessageConverter

扩展点：前、后拦截器：

```java
public class JycInterceptor implements HandlerInterceptor {

    /**
     * 在 HandlerMapping 确定合适的处理程序对象之后，但在 HandlerAdapter 调用处理程序之前调用
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        return HandlerInterceptor.super.preHandle(request, response, handler);
    }

    /**
     * 拦截处理程序的执行。在 HandlerAdapter 实际上调用处理程序之后调用，但在 DispatcherServlet 呈现视图之前调用
     */
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
    }

    /**
     * 请求处理完成后的回调，即渲染视图后。将在处理程序执行的任何结果上调用，从而允许进行适当的资源清理。
     */
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
    }
}

```

### Spring MVC启动过程

容器之间的关系：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301172114686.png" alt="image-20230117211434636" style="zoom:25%;" />

<div class="note info">SPI机制：服务提供者接口，Tomcat提供了WebApplicationInitializer的接口，实现者必须按照Servlet规范实现接口，然后在MTEA-INF/services目录下放置一个名称为javax.servlet接口名，里面的内容是实现者实现的类的完整的类限定名。</div>

<div class="note info">Tomcat除了会帮我们实例化我们所实现的WebApplicationInitializer的类以外，还提供了@HandlerTypes，他会将@HandlerTypes执行的接口的实现类，传递到onStartup方法的第一个参数上面（webAppInitializerClasses）去。</div>

```java
    protected void registerDispatcherServlet(ServletContext servletContext) {
        String servletName = getServletName();
        Assert.hasLength(servletName, "getServletName() must not return null or empty");
        // 创建Servlet容器
        WebApplicationContext servletAppContext = createServletApplicationContext();
        Assert.notNull(servletAppContext, "createServletApplicationContext() must not return null");
        // 创建DispatcherServlet
        FrameworkServlet dispatcherServlet = createDispatcherServlet(servletAppContext);
        Assert.notNull(dispatcherServlet, "createDispatcherServlet(WebApplicationContext) must not return null");
        dispatcherServlet.setContextInitializers(getServletApplicationContextInitializers());

        ServletRegistration.Dynamic registration = servletContext.addServlet(servletName, dispatcherServlet);
        if (registration == null) {
            throw new IllegalStateException("Failed to register servlet with name '" + servletName + "'. " +
                    "Check if there is another servlet registered under the same name.");
        }

        // 启动时加载
        registration.setLoadOnStartup(1);
        // 映射
        registration.addMapping(getServletMappings());
        // 是否支持异步
        registration.setAsyncSupported(isAsyncSupported());
        // 设置DispatcherServlet的过滤器
        Filter[] filters = getServletFilters();
        if (!ObjectUtils.isEmpty(filters)) {
            for (Filter filter : filters) {
                registerServletFilter(servletContext, filter);
            }
        }

        // 模版方法
        customizeRegistration(registration);
    }
```

启动核心API：

- org.springframework.web.context.ContextLoader

添加配置类：

- org.springframework.web.servlet.config.annotation.WebMvcConfigurer

#### Spring和Spring MVC为什么需要父子容器？不要不行吗？

就实现层面来说，不用父子容器也可以完成所需功能。之所以设置了父子容器：

- 为了与Spring划分边界，将Controller交由Spring mvc的容器管理，其他则交由Spring管理
- 规范整体框架，使得父容器（Spring容器）无法访问子容器（Spring MVC容器）
- 为了方便子容器的切换，可以很方便的将Spring MVC替换为struts
- 为了节省重复创建Bean的开销

#### 是否可以把所有Bean都通过Spring容器来管理？

不可以，因为HandleMethod需要在Spring MVC容器中查找Controller，如果交由Spring管理，会找不到对应的Controller。

#### 是否可以把所有Bean都交由Spring MVC容器进行管理？

可以，因为doGetBean方法的逻辑是，子容器中找不到，会在父容器查找Bean，都放到子容器中，可以直接查找到。

## Mybatis源码分析

### Mybatis源码体系

JDBC的缺点：

- sql语句耦合在代码中，维护性差
- JDBC频繁的创建和关闭数据库连接，连接消耗大
- 不好设置缓存
- 参数设置非常不方便
- 处理查询结果集，类型转换非常麻烦

Mybatis的体系结构如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301181117366.png" alt="image-20230118111723305" style="zoom:50%;" />

Mybatis的功能架构可以分为三层：

- API接口层：提供给外部使用的接口API，开发人员通过这些本地API来操作数据库，接口层一接收到请求就会调用数据处理层来玩完成具体的数据处理
- 数据处理层：负责具体的SQL查找、SQL解析、SQL执行和执行结果映射处理等，它的主要目的是根据调用的请求完成一次数据库操作
- 基础支撑层：负责最基础的功能支撑，包括连接管理、事务管理、配置加载和缓存处理，这些都是共用的东西，将他们抽取出来作为最基础的组件，为上层的数据层提供最基础的支撑

解析过程：https://www.processon.com/view/link/5efc2381f346fb1ae58925c1

解析到的所有对象的数据会存储到：org.apache.ibatis.session.Configuration。

Mybatis提供的默认的别名注册器：

```java
  public TypeAliasRegistry() {
    registerAlias("string", String.class);

    registerAlias("byte", Byte.class);
    registerAlias("long", Long.class);
    registerAlias("short", Short.class);
    registerAlias("int", Integer.class);
    registerAlias("integer", Integer.class);
    registerAlias("double", Double.class);
    registerAlias("float", Float.class);
    registerAlias("boolean", Boolean.class);

    registerAlias("byte[]", Byte[].class);
    registerAlias("long[]", Long[].class);
    registerAlias("short[]", Short[].class);
    registerAlias("int[]", Integer[].class);
    registerAlias("integer[]", Integer[].class);
    registerAlias("double[]", Double[].class);
    registerAlias("float[]", Float[].class);
    registerAlias("boolean[]", Boolean[].class);

    registerAlias("_byte", byte.class);
    registerAlias("_long", long.class);
    registerAlias("_short", short.class);
    registerAlias("_int", int.class);
    registerAlias("_integer", int.class);
    registerAlias("_double", double.class);
    registerAlias("_float", float.class);
    registerAlias("_boolean", boolean.class);

    registerAlias("_byte[]", byte[].class);
    registerAlias("_long[]", long[].class);
    registerAlias("_short[]", short[].class);
    registerAlias("_int[]", int[].class);
    registerAlias("_integer[]", int[].class);
    registerAlias("_double[]", double[].class);
    registerAlias("_float[]", float[].class);
    registerAlias("_boolean[]", boolean[].class);

    registerAlias("date", Date.class);
    registerAlias("decimal", BigDecimal.class);
    registerAlias("bigdecimal", BigDecimal.class);
    registerAlias("biginteger", BigInteger.class);
    registerAlias("object", Object.class);

    registerAlias("date[]", Date[].class);
    registerAlias("decimal[]", BigDecimal[].class);
    registerAlias("bigdecimal[]", BigDecimal[].class);
    registerAlias("biginteger[]", BigInteger[].class);
    registerAlias("object[]", Object[].class);

    registerAlias("map", Map.class);
    registerAlias("hashmap", HashMap.class);
    registerAlias("list", List.class);
    registerAlias("arraylist", ArrayList.class);
    registerAlias("collection", Collection.class);
    registerAlias("iterator", Iterator.class);

    registerAlias("ResultSet", ResultSet.class);
  }
```

二级缓存的实现采用了装饰器设计模式：org.apache.ibatis.cache.impl.PerpetualCache。过期策略可以设置：LRU、FIFO、SOFT、WEAK等，默认是LRU。

![image-20230118161014727](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301181610788.png)

每一个CRUD操作最终都会解析为一个：org.apache.ibatis.mapping.MappedStatement。

sql对应的对象：

- Dynamic sqlSource（需要拼接参数的）
- Raw sqlSource（不需要拼接参数的）

动态标签会被解析为：

![Mybatis源码解析-SqlNode解析- 掘金](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301182126894.awebp)

解析SQL NODE：org.apache.ibatis.scripting.xmltags.XMLScriptBuilder

```java
  protected MixedSqlNode parseDynamicTags(XNode node) {
    List<SqlNode> contents = new ArrayList<>();
    NodeList children = node.getNode().getChildNodes();
    for (int i = 0; i < children.getLength(); i++) {
      XNode child = node.newXNode(children.item(i));
      if (child.getNode().getNodeType() == Node.CDATA_SECTION_NODE || child.getNode().getNodeType() == Node.TEXT_NODE) {
        String data = child.getStringBody("");
        TextSqlNode textSqlNode = new TextSqlNode(data);
        if (textSqlNode.isDynamic()) {
          contents.add(textSqlNode);
          isDynamic = true;
        } else {
          contents.add(new StaticTextSqlNode(data));
        }
      } else if (child.getNode().getNodeType() == Node.ELEMENT_NODE) { // issue #628
        String nodeName = child.getNode().getNodeName();
        NodeHandler handler = nodeHandlerMap.get(nodeName);
        if (handler == null) {
          throw new BuilderException("Unknown element <" + nodeName + "> in SQL statement.");
        }
        handler.handleNode(child, contents);
        isDynamic = true;
      }
    }
    return new MixedSqlNode(contents);
  }
```

### 数据操作过程源码剖析

SqlSession是一种门面设计模式。

Executor的实现类：

- SIMPLE（默认）
- REUSE：执行器会重用PrepareStatement
- BATCH：执行器不仅重用语句还会执行批量更新

拦截器的作用：

- 分页
- 读写分离
- 修改SQL，拿到SQL语句

动态标签解析：ongl表达式。

# 并发编程专题

## 并发基本原理

### JMM

JMM即Java多线程通信模型-共享内存模型，包含三个方面：

- Java层面
- Jvm层面
- 硬件层面

并发与并行：

- 并行：指同一时刻，有多条指令在多个处理器上同时执行。无论从微观还是宏观来看，二者都是一起执行的
- 并发：指同一时刻，只能有一条执行执行，但多个进程指令会被快速的轮换执行，使得在宏观上具有多个进程同时执行的效果，但在微观上并不是同时执行的，只是把时间分成若干段，使得多个进程快速交替的执行

 并发三大特性：可见性、有序性、原子性；并发要解决的三大问题：同步问题、互斥问题、分工问题。

#### 可见性

当一个线程修改了共享变量的值，其他线程能够看到修改的值。Java内存模型是通过在变量修改后将新值同步回主内存，在变量读取前从主内存刷新变量值这种依赖主内存作为传递没接的方法来实现可见性的。

保证可见性的方法：

- 通过volatile关键字保证可见性
- 通过内存屏障保障可见性
- 通过sychronized关键字保证可见性
- 通过Lock保证可见性
- 通过final关键字保证可见性



#### 原子性



#### 有序性

Java虚拟机规范中定义了Java内存模型，用于屏蔽掉各种硬件和操作系统内存访问差异，以实现让Java程序在各种平台下都能达到一致的并发效果，JMM规范了Java虚拟机与计算机内存是如何协同工作的，即一个线程如何和何时可以看到由其他线程修改过后的共享变量的值，以及在必须时如何同步的访问共享变量。JMM描述的是一种抽象的概念，一组规则，通过这组规则控制程序中各个变量在共享数据区域和私有数据区域的访问方式，JMM是围绕原子性、有序性、可见性展开的。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192143288.png" alt="image-20230119214301158" style="zoom: 67%;" />

Java内存模型与硬件内存架构之间存在差异。硬件内存架构没有区分线程栈和堆。对于硬件，所有的线程栈和堆都分布在主内存中。部分线程栈和堆可能有时候会出现在CPU缓存中和CPU内部的寄存器中。如下图所示，Java内存模型和计算机硬件内存架构是一个交叉关系：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192151147.png" alt="image-20230119215101088" style="zoom:67%;" />

关于主内存和工作内存之间的具体交互协议，即一个变量如何才主内存拷贝到工作内存、如何从工作内存到主内存之间的实现细节，Java内存模型定义了以下八种操作来完成；

- lock（锁定）：作用于主内存的变量，把一个变量标识为一条线程独占状态
- unlock（解锁）作用于主内存变量，把一个处于锁定状态的变量释放出来，释放后的变量才可以被其他线程锁定
- read（读取）：作用于主内存变量，把一个变量值从主内存传输到线程的工作内存中，以便随后的load动作使用
- load（载入）：作用于工作内存的变量，它把read操作从主内存中得到的变量值放入工作内存的变量副本中
- use（使用）：作用于工作内存的变量，把工作内存中一个变量值传递给执行引擎，每当虚拟机遇到一个需要使用变量的值的字节码指令时将会执行这个操作
- assign（赋值）：作用于工作内存的变量，它把一个从执行引擎接收到的值赋值给工作内存的变量，每当虚拟机遇到一个给变量赋值的字节码指令时执行这个操作
- store（存储）；作用于工作内存的变量，把工作内存中的一个变量的值传送到主内存中，以便随后的write的操作
- write（写入）：作用于主内存的变量，它把store操作从工作内存中一个变量的值传送到主内存的变量中

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192202949.png" alt="image-20230119220218821" style="zoom:67%;" />

volatile关键字的C++实现源码：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192236622.png" alt="image-20230119223620590" style="zoom: 33%;" />

可以发现当变量被volitle关键字修饰后，在变量被修改后，会添加一个内存屏障。

内存屏障在Linux系统x86中的实现：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192241561.png" alt="image-20230119224144530" style="zoom: 50%;" />

汇编层面volatile的实现：

```c++
lock;addl $0,0(%%rsp)
```

模板解释器(templateInterpreter)，其对每个指令都写了一段对应的汇编代码，启动时将每个指令与对应汇编代码入口绑定，可以说是效率做到了极致。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202301192325517.png" alt="image-20230119232513483" style="zoom:67%;" />

lock前缀指令的作用：

1. 确保后续指令执行的原子性。在Pentium及之前的处理器中，带有lock前缀的指令在执行期间会锁住总线，使得其它处理器暂时无法通过总线访问内存，很显然，这个开销很大。在新的处理器中，Intel使用缓存锁定来保证指令执行的原子性，缓存锁定将大大降低lock前缀指令的执行开销
2. lock前缀指令具有类似内存屏障的功能，禁止该指令与前面和后面的读写指令重排序
3. lock前缀指令会等待它之前所有的指令完成、并且所有缓冲的写操作写回内存（也就是将store buffer中的内容写入内存）之后才开始执行，并且根据缓存一执行协议，刷新store buffer的操作会导致其他cache中的副本失效。

<div class="note info">Java中，保证可见性的方式有两种，一种是内存屏障（JVM利用storeLoad，硬件层面利用lock或mfence），另一种是利用上下文切换。</div>

### List、Set、HashMap



### 线程池底底层原理



### CAS与Atomic



### synchronized



### ReentrantLock



### Semaphorer与CountDownLatch



### CylicBarrier



### ReentrantReadWriteLock



### BlockingQueue



### ForkJoin



### CompletableFuture



### 并发设计模式



# 性能优化专题

## MySQL



## JVM



## Tomcat



# 分布式框架专题

## Redis



# 微服务专题

# 参考

- https://www.yuque.com/renyong-jmovm/spring/vfg3g6
