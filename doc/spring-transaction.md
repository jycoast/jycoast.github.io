# 事务的基本原理

## 数据库事务

通常的观念认为，事务仅与数据库相关，它是数据库管理系统执行过程中的一个逻辑单位，由一个有限的数据库操作序列构成。数据库事务通常包含了一个序列的对数据库的读/写操作。使用事务，是为了达到以下两个目的：

1. 为数据库操作序列提供了一个从失败中恢复到正常状态的方法，同时提供了数据库即使在异常状态下仍能保持一致性的方法
2. 当多个应用程序在并发访问数据库时，可以在这些应用程序之间提供一个隔离方法，以防止彼此的操作互相干扰

当事务被提交给了数据库管理系统， 则数据库管理系统需要确保该事务中的所有操作都完成且其结果被永久保存在数据库中，如果事务中有的操作没有成功完成，则事务中的所有操作都需要回滚，回到事务执行前的状态；同时，该事务对数据库或者其他事务的执行无影响，所有的事务都好像在独立的运行。

举例来说，某人在商店使用电子货币购买100元的东西，当中至少包括两个操作：

1. 该人账户减少100元
2. 商店账户增加100元

那么此时，这个交易系统的数据库管理系统，就必须要确保以上两个操作同时成功或者同时失败。在现实情况中，失败的风险其实是很高的，网络环境、程序代码的漏洞、数据库系统/操作系统出错、甚至存储介质出错等都有可能引起其中某一方失败的情况。因此，这就需要数据库管理系统对一个执行失败的事务执行恢复操作，将数据库恢复到数据一致的状态。为了实现将数据库恢复到一致状态的功能，数据库管理系统通常都需要维护事务日志，以追踪事务中所有影响数据库数据的操作。

开启事务开使用语句`BEGIN`，提交事务可以使用`COMMIT`。默认情况下，MySQL（`innodb`）会启用后自动提交模式（`autocommit=ON`），这意味着，只要执行DML操作的语句，MySQL会立即隐式地提交事务，相比之下，oracle则需要手动开启/提交事务。

并非所有对数据库的操作都需要开启事务，只有那些需要保证一致性的场景，才考虑使用事务。如果你的程序只是执行单条查询，则没有必要使用事务，即时是多条语句，很多情况下也是不需要事务的。简言之，每次在程序中要使用事务前都应该做好评估，而不是不加思索的使用事务，不应该在程序代码中泛滥的使用事务。另外，如果开启了事务，而没有即时提交，就可能会导致数据库事务提交异常，从而引起无法预料的错误。

## 事务的特性

数据库事务拥有以下四个特性，习惯上被称为ACID特性：

- 原子性（Atomicity）：事务要么全部完成，要么全部取消。如果事务崩溃，数据库的状态要回滚到事务之前
- 一致性（Consistency）：只有合法的数据（依照关系约束和函数约束）才能写入数据库
- 隔离性（Isolation）：如果两个事务T1和T2同时运行，不论T1和T2谁先结束，事务T1和T2执行的最终结果是相同的
- 持久性（Durability）：一旦事务交，不管发生什么（崩溃或者出错），数据都保存在数据库中

其中原子性和隔离性比较难理解，我们单独说明。

### 原子性

假设有如下操作序列：

```sql
begin; -- 开始一个事务
update table set A = A - 1;
update table set B = B + 1;
-- 其他读写操作
commit; -- 提交事务
```

保证原子性的意思是，在执行完`begin`和`commit`之间的操作全部成功完成后，才将结果统一提交给数据库保存，如果过程中任意一个操作失败，就要撤销前面的操作，且操作不会提交给数据库保存，这样就保证了操作的原子性。

### 隔离性

在原子性的操作序列基础上，假设同一时刻还有另外一个操作序列：

```sql
begin;
update table set A = A + 1;
commit;
```

此时，为了确保同时只能有一个事务在修改A，就需要对数据A加上互斥锁：

- 只有获取到锁，才能修改对应的数据A，修改数据后，需要释放锁
- 同一时间，只能有一个事务持有数据A的互斥锁
- 没有获取到锁的事务，需要等待锁的释放

在事务中更新某条数据获得的互斥锁，只有在事务提交或失败之后才会释放，在此之前，其他事务只能读，不能写。这是隔离性的关键，针对隔离性的强度，共有以下四种级别：

- 串行化：指对同一行记录，读写操作都会加锁。当出现读写锁冲突的时候，后访问的事务必须等待前一个事务执行完成，才能继续执行
- 可重复度读（MySQL默认模式）：一个事务执行过程中看到的数据，总是与这个事务在启动的时候看到的数据是一致的，在可重复读的隔离级别下，未提交变更对其它事务是不可见的
- 读已提交（Oracle、SQL Server默认模式）：一个事务提交之后，它做的变更才会被其他事务看到
- 读未提交：一个事务还没有提交，它做的变更就能被其他的事务看到

# Spring 中的事务

Spring为事务提供了完整的支持，使用Spring来管理事务有以下好处：

- Spring为不同的编程模型如JTA、JDBC、Hibernate、JPA等，提供了统一的事务API
- 支持声明式事务，更容易的管理事务
- 相比于 JTA，Spring为编程式事务提供更加简单的API

## 声明式事务管理

使用`@Transactional`注解来管理事务比较简单，示例如下：

```java
@Service
public class TransactionDemo {

    @Transactional
    public void declarativeUpdate() {
        updateOperation1();
        updateOperation2();
    }
}
```

这样的写法相当于在进入`declarativeUpdate()`方法前，使用`BEGIN`开启了事务，在执行完方法后，使用`COMMIT`提交事务。

也可以将`@Transactional`注解放在类上面，表示类中所有的`public`方法都开启了事务：

```java
@Service
@Transactional
public class TransactionDemo {
    public void declarativeUpdate() {
        updateOperation1();
        updateOperation2();
    }
  	// 其他public方法...
}
```

## 编程式事务管理

相比之下，使用编程式事务要略微复杂一些：

```java
@Service
public class TransactionDemo {
    
    @Autowired
    private TransactionTemplate transactionTemplate;

    public void programmaticUpdate() {
        // 这里也可以使用Lambda表达式
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                updateOperation1();
                updateOperation2();
            }
        });
    }
}

```

如果你的程序中需要针对某种特定异常有特殊操作，那么可以使用try...catch，切记此时需要调用TransactionStatus的setRollbackOnly方法：

```java
package com.example.transaction;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@Slf4j
public class TransactionDemo {

    @Autowired
    private TransactionTemplate transactionTemplate;

    public void programmaticUpdate() {
        
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                try {
                    updateOperation1();
                    updateOperation2();
                    // 指定异常类型
                } catch (Exception ex) {
                    log.info("exception happen ....");
                    status.setRollbackOnly();
                }
            }
        });
    }
}

```

如果需要获取事务的执行结果，那么可以使用：

```java
package com.example.transaction;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class TransactionDemo {

    @Autowired
    private TransactionTemplate transactionTemplate;

    public void programmaticUpdate() {
        String result = transactionTemplate.execute(new TransactionCallback<String>() {
            @Override
            public String doInTransaction(TransactionStatus status) {
                updateOperation1();
                updateOperation2();
                // 返回执行的结果
                return "ok";
            }
        });
    }
}
```

## 声明式事务还是编程式事务？

|          | 编程式事务                                                   | 声明式事务                                                   |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 使用方法 | @Transactional                                               | TransactionTemplate                                          |
| 优点     | 使用简单                                                     | 可以控制事务提交的开启和提交时机，能够更小粒度的控制事务的范围，也更加直观 |
| 缺点     | 使用不当事务可能失效；多个事务性操作可能导致事务无法正常提交，导致长事务 | 需要硬编码来控制事务                                         |
| 适用场景 | 同一个方法中，事务操作比较多                                 | 当事务操作的数量很少                                         |

在合适的场景使用合适的方式非常重要，在一些场景下，当对事务操作非常频繁，特别是在递归、外部通讯等耗时的场景中使用事务，很有可能就会引发长事务，那么应该考虑将非事务的部分放在前面执行，最后在写入数据环节时再开启事务。

## 事务传播行为

事务的传播行为指的是，当应用程序中的服务间互相调用， 如果调用方已经创建或尚未创建事务，那么被调用的服务将如何处理事务的一种行为特征，如下图所示：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/image-20220604233024712.png" alt="image-20220604233024712" style="zoom: 50%;" />

### Spring中事务传播特性

Spring中规定了7种类型的事务传播特性：

| 事务传播行为类型          | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| PROPAGATION_REQUIRED      | 如果当前没有事务，就新建一个事务，如果已经存在一个事务中；就加入到这个事务中，这是事务传播行为的默认值 |
| PROPAGATION_REQUIRES_NEW  | 总是创建新的事务，新的事务回滚不会影响原来的事务             |
| PROPAGATION_NESTED        | 如果已经存在事务，则使用嵌套事务，如果当前没有事务，则新建事务 |
| PROPAGATION_MANDATORY     | 使用当前事务，如果当前没有事务，就抛出异常                   |
| PROPAGATION_NEVER         | 以非事务方式执行操作，如果当前存在事务，则抛出异常           |
| PROPAGATION_NOT_SUPPORTED | 以非事务方式执行操作，如果当前存在事务，就把当前事务挂起，执行结束之后再恢复事务 |
| PROPAGATION_SUPPORTS      | 如果当前存在事务则加入，如果当前没有事务，就以非事务方式执行 |

### PROPAGATION_REQUIRED

`PROPAGATION_REQUIRED`是`@Transactional`的默认值，它有以下特点：

- 如果当前没有物理事务，那么Spring会创建一个新的事务
- 如果当前已经存在了一个物理事务，那么有`@Transactional(propagation = Propagation.REQUIRED)`注解的方法就会加入这个物理事务
- 每一个有`@Transactional(propagation = Propagation.REQUIRED)`注解的方法，都对应一个逻辑事务，这些逻辑事务会加入到同一个物理事务
- 每个逻辑事务都有自己的作用范围，但是在这种传播机制下，所有这些范围都会被映射到同一个物理事务中

正因为所有的逻辑事务都会映射到同一个物理事务上，当物理事务中的任何一个逻辑事务回滚，那么这个物理事务就会回滚。以下面两个逻辑事务为例：

```java
@Transactional(propagation=Propagation.REQUIRED)
public void insertFirstAuthor() {
  Author author = new Author();
  author.setName("Joana Nimar");
  authorRepository.save(author);
  // 调用另外一个事务方法
  insertSecondAuthorService.insertSecondAuthor();
}
```

```java
@Transactional(propagation = Propagation.REQUIRED)
public void insertSecondAuthor() {
  Author author = new Author();
  author.setName("Alicia Tom");
  authorRepository.save(author);
  // 随机抛出异常
  if(new Random().nextBoolean()) {
    throw new RuntimeException("DummyException: this should cause rollback of both inserts!");
  }
}
```

它们的执行过程如下：

1. 当执行`insertFirstAuthor()`方法时，由于此时还没有物理事务，Spring将会在这个方法外部创建一个逻辑事务，包裹住这个方法
2. 当`insertFirstAuthor()`调用`insertSecondAuthor()`方法的时候，由于已经存在了一个物理事务，因此，spring会为`insertSecondAuthor()`创建一个逻辑事务，并加入到当前的物理事务中
3. 如果`insertSecondAuthor()`抛出了异常，那么Spring将会回滚所有的逻辑事务，这也意味着，两个方法中的插入操作都不会执行

如果用图的方式来描述：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/image-20220605112549988.png" alt="image-20220605112549988" style="zoom: 80%;" />

其中，START表示`insertFirstAuthor()`被调用，绿色的线表示`insertSecondAuthor()`被调用。

### PROPAGATION_REQUIRES_NEW

PROPAGATION_REQUIRES_NEW表示Spring总是会创建一个新的物理事务，这种隔离级别下，内部的事务可以声明自己的超时、只读和隔离级别设置，而不是继承外部物理事务的特征。同样的，我们用图来说明这一点：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/image-20220605113517184.png" alt="image-20220605113517184" style="zoom:80%;" />

在这种隔离级别下，每个物理事务都有自己的数据库连接，也就是说，当创建内部的物理事务的时候，会同步为这个事务绑定一个新的数据库连接。当内部的物理事务运行的时候，外部的物理事务的就会暂停执行（保持连接），当内部的物理事务提交之后，外部的时候恢复运行，继续执行提交或回滚操作。

另外，在这种传播级别下，即便内部的物理事务回滚，外部的物理事务也会正常提交，如果外部的物理事务在内部的物理事务提交之后回滚，内部的物理事务并不会受到任何影响。

```java
@Transactional(propagation=Propagation.REQUIRED)
public void insertFirstAuthor() {
  Author author = new Author();
  author.setName("Joana Nimar");
  authorRepository.save(author);
  insertSecondAuthorService.insertSecondAuthor();
}
```

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void insertSecondAuthor() {
  Author author = new Author();
  author.setName("Alicia Tom");
  authorRepository.save(author);
  if(new Random().nextBoolean()) {    
    throw new RuntimeException ("DummyException: this should cause rollback of second insert only!");
  }
}
```

它们的执行过程如下：

1. 当调用`insertFirstAuthor()`的时候会创建一个新的物理事务，因为此时还没有物理事务

2. 当`insertFirstAuthor()`调用`insertSecondAuthor()`的时候，Spring将会创建另外一个内部的物理事务

3. 当发生运行时异常（RuntimeException）的时候，两个物理事务会按照内部事务、外部事务的顺序先后进行回滚，发生这种情况的原因是在`insertSecondAuthor()`中抛出的异常被传播到调用者即`insertFirstAuthor()`中，因此，也会导致外部物理事务的回滚。如果只需要回滚内部物理事务而不影响外部事务，那么需要在`insertFirstAuthor()`方法中捕获并处理异常：

   ```java
   @Transactional(propagation = Propagation.REQUIRED)
   public void insertFirstAuthor() {
     Author author = new Author();
     author.setName("Joana Nimar");
     authorRepository.save(author);
     try {
       insertSecondAuthorService.insertSecondAuthor();
     } catch (RuntimeException e) {
       System.err.println("Exception: " + e);
     }
   }
   ```

### PROPAGATION_NESTED

Propagation.NESTED与PROPAGATION_REQUIRED比较类似，只是会使用保存点（savepoint），换句话说，内部逻辑事务可以部分回滚。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/image-20220605120115823.png" alt="image-20220605120115823" style="zoom:80%;" />

<div class="note info"><p>savepoint是数据库事务中的“子事务”，事务可以回滚到savepoint而不影响savepoint创建前的变化，而不是回滚整个事务。</p></div>

### PROPAGATION_MANDATORY

PROPAGATION_MANDATORY表示，一定要有一个物理事务，否则就会抛出异常：

```txt
org.springframework.transaction.IllegalTransactionStateException: No existing transaction found for transaction marked with propagation 'mandatory'.
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/image-20220605121818107.png" alt="image-20220605121818107" style="zoom:80%;" />

考虑下面的例子：

```java
@Transactional(propagation=Propagation.REQUIRED)
public void insertFirstAuthor() {
  Author author = new Author();
  author.setName("Joana Nimar");
  authorRepository.save(author);
  insertSecondAuthorService.insertSecondAuthor();
}
```

```java
@Transactional(propagation = Propagation.MANDATORY)
public void insertSecondAuthor() {
  Author author = new Author();
  author.setName("Alicia Tom");
  authorRepository.save(author);
  if (new Random().nextBoolean()) {
    throw new RuntimeException("DummyException: this should cause rollback of both inserts!");
  }
}
```

当`insertFirstAuthor()`调用`insertSecondAuthor()`方法的时候，因为外部已经存在了物理事务（通过Propagation.REQUIRED创建），那么`insertSecondAuthor()`将会加入这个事务，如果内部事务回滚了，外部事务也会回滚，这一点和`Propagation.REQUIRED`相同。

### PROPAGATION_NEVER

PROPAGATION_NEVER表示，如果当前存在物理事务，那么就抛出异常：

```txt
org.springframework.transaction.IllegalTransactionStateException: Existing transaction found for transaction marked with propagation 'never'
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/image-20220605122829788.png" alt="image-20220605122829788" style="zoom:80%;" />

```java
@Transactional(propagation = Propagation.NEVER)
public void insertFirstAuthor() {
  Author author = new Author();
  author.setName("Joana Nimar");
  authorRepository.save(author);
}
```

它的执行过程如下：

1. 当`insertFirstAuthor()`方法被调用，Spring将会查找已有的物理事务
2. 如果没有开启事务，则方法就会正常运行
3. 当代码运行到`save()`方法时,Spring将会打开一个物理事务，专门用于运行此方法，这是因为`save()`方法使用了默认的`Propagation.REQUIRED`属性，此时回滚？？

当调用有`@Transactional(propagation = Propagation.NEVER)`注解的方法，一定要确保没有打开任何物理事务。

### PROPAGATION_NOT_SUPPORTED

PROPAGATION_NOT_SUPPORTED表示，如果当前存在一个物理事务，那么它就会将这个事务挂起，然后以非事务的方式来运行程序，当执行完成后，事务会自动恢复。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/image-20220605123804442.png" alt="image-20220605123804442" style="zoom:80%;" />

```java
@Transactional(propagation = Propagation.REQUIRED)
public void insertFirstAuthor() {
  Author author = new Author();
  author.setName("Joana Nimar");
  authorRepository.save(author);
  insertSecondAuthorService.insertSecondAuthor();
}
```

```java
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public void insertSecondAuthor() {
  Author author = new Author();
  author.setName("Alicia Tom");  
  authorRepository.save(author);
  if (new Random().nextBoolean()) {
    throw new RuntimeException("DummyException: this should cause "
                               + "rollback of the insert triggered in insertFirstAuthor() !");
  }
}
```

它的执行过程如下：

- 当调用`insertFirstAuthor()`的时候，由于此时还没有物理事务，因为Spring会创建一个新的物理事务
- 然后执行`insertFirstAuthor()`中的`save()`方法，保存"Joana Nimar"
- 当`insertFirstAuthor()`调用`insertSecondAuthor()`的时候，Spring会查看是否已有存在物理事务，在继续执行代码之前，Spring会将`insertFirstAuthor()`中开启的事务挂起
- `insertSecondAuthor()`会以非事务的方式进行执行，直到调用`save()`方法，默认情况下，`save()`方法会创建一个新的物理事务，执行`insert`语句并提交事务
- `insertSecondAuthor()`剩余的代码会在物理事务之外执行
- 当执行完`insertSecondAuthor()`之后，Spring将会恢复被挂起的物理事务。如果在执行`insertSecondAuthor()`方法的时候发生了运行时异常（RuntimeException），这个异常会被传播到`insertFirstAuthor()`方法中，因此，`insertFirstAuthor()`的事务也会回滚

需要注意的是，即便当前的事务被挂起了，也应该避免执行运行时间很长的任务，这是因为被挂起的事务的数据库连接还是激活的状态，这意味着，数据库连接池无法重用这个连接：

```txt
...
Suspending current transaction
HikariPool-1 - Pool stats (total=10, active=1, idle=9, waiting=0)
Resuming suspended transaction after completion of inner transaction
```

### PROPAGATION_SUPPORTS

PROPAGATION_SUPPORTS意味着，如果当前存在物理事务，那么就加入这个事务，如果没有物理事务，那么就以非事务的方式运行。

```java
@Transactional(propagation = Propagation.REQUIRED)
public void insertFirstAuthor() {
  Author author = new Author();
  author.setName("Joana Nimar");
  authorRepository.save(author);
  insertSecondAuthorService.insertSecondAuthor();
}
```

```java
@Transactional(propagation = Propagation.SUPPORTS)
public void insertSecondAuthor() {
  Author author = new Author();
  author.setName("Alicia Tom");
  authorRepository.save(author);
  if (new Random().nextBoolean()) {
    throw new RuntimeException("DummyException: this should cause rollback of both inserts!");
  }
}
```

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/image-20220605141125962.png" alt="image-20220605141125962" style="zoom:80%;" />

它的执行过程如下：

1. 当执行`insertFirstAuthor()`的时候，因为还没有物理事务，因此，Spring会创建一个新的物理事务
2. 执行`insertFirstAuthor()`中的`save()`方法，保存"Joana Nimar"
3. 当`insertFirstAuthor()`调用`insertSecondAuthor()`方法的时候，因为已经存在了一个物理事务，因此`insertSecondAuthor()`在这个物理事务内部创建一个逻辑事务，如果发生了运行时异常，那么内部和外部的逻辑事务都将回滚

如果在`insertFirstAuthor()`中捕获异常：

```java
@Transactional(propagation = Propagation.REQUIRED)
public void insertFirstAuthor() {
  Author author = new Author();
  author.setName("Joana Nimar");
  authorRepository.save(author);
  try {
    insertSecondAuthorService.insertSecondAuthor();
  } catch (RuntimeException e) {
    System.err.println("Exception: " + e);
  }
}
```

此时，整个事务依然都会回滚，这是因为，两个逻辑事务的作用范围都映射到了同一个物理事务上。

如果去掉`insertFirstAuthor()`的` @Transactional(propagation = Propagation.REQUIRED)`注解，此时，执行过程如下：

1. 当调用`insertFirstAuthor()`的时候，将不会创建物理事务
2. `insertFirstAuthor()`将以非事务的方式运行，直到调用`save()`方法，默认情况下，`save()`方法会创建一个新的物理事务，执行`insert`语句并提交事务
3. 当`insertFirstAuthor()`调用`insertSecondAuthor()`的时候，由于当前没有物理事务，Spring也不会创建新的物理事务
4. `insertSecondAuthor()`将以非事务的方式运行，直到调用`save()`方法，默认情况下，`save()`方法会创建一个新的物理事务，执行`insert`语句并提交事务
5. 当发生运行时异常时，由于不存在物理事务，这两个方法都不会发生回滚

# Spring 事务的实现原理

了解他们的基本概念和使用方法，接下来我们将一起分析Spring事务的实现原理。在正式分析实现过程前，我们首先需要了解一些比较核心API，这将帮助抽丝剥茧的理解Spring事务的实现原理。

## Spring 事务的核心API

事务操作相关的API：

- Spring事务@Enanle模块驱动 - @EnableTranSactionManagement
- Spring事务注解 - @Transactional
- Spring事务事件监听器 - @TransactionalEventListener

事务抽象相关的API

- Spring平台事务管理器 - PlatformTransactionManager

- Spring事务定义 - TransactionDefinition
- Spring事务状态 - TransactionStatus

- Spring事务代理配置 - ProxyTransactionManagementConfiguration

AOP相关的API：

- Spring事务PointcutAdvisor实现 - BeanFactoryTransactionAttrubuteSourceAdvisor
- Spring事务MethodInterceptor实现 - TransactionInterceptor
- Spring事务属性源 - TransactionAttributeSource

其中，PlatformTransactionManager、TransactionDefinition、TransactionStatus最为重要，他们之间的关系如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/imgimage-20220530234248183.png" alt="image-20220530234248183" style="zoom: 80%;" />

### PlatformTransactionManager

PlatformTransactionManager是Spring对于事务模型的抽象，它代表事务的整体执行过程。通常事务都应用在关系型数据库中，Spring对于事务的读写的模型做了更高层次的抽象，使得其可以应用在任何需要数据一致性的场景，比如JMX等，Spring将这些场景统一的抽象为commit和rollback两个核心方法。

PlatformTransactionManager的核心方法：

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface PlatformTransactionManager {
    // 获取事务的执行状态
    TransactionStatus getTransaction(@Nullable TransactionDefinition var1) throws TransactionException;
    // 提交事务
    void commit(TransactionStatus var1) throws TransactionException;
    // 回滚事务
    void rollback(TransactionStatus var1) throws TransactionException;
}
```

这里需要注意的是，如果有@Transactional注解的方法，如果他们对应的传播行为不同，那么其对应的TransactionDefinition也是不同的，这也就是说getTransaction这个方法获取到的并不是物理事务，而是某个具体方法的逻辑事务，同理，commit和rollback也是对应的这个逻辑事务。

### TransactionDefinition

TransactionDefinition是事务的元信息定义，类似于Spring IOC中BeanDefinition。实际上，Spring中事务的定义参考了EJB中对于事务的定义，TransactionDefinition的核心方法有：

```java
package org.springframework.transaction;

import org.springframework.lang.Nullable;

public interface TransactionDefinition {
    // 传播行为的枚举值...
    
    // 返回事务的传播行为，默认值为 REQUIRED。
    int getPropagationBehavior();
    //返回事务的隔离级别，默认值是 DEFAULT
    int getIsolationLevel();
    // 返回事务的超时时间，默认值为-1。如果超过该时间限制但事务还没有完成，则自动回滚事务。
    int getTimeout();
    // 返回是否为只读事务，默认值为 false
    boolean isReadOnly();

    @Nullable
    String getName();
}
```

### TransactionStatus

事务分为逻辑事务和物理事务，逻辑事务是指代码中事务的操作；物理事务是通过数据库连接来获取相关的物理的连接以及相关的数据库的事务。TransactionStatus是用来描述当前逻辑事务的执行情况，其核心方法及含义：

```java
public interface TransactionStatus {
    // 当前事务执行是否在新的事务
    boolean isNewTransaction();
    // 是否有恢复点（小范围的回滚）
    boolean hasSavepoint();
    // 设置当前事务为只回滚
    void setRollbackOnly();
    // 当前事务是否为只回滚
    boolean isRollbackOnly(); 
    // 当前事务是否已完成
    boolean isCompleted;
}
```

从Spring5.2开始，对这个接口进行了拆分，将部分方法放置在了TransactionExecution中：

```java
/**
 * @since 5.2
 */
public interface TransactionExecution {
	boolean isNewTransaction();
	void setRollbackOnly();
	boolean isRollbackOnly();
	boolean isCompleted();
}
```

## 事务实现过程分析

### @Transactional与AOP

@Transactional基于Spring AOP实现，其执行流程大致如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/imgimage-20220530234841511.png" alt="image-20220530234841511" style="zoom:80%;" />

针对于@Transactional的实现，几个关键点是：

- Spring中是如何定义Interceptor的？也就是说，哪些方法会被拦截？
- 拦截后，代理类中invoke方法是如何执行的？ 

### @Transactional的实现原理

首先我们来观察@Transactional的定义：

```java
// 可以作用在类上面，也可以作用在方法上
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Transactional {

	// 事务管理器（PlatformTransactionManager），和transactionManager互为别名
	@AliasFor("transactionManager")
    
	String value() default "";

	@AliasFor("value")
	String transactionManager() default "";

	// 事务的传播行为
	Propagation propagation() default Propagation.REQUIRED;

	// 事务的超时时间，默认是-1，表示永远不会超时
	int timeout() default TransactionDefinition.TIMEOUT_DEFAULT;

    // 是否只读事务，如果是只读事务，Spring会在执行事务的时候会做相应的优化
	boolean readOnly() default false;

    // 回滚的异常类型
	Class<? extends Throwable>[] rollbackFor() default {};
}
```

如果需要在SpringBoot中要使用@Transactional，我们需要添加@EnableTransactionManagement注解：

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
// 自动装配类
@Import(TransactionManagementConfigurationSelector.class)
public @interface EnableTransactionManagement {
    // ...
}
```

进入这个注解对应的自动装配类：

```java
public class TransactionManagementConfigurationSelector extends AdviceModeImportSelector<EnableTransactionManagement> {

	@Override
	protected String[] selectImports(AdviceMode adviceMode) {
        // 支持动态代理和ASPECTJ两种AOP的实现方法，默认是代理的方式
		switch (adviceMode) {
			case PROXY:
				return new String[] {AutoProxyRegistrar.class.getName(),
						ProxyTransactionManagementConfiguration.class.getName()};
			case ASPECTJ:
				return new String[] {determineTransactionAspectClass()};
			default:
				return null;
		}
	}
}
```

进入代理模式的配置类ProxyTransactionManagementConfiguration，这是一个标准的SpringBoot的配置类：

```java
@Configuration(proxyBeanMethods = false)
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
public class ProxyTransactionManagementConfiguration extends AbstractTransactionManagementConfiguration {

	@Bean(name = TransactionManagementConfigUtils.TRANSACTION_ADVISOR_BEAN_NAME)
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public BeanFactoryTransactionAttributeSourceAdvisor transactionAdvisor(
			TransactionAttributeSource transactionAttributeSource, TransactionInterceptor transactionInterceptor) {

		BeanFactoryTransactionAttributeSourceAdvisor advisor = new BeanFactoryTransactionAttributeSourceAdvisor();
		advisor.setTransactionAttributeSource(transactionAttributeSource);
		advisor.setAdvice(transactionInterceptor);
		if (this.enableTx != null) {
			advisor.setOrder(this.enableTx.<Integer>getNumber("order"));
		}
		return advisor;
	}

    // 获取AOP的注解
	@Bean
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public TransactionAttributeSource transactionAttributeSource() {
		return new AnnotationTransactionAttributeSource();
	}

	@Bean
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public TransactionInterceptor transactionInterceptor(TransactionAttributeSource transactionAttributeSource) {
		TransactionInterceptor interceptor = new TransactionInterceptor();
		interceptor.setTransactionAttributeSource(transactionAttributeSource);
		if (this.txManager != null) {
			interceptor.setTransactionManager(this.txManager);
		}
		return interceptor;
	}

}
```

TransactionAttributeSource前面我们介绍过，它是Spring事务属性源 ，进入AnnotationTransactionAttributeSource的构造方法，我们可以看到：

```java
	public AnnotationTransactionAttributeSource(boolean publicMethodsOnly) {
		this.publicMethodsOnly = publicMethodsOnly;
		if (jta12Present || ejb3Present) {
			this.annotationParsers = new LinkedHashSet<>(4);
			this.annotationParsers.add(new SpringTransactionAnnotationParser());
			if (jta12Present) {
				this.annotationParsers.add(new JtaTransactionAnnotationParser());
			}
			if (ejb3Present) {
				this.annotationParsers.add(new Ejb3TransactionAnnotationParser());
			}
		}
		else {
			this.annotationParsers = Collections.singleton(new SpringTransactionAnnotationParser());
		}
	}
```

这里会将一些注解解析类添加到AnnotationTransactionAttributeSource的annotationParsers中，这里以默认的SpringTransactionAnnotationParser为例：

```java
	@Override
	@Nullable
	public TransactionAttribute parseTransactionAnnotation(AnnotatedElement element) {
        // 获取拥有@Transactional注解的类或方法
		AnnotationAttributes attributes = AnnotatedElementUtils.findMergedAnnotationAttributes(
				element, Transactional.class, false, false);
		if (attributes != null) {
			return parseTransactionAnnotation(attributes);
		}
		else {
			return null;
		}
	}
```

JtaTransactionAnnotationParser和Ejb3TransactionAnnotationParser也是类似的实现，这说明Spring不仅支持`org.springframework.transaction.annotation.Transactional`还支持`javax.transaction.Transactional.class`和`javax.ejb.TransactionAttribute`，在Spring统一的编程模型下，这三个注解都可以通用。

接下来我们查看执行的核心方法，即TransactionInterceptor的invoke方法：

```java
@Override
	@Nullable
	public Object invoke(MethodInvocation invocation) throws Throwable {
        
		// ...
        
		return invokeWithinTransaction(invocation.getMethod(), targetClass, new CoroutinesInvocationCallback() {
			@Override
			@Nullable
			public Object proceedWithInvocation() throws Throwable {
				return invocation.proceed();
			}
			@Override
			public Object getTarget() {
				return invocation.getThis();
			}
			@Override
			public Object[] getArguments() {
				return invocation.getArguments();
			}
		});
	}
```

进入invokeWithinTransaction方法：

```java
	@Nullable
	protected Object invokeWithinTransaction(Method method, @Nullable Class<?> targetClass,
			final InvocationCallback invocation) throws Throwable {

		// If the transaction attribute is null, the method is non-transactional.
		TransactionAttributeSource tas = getTransactionAttributeSource();
		final TransactionAttribute txAttr = (tas != null ? tas.getTransactionAttribute(method, targetClass) : null);
		final TransactionManager tm = determineTransactionManager(txAttr);
		PlatformTransactionManager ptm = asPlatformTransactionManager(tm);
        
		final String joinpointIdentification = methodIdentification(method, targetClass, txAttr);

		if (txAttr == null || !(ptm instanceof CallbackPreferringPlatformTransactionManager)) {
			TransactionInfo txInfo = createTransactionIfNecessary(ptm, txAttr, joinpointIdentification);

			Object retVal;
			try {
				// 环绕通知
				retVal = invocation.proceedWithInvocation();
			}
			catch (Throwable ex) {
				// target invocation exception
                // 发生异常
				completeTransactionAfterThrowing(txInfo, ex);
				throw ex;
			}
			finally {
				cleanupTransactionInfo(txInfo);
			}

			if (retVal != null && vavrPresent && VavrDelegate.isVavrTry(retVal)) {
				// Set rollback-only in case of Vavr failure matching our rollback rules...
				TransactionStatus status = txInfo.getTransactionStatus();
				if (status != null && txAttr != null) {
					retVal = VavrDelegate.evaluateTryFailure(retVal, txAttr, status);
				}
			}
			// 正常提交
			commitTransactionAfterReturning(txInfo);
			return retVal;
		}
		// 异常回滚
		else {
			Object result;
			final ThrowableHolder throwableHolder = new ThrowableHolder();

			// It's a CallbackPreferringPlatformTransactionManager: pass a TransactionCallback in.
			try {
				result = ((CallbackPreferringPlatformTransactionManager) ptm).execute(txAttr, status -> {
					TransactionInfo txInfo = prepareTransactionInfo(ptm, txAttr, joinpointIdentification, status);
					try {
						Object retVal = invocation.proceedWithInvocation();
						if (retVal != null && vavrPresent && VavrDelegate.isVavrTry(retVal)) {
							// Set rollback-only in case of Vavr failure matching our rollback rules...
							retVal = VavrDelegate.evaluateTryFailure(retVal, txAttr, status);
						}
						return retVal;
					}
					catch (Throwable ex) {
						if (txAttr.rollbackOn(ex)) {
							// A RuntimeException: will lead to a rollback.
							if (ex instanceof RuntimeException) {
								throw (RuntimeException) ex;
							}
							else {
								throw new ThrowableHolderException(ex);
							}
						}
						else {
							// A normal return value: will lead to a commit.
							throwableHolder.throwable = ex;
							return null;
						}
					}
					finally {
						cleanupTransactionInfo(txInfo);
					}
				});
			}
			catch (ThrowableHolderException ex) {
				throw ex.getCause();
			}
			catch (TransactionSystemException ex2) {
				if (throwableHolder.throwable != null) {
					logger.error("Application exception overridden by commit exception", throwableHolder.throwable);
					ex2.initApplicationException(throwableHolder.throwable);
				}
				throw ex2;
			}
			catch (Throwable ex2) {
				if (throwableHolder.throwable != null) {
					logger.error("Application exception overridden by commit exception", throwableHolder.throwable);
				}
				throw ex2;
			}

			// Check result state: It might indicate a Throwable to rethrow.
			if (throwableHolder.throwable != null) {
				throw throwableHolder.throwable;
			}
			return result;
		}
	}
```

其中：

```java
protected void commitTransactionAfterReturning(@Nullable TransactionInfo txInfo) {
		if (txInfo != null && txInfo.getTransactionStatus() != null) {
			txInfo.getTransactionManager().commit(txInfo.getTransactionStatus());
		}
	}
```

进入commit方法：

```java
	@Override
	public final void commit(TransactionStatus status) throws TransactionException {
		if (status.isCompleted()) {
			throw new IllegalTransactionStateException(
					"Transaction is already completed - do not call commit or rollback more than once per transaction");
		}

		DefaultTransactionStatus defStatus = (DefaultTransactionStatus) status;
		if (defStatus.isLocalRollbackOnly()) {
			if (defStatus.isDebug()) {
				logger.debug("Transactional code has requested rollback");
			}
			processRollback(defStatus, false);
			return;
		}

		if (!shouldCommitOnGlobalRollbackOnly() && defStatus.isGlobalRollbackOnly()) {
			if (defStatus.isDebug()) {
				logger.debug("Global transaction is marked as rollback-only but transactional code requested commit");
			}
			processRollback(defStatus, true);
			return;
		}

		processCommit(defStatus);
	}
```

继续进入processCommit方法：

```java
private void processCommit(DefaultTransactionStatus status) throws TransactionException {
		try {
			boolean beforeCompletionInvoked = false;

			try {
				boolean unexpectedRollback = false;
				prepareForCommit(status);
				triggerBeforeCommit(status);
				triggerBeforeCompletion(status);
				beforeCompletionInvoked = true;

				if (status.hasSavepoint()) {
					if (status.isDebug()) {
						logger.debug("Releasing transaction savepoint");
					}
					unexpectedRollback = status.isGlobalRollbackOnly();
					status.releaseHeldSavepoint();
				}
				else if (status.isNewTransaction()) {
					if (status.isDebug()) {
						logger.debug("Initiating transaction commit");
					}
					unexpectedRollback = status.isGlobalRollbackOnly();
           // 真正提交事务的方法
					doCommit(status);
				}
				else if (isFailEarlyOnGlobalRollbackOnly()) {
					unexpectedRollback = status.isGlobalRollbackOnly();
				}

				// Throw UnexpectedRollbackException if we have a global rollback-only
				// marker but still didn't get a corresponding exception from commit.
				if (unexpectedRollback) {
					throw new UnexpectedRollbackException(
							"Transaction silently rolled back because it has been marked as rollback-only");
				}
			}
			catch (UnexpectedRollbackException ex) {
				// can only be caused by doCommit
				triggerAfterCompletion(status, TransactionSynchronization.STATUS_ROLLED_BACK);
				throw ex;
			}
			catch (TransactionException ex) {
				// can only be caused by doCommit
				if (isRollbackOnCommitFailure()) {
					doRollbackOnCommitException(status, ex);
				}
				else {
					triggerAfterCompletion(status, TransactionSynchronization.STATUS_UNKNOWN);
				}
				throw ex;
			}
			catch (RuntimeException | Error ex) {
				if (!beforeCompletionInvoked) {
					triggerBeforeCompletion(status);
				}
				doRollbackOnCommitException(status, ex);
				throw ex;
			}

			// Trigger afterCommit callbacks, with an exception thrown there
			// propagated to callers but the transaction still considered as committed.
			try {
				triggerAfterCommit(status);
			}
			finally {
				triggerAfterCompletion(status, TransactionSynchronization.STATUS_COMMITTED);
			}

		}
		finally {
			cleanupAfterCompletion(status);
		}
	}

```

以`DataSourceTransactionManager`中的doCommit为例：

```java
	@Override
	protected void doCommit(DefaultTransactionStatus status) {
		DataSourceTransactionObject txObject = (DataSourceTransactionObject) status.getTransaction();
        // 获取数据库连接
		Connection con = txObject.getConnectionHolder().getConnection();
		try {
            // 提交事务
			con.commit();
		}
		catch (SQLException ex) {
			throw translateException("JDBC commit", ex);
		}
	}
```

可以看到，这里才是物理事务的提交。类似的，回滚也是获取数据库的连接，然后调用回滚的方法：

```java
	@Override
	protected void doRollback(DefaultTransactionStatus status) {
		DataSourceTransactionObject txObject = (DataSourceTransactionObject) status.getTransaction();
		Connection con = txObject.getConnectionHolder().getConnection();
		try {
       // 回滚事务
			con.rollback();
		}
		catch (SQLException ex) {
			throw translateException("JDBC rollback", ex);
		}
	}
```

### TransactionTemplate的实现原理

有了@Transactional实现过程的基础，TransactionTemplate的实现就比较容易理解了，TransactionTemplate本质上是一种模板方法的设计模式的应用：

```java
	@SuppressWarnings("serial")
public class TransactionTemplate extends DefaultTransactionDefinition
		implements TransactionOperations, InitializingBean {
    @Override
	@Nullable
	public <T> T execute(TransactionCallback<T> action) throws TransactionException {
      //...
			TransactionStatus status = this.transactionManager.getTransaction(this);
			T result;
			try {
        // 模板方法
				result = action.doInTransaction(status);
			}
			catch (RuntimeException | Error ex) {
        // 发生异常即回滚
				rollbackOnException(status, ex);
				throw ex;
			}
			catch (Throwable ex) {
				rollbackOnException(status, ex);
				throw new UndeclaredThrowableException(ex, "TransactionCallback threw undeclared checked exception");
			}
      // 没有发生异常就提交事务
			this.transactionManager.commit(status);
			return result;
		}
}
```

这一点可以从TransactionCallbackWithoutResult这个抽象类中就可以看出：

```java
public abstract class TransactionCallbackWithoutResult implements TransactionCallback<Object> {

	@Override
	@Nullable
	public final Object doInTransaction(TransactionStatus status) {
		doInTransactionWithoutResult(status);
		return null;
	}

	// 方法的实现就是我们需要执行的业务代码
	protected abstract void doInTransactionWithoutResult(TransactionStatus status);

}
```

# 事务失效及长事务

## 事务失效

### 方法内部调用

在实际开发中，如果碰到长事务，一个自然的想法，就是将其中涉及到事务的部分单独抽出来，只在这个方法上添加`@Transactional`注解。

```java
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    //@Transactional
    public void add(UserModel userModel) {
        // do something...
        updateStatus(userModel);
    }

    @Transactional
    public void updateStatus(UserModel userModel) {
        doSameThing();
    }
}

```

这是一个非常常见的误区，通过前文的分析，我们已经知道`@Transactional`是通过AOP来实现的。在调用`add()`方法的时候，`add()`方法并没有获取到事务的功能，那么在调用`updateStatus()`的时候，其实就是`this.updateStatus()`，这时候的`this`并不是代理对象代理之后的方法，自然也不会再拥有事务的功能了。解决方法内部调用导致事务失效的方法共有以下三种。

方法一：添加一个Service方法：

```java
@Servcie
public class ServiceA {
   @Autowired
   prvate ServiceB serviceB;

   public void save(User user) {
         // do something...
         serviceB.doSave(user);
   }
 }

 @Servcie
 public class ServiceB {

    @Transactional(rollbackFor=Exception.class)
    public void doSave(User user) {
       addData1();
       updateData2();
    }

 }
```

方法二：如果不想新增一个Service类，那么在Service类中注入自己也是一种选择。

```java
@Servcie
public class ServiceA {
   @Autowired
   prvate ServiceA serviceA;

   public void save(User user) {
        // do something...
        serviceA.doSave(user);
   }

   @Transactional(rollbackFor=Exception.class)
   public void doSave(User user) {
       addData1();
       updateData2();
    }
 }
```

方法三：通过AopContent类，在该Service类中使用`AopContext.currentProxy()`获取代理对象。

```java
@Servcie
public class ServiceA {

   public void save(User user) {
         // do something...
         ((ServiceA)AopContext.currentProxy()).doSave(user);
   }

   @Transactional(rollbackFor=Exception.class)
   public void doSave(User user) {
       addData1();
       updateData2();
    }
 }
```

### 访问权限不正确

private方法将会导致事务失效：

```java
@Service
public class UserService {
    
    @Transactional
    private void add(UserModel userModel) {
         saveData(userModel);
         updateData(userModel);
    }
}
```

这是因为在`AbstractFallbackTransactionAttributeSource`类的`computeTransactionAttribute`方法中有个判断，如果目标方法不是public，则`TransactionAttribute`返回 null （空)   ，即不支持事务。

```java
protected TransactionAttribute computeTransactionAttribute(Method method, @Nullable Class<?> targetClass) {
    // 如果方法不是pulic的，就返回null
    if (allowPublicMethodsOnly() && !Modifier.isPublic(method.getModifiers())) {
      return null;
    }
  	// ...
  }
```

### 方法使用final修饰

如果一个事务方法被定义成了final，也会导致事务不生效，这是因为通过cglib是通过生成子类来方式生成代理类。如果方法被定义为final，则意味着该方法无法被重写，无法添加事务功能。

```java
@Service
public class UserService {

    @Transactional
    public final void add(UserModel userModel){
        saveData(userModel);
        updateData(userModel);
    }
}
```

### 未被Spring管理

Spring在依赖查找的时候，是从BeanFactory中取出需要被代理的类，也就是说，事物生效的前提是，对象要被Spring管理。我们通过可以使用`@Service`、`Component`、`@Repository`等来实现Bean的依赖注入。

```java
//@Service
public class UserService {

    @Transactional
    public void add(UserModel userModel) {
         saveData(userModel);
         updateData(userModel);
    }    
}
```

### 多线程调用

事物有一个很重要的特性，就是不能跨线程使用，在如下的例子中，虽然我们使用了`@Transactional`注解，但依然无法管理事务：

```java
@Slf4j
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private RoleService roleService;

    @Transactional
    public void add(UserModel userModel) throws Exception {
        userMapper.insertUser(userModel);
        new Thread(() -> {
            roleService.doOtherThing();
        }).start();
    }
}

@Service
public class RoleService {

    @Transactional
    public void doOtherThing() {
        System.out.println("保存role表数据");
    }
}
```

这是因为`insertUser()`方法和`doOtherThing()`方法在不同的线程中，那么它们获取到的数据库连接也是不一样的，这就导致，这两个方法在不同的事务中。这一点可以在`org.springframework.transaction.support.TransactionSynchronizationManager`中得到印证。

### 存储引擎不支持事务

并不是所有的存储引擎都支持事务，例如MySQL中的`MyISAM`存储引擎，如果需要支持事务，需要替换为`InnoDB`存储引擎。

### 错误的传播特性

前面我们对事务的传播特性，做了深入且全面的介绍，如果传播特性设置错误，事务自然也不会生效。

```java
@Service
public class UserService {

    @Transactional(propagation = Propagation.NEVER)
    public void add(UserModel userModel) {
        saveData(userModel);
        updateData(userModel);
    }
}
```

### 异常处理不正确

对于异常的处理不正确，也会导致事务失效，例如，开发者手动处理了异常，这样被代理的方法将无法捕获到异常，自然也就无法回滚。

```java
@Slf4j
@Service
public class UserService {
    
    @Transactional
    public void add(UserModel userModel) {
        try {
            saveData(userModel);
            updateData(userModel);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        }
    }
}

```

另外，由于`@Transactional`默认捕获的异常是`RuntimeException`和`Error`，如果抛出的是其他类型异常，则也会导致事务无法回滚。

```java
@Slf4j
@Service
public class UserService {
    
    @Transactional
    public void add(UserModel userModel) throws Exception {
        try {
             saveData(userModel);
             updateData(userModel);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new Exception(e);
        }
    }
}

```

因此，你可能会经常见到这样的代码:

```java
@Slf4j
@Service
public class UserService {
    
    @Transactional(rollbackFor = Exception.class)
    public void add(UserModel userModel) throws Exception {
        try {
             saveData(userModel);
             updateData(userModel);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new Exception(e);
        }
    }
}
```

## 长事务

长事务可能会导致如下问题：

![image-20220605145006844](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/image-20220605145006844.png)

### 少用@Transactional注解

虽然`@Transactional`注解使用比较方便，但会导致整个业务方法都在同一个事务中，粒度比较粗，无法精确的控制事务的范围，就可能会导致长事务的产生：

```java
@Transactional(rollbackFor=Exception.class)
   public void save(User user) {
         // do something...
   }
```

正确的做法是，在有可能产生长事务的地方使用编程式事务：

```java

   @Autowired
   private TransactionTemplate transactionTemplate;
   
   // ...
   
   public void save(final User user) {
         transactionTemplate.execute((status) => {
            // do something...
            return Boolean.TRUE;
         })
   }
```

### 将查询方法放到事务外

如果出现长事务，可以将查询的方法放到事务外，因为一般情况下，这类方法是不需要事务的，例如：

```java
   @Transactional(rollbackFor=Exception.class)
   public void save(User user) {
         queryData1();
         queryData2();
         addData1();
         updateData2();
   }
```

可以将`queryData1()`和`queryData2()`两个查询方法放在事务外执行，将真正需要事务执行的方法` addData1()`和`updateData2()`放在事务中，这样能有效的减少事务的粒度。

```java

   @Autowired
   private TransactionTemplate transactionTemplate;
   
   // ...
   
   public void save(final User user) {
         queryData1();
         queryData2();
         transactionTemplate.execute((status) => {
            addData1();
            updateData2();
            return Boolean.TRUE;
         })
   }
```



### 事务中避免远程调用

在业务代码中，调用其他系统的接口是不可避免的，由于网络不稳定或其他因素，这种远程调用的响应时间无法保证。如果将远程调用的代码放在事务中，就可能导致长事务。

```java
@Transactional(rollbackFor=Exception.class)
   public void save(User user) {
         callRemoteApi();
         addData1();
   }
```

正确的做法是，把这些操作都放在事务外：

```java

   @Autowired
   private TransactionTemplate transactionTemplate;
   
   // ...
   
   public void save(final User user) {
         callRemoteApi();
         transactionTemplate.execute((status) => {
            addData1();
            return Boolean.TRUE;
         })
   }
```

不过，这样做就无法保证数据的一致性了，需要建立重试+补偿机制，达到数据的最终一致性。

### 事务中避免一次性处理太多数据

如果一个事务中需要处理大量的数据，也会造成大事务的问题，比如批量更新、批量插入等操作。可以使用分页进行处理，1000条数据，分50页，每次只处理20条数据，这样可以大大减少大事务的出现。

### 非事务执行

​	在每次使用事务之前，我们都应该思考，是不是所有的数据库操作都需要在事务中执行？

```java
   @Autowired
   private TransactionTemplate transactionTemplate;
   
   // ...
   public void save(final User user) {
         transactionTemplate.execute((status) => {
            addData();
            addLog();
            updateCount();
            return Boolean.TRUE;
         })
   }
```

上面的例子中，增加操作日志的方法`addLog()`和更新统计数量方法`updateCount()`，都是可以不在事务中执行，因为操作日志和统计数据这种业务允许少量数据出现不一致的情况。

# 参考文献

- [Spring AOP实现原理](https://jycoder.club/2021/06/29/Spring-AOP/)
- [Spring传播行为](https://dzone.com/articles/spring-transaction-propagation)
- [Spring事务传播行为详解](https://segmentfault.com/a/1190000013341344)
- [深入理解数据库事务](https://zhuanlan.zhihu.com/p/43493165)
- [Spring事务](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#tx-propagation)
- [Spring事务不生效的12中场景](https://juejin.cn/post/7003949263281455112?share_token=1c6f49e0-3d47-4380-af8d-de4d2b72a783)
- [让人头痛的大事务问题到底要如何解决？](https://mp.weixin.qq.com/s?__biz=MzkwNjMwMTgzMQ==&mid=2247490259&idx=1&sn=1dd11c5f49103ca303a61fc82ce406e0&source=41#wechat_redirect)