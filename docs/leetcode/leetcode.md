# 算法刷题

## 数组

### [1. 两数之和](https://leetcode-cn.com/problems/two-sum/)

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

## 链表



### [206. 反转链表](https://leetcode-cn.com/problems/reverse-linked-list/)

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

### [141. 环形链表 ](https://leetcode-cn.com/problems/linked-list-cycle/)

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

## 哈希表

### [49. 字母异位词分组](https://leetcode-cn.com/problems/group-anagrams/)

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



## 字符串

### [20. 有效的括号](https://leetcode-cn.com/problems/valid-parentheses/)

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



### [242. 有效的字母异位词](https://leetcode-cn.com/problems/valid-anagram/)

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

### [剑指 Offer 67. 把字符串转换成整数](https://leetcode-cn.com/problems/ba-zi-fu-chuan-zhuan-huan-cheng-zheng-shu-lcof/)

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



## 双指针

### [283. 移动零](https://leetcode-cn.com/problems/move-zeroes/)

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

### [15. 三数之和](https://leetcode-cn.com/problems/3sum/)

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

### [84. 柱状图中最大的矩形](https://leetcode-cn.com/problems/largest-rectangle-in-histogram/)

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



### [11. 盛最多水的容器 ](https://leetcode-cn.com/problems/container-with-most-water/)

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



## 栈与队列

### [155. 最小栈 ](https://leetcode-cn.com/problems/min-stack/)

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

### [239. 滑动窗口最大值](https://leetcode-cn.com/problems/sliding-window-maximum/)

<div class="note info"><p>所有滑动窗口的问题都可以使用队列来解决。</p></div>

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

## 树

### [94. 二叉树的中序遍历](https://leetcode-cn.com/problems/binary-tree-inorder-traversal/)

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

### [104. 二叉树的最大深度](https://leetcode-cn.com/problems/maximum-depth-of-binary-tree/)

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

### [98. 验证二叉搜索树](https://leetcode-cn.com/problems/validate-binary-search-tree/)

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

### [236. 二叉树的最近公共祖先](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-tree/)

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



### [78. 子集](https://leetcode-cn.com/problems/subsets/)

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

### [17. 电话号码的字母组合](https://leetcode-cn.com/problems/letter-combinations-of-a-phone-number/)

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

### [102. 二叉树的层序遍历](https://leetcode-cn.com/problems/binary-tree-level-order-traversal/)

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



## 回溯算法

### [22. 括号生成](https://leetcode-cn.com/problems/generate-parentheses/)

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



### [212. 单词搜索 II](https://leetcode-cn.com/problems/word-search-ii/)

### [51. N 皇后](https://leetcode-cn.com/problems/n-queens/)

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



## 贪心算法

### [121. 买卖股票的最佳时机](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/)

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

### [322. 零钱兑换](https://leetcode-cn.com/problems/coin-change/)

使用贪心算法：

```java
public
```

### [55. 跳跃游戏](https://leetcode-cn.com/problems/jump-game/)

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

### [455. 分发饼干](https://leetcode-cn.com/problems/assign-cookies/)

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





## 动态规划
### [70. 爬楼梯 ](https://leetcode-cn.com/problems/climbing-stairs/)

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



### [62. 不同路径](https://leetcode-cn.com/problems/unique-paths/)

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

### [120. 三角形最小路径和](https://leetcode-cn.com/problems/triangle/)

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

### [1143. 最长公共子序列](https://leetcode-cn.com/problems/longest-common-subsequence/) 

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

### 5. [最长回文子串](https://leetcode-cn.com/problems/longest-palindromic-substring/)

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



### [509. 斐波那契数](https://leetcode-cn.com/problems/fibonacci-number/)

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

### [53. 最大子序和](https://leetcode-cn.com/problems/maximum-subarray/)

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



### [198. 打家劫舍](https://leetcode-cn.com/problems/house-robber/)

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

### [213. 打家劫舍 II](https://leetcode-cn.com/problems/house-robber-ii/)

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

### [409. 最长回文串](https://leetcode-cn.com/problems/longest-palindrome/)

## 图论

### [200. 岛屿数量](https://leetcode-cn.com/problems/number-of-islands/)

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



## 数学
### [136. 只出现一次的数字](https://leetcode-cn.com/problems/single-number/)

```java
    public int singleNumber(int[] nums) {
        int single = 0;
        for (int num : nums) {
            single ^= num;
        }
        return single;
    }
```

### [50. Pow(x, n)](https://leetcode-cn.com/problems/powx-n/)

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

### [69. x 的平方根](https://leetcode-cn.com/problems/sqrtx/)

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

### [367. 有效的完全平方数](https://leetcode-cn.com/problems/valid-perfect-square/)

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

### [414. 第三大的数](https://leetcode-cn.com/problems/third-maximum-number/)

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

## 矩阵

### [74. 搜索二维矩阵](https://leetcode-cn.com/problems/search-a-2d-matrix/)

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

## 额外题目

