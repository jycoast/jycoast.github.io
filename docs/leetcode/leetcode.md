# 算法刷题

## 数组

### 1. 两数之和

[力扣题目链接](https://leetcode-cn.com/problems/two-sum/)

梦开始的地方：

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
       Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (map.get(target - nums[i]) != null) {
                return new int[]{i, map.get(target - nums[i])};
            }
            map.put(nums[i], i);
        }

        return new int[]{-1, -1};
    }
}
```

### 704. 二分查找

[力扣题目链接](https://leetcode.cn/problems/binary-search/)

```java
class Solution {
    public int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = (l + r) / 2; // 为了避免 l + r 超过int的最大值，更安全的写法是：int mid = (r - l) / 2 + l;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] > target) {
                r--;
            } else if (nums[mid] < target) {
                l++;
            }
        }
        return -1;
    }
}
```

### 167. 两数之和 II - 输入有序数组

[力扣题目链接](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted)

```java
class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return new int[]{left + 1, right + 1}; // 题目要求：1 <= index1 < index2 <= numbers.length，所以要数组下标加1
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[]{-1, -1};
    }
}
```

### 27. 移除元素

[力扣题目链接](https://leetcode.cn/problems/remove-element/)

使用for循环的双指针：

```java
class Solution {
    public int removeElement(int[] nums, int val) {
        int slow = 0;
        for (int fast = 0; fast < nums.length; fast++) {
            if (nums[fast] != val) {
                nums[slow] = nums[fast];
                slow++;
            }
        }
        return slow;
    }
}
```

使用while循环的双指针：

```java
class Solution {
    public int removeElement(int[] nums, int val) {
        int slow = 0, fast = 0;
        while (fast < nums.length) {
            if (nums[fast] != val) {
                nums[slow] = nums[fast];
                slow++;
            }
            fast++;
        }
        return slow;
    }
}
```

### 1732. 找到最高海拔

[力扣题目链接](https://leetcode.cn/problems/find-the-highest-altitude)

```java
class Solution {
    public int largestAltitude(int[] gain) {
        int sum = 0, max = 0;
        for (int i = 0; i < gain.length; i++) {
            sum += gain[i];
            max = Math.max(max, sum);
        }
        return max;
    }
}
```



### 724. 寻找数组的中心下标

[力扣题目链接](https://leetcode.cn/problems/find-pivot-index)

前缀和：

```java
class Solution {
    public int pivotIndex(int[] nums) {
        int left = 0;
        int sum = Arrays.stream(nums).sum();
        for (int i = 0; i < nums.length; i++) {
            sum -= nums[i];
            if (left == sum) {
                return i;
            }
            left += nums[i];
        }
        return -1;
    }
}
```



### 977.有序数组的平方

[力扣题目链接](https://leetcode.cn/problems/squares-of-a-sorted-array/)

最直观的做法，对于数组中的每个元素平方后排序：

```java
class Solution {
    public int[] sortedSquares(int[] nums) {
        for (int i = 0; i < nums.length; i++) {
            nums[i] = nums[i] * nums[i];
        }

        Arrays.sort(nums);
        return nums;
    }
}
```

也可以使用双指针来降低时间复杂度：

```java
class Solution {
    public int[] sortedSquares(int[] nums) {
        int left = 0;
        int right = nums.length - 1;
        int[] ans = new int[nums.length];
        int index = right;
        while (left <= right) {
            // 当前元素等于绝对值大的那个元素的平方和
            if (Math.abs(nums[right]) > Math.abs(nums[left])) {
                ans[index] = nums[right] * nums[right];
                right--;
            } else {
                ans[index] = nums[left] * nums[left];
                left++;
            }
            index--; // 处理下一个元素
        }
        return ans;
    }
}
```

### 209.长度最小的子数组

[力扣题目链接](https://leetcode.cn/problems/minimum-size-subarray-sum/)

滑动窗口：

```java
class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }
        int ans = Integer.MAX_VALUE;
        int sum = 0, left = 0;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) { // 根据题意大于等于即可
                ans = Math.min(ans, right - left + 1); // 更新结果
                sum -= nums[left]; // 滑动窗口
                left++;
            }
        }
        return ans == Integer.MAX_VALUE ? 0 : ans; // 如果等于 Integer.MAX_VALUE 说明没有满足的元素
    }
}
```

### 53. 最大子数组和

[力扣题目链接](https://leetcode.cn/problems/maximum-subarray)

```java
class Solution {

    public int maxSubArray(int[] nums) {
        int pre = 0, maxAns = nums[0];
        for (int x : nums) {
            pre = Math.max(pre + x, x);
            maxAns = Math.max(maxAns, pre);
        }
        return maxAns;
    }
}
```



### 643. 子数组最大平均数 I

[力扣题目链接](https://leetcode.cn/problems/maximum-average-subarray-i)

解法一（会超时）：

```java
class Solution {
    public double findMaxAverage(int[] nums, int k) {
        int max = Integer.MIN_VALUE;

        for (int i = 0; i < nums.length - k + 1; i++) {
            int j = 0;
            int temp = 0;
            while (j < k) {
                temp += nums[i + j];
                j++;
            }
            max = Math.max(temp, max);
        }
        // 隐式将整数转换为双精度浮点数
        return max * 1.0 / k;
    }
}
```

解法二：

```java
public class Solution {
    public double findMaxAverage(int[] nums, int k) {
        int sum = 0;
        // 先求出前k个元素的和
        for (int i = 0; i < k; i++) {
            sum += nums[i];
        }

        int maxSum = sum;
        // 滑动窗口求最大值
        for (int i = k; i < nums.length; i++) {
            sum = sum - nums[i - k] + nums[i]; // 减掉最前面那一项，加上当前项
            maxSum = Math.max(sum, maxSum);
        }
        // 隐式将整数转换为双精度浮点数
        return maxSum * 1.0 / k;
    }
}
```



### 88. 合并两个有序数组

[力扣题目链接](https://leetcode.cn/problems/merge-sorted-array/)

```java
class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        int i = m - 1;
        int j = n - 1;
        int k = m + n - 1;
        while (j >= 0) {
            if (i >= 0 && nums1[i] > nums2[j]) {
                nums1[k--] = nums1[i--];
            } else {
                nums1[k--] = nums2[j--];
            }
        }
    }
}
```

有时候倒着遍历也是一种好办法。

### 283. 移动零

[力扣题目链接](https://leetcode-cn.com/problems/move-zeroes/)

写法一：

```java
class Solution {
    public void moveZeroes(int[] nums) {
        if (nums == null || nums.length == 0) {
            return;
        }
        int left = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] != 0) {
                nums[left] = nums[right];
                left++;
            }
        }

        for (int i = left; i < nums.length; i++) {
            nums[i] = 0;
        }
    }
}
```

写法二：

```java
class Solution {
    public void moveZeroes(int[] nums) {
        if (nums == null || nums.length == 0) {
            return;
        }
        int left = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] != 0) {
                nums[left] = nums[right];
                if (right > left) {
                    nums[right] = 0;
                }
                left++;
            }
        }
    }
}
```

### 26. 删除有序数组中的重复项

[力扣题目链接](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/)

双指针：

```java
class Solution {
    public int removeDuplicates(int[] nums) {
        int left = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[left] != nums[right]) {
                nums[++left] = nums[right];
            }
        }
        return left + 1;
    }
}
```

### 1122. 数组的相对排序

[力扣题目链接](https://leetcode.cn/problems/relative-sort-array/)

```java
class Solution {
    public int[] relativeSortArray(int[] arr1, int[] arr2) {
        Map<Integer, Integer> map = new TreeMap<>();
        for (int num : arr1) {
            map.put(num, map.getOrDefault(num, 0) + 1);
        }

        int index = 0;
        
        for (int num : arr2) {
            Integer count = map.get(num);
            for (Integer i = 0; i < count; i++) {
                arr1[index++] = num;
            }
            map.remove(num);
        }

        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            Integer num = entry.getKey();
            Integer count = entry.getValue();
            for (Integer i = 0; i < count; i++) {
                arr1[index++] = num;
            }
        }
        return arr1;
    }
}
```

### 238. 除自身以外数组的乘积

[力扣题目链接](https://leetcode.cn/problems/product-of-array-except-self/)

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] ans = new int[n];
        int[] leftExceptSelf = new int[n];
        int[] rightExceptSelf = new int[n];

        leftExceptSelf[0] = 1;
        rightExceptSelf[n - 1] = 1;
        // 计算左边的乘积
        for (int i = 1; i < n; i++) {
            leftExceptSelf[i] = leftExceptSelf[i - 1] * nums[i - 1];
        }
        // 计算右边的乘积
        for (int i = n - 2; i >= 0; i--) {
            rightExceptSelf[i] = rightExceptSelf[i + 1] * nums[i + 1];
        }
        // 计算结果
        for (int i = 0; i < ans.length; i++) {
            ans[i] = leftExceptSelf[i] * rightExceptSelf[i];
        }
        return ans;
    }
}
```



### 15. 三数之和

[力扣题目链接](https://leetcode-cn.com/problems/3sum/)

穷举法：

```java
class Solution {
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
}
```

双指针法：

```java
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        int target = 0;
        Set<List<Integer>> set = new HashSet<>(); // 使用Set去掉重复的数组
        Arrays.sort(nums);
        for (int i = 0; i < nums.length; i++) {
            int j = i + 1;
            int k = nums.length - 1;
            while (j < k) {
                int sum = nums[i] + nums[j] + nums[k];
                if (sum == target) {
                    set.add(Arrays.asList(nums[i], nums[j], nums[k]));
                    j++;
                    k--;
                } else if (sum < target) {
                    j++;
                } else {
                    k--;
                }
            }
        }
        return new ArrayList<>(set);
    }
}
```

### 18. 四数之和

和三数之和类似的思路：

```java
class Solution {
    public List<List<Integer>> fourSum(int[] nums, int target) {
        if (nums == null || nums.length == 0) {
            return new ArrayList<>();
        }
        int n = nums.length;
        List<List<Integer>> ans = new ArrayList<>();
        Arrays.sort(nums);
        for (int i = 0; i < n - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) { // 去重
                continue;
            }
            for (int j = i + 1; j < n - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) { // 去重
                    continue;
                }
                int k = j + 1, l = n - 1;
                while (k < l) {
                    long x = (long) nums[i] + nums[j] + nums[k] + nums[l];
                    if (x < target) {
                        ++k;
                    } else if (x > target) {
                        --l;
                    } else {
                        ans.add(Arrays.asList(nums[i], nums[j], nums[k++], nums[l--]));
                        while (k < l && nums[k] == nums[k - 1]) {
                            ++k;
                        }
                        while (k < l && nums[l] == nums[l + 1]) {
                            --l;
                        }
                    }
                }
            }
        }
        return ans;
    }
}
```

### 11. 盛最多水的容器

[力扣题目链接](https://leetcode-cn.com/problems/container-with-most-water/)

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

### 42. 接雨水

[力扣题目链接](https://leetcode.cn/problems/trapping-rain-water)

```java
class Solution {
    public int trap(int[] height) {
        int n = height.length;
        int[] left = new int[n];
        int[] right = new int[n];

        left[0] = height[0];
        for (int i = 1; i < n; i++) {
            left[i] = Math.max(height[i], left[i - 1]);
        }
        right[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) {
            right[i] = Math.max(height[i], right[i + 1]);
        }

        int ans = 0;
        for (int i = 0; i < n; i++) {
            int area = Math.min(left[i], right[i]) - height[i];
            if (area > 0) {
                ans += area;
            }
        }
        return ans;
    }
}
```

### [84. 柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram)

[力扣题目链接](https://leetcode-cn.com/problems/largest-rectangle-in-histogram/)

方法一：

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

方法二：

```java
class Solution {
    public int largestRectangleArea(int[] heights) {

        int n = heights.length;
        int[] left = new int[n];
        int[] right = new int[n];

        left[0] = -1;
        for (int i = 1; i < n; i++) {
            int index = i - 1;
            while (index >= 0 && heights[index] >= heights[i]) {
                index = left[index];
            }
            left[i] = index;
        }
        right[n - 1] = n;
        for (int i = n - 2; i >= 0; i--) {
            int index = i + 1;
            while (index < n && heights[index] >= heights[i]) {
                index = right[index];
            }
            right[i] = index;
        }

        int ans = 0;
        for (int i = 0; i < n; i++) {
            int sum = heights[i] * (right[i] - left[i] - 1);
            ans = Math.max(sum, ans);
        }
        return ans;
    }
}
```

方法三：

```java
class Solution {
    public int largestRectangleArea(int[] heights) {
        int res = 0, n = heights.length;
        Deque<Integer> stk = new ArrayDeque<>();
        int[] left = new int[n];
        int[] right = new int[n];
        Arrays.fill(right, n);
        for (int i = 0; i < n; ++i) {
            while (!stk.isEmpty() && heights[stk.peek()] >= heights[i]) {
                right[stk.pop()] = i;
            }
            left[i] = stk.isEmpty() ? -1 : stk.peek();
            stk.push(i);
        }
        for (int i = 0; i < n; ++i) {
            res = Math.max(res, heights[i] * (right[i] - left[i] - 1));
        }
        return res;
    }
}
```



### 数组题目总结

双指针、排序、哈希表是解决数组问题的常见手段。

## 链表

###  203.移除链表元素

[力扣题目链接](https://leetcode.cn/problems/remove-linked-list-elements/)

使用虚拟的头节点：

```java
class Solution {
    public ListNode removeElements(ListNode head, int val) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode pre = dummy;
        ListNode curr = head;

        while (curr != null) {
            if (curr.val == val) { // 相等就移除节点
                pre.next = curr.next;
            } else {
                pre = curr;
            }
            curr = curr.next;
        }

        return dummy.next;
    }
}
```



### 206. 反转链表

[力扣题目链接](https://leetcode-cn.com/problems/reverse-linked-list/)

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

### 141. 环形链表 

[力扣题目链接](https://leetcode-cn.com/problems/linked-list-cycle/)

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

### 24. 两两交换链表中的节点

[力扣题目链接](https://leetcode.cn/problems/swap-nodes-in-pairs/)

```java
class Solution {
    public ListNode swapPairs(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode first;
        ListNode curr = dummy.next;
        return dummy.next;
    }
}
```



### 19.删除链表的倒数第N个节点

[力扣题目链接](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

```java
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode slow = dummy;
        ListNode fast = dummy;

        for (int i = 0; i <= n; i++) { // 让快慢指针相距n个节点, 需要走n + 1步，所以是小于等于n
            fast = fast.next;
        }

        while (fast != null) { // 让慢指针异动到倒数第n个节点的地方
            slow = slow.next;
            fast = fast.next;
        }

        // 此时 fast指向null，slow 刚好在第 n - 1 的位置上
        slow.next = slow.next.next;
        return dummy.next;
    }
}
```



### 160.链表相交

[力扣题目链接](https://leetcode.cn/problems/intersection-of-two-linked-lists-lcci/)

```java
public class Solution {
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        if (headA == null || headB == null) {
            return null;
        }

        ListNode a = headA;
        ListNode b = headB;

        while (a != b) {
            a = a == null ? headB : a.next;
            b = b == null ? headA : b.next;
        }
        return b;
    }
}
```



### 142.环形链表II

[力扣题目链接](https://leetcode.cn/problems/linked-list-cycle-ii/)

```java
public class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) { // 证明有环
                ListNode index1 = fast;
                ListNode index2 = head;
                // 两个指针，从头结点和相遇结点，各走一步，直到相遇，相遇点即为环入口
                while (index1 != index2) {
                    index1 = index1.next;
                    index2 = index2.next;
                }
                return index1;
            }
        }

        return null;
    }
}
```

### 83. 删除排序链表中的重复元素

[力扣题目链接](https://leetcode.cn/problems/remove-duplicates-from-sorted-list)

```java
class Solution {
    public ListNode deleteDuplicates(ListNode head) {
        ListNode curr = head;
        while (curr != null && curr.next != null) {
            if (curr.val == curr.next.val) {
                curr.next  = curr.next.next;
            } else {
                curr = curr.next;
            }
        }
        return head;
    }
}
```

### 82. 删除排序链表中的重复元素 II

[力扣题目链接](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii)

```java
class Solution {
    public ListNode deleteDuplicates(ListNode head) {
        ListNode dummy = new ListNode(0, head);
        ListNode pre = dummy;
        ListNode curr = head;
        while (curr != null) {
            while (curr.next != null && curr.next.val == curr.val) {
                curr = curr.next;
            }
            if (pre.next == curr) { // 如果相等，说明pre 与cur 之间没有重复节点
                pre = curr;
            } else {
                pre.next = curr.next;
            }
            curr = curr.next;
        }
        return dummy.next;
    }
}
```

### 86. 分隔链表

[力扣题目链接](https://leetcode.cn/problems/partition-list)

```java
class Solution {
    public ListNode partition(ListNode head, int x) {
        ListNode dummy1 = new ListNode(-1);
        ListNode dummy2 = new ListNode(-1);
        ListNode p1 = dummy1; // 移动的指针，避免头节点移动
        ListNode p2 = dummy2;

        while (head != null) {
            if (head.val < x) {
                p1.next = head;
                p1 = p1.next;
            } else {
                p2.next = head;
                p2 = p2.next;
            }
            head = head.next;
        }

        // 合并两个链表
        p1.next = dummy2.next;
        p2.next = null; // p2 指向的是 dummy2，所以这里要置为 null
        return dummy1.next;
    }
}
```



### 2. 两数相加

[力扣题目链接](https://leetcode.cn/problems/add-two-numbers)

```java
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        int carry = 0;
        ListNode node = new ListNode(0);
        ListNode curr = node;
        while (l1 != null || l2 != null || carry != 0) {
            if (l1 != null) {
                carry += l1.val;
                l1 = l1.next;
            }

            if (l2 != null) {
                carry += l2.val;
                l2 = l2.next;
            }

            ListNode newNode;
            if (carry > 9) {
                newNode = new ListNode(carry - 10);
                carry = 1;
            } else {
                newNode = new ListNode(carry);
                carry = 0;
            }
            curr.next = newNode;
            curr = curr.next;
        }
        return node.next;
    }
}
```

简洁一点的写法：

```java
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        int carry = 0;
        ListNode curr = dummy;
        while (l1 != null || l2 != null || carry != 0) {
            int sum = (l1 == null ? 0 : l1.val) + (l2 == null ? 0 : l2.val) + carry;
            l1 = l1 == null ? null : l1.next;
            l2 = l2 == null ? null : l2.next;

            carry = sum / 10;
            curr.next = new ListNode(sum % 10);
            curr = curr.next;
        }
        return dummy.next;
    }
}
```

### 61. 旋转链表

[力扣题目链接](https://leetcode.cn/problems/rotate-list)

```java
class Solution {
    public ListNode rotateRight(ListNode head, int k) {
        if (head == null || k == 0) {
            return head;
        }
        // 计算链表长度
        int len = 1;
        ListNode curr = head;
        while (curr.next != null) {
            curr = curr.next;
            len++;
        }
        k %= len;
        if (k == 0) {
            return head;
        }
        // 先让快指针先走k步，然后快慢指针同时走
        ListNode fast = head;
        ListNode slow = head;
        while (k-- > 0) {
            fast = fast.next;
        }
        while (fast.next != null) {
            fast = fast.next;
            slow = slow.next;
        }
        // 此时快指针在链表的尾部，慢指针的下一个节点就是新的链表头节点
        ListNode ans = slow.next;
        slow.next = null;
        fast.next = head;
        return ans;
    }
}
```

### 114. 二叉树展开为链表

[力扣题目链接](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list)

写法一：

```java
class Solution {
    public void flatten(TreeNode root) {
        while (root != null) {
            if (root.left == null) {
                root = root.right;
                continue;
            }
            // 1.找到左子树的最右侧节点
            TreeNode prev = root.left;
            while (prev.right != null) {
                prev = prev.right;
            }
            // 2.将右子树接到左子树的最右边节点
            prev.right = root.right;
            // 3.将root的左子树挪到右子树上
            root.right = root.left;
            root.left = null;
            // 考虑下一个节点
            root = root.right;
        }
    }
}
```

写法二：

```java
class Solution {
    public void flatten(TreeNode root) {
        while (root != null) {
            if (root.left != null) {
                // 找到当前节点左子树的最右节点
                TreeNode pre = root.left;
                while (pre.right != null) {
                    pre = pre.right;
                }

                // 将左子树的最右节点指向原来的右子树
                pre.right = root.right;

                // 将当前节点指向左子树
                root.right = root.left;
                root.left = null;
            }
            root = root.right;
        }
    }
}
```

### 148. 排序链表

[力扣题目链接](https://leetcode.cn/problems/sort-list)

解法一：

```java
class Solution {
    public ListNode sortList(ListNode head) {
        List<Integer> list = new ArrayList<>();
        while (head != null) {
            int val = head.val;
            list.add(val);
            head = head.next;
        }
        Collections.sort(list);
        ListNode dumy = new ListNode(0);
        ListNode curr = dumy;
        for (int i = 0; i < list.size(); i++) {
            ListNode node = new ListNode(list.get(i));
            curr.next = node;
            curr = curr.next;
        }

        return dumy.next;
    }
}
```

解法二：

```java
class Solution {
    public ListNode sortList(ListNode head) {
        if (head == null || head.next == null) {
            return head;
        }
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode t = slow.next;
        slow.next = null;
        ListNode l1 = sortList(head);
        ListNode l2 = sortList(t);
        ListNode dummy = new ListNode();
        ListNode cur = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                cur.next = l1;
                l1 = l1.next;
            } else {
                cur.next = l2;
                l2 = l2.next;
            }
            cur = cur.next;
        }
        cur.next = l1 == null ? l2 : l1;
        return dummy.next;
    }
}
```



### 23. 合并 K 个升序链表

[力扣题目链接](https://leetcode.cn/problems/merge-k-sorted-lists)

```java
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode head : lists) {
            if (head != null) {
                pq.offer(head); // 取出所有链表的头节点
            }
        }

        ListNode dummy = new ListNode();
        ListNode curr = dummy;
        while (!pq.isEmpty()) {
            ListNode node = pq.poll(); // 取出最小的节点
             curr.next = node;
            curr = curr.next;
            
            if (node.next != null) {
                pq.offer(node.next); // 将当前节点的下一个节点加入堆中
            }
        }
        return dummy.next;
    }
}
```



### 链表题目总结

创建虚拟的头节点和快慢指针是链表常见的解题思路。

## 哈希表

### 349. 两个数组的交集

[力扣题目链接](https://leetcode.cn/problems/intersection-of-two-arrays/)

```java
class Solution {
    public int[] intersection(int[] nums1, int[] nums2) {
        Set<Integer> set = new HashSet<>();
        for (int num : nums1) {
            set.add(num);
        }
        Set<Integer> resSet = new HashSet<>();
        for (int num : nums2) {
            if (set.contains(num)) {
                resSet.add(num);
            }
        }
        return resSet.stream().mapToInt(Integer::intValue).toArray();
    }
}
```



### 128. 最长连续序列

[力扣题目链接](https://leetcode.cn/problems/longest-consecutive-sequence/)

思路：先将所有元素放入哈希表，遍历数组，然后统计当前元素的最长连接序列，最后求所有元素最长连接序列的最大值。

```java
class Solution {
    public int longestConsecutive(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }
        Set<Integer> set = new HashSet<>();
        for (int num : nums) {
            set.add(num);
        }
        int ans = 0;
        for (int i = 0; i < nums.length; i++) {
            int num = nums[i];
            // 肯定包含自己，所以count = 1
            int count = 1;
            while (set.contains(--num)) {
                count++;
                // 统计过了就移除掉
                set.remove(num);
            }
            num = nums[i];
            while (set.contains(++num)) {
                count++;
                // 统计过了就移除掉
                set.remove(num);
            }
            ans = Math.max(ans, count);
        }

        return ans;
    }
}
```

### 242. 有效的字母异位词

使用排序：

```java
class Solution {
    public boolean isAnagram(String s, String t) {
        if (s == null || t == null) {
            return true;
        }
        if (s == null && t != null) {
            return false;
        }
        if (s != null && t == null) {
            return false;
        }
        char[] sCharArray = s.toCharArray();
        char[] tCharArray = t.toCharArray();
        Arrays.sort(sCharArray);
        Arrays.sort(tCharArray);
        return String.valueOf(sCharArray).equals(String.valueOf(tCharArray));
    }
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



### 49. 字母异位词分组

[49.力扣题目链接](https://leetcode.cn/problems/group-anagrams/)

使用哈希表，将排序之后的字符串作为key，并且排序之后相同的字符串添加到列表中，最后从Map中获取值并返回。

```java
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap();
        for (String str : strs) {
            char[] charArray = str.toCharArray();
            Arrays.sort(charArray);
            String anagram = String.valueOf(charArray);
            List<String> list = map.getOrDefault(anagram, new ArrayList<>());
            list.add(str);
            map.put(anagram, list);
        }
        List<List<String>> ans = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : map.entrySet()) {
            List<String> anagrams = entry.getValue();
            ans.add(anagrams);
        }
        return ans;
    }
}
```

### 136. 只出现一次的数字

[力扣题目链接](https://leetcode.cn/problems/single-number/)

解法一：使用Map统计 每个数字出现的次数，然后遍历map，找出出现次数为1次的数字：

```java
class Solution {
    public int singleNumber(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            int count = map.getOrDefault(num, 0);
            map.put(num, ++count);
        }

        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            if (entry.getValue() == 1) {
                return entry.getKey();
            }
        }
       throw new IllegalArgumentException("not found");
    }
}
```

解法二：更简单的做法是用set：

```java
class Solution {
    public int singleNumber(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int num : nums) {
            if (!set.contains(num)) {
                set.add(num);
            } else {
                set.remove(num);
            }
        }

        return set.iterator().next();
    }
}
```

解法三：

```java
class Solution {    
	public int singleNumber(int[] nums) {
        int single = 0;
        for (int num : nums) {
            single ^= num;
        }
        return single;
    }
}
```

### 137. 只出现一次的数字 II

解法一：

[力扣题目链接](https://leetcode.cn/problems/single-number-ii/)

```java
class Solution {
    public int singleNumber(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            Integer count = map.getOrDefault(num, 0);
            map.put(num, ++count);
        }

        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            if (entry.getValue() == 1) {
                return entry.getKey();
            }
        }
        return -1;
    }
}
```

解法二：

```java
class Solution {
    public int singleNumber(int[] nums) {
        // 为了防止相加整数溢出，所以用long类型
        long sumOfAllNumbers = 0;
        long sumOfUniqueNumbers = 0;
        Set<Integer> uniqueNumbers = new HashSet<>();

        for (int num : nums) {
            sumOfAllNumbers += num;
            if (!uniqueNumbers.contains(num)) {
                uniqueNumbers.add(num);
                sumOfUniqueNumbers += num;
            }
        }
        
        // 只出现一次的数字 = （3 * 不重复数字的和 - 所有数字的和）/ 2
        return (int) ((3 * sumOfUniqueNumbers - sumOfAllNumbers) / 2);
    }
}
```

### 217. 存在重复元素

[力扣题目链接](https://leetcode.cn/problems/contains-duplicate)

解法一：

```java
class Solution {
    public boolean containsDuplicate(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            map.put(num, map.getOrDefault(num, 0) + 1);
        }
        for (Integer count : map.values()) {
            if (count >= 2) {
                return true;
            }
        }
        return false;
    }
}
```

解法二：

```java
class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int num : nums) {
            if (!set.add(num)) {
                return true;
            }
        }
        return false;
    }
}
```

解法三：

```java
class Solution {
    public boolean containsDuplicate(int[] nums) {
        Arrays.sort(nums);
        for (int i = 0; i < nums.length - 1; i++) {
            if (nums[i] == nums[i + 1]) {
                return true;
            }
        }
        return false;
    }
}
```

### 219. 存在重复元素 II

[力扣题目链接](https://leetcode.cn/problems/contains-duplicate-ii)

```java
class Solution {
    public boolean containsNearbyDuplicate(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            if (map.containsKey(nums[i])) {
                if (Math.abs(map.get(nums[i]) - i) <= k) {
                    return true;
                }
            }
            map.put(nums[i], i);
        }
        return false;
    }
}
```

### 220. 存在重复元素 III

[力扣题目链接](https://leetcode.cn/problems/contains-duplicate-iii)

```java
class Solution {
    public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
        TreeSet<Long> ts = new TreeSet<>();
        for (int i = 0; i < nums.length; ++i) {
            Long x = ts.ceiling((long) nums[i] - (long) valueDiff);
            if (x != null && x <= (long) nums[i] + (long) valueDiff) {
                return true;
            }
            ts.add((long) nums[i]);
            if (i >= indexDiff) {
                ts.remove((long) nums[i - indexDiff]);
            }
        }
        return false;
    }
}
```



### 383. 赎金信

[力扣题目链接](https://leetcode.cn/problems/ransom-note/)

```java
class Solution {
    public boolean canConstruct(String ransomNote, String magazine) {
        Map<Character, Integer> magezineMap = new HashMap<>();
        for (int i = 0; i < magazine.length(); i++) {
            magezineMap.put(magazine.charAt(i), magezineMap.getOrDefault(magazine.charAt(i), 0) + 1);
        }

        char[] charArray = ransomNote.toCharArray();
        for (char c : charArray) {
            Integer count = magezineMap.getOrDefault(c, 0);
            count--;
            if (count < 0) {
                return false;
            }
            magezineMap.put(c, count);
        }
        return true;
    }
}
```

### 454.四数相加II

[力扣题目链接](https://leetcode.cn/problems/4sum-ii/)

```java
class Solution {
    public int fourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {
        int ans = 0;
        Map<Integer, Integer> map = new HashMap<>();
        for (int i : nums1) {
            for (int j : nums2) {
                int sum = i + j;
                map.put(sum, map.getOrDefault(sum, 0) + 1);
            }
        }

        for (int i : nums3) {
            for (int j : nums4) {
                ans += map.getOrDefault(0 - (i + j), 0);
            }
        }
        return ans;
    }
}
```



## 字符串

### 387. 字符串中的第一个唯一字符

[力扣题目链接](https://leetcode.cn/problems/first-unique-character-in-a-string/)

```java
class Solution {
    public int firstUniqChar(String s) {
        char[] charArray = s.toCharArray();
        Map<Character, Integer> map = new HashMap<>();
        for (char ch : charArray) {
            map.put(ch, map.getOrDefault(ch, 0) + 1);
        }
        int ans = -1;
        for (int i = 0; i < charArray.length; i++) {
            if (map.get(charArray[i]) == 1) {
                ans = i;
                break;
            }
        }
        return ans;
    }
}
```



### 28. 找出字符串中第一个匹配项的下标

[力扣题目链接](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string)

```java
class Solution {
    public int strStr(String haystack, String needle) {
        if (needle.isEmpty()) {
            return 0;
        }
        if (haystack.isEmpty()) {
            return -1;
        }
        int p = 0;
        int q = 0;
        while (p < haystack.length() && q < needle.length()) {
            if (haystack.charAt(p) == needle.charAt(q)) {
                p++;
                q++;
            } else {
                // haystack指针回退，开始下一个匹配尝试
                p = p + 1 - q;
                // needle指针重置为0
                q = 0;
            }
        }
        // 如果needle指针到达needle的末尾，说明匹配成功
        if (q == needle.length()) {
            return p - q;
        }
        return -1;
    }
}
```

### 1768.交替合并字符串

[力扣题目链接](https://leetcode.cn/problems/merge-strings-alternately/description/)

```java
class Solution {
    public String mergeAlternately(String word1, String word2) {
        StringBuilder ans = new StringBuilder();
        int i = 0;
        int length = word1.length() + word2.length();
        while (i < length) {
            if (i < word1.length()) {
                ans.append(word1.charAt(i));
            }
            if (i < word2.length()) {
                ans.append(word2.charAt(i));
            }
            i++;
        }
        return ans.toString();
    }
}
```

### 14. 最长公共前缀

[力扣题目链接](https://leetcode.cn/problems/longest-common-prefix/)

常规思路：

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) {
            return "";
        }
        String prefix = strs[0];
        for (int i = 1; i < strs.length; i++) {
            prefix = longestCommonPrefix(prefix, strs[i]); // 寻找当前的前缀和下一个单词的最长前缀
            if (prefix.length() == 0) {
                break;
            }
        }
        return prefix;
    }

    public String longestCommonPrefix(String str1, String str2) {
        int index = 0;
        int length = Math.min(str1.length(), str2.length());
        while (index < length && str1.charAt(index) == str2.charAt(index)) {
            index++;
        }
        return str1.substring(0, index);
    }
}
```

排序后检查首尾：

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) {
            return "";
        }
        // 排序会根据字符串的Unicode编码进行排序，会将具有公共子串的字符串排到前面
        Arrays.sort(strs);
        String first = strs[0];
        String last = strs[strs.length - 1];
        int count = 0;
        while (count < first.length()) {
            if (first.charAt(count) == last.charAt(count)) {
                count++;
            } else {
                break;
            }
        }
        return count == 0 ? "" : first.substring(0, count);
    }
}
```



### 709. 转换成小写字母

[力扣题目链接](https://leetcode.cn/problems/to-lower-case/)

```java
class Solution {
    public String toLowerCase(String s) {
        StringBuilder ans = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c >= 65 && c <= 90) {
                c = (char) (c + 32); // 也可以写作  c |= 32;
            }
            ans.append(c);
        }
        return ans.toString();
    }
}
```

### 58.最后一个单词的长度

[力扣题目链接](https://leetcode.cn/problems/length-of-last-word/)

```java
class Solution {
    public int lengthOfLastWord(String s) {
        String trimStr = s.trim();
        int ans = 0;
        for (int i = trimStr.length() - 1; i >= 0; i--) {
            if (trimStr.charAt(i) == ' ') {
                break;
            }
            ans++;
        }
        return ans;
    }
}
```



### 344.反转字符串

[力扣题目链接](https://leetcode.cn/problems/reverse-string/)

双指针：

```java
class Solution {
    public void reverseString(char[] s) {
        if (s == null || s.length == 0) {
            return;
        }

        int left = 0, right = s.length - 1;
        while (left < right) {
            char temp = s[left];
            s[left] = s[right];
            s[right] = temp;
            left++;
            right--;
        }
    }
}
```

### 917. 仅仅反转字母

[力扣题目链接](https://leetcode.cn/problems/reverse-only-letters/)

```java
class Solution {
    public String reverseOnlyLetters(String s) {
        if (s == null || s.isEmpty()) {
            return s;
        }

        int i = 0, j = s.length() - 1;
        char[] charArray = s.toCharArray();
        while (i <= j) {
            // 找到是字母的下标
            while (i < j && !Character.isAlphabetic(charArray[i])) {
                i++;
            }
            while (i < j && !Character.isAlphabetic(charArray[j])) {
                j--;
            }
            char temp = charArray[i];
            charArray[i] = charArray[j];
            charArray[j] = temp;
            i++;
            j--;
        }

        return new String(charArray);
    }
}
```



### 541. 反转字符串II

[力扣题目链接](https://leetcode.cn/problems/reverse-string-ii/)

题目的意思是：反转字符串中k个字符，下面k个不反转，如此反复，最后剩下的不够k个字符时全部反转。

```java
class Solution {
    public String reverseStr(String s, int k) {
        int n = s.length();
        char[] ch = s.toCharArray();
        for (int i = 0; i < n - 1; i += 2 * k) {
            // 剩下的字符够k个，则反转前k个字符
            if (i + k <= n) {
                reverse(ch, i, i + k - 1);
            } else {
                reverse(ch, i, n - 1);
            }
        }
        return new String(ch);
    }

    private void reverse(char[] ch, int start, int end) {
        while (start < end) {
            char temp = ch[start];
            ch[start] = ch[end];
            ch[end] = temp;
            start++;
            end--;
        }
    }
}
```



### 151.翻转字符串里的单词

[力扣题目链接](https://leetcode.cn/problems/reverse-words-in-a-string/)

调用库函数的方式：

```java
class Solution {
    public String reverseWords(String s) {
        if (s == null) {
            return null;
        }
        String[] splitArray = s.trim().split(" ");
        StringBuilder ans = new StringBuilder();

        for (int i = splitArray.length - 1; i >= 0; i--) {
            if (!"".equals(splitArray[i])) {
                ans.append(" ");
                ans.append(splitArray[i].trim());
            }
        }

        return ans.toString().trim();
    }
}
```

完全手写的方式：

```java
public class Solution {

    public String reverseWords(String s) {
        if (s == null) return null;

        char[] a = s.toCharArray();
        int n = a.length;

        // step 1. reverse the whole string
        reverse(a, 0, n - 1);
        // step 2. reverse each word
        reverseWords(a, n);
        // step 3. clean up spaces
        return cleanSpaces(a, n);
    }

    void reverseWords(char[] a, int n) {
        int i = 0, j = 0;

        while (i < n) {
            while (i < j || i < n && a[i] == ' ') i++; // skip spaces
            while (j < i || j < n && a[j] != ' ') j++; // skip non spaces
            reverse(a, i, j - 1);                      // reverse the word
        }
    }

    // trim leading, trailing and multiple spaces
    String cleanSpaces(char[] a, int n) {
        int i = 0, j = 0;

        while (j < n) {
            while (j < n && a[j] == ' ') j++;             // skip spaces
            while (j < n && a[j] != ' ') a[i++] = a[j++]; // keep non spaces
            while (j < n && a[j] == ' ') j++;             // skip spaces
            if (j < n) a[i++] = ' ';                      // keep only one space
        }

        return new String(a).substring(0, i);
    }

    // reverse a[] from a[i] to a[j]
    private void reverse(char[] a, int i, int j) {
        while (i < j) {
            char t = a[i];
            a[i++] = a[j];
            a[j--] = t;
        }
    }
}
```

### 345. 反转字符串中的元音字母

[力扣题目链接](https://leetcode.cn/problems/reverse-vowels-of-a-string/)

```java
class Solution {

    static Set<Character> vowels = new HashSet<>() {{
        add('a');
        add('o');
        add('e');
        add('i');
        add('u');
        add('A');
        add('O');
        add('E');
        add('I');
        add('U');
    }};

    public String reverseVowels(String s) {
        int l = 0, r = s.length() - 1;
        char[] chars = s.toCharArray();
        while (l < r) {
            while (l < r && !vowels.contains(chars[l])) {
                l++;
            }
            while (l < r && !vowels.contains(chars[r])) {
                r--;
            }

            Character temp = chars[l];
            chars[l] = chars[r];
            chars[r] = temp;
            // 注意这里
            l++;
            r--;
        }
        return String.valueOf(chars);
    }
}
```



### 8. 字符串转换整数

[力扣题目链接](https://leetcode.cn/problems/string-to-integer-atoi/)

```java
class Solution {
    public int myAtoi(String s) {
        int index = 0, sign = 1, total = 0;
        // 空字符串
        if (s.length() == 0) {
            return 0;
        }
        // 移除空格
        while (s.charAt(index) == ' ') {
            index++;
        }
        // 处理正负号
        if (s.charAt(index) == '+' || s.charAt(index) == '-') {
            sign = s.charAt(index) == '+' ? 1 : -1;
            index++;
        }
        // 转为数字
        while (index < s.length()) {
            int digit = s.charAt(index) - '0';
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
}
```

###  459.重复的子字符串

[力扣题目链接](https://leetcode.cn/problems/repeated-substring-pattern/)

移动匹配法：

```java
class Solution {
    public boolean repeatedSubstringPattern(String s) {
        int idx = (s + s).indexOf(s, 1);
        return  idx < s.length();
    }
}
```

### 3. 无重复字符的最长子串

[力扣题目链接](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

滑动窗口：

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        int ans = 0, left = 0;
        // 保存无重复的子串
        Set<Character> set = new HashSet<>();
        // eg: "pwwkew" -> "kew"
        for (int right = 0; right < s.length(); right++) {
            Character ch = s.charAt(right);
            while (set.contains(ch)) {
                set.remove(s.charAt(left));
                left++;
            }
            set.add(ch);
            ans = Math.max(ans, set.size());
        }
        return ans;
    }
}
```



### 字符串题目总结

字符串与字符数组的转换会经常用到，字符串的题目也常常会与哈希表、排序结合。

## 栈与队列

### 20. 有效的括号

[力扣题目链接](https://leetcode-cn.com/problems/valid-parentheses/)

可以使用暴力破解法，即遍历字符串，找到最近的匹配括号开始，如果匹配就替换为空字符串，一直循环下去，如果括号是匹配的，那么最终的结果应该是个空字符串。

这里使用的栈来解决。

```java
class Solution {
    public boolean isValid(String s) {
        int n = s.length();
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
}
```

除了这种方法，还有一种相对比较简单的写法：

```java
class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();

        for (char c : s.toCharArray()) {
            if (c == '(') {
                stack.push(')');
            } else if (c == '{') {
                stack.push('}');
            } else if (c == '[') {
                stack.push(']');
            } else if (stack.isEmpty() || stack.peek() != c) {
                return false;
            } else {
                stack.pop();
            }
        }
        return stack.isEmpty();
    }
}
```

### 1047. 删除字符串中的所有相邻重复项

[力扣题目链接](https://leetcode.cn/problems/remove-all-adjacent-duplicates-in-string/)

栈的应用的经典题目：

```java
class Solution {
    public String removeDuplicates(String s) {
        if (s == null || s.isEmpty()) {
            return s;
        }
        Stack<Character> stack = new Stack<>();
        char[] charArray = s.toCharArray();
        for (char ch : charArray) {
            if (!stack.isEmpty() && ch == stack.peek()) {
                stack.pop();
            } else {
                stack.push(ch);
            }
        }

        StringBuilder stringBuilder = new StringBuilder();
        while (!stack.isEmpty()) {
            stringBuilder.append(stack.pop());
        }
        return stringBuilder.reverse().toString();
    }
}
```



### 155. 最小栈 

[力扣题目连接](https://leetcode-cn.com/problems/min-stack/)

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

### 150. 逆波兰表达式求值

[力扣题目链接](https://leetcode.cn/problems/evaluate-reverse-polish-notation/)

```java
class Solution {
    public int evalRPN(String[] tokens) {
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < tokens.length; i++) {
            // 是运算的符号
            if (tokens[i].equals("+") || tokens[i].equals("-") || tokens[i].equals("*") || tokens[i].equals("/")) {
                Integer num1 = stack.pop();
                Integer num2 = stack.pop();
                if (tokens[i].equals("+")) {
                    stack.push(num2 + num1);
                }
                if (tokens[i].equals("-")) {
                    stack.push(num2 - num1);
                }
                if (tokens[i].equals("*")) {
                    stack.push(num2 * num1);
                }
                if (tokens[i].equals("/")) {
                    stack.push(num2 / num1);
                }
            } else {
                // 是数字
                stack.push(Integer.valueOf(tokens[i]));
            }
        }

        return stack.pop();
    }
}
```



### 71. 简化路径

[力扣题目链接](https://leetcode.cn/problems/simplify-path)

```java
class Solution {
    public String simplifyPath(String path) {
        Deque<String> stack = new LinkedList<>(); // 用ArrayDeque执行效率会更高
        for (String s : path.split("/")) {
            if ("".equals(s) || ".".equals(s)) { // . 表示当前目录
                continue;
            }
            // 使用 pollLast 和 offerLast 是方便将来拼接结果，如果用pop方法和push方法，就得倒着遍历栈了
            // eg：/a/./b/ 结果是 /a/b 用 pop方法和push方法，遍历栈得到的结果：/b/a，在队尾遍历的结果：/a/b
            if ("..".equals(s)) { // .. 表示上级目录
                stack.pollLast();
            } else {
                stack.offerLast(s);
            }
        }
        return "/" + String.join("/", stack);
    }
}
```



### 347.前 K 个高频元素

[力扣题目链接](https://leetcode.cn/problems/top-k-frequent-elements/)

方法一：桶排序

```java
class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            map.put(num, map.getOrDefault(num, 0) + 1);
        }

        List<Integer>[] bucket = new List[nums.length + 1];

        for (Integer key : map.keySet()) {
            Integer value = map.get(key);
            if (bucket[value] == null) {
                bucket[value] = new ArrayList<>();
            }
            bucket[value].add(key);
        }

        List<Integer> res = new ArrayList<>(); // 必须是List，出现同频次的元素可能有多个，例如 第一大的元素有3个

        for (int i = bucket.length - 1; i >= 0 && res.size() < k; i--) {
            if (bucket[i] != null) {
                res.addAll(bucket[i]);
            }
        }

        return res.stream().mapToInt(Integer::intValue).toArray();
    }
}
```



### 239. 滑动窗口最大值

[力扣题目链接](https://leetcode-cn.com/problems/sliding-window-maximum/)

<div class="note info"><p>所有滑动窗口的问题都可以使用队列来解决。</p></div>

使用最大堆（优先队列）：

```java
class Solution { 
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
}
```

### 146. LRU 缓存

[力扣题目链接](https://leetcode.cn/problems/lru-cache/)

```java
class LRUCache extends LinkedHashMap<Integer, Integer> {

    private int capacity;

    public LRUCache(int capacity) {
        // accessOrder为true，表示每次访问（get、put、putAll 等操作）一个已经存在的键时，该键值对会被移动到链表的尾部，
        super(capacity, 0.75f, true);
        // 初始化容量
        this.capacity = capacity;
    }

    public int get(int key) {
        return super.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        super.put(key, value);
    }

    // 该方法在插入新的元素后被调用
    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return super.size() > capacity;
    }
}
```

###  739. 每日温度

[力扣题目链接](https://leetcode.cn/problems/daily-temperatures/)

完整代码：

```java
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] ans = new int[n];
        Stack<Integer> stack = new Stack<>();
        stack.push(0); // 注意，push进去的是下标
        for (int i = 1; i < temperatures.length; i++) {
            if (temperatures[i] <= temperatures[stack.peek()]) {
                stack.push(i);
            } else {
                while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
                    ans[stack.peek()] = i - stack.peek();
                    stack.pop();
                }
                stack.push(i);
            }
        }

        return ans;
    }
}
```

精简代码：

```java
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] ans = new int[n];
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < temperatures.length; i++) {
            while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
                ans[stack.peek()] = i - stack.peek();
                stack.pop();
            }
            stack.push(i);
        }

        return ans;
    }
}
```



### 496.下一个更大元素 I

[力扣题目链接](https://leetcode.cn/problems/next-greater-element-i/)

```java
class Solution {
    public int[] nextGreaterElement(int[] nums1, int[] nums2) {
        // 单调栈
        Deque<Integer> stk = new ArrayDeque<>();
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : nums2) {
            while (!stk.isEmpty() && stk.peek() < num) {
                map.put(stk.pop(), num);
            }
            stk.push(num);
        }

        int n = nums1.length;
        int[] res = new int[n];
        for (int i = 0; i < n; i++) {
            res[i] = map.getOrDefault(nums1[i], -1);
        }
        return res;
    }
}
```



### 503.下一个更大元素II

[力扣题目链接](https://leetcode.cn/problems/next-greater-element-ii/)

```java
class Solution {
    public int[] nextGreaterElements(int[] nums) {
        int n = nums.length;
        int[] ans = new int[n];
        Arrays.fill(ans, -1);
        Deque<Integer> stack = new LinkedList<>();
        for (int i = 0; i < 2 * n; i++) {
            while (!stack.isEmpty() && nums[i % n] > nums[stack.peek()]) {
                ans[stack.peek()] = nums[i % n];
                stack.pop();
            }
            stack.push(i % n);
        }
        return ans;
    }
}
```

### 394. 字符串解码

[力扣题目链接](https://leetcode.cn/problems/decode-string/)

```java
class Solution {
    public String decodeString(String s) {
        // eg: 3[a]2[bc] -> aaabcbc
        Deque<Character> stack = new LinkedList<>();
        for (Character ch : s.toCharArray()) {
            if (ch != ']') {
                stack.push(ch);
            } else {
                StringBuilder letterBuilder = new StringBuilder();

                while (!stack.isEmpty() && Character.isLetter(stack.peek())) {
                    letterBuilder.insert(0, stack.pop());
                }
                stack.pop(); // 去掉 "["

                StringBuilder digitalBuilder = new StringBuilder();
                while (!stack.isEmpty() && Character.isDigit(stack.peek())) { // 数字可能是多位的
                    digitalBuilder.insert(0, stack.pop());
                }

                int count = Integer.parseInt(digitalBuilder.toString());

                for (int i = 0; i < count; i++) {
                    for (char c : letterBuilder.toString().toCharArray()) {
                        stack.push(c);
                    }
                }
            }
        }

        StringBuilder ans = new StringBuilder();
        while (!stack.isEmpty()) {
            ans.insert(0, stack.pop());
        }
        return ans.toString();
    }
}
```

### 933. 最近的请求次数

[力扣题目链接](https://leetcode.cn/problems/number-of-recent-calls)

```java
class RecentCounter {

    Queue<Integer> queue = new LinkedList<>();
    
    // t代表这个员工的工号，每次新员工加入q公司之前，先把工号小于 t-3000的老家伙都辞退，然后再让t入职，统计q公司现在有多少个员工
    public int ping(int t) {
        while (!queue.isEmpty()) {
            Integer time  = queue.peek();
            if (time < t - 3000) {
                queue.poll();
            } else {
                break;
            }
        }
        queue.offer(t);
        return queue.size();
    }
}
```

## 子串与区间

### 560. 和为 K 的子数组

[力扣题目链接](https://leetcode.cn/problems/subarray-sum-equals-k/)

方法一：

前缀和的解法原理：使用哈希表来统计每个前缀和出现的次数。遍历数组，计算每个前缀和，并在哈希表中查找当前前缀和减去k是否存在，如果存在，说明存在一个以当前元素为结尾的子数组的和为k。继续遍历，直到遍历完整个数组。

前缀和算法通过使用前缀和和哈希表的方法来优化查找子数组的效率。

```java
class Solution {
    public int subarraySum(int[] nums, int k) {
        int ans = 0, sum = 0;
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, 1); // 出现0的次数是1

        for (int num : nums) {
            sum += num;
            // 当前前缀和减去k，得到另一个前缀和
            ans += map.getOrDefault(sum - k, 0);
            // 当前前缀和加入map
            map.put(sum, map.getOrDefault(sum, 0) + 1);
        }
        return ans;
    }
}
```

方法二：

```java
public class Solution {
    public int subarraySum(int[] nums, int k) {
        int count = 0;

        int[] sum = new int[nums.length + 1];
        sum[0] = 0;
        for (int i = 1; i <= nums.length; i++) {
            sum[i] = sum[i - 1] + nums[i - 1];
        }

        for (int start = 0; start < sum.length; start++) {
            for (int end = start + 1; end < sum.length; end++) {
                // 计算“nums”的总和意味着使用“sum”的最后一个元素减去“sum”的第一个元素
                if (sum[end] - sum[start] == k) {
                    count++;
                }
            }
        }

        return count;
    }
}
```

### 435. 无重叠区间

[力扣题目链接](https://leetcode.cn/problems/non-overlapping-intervals/)

```java
class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> {
            return Integer.compare(a[0], b[0]);
        });
        int count = 1;
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < intervals[i - 1][1]) {
                intervals[i][1] = Math.min(intervals[i - 1][1], intervals[i][1]);
                continue;
            } else {
                count++;
            }
        }
        return intervals.length - count;
    }
}
```



### 763.划分字母区间

[力扣题目链接](https://leetcode.cn/problems/partition-labels/)

```java
class Solution {
    public List<Integer> partitionLabels(String s) {
        List<Integer> ans = new ArrayList<>();
        int[] edge = new int[26];
        char[] charArray = s.toCharArray();

        for (int i = 0; i < charArray.length; i++) {
            edge[charArray[i] - 'a'] = i;
        }

        int left = 0;
        int right = 0;
        for (int i = 0; i < charArray.length; i++) {
            right = Math.max(right, edge[charArray[i] - 'a']);
            if (i == right) {
                ans.add(right - left + 1);
                left = i + 1;
            }
        }

        return ans;
    }
}
```



### 56. 合并区间

[力扣题目链接](https://leetcode.cn/problems/merge-intervals/)

```java
class Solution {
    public int[][] merge(int[][] intervals) {
        if (intervals.length <= 1) {
            return intervals;
        }

        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

        List<int[]> result = new ArrayList<>();
        int[] newInterval = intervals[0];
        result.add(newInterval);

        for (int[] interval : intervals) {
            if (interval[0] <= newInterval[1]) {
                newInterval[1] = Math.max(newInterval[1], interval[1]);
            } else {
                newInterval = interval;
                result.add(newInterval);
            }
        }

        return result.toArray(new int[result.size()][]);
    }
}
```

### 57. 插入区间

```java
class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> ans = new ArrayList<>();
        int len = intervals.length;
        int i = 0;
        // 判断左边不重合
        while (i < len && intervals[i][1] < newInterval[0]) {
            ans.add(intervals[i]);
            i++;
        }
        // 判断重合
        while (i < len && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = Math.min(intervals[i][0], newInterval[0]);
            newInterval[1] = Math.max(intervals[i][1], newInterval[1]);
            i++;
        }
        ans.add(newInterval);
        // 判断右边不重合
        while (i < len && intervals[i][0] > newInterval[1]) {
            ans.add(intervals[i]);
            i++;
        }
        return ans.toArray(new int[0][]);
    }
}
```



## 树

### 94. 二叉树的中序遍历

[力扣题目链接](https://leetcode-cn.com/problems/binary-tree-inorder-traversal/)

使用传统的递归方式：

```java
class Solution {

    private List<Integer> ans = new ArrayList<>();

    public List<Integer> inorderTraversal(TreeNode root) {
        if (root == null) {
            return ans;
        }
        if (root.left != null) {
            inorderTraversal(root.left);
        }
        ans.add(root.val);
        if (root.right != null) {
            inorderTraversal(root.right);
        }
        return ans;
    }
}
```

迭代实现：

```java
class Solution {

    private List<Integer> ans = new ArrayList<>();

    public List<Integer> inorderTraversal(TreeNode root) {
        Deque<TreeNode> stack = new LinkedList<>();
        while (stack.size() > 0 || root != null) {
            // 不断往左子树方向走，每走一次就将当前节点保存到栈中
            // 这是模拟递归的调用
            if (root != null) {
                stack.push(root);
                root = root.left;
            } else {
                // 当前节点为空，说明左边走到头了，从栈中弹出节点并保存
                // 然后转向右边节点，继续上面整个过程
                TreeNode temp = stack.pop();
                ans.add(temp.val);
                root = temp.right;
            }
        }
        return ans;
    }
}
```

莫里斯遍历：

```java
class Solution {
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
}
```

### 104. 二叉树的最大深度

递归解法：

```java
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }

        return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
    }
}
```

广度优先遍历解法：

```java
class Solution {
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
}
```

### 98. 验证二叉搜索树

> 二叉搜索树有两个重要性质，第一，左子树上所有结点的值都要小于根节点的值，右子树所有结点的值都要大于根节点的值；第二，中序遍历后的结果是一个递增的数列。

使用递归：

```java
class Solution {
    public boolean isValidBST(TreeNode root) {
        return recursion(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean recursion(TreeNode root, long lower, long upper) {
        if (root == null) {
            return true;
        }

        if (root.val >= upper || root.val <= lower) {
            return false;
        }
        // 相当于给子树上所有的节点都添加了min和max的边界
        // 约束root的左子树的值不超过root的值，右子树的值不小于root的值
        return recursion(root.left, lower, root.val) && recursion(root.right, root.val, upper);
    }
}
```

利用中序遍历的性质：

```java
class Solution {   
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
}
```

除此之外，也可以先进行中序遍历，然后判断返回的列表是否为升序。

### [236. 二叉树的最近公共祖先](https://leetcode-cn.com/problems/lowest-common-ancestor-of-a-binary-tree/)

[力扣题目链接](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/)

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

解法二：

```java
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null) {
            return null;
        }
        if (p == root || q == root) {
            return root;
        }

        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left == null) {
            return right;
        }
        if (right == null) {
            return left;
        }
        return root;
    }
}
```



### 102. 二叉树的层序遍历

模板代码：

```java
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> ans = new ArrayList<>();
        if (root == null) {
            return ans;
        }
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> list = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                list.add(node.val);

                TreeNode left = node.left;
                if (left != null) {
                    queue.offer(left);
                }
                TreeNode right = node.right;
                if (right != null) {
                    queue.offer(right);
                }
            }
            ans.add(list);
        }
        return ans;
    }
}
```

### 107.二叉树的层次遍历 II

[力扣题目链接](https://leetcode.cn/problems/binary-tree-level-order-traversal-ii/)

在二叉树的层次遍历上稍做改动：

```java
class Solution {
    public List<List<Integer>> levelOrderBottom(TreeNode root) {
        List<List<Integer>> ans = new ArrayList<>();
        if (root == null) {
            return ans;
        }
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            List<Integer> list = new ArrayList<>();
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                list.add(node.val);
                TreeNode left = node.left;
                if (left != null) {
                    queue.offer(left);
                }
                TreeNode right = node.right;
                if (right != null) {
                    queue.offer(right);
                }
            }
            ans.add(0, list);
        }
        return ans;
    }
}
```

### 199.二叉树的右视图

[力扣题目链接](https://leetcode.cn/problems/binary-tree-right-side-view/)

同样的，在二叉树的层次遍历上稍做改动：

```java
class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> ans = new ArrayList<>();
        if (root == null) {
            return ans;
        }
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                if (i == size - 1) {
                    ans.add(node.val);
                }

                TreeNode left = node.left;
                if (left != null) {
                    queue.offer(left);
                }

                TreeNode right = node.right;
                if (right != null) {
                    queue.offer(right);
                }
            }
        }
        return ans;
    }
}
```

递归解法：

```java
class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        recursion(root, res, 0);
        return res;
    }

    private void recursion(TreeNode curr, List<Integer> res, int currDepth) {
        if (curr == null) {
            return;
        }
        if (currDepth == res.size()) {
            res.add(curr.val);
        }
        recursion(curr.right, res, currDepth + 1);
        recursion(curr.left, res, currDepth + 1);
    }
}
```

### 515.在每个树行中找最大值

[力扣题目链接](https://leetcode.cn/problems/find-largest-value-in-each-tree-row/)

```java
class Solution {
    public List<Integer> largestValues(TreeNode root) {
        List<Integer> ans = new ArrayList<>();
        if (root == null) {
            return ans;
        }
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            Integer max = Integer.MIN_VALUE;
            while (size > 0) { // 和for循环一样，没有区别
                TreeNode node = queue.poll();
                max = Math.max(max, node.val);

                TreeNode left = node.left;
                if (left != null) {
                    queue.offer(left);
                }
                TreeNode right = node.right;
                if (right != null) {
                    queue.offer(right);
                }
                size--;
            }
            ans.add(max);
        }
        return ans;
    }
}
```

### 226.翻转二叉树

递归即可：

```java
class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) {
            return null;
        }

        TreeNode temp = root.left;
        root.left = root.right;
        root.right = temp;
        // 注意这里不需要判断 root.left 是否为空
        invertTree(root.left);
        invertTree(root.right);

        return root;
    }
}
```

### 101. 对称二叉树

```java
class Solution {
    public boolean isSymmetric(TreeNode root) {
        if (root == null) {
            return false;
        }
        return recusion(root.left, root.right);
    }

    private boolean recusion(TreeNode left, TreeNode right) {
        if (left == null && right != null) {
            return false;
        }

        if (left != null && right == null) {
            return false;
        }

        if (left == null && right == null) {
            return true;
        }

        if (left.val != right.val) {
            return false;
        }

        boolean leftSsSymmetric = recusion(left.left, right.right);
        boolean rightSsSymmetric = recusion(left.right, right.left);
        return leftSsSymmetric && rightSsSymmetric;
    }
}
```

简洁一点的写法：

```java
class Solution {
    public boolean isSymmetric(TreeNode root) {
        if (root == null) return false;
        return recursion(root.left, root.right);
    }

    private boolean recursion(TreeNode left, TreeNode right) {
        if (left != null && right == null) return false;
        if (left == null && right != null) return false;
        if (left == null && right == null) return true;
        if (left.val != right.val) return false;
        return recursion(left.left, right.right) && recursion(left.right, right.left);
    }
}
```

### 222.完全二叉树的节点个数

[力扣题目链接](https://leetcode.cn/problems/count-complete-tree-nodes/)

```java
class Solution {
    public int countNodes(TreeNode root) {
        if (root == null) {
            return 0;
        }
        return countNodes(root.left) + countNodes(root.right) + 1;
    }
}
```

### 110.平衡二叉树

[力扣题目链接](https://leetcode.cn/problems/balanced-binary-tree/)

```java
class Solution {
    public boolean isBalanced(TreeNode root) {
        return height(root) != -1;
    }

    private int height(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int left = height(root.left);
        if (left == -1) {
            return -1;
        }
        int right = height(root.right);
        if (right == -1) {
            return -1;
        }

        if (Math.abs(right - left) > 1) { // 左右子树的高度差1，说明已经不是平衡树了
            return -1;
        }

        return Math.max(left, right) + 1;

    }
}
```

###  257. 二叉树的所有路径

[力扣题目链接](https://leetcode.cn/problems/binary-tree-paths/)

递归：

```java
class Solution {
    public List<String> binaryTreePaths(TreeNode root) {
        List<String> ans = new ArrayList<>();
        dfs(ans, "", root);
        return ans;
    }

    private void dfs(List<String> ans, String path, TreeNode root) {
        if (root == null) {
            return;
        }
        if (root.left == null && root.right == null) {
            path += root.val;
            ans.add(path);
            return;
        }
        path += root.val + "->";
        dfs(ans, path, root.left);
        dfs(ans, path, root.right);
    }
}
```

执行结果：

![image-20240322114537071](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20240322114537071.png)

使用StringBuilder效率会有所提升：

```java
class Solution {
    public List<String> binaryTreePaths(TreeNode root) {
        List<String> ans = new ArrayList<>();
        dfs(ans, "", root);
        return ans;
    }

    private void dfs(List<String> ans, String path, TreeNode root) {
        if (root == null) {
            return;
        }
        if (root.left == null && root.right == null) {
            String s = new StringBuilder(path).append(root.val).toString();
            ans.add(s);
            return;
        }
        String s = new StringBuilder(path).append(root.val).append("->").toString();
        dfs(ans, s, root.left);
        dfs(ans, s, root.right);
    }
}
```

执行结果：

![image-20240322114445685](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20240322114445685.png)

前序遍历的回溯算法：

```java
class Solution {
    public List<String> binaryTreePaths(TreeNode root) {
        List<String> ans = new ArrayList<>();
        List<Integer> paths = new ArrayList<>();
        dfs(ans, paths, root);
        return ans;
    }

    private void dfs(List<String> ans, List<Integer> paths, TreeNode root) {
        paths.add(root.val);
        if (root.left == null && root.right == null) {
            StringBuilder sb = new StringBuilder();
            for (Integer path : paths) {
                sb.append(path).append("->");
            }
            sb.delete(sb.length() - 2, sb.length());
            ans.add(sb.toString());
            return;
        }

        if (root.left != null) {
            dfs(ans, paths, root.left);
            paths.remove(paths.size() - 1);
        }

        if (root.right != null) {
            dfs(ans, paths, root.right);
            paths.remove(paths.size() - 1);
        }
    }
}
```

### 404.左叶子之和

[力扣题目链接](https://leetcode.cn/problems/sum-of-left-leaves/)

递归法：

```java
class Solution {
    public int sumOfLeftLeaves(TreeNode root) {
        if (root == null) {
            return 0;
        }
        return dfs(root);
    }

    private int dfs(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int left = dfs(root.left);
        int right = dfs(root.right);
        int val = 0;
        if (root.left != null && root.left.left == null && root.left.right == null) { // 说明是左侧节点
            val = root.left.val;
        }
        return left + right + val;
    }
}
```

迭代法：

```java
class Solution {
    public int sumOfLeftLeaves(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int ans = 0;
        Stack<TreeNode> stack = new Stack<TreeNode>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();

            if (node.left != null && node.left.left == null && node.left.right == null) {
                ans += node.left.val;
            }

            TreeNode left = node.left;
            if (left != null) {
                stack.push(left);
            }
            TreeNode right = node.right;
            if (right != null) {
                stack.push(right);
            }
        }
        return ans;
    }
}
```

### 513.找树左下角的值

[力扣题目链接](https://leetcode.cn/problems/find-bottom-left-tree-value/)

递归解法：

```java
class Solution {

    private int maxDepth = Integer.MIN_VALUE;
    private int ans = 0;

    public int findBottomLeftValue(TreeNode root) {
        if (root == null) {
            return ans;
        }
        dfs(root, 0);
        return ans;
    }

    private void dfs(TreeNode root, int depth) {
        if (root == null) {
            return;
        }
        if (root.left == null && root.right == null) { // 是叶子节点
            if (depth > maxDepth) {
                ans = root.val;
                maxDepth = depth;
            }
        }
        dfs(root.left, depth + 1);
        dfs(root.right, depth + 1);
    }
}
```

层序遍历：

```java
class Solution {

    public int findBottomLeftValue(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int ans = 0;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                if (i == 0) {
                    ans = node.val;
                }
                TreeNode left = node.left;
                if (left != null) {
                    queue.offer(left);
                }
                TreeNode right = node.right;
                if (right != null) {
                    queue.offer(right);
                }
            }
        }
        return ans;
    }
}
```

### 112. 路径总和

[力扣题目链接](https://leetcode.cn/problems/path-sum/)

```java
class Solution {
    public boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) {
            return false;
        }
        if (root.left == null && root.right == null) {
            return root.val == targetSum;
        }

        return hasPathSum(root.left, targetSum - root.val) || hasPathSum(root.right, targetSum - root.val);
    }
}
```

### 437. 路径总和 III

[力扣题目链接](https://leetcode.cn/problems/path-sum-iii/)

```java
class Solution {

    private Long count = 0L; // 必须用Long类型，否则无法通过

    public int pathSum(TreeNode root, int targetSum) {
        if (root == null) {
            return 0;
        }

        // 计算给节点
        helper(root, targetSum, 0L);
        // 计算给定节点的左子树
        pathSum(root.left, targetSum);
        // 计算给定节点的右子树
        pathSum(root.right, targetSum);
        return count.intValue();
    }

    private void helper(TreeNode root, int targetSum, Long currentSum) {
        if (root == null) {
            return;
        }

        currentSum += root.val;
        if (currentSum == targetSum) {
            count++;
        }

        helper(root.left, targetSum, currentSum);
        helper(root.right, targetSum, currentSum);
    }
}
```

### 617.合并二叉树

[力扣题目链接](https://leetcode.cn/problems/merge-two-binary-trees/)

```java
class Solution {
    public TreeNode mergeTrees(TreeNode root1, TreeNode root2) {
        if (root1 == null) {
            return root2;
        }

        if (root2 == null) {
            return root1;
        }
        
        // 处理当前层
        int val = root1.val + root2.val;
        TreeNode node = new TreeNode(val);

        // 计算左右节点
        TreeNode left = mergeTrees(root1.left, root2.left);
        TreeNode right = mergeTrees(root1.right, root2.right);

        node.left = left;
        node.right = right;
        return node;
    }
}
```

简洁一点的写法：

```java
class Solution {
    public TreeNode mergeTrees(TreeNode root1, TreeNode root2) {
        if (root1 == null) return root2;
        if (root2 == null) return root1;

        TreeNode node = new TreeNode(root1.val + root2.val);
        node.left = mergeTrees(root1.left, root2.left);
        node.right =  mergeTrees(root1.right, root2.right);
        return node;
    }
}
```

### 700.二叉搜索树中的搜索

```java
class Solution {
    public TreeNode searchBST(TreeNode root, int val) {
        if (root == null) {
            return null;
        }

        if (root.val == val) {
            return root;
        }

        if (val > root.val) {
            return searchBST(root.right, val);
        } else {
            return searchBST(root.left, val);
        }
    }
}
```

简洁一点的写法：

```java
class Solution {
    public TreeNode searchBST(TreeNode root, int val) {
        if (root == null || root.val == val) return root;
        return val > root.val ? searchBST(root.right, val) : searchBST(root.left, val);
    }
}
```

### 530.二叉搜索树的最小绝对差

[力扣题目链接](https://leetcode.cn/problems/minimum-absolute-difference-in-bst/)

自然的想法，按照中序遍历，然后求最小差：

```java
class Solution {
    public int getMinimumDifference(TreeNode root) {
        List<Integer> nums = new ArrayList<>();
        if (root == null) {
            return 0;
        }
        dfs(nums, root);
        int min = Integer.MAX_VALUE;
        for (int i = 1; i < nums.size(); i++) {
            min = Math.min(min, nums.get(i) - nums.get(i - 1));
        }
        return min;
    }

    private void dfs(List<Integer> nums, TreeNode root) {
        if (root == null) {
            return;
        }
        dfs(nums, root.left);
        nums.add(root.val);
        dfs(nums, root.right);
    }
}
```

### 501.二叉搜索树中的众数

[力扣题目链接](https://leetcode.cn/problems/find-mode-in-binary-search-tree/)

解法一：

```java
class Solution {
    public int[] findMode(TreeNode root) {
        Map<Integer, Integer> map = new HashMap<>();
        dfs(map, root);
        List<Integer> ans = new ArrayList<>();
        Integer maxFrequency = Collections.max(map.values());
        for (Integer key : map.keySet()) {
            if (map.get(key) == maxFrequency) {
                ans.add(key);
            }
        }
        return ans.stream().mapToInt(Integer::intValue).toArray();
    }

    private void dfs(Map<Integer, Integer> map, TreeNode root) {
        if (root == null) {
            return;
        }
        map.put(root.val, map.getOrDefault(root.val, 0) + 1);
        dfs(map, root.left);
        dfs(map, root.right);
    }
}
```

解法二：

```java
class Solution {
    public int[] findMode(TreeNode root) {
        Map<Integer, Integer> freqMap = new HashMap<>();
        int max = dfs(root, freqMap);
        return freqMap.entrySet().stream()
                .filter(e -> e.getValue() == max)
                .mapToInt(e -> e.getKey()).toArray();
    }

    private int dfs(TreeNode root, Map<Integer, Integer> freqMap) {
        if (root == null) {
            return 0;
        }

        int l = dfs(root.left, freqMap);
        int r = dfs(root.right, freqMap);
        freqMap.put(root.val, freqMap.getOrDefault(root.val, 0) + 1);
        return Math.max(freqMap.get(root.val), Math.max(l, r));
    }
}

```

### 1448. 统计二叉树中好节点的数目

[力扣题目链接](https://leetcode.cn/problems/count-good-nodes-in-binary-tree/)

```java
class Solution {

    private int ans = 0;

    public int goodNodes(TreeNode root) {
        dfs(root, root.val);
        return ans;
    }

    private void dfs(TreeNode root, int max) {
        if (root == null) {
            return;
        }

        if (root.val >= max) {
            ans++;
            max = root.val;
        }

        dfs(root.left, max);
        dfs(root.right, max);
    }
}
```

### 872. 叶子相似的树

[力扣题目链接](https://leetcode.cn/problems/leaf-similar-trees)

```java
class Solution {
    public boolean leafSimilar(TreeNode root1, TreeNode root2) {
        List<Integer> l1 = new ArrayList<>();
        List<Integer> l2 = new ArrayList<>();
        dfs(root1, l1);
        dfs(root2, l2);
        return l1.equals(l2);
    }

    private void dfs(TreeNode root, List<Integer> list) {
        if (root == null) {
            return;
        }

        if (root.left == null && root.right == null) {
            list.add(root.val);
        }

        dfs(root.left, list);
        dfs(root.right, list);
    }
}
```



### 208. 实现 Trie (前缀树)

[力扣题目链接](https://leetcode.cn/problems/implement-trie-prefix-tree)

```java
class Trie {

    Node root;

    public Trie() {
        root = new Node();
    }

    public void insert(String word) {
        root.insert(word, 0);
    }

    public boolean search(String word) {
        return root.search(word, 0);
    }

    public boolean startsWith(String prefix) {
        return root.startsWith(prefix, 0);
    }

    class Node {
        Node[] nodes;
        boolean isEnd;

        Node() {
            nodes = new Node[26];
        }

        private void insert(String word, int idx) {
            if (idx >= word.length()) {
                return;
            }
            int i = word.charAt(idx) - 'a';
            if (nodes[i] == null) {
                nodes[i] = new Node();
            }

            if (idx == word.length() - 1) {
                nodes[i].isEnd = true;
            }
            nodes[i].insert(word, ++idx);
        }

        private boolean search(String word, int idx) {
            if (idx >= word.length()) {
                return false;
            }
            Node node = nodes[word.charAt(idx) - 'a'];
            if (node == null) {
                return false;
            }
            if (idx == word.length() - 1 && node.isEnd) {
                return true;
            }
            return node.search(word, ++idx);
        }

        private boolean startsWith(String prefix, int idx) {
            if (idx >= prefix.length()) {
                return false;
            }
            Node node = nodes[prefix.charAt(idx) - 'a'];
            if (node == null) {
                return false;
            }
            if (idx == prefix.length() - 1) {
                return true;
            }
            return node.startsWith(prefix, ++idx);
        }
    }
}
```

### 173. 二叉搜索树迭代器

[力扣题目链接](https://leetcode.cn/problems/binary-search-tree-iterator)

```java
class BSTIterator {
    private List<Integer> list = new ArrayList<>();
    private int index = 0;

    public BSTIterator(TreeNode root) {
        travel(root);
    }

    public int next() {
        return list.get(index++);
    }

    public boolean hasNext() {
        return index < list.size();
    }

    private void travel(TreeNode root) {
        if (root != null) {
            travel(root.left);
            list.add(root.val);
            travel(root.right);
        }
    }
}
```

### 129. 求根节点到叶节点数字之和

[力扣题目链接](https://leetcode.cn/problems/sum-root-to-leaf-numbers)

```java
class Solution {
    public int sumNumbers(TreeNode root) {
        return dfs(root, 0);
    }

    private int dfs(TreeNode root, int sum) {
        if (root == null) {
            return 0;
        }
        sum = root.val + sum * 10;
        if (root.left == null && root.right == null) {
            return sum;
        }
        return dfs(root.left, sum) + dfs(root.right, sum);
    }
}
```

### 124. 二叉树中的最大路径和

[力扣题目链接](https://leetcode.cn/problems/binary-tree-maximum-path-sum)

```java
class Solution {

    private Integer ans = Integer.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        dfs(root);
        return ans;
    }

    private int dfs(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int l = Math.max(0, dfs(root.left));
        int r = Math.max(0, dfs(root.right));
        ans = Math.max(ans, root.val + l + r);
        return root.val + Math.max(l, r);
    }
}
```

### 117. 填充每个节点的下一个右侧节点指针 II

[力扣题目链接](https://leetcode.cn/problems/populating-next-right-pointers-in-each-node-ii)

```java
class Solution {
    public Node connect(Node root) {
        if (root == null) {
            return null;
        }
        Queue<Node> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            Node pre = null;
            for (int i = queue.size(); i > 0; i--) {
                Node node = queue.poll();
                if (pre != null) {
                    pre.next = node;
                }
                pre = node;
                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }
        }
        return root;
    }
}
```

### 103. 二叉树的锯齿形层序遍历

[力扣题目链接](https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal)

```java
class Solution {
    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> ans = new ArrayList<>();
        if (root == null) {
            return ans;
        }
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        boolean left = true;
        while (!queue.isEmpty()) {
            List<Integer> list = new ArrayList<>();
            for (int i = queue.size(); i > 0; i--) {
                TreeNode node = queue.poll();
                if (left) {
                    list.add(node.val);
                } else {
                    list.add(0, node.val);
                }

                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }
            ans.add(list);
            left = !left;
        }
        return ans;
    }
}
```



### 树题目总结

递归是解决树的最重要的方法。

平衡二叉树的中序遍历是有序数组，这一点解题的时候会经常用到。

## 回溯算法

### 77. 组合

[力扣题目链接](https://leetcode.cn/problems/combinations/)

```java
class Solution {
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> ans = new ArrayList<>();
        dfs(ans, new ArrayList<>(), n, k, 1);
        return ans;
    }


    private void dfs(List<List<Integer>> ans, List<Integer> path, int n, int k, int startIndex) {
        if (path.size() == k) {
            ans.add(new ArrayList<>(path));
            return;
        }

        for (int i = startIndex; i <= n; i++) {
            path.add(i);
            dfs(ans, path, n, k, i + 1);
            path.remove(path.size() - 1);
        }
    }
}
```

结果用成员变量保存：

```java
class Solution {

    private List<List<Integer>> ans = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combine(int n, int k) {
        dfs(n, k, 1);
        return ans;
    }


    private void dfs(int n, int k, int startIndex) {
        if (path.size() == k) {
            ans.add(new ArrayList<>(path));
            return;
        }

        for (int i = startIndex; i <= n; i++) {
            path.add(i);
            dfs(n, k, i + 1);
            path.remove(path.size() - 1);
        }
    }
}
```

剪枝优化：

```java
class Solution {

    private List<List<Integer>> ans = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combine(int n, int k) {
        dfs(n, k, 1);
        return ans;
    }


    private void dfs(int n, int k, int startIndex) {
        if (path.size() == k) {
            ans.add(new ArrayList<>(path));
            return;
        }

        for (int i = startIndex; i <= n - (k - path.size()) + 1; i++) {
            path.add(i);
            dfs(n, k, i + 1);
            path.remove(path.size() - 1);
        }
    }
}
```

### 216.组合总和III

```java
class Solution {

    private List<List<Integer>> ans = new ArrayList<>();

    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combinationSum3(int k, int n) { // k个，和为n // 组合只允许 1-9的正整数
        dfs(k, n, 1, 0);
        return ans;
    }

    private void dfs(int k, int n, int startIndex, int sum) {
        if (path.size() == k) {
            if (sum == n) {
                ans.add(new ArrayList<>(path));
            }
            return;
        }

        for (int i = startIndex; i <= 9; i++) {
            sum += i;
            path.add(i);
            dfs(k, n, i + 1, sum);
            sum -= i;
            path.remove(path.size() - 1);
        }
    }
}
```



### 17. 电话号码的字母组合

题目的状态树：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210712235154.png" alt="17. 电话号码的字母组合" style="zoom:50%;" />

方法一：

```java
class Solution {
    private List<String> ans = new ArrayList<>();
    private StringBuilder path = new StringBuilder();

    public List<String> letterCombinations(String digits) {
        if (digits == null || digits.isEmpty()) {
            return ans;
        }
        Map<Integer, String> map = new HashMap<>();
        map.put(0, "");
        map.put(1, "");
        map.put(2, "abc");
        map.put(3, "def");
        map.put(4, "ghi");
        map.put(5, "jkl");
        map.put(6, "mno");
        map.put(7, "pqrs");
        map.put(8, "tuv");
        map.put(9, "wxyz");
        dfs(digits, map, 0);
        return ans;
    }

    private void dfs(String digits, Map<Integer, String> map, int num) {
        if (num == digits.length()) {
            ans.add(path.toString());
            return;
        }

        String str = map.get(digits.charAt(num) - '0'); // 找出按键对应的字符
        for (int i = 0; i < str.length(); i++) {
            path.append(str.charAt(i));
            dfs(digits, map, num + 1);
            path.deleteCharAt(path.length() - 1);
        }
    }
}
```

方法二：

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

### 39. 组合总和

```java
class Solution {

    private List<List<Integer>> ans = new ArrayList<>();

    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates); // 先排序
        dfs(candidates, target, 0, 0);
        return ans;
    }

    private void dfs(int[] candidates, int target, int sum, int startIndex) {
        if (target == sum) {
            ans.add(new ArrayList<>(path));
            return;
        }
        // 从小的往大的遍历找
        for (int i = startIndex; i < candidates.length; i++) {
            if (sum + candidates[i] > target) { // 说明已经不用找了
                break;
            }
            path.add(candidates[i]);
            dfs(candidates, target, sum + candidates[i], i);
            path.remove(path.size() - 1);
        }
    }
}
```

###  40.组合总和II

和组合一一样的思路：

```java
class Solution {

    private List<List<Integer>> ans = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        dfs(candidates, target, 0, 0);
        return ans;
    }

    private void dfs(int[] candidates, int target, int sum, int startIndex) {
        if (sum == target) {
            ans.add(new ArrayList<>(path));
            return;
        }

        for (int i = startIndex; i < candidates.length; i++) {
            if (candidates[i] + sum > target) {
                break;
            }
            // 跳过同一树层使用过的元素
            if (i > startIndex && candidates[i] == candidates[i - 1]) {
                continue;
            }
            path.add(candidates[i]);
            dfs(candidates, target, candidates[i] + sum, i + 1);
            path.remove(path.size() - 1);
        }
    }
}
```

###  131.分割回文串

```java
class Solution {

    private List<List<String>> ans = new ArrayList<>();
    private List<String> path = new ArrayList<>();

    public List<List<String>> partition(String s) {
        if (s == null || s.isEmpty()) {
            return ans;
        }
        dfs(s);
        return ans;
    }

    private void dfs(String s) {
        if (s == null || s.isEmpty()) {
            ans.add(new ArrayList<>(path));
            return;
        }

        for (int i = 1; i <= s.length(); i++) {
            String temp = s.substring(0, i);
            if (!isPalinDrome(temp)) {
                continue;
            }
            path.add(temp);
            dfs(s.substring(i, s.length()));
            path.remove(path.size() - 1);
        }
    }

    private boolean isPalinDrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i <= j) {
            if (s.charAt(i) != s.charAt(j)) {
                return false;
            }
            i++;
            j--;
        }
        return true;
    }
}
```

###  78.子集

[力扣题目链接](https://leetcode.cn/problems/subsets/)

以求解[1,2,3]的子集为例，画出的树形图如下所示：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210711180106.png" alt="image.png" style="zoom: 50%;" />

```java
class Solution {

    private List<List<Integer>> ans = new ArrayList<>();

    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsets(int[] nums) {
        if (nums == null || nums.length == 0) {
            return ans;
        }
        dfs(nums, 0);
        return ans;
    }

    private void dfs(int[] nums, int startIndex) {
        ans.add(new ArrayList<>(path));
        if (startIndex >= nums.length) {
            return;
        }

        for (int i = startIndex; i < nums.length; i++) { // 取过的不能再取了
            path.add(nums[i]);
            dfs(nums, i + 1);
            path.remove(path.size() - 1);
        }
    }
}
```

### 90.子集II

[力扣题目链接](https://leetcode.cn/problems/subsets-ii/)

```java
class Solution {

    private List<List<Integer>> ans = new ArrayList<>();

    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsetsWithDup(int[] nums) {
        if (nums == null || nums.length == 0) {
            return ans;
        }
        Arrays.sort(nums);
        dfs(nums, 0);
        return ans;
    }

    private void dfs(int[] nums, int startIndex) {
        ans.add(new ArrayList<>(path));
        if (startIndex >= nums.length) {
            return;
        }

        for (int i = startIndex; i < nums.length; i++) {
            if (i > startIndex && nums[i] == nums[i - 1]) {
                continue;
            }
            path.add(nums[i]);
            dfs(nums, i + 1);
            path.remove(path.size() - 1);
        }
    }
}
```

### 491.递增子序列

[力扣题目链接](https://leetcode.cn/problems/non-decreasing-subsequences/)

```java
class Solution {


    private List<List<Integer>> ans = new ArrayList<>();

    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> findSubsequences(int[] nums) {
        if (nums == null || nums.length == 0) {
            return ans;
        }
        dfs(nums, 0);
        return ans;
    }


    private void dfs(int[] nums, int startIndex) {
        if (path.size() > 1) {
            ans.add(new ArrayList<>(path));
        }

        Set<Integer> set = new HashSet<>();
        for (int i = startIndex; i < nums.length; i++) {
            // 当前层已经用过的元素不能再用了
            if (set.contains(nums[i])) {
                continue;
            }
            // 当前元素必须要大于已经选择过的元素
            if (!path.isEmpty() && path.get(path.size() - 1) > nums[i]) {
                continue;
            }
            set.add(nums[i]);
            path.add(nums[i]);
            dfs(nums, i + 1);
            path.remove(path.size() - 1);
        }
    }
}
```

### 46.全排列

[力扣题目链接](https://leetcode.cn/problems/permutations/)

```java
class Solution {

    private List<List<Integer>> ans = new ArrayList<>();

    private List<Integer> path = new ArrayList<>();

    boolean[] used;

    public List<List<Integer>> permute(int[] nums) {
        if (nums == null || nums.length == 0) {
            return ans;
        }
        used = new boolean[nums.length + 1];
        dfs(nums);
        return ans;
    }

    private void dfs(int[] nums) {
        if (path.size() == nums.length) {
            ans.add(new ArrayList<>(path));
            return;
        }

        for (int i = 0; i < nums.length; i++) {
            if (used[i]) {
                continue;
            }
            used[i] = true;
            path.add(nums[i]);
            dfs(nums);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}
```

### 47.全排列 II

[力扣题目链接](https://leetcode.cn/problems/permutations-ii/)

```java
class Solution {

    private List<List<Integer>> ans = new ArrayList<>();

    private List<Integer> path = new ArrayList<>();

    boolean[] used;

    public List<List<Integer>> permuteUnique(int[] nums) {
        if (nums == null || nums.length == 0) {
            return ans;
        }
        used = new boolean[nums.length];
        Arrays.sort(nums);
        dfs(nums);
        return ans;
    }

    private void dfs(int[] nums) {
        if (path.size() == nums.length) {
            ans.add(new ArrayList<>(path));
        }

        for (int i = 0; i < nums.length; i++) {
            if (i > 0 && nums[i] == nums[i - 1] && used[i - 1] == false) {
                continue;
            }
            if (used[i] == false) {
                used[i] = true;
                path.add(nums[i]);
                dfs(nums);
                path.remove(path.size() - 1);
                used[i] = false;
            }
        }
    }
}
```

### 22. 括号生成

括号生成的状态树：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210712114808.png" alt="image.png" style="zoom:50%;" />

解法一：

```java
class Solution {

    private List<String> ans = new ArrayList<>();
    private int n;

    public List<String> generateParenthesis(int n) {
        if (n <= 0) {
            return ans;
        }
        this.n = n;
        dfs("", 0, 0);
        return ans;
    }
    
    private void dfs(String paths, int left, int right) {
        // 剪枝,去掉( > n 或 ) > n 或 ) > (的情况，由于传递性，) > n可以去掉
        if (left > n || right > left) {
            return;
        }
        // 因为括号都是成对出现的，因此需要遍历的树的深度为n*2
        if (paths.length() == n * 2) {
            ans.add(paths);
            // 回溯
            paths = "";
            return;
        }

        dfs(paths + "(", left + 1, right);
        dfs(paths + ")", left, right + 1);
    }
}
```

解法二：

```java
class Solution {
   StringBuffer path = new StringBuffer();
   List<String> res = new ArrayList<>();

   public List<String> generateParenthesis(int n) {
       backtracking(0, 0, n);
       return res;
   }

   void backtracking(int l, int r, int n) {
       if (l > n || l < r) { // 左边括号小于右边括号，一定不符合要求，其次括号超过n也不符合成对要求
           return;
       }
       if (path.length() == 2 * n) {
           res.add(path.toString());
       }
       for (int i = 0; i < 2; i++) { // 将括号看作大小为 2 的数组，求他们的有效组合，括号个数决定了树的深度
           if (i == 0) {
               path.append("(");
               backtracking(l + 1, r, n);
               path.deleteCharAt(path.length() - 1);
           }
           if (i == 1) {
               path.append(")");
               backtracking(l, r + 1, n);
               path.deleteCharAt(path.length() - 1);
           }
       }
   }
}
```



### 332.重新安排行程

[力扣题目链接](https://leetcode.cn/problems/reconstruct-itinerary/)

常规的回溯法，此题会超时：

```java
class Solution {

    private List<String> ans = new ArrayList<>();
    private List<String> path = new ArrayList<>();
    boolean[] used;

    /**
     * @param tickets [["MUC", "LHR"], ["JFK", "MUC"], ["SFO", "SJC"], ["LHR", "SFO"]]
     * @return 示例：["JFK", "MUC", "LHR", "SFO", "SJC"]
     */
    public List<String> findItinerary(List<List<String>> tickets) {
        used = new boolean[tickets.size()];
        Collections.sort(tickets, (a, b) -> a.get(1).compareTo(b.get(1)));
        path.add("JFK");
        dfs(tickets);
        return ans;
    }

    private boolean dfs(List<List<String>> tickets) {
        if (path.size() == tickets.size() + 1) { // 因为已经有一个 "JFK"了，所以最后的结果的长度是 tickets.size() + 1
            ans = new ArrayList<>(path);
            return true;
        }

        for (int i = 0; i < tickets.size(); i++) {
            if (used[i] || !tickets.get(i).get(0).equals(path.get(path.size() - 1))) {
                continue;
            }

            path.add(tickets.get(i).get(1));
            used[i] = true;
            if (dfs(tickets)) {
                return true;
            }
            used[i] = false;
            path.remove(path.size() - 1);
        }
        return false;
    }
}
```

解法二：

```java
class Solution {
    public List<String> findItinerary(List<List<String>> tickets) {
        Map<String, Queue<String>> adjLists = new HashMap<>();

        for (List<String> ticket : tickets) {
            String from = ticket.get(0);
            String to = ticket.get(1);
            if (!adjLists.containsKey(from)) {
                adjLists.put(from, new PriorityQueue<>());
            }
            adjLists.get(from).add(to);
        }

        List<String> ans = new ArrayList<>();
        dfs(adjLists, ans, "JFK");
        Collections.reverse(ans);
        return ans;
    }

    private void dfs(Map<String, Queue<String>> adjLists, List<String> ans, String curr) {
        Queue<String> neighbors = adjLists.get(curr);
        if (neighbors == null) {
            ans.add(curr);
            return;
        }
        while (!neighbors.isEmpty()) {
            String neighbor = neighbors.poll();
            dfs(adjLists, ans, neighbor);
        }
        ans.add(curr);
        return;
    }
}
```



### 212. 单词搜索 II

```java
class Trie {
    Trie[] children = new Trie[26];
    int ref = -1;

    public void insert(String w, int ref) {
        Trie node = this;
        for (int i = 0; i < w.length(); ++i) {
            int j = w.charAt(i) - 'a';
            if (node.children[j] == null) {
                node.children[j] = new Trie();
            }
            node = node.children[j];
        }
        node.ref = ref;
    }
}

class Solution {
    private char[][] board;
    private String[] words;
    private List<String> ans = new ArrayList<>();

    public List<String> findWords(char[][] board, String[] words) {
        this.board = board;
        this.words = words;
        Trie tree = new Trie();
        for (int i = 0; i < words.length; ++i) {
            tree.insert(words[i], i);
        }
        int m = board.length, n = board[0].length;
        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                dfs(tree, i, j);
            }
        }
        return ans;
    }

    private void dfs(Trie node, int i, int j) {
        int idx = board[i][j] - 'a';
        if (node.children[idx] == null) {
            return;
        }
        node = node.children[idx];
        if (node.ref != -1) {
            ans.add(words[node.ref]);
            node.ref = -1;
        }
        char c = board[i][j];
        board[i][j] = '#';
        int[] dirs = {-1, 0, 1, 0, -1};
        for (int k = 0; k < 4; ++k) {
            int x = i + dirs[k], y = j + dirs[k + 1];
            if (x >= 0 && x < board.length && y >= 0 && y < board[0].length && board[x][y] != '#') {
                dfs(node, x, y);
            }
        }
        board[i][j] = c;
    }
}
```



### 37. 解数独

[力扣题目链接](https://leetcode.cn/problems/sudoku-solver/)

```java
class Solution {
    private boolean ok;
    private char[][] board;
    private List<Integer> t = new ArrayList<>();
    private boolean[][] row = new boolean[9][9];
    private boolean[][] col = new boolean[9][9];
    private boolean[][][] block = new boolean[3][3][9];

    public void solveSudoku(char[][] board) {
        this.board = board;
        for (int i = 0; i < 9; ++i) {
            for (int j = 0; j < 9; ++j) {
                if (board[i][j] == '.') {
                    t.add(i * 9 + j);
                } else {
                    int v = board[i][j] - '1';
                    row[i][v] = col[j][v] = block[i / 3][j / 3][v] = true;
                }
            }
        }
        dfs(0);
    }

    private void dfs(int k) {
        if (k == t.size()) {
            ok = true;
            return;
        }
        int i = t.get(k) / 9, j = t.get(k) % 9;
        for (int v = 0; v < 9; ++v) {
            if (!row[i][v] && !col[j][v] && !block[i / 3][j / 3][v]) {
                row[i][v] = col[j][v] = block[i / 3][j / 3][v] = true;
                board[i][j] = (char) (v + '1');
                dfs(k + 1);
                row[i][v] = col[j][v] = block[i / 3][j / 3][v] = false;
            }
            if (ok) {
                return;
            }
        }
    }
}
```



### 51. N 皇后

```java
class Solution {
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
}
```



### 回溯问题总结

回溯的本质是递归。

## 贪心算法

### 455. 分发饼干

[力扣题目链接](https://leetcode-cn.com/problems/assign-cookies/)

使用贪心算法：

```java
class Solution {
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
}
```



### 121. 买卖股票的最佳时机

```java
class Solution {
    public int maxProfit(int[] prices) {
        int low = Integer.MAX_VALUE;
        int ans = Integer.MIN_VALUE;

        for (int i = 0; i < prices.length; i++) {
            low = Math.min(low, prices[i]);
            ans = Math.max(ans, prices[i] - low); // 计算和最低的间距即可
        }

        return ans;
    }
}
```

需要注意的是，本题中股票只买卖一次。

### 322. 零钱兑换

使用动态规划：

```java
class Solution {
    public int coinChange(int[] coins, int amount) {
        int max = Integer.MAX_VALUE;
        int[] dp = new int[amount + 1];
        //初始化dp数组为最大值
        for (int j = 0; j < dp.length; j++) {
            dp[j] = max;
        }
        //当金额为0时需要的硬币数目为0
        dp[0] = 0;
        for (int i = 0; i < coins.length; i++) {
            //正序遍历：完全背包每个硬币可以选择多次
            for (int j = coins[i]; j <= amount; j++) {
                //只有dp[j-coins[i]]不是初始最大值时，该位才有选择的必要
                if (dp[j - coins[i]] != max) {
                    //选择硬币数目最小的情况
                    dp[j] = Math.min(dp[j], dp[j - coins[i]] + 1);
                }
            }
        }
        return dp[amount] == max ? -1 : dp[amount];
    }
}
```

### 55. 跳跃游戏

使用贪心算法：

![image-20210719235247657](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210719235247.png)

此时0这个位置的下标是4，但是之前最大的可达步数是3，因为无法再进行跳跃。

```java
class Solution {  
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
}
```

### 45. 跳跃游戏 II

[力扣题目链接](https://leetcode.cn/problems/jump-game-ii)

```java
class Solution {
    public int jump(int[] nums) {
        // 跳跃的次数
        int ans = 0;
        // 跳跃起始位置
        int start = 0;
        // 基于当前位置跳跃后的位置
        int end = 1;
        while (end < nums.length) {
            int maxPosition = 0;
            for (int i = start; i < end; i++) {
                maxPosition = Math.max(maxPosition, nums[i] + i);
            }
            start = end;
            end = maxPosition + 1;
            ans++;
        }
        return ans;
    }
}
```

### 1005. K 次取反后最大化的数组和

[力扣题目链接](https://leetcode.cn/problems/maximize-sum-of-array-after-k-negations)

```java
class Solution {
    public int largestSumAfterKNegations(int[] nums, int k) {
        // 按照绝对值从大到小排序
        nums = IntStream.of(nums).boxed()
                .sorted((a, b) -> Integer.compare(Math.abs(b), Math.abs(a))).mapToInt(Integer::intValue).toArray();

        for (int i = 0; i < nums.length; i++) {
            if (nums[i] < 0 && k > 0) {
                nums[i] = -nums[i];
                k--;
            }
        }

        // 如果k还是大于0，且k是奇数，那么反转数值最小的元素
        if (k % 2 == 1) {
            nums[nums.length - 1] = -nums[nums.length - 1];
        }

        // 上面的代码等价于下面的代码，对同一个元素，不断变幻符号，
        // 如果k是偶数，最终符号和原来一样，如果k是奇数，则正号变负号，负号变正号
//        while (k-- > 0) {
//            nums[nums.length - 1] = -nums[nums.length - 1];
//        }
        
        int ans = 0;
        for (int num : nums) {
            ans += num;
        }
        return ans;
    }
}
```



### 738. 单调递增的数字

[力扣题目链接](https://leetcode.cn/problems/monotone-increasing-digits/)

```java
class Solution {
    public int monotoneIncreasingDigits(int n) {
        String s = String.valueOf(n);
        char[] chars = s.toCharArray();
        int start = s.length(); // 如果不需要重新赋值，第二次遍历赋值的操作就不用走了
        for (int i = s.length() - 1; i >= 1; i--) {
            if (chars[i -1] > chars[i]) { // 前一个元素大于当前元素，当前元素就需要被赋值为9，前一个元素减1
                chars[i -1]--;
                start = i;
            }
        }
        for (int i = start; i < s.length(); i++) {
            chars[i] = '9';
        }
        return Integer.parseInt(String.valueOf(chars));
    }
}
```

### 860. 柠檬水找零

[力扣题目链接](https://leetcode.cn/problems/lemonade-change/)

```java
class Solution {
    public boolean lemonadeChange(int[] bills) {
        int five = 0;
        int ten = 0;
        int twenty = 0;
        for (int bill : bills) {
            if (bill == 5) {
                five++;
            }
            if (bill == 10) {
                if (five <= 0) {
                    return false;
                }
                ten++;
                five--;
            }
            if (bill == 20) {
                twenty++;
                if (five > 0 & ten > 0) {
                    five--;
                    ten--;
                } else if (five >= 3) {
                    five = five - 3;
                } else {
                    return false;
                }
            }
        }
        return true;
    }
}
```

### 134. 加油站

[力扣题目链接](https://leetcode.cn/problems/gas-station)

方法一（会超时）：

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int n = gas.length;
        for (int i = 0; i < n; i++) {
            int j = i;
            int remain = gas[i];
            while (remain - cost[j] >= 0) {
                remain = remain - cost[j] + gas[(j + 1) % n];
                j = (j + 1) % n;
                if (j == i) {
                    return i;
                }
            }
        }
        return -1;
    }
}
```

方法二：

思路如下：

- 如果总的汽油量小于总的消耗量，那么无论从哪里出发都不可能绕环路一圈，返回 -1
- 如果总的汽油量大于或等于总的消耗量，那么一定存在一个起点能完成绕环路一圈的任务
- 通过贪心算法找到这个起点。从第一个加油站开始，如果当前加油站无法到达下一个加油站，则将起点设为下一个加油站，并重新计算

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        // 整个旅程中总的油量与总的消耗量的差值
        int totalTank = 0;
        // 当前起点到当前位置的油量与消耗值的差值
        int currTank = 0;
        // 当前假设的起点站
        int startStation = 0;

        for (int i = 0; i < gas.length; i++) {
            // 总的汽油量
            totalTank += gas[i] - cost[i];
            // 总的消耗量
            currTank += gas[i] - cost[i];

            // 当前汽油量小于0，说明无法从起点startStation到达这个点
            if (currTank < 0) {
                startStation = i + 1;
                currTank = 0;
            }
        }

        return totalTank >= 0 ? startStation : -1;
    }
}
```

### 376. 摆动序列

[力扣题目链接](https://leetcode.cn/problems/wiggle-subsequence)

方法一：

```java
class Solution {
    public int wiggleMaxLength(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }

        int ans = 1;
        Boolean isUp = null; // 记录当前摆动方向
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i - 1] && (isUp == null || !isUp)) {
                ans++;
                isUp = true;
            } else if (nums[i] < nums[i - 1] && (isUp == null || isUp)) {
                ans++;
                isUp = false;
            }
        }

        return ans;
    }
}
```

方法二：

```java
class Solution {
    public int wiggleMaxLength(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }
        int up = 1, down = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i - 1]) {
                up = Math.max(up, down + 1);
            } else if (nums[i] < nums[i - 1]) {
                down = Math.max(down, up + 1);
            }
        }

        return Math.max(up, down);
    }
}
```

### [135. 分发糖果](https://leetcode.cn/problems/candy)

[力扣题目链接](https://leetcode.cn/problems/candy)

```java
class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] nums = new int[n];
        nums[0] = 1;

        // 从左往右
        for (int i = 1; i < n; i++) {
            if (ratings[i] > ratings[i - 1]) {
                nums[i] = nums[i - 1] + 1;
            } else {
                nums[i] = 1;
            }
        }

        // 从右往左
        for (int i = n - 2; i >= 0; i--) {
            if (ratings[i] > ratings[i + 1]) {
                nums[i] = Math.max(nums[i], nums[i + 1] + 1);
            }
        }

        int ans = 0;
        for (int num : nums) {
            ans += num;
        }
        return ans;
    }
}
```

###  406.根据身高重建队列

[力扣题目链接](https://leetcode.cn/problems/queue-reconstruction-by-height/)

```java
class Solution {
    public int[][] reconstructQueue(int[][] people) {
        Arrays.sort(people, (a, b) -> a[0] == b[0] ? a[1] - b[1] : b[0] - a[0]);
        List<int[]> ans = new ArrayList<>(people.length);
        for (int[] p : people) {
            ans.add(p[1], p);
        }
        return ans.toArray(new int[ans.size()][]);
    }
}
```

### 452. 用最少数量的箭引爆气球

[力扣题目链接](https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons/)

```java
class Solution {
    public int findMinArrowShots(int[][] points) {
        Arrays.sort(points, (a, b) -> Integer.compare(a[0], b[0]));
        int ans = 1; // 至少需要一支箭
        for (int i = 1; i < points.length; i++) {
            if (points[i][0] > points[i - 1][1]) {
                ans++;
            } else {
                points[i][1] = Math.min(points[i][1], points[i - 1][1]);
            }
        }
        return ans;
    }
}
```



### 968.监控二叉树

[力扣题目链接](https://leetcode.cn/problems/binary-tree-cameras/)

```java
class Solution {
    private int ans;

    public int minCameraCover(TreeNode root) {
        ans = 0;
        if (minCamera(root) == 0) {
            ans++;
        }
        return ans;
    }

    /**
     * @param root
     * @return 返回值含义如下
     * 0:表示节点没有被相机监控，只能依靠父节点放相机
     * 1：表示节点被相机监控，但相机不是放在自身节点上
     * 2：表示节点被相机监控，但相机放在自身节点上
     */
    private int minCamera(TreeNode root) {
        if (root == null) {
            return 1; // 空树认为被监控，但没有相机
        }

        int l = minCamera(root.left);
        int r = minCamera(root.right);

        // 左右节点有任意一个节点为空，则需要当前节点放置相机
        if (l == 0 || r == 0) {
            ans++;
            return 2;
        }

        // 左右子树都被监控，且没有监控当前节点
        if (l == 1 && r == 1) {
            return 0;
        }

        // 剩下的情况就是左右子树有可能为2，即当前节点被监控
        return 1;
    }
}
```



## 动态规划

### 509. 斐波那契数

[力扣题目链接](https://leetcode-cn.com/problems/fibonacci-number/)

直接暴力递归的时间复杂度是O(2<sup>n</sup>)，因为需要优化，优化的思路大致分为两种，一种是记忆化搜索，一种是动态规划，使用记忆化搜索相当于剪枝，记忆化搜索的递归树：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210727102616.png" alt="image-20210727102609636" style="zoom: 67%;" />

代码：

```java
class Solution {
    public int fib(int n) {
        if (n < 2) {
            return n;
        }
        int[] dp = new int[n + 1];
        dp[0] = 0;
        dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }
}
```

状态转移方程为：`dp[i] = dp[i - 1] + dp[i - 2]`。

```java
class Solution {     
	public int fib(int n) {
        int[] dp = {0, 1};
        for (int i = 2; i < n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }
}
```

还可以进一步优化，实际上每次只需要存储最近的两个结果即可，按照这个思路，可以将空间复杂度优化到O(1)。

```java
class Solution {  
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
}
```



### 70. 爬楼梯 

[题目链接](https://leetcode-cn.com/problems/climbing-stairs/)

直接使用递归求接斐波那契数列：

```java
class Solution {    
	public int climbStairs(int n) {
        if (n == 1) {
            return 1;
        }
        if (n == 2) {
            return 2;
        }
        return climbStairs(n - 1) + climbStairs(n - 2);
    }
}
```

使用循环求解：

```java
class Solution {      
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
}
```

也可以直接dp求解：

```java
class Solution {  
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
}
```

### 1137. 第 N 个泰波那契数

[力扣题目链接](https://leetcode.cn/problems/n-th-tribonacci-number)

```java
class Solution {
    public int tribonacci(int n) {
        if (n == 0) return 0;
        if (n <= 2) return 1;

        int[] dp = new int[n + 1];
        dp[0] = 0;
        dp[1] = 1;
        dp[2] = 1;
        for (int i = 3; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3];
        }
        return dp[n];
    }
}
```



### 746. 使用最小花费爬楼梯

[力扣题目链接](https://leetcode.cn/problems/min-cost-climbing-stairs/)

```java
class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int n = cost.length;
        // dp[i] 到达第i台阶所花费的最少体力为dp[i]
        int[] dp = new int[n + 1];
        dp[0] = 0; // 前两步不花费，可以直接选择从0或者从1开始
        dp[1] = 0;
        for (int i = 2; i <= n; i++) {
            dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
        }
        return dp[n];
    }
}
```

### 62. 不同路径

[力扣题目链接](https://leetcode.cn/problems/unique-paths/)

递推公式：
$$
f(m,n) = f(m - 1, n) + f(m, n - 1)
$$
直接求解即可：

```java
class Solution {
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];

        for (int i = 0; i < m; i++) {
            dp[i][0] = 1;
        }

        for (int i = 0; i < n; i++) {
            dp[0][i] = 1;
        }

        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
        return dp[m - 1][n - 1];
    }
}
```

### 63. 不同路径 II

[力扣题目链接](https://leetcode.cn/problems/unique-paths-ii/)

```java
class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        int m = obstacleGrid.length;
        int n = obstacleGrid[0].length;

        int[][] dp = new int[m][n];

        for (int i = 0; i < m && obstacleGrid[i][0] == 0; i++) { // 注意初始化条件
            dp[i][0] = 1;
        }

        for (int i = 0; i < n && obstacleGrid[0][i] == 0; i++) {
            dp[0][i] = 1;
        }

        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (obstacleGrid[i][j] == 1) {
                    continue;
                }
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }

        return dp[m - 1][n - 1];
    }
}
```

### 343. 整数拆分

[力扣题目链接](https://leetcode.cn/problems/integer-break/)

```java
class Solution {
    public int integerBreak(int n) {
        int[] dp = new int[n + 1];
        if (n <= 3) {
            return n - 1;
        }
        dp[1] = 0;
        dp[2] = 1;
        dp[3] = 2;

        for (int i = 4; i <= n; i++) {
            dp[i] = i / 2 * (i - i / 2);
            for (int j = 1; j < i; j++) {
                dp[i] = Math.max(dp[i], j * dp[i - j]);
            }
        }
        return dp[n];
    }
}
```



### 96.不同的二叉搜索树

[力扣题目链接](https://leetcode.cn/problems/unique-binary-search-trees/)

```java
class Solution {
    public int numTrees(int n) {
        int[] f = new int[n + 1];
        f[0] = 1;
        for (int i = 1; i <= n; ++i) {
            for (int j = 0; j < i; ++j) {
                f[i] += f[j] * f[i - j - 1];
            }
        }
        return f[n];
    }
}
```



### 120. 三角形最小路径和

[力扣题目链接](https://leetcode-cn.com/problems/triangle/)

注意，本题要求每一步只能移动到下一行相邻的结点上，由此，递归方程为：
$$
f(i,j) = min \{f(i - 1, j),f(i-1, j-1) \} + c(i)(j)
$$
其中$c(i)(j)$表示位置$(i, j)$对应的元素值。

```java
class Solution {    
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
}
```



### 198. 打家劫舍

[力扣题目链接](https://leetcode.cn/problems/house-robber/)

假设一共有$n$个房子，每个房子的金额分别是$H_0,H_1,...H_{n-1}$，子问题$f(k)$表示从前$k$个房子（即$H_0，H_1,...,H_{k-1}$）中能偷盗的最大金额。那么偷$k$个房子有两种偷法：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/img/20210820105009.png" alt="image-20210820104524320" style="zoom:67%;" />

状态转移方程为：
$$
f(k)=max\{ {f(k-1),H_{k-1} + f(k-2)} \}
$$
使用一维数组的方式：

```java
class Solution {
    public int rob(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }
        if (nums.length == 1) {
            return nums[0];
        }
        int[] dp = new int[nums.length];
        dp[0] = nums[0];
        dp[1] = Math.max(nums[0], nums[1]);
        for (int i = 2; i < nums.length; i++) {
            dp[i] = Math.max(nums[i] + dp[i - 2], dp[i - 1]);
        }
        return dp[nums.length - 1];
    }
}
```

还可以多开一维数组来存每次偷或者不偷的状态：

```java
class Solution {    
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
}
```

### 213. 打家劫舍 II

[力扣题目链接](https://leetcode-cn.com/problems/house-robber-ii/)

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
class Solution {
    public int rob(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }
        if (nums.length == 1) {
            return nums[0];
        }

        return Math.max(robRange(nums, 0, nums.length - 2), robRange(nums, 1, nums.length - 1));
    }

    private int robRange(int[] nums, int start, int end) {
        if (start == end) {
            return nums[start];
        }
        int[] dp = new int[nums.length];
        dp[start] = nums[start];
        dp[start + 1] = Math.max(nums[start], nums[start + 1]);
        for (int i = start + 2; i <= end; i++) {
            dp[i] = Math.max(dp[i - 2] + nums[i], dp[i - 1]);
        }
        return dp[end];
    }
}
```

### 121. 买卖股票的最佳时机

除了可以使用贪心算法以外，还可以使用动态规划来解决这个问题。

```java
class Solution {
    public int maxProfit(int[] prices) {
        if (prices == null || prices.length == 0) {
            return 0;
        }
        int n = prices.length;
        // dp[i][0] 表示第i天持有股票所得最多现金
        // dp[i][1] 表示第i天不持有股票所得最多现金

        int[][] dp = new int[n][2];
        dp[0][0] = -prices[0];
        dp[0][1] = 0;

        for (int i = 1; i < n; i++) {
            dp[i][0] = Math.max(dp[i - 1][0], -prices[i]); // 保持现状或者买入
            dp[i][1] = Math.max(dp[i - 1][1], dp[i][0] + prices[i]); // 保持现状或者卖出
        }

        return dp[n - 1][1];
    }
}
```

### 122.买卖股票的最佳时机II

[力扣题目链接](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/)

```java
class Solution {
    public int maxProfit(int[] prices) {
        if (prices == null || prices.length == 0) {
            return 0;
        }

        int n = prices.length;
        // dp[i][0] 第i天持有
        // dp[i][1] 第i天不持有
        int[][] dp = new int[n][2];
        dp[0][0] = -prices[0];
        dp[0][1] = 0;
        for (int i = 1; i < n; i++) {
            dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] - prices[i]); // 前一天购入股票
            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i]); // 前一天卖出股票
        }

        return dp[n - 1][1];
    }
}
```

### 123.买卖股票的最佳时机III

[力扣题目链接](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iii/)

```java
class Solution {
    public int maxProfit(int[] prices) {
        if (prices == null || prices.length == 0) {
            return 0;
        }
        int n = prices.length;
        int[][] dp = new int[n][5];

        dp[0][1] = 0 - prices[0];
        dp[0][3] = 0 - prices[0];

        // 一天一共有五个状态
        // 没有操作 （其实我们也可以不设置这个状态）
        // 第一次持有股票
        // 第一次不持有股票
        // 第二次持有股票
        // 第二次不持有股票
        // dp[i][j]中 i表示第i天，j为 [0 - 4] 五个状态，dp[i][j]表示第i天状态j所剩最大现金。
        for (int i = 1; i < n; i++) { // i从1开始
            dp[i][0] = dp[i - 1][0];
            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] - prices[i]); // 第一次不持有股票 = Math.max(前一天不持有股票，前一天持有股票卖掉了)
            dp[i][2] = Math.max(dp[i - 1][2], dp[i - 1][1] + prices[i]);
            dp[i][3] = Math.max(dp[i - 1][3], dp[i - 1][2] - prices[i]);
            dp[i][4] = Math.max(dp[i - 1][4], dp[i - 1][3] + prices[i]);
        }

        return dp[n - 1][4];
    }
}
```

### 188.买卖股票的最佳时机IV

[力扣题目链接](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iv/)

```java
class Solution {
    public int maxProfit(int k, int[] prices) {
        if (prices == null || prices.length == 0) {
            return 0;
        }

        // k次交易=2k次操作
        // 第i天的状态为j，所剩下的最大现金是dp[i][j]
        // 使用二维数组 dp[i][j] ：第i天的状态为j，所剩下的最大现金是dp[i][j]
        // j的状态表示为：
        // 0 表示不操作
        // 1 第一次买入
        // 2 第一次卖出
        // 3 第二次买入
        // 4 第二次卖出
        // ....
        // 即状态为奇数的时候买入，状态为偶数的时候卖出
        int n = prices.length;
        int[][] dp = new int[n][2 * k + 1];

        // 奇数是买 为偶数是卖
        for (int j = 1; j < 2 * k; j += 2) {
            dp[0][j] = -prices[0];
        }

        for (int i = 1; i < n; i++) {
            for (int j = 0; j < 2 * k - 1; j += 2) { // 总共有 2*k步，每次确定第N次买入和卖出的值，所以循环的步长是2
                dp[i][j + 1] = Math.max(dp[i - 1][j + 1], dp[i - 1][j] - prices[i]); // 买入
                dp[i][j + 2] = Math.max(dp[i - 1][j + 2], dp[i - 1][j + 1] + prices[i]); // 卖出
            }
        }

        return dp[n - 1][k * 2];
    }
}
```

### 309.最佳买卖股票时机含冷冻期

[力扣题目链接](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-cooldown/)

```java
class Solution {
    public int maxProfit(int[] prices) {
        if (prices == null || prices.length == 0) {
            return 0;
        }
        int n = prices.length;
        int[][] dp = new int[n][4];
        // 0：持有
        // 1：不持有（保持卖出）
        // 2：今天卖出
        // 3：冷冻期
        dp[0][0] = -prices[0];
        for (int i = 1; i < n; i++) {
            dp[i][0] = Math.max(dp[i - 1][0], Math.max(dp[i - 1][3] - prices[i], dp[i - 1][1] - prices[i]));
            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][3]);
            dp[i][2] = dp[i - 1][0] + prices[i];
            dp[i][3] = dp[i - 1][2];
        }
        return Math.max(dp[n - 1][3], Math.max(dp[n - 1][1], dp[n - 1][2]));
    }
}
```

### 714.买卖股票的最佳时机含手续费

[力扣题目链接](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/)

```java
class Solution {
    public int maxProfit(int[] prices, int fee) {
        if (prices == null || prices.length == 0) {
            return 0;
        }
        int n = prices.length;
        int[][] dp = new int[n][2]; // 0：持有 1：不持有
        dp[0][0] = -prices[0];
        dp[0][1] = 0;
        for (int i = 1; i < n; i++) {
            dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] - prices[i]);
            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i] - fee);
        }
        return dp[n - 1][1];
    }
}
```



###  300.最长递增子序列

[力扣题目链接](https://leetcode.cn/problems/longest-increasing-subsequence/)

```java
class Solution {
    public int lengthOfLIS(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }
        // dp[i] 表示i之前包括i的以nums[i] 结尾的最长递增子序列的长度
        int[] dp = new int[nums.length];
        int res = 1;
        Arrays.fill(dp, 1); // 最短的长度也是1
        for (int i = 1; i < nums.length; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[i] > nums[j]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
                res = Math.max(res, dp[i]);
            }
        }
        return res;
    }
}
```

### 674. 最长连续递增序列

[力扣题目链接](https://leetcode.cn/problems/longest-continuous-increasing-subsequence/)

```java
class Solution {
    public int findLengthOfLCIS(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }
        int[] dp = new int[nums.length];
        int res = 1;
        Arrays.fill(dp, 1);
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > nums[i - 1]) {
                dp[i] = dp[i - 1] + 1;
            }
            res = Math.max(dp[i], res);
        }
        return res;
    }
}
```



### 718. 最长重复子数组

[力扣题目链接](https://leetcode.cn/problems/maximum-length-of-repeated-subarray/)

```java
class Solution {
    public int findLength(int[] nums1, int[] nums2) {
        // dp[i][j] ：以下标i - 1为结尾的A，和以下标j - 1为结尾的B，最长重复子数组长度为dp[i][j]。
        // 长度是length + 1的原因的 dp[0][0] 没法存，没有实际含义
        int[][] dp = new int[nums1.length + 1][nums2.length + 1];

        int result = 0;
        for (int i = 1; i < nums1.length + 1; i++) {
            for (int j = 1; j < nums2.length + 1; j++) {
                if (nums1[i - 1] == nums2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                }
                result = Math.max(dp[i][j], result);
            }
        }
        return result;
    }
}
```



### 1143. 最长公共子序列

[力扣题目链接](https://leetcode-cn.com/problems/longest-common-subsequence/)

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
class Solution {  
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
}
```

### 1035.不相交的线

[力扣题目链接](https://leetcode.cn/problems/uncrossed-lines/)

```java
class Solution {
    public int maxUncrossedLines(int[] nums1, int[] nums2) {
        // 直线不能相交，这就是说明在字符串A中 找到一个与字符串B相同的子序列，且这个子序列不能改变相对顺序，只要相对顺序不改变，链接相同数字的直线就不会相交。
        int[][] dp = new int[nums1.length + 1][nums2.length + 1];

        for (int i = 1; i < nums1.length + 1; i++) {
            for (int j = 1; j < nums2.length + 1; j++) {
                if (nums1[i - 1] == nums2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[nums1.length][nums2.length];
    }
}
```



### 53. 最大子序和

[力扣题目链接](https://leetcode.cn/problems/maximum-subarray/)

不难写出，这个问题的状态转移方程：
$$
f(i) = max\{f(i - 1) + nums[i],num[i]\}
$$
使用数组来保存 $f(i)$ 的值，遍历求出所有的 $f(i)$ 即可：

```java
class Solution {
    public int maxSubArray(int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }

        int n = nums.length;
        int res = nums[0];

        int[] dp = new int[n];
        dp[0] = nums[0];

        for (int i = 1; i < nums.length; i++) {
            dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);
            res = Math.max(res, dp[i]);
        }
        return res;
    }
}
```

实际上我们无需记录所有的中间状态，只需要记录前一个值即可：

```java
class Solution {
    public int maxSubArray(int[] nums) {
        int pre = 0, maxAns = nums[0];
        for (int x : nums) {
            pre = Math.max(pre + x, x);
            maxAns = Math.max(maxAns, pre);
        }
        return maxAns;
    }
}
```



### 392.判断子序列

[力扣题目链接](https://leetcode.cn/problems/is-subsequence/)

```java
class Solution {
    public boolean isSubsequence(String s, String t) {
        int n = s.length();
        int m = t.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 1; i < n + 1; i++) {
            for (int j = 1; j < m + 1; j++) {
                if (s.charAt(i - 1) == t.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return s.length() == dp[n][m];
    }
}
```

### 115.不同的子序列

[力扣题目链接](https://leetcode.cn/problems/distinct-subsequences/)

题目大意：求s里面有多少个t。

```java
class Solution {
    
    public int numDistinct(String s, String t) {
        if (s.length() < t.length()) {
            return 0;
        }

        // dp[i][j]：以i-1为结尾的s子序列中出现以j-1为结尾的t的个数为dp[i][j]。
        int[][] dp = new int[s.length() + 1][t.length() + 1];

        // 由于空字符串是任何字符串的子序列
        for (int i = 0; i < s.length(); i++) {
            dp[i][0] = 1;
        }

        // dp[i - 1][j - 1] 表示s[i - 1] 去匹配t[j] 得到的个数
        // dp[i - 1][j] 表示s[i] 去匹配t[j]得到的个数
        for (int i = 1; i < s.length() + 1; i++) {
            for (int j = 1; j < t.length() + 1; j++) {
                if (s.charAt(i - 1) == t.charAt(j - 1)) {
                    // 相等有两部分构成 s[i]匹配的结果 + s[i - 1]匹配的结构
                    dp[i][j] = dp[i - 1][j] + dp[i - 1][j - 1];
                } else {
                    // 不相等 只考虑s[i]匹配的结果
                    dp[i][j] = dp[i - 1][j];
                }
            }
        }
        return dp[s.length()][t.length()];
    }
}
```



###  583. 两个字符串的删除操作

[力扣题目链接](https://leetcode.cn/problems/delete-operation-for-two-strings/)

```java
class Solution {
    public int minDistance(String word1, String word2) {
        // dp[i][j]：以i-1为结尾的字符串word1，和以j-1位结尾的字符串word2，想要达到相等，所需要删除元素的最少次数。
        int n = word1.length();
        int m = word2.length();
        int dp[][] = new int[n + 1][m + 1];
        // 初始化
        for (int i = 0; i <= n; i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= m; j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i < n + 1; i++) {
            for (int j = 1; j < m + 1; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(dp[i - 1][j - 1] + 2, Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1));
                }
            }
        }

        return dp[n][m];
    }
}
```



### 72. 编辑距离

[力扣题目链接](https://leetcode.cn/problems/edit-distance/)

```java
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        int[][] f = new int[m + 1][n + 1];
        for (int j = 1; j <= n; ++j) {
            f[0][j] = j;
        }
        for (int i = 1; i <= m; ++i) {
            f[i][0] = i;
            for (int j = 1; j <= n; ++j) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    f[i][j] = f[i - 1][j - 1];
                } else {
                    f[i][j] = Math.min(f[i - 1][j], Math.min(f[i][j - 1], f[i - 1][j - 1])) + 1;
                }
            }
        }
        return f[m][n];
    }
}
```



###  647. 回文子串

[力扣题目链接](https://leetcode.cn/problems/palindromic-substrings/)

```javascript
class Solution {
    public int countSubstrings(String s) {
        if (s == null || s.length() == 0) {
            return 0;
        }
        int ans = 0;
        int n = s.length();
        boolean[][] dp = new boolean[n][n];
        for (int i = n - 1; i >= 0; i--) {
            for (int j = i; j < n; j++) {
                if (s.charAt(i) == s.charAt(j)) {
                    if (j - i <= 1) {
                        dp[i][j] = true;
                        ans++;
                    } else if (dp[i + 1][j - 1]) {
                        dp[i][j] = true;
                        ans++;
                    }
                }
            }
        }

        return ans;
    }
}
```



### 409. 最长回文串

[力扣题目链接](https://leetcode-cn.com/problems/longest-palindrome/)

```java
class Solution {
    public int longestPalindrome(String s) {
        int[] cnt = new int[128];
        int n = s.length();
        for (int i = 0; i < n; ++i) {
            ++cnt[s.charAt(i)];
        }
        int ans = 0;
        for (int v : cnt) {
            ans += v / 2 * 2;
        }
        ans += ans < n ? 1 : 0;
        return ans;
    }
}
```



### 5. 最长回文子串

 [力扣题目链接](https://leetcode-cn.com/problems/longest-palindromic-substring/)

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
class Solution {    
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
}
```



### 516.最长回文子序列

[力扣题目链接](https://leetcode.cn/problems/longest-palindromic-subsequence/)

```java
class Solution {
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        // dp[i][j] 字符串s在[i,j]范围内最长的回文子序列的长度为dp[i][j]
        int[][] dp = new int[n + 1][n + 1];

        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++) {
                if (s.charAt(i) == s.charAt(j)) {
                    dp[i][j] = dp[i + 1][j - 1] + 2;
                } else {
                    dp[i][j] = Math.max(dp[i + 1][j], Math.max(dp[i][j], dp[i][j - 1]));
                }
            }
        }

        return dp[0][n - 1];
    }
}
```



### 动态规划问题总结



## 图论

### 200. 岛屿数量

[力扣题目链接](https://leetcode-cn.com/problems/number-of-islands/)

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

### 994.腐烂的橘子

[力扣题目链接](https://leetcode.cn/problems/rotting-oranges/)

```java
class Solution {
    public int orangesRotting(int[][] grid) {
        int m = grid.length;
        int n = grid[0].length;
        // 用来记录已经访问过的橘子
        int[][] visited = grid;
        Queue<int[]> q = new LinkedList<>();
        int freshOrange = 0;

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (visited[i][j] == 2) {
                    q.offer(new int[]{i, j});
                }
                if (visited[i][j] == 1) {
                    freshOrange++;
                }
            }
        }

        // 处理边界
        if (freshOrange == 0) {
            return 0;
        }
        if (q.isEmpty()) {
            return -1;
        }

        int minutes = -1;
        // 表示四个可能的方向：上、下、左、右
        int[][] dirs = {{1, 0}, {-1, 0}, {0, -1}, {0, 1}};
        // BFS遍历
        while (!q.isEmpty()) {
            int size = q.size();
            while (size-- > 0) {
                int[] cell = q.poll();
                int x = cell[0]; // 腐烂的橘子的横坐标
                int y = cell[1]; // 腐烂的橘子的纵坐标
                // 对每个腐烂的橘子的四个方向检查，如果是新鲜橘子，则将其腐烂并加入队列，同时更新新鲜橘子计数
                for (int[] dir : dirs) {
                    int i = x + dir[0];
                    int j = y + dir[1];
                    if (i >= 0 && i < m && j >= 0 && j < n && visited[i][j] == 1) {
                        visited[i][j] = 2;
                        freshOrange--;
                        q.offer(new int[]{i, j});
                    }
                }
            }
            minutes++;
        }

        return freshOrange == 0 ? minutes : -1;
    }
}
```

### 207. 课程表

[力扣题目链接](https://leetcode.cn/problems/course-schedule)

```java
class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // 使用邻接表存储图的结构，方便快速访问每个课程的后续课程
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) {
            graph.add(new ArrayList<>());
        }
        // 保存每个课程的入度（有多少课程依赖于该课程）
        int[] inDegree = new int[numCourses];
        // eg: [[1,0], [0,1]]
        for (int[] pair : prerequisites) {
            graph.get(pair[1]).add(pair[0]);
            inDegree[pair[0]]++;
        }
        Queue<Integer> queue = new LinkedList<>();
        // 将所有入度为0的课程加入队列，这些课程没有任何先修课程
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) {
                queue.offer(i);
            }
        }
        // 处理队列中的课程
        int count = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            count++;
            List<Integer> courseList = graph.get(course);
            for (Integer neighbor : courseList) {
                inDegree[neighbor]--;
                // 如果某个后续课程的入度变为0，说明它所有的先修课程都已经处理完毕，将其加入队列
                if (inDegree[neighbor] == 0) {
                    queue.offer(neighbor);
                }
            }
        }

        return count == numCourses;
    }
}
```



## 数学

### 172. 阶乘后的零

题目实际上是求 [1, n] 中有多少个5的因数。

[力扣题目链接](https://leetcode.cn/problems/factorial-trailing-zeroes)

```java
class Solution {
    public int trailingZeroes(int n) {
        int ans = 0;
        while (n > 0) {
            n = n / 5;
            ans += n;
        }
        return ans;
    }
}
```

### 66. 加一

[力扣题目链接](https://leetcode.cn/problems/plus-one)

```java
class Solution {
    public int[] plusOne(int[] digits) {
        for (int i = digits.length - 1; i >= 0; i--) {
            digits[i]++;
            digits[i] = digits[i] % 10;
            if(digits[i] != 0) return digits;
        }
        int[] res = new int[digits.length + 1];
        res[0] = 1;
        return res;
    }
}
```

### [169. 多数元素](https://leetcode.cn/problems/majority-element)

[力扣题目链接](https://leetcode.cn/problems/majority-element)

摩尔投票法：

```java
class Solution {
    public int majorityElement(int[] nums) {
        int major = 0;
        int count = 0;
        for (int i = 0; i < nums.length; i++) {
            if (count == 0) {
                major = nums[i];
            }
            if (major == nums[i]) {
                count++;
            } else {
                count--;
            }
        }
        return major;
    }
}
```

哈希表：

```java
class Solution {
    public int majorityElement(int[] nums) {
        int n = nums.length;
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            map.put(num, map.getOrDefault(num, 0) + 1);
        }
        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            Integer count = entry.getValue();
            if (2 * count >= n) {
                return entry.getKey();
            }
        }
        throw new RuntimeException("not found number");
    }
}
```



### 50. Pow(x, n)

[力扣题目链接](https://leetcode-cn.com/problems/powx-n/)

使用暴力解法：

```java
class Solution {    
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
}
```

通过观察不难发现，对于f(n) = x<sup>n</sup>（x为常数）都有f(n) = f(n/2)* f(n/2)，因此可以通过分治的方式来处理：

```java
class Solution { 
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
}
```

### 69. x 的平方根

[力扣题目链接](https://leetcode-cn.com/problems/sqrtx/)

使用二分查找：

````java
class Solution {
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
}
````

另外，解决此类问题也可以使用平方根法。

### 35. 搜索插入位置

[力扣题目链接](https://leetcode.cn/problems/search-insert-position/)

```java
class Solution {
    public int searchInsert(int[] nums, int target) {
        int left = 0, right = nums.length - 1, ans = -1;
        while (left <= right) {
            int mid = (right - left) / 2 + left;
            if (nums[mid] == target) {
                ans = mid;
                return ans;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
            ans = left;
        }
        return ans;
    }
}
```



### 367. 有效的完全平方数

[力扣题目链接](https://leetcode-cn.com/problems/valid-perfect-square/)

```java
class Solution {    
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
}
```

### 162. 寻找峰值

[力扣题目链接](https://leetcode.cn/problems/find-peak-element)

不是有序序列也可以使用二分查找：

```java
class Solution {
    public int findPeakElement(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = (left + right) / 2;
            if (nums[mid] > nums[mid + 1]) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left; // return right 也可以
    }
}
```



### 414. 第三大的数

[力扣题目链接](https://leetcode-cn.com/problems/third-maximum-number/)

解法一：

```java
class Solution {     
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
}
```

解法二：

```java
class Solution {
    public int thirdMax(int[] nums) {
        long firstMax = Long.MIN_VALUE, secondMax = Long.MIN_VALUE, thirdMax = Long.MIN_VALUE; // 必须用long类型
        for (int num : nums) {
            if (num > firstMax) {
                thirdMax = secondMax;
                secondMax = firstMax;
                firstMax = num;
            } else if (num < firstMax && num > secondMax) {
                thirdMax = secondMax;
                secondMax = num;
            } else if (num < secondMax && num > thirdMax) {
                thirdMax = num;
            }
        }
        return thirdMax == Long.MIN_VALUE ? (int) firstMax : (int) thirdMax;
    }
}
```

解法三：

```java
class Solution {
    public int thirdMax(int[] nums) {
        Set<Integer> set = new HashSet<>();
        // 维护一个堆
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int num : nums) {
            if (set.contains(num)) { // 避免重复计算
                continue;
            }
            pq.add(num);
            if (pq.size() > 3) { // 如果堆的大小超过3，移除堆顶元素（最小元素）
                pq.poll();
            }
            set.add(num);
        }
        // 如果堆的大小小于3，说明没有第三大的元素，返回最大的元素
        if (pq.size() < 3) {
            while (pq.size() > 1) { // 移除直到堆中只剩下最大的元素
                pq.poll();
            }
        }
        return pq.peek(); // 返回堆顶元素，即第三大的数或最大的数
    }
}
```

### 215.数组中的第K个最大元素

[力扣题目链接](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

解法一：

```java
class Solution {
    public int findKthLargest(int[] nums, int k) {
        Arrays.sort(nums);
        return nums[nums.length - k];
    }
}
```

解法二：

```java
class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int num : nums) {
            pq.add(num);
            if (pq.size() > k) {
                pq.poll();
            }
        }
        return pq.peek();
    }
}
```

### 12. 整数转罗马数字

[力扣题目链接](https://leetcode.cn/problems/integer-to-roman)

```java
class Solution {

    /**
     * 数字和罗马数字对应数组
     */
    private static final int[] VALUES = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    private static final String[] ROMAN_NUMERALS = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};

    public String intToRoman(int num) {
        StringBuilder ans = new StringBuilder();
        for (int i = 0; i < VALUES.length; i++) {
            while (num >= VALUES[i]) {
                num -= VALUES[i];
                ans.append(ROMAN_NUMERALS[i]);
            }
        }
        return ans.toString();
    }
}
```

### 13. 罗马数字转整数

[力扣题目链接](https://leetcode.cn/problems/roman-to-integer)

```java
class Solution {

    private static final Map<Character, Integer> map = new HashMap<>();

    static {
        map.put('I', 1);
        map.put('V', 5);
        map.put('X', 10);
        map.put('L', 50);
        map.put('C', 100);
        map.put('D', 500);
        map.put('M', 1000);
    }

    public int romanToInt(String s) {
        int ans = map.get(s.charAt(s.length() - 1));
        for (int i = s.length() - 2; i >= 0; i--) {
            Integer value = map.get(s.charAt(i));
            if (value < map.get(s.charAt(i + 1))) {
                ans -= value;
            } else {
                ans += value;
            }
        }
        return ans;
    }
}
```

### 190. 颠倒二进制位

[力扣题目链接](https://leetcode.cn/problems/reverse-bits/)

```java
public class Solution {
    public int reverseBits(int n) {
        // 将指定的32位整数的二进制位进行反转
        return Integer.reverse(n);
    }
}
```

### 191. 位1的个数

[力扣题目链接](https://leetcode.cn/problems/number-of-1-bits/)

解法一：

```java
public class Solution {
    public int hammingWeight(int n) {
        String str = Integer.toBinaryString(n);
        int ans = 0;
        for (int i = 0; i < str.length(); i++) {
            if (str.charAt(i) == '1') {
                ans++;
            }
        }
        return ans;
    }
}
```

解法二：

```java
public class Solution {
    public int hammingWeight(int n) {
        return Integer.bitCount(n);
    }
}
```



### 67. 二进制求和

[力扣题目链接](https://leetcode.cn/problems/add-binary/)

```java
class Solution {
    public String addBinary(String a, String b) {
        StringBuilder ans = new StringBuilder();
        int ca = 0;
        for (int i = a.length() - 1, j = b.length() - 1; i >= 0 || j >= 0; i--, j--) {
            // 上一次的进位
            int sum = ca;
            // 没有的话，需要用 0 占位
            // a.charAt(i) - '0' 等价于 Integer.parseInt(String.valueOf(a.charAt(i)))
            sum += i >= 0 ? a.charAt(i) - '0' : 0;
            sum += j >= 0 ? b.charAt(j) - '0' : 0;
            ans.append(sum % 2);
            ca = sum / 2;
        }

        // 最后看还有没有进位的
        ans.append(ca == 1 ? ca : "");
        return ans.reverse().toString();
    }
}
```

### 201. 数字范围按位与

[力扣题目链接](https://leetcode.cn/problems/bitwise-and-of-numbers-range/)

直接按位与会超时：

```java
class Solution {
    public int rangeBitwiseAnd(int left, int right) {
        int ans = left;
        for (int i = left + 1; i <= right; i++) {
            ans &= i;
        }
        return ans;
    }
}
```

需要将题目转化为求数字的公共二进制前缀。

按位与操作的一个特性是：只要有一个位置上存在0，结果的那个位置上就一定是0。所以从m到n之间的所有数字进行按位与，某些位上的值最终可能会变为0。

找到m和n共有的前缀部分，因为这些部分在整个范围内是不变的，而不同的后缀部分一定会变成0：

- 不断右移m和n，直到它们相等，这个相等的部分就是公共前缀
- 把公共前缀再左移回原来的位置（根据右移的次数）

```java
class Solution {
    public int rangeBitwiseAnd(int left, int right) {
        int shift = 0;
        // 找到公共前缀
        while (left < right) {
            left >>= 1;
            right >>= 1;
            shift++;
        }
        // 将公共前缀左移回原来的位置
        return left << shift;
    }
}
```

### 34. 在排序数组中查找元素的第一个和最后一个位置

[力扣题目链接](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array)

解法一：53

```java
class Solution {
    public int[] searchRange(int[] nums, int target) {
        int[] res = new int[2];
        int first = findFirst(nums, target);
        int last = findList(nums, target);
        res[0] = first;51
        res[1] = last;
        return res;
    }

    private int findFirst(int[] nums, int target) {
        int result = -1;
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] < target) {
                left = mid + 1;
            } else if (nums[mid] > target) {
                right = mid - 1;
            } else {
                result = mid;
                right = mid - 1; // 找到一个了，继续往左边搜索，直到搜索到第一个
            }
        }
        return result;
    }

    private int findList(int[] nums, int target) {
        int result = -1;
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] < target) {
                left = mid + 1;
            } else if (nums[mid] > target) {
                right = mid - 1;
            } else {
                result = mid;
                left = mid + 1; // 找到一个了，继续往右边搜索，直到搜索到最后一个
            }
        }
        return result;
    }
}
```

解法二：

```java
class Solution {
    public int[] searchRange(int[] nums, int target) {
        int[] ans = new int[2];
        int l = search(nums, target);
        int r = search(nums, target + 1);
        return l == r ? new int[]{-1, -1} : new int[]{l, r - 1};
    }

    private int search(int[] nums, int target) {
        int left = 0, right = nums.length;
        while (left < right) {
            int mid = (left + right) >>> 1;
            if (nums[mid] >= target) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }
}
```

### 153. 寻找旋转排序数组中的最小值

[力扣题目链接](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array)

```java
class Solution {
    public int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = (left + right) >>> 1;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];
    }
}
```

## 矩阵

### 73. 矩阵置零

[力扣题目链接](https://leetcode.cn/problems/set-matrix-zeroes/)

```java
class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length;
        int n = matrix[0].length;
        int[][] matrix2 = new int[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                matrix2[i][j] = matrix[i][j];
            }
        }

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 0) {
                    for (int k = 0; k < m; k++) {
                        matrix2[k][j] = 0;
                    }
                    for (int k = 0; k < n; k++) {
                        matrix2[i][k] = 0;
                    }
                }
            }
        }

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                matrix[i][j] = matrix2[i][j];
            }
        }
    }
}
```



### 74. 搜索二维矩阵

[力扣题目链接](https://leetcode-cn.com/problems/search-a-2d-matrix/)

将矩阵每一行拼接在上一行的末尾，则会得到一个升序数组，我们可以在该数组上二分找到目标元素，可以二分升序数组的下标，将其映射到原矩阵的行和列上：

```java
class Solution { 
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
}
```

### 59.螺旋矩阵II

[力扣题目链接](https://leetcode.cn/problems/spiral-matrix-ii/)

```java
class Solution {
    public int[][] generateMatrix(int n) {
        int l = 0, r = n - 1, t = 0, b = n - 1;
        int[][] result = new int[n][n];
        int num = 1, tar = n * n;

        while (num <= tar) {
            // 从左到右
            for (int i = l; i <= r; i++) {
                result[t][i] = num++;
            }
            t++;

            // 从上到下
            for (int i = t; i <= b; i++) {
                result[i][r] = num++;
            }
            r--;

            // 从右到左
            for (int i = r; i >= l; i--) {
                result[b][i] = num++;
            }
            b--;

            // 从下到上
            for (int i = b; i >= t; i--) {
                result[i][l] = num++;
            }
            l++;
        }

        return result;
    }
}
```

## 其他

### 380. O(1) 时间插入、删除和获取随机元素

[力扣题目链接](https://leetcode.cn/problems/insert-delete-getrandom-o1)

```java
class RandomizedSet {

    List<Integer> randomSet;

    Random random = new Random();

    public RandomizedSet() {
        randomSet = new LinkedList<>();
    }

    public boolean insert(int val) {
        if (randomSet.contains(val)) {
            return false;
        }
        return randomSet.add(val);
    }

    public boolean remove(int val) {
        if (randomSet.contains(val)) {
            return randomSet.remove(Integer.valueOf(val));
        }
        return false;
    }

    public int getRandom() {
        int i = random.nextInt(randomSet.size());
        return randomSet.get(i);
    }
}
```



## 附录

### 常用站点

- [代码随想录](https://programmercarl.com/0530.%E4%BA%8C%E5%8F%89%E6%90%9C%E7%B4%A2%E6%A0%91%E7%9A%84%E6%9C%80%E5%B0%8F%E7%BB%9D%E5%AF%B9%E5%B7%AE.html)
- [labuladong的算法笔记](https://labuladong.github.io/algo/)
- [leetcode题解](https://doocs.github.io/leetcode/)
- [geeksforgeeks](https://www.geeksforgeeks.org/)
- [codeTop](https://codetop.cc)

### TOP 题目

#### 数组和字符串

1. Two Sum - LeetCode 1
2. Best Time to Buy and Sell Stock - LeetCode 121
3. Contains Duplicate - LeetCode 217
4. Product of Array Except Self - LeetCode 238
5. Maximum Subarray - LeetCode 53
6. Merge Intervals - LeetCode 56
7. Valid Anagram - LeetCode 242
8. Group Anagrams - LeetCode 49
9. Longest Substring Without Repeating Characters - LeetCode 3
10. Longest Palindromic Substring - LeetCode 5

#### 链表

1. Reverse Linked List - LeetCode 206
2. Merge Two Sorted Lists - LeetCode 21
3. Linked List Cycle - LeetCode 141
4. Remove Nth Node From End of List - LeetCode 19
5. Reorder List - LeetCode 143
6. Merge k Sorted Lists - LeetCode 23
7. Palindrome Linked List - LeetCode 234
8. Copy List with Random Pointer - LeetCode 138

#### 栈和队列

1. Valid Parentheses - LeetCode 20
2. Min Stack - LeetCode 155
3. Implement Queue using Stacks - LeetCode 232
4. Generate Parentheses - LeetCode 22
5. Daily Temperatures - LeetCode 739
6. Next Greater Element I - LeetCode 496

#### 树和图

1. Maximum Depth of Binary Tree - LeetCode 104
2. Invert Binary Tree - LeetCode 226
3. Validate Binary Search Tree - LeetCode 98
4. Binary Tree Level Order Traversal - LeetCode 102
5. Serialize and Deserialize Binary Tree - LeetCode 297
6. Lowest Common Ancestor of a Binary Search Tree - LeetCode 235
7. Number of Islands - LeetCode 200
8. Clone Graph - LeetCode 133

#### 排序和搜索

1. Merge Sorted Array - LeetCode 88
2. Search in Rotated Sorted Array - LeetCode 33
3. Find Minimum in Rotated Sorted Array - LeetCode 153
4. Kth Largest Element in an Array - LeetCode 215
5. Top K Frequent Elements - LeetCode 347

#### 动态规划

1. Climbing Stairs - LeetCode 70
2. Coin Change - LeetCode 322
3. Longest Increasing Subsequence - LeetCode 300
4. House Robber - LeetCode 198
5. House Robber II - LeetCode 213
6. Unique Paths - LeetCode 62
7. Longest Palindromic Subsequence - LeetCode 516
8. Word Break - LeetCode 139

#### 哈希表

1. Two Sum - LeetCode 1
2. Happy Number - LeetCode 202
3. Valid Sudoku - LeetCode 36
4. Intersection of Two Arrays II - LeetCode 350
5. 4Sum - LeetCode 18

#### 其他重要题目

1. LRU Cache - LeetCode 146
2. Trapping Rain Water - LeetCode 42
3. Median of Two Sorted Arrays - LeetCode 4
4. Longest Consecutive Sequence - LeetCode 128

#### 常见高频面试题

1. Implement Trie (Prefix Tree) - LeetCode 208
2. Word Search - LeetCode 79
3. Surrounded Regions - LeetCode 130
4. Course Schedule - LeetCode 207
5. Graph Valid Tree - LeetCode 261
6. Reconstruct Itinerary - LeetCode 332
7. Binary Tree Maximum Path Sum - LeetCode 124
8. Word Ladder - LeetCode 127
9. Longest Valid Parentheses - LeetCode 32
10. Edit Distance - LeetCode 72
