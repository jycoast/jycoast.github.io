---
title: Jvm层面的管程实现-synchronized
---

### synchronized 与管程

#### ObjectMonitor

JVM 在底层通过 **monitorenter** 和 **monitorexit** 指令实现 synchronized 的同步机制。这些指令操作对象的监视器。下面是原理的简化和对应的伪代码解释：

- 当线程进入 synchronized (object) 时：
  1. 执行 monitorenter 指令，尝试获取 object 的监视器。
  2. 如果监视器未被占用，线程成功获取并进入代码块。
  3. 如果监视器已被其他线程持有，当前线程阻塞等待。
- 当线程离开 synchronized 块时：
  1. 执行 monitorexit 指令，释放 object 的监视器。
  2. 其他等待的线程可以竞争获取监视器。

监视器的C++代码：

```c++
class ObjectMonitor {
private:
    volatile intptr_t _header;         // 对象头的 Mark Word
    void* _object;                     // 指向被锁的 Java 对象
    pthread_mutex_t _mutex;            // 互斥锁，用于保护监视器
    pthread_cond_t _cond;              // 条件变量，用于线程等待和唤醒
    Thread* _owner;                    // 当前持有锁的线程
    ObjectWaiter* _waiters;            // 等待队列（等待锁的线程）
    int _recursions;                   // 重入次数（支持锁重入）

public:
    ObjectMonitor() {
        _header = 0;
        _object = nullptr;
        _owner = nullptr;
        _waiters = nullptr;
        _recursions = 0;
        pthread_mutex_init(&_mutex, nullptr);
        pthread_cond_init(&_cond, nullptr);
    }

    ~ObjectMonitor() {
        pthread_mutex_destroy(&_mutex);
        pthread_cond_destroy(&_cond);
    }

    void enter(Thread* self);          // 进入监视器（获取锁）
    void exit(Thread* self);           // 退出监视器（释放锁）
    void wait(Thread* self);           // 等待
    void notify(Thread* self);         // 通知一个等待线程
    void notifyAll(Thread* self);      // 通知所有等待线程
};
```

地址：https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/runtime/objectMonitor.hpp

搜索：   _EntryList    = NULL ;

**字段说明**：

- _mutex：互斥锁，确保同一时刻只有一个线程操作监视器。
- _cond：条件变量，用于实现 wait() 和 notify() 的等待/唤醒机制。
- _owner：记录当前持有锁的线程。
- _recursions：支持锁的可重入性（同一个线程可以多次获取锁）。
- _waiters：等待队列，存储因锁竞争而阻塞的线程。

#### 监视器池

当 synchronized 锁升级为重量级锁时，JVM 需要一个机制来管理锁的竞争，包括记录持有锁的线程、维护等待队列、处理线程的阻塞和唤醒等。由于锁竞争可能发生在多个对象上，JVM 不可能为每个对象都预先分配一个完整的监视器结构（内存开销太大）。因此，JVM 使用一个 **ObjectMonitor 池** 来动态分配和重用监视器对象，以优化内存使用和性能。

在 HotSpot JVM 中，ObjectMonitor 是一个 C++ 类，定义在 `hotspot/src/share/vm/runtime/objectMonitor.hpp` 和 objectMonitor.cpp 中。JVM 通过一个池（或类似的内存管理机制）来维护这些 ObjectMonitor 实例。

#### 监视器池的实现

- 全局池：JVM 维护一个全局的 ObjectMonitor 池，通常是一个链表或类似的数据结构，用于存储空闲的 ObjectMonitor 实例。

  - 在源码中，这由 ObjectSynchronizer 类管理（位于 synchronizer.cpp）。

  - 示例字段（简化）：

    ```C++
    static ObjectMonitor* gFreeMonitorList; // 空闲监视器链表
    static volatile intptr_t gMonitorFreeCount; // 空闲监视器数量
    ```

- **初始化**：

  - JVM 启动时会预分配一定数量的 ObjectMonitor 实例，放入空闲池中。
  - 数量通常由 JVM 参数（如 -XX:MonitorBound）控制，默认值取决于系统资源。

  **动态分配**：

  - 当需要新的 ObjectMonitor 时，JVM 从池中取出一个空闲实例。
  - 如果池为空，则动态分配一个新的实例（通过 new ObjectMonitor()）并初始化。

  **回收**：

  - 当锁释放且不再需要某个 ObjectMonitor 时，它会被清理并放回池中，以便重用。

#### 为Java对象分配监视器

地址：https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/runtime/objectMonitor.cpp

搜索：

#### 检查锁状态

- JVM 检查目标对象（如 MyClass.class）的 Mark Word。
- 如果是轻量级锁且竞争加剧，进入锁膨胀流程。

#### 从监视器池中获取监视器

- 调用 ObjectSynchronizer::inflate：

  ```c++
  ObjectMonitor* ObjectSynchronizer::inflate(oop obj) {
      if (gFreeMonitorList != NULL) {
          // 从空闲池中取出一个监视器
          ObjectMonitor* monitor = gFreeMonitorList;
          gFreeMonitorList = monitor->next_free();
          gMonitorFreeCount--;
          monitor->recycle(); // 重置状态
          return monitor;
      } else {
          // 池为空，分配新实例
          return new ObjectMonitor();
      }
  }
  ```

- 参数 obj 是被锁的 Java 对象（这里是 MyClass.class）。

> inflate 这个单词是膨胀的意思

#### 初始化监视器

- 将 ObjectMonitor 的 _object 字段设置为 MyClass.class 的指针。
- 清空 _owner、_EntryList 等字段，准备接收线程。

#### 将 ObjectMonitor 地址写入 Mark Word

在分配 ObjectMonitor 后，JVM 需要将其地址与 Class 对象关联起来，这一过程通过更新 Mark Word 完成。

Mark Word 与监视器

Mark Word 是一个动态结构，其内容根据锁状态变化：

- **无锁**：存储哈希码或 GC 信息。
- **偏向锁**：存储线程 ID 和偏向标志。
- **轻量级锁**：指向线程栈中的锁记录。
- **重量级锁**：存储指向 ObjectMonitor 的指针。

在 64 位 JVM 中，Mark Word 通常是 64 位，格式如下（简化）：

```text
|-----------------------------------------------|
| 锁状态 | 内容                                      |
|--------|------------------------------------------|
| 无锁   | hash:31 | age:4 | 0 | 01                |
| 偏向锁 | thread:54 | epoch:2 | 1 | 01            |
| 轻量级 | ptr_to_lock_record:62 | 00              |
| 重量级 | ptr_to_monitor:62 | 10                  |
|-----------------------------------------------|
```

- **重量级锁状态**：最后两位是 10，其余位存储 ObjectMonitor 的地址。

**写入Mark Word过程**

1. 锁膨胀：

   - ObjectSynchronizer::inflate 返回 ObjectMonitor 实例后，JVM 更新 Mark Word。

   - 示例代码（简化）：

     ```c++
     void inflate_and_associate(oop obj, ObjectMonitor* monitor) {
         markOop mark = obj->mark(); // 获取当前 Mark Word
         if (mark->is_neutral()) {   // 无锁状态
             markOop new_mark = (markOop)(monitor | WEIGHTED_LOCK_FLAG);
             if (Atomic::cmpxchg_ptr(new_mark, obj->mark_addr(), mark) == mark) {
                 monitor->set_object(obj); // 关联对象
             }
         } else if (mark->has_locker()) { // 轻量级锁
             // 撤销轻量级锁，更新为重量级锁
             markOop new_mark = (markOop)(monitor | WEIGHTED_LOCK_FLAG);
             Atomic::cmpxchg_ptr(new_mark, obj->mark_addr(), mark);
         }
     }
     ```

   - 使用 CAS（cmpxchg_ptr）原子地将 ObjectMonitor 地址写入 Mark Word。

2. 标志位设置：

   - 将 Mark Word 的低两位设置为 10，表示重量级锁。
   - 高位存储 ObjectMonitor 的内存地址。

3. 关联完成：

   - 此时，MyClass.class 的 Mark Word 指向 ObjectMonitor，线程通过该指针访问监视器。

#### 监视器的后续管理

- 线程竞争：
  - 第一个线程获取锁，ObjectMonitor 的 _owner 设置为该线程。
  - 其他线程加入 _EntryList，通过 pthread_mutex_t 和 futex 阻塞。
- 锁释放：
  - 线程退出 synchronized 块，调用 monitorexit。
  - JVM 检查 _recursions，若为 0，则释放 ObjectMonitor，唤醒 _EntryList 中的线程。
- 回收：
  - 如果 ObjectMonitor 不再需要，JVM 将其放回空闲池（gFreeMonitorList）。

### 思考题

既然 synchronized 和 Lock 都是基于管程来实现的，那为什么已经有了synchronized ，还需要 Lock ？
