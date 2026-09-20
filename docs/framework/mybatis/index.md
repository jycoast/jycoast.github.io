# Mybatis源码分析

## Mybatis源码体系

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

## 数据操作过程源码剖析

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
