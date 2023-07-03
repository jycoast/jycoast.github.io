
# Java集合

## List、Set、Map三者的区别？

List用来存储一组不唯一（可以重复），有序的对象；

Set用来存储不允许重复的集合，不会有多个元素引用相同集合的对象；

Map是用来存储键值对的，Map会维护与Key有关联的值，两个不同的Key可以引用相同的对象，Key不能重复。

## HashMap实现原理？

[Java 8系列之重新认识HashMap - 美团技术团队 (meituan.com)](https://tech.meituan.com/2016/06/24/java-hashmap.html)

## HashMap为什么扩容为2倍？

HashMap为了存取高效，要尽量较少碰撞，就是要尽量把数据分配均匀，每个链表长度大致相同，使用的算法是：`hash & (length - 1)`，实际上`hash & (length - 1) = hash % length`，主要考虑到模运算的速度比位运算的的快。

## 为什么HashMap不用LinkedList，而是选用数组？

在HashMap中，定位桶的位置是利用元素的key的哈希值对数组长度取模得到，此时已知桶的位置，使用数组查询的效率会LinkedList大；不使用ArrayList的原因是，ArrayList的扩容机制是1.5倍扩容，无法自定义扩容机制。

## JDK1.8对HashMap有哪些优化？

- 由数组 + 链表的结构改为了数组 + 链表 + 红黑树
- 优化了高位运算的hash算法：`h^(h >>> 16)`
- 扩容后，元素要么是在原来的位置，要么是在原位置再移动2次幂的位置，且链表顺序不变

## 为什么不直接使用红黑树，而是选择先用链表，再转红黑树？

因为红黑树需要进行左旋、右旋、变色这些操作来保持平衡，而单链表不需要，当元素小于8个的时候，此时做查询操作，链表结构已经能保证查询性能，当元素大于8个的时候，此时需要红黑树来加速查询速度，但是新增节点的效率变慢了，因此，如果一开始就用红黑树结构，元素太少，新增效率又比较慢，无疑这是浪费性能的。

## HashMap不使用红黑树，而是使用二叉查找树可以吗？

可以，但是二叉查找树在特殊情况下会变成一条线性结构，此时遍历查找会非常慢。

## 为什么阈值是8？

hashcode碰撞次数与泊松分布有关，选择8是根据概率统计而选择的。泊松分布的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210823233913.png" alt="image-20210823233717518" style="zoom:50%;" />

## 当链表转为红黑树，什么时候退化为链表？

等于6的时候退转为链表。中间有差值7可以防止链表和树之间频繁的转换。假设这个互相转换的界限都是8，那么如果一个HashMap不停的插入、删除元素，链表个数会在8左右徘徊，就会频繁的发生树转链表、链表转树，效率会很低。

## HashMap在并发编程环境下有什么问题？

- 多线程扩容，引起的死循环问题
- 多线程put的时候可能导致元素丢失
- put非null元素后get出来的却是null

## 使用可变类当HashMap的key有什么问题？

hashCode可能发生改变，导致put进去的值，无法get出，如下所示：

```java
public class HashMapDemo {
    public static void main(String[] args) {
        HashMap<List<String>, Object> changeMap = new HashMap<>();
        List<String> list = new ArrayList<>();
        list.add("hello");
        Object objectValue = new Object();
        changeMap.put(list, objectValue);
        System.out.println(changeMap.get(list));
        //hashcode发生了改变
        list.add("hello world");
        System.out.println(changeMap.get(list));
    }
}
```

## 如何实现一个自定义的Class作为HashMap的key？

- 重写hashcode和equals
- 如何设计一个不可变类

## HashSet实现原理？

底层使用HashMap实现：

```java
// hashMap的value是Object类型
private transient HashMap<E,Object> map;
private static final Object PRESENT = new Object();

// HashSet添加元素的方法
public boolean add(E e) {
    return map.put(e, PRESENT)==null;
}
// HashSet删除元素的方法
public boolean remove(Object o) {
    return map.remove(o)==PRESENT;
}
```

## CurrentHashMap的实现原理？

JDK1.7分段锁的设计，JDK1.8：Node + CAS + Synchronized

## ArrayList的实现原理？

ArrayList底层使用一个支持自动扩容的数组来保存所有元素。ArrayList并不是线程安全的，只能在单线程环境下使用，多线程环境下可以使用`java.util.Collections.SynchronizedList`或`java.util.concurrent.CopyOnWriteArrayList`来代替。
