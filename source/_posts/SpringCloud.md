---
title: SpringCloud
date: 2020-07-16
categories:
 - Spring
author: 吉永超
---

系统介绍SpringCloud的各种组件的使用和实现原理。
<!-- more -->
# Feign中使用动态服务名

```java
@Component
public class DynamicFeignClient<T> {

    private FeignClientBuilder feignClientBuilder;

    public DynamicFeignClient(@Autowired ApplicationContext applicationContext) {
        this.feignClientBuilder = new FeignClientBuilder(applicationContext);
    }

    public T getFeignClient(final Class<T> type, String serviceName) {
        return this.feignClientBuilder.forType(type, serviceName).build();
    }
}
```

使用示例：

```java
// 依赖注入
@Autowired
DynamicFeignClient<ISysDictClient> client;
// 获取到Feign客户端
client.getFeignClient(ISysDictClient.class, serviceName).method(...);
```

# Feign的实现原理

https://www.cnblogs.com/binarylei/p/11563023.html
