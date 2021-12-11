---
title: MySQL原理分析
date: 2021-08-30 20:35:37
tags:
 - DB
author: 吉永超
---

或许你正在使用MySQL，知道如何写出逻辑正确的SQL语句来实现业务目标，却不确定这个语句是不是最优的；或者你听说了一些使用数据库的最佳实践，但是更想了解为什么这么做；或许你使用的数据库偶尔会出问题，亟需了解如何更快速、更准确地定位问题，甚至自己解决问题。希望本文能够激发你对数据库原理的探索欲，对MySQL做到知其所以，知其所以然。

<!--more-->

# MySQL基础

虽然关于安装MySQL已经有很多的文章，但是为了保持环境和参数的一致，这里我们还是简单介绍如何安装MySQL的基础知识，如果你已经有一个可用的MySQL可以跳过这部分，如果在后文中出现执行了执行情况不一致的情况，那你可能需要检查你的MySQL的版本和参数的配置是否和这里的一样。

## 环境搭建

### 安装MySQL

```shell
# 查看Linux服务器上是否安装过MySQL
rpm -qa | grep -i mysql # 查询出所有mysql依赖包

# 1、拉取镜像
docker pull mysql:5.7

# 2、创建实例并启动
docker run -p 3306:3306 --name mysql \
-v /root/mysql/log:/var/log/mysql \
-v /root/mysql/data:/var/lib/mysql \
-v /root/mysql/conf:/etc/mysql \
-e MYSQL_ROOT_PASSWORD=333 \
-d mysql:5.7

# 3、mysql配置 /root/mysql/conf/my.conf
[client]
#mysqlde utf8字符集默认为3位的，不支持emoji表情及部分不常见的汉字，故推荐使用utf8mb4
default-character-set=utf8

[mysql]
default-character-set=utf8

[mysqld]
#设置client连接mysql时的字符集,防止乱码
init_connect='SET collation_connection = utf8_general_ci'
init_connect='SET NAMES utf8'

#数据库默认字符集
character-set-server=utf8

#数据库字符集对应一些排序等规则，注意要和character-set-server对应
collation-server=utf8_general_ci

# 跳过mysql程序起动时的字符参数设置 ，使用服务器端字符集设置
skip-character-set-client-handshake

# 禁止MySQL对外部连接进行DNS解析，使用这一选项可以消除MySQL进行DNS解析的时间。但需要注意，如果开启该选项，则所有远程主机连接授权都要使用IP地址方式，否则MySQL将无法正常处理连接请求！
skip-name-resolve

# 4、重启mysql容器
docker restart mysql

# 5、进入到mysql容器
docker exec -it mysql /bin/bash

# 6、查看修改的配置文件
cat /etc/mysql/my.conf
```

`Linux`环境下`MySQL`的安装目录。

| 路径                | 解释                     |
| ------------------- | ------------------------ |
| `/var/lib/mysql`    | MySQL数据库文件存放位置  |
| `/usr/share/mysql`  | 错误消息和字符集文件配置 |
| `/usr/bin`          | 客户端程序和脚本         |
| `/etc/init.d/mysql` | 启停脚本相关             |

### 修改字符集

```shell
# 1、进入到mysql数据库并查看字符集
# show variables like 'character%';
# show variables like '%char%';

mysql> show variables like 'character%';
+--------------------------+----------------------------+
| Variable_name            | Value                      |
+--------------------------+----------------------------+
| character_set_client     | utf8                       |
| character_set_connection | utf8                       |
| character_set_database   | utf8                       |
| character_set_filesystem | binary                     |
| character_set_results    | utf8                       |
| character_set_server     | utf8                       |
| character_set_system     | utf8                       |
| character_sets_dir       | /usr/share/mysql/charsets/ |
+--------------------------+----------------------------+
8 rows in set (0.00 sec)

mysql> show variables like '%char%';
+--------------------------+----------------------------+
| Variable_name            | Value                      |
+--------------------------+----------------------------+
| character_set_client     | utf8                       |
| character_set_connection | utf8                       |
| character_set_database   | utf8                       |
| character_set_filesystem | binary                     |
| character_set_results    | utf8                       |
| character_set_server     | utf8                       |
| character_set_system     | utf8                       |
| character_sets_dir       | /usr/share/mysql/charsets/ |
+--------------------------+----------------------------+
8 rows in set (0.01 sec)
```

`MySQL5.7`配置文件位置是`/etc/my.cnf`或者`/etc/mysql/my.cnf`，如果字符集不是`utf-8`直接进入配置文件修改即可。

```shell
[client]
default-character-set=utf8

[mysql]
default-character-set=utf8

[mysqld]
# 设置client连接mysql时的字符集,防止乱码
init_connect='SET NAMES utf8'
init_connect='SET collation_connection = utf8_general_ci'

# 数据库默认字符集
character-set-server=utf8

#数据库字符集对应一些排序等规则，注意要和character-set-server对应
collation-server=utf8_general_ci

# 跳过mysql程序起动时的字符参数设置 ，使用服务器端字符集设置
skip-character-set-client-handshake

# 禁止MySQL对外部连接进行DNS解析，使用这一选项可以消除MySQL进行DNS解析的时间。但需要注意，如果开启该选项，则所有远程主机连接授权都要使用IP地址方式，否则MySQL将无法正常处理连接请求！
skip-name-resolve
```

<div class="note warning"><p>安装MySQL完毕之后，第一件事就是修改字符集编码。</p></div>

### 配置文件

`MySQL`配置文件讲解：https://www.cnblogs.com/gaoyuechen/p/10273102.html

1、二进制日志`log-bin`：主从复制。

```shell
# my,cnf
# 开启mysql binlog功能
log-bin=mysql-bin
```

2、错误日志`log-error`：默认是关闭的，记录严重的警告和错误信息，每次启动和关闭的详细信息等。

```shell
# my,cnf
# 数据库错误日志文件
log-error = error.log
```

3、查询日志`log`：默认关闭，记录查询的`sql`语句，如果开启会降低`MySQL`整体的性能，因为记录日志需要消耗系统资源。

```shell
# my,cnf
# 慢查询sql日志设置
slow_query_log = 1
slow_query_log_file = slow.log
```

4、数据文件。

- `frm文件`：存放表结构。
- `myd`文件：存放表数据。
- `myi`文件：存放表索引。

```shell
# mysql5.7 使用.frm文件来存储表结构
# 使用 .ibd文件来存储表索引和表数据
-rw-r-----  1 mysql mysql   8988 Jun 25 09:31 pms_category.frm
-rw-r-----  1 mysql mysql 245760 Jul 21 10:01 pms_category.ibd
```

`MySQL5.7`的`Innodb`存储引擎可将所有数据存放于`ibdata*`的共享表空间，也可将每张表存放于独立的`.ibd`文件的独立表空间。
共享表空间以及独立表空间都是针对数据的存储方式而言的。

- 共享表空间: 某一个数据库的所有的表数据，索引文件全部放在一个文件中，默认这个共享表空间的文件路径在`data`目录下。 默认的文件名为`:ibdata1` 初始化为`10M`。
- 独立表空间: 每一个表都将会生成以独立的文件方式来进行存储，每一个表都有一个`.frm`表描述文件，还有一个`.ibd`文件。 其中这个文件包括了单独一个表的数据内容以及索引内容，默认情况下它的存储位置也是在表的位置之中。在配置文件`my.cnf`中设置： `innodb_file_per_table`。

## 逻辑架构

让我们从最简单的情形开始，假设有一张这样的表T，表里只有一个ID字段，在执行下面这个查询语句时：

```sql
select * from T where ID=10;
```

我们看到的只是输入一条语句，返回一个结果，却不知道这条语句在MySQL内部的执行过程，要想更深入的了解，就需要了解MySQL的逻辑架构：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211128225619.png" alt="MySQL存储引擎架构图" style="zoom: 67%;" />

大体来说，MySQL可以分为Server层和存储引擎两部分。

Server层包括连接器、查询缓存、分析器、优化器、执行器，涵盖MySQL的大多数核心服务功能，以及所有的内置函数（如日期、时间、数学和加密函数等），所有跨存储引擎的功能都在这一层实现，比如存储过程、触发器、视图等。

而存储引擎层负责数据的存储和提取，其架构模式是插件式的，支持InnoDB、MyISAM、Memory等多个存储引擎，现在最常用的存储引擎是InnoDB，它从MySQL5.5.5版本开始称为了默认的存储引擎。

这也就是说，在执行`create table`建表的时候，如果不指定引擎类型，默认使用的就是InnoDB。不过，在使用`create table`语句中使用`engine=memory`来指定存储引擎的类型来创建表，不同的存储引擎的表数据获取方式不同，支持的功能也不同，在后面的文章中，我们会讨论到引擎的选择。

从图中不难看出，不同的存储引擎共用一个Server层，也就是从连接器到执行器的部分。接下来我们会从上文提到的SQL语句，梳理它执行的完整的流程，了解每个组件的作用。

### 连接器

执行SQL语句的第一步，总是会使用连接器连接到这个数据库上。连接器负责跟客户端建立连接、获取权限、维持和管理连接，连接命令通常如下：

```shell
mysql -h$ip -P$port -u$user -p
```

输完命令之后，就需要交互对话里面输入密码。虽然密码也可以直接跟在-p后面写在命令行中，但这样可能会导致你的密码泄露。如果你连接的是生产服务器，强烈建议你不要这么做。

连接命令中的mysql是客户端工具，用来跟服务端建立连接。在完成经典的TCP握手后，连接器就要开始认证你的身份，这个时候用的就是你输入的用户名和密码。

- 如果用户名或密码不对，你就会收到一个“Access denied for user”的错误，然后客户端程序结束执行
- 如果用户名密码认证通过，连接器会到权限表里面查出你拥有的权限，之后，这个连接里面的权限判断逻辑，都将依赖于此时读到的权限

这就意味着，一个用户成功建立连接后，即使你使用管理员账号对这个用户的权限做了修改，也不会影响已经存在连接的权限。修改完成后，只有再新建的连接才会使用新的权限设置。

连接完成之后，如果你没有后续的动作，这个连接就处于空闲状态，可以使用`show processlist`命令中看到它，其中Command列显示为“Sleep”的这一行，就表示现在系统里面有一个空闲连接。

![image-20211128232149339](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211128232149.png)

客户端如果太长时间没有动静，连接器就会自动将他断开，这个时间是由参数`wait_timeout`控制的，默认值是8小时。

如果在连接被断开之后，客户端再次发送请求的话，就会收到一个错误提示：`Lost connection to MySQL Server during queery`。这时候如果你要继续，就需要重连，然后再执行请求了。

连接可以分为两种：长连接和短连接。长连接是指连接成功后，如果客户端持续有请求，则一直使用同一个连接。短连接则是指每次执行完很少的几次查询就断开连接，下次查询再重新建立一个。

建立连接的过程通常是比较复杂的，所以在使用的过程中要尽量减少建立连接的动作，也就是尽量使用长连接。但是全部使用长连接后，你可能会发现，有些使用MySQL占用内存涨的特别快，这是因为MySQL在执行过程中临时使用的内存是管理在连接对象里面的。这些资源会在连接断开的时候才释放。所以如果长连接累积下来，可能导致内存占用太大，被系统强行杀掉（OOM），从现象看就是MySQL异常重启了。

解决这个问题通常有两种方案：

- 定期断开长连接。使用一段时间，或者程序里面判断执行过一个占用内存的大查询后，断开连接，之后要查询再重连
- 如果使用的MySQL5.7或更新的版本，可以在每次执行一个比较大的操作后，通过执行`mysql_reset_connection`来重新初始化连接资源。这个过程不需要重连和重新做权限验证，但是会将连接恢复到刚刚创建完成时的状态

### 查询缓存

连接建立完成后，就可以正式开始执行select语句了，执行逻辑就会来到第二步：查询缓存。

MySQL拿到一个查询请求后，会先到查询缓存看看，之前是不是执行过这条语句，之前执行过的语句及其结果可能会以key-value对的形式，被直接缓存到内存中。key是查询的语句，value是查询的结果，如果查询能够直接这个缓存中找到key，那么这个value就会被直接返回给客户端。

如果语句不在查询缓存中，就会继续后面的执行阶段。执行完成后，执行结果会被存入查询缓存中，可以看到，如果查询命中缓存，MySQL不需要执行后面的复杂操作，就可以直接返回结果，效率就会很高。

但是大多数情况下不要使用查询缓存，查询缓存的失效非常频繁，只要有对一个表的更新，这个表上的查询缓存都会被清空。因此很有可能费劲的把结果存起来，还没有使用，但是就被更新操作清空掉了，对于更新压力大的数据库来说，查询缓存的命中率会非常低，除非业务就是有一张静态表，很长时间才会更新依次，比如，一个系统的配置表，那这张表上的查询才适合使用查询缓存。

MySQL提供了参数配置，可以将参数`query_cache_type`设置成DEMAND，这样对于默认的SQL语句都不使用查询缓存，而对于确定要使用查询缓存的语句，可以使用SQL_CACHE显式指定：

```sql
 select SQL_CACHE * from T where ID=10 ；
```

<div class = "note warning"><p>MySQL8.0版本直接将查询缓存的整块功能删掉了，也就是说8.0开始就彻底没有这个功能了。</p></div>

### 分析器

如果没有命中查询缓存，就要真正开始执行语句了。MySQL会使用分析器对SQL语句做解析，识别出SQL语句中的字符串分别是什么，代表什么。在之前的例子中，MySQL会从输入的“select”关键字识别出来，这是一个查询语句，它也要把字符串“T”识别成表名“T”，把字符串“ID”识别成“列ID”，做完了这些识别以后，就要做“语法分析”，根据词法分析的结果，语法分析器会根据语法规则，判断输入的SQL语句是否满足MySQL语法。

<div class="note warning"><p>如果语句不对，就会收到“You have an error in your SQL syntax”的错误提醒。</p></div>

### 优化器

经过了分析器，MySQL就知道你想要做什么了，在开始执行之前，还需要经过优化器的处理。

优化器是在表里面有多个索引的时候，决定使用哪个索引；或者在一个语句有多表关联（join）的时候，决定各个表的连接顺序，比如执行下面的语句：

```sql
select * from t1 join t2 using(ID) where t1.c=10 and t2.d=20;
```

- 既可以先从表里面取出c=10的记录的ID值，再根据ID值关联到表t2，再判断t2里面d的值是否等于20
- 也可以先从表t2里面取出d=20的记录的值，再根据ID值关联到t1，再判断t1里面c的值是否等于10

这两种执行方法的逻辑结果是一样的，但是执行的效率会有所不同，而优化器的作用就是决定选择使用哪一种方案。优化器的阶段完成后，这个语句的执行方案就确定下来了，然后进入执行器阶段。

### 执行器

MySQL通过分析器知道了要做什么。通过优化器知道了该怎么做，于是就进入了执行器阶段，开始执行语句。开始执行的时候，要先判断有没有对应的查询权限，如果没有，就会返回没有权限的错误，如下所示：

```shell
mysql> select * from T where ID=10;
ERROR 1142 (42000): SELECT command denied to user 'b'@'localhost' for table 'T'
```

如果有权限，就打开表继续执行，打开表的时候，执行器就会根据表的引擎定义，去使用这个引擎提供的接口，比如上述例子中表T中，ID字段没有索引，那么执行器的执行流程如下：

1. 调用InnoDB引擎接口取这个表的第一行，判断ID值是不是10，如果不是则跳过，如果是则将这行存在结果集中
2. 调用引擎接口取“下一行”，重复相同的判断逻辑，直到取到这个表的最后一行
3. 执行器将上述遍历过程中所有满足条件的行组成的记录集作为结果集返回给客户端

至此，这个语句就执行完成了。对于有索引的表，执行的逻辑也差不多。第一次调用的是“取满足条件的第一行”这个接口，之后循环取“满足条件的下一行”这个接口，这些接口都是引擎中已经定义好的。

数据库的慢查询日志中，字段`rows_examined`表示这个语句执行过程中扫描了多少行，这个值就是在执行器每次调用引擎获取数据行的时候累加的。不过在有些场景下，执行器调用一次，在引擎内部扫描了多行，因此引擎扫描行数跟`rows_examined`并不是完全相同的。

## SQL执行流程

MySQL可以借助重做日志和归档日志恢复到半个月内任意一秒的状态。为了了解它的实现原理，我们从一个表的一条更新语句开始：

```sql
create table T(ID int primary key, c int);
```

如果要将ID=2这一行的值加1，SQL如下：

```sql
update T set c=c+1 where ID=2;
```

同样的更新语句也会按照SQL语句的基本执行链路执行：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211129235536.png" alt="image-20211129235535854" style="zoom:67%;" />

与查询流程不一样的是，更新流程还设计两个重要的的日志模块：redo log（重做日志）和binlog（归档日志），这是MySQL中两个核心概念。

### 重做日志

如果每一次的更新操作都需要写进磁盘，然后磁盘也要找到对应的那条记录，然后再更新，整个过程IO成本、查找成本都很高。为了解决这个问题，MySQL会使用WAL技术（Write-Ahead Logging），先写日志，再写磁盘。

具体来说，当有一条记录需要更新的时候，InnoDB引擎就会先把记录写到redo log里面，并更新内存，这个时候更新就算完成了。同时，InnoDB引擎会在适当的时候，将这个操作记录到磁盘里面，而这个更新往往是在系统比较空闲的时候做。InnoDB的redo log是固定大小的，比如可以配置一组4个文件，每个文件的大小是1GB，那么总共就可以记录4GB的操作。从头开始写入，到末尾又回到开头循环写入，如下图所示：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211130232906.png" alt="image-20211130232906506" style="zoom:67%;" />

其中write pos是当前记录的位置，一边写一边后移，写到第3号文件末尾后就回到0号文件开头，checkpoint是当前要擦除的位置，也是往后推移并且循环的，擦除记录前要把记录更新到数据文件。write pos和checkpoint之间还空着的部分，就可以用来记录新的操作，如果write pos追上了checkpoint，那么就表示不能再执行新的更新操作了，就得先停下来擦掉一些记录，然后将checkpoint向后移动。

有了redo log，InnoDB就可以保证即使数据库发生异常重启，之前提交的记录都不会丢失，这个能力称为crash-safe。

### 归档日志

MySQL从整体上来看，大致可以分为两部分，一块是Server层，它主要负责MySQL功能层面的事情，另一块是引擎层，负责存储相关的具体事宜。上文提到的redo log是InnoDB引擎特有的日志，而Server层也有自己的日志，称为bin log（归档日志）。由于最开始的MySQL并没有InnoDB引擎，MySQL自带的引擎是MyISAM，但是MyISAM没有crash-safe的能力，binlog日志只能用于归档。

redo log和binlog有以下区别：

- redo log是InnoDB引擎所特有的，binlog是MySQL的Server层实现的，所有引擎都可以使用
- redo log是物理日志，记录的是“在某个数据页上做了什么修改”，binlog是逻辑日志，记录的是这个语句的原始逻辑，比如“给ID=2这一行的c字段加1”
- redo log是循环写的，空间固定会用完，binlog是可以追加写入的。“追加写”是指binlog文件写到一定大小后会切换到写一个，并不会覆盖以前的日志

### 更新语句执行流程

了解这两个日志的作用，我们再来看执行器和InnoDB引擎在执行这个update语句时的内部流程。

1. 执行器先找引擎取ID=2这一行，ID是逐渐，引擎直接用树搜索找到这一行。如果ID=2这一行所在的数据页本来就在内存中，就直接返回给执行器；否则，需要先从磁盘读入内存，然后再返回
2. 执行器拿到引擎给的行数据，把这个值加上1，比如原来是N，现在就是N+1，得到新的一行数据，再调用引擎接口写入这行新数据
3. 引擎将这行新数据更新到内存中，同时将这个更新操作记录到redo log里面，此时redo log处于prepare状态，然后告知执行器执行完成了，随时可以提交事务
4. 执行器生成这个操作的binlog，并把binlog写入磁盘
5. 执行器调用引擎的提交事务接口，引擎把刚刚写入的redo log改成提交（commit）状态，更新完成

update语句的执行如下图：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211130235424.png" alt="image-20211130235424315" style="zoom:67%;" />

注意这里并不是直接写入redo log，而是将redo log的写入拆成了两个步骤：prepare和commit，这就是“两阶段提交”。

### 两阶段提交

两阶段提交为了让两份日志之间的逻辑一致，要说明这个问题，我们得从文章开头的那个问题说起：怎样让数据库恢复到半个月内任意一秒的状态？

上文提到过，binlog会记录所有的逻辑操作，并且是采用“追加写”的形式，当需要恢复到指定的某一秒时，比如某天下午两点发现中午十二点有一次误删表，需要找回数据，那么可以：

- 首先，找到最近的一次全量备份，如果运气好，可能就是昨天晚上的一个备份，从这个备份恢复到临时库
- 然后，从备份的时候点开始，将备份的binlog依次取出来，重放到中午误删表之前的那个时刻

这样临时库就跟误删之前的线上库一样了，然后就可以把表数据从临时库取出来，按需要恢复到线上库去。

接下来我们说明为什么需要两阶段提交，由于redo log和binlog时两个独立的逻辑，如果不用两阶段提交，要么就是先写完redo log再写binlog，或者采用反过来的顺序，我们来看看这两种方式会有什么问题：

- 先写redo log后写binlog。假设在redo log写完，binlog还没有写完的时候，MySQL异常重启，上文提到过，redo log写完之后，系统即使崩溃，仍然能够把数据恢复回来，所以恢复这一行c的值是1，但是由于binlog没写完就crash了，这个时候binlog里面就没有记录这个语句。因此，之后备份日志的时候，存起来的binlog里面就没有这条语句，这个时候，如果需要用binlog来恢复临时库的话，由于这个语句的binlog丢失，这个临时库就会少了这一次更新，恢复出来的这一行c的值就是0，与原库的值不同
- 先写binlog后写redo log，如果在binlog写完之后crash，由于redo log还没写，崩溃恢复以后这个事务无效，所以这一行c的值是0。但是binlog里面已经记录了“把c从0改成1”这个日志，所以，在之后用binlog来恢复的时候就多了一个事务出来，恢复出来的这一行的c的值就是1，与原库的值不同

可以看到，如果不使用“两阶段提交”，那么数据库的状态就有可能和用它的日志恢复出来的库的状态不一致，不过你可能会问，碰到需要用日志恢复数据的场景是不是很少，其实，并不只是误操作以后需要用这个过程来恢复数据，当你需要扩容的时候，也就是需要再多搭建一些备库来增加系统的读能力的时候，现在常见的做法也是用全量备份加上应用binlog来实现的，这个“不一致”就不会导致线上出现主从数据库不一致的情况。

简单来说，redo log和binlog都可以用于表示事务的提交状态，而两阶段提交就是让这两个状态保持逻辑上的一致。

## 性能分析

### EXPLAIN简介

> EXPLAIN是什么？

EXPLAIN：SQL的执行计划，使用EXPLAIN关键字可以模拟优化器执行SQL查询语句，从而知道MySQL是如何处理SQL语句的。

> EXPLAIN怎么使用？

语法：`explain` + `SQL`。

```shell
mysql> explain select * from pms_category \G;
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: pms_category
   partitions: NULL
         type: ALL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 1425
     filtered: 100.00
        Extra: NULL
1 row in set, 1 warning (0.00 sec)
```

> EXPLAIN能干嘛？

可以查看以下信息：

- `id`：表的读取顺序。
- `select_type`：数据读取操作的操作类型。
- `possible_keys`：哪些索引可以使用。
- `key`：哪些索引被实际使用。
- `ref`：表之间的引用。
- `rows`：每张表有多少行被优化器查询。

### EXPLAIN字段

> id

`id`：表的读取和加载顺序。

值有以下三种情况：

- `id`相同，执行顺序由上至下。
- `id`不同，如果是子查询，id的序号会递增，**id值越大优先级越高，越先被执行。**
- `id`相同不同，同时存在。**永远是id大的优先级最高，id相等的时候顺序执行。**



> select_type

`select_type`：数据查询的类型，主要是用于区别，普通查询、联合查询、子查询等的复杂查询。

- `SIMPLE`：简单的`SELECT`查询，查询中不包含子查询或者`UNION `。
- `PRIMARY`：查询中如果包含任何复杂的子部分，最外层查询则被标记为`PRIMARY`。
- `SUBQUERY`：在`SELECT`或者`WHERE`子句中包含了子查询。
- `DERIVED`：在`FROM`子句中包含的子查询被标记为`DERIVED(衍生)`，MySQL会递归执行这些子查询，把结果放在临时表中。
- `UNION`：如果第二个`SELECT`出现在`UNION`之后，则被标记为`UNION`；若`UNION`包含在`FROM`子句的子查询中，外层`SELECT`将被标记为`DERIVED`。
- `UNION RESULT`：从`UNION`表获取结果的`SELECT`。



> type

`type`：访问类型排列。

**从最好到最差依次是：**`system`>`const`>`eq_ref`>`ref`>`range`>`index`>`ALL`。除了`ALL`没有用到索引，其他级别都用到索引了。

一般来说，得保证查询至少达到`range`级别，最好达到`ref`。

- `system`：表只有一行记录（等于系统表），这是`const`类型的特例，平时不会出现，这个也可以忽略不计。
- `const`：表示通过索引一次就找到了，`const`用于比较`primary key`或者`unique`索引。因为只匹配一行数据，所以很快。如将主键置于`where`列表中，MySQL就能将该查询转化为一个常量。
- `eq_ref`：唯一性索引扫描，读取本表中和关联表表中的每行组合成的一行，查出来只有一条记录。除 了 `system` 和` const` 类型之外, 这是最好的联接类型。
- `ref`：非唯一性索引扫描，返回本表和关联表某个值匹配的所有行，查出来有多条记录。
- `range`：只检索给定范围的行，一般就是在`WHERE`语句中出现了`BETWEEN`、`< >`、`in`等的查询。这种范围扫描索引比全表扫描要好，因为它只需要开始于索引树的某一点，而结束于另一点，不用扫描全部索引。
- `index`：`Full Index Scan`，全索引扫描，`index`和`ALL`的区别为`index`类型只遍历索引树。**也就是说虽然`ALL`和`index`都是读全表，但是`index`是从索引中读的，`ALL`是从磁盘中读取的。**

- `ALL`：`Full Table Scan`，没有用到索引，全表扫描。



> possible_keys 和 key

`possible_keys`：显示可能应用在这张表中的索引，一个或者多个。查询涉及到的字段上若存在索引，则该索引将被列出，**但不一定被查询实际使用。**

`key`：实际使用的索引。如果为`NULL`，则没有使用索引。查询中如果使用了覆盖索引，则该索引仅仅出现在`key`列表中。



> key_len

`key_len`：表示索引中使用的字节数，可通过该列计算查询中使用的索引的长度。`key_len`显示的值为索引字段的最大可能长度，并非实际使用长度，即`key_len`是根据表定义计算而得，不是通过表内检索出的。在不损失精度的情况下，长度越短越好。

`key_len`计算规则：**https://blog.csdn.net/qq_34930488/article/details/102931490**

```shell
mysql> desc pms_category;
+---------------+------------+------+-----+---------+----------------+
| Field         | Type       | Null | Key | Default | Extra          |
+---------------+------------+------+-----+---------+----------------+
| cat_id        | bigint(20) | NO   | PRI | NULL    | auto_increment |
| name          | char(50)   | YES  |     | NULL    |                |
| parent_cid    | bigint(20) | YES  |     | NULL    |                |
| cat_level     | int(11)    | YES  |     | NULL    |                |
| show_status   | tinyint(4) | YES  |     | NULL    |                |
| sort          | int(11)    | YES  |     | NULL    |                |
| icon          | char(255)  | YES  |     | NULL    |                |
| product_unit  | char(50)   | YES  |     | NULL    |                |
| product_count | int(11)    | YES  |     | NULL    |                |
+---------------+------------+------+-----+---------+----------------+
9 rows in set (0.00 sec)


mysql> explain select cat_id from pms_category where cat_id between 10 and 20 \G;
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: pms_category
   partitions: NULL
         type: range
possible_keys: PRIMARY
          key: PRIMARY  # 用到了主键索引，通过查看表结构知道，cat_id是bigint类型，占用8个字节
      key_len: 8        # 这里只用到了cat_id主键索引，所以长度就是8！
          ref: NULL
         rows: 11
     filtered: 100.00
        Extra: Using where; Using index
1 row in set, 1 warning (0.00 sec)
```



> ref

`ref`：显示索引的哪一列被使用了，如果可能的话，是一个常数。哪些列或常量被用于查找索引列上的值。



> rows

`rows`：根据表统计信息及索引选用情况，大致估算出找到所需的记录需要读取的行数。



> Extra

`Extra`：包含不适合在其他列中显示但十分重要的额外信息。

- `Using filesort`：说明MySQL会对数据使用一个外部的索引排序，而不是按照表内的索引顺序进行读取。**MySQL中无法利用索引完成的排序操作成为"文件内排序"。**

```shell
# 排序没有使用索引
mysql> explain select name from pms_category where name='Tangs' order by cat_level \G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: pms_category
   partitions: NULL
         type: ref
possible_keys: idx_name_parentCid_catLevel
          key: idx_name_parentCid_catLevel
      key_len: 201
          ref: const
         rows: 1
     filtered: 100.00
        Extra: Using where; Using index; Using filesort
1 row in set, 1 warning (0.00 sec)

#~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
# 排序使用到了索引

mysql> explain select name from pms_category where name='Tangs' order by parent_cid,cat_level\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: pms_category
   partitions: NULL
         type: ref
possible_keys: idx_name_parentCid_catLevel
          key: idx_name_parentCid_catLevel
      key_len: 201
          ref: const
         rows: 1
     filtered: 100.00
        Extra: Using where; Using index
1 row in set, 1 warning (0.00 sec)
```

- `Using temporary`：使用了临时表保存中间结果，MySQL在対查询结果排序时使用了临时表。常见于排序`order by`和分组查询`group by`。**临时表対系统性能损耗很大。**

- `Using index`：表示相应的`SELECT`操作中使用了覆盖索引，避免访问了表的数据行，效率不错！如果同时出现`Using where`，表示索引被用来执行索引键值的查找；如果没有同时出现`Using where`，表明索引用来读取数据而非执行查找动作。

```shell
# 覆盖索引
# 就是select的数据列只用从索引中就能够取得，不必从数据表中读取，换句话说查询列要被所使用的索引覆盖。
# 注意：如果要使用覆盖索引，一定不能写SELECT *，要写出具体的字段。
mysql> explain select cat_id from pms_category \G;
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: pms_category
   partitions: NULL
         type: index
possible_keys: NULL       
          key: PRIMARY
      key_len: 8
          ref: NULL
         rows: 1425
     filtered: 100.00
        Extra: Using index   # select的数据列只用从索引中就能够取得，不必从数据表中读取   
1 row in set, 1 warning (0.00 sec)
```

- `Using where`：表明使用了`WHERE`过滤。
- `Using join buffer`：使用了连接缓存。
- `impossible where`：`WHERE`子句的值总是false，不能用来获取任何元组。

```shell
mysql> explain select name from pms_category where name = 'zs' and name = 'ls'\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: NULL
   partitions: NULL
         type: NULL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: NULL
     filtered: NULL
        Extra: Impossible WHERE   # 不可能字段同时查到两个名字
1 row in set, 1 warning (0.00 sec)
```

# MySQL索引

## 索引常见模型

除了数据本身之外，数据库还维护着一个满足特定查找算法的数据结构，这些数据结构以某种方式指向数据，这样就可以在这些数据结构的基础上实现高级查找算法，这种数据结构就是索引。简单来说，索引是排好序的快速查找数据结构。

索引的出现是为了提高查询效率，但是实现索引的方式却有很多中，可以用于提高读写效率的数据结构有很多中，这里我们这里讨论三种常见的数据结构：哈希表、有序数组、搜索树。

### 哈希表

哈希表是一种以键-值（key-value）存储数据的结构，我们只需要输入待查找的值即key，就可以找到其对应的值即value。使用哈希算法不可避免的就会遇到哈希冲突，链地址法是解决哈希冲突比较常见的做法。

假设现在维护着一个身份证信息和姓名的表，需要根据身份证号查找对应的名字，这时对应的哈希索引的示意图如下所示：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211202233834.png" alt="image-20211202233834367" style="zoom:67%;" />

图中，User2和User4根据身份证号算出来的值都是N，但是没有关系，后面还有一个链表。假设这个时候要查ID_card_n2对应的名字是什么，首先将ID_card_n2通过哈希函数算出N，然后，按顺序遍历，找到User2。

需要注意的是，图中四个ID_card_n的值并不是递增的，这样做的好处是增加新的User时速度会很快，只需要往后追加，但缺点是，因为不是有序的，所以哈希索引做区间查询的速度是很慢的，如果要查找身份证号在[ID_card_X,ID_card_Y]这个区间的所有用户，就必须全部扫描一遍了。因此，哈希表这种结构适用于只有等值查询的场景，比如Memcached及其他一些NoSQL引擎。

### 有序数组

有序数组在等值查询和范围查询场景中的性能就都非常优秀。还是上面根据身份证号查询名字的例子，如果我们使用有序数组来实现的话，示意图如下所示：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211202234913.png" alt="image-20211202234913046" style="zoom:67%;" />

这里我们假设身份证号没有重复，这个数组就是按照身份证号递增的顺序保存的。这时候如果要查询ID_card_n2对应的名字，用二分法就可以快速得到，时间复杂度为O（logN）。同理，如果要查询区间的时间复杂度也是O（logN）。

如果仅仅看查询效率，有序数组就是最好的数据结构了，但是，在需要更新数据的时候就麻烦了。往中间插入一条记录就必须得往后挪动所有的记录，成本非常高。因此，有序数组索引只适用于静态存储引擎，比如要保存的是2017年某个城市的所有人口信息，这类不会再修改的数据。

### 二叉搜索树

如果我们用二叉搜索树来实现上述的例子：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211202235620.png" alt="image-20211202235620443" style="zoom:67%;" />

二叉搜索树的特点是：每个节点的左儿子小于父节点，父节点又小于右儿子。这样如果要查询ID_card_n2的话，按照途中搜索的顺序就是按照UserA -> UserC -> UserF -> User2这个路径得到，这个时间复杂度是O（logN）。

不过为了维持O（logN）的查询复杂度，更新的时间复杂度也是O（logN）。

树可以有二叉，也可以有多叉，多叉树就是每个节点有多个儿子，儿子之间的大小保证从左到右递增。二叉树是搜索效率最高的，但是实际上大多数的数据库存储却并不使用二叉树。其原因是，索引不止在内存中，还要写到磁盘上。

为了让一个查询尽量少地读磁盘，就必须让查询过程访问尽量少地数据块。那么，我们就不应该使用二叉树，而是要使用“N叉树”，这里，“N叉”树中地“N”取决于数据块的大小。以InnoDB的一个整数字段为例。这个N差不多是1200。这棵树高是4的时候，就可以存1200的3次方个值，这已经17亿了。考虑到树根的数据块总是在内存中的，一个10亿行的表上一个整数字段的索引，查找一个值最多只需要访问3次从盘。其实，树的第二层也有很大的概率在内存中，那么访问磁盘的平均次数就更少了。

由于N叉树在读写上的性能优点，以及适配磁盘的访问模式，已经被广泛应用在数据库引擎中了。在MySQL中，索引是在存储引擎层的实现的，所以并没有统一的索引标准，即不同存储引擎的索引的工作方式并不一样。而底层的实现也可能不同。

### B+树

在InnoDB中，表都是根据主键顺序以索引的形式存放的，这种存储方式的表称为索引组织表，并且InnoDB使用了B+树索引模型，将数据存储在了B+树中，每一个索引在InnoDB中对应一颗B+树。

假设我们有一个主键列为ID的表，表中有字段k，并且在k上有索引，这个表的建表语句是：

```sql
CREATE TABLE T (
	id int PRIMARY KEY,
	k int NOT NULL,
	name varchar(16),
	INDEX(k)
) ENGINE = InnoDB;
```

然后向表中插入5条记录，表中R1~R5的（ID，K）的值分别为（100，1）、（200，2）、（300，3）、（500，5）、（600，6），两棵树的示例示意图如下：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211204115523.png" alt="image-20211204115523479" style="zoom:67%;" />

从图中不难看出，根据叶子节点的内容，索引类型分为主键索引和非主键索引。主键索引的叶子节点存储的是整行数据，在InnoDB中，主键索引也被称为聚簇索引（clustered index）。非主键索引的叶子节点内容是主键的值，在InnoDB里，非主键索引也被称为二级索引（secondary index）。

基于主键索引和普通索引的查询略有差别：

- 如果语句是`select * from T where ID = 500`，即主键查询方式，则只需要搜索ID这颗B+树
- 如果语句是`select * from T where k = 5`，即普通索引查询方式，则需要先搜索K索引树，得到ID的值为500，再到ID索引树搜索一次，这个过程称为回表

也就是说，基于非主键索引的查询需要多扫描一棵索引树，因此，我们在应用中应该尽量使用主键查询。

B+树为了维护索引的有序性，在插入新值的时候需要做必要的维护。以上面的图为例，如果插入新的行ID值为700，则只需要在R5的记录后面插入一个新记录。如果新插入的ID的值为400，就相对麻烦了，需要逻辑上挪动后面的数据，空出位置。而更糟的情况是，如果R5所在的数据页已经满了，根据B+树的算法，这时候需要申请一个新的数据页，然后挪动部分数据过去。这个过程称为页分裂。在这种情况下，性能自然也受收到影响。

除了性能外，页分裂操作还影响数据页的利用率。原本放在一个页的数据，现在分到两个页中，整体空间利用率降低大约50%。

当然有分裂就有合并。当相邻两个页由于删除了数据，利用率很低之后，会将数据页做合并，合并的过程，可以认为是分裂过程的逆过程。

可能你在一些建表规范里面见到过类似的描述，要求建表语句里面一定要有自增主键。当然事无绝对，我们需要分析一下哪些场景应该使用自增主键，而哪些场景下不应该。

自增主键是指自增列上定义的主键，在建表语句中一般是这么定义的：NOT PRIMARY KEY AUTO_INCREMENT。插入新记录的时候可以不指定ID的值，系统会获取当前ID最大值作为下一条记录的ID值，也就是说，自增主键的插入数据的模式，正符合了我们前面提到的递增插入的场景。每次插入一条新记录，都是追加操作，都不设计到挪动其它记录，也不会触发叶子节点的分裂。而有业务逻辑的字段做主键，则往往不容易保证有序插入，这样写数据成本相对较高。

除了考虑性能外，我们还可以从存储空间的角度来看。假设表中确实有一个唯一的字段，比如字符串类型的身份证号，那应该用身份证号做主键，还是用自增字段做主键呢？

由于每个非主键索引的叶子节点上都是主键的值。如果用身份证号做主键，那么每个二级索引的叶子节点占用约20个字节，而如果用整型做主键，则只要4个字节，如果是长整型（bigint）则是8个字节。显然，主键长度越小，普通索引的叶子节点就越小，普通索引占用的空间也就越小。所以从性能和存储空间方面考量，自增主键往往是更合理的选择。

不过在典型的KV场景，由于没有其它索引，所以就不用考虑其它索引叶子节点大小的问题了，KV场景的特点如下：

- 只有一个索引
- 该索引必须是唯一索引

这时候我们就需要优先考虑上一段提到的“尽量使用主键查询”原则，直接将这个索引设置为主键，可以避免每次查询需要搜索两棵树。

## 索引的执行流程

创建好索引之后，我们探讨一下索引的执行流程，以下面的表T为例，如果执行`select * from T where k between 3 and 5`，需要执行几次树的搜索操作，会扫描多少行？

```sql
CREATE TABLE T (
	ID int PRIMARY KEY,
	k int NOT NULL DEFAULT 0,
	s varchar(16) NOT NULL DEFAULT '',
	INDEX k(k)
) ENGINE = InnoDB;

insert into T values(100,1, 'aa'),(200,2,'bb'),(300,3,'cc'),(500,5,'ee'),(600,6,'ff'),(700,7,'gg');
```

此时表中的索引结构如下图所示：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211205110531.png" alt="image-20211205110530992" style="zoom:67%;" />

### 回表

此时，上述SQL语句查询的执行流程：

1. 在k索引树上找到k=3的记录，取得ID=300
2. 再到ID索引树查到ID=300对应的R3
3. 在k索引树取下一个值k=5，取得ID=500
4. 在k索引树取下一个值k=6，不满足条件，循环结束

在这个过程中，回到主键索引树搜索的过程，就称为回表，可以看到，这个查询过程读了k索引树的3条记录（步骤1、3和5），回表了两次（步骤2和4）.

在这个例子中，由于查询结果所需要的数据只在主键索引上有，所以不得不回表。那么，该如何避免回表呢？

### 覆盖索引

如果执行的语句是`select ID from T where k between 3 and 5`，这时只需要查ID的值，而ID的值已经在k索引树上了，因此可以直接提供查询结果，不需要回表。也就是说，在这个查询里面，索引k已经“覆盖了”我们的查询 需求，我们称为覆盖索引。

由于覆盖索引可以减少树的搜索次数，显著提升查询性能，所以使用覆盖索引是一个常用的性能优化手段。

需要注意的是，在引擎内部使用覆盖索引在索引k上其实读了三条记录，R3~R5（对应的索引k上的记录项），但是对于MySQL的Server层来说，它就是找引擎拿到了两条记录，因此MySQL认为扫描行数是2。

基于上面覆盖索引的说明，我们来讨论一个问题：在一个市民信息表上，是否有必要将身份证号和名字建立联合索引？假设这个市民表的定义如下：

```sql
CREATE TABLE `tuser` (
	`id` int(11) NOT NULL,
	`id_card` varchar(32) DEFAULT NULL,
	`name` varchar(32) DEFAULT NULL,
	`age` int(11) DEFAULT NULL,
	`ismale` tinyint(1) DEFAULT NULL,
	PRIMARY KEY (`id`),
	KEY `id_card` (`id_card`),
	KEY `name_age` (`name`, `age`)
) ENGINE = InnoDB
```

我们知道，身份证号是市民的唯一标识，也就是说，如果有根据身份证号查询市民信息的需求，我们只要在身份证号字段上建立索引就够了。而再建立一个（身份证号、姓名）的联合索引，是不是浪费空间？

如果现在有一个高频请求，要根据市民的身份证号查询他的姓名，那这个联合索引就有意义了。它可以高频请求上用到覆盖索引，不再需要回表查整行记录，减少语句的执行时间。

当然，索引字段的维护总是有代价的，因此，在建立冗余索引来支持索引覆盖时就需要权衡考虑了。

### 最左前缀原则

如果要为每一种查询都设计一个索引，会导致索引数量激增，在B+树这种索引结构中，可以利用索引的“最左前缀”来定位记录，为了直观地说明这个概念，我们用（name，age）这个联合索引来分析。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211205113629.png" alt="image-20211205113628876" style="zoom:67%;" />

可以看到，索引项是按照索引定义里面出现的字段顺序排序的。当需要查到所有名字是“张三”的人时，可以快速定位到ID4，然后向后遍历得到所有需要的结果。

如果要查的是所有名字第一个字的是“张”的人，你的SQL语句的条件是“`where name like 张%`”。这时也可以用上这个索引，查找到第一个符合条件的记录是ID3，然后向后遍历，直到不满足条件为止。

可以看到，不止是索引的全部定义，只要满足最左前缀，就可以利用索引来加速检索。这个最左前缀可以是联合索引的最左N个字段，也可以是字符串索引的最左M个字符。因此，在建立联合索引的时候，通常我们就会根据索引的复用能力来确定索引内的字段顺序，如果可以通过调整联合索引的顺序，就可以少维护一个索引，那么就要优先考虑建立这样顺序的索引。

那么，如果既有联合查询，又有基于a、b各自的查询呢？查询条件里面只有b的语句，是无法使用（a，b）这个联合索引的，这个时候不得不维护另一个索引，也就是说必须同时维护（a，b）、（b）这两个索引。这种情况下，我们要考虑的原则就是空间了。比如上面这个市民表的情况，name字段是比age字段大的，那么建议创建一个（name，age）的联合索引和一个（age）的单字段索引。

### 索引下推

上一段我们说到满足最左前缀原则的时候，最左前缀可以用于在索引中定位记录，那么不符合最左前缀的部分，会怎么样呢？

我们还是以市民表中的联合索引（name，age）为例。假设现在的需求是检索出表中“名字第一个字是张，而且年龄是10岁所有男孩”，那么，SQL语句是这么写的：

```sql
select * from tuser where name like '张%' and age=10 and ismale=1;
```

这个语句在搜索索引树的时候，只能用“张”，找到第一个满足条件的记录ID3，然后判断其它条件是否满足。在MySQL 5.6之前，只能从ID3开始一个个回表，到主键索引上找出数据行，再对比字段值，而在MySQL 5.6之后引入的索引下推优化（index condition pushdown），可以在索引遍历的过程中，对索引中包含的字段先做判断，直接过滤掉不满足条件的记录，减少回表次数，下面是这两个过程的执行流程图：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211205173708.png" alt="image-20211205173708482" style="zoom:67%;" />

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211205173743.png" alt="image-20211205173743641" style="zoom:67%;" />



在这两个图里面，每一个虚线箭头表示回表一次，在第一张图中，InnoDB并不会去看age的值，只是按顺序把“name”第一个字是“张”的记录一条条取出来回表，因此，需要回表4次。下一张图中，InnoDB在（name，age）索引内部就判断了age是否等于10，对于不等于10的记录，直接判断并跳过。在我们这个例子中，只需要对ID4、ID5这两条记录回表取数据判断，就只需要回表2次。

## 普通索引和唯一索引

现在假设我们在维护一个市民系统，每个人都有一个唯一的身份证号，而且通过业务代码保证不会写入两个重复的身份证号。如果市民系统需要按照身份证号查姓名，就会执行类似这样的SQL语句：

```sql
select name from CUser where id_card = 'xxxxxxxyyyyyyzzzzz';
```

如果要在id_card字段上创建索引，由于身份证号字段比较大，作为主键并不合适，那么可以给id_card字段创建唯一索引，也可以创建一个普通索引。如果业务代码已经保证了不会写入重复的身份证号，那么这两个选择逻辑上都是正确的，但在性能上有所差别。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211205224925.png" alt="image-20211205224925129" style="zoom:67%;" />

接下来，我们就从这两种索引对查询语句和更新语句的性能来进行分析。

### 查询过程

假设执行的查询语句是`select id from T where k = 5`，这个查询语句在索引树上的查找的过程，先是通过B+树从树根开始，按层搜索到叶子节点，也就是图中右下角的这个数据页，然后可以认为数据页内部通过二分法来定位记录。

- 对于普通索引来说，查找到满足条件的第一个记录（5，500）后，需要查找下一个记录，直到碰到第一个不满足k=5条件的记录
- 对于唯一索引来说，由于索引定义了唯一性，查找到第一个满足条件的记录后，就会停止继续检索

InnoDB的数据是按数据页为到位来读写的。也就是说，当需要读一条记录的时候，并不是将这个记录本身从磁盘读出来，而是以页为单位，将其整体读入内存。在InnoDB中，每个数据页的大小默认是16KB。由于引擎是按页读写的，所以说，当找到k=5的时候，它所在的数据页就都在内存里了，那么，对于普通索引来说，要多做的那一次“查找和判断下一条记录”的操作，就只需要一次指针寻找和一次计算。

当然，如果k=5这个记录刚好是这个数据页的最后一个记录，那么要取下一个记录，必须读取下一个数据页，这个操作会稍微复杂一些，不过，对于整型字段，一个数据页就可以放近千个key，因此出现这种情况的概率会很低，所以在计算平均性能差异的时候，仍可以认为这个操作成本对于现在的CPU来说可以忽略不计。

总而言之，对于查询的场景来说，唯一索引和普通索引并没有性能上的差距。

### 更新过程

为了说明普通索引和唯一索引对更新语句性能的影响，需要首先了解change buffer。

当需要更新一个数据页的时候，如果数据页在内存中就直接更新，而如果这个数据页还没有在内存中的话，在不影响数据一致性的前提下，InnoDB会将这些更新操作缓存在change buffer中，这样就不需要从磁盘中读入这个数据页了。在下次查询需要访问这个数据页的时候，将数据页读入内存，然后执行change buffer中与这个页有关的操作。通过这种方式就能保证这个数据逻辑的正确性。

需要说明的是，虽然名字叫做change buffer，实际上它是可以持久化的数据，也就是说，change buffer在内存中有拷贝，也会被写入到磁盘上。将change buffer中的操作应用到原数据页，得到最新结果的过程称为merge。除了访问这个数据页会触发merge外，系统有后台线程也会定期merge。在数据库正常关闭（shutdown）的过程中，也会执行merge操作。

显然，如果能够将更新操作先记录在change buffer，减少读磁盘，语句的执行速度会得到明显的提升。而且，数据读入内存是需要占用buffer pool的，所以这种方式还能避免占用内存，提高内存利用率。

那么，什么情况下会使用到change buffer呢？

对于唯一索引来说，所有的更新操作都要先判断这个操作是否违反唯一性约束。比如，要插入（4，400）这个记录，就要先判断现在表中是否已经存在k=4的记录，而这必须要将数据页读入内存才能判断。如果都已经读入到内存了，那直接更新内存会更快，就没必要使用change buffer了。

因此，唯一索引的更新就不能使用change buffer，实际上也只有普通索引可以使用。

change buffer用的是buffer pool里的内存，因此不能无线增大。change buffer的大小，可以通过参数`innodb_change_buffer_max_size`来动态设置。这个参数设置为50的时候，表示change buffer的大小最多只能占用buffer pool的50%。

理解了change buffer的机制，我们再来看看如果要在这张表中插入一个新记录（4，400）的话，InnoDB的处理流程。

第一种情况是，这个记录要更新的目标在内存中，这时，InnoDB的处理流程如下：

- 对于唯一索引来说，需要将数据页读入内存，判断到没有冲突，插入这个值，语句执行结束
- 对于普通索引来说，则是将更新记录在change buffer，语句执行就结束了

将数据从磁盘读入内存涉及随机IO的访问，是数据库里面成本最高的操作之一。change buffer因为减少了随机磁盘访问，所以对更新性能的提升是会很明显的。

### change buffer详解

上文我们说过，change buffer只限于用在普通索引的场景下，而是不适用于唯一索引，那么普通索引的所有场景，使用change buffer都可以起到加速的作用吗？

由于merge的时候是真正进行数据更新的时刻，而change buffer的主要目的就是将记录的变更动作缓存下来，所以在一个数据页做merge之前，change buffer的记录变更越多（也就是这个页面上要更新的次数越多），收益就越大。因此对于写多读少的业务来说，页面在写完以后马上被访问到的概率比较小，此时change buffer的使用效果最好。这种业务模型常见的就是账单类、日志类的系统。反过来，假设一个业务的更新模式是写入之后马上会做查询，那么即使满足了条件，将更新先记录在change buffer，但之后由于马上要访问这个数据页，会立即触发merge过程。这样随机访问IO的次数不会减少，反而增加了change buffer的维护代价。所以，对于这种业务模式来说，change buffer反而起到了副作用。

此时我们再来分析普通索引和唯一索引选择的问题。这两类索引在查询能力上没有差别，主要是对更新性能的影响，因此，尽量选择普通索引。如果所有的更新后面，都马上伴随着对这个记录的查询，那么应该关闭change buffer，而在其它情况下change buffer都能提升更新性能。

### change buffer和redo log

change buffer和redo log是两个比较容易混淆的概念，接下来我们通过实例来说明它们之间的区别，先插入两条数据：

```sql
INSERT INTO t (id, k) VALUES (id1, k1), (id2, k2);
```

这里，我们假设当前k索引树的状态，查找到位置后，k1所在的数据页在内存（InnoDB buffer pool）中，k2所在的数据页不在内存中。下图所示是带change buffer的更新状态图：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211206231723.png" alt="image-20211206231723229" style="zoom:67%;" />

这条更新语句，共涉及了四个部分：内存、redo log（ib_log_fileX）、数据表空间（t.ibd）、系统表空间（ibdata1）。

这条更新语句做了如下操作：

1. Page1在内存中，直接更新内存
2. Page2没有在内存中，就在内存中change buffer区域，记录下“我要往Page插入一行”这个信息
3. 将上述两个动作记入redo log（图中3和4）

做完上面这些，事务就可以完成了，不难看出，执行这条更新语句的成本很低，就是写了两处内存，然后写了一处磁盘（两次操作合在一起写了一次磁盘），而且还是顺序写的，同时，图中的两个虚线箭头，是后台操作，不影响更新的响应时间。

完成上述操作之后，假设要执行`select * from t where k in(k1, k2)`，执行的流程图如下：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211206235019.png" alt="image-20211206235019581" style="zoom:67%;" />

从图中可以看到：

- 读Page1的时候，直接从内存返回
- 要读Page2的时候，需要把Page2从磁盘读入内存中，然后应用change buffer里面的操作日志，生成一个正确的版本并返回结果

可以看到，直到需要读Page2的时候，这个数据页才会被读入内存，所以要简单地对比这两个机制在提升性能上地收益的话，redo log主要节省的是随机写磁盘的IO消耗（转成顺序写），而change buffer主要节省的则是随机读磁盘的IO消耗。



## 索引的选择

MySQL中一张表可以支持多个索引，并且使用哪个索引是由MySQL来确定的，不过在某些场景下，MySQL可能会选错索引，从而导致执行速度变得很慢。

首先先建一张表，表里有a、b两个字段，并分别建立索引：

```sql
CREATE TABLE `t` (
  `id` int(11) NOT NULL, 
  `a` int(11) DEFAULT NULL, 
  `b` int(11) DEFAULT NULL, 
  PRIMARY KEY (`id`), 
  KEY `a` (`a`), 
  KEY `b` (`b`)
) ENGINE = InnoDB ；
```

然后执行如下SQL语句：

```sql
select * from t where a between 10000 and 20000;
```

通过explain命令可以这条语句执行的情况：

![image-20211211165917452](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211165917.png)

我们在字段‘a’上建立了普通索引，从分析的结果来看，优化器也选择了索引a，但实际上并没有这么简单，假设这张表上包含了10万行的数据，然后做如下操作：

![image-20211211170335749](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211170335.png)

session A开启一个事务，然后，seesion B把数据都删除后，又调用idata这个存储过程，插入了10万行数据。这时候，session B的查询语句`select * from where a between 10000 and 20000`就不会再选择索引a了。我们可以通过慢查询日志（show log）来查看以下具体的执行情况。为了说明优化器选择的结果是否正确，这里使用了`force index(a)`来让优化器强制使用索引a。

```sql
set long_query_time=0;
select * from t where a between 10000 and 20000; /*Q1*/
select * from t force index(a) where a between 10000 and 20000;/*Q2*/
```

- 第一句是将查询日志的阈值设置为0，表示这个线程接下来的语句都会被记录入慢查询日志中
- 第二句，Q1是session B原来的查询
- 第三句，Q2是加了force index(a)来和session B原来的查询语句执行情况对比

这三条SQL语句执行完成后的慢查询日志如下：

![image-20211211171316832](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211171316.png)

可以看到，Q1扫描了10万行，显然是走了全表扫描，执行时间是40毫秒。Q2扫描了10001行，执行了21毫秒。也就是说，我们在没有使用force index的时候，MySQL用错了索引，导致了更长的执行时间，要理解这个现象，就必须了解优化器选择索引的策略。

### 优化器逻辑

优化器选择索引的目的，是找到一个最优的执行方案，并用最小的代价去执行语句。在数据库里面，扫描行数是影响执行代价的因素之一。扫描的行数越少，意味着访问磁盘数据的次数越小，消耗的CPU资源越少。除此之外，优化器还会结合是否使用临时表、是否排序等因素进行综合判断，由于这个查询语句并没有涉及到临时表和排序，所以MySQL选错索引肯定是在判断扫描行数的时候出现了问题。

MySQL在真正开始执行语句之前，并不能精确地知道满足这个条件的记录有多少条，而只能根据统计信息来估算记录数，这个统计信息就是索引的“区分度”。显然，一个索引上不同的值越多，这个索引的区分度就越好，而一个索引上不同的值的个数，我们称之为“基数（cardinality）”。也就是说，这个基数越大，索引的区分度就越好。

我们可以使用`show index`方法，看到一个索引的基数，如下图所示：

![image-20211211172622989](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211172623.png)

可以看到，虽然这个表的每一行的三个字段值都是一样的，但是在统计信息中，这三个索引的基数值并不同，而且其实都不准确。

MySQL会通过采样统计的方式来得到索引的基数，采用采样统计的原因主要是，如果把整张表取出来一行行统计，然后可以得到精确的结果，但是代价太高了，所以只能选择“采样统计”。

采样统计的时候，InnoDB默认会选择N个数据页，统计这些页面上的不同值，得到一个平均值，然后乘以这个索引的页面数，就得到了这个索引的基数。而数据表是会持续更新的，索引统计信息也不会固定不变，所以当变更的数据行超过1/M的时候，会自动触发重新做一次索引统计。

在MySQL中，有两种存储索引统计的方式，可以通过设置参数`innodb_stats_persistent`的值来选择：

- 设置为no的时候，表示统计信息会持久化存储，这时，默认的N是20，M是10
- 设置为off的时候，表示统计信息只存储在内存中，这时，默认的N是8，M是16

<div class="note info"><p>由于是采样统计，所以不管是N是20还是8，这个基数都是很容易不准的。</p></div>

MySQL的优化器除了会统计索引的基数，还会判断这个语句本身要扫描的行数，可以通过`explain`的rows列来查看：

![image-20211211174403746](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211174403.png)

可以看到，Q2的rows的值是37116，与实际的10000相差较大，这里实际上存在两个问题，一是语句Q1优化器为什么没有选择索引‘a’，二是语句Q2为什么优化器没有选择37116行的执行计划，而是选择扫描行数是100000的执行计划，

对于问题二，如果使用索引a，每次从索引a上拿到一个值，都要回到主键索引上查出整行的数据，而如果选择扫描10万行，是直接在主键索引上扫描的，没有额外的代价，优化器会估算这两个选择的代价，虽然从执行时间上来看，这个选择并不是最优的。

使用普通索引需要把回表的代价算进去，所以，MySQL选错索引，最根本的原因是没有能准确地判断出扫描行数，我们可以使用`analyze table t`命令，可以用来重新统计索引信息，我们来看一下执行效果。

![image-20211211180509121](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211194056.png)

如果explain的结果预估的rows的值跟实际情况差距比较大，都可以采用这个方法来处理。

依然基于表t，执行另外一个语句：

```sql
select * from t where (a between 1 and 1000) and (b between 50000 and 100000) order b limit 1;
```

从查询条件来看，这个查询没有符合条件的记录，因此将会返回空集合。为了方便理解这条语句的索引选择过程，首先来看一下a、b这两个索引的结构图：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211194001.png" alt="image-20211211181122391" style="zoom:67%;" />

如果使用索引a进行查询，首先扫描索引a的前1000个值，然后取到对应的id，再到主键索引上去查出每一行，然后根据字段b来过滤，显然这样需要扫描1000行。如果使用索引b进行查询，首先扫描索引b的最后50001个值，然后取到对应的id，再回到主键索引上取值再判断，所以需要扫描50001行。显然，使用索引a，执行速度明显会快很多，我们来看看MySQL是如何选择的：

![image-20211211181647822](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211193956.png)

可以看到，返回结果中key字段显式，这次优化器选择了索引b，而rows字段显式需要扫描的行数是50198。也就是说，扫描的行数的估计值依然不准确，并且MySQL又选错了索引。

### 索引选择异常和处理

当碰到优化器选择索引错误的时候，我们应该如何处理呢？

一种方法是，就像我们的第一个例子一样，采用force index强行选择一个索引。MySQL会根据词法解析的结果分析出可能可以使用的索引作为候选项，然后在候选列表中依次判断每个索引需要扫描多少行。如果force index指定的索引在候选索引列表中，就直接选择这个索引，不会再评估其它索引的执行代价了，执行的效果如下：

![image-20211211195432111](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211195432.png)

原本语句需要执行2.23秒，而使用force index（a）的时候，只用了0.05秒，比优化器的选择快了40多倍。但这种方法并不完美，一是这么写不足够优雅，二是如果索引改了名字，这个语句也需要同步修改，三是这个语法并不是所有的数据库都支持，迁移比较麻烦。

既然优化器放弃了使用索引a，说明a还不够合适，所以第二种方法就是，修改语句，引导MySQL使用我们期望的索引。比如，在这个例子中，显然把“order by b limit 1”改成“order by b，a limit 1”，语义的逻辑是相同的，我们看一下修改之后的效果：

![image-20211211200251618](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211200251.png)

之前优化器选择使用索引b，是因为它认为使用索引b可以避免排序（b本身是索引，已经是有序的了，如果选择索引b的话，不需要再做排序，只需要遍历），所以即使扫描的行数多，也判定为代价更小。将语句修改为order by b，a，要求按照b，a排序，就意味着使用这两个索引都需要排序。因此，扫描行数成了影响决策的主要条件，于是此时优化器选了只需要扫描1000行的索引a。

当然，这种修改并不是通用的优化手段，只是刚好在这个语句中有limit 1，因此如果有满足条件的记录，order by b limit 1和order by b，a limit 1都会返回b是最小的那一行，逻辑上一致，才可以这么做，除了这种做法，还可以将语句修改为：

```sql
select * from (select * from t where (a between 1 and 1000) and (b between 50000 and 100) order by b limit 100) alias limit 1;
```

执行的效果如下：

![image-20211211201036594](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211201036.png)

在这个例子中，我们用limit 100让优化器意识到，使用b索引的代价是很高的，其实是我们根据数据特征诱导了一下优化器，也不具备通用性。

第三种方法是，在有些场景下，我们可以新建一个更合适的索引，来提供给优化器做选择，或删掉误用的索引。不过在这个例子中，这种方法并不适用。

## 字符串添加索引

在业务开发中，我们经常会碰到要存储字符串的场景，例如邮箱、用户名等，那么如何给字符串添加合适的索引呢？

假设，现在有一个支持邮箱登录的系统，用户表是这么定义的：

```sql
CREATE TABLE SUser (
	ID bigint UNSIGNED PRIMARY KEY,
	email varchar(64),
    ...
) ENGINE = innodb;
```

如果要使用邮箱登录，那么业务代码中一定会出现类似这样的语句：

```sql
select f1, f2 from SUser where email = 'xxx';
```

### 前缀索引

如果email这个字段上没有索引，那么这个语句就只能全表扫描。在MySQL中是支持前缀索引的，也就是说，可以定义字符串的一部分作为索引，如果创建索引的语句不指定前缀长度，那么索引就会包含整个字符串。

比如，这两个在email字段上创建索引的语句：

```sql
alter table SUser add index index1(email);
或
alter table SUser add index index2(email(6));
```

第一个语句创建的index1索引里面，包含了每个记录的整个字符串，而第二个语句创建的index2索引里面，对于每个记录都是只取前6个字节，它们的示意图如下所示：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211208225514.png" alt="image-20211208225514256" style="zoom:67%;" />

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211208225549.png" alt="image-20211208225549732" style="zoom:67%;" />

从图中可以看到，由于email(6)这个索引结构中每个邮箱的字段都只取6个字节（即：zhangs），索引占用的空间会更小，这就是使用前缀索引的优势，但同时，前缀索引也可能会增加额外的记录扫描次数，通过它们的执行过程能更加清楚看到这一点。

如果使用的是index1（即email整个字符串的索引结构），执行顺序如下：

1. 从index1索引树找到满足索引值是'zhangssxyz@xxx.com'的这条记录，取得ID2的值
2. 到主键上查找到主键值是ID2的行，判断email的值是正确的，将这行记录加入结果集
3. 取index1索引树上刚刚查到的位置的下一条记录，发现已经不满足email='zhangssxyz@xxx.com'的条件了，循环结束

在整个过程中，只需要回主键索引取一次数据，所以系统认为只扫描了一行。

如果使用的是index2（即email（6）索引结构），执行顺序如下：

1. 从index2索引树找到满足索引值是'zhangs'的记录，找到的第一个是ID1
2. 到主键查找到主键是ID1的行，判断出email的值不是'zhangssxyz@xxx.com'，这行记录丢弃
3. 取index2上刚刚查到的位置的下一条记录，发现仍然是'zhangs'，取出ID2，再到ID索引上取整行然后判断，这次值取对了，将这行记录加入结果集
4. 重复上一步，直到在index2上取到的值不是'zhangs'时，循环结束

在这个过程中，要回主键索引取4次数据，也就是扫描了4行。

通过以上两种情况的对比，可以发现，使用前缀索引后，可能会导致查询语句读数据的次数变多，但是对于这个查询语句来说，如果定义的index2不是email(6)而是email(7)，也就是说取email字段的前7个字节来构建索引的话，即满足前缀'zhangss'的记录只有一个，也能够直接查到ID2，只扫描这一行就结束了。

<div class="note info"><p>这说明在使用前缀索引的时候，定义合理的长度，就可以做到既节省空间，又不用额外增加太多的查询成本。</p></div>

我们可以通过统计索引上有多少个不同的值来判断需要使用多长的前缀，首先计算这个列上有多少个不同的值：

```sql
select count(distinct email) as L from SUser;
```

然后，依次选取不同长度的前缀来看这个值，比如我们要看一下4~7个字节的前缀索引：

```sql
select
count(distinct left(email,4) ） as L4,
count(distinct left(email,5) ） as L5,
count(distinct left(email,6) ） as L6,
count(distinct left(email,7) ） as L7,
from SUser;
```

前缀索引很可能会损失区分度，所以需要预先设定一个可以接受的损失比例，比如5%，然后在返回的L4~L7中，找出不小于L*95%的值，假设这里L6、L7都满足，就可以选择前缀长度为6。

### 前缀索引与覆盖索引

前缀索引除了可能会增加扫描行数，影响到性能外，还可能会导致覆盖索引失效。

假设我们要查询的语句如下：

```sql
select id,email from SUser where email='zhangssxyz@xxx.com';
```

与前面的例子中的SQL语句：

```sql
select id,name,email from SUser where email='zhangssxyz@xxx.com';
```

相比，这个语句只要求返回id和email字段，所以，如果使用index1（即整个email字符串的索引结构）的话，可以利用覆盖索引，从index1查到结果后直接就返回了，不需要回到ID索引再查一次。而如果使用index2（即email（6）所索引结构）的话，就不得不回到ID索引再去判断email字段的值。

即使将index2的定义修改为email（18）的前缀索引，这时候，虽然index2已经包含了所有的信息，但InnoDB还是要回到id索引再查一下，因为系统并不确定前缀索引的定义是否截断了完整信息。也就是说前缀索引就用不上覆盖索引对查询性能的优化了，这也是在选择是否使用前缀索引时需要考虑的一个因素。

### 其它方式

实际场景中，我们很有可能碰到前缀的区分度不够好的情况，例如身份证号，总共18位，其中前6位是地址码，所以同一个县的人的身份证号前6位一般会是相同的。假设维护的数据库是同一个市的公民信息系统，这时候如果对身份证号长度为6的前缀索引的话，这个索引的区分度就非常低了，需要创建长度为12位以上的前缀索引，才能够满足区分度的要求，但是索引选取的越长，占用的磁盘空间就越大，相同的数据页能放下的索引值就越少，搜索的效率也就会越低。解决这个问题通常来说有两种方式：倒序存储和使用哈希字段。

倒序存储是指如果存储身份证号码的时候把它倒过来存，每次查询的时候，可以：

```sql
select field_list from t where id_card = reverse('input_id_card_string');
```

由于身份证号码的最后6位没有地址码这样的重复逻辑，所以最后这6位就提供了足够的区分度，实践中可以使用count(distinct)方法做个验证。

使用哈希字段指的是可以在表上创建一个整数字段，来保存身份证的校验码，同时在这个字段上创建索引：

```sql
alter table t add id_card_crc int unsigned, add index(id_card_crc);
```

然后每次插入新记录的时候，都同时用cr32（）这个函数得到校验码填到这个新字段。由于校验码可能存在冲突，也就是说两个不同的身份证通过crc32（）函数得到的结果可能是相同的，所以查询语句where部分要判断id_card的值是否精确相同。这样一来，索引的长度变成了4个字节，比原来小了很多。

使用倒序存储和使用哈希字段两种方式的异同点如下：

首先，它们的相同点是，都不支持范围查询。倒序存储的字段上创建的索引是按照倒序字符串的方式排序的，已经没有办法利用索引方式查出身份证号码在[ID_X,ID_Y]的所有市民了。同样地，哈希字段的方式也只能支持等值查询。

它们的区别，主要在以下三个方面：

1. 从占用的额外空间来看，倒序存储方式在主键索引上，不会消耗额外的存储空间，而哈希字段方法需要增加一个字段。当然，倒序存储方式使用4个字节的前缀长度应该是不够的，如果再长一点，这个消耗跟额外这个哈希字段也差不多抵消了
2. 在CPU消耗方面，倒序方式每次写和读的时候，都需要额外调用一次reverse函数，而哈希字段的方式需要额外调用一次crc32()函数，如果只是从这两个函数的计算复杂度来看的话，reverse函数额外消耗的CPU的资源会更小一些
3. 从查询效率上看，使用哈希字段方式的查询性能相对更稳定一些，因为crc32（）算出来的值虽然有冲突的概率，但是概率非常小，可以认为每次查询的平均扫描行数接近1。而倒序存储方式毕竟还是用的前缀索引的方式，也就是说还是会增加扫描行数

## order by与索引

在开发应用的时候，一定碰到过需要根据指定的字段排序来显示结果的需求，还是以我们前面举例用过的市民表为例，假设要查询城市是“杭州”的所有人的名字，并且按照姓名排序返回前1000个人的姓名、年龄。

建表语句如下：

```sql
CREATE TABLE `t` (
  `id` int(11) NOT NULL, 
  `city` varchar(16) NOT NULL, 
  `name` varchar(16) NOT NULL, 
  `age` int(11) NOT NULL, 
  `addr` varchar(128) DEFAULT NULL, 
  PRIMARY KEY (`id`), 
  KEY `city` (`city`)
) ENGINE = InnoDB;
```

那么查询语句：

```sql
select city,name,age from t where city=' 杭州 ' order by name limit 1000;
```

### 全字段排序

为了避免全表扫描，我们需要在city字段加上索引，city这个索引的示意图如下：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211222605.png" alt="image-20211211222605665" style="zoom:67%;" />

在city字段上创建索引之后，使用explain查看执行情况：

![image-20211211222422522](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211222422.png)

Extra这个字段中的“Using filesort”表示就是需要排序，MySQL会给每个线程分配一块内存用于排序，称为sort_buffer。

从图中可以看出， city=' 杭州 ’ 条件的行，是从 ID_X 到 ID_(X+N) 的这些记录。下面我们来分析整个语句的执行过程：

- 

### rowid排序

### 全字段排序和rowid排序对比



## 索引的创建时机

前面我们了解了一些关于索引的理论知识，接下来我们着重了解一些索引的实践部分。

### 哪些情况需要建索引

- 主键自动建立主键索引（唯一 + 非空）。
- 频繁作为查询条件的字段应该创建索引。
- 查询中与其他表关联的字段，外键关系建立索引。
- 查询中排序的字段，排序字段若通过索引去访问将大大提高排序速度。
- 查询中统计或者分组字段（group by也和索引有关）。

### 那些情况不要建索引

- 记录太少的表。
- 经常增删改的表。
- 频繁更新的字段不适合创建索引。
- Where条件里用不到的字段不创建索引。
- 假如一个表有10万行记录，有一个字段A只有true和false两种值，并且每个值的分布概率大约为50%，那么对A字段建索引一般不会提高数据库的查询速度。索引的选择性是指索引列中不同值的数目与表中记录数的比。如果一个表中有2000条记录，表索引列有1980个不同的值，那么这个索引的选择性就是1980/2000=0.99。一个索引的选择性越接近于1，这个索引的效率就越高。

## 索引的最佳实践

### 单表索引分析

> 数据准备

```sql
DROP TABLE IF EXISTS `article`;

CREATE TABLE IF NOT EXISTS `article`(
`id` INT(10) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
`author_id` INT(10) UNSIGNED NOT NULL COMMENT '作者id',
`category_id` INT(10) UNSIGNED NOT NULL COMMENT '分类id',
`views` INT(10) UNSIGNED NOT NULL COMMENT '被查看的次数',
`comments` INT(10) UNSIGNED NOT NULL COMMENT '回帖的备注',
`title` VARCHAR(255) NOT NULL COMMENT '标题',
`content` VARCHAR(255) NOT NULL COMMENT '正文内容'
) COMMENT '文章';

INSERT INTO `article`(`author_id`, `category_id`, `views`, `comments`, `title`, `content`) VALUES(1,1,1,1,'1','1');
INSERT INTO `article`(`author_id`, `category_id`, `views`, `comments`, `title`, `content`) VALUES(2,2,2,2,'2','2');
INSERT INTO `article`(`author_id`, `category_id`, `views`, `comments`, `title`, `content`) VALUES(3,3,3,3,'3','3');
INSERT INTO `article`(`author_id`, `category_id`, `views`, `comments`, `title`, `content`) VALUES(1,1,3,3,'3','3');
INSERT INTO `article`(`author_id`, `category_id`, `views`, `comments`, `title`, `content`) VALUES(1,1,4,4,'4','4');
```



> 案例：查询`category_id`为1且`comments`大于1的情况下，`views`最多的`article_id`。

1、编写SQL语句并查看SQL执行计划。

```shell
# 1、sql语句
SELECT id,author_id FROM article WHERE category_id = 1 AND comments > 1 ORDER BY views DESC LIMIT 1;

# 2、sql执行计划
mysql> EXPLAIN SELECT id,author_id FROM article WHERE category_id = 1 AND comments > 1 ORDER BY views DESC LIMIT 1\G
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: article
   partitions: NULL
         type: ALL
possible_keys: NULL
          key: NULL
      key_len: NULL
          ref: NULL
         rows: 5
     filtered: 20.00
        Extra: Using where; Using filesort  # 产生了文件内排序，需要优化SQL
1 row in set, 1 warning (0.00 sec)
```

2、创建索引`idx_article_ccv`。

```sql
CREATE INDEX idx_article_ccv ON article(category_id,comments,views);
```

3、查看当前索引。

![show index](https://img-blog.csdnimg.cn/20200803134154162.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1JyaW5nb18=,size_16,color_FFFFFF,t_70)

4、查看现在SQL语句的执行计划。

![explain](https://img-blog.csdnimg.cn/20200803134549914.png)

我们发现，创建符合索引`idx_article_ccv`之后，虽然解决了全表扫描的问题，但是在`order by`排序的时候没有用到索引，MySQL居然还是用的`Using filesort`，为什么？

5、我们试试把SQL修改为`SELECT id,author_id FROM article WHERE category_id = 1 AND comments = 1 ORDER BY views DESC LIMIT 1;`看看SQL的执行计划。

![explain](https://img-blog.csdnimg.cn/20200803135228945.png)

推论：当`comments > 1`的时候`order by`排序`views`字段索引就用不上，但是当`comments = 1`的时候`order by`排序`views`字段索引就可以用上！！！**所以，范围之后的索引会失效。**

6、我们现在知道**范围之后的索引会失效**，原来的索引`idx_article_ccv`最后一个字段`views`会失效，那么我们如果删除这个索引，创建`idx_article_cv`索引呢？？？？

```sql
/* 创建索引 idx_article_cv */
CREATE INDEX idx_article_cv ON article(category_id,views);
```

查看当前的索引

![show index](https://img-blog.csdnimg.cn/20200803140542912.png)

7、当前索引是`idx_article_cv`，来看一下SQL执行计划。

![explain](https://img-blog.csdnimg.cn/20200803140951803.png)

### 两表索引分析

> 数据准备

```sql
DROP TABLE IF EXISTS `class`;
DROP TABLE IF EXISTS `book`;

CREATE TABLE IF NOT EXISTS `class`(
`id` INT(10) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
`card` INT(10) UNSIGNED NOT NULL COMMENT '分类' 
) COMMENT '商品类别';

CREATE TABLE IF NOT EXISTS `book`(
`bookid` INT(10) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
`card` INT(10) UNSIGNED NOT NULL COMMENT '分类'
) COMMENT '书籍';
```

> 两表连接查询的SQL执行计划

1、不创建索引的情况下，SQL的执行计划。

![explain](https://img-blog.csdnimg.cn/20200803143557187.png)

`book`和`class`两张表都是没有使用索引，全表扫描，那么如果进行优化，索引是创建在`book`表还是创建在`class`表呢？下面进行大胆的尝试！

2、左表(`book`表)创建索引。

创建索引`idx_book_card`

```sql
/* 在book表创建索引 */
CREATE INDEX idx_book_card ON book(card);
```

在`book`表中有`idx_book_card`索引的情况下，查看SQL执行计划

![explain](https://img-blog.csdnimg.cn/20200803144429349.png)



3、删除`book`表的索引，右表(`class`表)创建索引。

创建索引`idx_class_card`

```sql
/* 在class表创建索引 */
CREATE INDEX idx_class_card ON class(card);
```

在`class`表中有`idx_class_card`索引的情况下，查看SQL执行计划

![explain](https://img-blog.csdnimg.cn/20200803145030597.png)

**由此可见，左连接将索引创建在右表上更合适，右连接将索引创建在左表上更合适。**

### 三张表索引分析

> 数据准备

```sql
DROP TABLE IF EXISTS `phone`;

CREATE TABLE IF NOT EXISTS `phone`(
`phone_id` INT(10) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
`card` INT(10) UNSIGNED NOT NULL COMMENT '分类' 
) COMMENT '手机';
```

> 三表连接查询SQL优化

1、不加任何索引，查看SQL执行计划。

![explain](https://img-blog.csdnimg.cn/20200803160631786.png)



2、根据两表查询优化的经验，左连接需要在右表上添加索引，所以尝试在`book`表和`phone`表上添加索引。

```sql
/* 在book表创建索引 */
CREATE INDEX idx_book_card ON book(card);

/* 在phone表上创建索引 */
CREATE INDEX idx_phone_card ON phone(card);
```

再次执行SQL的执行计划

![explain](https://img-blog.csdnimg.cn/20200803161013880.png)

### 结论

`JOIN`语句的优化：

- 尽可能减少`JOIN`语句中的`NestedLoop`（嵌套循环）的总次数：**永远都是小的结果集驱动大的结果集**。
- 优先优化`NestedLoop`的内层循环。
- 保证`JOIN`语句中被驱动表上`JOIN`条件字段已经被索引。
- 当无法保证被驱动表的`JOIN`条件字段被索引且内存资源充足的前提下，不要太吝惜`Join Buffer` 的设置。

## 索引失效

> 数据准备

```sql
CREATE TABLE `staffs`(
`id` INT(10) PRIMARY KEY AUTO_INCREMENT,
`name` VARCHAR(24) NOT NULL DEFAULT '' COMMENT '姓名',
`age` INT(10) NOT NULL DEFAULT 0 COMMENT '年龄',
`pos` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '职位',
`add_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入职时间'
)COMMENT '员工记录表';

INSERT INTO `staffs`(`name`,`age`,`pos`) VALUES('Ringo', 18, 'manager');
INSERT INTO `staffs`(`name`,`age`,`pos`) VALUES('张三', 20, 'dev');
INSERT INTO `staffs`(`name`,`age`,`pos`) VALUES('李四', 21, 'dev');

/* 创建索引 */
CREATE INDEX idx_staffs_name_age_pos ON `staffs`(`name`,`age`,`pos`);
```

### 索引失效的场景

- 全值匹配我最爱。
- 最佳左前缀法则。
- 不在索引列上做任何操作（计算、函数、(自动or手动)类型转换），会导致索引失效而转向全表扫描。
- 索引中范围条件右边的字段会全部失效。
- 尽量使用覆盖索引（只访问索引的查询，索引列和查询列一致），减少`SELECT *`。
- MySQL在使用`!=`或者`<>`的时候无法使用索引会导致全表扫描。
- `is null`、`is not null`也无法使用索引。
- `like`以通配符开头`%abc`索引失效会变成全表扫描（使用覆盖索引就不会全表扫描了）。
- 字符串不加单引号索引失效。
- 少用`or`，用它来连接时会索引失效。

#### 最佳左前缀法则

> 案例

```sql
/* 用到了idx_staffs_name_age_pos索引中的name字段 */
EXPLAIN SELECT * FROM `staffs` WHERE `name` = 'Ringo';

/* 用到了idx_staffs_name_age_pos索引中的name, age字段 */
EXPLAIN SELECT * FROM `staffs` WHERE `name` = 'Ringo' AND `age` = 18;

/* 用到了idx_staffs_name_age_pos索引中的name，age，pos字段 这是属于全值匹配的情况！！！*/
EXPLAIN SELECT * FROM `staffs` WHERE `name` = 'Ringo' AND `age` = 18 AND `pos` = 'manager';

/* 索引没用上，ALL全表扫描 */
EXPLAIN SELECT * FROM `staffs` WHERE `age` = 18 AND `pos` = 'manager';

/* 索引没用上，ALL全表扫描 */
EXPLAIN SELECT * FROM `staffs` WHERE `pos` = 'manager';

/* 用到了idx_staffs_name_age_pos索引中的name字段，pos字段索引失效 */
EXPLAIN SELECT * FROM `staffs` WHERE `name` = 'Ringo' AND `pos` = 'manager';
```

> 概念

**最佳左前缀法则：如果索引是多字段的复合索引，要遵守最佳左前缀法则。指的是查询从索引的最左前列开始并且不跳过索引中的字段。**



**口诀：带头大哥不能死，中间兄弟不能断。**



#### 索引列上不计算

> 案例

```shell
# 现在要查询`name` = 'Ringo'的记录下面有两种方式来查询！

# 1、直接使用 字段 = 值的方式来计算
mysql> SELECT * FROM `staffs` WHERE `name` = 'Ringo';
+----+-------+-----+---------+---------------------+
| id | name  | age | pos     | add_time            |
+----+-------+-----+---------+---------------------+
|  1 | Ringo |  18 | manager | 2020-08-03 08:30:39 |
+----+-------+-----+---------+---------------------+
1 row in set (0.00 sec)

# 2、使用MySQL内置的函数
mysql> SELECT * FROM `staffs` WHERE LEFT(`name`, 5) = 'Ringo';
+----+-------+-----+---------+---------------------+
| id | name  | age | pos     | add_time            |
+----+-------+-----+---------+---------------------+
|  1 | Ringo |  18 | manager | 2020-08-03 08:30:39 |
+----+-------+-----+---------+---------------------+
1 row in set (0.00 sec)
```

我们发现以上两条SQL的执行结果都是一样的，但是执行效率有没有差距呢？？？

通过分析两条SQL的执行计划来分析性能。

![explain](https://img-blog.csdnimg.cn/20200803171857325.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1JyaW5nb18=,size_16,color_FFFFFF,t_70)

**由此可见，在索引列上进行计算，会使索引失效。**



**口诀：索引列上不计算。**



#### 范围之后全失效

> 案例

```sql
/* 用到了idx_staffs_name_age_pos索引中的name，age，pos字段 这是属于全值匹配的情况！！！*/
EXPLAIN SELECT * FROM `staffs` WHERE `name` = 'Ringo' AND `age` = 18 AND `pos` = 'manager';


/* 用到了idx_staffs_name_age_pos索引中的name，age字段，pos字段索引失效 */
EXPLAIN SELECT * FROM `staffs` WHERE `name` = '张三' AND `age` > 18 AND `pos` = 'dev';
```

查看上述SQL的执行计划

![explain](https://img-blog.csdnimg.cn/20200803173357787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1JyaW5nb18=,size_16,color_FFFFFF,t_70)

**由此可知，查询范围的字段使用到了索引，但是范围之后的索引字段会失效。**



**口诀：范围之后全失效。**



#### 覆盖索引尽量用

在写SQL的不要使用`SELECT *`，用什么字段就查询什么字段。

```sql
/* 没有用到覆盖索引 */
EXPLAIN SELECT * FROM `staffs` WHERE `name` = 'Ringo' AND `age` = 18 AND `pos` = 'manager';

/* 用到了覆盖索引 */
EXPLAIN SELECT `name`, `age`, `pos` FROM `staffs` WHERE `name` = 'Ringo' AND `age` = 18 AND `pos` = 'manager';
```

![使用覆盖索引](https://img-blog.csdnimg.cn/20200803213031893.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1JyaW5nb18=,size_16,color_FFFFFF,t_70)



**口诀：查询一定不用`*`**。



#### 不等有时会失效

```sql
/* 会使用到覆盖索引 */
EXPLAIN SELECT `name`, `age`, `pos` FROM `staffs` WHERE `name` != 'Ringo';

/* 索引失效 全表扫描 */
EXPLAIN SELECT * FROM `staffs` WHERE `name` != 'Ringo';
```



#### like百分加右边

```sql
/* 索引失效 全表扫描 */
EXPLAIN SELECT * FROM `staffs` WHERE `name` LIKE '%ing%';

/* 索引失效 全表扫描 */
EXPLAIN SELECT * FROM `staffs` WHERE `name` LIKE '%ing';

/* 使用索引范围查询 */
EXPLAIN SELECT * FROM `staffs` WHERE `name` LIKE 'Rin%';
```

**口诀：`like`百分加右边。**



如果一定要使用`%like`，而且还要保证索引不失效，那么使用覆盖索引来编写SQL。

```sql
/* 使用到了覆盖索引 */
EXPLAIN SELECT `id` FROM `staffs` WHERE `name` LIKE '%in%';

/* 使用到了覆盖索引 */
EXPLAIN SELECT `name` FROM `staffs` WHERE `name` LIKE '%in%';

/* 使用到了覆盖索引 */
EXPLAIN SELECT `age` FROM `staffs` WHERE `name` LIKE '%in%';

/* 使用到了覆盖索引 */
EXPLAIN SELECT `pos` FROM `staffs` WHERE `name` LIKE '%in%';

/* 使用到了覆盖索引 */
EXPLAIN SELECT `id`, `name` FROM `staffs` WHERE `name` LIKE '%in%';

/* 使用到了覆盖索引 */
EXPLAIN SELECT `id`, `age` FROM `staffs` WHERE `name` LIKE '%in%';

/* 使用到了覆盖索引 */
EXPLAIN SELECT `id`,`name`, `age`, `pos` FROM `staffs` WHERE `name` LIKE '%in';

/* 使用到了覆盖索引 */
EXPLAIN SELECT `id`, `name` FROM `staffs` WHERE `pos` LIKE '%na';

/* 索引失效 全表扫描 */
EXPLAIN SELECT `name`, `age`, `pos`, `add_time` FROM `staffs` WHERE `name` LIKE '%in';
```

![模糊查询百分号一定加前边](https://img-blog.csdnimg.cn/20200803220743206.png)



**口诀：覆盖索引保两边。**

#### 字符要加单引号

```sql
/* 使用到了覆盖索引 */
EXPLAIN SELECT `id`, `name` FROM `staffs` WHERE `name` = 'Ringo';

/* 使用到了覆盖索引 */
EXPLAIN SELECT `id`, `name` FROM `staffs` WHERE `name` = 2000;

/* 索引失效 全表扫描 */
EXPLAIN SELECT * FROM `staffs` WHERE `name` = 2000;
```

这里name = 2000在MySQL中会发生强制类型转换，将数字转成字符串。



**口诀：字符要加单引号。**



#### 索引相关题目

**假设index(a,b,c)**

| Where语句                                               | 索引是否被使用                             |
| ------------------------------------------------------- | ------------------------------------------ |
| where a = 3                                             | Y，使用到a                                 |
| where a = 3 and b = 5                                   | Y，使用到a，b                              |
| where a = 3 and b = 5                                   | Y，使用到a，b，c                           |
| where b = 3 或者 where b = 3 and c = 4 或者 where c = 4 | N，没有用到a字段                           |
| where a = 3 and c = 5                                   | 使用到a，但是没有用到c，因为b断了          |
| where a = 3 and b > 4 and c = 5                         | 使用到a，b，但是没有用到c，因为c在范围之后 |
| where a = 3 and b like 'kk%' and c = 4                  | Y，a，b，c都用到                           |
| where a = 3 and b like '%kk' and c = 4                  | 只用到a                                    |
| where a = 3 and b like '%kk%' and c = 4                 | 只用到a                                    |
| where a = 3 and b like 'k%kk%' and c = 4                | Y，a，b，c都用到                           |



#### 面试题分析

> 数据准备

```sql
/* 创建表 */
CREATE TABLE `test03`(
`id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
`c1` CHAR(10),
`c2` CHAR(10),
`c3` CHAR(10),
`c4` CHAR(10),
`c5` CHAR(10)
);

/* 插入数据 */
INSERT INTO `test03`(`c1`,`c2`,`c3`,`c4`,`c5`) VALUES('a1','a2','a3','a4','a5');
INSERT INTO `test03`(`c1`,`c2`,`c3`,`c4`,`c5`) VALUES('b1','b22','b3','b4','b5');
INSERT INTO `test03`(`c1`,`c2`,`c3`,`c4`,`c5`) VALUES('c1','c2','c3','c4','c5');
INSERT INTO `test03`(`c1`,`c2`,`c3`,`c4`,`c5`) VALUES('d1','d2','d3','d4','d5');
INSERT INTO `test03`(`c1`,`c2`,`c3`,`c4`,`c5`) VALUES('e1','e2','e3','e4','e5');

/* 创建复合索引 */
CREATE INDEX idx_test03_c1234 ON `test03`(`c1`,`c2`,`c3`,`c4`);
```

> 题目

```sql
/* 最好索引怎么创建的，就怎么用，按照顺序使用，避免让MySQL再自己去翻译一次 */

/* 1.全值匹配 用到索引c1 c2 c3 c4全字段 */
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c2` = 'a2' AND `c3` = 'a3' AND `c4` = 'a4';

/* 2.用到索引c1 c2 c3 c4全字段 MySQL的查询优化器会优化SQL语句的顺序*/
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c2` = 'a2' AND `c4` = 'a4' AND `c3` = 'a3';

/* 3.用到索引c1 c2 c3 c4全字段 MySQL的查询优化器会优化SQL语句的顺序*/
EXPLAIN SELECT * FROM `test03` WHERE `c4` = 'a4' AND `c3` = 'a3' AND `c2` = 'a2' AND `c1` = 'a1';

/* 4.用到索引c1 c2 c3字段，c4字段失效，范围之后全失效 */
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c2` = 'a2' AND `c3` > 'a3' AND `c4` = 'a4';

/* 5.用到索引c1 c2 c3 c4全字段 MySQL的查询优化器会优化SQL语句的顺序*/
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c2` = 'a2' AND `c4` > 'a4' AND `c3` = 'a3';

/* 
   6.用到了索引c1 c2 c3三个字段, c1和c2两个字段用于查找,  c3字段用于排序了但是没有统计到key_len中，c4字段失效
*/
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c2` = 'a2' AND `c4` = 'a4' ORDER BY `c3`;

/* 7.用到了索引c1 c2 c3三个字段，c1和c2两个字段用于查找, c3字段用于排序了但是没有统计到key_len中*/
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c2` = 'a2' ORDER BY `c3`;

/* 
   8.用到了索引c1 c2两个字段，c4失效，c1和c2两个字段用于查找，c4字段排序产生了Using filesort说明排序没有用到c4字段 
*/
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c2` = 'a2' ORDER BY `c4`;

/* 9.用到了索引c1 c2 c3三个字段，c1用于查找，c2和c3用于排序 */
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c5` = 'a5' ORDER BY `c2`, `c3`;

/* 10.用到了c1一个字段，c1用于查找，c3和c2两个字段索引失效，产生了Using filesort */
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c5` = 'a5' ORDER BY `c3`, `c2`;

/* 11.用到了c1 c2 c3三个字段，c1 c2用于查找，c2 c3用于排序 */
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND  `c2` = 'a2' ORDER BY c2, c3;

/* 12.用到了c1 c2 c3三个字段，c1 c2用于查找，c2 c3用于排序 */
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND  `c2` = 'a2' AND `c5` = 'a5' ORDER BY c2, c3;

/* 
   13.用到了c1 c2 c3三个字段，c1 c2用于查找，c2 c3用于排序 没有产生Using filesort 
      因为之前c2这个字段已经确定了是'a2'了，这是一个常量，再去ORDER BY c3,c2 这时候c2已经不用排序了！
      所以没有产生Using filesort 和(10)进行对比学习！
*/
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c2` = 'a2' AND `c5` = 'a5' ORDER BY c3, c2;



/* GROUP BY 表面上是叫做分组，但是分组之前必定排序。 */

/* 14.用到c1 c2 c3三个字段，c1用于查找，c2 c3用于排序，c4失效 */
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c4` = 'a4' GROUP BY `c2`,`c3`;

/* 15.用到c1这一个字段，c4失效，c2和c3排序失效产生了Using filesort */
EXPLAIN SELECT * FROM `test03` WHERE `c1` = 'a1' AND `c4` = 'a4' GROUP BY `c3`,`c2`;
```

`GROUP BY`基本上都需要进行排序，索引优化几乎和`ORDER BY`一致，但是`GROUP BY`会有临时表的产生。

### 索引失效的原理分析

### 索引失效的总结

索引优化的一般性建议：

- 对于单值索引，尽量选择针对当前`query`过滤性更好的索引。
- 在选择复合索引的时候，当前`query`中过滤性最好的字段在索引字段顺序中，位置越靠前越好。
- 在选择复合索引的时候，尽量选择可以能够包含当前`query`中的`where`子句中更多字段的索引。
- 尽可能通过分析统计信息和调整`query`的写法来达到选择合适索引的目的。

口诀：

带头大哥不能死，中间兄弟不能断。索引列上不计算。范围之后全失效。覆盖索引尽量用。不等有时会失效。like百分加右边。字符要加单引号。一般SQL少用or。

# MySQL查询优化

## count（*）优化

在实际的开发中，经常可能需要计算一个表中（或部分）的行数，通常可以使用`select count(*) from t`，但随着系统中记录数的不断增多，这条语句会执行得越来越慢。

### count(*)的实现

实际上，在不同的MySQL引擎中，count(*)有不同的实现方式：

- MyISAM引擎把一个表的总行数存在了磁盘上，因此执行count(*)的时候会直接返回这个数（如果没有where条件），效率很高
- InnoDB引擎在执行count（*）的时候，需要把数据一行一行地从引擎里面读出来后，累积计数，显然，这种方式地效率很低

那为什么InnoDB不跟MyISAM一样，也把数字存起来呢？这是因为即使在同一个时刻的多个查询，由于多版本并发控制（MVCC）的原因，InnoDB表“应该返回多少行”也是不确定的，这里，我们以一个算count（*）的例子来说明，假设表t中现在有10000条记录，并且有三个用户并行的会话：

- 会话A先启动事务并查询一次表的总行数
- 会话B启动事务，插入一行后记录后，查询表的总行数
- 会话c先启动一个单独的语句，插入一行记录后，查询表的总行数

这里我们假设从上到下是按照时间顺序执行的，同一行语句是在同一时刻执行的。

![image-20211211213023360](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20211211213023.png)

可以看到，在最后的同一个时刻，三个会话A、B、C会同时查询表t的总行数，但拿到的结果却不同，这和InnoDB的事务设计有关系，可重复读是它默认的隔离级别，在代码上就是通过多版本并发控制，也就是MVCC来实现的，每一行记录都要判断自己是否对这个会话可见，因此对于count（*）请求来说，InnoDB只好把数据一行一行地读出依次判断，可见的行才能够用于计算“基于这个查询”的表的总行数。

不过，InnoDB对这个语句也做个一定程度的优化，InnoDB是索引组织表，主键索引树的叶子节点是数据，而普通索引树的叶子节点是主键值。所以，普通索引树比主键索引树小很多。对于count(*)这样的操作，遍历哪个索引树得到的结果逻辑上都是一样的，因此，MySQL优化器会找到最小的那棵树来遍历，在保证逻辑正确的前题下，尽量减少扫描的数据量，是数据库系统设计的通用法则之一。

也许你想到`show table status`命令，这个命令的输出结果也有一个TABLE_ROWS用于显示这个表当前有多少行，并且这个命令执行的速度较快，遗憾的是，TABLE_ROWS是通过采样估算的来的，因此只是一个估算值，官方文档显示误差可能达到40%到50%，因此，也无法使用它来进行统计。

那么如果有一个页面经常要显示交易系统的操作记录总数，到底应该怎么办呢？答案是，只能自己计数，接下来，我们将会讨论自己计数的方法，以及每种方法优缺点。

### 使用缓存系统保存计数

对常见的做法就是使用缓存，可以使用一个Redis服务来保存这个表的总行数。这个表每被插入一行Redis计数就加1，每被删除一行Redis计数就减1。这种方式的缺点就在于，缓存系统可能会丢失更新。Redis的数据不能永久地留在内存中，所以需要找一个地方把这个值定期地持久化存储起来，但即使这样，仍然可能丢失更新，如果刚刚在数据表中插入了一行，Redis中保存的值也加了1，然后Redis异常重启了，重启后需要从存储Redis数据的地方把这个值读回来，而刚刚加1的这个计数操作却丢失了。

实际上，将计数保存在缓存系统中的方式，还不只是丢失更新的问题，即使Redis正常工作，这个值还是逻辑上不精确的。

### 在数据库中保存计数

### 不同count的用法

count（）是一个聚合函数，对于返回的结果集，一行行地判断，如果count函数的参数不是NULL，累计值就加1，否则不加，最后返回累计值，所以count（*）、count（主键id）和count（1）都表示返回满足条件的结果集的总行数，而count（字段）,则表示返回满足条件的数据行里面，参数“字段”不为NULL的总个数。

对于count（主键id）来说，InnoDB引擎会遍历整张表，把每一行的id值都取出来，返回给server层，server层拿到id后，判断是不可能为空的，就按行累加；对于count（1）来说，InnoDB引擎遍历整张表，但不取值。server层对于返回的每一行，放一个数字“1”进去，判断是不可能为空的，按行累加。相比较而言，count（1）执行得要比count（主键id）快。因为从引擎返回id会涉及到解析数据行，以及拷贝字段值的操作。

<div class="note info"><p>虽然主键id一定不为空，但InnoDB并没有做相关的优化。</p></div>

对于count（字段）来说：

- 如果这个“字段”是定义为not null的话，一行行地从记录里面读出这个字段，判断不能为null，按行累加
- 如果这个“字段”定义允许为null，那么执行的时候，判断到有可能是null，还要把值取出来再判断以下，不是null才累加

这些不同的方式按照效率排序：count（字段）< count（主键id） < count（1） ≈ count（*）。

## join语句的优化

## MySQL中的临时表

## 小表驱动大表

> 优化原则：对于MySQL数据库而言，永远都是小表驱动大表。

```java
/**
* 举个例子：可以使用嵌套的for循环来理解小表驱动大表。
* 以下两个循环结果都是一样的，但是对于MySQL来说不一样，
* 第一种可以理解为，和MySQL建立5次连接每次查询1000次。
* 第一种可以理解为，和MySQL建立1000次连接每次查询5次。
*/
for(int i = 1; i <= 5; i ++){
    for(int j = 1; j <= 1000; j++){
        
    }
}
// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
for(int i = 1; i <= 1000; i ++){
    for(int j = 1; j <= 5; j++){
        
    }
}
```

> IN和EXISTS

```sql
/* 优化原则：小表驱动大表，即小的数据集驱动大的数据集 */

/* IN适合B表比A表数据小的情况*/
SELECT * FROM `A` WHERE `id` IN (SELECT `id` FROM `B`)

/* EXISTS适合B表比A表数据大的情况 */
SELECT * FROM `A` WHERE EXISTS (SELECT 1 FROM `B` WHERE `B`.id = `A`.id);
```

**EXISTS：**

- 语法：`SELECT....FROM tab WHERE EXISTS(subquery);`该语法可以理解为：
- 该语法可以理解为：将主查询的数据，放到子查询中做条件验证，根据验证结果（`true`或是`false`）来决定主查询的数据结果是否得以保留。

**提示：**

- `EXISTS(subquery)`子查询只返回`true`或者`false`，因此子查询中的`SELECT *`可以是`SELECT 1 OR SELECT X`，它们并没有区别。
- `EXISTS(subquery)`子查询的实际执行过程可能经过了优化而不是我们理解上的逐条对比，如果担心效率问题，可进行实际检验以确定是否有效率问题。
- `EXISTS(subquery)`子查询往往也可以用条件表达式，其他子查询或者`JOIN`替代，何种最优需要具体问题具体分析。



## ORDER BY优化

> 数据准备

```sql
CREATE TABLE `talA`(
`age` INT,
`birth` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `talA`(`age`) VALUES(18);
INSERT INTO `talA`(`age`) VALUES(19);
INSERT INTO `talA`(`age`) VALUES(20);
INSERT INTO `talA`(`age`) VALUES(21);
INSERT INTO `talA`(`age`) VALUES(22);
INSERT INTO `talA`(`age`) VALUES(23);
INSERT INTO `talA`(`age`) VALUES(24);
INSERT INTO `talA`(`age`) VALUES(25);

/* 创建索引 */
CREATE INDEX idx_talA_age_birth ON `talA`(`age`, `birth`);
```

> 案例

```sql
/* 1.使用索引进行排序了 不会产生Using filesort */
EXPLAIN SELECT * FROM `talA` WHERE `age` > 20 ORDER BY `age`;

/* 2.使用索引进行排序了 不会产生Using filesort */
EXPLAIN SELECT * FROM `talA` WHERE `age` > 20 ORDER BY `age`,`birth`;

/* 3.没有使用索引进行排序 产生了Using filesort */
EXPLAIN SELECT * FROM `talA` WHERE `age` > 20 ORDER BY `birth`;

/* 4.没有使用索引进行排序 产生了Using filesort */
EXPLAIN SELECT * FROM `talA` WHERE `age` > 20 ORDER BY `birth`,`age`;

/* 5.没有使用索引进行排序 产生了Using filesort */
EXPLAIN SELECT * FROM `talA` ORDER BY `birth`;

/* 6.没有使用索引进行排序 产生了Using filesort */
EXPLAIN SELECT * FROM `talA` WHERE `birth` > '2020-08-04 07:42:21' ORDER BY `birth`;

/* 7.使用索引进行排序了 不会产生Using filesort */
EXPLAIN SELECT * FROM `talA` WHERE `birth` > '2020-08-04 07:42:21' ORDER BY `age`;

/* 8.没有使用索引进行排序 产生了Using filesort */
EXPLAIN SELECT * FROM `talA` ORDER BY `age` ASC, `birth` DESC;
```

`ORDER BY`子句，尽量使用索引排序，避免使用`Using filesort`排序。

MySQL支持两种方式的排序，`FileSort`和`Index`，`Index`的效率高，它指MySQL扫描索引本身完成排序。`FileSort`方式效率较低。

`ORDER BY`满足两情况，会使用`Index`方式排序：

- `ORDER BY`语句使用索引最左前列。
- 使用`WHERE`子句与`ORDER BY`子句条件列组合满足索引最左前列。

**结论：尽可能在索引列上完成排序操作，遵照索引建的最佳左前缀原则。**



> 如果不在索引列上，File Sort有两种算法：MySQL就要启动双路排序算法和单路排序算法

1、双路排序算法：MySQL4.1之前使用双路排序，字面意思就是两次扫描磁盘，最终得到数据，读取行指针和`ORDER BY`列，対他们进行排序，然后扫描已经排序好的列表，按照列表中的值重新从列表中读取对应的数据输出。**一句话，从磁盘取排序字段，在`buffer`中进行排序，再从磁盘取其他字段。**

取一批数据，要对磁盘进行两次扫描，众所周知，IO是很耗时的，所以在MySQL4.1之后，出现了改进的算法，就是单路排序算法。

2、单路排序算法：从磁盘读取查询需要的所有列，按照`ORDER BY`列在`buffer`対它们进行排序，然后扫描排序后的列表进行输出，它的效率更快一些，避免了第二次读取数据。并且把随机IO变成了顺序IO，但是它会使用更多的空间，因为它把每一行都保存在内存中了。



由于单路排序算法是后出的，总体而言效率好过双路排序算法。

但是单路排序算法有问题：如果`SortBuffer`缓冲区太小，导致从磁盘中读取所有的列不能完全保存在`SortBuffer`缓冲区中，这时候单路复用算法就会出现问题，反而性能不如双路复用算法。



**单路复用算法的优化策略：**

- 增大`sort_buffer_size`参数的设置。
- 增大`max_length_for_sort_data`参数的设置。

**提高ORDER BY排序的速度：**

- `ORDER BY`时使用`SELECT *`是大忌，查什么字段就写什么字段，这点非常重要。在这里的影响是：
  - 当查询的字段大小总和小于`max_length_for_sort_data`而且排序字段不是`TEXT|BLOB`类型时，会使用单路排序算法，否则使用多路排序算法。
  - 两种排序算法的数据都有可能超出`sort_buffer`缓冲区的容量，超出之后，会创建`tmp`临时文件进行合并排序，导致多次IO，但是单路排序算法的风险会更大一些，所以要增大`sort_buffer_size`参数的设置。

- 尝试提高`sort_buffer_size`：不管使用哪种算法，提高这个参数都会提高效率，当然，要根据系统的能力去提高，因为这个参数是针对每个进程的。
- 尝试提高`max_length_for_sort_data`：提高这个参数，会增加用单路排序算法的概率。但是如果设置的太高，数据总容量`sort_buffer_size`的概率就增大，明显症状是高的磁盘IO活动和低的处理器使用率。

## GORUP BY优化

- `GROUP BY`实质是先排序后进行分组，遵照索引建的最佳左前缀。

- 当无法使用索引列时，会使用`Using filesort`进行排序，增大`max_length_for_sort_data`参数的设置和增大`sort_buffer_size`参数的设置，会提高性能。

- `WHERE`执行顺序高于`HAVING`，能写在`WHERE`限定条件里的就不要写在`HAVING`中了。



## 总结

**为排序使用索引**

- MySQL两种排序方式：`Using filesort`和`Index`扫描有序索引排序。
- MySQL能为排序与查询使用相同的索引，创建的索引既可以用于排序也可以用于查询。

```sql
/* 创建a b c三个字段的索引 */
idx_table_a_b_c(a, b, c)

/* 1.ORDER BY 能使用索引最左前缀 */
ORDER BY a;
ORDER BY a, b;
ORDER BY a, b, c;
ORDER BY a DESC, b DESC, c DESC;

/* 2.如果WHERE子句中使用索引的最左前缀定义为常量，则ORDER BY能使用索引 */
WHERE a = 'Ringo' ORDER BY b, c;
WHERE a = 'Ringo' AND b = 'Tangs' ORDER BY c;
WHERE a = 'Ringo' AND b > 2000 ORDER BY b, c;

/* 3.不能使用索引进行排序 */
ORDER BY a ASC, b DESC, c DESC;  /* 排序不一致 */
WHERE g = const ORDER BY b, c;   /* 丢失a字段索引 */
WHERE a = const ORDER BY c;      /* 丢失b字段索引 */
WHERE a = const ORDER BY a, d;   /* d字段不是索引的一部分 */
WHERE a IN (...) ORDER BY b, c;  /* 对于排序来说，多个相等条件(a=1 or a=2)也是范围查询 */
```

## 慢查询日志

### 基本介绍

> 慢查询日志是什么？

- MySQL的慢查询日志是MySQL提供的一种日志记录，它用来记录在MySQL中响应时间超过阈值的语句，具体指运行时间超过`long_query_time`值的SQL，则会被记录到慢查询日志中。
- `long_query_time`的默认值为10，意思是运行10秒以上的语句。
- 由慢查询日志来查看哪些SQL超出了我们的最大忍耐时间值，比如一条SQL执行超过5秒钟，我们就算慢SQL，希望能收集超过5秒钟的SQL，结合之前`explain`进行全面分析。

> 特别说明

**默认情况下，MySQL数据库没有开启慢查询日志，**需要我们手动来设置这个参数。

**当然，如果不是调优需要的话，一般不建议启动该参数**，因为开启慢查询日志会或多或少带来一定的性能影响。慢查询日志支持将日志记录写入文件。

> 查看慢查询日志是否开以及如何开启

- 查看慢查询日志是否开启：`SHOW VARIABLES LIKE '%slow_query_log%';`。

- 开启慢查询日志：`SET GLOBAL slow_query_log = 1;`。**使用该方法开启MySQL的慢查询日志只对当前数据库生效，如果MySQL重启后会失效。**

```shell
# 1、查看慢查询日志是否开启
mysql> SHOW VARIABLES LIKE '%slow_query_log%';
+---------------------+--------------------------------------+
| Variable_name       | Value                                |
+---------------------+--------------------------------------+
| slow_query_log      | OFF                                  |
| slow_query_log_file | /var/lib/mysql/1dcb5644392c-slow.log |
+---------------------+--------------------------------------+
2 rows in set (0.01 sec)

# 2、开启慢查询日志
mysql> SET GLOBAL slow_query_log = 1;
Query OK, 0 rows affected (0.00 sec)
```



如果要使慢查询日志永久开启，需要修改`my.cnf`文件，在`[mysqld]`下增加修改参数。

```shell
# my.cnf
[mysqld]
# 1.这个是开启慢查询。注意ON需要大写
slow_query_log=ON  

# 2.这个是存储慢查询的日志文件。这个文件不存在的话，需要自己创建
slow_query_log_file=/var/lib/mysql/slow.log
```



> 开启了慢查询日志后，什么样的SQL才会被记录到慢查询日志里面呢？

这个是由参数`long_query_time`控制的，默认情况下`long_query_time`的值为10秒。

MySQL中查看`long_query_time`的时间：`SHOW VARIABLES LIKE 'long_query_time%';`。

```shell
# 查看long_query_time 默认是10秒
# 只有SQL的执行时间>10才会被记录
mysql> SHOW VARIABLES LIKE 'long_query_time%';
+-----------------+-----------+
| Variable_name   | Value     |
+-----------------+-----------+
| long_query_time | 10.000000 |
+-----------------+-----------+
1 row in set (0.00 sec)
```

修改`long_query_time`的时间，需要在`my.cnf`修改配置文件

```shell
[mysqld]
# 这个是设置慢查询的时间，我设置的为1秒
long_query_time=1
```

查新慢查询日志的总记录条数：`SHOW GLOBAL STATUS LIKE '%Slow_queries%';`。

```shell
mysql> SHOW GLOBAL STATUS LIKE '%Slow_queries%';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| Slow_queries  | 3     |
+---------------+-------+
1 row in set (0.00 sec)
```

### 日志分析工具

日志分析工具`mysqldumpslow`：在生产环境中，如果要手工分析日志，查找、分析SQL，显然是个体力活，MySQL提供了日志分析工具`mysqldumpslow`。

```shell
# 1、mysqldumpslow --help 来查看mysqldumpslow的帮助信息
root@1dcb5644392c:/usr/bin# mysqldumpslow --help
Usage: mysqldumpslow [ OPTS... ] [ LOGS... ]

Parse and summarize the MySQL slow query log. Options are

  --verbose    verbose
  --debug      debug
  --help       write this text to standard output

  -v           verbose
  -d           debug
  -s ORDER     what to sort by (al, at, ar, c, l, r, t), 'at' is default  # 按照何种方式排序
                al: average lock time # 平均锁定时间
                ar: average rows sent # 平均返回记录数
                at: average query time # 平均查询时间
                 c: count  # 访问次数
                 l: lock time  # 锁定时间
                 r: rows sent  # 返回记录
                 t: query time  # 查询时间 
  -r           reverse the sort order (largest last instead of first)
  -t NUM       just show the top n queries  # 返回前面多少条记录
  -a           don't abstract all numbers to N and strings to 'S'
  -n NUM       abstract numbers with at least n digits within names
  -g PATTERN   grep: only consider stmts that include this string  
  -h HOSTNAME  hostname of db server for *-slow.log filename (can be wildcard),
               default is '*', i.e. match all
  -i NAME      name of server instance (if using mysql.server startup script)
  -l           don't subtract lock time from total time
  
# 2、 案例
# 2.1、得到返回记录集最多的10个SQL
mysqldumpslow -s r -t 10 /var/lib/mysql/slow.log
 
# 2.2、得到访问次数最多的10个SQL
mysqldumpslow -s c -t 10 /var/lib/mysql/slow.log
 
# 2.3、得到按照时间排序的前10条里面含有左连接的查询语句
mysqldumpslow -s t -t 10 -g "left join" /var/lib/mysql/slow.log

# 2.4、另外建议使用这些命令时结合|和more使用，否则出现爆屏的情况
mysqldumpslow -s r -t 10 /var/lib/mysql/slow.log | more
```

### 分析慢SQL的步骤

分析：

1、观察，至少跑1天，看看生产的慢SQL情况。

2、开启慢查询日志，设置阈值，比如超过5秒钟的就是慢SQL，并将它抓取出来。

3、explain + 慢SQL分析。

4、show Profile。

5、运维经理 OR DBA，进行MySQL数据库服务器的参数调优。



总结（大纲）：

1、慢查询的开启并捕获。

2、explain + 慢SQL分析。

3、show Profile查询SQL在MySQL数据库中的执行细节和生命周期情况。

4、MySQL数据库服务器的参数调优。

### Show Profile

> Show Profile是什么？

`Show Profile`：MySQL提供可以用来分析当前会话中语句执行的资源消耗情况。可以用于SQL的调优的测量。**默认情况下，参数处于关闭状态，并保存最近15次的运行结果。**

> 分析步骤

1、是否支持，看看当前的MySQL版本是否支持。

```shell
# 查看Show Profile功能是否开启
mysql> SHOW VARIABLES LIKE 'profiling';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| profiling     | OFF   |
+---------------+-------+
1 row in set (0.00 sec)
```

2、开启`Show Profile`功能，默认是关闭的，使用前需要开启。

```shell
# 开启Show Profile功能
mysql> SET profiling=ON;
Query OK, 0 rows affected, 1 warning (0.00 sec)
```

3、运行SQL

```mysql
SELECT * FROM `emp` GROUP BY `id`%10 LIMIT 150000;

SELECT * FROM `emp` GROUP BY `id`%20 ORDER BY 5;
```

4、查看结果，执行`SHOW PROFILES;`

`Duration`：持续时间。

```shell
mysql> SHOW PROFILES;
+----------+------------+---------------------------------------------------+
| Query_ID | Duration   | Query                                             |
+----------+------------+---------------------------------------------------+
|        1 | 0.00156100 | SHOW VARIABLES LIKE 'profiling'                   |
|        2 | 0.56296725 | SELECT * FROM `emp` GROUP BY `id`%10 LIMIT 150000 |
|        3 | 0.52105825 | SELECT * FROM `emp` GROUP BY `id`%10 LIMIT 150000 |
|        4 | 0.51279775 | SELECT * FROM `emp` GROUP BY `id`%20 ORDER BY 5   |
+----------+------------+---------------------------------------------------+
4 rows in set, 1 warning (0.00 sec)
```

5、诊断SQL，`SHOW PROFILE cpu,block io FOR QUERY Query_ID;`

```shell
# 这里的3是第四步中的Query_ID。
# 可以在SHOW PROFILE中看到一条SQL中完整的生命周期。
mysql> SHOW PROFILE cpu,block io FOR QUERY 3;
+----------------------+----------+----------+------------+--------------+---------------+
| Status               | Duration | CPU_user | CPU_system | Block_ops_in | Block_ops_out |
+----------------------+----------+----------+------------+--------------+---------------+
| starting             | 0.000097 | 0.000090 |   0.000002 |            0 |             0 |
| checking permissions | 0.000010 | 0.000009 |   0.000000 |            0 |             0 |
| Opening tables       | 0.000039 | 0.000058 |   0.000000 |            0 |             0 |
| init                 | 0.000046 | 0.000046 |   0.000000 |            0 |             0 |
| System lock          | 0.000011 | 0.000000 |   0.000000 |            0 |             0 |
| optimizing           | 0.000005 | 0.000000 |   0.000000 |            0 |             0 |
| statistics           | 0.000023 | 0.000037 |   0.000000 |            0 |             0 |
| preparing            | 0.000014 | 0.000000 |   0.000000 |            0 |             0 |
| Creating tmp table   | 0.000041 | 0.000053 |   0.000000 |            0 |             0 |
| Sorting result       | 0.000005 | 0.000000 |   0.000000 |            0 |             0 |
| executing            | 0.000003 | 0.000000 |   0.000000 |            0 |             0 |
| Sending data         | 0.520620 | 0.516267 |   0.000000 |            0 |             0 |
| Creating sort index  | 0.000060 | 0.000051 |   0.000000 |            0 |             0 |
| end                  | 0.000006 | 0.000000 |   0.000000 |            0 |             0 |
| query end            | 0.000011 | 0.000000 |   0.000000 |            0 |             0 |
| removing tmp table   | 0.000006 | 0.000000 |   0.000000 |            0 |             0 |
| query end            | 0.000004 | 0.000000 |   0.000000 |            0 |             0 |
| closing tables       | 0.000009 | 0.000000 |   0.000000 |            0 |             0 |
| freeing items        | 0.000032 | 0.000064 |   0.000000 |            0 |             0 |
| cleaning up          | 0.000019 | 0.000000 |   0.000000 |            0 |             0 |
+----------------------+----------+----------+------------+--------------+---------------+
20 rows in set, 1 warning (0.00 sec)
```

`Show Profile`查询参数备注：

- `ALL`：显示所有的开销信息。
- `BLOCK IO`：显示块IO相关开销（通用）。
- `CONTEXT SWITCHES`：上下文切换相关开销。
- `CPU`：显示CPU相关开销信息（通用）。
- `IPC`：显示发送和接收相关开销信息。
- `MEMORY`：显示内存相关开销信息。
- `PAGE FAULTS`：显示页面错误相关开销信息。
- `SOURCE`：显示和Source_function。
- `SWAPS`：显示交换次数相关开销的信息。



6、`Show Profile`查询列表，日常开发需要注意的结论：

- `converting HEAP to MyISAM`：查询结果太大，内存都不够用了，往磁盘上搬了。
- `Creating tmp table`：创建临时表（拷贝数据到临时表，用完再删除），非常耗费数据库性能。
- `Copying to tmp table on disk`：把内存中的临时表复制到磁盘，危险！！！
- `locked`：死锁。

# MySQL中的锁

## 表锁(偏读)

**表锁特点：**

- 表锁偏向`MyISAM`存储引擎，开销小，加锁快，无死锁，锁定粒度大，发生锁冲突的概率最高，并发度最低。


### 环境准备

```mysql
# 1、创建表
CREATE TABLE `mylock`(
`id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
`name` VARCHAR(20)
)ENGINE=MYISAM DEFAULT CHARSET=utf8 COMMENT='测试表锁';

# 2、插入数据
INSERT INTO `mylock`(`name`) VALUES('ZhangSan');
INSERT INTO `mylock`(`name`) VALUES('LiSi');
INSERT INTO `mylock`(`name`) VALUES('WangWu');
INSERT INTO `mylock`(`name`) VALUES('ZhaoLiu');
```

### 锁表的命令

> 1、查看数据库表锁的命令。

```mysql
# 查看数据库表锁的命令
SHOW OPEN TABLES;
```

> 2、给`mylock`表上读锁，给`book`表上写锁。

```mysql
# 给mylock表上读锁，给book表上写锁
LOCK TABLE `mylock` READ, `book` WRITE;

# 查看当前表的状态
mysql> SHOW OPEN TABLES;
+--------------------+------------------------------------------------------+--------+-------------+
| Database           | Table                                                | In_use | Name_locked |
+--------------------+------------------------------------------------------+--------+-------------+
| sql_analysis       | book                                                 |      1 |           0 |
| sql_analysis       | mylock                                               |      1 |           0 |
+--------------------+------------------------------------------------------+--------+-------------+
```

> 3、释放表锁。

```mysql
# 释放给表添加的锁
UNLOCK TABLES;

# 查看当前表的状态
mysql> SHOW OPEN TABLES;
+--------------------+------------------------------------------------------+--------+-------------+
| Database           | Table                                                | In_use | Name_locked |
+--------------------+------------------------------------------------------+--------+-------------+
| sql_analysis       | book                                                 |      0 |           0 |
| sql_analysis       | mylock                                               |      0 |           0 |
+--------------------+------------------------------------------------------+--------+-------------+
```

### 读锁案例

> 1、打开两个会话，`SESSION1`为`mylock`表添加读锁。

```mysql
# 为mylock表添加读锁
LOCK TABLE `mylock` READ;
```

> 2、打开两个会话，`SESSION1`是否可以读自己锁的表？是否可以修改自己锁的表？是否可以读其他的表？那么`SESSION2`呢？

```shell
# SESSION1

# 问题1：SESSION1为mylock表加了读锁，可以读mylock表！
mysql> SELECT * FROM `mylock`;
+----+----------+
| id | name     |
+----+----------+
|  1 | ZhangSan |
|  2 | LiSi     |
|  3 | WangWu   |
|  4 | ZhaoLiu  |
+----+----------+
4 rows in set (0.00 sec)

# 问题2：SESSION1为mylock表加了读锁，不可以修改mylock表！
mysql> UPDATE `mylock` SET `name` = 'abc' WHERE `id` = 1;
ERROR 1099 (HY000): Table 'mylock' was locked with a READ lock and can't be updated

# 问题3：SESSION1为mylock表加了读锁，不可以读其他的表！
mysql> SELECT * FROM `book`;
ERROR 1100 (HY000): Table 'book' was not locked with LOCK TABLES


# SESSION2

# 问题1：SESSION1为mylock表加了读锁，SESSION2可以读mylock表！
mysql> SELECT * FROM `mylock`;
+----+----------+
| id | name     |
+----+----------+
|  1 | ZhangSan |
|  2 | LiSi     |
|  3 | WangWu   |
|  4 | ZhaoLiu  |
+----+----------+
4 rows in set (0.00 sec)

# 问题2：SESSION1为mylock表加了读锁，SESSION2修改mylock表会被阻塞，需要等待SESSION1释放mylock表！
mysql> UPDATE `mylock` SET `name` = 'abc' WHERE `id` = 1;
^C^C -- query aborted
ERROR 1317 (70100): Query execution was interrupted

# 问题3：SESSION1为mylock表加了读锁，SESSION2可以读其他表！
mysql> SELECT * FROM `book`;
+--------+------+
| bookid | card |
+--------+------+
|      1 |    1 |
|      7 |    4 |
|      8 |    4 |
|      9 |    5 |
|      5 |    6 |
|     17 |    6 |
|     15 |    8 |
+--------+------+
24 rows in set (0.00 sec)
```

### 写锁案例

> 1、打开两个会话，`SESSION1`为`mylock`表添加写锁。

```mysql
# 为mylock表添加写锁
LOCK TABLE `mylock` WRITE;
```

> 2、打开两个会话，`SESSION1`是否可以读自己锁的表？是否可以修改自己锁的表？是否可以读其他的表？那么`SESSION2`呢？

```shell
# SESSION1

# 问题1：SESSION1为mylock表加了写锁，可以读mylock的表！
mysql> SELECT * FROM `mylock`;
+----+----------+
| id | name     |
+----+----------+
|  1 | ZhangSan |
|  2 | LiSi     |
|  3 | WangWu   |
|  4 | ZhaoLiu  |
+----+----------+
4 rows in set (0.00 sec)

# 问题2：SESSION1为mylock表加了写锁，可以修改mylock表!
mysql> UPDATE `mylock` SET `name` = 'abc' WHERE `id` = 1;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

# 问题3：SESSION1为mylock表加了写锁，不能读其他表!
mysql> SELECT * FROM `book`;
ERROR 1100 (HY000): Table 'book' was not locked with LOCK TABLES

# SESSION2

# 问题1：SESSION1为mylock表加了写锁，SESSION2读mylock表会阻塞，等待SESSION1释放！
mysql> SELECT * FROM `mylock`;
^C^C -- query aborted
ERROR 1317 (70100): Query execution was interrupted

# 问题2：SESSION1为mylock表加了写锁，SESSION2读mylock表会阻塞，等待SESSION1释放！
mysql> UPDATE `mylock` SET `name` = 'abc' WHERE `id` = 1;
^C^C -- query aborted
ERROR 1317 (70100): Query execution was interrupted

# 问题3：SESSION1为mylock表加了写锁，SESSION2可以读其他表！
mysql> SELECT * FROM `book`;
+--------+------+
| bookid | card |
+--------+------+
|      1 |    1 |
|      7 |    4 |
|      8 |    4 |
|      9 |    5 |
|      5 |    6 |
|     17 |    6 |
|     15 |    8 |
+--------+------+
24 rows in set (0.00 sec)
```

### 案例结论

**`MyISAM`引擎在执行查询语句`SELECT`之前，会自动给涉及到的所有表加读锁，在执行增删改之前，会自动给涉及的表加写锁。**

MySQL的表级锁有两种模式：

- 表共享读锁（Table Read Lock）。

- 表独占写锁（Table Write Lock）。

対`MyISAM`表进行操作，会有以下情况：

- 対`MyISAM`表的读操作（加读锁），不会阻塞其他线程対同一表的读操作，但是会阻塞其他线程対同一表的写操作。只有当读锁释放之后，才会执行其他线程的写操作。
- 対`MyISAM`表的写操作（加写锁），会阻塞其他线程対同一表的读和写操作，只有当写锁释放之后，才会执行其他线程的读写操作。

### 表锁分析

```shell
mysql> SHOW STATUS LIKE 'table%';
+----------------------------+-------+
| Variable_name              | Value |
+----------------------------+-------+
| Table_locks_immediate      | 173   |
| Table_locks_waited         | 0     |
| Table_open_cache_hits      | 5     |
| Table_open_cache_misses    | 8     |
| Table_open_cache_overflows | 0     |
+----------------------------+-------+
5 rows in set (0.00 sec)
```

可以通过`Table_locks_immediate`和`Table_locks_waited`状态变量来分析系统上的表锁定。具体说明如下：

`Table_locks_immediate`：产生表级锁定的次数，表示可以立即获取锁的查询次数，每立即获取锁值加1。

`Table_locks_waited`：出现表级锁定争用而发生等待的次数（不能立即获取锁的次数，每等待一次锁值加1），此值高则说明存在较严重的表级锁争用情况。

**此外，`MyISAM`的读写锁调度是写优先，这也是`MyISAM`不适合作为主表的引擎。因为写锁后，其他线程不能进行任何操作，大量的写操作会使查询很难得到锁，从而造成永远阻塞。**

## 行锁(偏写)

**行锁特点：**

- 偏向`InnoDB`存储引擎，开销大，加锁慢；会出现死锁；锁定粒度最小，发生锁冲突的概率最低，并发度最高。

**`InnoDB`存储引擎和`MyISAM`存储引擎最大不同有两点：一是支持事务，二是采用行锁。**

事务的ACID：

- `Atomicity [ˌætəˈmɪsəti] `。
- `Consistency [kənˈsɪstənsi] `。
- `Isolation [ˌaɪsəˈleɪʃn]`。
- `Durability [ˌdjʊərəˈbɪlɪti] `。

### 环境准备

```mysql
# 建表语句
CREATE TABLE `test_innodb_lock`(
`a` INT,
`b` VARCHAR(16)
)ENGINE=INNODB DEFAULT CHARSET=utf8 COMMENT='测试行锁'; 

# 插入数据
INSERT INTO `test_innodb_lock`(`a`, `b`) VALUES(1, 'b2');
INSERT INTO `test_innodb_lock`(`a`, `b`) VALUES(2, '3');
INSERT INTO `test_innodb_lock`(`a`, `b`) VALUES(3, '4000');
INSERT INTO `test_innodb_lock`(`a`, `b`) VALUES(4, '5000');
INSERT INTO `test_innodb_lock`(`a`, `b`) VALUES(5, '6000');
INSERT INTO `test_innodb_lock`(`a`, `b`) VALUES(6, '7000');
INSERT INTO `test_innodb_lock`(`a`, `b`) VALUES(7, '8000');
INSERT INTO `test_innodb_lock`(`a`, `b`) VALUES(8, '9000');

# 创建索引
CREATE INDEX idx_test_a ON `test_innodb_lock`(a);
CREATE INDEX idx_test_b ON `test_innodb_lock`(b);
```

### 行锁案例

> 1、开启手动提交

打开`SESSION1`和`SESSION2`两个会话，都开启手动提交。

```shell
# 开启MySQL数据库的手动提交
mysql> SET autocommit=0;
Query OK, 0 rows affected (0.00 sec)
```

> 2、读几知所写

```shell
# SESSION1 

# SESSION1対test_innodb_lock表做写操作，但是没有commit。
# 执行修改SQL之后，查询一下test_innodb_lock表，发现数据被修改了。
mysql> UPDATE `test_innodb_lock` SET `b` = '88' WHERE `a` = 1;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT * FROM `test_innodb_lock`;
+------+------+
| a    | b    |
+------+------+
|    1 | 88   |
|    2 | 3    |
|    3 | 4000 |
|    4 | 5000 |
|    5 | 6000 |
|    6 | 7000 |
|    7 | 8000 |
|    8 | 9000 |
+------+------+
8 rows in set (0.00 sec)

# SESSION2 

# SESSION2这时候来查询test_innodb_lock表。
# 发现SESSION2是读不到SESSION1未提交的数据的。
mysql> SELECT * FROM `test_innodb_lock`;
+------+------+
| a    | b    |
+------+------+
|    1 | b2   |
|    2 | 3    |
|    3 | 4000 |
|    4 | 5000 |
|    5 | 6000 |
|    6 | 7000 |
|    7 | 8000 |
|    8 | 9000 |
+------+------+
8 rows in set (0.00 se
```

> 3、行锁两个SESSION同时対一条记录进行写操作

```shell
# SESSION1 対test_innodb_lock表的`a`=1这一行进行写操作，但是没有commit
mysql> UPDATE `test_innodb_lock` SET `b` = '99' WHERE `a` = 1;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

# SESSION2 也对test_innodb_lock表的`a`=1这一行进行写操作，但是发现阻塞了！！！
# 等SESSION1执行commit语句之后，SESSION2的SQL就会执行了
mysql> UPDATE `test_innodb_lock` SET `b` = 'asdasd' WHERE `a` = 1;
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

> 4、行锁两个SESSION同时对不同记录进行写操作

```shell
# SESSION1 対test_innodb_lock表的`a`=6这一行进行写操作，但是没有commit
mysql> UPDATE `test_innodb_lock` SET `b` = '8976' WHERE `a` = 6;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

# SESSION2 対test_innodb_lock表的`a`=4这一行进行写操作，没有阻塞！！！
# SESSION1和SESSION2同时对不同的行进行写操作互不影响
mysql> UPDATE `test_innodb_lock` SET `b` = 'Ringo' WHERE `a` = 4;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

### 索引失效行锁变表锁

```shell
# SESSION1 执行SQL语句，没有执行commit。
# 由于`b`字段是字符串，但是没有加单引号导致索引失效
mysql> UPDATE `test_innodb_lock` SET `a` = 888 WHERE `b` = 8000;
Query OK, 1 row affected, 1 warning (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 1

# SESSION2 和SESSION1操作的并不是同一行，但是也被阻塞了？？？
# 由于SESSION1执行的SQL索引失效，导致行锁升级为表锁。
mysql> UPDATE `test_innodb_lock` SET `b` = '1314' WHERE `a` = 1;
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

### 间隙锁的危害

> 什么是间隙锁？

当我们用范围条件而不是相等条件检索数据，并请求共享或者排他锁时，`InnoDB`会给符合条件的已有数据记录的索引项加锁，对于键值在条件范文内但并不存在的记录，叫做"间隙(GAP)"。

`InnoDB`也会对这个"间隙"加锁，这种锁的机制就是所谓的"间隙锁"。

> 间隙锁的危害

因为`Query`执行过程中通过范围查找的话，他会锁定整个范围内所有的索引键值，即使这个键值不存在。

间隙锁有一个比较致命的缺点，就是**当锁定一个范围的键值后，即使某些不存在的键值也会被无辜的锁定，而造成在锁定的时候无法插入锁定键值范围内的任何数据。**在某些场景下这可能会対性能造成很大的危害。

### 如何锁定一行

![锁定一行](https://img-blog.csdnimg.cn/2020080616050355.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1JyaW5nb18=,size_16,color_FFFFFF,t_70)

`SELECT .....FOR UPDATE`在锁定某一行后，其他写操作会被阻塞，直到锁定的行被`COMMIT`。



mysql InnoDB引擎默认的修改数据语句，update,delete,insert都会自动给涉及到的数据加上排他锁，select语句默认不会加任何锁类型，如果加排他锁可以使用select ...for update语句，加共享锁可以使用select ... lock in share mode语句。所以加过排他锁的数据行在其他事务种是不能修改数据的，也不能通过for update和lock in share mode锁的方式查询数据，但可以直接通过select ...from...查询数据，因为普通查询没有任何锁机制。

![image-20210421122752768](https://img-blog.csdnimg.cn/20210421122919994.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1JyaW5nb18=,size_16,color_FFFFFF,t_70)





###  案例结论

`InnoDB`存储引擎由于实现了行级锁定，虽然在锁定机制的实现方面所带来的性能损耗可能比表级锁定会要更高一些，但是在整体并发处理能力方面要远远优于`MyISAM`的表级锁定的。当系统并发量较高的时候，`InnoDB`的整体性能和`MyISAM`相比就会有比较明显的优势了。

但是，`InnoDB`的行级锁定同样也有其脆弱的一面，当我们使用不当的时候，可能会让`InnoDB`的整体性能表现不仅不能比`MyISAM`高，甚至可能会更差。

### 行锁分析

```shell
mysql> SHOW STATUS LIKE 'innodb_row_lock%';
+-------------------------------+--------+
| Variable_name                 | Value  |
+-------------------------------+--------+
| Innodb_row_lock_current_waits | 0      |
| Innodb_row_lock_time          | 124150 |
| Innodb_row_lock_time_avg      | 31037  |
| Innodb_row_lock_time_max      | 51004  |
| Innodb_row_lock_waits         | 4      |
+-------------------------------+--------+
5 rows in set (0.00 sec)
```

対各个状态量的说明如下：

- `Innodb_row_lock_current_waits`：当前正在等待锁定的数量。
- `Innodb_row_lock_time`：从系统启动到现在锁定总时间长度（重要）。
- `Innodb_row_lock_time_avg`：每次等待所花的平均时间（重要）。
- `Innodb_row_lock_time_max`：从系统启动到现在等待最长的一次所花的时间。
- `Innodb_row_lock_waits`：系统启动后到现在总共等待的次数（重要）。

尤其是当等待次数很高，而且每次等待时长也不小的时候，我们就需要分析系统中为什么会有如此多的等待，然后根据分析结果着手制定优化策略。

# MySQL的高可用

## 主从复制

### 复制基本原理

![主从复制](https://img-blog.csdnimg.cn/20200806170415401.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1JyaW5nb18=,size_16,color_FFFFFF,t_70)

MySQL复制过程分为三步：

- Master将改变记录到二进制日志(Binary Log)。这些记录过程叫做二进制日志事件，`Binary Log Events`；
- Slave将Master的`Binary Log Events`拷贝到它的中继日志(Replay  Log);
- Slave重做中继日志中的事件，将改变应用到自己的数据库中。MySQL复制是异步且串行化的。

### 复制基本原则

- 每个Slave只有一个Master。
- 每个Slave只能有一个唯一的服务器ID。
- 每个Master可以有多个Salve。

### 一主一从配置

> 1、基本要求：Master和Slave的MySQL服务器版本一致且后台以服务运行。

```shell
# 创建mysql-slave1实例
docker run -p 3307:3306 --name mysql-slave1 \
-v /root/mysql-slave1/log:/var/log/mysql \
-v /root/mysql-slave1/data:/var/lib/mysql \
-v /root/mysql-slave1/conf:/etc/mysql \
-e MYSQL_ROOT_PASSWORD=333 \
-d mysql:5.7
```

> 2、主从配置都是配在[mysqld]节点下，都是小写

```shell
# Master配置
[mysqld]
server-id=1 # 必须
log-bin=/var/lib/mysql/mysql-bin # 必须
read-only=0
binlog-ignore-db=mysql
```

```shell
# Slave配置
[mysqld]
server-id=2 # 必须
log-bin=/var/lib/mysql/mysql-bin
```

> 3、Master配置

```shell
# 1、GRANT REPLICATION SLAVE ON *.* TO 'username'@'从机IP地址' IDENTIFIED BY 'password';
mysql> GRANT REPLICATION SLAVE ON *.* TO 'zhangsan'@'172.18.0.3' IDENTIFIED BY '123456';
Query OK, 0 rows affected, 1 warning (0.01 sec)

# 2、刷新命令
mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)

# 3、记录下File和Position
# 每次配从机的时候都要SHOW MASTER STATUS;查看最新的File和Position
mysql> SHOW MASTER STATUS;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000001 |      602 |              | mysql            |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)
```

> 4、Slave从机配置

```shell
CHANGE MASTER TO MASTER_HOST='172.18.0.4',
MASTER_USER='zhangsan',
MASTER_PASSWORD='123456',
MASTER_LOG_FILE='mysql-bin.File的编号',
MASTER_LOG_POS=Position的最新值;
```



```shell
# 1、使用用户名密码登录进Master
mysql> CHANGE MASTER TO MASTER_HOST='172.18.0.4',
    -> MASTER_USER='zhangsan',
    -> MASTER_PASSWORD='123456',
    -> MASTER_LOG_FILE='mysql-bin.000001',
    -> MASTER_LOG_POS=602;
Query OK, 0 rows affected, 2 warnings (0.02 sec)

# 2、开启Slave从机的复制
mysql> START SLAVE;
Query OK, 0 rows affected (0.00 sec)

# 3、查看Slave状态
# Slave_IO_Running 和 Slave_SQL_Running 必须同时为Yes 说明主从复制配置成功！
mysql> SHOW SLAVE STATUS\G
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event # Slave待命状态
                  Master_Host: 172.18.0.4
                  Master_User: zhangsan
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: mysql-bin.000001
          Read_Master_Log_Pos: 602
               Relay_Log_File: b030ad25d5fe-relay-bin.000002
                Relay_Log_Pos: 320
        Relay_Master_Log_File: mysql-bin.000001
             Slave_IO_Running: Yes  
            Slave_SQL_Running: Yes
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 602
              Relay_Log_Space: 534
              Until_Condition: None
               Until_Log_File: 
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File: 
           Master_SSL_CA_Path: 
              Master_SSL_Cert: 
            Master_SSL_Cipher: 
               Master_SSL_Key: 
        Seconds_Behind_Master: 0
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error: 
               Last_SQL_Errno: 0
               Last_SQL_Error: 
  Replicate_Ignore_Server_Ids: 
             Master_Server_Id: 1
                  Master_UUID: bd047557-b20c-11ea-9961-0242ac120002
             Master_Info_File: /var/lib/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: Slave has read all relay log; waiting for more updates
           Master_Retry_Count: 86400
                  Master_Bind: 
      Last_IO_Error_Timestamp: 
     Last_SQL_Error_Timestamp: 
               Master_SSL_Crl: 
           Master_SSL_Crlpath: 
           Retrieved_Gtid_Set: 
            Executed_Gtid_Set: 
                Auto_Position: 0
         Replicate_Rewrite_DB: 
                 Channel_Name: 
           Master_TLS_Version: 
1 row in set (0.00 sec)
```

> 5、测试主从复制

```shell
# Master创建数据库
mysql> create database test_replication;
Query OK, 1 row affected (0.01 sec)

# Slave查询数据库
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
| test_replication   |
+--------------------+
5 rows in set (0.00 sec)
```

> 6、停止主从复制功能

```shell
# 1、停止Slave
mysql> STOP SLAVE;
Query OK, 0 rows affected (0.00 sec)

# 2、重新配置主从
# MASTER_LOG_FILE 和 MASTER_LOG_POS一定要根据最新的数据来配
mysql> CHANGE MASTER TO MASTER_HOST='172.18.0.4',
    -> MASTER_USER='zhangsan',
    -> MASTER_PASSWORD='123456',
    -> MASTER_LOG_FILE='mysql-bin.000001',
    -> MASTER_LOG_POS=797;
Query OK, 0 rows affected, 2 warnings (0.01 sec)

mysql> START SLAVE;
Query OK, 0 rows affected (0.00 sec)

mysql> SHOW SLAVE STATUS\G
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 172.18.0.4
                  Master_User: zhangsan
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: mysql-bin.000001
          Read_Master_Log_Pos: 797
               Relay_Log_File: b030ad25d5fe-relay-bin.000002
                Relay_Log_Pos: 320
        Relay_Master_Log_File: mysql-bin.000001
             Slave_IO_Running: Yes
            Slave_SQL_Running: Yes
              Replicate_Do_DB: 
          Replicate_Ignore_DB: 
           Replicate_Do_Table: 
       Replicate_Ignore_Table: 
      Replicate_Wild_Do_Table: 
  Replicate_Wild_Ignore_Table: 
                   Last_Errno: 0
                   Last_Error: 
                 Skip_Counter: 0
          Exec_Master_Log_Pos: 797
              Relay_Log_Space: 534
              Until_Condition: None
               Until_Log_File: 
                Until_Log_Pos: 0
           Master_SSL_Allowed: No
           Master_SSL_CA_File: 
           Master_SSL_CA_Path: 
              Master_SSL_Cert: 
            Master_SSL_Cipher: 
               Master_SSL_Key: 
        Seconds_Behind_Master: 0
Master_SSL_Verify_Server_Cert: No
                Last_IO_Errno: 0
                Last_IO_Error: 
               Last_SQL_Errno: 0
               Last_SQL_Error: 
  Replicate_Ignore_Server_Ids: 
             Master_Server_Id: 1
                  Master_UUID: bd047557-b20c-11ea-9961-0242ac120002
             Master_Info_File: /var/lib/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: Slave has read all relay log; waiting for more updates
           Master_Retry_Count: 86400
                  Master_Bind: 
      Last_IO_Error_Timestamp: 
     Last_SQL_Error_Timestamp: 
               Master_SSL_Crl: 
           Master_SSL_Crlpath: 
           Retrieved_Gtid_Set: 
            Executed_Gtid_Set: 
                Auto_Position: 0
         Replicate_Rewrite_DB: 
                 Channel_Name: 
           Master_TLS_Version: 
1 row in set (0.00 sec)
```

---

# 参考文献

[1] [MySQL实战45讲](https://time.geekbang.org/column/intro/100020801?tab=catalog)

[2] [MySQL5.7手册](https://dev.mysql.com/doc/refman/5.7/en/)



