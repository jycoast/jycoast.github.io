---
title: Java核心技术原理
date: 2021-08-18 22:21:37
tags:
 - Java
author: 吉永超
---

“细节是魔鬼”，本文将彻底透彻的分析JDK中常见但是又忽略的细节，从而积跬步，致千里。

<!-- more -->

# 集合

## 集合的优点

数组的缺点：

- 长度开始时必须指定，而且一旦指定，不能更改
- 保存的必须为同一类型的元素
- 使用数组进行增加元素、删除元素、插入元素等相对复杂

使用集合的好处：

- 可以动态保存任意多个对象，使用比较方法
- 提供了一系列方便操作对象的方法：add、remove、set、get等

在Java中，集合主要分为两大类：单例集合和多列集合，其中单例集合有List、Set，双列集合有Map。

## 单列集合

核心API - java.util.List

- java.util.ArrayList
- java.util.Vector（线程安全）
- java.util.LinkedList

核心API - java.util.Set

- java.util.HashSet
- java.util.TreeSet

## 多列集合

核心API - java.util.Map

- java.util.Hashtable
- java.util.HashMap
- java.util.TreeMap

## List

### ArrayList源码分析

核心特点：

- ArrayList中维护了一个Object类型的数组elementData：

	```java
	transient Object[] elementData; // non-private to simplify nested class access
	```

- 当创建ArrayList对象时，如果使用的是无参构造器，则初始elementData容量为0，第1次添加，则扩容elementData为10，如需要再次扩容，则扩容elementData为1.5倍

- 如果使用的是指定大小的构造器，则初始elementData容量为指定大小，如果需要扩容，则直接扩容elementData为1.5倍

<div class="note info"><p>transient表示该属性不会被序列化。</p></div>

### LinkedList源码分析



## Map

Map接口的不同实现之间的关系：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210820170511.png" alt="image-20210820170511315" style="zoom:50%;" />

具体实现类特点的说明：

- HashMap：它根据键的hashCode值缓存数据，大多数情况下可以直接定位它的值，因而具有很快的访问速度，但是遍历顺序却是不确定的。HashMap最多只允许一条记录的键位null，允许多条记录的值为null。HashMap非线程安全，即任一时刻可以有多个线程同时写HashMap，可能会导致数据的不一致，如果需要满足线程安全，可以用Collections的synchronizedMap方法使HashMap具有线程安全的能力，或者使用ConcurrentHashMap
- Hashtable：Hashtable是历史遗留类，官方建议使用HashMap替代它，与HashMap不同的是，它继承自Dictionary类，并且是线程安全的，如果需要在线程安全的场合下使用，建议使用ConcurrentHashMap
- LinkedHashMap：LinkedHashMap保存了记录的插入顺序，可以按照插入的顺序使用Iterator遍历
- TreeMap：TreeMap实现SortedMap接口，能够把它保存的记录根据键排序，默认是按键值的升序排列，也可以指定排序的比较器，当用Iterator遍历TreeMap时，得到的记录是排过序的。如果使用排序的映射，建议使用TreeMap，在使用TreeMao的时候，key必须实现Comparable接口或者在构造TreeMap传入自定义的Comparator，否则会在运行时抛出java.lang.ClassCastException类型的异常

<div class="note warning"><p>对于上述四种类型的类，要求映射种的key是不可变对象。不可变对象可以保证该对象在创建后它的哈希值不会被改变，如果对象的哈希值发生变化，Map对象很可能就定位不到映射的位置了。</p></div>

### HashMap原理分析

HashMap是Java程序员使用频率最高的用于映射（键值对）处理的数据类型。JDK1.8对HashMap底层的实现进行了优化，例如引入了红黑树的数据结构和扩容优化等，因此，分析HashMap需要注意区别JDK1.7和JDK1.8的区别。

#### 存储方式

从结构实现来讲，HashMap是数组+链表+红黑树（JDK1.8增加红黑树部分）实现的，如下图所示：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210820172615.png" alt="image-20210820172450491" style="zoom:33%;" />

在HashMap的底层存储实现上是存储在：

```java
    transient Node<K,V>[] table;
```

其中Node具体如下：

```java
static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;    //用来定位数组索引位置
        final K key;
        V value;
        Node<K,V> next;   //链表的下一个node

        Node(int hash, K key, V value, Node<K,V> next) { ... }
        public final K getKey(){ ... }
        public final V getValue() { ... }
        public final String toString() { ... }
        public final int hashCode() { ... }
        public final V setValue(V newValue) { ... }
        public final boolean equals(Object o) { ... }
}
```

Node是HashMap的一个内部类，实现了Map.Enrty接口，本质就是一个映射（键值对）。上图中每个黑色圆点就是一个Node对象。

HashMap就是使用哈希表来存储的。哈希表为解决冲突，可以采用开放地址法和链地址法等来解决问题，HashMap就是采用了链地址法，即数组加链表的方式，在每个数组元素上都加上一个链表结构，当数据被Hash后，得到数组下标，把数据房子啊对应下标元素的链表上，例如程序执行如下代码：

```java
map.put("jycoder","吉永超");
```

系统将调用“jycoder”这个key的hashCode方法得到其哈希值，然后通过哈希算法的后两步运算（高位运算和取模运算）来定位该键值对的存储位置，有时两个key会定位到相同的问题，这个时候就发生了哈希碰撞。对于哈希算法而言，计算的结果越分散，哈希碰撞的概率就越小，Map的存取效率就会越高。

如果哈希桶的数组很大，即使较差的哈希算法也会比较分散，如果哈希桶的数组很小，即使再好的哈希算法也会出现较多碰撞，所以就需要根据实际情况确定哈希桶数组的大小，并且在此基础上设计好的哈希算法来减少哈希碰撞。

HashMap中有几个非常重要的属性：

```java
int threshold;  // 所能容纳的key-value对极限 
final float loadFactor;    // 负载因子
int modCount;  // HashMap内部结构发生变化的次数
int size;  // HashMap中实际存在的键值对数量
```

其中，`Node[] table`的初始长度length默认值是16，负载因子loadFactor默认值是0.75，threshold是HashMap所能容纳的最大数量的Node（键值对）的个数。它们之间的关系是：$threshold=length*loadFactor$，也就是说，在数组定义好长度之后，负载因子越大，所能容纳的键值对个数就越多。

当超过threshold所能容纳的数量，HashMap就需要重新resize（扩容），扩容后的HashMap容量是之前容量的两倍。默认的负载因子0.75是对空间和时间效率的平衡选择，一般不要轻易修改，如果内存很多而又对时间效率要求很高，可以降低负载因子loadFactor的值；相反，如果内存紧张而对时间效率要求不高，可以增加负载因子loadFactor的值，这个值可以大于1。

size这个字段的含义就是HashMap中实际存在的键值对数量，而modCount主要记录HashMap内部结构发生变化的次数，主要用于迭代的快速失败。这里的内部结构发生变化指的是强调的是结构发生变化，例如put新键值对，但是某个key对应的value值被覆盖步属于结构变化。

在HashMap中，哈希桶数组table的长度length大小必须为2<sup>n</sup>，HashMap采用这种设计，主要是为了取模和扩容时做优化，同时为了减少冲突，具体可以参考：[关于hashMap的容量为什么是2的幂次方](https://blog.csdn.net/LLF_1241352445/article/details/81321991HashMap)。定位哈希桶索引位置时，也加入例如高位参与运算的过程。

不过，即使负载因子和哈希算法设计的再合理，也避免不了拉链过长的情况，一旦拉链过长，则会严重影响HashMap的性能。于是，在JDK1.8中，对数据结构做了进一步的优化，引入了红黑树，当链表长度太长（默认超过8）时，链表就转换为了红黑树，利用红黑树快速增删改查的特点提高HashMap的性能，其中会运用到红黑树的插入、删除、查找等算法。具体可以参考[红黑树](https://jycoder.club/2021/06/24/leetcode/)。

#### 方法实现

##### 确定哈希桶数组索引位置

不管增加、删除、查找键值对，定位到哈希桶数组的都是很关键的第一步，前面提到过HashMap的数据结构是数组和链表的结合， 如果每个位置上的元素数量只有一个，那么当我们使用哈希算法求得这个位置的时候，马上就可以获取对应位置的元素，而不需要遍历整个链表。HashMap定位数组索引位置的方法，直接决定了哈希方法的离散性能，源码的实现如下：

```java
// 方法一
static final int hash(Object key) {   //jdk1.8 & jdk1.7
     int h;
     // h = key.hashCode() 为第一步 取hashCode值
     // h ^ (h >>> 16)  为第二步 高位参与运算
     return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
// 方法二
static int indexFor(int h, int length) {  //jdk1.7的源码，jdk1.8没有这个方法，但是实现原理一样的
     return h & (length - 1);  //第三步 取模运算，JDK1.8在计算位置的时候采用方法一返回的哈希值 & 长度-1
}
```

可以发现，在JDK1.8中，哈希算法基本步骤就是三步：取key的hashCode值、高位运算、取模运算。

对于任意给定的对象，只要它的hashCode方法返回值相同，那么程序调用方法所计算得到的Hash码值总是相同的。其中一种方式对将哈希值对数组长度取模运算，这样做的好处是元素的分布会相对来说比较均匀，但是，模运算的消耗还是比较大的。在HashMap中会调用方法二来计算对象应该保存在table数组的哪个索引处。

这个方法非常巧妙，它通过h&(table.length-1)来得到该对象的保存位，而HashMap的长度length总是为2<sup>n</sup>，此时，h&(table.length-1)与h%length这两种运算结果式等价的，但是&比%具有更高的效率。

<div class="note info"><p>假设容量为2的n次幂的化，那么table.length的二进制就是一个1后面n个0，而length - 1就是一个0后面n个1，那么在计算为了说明h & (table.length - 1)，由于length - 1的二进制前面都是0，相当于舍弃了高位，只保留了后面的n位，后面的n刚好在0到length之间，也就是等于h % length取余。</p></div>

在JDK1.8的实现中，优化了高位运算的算法，通过hashCode()的高位异或低16位实现的：`(h = k.hashcode())^(h >>> 16)`，主要是从速度、功效、质量来考虑的，这么做可以在数组table的length比较小的时候，也能保证考虑到高低Bit都参与到Hash的计算中，同时不会有太大的开销。

下面举例说明，n位table的长度：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210820191752.png" alt="image-20210820191752063" style="zoom: 50%;" />

##### put方法

put方法的整体执行过程如下图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210820192026.png" alt="image-20210820192026243" style="zoom: 67%;" />

JDK1.8put方法的源代码如下：

```java
 public V put(K key, V value) {
     // 对key的hashCode()做hash
      return putVal(hash(key), key, value, false, true);
  }
 final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
     	// 步骤1：table位空则创建
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
     	// 步骤2：计算index，并对null做处理
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;
            // 步骤3：节点key存在，直接value
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            // 步骤4：判断该链表为红黑树
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            // 步骤5：该链为链表
            else {
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        // 链表长度大于8转换为红黑树进行处理
                        if (binCount >= TREEIFY_THRESHOLD - 1)
                            treeifyBin(tab, hash);
                        break;
                    }
                    // key已经存在直接覆盖value
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        // 步骤6：超过最大容量就扩容
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
```

详细说明如下：

- 判断键值对数组table[i]是否为空或者为null，否则执行resize()进行扩容
- 根据键值key计算hash值得到插入元素数组的索引i，如果`table[i] == null`，直接新建节点添加，转向步骤6，否则转向步骤3
- 判断table[i]的首个元素是否和key一样，如果相同（hashCode && equals）直接覆盖value，否则转向步骤4
- 判断table[i]是否为treeNode，即table[i]是否是红黑树，如果是红黑树，则直接在树中插入键值对，否则转向步骤5
- 遍历table[i]，判断链表的长度是否大于8，大于8的话就把链表转换为红黑树，在红黑树中执行插入操作，否则进行链表的插入操作，遍历过程中若发现key已经存在直接覆盖value即可
- 插入成功后，判断实际存在的键值对数量size是否超过了最大容量，如果超过，就进行扩容操作

##### 扩容机制

扩容就是重新计算容量。在向HashMap对象中不断地添加元素，而HashMap对象内部地数组无法装在更多地元素时，对象就需要扩大数组的长度，以便能装入更多的元素。

JDK1.7中的扩容过程：

```java
 void resize(int newCapacity) {   //传入新的容量
     Entry[] oldTable = table;    //引用扩容前的Entry数组
     int oldCapacity = oldTable.length;         
     if (oldCapacity == MAXIMUM_CAPACITY) {  //扩容前的数组大小如果已经达到最大(2^30)了
        threshold = Integer.MAX_VALUE; //修改阈值为int的最大值(2^31-1)，这样以后就不会扩容了
        return;
     }
 
     Entry[] newTable = new Entry[newCapacity];  //初始化一个新的Entry数组
     transfer(newTable);                         //！！将数据转移到新的Entry数组里
     table = newTable;                           //HashMap的table属性引用新的Entry数组
     threshold = (int)(newCapacity * loadFactor);//修改阈值
 }
```

newTable[i]的引用赋给了e.next，也就是使用了单链表的头插入方式，同一位置上的新元素总会被放在链表的头部位置，这样先放一个索引上的元素会被放到Entry链的尾部（如果发生了哈希冲突的话），在旧数组中同一条Entry链上的元素，通过重新计算索引位置后，有可能被放到了新数组的不同位置上。

下面通过具体的例子来说明扩容过程。假设我们所使用的哈希算法就是简单的用key mod 一下表的大小（也就是数组的长度）。其中的哈希桶数组table的size等于2，所以key3、5、7，put顺序依次为5、7、3/在mod 2以后冲突都在table[1]这里了。这里假设负载因子loadFactor=1，即当键值对的实际大小size大于table的实际大小时进行扩容。接下来三个步骤时哈希桶数组resize成4，然后所有的Node重新rehash的过程。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210822172355.png" alt="image-20210822172315873" style="zoom: 67%;" />

在JDK1.8中，由于融入了红黑树，相对而言就比较复杂：

```java
    final Node<K,V>[] resize() {
        Node<K,V>[] oldTab = table;
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        int oldThr = threshold;
        int newCap, newThr = 0;
        if (oldCap > 0) {
            // 超过最大值就不再扩充
            if (oldCap >= MAXIMUM_CAPACITY) {
                threshold = Integer.MAX_VALUE;
                return oldTab;
            }
            // 没超过最大值，就扩充为原来的2倍
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
                newThr = oldThr << 1; // double threshold
        }
        else if (oldThr > 0) // initial capacity was placed in threshold
            newCap = oldThr;
        else {               // zero initial threshold signifies using defaults
            newCap = DEFAULT_INITIAL_CAPACITY;
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }
        // 计算新的resize上限
        if (newThr == 0) {
            float ft = (float)newCap * loadFactor;
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                      (int)ft : Integer.MAX_VALUE);
        }
        threshold = newThr;
        @SuppressWarnings({"rawtypes","unchecked"})
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        table = newTab;
        if (oldTab != null) {
            // 把每个bucket都移动到新的buckets中
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                if ((e = oldTab[j]) != null) {
                    oldTab[j] = null;
                    if (e.next == null)
                        newTab[e.hash & (newCap - 1)] = e;
                    else if (e instanceof TreeNode)
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    else { // 链表优化重hash的代码块
                        Node<K,V> loHead = null, loTail = null;
                        Node<K,V> hiHead = null, hiTail = null;
                        Node<K,V> next;
                        do {
                            next = e.next;
                            // 原索引
                            if ((e.hash & oldCap) == 0) {
                                if (loTail == null)
                                    loHead = e;
                                else
                                    loTail.next = e;
                                loTail = e;
                            }
                            // 原索引 + oldCap
                            else {
                                if (hiTail == null)
                                    hiHead = e;
                                else
                                    hiTail.next = e;
                                hiTail = e;
                            }
                        } while ((e = next) != null);
                        // 原索引放到bucket里
                        if (loTail != null) {
                            loTail.next = null;
                            newTab[j] = loHead;
                        }
                        // 原索引 + oldCap放到bucket里 
                        if (hiTail != null) {
                            hiTail.next = null;
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
        return newTab;
    }
```

JDK1.8中对扩容做了一些优化，经过观察可以发现，我们每次扩容都会将长度扩容为原来的2倍，所以，元素的位置要么是在原来的位置，要么就是在原位置再移动2次幂的位置。在下图中，n为table的长度，图（a）表示扩容前key1和key2两种key确定索引位置的示例，图（b）表示扩容后key1和key2两种key确定索引位置的示例，其中hash1是key1对应的哈希与高位运算的结果。

![image-20210822173845756](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210822174738.png)

元素在重新计算hash之后，因为n变为2倍，那么n-1的mask范围在高位多1bit（红色），因此新的index就会发生这样的变化：

![image-20210822175112399](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210822175112.png)

因此，我们在扩充HashMap的时候，不再需要像JDK1.7的实现那样重新计算hash，只需要看看原来的hash值新增的哪个bit是1还是0就好了，是0就表示索引没有变化，是1就表示索引变成了“原索引+oldCap”，下图为16扩充至32的过程的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210822175500.png" alt="image-20210822175500642" style="zoom: 67%;" />

这个设计非常的巧妙，既省去了重新计算hash值得时间，同时，由于新增的1bit是0还是1可以认为是随机的，因为resize的过程，均匀的把之前的冲突节点分散到新的bucket了。需要注意的是，JDK1.7中rehash的时候，旧链表迁移新链表的时候，如果在新表的数组索引位置相同，则链表元素会倒置，但从上图可以看出，JDK1.8不会倒置。

##### 线程安全性

在多线程使用场景中，应该尽量避免使用线程不安全的HashMap，而使用线程安全的ConcurrentHashMap。HashMap线程不安全的主要原因是在多线程的使用场景下可能会造成死循环，如果多个线程同时put时，如果同时触发了rehash操作，会导致HashMap中的链表中出现循环节点，进而使得后面get的时候，会出现死循环。

JDK1.7的示例如下：

```java
public class HashMapInfiniteLoop {  

    private static HashMap<Integer,String> map = new HashMap<Integer,String>(2，0.75f);  
    
    public static void main(String[] args) {  
        map.put(5， "C");  

        new Thread("Thread1") {  
            public void run() {  
                map.put(7, "B");  
                System.out.println(map);  
            };  
        }.start();  
        new Thread("Thread2") {  
            public void run() {  
                map.put(3, "A);  
                System.out.println(map);  
            };  
        }.start();        
    }  
} 

```

其中，map初始化为一个长度为2的数组，loadFactor=0.75，threshold=2*0.75=1，也就是说当put第二个元素的时候，map就需要进行resize了。

通过设置断点让线程1和线程2同时debug到transfer方法的首行，注意此时两个线程已经成功添加数据。放开thread1的断点至transfer方法的`Entry next = e.next`，这一行，然后放开线程2的断点，让线程2进行resize，结果如下图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210823212826.png" alt="image-20210823212826409" style="zoom:50%;" />

注意，Thread1的e指向了key(3)，而next指向了key(7)，其在线程二rehash后，指向了线程二重组后的链表。

线程一被调度回来执行，先是执行newTable[i] = e，然后是e = next，导致了e指向了key(7)，而下一次循环的next = e.next导致了next指向了key(3)。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210823213103.png" alt="image-20210823213103782" style="zoom:50%;" />

e.next = newTable[i]导致key(3)指向了key(7)。注意：此时的key(7).next已经指向了key(3)，环形链表就这样出现了。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210823213234.png" alt="image-20210823213234071" style="zoom:50%;" />

此时，再对map做索引位置为3的get操作，就会死循环在这里，CPU成功达到100%，比如，调用map.get(11)，即会引起死循环，而且map中还丢失了元素，(5,“c”)也已经不再map中了。

以上是JDK7的情况，JDK8虽然不会出现死循环的情况，但是会发生数据被覆盖的情况。

https://zhuanlan.zhihu.com/p/76735726

### ConcurrentHashMap源码分析

#### JDK1.7的实现

ConcurrentHashMap的成员变量中，包含了一个Segment的数组，Segment是ConcurrentHashMap的内部类，然后在Segment这个类中，包含了一个HashEntry数组，而HashEntry也是ConcurrentHashMap的内部类。HashEntry中，包含了key和value以及next指针（类似于HashMap中的Entry），所以HashEntry可以构成一个链表。

简单来说，ConcurrentHashMap数据结构为一个Segment数组，Segment的数组结构为HashEntry的数组，而HashEntry存放的就是我们的键值对，可以构成链表，它们之间的关系如下图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210826161224.png" alt="image-20210826161224347" style="zoom:70%;" />

它的put方法：

```java
 public V put(K key, V value) {
        Segment<K,V> s;
        if (value == null)
            throw new NullPointerException();
        // 二次哈希，以保证数据的分散性，避免哈希冲突
        int hash = hash(key.hashCode());
        int j = (hash >>> segmentShift) & segmentMask;
        // Unsafe 调用方式，直接获取相应的 Segment
        if ((s = (Segment<K,V>)UNSAFE.getObject          // nonvolatile; recheck
             (segments, (j << SSHIFT) + SBASE)) == null) //  in ensureSegment
            s = ensureSegment(j);
        return s.put(key, hash, value, false);
    }
```

在put方法中，首先是通过二次哈希减小哈希冲突的可能性，根据hash值以Unsafe调用方式，直接获取响应的Segment，最终将数据添加到容器中是由segment对象的put方法来完成。Segment对象的put方法源代码如下：

```java
final V put(K key, int hash, V value, boolean onlyIfAbsent) {
    // 无论如何，确保获取锁 scanAndLockForPut会去查找是否有key相同Node
    ConcurrentHashMap.HashEntry<K,V> node = tryLock() ? null :
            scanAndLockForPut(key, hash, value);
    V oldValue;
    try {
        ConcurrentHashMap.HashEntry<K,V>[] tab = table;
        int index = (tab.length - 1) & hash;
        ConcurrentHashMap.HashEntry<K,V> first = entryAt(tab, index);
        for (ConcurrentHashMap.HashEntry<K,V> e = first;;) {
            // 更新已存在的key
            if (e != null) {
                K k;
                if ((k = e.key) == key ||
                        (e.hash == hash && key.equals(k))) {
                    oldValue = e.value;
                    if (!onlyIfAbsent) {
                        e.value = value;
                        ++modCount;
                    }
                    break;
                }
                e = e.next;
            }
            else {
                if (node != null)
                    node.setNext(first);
                else
                    node = new ConcurrentHashMap.HashEntry<K,V>(hash, key, value, first);
                int c = count + 1;
                // 判断是否需要扩容
                if (c > threshold && tab.length < MAXIMUM_CAPACITY)
                    rehash(node);
                else
                    setEntryAt(tab, index, node);
                ++modCount;
                count = c;
                oldValue = null;
                break;
            }
        }
    } finally {
        unlock();
    }
    return oldValue;
}
```

由于Segment对象本身就是一把锁，所以在新增数据的时候，相应的Segment对象块是被锁住的，其它线程并不能操作这个Segment对象，这样就保证了数据的安全性，在扩容的时候也是这样的，在JDK1.7中的ConcurrentHashMap扩容只是针对Segment对象中的HashEntry数组进行扩容，这个时候，由于Segment对象是一把锁，所以在rehash的过程中，其他线程无法对Segment的hash表做操作，这就解决了HashMap中由于put数据引起的闭环问题。

#### JDK1.8的实现

在容器的安全上，1.8中的ConcurrentHashMap放弃了JDK1.7的分段技术，而是采用了CAS机制 + synchronized来保证并发安全性，但是在ConcurrentHashMap实现里保留了Segment定义，这仅仅是为了保证序列化时的兼容性，并没有结构上的用处。

在存储结构上，JDK1.8中ConcurrentHashMap放弃了HashEntry结构而是采用了跟HashMap结构非常相似，采用Node数组加链表（链表长度大于8的时候转为红黑树）的形式，Node节点设计如下：

```java
static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        volatile V val;
        volatile Node<K,V> next;
        ...省略...
 }   
```

JDK1.8的ConcurrentHashMap的示意图如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210826163233.png" alt="ConcurrentHashMap示意图" style="zoom:67%;" />

ConcurrentHashMap新增的核心方法有两个：putVal（新增）和transfer（扩容）。

```java
public V put(K key, V value) {
    return putVal(key, value, false);
}
```

可以看到put方法本身也是调用putVal方法：

```java
    final V putVal(K key, V value, boolean onlyIfAbsent) {
        // 如果 key 为空，直接返回
        if (key == null || value == null) throw new NullPointerException();
        // 两次 hash ，减少碰撞次数
        int hash = spread(key.hashCode());
        // 记录链表节点得个数
        int binCount = 0;
        // 无条件得循环遍历整个 node 数组，直到成功
        for (ConcurrentHashMap.Node<K,V>[] tab = table;;) {
            ConcurrentHashMap.Node<K,V> f; int n, i, fh;
            // lazy-load 懒加载的方式，如果当前 tab 容器为空，则初始化 tab 容器
            if (tab == null || (n = tab.length) == 0)
                tab = initTable();

            // 通过Unsafe.getObjectVolatile()的方式获取数组对应index上的元素，如果元素为空，则直接无所插入
            else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
                //// 利用CAS去进行无锁线程安全操作
                if (casTabAt(tab, i, null,
                        new ConcurrentHashMap.Node<K,V>(hash, key, value, null)))
                    break;                   // no lock when adding to empty bin
            }
            // 如果 fh == -1 ，说明正在扩容，那么该线程也去帮扩容
            else if ((fh = f.hash) == MOVED)
                // 协作扩容操作
                tab = helpTransfer(tab, f);
            else {
                // 如果上面都不满足，说明存在 hash 冲突，则使用 synchronized 加锁。锁住链表或者红黑树的头结点，来保证操作安全
                V oldVal = null;
                synchronized (f) {
                    if (tabAt(tab, i) == f) {

                        if (fh >= 0) {// 表示该节点是链表
                            binCount = 1;
                            // 遍历该节点上的链表
                            for (ConcurrentHashMap.Node<K,V> e = f;; ++binCount) {
                                K ek;
                                //这里涉及到相同的key进行put就会覆盖原先的value
                                if (e.hash == hash &&
                                        ((ek = e.key) == key ||
                                                (ek != null && key.equals(ek)))) {
                                    oldVal = e.val;
                                    if (!onlyIfAbsent)
                                        e.val = value;
                                    break;
                                }
                                ConcurrentHashMap.Node<K,V> pred = e;
                                if ((e = e.next) == null) {//插入链表尾部
                                    pred.next = new ConcurrentHashMap.Node<K,V>(hash, key,
                                            value, null);
                                    break;
                                }
                            }
                        }
                        else if (f instanceof ConcurrentHashMap.TreeBin) {// 该节点是红黑树节点
                            ConcurrentHashMap.Node<K,V> p;
                            binCount = 2;
                            if ((p = ((ConcurrentHashMap.TreeBin<K,V>)f).putTreeVal(hash, key,
                                    value)) != null) {
                                oldVal = p.val;
                                if (!onlyIfAbsent)
                                    p.val = value;
                            }
                        }
                    }
                }
                // 插入完之后，判断链表长度是否大于8，大于8就需要转换为红黑树
                if (binCount != 0) {
                    if (binCount >= TREEIFY_THRESHOLD)
                        treeifyBin(tab, i);
                    // 如果存在相同的key ，返回原来的值
                    if (oldVal != null)
                        return oldVal;
                    break;
                }
            }
        }
        //统计 size，并且检测是否需要扩容
        addCount(1L, binCount);
        return null;
    }
```

详细说明：

- 在ConcurrentHashMap中不允许key val字段为空，所以第一步先校验key value的值。key、val两个字段都不是null才继续往下走，否则直接抛出了NullPointerException异常，这是与HashMap有区别的地方，HashMap是可以允许为空的
- 判断容器是否初始化，如果容器没有初始化，则调用initTable方法初始化

initTable方法具体如下：

```java
    /**
     * Initializes table, using the size recorded in sizeCtl.
     */
    private final Node<K,V>[] initTable() {
        Node<K,V>[] tab; int sc;
        while ((tab = table) == null || tab.length == 0) {
            // 负数表示正在初始化或扩容，等待
            if ((sc = sizeCtl) < 0)
                // 自旋等待
                Thread.yield(); // lost initialization race; just spin
            // 执行 CAS 操作，期望将 sizeCtl 设置为 -1，-1 是正在初始化的标识
            else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            // CAS 抢到了锁
                try {
                // 对 table 进行初始化，初始化长度为指定值，或者默认值 16
                    if ((tab = table) == null || tab.length == 0) {
                        // sc 在初始化的时候用户可能会自定义，如果没有自定义，则是默认的
                        int n = (sc > 0) ? sc : DEFAULT_CAPACITY;
                        // 创建数组
                        Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                        table = tab = nt;
                        // 指定下次扩容的大小，相当于 0.75 × n
                        sc = n - (n >>> 2);
                    }
                } finally {
                    sizeCtl = sc;
                }
                break;
            }
        }
        return tab;
    }
```

Table本质上就是一个Node数组，其初始化过程也就是对Node数组的初始化过程，方法中使用了CAS策略执行初始化操作。初始化流程为：

1. 判断sizeCtl值是否小于0，如果小于0表示ConcurrentHashMap正在执行初始化操作，所以需要先等待一会，如果其他线程初始化失败还可以顶替上去
2. 如果sizeCtl值大于等于0，则基于CAS策略抢占标记sizeCtl为-1，表示ConcurrentHashMap正在执行初始化，然后构造table，并更新sizeCtl的值

初始化号table之后继续添加元素：

- 根据双哈希之后的hash值找到数组对应的小标位置，如果该位置未存放节点，也就是说不存在哈希冲突，则使用CAS无锁的方法将数据添加到容器中，并且结束循环
- 如果并未满足第三步，加入到扩容大军中（ConcurrentHashMap扩容采用的是多线程的方式），扩容时并未跳出死循环，这一点就保证了容器在扩容的时候并不会有其他的线程进行数据添加操作，这也保证了容器的安全性
- 如果哈希冲突，则进行链表操作或者红黑树操作（如果链表树超过8，则修改链表为红黑树），在进行链表或者红黑树操作时，会使用synchronized锁把头结点锁住，保证了同时只有一个线程修改链表，防止出现链表成环
- 进行addCount（1L，binCount）操作，该操作会更新size大小，判断是否需要扩容

addCount方法的源码如下：

```java
    // X传入的是1，check 传入的是 putVal 方法里的 binCount，没有hash冲突的话为0，冲突就会大于1
    private final void addCount(long x, int check) {
        ConcurrentHashMap.CounterCell[] as; long b, s;
        // 统计ConcurrentHashMap里面节点个数
        if ((as = counterCells) != null ||
                !U.compareAndSwapLong(this, BASECOUNT, b = baseCount, s = b + x)) {
            ConcurrentHashMap.CounterCell a; long v; int m;
            boolean uncontended = true;
            if (as == null || (m = as.length - 1) < 0 ||
                    (a = as[ThreadLocalRandom.getProbe() & m]) == null ||
                    !(uncontended =
                            U.compareAndSwapLong(a, CELLVALUE, v = a.value, v + x))) {
                fullAddCount(x, uncontended);
                return;
            }
            if (check <= 1)
                return;
            s = sumCount();
        }
        // check就是binCount，binCount 最小都为0，所以这个条件一定会为true
        if (check >= 0) {
            ConcurrentHashMap.Node<K,V>[] tab, nt; int n, sc;
            // 这儿是自旋，需同时满足下面的条件
            // 1. 第一个条件是map.size 大于 sizeCtl，也就是说需要扩容
            // 2. 第二个条件是`table`不为null
            // 3. 第三个条件是`table`的长度不能超过最大容量
            while (s >= (long)(sc = sizeCtl) && (tab = table) != null &&
                    (n = tab.length) < MAXIMUM_CAPACITY) {
                int rs = resizeStamp(n);
                // 该判断表示已经有线程在进行扩容操作了
                if (sc < 0) {
                    if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                            sc == rs + MAX_RESIZERS || (nt = nextTable) == null ||
                            transferIndex <= 0)
                        break;
                    // 如果可以帮助扩容，那么将 sc 加 1. 表示多了一个线程在帮助扩容
                    if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                        transfer(tab, nt);
                }
                // 如果不在扩容，将 sc 更新：标识符左移 16 位 然后 + 2. 也就是变成一个负数。高 16 位是标识符，低 16 位初始是 2
                else if (U.compareAndSwapInt(this, SIZECTL, sc,
                        (rs << RESIZE_STAMP_SHIFT) + 2))
                    transfer(tab, null);
                s = sumCount();
            }
        }
```

addCount 方法做了两个工作：

- 对 map 的 size 加一
- 检查是否需要扩容，或者是否正在扩容。如果需要扩容，就调用扩容方法，如果正在扩容，就帮助其扩容。

最后是ConcurrentHashMap的扩容过程：

### HashTable源码分析

HashTable底层基于数组与链表实现，通过synchronized关键字保证线程安全，但作为已经废弃的类，建议使用ConcurrentHashMap。

HashTable的默认构造函数，容量为11，加载因子为0.75，扩容大小2倍+1。





## Set

### HashSet源码分析

HashSet实现了Set接口，在底层就是在HashMap的基础上包了一层，只不过存储的时候value默认存储了一个Object的静态变量，取的时候也是只返回key：

```java
	private static final Object PRESENT = new Object();
```

核心方法的实现：

```java
public boolean add(E e) {
    return map.put(e, PRESENT)==null;
}
 public boolean remove(Object o) {
     return map.remove(o)==PRESENT;
 }

 public boolean contains(Object o) {
     return map.containsKey(o);
 }
```

HashSet是调用HashMap的put()方法，而put方法中有这样的逻辑，如果哈希值和key都一样，就会直接拿新的值覆盖旧值，而HashSet就是利用这个特性来保证唯一性的。

# 反射

## 反射的定义

反射主要指程序可以访问、检测和修改其本身状态或行为的一种能力，在Java环境中，反射机制允许程序在执行时获取类自身的定义信息，例如实现动态创建属性、方法和类的对象、变更属性的内容和执行特定的方法的功能，从而使Java具有动态语言的特性，增强了程序的灵活性可移植性。

## 反射的作用

Java反射机制的主要用于实现以下功能：

- 在运行时判断任意一个对象所属的类型
- 在运行时构造任意一个类的对象
- 在运行时判断任意一个类所具有的成员变量和方法
- 在运行时调用任意一个对象的方法，哪怕可以调用private方法

## 核心API

核心包 - java.lang.reflect

- java.lang.Class：代表一个类
- java.lang.reflect.Method：代表类的方法
- java.lang.reflect.Constructor：代表类的构造方法
- java.lang.reflect.Array：提供了动态创建数组及访问数组元素的静态方法。该类中的所有方法都是静态的

# 泛型

## 由来
