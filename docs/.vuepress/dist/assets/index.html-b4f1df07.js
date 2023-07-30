const l=JSON.parse('{"key":"v-497b0db7","path":"/framework/netty/","title":"深入理解Netty","lang":"zh-CN","frontmatter":{"title":"深入理解Netty","date":"2021-09-10T16:59:16.000Z","categories":["Java"],"tags":["netty"],"author":"吉永超"},"headers":[{"level":2,"title":"Netty特点","slug":"netty特点","link":"#netty特点","children":[{"level":3,"title":"作用","slug":"作用","link":"#作用","children":[]},{"level":3,"title":"良好的设计","slug":"良好的设计","link":"#良好的设计","children":[]},{"level":3,"title":"使用简单","slug":"使用简单","link":"#使用简单","children":[]},{"level":3,"title":"性能","slug":"性能","link":"#性能","children":[]},{"level":3,"title":"安全","slug":"安全","link":"#安全","children":[]}]},{"level":2,"title":"Netty架构实现","slug":"netty架构实现","link":"#netty架构实现","children":[{"level":3,"title":"Netty的Hello world","slug":"netty的hello-world","link":"#netty的hello-world","children":[]}]},{"level":2,"title":"Netty模块分析","slug":"netty模块分析","link":"#netty模块分析","children":[{"level":3,"title":"Netty整体执行流程分析","slug":"netty整体执行流程分析","link":"#netty整体执行流程分析","children":[]}]},{"level":2,"title":"Netty对Socket的实现","slug":"netty对socket的实现","link":"#netty对socket的实现","children":[{"level":3,"title":"Socket使用示例","slug":"socket使用示例","link":"#socket使用示例","children":[]},{"level":3,"title":"消息的广播","slug":"消息的广播","link":"#消息的广播","children":[]},{"level":3,"title":"心跳机制","slug":"心跳机制","link":"#心跳机制","children":[]}]},{"level":2,"title":"Netty与WebSocket","slug":"netty与websocket","link":"#netty与websocket","children":[{"level":3,"title":"实现与原理分析","slug":"实现与原理分析","link":"#实现与原理分析","children":[]},{"level":3,"title":"WebSocket生命周期分解","slug":"websocket生命周期分解","link":"#websocket生命周期分解","children":[]}]},{"level":2,"title":"Google Protobuf","slug":"google-protobuf","link":"#google-protobuf","children":[{"level":3,"title":"简介","slug":"简介","link":"#简介","children":[]},{"level":3,"title":"proto文件","slug":"proto文件","link":"#proto文件","children":[]},{"level":3,"title":"解析和序列化","slug":"解析和序列化","link":"#解析和序列化","children":[]},{"level":3,"title":"编写message","slug":"编写message","link":"#编写message","children":[]},{"level":3,"title":"读取message","slug":"读取message","link":"#读取message","children":[]},{"level":3,"title":"多协议消息","slug":"多协议消息","link":"#多协议消息","children":[]},{"level":3,"title":"最佳实践","slug":"最佳实践","link":"#最佳实践","children":[]}]},{"level":2,"title":"Apache Thrift","slug":"apache-thrift","link":"#apache-thrift","children":[{"level":3,"title":"简介","slug":"简介-1","link":"#简介-1","children":[]},{"level":3,"title":"thrift文件","slug":"thrift文件","link":"#thrift文件","children":[]},{"level":3,"title":"最佳实践","slug":"最佳实践-1","link":"#最佳实践-1","children":[]},{"level":3,"title":"传输格式","slug":"传输格式","link":"#传输格式","children":[]},{"level":3,"title":"传输方式","slug":"传输方式","link":"#传输方式","children":[]},{"level":3,"title":"服务模型","slug":"服务模型","link":"#服务模型","children":[]},{"level":3,"title":"多语言的支持","slug":"多语言的支持","link":"#多语言的支持","children":[]}]},{"level":2,"title":"GRPC","slug":"grpc","link":"#grpc","children":[{"level":3,"title":"简介","slug":"简介-2","link":"#简介-2","children":[]},{"level":3,"title":"相关示例","slug":"相关示例","link":"#相关示例","children":[]},{"level":3,"title":"流式调用","slug":"流式调用","link":"#流式调用","children":[]}]},{"level":2,"title":"IO与NIO","slug":"io与nio","link":"#io与nio","children":[{"level":3,"title":"IO与NIO的区别","slug":"io与nio的区别","link":"#io与nio的区别","children":[]},{"level":3,"title":"Buffer","slug":"buffer","link":"#buffer","children":[]},{"level":3,"title":"Channel","slug":"channel","link":"#channel","children":[]},{"level":3,"title":"Selector","slug":"selector","link":"#selector","children":[]},{"level":3,"title":"NIO网络编程","slug":"nio网络编程","link":"#nio网络编程","children":[]},{"level":3,"title":"字符编码集","slug":"字符编码集","link":"#字符编码集","children":[]}]},{"level":2,"title":"零拷贝","slug":"零拷贝","link":"#零拷贝","children":[{"level":3,"title":"传统的IO流程","slug":"传统的io流程","link":"#传统的io流程","children":[]},{"level":3,"title":"零拷贝实现原理","slug":"零拷贝实现原理","link":"#零拷贝实现原理","children":[]}]},{"level":2,"title":"EventLoopGroup","slug":"eventloopgroup","link":"#eventloopgroup","children":[]},{"level":2,"title":"Netty中的Future对象","slug":"netty中的future对象","link":"#netty中的future对象","children":[{"level":3,"title":"ChannelFuture","slug":"channelfuture","link":"#channelfuture","children":[]},{"level":3,"title":"异步读写架构","slug":"异步读写架构","link":"#异步读写架构","children":[]},{"level":3,"title":"Promise","slug":"promise","link":"#promise","children":[]}]},{"level":2,"title":"ServerBootStrap","slug":"serverbootstrap","link":"#serverbootstrap","children":[{"level":3,"title":"核心方法","slug":"核心方法","link":"#核心方法","children":[]},{"level":3,"title":"初始化和注册方法","slug":"初始化和注册方法","link":"#初始化和注册方法","children":[]}]},{"level":2,"title":"Reactor模式","slug":"reactor模式","link":"#reactor模式","children":[{"level":3,"title":"传统的模型","slug":"传统的模型","link":"#传统的模型","children":[]},{"level":3,"title":"Reactor模式","slug":"reactor模式-1","link":"#reactor模式-1","children":[]},{"level":3,"title":"Netty中的Reactor线程模型","slug":"netty中的reactor线程模型","link":"#netty中的reactor线程模型","children":[]}]},{"level":2,"title":"自适应缓冲区","slug":"自适应缓冲区","link":"#自适应缓冲区","children":[]},{"level":2,"title":"Channel实现原理","slug":"channel实现原理","link":"#channel实现原理","children":[{"level":3,"title":"Channel的四大组件","slug":"channel的四大组件","link":"#channel的四大组件","children":[]},{"level":3,"title":"Channel与ChannelPipeline","slug":"channel与channelpipeline","link":"#channel与channelpipeline","children":[]},{"level":3,"title":"ChannelOption与AttributeKey","slug":"channeloption与attributekey","link":"#channeloption与attributekey","children":[]},{"level":3,"title":"ChannelHandler与ChannelHandlerContext","slug":"channelhandler与channelhandlercontext","link":"#channelhandler与channelhandlercontext","children":[]},{"level":3,"title":"Channel选择器","slug":"channel选择器","link":"#channel选择器","children":[]},{"level":3,"title":"Channel注册流程","slug":"channel注册流程","link":"#channel注册流程","children":[]}]},{"level":2,"title":"Netty中的设计原则","slug":"netty中的设计原则","link":"#netty中的设计原则","children":[{"level":3,"title":"设计原则","slug":"设计原则","link":"#设计原则","children":[]},{"level":3,"title":"业务线程池","slug":"业务线程池","link":"#业务线程池","children":[]}]},{"level":2,"title":"ByteBuf实现原理","slug":"bytebuf实现原理","link":"#bytebuf实现原理","children":[{"level":3,"title":"ByteBuf使用示例","slug":"bytebuf使用示例","link":"#bytebuf使用示例","children":[]},{"level":3,"title":"ByteBuf数据结构","slug":"bytebuf数据结构","link":"#bytebuf数据结构","children":[]},{"level":3,"title":"复合缓冲区","slug":"复合缓冲区","link":"#复合缓冲区","children":[]}]},{"level":2,"title":"引用计数","slug":"引用计数","link":"#引用计数","children":[{"level":3,"title":"实现原理","slug":"实现原理","link":"#实现原理","children":[]},{"level":3,"title":"AtomicIntegerFieldUpdater","slug":"atomicintegerfieldupdater","link":"#atomicintegerfieldupdater","children":[]}]},{"level":2,"title":"Netty中的处理器","slug":"netty中的处理器","link":"#netty中的处理器","children":[{"level":3,"title":"自定义编解码器","slug":"自定义编解码器","link":"#自定义编解码器","children":[]},{"level":3,"title":"ReplayingDecoder","slug":"replayingdecoder","link":"#replayingdecoder","children":[]},{"level":3,"title":"LengthFieldBasedFrameDecoder","slug":"lengthfieldbasedframedecoder","link":"#lengthfieldbasedframedecoder","children":[]},{"level":3,"title":"常见编解码器总结","slug":"常见编解码器总结","link":"#常见编解码器总结","children":[]}]},{"level":2,"title":"TCP粘包与拆包","slug":"tcp粘包与拆包","link":"#tcp粘包与拆包","children":[{"level":3,"title":"粘包与拆包","slug":"粘包与拆包","link":"#粘包与拆包","children":[]},{"level":3,"title":"解决方案","slug":"解决方案","link":"#解决方案","children":[]}]},{"level":2,"title":"观察者模式","slug":"观察者模式","link":"#观察者模式","children":[]},{"level":2,"title":"适配器模式","slug":"适配器模式","link":"#适配器模式","children":[]},{"level":2,"title":"模板方法模式","slug":"模板方法模式","link":"#模板方法模式","children":[]}],"git":{"updatedTime":1688570797000,"contributors":[{"name":"jiyongchao","email":"jiyongchaowy@163.com","commits":1}]},"filePathRelative":"framework/netty/README.md"}');export{l as data};
