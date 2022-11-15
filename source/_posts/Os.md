---
title: thinking in os
categories:
  - 操作系统
author: 吉永超
date: 2022-08-15 00:00:00
tags:
- C++
- C
---

编写操作系统看起来是一件天方夜谭的事情，但古语有云：天下之事有难易乎？为之，则难者亦易矣；不为，则易者亦难矣。

<!-- more -->

# 操作系统概览

## 什么是操作系统

操作系统是一种运行在内核态的软件。

现代计算机包含处理器、存储器、时钟、磁盘、鼠标、网络接口、打印机以及其他设备。从这个角度看，操作系统的任务是在相互竞争的程序之间有序地空指对处理器、存储器以及其他I/O接口设备的分配。

操作系统所处的位置：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/672829/1660556739463-717771df-82cb-40b1-9952-c14afeec07ca.png)

用户态和内核态：

- 内核态：对所有硬件具有完全的访问权，可以执行机器能够运行的任何指令
- 用户态：只使用机器指令中的一个子集，那些会影响机器的空指或可进行I/O操作的指令，在用户态中的程序是禁止的

## 操作系统分类

模拟计算机、神经计算机、量子计算机以及生化计算机。

## 操作系统的发展史



## 计算机组成原理

操作系统是直接运行在硬件之上的软件，因此，在编写操作系统的过程中，难免的会接触到各种类型的硬件，我们需要对这些硬件有一定的认识，才能更好的完成操作系统。

处理器和存储器之间不断增大的性能差距迫使设计者不断寻找缓解存储器平均访问时间问题的方法，比如多级Cache（《计算机存储与外设第1章》）和超线程技术。

虚拟的计算机体系结构如下：

<img src="https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog202208161437946.png" alt="image-20220816143715840" style="zoom: 80%;" />



### CPU

CPU的寄存器有几个功能。一些寄存器是高速暂存寄存器，用于保存数据或者数据单元的地址（即指针）。另外一些则是特殊功能寄存器，比如对一个循环的次数进行计数的循环计数器，有的则用来记录处理器的状态。CPU最重要的寄存器是程序计数器（PC），它记录了要执行的下一条指令的地址；也就是说，程序计数器保持对程序执行的跟踪，有时PC也叫指令指针。

CPU寄存器的分类：IR、PC、MAR、MBR。



### 地址总线

组成计算机的各个子系统通过总线连接在一起，数据通过总线从计算机中的一个位置传递到另外一个位置。现有的一些总线，比如PCIe，本身就是一个复杂的子系统。

现代计算机中有多条总线，包括片内总线、功能单元间（比如CPU和存储器间）的总线以及总线之间的总线。

### DRAM

RAM：Random Access Memory，即随机存储器（内存），断电会丢失数据。

https://www.zhihu.com/question/30492703

# 编写MBR

## 计算机的启动过程

### BIOS

BIOS全称：Base Input & Output System，即基本输入输出系统。BIOS本身是个程序，程序执行的入口是）0xFFFF0。

BIOS的主要工作是检测、初始化硬件。BIOS直接硬件提供了的些初始化的功能。另外，BIOS提供了中断向量表，通过“int 中断号”来实现相关的硬件调用，当然，BIOS建立的功能就是对硬件的IO操作，也就是输入输出，但由于内存空间大小的限制，BIOS无法将所有硬件的IO操作都实现的面面俱到，而且也没有必要实现那么多，因此，BIOS会挑一些重要的、保证计算机能运行的那些硬件的基本IO操作就行了。这就是BIOS被称为基本IO系统的原因。

BIOS是计算机上第一个运行的软件，它是由硬件只读存储器ROM加载的。BIOS代码所做的工作是一成不变的，正常情况下，其本身是不需要修改的。因此，BIOS被写进ROM，ROM也是块内存，内存就需要被访问。此ROM被映射在低端1MB内存的顶部，即地址0xF0000~0xFFFFF处。

CPU访问内存是用段地址+偏移地址来实现的，由于在实模式下，段地址需要乘以16才能与偏移地址相加，求出的和便是物理地址。

在开机的一瞬间，也就是接电的一瞬间，CPU的cs:ip寄存器被强制初始化为0xF000:0xFFF0。由于开机的时候处于实模式，在实模式下的段基址要乘以16，也就是左移4位，于是0xF000:0xFFF0的等效地址是0xFFFF0，正好就是BIOS的入口地址。

## 地址、section、vstart

### 地址

地址只是数字，描述各种符号在源程序中的位置，它是源代码文件中各符号偏移文件开头的距离。由于指令和变量所占内存大小不同，故它们相对于文件开头的偏移量参差不齐。

编译器的工作就是给各符号编址。编译器根据所在硬件平台的特性，将源代码中的每一个符号（指令和数据）都按照本硬件平台的特性分配空间，在不考虑对其的情况下，这些符号在空间上都彼此相邻，连续分布，它们在程序中距离第一个符号的距离便是它们在程序中的地址。

本质上，程序中各种数据结构的访问，就是通过“该数据结构的起始地址和该数据结构所占内存大小”来实现的。这就解释了为什么定义变量要给出变量类型，因为变量类型规定了变量所占内存的大小，每种类型都有其对应的内存容量。

### section

编译器提供的关键字section只是为了让程序员在逻辑上将程序划分成几个部分，由于是伪指令，CPU并不知道有section的存在。nasm提供section的目的是便于程序员将指令和数据分开，使代码结构清晰明了，更易于维护。至于程序中如何划分，没有硬性规定。

总而言之，关键字section并不会对程序中的地址产生任何影响，即在默认情况下，有没有section都一样，section中的数据地址依然是相对于整个文件的顺延，仅仅是在逻辑上让开发人员梳理程序之用。

### vstart

vstart是虚拟起始地址。

vstart的作用是为section内的数据指定一个虚拟的起始地址，也就是根据此地址，在文件中是找不到相关数据的，是虚拟的，文件中的所有符号都不在这个地址上。

## CPU的实模式

实模式指的是8086CPU的工作环节、工作方式、工作状态，这是一整套的内容，并不是单指某一方面的设置。

### CPU的工作原理

CPU工作原理示意图：

![image-20220816152953537](https://blog-1304855543.cos.ap-guangzhou.myqcloud.com/blog202208161529594.png)

### 实模式

[CPU的实模式和保护模式(一) - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/42309472)

实模式出现于8088CPU时期。当时由于CPU的性能有限，一共只有20位地址线（所以地址空间只有1MB），8个16位通用寄存器，以及4个16位的段寄存器。所以为了能够通过这些16位的寄存器去构成20位的主存地址，必须采取一种特殊的方式。当某个指令想要访问某个内存地址时，它通过需要用下面的这个格式来表示：段基址：段偏移量。

段基址的值是由段寄存器提供的，一般来说，寄存器有6中，分别是cs、ds、ss、es、fs、gs，这几种段寄存器都有自己特殊的意义。

段偏移量，代表要访问的这个内存地址距离这个段基址的偏移。它的值就是有通用寄存器来提供的，所以也是16位。那么两个16位的值如何组合成一个20位的地址呢？CPU采用的方式是把段寄存器所提供的段基址先向左移4位，这样就变成了一个20位的值，然后再与段偏移量相加。

### 硬盘操作



# 保护模式

## 获取物理内存容量



## 内存分页机制



# 完善内核

## 混合编程

### 基本内联混编

## 内联编程

### 扩展内联混编
