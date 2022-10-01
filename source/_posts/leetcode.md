---
title: leetcode in Java
date: 2021-06-24 15:33:37
tags:
 - 算法
author: 吉永超
---

算法是编程世界的核心内容，本文主要记录使用Java 语言实现leetcode题目的过程。
<!-- more -->

# 前言

如何精通一个领域？

- Chunk it up（切碎知识点）
- Deliberate practicing（刻意练习）
- Feedback（反馈）

整个算法与数据结构需要掌握的内容大致有：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210708155818.png" alt="image-20210708155818510"  />

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

主要参考：[30张图带你彻底理解红黑树](https://www.jianshu.com/p/e136ec79235c)

### 定义和性质

红黑树是二叉查找树，具体来说，是一种含有红黑结点并能自平衡的二叉查找树，它必须满足下面的性质：

- 性质1：每个结点要么是黑色，要么是红色
- 性质2：根节点是黑色
- 性质3：每个叶子结点（NIL）是黑色
- 性质4：每个红色结点的两个子节点一定都是黑色
- 性质5：任意一结点到每个叶子结点的路径都包含数量相同的黑节点

从性质5又可以推出：

- 性质5.1：如果一个结点存在黑子结点，那么该结点肯定有两个子结点

一颗简单的红黑树如下图所示：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210829231754.png" alt="一颗简单的红黑树" style="zoom:50%;" />

红黑树并不是一个完美平衡二叉查找树，从图1可以看到，根节点P的左子树显然比右子树高，但左子树和右子树的黑结点的层数是相等的，也即任意一个结点到每个叶子结点的路径都包含数量相同的黑结点（性质5）。所以我们叫红黑树这种平衡为黑色完美平衡。

在红黑树中最主要的有三种操作：左旋、右旋和变色。

- 左旋：以某个结点作为支点（旋转结点），其右子结点变为旋转结点的父结点，右子结点的左子结点变为旋转结点的右子结点，左子结点保持不变
- 右旋：以某个结点作为支点（旋转结点），其左子结点变为旋转结点的父结点，左子结点的右子结点变为旋转结点的左子结点，右子结点保持不变
- 变色：结点的颜色由红变黑或由黑变红

左旋的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210829233108.png" alt="左旋" style="zoom: 67%;" />

右旋的示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210829233211.png" alt="右旋" style="zoom:67%;" />

如果我们暂时忽略颜色，可以看到旋转操作不会影响旋转结点的父结点，父结点以上的结构还是保持不变的。

- 左旋只影响旋转结点和其右子树的结构，把右子树的结点往左子树挪了
- 右旋只影响旋转结点和其左子树的结构，把左子树的结点往右子树挪了

### 红黑树的查找

整体的示意图如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210829233651.png" alt="红黑树的查找" style="zoom:50%;" />

因为红黑树也是一颗二叉平衡树，并且查找不会破坏树的平衡，所以查找跟二叉平衡树的查找无异：

- 从根节点开始查找，把根节点设置为当前结点
- 若当前结点为空，返回null
- 若当前结点不为空，用当前结点的key跟查找key作比较
- 若当前结点等于查找key，那么该key就是查找目标，返回当前结点
- 若当前结点key大于查找key，把当前结点的左子结点设置为当前结点，重复步骤2
- 若当前结点key小于查找key，把当前结点的右子结点设置为当前结点，重复步骤2

### 红黑树的插入

整体的示意图如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210829233941.png" alt="红黑树的插入" style="zoom: 67%;" />

插入操作包括两部分工作：一个是查找插入的位置，而是插入后自平衡。查找插入的父结点很简单，跟查找操作的区别不大：

- 从根结点开始查找
- 若根结点为空，那么插入结点作为根节点，结束
- 若根结点不为空，那么把根结点作为当前结点
- 若当前结点为null，返回当前结点的父结点，结束
- 若当前结点key等于查找key，那么该key所在结点就是插入结点，更新结点的值，结束
- 若当前结点key大于查找key，那么当前结点的左子结点设置为当前结点，重复步骤4
- 若当前结点key小于查找key，把当前结点的右子结点设置为当前结点，重复步骤4

当插入的位置确定之后就是要确定插入结点的颜色，插入的结点都是红色，原因在于，红色在父结点（如果存在）为黑色结点时，红黑树的黑色平衡没被破坏，不需要做自平衡操作。但如果插入结点是黑色，那么插入位置所在的子树黑色结点总是多1，必须做自平衡。

所有可能的插入的情景：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210830094135.png" alt="红黑树插入情景"/>



## 多路查找树

多路查找树的每一个结点的孩子树可以多于两个，且每一个结点处可以存储多个元素，由于它是查找树，所有元素之间存在某种特定的排序关系。

### 2-3树

2-3树是这样一颗多路查找树：其中每一个结点都具有两个孩子（我们称它为2结点）或三个孩子（我们称它为3结点）。

- 一个2结点包含一个元素和两个孩子（或没有孩子），且与二叉排序树类似，左子树包含的元素小于该元素，右子树包含的元素大于该元素。不过，与二叉排序树不同的是，这个2结点要么没有孩子，要么就有两个，不能只有一个孩子
- 一个3结点包含一小一大两个元素和三个孩子（或没有孩子），一个3结点要么没有孩子，要么具有3个孩子。如果某个3结点有孩子的话，左子树包含小于较小元素的元素，右子树包含大于较大元素的元素，中间子树包含介于两元素之间的元素

并且2-3树种所有的叶子都在同一层次上。

### 2-3-4树

2-3-4树实对2-3树的概念扩展，包括了4结点的使用。一个4结点包含小中大三个元素和四个孩子（或没有孩子），一个4结点要么没有孩子，要么具有4个孩子。如果某个4结点有孩子的话，左子树包含于最小元素的元素，第二子树包含大于最小元素，小于第二元素的元素；第三子树包含大于第二元素，小于最低元素的元素；右子树包含大于最大元素的元素。

### B树

B树是一种平衡的多路查找树，2-3树和2-3-4树都是B树的特里。结点最大的孩子数目称为B树的阶。因此，2-3树是3阶的B树，2-3-4树是4阶B树。

### B+树

B+树应文件系统所需而出的一种B树的变形树，注意严格意义上讲，它其实已经不是之前所定义的树了。在B树种，每一个元素在该树只出现一次，有可能在叶子结点上，也可能在分支结点上。而在B+树中，出现在分支结点中的元素会被当做它们在该分支结点位置的中序后继者（叶子结点）中再次列出。另外，每一个叶子结点都会保存一个指向叶子结点的指针。

## 堆

堆是具有下列性质的完全二叉树：每个结点的值都大于或等于其左右孩子结点的值，称为大顶堆，或者每个结点的值都小于或等于其左右孩子结点的值，称为小顶堆，如下图所示：

![image-20210707172409423](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210707172409.png)

这里由定义可知，根节点一定是堆中所有结点最大（小）者。

## 优先队列

### 总体介绍

优先队列(Priority Queue)的作用是能保证每次取出的元素都是队列中权值最小的（Java的优先队列每次取得是最小元素）。元素的大小默认是通过元素本身的自然顺序，也可以通过构造时传入比较器。

Java中的PriorityQueue实现了Queue接口，不允许放入null元素，其通过堆实现，具体是通过完全二叉树实现的小顶堆，这也意味着可以通过数组来作为PriorityQueue的底层实现。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210707223529.png" alt="PriorityQueue_base.png" style="zoom: 50%;" />

优先队列的插入操作时间复杂度是：O(1)，取出操作：O(logN) ，底层具体实现的数据结构较为多样和复杂：heap、bst、treap...。

### 方法剖析

`add(E e)`和`offer(E e)`的语义相同，都是向队列中插入元素，二者的区别在于插入失败情况的处理，前者插入失败是抛出异常，后者则返回false。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210707224316.png" alt="PriorityQueue_offer.png" style="zoom:50%;" />

`element()`和`peek()`语义完全相同，都是获取但不删除队首元素，也就是队列中权值最小的那个元素，二者的区别在于获取失败的情况的处理，前者会抛出异常，后者会返回null。根据小顶堆的性质，堆顶那个元素就是全局最小的那个，如果用数组来存储堆，根据下标关系，`0`下标处的那个元素即是堆顶元素，因此，直接返回数组`0`下标处的那个元素即可。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210707225025.png" alt="PriorityQueue_peek.png" style="zoom:50%;" />

`romve()`和`poll()`方法的语义也完全相同，都是获取并删除队首元素，二者的区别在于删除失败的情况的处理，前者会抛出异常，后者会返回null。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210707225501.png" alt="PriorityQueue_poll.png" style="zoom: 50%;" />

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

> 贪心算法：当下做局部最优判断
>
> 回溯：能够回退
>
> 动态规划：最优判断 + 回退

贪心法可以解决一些最优化问题，如：求图中的最小生成树、哈夫曼编码等。然而对于工程和生活中的问题，贪心法一般不能得到我们所求的答案。

一旦一个问题可以通过贪心法来解决，那么贪心法一般是解决这个的最好办法。由于贪心法的高效性以及其所求得得答案比较接近最优结果，贪心法也可以用作辅助算法或者直接解决一些要求结果不特别精确得问题。

> 贪心算法可以从前往后，也可以从后往前，也可以从局部切入进行贪心。

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

```java
package structure;
import util.LogUtil;
import java.util.LinkedList;
/**
 * 字典树实现
 */
public class TrieTree {
    private TrieNode root = new TrieNode();

    class TrieNode {
        TrieNode preNode = null;
        boolean isEnd = false; // 是否是红点，也就是是否是word的解为
        int deep = 0; // 做hash使用，防止一个单词里面有多个char的时候hash是一样的，可能导致删除出错
        char content = 0; // 当前结点到parent节点存储的字母
        LinkedList<TrieNode> child = new LinkedList<>(); // 子节点，当前节点后续节点

        TrieNode() {
        }

        TrieNode(char content) {
            this.content = content;
        }

        @Override
        public String toString() {
            return "\n" + "{" +
                    "End=" + isEnd +
                    ", d=" + deep +
                    ", c=" + content +
                    ", c=" + child +
                    '}';
        }

        @Override
        public int hashCode() {
            return content + deep;
        }

        @Override
        public boolean equals(Object obj) {
            return obj instanceof TrieNode && (((TrieNode) obj).content == content);
        }

        void setPreNode(TrieNode node) {
            preNode = node;
        }

        TrieNode getPreNode() {
            return preNode;
        }

        /**
         * child中删掉某个Node
         *
         * @param node 需要删掉的node
         */
        void removeChild(TrieNode node) {
            for (TrieNode aChild : child) {
                if (aChild.content == node.content) {
                    child.remove(aChild);
                    break;
                }
            }
        }

        /**
         * child中是否有此Node
         *
         * @param character 保存的char
         * @return 存在返回不存在返回Null
         */
        TrieNode getNode(Character character) {
            for (TrieNode aChild : child) {
                if (aChild.content == character) {
                    return aChild;
                }
            }
            return null;
        }
    }

    /**
     * 添加一个word
     * apple
     *
     * @param word 需要添加的词
     */
    public void addWord(String word) {
        int deep = 0;
        TrieNode currNode = root;
        while (deep < word.length()) {
            /*
             * 判断当前node的child，如果为空直接添加，不为空，查找是否含有，不含有则添加并设为currNode，含有则找到并设置为currNode
             */
            char c = word.charAt(deep);
            if (currNode.child.contains(new TrieNode(c))) {
                currNode = currNode.getNode(c);
            } else {
                TrieNode node = new TrieNode(c);
                node.setPreNode(currNode);
                node.deep = deep + 1;
                currNode.child.add(node);
                currNode = node;
            }
            if (deep == word.length() - 1) {
                currNode.isEnd = true;
            }
            deep++;
        }
    }

    /**
     * word在map中是否存在
     *
     * @param word 需要查找的word
     * @return 是否存在
     */
    public boolean hasWord(String word) {
        int deep = 0;
        TrieNode currNode = root;
        while (deep < word.length()) {
            char c = word.charAt(deep);
            if (currNode.child.contains(new TrieNode(c))) {
                currNode = currNode.getNode(c);
            } else {
                return false;
            }
            if (deep == word.length() - 1) {
                return currNode.isEnd;
            }
            deep++;
        }
        return false;
    }

    /**
     * 移除word，几种情况：
     * 1、word在list中不存在，直接返回失败
     * 2、word最后一个char 没有child，则删掉此节点并朝 root 查找没有child && isEnd=false 的节点都删掉
     * 3、word最后一个char 有child，则把isEnd置为false
     *
     * @param word 需要移除的word
     * @return 是否移除成功
     */
    public boolean removeWord(String word) {
        if (word == null || word.trim().equals("")) {
            return false;
        }
        if (hasWord(word)) {
            return false;
        }
        int deep = 0;
        TrieNode currNode = root;
        while (deep < word.length()) {
            char c = word.charAt(deep);
            if (currNode.child.contains(new TrieNode(c))) {
                currNode = currNode.getNode(c);
            } else {
                return false;
            }
            if (deep == word.length() - 1) {
                if (currNode.child.size() > 0) {
                    //3、word最后一个char 有child，则把isEnd置为false
                    currNode.isEnd = false;
                    return true;
                } else {
                    //2、word最后一个char 没有child，则删掉此节点并朝 root 查找没有child && isEnd=false 的节点都删掉
                    TrieNode parent = currNode.getPreNode();
                    while (parent != null) {
                        if (parent.child.size() == 0 && !parent.isEnd) {
                            parent.removeChild(currNode);
                            currNode = parent;
                        } else {
                            return true;
                        }
                    }
                }
            }
            deep++;
        }

        return false;
    }

    /**
     * 前序遍历所有节点
     */
    public void traverseTree() {
        visitNode(root, "");
    }

    private void visitNode(TrieNode node, String result) {
        LogUtil.Companion.d("node.content->" + node.content);
        String re = result + node.content;
        for (TrieNode n : node.child) {
            visitNode(n, re);
            LogUtil.Companion.d("result->" + re);
        }
    }
}

```

## 二分查找

### 定义

二分查找又称折半查找，二分查找的核心思想是，在有序表中，取中间记录作为比较对象，若给定值与中间记录的关键字相等，则查找成功，若给定值小于中间记录的关键字，则在中间记录的左搬去继续查找；若给定值大于中间记录的关键字，则在中间记录的右搬去继续查找，不断重复上述过程，直到查找成功，或所有查找区域无记录，查找失败为止。

要使用二分查找的前题是：

- 目标函数单调（单调递增或者单调递减）
- 能够通过索引访问（即顺序存储）
- 存在上下界

二分查找的时间复杂度为O（logn）

### 代码模板

```java
    public int binarySearch(int nums[], int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (target < nums[mid]) {
                right = mid - 1;
            } else if (target > nums[mid]) {
                left = mid + 1;
            }else {
                return mid;
            }
        }
        return -1;
    }
```

## 布隆过滤器

### 定义

布隆过滤器由一个很长的二进制向量和一系列随机映射函数构成，可以用于检索一个元素是否在一个集合中。

布隆过滤器本质上是由长度为m的位向量或位列表（仅包含0或1位值的列表）组成，最初初始值均为0，如下图所示。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210705232804.webp" alt="img" style="zoom:67%;" />

使用多个哈希函数产生多个哈希值：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210705232745.webp" alt="img" style="zoom:67%;" />

如上图所示，当输入"semlinker"时，预设的3个哈希函数将输出2、4、6，假设另一个输入"kakuqo"，哈希函数输出3、4和7。4这个位置已经被"semlinker"标记了，在布隆过滤器中是可以共用这个标记位的，此时，当前位向量的标记状态为：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210706001503.webp" alt="img" style="zoom:67%;" />



此时，假设我们要判断"fullstack"是否在集合中，对其使用散列函数，获取哈希函数输出的 3 个索引值分别是 2、3 和 7：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210706001722.webp" alt="img" style="zoom:67%;" />

可以看到，虽然"fullstack"不在集合中，但是计算出的索引值均为1，说明它在集合中，这就产生了误报，产生的原因是由于哈希碰撞导致的巧合而将不同的元素存储在相同的比特位上。相应的，布隆过滤器有一个可预测的误判率。

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210706001934.webp)

布隆过滤器的优点是空间效率和查询时间都远远超过一般的算法，缺点是有一定的误别率和删除困难。

总而言之，当布隆过滤器把元素都插入结束之后，对于测试元素（新元素）。当它验证是否存在的时候，如果验证位是1，那么有可能在，如果是0，那么一定不存在。

### 代码模板



## LRU Cache

### 定义

LRU Cache缓存

- 记忆
- 钱包 - 储物柜
- 代码模块

两个要素：大小、替换策略

Hash Table + Double LinkedList

O(1)查询

O(1)修改、更新

LRU（最近至少使用）

### 代码模板

```java
class LRUCache extends LinkedHashMap<Integer, Integer>{
    private int capacity;
    
    public LRUCache(int capacity) {
        super(capacity, 0.75F, true);
        this.capacity = capacity;
    }

    public int get(int key) {
        return super.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        super.put(key, value);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity; 
    }
}
```

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

不同排序算法之间的对比如下：

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206092324373.png)

相关的原理介绍和代码实现可以参考：[十大经典排序算法](https://www.runoob.com/w3cnote/ten-sorting-algorithm.html)

它们之间的对比如下：

| 排序算法 | 适用场景                                   |
| :------: | ------------------------------------------ |
| 冒泡排序 | 元素基本有序                               |
| 选择排序 |                                            |
| 插入排序 |                                            |
| 希尔排序 |                                            |
|  堆排序  |                                            |
| 归并排序 | 时间复杂度与数组长度无关，但需要额外的空间 |
| 快速排序 |                                            |

大多数情况下，快速排序是最佳的选择。

`java.util.Arrays#sort()`对于值类型，使用的是三向切分的快速排序；对于引用类型，使用的是归并排序。

### 冒泡排序

算法步骤：

1. 比较相邻的元素，如果第一个比第二个大，就交换它们
2. 对每一对相邻的元素作同样的动作，从开始第一对到最后

针对所有的元素重复以上的步骤，除了最后一个，直到没有任何一对数字需要比较。

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206092332882.gif)

```java
public class BubbleSortTemplate {

    public static void sort(Comparable[] a) {
        for (int i = 0; i < a.length; i++) {
            for (int j = 1; j < a.length - 1; j++) {
                if (less(a[i], a[j])) {
                    exch(a, i, j);
                }
            }
        }
    }

  	// 比较元素大小
    public static boolean less(Comparable v, Comparable w) {
        return v.compareTo(w) < 0;
    }

  	// 交换元素位置
    public static void exch(Comparable[] a, int i, int j) {
        Comparable temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
}
```

### 选择排序

算法步骤：

1. 找到数组中最小的那个元素
2. 将它和数组的第一个元素交换位置（如果是第一个元素就是和它自己交换位置）
3. 在剩下的元素中找到最小的元素，将它与数组的第二个元素交换
4. 如此往复，直到将整个数组排序

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206122316233.gif)

<div class="note info"><p>之所以叫做选择排序，是因为在不断地选择剩余元素中最小的元素。</p></div>

```java
public class SelectionTemplate {

    public static void sort(Comparable[] a) {
        for (int i = 0; i < a.length; i++) {
            int min = 0; // 注意
            for (int j = i + 1; j < a.length; j++) { // i + 1 从下一个元素开始朝朝
                if (less(a[j], a[i])) {
                    min = j;
                }
            };
            exch(a, i, min);
        }
    }

    // 比较元素大小
    public static boolean less(Comparable v, Comparable w) {
        return v.compareTo(w) < 0;
    }

    // 交换元素位置
    public static void exch(Comparable[] a, int i, int j) {
        Comparable<?> temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
}
```

### 插入排序

算法步骤：从到尾依次扫描未排序序列，将扫描到的每个元素插入有序序列的适当位置（如果待插入的元素与有序序列中的每个元素相等，则将待插入元素插入到相等元素的后面）。

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206092332935.gif)

```java
public class InsertionTemplate {

    // 解法1
    public static void sort(Comparable[] a) {
        for (int i = 1; i < a.length; i++) { // 注意下标为0时只有一个元素，默认有序，所以从1开始
            Comparable min = a[i];
            int j = i - 1;
            // 从已经排序的序列最右边的开始比较，找到比其小的数
            while (j > 0 && min.compareTo(a[j - 1]) < 0) {
                a[j] = a[j - 1];
                j--;
            }

            // 存在比其小的数，插入
            if (j != i) {
                a[j] = min;
            }
        }
    }

    // 解法2
    public static void sort2(Comparable[] a) {
        for (int i = 1; i < a.length; i++) {
            Comparable min = a[i];
            for (int j = i; j > 0; j--) {
                if (less(a[j], a[j - 1])) {
                    exch(a, j - 1, j);
                } else {
                    a[j] = min;
                    break;
                }
            }
        }
    }

    // 解法3
    public static void sort3(Comparable[] a) {
        for (int i = 1; i < a.length; i++) {
            int j;
            for (j = i; j > 0 && less(a[j], a[j - 1]); j--) {
                exch(a, j, j - 1);
            }
            a[j] = a[i];
        }
    }

    public static boolean less(Comparable v, Comparable w) {
        return v.compareTo(w) < 0;
    }

    public static void exch(Comparable[] a, int i, int j) {
        Comparable temp = a[i];
        a[i] = a[j];
        a[i] = temp;
    }
}
```

### 希尔排序

算法步骤：先将整个待排序的记录序列分割成为若干子序列分别进行插入排序，待整个序列中的记录“基本有序”时，再对全体记录进行依次直接插入排序。

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206092332247.gif)

```java

```

### 堆排序

堆排序是指利用堆这种数据结构所设计的一种排序算法。堆排序可以说是一种利用堆的概念来排序的选择排序，分为两种方法：

1. 大顶堆：每个节点的值都大于或等于其子节点的值，在堆排序算法中用于升序排列
2. 小顶堆：每个节点的值都小于或等于其子节点的值，在堆排序算法中用于降序排列

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206122347503.gif)

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206122347461.gif)

```java

```

### 归并排序

算法步骤：

1. 将数组拆分成两半，分别进行排序
2. 将结果归并起来

```java

```

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206122328469.gif)

### 快速排序

算法步骤：

1. 将一个数组分成两个子数组分别进行排序
2. 当两个子数组有序时，整个数组即有序

![img](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img202206122336978.gif)

```java

```

## 动态规划

### 定义

动态规划（Dynamic Programming）也可以认为是动态递归。

关键点：

- 最优子结构：opt[n] = best_of(opt[n -1], opt[n - 2], ...)
- 存储中间状态：opt[i]
- 递推公式（状态转移方程或者DP方程）

### 代码模板

```python
# 初始化 base case
dp[0][0][...] = base
# 进行状态转移
for 状态1 in 状态1的所有取值：
    for 状态2 in 状态2的所有取值：
        for ...
            dp[状态1][状态2][...] = 求最值(选择1，选择2...)
```

### 股票问题

https://www.cnblogs.com/hanyuhuang/p/11083384.html

# 高频考题（简单）

## [1. 两数之和](https://leetcode-cn.com/problems/two-sum/)

梦开始的地方：

```java
    public int[] twoSum(int[] nums, int target) {
        Map<Integer,Integer> map = new HashMap<>();
        for(int i = 0; i < nums.length; i++) {
            if(map.containsKey(target - nums[i])) {
                return new int[]{i,map.get(target-nums[i])};
            }
            map.put(nums[i],i);
        }
        return new int[2];
    }
```

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

## [136. 只出现一次的数字](https://leetcode-cn.com/problems/single-number/)

```java
    public int singleNumber(int[] nums) {
        int single = 0;
        for (int num : nums) {
            single ^= num;
        }
        return single;
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

也可以直接dp求解：

```java
    public int climbStairs(int n) {
        if(n <= 2) {
            return n;
        }
        int[] dp = new int[n];
        dp[0] = 1;
        dp[1] = 2;
        for(int i = 2; i < n; i++) {
            dp[i] = dp[i-1] + dp[i - 2];
        }
        return dp[n -1];
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
        int n = s.length();
        // 如果个数是奇数个直接返回
        if(n % 2 == 1) {
            return false;
        }
        Map<Character, Character> characterMap = new HashMap<>();
        characterMap.put('}', '{');
        characterMap.put(']', '[');
        characterMap.put(')', '(');
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

        return stack.isEmpty();
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

## [455. 分发饼干](https://leetcode-cn.com/problems/assign-cookies/)

使用贪心算法：

```java
    public int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g);
        Arrays.sort(s);
        // 孩子数组的下标
        int i = 0;
        // 饼干数组的下标
        int j = 0;
        while (i < g.length && j < s.length) {
            // 满足条件就下一个孩子
            if (g[i] <= s[i]) {
                i++;
            }
            // 不满足下一个饼干
            j++;
        }
        // 下标i正好是满足条件的孩子的个数
        return i;
    }
```

## [121. 买卖股票的最佳时机](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/)

使用贪心算法：

```java
    public int maxProfit(int[] prices) {
        int profit = 0;
        int min = prices[0];
        for (int i = 0; i < prices.length; i++) {
            if (prices[i] < min) {
                min = prices[i];
            } else {
                profit = Math.max(prices[i] - min, profit);
            }
        }
        return profit;
    }
```

需要注意的是，本题中股票值买卖一次。

## [69. x 的平方根](https://leetcode-cn.com/problems/sqrtx/)

使用二分查找：

````java
    public int mySqrt(int x) {
        int left = 0;
        int right = x;
        while (left < right) {
            int mid = left + (right - left + 1) / 2;
            // 注意：这里为了避免乘法溢出，改用除法
            if (mid > x / mid) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }
````

另外，解决此类问题也可以使用平方根法。

## [367. 有效的完全平方数](https://leetcode-cn.com/problems/valid-perfect-square/)

```java
    public boolean isPerfectSquare(int num) {
        int left = 0;
        int right = num;
        while (left <= right) {
            // 这么写的原因是极端情况下left + right相加的结果溢出
            int mid =  left + (right - left) / 2;
            if (mid * mid == num) {
                return true;
            } else if (mid * mid > num) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return false;
    }
```

## [509. 斐波那契数](https://leetcode-cn.com/problems/fibonacci-number/)

直接暴力递归的时间复杂度是O(2<sup>n</sup>)，因为需要优化，优化的思路大致分为两种，一种是记忆化搜索，一种是动态规划，使用记忆化搜索相当于剪枝，记忆化搜索的递归树：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210727102616.png" alt="image-20210727102609636" style="zoom: 67%;" />

代码：

```java
    public int fib(int n, int[] mem) {
        if (n <= 1) {
            return n;
        }
        if (mem[n] == 0) {
            mem[n] = fib(n - 1, mem) + fib(n - 2, mem);
        }
        return mem[n];
    }
```

如果只记录每次记忆化搜索的结果就变成了动态规划：

<img src="C:/Users/jyc/AppData/Roaming/Typora/typora-user-images/image-20210727102754402.png" alt="image-20210727102754402" style="zoom:67%;" />

所谓的状态转移方程或者说递推公式为：`dp[i] = dp[i - 1] + dp[i - 2]`。

```java
    public int fib(int n) {
        int[] dp = {0, 1};
        for (int i = 2; i < n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }
```

还可以进一步优化，实际上每次只需要存储最近的两个结果即可，按照这个思路，可以将空间复杂度优化到O(1)。

```java
    public int fib(int n) {
        if (n <= 1)
            return n;
        // 初始的时候，分别对应f(o) = 0和f(1) = 1
        int prev = 0, curr = 1;
        for (int i = 2; i <= n; i++) {
            int sum = prev + curr;
            // 原来的值变成前一个元素
            prev = curr;
            // 新的值变成当前值
            curr = sum;
        }
        return curr;
    }
```

## [53. 最大子序和](https://leetcode-cn.com/problems/maximum-subarray/)

不难写出，这个问题的状态转移方程：
$$
f(i) = max\{f(i - 1) + nums[i],num[i]\}
$$
使用数组来保存 $f(i)$ 的值，遍历求出所有的 $f(i)$ 即可：

```java
    public int maxSubArray(int[] nums) {
        int[] dp = new int[nums.length];
        dp[0] = nums[0];
        int res = nums[0];
        for (int i = 1; i < nums.length; i++) {
            dp[i] = Math.max(dp[i - 1] + nums[i], nums[i]);
            res = Math.max(dp[i], res);
        }
        return res;
    }
```

实际上我们无需记录所有的中间状态，只需要记录前一个值即可：

```java
    public int maxSubArray(int[] nums) {
        int pre = 0, maxAns = nums[0];
        for (int x : nums) {
            pre = Math.max(pre + x, x);
            maxAns = Math.max(maxAns, pre);
        }
        return maxAns;
    }
```

## [409. 最长回文串](https://leetcode-cn.com/problems/longest-palindrome/)

```java
class {
    
}
```

## [414. 第三大的数](https://leetcode-cn.com/problems/third-maximum-number/)

```java
    public static int thirdMax(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int n : nums) {
            set.add(n);
            if (set.size() > 3) {
                set.remove(Collections.min(set));
            }
        }
        // 第三大的正好是集合当中最小的元素
        if (set.size() == 3) {
            return Collections.min(set);
        }
        // 说明数组的元素不超过3个
        return Collections.max(set);
    }
```

# 高频考题（中等）

## [5. 最长回文子串](https://leetcode-cn.com/problems/longest-palindromic-substring/)

我们使用$p(i,j)$表示字符串$s$的第$i$到$j$个字母组成的串（下文表示成$s[i:j]$）是否为回文串：
$$
p(i,j)=\left\{
\begin{array}{lcl}
true, & 如果字串S_i...S_j是回文串 \\
false, & 其它情况
\end{array}\right.
$$
这里的其它情况包含两种可能性：

- $s[i,j]$本身不是一个回文串
- $i>j$，此时$s[i,j]$本身不合法

那么对应的状态转移方程：
$$
p(i,j) = p(i+1,j-1)\wedge(S_i==S_j)
$$
以上都是子串长度2的前提之上的，对于长度为1的字串，明显就是回文串，对于长度为2的字串，只要它的两个字母相同，就是一个回文串，因此，可以确定动态规划的边界条件：
$$
\left\{
\begin{array}{lcl}
p(i,i)=true, & 如果字串S_i...S_j是回文串 \\
p(i,i+1)=(S_i==S_{i+1}), & 其它情况
\end{array}\right.
$$
相应的示例代码：

```java
    public String longestPalindrome(String s) {
        int len = s.length();
        if (len < 2) {
            return s;
        }
        int maxLen = 1;
        int begin = 0;
        // dp[i][j] 表示 s[i..j] 是否是回文串
        boolean[][] dp = new boolean[len][len];
        // 初始化：所有长度为 1 的子串都是回文串
        for (int i = 0; i < len; i++) {
            dp[i][i] = true;
        }
        char[] charArray = s.toCharArray();
        // 递推开始
        // 先枚举子串长度
        for (int L = 2; L <= len; L++) {
            // 枚举左边界，左边界的上限设置可以宽松一些
            for (int i = 0; i < len; i++) {
                // 由 L 和 i 可以确定右边界，即 j - i + 1 = L 得
                int j = L + i - 1;
                // 如果右边界越界，就可以退出当前循环
                if (j >= len) {
                    break;
                }
                if (charArray[i] != charArray[j]) {
                    dp[i][j] = false;
                } else {
                    if (j - i < 3) {
                        dp[i][j] = true;
                    } else {
                        dp[i][j] = dp[i + 1][j - 1];
                    }
                }
                // 只要 dp[i][L] == true 成立，就表示子串 s[i..L] 是回文，此时记录回文长度和起始位置
                if (dp[i][j] && j - i + 1 > maxLen) {
                    maxLen = j - i + 1;
                    begin = i;
                }
            }
        }
        return s.substring(begin, begin + maxLen);
    }
```

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

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210712114808.png" alt="image.png" style="zoom:50%;" />

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
    public boolean isValidBST(TreeNode root) {
        Deque<TreeNode> stack = new LinkedList<>();
        // 存储上一个节点的值
        double inorder = -Double.MAX_VALUE;
        while (root != null || !stack.isEmpty()) {
            while (root != null) {
                stack.push(root);
                root = root.left;
            }
            TreeNode node = stack.pop();
            // 当前节点的值与上一个节点的值进行比较
            if (node.val <= inorder) {
                return false;
            }
            inorder = node.val;
            root = node.right;
        }
        return true;
    }
```

除此之外，也可以先进行中序遍历，然后判断返回的列表是否为升序。

## [236. 二叉树的最近公共祖先](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-tree/)

树的祖先的定义：若节点P在节点root的左（右）子树中，或P=root，则称root是p的祖先。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210713224143.png" alt="Picture1.png" style="zoom:50%;" />

最近公共祖先的定义：设节点root为节点p，q的某公共祖先，若其左子节点root.left和右子节点root.right都不是p,q的公共祖先，则称root是"最近的公共祖先"。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210713224306.png" alt="Picture2.png" style="zoom:50%;" />

根据以上定义，若root是p,q的最近公共祖先，则只可能为以下情况之一：

- p 和q 在root的子树中，且分列root的异侧即分别在左、右子树中）
- p = root，且q在root的左或右子树中
- q = root，且p在root的左或右子树中

```java
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null) return null;
        // 如果p,q为根节点，则公共祖先为根节点
        if (root.val == p.val || root.val == q.val) return root;
        // 如果p,q在左子树，则公共祖先在左子树查找
        if (find(root.left, p) && find(root.left, q)) {
            return lowestCommonAncestor(root.left, p, q);
        }
        // 如果p,q在右子树，则公共祖先在右子树查找
        if (find(root.right, p) && find(root.right, q)) {
            return lowestCommonAncestor(root.right, p, q);
        }
        // 如果p,q分属两侧，则公共祖先为根节点
        return root;
    }
    
    private boolean find(TreeNode root, TreeNode c) {
        if (root == null) return false;
        if (root.val == c.val) {
            return true;
        }
        
        return find(root.left, c) || find(root.right, c);
    }
}
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

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210711180106.png" alt="image.png" style="zoom: 50%;" />

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

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210712235154.png" alt="17. 电话号码的字母组合" style="zoom:50%;" />

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

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210713174441.jpeg" alt="网格结构中四个相邻的格子" style="zoom:50%;" />

在这类问题中，深度优先遍历的终止条件：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210713174700.jpeg" alt="网格 DFS 的 base case" style="zoom:50%;" />

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

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210713174948.gif" alt="DFS 遍历可能会兜圈子（动图）" style="zoom:50%;" />

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

## [322. 零钱兑换](https://leetcode-cn.com/problems/coin-change/)

使用贪心算法：

```java
public
```

## [55. 跳跃游戏](https://leetcode-cn.com/problems/jump-game/)

使用贪心算法：

![image-20210719235247657](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210719235247.png)

此时0这个位置的下标是4，但是之前最大的可达步数是3，因为无法再进行跳跃。

```java
   public boolean canJump(int[] nums) {
        // 最大能跳跃到的地方
        int maxJump = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > maxJump) {
                return false;
            }
            maxJump = Math.max(i + nums[i], maxJump);
        }
        return true;
    }
```

## [74. 搜索二维矩阵](https://leetcode-cn.com/problems/search-a-2d-matrix/)

将矩阵每一行拼接在上一行的末尾，则会得到一个升序数组，我们可以在该数组上二分找到目标元素，可以二分升序数组的下标，将其映射到原矩阵的行和列上：

```java
    public boolean searchMatrix(int[][] matrix, int target) {
        int r = matrix.length;
        int c = matrix[0].length;
        int left = 0;
        // 总共有这么多个元素
        int right = r * c - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            // 最主要的就是元素映射到原矩阵的行和列上
            // mid/c刚好是行数,mid%c刚好是列数,注意矩阵的下标从0开始算起
            int element = matrix[mid / c][mid % c];
            if (element == target) {
                return true;
            } else if (element < target) {
                left = mid + 1;
            } else if (element > target) {
                right = mid - 1;
            }
        }
        return false;
    }
```

## [62. 不同路径](https://leetcode-cn.com/problems/unique-paths/)

export PATH="$PATH:Users/jiyongchao/application/flutter/bin/flutter/bin"

递推公式：
$$
f(m,n) = f(m - 1, n) + f(m, n - 1)
$$
直接求解即可：

```java
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];
        // 最后一行和最后一列都只有一种走法
        for (int i = 0; i < m; i++) {
            dp[i][0] = 1;
        }
        for (int j = 0; j < n; j++) {
            dp[0][j] = 1;
        }
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
        return dp[m - 1][n - 1];
    }
```

## [120. 三角形最小路径和](https://leetcode-cn.com/problems/triangle/)

注意，本题要求每一步只能移动到下一行相邻的结点上，由此，递归方程为：
$$
f(i,j) = min \{f(i - 1, j),f(i-1, j-1) \} + c(i)(j)
$$
其中$c(i)(j)$表示位置$(i, j)$对应的元素值。

```java
    public int minimumTotal(List<List<Integer>> triangle) {
        int n = triangle.size();
        // 结果一定是下三角矩阵
        int[][] dp = new int[n][n];
        dp[0][0] = triangle.get(0).get(0);
        for (int i = 1; i < n; i++) {
            // 第一列的结果等于上一行的元素加上当前行的元素
            dp[i][0] = dp[i - 1][0] + triangle.get(i).get(0);
            for (int j = 1; j < i; j++) {
                // 除了第一列元素和最后一列元素都满足状态转移方程
                dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j]) + triangle.get(i).get(j);
            }
            // 对角线上的元素等于上一个对角线元素加上当前元素
            dp[i][i] = dp[i - 1][i - 1] + triangle.get(i).get(i);
        }
        // 最后一行就是所有的结果，找出最小值即可
        int min = dp[n - 1][0];
        for (int i = 1; i < n; i++) {
            min = Math.min(min, dp[n - 1][i]);
        }
        return min;
    }
```

## [1143. 最长公共子序列](https://leetcode-cn.com/problems/longest-common-subsequence/) 

假设字符串$text_1$和$text_2$的长度分别为$m$和$n$，创建$m+1$行$n+1$列的二维数组$dp$，其中$dp[i][j]$表示$text_1[0:i]$和$text_2[0:j]$的最长公共序列的长度，状态转移方程如下：
$$
dp[i][j]=\left\{
\begin{array}{lcl}
dp[i-1][j-1] + 1, & text_1[i-1] = text_2[j-1] \\
max(dp[i-1][j],dp[i][j-1]), & text_1[i-1] \neq text_2[j-1]
\end{array}\right.
$$
示意图：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210819120336.png" style="zoom:67%;" />

直接求解即可：

```java
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length();
        int n = text2.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i < m + 1; i++) {
            char c1 = text1.charAt(i - 1);
            for (int j = 1; j < n + 1; j++) {
                char c2 = text2.charAt(j - 1);
                // text_1[i - 1] = text_2[j -1]
                if (c1 == c2) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    // text_1[i - 1] ≠ text_2[j -1]
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[m][n];
    }
```

## [198. 打家劫舍](https://leetcode-cn.com/problems/house-robber/)

假设一共有$n$个房子，每个房子的金额分别是$H_0,H_1,...H_{n-1}$，子问题$f(k)$表示从前$k$个房子（即$H_0，H_1,...,H_{k-1}$）中能偷盗的最大金额。那么偷$k$个房子有两种偷法：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210820105009.png" alt="image-20210820104524320" style="zoom:67%;" />

状态转移方程为：
$$
f(k)=max\{ {f(k-1),H_{k-1} + f(k-2)} \}
$$
使用一维数组的方式：

```java
    public int rob(int[] nums) {
        if (nums == null || nums.length == 0)
            return 0;
        int n = nums.length;
        // 第0位用来存储0的情况，从第1位开始存储nums[1]
        int[] dp = new int[n + 1];
        dp[0] = 0;
        dp[1] = nums[0];
        // 注意这里从2开始，到n+1
        for (int i = 2; i < n + 1; i++) {
            dp[i] = Math.max(dp[i - 1], nums[i] + dp[i - 2]);
        }
        return dp[n];
    }
```

还可以多开一维数组来存每次偷或者不偷的状态：

```java
    public int rob(int[] nums) {
        if (nums == null || nums.length == 0)
            return 0;
        int n = nums.length;
        int[][] dp = new int[n][2];
        // 0表示不选当前元素，1表示选择当前元素
        dp[0][0] = 0;
        dp[0][1] = nums[0];
        for (int i = 1; i < n; i++) {
            dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1]);
            dp[i][1] = dp[i - 1][0] + nums[i];
        }
        return Math.max(dp[n - 1][0], dp[n - 1][1]);
    }
```

## [213. 打家劫舍 II](https://leetcode-cn.com/problems/house-robber-ii/)

状态转移方程：
$$
dp[i]=max(dp[i-2]+nums[i],dp[i-1])
$$
边界条件为：
$$
\left\{
\begin{array}{lcl}
dp[start] = nums[start] & 只有一间房屋，则偷窃该房屋 \\
dp[start+1] = max(nums[start],nums[start+1]) & 只有两件房屋，偷窃其中金额较高的房屋
\end{array}\right.
$$
相应的实现：

```java
class{
    
}
```

## [79. 单词搜索](https://leetcode-cn.com/problems/word-search/)



# 高频考题（困难）

## [84. 柱状图中最大的矩形](https://leetcode-cn.com/problems/largest-rectangle-in-histogram/)

使用暴力法求解：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210713190144.png" alt="image.png" style="zoom: 33%;" />

对于每一个位置，我们需要：

- 向左遍历，找到大于等于当前柱形高度最左元素的下标
- 向右遍历，找到大于等于当前柱形高度最右元素的下标

然后得到一个矩形的面积，求出他们的最大值。

```java
    public int largestRectangleArea(int[] heights) {
        if (heights.length == 0) {
            return 0;
        }
        int res = 0;
        for (int i = 0; i < heights.length; i++) {
            // 向左遍历，找到大于等于当前柱形高度最左元素的下标
            int left = i;
            while (left > 0 && heights[left - 1] >= heights[i]) {
                left--;
            }
            // 向右遍历，找到大于等于当前柱形高度最右元素的下标，注意这里的边界条件
            int right = i;
            while (right < heights.length - 1 && heights[right + 1] >= heights[i]) {
                right++;
            }
            int width = right - left + 1;
            res = Math.max(res, width * heights[i]);
        }
        return res;
    }
```

## [239. 滑动窗口最大值](https://leetcode-cn.com/problems/sliding-window-maximum/)

<div class="note info"><p>所有滑动窗口的问题都可以使用队列来解决。</p></div>

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
 public List<List<String>> solveNQueens(int n) {
        List<List<String>> solutions = new ArrayList<List<String>>();
        int[] queens = new int[n];
        Arrays.fill(queens, -1);
        Set<Integer> columns = new HashSet<Integer>();
        Set<Integer> diagonals1 = new HashSet<Integer>();
        Set<Integer> diagonals2 = new HashSet<Integer>();
        backtrack(solutions, queens, n, 0, columns, diagonals1, diagonals2);
        return solutions;
    }

    public void backtrack(List<List<String>> solutions, int[] queens, int n, int row, Set<Integer> columns, Set<Integer> diagonals1, Set<Integer> diagonals2) {
        if (row == n) {
            List<String> board = generateBoard(queens, n);
            solutions.add(board);
        } else {
            for (int i = 0; i < n; i++) {
                if (columns.contains(i)) {
                    continue;
                }
                int diagonal1 = row - i;
                if (diagonals1.contains(diagonal1)) {
                    continue;
                }
                int diagonal2 = row + i;
                if (diagonals2.contains(diagonal2)) {
                    continue;
                }
                queens[row] = i;
                columns.add(i);
                diagonals1.add(diagonal1);
                diagonals2.add(diagonal2);
                backtrack(solutions, queens, n, row + 1, columns, diagonals1, diagonals2);
                queens[row] = -1;
                columns.remove(i);
                diagonals1.remove(diagonal1);
                diagonals2.remove(diagonal2);
            }
        }
    }

    public List<String> generateBoard(int[] queens, int n) {
        List<String> board = new ArrayList<String>();
        for (int i = 0; i < n; i++) {
            char[] row = new char[n];
            Arrays.fill(row, '.');
            row[queens[i]] = 'Q';
            board.add(new String(row));
        }
        return board;
    }
```

## [212. 单词搜索 II](https://leetcode-cn.com/problems/word-search-ii/)





