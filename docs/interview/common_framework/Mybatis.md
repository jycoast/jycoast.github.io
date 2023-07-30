# MyBatis面试题

## Mybatis接口 Mapper内的方法为什么不能重载？

Mybatis在XML文件中寻找对应的SQL语句的时候，会根据StrictMap<String, MappedStatement>中查找对应的MappedStatement，这里Map的key就是根据Mapper的全类名 + "." + 方法名。一方面，StrictMap如果出现重复的key会直接抛出异常，另一方面，如果允许key重复，也就是允许Mapper内的方法重载，则无法定位到XML文件内唯一的SQL语句。

更多内容可以参考：[Mybatis接口 Mapper内的方法为什么不能重载？](https://www.cnblogs.com/Chenjiabing/p/13671589.html)

## Mybatis的XML映射文件中，不同的XML映射文件，id是否可以重复？

同一个namespace下的id不能重复，原因是 namespace + id 会作为`Map<String，MapperStatement>`的key使用，如果id重复会导致数据互相覆盖。

## #{}和${}的区别是什么？

`#{}` 是预编译处理，`${}`是字符串替换。

- Mybatis在处理`#{}`时，会将sql中的`#{}`替换为“？”号，调用PreparedStatement的set方法来赋值
- Mybatis在处理`${}`时，就是把`\${}`替换程变量的值

使用`#{}`可以有效的放置SQL注入，提高系统的安全性。

## 当实体类中的属性名和表中的字段名不一样怎么办？

- 通过在查询的sql语句中定义字段名的别名，让字段名的别名和实体类的属性名一致
- 通过`<resultMap>`来映射字段名和实体类属性名的一一对应的关系。

## 模糊查询like语句该怎么写？

- 在java代码中添加sql通配符
- 在sql语句中拼接通配符，会引起sql注入

## Mybatis时如何进行分页的？分页插件的原理是什么?

Mybatis使用RowBounds对象进行分页，它是针对ResultSet结果集执行的内存分页，而非物理分页。

## Mybatis有哪些动态sql？

tirm、where、set、foreach、if、choose、when、otherwise、bind。

## Mybtais动态sql有什么用？执行原理是什么？

MyBatis动态sql可以在XML映射文件内，以标签的形式编写动态sql，执行原理时根据表达式的值，完成逻辑判断并动态拼接sql的功能。

## Mapper编写有哪几种方式？

- 接口实现类继承SqlSessionDaoSupport，需要编写mapper接口，mapper接口实现类、mapper.xml文件
- 使用org.mybatis.spring.mapper.MapperFactoryBean;
- 使用mapper扫描器

## Mybatis的一级、二级缓存？

- 一级缓存：基于PerpetuaCache的HashMap本地缓存，其存储作作用域为Session，默认打开一级缓存
- 二级缓存与一级缓存机制相同，不做其作用域为Sessionfactory，该缓存是以namespace为单位的（也就是一个Mapper.xml文件），不同namespace下的操作互不影响。

> 使用二级缓存需要实现序列化接口。

## Mybatis有二级缓存，为什么还要用redis？

使用Mybatis的二级缓存可能会存在如下两个问题：

- 所有对数据表的改变都会刷新缓存，但是一般不要使用二级缓存，例如在UserMappper.xml中有大多数针对user表的操作，但是在另一个***Mapper.xml中，还有针对user单表的操作，这会导致user在两个命名空间下的数据不一致
- 如果在UserMappper.xml做了刷新缓存的操作，在***Mapper.xml中缓存仍然有效，如果有针对user的单表查询，使用缓存的结果可能会不正确

而Redis很好的解决了这个问题，并且还有其它的特性，例如可以搭建在其它服务器上，缓存的容量可扩展等。

## Mybatis如何开启二级缓存？

https://tech.meituan.com/2018/01/19/mybatis-cache.html
