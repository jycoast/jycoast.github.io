## Netty面试题

### Netty有哪些应用场景？

- 作为RPC框架的网络通信工具
- 实现Http服务器
- 实现即时通讯系统
- 实现消息推送系统

### Netty核心组件有哪些？分别有什么作用？

|    核心组件     | 作用                                                         |
| :-------------: | :----------------------------------------------------------- |
|     Channel     | Channel接口是Netty对网络操作的抽象类，它包含了基本的I/O操作，如bind()、connect()、read()、write()等 |
|    EventLoop    | EventLoop（事件循环）定义了Netty的核心抽象，用于处理连接的生命周期中所发生的事件，他的主要作用是负责监听网络事件并调用事件处理器进行相关I/O操作的处理 |
|  ChannelFuture  | 用于注册异步执行结果的监听器                                 |
| ChannelHandler  | 消息的具体处理器，负责读写操作、客户端连接等事情             |
| ChannelPipeline | ChannelPipeline为ChannelHandler的链，提供了一个容器并定义了用于沿着链传播入站和出战事件流的API。当Channel被创建时，它会被自动地分配到它专属的ChannelPipeline。使用者可以在ChannelPipeline上通过addLast()方法添加一个或者多个ChannelHandler，因为一个数据或事件可能需要多个ChannelHandler来进行处理，在ChannelPipeline中，当一个ChannelHandler处理完之后就会将数据交给下一个ChannelHandler |

### EventLoopGroup了解么?和EventLoop什么关系?



### Bootstrap和ServerBootstrap了解么？

BootStrap是客户端的启动引导类/辅助类，具体使用如下：

```java
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            //创建客户端启动引导/辅助类：Bootstrap
            Bootstrap b = new Bootstrap();
            //指定线程模型
            b.group(group).
                    ......
            // 尝试建立连接
            ChannelFuture f = b.connect(host, port).sync();
            f.channel().closeFuture().sync();
        } finally {
            // 优雅关闭相关线程组资源
            group.shutdownGracefully();
        }
```

ServerBootStrap是客户端的启动引导类/辅助类，具体使用如下：

```java
        // 1.bossGroup 用于接收连接，workerGroup 用于具体的处理
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            //2.创建服务端启动引导/辅助类：ServerBootstrap
            ServerBootstrap b = new ServerBootstrap();
            //3.给引导类配置两大线程组,确定了线程模型
            b.group(bossGroup, workerGroup).
                   ......
            // 6.绑定端口
            ChannelFuture f = b.bind(port).sync();
            // 等待连接关闭
            f.channel().closeFuture().sync();
        } finally {
            //7.优雅关闭相关线程组资源
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
```

可以看出：

- BootStrap通常使用connet()方法连接到远程的主机和端口，作为Netty TCP协议通信中的客户端。另外，Bootstrap也可以通过bind()方法绑定本地的一个端口，作为UDP协议通信中的一段
- ServerBootStrap通常使用bind()方法绑定在本地的端口上，然后等待客户端的连接
- BootStrap只需要配置一个事件循环组，而ServerBootStrap需要配置两个事件循环组，一个用于接收连接，一个用于具体的处理

### NioEventLoopGroup默认的构造函数会起多少线程？

CPU核心线程数*2：

```java
    // 从1，系统属性，CPU核心数*2 这三个值中取出一个最大的
    //可以得出 DEFAULT_EVENT_LOOP_THREADS 的值为CPU核心数*2
    private static final int DEFAULT_EVENT_LOOP_THREADS = Math.max(1, SystemPropertyUtil.getInt("io.netty.eventLoopThreads", NettyRuntime.availableProcessors() * 2));

    // 当指定的线程数nThreads为0时，使用默认的线程数DEFAULT_EVENT_LOOP_THREADS
    protected MultithreadEventLoopGroup(int nThreads, ThreadFactory threadFactory, Object... args) {
        super(nThreads == 0 ? DEFAULT_EVENT_LOOP_THREADS : nThreads, threadFactory, args);
    }
```

### Netty线程模型了解么？

基于Reactor线程模型，Reactor采用多路复用将事件分发给相应的Handler处理，非常适合处理海量IO的场景。

### Netty服务端和客户端的启动过程了解么？



### Netty长连接、心跳机制了解么？



### Netty的零拷贝了解么？

零拷贝是指计算机执行操作时，CPU不需要先将数据从某处内存复制到另一个特定区域，这种技术通常用于通过网络传输文件时节省CPU周期和内存带宽。在OS层面上的零拷贝技术通常指避免在用户态和内核态之间来回拷贝数据。在Netty中，零拷贝主要体现在：

- 使用Netty提供的CompositeByteBuf类，可以将多个ByteBuf合并为一个逻辑上的ByteBuf，避免了各个ByteBuf之间的拷贝
- ByteBuf支持slice操作，因此可以将ByteBuf分为多个共享同一个存储区域的ByteBuf，避免了内存的拷贝
- 通过FileRegion包装的FileChannel.tranferTo实现文件传输，可以直接将文件缓冲区的数据发送到目标Channel，避免了传统通过循环write方式导致的内存拷贝问题



