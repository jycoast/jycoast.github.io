# Dubbo

## Dubbo底层实现原理

链接：https://note.youdao.com/ynoteshare/index.html?id=ca746f44f16b862e3189e5f24b3a8e64&type=note&_time=1685805324275

## Dubbo3.0新特性

### dubbo协议

dubbo协议由于请求中没有多余的无用的字节，都是必要的字节，因此性能会更好，并且每个Dubbo请求和响应中都有一个请求ID，这样可以基于一个Socket连接同时发送多个Dubbo请求，不用担心请求和响应对不上，所以dubbo协议成为了Dubbo框架中的默认协议。

但是dubbo协议一旦涉及到跨RPC框架，比如一个Dubbo服务要调用gRPC服务，就比较麻烦了。因为发一个dubbo协议的请求给一个gRPC服务，gRPC服务只会按照gRPC的格式来解析字节流，最终肯定会解析不成功的。

dubbo协议虽好，但是不够通用，所以这就出现了Triple协议，Triple协议是基于HTTP2，没有性能问题，另外HTTP协议非常通用，兼容起来也比较简单，而且还有很多额外的功能，比如流式调用。

### Triple协议



## Dubbo服务注册与引入底层原理

参考链接：https://note.youdao.com/ynoteshare/index.html?id=bbeb46c842c84cfcdbf1d1f040fe40c7&type=note&_time=1685977459844

服务导出与服务引入的流程图：https://www.processon.com/view/link/62c441e80791293dccaebded

### 服务导出



### 服务引入



## Dubbo服务调用底层原理

### Http2原理解析

Http2可以支持同时发在一个socket上送多个请求。

- 帧长度
- 帧类型
