## Java语言

### JVM、JDK 和 JRE 联系与区别？

JVM（Java虚拟机）是运行Java字节码的虚拟机，JVM针对于不同的操作系统有不同的实现（Windows,Linux,Mac os），在不同的操作系统上使用相同的字节码文件可以得到相同的结果。

Java程序从源代码到运行一般经历下面3个步骤：

![image-20210629231212350](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/image-20210629231212350.png)

JDK（Java Development Kit）是功能齐全的Java SDK，它不止有JRE，还有编译器（Javac）和工具（例如Java doc 和Jdb），它可以创建和编译程序。

JRE是Java运行时环境，它是运行已经编译的Java程序所需的内容的集合，包括Java虚拟机、Java类库、Java命令和其他的一些基础构件，但是，它不能用来创建新的程序。

### 构造器 Constructor 是否可被 override?

构造器无法被重写，但可以重载。

### 重载和重写的区别？

重载发生在同一个类中，方法名必须相同，参数类型、个数、顺序不同，方法返回值和修饰值可以不同。

### 面向对象编程三⼤特性: 封装 继承 多态

- 封装

	封装是把一个对象的属性私有化，根据需要提供一些可以被外界访问属性的方法

- 继承

	继承是使用已经存在的类的定义作为基础建立新的类，新类的定义可以增加新的数据或功能，也可以使用父类的功能，子类拥有父类所有的属性和方法（包括私有属性和私有方法），但是父类中的私有属性和方法子类是无法访问的，子类可以拥有自己的属性和方法，即子类可以对父类进行扩展，子类也可以重写父类的方法。

- 多态

	多态是值程序中定义的引用变量所指向的具体类型和通过该引用变量发出的方法调用在编程时并不确定，而是在程序运行期间才确定，即一个引用变量到底会指向哪个类的实例对象，该引用变量发出的方法调用到底是哪个类中实现的方法，必须是在程序运行期间才能决定。

### String StringBuffer 和 StringBuilder 的区别是什么?

- String：不可变字符序列
- StringBuffer：可变字符序列，效率低，线程安全
- StringBuilder：可变字符序列，效率高，线程不安全

###  String类为什么是不可变的?

在Java中，String被设计成一个不可变的类，也就是常量对象，理由如下：

- String常量池需要

	JVM为了提升性能和减少内存开销，设计了字符串常量池，字符串不可变的特性就是其设计基础。

- 缓存Hashcode

	可以将Hash值存储起来，不用每次都计算，会给String作为key的数据结构，例如HashMap、HashTable等带来性能提升。

- 安全

	可以防止通过反射机制等有意或者恶意修改，从而预防安全问题。

- 线程安全

	不可变的对象意味着天生就是线程安全的，可以被多个线程共享。

缺点：对于字符串拼接操作会带来极大的性能消耗，这种情况可以使用StringBuffer、StringBuilder来替代String。

### Integer的缓存机制？
Integer 是对小数据（-128到127）是有缓存的，在JVM初始化的时候，数据-128到127之间的数字便被缓存到了本地内存中，如果初始化-128到127之间的数字，会直接从内存中取出，不需要新建一个对象。
### 深拷贝和浅拷贝的区别？

浅拷贝：对于基本数据类型进行值传递，对引用数据类型进行引用传递般的拷贝；

深拷贝：对基本数据类型进行值传递，对引用数据类型，创建一个新的对象，并复制其内容，此为深拷贝。

### 接口和抽象类的区别

- 接口的方法默认都是public，所有的方法在接口中不能有实现；
- 接口中除了static、final变量，不能有其他变量，而抽象类中则不一定；
- 一个类可以实现多个接口，但只能实现一个抽象类。但接口本身可以多继承。
- 接口方法的默认修饰符是public，抽象类的方法的修复可以是public、protected和default这些修饰符（不能是private）；
- 从设计的层面来说，抽象是对类的抽象，是一种模板设计，而接口是对行为的抽象，是一种行为的规范。

以上对JDK8之前的定义和规范，从JDK8开始接口的概念有了一些变化，在JDK7或更早的版本中，接口里面只能由常量、变量和抽象方法，实现接口类必须重写接口中的抽象方法，JDK8接口中增加了默认方法和静态方法，JDK9接口中增加了私有方法和私有静态方法。

### 构造方法有哪些特性？

- 名称与类名相同
- 没有返回值，但不能用void声明构造方法
- 生成类的对象时自动执行，无需调用
- 默认有一个不带参数的构造方法
- 如果显式的指定了带参的构造方法，默认不再提供无参的构造方法

总的来说构造方法与普通方法的区别如下：

| Java构造函数                                               | Java方法                                   |
| ---------------------------------------------------------- | ------------------------------------------ |
| 构造器用于初始化对象的状态（状态）                         | 方法用于暴露对象的行为                     |
| 构造函数不能有返回类型                                     | 方法一般都有返回类型                       |
| 构造函数隐式调用                                           | 方法要显式的调用                           |
| 如果没有指定任何构造函数，java编译器提供一个默认的构造函数 | 在任何情况下编译器都不会提供默认的方法调用 |
| 构造函数名称必须与类名称相同                               | 方法名称可以或可以不与类名称相同           |

### String中hashCode的实现？

```java
    public int hashCode() {
        int h = hash;
        if (h == 0 && value.length > 0) {
            char val[] = value;

            for (int i = 0; i < value.length; i++) {
                h = 31 * h + val[i];
            }
            hash = h;
        }
        return h;
    }
```

### hashCode和equals的作用？

两个相同对象

### JDK8有哪些新特性？

- Lambda表达式
- 函数式接口
- 方法引用
- Stream API
- 接口中的默认方法和静态
- 新的时间和日期API
- Optional

### Java反射有哪些作用？

Java的反射机制主要用于实现以下功能：

- 在运行时判断任意一个对象所属的类型
- 在运行时构造任意一个类的对象
- 在运行判断任意一个类所具有的成员变量和方法
- 在运行时调用任意一个对象的方法，包括private方法

### 如何使用反射获取私有属性？

```java
// 1.获取私有属性
Field[] fields = clz.getDeclaredFields();
// 2.获取私有构造方法
Constructor cons = clazz.getDeclaredConstructor(null);  
// 必须要设置之后才可以访问
cons.setAccessible(true);
cons.newInstance(null);
```

### 创建对象有哪些方式？

共有五种方式：

- new关键字
- 反射API
- Constructor.newInstance
- Clone()方法
- 反序列化

### 迭代器和for循环遍历的区别？

迭代器是一种设计模式，可以使得序列类型的数据结构的遍历行为与被遍历的对象分离，即我们无需关心该序列的底层结构是什么样子的。只要拿到这个对象，使用迭代器可以遍历这个对象的内部。

迭代器实现了Iterabale接口的集合都可以使用迭代器来遍历。使用迭代器遍历元素时，除了查看之外，只能做remove操作。

增强for循环，内部使用的是迭代器，所以它的操作对象是数组和可以迭代器的结合。遍历时只能查看，无法修改、删除、增加。

<div class="note warning"><p>迭代出来的元素都是原来集合元素的拷贝，Java集合元素实质是对象的引用，而非对象本身，迭代出的对象也是引用的拷贝，结果还是引用。那么如果集合中保存的元素是可变类型的，那么可以通过迭代出的元素修改原集合中的对象</p></div>

总的来说，两者的区别主要在于遍历和集合本身是否分离，从数据结构的角度分析，如果使用Iterator来遍历集合的元素，并不需要考虑集合类的内部实现（只要），而如果使用for循环进行遍历，那么遍历此集合的算法都得做相应的调整。

### 过滤器和拦截器的区别？

- 过滤器指的是，在java web中，传入的request、response提前过滤一些信息，或者提前设置一些参数，然后传入servlet或者struts的action进行业务逻辑，比如过滤掉非法url。
- 拦截器指的是，是在面向切面编程的时候，使用动态代理拦截方法等。

### List、Set、Map三者的区别？

List用来存储一组不唯一（可以重复），有序的对象；

Set用来存储不允许重复的集合，不会有多个元素引用相同集合的对象；

Map是用来存储键值对的，Map会维护与Key有关联的值，两个不同的Key可以引用相同的对象，Key不能重复。

### HashMap实现原理？

[Java 8系列之重新认识HashMap - 美团技术团队 (meituan.com)](https://tech.meituan.com/2016/06/24/java-hashmap.html)

### HashMap为什么扩容为2倍？

HashMap为了存取高效，要尽量较少碰撞，就是要尽量把数据分配均匀，每个链表长度大致相同，使用的算法是：`hash & (length - 1)`，实际上`hash & (length - 1) = hash % length`，主要考虑到模运算的速度比位运算的的快。

### 为什么HashMap不用LinkedList，而是选用数组？

在HashMap中，定位桶的位置是利用元素的key的哈希值对数组长度取模得到，此时已知桶的位置，使用数组查询的效率会LinkedList大；不使用ArrayList的原因是，ArrayList的扩容机制是1.5倍扩容，无法自定义扩容机制。

### JDK1.8对HashMap有哪些优化？

- 由数组 + 链表的结构改为了数组 + 链表 + 红黑树
- 优化了高位运算的hash算法：`h^(h >>> 16)`
- 扩容后，元素要么是在原来的位置，要么是在原位置再移动2次幂的位置，且链表顺序不变

### 为什么不直接使用红黑树，而是选择先用链表，再转红黑树？

因为红黑树需要进行左旋、右旋、变色这些操作来保持平衡，而单链表不需要，当元素小于8个的时候，此时做查询操作，链表结构已经能保证查询性能，当元素大于8个的时候，此时需要红黑树来加速查询速度，但是新增节点的效率变慢了，因此，如果一开始就用红黑树结构，元素太少，新增效率又比较慢，无疑这是浪费性能的。

### HashMap不使用红黑树，而是使用二叉查找树可以吗？

可以，但是二叉查找树在特殊情况下会变成一条线性结构，此时遍历查找会非常慢。

### 为什么阈值是8？

hashcode碰撞次数与泊松分布有关，选择8是根据概率统计而选择的。泊松分布的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210823233913.png" alt="image-20210823233717518" style="zoom:50%;" />

### 当链表转为红黑树，什么时候退化为链表？

等于6的时候退转为链表。中间有差值7可以防止链表和树之间频繁的转换。假设这个互相转换的界限都是8，那么如果一个HashMap不停的插入、删除元素，链表个数会在8左右徘徊，就会频繁的发生树转链表、链表转树，效率会很低。

### HashMap在并发编程环境下有什么问题？

- 多线程扩容，引起的死循环问题
- 多线程put的时候可能导致元素丢失
- put非null元素后get出来的却是null

### 使用可变类当HashMap的key有什么问题？

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

### 如何实现一个自定义的Class作为HashMap的key？

- 重写hashcode和equals
- 如何设计一个不可变类

### 两个相同对象没有重写equals方法放到HashMap覆盖吗?

不会覆盖，HashMap使用对象的hashCode方法确定对象在哈希表中的存储位置，并使用equals方法来比较key是否相等，如果对象不重写equals方法，将对象放到HashMap的时候就会调用Object的equals方法，比较地址，这时候就会认为是两个不同的对象，所以不会覆盖。

### HashSet实现原理？

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

### CurrentHashMap的实现原理？

JDK1.7分段锁的设计，JDK1.8：Node + CAS + Synchronized

### ArrayList的实现原理？

ArrayList底层使用一个支持自动扩容的数组来保存所有元素。ArrayList并不是线程安全的，只能在单线程环境下使用，多线程环境下可以使用`java.util.Collections.SynchronizedList`或`java.util.concurrent.CopyOnWriteArrayList`来代替。
