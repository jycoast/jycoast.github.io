# MySQL性能优化

## MySQL索引结构

索引是帮助MySQL高效获取数据的排好序的数据结构。

常见索引的数据结构：

- 二叉树
- 红黑树
- Hash表
- B-Tree

索引的图示：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302262254017.png" alt="image-20230226225419956" style="zoom:67%;" />

### B-Tree

- 叶子结点具有相同的深度，叶子结点的指针为空
- 所有索引元素不重复
- 结点中的数据索引从左到右递增排列

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302262313981.png" alt="image-20230226231317920" style="zoom:67%;" />

### B+Tree

- 非叶子结点不存储data，只存储索引（冗余），可以放更多的索引
- 叶子结点包含所有索引字段
- 叶子结点用指针连接，提高区间访问的性能

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302262314196.png" alt="image-20230226231446146" style="zoom:67%;" />

查询MySQL页大小：

```sql
show global status like 'innodb_page_size';
```

默认页大小是16KB，每个非叶子结点可以放16KB/（8+6）B大约1170个元素，每个页可以放1170*1170再乘以16KB约2000多万的数据。

### Hash

对索引的key进行一次hash计算就可以定位出数据存储的位置。

- 很多时候Hash索引要比B+树索引更高效
- 仅能满足“=”，“IN”，不支持范围查询
- hash冲突问题

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302262316121.png" alt="image-20230226231630067" style="zoom:67%;" />

### 索引实现

InnoDB索引实现（聚集）

- 表数据文件本身就是按B+Tree组织的一个索引结构文件

- 聚集索引-叶子结点包含了完整的数据记录

- 为什么建议InnoDB表必须建主键，并且推荐使用整型的自增主键？

  如果没有主键，InnoDB引擎会自动选择所有数据都不相等的列，如果没有所有数据都不相等的列，则会使用rowId来构建B+树。使用整型的主键可以方便的比较大小，另外整型的存储空间也比较小。不是自增的主键在插入的时候，B+树可能会出现分裂和平衡的现象，从而影响性能。

- 为什么非主键索引结构的叶子结点存储的是主键值？

  主要是基于一致性和节省存储空间的考虑。

![image-20230226232108067](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302262321123.png)

MyISAM索引文件和数据文件是分离的（非聚集）：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302262322679.png" alt="image-20230226232224625" style="zoom:67%;" />

多列索引的结构：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302262323991.png" alt="image-20230226232307940" style="zoom:67%;" />

会按照索引列的顺序来维护B+树，在上面这个例子中，InnoDB会先排好name，再比较age，再比较position，如果有一个字段可以排序，就不会再看后面的字段。

## EXPLAIN详解

```sql
DROP TABLE IF EXISTS `actor`;
CREATE TABLE `actor` (
	`id` INT ( 11 ) NOT NULL,
	`name` VARCHAR ( 45 ) DEFAULT NULL,
	`update_time` datetime DEFAULT NULL,
	PRIMARY KEY (`id`) 
) ENGINE = INNODB DEFAULT CHARSET = utf8;

INSERT INTO `actor` ( `d`, `name`, `update_time` )
VALUES (1, 'a', '2017‐12‐22 15:27:18' ),(2,  'b', '2017‐12‐22 5:27:18' ), (3, 'c', '2017‐12‐22 5:27:18' );

DROP TABLE IF EXISTS `film`;
CREATE TABLE `film` (
	`id` INT ( 11 ) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR ( 10 ) DEFAULT NULL,
	PRIMARY KEY ( `id` ),
	KEY `idx_name` ( `name` )
) ENGINE = INNODB DEFAULT CHARSET = utf8;

INSERT INTO `film` ( `id`, `name` ) VALUES ( 3, '=film0' ),(1,'=film1' ),( 2, 'film2' );

DROP TABLE IF EXISTS `film_actor`;
CREATE TABLE `film_actor` (
	`id` INT ( 11 ) NOT NULL,
	`film_id` INT ( 11 ) NOT NULL,
	`actor_id` INT ( 11 ) NOT NULL,
	`remark` VARCHAR ( 255 ) DEFAULT NULL,
	PRIMARY KEY ( `id` ),
	KEY `idx_film_actor_id` ( `film_id`, `actor_id` )
) ENGINE = INNODB DEFAULT CHARSET = utf8;

INSERT INTO `film_actor` ( `id`, `film_id`, `actor_id` ) VALUES( 1, 1, 1 ),(2, 1, 2 ),(3,2,1 );
```

Filtered/100可以估算出将要和explain中前一个表进行连接的行数（前一个表指explain中id值比当前表id值小的表）。

explainpartitions：相比explain多了个partitions字段，如果查询是基于分区表的话，会显示查询将访问的分区。

### EXPLAIN中的列

#### id列

select后面的是子查询，from后面的是派生表查询。

### type列

system>const

```sql
EXPLAIN SELECT min( id ) FROM film;
```



```sql
EXPLAIN EXTENDED SELECT * FROM( SELECT * FROM film WHERE id = 1 ) tmp;
```

```sql
show warnings;
```

eq_ref

```sql
EXPLAIN SELECT * FROM film_actor LEFT JOIN film ON film_actor.film_id = film.id;
```

range

```sql
EXPLAIN SELECT * FROM actor WHERE id > 1;
```

index

```sql
EXPLAIN SELECT * FROM film;
```



### 最佳实践

```sql
CREATE TABLE `employees`
(`id` int(11) NOT NULL AUTO_INCREMENT,
`name` varchar(24) NOT NULL DEFAULT '' COMMENT '姓名',
`age` int(11) NOT NULL DEFAULT '0' COMMENT '年龄',
`position` varchar(20) NOT NULL DEFAULT '' COMMENT '职位',
`hire_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入职时间',
PRIMARY KEY(`id`), KEY`idx_name_age_position` (`name`,`age`,`position`) USING BTREE)
ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='员工记录表';

INSERT INTO employees(name,age,position,hire_time) VALUES('LiLei',22,'manager',NOW());

INSERT INTO employees(name,age,position,hire_time) VALUES('HanMeimei', 23,'dev',NOW());

INSERT INTO employees(name,age,position,hire_time) VALUES('Lucy',23,'dev',NOW());
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202302282328389.png" alt="image-20230228232848332" style="zoom:67%;" />

## SQL执行底层原理

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303042341926.png" alt="image-20230304234154866" style="zoom:50%;" />

#### 连接器



### 词法分析器

SQL语句的分析分为词法分析与语法分析，mysql的词法分析由MySQLLex（MySQL自己实现的）完成，语法分析由Bison生成。除了Bison外，Java当中也有开源的词法结构分析工具，例如Antlr4，ANTLR从语法生成一个解析器，可以构建和遍历解析树。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303042342436.png" alt="image-20230304234237366" style="zoom: 50%;" />



### 优化器

经过了分析器，MySQL就知道你要做什么了。在开始执行之前，还要经过优化器的处理。优化器是在表里面有多个索引的时候，决定使用哪个索引；或者在一个语句有多表关联（join）的时候，决定使用哪个索引；或者在一个语句有多表关联（join）的时候，决定各个表的连接顺序。比如你执行下面的语句，这个语句是执行两个表的join：

```sql
select * from test1 join test2 using(ID) where test1.name=jyc and test2.name=jyc;
```

既可以从表test1里面取出name=jyc记录的ID值，再根据ID值关联到表test2，再判断test2里面的name的值是否等于jyc；也可以从表test2里面取出name=jyc的记录的ID值，再根据ID值关联到test1，再判断test1里面name的值是否等于jyc。

这两种执行方法的逻辑是一样的，但是执行的效率会有所不同，而优化器的作用就是决定选择使用哪一个方案，优化器阶段完成后，这个语句的执行方法就确定下来了，然后进入执行器阶段。如果你还有一些疑问，比如优化器是怎么选择索引的，有没有可能选择错等等。

### 执行器



### bin-log归档



## 索引优化实践

参考：

- https://note.youdao.com/ynoteshare/index.html?id=d2e8a0ae8c9dc2a45c799b771a5899f6&type=note&time=1678024153495
- https://note.youdao.com/share/?id=df15aba3aa76c225090d04d0dc776dd9&type=note

### 索引下推

数据准备如下。

```sql
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(24) NOT NULL DEFAULT '' COMMENT '姓名',
  `age` int(11) NOT NULL DEFAULT '0' COMMENT '年龄',
  `position` varchar(20) NOT NULL DEFAULT '' COMMENT '职位',
  `hire_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入职时间',
  PRIMARY KEY (`id`),
  KEY `idx_name_age_position` (`name`,`age`,`position`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='员工记录表';

INSERT INTO employees(name,age,position,hire_time) VALUES('LiLei',22,'manager',NOW());
INSERT INTO employees(name,age,position,hire_time) VALUES('HanMeimei', 23,'dev',NOW());
INSERT INTO employees(name,age,position,hire_time) VALUES('Lucy',23,'dev',NOW());

drop procedure if exists insert_emp; 
delimiter ;;
create procedure insert_emp()        
begin
  declare i int;                    
  set i=1;                          
  while(i<=100000)do                 
    insert into employees(name,age,position) values(CONCAT('zhuge',i),i,'dev');  
    set i=i+1;                       
  end while;
end;;
delimiter ;
call insert_emp();
```

对于辅助的联合索引（name，age、position），正常情况按照最左前缀原则，`select * from employess where name like 'LiLei%' and age = 22 and position = 'manager'` ，这种情况只会走name字段索引，因为根据name字段过滤完，得到的索引行里的age和position是无序的，无法很好的利用索引。

在MySQL5.6之前的版本，这个查询只能在联合索引里匹配到名字是'LiLei%'开头的索引，然后用这些索引对应的主键逐个回表，到主键索引上找出相应的记录，再对比age和position这两个字段的值是否符合。

MySQL5.6引入了索引下推优化，可以在索引遍历过程中，对索引包含的所有字段先做判断，过滤掉不符合条件的记录之后再回表，可以有效的减少索引下推优化后，上面那个查询在联合索引里匹配到名字是'LiLei%'开头的索引之后，同时还会在索引里过滤age和position这两个字段，然后用过滤完剩下的索引对应的主键id再回表查整行数据。

索引下推会减少回表次数，对于InnoDB引擎的表索引下推只能用于二级索引，InnoDB的主键索引（聚簇索引）树叶子结点上保存的是全行数据，所以这个时候索引下推并不会减少查询全行数据的效果。

### 如何选择合适的索引

```sql
set session optimizer_trace="enabled=on",end_markers_in_json=on;  --开启trace
select * from employees where name > 'a' order by position;
SELECT * FROM information_schema.OPTIMIZER_TRACE;
```

查看trace字段：

```sql
{
  "steps": [
    {
      "join_preparation": {    --第一阶段：SQL准备阶段，格式化sql
        "select#": 1,
        "steps": [
          {
            "expanded_query": "/* select#1 */ select `employees`.`id` AS `id`,`employees`.`name` AS `name`,`employees`.`age` AS `age`,`employees`.`position` AS `position`,`employees`.`hire_time` AS `hire_time` from `employees` where (`employees`.`name` > 'a') order by `employees`.`position`"
          }
        ] /* steps */
      } /* join_preparation */
    },
    {
      "join_optimization": {    --第二阶段：SQL优化阶段
        "select#": 1,
        "steps": [
          {
            "condition_processing": {    --条件处理
              "condition": "WHERE",
              "original_condition": "(`employees`.`name` > 'a')",
              "steps": [
                {
                  "transformation": "equality_propagation",
                  "resulting_condition": "(`employees`.`name` > 'a')"
                },
                {
                  "transformation": "constant_propagation",
                  "resulting_condition": "(`employees`.`name` > 'a')"
                },
                {
                  "transformation": "trivial_condition_removal",
                  "resulting_condition": "(`employees`.`name` > 'a')"
                }
              ] /* steps */
            } /* condition_processing */
          },
          {
            "substitute_generated_columns": {
            } /* substitute_generated_columns */
          },
          {
            "table_dependencies": [    --表依赖详情
              {
                "table": "`employees`",
                "row_may_be_null": false,
                "map_bit": 0,
                "depends_on_map_bits": [
                ] /* depends_on_map_bits */
              }
            ] /* table_dependencies */
          },
          {
            "ref_optimizer_key_uses": [
            ] /* ref_optimizer_key_uses */
          },
          {
            "rows_estimation": [    --预估表的访问成本
              {
                "table": "`employees`",
                "range_analysis": {
                  "table_scan": {     --全表扫描情况
                    "rows": 10123,    --扫描行数
                    "cost": 2054.7    --查询成本
                  } /* table_scan */,
                  "potential_range_indexes": [    --查询可能使用的索引
                    {
                      "index": "PRIMARY",    --主键索引
                      "usable": false,
                      "cause": "not_applicable"
                    },
                    {
                      "index": "idx_name_age_position",    --辅助索引
                      "usable": true,
                      "key_parts": [
                        "name",
                        "age",
                        "position",
                        "id"
                      ] /* key_parts */
                    }
                  ] /* potential_range_indexes */,
                  "setup_range_conditions": [
                  ] /* setup_range_conditions */,
                  "group_index_range": {
                    "chosen": false,
                    "cause": "not_group_by_or_distinct"
                  } /* group_index_range */,
                  "analyzing_range_alternatives": {    --分析各个索引使用成本
                    "range_scan_alternatives": [
                      {
                        "index": "idx_name_age_position",
                        "ranges": [
                          "a < name"      --索引使用范围
                        ] /* ranges */,
                        "index_dives_for_eq_ranges": true,
                        "rowid_ordered": false,    --使用该索引获取的记录是否按照主键排序
                        "using_mrr": false,
                        "index_only": false,       --是否使用覆盖索引
                        "rows": 5061,              --索引扫描行数
                        "cost": 6074.2,            --索引使用成本
                        "chosen": false,           --是否选择该索引
                        "cause": "cost"
                      }
                    ] /* range_scan_alternatives */,
                    "analyzing_roworder_intersect": {
                      "usable": false,
                      "cause": "too_few_roworder_scans"
                    } /* analyzing_roworder_intersect */
                  } /* analyzing_range_alternatives */
                } /* range_analysis */
              }
            ] /* rows_estimation */
          },
          {
            "considered_execution_plans": [
              {
                "plan_prefix": [
                ] /* plan_prefix */,
                "table": "`employees`",
                "best_access_path": {    --最优访问路径
                  "considered_access_paths": [   --最终选择的访问路径
                    {
                      "rows_to_scan": 10123,
                      "access_type": "scan",     --访问类型：为scan，全表扫描
                      "resulting_rows": 10123,
                      "cost": 2052.6,
                      "chosen": true,            --确定选择
                      "use_tmp_table": true
                    }
                  ] /* considered_access_paths */
                } /* best_access_path */,
                "condition_filtering_pct": 100,
                "rows_for_plan": 10123,
                "cost_for_plan": 2052.6,
                "sort_cost": 10123,
                "new_cost_for_plan": 12176,
                "chosen": true
              }
            ] /* considered_execution_plans */
          },
          {
            "attaching_conditions_to_tables": {
              "original_condition": "(`employees`.`name` > 'a')",
              "attached_conditions_computation": [
              ] /* attached_conditions_computation */,
              "attached_conditions_summary": [
                {
                  "table": "`employees`",
                  "attached": "(`employees`.`name` > 'a')"
                }
              ] /* attached_conditions_summary */
            } /* attaching_conditions_to_tables */
          },
          {
            "clause_processing": {
              "clause": "ORDER BY",
              "original_clause": "`employees`.`position`",
              "items": [
                {
                  "item": "`employees`.`position`"
                }
              ] /* items */,
              "resulting_clause_is_simple": true,
              "resulting_clause": "`employees`.`position`"
            } /* clause_processing */
          },
          {
            "reconsidering_access_paths_for_index_ordering": {
              "clause": "ORDER BY",
              "steps": [
              ] /* steps */,
              "index_order_summary": {
                "table": "`employees`",
                "index_provides_order": false,
                "order_direction": "undefined",
                "index": "unknown",
                "plan_changed": false
              } /* index_order_summary */
            } /* reconsidering_access_paths_for_index_ordering */
          },
          {
            "refine_plan": [
              {
                "table": "`employees`"
              }
            ] /* refine_plan */
          }
        ] /* steps */
      } /* join_optimization */
    },
    {
      "join_execution": {    --第三阶段：SQL执行阶段
        "select#": 1,
        "steps": [
        ] /* steps */
      } /* join_execution */
    }
  ] /* steps */
}
```

结论：全表扫描的成本低于索引扫描，所以mysql最终选择全表扫描

```sql
select * from employees where name > 'zzz' order by position;
SELECT * FROM information_schema.OPTIMIZER_TRACE;
```

查看trace字段可知索引扫描的成本低于全表扫描，所以mysql最终选择索引扫描。

```sql
set session optimizer_trace="enabled=off";    --关闭trace
```

### 常见SQL优化

优化总结：

filesort文件排序方式：

- 单路排序

  是一次性去除满足条件行的所有字段，然后在sort buffer中进行排序；

- 双路排序

  首先根据相应的条件取出相应的排序字段和可以直接定位行数据的行ID，然后在sort buffer中进行排序，排序完后需要再次取回其它需要的字段

MySQL通过比较系统变量`max_length_for_sort_data`（默认1024字节）的大小和需要查询的字段的总大小来判断使用哪种排序模式。

- 如果字段的总长度小于`max_length_for_sort_data`，那么就会使用单路排序模式
- 如果字段的总长度大于`max_length_for_sort_data`，那么就会使用双路排序模式

以下面的查询为例：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303142324426.png" alt="https://note.youdao.com/yws/public/resource/d2e8a0ae8c9dc2a45c799b771a5899f6/xmlnote/132BCE97C2C946A2B0BA3633E08D1531/76138" style="zoom:67%;" />

```sql
set session optimizer_trace="enabled=on",end_markers_in_json=on;  --开启trace
select * from employees where name = 'zhuge' order by position;
select * from information_schema.OPTIMIZER_TRACE;
```

trace排序部分结果：

```sql
"join_execution": {    --Sql执行阶段
        "select#": 1,
        "steps": [
          {
            "filesort_information": [
              {
                "direction": "asc",
                "table": "`employees`",
                "field": "position"
              }
            ] /* filesort_information */,
            "filesort_priority_queue_optimization": {
              "usable": false,
              "cause": "not applicable (no LIMIT)"
            } /* filesort_priority_queue_optimization */,
            "filesort_execution": [
            ] /* filesort_execution */,
            "filesort_summary": {                      --文件排序信息
              "rows": 10000,                           --预计扫描行数
              "examined_rows": 10000,                  --参与排序的行
              "number_of_tmp_files": 3,                --使用临时文件的个数，这个值如果为0代表全部使用的sort_buffer内存排序，否则使用的磁盘文件排序
              "sort_buffer_size": 262056,              --排序缓存的大小，单位Byte
              "sort_mode": "<sort_key, packed_additional_fields>"       --排序方式，这里用的单路排序
            } /* filesort_summary */
          }
        ] /* steps */
      } /* join_execution */
      
```

```sql
set max_length_for_sort_data = 10;    --employees表所有字段长度总和肯定大于10字节
select * from employees where name = 'zhuge' order by position;
select * from information_schema.OPTIMIZER_TRACE;
```

trace排序部分结果：

```sql

"join_execution": {
        "select#": 1,
        "steps": [
          {
            "filesort_information": [
              {
                "direction": "asc",
                "table": "`employees`",
                "field": "position"
              }
            ] /* filesort_information */,
            "filesort_priority_queue_optimization": {
              "usable": false,
              "cause": "not applicable (no LIMIT)"
            } /* filesort_priority_queue_optimization */,
            "filesort_execution": [
            ] /* filesort_execution */,
            "filesort_summary": {
              "rows": 10000,
              "examined_rows": 10000,
              "number_of_tmp_files": 2,
              "sort_buffer_size": 262136,   
              "sort_mode": "<sort_key, rowid>"         --排序方式，这里用的双路排序
            } /* filesort_summary */
          }
        ] /* steps */
      } /* join_execution */
```

```sql
 set session optimizer_trace="enabled=off";    --关闭trace
```

单路排序的详细过程：

1. 从索引name找到第一个满足`name='zhuge'`条件的主键id
2. 根据主键id取出整行，取出所有字段的值，存入sort buffer中
3. 从索引name找到下一个满足`name='zhuge'`条件的主键id
4. 重复步骤2，步骤3直到不满足`name='zhuge'`
5. 对sort_buffer中的数据按照字段position排序
6. 返回结果给客户端

双路排序的详细过程：

1. 从索引name找到第一个满足`name='zhuge'`的主键id
2. 根据主键id取出整行，把排序字段position和主键id这两个字段放到sort buffer中
3. 从索引name取出下一个满足`name='zhuge'`记录的主键id
4. 重复3、4直到不满足`name='zhuge'`
5. 对sort_buffer中的字段position和主键id按照字段position进行排序
6. 遍历排序号的id和字段position，按照id的值回到原表中取出所有字段的值返回给客户端

对于单路排序和双路排序两种模式，单路排序会把需要查询的字段都放到sort buffer中，而双路排序只会把主键和需要排序的字段放到sort buffer中进行排序，然后通过主键回到原表查询需要的字段。

如果MySQL排序内存sort buffer配置的比较小并且没有条件继续增加了，可以适当将`max_length_for_sort_data`配置小点，让优化器选择使用双路排序算法，可以在sort buffer中一次排序更多的行，只是需要再根据主键回到原表取数据。如果MySQL排序内存有条件可以配置的比较大，可以适当增大`max_length_for_sort_data`的值，让优化器选择全字段排序（单路排序），把需要的字段放到sort buffer中，这样排序后就会直接从内存里返回查询结果了。总而言之，MySQL通过`max_length_for_sort_data`这个参数来控制排序，在不同场景使用不同的排序模式，从而提升排序效率。

#### 索引设计原则

- 代码线上，索引后上
- 联合索引尽量覆盖条件
- 不要在小基数字段上建立索引
- 长字符串我们可以采用前缀索引
- where与order by冲突时优先where
- 基于慢sql查询做优化

#### 分页查询优化

对于自增且连续的主键排序的分页查询：

```sql
select * from employees ORDER BY name limit 90000,5;
```

可以优化为：

```sql
select * from employees where id > 90000 limit 5;
```

需要注意的是，这样的优化策略并不实用，因为当表中某些记录被删后，主键空缺，会导致结果不一致。另外如果原SQL是order by非主键的字段，上面的方法也会导致两条SQL的结果不一致，所以这种改写得满足以下两个条件：

- 主键自增且连续
- 结果是按照主键排序的

根据非主键字段排序的分页查询，查询的SQL如下：

```sql
select * from employees ORDER BY name limit 90000,5;
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303062319410.png" alt="img202303062319410"  />

```sql
EXPLAIN select * from employees ORDER BY name limit 90000,5;
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303062320449.png" alt="100107" style="zoom:67%;" />

发现并没有使用name字段的索引（key字段对应的值为null），原因在于扫描整个索引并没有查找到没索引的行（可能要遍历多个索引树）的成本比扫描全表的成本更高，所以优化器放弃使用索引。优化的关键是让排序时返回的字段经可能少，所以可以让排序和分页操作先查出主键，然后根据主键查到对应的记录，将SQL改写如下：

```sql
select * from employees e inner join (select id from employees order by name limit 90000,5) ed on e.id = ed.id;
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303062320671.png" alt="100106" style="zoom:67%;" />

需要的结果与原 SQL 一致，执行时间减少了一半以上，我们再对比优化前后sql的执行计划：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303062324542.png" alt="img202303062324542" style="zoom:67%;" />

#### Join关联查询优化

```sql
-- 示例表：
CREATE TABLE `t1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `a` int(11) DEFAULT NULL,
  `b` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_a` (`a`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table t2 like t1;

-- 插入一些示例数据
-- 往t1表插入1万行记录
drop procedure if exists insert_t1; 
delimiter ;;
create procedure insert_t1()        
begin
  declare i int;                    
  set i=1;                          
  while(i<=10000)do                 
    insert into t1(a,b) values(i,i);  
    set i=i+1;                       
  end while;
end;;
delimiter ;
call insert_t1();

-- 往t2表插入100行记录
drop procedure if exists insert_t2; 
delimiter ;;
create procedure insert_t2()        
begin
  declare i int;                    
  set i=1;                          
  while(i<=100)do                 
    insert into t2(a,b) values(i,i);  
    set i=i+1;                       
  end while;
end;;
delimiter ;
call insert_t2();
```

MySQL的表关联常见的有两种算法：

- Nested-Loop Join（嵌套循环连接）算法
- Block Nested-Loop Join（基于块的嵌套循环连接）算法

##### 嵌套循环连接算法

一次一行循环地从第一张表（成为驱动表）中读取行，在这行数据中取到关联字段，根据关联字段在另一张表（被驱动表）里取出满足条件的行，然后取出两张表的结果合集。

```sql
EXPLAIN select * from t1 inner join t2 on t1.a= t2.a;
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303142349707.png" alt="img202303142349707" style="zoom: 67%;" />

一般在join语句中，如果执行计划Extra中未出现Using join buffer则表示使用的join算法是NLJ。

整个过程会读取t2表的所有数据（扫描100行），然后遍历每行数据中字段a的值，根据t2表中的值索引扫描t1表中的对应行（扫描100次t1表的索引，1次扫描可以认为最终只扫描t1表一行完整数据，也就是总共t1表也扫描了100行）。因此整个过程扫描了200行。

如果被驱动表的关联字段没有索引，mysql会Block Nested-Loop Join算法。

##### 基于块的嵌套循环查询

把驱动表的数据读入到join_buffer中，然后扫描被驱动表，把被驱动表的每一行取出来跟join_buffer中的数据做对比。

```sql
EXPLAIN select * from t1 inner join t2 on t1.b= t2.b;
```

整个过程对表t1和t2都做了一次全表扫描，因此扫描的总行数为10000（表t1的数据总量）+100（表t2的数据总量）=10100。并且join_buffer里的数据是无序的，因此对表t1中的每一行，都要做100次判断，所以内存中的判断次数是100*10000=100万次。

join_buffer的大小是由参数join_buffer_size来设定的，默认值是256k。如果放不下表t2的所有数据的话，会分段放。比如t2表有1000行记录，join_buffer一次只能放800行数据，那么执行过程是先往join_buffer里放800行记录，然后从t1表里取数据跟join_buffer中的数据对比得到部分结果，然后情况buffer，再放入t2表剩余200行记录，再次从t1表里取数据跟join_buffer中数据对比，所以就多扫描了一次t1表。

被驱动表的关联字段没有索引为什么会选择BNL算法而不是用NLJ呢？

如果上面第二条SQL使用NLJ，那么扫描行树为100*10000=100万次，这个是磁盘扫描。

很显然，用BNL磁盘扫描次数少很多，相比于磁盘扫描，BNL的内存计算也会快得多，因此MySQL对于被驱动表的关联字段没有索引的关联查询，一般都会使用BNL算法，如果有索引一般选择NLJ算法，有索引的情况下，NLJ算法比BNL算法性能更高。

可以总结一下，对于关联sql的优化策略：

- 关联字段加索引
- 小表驱动大表·和exsits优化

```sql
select * from A where id in (select id from B)  
```

优化为：

```sql
select * from A where exists (select 1 from B where B.id = A.id)
```

优化原则：小表驱动大表，即小的数据集驱动大的数据集。

#### count(\*)查询优化

```sql
-- 临时关闭mysql查询缓存，为了查看sql多次执行的真实时间
set global query_cache_size=0;
set global query_cache_type=0;

EXPLAIN select count(1) from employees;
EXPLAIN select count(id) from employees;
EXPLAIN select count(name) from employees;
EXPLAIN select count(*) from employees;
```

![img202303062354867](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303062354867.png)

这四种查询的效率比较：

- 字段有索引
- 字段无索引

count(1)和count(字段)执行过程类似，

count(*)的优化常见优化方法有四种。

查询MySQL自己维护的总行数，对于myisam存储引擎的表不做不带where条件的count查询性能是很高的，因为myisam存储的引擎的表的总行数会被mysql存储在磁盘上，查询不需要计算：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303062357692.png" alt="img202303062357692" style="zoom:67%;" />

对于innodb存储引擎的表mysql不会存储表的总记录行数（因为有MVCC机制），查询count需要实时计算。

也可以使用`show table status`来优化查询，如果值需要知道表的总行数的估计值可以用如下sql查询，性能很高：

![img202303062359136](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303062359136.png)

也可以将总数维护到Redis里，插入或删除数据行的时候同时维护Redis里面的表总行数key的计数值（用incr或decr命令），但是这种方式可能不准，很难保证操作和Redis操作的事务的一致性。

最后一种方式是，插入或删除表数据行的时候同时维护计数表，让他们在同一个事务里面操作。

### MySQL数据类型的选择

在MySQL中，选择正确的数据类型，对于性能至关重要。一般应该遵循下面两步：

1. 确定合适的大类型：数字、字符串、时间、二进制；
2. 确定具体的类型：有无符号、取值范围、变长定长等。

在MySQL数据类型设置方面，尽量用更小的数据类型，因为它们通常有更好的性能，花费更少的硬件资源。并且，尽量把字段定义为NOT NULL，避免使用NULL。

### 数值类型

| 类型         | 大小                                     | 范围（有符号）                                               | 范围（无符号）                                               | 用途           |
| ------------ | ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------- |
| TINYINT      | 1 字节                                   | (-128, 127)                                                  | (0, 255)                                                     | 小整数值       |
| SMALLINT     | 2 字节                                   | (-32 768, 32 767)                                            | (0, 65 535)                                                  | 大整数值       |
| MEDIUMINT    | 3 字节                                   | (-8 388 608, 8 388 607)                                      | (0, 16 777 215)                                              | 大整数值       |
| INT或INTEGER | 4 字节                                   | (-2 147 483 648, 2 147 483 647)                              | (0, 4 294 967 295)                                           | 大整数值       |
| BIGINT       | 8 字节                                   | (-9 233 372 036 854 775 808, 9 223 372 036 854 775 807)      | (0, 18 446 744 073 709 551 615)                              | 极大整数值     |
| FLOAT        | 4 字节                                   | (-3.402 823 466 E+38, 1.175 494 351 E-38)，0，(1.175 494 351 E-38，3.402 823 466 351 E+38) | 0, (1.175 494 351 E-38, 3.402 823 466 E+38)                  | 单精度浮点数值 |
| DOUBLE       | 8 字节                                   | (1.797 693 134 862 315 7 E+308, 2.225 073 858 507 201 4 E-308), 0, (2.225 073 858 507 201 4 E-308, 1.797 693 134 862 315 7 E+308) | 0, (2.225 073 858 507 201 4 E-308, 1.797 693 134 862 315 7 E+308) | 双精度浮点数值 |
| DECIMAL      | 对DECIMAL(M,D) ，如果M>D，为M+2否则为D+2 | 依赖于M和D的值                                               | 依赖于M和D的值                                               | 小数值         |

建议：

1. 如果整形数据没有负数，如ID号，建议指定为UNSIGNED无符号类型，容量可以扩大一倍。
2. 建议使用TINYINT代替ENUM、BITENUM、SET。
3. 避免使用整数的显示宽度(参看文档最后)，也就是说，不要用INT(10)类似的方法指定字段显示宽度，直接用INT。
4. DECIMAL最适合保存准确度要求高，而且用于计算的数据，比如价格。但是在使用DECIMAL类型的时候，注意长度设置。
5. 建议使用整形类型来运算和存储实数，方法是，实数乘以相应的倍数后再操作。
6. 整数通常是最佳的数据类型，因为它速度快，并且能使用AUTO_INCREMENT。

### 日期和时间

| 类型      | 大小(字节) | 范围                                       | 格式                | 用途                     |
| --------- | ---------- | ------------------------------------------ | ------------------- | ------------------------ |
| DATE      | 3          | 1000-01-01 到 9999-12-31                   | YYYY-MM-DD          | 日期值                   |
| TIME      | 3          | '-838:59:59' 到 '838:59:59'                | HH:MM:SS            | 时间值或持续时间         |
| YEAR      | 1          | 1901 到 2155                               | YYYY                | 年份值                   |
| DATETIME  | 8          | 1000-01-01 00:00:00 到 9999-12-31 23:59:59 | YYYY-MM-DD HH:MM:SS | 混合日期和时间值         |
| TIMESTAMP | 4          | 1970-01-01 00:00:00 到 2038-01-19 03:14:07 | YYYYMMDDhhmmss      | 混合日期和时间值，时间戳 |

建议：

1. MySQL能存储的最小时间粒度为秒。
2. 建议用DATE数据类型来保存日期。MySQL中默认的日期格式是yyyy-mm-dd。
3. 用MySQL的内建类型DATE、TIME、DATETIME来存储时间，而不是使用字符串。
4. 当数据格式为TIMESTAMP和DATETIME时，可以用CURRENT_TIMESTAMP作为默认（MySQL5.6以后），MySQL会自动返回记录插入的确切时间。
5. TIMESTAMP是UTC时间戳，与时区相关。
6. DATETIME的存储格式是一个YYYYMMDD HH:MM:SS的整数，与时区无关，你存了什么，读出来就是什么。
7. 除非有特殊需求，一般的公司建议使用TIMESTAMP，它比DATETIME更节约空间，但是像阿里这样的公司一般会用DATETIME，因为不用考虑TIMESTAMP将来的时间上限问题。
8. 有时人们把Unix的时间戳保存为整数值，但是这通常没有任何好处，这种格式处理起来不太方便，我们并不推荐它。

### 字符串

| 类型       | 大小                | 用途                                                         |
| ---------- | ------------------- | ------------------------------------------------------------ |
| CHAR       | 0-255字节           | 定长字符串，char(n)当插入的字符数不足n时(n代表字符数)，插入空格进行补充保存。在进行检索时，尾部的空格会被去掉。 |
| VARCHAR    | 0-65535 字节        | 变长字符串，varchar(n)中的n代表最大字符数，插入的字符数不足n时不会补充空格 |
| TINYBLOB   | 0-255字节           | 不超过 255 个字符的二进制字符串                              |
| TINYTEXT   | 0-255字节           | 短文本字符串                                                 |
| BLOB       | 0-65 535字节        | 二进制形式的长文本数据                                       |
| TEXT       | 0-65 535字节        | 长文本数据                                                   |
| MEDIUMBLOB | 0-16 777 215字节    | 二进制形式的中等长度文本数据                                 |
| MEDIUMTEXT | 0-16 777 215字节    | 中等长度文本数据                                             |
| LONGBLOB   | 0-4 294 967 295字节 | 二进制形式的极大文本数据                                     |
| LONGTEXT   | 0-4 294 967 295字节 | 极大文本数据                                                 |

建议：

1. 字符串的长度相差较大用VARCHAR；字符串短，且所有值都接近一个长度用CHAR。
2. CHAR和VARCHAR适用于包括人名、邮政编码、电话号码和不超过255个字符长度的任意字母数字组合。那些要用来计算的数字不要用VARCHAR类型保存，因为可能会导致一些与计算相关的问题。换句话说，可能影响到计算的准确性和完整性。
3. 尽量少用BLOB和TEXT，如果实在要用可以考虑将BLOB和TEXT字段单独存一张表，用id关联。
4. BLOB系列存储二进制字符串，与字符集无关。TEXT系列存储非二进制字符串，与字符集相关。
5. BLOB和TEXT都不能有默认值。

## MySQL事务与锁

参考：http://note.youdao.com/noteshare?id=354ae85f3519bac0581919a458278a59&sub=9A8237E2B9B248B9A2F5FC5AED6CBCF1

### 事务及其属性

并发事务处理带来的问题：

- 更新丢失或脏写

  当两个或多个事务选择同一行，然后基于最初选定的值更新该行时，由于每个事务都不知道其他事务的存在，就会发生丢失更新问题，最后的更新覆盖了由其他事务所做的更新。

- 脏读

  事务A读取到了事务B已经修改但尚未提交的数据，还在这个数据基础上做了操作。此时，如果B事务回滚，A读取的数据无效，不符合一致性要求。

- 不可重复读

  事务A内部相同查询语句在不同时刻读出的结果不一致，不符合隔离性。

- 幻读

  事务A读取到了事务B提交的新增数据，不符合隔离性。

事务的隔离级别：

| 隔离级别                   | 脏读(Dirty Read) | 不可重复读(NonRepeatable Read) | 幻读(Phantom Read) |
| -------------------------- | ---------------- | ------------------------------ | ------------------ |
| 读未提交(Read uncommitted) | 可能             | 可能                           | 可能               |
| 读已提交(Read committed)   | 不可能           | 可能                           | 可能               |
| 可重复读(Repeatableread)   | 不可能           | 不可能                         | 可能               |
| 可串行化(Serializable)     | 不可能           | 不可能                         | 不可能             |

数据库的事务隔离级别越严格，并发的副作用就越小，但付出的代价也就越大，因为事务隔离实质上就是使事务在一定程度上“串行化”进行，这显然与“并发”是矛盾的。同时，不同的应用对读一致性和事务隔离程度的要求也是不同的，比如许多应用对“不可重复读”和“幻读”并不敏感，可能更关心数据并发访问的能力。

查看当前数据库的事务隔离级别：

```sql
show variables like 'tx_isolation';
```

设置事务隔离级别：

```sql
set tx_isolation='REPEATABLE-READ';
```

MySQL默认的事务隔离级别是可重复读，用Spring开发程序时，如果不设置隔离级别默认用MySQL设置的隔离级别，如果Spring设置了就用已经设置的隔离级别。

### MySQL中的锁的分类

锁是计算机协调多个进程或线程并发访问某一资源的机制。

在数据库中，除了传统的计算资源（如CPU、RAM、I/O等）的争用以外，数据也是一种供需要用户共享的资源。如何保证数据并发访问的一致性、有效性是所有数据库必须解决的一个问题，锁冲突也是影响数据库并发访问性能的一个重要因素。

- 从性能上分为乐观锁（用版本对比来实现）和悲观锁；

- 从对数据操作的粒度分，分为表锁和行锁；

- 从对数据库操作的类型分，分为读锁和写锁（都属于悲观锁），还有意向锁；

  - 读锁：

  - 写锁：

  - 意向锁：

    意向锁主要分为：

    - 意向共享锁，IS锁，对整个表加共享锁之前，需要先获取到意向共享锁
    - 意向拍他锁，IX锁，对整个表加拍他锁之前，需要先获取到意向排他锁

### 表锁

每次操作锁住整张表。开销小，加锁快；不会出现死锁；锁定粒度大，发生锁冲突的概率最高，并发度最低；一般用在整表数据迁移的场景。

```sql
--建表SQL
CREATE TABLE `mylock` (
	`id` INT (11) NOT NULL AUTO_INCREMENT,
	`NAME` VARCHAR (20) DEFAULT NULL,
	PRIMARY KEY (`id`)
) ENGINE = MyISAM DEFAULT CHARSET = utf8;

--插入数据
INSERT INTO`test`.`mylock` (`id`, `NAME`) VALUES ('1', 'a');
INSERT INTO`test`.`mylock` (`id`, `NAME`) VALUES ('2', 'b');
INSERT INTO`test`.`mylock` (`id`, `NAME`) VALUES ('3', 'c');
INSERT INTO`test`.`mylock` (`id`, `NAME`) VALUES ('4', 'd');
```

手动增加表锁：

```sql
lock table 表名称 read(write),表名称2 read(write);
```

查看表上加过的锁：

```sql
show open tables;
```

删除表锁：

```sql
unlock tables;
```

#### 行锁

每次操作锁住一行数据，开销大，加锁慢，会出现死锁，锁定粒度最小，发生锁冲突的概率最低，并发度最高。

MyISAM在执行查询语句SELECT前会给涉及的所有表加读锁，在执行update、insert、delete操作会自动给涉及的表加写锁。

InnoDB在执行查询语句SELECT时（非串行隔离级别），不会加锁，但是update、insert、delete操作会加行锁。简而言之，就是读锁会阻塞写，但是不会阻塞读。而写锁组会把读和写都阻塞。

可以基于以下实例来分析行锁。

```sql
CREATE TABLE `account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `balance` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `test`.`account` (`name`, `balance`) VALUES ('lilei', '450');
INSERT INTO `test`.`account` (`name`, `balance`) VALUES ('hanmei', '16000');
INSERT INTO `test`.`account` (`name`, `balance`) VALUES ('lucy', '2400');
```

MySQL的乐观锁：

```sql
update account set balance = balance - 50 where id = 1
```

这主要是由于MySQL在可重复读的隔离级别下使用了MVCC机制，select操作不会更新版本号，是快照读（历史版本）；insert、update和delete会更新版本号，是当前读（当前版本）。

### 间隙锁

间隙锁，锁住的是两个值之间的空隙，间隙锁在某些情况下可以解决幻读的问题。假设account表里的数据如下：

![img202303132335506](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303132335506.png)

如果执行下面的SQL：

```sql
update account set name = 'zhuge' where id > 8 and id < 18;
```

那么产生的间隙就有id为(3,10)，(10,20)，(20,正无穷)这三个区间。此时其他Session没法在这个范围锁包含的所有行记录（包含间隙行记录）以及行记录所在的间隙里插入或修改任何数据，即id在(3,20]区间都无法修改数据，注意20也包含在内。

间隙锁只有在可重复读的隔离级别下才会生效的。

### 临键锁

临键锁是行锁与间隙锁的组合，上面的例子中(3,20]的整个区间就可以叫做临键锁。

在可重复读的隔离级别下，锁主要是加在索引上，如果对非索引字段更新，行锁可能会变表锁，即无索引行锁会升级为表锁。

锁定某一行还可以用lock in share（共享锁）和for update（排他锁），例如：

```sql
select * from test_innodb_lock where a = 2 for update;
```

这样其他session只能读这行数据，修改则会被阻塞，直到锁定行的session提交。

### 行锁分析

可以通过下面的SQL语句查询数据的行锁的情况：

```sql
show status like 'innodb_row_lock%';
```

各个变量的含义：

- Innodb_row_lock_current_waits: 当前正在等待锁定的数量
- Innodb_row_lock_time: 从系统启动到现在锁定总时间长度
- Innodb_row_lock_time_avg: 每次等待所花平均时间
- Innodb_row_lock_time_max：从系统启动到现在等待最长的一次所花时间
- Innodb_row_lock_waits: 系统启动后到现在总共等待的次数

其中比较重要的有Innodb_row_lock_time_avg（等待平均时长）、Innodb_row_lock_waits（等待总次数）、Innodb_row_lock_time（等待总时长）。尤其是当等待次数很高，而且每次等待时长也不小的时候，我们就需要分析系统中为什么会有如此多的等待，然后根据分析结果着手制定优化计划。

查看INFORMATION_SCHEMA系统库锁相关数据表：

```sql
-- 查看事务
select * from INFORMATION_SCHEMA.INNODB_TRX;
-- 查看锁
select * from INFORMATION_SCHEMA.INNODB_LOCKS;
-- 查看锁等待
select * from INFORMATION_SCHEMA.INNODB_LOCK_WAITS;

-- 释放锁，trx_mysql_thread_id可以从INNODB_TRX表里查看到
kill trx_mysql_thread_id

-- 查看锁等待详细信息
show engine innodb status\G; 
```

### 锁优化建议

- 尽可能让所有数据检索都通过索引来完成，避免无索引行锁升级为表锁
- 合理设计索引，尽量缩小锁的范围
- 尽可能减少检索条件范围，避免间隙锁
- 尽可能控制事务大小，减少锁定资源量和实践长度，涉及事务加锁的sql尽量放在事务的最后执行
- 尽可能低级别事务隔离

## MVCC与BufferPool缓冲机制

参考：http://note.youdao.com/noteshare?id=b36b975188fadf7bfbfd75c0d2d6b834&sub=5A7459FE4B464EC896F9DD9A4EB64942

MySQL在读已提交和可重复读的隔离级别下的隔离性都依靠MVCC（Multi-Version Concurrency Control）机制来实现，对一行数据的读和写两个操作默认是不会通过加锁互斥来保证隔离性，避免了频繁加锁互斥。只有在串行化的隔离级别下，为了保证比较高的隔离性，是通过将所有操作加锁互斥来实现的。

### MVCC机制

在了解MVCC多版本并发控制之前，我们必须首先了解一下，什么是MySQL InnoDB下的当前读和快照读。

- 当前读：读取记录最新的版本，读取时还要保证其他并发事务不能修改当前记录，会对读取的记录进行加锁，`select lock in share mode(共享锁),select for update,update,insert,delete（排他锁）`，这些都是当前读。
- 快照读：不加锁的非阻塞读。快照读的前提是隔离级别不是串行级别，串行级别下的快照读会退化成当前读，之所以出现快照读的情况，是基于提高并发性能的考虑，快照读的实现是基于多版本并发控制，即MVCC，可以认为MVCC是行锁的一个变种，但是在很多情况下，避免了加锁操作，降低了开销。需要注意的是，快照读读到的并不一定是数据的最新版本，而有可能是之前的历史版本。

当前读实际上是一个悲观锁的操作，而MVCC实现了快照读和写冲突不加锁。

多版本并发控制（MVCC）是一种解决读-写冲突的无锁并发控制，也就是为事务分配单向增长的时间戳，为每个修改保存一个版本，版本与事务时间戳关联，读操作只读该事务开始前的数据库的快照。所以MVCC可以为数据库解决一下问题：在并发读写数据库时，可以做到在读操作时不用阻塞写操作，写操作也不用阻塞读操作，提高了数据库并发读写的性能，同时还可以解决脏读，幻读，不可重复读等事务隔离问题，但不能解决更新丢失问题。

### undo日志版本链与read view机制详解
数据库当中的每一行记录除了我们自定义的字段外，还有数据库隐式定义的DB_ROW_ID、DB_TRX_ID、DB_ROLL_PTR等字段，它们的含义如下：

- DB_ROW_ID（6byte），隐含的自增ID（隐藏主键），如果数据表没有主键，InnoDB会自动以DB_ROW_ID产生一个聚簇索引
- DB_TRX_ID（6byte），最近修改（修改/插入）事务ID，记录创建这条记录/最后一次修改该记录的事务ID
- DB_ROLL_PTR（7byte），回滚指针，指向这条记录的上一个版本（存储于rollback segment里）
- DELETE_BIT（1byte），记录被更新或删除并不代表真的删除，而是删除的flag变了

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309031058849.png" alt="image-20230903105843745" style="zoom:67%;" />

上图中，DB_ROW_ID是数据库默认为改行记录生成唯一隐式主键，DB_TRX_ID是当前操作该记录的事务ID，而DB_ROLL_PTR是一个回滚指针，用于配合undo日志，指向上一个旧版本。

InnoDB把这些为了回滚而记录的这些东西称之为undo log，需要注意的是，由于查询操作（SELECT）并不会修改任何用户记录，所以在查询操作时，并不需要记录相应的undo log。undo log主要分为3种：

- Insert undo log：插入一条记录时，至少要把这条记录的主键值记下来，之后回滚的时候只需要把这个主键值对应的记录删掉就好了
- Update undo log：修改一条记录时，至少要把修改这条记录之前的旧值都记录下来，这样之后回滚时再把这条记录更新为旧值就好了
- Delete undo log：删除一条记录时，至少要把这条记录中的内容都记下来，这样之后回滚时再把由这些内容组成的记录插入到表中就好了
  - 删除操作都只是设置一下老记录的DELETE_BIT，并不真正将过时的记录删除
  - 为了节省磁盘空间，InnoDB有专门的purge线程来清理DELETE_BIT为true的记录。为了不影响MVCC的正常工作，purge线程自己也维护了一个read view（这个read view相当于系统中最老活跃事务的read view），如果某个记录的DELETED_BIT为true。并且DB_TRX_ID相对于purge线程的read view可见，那么这条记录一定是可以被安全清除的。

对MVCC有帮助的实质是update undo log，undo log实际上就是存在rollback segment中旧记录链，它的执行流程如下：

比如有一个事务插入person表插入了一条新的记录，name为Jerry，age为24岁，隐式主键是1，事务ID和回滚指针，我们假设为NULL

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309031119809.png" alt="image-20230903111925716" style="zoom:67%;" />

现在来了一个事务1对该记录的name做出了修改，改为Tom，修改的数据的过程如下：

1. 在事务1修改该行数据时，数据库会先对该行加排他锁
2. 然后把该行数据拷贝到undo log中，作为旧记录，即在undo log中有当前行的拷贝副本
3. 拷贝完毕后，修改该行name为Tom，并且修改隐藏字段的事务ID为当前事务1的ID，我们默认从1开始，之后递增，回滚指针指向拷贝到undo log的副本记录
4. 事务提交后，释放锁

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309031125259.png" alt="image-20230903112512158" style="zoom:50%;" />

假设又来了事务2修改person表的同一条记录，将age修改为30岁，修改数据的过程如下：

1. 在事务2修改该行数据时，数据先加行锁
2. 然后把改行数据拷贝到undo log中，作为旧记录，发现该行记录已经有undo log了，那么最新的旧数据作为链表的表头，插在该行记录的undo log的最前面
3. 修改该行age为30岁，并且修改隐藏字段的事务ID作为当前事务2的ID，就是2，回滚指针指向刚刚拷贝到undo log的副本记录
4. 事务提交，释放锁

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309031129124.png" alt="image-20230903112923029" style="zoom: 50%;" />

从上面的过程可以看出，不同事务或者相同事务的对同一记录的修改，会导致该记录的undo log成为一条记录版本先行表，即链接，undo log的链首就是最新的旧记录，链尾就是最早的旧记录。当事务提交后，purge线程会清除掉没有用的节点。

MySQL会用read view来做可见性的判断，当某个事物执行快照读的时候，对该记录创建一个Read view读视图，把它比作条件用来判断当前事务能够看到哪个版本的数据，即可能是当前最新的数据，也有可能是该行记录的undo log里面的某个版本的数据。

Read view遵循一个可见性算法，主要是将要被修改的数据的最新记录中的DB_TRX_ID（即当前事务ID）取出来，与系统当前其他活跃事务的ID去对比（由Read view维护），如果DB_TRX_ID跟Read View的属性做了某些比较，不符合可见性，那就通过DB_ROLL_PTR回滚指针去取出Undo Log中的DB_TRX_ID再比较，即遍历链表的DB_TRX_ID（从链首到链尾，即从最近的一次修改查起），直到找到满足特定条件的DB_TRX_ID，那么这个DB_TRX_ID所在的旧记录就是当前事务能看见的最新老版本。

```c
/* 判断某个事务的修改对当前事务是否可见 */
bool changes_visible(){

        /**
         * 可见的情况：
         *  1. 小于低水位线，即创建快照时，该事务已经提交(或回滚)
         *  2. 事务ID是当前事务。
         */
        if (id < m_up_limit_id || id == m_creator_trx_id) {
            return(true);
        }

        if (id >= m_low_limit_id) { /* 高于水位线不可见，即创建快照时，该事务还没有提交 */
            return(false);

        } else if (m_ids.empty()) { /* 创建快照时，没有其它活跃的读写事务时，可见 */

            return(true);
        }

        /**
         * 执行到这一步，说明事务ID在低水位和高水位之间，即 id ∈ [m_up_limit_id, m_low_limit_id)
         * 需要判断是否属于在活跃事务列表m_ids中，
         * 如果在，说明创建快照时，该事务处于活跃状态（未提交），修改对当前事务不可见。
         */

        // 获取活跃事务ID列表，并使用二分查找判断事务ID是否在 m_ids中
        const ids_t::value_type*	p = m_ids.data();
        return(!std::binary_search(p, p + m_ids.size(), id));
}
```

Read View有三个全局属性：

- trx_list未提交事务ID列表，用来维护Read View生成时刻系统正活跃的事务ID
- up_limit_id记录trx_list列表中事务ID最小的ID
- low_limit_id ReadView生成时刻系统尚未分配下一个事务ID，也就是目前已出现过的事务ID的最大值+1

undo日志版本链是指一行数据被多个事务依次修改过后，在每个事务修改完后，MySQL会保留修改前的数据undo回滚日志，并且用两个隐藏字段trx_id（事务ID）和roll_pointer（上一条数据的历史版本指针）把这些undo日志串联起来形成一个历史记录版本链，具体如下图。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303132312446.png" alt="img202303132312446" style="zoom:60%;" />

在可重复读的隔离级别下，当事务开启后，执行任何查询sql时会生成当前事务的一致性视图read-view，该视图在事务结束之前都不会变化（如果是读已提交的隔离级别会在每次执行查询sql时都会重新生成），这个视图由执行查询时所有未提交事务id数组（数组里最小的id为min_id）和已创建的最大事务id（max_id）组成，事务里的任何sql查询结果需要从对应版本链里的最新数据开始逐条跟read-view做比对从而得到最终的快照结果。

版本链的比对规则如下：

- 如果row的trx_id落在绿色部分（trx），表示在这个版本是由已提交的事务生成的，这个事务是可见的
- 如果row的trx_id落在红色部分，表示这个版本是由将来启动的事务生成的，是不可见的（若row的trx_id就是当前自己的事务是可见的）
- 如果row的trx_id落在黄色部分，此时包含两种情况：
  - 如果row的trx_id在视图数组中，表示这个版本是由还未提交的事务生成的，不可见（若row的trx_id就是当前自己的事务则是可见的）
  - 如果row的trx_id不在视图数组中，表示这个版本已经提交了的事务生成的，事务是可见的

对于删除的情况可以认为是update的特殊情况，会将版本链上最新的数据复制一份，然后将trx_id修改成删除操作的trx_id，同时在该条记录的头信息（record header）里的（deleted_flag）标记位写上true，来表示当前记录已经被删除，在查询时按照上面的规则查到对应的记录如果delete_flag 标记位为true，意味着记录已被删除，则不返回数据。

<div class="note warning">begin/start transaction 命令并不是一个事务的起点，在执行到它们之后的第一个修改InnoDB操作的语句，事务才真正启动，才会向mysql申请事务id，mysql内部是严格按照事务的启动顺序来分配事务id的。</div>

总而言之，MVCC机制的实现就是通过read-view机制与undo版本链对比机制，使得不同的事务会根据数据版本链对比规则读取同一条数据在版本链上的不同版本数据。

RC，RR级别下的InnoDB快照读有什么不同？

正式Read view生成时机的不同，从而造成RC、RR级别下快照读的结果不同。

- 在RR级别下的某个事务对某条记录的第一次快照读会创建一个快照及Read View，将当前活跃的其他的事务记录起来，此后在调用快照读的时候，还是使用的是同一个Read View，所以只要当前事务在其他事务提交更新之前使用过快照读，那么之后的快照读使用的都是同一个Read View，所以对之后的修改不可见。即RR级别下，快照读生成Read View时，Read View会记录此时所有其他活动事务的快照，这些事务的修改对于当前事务都是不可见的。而早于Read View创建的事务所做的修改均是可见
- 在RC级别下的事务中，每次读快照都会重新生成一个快照和Read View，这就是为什么我们可以在RC级别下的事务中可以看到别的事务提交的更新的原因

总而言之，在RC隔离级别下，是每个快照读都会生成并获取最新的Read View，而在RR隔离级别下，则是同一个事务中的第一个快照读才会创建Read View，之后的快照读获取的都是同一个Read View。

### BufferPool缓存机制

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202303132313860.png" alt="img202303132313860" style="zoom: 67%;" />

为什么MySQL不直接更新磁盘上的数据而是设计了这么复杂的一套机制来执行SQL？

主要是因为来一个请求就直接对磁盘文件进行随机读写，由于磁盘随机读写的相比顺序读写的性能是非常差的，所以直接更新磁盘文件里的数据性能会很差。MySQL的这套机制看起来虽然复杂，但是它可以保证每个更新请求都是更新内存中的BufferPool，然后顺序写日志文件，同时还能保证各种异常情况下的数据一致性。更新内存的数据的性能是很高的，顺序写磁盘上的日志文件的性能也是很高的，正是这两点，才能让MySQL拥有较高的并发能力。

## MySQL成本分析

在MySQL5.6之前的版本来说，只能通过EXPLAIN语句查看到最后优化器决定使用的执行计划，却无法知道它为什么做这个决策。在MySQL5.6之后的版本中，MySQL提出了optimizer trace的功能，这个功能可以让我们方便的查看优化器执行计划的整个过程。

```sql
SET optimizer_trace = "enabled=on";

SELECT *
FROM order_exp
WHERE order_no IN ('DD00_6S', 'DD00_9S', 'DD00_10S')
	AND expire_time > '2021-03-22 18:28:28'
	AND expire_time <= '2021-03-22 18:35:09'
	AND insert_time > expire_time
	AND order_note LIKE '%7排1%'
	AND order_status = 0;

SELECT *
FROM information_schema.OPTIMIZER_TRACE;
```

可以看见全表扫描的成本：2169.9：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308082333977.png" alt="image-20230808233353895" style="zoom:50%;" />

使用索引idx_order_no的成本为72.61:

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308082334762.png" alt="image-20230808233437701" style="zoom:50%;" />

使用索引idx_expire_time的成本为47.81：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308082334695.png" alt="image-20230808233459633" style="zoom:50%;" />

最终MySQL使用了idx_expire_time作为这个SQL查询过程中索引：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308082335777.png" alt="image-20230808233521712" style="zoom:50%;" />

### MySQL查询成本

参考链接：[Mysql内核查询成本计算实战](https://note.youdao.com/ynoteshare/index.html?id=6c03ef8fa44c1d2d15e319e2f2ed5a6a&type=note&_time=1693667650557)。

一条查询语句的执行成本是由下面这两个方面组成的：

- IO成本：MyISAM、InnoDB存储引擎都是将数据和索引都存储到磁盘上的，当我们想查询表中的记录时，需要先把数据或者索引加载到内存中然后再操作。从磁盘到内存这个加载的过程损耗的时间称之为IO成本
- CPU成本：读取以及检测记录是否满足对应的搜索条件、对结果集进行排序等这些操作损耗的时间称之为CPU成本。对于InnoDB存储引擎来说，页是磁盘和内存之间交互的基本单位，MySQL规定读取一个页面花费的成本默认是1.0，读取以及检测一条记录是否符合搜索条件的成本默认是0.2。1.0、0.2这些数字称之为成本常数，这两个成本常数是我们最常用到的，也有一些其他的成本常数。

注意，不管读取记录时需不需要检测是否满足搜索条件，其成本都算是0.2。

### 单表查询的成本

在一条单表查询语句真正执行之前，MySQL的查询优化器会找出执行该语句所有可能使用的方案，对比之后找出成本最低的方案，这个成本最低的方案就是所谓的执行计划，之后才会调用存储引擎提供的接口真正的执行查询，这个过程总结一下就是这样：

1. 根据搜索条件，找出所有可能使用的索引
2. 计算全表扫描的代价
3. 计算使用不同索引执行查询的代价
4. 对比各种执行方案的代价，找出成本最低的那一个

#### 根据搜索条件，找出所有可能使用的索引

我们仍然使用如下查询语句来分析：

```sql
SELECT *
FROM order_exp
WHERE order_no IN ('DD00_6S', 'DD00_9S', 'DD00_10S')
	AND expire_time > '2021-03-22 18:28:28'
	AND expire_time <= '2021-03-22 18:35:09'
	AND insert_time > expire_time
	AND order_note LIKE '%7排1%'
	AND order_status = 0;
```

上述查询中涉及到几个搜索条件：

- `order_no IN ('DD00_6S', 'DD00_9S', 'DD00_10S')` ，这个搜索条件可以使用二级索引idx_order_no
- `expire_time> '2021-03-22 18:28:28' AND expire_time<= '2021-03-22 18:35:09'`，这个搜索条件可以使用二级索引idx_expire_time
- `insert_time> expire_time`，这个搜索条件的索引列由于没有和常数比较，所以并不能使用索引
- `order_note LIKE '%hello%'`，order_note即使有索引，但是通过LIKE操作符和以通配符开头的字符串做比较，不可以使用索引
- `order_status = 0`，由于该列上只有联合索引，而且不符合最左前缀原则，所以不会用到索引

综上所述，上边的查询语句可能用到的索引，也就是possible keys只有idx_order_no，idx_expire_time。

#### 计算全表扫描的代价

对于InnoDB存储引擎来说，全表扫描的意思就是把聚簇索引中的记录都一次和给定的搜索条件做一下比较，把符合搜索条件的记录加入到结果集，所以需要将聚簇索引对应的页面加载到内存中，然后再检测记录是否符合搜索条件。由于查询成本=I/O成本+CPU成本，所以计算全表扫描的代价需要两个信息：聚簇索引占用的页面数、该表中的记录数。

MySQL为每个表维护了一系列的统计信息，并且可以通过如下语句查询：

```sql
SHOW TABLE STATUS LIKE 'order_exp';
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308092320891.png" alt="image-20230809232056826" style="zoom:50%;" />

我们需要的两个统计项：

- Rows：这个选项表示表中的记录条数。对于使用MyISAM存储引擎的表来说，该值是准确的，对于使用InnoDB存储引擎的表来说，该值是一个估计值。所以order_exp表实际由10567条记录，但是Rows显示有10354条记录
- Data_length：这个选项表示表占用的存储空间字节数。使用MyISAM存储引擎的表来说，该值就是数据文件的大小，对于使用InnoDB存储引擎的表来说，该值就相当于聚簇索引占用的存储空间大小，也就是说可以这样计算该值的大小：Data_length = 聚簇索引的页面数量✖️每个页面的大小，order_exp使用默认16KB的页面大小，通过Data_length可以聚簇索引的页面数量 = 1589248 ➗ 16 ➗ 1024  = 97，也就是说，该表的聚簇索引的记录数为97

现在就可以根据聚簇索引占用的页面数量以及该表记录数的估计值，来计算全表扫描成本：

- IO成本 = 97 ✖️ 1.0 + 1.1 = 98.1（1.1指是加载一个页面的IO成本常数，后面的1.0是一个微调值）
- CPU成本 = 10354 ✖️ 0.2 + 1.0 = 2071.8（10354值的统计数据中表的记录数，对于InnoDB存储引擎来说是一个估计值，0.2指的是访问一条记录所需的CPU成本常数，后面的1.0是一个微调值）

MySQL在真实计算成本时会进行一些微调，这些微调的值是直接硬编码到代码里的，没有注释而且这些微调的值十分的小，并不影响我们大方向上的分析。

所以全表扫描的总成本 = 98.1 + 2071.8= 2169.9。

虽然表中的记录其实都存储在聚簇索引对应B+树的叶子结点中，所以只要我们通过根节点获得了最左边的叶子节点。就可以沿着叶子节点组成的双向链表把所有记录都查看一遍。也就是说全表扫描这个过程其实有的B+树非叶子结点是不需要访问的。但是MySQL在计算全表扫描成本时直接使用聚簇索引占用的页面数作为计算IO成本的依据，是不区分非叶子结点和叶子结点的。

#### 计算使用不同索引执行查询的代价

从上一步分析我们可以得出，上述查询可能使用到idx_order_no，idx_expire_time这两个索引，我们需要分别分析单独使用这些索引执行查询的成本，最后还要分析是否可能会使用到索引合并。MySQL查询优化器先分析使用唯一二级索引的成本，再分析使用普通索引的成本，我们这里有两个索引，先算哪个都可以。我们先分析idx_expire_time的成本，然后再看使用idx_order_no的成本。

idx_expire_time对应的搜索条件是：`AND expire_time > '2021-03-22 18:28:28' AND expire_time <= '2021-03-22 18:35:09'`，也就是说对应的范围区间是`('2021-03-22 18:28:28' , '2021-03-22 18:35:09' )`。使用idx_expire_time搜索会使用二级索引+回表方式的查询，MySQL计算这种查询的成本以来两个方面的数据：

- 范围区间数量
- 需要回表的记录数

接下来我们分别计算这两个数据。

不论某个范围区间的二级索引到底占用了多少页面，查询优化器认为读取索引的一个范围区间的IO成本和读取一个页面是相同的。本例中使用idx_expire_time的范围区间只有一个，所以相当于访问这个范围区间的二级索引付出的IO成本就是：1✖️ 1.0 = 1.0。

优化器需要计算二级索引的某个范围区间到底包含多少条记录，对于本例来说就是要计算`('2021-03-22 18:28:28' , '2021-03-22 18:35:09' )`这个范围区间内包含多少二级索引记录，计算过程如下：

1. 先根据`expire_time > '2021-03-22 18:28:28'`这个条件访问id_expire_time对应的B+树索引，找到满足`expire_time > '2021-03-22 18:28:28'`这个条件的第一条记录，我们把这条记录称之为区间最左记录。我们前面说过在B+树中定位到一条记录的过程是很快的，是常数级别的，所以这个过程的性能消耗是可以忽略不计的
2. 然后再根据`expire_time <= '2021-03-22 18:35:09`这个条件继续从id_expire_time对应的B+树索引中找出最后一条满足这个条件的记录，我们把这条记录称之为区间最右记录，这个过程的性能消耗也可以忽略不计的
3. 如果区间最左记录和区间最右记录相隔不太远（在MySQL 5.7这个版本里，只要相隔不大于10个页面即可），那就可以精确统计出`AND expire_time > '2021-03-22 18:28:28' AND expire_time <= '2021-03-22 18:35:09'`条件的二级索引记录条数。否则只沿着区间最左记录向右读10个页面，计算平均每个页面中包含多少记录，然后用这个平均值乘以区间最左记录和区间最右记录之间的页面数量就可以了

估计区间最左记录和区间最右记录之间有多少个页面，是根据B+树索引的结构来的。我们假设区间最左记录在页b中，区间最右记录在页c中，那么我们要计算区间最左记录和最右记录之间的页面数量就相当于计算页b和页c之间有多少页面，而它们父节点中记录的每一条目录项记录都对应一个数据页，所以计算页b和页c之间有多少页面就相当于计算它们父节点（也就是页a）中对应的目录项记录之间隔着几条记录。在一个页面中统计两条记录之间有几条记录的成本就很小了。

不过还有一个问题，如果页b和页c之间的页面实在太多，以至于页b和页c对应的目录项记录都不在一个父页面中怎么办？既然是树，那就继续递归，B+树的层级并不会很高，所以这个统计过程页不是很耗费性能。

MySQL根据上述算法得到索引项id_expire_time在区间`expire_time <= '2021-03-22 18:35:09`之间大约有39条记录。

```sql
explain SELECT * FROM order_exp WHERE expire_time> '2021-03-22 18:28:28' AND expire_time<= '2021-03-22 18:35:09';
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308131103330.png" alt="image-20230813110329255" style="zoom: 67%;" />

所以读取这39条二级索引记录需要付出的CPU成本就是：39✖️0.2 + 0.01 = 7.81。其中39是需要读取的二级索引记录条数，0.2是读取一条记录成本常数，0.01是微调。

在通过二级索引获取到记录之后，还需要做两件事儿：

- 根据这些记录中的主键值到聚簇索引中做回表操作。MySQL评估回表操作的IO成本依旧很简单粗暴，它认为每次回表操作都相当于访问一个页面，也就是说二级索引范围区间有多少记录，就需要进行多少次回表操作，也就是需要进行多少次页面IO。id_expire_time二级索引执行查询时，预计有39条二级索引记录需要进行回表操作，所以回表操作带来的IO成本就是：39✖️1.0=39.0，其中39是预计的二级索引记录数，1.0时一个页面的IO成本常数
- 回表操作得到的完成用户记录，然后再检测其他搜索条件是否成立。由于我们通过范围区间获取到二级索引记录共39条，也就是对应着聚簇索引中39条完整的用户记录，读取并检测这些完整的用户记录是否符合其余的搜索条件的CPU成本如下：39✖️0.2=7.8。其中39是待检测记录的条数，0.2是检测一条记录是否符合给定的搜索条件的成本常数

所以本例中使用id_expire_time执行查询的成本如下所示：

- IO成本：1.0 + 39 ✖️1.0 = 40.0 （范围区间的数量 + 预估的二级索引记录条数）
- CPU成本：39 ✖️ 0.2 + 0.01 + 39 ✖️ 0.2 = 15.61（读取二级索引记录的成本 + 读取并检测回表后聚簇索引的成本）

综上所属，使用id_expire_time执行查询的总成本就是：40.0 + 15.6 = 55.61。

按照上述思路我们计算idx_order_no执行查询的成本。

idx_order_no对应的搜索条件是：`order_no IN('DD00_6S', 'DD00_9S', 'DD00_10S')`，也就是说相当于3个单点区间。与计算idx_expire_time的情况类似，我们也需要计算使用idx_order_no时需要访问的范围区间数量以及需要回表的记录数，计算过程与上面类似。

范围区间数量：使用idx_order_no执行查询时有3个单点区间，所以访问这3个范围区间的二级索引付出的IO成本就是：3✖️1.0=3.0。

需要回表的记录数：由于使用idx_expire_time时有3个单点区间，所以每个单点区间都需要查找一遍对应的二级索引记录数，三个单点区间总共需要回表的记录数是58。

```sql
explain SELECT * FROM order_exp WHERE order_no IN ('DD00_6S', 'DD00_9S', 'DD00_10S');
```

读取这些二级索引记录的CPU成本就是：58✖️0.2 + 0.01 = 11.61。得到总共需要回表的记录数之后，就要考虑：根据这些记录里的主键值到聚簇索引中做回表操作，所需的IO成本就是：58✖️1.0  = 58.0。回表操作得到的完整用户记录，然后再比较其他搜索条件是否成立，此步骤对应的CPU成本就是：58✖️0.2 = 11.6。

所以本例中使用idx_order_no执行查询的成本就如下所示：

- IO成本：3.0 + 58✖️1.0  = 61.0（范围区间内的数量 + 预估的二级索引记录数）
- CPU成本：58✖️0.2 + 58✖️0.2 + 0.01 = 23.21（读取二级索引记录的成本 + 读取并检测回表后聚簇索引记录的成本）

综上所属，使用idx_order_no执行查询的总成本就是：61.0 + 23.1 = 84.21。

#### 是否有可能使用索引合并

本例中SQL语句不满足索引合并的条件，所以并不会使用索引合并。而且MySQL查询优化器计算索引合并成本的算法也比较麻烦，我们不去了解。

#### 对比各种方案，找出成本最低的那一个

下面比较各种可执行方案以及它们对应的成本：

- 全表扫描的成本：2169.9
- 使用idx_expire_time的成本：55.61
- 使用idx_order_no的成本：84.21

显然，使用idx_expire_time的成本最低，所以选择idx_expire_time来执行查询。

全表扫描Tracer的输出：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308142329251.png" alt="image-20230814232924184" style="zoom:50%;" />

使用idx_order_no的Tracer的输出：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308142329202.png" alt="image-20230814232944152" style="zoom:50%;" />

使用idx_expire_time的Tracer的输出：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308142329414.png" alt="image-20230814232956363" style="zoom:50%;" />

这里之所以和我们计算有点不同的原因是，在MySQL的实际计算中，在和全文扫描比较成本时，使用索引的成本会除去读取并检测回表后聚簇索引记录的成本，也就是说，我们通过MySQL看到使用idx_expire_time成本将会是：55.61 - 7.8 = 47.81，idx_order_no的成本就是：84.21 - 11.6 = 72.61。但是MySQL比较完成成本后，会再计算一次使用索引的成本，此时就会加上前面去除的成本，也就是我们计算出来的值。

### 基于索引统计数据的成本

#### index dive

有时候使用索引执行查询时会有许多单点区间，比如使用IN语句就很容易产生非常多的单点区间，比如下面这个查询：

```sql
SELECT * FROM order_exp WHERE order_no IN ('aa1', 'aa2', 'aa3', ... , 'zzz');
```

显然，这个查询用到的索引就是idx_order_no，由于这个索引并不是唯一二级索引，所以并不能确定一个单点区间对应的二级索引记录的条数有多少，需要我们去计算。就是先把获取索引对应的B+树的区间最左记录和区间最右记录，然后再计算这两条记录之间有多少记录（记录条数少的时候可以做到精确计算，多的时候只能估算）。MySQL把这种通过直接访问索引对应的B+树来计算某个范围区间对应的索引记录条数的方式称之为index dive。

有零星几个单点区间的话，使用index dive的方式去计算这些单点区间对应的记录数也不是什么问题，如果IN语句里的参数过多，比如有2000个参数怎么办？

这就意味着MySQL的查询优化器为了计算这些单点区间的索引记录条数，要进行2000次的index dive操作，这样做性能损耗很大，搞不好计算这些单点区间对应的索引记录条数的成本比直接全表扫描的成本都大了。MySQL考虑到这种情况，所以提供了一个系统变量`eq_range_index_dive_limit`，MySQL 5.7.21中这个系统变量的默认值：

```sql
show variables like '%dive%';
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308162323557.png" alt="image-20230816232318508" style="zoom:50%;" />

也就是说IN语句中的参数个数小于200的话，将使用index dive的方式计算各个单点区间对应的记录数，如果大于或等于200个的话，可就不能使用index dive了，要使用所谓的索引统计数据来进行估算。类似上述的，MySQL 会为每个表维护一份统计数据，查看某个表索引的统计数据可以使用`SHOW INDEX FROM`表名的语法，比如我们要查看order_exp的各个索引的统计数据可以这么写：

```sql
show index from order_exp;
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308162327948.png" alt="image-20230816232733895" style="zoom:67%;" />

详细含义：

| 属性          | 描述                                                         |
| ------------- | ------------------------------------------------------------ |
| Table         | 索引所属表的名称。                                           |
| Non_unique    | 索引列的值是否是唯一的，聚簇索引和唯一二级索引的该列值为0，普通二级索引该列值为1。 |
| Key_name      | 索引的名称。                                                 |
| Seq_in_index  | 索引列在索引中的位置，从1开始计数。比如对于联合索引u_idx_day_status，来说，`insert_time`, `order_status`, `expire_time`对应的位置分别是1、2、3。 |
| Column_name   | 索引列的名称。                                               |
| Collation     | 索引列中的值是按照何种排序方式存放的，值为A时代表升序存放，为NULL时代表降序存放。 |
| Cardinality   | 索引列中不重复值的数量。后边我们会重点看这个属性的。         |
| Sub_part      | 对于存储字符串或者字节串的列来说，有时候我们只想对这些串的前n个字符或字节建立索引，这个属性表示的就是那个n值。如果对完整的列建立索引的话，该属性的值就是NULL。 |
| Packed        | 索引列如何被压缩，NULL值表示未被压缩。这个属性我们暂时不了解，可以先忽略掉。 |
| Null          | 该索引列是否允许存储NULL值。                                 |
| Index_type    | 使用索引的类型，我们最常见的就是BTREE，其实也就是B+树索引。  |
| Comment       | 索引列注释信息。                                             |
| Index_comment | 索引注释信息。                                               |

Cardinality属性，Cardinality直译过来就是基数的意思，表示索引列中不重复值的个数，比如对于一个一万行记录的表来说，某个索引列的Cardinality属性是10000，那意味着该列中没有重复的值，如果Cardinality属性是1的话，就意味该列的值全部是重复的。不过需要注意的是，对于InnoDB存储引擎来说，使用`SHOW INDEX`语句展示出来的某个索引列的Cardinality属性是一个估计值，并不是精确的。

前面说过，当IN语句中的参数个数大于或等于系统变量eq_range_index_limit的值的话，就不会使用index dive的方式计算各个单点区间的索引记录条数，而是使用索引统计数据，这里所指索引统计数据指的是这两个值：

- 使用`SHOW TABLE STATUS`展示出的Rows的值，也就是一个表中有多少条记录
- 使用`SHOW INDEX`语句展示出的Cardinality属性

结合Rows统计数据，我们可以针对索引列，计算出平均一个值重复多少次。一个值的重复次数  ≈ Rows ÷ Cardinality。

以order_exp表的idx_order_no索引为例，它的Rows值是10354，它对应的Cardinality值是10225，我们可以计算order_no列平均每个值的重复次数就是10354 ÷ 10225 ≈ 1.0126（条）。此时再看上述查询语句：`SELECT * FROM order_exp WHERE order_no IN ('aa1', 'aa2', 'aa3', ... , 'zzz');`，假设IN语句20000个参数的话，就直接使用统计数据来估算这些参数需要单点区间对应的记录条数了，每个参数大约对应1.012条记录，所以总共需要回表的记录数就是：20000 ✖️ 1.0126 = 20252。

使用统计数据来计算单点区间对应的索引记录条数比index dive的方式简单，但是它的致命缺点就是：不精确。使用统计数据算出来的查询成本与所需的成本可能相差非常大。

MySQL 5.7.3以及之前的版本中，eq_range_index_dive_limit的默认值为10，之后的版本默认值为200。所以如果5.7.3以及之前的版本的话，很容易采用索引统计数据而不是index dive的方式来计算查询成本。当查询中使用到了IN查询，但是却实际没有用到索引，就可以考虑是不是由于eq_range_index_dive_limit的值太小导致的。

我们可以通过如下的语句，查询成本：

```sql
EXPLAIN format = json 
SELECT *
FROM order_exp
WHERE order_no IN ('DD00_6S', 'DD00_9S', 'DD00_10S')
	AND expire_time > '2021-03-22 18:28:28'
	AND expire_time <= '2021-03-22 18:35:09'
	AND insert_time > expire_time
	AND order_note LIKE '%7排1%'
	AND order_status = 0
```

这样我们就可以得到一个json格式的执行计划，里面包含计划花费的成本：

```json
 {
  "query_block": {
    "select_id": 1,  # 整个查询语句只有1个SELECT关键字，该关键字对应的id号为1
    "cost_info": {
      "query_cost": "55.61" # 整个查询的执行成本预计为55.61
    },
    "table": {
      "table_name": "order_exp",
      "access_type": "range",
      "possible_keys": [
        "idx_order_no",
        "idx_expire_time"
      ],
      "key": "idx_expire_time",
      "used_key_parts": [
        "expire_time"
      ],
      "key_length": "5",
      "rows_examined_per_scan": 39,
      "rows_produced_per_join": 0,
      "filtered": "0.13",
      "index_condition": "((`mysqladv`.`order_exp`.`expire_time` > '2021-03-22 18:28:28') and (`mysqladv`.`order_exp`.`expire_time` <= '2021-03-22 18:35:09'))",
      "cost_info": {
        "read_cost": "55.60",
        "eval_cost": "0.01",
        "prefix_cost": "55.61",   #单独查询表的成本，也就是：read_cost + eval_cost
        "data_read_per_join": "24"  #和连接查询相关的数据量，单位字节，这里无用
      },
      "used_columns": [
        "id",
        "order_no",
        "order_note",
        "insert_time",
        "expire_duration",
        "expire_time",
        "order_status"
      ],
      "attached_condition": "((`mysqladv`.`order_exp`.`order_status` = 0) and (`mysqladv`.`order_exp`.`order_no` in ('DD00_6S','DD00_9S','DD00_10S')) and (`mysqladv`.`order_exp`.`insert_time` > `mysqladv`.`order_exp`.`expire_time`) and (`mysqladv`.`order_exp`.`order_note` like '%7排1%'))"
    }
  }
}
```

### 连接查询的成本

MySQL中连接查询采用的是嵌套循环连接算法，驱动表会被访问一次，被驱动表可能会被访问多次，所以对于两表连接查询来说，它的查询成本由下面两个部分构成：

- 单次查询驱动表的成本
- 多次查询被驱动表的成本（具体查询多少次取决于对被驱动表查询的结果集中有多少条记录）

对驱动表进行查询后得到的记录条数称之为驱动表的扇出（fanout）。很显然驱动表的扇出值越小，对于被驱动表的查询次数也就越少，连接查询的总成本也就越低。当查询优化器想计算整个连接查询所使用的成本时，就需要计算出驱动表的扇出值，有的时候计算扇出值是很容易的，比如下面几个查询。

查询一：

```sql
SELECT * FROM order_exp AS s1 INNER JOIN order_exp2 AS s2;
```

假设使用s1表作为驱动表，很显然对驱动表的单表查询只能使用全表扫描的方式执行，驱动表的扇出值也很明确，那就是驱动表中有多少记录，扇出值就是多少。统计数据中s1表的记录行数是10573，也即是说优化器就直接会把10573当作s1表的扇出值。

查询二：

```sql
SELECT * FROM order_exp AS s1 INNER JOIN order_exp2 AS s2 
WHERE s1.expire_time> '2021-03-22 18:28:28' AND s1.expire_time<= '2021-03-22 18:35:09';
```

仍然假设s1表是驱动表的话，很显然对驱动表的单表查询可以使用idx_expire_time索引执行查询。此时范围区间`('2021-03-22 18:28:28', '2021-03-22 18:35:09')`中有多少条记录，那么扇出值就是多少。但是有的时候扇出值的计算就变得很棘手，比如下面几个查询：

```sql
SELECT * FROM order_exp AS s1 INNER JOIN order_exp2 AS s2 WHERE s1.order_note > 'xyz';
```

本查询和查询一类似，只不过对于驱动表s1多了一个`order_note > 'xyz'`的搜索条件。查询优化器又不会真正的去执行查询，所以它只能猜这10573记录里有多少条记录满足`order_note > 'xyz'`条件。

查询四：

```sql
SELECT * FROM order_exp AS s1 INNER JOIN order_exp2 AS s2 WHERE s1.expire_time> '2021-03-22 18:28:28' AND s1.expire_time<= '2021-03-22 18:35:09' AND s1.order_note > 'xyz';
```

本查询和查询二类似，只不过对于驱动表s1也多了一个`order_note > 'xyz'`的搜索条件。不过因为本查询可以使用idx_expire_time索引，所以只需从符合二级索引范围区间的记录中猜有多少条记录符合`order_note > 'xyz'`条件，也就是只需要猜39条记录中有多少符合`order_note > 'xyz'`条件。

查询五：

```sql
SELECT * FROM order_exp AS s1 INNER JOIN order_exp2 AS s2  WHERE s1.expire_time> '2021-03-22 18:28:28' AND s1.expire_time<= '2021-03-22 18:35:09' AND s1.order_no IN ('DD00_6S', 'DD00_9S', 'DD00_10S') AND   s1.order_note > 'xyz';
```

本查询和查询四类似，不过在驱动表s1选取idx_expire_time索引执行查询后，优化器需要从符合二级索引范围内区间的记录中猜有多少条记录符合条件`order_no IN ('DD00_6S', 'DD00_9S', 'DD00_10S') `和`order_note > 'xyz'`。也就是说优化器需要猜在39条记录中有多少符合上述两个条件。

总结一下，MySQL有两种情况需要猜出扇出的值：

- 如果使用的是全表扫描的方式执行的单表查询，那么计算驱动表扇出时需要猜满足搜索条件的记录到底有多少条
- 如果使用的是索引执行的单表扫描，那么计算驱动表扇出的时候需要猜满足除使用到对应索引的搜索条件外的其他搜索条件的记录有多少条

在MySQL 5.7之前的版本中，查询优化器在计算驱动表扇出时，如果是使用全表扫描的话，就直接使用表中记录的数量作为扇出值，如果使用索引的话，就直接使用满足范围条件的索引记录条数作为扇出值。

在MySQL 5.7中，MySQL引入了启发式规则，将上述中猜的过程称之为condition filtering。这个过程可能会使用到索引，也可能使用到统计数据。condition filtering可以让成本估算更精确，但其过程比较复杂，这里暂时不做探讨。

#### 两表连接的成本分析

连接查询的成本计算公式：连接查询总成本 = 单次访问驱动表的成本 + 驱动表扇出数 x 单次访问被驱动表的成本。

对于左（外）连接右（外）连接查询来说，它们的驱动表是固定的，所以想要得到最优的查询方案只需要分别为驱动表和被驱动表选择成本最低的访问方法。

但是对于内连接来说，驱动表和被驱动表的位置是可以互换的，不同的表作为驱动表最终的查询成本可能是不同的，也就是需要考虑最优的表连接顺序，然后分别为驱动表和被驱动表选择成本最低的访问方法。

显然，计算内连接查询成本的方式更麻烦一些，下面我们以内连接为例来看看如何计算出最优的连接查询方案，比如对如下查询：

```sql
SELECT *
FROM order_exp s1
	INNER JOIN order_exp2 s2 ON s1.order_no = s2.order_note
WHERE s1.expire_time > '2021-03-22 18:28:28'
	AND s1.expire_time <= '2021-03-22 18:35:09'
	AND s2.expire_time > '2021-03-22 18:35:09'
	AND s2.expire_time <= '2021-03-22 18:35:59';
```

可以选择的连接顺序有两种：

- s1连接s2，也就是s1作为驱动表，s2作为被驱动表
- s2连接s1，也就是s2作为驱动表，s1作为被驱动表

查询优化器需要分别考虑这两情况下的最优查询成本，然后选区成本更低的连接顺序以及该连接顺序下各个表的最优访问方法作为最终的查询计划。接下来我们分别分析一下这两种情况。

接下来我们分析使用s1作为驱动表的情况。

首先看一下涉及s1表单表的搜索条件有`s1.expire_time > '2021-03-22 18:28:28' AND s1.expire_time <= '2021-03-22 18:35:09'`，所以这个查询可能会用到idx_expire_time索引，从全表扫描和使用idx_expire_time这两个方案中选出成本最低的那个，很显然使用idx_expire_time执行查询的成本更低些。然后分析对于被驱动表的成本最低的执行方案，此时涉及到被驱动表s2的搜索条件就是：

- s2.order_note = 常数（这是因为对驱动表s1结果集中的每一条记录，都需要进行一次被驱动表s2的访问，此时那些设计两表的条件相当于只涉及被驱动表s2了。）
- `s2.expire_time > '2021-03-22 18:35:09' AND s2.expire_time <= '2021-03-22 18:35:59'`

很显然，第一个条件由于order_note没有用到索引，所以并没有什么用，此时访问s2表时可用的方案也是全表扫描和使用idx_expire_time两种，假设使用idx_expire_time的成本更小。所以此时使用s1作为驱动表的总成本就是（暂时不考虑使用join buffer对成本的影响）：

使用idx_expire_time访问s1的成本 + s1的扇出 × 使用idx_expire_time访问s2的成本。

接下来我们分析使用s2作为驱动表的情况。

首先看一下涉及s2表单表的搜索条件有`s2.expire_time> '2021-03-22 18:35:09' AND s2.expire_time<= '2021-03-22 18:35:59'`，所以这个查询可能使用到idx_expire_time索引，从全表扫描和idx_expire_time这两个方案中选出成本最低的那个，假设使用idx_expire_time执行查询的成本更低些。然后分析对于被驱动表的成本最低的执行方案，此时涉及到被驱动表s1的搜索条件就是：

- s1.order_no = 常数
- `s1.expire_time> '2021-03-22 18:28:28' AND s1.expire_time<= '2021-03-22 18:35:09'`

使用s2作为被驱动表与使用s1作为被驱动表有一个区别就是，idx_order_no可以进行ref方式访问，使用idx_expire_time可以使用range方式的访问。那么优化器需要从全表扫描、使用idx_order_no、使用idx_expire_time这几个方案里选出一个成本最低的方案。

这里有一个问题，不同于idx_expire_time的范围区间是确定的，s1.order_no=常数中的常数值我们是不知道，怎么衡量使用idx_order_no执行查询的成本呢？其实直接使用我们前面说过的索引统计数据就可以了（即索引列平均一个值重复多少次）。一般情况下，ref的访问方式要比range成本更低，这里假设使用idx_order_no进行对s1的访问。

所以，使用s2作为驱动表的总成本就是：使用idx_expire_time访问s2的成本 + s2的扇出 × 使用idx_order_no访问s1的成本。

最后优化器会比较这两种方式的最优访问成本，选取其中成本更低的连接顺序去真正的执行查询。从上面的计算过程也可以看出来，一般来讲，连接查询成本占大头的其实是驱动表扇出数 × 单次访问被驱动表的成本，所以我们优化的重点就是下面两个部分

1. 尽量减少驱动表的扇出
2. 对被驱动表的访问成本尽量低

这一点对于我们实际书写连接查询语句时十分有用，我们需要尽量在被驱动表的连接列上建立索引，这样就可以使用ref访问方法来降低访问被驱动表的成本了。如果可以，被驱动表的连接列最好是该表的主键或者唯一二级索引列，这样就可以把访问被驱动表的成本见到更低了。

连接查询的成本输出：

```sql
EXPLAIN format = json 
SELECT *
FROM order_exp s1
	INNER JOIN order_exp2 s2 ON s1.order_no = s2.order_note
WHERE s1.expire_time > '2021-03-22 18:28:28'
	AND s1.expire_time <= '2021-03-22 18:35:09'
	AND s2.expire_time > '2021-03-22 18:35:09'
	AND s2.expire_time <= '2021-03-22 18:35:59'
```

成本数据：

```json
{
  "query_block": {
    "select_id": 1,# 整个查询语句只有1个SELECT关键字，该关键字对应的id号为1
    "cost_info": {
      "query_cost": "840.51" # 整个查询的执行成本
    },
    "nested_loop": [   # 几个表之间采用嵌套循环连接算法执行
      {
        "table": {
          "table_name": "s2",   # s2表是驱动表
          "access_type": "range",  # 访问方法为range
          "possible_keys": [
            "idx_expire_time"
          ],
          "key": "idx_expire_time",
          "used_key_parts": [
            "expire_time"
          ],
          "key_length": "5",
          "rows_examined_per_scan": 321, # 查询s2表大致需要扫描321条记录
          "rows_produced_per_join": 321, # 驱动表s2的扇出是321
          "filtered": "100.00",   # condition filtering代表的百分比
          "index_condition": "((`mysqladv`.`s2`.`expire_time` > '2021-03-22 18:35:09') and (`mysqladv`.`s2`.`expire_time` <= '2021-03-22 18:35:59'))",
          "cost_info": {
            "read_cost": "386.21",
            "eval_cost": "64.20",
            "prefix_cost": "450.41", # 查询s1表总共的成本，read_cost + eval_cost
            "data_read_per_join": "152K" # 读取的数据量
          },
          "used_columns": [
            "id",
            "order_no",
            "order_note",
            "insert_time",
            "expire_duration",
            "expire_time",
            "order_status"
          ]
        }
      },
      {
        "table": {
          "table_name": "s1",  # s1表是被驱动表
          "access_type": "ref", 
          "possible_keys": [
            "idx_order_no",
            "idx_expire_time"
          ],
          "key": "idx_order_no",
          "used_key_parts": [
            "order_no"
          ],
          "key_length": "152",
          "ref": [
            "mysqladv.s2.order_note"
          ],
          "rows_examined_per_scan": 1, # 查询一次s1表大致需要扫描1条记录
          "rows_produced_per_join": 16, # 被驱动表s2的扇出是16（由于没有多余的表进行连接，所以这个值无用）
          "filtered": "4.94", # condition filtering代表的百分比
          "index_condition": "(`mysqladv`.`s1`.`order_no` = `mysqladv`.`s2`.`order_note`)",
          "cost_info": {
            "read_cost": "325.08",
            "eval_cost": "3.21",
            "prefix_cost": "840.51", # 单次查询s2、多次查询s1表总共的成本
            "data_read_per_join": "7K"
          },
          "used_columns": [
            "id",
            "order_no",
            "order_note",
            "insert_time",
            "expire_duration",
            "expire_time",
            "order_status"
          ],
          "attached_condition": "((`mysqladv`.`s1`.`expire_time` > '2021-03-22 18:28:28') and (`mysqladv`.`s1`.`expire_time` <= '2021-03-22 18:35:09'))"
        }
      }
    ]
  }
}
```

#### 多表连接的成本分析

多表连接查询的成本分析首先要考虑多表连接时可能产生多少种连接顺序：

- 对于两表连接，比如表A和表B连接，只有AB、BA两种连接顺序。其实相当于2 × 1 = 2种连接顺序
- 对于三表连接，比如表A、表B、表C进行连接，有ABC、ACB、BAC、BCA、CAB、CBA这6种连接顺序。其实相当于3 × 2 × 1=6种连接顺序
- 对于四表连接，则会有4 × 3 × 2 × 1 = 24 种连接顺序
- 对于n表连接的话，则有n × (n - 1) × (n - 2) × ... × 1种连接顺序，就是n的阶乘种连接顺序，也就是n!

对于n个表的连接查询，MySQL会用一些办法减少计算连接顺序的成本的方法：

1. 提前结束某种顺序的成本评估：MySQL在计算各种链接顺序的成本之前，会维护一个全局变量，这个变量表示当前最小的连接查询成本。如果在分析某个连接顺序的成本时，该成本已经超过当前最小的连接查询成本，那就不会对该连接顺序继续往下分析了。比如有A、B、C三个表进行连接，已经得到连接顺序ABC时当前的最小连接成本，假如是10.0，在计算连接顺序BCA时，发现B和C的连接成本就已经大于10.0时，就不再继续往后分析BCA这个连接顺序的成本了

2. 系统变量

   为了防止无穷无尽的分析各种连接顺序的成本，MySQL提出了`optimizer_search_depth`系统变量，如果连接表的个数小于该值，那么就继续穷举分析每一种连接顺序的成本，否则只对`optimizer_search_depth`值相同数量的表进行穷举分析。很显然，该值越大，成本分析的越精确，越容易得到好的执行计划，但是消耗的时间也就越长。

3. 根据某些规则压根儿就不考虑某些连接顺序

   即便有上面两条规则的限制，但是分析多个表不同连接顺序成本花费的时间还是会很长，所以MySQL干脆提出了一些所谓的启发式规则（就是根据以往经验指定的一些规则），凡是不满足这些规则的连接顺序不参与分析，这样可以极大的减少需要分析的连接顺序的数量，但是也可能造成错失最优的执行计划。MySQL提供了一个系统变量`optimizer_prune_level`来控制到底是不是用这些启发式规则。

### 调节成本常数

前面我们提到两个成本常数：读取一个页面花费的成本默认是1.0，检测一条记录是否符合搜索条件的成本默认是0.2。其实除了这两个成本参数，MySQL还支持很多，它们被存储到MySQL的两个表中：

```sql
SHOW TABLES FROM mysql LIKE '%cost%';
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308282357467.png" alt="image-20230828235756384" style="zoom:50%;" />

因为一条语句的执行其实是分为两层的：server层、存储引擎层。

MySQL在server层进行连接管理、查询缓存、语法解析、查询优化等操作，在存储引擎层执行具体的数据存取操作。也就是说一条语句在server中执行的成本是和它操作的表使用的存储引擎是没有关系的。所以关于这些操作对应的成本常数就存储在了server_cost表中，而依赖于存储引擎的一些操作对应的成本常数就存储在了engine_cost表中。

首先分析一下server_cost表。

```sql
SELECT * FROM mysql.server_cost;
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308292315661.png" alt="image-20230829231530606" style="zoom:50%;" />

cost_value表示成本常数对应的值。如果该列的值为NULL的话，意味着对应的成本常数会采用默认值。

其中每一项成本的含义：

| 名称                         | 默认值 | 含义                                                         |
| ---------------------------- | ------ | ------------------------------------------------------------ |
| disk_temptable_create_cost   | 40.0   | 创建基于磁盘的临时表的成本，如果增大这个值的话会让优化器尽量少的创建基于磁盘的临时表 |
| disk_temptable_row_cost      | 1.0    | 向基于磁盘的临时表写入或读取一条记录的成本，如果增大这个值的话会让优化器尽量少的创建基于磁盘的临时表 |
| key_compare_cost             | 0.1    | 两条记录做比较操作的成本，多用在排序操作上，如果增大这个值的话会提升filesort的成本，让优化器尽可能的更倾向于使用索引完成排序而不是filesort |
| memory_temptable_create_cost | 2.0    | 创建基于内存的临时表写入或者读取一条记录的成本，如果增大这个值的话会让优化器尽量少的创建基于内存的临时表 |
| memory_temptable_row_cost    | 0.2    | 向基于内存的临时表写入或读取一条记录的成本，如果增大这个值的话会让优化器尽量少的创建基于内存的临时表 |
| row_evaluate_cost            | 0.2    | 检测一条记录是否符合搜索条件的成本，增大这个值可以让优化器倾向于使用索引而不是直接全表扫描 |

MySQL在执行诸如DISTINCT查询、分组查询、Union查询以及某些特殊条件下的排序查询都可能在内部先创建一个临时表，使用这个临时表来辅助完成查询。从上面的表格可以看出，创建临时表和对这个临时表进行写入和读取的操作代价还是很高的。

如果要修改上述参数，首先对表中的cost_value字段值进行update操作，然后执行：

```sql
FLUSH OPTIMIZER_COSTS;
```

如果要改回默认值，将cost_value字段值更新为NULL，然后执行上述语句即可。

接下来我们分析一下engine_cost表。

```sql
SELECT * FROM mysql.engine_cost;
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308292331848.png" alt="image-20230829233128801" style="zoom: 67%;" />

与server_cost表相比，engine_cost多出了两列：

- engine_name：指定成本常数使用的存储引擎名称。如果该值为default，意味着对应的成本常数使用于所有的存储引擎
- device_type：执行存储引擎使用的设备类型，这里主要是为了区分机械硬盘和固态硬盘，不过在MySQL 5.7.X这个版本中并没有对机械硬盘的成本和固态硬盘的成本作区分，所以该值默认是0。

表中每一项的含义：

| 名称                   | 默认值 | 含义                                                         |
| ---------------------- | ------ | ------------------------------------------------------------ |
| io_block_read_cost     | 1.0    | 从磁盘上读取一个块对应的成本。请注意我使用的是块，而不是页这个词。对于InnoDB存储引擎来说，一个页就是一个块，不过对于MyISAM存储引擎来说，默认是以4096字节作为一个块的。增大这个值会加重I/O成本，可能让优化器更倾向于选择使用索引执行查询而不是执行全表扫描。 |
| memory_block_read_cost | 1.0    | 从内存中读取一个块对应的成本                                 |

怎么从内存中和从磁盘上读取一个块的默认成本是一样的？这主要是因为在MySQL目前的实现中，并不能准确预测某个查询需要访问的块中有哪些块已经加载到内存中，有哪些块还停留在磁盘上，所以MySQL简单的认为不管这个块有没有加载到内存中，使用的成本都是1.0。

### InnoDB中的统计数据

InnoDB提供了两种存储统计数据的方式：

- 永久性的统计数据，这种统计数据存储在磁盘上，也就是说服务器重启之后这些统计数据还在
- 非永久性的统计数据，这种统计数据存储在内存中，当服务器关闭时这些统计数据就被清除掉了，等到服务器重启之后，在某些适当的场景下才会重新收集这些统计数据

MySQL为我们提供了系统变量`innodb_stats_presistent`来控制到底采用哪种方式去存储统计数据。在MySQL5.6.6之前，`innodb_stats_presistent`的值默认是OFF，也就是说InnoDB的统计数据默认是存储到内存的，之后的版本中`innodb_stats_presistent`的值默认是ON，也就是统计数据默认被存储到磁盘中。

```sql
SHOW VARIABLES LIKE 'innodb_stats_persistent';
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308292346012.png" alt="image-20230829234606948" style="zoom:67%;" />



我们可以通过指定`STATS_PERSISTENT`属性来指明该表的统计数据存储方式：

```sql
CREATE TABLE 表名 (...) Engine=InnoDB, STATS_PERSISTENT = (1|0);
ALTER TABLE 表名 Engine=InnoDB, STATS_PERSISTENT = (1|0);
```

当`STATS_PERSISTENT=1`时，表明我们想把该表的统计数据永久的存储到磁盘上，当`STATS_PERSISTENT=0`时，表明我们想把该表的统计数据临时的存储到内存中。如果我们在创建表时未指定`STATS_PERSISTENT`属性，默认会采用系统变量`innodb_stats_persistent`的值作为该属性的值。

当我们选择把某个表以及该表索引的统计数据存放到磁盘上时，实际上是把这些统计数据存储到了两个表里：

```sql
SHOW TABLES FROM mysql LIKE 'innodb%';
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308292352560.png" alt="image-20230829235225509" style="zoom:67%;" />

可以看到，这两表都位于mysql系统数据库下面，其中：

- innodb_table_stats存储了关于表的统计数据，每一条记录对应着一个表的统计数据
- Innodb_index_stats存储了关于索引的统计就数据，每一条记录对应着一个索引的一个统计项的统计数据

```sql
SELECT * FROM mysql.innodb_table_stats;
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308292356594.png" alt="image-20230829235621536" style="zoom:80%;" />

几个重要统计信息项的值如下：

- n_rows的值是10350，表明order_exp表中大约有10350条记录，这个值是估计值
- clustered_index_size的值是97，表明order_exp表的聚簇索引占用97页面，这个值也是一个估计值
- sum_of_other_index_sizes的值是81，表明order_exp表的其他索引一共占用81个页面，这个值也是一个估计值

InnoDB统计一个表中有多少行记录是这样的：按照一定算法选取几个叶子结点页面，计算每个页面中主键值记录数量，然后计算平均一个页面中主键值的记录数量乘以全部叶子结点的数量就算是该表n_rows值。

可以看出来这个n_rows值精确与否取决于统计时采样的页面数量，MySQL通过系统变量`innodb_stats_persistent_sample_pages`来控制使用永久性的统计数据时，计算统计数据时采样的页面数量。该值设置的越大，统计出的n_rows值越精确，但是统计耗时也就最久，该值设置的越小，统计出的n_rows值越不精确，但是统计耗时特别少，这个值的默认值是20。

InnoDB默认是以表为单位来收集和存储统计数据的，我们可以单独设置某个表的采样页面的数量，设置方式就是在创建或修改表的时候通过STATS_SAMPLE_PAGES属性来指明该表的统计数据存储方式：

```sql
CREATE TABLE 表名 (...) Engine=InnoDB, STATS_SAMPLE_PAGES = 具体的采样页面数量;
ALTER TABLE 表名 Engine=InnoDB, STATS_SAMPLE_PAGES = 具体的采样页面数量;
```

如果我们在创建表的语句并没有制定STATS_SAMPLE_PAGES属性的话，将默认使用系统变量`innodb_stats_persistent_sample_pages`的值作为该属性的值。

接下来观察Innodb_index_stats表的数据：

```sql
desc mysql.innodb_index_stats;
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308312211503.png" alt="image-20230831221147447" style="zoom:67%;" />

各个字段的含义：

| 字段名           | 描述                           |
| ---------------- | ------------------------------ |
| database_name    | 数据库名                       |
| table_name       | 表名                           |
| index_name       | 索引名                         |
| last_update      | 本条记录最后更新时间           |
| stat_name        | 统计项名称                     |
| stat_value       | 对应的统计项的值               |
| sample_size      | 为生成统计数据而采样的页面数量 |
| stat_description | 对应的统计项的描述             |

innodb_index_stats表的每条记录代表着一个索引的一个统计项。我们以order_exp表为例：

```sql
SELECT * FROM mysql.innodb_index_stats WHERE table_name = 'order_exp';
```

![image-20230831221516062](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308312215122.png)

从结果中可以看出，PRIMARY索引（也就是组件）占了3条记录，idx_expire_time索引占了6条记录。

stat_name具体的含义：

- size：表示该索引共占用多少页面
- n_diff_pfxNN：表示对应的索引列不重复的值有多少，其中NN可以被替换为01、02、03...这样的数字，比如对于u_idx_day_status来说，u_diff_pfx01表示的是统计insert_time这单单一列不重复的值有多少，u_diff_pfx02表示insert_time、order_status这两个列组合起来不重复的值有多少，u_diff_pfx03表示的是insert_time、order_status、expire_time这三个列组合起来不重复的值有多少，u_diff_pfx04表示的是insert_time、order_status、expire_time、id这四个列组合起来不重复的值有多少。

对于普通的二级索引，并不能保证它的索引列值是唯一的，比如对于idx_order_no来说，key1列就可能有很多重复的记录。此时只有在索引列上加上主键值才可以区分两条索引列值都是一样的二级索引记录。对于主键和唯一二级索引则没有这个问题，它们本身就可以保证索引列值的不重复，所以也不需要再统计一遍在索引列后加上主键值的不重复值有多少，比如u_idx_day_statu和idx_order_no。

在计算某些索引列中包含多少不重复值时，需要对一些叶子节点页面进行采样，sample_size列就表明了采样的页面数量是多少。对于有多个列的联合索引来说，采样的页面数量是：innodb_stats_persistent_sampe_pages × 索引列的个数。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202309022312404.png" alt="image-20230902231257340" style="zoom:67%;" />

#### 更新统计数据

随着我们不断的对表进行增删改操作，表中的数据也一直在变化，innodb_table_stats和innodb_index_stats表里的统计数据也在变化，MySQL提供了自动更新和手动更新两种更新统计数据的方式。

系统变量`innodb_stats_auto_recale`决定着服务器是否自动重新计算统计数据，它的默认值是ON，也就是该功能默认是开启的。

![image-20230831223453291](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202308312234358.png)

每个表都维护了一个变量，该变量记录着对该表进行增删改的记录条数，如果发生变动的记录数量超过了表的大小10%，并且自动重新统计数据的功能是打开的，那么服务器会重新进行一次统计数据的计算，并且更新`innodb_table_stats`和`innodb_index_stats`表，不过自动重新计算统计数据的过程是异步发生的，也就是即使表中变动的记录数超过了10%，自动重新计算统计数据也不会立即发生，可能会延迟几秒才会进行计算。

InnoDB默认是以表为单位来收集和存储统计数据的，我们可以单独为某个表设置是否自动重新计算统计数的属性，设置方式就是在创建或修改表的时候通过指定STATS_AUTO_RECALC属性来指明该表的统计数据存储方式：

```sql
CREATE TABLE 表名 (...) Engine=InnoDB, STATS_AUTO_RECALC = (1|0);
ALTER TABLE 表名 Engine=InnoDB, STATS_AUTO_RECALC = (1|0);
```

当STATS_AUTO_RECALC=1时，表明我们想让该表自动重新计算统计数据，当STATS_AUTO_RECALC=0时，表明不想让该表自动重新计算统计数据，如果我们在创建表时未指定STATS_AUTO_RECALC属性，那默认采用系统变量innodb_stats_auto_recalc的值作为该属性的值。

如果innodb_stats_auto_recalc系统变量的值为OFF的话，我们也可以手动调用ANALYZE TABLE语句来重新计算统计数据，比如我们可以这样更新关于order_exp表的统计数据：

```sql
ANALYZE TABLE order_exp;
```

ANALYZE TABLE语句会立即重新计算统计数据，这个过程是同步的，在表中索引多或者采样页面也别多的时候，这个过程可能会很慢，需要在业务不是很繁忙的时候再运行。

除此之外，`innodb_table_stats`和`innodb_index_stats`表就相当于一个普通的表一样，我们能对它们多增删改查操作，这就意味着我们可以手动更新某个表或者索引的统计数据。比如我们想把order_exp表关于行数的统计数据更改一下，可以这么做：

1. 更新`innodb_table_stats`表
2. 使用语句`FLUSH TABLE order_exp`让MySQL查询优化器重新加载我们更改过的数据

## 表结构设计



## MySQL redo日志

参考：https://blog.csdn.net/sermonlizhi/article/details/124556301

事务的实现方式：

- WAL(预写式日志)
- Commit Logging(提交日志)
- Shadow Paging(影子分页)
