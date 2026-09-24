---
title: CAS与原子操作
---

### CAS-解决并发编程的基石

#### 什么是原子操作？

并发里的原子性和事务中的原子操作是完全一样的概念，假定有两个操作 A 和 B 都包含多个步骤，如果从执行 A 的线程来看， 当另一个线程执行 B 时， 要么将 B 全部执行完， 要么完全不执行 B ，执行 B 的线程看 A 的操作也是一样的， 那么 A 和 B 对彼此来说是原子的。

实现原子操作可以使用锁， 锁机制满足基本的需求是没有问题的了， 但是有的时候我们的需求并非这么简单，我们需要更有效，更加灵活的机制，synchronized 关键字是基于阻塞的锁机制，也就是说当一个线程拥有锁的时候， 访问同一资源的其它线程需要等待，直到该线程释放锁。

使用锁机制实现的原子性可能存在问题： 首先，如果被阻塞的线程优先级很高很重要怎么办？其次， 如果获得锁的线程一直不释放锁怎么办？ 同时，还有可能出现一些例如死锁之类的情况， 最后，其实锁机制是一种比较粗糙， 粒度比较大的机制， 相对于像计数器这样的需求有点儿过于笨重。这个时候就需要用到CAS机制。

**CAS**，**全称Compare And Swap（比较与交换）**， **CAS（V, A, B）**，**V为内存地址、A为预期原值，B为新值**。如果内存地址的值与预期原值相匹配，那么将该位置值更新为新值。否则，说明已经被其他线程更新，处理器不做任何操作；无论哪种情况，它都会在 CAS 指令之前返回该位置的值。而我们可以使用自旋，循环CAS，重新读取该变量再尝试再次修改该变量，也可以放弃操作。

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog/image-20251120220952594.png" alt="image-20251120220952594" style="zoom:67%;" />

#### CAS实现原子操作的三大问题

#### ABA 问题

CAS 在更新前会检查值是否被改动过，若未变则更新。但它只看“当前值”，不关心历史： 如果一个值从 A → B → 又变回 A，CAS 会误以为“没变过”，从而错误地认为可以安全更新，这就是 **ABA 问题**。

**解决方法**：给变量加一个递增的版本号（stamp）。 每次修改都同时更新版本号，序列就变成： 1A → 2B → 3A 即使值又回到 A，版本号不同，CAS 就能识别出中间被改过。

**通俗比喻**： 你桌上一杯水，走开一趟回来发现水还在，就直接喝了 —— 这就是典型的 ABA 问题（你以为没人动，其实被同事喝光又续满了一杯）。

而讲卫生的程序员会这样做： 放杯子时在旁边贴张纸条写上 “0”。 规定：谁动水就必须先把数字加 1。 你回来一看纸条上写着 “2”，哪怕水还是满的，你也知道：这杯水已经“脏”了，不能喝了。

Java 直接提供了这个机制：

- `AtomicStampedReference<V>`（值 + int 版本号）
- `AtomicMarkableReference<V>`（值 + boolean 标记位，简化版）

用它们实现 CAS，就彻底杜绝 ABA 问题。

#### 循环时间长开销大

自旋 CAS 如果长时间不成功，会给 CPU 带来非常大的执行开销。

#### 只能保证一个共享变量的原子操作

CAS 原生只能保证**单个共享变量**的原子性。

- 对单个变量，可通过循环 CAS（自旋）实现原子更新。
- 对多个共享变量，循环 CAS 无法保证整体原子性，此时需使用锁。
- 替代方案：将多个共享变量合并为一个对象，通过 `AtomicReference<V>` 对该对象整体进行 CAS，从而实现多变量的复合原子操作。

Java 1.5 引入的 AtomicReference 正是为此设计：把任意数量的变量封装进一个对象，用一次引用 CAS 完成“多字段”原子更新，巧妙规避了传统锁。

#### JDK 中相关原子操作类的使用

以AtomicInteger为例：

 | 方法                                            | 功能描述                                      | 返回值含义                 |
  | ----------------------------------------------- | --------------------------------------------- | -------------------------- |
  | `int addAndGet(int delta)`                      | 原子地将 delta 加到当前值，返回**加后的结果** | 新值                       |
  | `int getAndAdd(int delta)`                      | 原子地将 delta 加到当前值，返回**加前的旧值** | 旧值                       |
  | `boolean compareAndSet(int expect, int update)` | 如果当前值 == expect，则原子更新为 update     | 是否更新成功（true/false） |
  | `int getAndIncrement()`                         | 原子自增（+1），返回**自增前的值**            | 旧值（等价于 i++）         |
  | `int incrementAndGet()`                         | 原子自增（+1），返回**自增后的值**            | 新值（等价于 ++i）         |
  | `int getAndSet(int newValue)`                   | 原子地将值设为 newValue，返回**设置前的旧值** | 旧值                       |

### CAS 实现机制深度解析

#### 硬件原子指令实现CAS

> 不支持原子指令的硬件： - 早期的简单处理器（如 8086、某些 8 位微控制器）没有原生的原子指令。 一些低端嵌入式系统（如老式 AVR 或 PIC 微控制器）缺乏硬件支持。 某些特殊用途处理器可能故意省略复杂指令以简化设计。
>
> 现代处理器几乎都支持原子指令，因为多核和并发是标配。但在极低功耗或极简设计的场景中，硬件可能不提供。

#### 主流架构的CAS实现

**x86/x86_64架构**

- 核心指令：`cmpxchg`（Compare and Exchange）
- 关键机制：`lock`前缀确保原子性
- 汇编示例：
  ```asm
  mov eax, [expected]     ; 加载期望值
  lock cmpxchg [ptr], desired ; 原子比较并交换
  setz al                 ; 设置操作结果标志
  ```
  *修正说明：原示例缺少`setz al`指令，需补充返回值设置*

**ARM架构**

- 指令对：`ldrex`和`strex`（Load-Exclusive/Store-Exclusive）
- 乐观锁机制：通过本地监视器检测并发冲突
  ```asm
  ldrex r1, [ptr]         ; 加载当前值并标记监视器
  cmp r1, expected        ; 比较值
  bne fail                ; 不相等则失败
  strex r2, desired, [ptr]; 尝试存储新值
  cmp r2, #0              ; 检查是否成功（0表示成功）
  beq success             ; 成功跳转
  fail:
  ```

**编译器支持**
- GCC/Clang等编译器通过`__atomic`内置函数生成架构优化指令
- 示例：`__atomic_compare_exchange_n`会映射到`cmpxchg`或`ldrex/strex`

#### 硬件原子指令支持现状

| 架构         | 原子指令支持                     | 关键特性                     |
|--------------|----------------------------------|------------------------------|
| x86/x86_64   | `cmpxchg`, `lock`前缀          | 支持字节/字/双字/四字操作    |
| ARMv6+       | `ldrex`/`strex`                 | 需配合内存屏障使用           |
| RISC-V       | AMO指令（A扩展）                | 支持原子加减/逻辑运算        |
| PowerPC      | `lwarx`/`stwcx.`                | 需配合`cmp`指令完成CAS逻辑   |

#### 硬件原子性实现关键技术

三大核心技术：原子指令集、缓存一致性协议、内存屏障。

**原子指令集**

- x86的`LOCK`前缀会：
  - 锁定总线直至指令完成
  - 阻塞其他核心的缓存访问
- ARM的`ldrex`/`strex`通过本地监视器实现：
  - 加载时标记缓存行独占
  - 存储时验证独占状态

**缓存一致性协议（MESI）**

当CPU执行原子操作（如`LOCK CMPXCHG`）时，MESI协议会将目标缓存行状态从`Shared(S)`提升至`Exclusive(E)`或`Modified(M)`，此时其他核心的相同缓存行会被标记为`Invalid(I)`，形成**硬件级互斥锁**

**内存屏障（Memory Barrier）**

强制原子写操作结果对其他核可见，保证原子读操作后的加载顺序，阻止所有指令重排序。

#### 硬件没有原子指令实现CAS

| 平台/时代                                 | 实现方式                                                     | 原理/代价                                                    |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 早期 x86（386/486 无 CMPXCHG）            | 用 `XCHG` 指令（隐含 LOCK）或 `.byte 0xF0,0x0F,0xB0,...` 强制总线锁 | XCHG 本身总是带 LOCK，拿它模拟 CAS，但逻辑复杂、性能差       |
| 单核或无 SMP 的机器                       | 直接关闭中断（CLI/STI）                                      | 最简单：禁止中断 = 禁止抢占 = 单线程串行执行 → 天然原子，但不支持多核 |
| 早期 PowerPC、MIPS、SPARC                 | LL/SC（Load-Linked / Store-Conditional）序列 + 总线仲裁      | 硬件虽提供 LL/SC，但若无 CAS，内核用总线锁或全局自旋锁包装成 CAS 接口 |
| 所有没有硬件 CAS 的多核系统（最通用做法） | **操作系统提供的原子原语**（内核态总线锁）                   | 用户态调用系统调用（如 Linux 的 `futex`、`cmpxchg` 模拟）或 `rt_mutex`，内核用总线锁或大内核锁（Big Kernel Lock）实现真正原子性 |

#### Java中的CAS实现

#### Java层（Unsafe）

jdk/src/share/classes/sun/misc/Unsafe.java

#### JVM native实现（HotSpot）

查看链接：https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/share/vm/prims/unsafe.cpp

搜索：CompareAndSwapLong

核心代码：

```c++
Atomic::cmpxchg(x, addr, e)
```

#### 真正汇编实现（CPU相关）

查看链接：https://hg.openjdk.org/jdk8/jdk8/hotspot/file/87ee5ee27509/src/cpu/x86/vm/x86_64.ad

搜索：CompareAndSwapL

实现代码：

```cpp
instruct compareAndSwapL(rRegI res,
                         memory mem_ptr,
                         rax_RegL oldval, rRegL newval,
                         rFlagsReg cr)
%{
  predicate(VM_Version::supports_cx8());
  match(Set res (CompareAndSwapL mem_ptr (Binary oldval newval)));
  effect(KILL cr, KILL oldval);

  format %{ "cmpxchgq $mem_ptr,$newval\t# "
            "If rax == $mem_ptr then store $newval into $mem_ptr\n\t"
            "sete    $res\n\t"
            "movzbl  $res, $res" %}
  opcode(0x0F, 0xB1);
  ins_encode(lock_prefix,
             REX_reg_mem_wide(newval, mem_ptr),
             OpcP, OpcS,
             reg_mem(newval, mem_ptr),
             REX_breg(res), Opcode(0x0F), Opcode(0x94), reg(res), // sete
             REX_reg_breg(res, res), // movzbl
             Opcode(0xF), Opcode(0xB6), reg_reg(res, res));
  ins_pipe( pipe_cmpxchg );
%}
```

解释：

```asm
instruct compareAndSwapL(
    rRegI res,          // 返回值：1 表示成功，0 表示失败（boolean）
    memory mem_ptr,     // 要操作的内存地址
    rax_RegL oldval,    // 预期值，必须预先放在 RAX 寄存器（x86 cmpxchg 硬件要求）
    rRegL newval,       // 要写入的新值
    rFlagsReg cr        // 影响 ZF 标志位，用于判断是否成功
)
```

predicate(VM_Version::supports_cx8()); 只有 CPU 支持 CMPXCHG8B（即支持 64 位原子操作）才启用此指令。

对应 Java 中 Unsafe.compareAndSwapLong 返回 boolean 的版本：

```asm
match(Set res (CompareAndSwapL mem_ptr (Binary oldval newval)));
```

**生成的真实汇编**（核心就两行）：

```asm
LOCK CMPXCHGQ [mem_ptr], newval     ; 原子比较并交换
SETE al                              ; 如果相等（成功），把 1 写入 al
MOVZBL res, al                       ; 把 al 零扩展到 32 位返回
```

必须 LOCK 前缀 → 保证多核原子性

**成功时**：ZF=1，内存被写入 newval，RAX 仍为 oldval。

**失败时**：ZF=0，RAX 被更新为内存当前实际值（这就是为什么 CAS 失败后要重试时直接用 RAX 里的值）。

最后用 SETE + MOVZBL 把成功/失败转成 0/1 返回给 Java。

> **LOCK 前缀 = 告诉 CPU：“我要独占这 64 字节缓存行，别的核在我的指令完成前，一律不准碰它！”**
>
> ### 具体过程（现代 Intel/AMD CPU，2010 年以后）
>
> 1. 你执行一条带 LOCK 前缀的指令 例如：lock cmpxchg [addr], rax
> 2. 当前核立刻向总线发出 **RFO（Request For Ownership）** 请求 → 意思是“我要独占（Ownership）addr 所在的缓存行”
> 3. 所有其他核收到这个请求后，**强制把自己的同一缓存行设为 Invalid** → 哪怕它们正准备读或写，也必须立刻放弃
> 4. 当前核拿到独占权后，**只有它一个人**能修改这 64 字节 → 整个 cmpxchg 指令期间，没有任何其他核能干扰
> 5. 指令执行完后，当前核把新值写回，并解除独占 → 其他核重新可以访问
>
> 这整个过程由硬件（MESI 协议 + 总线仲裁）在几十纳秒内自动完成，**不需要操作系统、也不需要锁总线**，只锁一行缓存，所以极快。

### 参考链接

在线查看JDK源码：https://hg.openjdk.org/jdk8/jdk8/hotspot/file

JSR133：http://ifeve.com/wp-content/uploads/2014/03/JSR133%E4%B8%AD%E6%96%87%E7%89%88.pdf

### 思考题

volatile可以解决原子性的问题吗？
