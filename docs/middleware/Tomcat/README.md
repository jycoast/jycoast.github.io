## Tomcat

### Tomcat整体架构

Tomcat是Java Web应用服务器，实现Java EE（Java Platform Enterprise Edition）的部分技术规范，比如Java Servlet、JavaServer Pages、Java Expression Language、Java WebSocket等。

Tomcat的核心：Http服务器+Serverlet容器

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303300003726.png" alt="0A23C5C479484C1CAECD2EB6D7805AC2" style="zoom: 67%;" />

我们可以通过Tomcat的server.xml配置文件来加深对Tomcat架构的理解。Tomcat采用了组件化的设计，它的构成组件都是可配置的，其中最外层的是Server，其他组件按照一定的格式要求配置在这个顶层容器中。

```xml
<Server>    //顶层组件，可以包括多个Service
	<Service>  //顶层组件，可包含一个Engine，多个连接器
	    <Connector/>//连接器组件，代表通信接口		   
	    <Engine>//容器组件，一个Engine组件处理Service中的所有请求，包含多个Host
		<Host>  //容器组件，处理特定的Host下客户请求，可包含多个Context
               <Context/>  //容器组件，为特定的Web应用处理所有的客户请求
		</Host>
        </Engine>
	</Service>	
</Server>	
```

Tomcat启动期间会通过解析server.xml，利用反射创建相应的组件，所以xml的标签和源码一一对应。

Tomcat的架构图如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303300007629.png" alt="AC1E5961456D484C9A8C280D14066AF9" style="zoom:67%;" />

简化之后的图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303300007270.png" alt="934BE96C497D48778A03C89A13465D67" style="zoom:67%;" />

Tomcat要实现2个核心功能：

- 处理Socket连接，负责网络字节流与Request和Response对象的转化
- 加载和管理Servlet，以及具体处理Request请求

因此Tomcat设计了两个核心组件连接器（Connector）和容器（Container）来分别做这两件事情。连接器负责对外交流，容器负责内部处理。

### Tomcat核心组件

#### Server组件

Server组件指的就是整个Tomcat服务器，包含多组服务（Service），负责管理和启动各个Service，同时监听8005端口发过来的shutdown命令，用于关闭整个容器。

#### Service组件

每个Service组件都包含了若干接收客户端消息的Connector组件和处理请求的Engine组件。Service组件还包含了若干Executor组件，每个Executor都是一个线程池，它可以为Service内所有组件提供线程池执行任务。

#### 连接器Connector组件

Tomcat与外部世界的连接器，监听固定端口接收外部请求，传递给Container，并将Container处理的结果返回给外部。连接器对Servlet容器屏蔽了不同的应用层协议及I/O模型，无论是HTTP还是AJP，在容器中获取到的都是一个标准的ServletRequest对象。连接器需要实现的功能：

- 监听网络端口
- 接收网络连接请求
- 获取请求网络字节流
- 根据具体应用协议（HTTP/AJP）解析字节流，生成统一的Tomcat Request对象
- 将Tomcat Request对象转成标准的Servlet Request
- 调用Servlet容器，得到ServletResponse
- 将Tomcat Response转成网络字节流
- 将响应字节流写会给浏览器

分析连接器的功能列表，会发现连接器需要完成3个高内聚的功能：

- 网络通信
- 应用层协议解析
- Tomcat Request/Response 与ServletRequest/ServletResponse的转化

因此，Tomcat的设计者分别设计了3个组件来实现这3个功能，分别是EndPoint、Processor和Adapter：

- EndPoint负责提供字节流给Processor
- Processor负责提供Tomcat Request对象给Adapter
- Adapter负责提供ServletRequest对象给容器

由于I/O模型和应用层协议可以自由组合，比如NIO+HTTP或者NIO2+AJP。Tomcat的设计者将网络通信和应用层协议解析放在一起考虑，设计了一个ProtocolHandler的接口来封装这两种变化点。各种协议和通信模型的组合有相应的具体实现类。比如Http11NioProtocol和AjpNioProtocol。

除了这些变化点，系统也存在一些相对稳定的部分，因此Tomcat设计了一系列抽象基类来封装这些稳定的部分，抽象基类AbstractProtocol实现了ProtocolHandler接口。每一种应用层协议都有自己的抽象基类，比如AbstractAjpProtocol和AbstractHttp11Protocol，具体协议的实现类扩展了协议层抽象基类。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202304032351641.png" alt="img202304032351641" style="zoom: 67%;" />

#### ProtocolHandler组件

连接器用ProtocolHandler来处理网络连接和应用层协议，包含两个重要部件：EndPoint和Processor。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202304040001620.png" alt="https://note.youdao.com/yws/public/resource/aa1ac6def2af8c24275e8655aaa1deb9/xmlnote/AE69B6B27BA1452A96B69D108E2ECB7C/36219" style="zoom:67%;" />

连接器用ProtocolHandler接口来封装通信协议个I/O模型的差异，ProtocolHandler内部又分为EndPoint和Processor模块，EndPoint负责底层Sokcet通信，Processor负责应用层协议解析。连接器通过适配器Adapter调用容器。

### Tomcat线程模型

MMU内存管理模型。

Tomcat对JDK线程池的扩展TaskQueue#offer：

```java
@Override
public boolean offer(Runnable o) {
  //we can't do any checks
    if (parent==null) {
        return super.offer(o);
    }
    //we are maxed out on threads, simply queue the object
    if (parent.getPoolSize() == parent.getMaximumPoolSize()) {
        return super.offer(o);
    }
    //we have idle threads, just add it to the queue
    if (parent.getSubmittedCount()<=(parent.getPoolSize())) {
        return super.offer(o);
    }
    //if we have less threads than maximum force creation of a new thread
    if (parent.getPoolSize()<parent.getMaximumPoolSize()) {
        return false;
    }
    //if we reached here, we need to add it to the queue
    return super.offer(o);
}
```

这样在未达到最大线程数的时候，会首先创建线程，只有在达到了线程池最大线程数的时候才会将任务放入到阻塞队列。

### Tomcat类加载机制

#### JVM类加载器

- BootStrapClassLoader（启动类加载器），
- ExtClassLoader（扩展类加载器），
- AppClassLoader（系统类加载器）
- 自定义类加载器，用来加载自定义路径下的类

#### 双亲委托机制

加载某个类会先委托父加载器寻找目标类，找不到再委托上层父加载器加载，如果所有父加载器在自己的加载路径下都找不到目标类，则在自己的类加载路径中查找并载入目标类。这就是双亲委托机制。

类加载过程

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303261718691.png" alt="img202303261718691" style="zoom: 67%;" />



为什么要设计双亲委托机制？

- 沙箱安全机制
- 避免类的重复加载

#### Tomcat的类加载机制

Tomcat作为Servlet容器，它负责加载Servlet类，此外它还负责加载Servlet所依赖的Jar包。并且Tomcat本身也是一个Java程序，因此它需要加载自己的类和依赖的jar包。

Tomcat中自定义了一个类加载器WebAppClassLoader，并且给每个Web应用创建一个类加载器实例，每个Context容器负责创建和维护一个WebAppClassLoader加载器实例。其实现的原理就是不同的类加载器实例加载的类被认为是不同的类，即使它们的类名相同（不同类加载器实例加载的类是互相隔离的）。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303261733242.png" alt="img202303261733242" style="zoom:60%;" />

Tomcat拥有不同的自定义类加载器，以实现对各种资源库的控制。Tomcat主要用类加载器解决以下4个问题：

- 同一个Web服务器里，各个Web项目各自使用的Java类库要相互隔离
- 同一个Web服务器里，各个Web项目之间可以提供共享的Java类库
- 为了使服务器不受Web项目的影响，应该使服务器的类库与应用程序的类库相互独立
- 对于支持JSP的Web服务器，应该支持热插拔（HotSwap）功能

Tomcat提供了四组目录供用户存放第三方类库：

- 放置在/common目录中：类库可被Tomcat和所有的Web应用程序共同使用

##### 线程上下文类加载器



#### Tomcat热加载和热部署


