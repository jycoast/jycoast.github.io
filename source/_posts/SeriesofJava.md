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

<div class="note info">AOP还有一种AspectJ的实现，Spring AOP参照了AspectJ的实现，复制了AspectJ中的几个核心注解，AspectJ是在编译期间就增强了对应的方法，Spring 则是在启动的过程中，通过CGLIB或者JDK的动态代理来实现AOP。Spring 会通过AnnotationAwareAspectJAutoProxyCreator将@Aspect注解扫描到Spring容器中。</div>

被代理的对象通常称为target，被代理的方法通常被称为Join point（连接点）。

### Spring事务源码解析



## Spring MVC源码

### 执行流程源码剖析源码剖析

## Mybatis源码分析

### Mybatis源码体系

### 数据操作过程源码剖析

# 并发编程专题

## 并发基本原理

### JMM



### List、Set、HashMap



# 性能优化专题

## MySQL



## JVM



## Tomcat



# 分布式框架专题

## Redis



# 微服务专题

# 参考

- https://www.yuque.com/renyong-jmovm/spring/vfg3g6
