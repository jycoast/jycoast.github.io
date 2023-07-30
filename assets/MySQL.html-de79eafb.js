import{_ as t,o as l,c as d,f as e}from"./app-4972449e.js";const a={},i=e(`<h1 id="mysql" tabindex="-1"><a class="header-anchor" href="#mysql" aria-hidden="true">#</a> MySQL</h1><h2 id="mysql有哪几种数据存储引擎" tabindex="-1"><a class="header-anchor" href="#mysql有哪几种数据存储引擎" aria-hidden="true">#</a> MySQL有哪几种数据存储引擎?</h2><p>可以使用SQL查看支持的数据存储引擎：</p><div class="language-SQL line-numbers-mode" data-ext="SQL"><pre class="language-SQL"><code>show ENGINES;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>其中最为常用的是InnoDB和MyISAM两种，</p><p>MyISAM和InnoDB的区别：</p><ul><li>存储文件，MyISAM每个表有两个文件，MYD和MyISAM文件，MYD是数据文件，MYI是索引文件，而InnoDB每个表只有一个文件，idb</li><li>InnoDB支持事务，支持行锁，支持外键。</li><li>InnoDB支持XA事务。</li><li>InnoDB支持事务的savePoints</li></ul><h2 id="什么是脏读、不可重复读、幻读" tabindex="-1"><a class="header-anchor" href="#什么是脏读、不可重复读、幻读" aria-hidden="true">#</a> 什么是脏读、不可重复读、幻读？</h2><p>脏读、不可重复读、幻读的概念：</p><ul><li>脏读：在事务进行过程中，读到了其他事务未提交的数据。</li><li>不可重复读：在一个事务过程中，多次查询的结果不一致。（update）</li><li>幻读：在同一个事务中，用同样的操作查询数据，得到的记录数不相同。(insert)</li></ul><p>处理的方式有很多种：加锁、事务隔离、MVCC，这里只介绍使用加锁来解决这些问题：</p><table><thead><tr><th>类型</th><th>处理方式</th></tr></thead><tbody><tr><td>脏读</td><td>在修改时加排他锁，直到事务提交提交才释放，读取时加共享锁，读完释放锁</td></tr><tr><td>不可重复读</td><td>读数据时加共享锁，写数据时加排他锁</td></tr><tr><td>幻读</td><td>加范围锁</td></tr></tbody></table><h2 id="事务的基本特性和隔离级别" tabindex="-1"><a class="header-anchor" href="#事务的基本特性和隔离级别" aria-hidden="true">#</a> 事务的基本特性和隔离级别</h2><p>事务：表示多个数据操作组成一个完整的事务单元，这个事务内的所有数据操作要么同时成功，要么同时失败。</p><p>事务的特性：ACID</p><ul><li>原子性：事务是不可分割的，要么完全成功，要么完全失败。</li><li>一致性：事务无论是完成还是失败。都必须保持事务内操作的一致性。当失败是，都要对前面的操作进行会滚，不管中途是否成功。</li><li>隔离性：当多个事务操作一个数据的时候，为防止数据损坏，需要将每个事务进行隔离，互相不干扰</li><li>持久性：事务开始就不会终止，他的结果不受其他外在因素的影响</li></ul><p>在MySQL中可以设置事务的隔离级别：</p><table><thead><tr><th>SQL语句</th><th>含义</th></tr></thead><tbody><tr><td>SHOW VARIABLES like &#39;%transaction&#39;</td><td>显示事务的隔离级别</td></tr><tr><td>set transction level **</td><td>设置隔离级别</td></tr><tr><td>set session transaction level **</td><td>当前会话的事务隔离级别</td></tr><tr><td>set global transaction level **</td><td>当前全局的事务隔离级别</td></tr></tbody></table><p>MySQL当中有五种隔离级别：</p><table><thead><tr><th>隔离级别</th><th>具体含义</th></tr></thead><tbody><tr><td>NONE</td><td>不使用事务</td></tr><tr><td>READ UNCOMMITED</td><td>允许脏读</td></tr><tr><td>READ COMMITED</td><td>防止脏读，是最常用的隔离级别</td></tr><tr><td>REPEATABLE READ</td><td>防止脏读和不可重复读，MySQL默认</td></tr><tr><td>SERIALIZABLE</td><td>事务串行，可以防止脏读、幻读、不可重复度</td></tr></tbody></table><p>五种隔离级别，级别越高，事务的安全性是更高的，但是，事务的并发性能也会越低。</p><h2 id="mysql的锁有哪些-什么是间隙锁" tabindex="-1"><a class="header-anchor" href="#mysql的锁有哪些-什么是间隙锁" aria-hidden="true">#</a> MySQL的锁有哪些？什么是间隙锁？</h2><p>从锁的粒度来区分：</p><p>1）行锁：加锁粒度小，但是加锁的资源开销比较大。InnoDB支持</p><p>共享锁：读锁，表示多个事务可以对同一个数据共享同一把锁，持有锁的事务都可以访问数据，但是只读不能修改。 <code>select ** LOCK IN SHARE MODE</code></p><p>排他锁：写锁，只有一个事务能够获得排他锁，其他事务都不能获取该行的锁。InnoDB会对update，delete、insert语句自动添加排他锁。select ** for update。</p><p>自增锁：通常是针对MySQL当中的自增字段。如果有事务会滚这种情况，数据会回滚，但是自增序列不会回滚。</p><p>2）表锁：加锁粒度大，加锁资源开销比较小，MyIAM和InnoDB都支持。</p><p>表共享读锁，表排他写锁</p><p>意向锁：是InnoDB自动添加的一种锁，不需要用户干预。</p><p>3）全局锁：Flush tables with read lock，加锁之后整个数据库实例都处于只读状态，所有的数据变更操作都会被挂起，一般用于全库备份的时候</p><p>常见的锁算法：</p><p>1、记录锁：锁一条具体的数据。</p><p>2、间隙锁：RR隔离级别下，会加间隙锁。锁一定的范围，而不是锁具体的记录，是为了防止产生幻读。</p><p>3、Next-key：间隙锁 + 右记录锁。</p><h2 id="mysql索引结构是什么样的" tabindex="-1"><a class="header-anchor" href="#mysql索引结构是什么样的" aria-hidden="true">#</a> MySQL索引结构是什么样的？</h2><p>二叉树 -&gt; AVL树 -&gt; 红黑树 -&gt; B-树 -&gt; B+树</p><p>二叉树：每个节点最多只有两个子节点，左边的子节点都比当前节点小，右边的子节点都比当前节点大。</p><p>AVL:树中任意节点的两个子树的高度差最大为1.</p><p>红黑树：1、每个节点都是红色或者黑色 2、根节点是黑色 3、每个叶子节点都是黑色的空节点。4、红色节点的父子节点都必须是黑色。5、从任一节点到其中每个叶子节点的所有路径都包含相同的黑色节点。</p><p>B-树：1、B-树的每个非叶子节点的子节点个数都不会超过D（这个D就是B-树的阶）2、所有的叶子节点都在同一层 3、所有节点关键字都是按照递增顺序排列。</p><p>B+树：1、非叶子节点不存储数据，只进行数据索引 2、所有数据都存储在叶子节点当中 3、每个叶子节点都存有相邻叶子节点的指针 4、叶子节点按照本身关键字从小到大排序。</p><h2 id="聚簇索引和非聚簇索引有什么区别" tabindex="-1"><a class="header-anchor" href="#聚簇索引和非聚簇索引有什么区别" aria-hidden="true">#</a> 聚簇索引和非聚簇索引有什么区别？</h2><p>聚簇索引：数据和索引是在一起。</p><p>非聚簇索引：数据和索引不在一起。</p><p>MyISAM使用的非聚簇索引，树的子节点上的data不是数据本身，而是数据存放的地址，InnoDB采用的是聚簇索引，树的叶子节点上的data就是数据本身。</p><p>聚簇索引的数据是物理存放顺序和索引顺序是一致的，所以一个表中只能有一个聚簇索引，而非聚簇索引可以有多个。</p><p>InnoDB中，如果表定义了PK，那PK就是聚簇索引，如果没有PK，就会找一个非空的unique列作为聚簇索引。否则，InnoDB会创建一个隐藏的row-id作为聚簇索引。</p><h2 id="mysql的索引覆盖和回表是什么" tabindex="-1"><a class="header-anchor" href="#mysql的索引覆盖和回表是什么" aria-hidden="true">#</a> MySQL的索引覆盖和回表是什么？</h2><p>如果只需要在一颗索引树上就可以获取SQL所需要的所有列，就不需要再回表查询，这样查询速度就可以更快。</p><p>实现索引覆盖最简单的方式就是将要查询的字段，全部建立到联合索引当中。</p><h2 id="mysql集群是如何搭建的-读写分离是怎么做的" tabindex="-1"><a class="header-anchor" href="#mysql集群是如何搭建的-读写分离是怎么做的" aria-hidden="true">#</a> MySQL集群是如何搭建的？读写分离是怎么做的？</h2><p>MySQL主从结构原理：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210630005801.png" alt="img" style="zoom:67%;"><p>MySQL通过将主节点的Binlog同步给从节点完成主从之间的数据同步。</p><p>MySQL的主从集群只会讲Binlog从主节点同步到从节点，而不会反过来同步问题。</p><p>因为要保证主从之间的数据一致，写数据的操作只能在主节点完成。而读数据的操作，可以在主节点或者从节点上完成。</p><p>这种方式有丢失数据的风险，可以采用半同步的方式：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210630005820.png" alt="img" style="zoom:67%;"><h2 id="mysql如何进行分库分表-多大数据量需要进行分库分表-分库分表的方式和分片策略由哪些-分库分表后-sql语句执行流程是怎样的" tabindex="-1"><a class="header-anchor" href="#mysql如何进行分库分表-多大数据量需要进行分库分表-分库分表的方式和分片策略由哪些-分库分表后-sql语句执行流程是怎样的" aria-hidden="true">#</a> MySQL如何进行分库分表？多大数据量需要进行分库分表？分库分表的方式和分片策略由哪些？分库分表后，SQL语句执行流程是怎样的？</h2><p>什么是分库分表：就是当表中的数据量过大时，整个查询效率就会降低的非常明显，这是为了提升查询效率，就要将一个表中的数据分散到多个数据库的多个表当中。</p><p>数据分片的方式有垂直分片和水平分片。垂直分片就是从业务角度将不同的表拆分到不同的表中，能够解决数据库数据文件过大的问题，但是不能从根本上解决查询问题。水平分片就是从数据角度将一个表中的数据拆分到不同的库或者表中，这样可以从根本上解决数据量过大造成的查询效率低的问题。</p><p>常见的分片策略有：</p><ul><li>取余/取模：优点：均匀存放数据，缺点，扩容非常麻烦</li><li>按照范围分片：比较好扩容，数据分布不够均匀</li><li>按照时间分片：比较容易将热点数据区分出来</li><li>按照枚举值分片：例如按地区分片</li><li>按照目标字段前缀指定进行分区：自定义业务规则分片</li></ul><p>建议：一个表的数据量超过500W或者数据文件超过2G，就要考虑分库分表了，分库分表最常用的组件：MyCat、ShardingSphere</p><p>ShardingSphere分库分表的执行流程：</p><img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210630005831.png" alt="img" style="zoom:50%;"><p>与之相关的会衍生出一系列的问题，例如一个user表，按照userid进行了分片，然后我需要按照sex字段去查，这样怎么查？强制指定只查一个数据库，要怎么做？查询结果按照userid来排序，要怎么排？</p><p>分库分表也并不是完美的，在解决了一些问题的同时，也带来了一定的缺点：</p><ul><li>事务一致性问题</li><li>跨节点关联查询问题</li><li>跨节点分页、排序函数</li><li>主键避重</li></ul><h2 id="mysql的索引结构为什么使用b-树" tabindex="-1"><a class="header-anchor" href="#mysql的索引结构为什么使用b-树" aria-hidden="true">#</a> Mysql的索引结构为什么使用B+树？</h2><p>总体来说有以下好处：</p><ul><li>可以减少磁盘IO的次数</li><li>能够很好的同时支持等值查询和范围查询 <ul><li>等值查询：哈希表、跳表不适合范围查询</li><li>范围查询：二叉树/红黑树可以很好的满足范围查询，但当树过高时，会带来磁盘IO过高的问题；B树的范围查询，会一直到根节点再到叶子节点查询，B+树解决了范围查询的带来的问题</li></ul></li><li>B树的查询效率不稳定，在O(1-logN)之前，而B+树可以稳定在O(logN)</li></ul><p>完整链接：https://juejin.cn/post/7081065180301361183</p><h2 id="mysql的三种删除方式的区别" tabindex="-1"><a class="header-anchor" href="#mysql的三种删除方式的区别" aria-hidden="true">#</a> Mysql的三种删除方式的区别？</h2><table><thead><tr><th>删除方式</th><th>区别</th></tr></thead><tbody><tr><td>delete</td><td>删除数据，保留表结构，可以有条件的删除，也可以回滚数据，删除数据时进行两个动作：删除与备份</td></tr><tr><td>truncate</td><td>删除所有数据，无条件选择删除，不可回滚，保留表结构</td></tr><tr><td>drop</td><td>删除数据和表结构 删除速度最快</td></tr></tbody></table><h2 id="mysql的sql优化思路" tabindex="-1"><a class="header-anchor" href="#mysql的sql优化思路" aria-hidden="true">#</a> MySQL的SQL优化思路？</h2><p>SQL优化的思路：</p><ul><li>定位优化对象的性能瓶颈，确定时IO还是CPU瓶颈</li><li>从Explain入手，保证索引生效</li></ul><h2 id="mysql的索引类型" tabindex="-1"><a class="header-anchor" href="#mysql的索引类型" aria-hidden="true">#</a> MySQL的索引类型？</h2><p>MySQL目前主要有以下几种索引类型：</p><ul><li>普通索引</li><li>唯一索引</li><li>主键索引</li><li>组合索引</li><li>全文索引</li></ul>`,82),r=[i];function h(p,n){return l(),d("div",null,r)}const o=t(a,[["render",h],["__file","MySQL.html.vue"]]);export{o as default};
