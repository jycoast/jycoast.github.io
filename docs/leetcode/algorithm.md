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

二叉树递归模板：
```java
public void dfs(TreeNode root) {
	if (root == null) {
		return;
	}
	Stack<TreeNode> stack = new Stack<TreeNode>();
	stack.push(root);
	while (!stack.isEmpty()) {
		TreeNode node = stack.pop();
		TreeNode left = node.left;
		if (left != null) {
			stack.push(left);
		}
		TreeNode right = node.right;
		if (right != null) {
			stack.push(right);
		}
	}
}
```

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

[一个方法团灭 6 道股票问题](https://www.cnblogs.com/hanyuhuang/p/11083384.html)
