---
title: leetcode in Java
date: 2021-06-24 15:33:37
tags:
 - 算法
top: 1
author: 吉永超
---

算法是编程世界的核心内容，本文主要记录使用Java 语言实现leetcode题目的过程。相应的源代码可以参考：[ 算法刷题示例 ](https://github.com/jiyongchao-qf/learn-leetcode)。
<!-- more -->

# 前言

如何精通一个领域？

- Chunk it up（切碎知识点）
- Deliberate practicing（刻意练习）
- Feedback（反馈）

整个算法与数据结构需要掌握的内容大致有：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210708155818.png" alt="image-20210708155818510"  />

# 数据结构

数据结构，是相互之间存在一种或多种特定关系的数据元素的集合。按照视点的不同，我们把数据结构分为逻辑结构和物理结构。其中，逻辑结构又可以分为集合结构、线性结构、树形结构、图形结构等，物理结构可以分为顺序存储结构和链式存储结构。

数据结构优化的核心思路，一是升维 二是用空间换时间。

## 数组

数组的查询的时间复杂度O(1)，插入/删除元素的时间复杂度O(n)。

初始化数组的方式：

- 静态初始化：

	```java
	int[] nums = new int[]{1, 2, 3, 4, 5, 9};
	```

- 简单的静态初始化：

	```java
	int[] nums = {1, 2, 3, 4, 5, 9};
	```

- 动态初始化：

	```java
	int[] nums = new int[4];
	```

遍历数组的方式：

- 传统的for循环方式：

	```java
	public class Main {
	    public static void main(String[] args) {
	        int[] ns = {1, 4, 9, 16, 25};
	        for (int i = 0; i < ns.length; i++) {
	            System.out.println(ns[i]);
	        }
	    }
	}
	```

- 使用foreach循环：

	```java
	public class Main {
	    public static void main(String[] args) {
	        int[] ns = {1, 4, 9, 16, 25};
	        for (int n : ns) {
	            System.out.println(n);
	        }
	    }
	}
	```

- 使用Java标准库中的Arrays.toString()：

	```java
	import java.util.Arrays;
	
	public class Main {
	    public static void main(String[] args) {
	        int[] ns = {1, 1, 2, 3, 5, 8};
	        System.out.println(Arrays.toString(ns));
	    }
	}
	```

## 链表

链表的查询时间时间复杂度O(n)，插入/删除元素的时间复杂度O(1)

提高链表线性表查找的效率？

1. 添加第一级索引
2. 添加第二级索引
3. 添加多级索引，总数为log2n个索引

时间复杂度为O(log2n)，空间复杂度为O(n)



## 跳表

跳表的问题：索引的维护比较困难

## 哈希表

哈希表（Hash table），也叫散列表，是根据关键码值直接访问元素的数据结构，它通过把关键码值映射到表中一个位置来访问记录，以加快查找的速度，即通过某个函数f，使得：

```txt
存储位置 = f（关键字）
```

这样我们可以通过查找关键字而不需要比较就可以获取需要的记录的存储位置，这个映射函数f叫做散列函数或者哈希函数，存放记录的数组叫做哈希表（或散列表），关键字所对应的记录位置称为散列地址。

散列技术即是一种存储方法，也是一种查找方法。散列技术的记录之间不存在什么逻辑关系，它只与关键字有关系，因此最适合求接的问题是查找与给定值相等的记录。

当两个关键字key<sub>1</sub> ≠ key<sub>2</sub>，但是却有f(key<sub>1</sub>) = f(key<sub>2</sub>)，这种现象我们称为冲突，并把key<sub>1</sub>和key<sub>2</sub>称为这个散列函数的同义词。

构造哈希函数的方法主要有：

- 直接定址法：f(key) = a*key + b(a、b均为常数)
- 数字分析法
- 平法取中法
- 折叠法
- 除留余数法 ：f(key) = key mod p (p <= m)
- 随机数法

处理散列冲突的方法：

- 开放地址法
- 再散列函数法
- 链地址法
- 公共区溢出法

## 栈

stack：先入后出；添加，删除皆为O(1)，有时候也称为FILO

> - 如果问题具有最近相关性，就可以使用栈来解决。
> - 如果要用栈来实现队列，可以用两个栈。

## 队列

queue：先入先出；添加、删除皆为O(1)，有时候也成为FIFO

> - 如果问题具有公平性，就可以使用队列来解决。
> - 如果要用队列来实现栈，可以用两个队列



## 双端队列

双端队列（Dequeue） Double-End Queue

## 树

### 总体介绍

现实生活中，除了前面的一对一的线性结构，还有很多一对多的数据结构——“树”。

树的表示方法有：

- 双亲表示法
- 孩子表示法
- 孩子兄弟表示法

对于计算机来说，它只有循环、判断、递归等方式，也就是说，它只能处理线性序列，树的遍历实际上就是将树中的结点编程某种意义上的线性序列，方便计算机处理。

在实际工程中，经常采用递归来解决树相关的问题的原因是：

- 节点的定义

- 可重复性（自相似性）

### 代码模板

```java
public class TreeNode {
    public int val;
    public TreeNode left;
    public TreeNode right;

    public TreeNode(int val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}
```

## 二叉树

二叉树的遍历方法有以下几种：

- 前序（Pre-order）：根-左-右
- 中序（In-order）：左-根-右
- 后序（Post-order）：左-右-根
- 层次遍历

二叉树遍历遍历的性质：

- 已知前序遍历序列和中序遍历序列，可以唯一确定一颗二叉树
- 已知中序遍历序列和后序遍历序列，可以唯一确定一颗二叉树

>已知前序和后序遍历，无法确定唯一一颗二叉树。

如果二叉树退化成了链表（即元素都在左子树上或者都在右子树上），那么时间复杂度会变成O（n）

## 二叉搜索树

二叉搜索树，也称二叉搜索树、有序二叉树（Ordered Binary Tree）、二叉排序树（Sorted Binary Tree），是一棵空树或者具有下列性质的二叉树：

- 左子树上的`所有结点`的值均小于它的根节点的值
- 右子树上`所有结点`的值均大于它的根结点的值
- 依次类推：左、右子树也分别为二叉查找树（这就是重复性）

二叉搜索树的性质：

- 中序遍历是递增序列


二叉搜索树的插入和查询时间复杂度都是O(logn)。

## 平衡二叉树

平衡二叉树是一种二叉排序树，每一个结点的左子树和右子树的高度差至多等于1，平衡二叉树有时候也称为AVL树。

平衡二叉树的性质：

- 我们将二叉树的左子树深度减去右子树深度的值称为平衡因子（BF），那么平衡二叉树的所有结点的平衡因子只可能是-1，0，1。
- 平衡二叉树的查找、插入和删除的时间复杂度均为O（logn）

## 红黑树

[为什么工程中都用红黑树，而不是其他平衡二叉树？ - 知乎 (zhihu.com)](https://www.zhihu.com/question/27542473)

## 多路查找树

多路查找树的每一个结点的孩子树可以多于两个，且每一个结点处可以存储多个元素。

### 2-3树

### 2-3-4树

### B树

### B+树

## 堆

堆是具有下列性质的完全二叉树：每个结点的值都大于或等于其左右孩子结点的值，称为大顶堆，或者每个结点的值都小于或等于其左右孩子结点的值，称为小顶堆，如下图所示：

![image-20210707172409423](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210707172409.png)

这里由定义可知，根节点一定是堆中所有结点最大（小）者。

## 优先队列

### 总体介绍

优先队列(Priority Queue)的作用是能保证每次取出的元素都是队列中权值最小的（Java的优先队列每次取得是最小元素）。元素的大小默认是通过元素本身的自然顺序，也可以通过构造时传入比较器。

Java中的PriorityQueue实现了Queue接口，不允许放入null元素，其通过堆实现，具体是通过完全二叉树实现的小顶堆，这也意味着可以通过数组来作为PriorityQueue的底层实现。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210707223529.png" alt="PriorityQueue_base.png" style="zoom: 50%;" />

优先队列的插入操作时间复杂度是：O(1)，取出操作：O(logN) ，底层具体实现的数据结构较为多样和复杂：heap、bst、treap...。

### 方法剖析

`add(E e)`和`offer(E e)`的语义相同，都是向队列中插入元素，二者的区别在于插入失败情况的处理，前者插入失败是抛出异常，后者则返回false。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210707224316.png" alt="PriorityQueue_offer.png" style="zoom:50%;" />

`element()`和`peek()`语义完全相同，都是获取但不删除队首元素，也就是队列中权值最小的那个元素，二者的区别在于获取失败的情况的处理，前者会抛出异常，后者会返回null。根据小顶堆的性质，堆顶那个元素就是全局最小的那个，如果用数组来存储堆，根据下标关系，`0`下标处的那个元素即是堆顶元素，因此，直接返回数组`0`下标处的那个元素即可。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210707225025.png" alt="PriorityQueue_peek.png" style="zoom:50%;" />

`romve()`和`poll()`方法的语义也完全相同，都是获取并删除队首元素，二者的区别在于删除失败的情况的处理，前者会抛出异常，后者会返回null。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210707225501.png" alt="PriorityQueue_poll.png" style="zoom: 50%;" />

## 图



## 拓扑排序



## 并查集

并查集（Disjoint-set）

适用的场景：

组团、配对问题

Group or not？

并查集的操作

1、makeSet（s）：建立一个新的并查集，其中包含s个单元素集合。

2、unionSet（x，y）：把元素x和元素y所在的集合合并，要求x和y所在的集合不相交，如果相交则不合并。

3、find（x）：找到元素x所在的集合的代表，该操作也可以用于判断两个元素是否位于同一个集合，只要将他们各自的代表比较一下就可以了。

# 常用算法

算法是解决特定问题求解步骤的描述，在计算机中表现为指令的有限序列，并且每条指令表示一个或多个操作。

算法具有五个基本特性：输入、输出、有穷性、确定性和可行性。

算法设计的要求：正确性、可读性、健壮性、时间效率高和低存储。

## 递归

### 定义

递归从某种意义上来说和循环是等价的。

### 代码模板

```java
 public void recursion(int level, param1, param2,...) {
       // 递归的终止条件
       if (level > MAX_LEVEL) {
           process_result;
           return;
       }
       // 处理当前层逻辑
       process(level, data...);
  
       // 下探到下一层
       recursion(level + 1, newParam);
  
       // 如果有必要的话清理当前层不需要的全局变量或者其他东西
   }
```

## 分治

### 定义

分治指的是将一个大问题分解为若干个小问题，分治从某种意义上和递归也是等价的。

### 代码模板

```java
public void divideConquer(problem, param1, param2,...) {
       // 递归的终止条件
       if (problem != None) {
           return result;
       }
       // 准备数据
       data = prepareData(problem);
       // 分割子问题
       subProblem = splitProblem(problem, data);
       // 处理子问题
       subResult1 = divideConquer(subProblem[0], param1, param2,...);
       subResult2 = divideConquer(subProblem[0], param1, param2,...);
       subResult3 = divideConquer(subProblem[0], param1, param2,...);
       ...
       // 合并结果
       processResult(subResult1, subResult2, subResult3,...);
       // 清理当前状态集
   }
```

## 回溯

### 定义

回溯法采用试错的思想，它尝试分步的去解决一个问题。在分布解决问题的过程中，当它通过尝试发现现有的分布答案不能得到有效的正确的解答的时候，它将取消上一步甚至是上几步的计算，再通过其它的可能分布解答再次尝试寻找问题的答案。

回溯法通常用最简的递归方法来实现，在反复重复上述的步骤后可能出现两种情况：

- 找到一个可能存在的正确的答案；
- 在尝试了所有可能的分布方法后宣告该问题没有答案。

在最坏的情况下，回溯法会导致一次复杂度为指数时间的计算。回溯法的典型应用：八皇后问题和数独。

### 代码模板

## 贪心算法

### 定义

贪心算法是一种在每一步选择中都采取在当前状态下最好或最有（即最有利的选择），从而希望导致结果是全局最好或最优的算法。

贪心算法与动态规划的不同在于它对于每个子问题的解决方案都做出选择，不能回退，动态规划则会保存以前的运算结果，并根据以前的结果对当前进行选择，有回退功能。

贪心法可以解决一些最优化问题，如：求图中的最小生成树、哈夫曼编码等。然而对于工程和生活中的问题，贪心法一般不能得到我们所求的答案。

一旦一个问题可以通过贪心法来解决，那么贪心法一般是解决这个的最好办法。由于贪心法的高效性以及其所求得得答案比较接近最优结果，贪心法也可以用作辅助算法或者直接解决一些要求结果不特别精确得问题。

## 深度优先搜索

### 定义

对于树这种数据结构而言，深度优先具体指的就是，前、中、后序遍历。

### 代码模板

## 广度优先搜索

### 定义

### 代码模板

## 字典树

### 定义

字典树，即Trie树，又称单词查找树或键树，是一种树形结构。典型应用是用于统计和排序大量的字符串（但不限于字符串），所以经常被搜索引擎系统用于文本词频统计。

它的优点是：最大限度地减少无谓地字符串比较，查询效率比哈希表高。

注意：字典树不是二叉树，可以有多个子节点。

基本性质：

1、结点本身不存完整单词；

2、从根结点到某一结点，路径上经过的字符连接起来，为该结点对应的字符串；

3、每个结点的所有子节点路径代表的字符都不相同

### 代码模板

## 二分查找

### 定义

### 代码模板

## 布隆过滤器

### 定义

布隆过滤器由一个很长的二进制向量和一系列随机映射函数构成，可以用于检索一个元素是否在一个集合中。

布隆过滤器本质上是由长度为m的位向量或位列表（仅包含0或1位值的列表）组成，最初初始值均为0，如下图所示。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210705232804.webp" alt="img" style="zoom:67%;" />

使用多个哈希函数产生多个哈希值：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210705232745.webp" alt="img" style="zoom:67%;" />

如上图所示，当输入"semlinker"时，预设的3个哈希函数将输出2、4、6，假设另一个输入"kakuqo"，哈希函数输出3、4和7。4这个位置已经被"semlinker"标记了，在布隆过滤器中是可以共用这个标记位的，此时，当前位向量的标记状态为：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210706001503.webp" alt="img" style="zoom:67%;" />



此时，假设我们要判断"fullstack"是否在集合中，对其使用散列函数，获取哈希函数输出的 3 个索引值分别是 2、3 和 7：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210706001722.webp" alt="img" style="zoom:67%;" />

可以看到，虽然"fullstack"不在集合中，但是计算出的索引值均为1，说明它在集合中，这就产生了误报，产生的原因是由于哈希碰撞导致的巧合而将不同的元素存储在相同的比特位上。相应的，布隆过滤器有一个可预测的误判率。

![img](https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210706001934.webp)

布隆过滤器的优点是空间效率和查询时间都远远超过一般的算法，缺点是有一定的误别率和删除困难。

总而言之，当布隆过滤器把元素都插入结束之后，对于测试元素（新元素）。当它验证是否存在的时候，如果验证位是1，那么有可能在，如果是0，那么一定不存在。

### 代码模板

## LRU Cache

### 定义

LRU Cache缓存

1、记忆

2、钱包 - 储物柜

3、代码模块

两个要素：大小、替换策略

Hash Table + Double LinkedList

O(1)查询

O(1)修改、更新

LRU（最近至少使用）

### 代码模板

## 位运算

### 定义

|             含义             | 运算符 |         示例         |
| :--------------------------: | :----: | :------------------: |
|             左移             |   <<   |     0011 -> 0110     |
|             右移             |   >>   |     0110 -> 0011     |
|            按位或            |   \|   | 0011 \| 1011 -> 1011 |
|            按位与            |   &    | 0011 & 1011 -> 0011  |
|           按位取反           |   ~    |    ~0011 -> 1100     |
| 按位异或（相同为零不同为一） |   ^    | 0011 ^ 1011 -> 1000  |

### 性质

- x^0 = x
- x^1s = ~x   // 注意1s = ~0
- x^(~x) = 1s
- x^x = 0
- c = a^b => a^c = b, b^c = a // 交换两个数
- a^b^c = (a^b)^c = a^(b^c)

### 实战技巧

- 判断奇偶：

	x%2 == 1 -> (x&1) == 1

	x%2 == 0 -> (x&1) == 0

- x >> 1 -> x/2

	即x = x/2; -> x = x>>1; mid = (left + right)/2; -> mid = (left + right) >> 1;

- x = x&(x-1) 清零最低位的1

- x&-x => 得到最低位的1

- x&-x => 0

## 排序算法

### 冒泡排序

### 简单选择排序

### 直接插入排序

### 希尔排序

### 堆排序

### 归并排序

### 快速排序

### 总结

## 动态规划

动态规划（Dynamic Programming） → 动态递归

将一个复杂的问题分解为子问题：分治 + 最优子结构

关键点

动态规划和递归或者分治 没有根本上的区别（关键是看有无最优子结构）

共性：找到重复子问题

差异性：最优子结构、中途可以淘汰次优解

# 高频考题（简单）

## [283. 移动零](https://leetcode-cn.com/problems/move-zeroes/)

```java
public void moveZeroes(int[] nums) {
        if (nums == null || nums.length == 0) {
            return;
        }
        // 将非零数移动到index处
        int index = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                nums[index] = nums[i];
                index++;
            }
        }

        for (int i = index; i < nums.length; i++) {
            nums[i] = 0;
        }
    }
```

## [70. 爬楼梯 ](https://leetcode-cn.com/problems/climbing-stairs/)

直接使用递归求接斐波那契数列：

```java
    public int climbStairs(int n) {
        if (n == 1) {
            return 1;
        }
        if (n == 2) {
            return 2;
        }
        return climbStairs(n - 1) + climbStairs(n - 2);
    }
```

使用循环求解：

```java
    public int climbStairs(int n) {
        if (n <= 2) {
            return n;
        }
        int f1 = 1, f2 = 2, f3 = 3;
        for (int i = 3; i < n + 1; i++) {
            f3 = f1 + f2;
            // 优化
            f1 = f2;
            f2 = f3;
        }
        return f3;
    }
```

## [206. 反转链表](https://leetcode-cn.com/problems/reverse-linked-list/)

双指针的解法：

```java
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
```

## [141. 环形链表 ](https://leetcode-cn.com/problems/linked-list-cycle/)

使用哈希表来实现：

```java
    public boolean hasCycle(ListNode head) {
        Set<ListNode> listNodes = new LinkedHashSet<ListNode>;
        while (head != null) {
            if (!listNodes.add(head.next)) {
                return true;
            }
            head = head.next;
        }
        return false;
    }
```

快慢指针法：

```java
public boolean hasCycle(ListNode head) {
        if (head == null || head.next == null) {
            return false;
        }
        ListNode slow = head;
        ListNode fast = head.next;
        while (slow != fast) {
            if (fast == null || fast.next == null) {
                return false;
            }
            slow = slow.next;
            fast = fast.next.next;
        }
        return true;
    }

```

## [20. 有效的括号](https://leetcode-cn.com/problems/valid-parentheses/)

可以使用暴力破解法，即遍历字符串，找到最近的匹配括号开始，如果匹配就替换为空字符串，一直循环下去，如果括号是匹配的，那么最终的结果应该是个空字符串。

这里使用的栈来解决。

```java
public boolean isValid(String s) {
        Map<Character, Character> characterMap = new HashMap<>();
        characterMap.put('{', '}');
        characterMap.put('[', ']');
        characterMap.put('(', ')');
        Deque<Character> stack = new LinkedList<>();
        for (int i = 0; i < s.length(); i++) {
            char bracket = s.charAt(i);
            // 栈中有左括号
            if (characterMap.containsKey(bracket)) {
                // 如果栈中元素为空或者与Map中括号不匹配
                if (stack.isEmpty() || stack.peek() != characterMap.get(bracket)) {
                    return false;
                }
                stack.pop();
            } else {
                stack.push(bracket);
            }
        }

        return false;
    }
```

除了这种，还有一种相对比较简单的写法：

```java
    public boolean isValid(String s) {
        Deque<Character> stack = new LinkedList<>();
        for (char c : s.toCharArray()) {
            if (c == '[') {
                stack.push(']');
            } else if (c == '{') {
                stack.push('}');
            } else if (c == '(') {
                stack.push(')');
            } else if (stack.isEmpty() || c != stack.pop()) {
                return false;
            }
        }
        return stack.isEmpty();
    }
```

## [155. 最小栈 ](https://leetcode-cn.com/problems/min-stack/)

```java
class MinStack {
	
    // 存储最小值的栈
    Deque<Integer> minStack;
    // 普通的栈
    Deque<Integer> stack;

    /**
     * initialize your data structure here.
     */
    public MinStack() {
        minStack = new LinkedList<>();
        stack = new LinkedList<>();
        minStack.push(Integer.MAX_VALUE);
    }

    public void push(int val) {
        stack.push(val);
        minStack.push(Math.min(val, minStack.pop()));
    }

    public void pop() {
        stack.pop();
    }

    public int top() {
        return stack.peek();
    }

    public int getMin() {
        return minStack.pop();
    }
}
```

## [242. 有效的字母异位词](https://leetcode-cn.com/problems/valid-anagram/)

使用排序：

```java
    public boolean isAnagram(String s, String t) {
        char[] sChars = s.toCharArray();
        char[] tChars = t.toCharArray();
        // 注意这里不能简写为 Arrays.sort(s.toCharArray())，因为Arrays.sort采用的就地排序。
        Arrays.sort(sChars);
        Arrays.sort(tChars);
        return Arrays.equals(sChars, tChars);
    }
```

使用哈希表：

```java
    public boolean isAnagram(String s, String t) {
        HashMap<Character, Integer> hashTable = new HashMap<>();
        for (char c : s.toCharArray()) {
            hashTable.put(c, hashTable.getOrDefault(c, 0) + 1);
        }
        for (char c : t.toCharArray()) {
            hashTable.put(c, hashTable.getOrDefault(c, 0) - 1);
            if (hashTable.get(c) < 0) {
                return false;
            }
        }
        return true;
    }
```

## [94. 二叉树的中序遍历](https://leetcode-cn.com/problems/binary-tree-inorder-traversal/)

使用传统的递归方式：

```java
   public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> list = new ArrayList<>();
        this.inorder(root, list);
        return list;
    }

    public void inorder(TreeNode root, List<Integer> res) {
        if (root == null) {
            return;
        }
        if (root.left != null) {
            inorder(root.left, res);
        }
        res.add(root.val);
        if (root.right != null) {
            inorder(root.right, res);
        }
    }
```

迭代实现：

```java
  public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        while (stack.size() > 0 || root != null) {
            // 不断往左子树方向走，每走一次就将当前节点保存到栈中
            // 这是模拟递归的调用
            if (root != null) {
                stack.add(root);
                root = root.left;
                // 当前节点为空，说明左边走到头了，从栈中弹出节点并保存
                // 然后转向右边节点，继续上面整个过程
            } else {
                TreeNode tmp = stack.pop();
                res.add(tmp.val);
                root = tmp.right;
            }
        }
        return res;
    }
```

莫里斯遍历：

```java
public List<Integer> inorderTraversal3(TreeNode root) {
        if (root == null) {
            return new ArrayList<>();
        }

        TreeNode cur = root;    // 记录当前节点位置
        List<Integer> res = new ArrayList<>();
        while (cur != null) {
            if (cur.left == null) {   // 左节点为空，移到右子节点
                res.add(cur.val);
                cur = cur.right;
            } else {
                TreeNode prev = cur.left;
                while (prev.right != null && prev.right != cur) { // 遍历到左子树的最右侧节点
                    prev = prev.right;
                }
                if (prev.right == null) {        // 建立返回父节点连接
                    prev.right = cur;
                    cur = cur.left;
                } else {                        // 左子树建立了连接，说明遍历完了，可以拆除连接
                    res.add(cur.val);           // 中序遍历录入当前节点
                    prev.right = null;
                    cur = cur.right;
                }
            }
        }
        return res;
    }
```

## [104. 二叉树的最大深度](https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/)

递归解法：

```java
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
    }
```

广度优先遍历解法：

```java
public int maxDepthByBFS(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int depth = 0;
        Queue<TreeNode> treeNodeQueue = new LinkedList<>();
        treeNodeQueue.offer(root);
        while (!treeNodeQueue.isEmpty()) {
            int size = treeNodeQueue.size();
            while (size > 0) {
                // 移除上一层的结点
                TreeNode node = treeNodeQueue.poll();
                if (node.left != null) {
                    treeNodeQueue.add(node.left);
                }
                if (node.right != null) {
                    treeNodeQueue.add(node.right);
                }
                size--;
            }
            depth++;
        }
        return depth;
    }
```



# 高频考题（中等）

## [剑指 Offer 67. 把字符串转换成整数](https://leetcode-cn.com/problems/ba-zi-fu-chuan-zhuan-huan-cheng-zheng-shu-lcof/)

```java
public int myAtoi(String str) {
        int index = 0, sign = 1, total = 0;
        // 空字符串
        if (str.length() == 0) {
            return 0;
        }
        // 移除空格
        while (str.charAt(index) == ' ') {
            index++;
        }
        // 处理正负号
        if (str.charAt(index) == '+' || str.charAt(index) == '-') {
            sign = str.charAt(index) == '+' ? 1 : -1;
            index++;
        }
        // 转为数字
        while (index < str.length()) {
            int digit = str.charAt(index) - '0';
            if (digit < 0 || digit > 9) {
                break;
            }
            // 越界处理
            if (Integer.MAX_VALUE / 10 < total ||
                    (Integer.MAX_VALUE / 10 == total && Integer.MAX_VALUE % 10 < digit)) {
                return sign == 1 ? Integer.MAX_VALUE : Integer.MIN_VALUE;
            } else {
                total = 10 * total + digit;
                index++;
            }
        }
        return total * sign;
    }
```

## [11. 盛最多水的容器 ](https://leetcode-cn.com/problems/container-with-most-water/)

传统的遍历方式，时间复杂度为O(n^2)。

```java
   public int maxArea(int[] height) {
        if (height == null || height.length <= 2) {
            return 0;
        }
        int max = 0;
        for (int i = 0; i < height.length - 1; i++) {
            for (int j = i + 1; j < height.length; j++) {
                int hg = Math.min(height[i], height[j]);
                int area = Math.abs(j - i) * hg;
                max = Math.max(max,area);
            }
        }
        return max;
    }
```

也可以采用双边收敛的方式：

```java
private int maxArea(int[] height) {
        int i = 0, j = height.length - 1, max = 0;
        while (i < j) {
            int h = Math.min(height[i],height[j]);
            int res = h * (j - i);
            max = Math.max(res,max);
            if (height[i] < height[j]) {
                i++;
            }else {
                j--;
            }
        }
        return max;
    }
```

## [15. 三数之和](https://leetcode-cn.com/problems/3sum/)

穷举法：

```java
    public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> res = new LinkedList<>();
        int target = 0;
        for (int i = 0; i < nums.length - 2; i++) {
            for (int j = i + 1; j < nums.length - 1; j++) {
                for (int k = j + 1; k < nums.length; k++) {
                    if ((nums[i] + nums[j] + nums[k]) == target) {
                        List<Integer> integers = Arrays.asList(nums[i],nums[j],nums[k]);
                        res.add(integers);
                    }
                }
            }
        }
        return res;
    }
```

双指针法：

```java
    public List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> res = new LinkedList<>();
        if (nums == null || nums.length < 3) {
            return res;
        }
        // 排序
        Arrays.sort(nums);
        // O(n^2)
        for (int i = 0; i <= nums.length - 1; i++) {
            // 经过排序之后的数组第一个数大于0，后面的数都比它大，一定不成立
            if (nums[i] > 0) {
                break;
            }
            // 去掉重复情况
            if (i > 0 && nums[i] == nums[i - 1]) {
                continue;
            }
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                if (nums[left] + nums[right] + nums[i] == 0) {
                    res.add(new ArrayList<>(Arrays.asList(nums[i], nums[left], nums[right])));
                    left++;
                    right--;
                    // 去掉重复情况，一直移动到没有相同项
                    while (left < right && nums[left] == nums[left - 1]) {
                        left++;
                    }
                    while (left < right && nums[right] == nums[right + 1]) {
                        right--;
                    }
                } else if (nums[left] + nums[right] + nums[i] < 0) {
                    left++;
                } else { // nums[left] + nums[right] + nums[i] > 0
                    right--;
                }
            }
        }

        return res;
    }
```

## [49. 字母异位词分组](https://leetcode-cn.com/problems/group-anagrams/)

使用哈希表，将排序之后的字符串作为key，并且排序之后相同的字符串添加到列表中，最后从Map中获取值并返回。

```java
public List<List<String>> groupAnagrams(String[] strs) {
        HashMap<String, List<String>> map = new HashMap<>();
        for (int i = 0; i < strs.length; i++) {
            char[] chars = strs[i].toCharArray();
            Arrays.sort(chars);
            String key = String.valueOf(chars);
            if (!map.containsKey(key)) {
                map.put(key, new ArrayList<>());
            }
            map.get(key).add(strs[i]);
        }
        return new ArrayList<>(map.values());
    }
```

## [22. 括号生成](https://leetcode-cn.com/problems/generate-parentheses/)

括号生成的状态树：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210712114808.png" alt="image.png" style="zoom:50%;" />

```java
    public List<String> generateParenthesis(int n) {
        List<String> res = new LinkedList<>();
        if (n <= 0) {
            return res;
        }
        dfs("", res, n, 0, 0);
        return res;
    }

    public void dfs(String paths, List<String> res, int n, int left, int right) {
        // 剪枝,去掉( > n 或 ) > n 或 ) > (的情况，由于传递性，) > n可以去掉
        if (left > n || right > left) {
            return;
        }
        // 因为括号都是成对出现的，因此需要遍历的树的深度为n*2
        if (paths.length() == n * 2) {
            res.add(paths);
            // 每次遍历后，需要将上一次的结果清理，从根结点继续遍历
            paths = "";
            return;
        }
        dfs(paths + '(', res, n, left + 1, right);
        dfs(paths + ')', res, n, left, right + 1);
    }
```

## [98. 验证二叉搜索树](https://leetcode-cn.com/problems/validate-binary-search-tree/)

> 二叉搜索树有两个重要性质，第一，左子树上所有结点的值都要小于根节点的值，右子树所有结点的值都要大于根节点的值；第二，中序遍历后的结果是一个递增的数列。

使用递归：

```java
    public boolean validate(TreeNode node, long min, long max) {
        // 终止条件
        if (node == null) {
            return true;
        }

        if (node.val <= min || node.val >= max) {
            return false;
        }
        // 相当于给子树上所有的节点都添加了min和max的边界
        // 约束root的左子树的值不超过root的值，右子树的值不小于root的值
        return validate(node.left, min, node.val) && validate(node.right, node.val, max);
    }
```

利用中序遍历的性质：

```java

```

除此之外，也可以先进行中序遍历，然后判断返回的列表是否为升序。

## [236. 二叉树的最近公共祖先](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-tree/)

```java
```



## [50. Pow(x, n)](https://leetcode-cn.com/problems/powx-n/)

使用暴力解法：

```java
    public double myPow(double x, int n) {
        long N = n;
        if (N < 0) {
            N = -n;
            x = 1 / x;
        }
        double ans = 1;
        while (N > 0) {
            ans = ans * x;
            N--;
        }
        return x;
    }
```

通过观察不难发现，对于f(n) = x<sup>n</sup>（x为常数）都有f(n) = f(n/2)* f(n/2)，因此可以通过分治的方式来处理：

```java
public double myPow2(double x, int n) {
        if (n == 0 || x==1) {
            return 1;
        }
        long N = n;
        if (N < 0) {
            N = -N;
            x = 1 / x;
        }
        return myPow2Helper(x, N);
    }

    private double myPow2Helper(double x, long N) {
        if (N == 1) {
            return x;
        }
        // 如果指数是奇数，则需要补乘一个x
        if (N % 2 != 0) {
            return myPow2Helper(x, N / 2) * myPow2Helper(x, N / 2) * x;
        } else {
            return myPow2Helper(x, N / 2) * myPow2Helper(x, N / 2);
        }
    }
```

## [78. 子集](https://leetcode-cn.com/problems/subsets/)

以求解[1,2,3]的子集为例，画出的树形图如下所示：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210711180106.png" alt="image.png" style="zoom: 50%;" />

使用回溯算法：

```java
 public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> res = new LinkedList<>();
        dfs(nums, res, 0, new ArrayList<>());
        return res;
    }

    public void dfs(int[] nums, List<List<Integer>> res, int n, ArrayList<Integer> temp) {
        res.add(new ArrayList<>(temp));
        for (int i = n; i < nums.length; i++) {
            temp.add(nums[i]);
            dfs(nums, res, i + 1, temp);
            temp.remove(temp.size() - 1);
        }
    }
```

## [17. 电话号码的字母组合](https://leetcode-cn.com/problems/letter-combinations-of-a-phone-number/)

题目的状态树：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210712235154.png" alt="17. 电话号码的字母组合" style="zoom:50%;" />

使用回溯法：

```java
     public List<String> letterCombinations(String digits) {
        List<String> res = new ArrayList<>();
        if (digits.length() == 0) {
            return res;
        }
        Map<String, String> map = new HashMap<>();
        map.put("2", "abc");
        map.put("3", "def");
        map.put("4", "ghi");
        map.put("5", "jkl");
        map.put("6", "mno");
        map.put("7", "pqrs");
        map.put("8", "tuv");
        map.put("9", "wxyz");
        dfs(digits, 0, map, res, new StringBuilder());
        return res;
    }

    public void dfs(String digits, int index, Map<String, String> map, List<String> res, StringBuilder str) {
        if (index == digits.length()) {
            res.add(str.toString());
            return;
        }
        // 获取当前数字对应的字符值
        String val = map.get(digits.substring(index, index + 1));
        for (char c : val.toCharArray()) {
            str.append(c);
            dfs(digits, index + 1, map, res, str);
            // 删除刚才添加到末尾的元素，选择当前数字对应字符串的下一个值进行遍历
            str.deleteCharAt(str.length() - 1);
        }
    }
```

## [102. 二叉树的层序遍历](https://leetcode-cn.com/problems/binary-tree-level-order-traversal/)

```java
public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new LinkedList<>();
        if (root == null) {
            return res;
        }
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            List<Integer> num = new LinkedList<>();
            int size = queue.size();
            // 遍历当前层结点
            while (size > 0) {
                TreeNode treeNode = queue.poll();
                num.add(treeNode.val);
                if (treeNode.left != null) {
                    queue.offer(treeNode.left);
                }
                if (treeNode.right != null) {
                    queue.offer(treeNode.right);
                }
                size--;
            }
            res.add(num);
        }
        return res;
    }
```

## [200. 岛屿数量](https://leetcode-cn.com/problems/number-of-islands/)

岛屿问题是一类典型的网格问题。通常而言，网格中的格子的相邻的格子节点分别是上下左右四个。

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210713174441.jpeg" alt="网格结构中四个相邻的格子" style="zoom:50%;" />

这类问题，深度优先遍历的终止条件：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210713174700.jpeg" alt="网格 DFS 的 base case" style="zoom:50%;" />

这样我们就得到了网格DFS遍历的框架代码：

```java
void dfs(int[][] grid, int r, int c) {
    // 判断 base case
    // 如果坐标 (r, c) 超出了网格范围，直接返回
    if (!inArea(grid, r, c)) {
        return;
    }
    // 访问上、下、左、右四个相邻结点
    dfs(grid, r - 1, c);
    dfs(grid, r + 1, c);
    dfs(grid, r, c - 1);
    dfs(grid, r, c + 1);
}

// 判断坐标 (r, c) 是否在网格中
boolean inArea(int[][] grid, int r, int c) {
    return 0 <= r && r < grid.length 
        	&& 0 <= c && c < grid[0].length;
}
```

与二叉树的深度遍历不同的是，网格的遍历可能会遍历重复的节点：

<img src="https://gitee.com/ji_yong_chao/blog-img/raw/master/img/20210713174948.gif" alt="DFS 遍历可能会兜圈子（动图）" style="zoom:50%;" />

为了避免这样重复的遍历，我们可以将已经遍历过的格子进行标记，也就是说，每个格子可能取三个值：

- 0 表示海洋格子
- 1 表示陆地格子（未遍历过）
- 2 表示陆地格子（已遍历过）

因此我们可以将代码模板修改为：

```java
void dfs(int[][] grid, int r, int c) {
    // 判断 base case
    if (!inArea(grid, r, c)) {
        return;
    }
    // 如果这个格子不是岛屿，直接返回
    if (grid[r][c] != 1) {
        return;
    }
    grid[r][c] = 2; // 将格子标记为「已遍历过」
    
    // 访问上、下、左、右四个相邻结点
    dfs(grid, r - 1, c);
    dfs(grid, r + 1, c);
    dfs(grid, r, c - 1);
    dfs(grid, r, c + 1);
}

// 判断坐标 (r, c) 是否在网格中
boolean inArea(int[][] grid, int r, int c) {
    return 0 <= r && r < grid.length 
        	&& 0 <= c && c < grid[0].length;
}
```

利用这个代码模板求接这个问题实际上就是求深度遍历的次数：

```java
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) {
            return 0;
        }
        // 实际上就是求深度遍历的次数
        int dfsNumber = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    dfs(grid, r, c);
                    dfsNumber++;
                }
            }
        }
        return dfsNumber;
    }

    public void dfs(char[][] grid, int r, int c) {
        // 注意这里的次序不能交换，必须先判断在网格中，再判断元素是否等于'1'
        if (!inArea(grid, r, c) || grid[r][c] != '1') {
            return;
        }
        // 已经遍历过了就设置为0
        grid[r][c] = '0';
        dfs(grid, r - 1, c);
        dfs(grid, r + 1, c);
        dfs(grid, r, c - 1);
        dfs(grid, r, c + 1);
    }

    // 判断格子是否在网格中
    boolean inArea(char[][] grid, int r, int c) {
        return 0 <= r && r < grid.length
                && 0 <= c && c < grid[0].length;
    }
```

​	

# 高频考题（困难）

## [84. 柱状图中最大的矩形](https://leetcode-cn.com/problems/largest-rectangle-in-histogram/)

使用暴力法求解：

```java

```

## [239. 滑动窗口最大值](https://leetcode-cn.com/problems/sliding-window-maximum/)

> 所有滑动窗口的问题都可以使用队列来解决。

暴力求解法：

```java
```

使用最大堆（优先队列）：

```java
 public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        // 传入比较器，当两者的值相同时，比较下标的位置，下标大的在前面。
        PriorityQueue<int[]> queue = new PriorityQueue<>((p1, p2) -> p1[0] != p2[0] ? p2[0] - p1[0] : p2[1] - p1[1]);
        // 初始化k前面的元素到堆中
        for (int i = 0; i < k; i++) {
            queue.offer(new int[]{nums[i], i});
        }
        // 答案总共有n-k+1个
        int[] ans = new int[n - k + 1];
        // 将第一次的答案添加到结果当中
        ans[0] = queue.peek()[0];
        for (int i = k; i < n; i++) {
            // 将新元素加入优先队列
            queue.offer(new int[]{nums[i], i});
            // 循环判断当前队首是否在窗口中，窗口的左边界为i-k
            while (queue.peek()[1] <= i - k) {
                queue.poll();
            }
            ans[i - k + 1] = queue.peek()[0];
        }
        return ans;
    }
```

## [51. N 皇后](https://leetcode-cn.com/problems/n-queens/)

```java
```

