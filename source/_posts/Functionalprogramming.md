---
title: 函数式编程
date: 2020-07-13
categories:
 - Java
author: 吉永超
---

==函数式编程==
<!-- more -->

## 函数式编程初识

JDK8或者说Java8是目前企业开发中最常用的JDK版本，Java8可谓Java语言历史上变化最大的一个版本，其承诺要调整Java编程向着函数式风格迈进，这有助于编写出更为简洁、表达力更强，并且在很多情况下能够利用并行运行的代码。

但是很多人在使用Java8的时候，还是使用传统的面向对象的编程方式，这样在使用Java8的好处也仅仅停留在JVM带来的性能上的提升，而事实上Java8的新特性可以极大提升我们的开发效率，面向函数式编程也是将来编程语言的重要趋势，可以说，学习函数式编程风格，刻不容缓。

### 匿名内部类

在以往的使用传统面向对象的编程中，我们不得不这样编写代码：

``` java
import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class anonymousTest {
    public static void main(String[] args) {

        JFrame jFrame = new JFrame("My JFrame");
        JButton jButton = new JButton("My Button");
        jButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                System.out.println("Button Pressed");
            }
        });

        jFrame.add(jButton);
        jFrame.pack();
        jFrame.setVisible(true);
        jFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }
}

```

这段代码我们实际上需要的其实只有System.out.println("Button Pressed")这一行，但却不得不编写很多没有实际意义的代码，如果改用函数式风格编程，我们的代码就变成了：

``` java
import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class anonymousTest {
    public static void main(String[] args) {

        JFrame jFrame = new JFrame("My JFrame");
        JButton jButton = new JButton("My Button");
        jButton.addActionListener(e -> System.out.println("Button Pressed"));

        jFrame.add(jButton);
        jFrame.pack();
        jFrame.setVisible(true);
        jFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }
}
```

可以看到，瞬间代码的易读性提高了很多。

再比如我们经常会用到的创建线程的例子：

``` java
package com.czxy.test;

import java.io.FileOutputStream;
import java.io.IOException;

/**
 * Created by ${sunxin} on 2019/3/7
 * Lambda可以简循环遍历的写法，不是一般的简化，少些很多代码，简化创建线程的代码，简化以后的代码很少，不易懂，像前端javaScrpit
 */
public class Lambda {
    /**
     *     Lambda 在创建线程方面可以简化写法
     */
    //原来的写法
    public static void main(String[] args) throws IOException {

            //获取执行前的毫秒值
            long old = System.currentTimeMillis();
            //执行一百千次
            for (int a = 0; a < 100000; a++) {
                //原来的方式创建线程 实现Runnable接口 重写run方法
                Thread thread = new Thread(new Runnable() {
                    @Override
                    public void run() {

                    }
                });
                thread.start();
            }
            //获取执行后的毫秒值
            long newTime = System.currentTimeMillis();
            //获得消耗的时间
            long i = newTime - old;
            System.out.println("创建100000个花费的总毫秒值"+i);

        /*
        使用Lambda表达式的新写法
         */
        //获取执行前的毫秒值
        long old1 = System.currentTimeMillis();
        for (int a =0;a<100000;a++){
            Thread threadLambda = new Thread(()-> System.out.println("使用Lambda创建了线程了"));
            threadLambda.start();
        }
        //获取执行后的毫秒值
        long newTime1 = System.currentTimeMillis();
        //获得消耗的时间
        long i1 = newTime1 - old1;
        System.out.println("Lambda创建100000个花费的总毫秒值"+i1);

    }
}
```

不难看出，Lambda表达式在简化代码上，是非常有效的，Lambda表达式看起来特别像是原来Java中匿名内部类的一种特殊写法，对于初学者而言，暂时不妨可以认为Lambda表达式就是匿名内部类的一种新的写法，或者说是一种语法糖，但其实两者有着本质的区别，Lambda表达式就是一种全新的语法。

这里通过一个例子来说明Lambda表达式和匿名内部类的区别：

```java
public class LambdaTest {
    Runnable r1 = () -> System.out.println(this);
    Runnable r2 = new Runnable() {
        @Override
        public void run() {
            System.out.println(this);
        }
    };

    public static void main(String[] args) {
        LambdaTest lambdaTest = new LambdaTest();
        Thread t1 = new Thread(lambdaTest.r1);
        t1.start();
        
        System.out.println("================");
        
        Thread t2 = new Thread(lambdaTest.r2);
        t2.start();
    }
}
```

控制台输出：

```txt
Stream2.LambdaTest@362872a1
Stream2.LambdaTest$1@60c8c409
```

首先来看第二行，它表示当前对象指的是LambdaTest$1，在Java中表示匿名内部类会使用类名称+"$"+顺序的方式来表示，"@"后面的表示类的哈希值，而第一个Lamda表达式所打印的就是当前类LambdaTest的地址，这说明使用Lambda表达式的这种方式与它所在的类是同一个作用域。通过这个例子说明了Lambda表达式与匿名内部类有着本质的区别，两者是完全不同的，并不是匿名内部类的语法糖或者另一种表达形式，只不过在某些场景下，可以使用Lambda表达式来替代匿名内部类完成相同的功能。

而使用Lambda表达式所带来的好处其实远不止简化代码，它还可以为我们带来代码执行效率上的提升，所以，无论是处于开发效率，还是代码的执行速度上来看，都应该使用Lambda表达式，在后面的文章中，我们首先认识一下函数式编程中两个核心的概念Lambda表达式和Stream。

### Lambda表达式和Stream

Lambda表达式与Stream是java8中新增加的重要新特性，Lambda表达式与Stream相互配合，可以非常高效的处理一些集合的运算。

我们首先从遍历打印集合中元素这样非常常见的例子开始，以往遍历集合通常的做法是：

``` java
public class LambdaTest {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");
        for (String string : list) {
            System.out.println(string);
        }
    }
}   
```

或者使用传统的for循环来遍历：

``` java
public class LambdaTest {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");

        for (int i = 0; i < list.size(); i++) {
            System.out.println(list.get(i));
        }
    }
}
```

通过Lambda表达式我们可以将上述代码优雅的表示为：

``` java
public class LambdaTest {

    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello","world","hello world");\
        
        list.forEach((String x) -> System.out.println(x));
        

    }
}
```

实际上，对于变量前面的类型，也是可以省略的。

``` java
public class LambdaTest {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");
        list.forEach(x-> System.out.println(x));
    }
}
```

因为编译器可以自动推断出当前遍历集合当前元素的类型，但并不是在所有的场景下，编译器都可以自动推断类型，在后续的文章中，我们就会遇到编译器无法自动推断，需要我们手动声明变量类型的情况。

这里我们先不去考虑Lambda表达式具体的语法，先从直观的角度来感受函数式编程带来的好处，原本三行的代码现在仅仅需要一行就能实现，如果使用方法引用甚至能够让代码变的更加简洁：

``` java
public class LambdaTest {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");

        strings.forEach(System.out::println);
    }
}
```

这里的

```txt
::
```

也是java8中新增的一个语法糖。后续的文章我们有专门的篇幅来介绍方法引用，使用方法引用可以写出更加简洁优雅的代码。

看了这么几个例子，你可能很疑惑，到底什么是Lambda表达式呢？
在回答这个问题之前，我们首先需要了解我们为什么需要需要Lambda表达式。

在以往的Java中，方法可以参数的传递总共有两种，一种是传递值，另有一种是传递引用，或者说对象的地址，但是我们无法将函数作为参数传递给一个方法，也无法声明返回一个函数的方法，而在其他语言中，比如面向函数式编程语言JavaScript中，函数的参数是一个函数，返回值是另一个函数的情况是非常常见的（回调函数）
例如：

``` javaScript
images_upload_handler: function(blobInfo, success, failure) {
       success(...)
       failure(...)
}
```

这个函数总共接收三个参数，第一个参数就是一个普通的变量，success就是这个函数执行成功的回调函数，failure就是这个函数执行失败的回调函数。

可以说，JavaScript是一门非常典型的函数式语言。而使用Lambda表达式就可以实现传递行为这种高阶函数（参数可以接收行为的方法们就称这个方法为高阶函数）的使用。

当然Lambda表达式肯定不止只是能用来遍历集合这个简单，实际上，更多的情况下，我们都是需要配合Stream（流）来实现各种各样的操作。对于前面使用Lambda表达式来实现集合遍历的例子还可以这样做：

``` java
public class LambdaTest {

    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello","world","hello world");
        list.forEach(item-> System.out.println(item));
        
        list.stream().forEach(System.out::println);
    }
}
```

看起来只是增加了一步，将list这个集合转化为了Stream，但是两者的实现有着本质的区别。我们可以简单的了解一下他们之前的区别。
对于第一种，

![](https://user-gold-cdn.xitu.io/2020/3/8/170b964aac39b7b7?w=973&h=519&f=png&s=54757)
可以看到list.forEach实际上是调用Iterable这个类中jdk1.8新增的forEach方法，我们都知道List本身继承了Collection集合接口，而Collection接口又继承了Iterable这个类，所以可以完成调用，方法实现本身并没有特别复杂的地方，其实本质上看起来和我们传统的使用迭代器的方式并没有区别，接下来，我们查看一下第二种方式：

![](https://user-gold-cdn.xitu.io/2020/3/8/170b969f366bdfc9?w=1049&h=416&f=png&s=60500)
首先同样的是在Collection接口中新增加了一个default method（我们称之为默认方法），在jdk1.8中接口是又具体的方法实现，实际上对于java这一门非常庞大臃肿的语言，为了向函数式编程迈进，jdk的设计者匠心独具，设计非常巧妙。这个方法将返回了一个新的对象Stream，并且调用了StreamSupport这个类中的stream（）方法：

![](https://user-gold-cdn.xitu.io/2020/3/8/170b970249e81bcc?w=983&h=207&f=png&s=28200)
追踪下去，我们也可以看到，同样的也是一个名叫forEach的方法，但其实这里的forEach()方法与之前的forEach（）方法存在本质的差别，这里的forEach实际上表示一种终止操作，而jdk会在集合进行流操作的时候，调用终止操作。

在这两个方法中都接受一个Consumer<? super T> action 这样的一个参数，实际上，对于java而言，为了实现函数式编程，java引入了一个全新的概念：函数式接口，它是java实现整个函数式编程的手段，也是函数式编程中一个及其重要的概念，这个概念会贯穿整个函数式编程的全过程，理解了函数式接口，才能Lambda表达式真正的含义，接下来的时间，我们非常有必要首来认识一下，什么是函数式接口。

## 函数式接口

函数式接口是函数式编程中最重要的概念，函数式编程与传统的编码方式相比最明显的区别就是，它允许把函数（或者说表达式）当成参数传递给另一个函数，在其他编程语言中，Lambda表达式的类型是函数，但在Java中，Lambda表达式是对象，他们必须依附于一类特别的对象--函数式接口（functional interface）。

### 函数式接口定义

在之前的这个例子中：

``` java
public class LambdaTest {

    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello","world","hello world");
        list.forEach(item-> System.out.println(item));
    }
}
```

点击箭头就会进入到一个接口当中：

``` java
@FunctionalInterface
public interface Consumer<T> {
    void accept(T t);

    default Consumer<T> andThen(Consumer<? super T> after) {
        Objects.requireNonNull(after);
        return (T t) -> { accept(t); after.accept(t); };
    }
}
```

可以看到这个接口上有一个@FunctionInterface的注解，点击这个注解进入，就可以看到这样一段JavaDoc:

```java
/**
 * An informative annotation type used to indicate that an interface
 * type declaration is intended to be a <i>functional interface</i> as
 * defined by the Java Language Specification.
 *
 * Conceptually, a functional interface has exactly one abstract
 * method.  Since {@linkplain java.lang.reflect.Method#isDefault()
 * default methods} have an implementation, they are not abstract.  If
 * an interface declares an abstract method overriding one of the
 * public methods of {@code java.lang.Object}, that also does
 * <em>not</em> count toward the interface's abstract method count
 * since any implementation of the interface will have an
 * implementation from {@code java.lang.Object} or elsewhere.
 *
 * <p>Note that instances of functional interfaces can be created with
 * lambda expressions, method references, or constructor references.
 *
 * <p>If a type is annotated with this annotation type, compilers are
 * required to generate an error message unless:
 *
 * <ul>
 * <li> The type is an interface type and not an annotation type, enum, or class.
 * <li> The annotated type satisfies the requirements of a functional interface.
 * </ul>
 *
 * <p>However, the compiler will treat any interface meeting the
 * definition of a functional interface as a functional interface
 * regardless of whether or not a {@code FunctionalInterface}
 * annotation is present on the interface declaration.
 *
 * @jls 4.3.2. The Class Object
 * @jls 9.8 Functional Interfaces
 * @jls 9.4.3 Interface Method Body
 * @since 1.8
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface FunctionalInterface {}
```

我们一行一行来仔细阅读一下这段文档：

``` txt
 An informative annotation type used to indicate that an interface
 type declaration is intended to be a <i>functional interface</i> as
 defined by the Java Language Specification.
```

这里说，@FunctionInterface这个注解，它使用Java语言规范定义，使用通知性的annotation,来声明函数式接口，换言之，如果一个接口上使用了@FunctionInterface这个注解，那么这个接口就是函数式接口。

那么到底什么是函数式接口呢？继续往下看：

```txt
 Conceptually, a functional interface has exactly one abstract
 method.  Since {@linkplain java.lang.reflect.Method#isDefault()
 default methods} have an implementation, they are not abstract.  If
 an interface declares an abstract method overriding one of the
 public methods of {@code java.lang.Object}, that also does <em>not</em> count toward the interface's abstract method count since any implementation of the interface will have an implementation from {@code java.lang.Object} or elsewhere.
```

一个函数式接口，它只有一个精确的抽象方法，也就是说，有且仅有一个抽象方法，那么这个接口就被称为函数式接口（在jdk8中，除了抽象方法外还可以定义default method和static method，不一定都是抽象方法），并且如果这个抽象方法是Object类中的方法，不会计入这个接口的抽象方法数量。需要注意的是，可以通过Lambda表达式来创建，方法引用来创建，或者构造方法的引用来创建函数式接口的实例。

关于Lambda表达式的创建会在后续的文章中详细讲解，这里只需要大概了解函数式接口实例创建的方式有这么三种。我们继续往下：

``` txt
  <p>Note that instances of functional interfaces can be created with
  lambda expressions, method references, or constructor references.
 
  <p>If a type is annotated with this annotation type, compilers are
  required to generate an error message unless:
 
  <ul>
  <li> The type is an interface type and not an annotation type, enum, or class.
  <li> The annotated type satisfies the requirements of a functional interface.
  </ul>
  <p>However, the compiler will treat any interface meeting the
  definition of a functional interface as a functional interface
  regardless of whether or not a {@code FunctionalInterface}
  annotation is present on the interface declaration.
```

如果一个接口上有@FunctionInterface这个注解，如果不满足以下情况编译器会报错：

* 被注解的是一个接口类型，而不是一个注解类型，而是枚举或者类；
* 被注解的类型满足函数式接口的定义；

例如，创建线程时需要用到的Runnable接口：

``` java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```

可以看到这个接口从JDK8开始就加上了@FunctionalInterface这个注解，换句话说，Runnable接口现在变成了函数式接口，我们可以通过Lambda表达式来创建Runnable接口的实例。

在上面的文档中，还有最后一段话：

``` txt
  <p>However, the compiler will treat any interface meeting the
  definition of a functional interface as a functional interface
  regardless of whether or not a {@code FunctionalInterface}
  annotation is present on the interface declaration
```

然而，编译器其实会自动为满足函数式接口定义的接口添加@FunctionalInterface注解，也就是说，如果一个接口满足了函数式接口的定义，即便我们没有给他加上@FunctionalInterface这个注解，编译器会自动将它看成是函数式接口。

总的来说，关于函数式接口的定义如下：

1.如果一个接口只有一个抽象方法，那么该接口就是一个函数式接口
2.如果我们在某个接口上声明了FunctionalInterface注解，那么编译器就会按照函数式接口的定义来要求该接口
3.如果某个接口只有一个抽象方法，但我们并没有对该接口声明FunctionalInterface注解，编译器依旧会将该接口看作是函数式接口。

再以这个接口为例：

``` java
@FunctionalInterface
public interface Consumer<T> {
    void accept(T t);

    default Consumer<T> andThen(Consumer<? super T> after) {
        Objects.requireNonNull(after);
        return (T t) -> { accept(t); after.accept(t); };
    }
}
```

可以看到，在这个接口中，除了一个抽象方法accept()方法外，还有一个default默认方法andThen()，但是总的来说还是只有一个抽象方法，所以满足函数式接口的定义。

再比如：

``` java
@FunctionalInterface
public interface Predicate<T> {
    boolean test(T t);  

    default Predicate<T> and(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) && other.test(t);
    }
    default Predicate<T> negate() {
        return (t) -> !test(t);
    }

    default Predicate<T> or(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) || other.test(t);
    }

    static <T> Predicate<T> isEqual(Object targetRef) {
        return (null == targetRef)
                ? Objects::isNull
                : object -> targetRef.equals(object);
    }
}
```

同样的，这个接口中只有一个抽象方法test()，除此之外，有3个default默认方法，有一个static方法，因此同样满足函数式接口的定义。

再比如：

``` java
@FunctionalInterface
public interface MyInterface {

    void test();

    String toString();

}
```

这个接口中看起来有两个抽象方法，但toString()方法是基类Object中的方法，因此在检查函数式接口的定义的时候，它并不算数，因为Object类是所有类的父类，所有的类默认已经有了这个方法，如果算的话，其实是没有意义的，所以在定义函数式接口的时候，Object类中方法并不会对函数式接口的方法的数量变化。

在JDK8中的提供了大量的现成的函数式接口供我们使用，以之前我们使用forEach()为例：

``` java
    default void forEach(Consumer<? super T> action) {
        Objects.requireNonNull(action);
        for (T t : this) {
            action.accept(t);
        }
    }
```

其实forEach()方法接收的函数式接口就是我们上面举得第一个例子Consumer，然后调用Consumer接口中的accept方法，诸多的函数式接口，为我们方便的传递各种不同需求的行为提供了可能。

### 为什么是函数式接口？

在前面我们了解了函数式接口的概念之后，我们来具体看一个例子：

``` java
@FunctionalInterface
interface MyInterface {
    void test();

    @Override
    String toString();
}

public class FunctionalInterfaceTest {
    public static void main(String[] args) {

    }
}
```

我们定义了一个接口，MyInterface，这个接口中有两个抽象方法，但由于toString()是继承自Obeject类中的方法，所以并不会对这个接口的抽象方法的总数有影响，还是只有一个抽象方法，那么显然，它满足函数式接口的定义。

首先我们使用传统的匿名内部类的方式来实现MyInterface中的test()方法：

```java
@FunctionalInterface
interface MyInterface {
    void test();

    @Override
    String toString();
}

public class FunctionalInterfaceTest {

    public void MyTest(MyInterface myInterface) {
        System.out.println(1);
        myInterface.test();
        System.out.println(2);
    }
    public static void main(String[] args) {
        FunctionalInterfaceTest functionalInterfaceTest = new FunctionalInterfaceTest();
        functionalInterfaceTest.MyTest(new MyInterface() {
            @Override
            public void test() {
                System.out.println("myTest");
            }
        });
    }
}
```

MyInterface既然满足函数式接口的定义，那么就意味着我们可以使用Lambda表达式的方式来创建MyInterface的实例：

``` java
@FunctionalInterface
interface MyInterface {
    void test();

    @Override
    String toString();
}

public class FunctionalInterfaceTest {

    public void MyTest(MyInterface myInterface) {
        System.out.println(1);
        myInterface.test();
        System.out.println(2);
    }
    public static void main(String[] args) {
        FunctionalInterfaceTest functionalInterfaceTest = new FunctionalInterfaceTest();
        functionalInterfaceTest.MyTest(() -> System.out.println("myTest"));
    }
}
```

这两种写法的运行结果完全是等价的，编译器会自动根据上下文，来推测出 functionalInterfaceTest.MyTest()中需要接收的参数的类型，也就是说，() -> System.out.println("myTest")就是MyInterface 的一个实例，由于函数式接口中只会有一个抽象方法，那么对于这个Lambda表达式而言，箭头左边的部分，一定就是MyInterface 这个接口中唯一的抽象方法test()的参数，右边的部分，一定就是MyInterface 这个接口中唯一的抽象方法test()的实现，由于test()方法的参数是空值，所以左边的括号是空值。

这样看起来，其实MyInterface 这个接口中的抽象方法，具体叫什么名字，反而没有那么重要了，当然虽然这个函数的名字我们并不会直接去调用，但在起名字的时候，最好还是要有意义。

可能初学者并不能直观的认识到() -> System.out.println("myTest")表达的具体含义，我们可以换一种写法：

``` java
interface MyInterface {
    void test();

    @Override
    String toString();
}

public class FunctionalInterfaceTest {

    public void MyTest(MyInterface myInterface) {
        System.out.println(1);
        myInterface.test();
        System.out.println(2);
    }
    public static void main(String[] args) {
        FunctionalInterfaceTest functionalInterfaceTest = new FunctionalInterfaceTest();
        MyInterface myInterface = () -> System.out.println("myTest")
        functionalInterfaceTest.MyTest(myInterface);
    }
}
```

程序运行的效果是完全等价的，使用这种写法，我们就更能直观的体会到，() -> System.out.println("myTest")其实就是MyInterface的一个具体实现。

前面我们提到过，在Java中，Lambda表达式需要依赖于函数式接口这样一种特殊的形式，所以为什么是函数式接口呢？或者说为什么需要函数式接口呢？简而言之，Java是纯面向对象的语言，方法无法脱离类或者接口单独存在，因此在Java中，函数式编程必须依附这样一类特殊的对象：函数式接口。

实际上，对于一个特定的Lambda表达式是什么类型的，是需要上下文才能解读的，来看这样一个例子：

``` java
public class Essence {
    public static void main(String[] args) {

        InterfaceTestA interfaceTestA = () -> {};
        
        InterfaceTestB interfaceTestB = () -> {};
    }
}

interface InterfaceTestA {

    void myMethod();
}

interface InterfaceTestB {

    void myMethod2();
}
```

可以看到，对于这两个不同的函数式接口的实现都是() -> {}这同一种实现，对于这个特定的Lambda表达式，必须要联系他的上下文才能知道：

``` txt
 InterfaceTestA interfaceTestA
```

和

``` txt
 InterfaceTestB interfaceTestB
```

就是这两个Lambda表达式的上下文。

我们再回到遍历List集合的例子中：

``` java
public class LambdaTest {

    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello","world","hello world");
        list.forEach(item-> System.out.println(item));
    }
}
```

点击forEach方法，就会自动跳转到：

``` java
    /**
     * Performs the given action for each element of the {@code Iterable}
     * until all elements have been processed or the action throws an
     * exception.  Unless otherwise specified by the implementing class,
     * actions are performed in the order of iteration (if an iteration order
     * is specified).  Exceptions thrown by the action are relayed to the
     * caller.
     *
     * @implSpec
     * <p>The default implementation behaves as if:
     * <pre>{@code
     *     for (T t : this)
     *         action.accept(t);
     * }</pre>
     *
     * @param action The action to be performed for each element
     * @throws NullPointerException if the specified action is null
     * @since 1.8
     */
    default void forEach(Consumer<? super T> action) {
        Objects.requireNonNull(action);
        for (T t : this) {
            action.accept(t);
        }
    }
```

首先它是一个默认方法，接收的参数类型是Consumer，遍历这个集合，对集合中的每个元素执行Consumer中的accept()方法。

不妨来读一下这段文档：

 ``` txt
      Performs the given action for each element of the {@code Iterable}
      until all elements have been processed or the action throws an
      exception.  Unless otherwise specified by the implementing class,
      actions are performed in the order of iteration (if an iteration order
      is specified).  Exceptions thrown by the action are relayed to the
      caller
 ```

针对于Iterable每一个元素去执行给定的动作，换句话说，这里并不是将值作为参数，而是将行为作为参数进行传递，执行到集合中所有的元素执行完或者抛出异常为止，如果没有被实现类所指定的话，那么动作就会按照迭代的顺序去执行，是不是抛出异常取决于调用者。

其实这里最关键的就是Consumer这个参数，接下来我们重点分析Consumer这个函数式接口。

### Consumer函数式接口

首先我们观察Consumer这个接口的定义：
``` java
package java.util.function;

import java.util.Objects;

/**
 * Represents an operation that accepts a single input argument and returns no
 * result. Unlike most other functional interfaces, {@code Consumer} is expected
 * to operate via side-effects.
 *
 * <p>This is a <a href="package-summary.html">functional interface</a>
 * whose functional method is {@link #accept(Object)}.
 *
 * @param <T> the type of the input to the operation
 *
 * @since 1.8
 */
@FunctionalInterface
public interface Consumer<T> {

    /**
     * Performs this operation on the given argument.
     *
     * @param t the input argument
     */
    void accept(T t);

    /**
     * Returns a composed {@code Consumer} that performs, in sequence, this
     * operation followed by the {@code after} operation. If performing either
     * operation throws an exception, it is relayed to the caller of the
     * composed operation.  If performing this operation throws an exception,
     * the {@code after} operation will not be performed.
     *
     * @param after the operation to perform after this operation
     * @return a composed {@code Consumer} that performs in sequence this
     * operation followed by the {@code after} operation
     * @throws NullPointerException if {@code after} is null
     */
    default Consumer<T> andThen(Consumer<? super T> after) {
        Objects.requireNonNull(after);
        return (T t) -> { accept(t); after.accept(t); };
    }
}
```
可以看到：
``` txt
@since 1.8
```
这个接口是从JDK1.8才开始有的，consumer这个单词本身的意思是消费者
``` txt
  Represents an operation that accepts a single input argument and returns no
  result. Unlike most other functional interfaces, {@code Consumer} is expected
  to operate via side-effects.
 
```
Consumer代表了一种接收单个输入并且不返回结果的操作，与大多数其他的函数式接口不同的是，它可能会有副作用，这里的副作用指的是可能会修改传入参数的值。
``` txt
  <p>This is a <a href="package-summary.html">functional interface</a>
  whose functional method is {@link #accept(Object)}.
```
这是一个函数式接口，接口中的抽象方法是accept()。
对于前面List集合遍历的例子，  我们可以通过匿名内部类的方式来操作：
``` java
public class LambdaTest {

    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello","world","hello world");
        list.forEach(new Consumer<String>() {
            @Override
            public void accept(String s) {
                System.out.println(s);
            }
        });
    }
}
```
由于所有的匿名内部类又可以使用Lambda表达式来进行替换，所以：
``` 
public class LambdaTest {

    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello","world","hello world");
        list.forEach(item-> System.out.println(item));
    }
}
```
相信看到这里，对于函数式接口，大家已经有了一定的理解。这里因为类型推断的原因，编译器会自动推断Item的数据类型，所以无需说明item的类型。

### Function函数式接口

java8为我们了提供了很多的函数式接口，Function就是其中一个，首先我们来读一下它的javaDoc：
``` java
package java.util.function;

import java.util.Objects;

/**
 * Represents a function that accepts one argument and produces a result.
 *
 * <p>This is a <a href="package-summary.html">functional interface</a>
 * whose functional method is {@link #apply(Object)}.
 *
 * @param <T> the type of the input to the function
 * @param <R> the type of the result of the function
 *
 * @since 1.8
 */
@FunctionalInterface
public interface Function<T, R> {

    /**
     * Applies this function to the given argument.
     *
     * @param t the function argument
     * @return the function result
     */
    R apply(T t);

    /**
     * Returns a composed function that first applies the {@code before}
     * function to its input, and then applies this function to the result.
     * If evaluation of either function throws an exception, it is relayed to
     * the caller of the composed function.
     *
     * @param <V> the type of input to the {@code before} function, and to the
     *           composed function
     * @param before the function to apply before this function is applied
     * @return a composed function that first applies the {@code before}
     * function and then applies this function
     * @throws NullPointerException if before is null
     *
     * @see #andThen(Function)
     */
    default <V> Function<V, R> compose(Function<? super V, ? extends T> before) {
        Objects.requireNonNull(before);
        return (V v) -> apply(before.apply(v));
    }

    /**
     * Returns a composed function that first applies this function to
     * its input, and then applies the {@code after} function to the result.
     * If evaluation of either function throws an exception, it is relayed to
     * the caller of the composed function.
     *
     * @param <V> the type of output of the {@code after} function, and of the
     *           composed function
     * @param after the function to apply after this function is applied
     * @return a composed function that first applies this function and then
     * applies the {@code after} function
     * @throws NullPointerException if after is null
     *
     * @see #compose(Function)
     */
    default <V> Function<T, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (T t) -> after.apply(apply(t));
    }

    /**
     * Returns a function that always returns its input argument.
     *
     * @param <T> the type of the input and output objects to the function
     * @return a function that always returns its input argument
     */
    static <T> Function<T, T> identity() {
        return t -> t;
    }
}
```
同样的，与之前介绍的Consumer函数一样，都是一个函数式接口，都是从JDK8开始提供的。
```
  Represents a function that accepts one argument and produces a result.
 
  <p>This is a <a href="package-summary.html">functional interface</a>
  whose functional method is {@link #apply(Object)}.
 
  @param <T> the type of the input to the function
  @param <R> the type of the result of the function
```
Function提供了一个接收一个参数并且返回一个结果的函数，它的抽象方法是apply()，<T,R>分别表示输入参数的类型和返回结果的类型。

我们来看一个具体的例子：
``` java
public class FunctionTest {
    public static void main(String[] args) {
        FunctionTest functionTest = new FunctionTest();
        System.out.println(functionTest.compute(1, value -> 2 * value));
    }

    public int compute(int a, Function<Integer, Integer> function) {
        int result = function.apply(a);
        return result;
    }
}
```
这其中最关键的地方在于，compute的function参数传递的是一种行为，而不再是传统的值。
``` java
public class FunctionTest {
    public static void main(String[] args) {
        FunctionTest functionTest = new FunctionTest();
        System.out.println(functionTest.compute(1, value -> 2 * value));
        System.out.println(functionTest.compute(2, value -> value * value));
        System.out.println(functionTest.compute(3, value -> 3 + value));
    }

    public int compute(int a, Function<Integer, Integer> function) {
        int result = function.apply(a);
        return result;
    }
}
```
可以看到我们其实只定义了一个函数，每次只需要将我们的所定义好的行为，传入即可，这是与非函数式编程最大的区别。

来看一个输入参数与返回结果参数类型不一致的例子：
``` 
public class FunctionTest {

    public int method1(int a) {
        return 2 * a;
    }

    public int method2(int a) {
        return a * a;
    }

    public int method3(int a) {
        return 3 + a;
    }
}
```
每当有一种新的操作，我们就不得不定义一个新的函数，因为行为总是被预先定义好的，定义好行为之后我们再去调用。但是使用Lambda表达式，行为是调用的时候才动态的调用执行，这与之前的面向对象的编程方式是完全不同的。

这里还需要简单提及一下高阶函数，如果一个函数接收一个函数作为参数，或者返回一个函数作为返回值，那么该函数就叫做高阶函数。

比如我们上面给出的例子中的compute()方法，convert()方法就是高阶函数。

在Function接口中，还有两个默认方法：
```java 
    /**
     * Returns a composed function that first applies the {@code before}
     * function to its input, and then applies this function to the result.
     * If evaluation of either function throws an exception, it is relayed to
     * the caller of the composed function.
     *
     * @param <V> the type of input to the {@code before} function, and to the
     *           composed function
     * @param before the function to apply before this function is applied
     * @return a composed function that first applies the {@code before}
     * function and then applies this function
     * @throws NullPointerException if before is null
     *
     * @see #andThen(Function)
     */
    default <V> Function<V, R> compose(Function<? super V, ? extends T> before) {
        Objects.requireNonNull(before);
        return (V v) -> apply(before.apply(v));
    }
```
compose()这个函数返回的是一个复合函数，这个复合函数首先应用before这个Function，然后再去对这个结果应用当前的Function，如果当中任何一个Function抛出了异常，它取决于调用这个怎么去处理这个异常。 

参数before指的是在应用这个函数之前所要应用的当前的函数的函数，首先会应用before这个Function，然后再应用当前的Function。

cmpose()这个方法其实是将两个Function进行了组合，首先调用传入的Function的apply()方法，然后再调用当前的Function的apply()方法。这么做实现了两个函数式接口的串联，实际上也可以n个的串联。

``` java
    /**
     * Returns a composed function that first applies this function to
     * its input, and then applies the {@code after} function to the result.
     * If evaluation of either function throws an exception, it is relayed to
     * the caller of the composed function.
     *
     * @param <V> the type of output of the {@code after} function, and of the
     *           composed function
     * @param after the function to apply after this function is applied
     * @return a composed function that first applies this function and then
     * applies the {@code after} function
     * @throws NullPointerException if after is null
     *
     * @see #compose(Function)
     */
    default <V> Function<T, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (T t) -> after.apply(apply(t));
    }
```
andThen()这个方法刚好是反过来的，首先会应用当前的Function，然后再去对应用当前的这个对象的Function。

最后这个方法就比较简单了：
``` java
  /**
     * Returns a function that always returns its input argument.
     *
     * @param <T> the type of the input and output objects to the function
     * @return a function that always returns its input argument
     */
    static <T> Function<T, T> identity() {
        return t -> t;
    }
```
它总是返回输入的变量。identity本身的意思也就是同一性，下面我们通过具体的例子来说明：
```java
public class FunctionTest {
    public static void main(String[] args) {
        FunctionTest functionTest = new FunctionTest();
        System.out.println(functionTest.compute(2, value -> value * 3, value -> value * value));
        System.out.println(functionTest.compute2(2, value -> value * 3, value -> value * value));
    }

    public int compute(int a, Function<Integer, Integer> function1, Function<Integer, Integer> function2) {
        return function1.compose(function2).apply(a);
    }

    public int compute2(int a, Function<Integer, Integer> function1, Function<Integer, Integer> function2) {
        return function1.andThen(function2).apply(a);
    }

}
```
对于Function接口中的apply()方法而言，它只接受一个参数，并返回一个结果，如果想输入两个参数并返回结果，显然它是做不到的，再JDK中有这样一个函数式接口BiFunction：
``` java
@FunctionalInterface
public interface BiFunction<T, U, R> {

    /**
     * Applies this function to the given arguments.
     *
     * @param t the first function argument
     * @param u the second function argument
     * @return the function result
     */
    R apply(T t, U u);

    /**
     * Returns a composed function that first applies this function to
     * its input, and then applies the {@code after} function to the result.
     * If evaluation of either function throws an exception, it is relayed to
     * the caller of the composed function.
     *
     * @param <V> the type of output of the {@code after} function, and of the
     *           composed function
     * @param after the function to apply after this function is applied
     * @return a composed function that first applies this function and then
     * applies the {@code after} function
     * @throws NullPointerException if after is null
     */
    default <V> BiFunction<T, U, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (T t, U u) -> after.apply(apply(t, u));
    }
}
```
Bi实际上是Bidirectional的缩写，这个单词本身的含义是双向的意思。BiFunction这个函数式接口的定义：
``` txt

/**
 * Represents a function that accepts two arguments and produces a result.
 * This is the two-arity specialization of {@link Function}.
 *
 * <p>This is a <a href="package-summary.html">functional interface</a>
 * whose functional method is {@link #apply(Object, Object)}.
 *
 * @param <T> the type of the first argument to the function
 * @param <U> the type of the second argument to the function
 * @param <R> the type of the result of the function
 *
 * @see Function
 * @since 1.8
 */
```
接收两个参数并且返回一个结果，它是Function接口的一种特殊形式，有三个泛型，T，U分别是两个接收的参数的类型，R是返回的结果的类型。

如果我们想定义四则运算的话，使用传统的方式，我们可能会写出如下代码：
``` java
public class BiFunctionTest {

    public int add(int a, int b) {
        return a + b;
    }

    public int subtract(int a, int b) {
        return a - b;
    }
    ...
}
```
观察不难发现，四则运算正好就是输入两个参数，返回一个结果，正好满足BiFunction的定义，现在我们使用BiFunction来实现同样的功能：
``` java
public class BiFunctionTest {
    public static void main(String[] args) {
        BiFunctionTest biFunctionTest = new BiFunctionTest();
        System.out.println(biFunctionTest.compute(1, 2, (value1, value2) -> value1 + value2));
        System.out.println(biFunctionTest.compute(1, 2, (value1, value2) -> value1 - value2));
        System.out.println(biFunctionTest.compute(1, 2, (value1, value2) -> value1 * value2));
        System.out.println(biFunctionTest.compute(1, 2, (value1, value2) -> value1 / value2));
    }

    public int compute(int a, int b, BiFunction<Integer, Integer, Integer> biFunction) {
        return biFunction.apply(a, b);
    }
}
```
但是需要注意的是，在Bifunction中只有一个默认方法andThen()，而没有compose()方法:
 ``` java
    /**
     * Returns a composed function that first applies this function to
     * its input, and then applies the {@code after} function to the result.
     * If evaluation of either function throws an exception, it is relayed to
     * the caller of the composed function.
     *
     * @param <V> the type of output of the {@code after} function, and of the
     *           composed function
     * @param after the function to apply after this function is applied
     * @return a composed function that first applies this function and then
     * applies the {@code after} function
     * @throws NullPointerException if after is null
     */
    default <V> BiFunction<T, U, V> andThen(Function<? super R, ? extends V> after) {
        Objects.requireNonNull(after);
        return (T t, U u) -> after.apply(apply(t, u));
    }
 ```
原因是显而易见的，如果有的话，只能返回一个结果，而Bifunction要求接收两个参数，返回一个结果，这显然是不行的，但是对于andThen()方法，after这个Function类型的参数，正好可以接收BiFunction这个接口的返回的结果作为参数。

同样的我们可以举一个例子：
```java
public class BiFunctionTest {
    public static void main(String[] args) {
        BiFunctionTest biFunctionTest = new BiFunctionTest();
        System.out.println(biFunctionTest.compute(1, 2, (value1, value2) -> value1 + value2, value -> value * value));
    }

    public int compute(int a, int b, BiFunction<Integer, Integer, Integer> biFunction, Function<Integer, Integer> function) {
        return biFunction.andThen(function).apply(a, b);
    }
}
```
```java
public class PersonTest {
    public static void main(String[] args) {
        Person person1 = new Person("zhangsan", 20);
        Person person2 = new Person("lisi", 30);
        Person person3 = new Person("wangwu", 40);

        List<Person> persons = Arrays.asList(person1, person2, person3);
        PersonTest personTest = new PersonTest();
        List<Person> persons2 = personTest.getPersonByAge(25, persons);
        persons2.forEach(System.out::println);

    }

    public List<Person> getPersonByUsername(String username, List<Person> persons) {
        return persons.stream().filter(person -> person.getUsername().equals(username)).collect(Collectors.toList());
    }

    public List<Person> getPersonByAge(int age, List<Person> persons) {
        BiFunction<Integer, List<Person>, List<Person>> biFunction = (ageOfPerson, personList) -> {
            return personList.stream().filter(person -> person.getAge() > age).collect(Collectors.toList());
        };
        return biFunction.apply(age, persons);
    }
}
```

### Predicate函数式接口

同样的方式，我们首先类阅读一下Predicate的JavaDoc：
``` java
/**
 * Represents a predicate (boolean-valued function) of one argument.
 *
 * <p>This is a <a href="package-summary.html">functional interface</a>
 * whose functional method is {@link #test(Object)}.
 *
 * @param <T> the type of the input to the predicate
 *
 * @since 1.8
 */
@FunctionalInterface
public interface Predicate<T> {

    /**
     * Evaluates this predicate on the given argument.
     *
     * @param t the input argument
     * @return {@code true} if the input argument matches the predicate,
     * otherwise {@code false}
     */
    boolean test(T t);

    /**
     * Returns a composed predicate that represents a short-circuiting logical
     * AND of this predicate and another.  When evaluating the composed
     * predicate, if this predicate is {@code false}, then the {@code other}
     * predicate is not evaluated.
     *
     * <p>Any exceptions thrown during evaluation of either predicate are relayed
     * to the caller; if evaluation of this predicate throws an exception, the
     * {@code other} predicate will not be evaluated.
     *
     * @param other a predicate that will be logically-ANDed with this
     *              predicate
     * @return a composed predicate that represents the short-circuiting logical
     * AND of this predicate and the {@code other} predicate
     * @throws NullPointerException if other is null
     */
    default Predicate<T> and(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) && other.test(t);
    }

    /**
     * Returns a predicate that represents the logical negation of this
     * predicate.
     *
     * @return a predicate that represents the logical negation of this
     * predicate
     */
    default Predicate<T> negate() {
        return (t) -> !test(t);
    }

    /**
     * Returns a composed predicate that represents a short-circuiting logical
     * OR of this predicate and another.  When evaluating the composed
     * predicate, if this predicate is {@code true}, then the {@code other}
     * predicate is not evaluated.
     *
     * <p>Any exceptions thrown during evaluation of either predicate are relayed
     * to the caller; if evaluation of this predicate throws an exception, the
     * {@code other} predicate will not be evaluated.
     *
     * @param other a predicate that will be logically-ORed with this
     *              predicate
     * @return a composed predicate that represents the short-circuiting logical
     * OR of this predicate and the {@code other} predicate
     * @throws NullPointerException if other is null
     */
    default Predicate<T> or(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) || other.test(t);
    }

    /**
     * Returns a predicate that tests if two arguments are equal according
     * to {@link Objects#equals(Object, Object)}.
     *
     * @param <T> the type of arguments to the predicate
     * @param targetRef the object reference with which to compare for equality,
     *               which may be {@code null}
     * @return a predicate that tests if two arguments are equal according
     * to {@link Objects#equals(Object, Object)}
     */
    static <T> Predicate<T> isEqual(Object targetRef) {
        return (null == targetRef)
                ? Objects::isNull
                : object -> targetRef.equals(object);
    }
}

```
Predicate也是一个重要的函数式接口
``` txt
/**
 * Represents a predicate (boolean-valued function) of one argument.
 *
 * <p>This is a <a href="package-summary.html">functional interface</a>
 * whose functional method is {@link #test(Object)}.
 *
 * @param <T> the type of the input to the predicate
 *
 * @since 1.8
 */
```
predicate这个单词本身是谓词， 阐明， 断言的意思，这里说，Predicate代表了一个接收一个参数，返回一个boolean值类型的函数式接口，其中方法名叫test()。
```txt
  /**
     * Evaluates this predicate on the given argument.
     *
     * @param t the input argument
     * @return {@code true} if the input argument matches the predicate,
     * otherwise {@code false}
     */
```
针对于给定的T类型的参数t来计算，如果与predicate相匹配，则返回一个true,否则返回false。

针对于Predicate可以定义，我们可以给出例子：
``` java
public class PredicateTest {

    public static void main(String[] args) {
        Predicate<String> predicate = p -> p.length() > 5;
        System.out.println(predicate.test("hello"));
    }
}
```
Predicate在集合与stream中有大量的应用，再来看一些具体的例子：
```java
public class PredicateTest2 {
    public static void main(String[] args) {
        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        PredicateTest2 predicateTest2 = new PredicateTest2();
        // 找到集合中所有的偶数
        predicateTest2.conditionFilter(list, item -> item % 2 == 0);
        // 找到集合中所有的奇数
        predicateTest2.conditionFilter(list, item -> item % 2 != 0);
        // 找到集合中所有大于5的数
        predicateTest2.conditionFilter(list, item -> item > 5);
        // 找到集合中所有小于3的数
        predicateTest2.conditionFilter(list, item -> item < 3);
    }

    public void conditionFilter(List<Integer> list, Predicate<Integer> predicate) {
        for (Integer integer : list) {
            if (predicate.test(integer)) {
                System.out.println(integer);
            }
        }

    }
}
```
可以想象的到，如果要使用传统的方式实现这些需求，我们就需要编写很多个具体的方法，但是如果使用Lambda表达式，我们就可以定义一个通用的函数，具体的行为再在调用的时候传入。

Predicate中除了抽象方法test()，还有：
``` txt
    /**
     * Returns a composed predicate that represents a short-circuiting logical
     * AND of this predicate and another.  When evaluating the composed
     * predicate, if this predicate is {@code false}, then the {@code other}
     * predicate is not evaluated.
     *
     * <p>Any exceptions thrown during evaluation of either predicate are relayed
     * to the caller; if evaluation of this predicate throws an exception, the
     * {@code other} predicate will not be evaluated.
     *
     * @param other a predicate that will be logically-ANDed with this
     *              predicate
     * @return a composed predicate that represents the short-circuiting logical
     * AND of this predicate and the {@code other} predicate
     * @throws NullPointerException if other is null
     */
    default Predicate<T> and(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) && other.test(t);
    }
```
这个函数表示当前的Predicate与另一个Predicate的短路与，当计算这个复合函数的时候，如果前面的Predicate的值为false,那么后面的将不再会被计算，如果在计算过程中，任何一个Predicate会抛出异常的话，怎么做取决于调用者，如果当前的Predicate抛出了异常，那么后者也不会被计算。
```txt
   /**
     * Returns a predicate that represents the logical negation of this
     * predicate.
     *
     * @return a predicate that represents the logical negation of this
     * predicate
     */
    default Predicate<T> negate() {
        return (t) -> !test(t);
    }
```
negate本身是否定的意思，表示返回当前Predicate的逻辑非。
``` txt
    /**
     * Returns a composed predicate that represents a short-circuiting logical
     * OR of this predicate and another.  When evaluating the composed
     * predicate, if this predicate is {@code true}, then the {@code other}
     * predicate is not evaluated.
     *
     * <p>Any exceptions thrown during evaluation of either predicate are relayed
     * to the caller; if evaluation of this predicate throws an exception, the
     * {@code other} predicate will not be evaluated.
     *
     * @param other a predicate that will be logically-ORed with this
     *              predicate
     * @return a composed predicate that represents the short-circuiting logical
     * OR of this predicate and the {@code other} predicate
     * @throws NullPointerException if other is null
     */
    default Predicate<T> or(Predicate<? super T> other) {
        Objects.requireNonNull(other);
        return (t) -> test(t) || other.test(t);
    }
```
类似的，这个方法是计算逻辑或的操作，如果当前的Predicate是true的话，后面的将不会再被计算，关于Predicate的三个默认方法，我们来看具体例子：
``` java
public class PredicateTest2 {
    public static void main(String[] args) {
        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        PredicateTest2 predicateTest2 = new PredicateTest2();
        // 找到集合中所有的偶数
        predicateTest2.conditionFilter(list, item -> item % 2 == 0);
        // 找到集合中所有的奇数
        predicateTest2.conditionFilter(list, item -> item % 2 != 0);
        // 找到集合中所有大于5的数
        predicateTest2.conditionFilter(list, item -> item > 5);
        // 找到集合中所有小于3的数
        predicateTest2.conditionFilter(list, item -> item < 3);
        // 找到集合中所有大于5并且是偶数的数
        predicateTest2.conditionFilter2(list, item -> item > 5, item -> item % 2 == 0);
        // 找到集合中所有大于5或者是偶数的数
        predicateTest2.conditionFilter3(list, item -> item > 5, item -> item % 2 == 0);

        predicateTest2.conditionFilter4(list, item -> item > 5, item -> item % 2 == 0);
    }

    public void conditionFilter(List<Integer> list, Predicate<Integer> predicate) {
        for (Integer integer : list) {
            if (predicate.test(integer)) {
                System.out.println(integer);
            }
        }

    }

    public void conditionFilter2(List<Integer> list, Predicate<Integer> predicate,
                                 Predicate<Integer> predicate2) {
        for (Integer integer : list) {
            if (predicate.and(predicate2).test(integer)) {
                System.out.println(integer);
            }
        }
    }

    public void conditionFilter3(List<Integer> list, Predicate<Integer> predicate,
                                 Predicate<Integer> predicate2) {
        for (Integer integer : list) {
            if (predicate.or(predicate2).test(integer)) {
                System.out.println(integer);
            }
        }
    }

    public void conditionFilter4(List<Integer> list, Predicate<Integer> predicate,
                                 Predicate<Integer> predicate2) {
        for (Integer integer : list) {
            if (predicate.or(predicate2).negate().test(integer)) {
                System.out.println(integer);
            }
        }
    }
}
```
最后我们来看一下它唯一的static方法：
``` java
    /**
     * Returns a predicate that tests if two arguments are equal according
     * to {@link Objects#equals(Object, Object)}.
     *
     * @param <T> the type of arguments to the predicate
     * @param targetRef the object reference with which to compare for equality,
     *               which may be {@code null}
     * @return a predicate that tests if two arguments are equal according
     * to {@link Objects#equals(Object, Object)}
     */
    static <T> Predicate<T> isEqual(Object targetRef) {
        return (null == targetRef)
                ? Objects::isNull
                : object -> targetRef.equals(object);
    }
```
用来根据Objects类中的equals()方法判断两个参数是不是相等，注意，这里并不是Object类，而是Objects，这是从JDK1.7之后新增加的类。
Objects::isNull是一个静态方法的方法引用，

``` java
    public static boolean isNull(Object obj) {
        return obj == null;
    }
```
来看具体的例子：
``` java
public class PredicateTest3 {
    public static void main(String[] args) {
        PredicateTest3 predicateTest3 = new PredicateTest3();
        System.out.println(predicateTest3.isEqual("test").test(new Date()));
    }

    public Predicate<Date> isEqual(Object object) {
        return Predicate.isEqual(object);
    }
}
```
本质上这个其实"test".equals(new Date())，那么显然结果是false。

### Supplier函数式接口

同样的，我们来看一下Supplier函数式接口的文档：

```java
/**
 * Represents a supplier of results.
 *
 * <p>There is no requirement that a new or distinct result be returned each
 * time the supplier is invoked.
 *
 * <p>This is a <a href="package-summary.html">functional interface</a>
 * whose functional method is {@link #get()}.
 *
 * @param <T> the type of results supplied by this supplier
 *
 * @since 1.8
 */
@FunctionalInterface
public interface Supplier<T> {

    /**
     * Gets a result.
     *
     * @return a result
     */
    T get();
}

```

首先来看类的说明：

```txt
Represents a supplier of results.
There is no requirement that a new or distinct result be returned each time the supplier is invoked.
```

Supplier表示提供结果的供应者，它每次被调用的时候无需保证返回不同的结果，换言之，每次被调用的结果可能是相同的。

Supplier不接受参数，并返回一个结果。

我们来新建一个测试类：

```java
public class SupplierJyc {
    public static void main(String[] args) {
        Supplier<String> supplierJyc = () -> "hello word";
        System.out.println(supplierJyc.get());
    }
}
```

显然，控制台会打印出以下结果：

```txt
> Task :SupplierJyc.main()
hello word
```

实际上，Supplier更多的适用于工厂创建对象，下面我们用具体的例子来说明，首先创建一个Student类，并生成无参构造方法和setter及getter方法：

```java
public class Student {

    private String name = "zhangsan";
    
    private int age = 20;

    public Student() {

    }
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}

```

下面我们使用Supplier来创建一个对象：

```java
public class StudentTest {
    public static void main(String[] args) {
        Supplier<Student> supplier = () -> new Student();
        System.out.println(supplier.get().getName());
    }
}
```

正式由于Supplier这个函数式接口不接收参数，并且返回一个泛型T类型的对象，所以() -> new Student()就是Supplier函数式接口的一个实例。除了通过这种方式创建实例外，我们还可以使用一种特殊的方式来创建Supplier的实例，即对象引用：

```java
public class StudentTest {
    public static void main(String[] args) {
        Supplier<Student> supplier = () -> new Student();
        System.out.println(supplier.get().getName());
        System.out.println("--------------");

        Supplier<Student> supplier2 = Student::new;
        System.out.println(supplier2.get().getName());
    }
}

```

这会与上面的代码得到相同的结果，如果点击Student::new中的new的话，会自动跳转到Student的无参构造的地方：

```java
  public Student() {

    }
```

说明这个新的语法就是在调用Student的无参构造来创建对象，而这个无参构造刚好满足不接受参数，只返回对象的Supplier函数式接口的要求，所以创建了Student的实例。

当我们修改这个类的默认构造方法，去掉没有参数的构造方法：

```java
    public Student(String name) {
        this.name = name;
    }
```

编译器就会提示我们不能解析构造方法：

![1597851410941](D:\笔记\jiyongchao-qf.github.io\docs\views\images\Functionalprogramming.md)

这也验证了我们之前的说法。

以上就是几个最基础也是最重要的几个函数式接口，在此基础上，JDK还为我们提供了一些其他的函数式接口，例如BinaryOperator，他们可以看成是前面几个函数式接口的扩展。

### 函数式接口扩展

相同的方式，我们首先来阅读一下BinaryOperator这个函数式接口的文档：

```txt
/**
 * Represents an operation upon two operands of the same type, producing a result
 * of the same type as the operands.  This is a specialization of
 * {@link BiFunction} for the case where the operands and the result are all of
 * the same type.
 *
 * <p>This is a <a href="package-summary.html">functional interface</a>
 * whose functional method is {@link #apply(Object, Object)}.
 *
 * @param <T> the type of the operands and result of the operator
 *
 * @see BiFunction
 * @see UnaryOperator
 * @since 1.8
 */
@FunctionalInterface
public interface BinaryOperator<T> extends BiFunction<T,T,T> {
    /**
     * Returns a {@link BinaryOperator} which returns the lesser of two elements
     * according to the specified {@code Comparator}.
     *
     * @param <T> the type of the input arguments of the comparator
     * @param comparator a {@code Comparator} for comparing the two values
     * @return a {@code BinaryOperator} which returns the lesser of its operands,
     *         according to the supplied {@code Comparator}
     * @throws NullPointerException if the argument is null
     */
    public static <T> BinaryOperator<T> minBy(Comparator<? super T> comparator) {
        Objects.requireNonNull(comparator);
        return (a, b) -> comparator.compare(a, b) <= 0 ? a : b;
    }

    /**
     * Returns a {@link BinaryOperator} which returns the greater of two elements
     * according to the specified {@code Comparator}.
     *
     * @param <T> the type of the input arguments of the comparator
     * @param comparator a {@code Comparator} for comparing the two values
     * @return a {@code BinaryOperator} which returns the greater of its operands,
     *         according to the supplied {@code Comparator}
     * @throws NullPointerException if the argument is null
     */
    public static <T> BinaryOperator<T> maxBy(Comparator<? super T> comparator) {
        Objects.requireNonNull(comparator);
        return (a, b) -> comparator.compare(a, b) >= 0 ? a : b;
    }
}
```

首先来看类的说明：

```txt
Represents an operation upon two operands of the same type, producing a result of the same type as the operands. This is a specialization of BiFunction for the case where the operands and the result are all of the same type.
This is a functional interface whose functional method is apply(Object, Object).
```

BinaryOperator表示针对于两个相同运算对象的操作，并且生成与运算对象相同类型的结果类型，这是当使用BiFunction运算对象与结果类型相同时候的一个特例，我们知道，在BiFunction中，类型可以是不相同的：

```java
BiFunction<T, U, R>
```

同时其中的抽象方法apply()，也接收了两个不同类型的参数，并且返回了不同类型的结果：

```java
R apply(T t, U u);
```

当类型相同的时候，就变成了：

```java
 BinaryOperator<T> extends BiFunction<T,T,T>
```

apply()方法也就变成了：

```java
T apply(T t, T u);
```

BinaryOperator中还有两个静态方法，首先来看minBy()的说明：

```txt
Returns a BinaryOperator which returns the lesser of two elements according to the specified Comparator.
```

minBy()方法会根据比较器Comparator返回两个元素中比较小的那一个，来看一个具体的例子，我们给定两个字符串，来返回比较小的那一个：

```java
public class BinaryOperatorTest {
    public static void main(String[] args) {
        BinaryOperatorTest binaryOperatorTest = new BinaryOperatorTest();
        System.out.println(binaryOperatorTest.getShort("hellohello", "hello", (a, b) -> a.length() - b.length()));
        System.out.println(binaryOperatorTest.getShort("hellohello", "hello", (a, b) -> a.charAt(0) - b.charAt(0)));
    }

    public String getShort(String a, String b, Comparator<String> comparator) {
        return BinaryOperator.minBy(comparator).apply(a, b);
    }
}
```

显然使用maxBy()方法会获得相反的结果。

其实在java.util.function这个包下面，还有很多的其他的函数式接口，比如BiConsumer，BiFunction，LongPredicate，IntSupplier等等，这些都是对于这几个基础的函数式接口的有力的补充，也是这几个基础的函数式接口的特例。

## 方法引用

```java
public class MethodReferenceDemo {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");
        list.forEach(System.out::println);
    }
}

```

这个例子中的::就是JDK8中新增的语法，叫做方法引用，它可以看成是Lambda表达式的一种语法糖，如果所使用的Lambda表达式恰好被实现过的话，就可以使用方法引用来写出更加简洁的代码，我们可以将方法引用看作是一个【函数指针（function pointer）】。

方法引用共分为4类：静态方法引用、构造方法引用、类的任意对象的实例方法引用、特定对象的实例方法引用，对于其中的每一种，我们都会给出Lambda表达式的方式和方法引用的方式实现相同的功能，以此来对照学习。

### 静态方法引用

首先定义一个类：

```java
public class Student {
    private String name;
    private int score;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public static int compareStudentByScore(Student student1, Student student2) {
        return student1.score - student2.score;
    }

    private static int compareStudentByName(Student student1, Student student2) {
        return student1.getName().compareToIgnoreCase(student2.getName());
    }
}
```

接下来我们使用List集合中新增加的sort方法进行排序：

```java
public class MethodReferenceDemo {
    public static void main(String[] args) {
        Student student1 = new Student("zhangsan", 10);
        Student student2 = new Student("lisi", 90);
        Student student3 = new Student("wangwu", 50);
        Student student4 = new Student("zhaoliu", 40);

        List<Student> students = Arrays.asList(student1, student2, student3, student4);
        students.sort((studentParam1, studentParam2) -> Student.compareStudentByScore(studentParam1, studentParam2));

        students.forEach(student -> System.out.println(student.getScore()));
    }
}
```

这里我们排序的时候直接调用的是List集合中的默认方法sort（），这也是在JDK8中新增加的方法：

```java
  default void sort(Comparator<? super E> c) {
        Object[] a = this.toArray();
        Arrays.sort(a, (Comparator) c);
        ListIterator<E> i = this.listIterator();
        for (Object e : a) {
            i.next();
            i.set((E) e);
        }
    }

```

可以看到其接收Comparator作为参数，我们再来看一下Comparator的类定义情况：

```java
@FunctionalInterface
public interface Comparator<T> {
    int compare(T o1, T o2);
}
```

可以看到这是一个函数式接口，并且接收两个相同类型的参数，并且返回一个Int值，它会根据定义好的排序规则，如果第一个参数大于第二个参数，那么会返回正数，相等会返回0，小于会返回负数，针对于以上的例子，Student类中的静态方法compareStudentByScore恰好是接收两个参数，并且返回一个结果，所以可以作为Comparator这个Lambda表达式的方法体，其实我们还可以使用方法引用的方式，来完成相同的功能：

```java
public class MethodReferenceDemo {
    public static void main(String[] args) {
        Student student1 = new Student("zhangsan", 10);
        Student student2 = new Student("lisi", 90);
        Student student3 = new Student("wangwu", 50);
        Student student4 = new Student("zhaoliu", 40);

        List<Student> students = Arrays.asList(student1, student2, student3, student4);
        // students.sort((studentParam1, studentParam2) -> Student.compareStudentByScore(studentParam1, studentParam2));

        // students.forEach(student -> System.out.println(student.getScore()));

        System.out.println("==================================");
        students.sort(Student::compareStudentByScore);
        students.forEach(student -> System.out.println(student.getScore()));
    }
}
```

这两种方式的效果完全等价，换言之，在这个场景下，方法引用与Lambda表达式完全等价，方法引用是Lambda表达式的一种语法糖，只有当某一个已经存在的方法，恰好满足了Lambda表达式的要求，才可以使用方法引用，Lambda表达式其实是一种更为通用的形式，而方法引用则需要满足一些条件才能使用。

### 实例方法引用

我们依然使用排序这个例子，这次我们使用另一种写法来完成这个功能，首先定义一个这样的类：

```java
public class StudentComparator {
    public int compareStudentByScore(Student student1, Student student2) {
        return student1.getScore() - student2.getScore();
    }

    public int compareStudentByName(Student student1, Student student2) {
        return student1.getName().compareToIgnoreCase(student2.getName());
    }
}

```

然后来实现对于Student的排序：

```java
public class MethodReferenceDemo {
    
    public static void main(String[] args) {
        Student student1 = new Student("zhangsan", 10);
        Student student2 = new Student("lisi", 90);
        Student student3 = new Student("wangwu", 50);
        Student student4 = new Student("zhaoliu", 40);
        
        StudentComparator studentComparator = new StudentComparator();
        students.sort((studentParam1, studentParam2) -> studentComparator.
                compareStudentByScore(studentParam1, studentParam2));
        
        students.forEach(student -> System.out.println(student.getScore()));
    }
}
```

这里我们直接使用StudentComparator实例中的compareStudentByScore来进行排序，事实上，这种场景下，也可以使用方法引用来替代：

``` java
public class MethodReferenceDemo {
    public static void main(String[] args) {
        Student student1 = new Student("zhangsan", 10);
        Student student2 = new Student("lisi", 90);
        Student student3 = new Student("wangwu", 50);
        Student student4 = new Student("zhaoliu", 40);

        List<Student> students = Arrays.asList(student1, student2, student3, student4);
        StudentComparator studentComparator = new StudentComparator();
        students.sort(studentComparator::compareStudentByScore);
        students.forEach(student -> System.out.println(student.getScore()));
        System.out.println("==================================");
        students.sort(studentComparator::compareStudentByName);
        students.forEach(student -> System.out.println(student.getName()));
    }
}
```

与静态方法引用的不同的是，这里我们调用的是类实例的方法。

### 实例方法名引用

首先，在Student类中，我们增加一个方法：

```java
package lambda;

/**
 * 2 * @Author: jiyongchao
 * 3 * @Date: 2020/8/20 23:56
 * 4
 */
public class Student {
    private String name;
    private int score;

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public static int compareStudentByScore(Student student1, Student student2) {
        return student1.score - student2.score;
    }

    private static int compareStudentByName(Student student1, Student student2) {
        return student1.getName().compareToIgnoreCase(student2.getName());
    }

    public int compareByScore(Student student) {
        return this.getScore() - student.getScore();
    }

    public int compareByName(Student student) {
        return this.getName().compareToIgnoreCase(student.getName());
    }
}
```

在之前的例子中，compareStudentByScore与compareStudentByName方法实际上是我们有意为之的，实际上这两个静态方法放在任何一个类中，都是可以调用的，通常我们比较两个对象时，更多的情况是，传入一个对象，并与当前对象进行比较，这也是新增加的compareByScore和compareByName的作用，在这种情况下，排序规则又可以做出如下修改：

```java
public class MethodReferenceDemo {
    public static void main(String[] args) {
        Student student1 = new Student("zhangsan", 10);
        Student student2 = new Student("lisi", 90);
        Student student3 = new Student("wangwu", 50);
        Student student4 = new Student("zhaoliu", 40);

        List<Student> students = Arrays.asList(student1, student2, student3, student4);
        students.sort(Student::compareByName);
        students.forEach(student -> System.out.println(student.getName()));
    }
}
```

我们再举一个例子，来加深对于实例方法名引用的理解：

```java
public class MethodReferenceDemo {
    public static void main(String[] args) {
        List<String> cities = Arrays.asList("qingdao", "chongqing", "tianjin", "beijing");
        Collections.sort(cities, (city1, city2) -> city1.compareToIgnoreCase(city2));
        cities.forEach(city -> System.out.println(city));
        Collections.sort(cities, String::compareToIgnoreCase);
       	cities.forEach(city -> System.out.println(city));
    }
}
```

这个时候，再回到集合遍历的例子当中：

```java
System.out::println()
```

实际上，查看System源码可以发现out实际上是PrintStream的一个对象：

```java
    public final static PrintStream out = null;
```

而println()方法就是PrintStream中的一个方法：

```java
  public void println(double x) {
        synchronized (this) {
            print(x);
            newLine();
        }
    }
```

### 构造方法引用

前面我们介绍过的Supplier函数式接口其中一个很重要的应用就是构造方法引用，因为其不接收参数，返回值的特性正好与构造方法的作用不谋而合，所以，我们可以很轻松的写出如下代码：

```java
public class MethodReferenceDemo {

    public String getString(Supplier<String> supplier) {
        return supplier.get() + "test";
    }
    public static void main(String[] args) {
        MethodReferenceDemo methodReferenceDemo = new MethodReferenceDemo();
        System.out.println(methodReferenceDemo.getString(String::new));

    }
}
```

除了无参构造，还可以调用有参数的构造方法，这个时候就变成了接收一个参数，返回值：

```java
public class MethodReferenceDemo {

    public String getString2(String str, Function<String, String> function) {
        return function.apply(str);
    }

    public static void main(String[] args) {
        MethodReferenceDemo methodReferenceDemo = new MethodReferenceDemo();
        System.out.println(methodReferenceDemo.getString2("hello", String::new));

    }
}
```

### 默认方法

在方法引用的最后，我们补充一些关于JDK8中默认方法的相关介绍，首先定义这样两个接口，接口中有同名的默认方法：

```java
public interface MyInterface1 {
    default void myMethod() {
        System.out.println("MyInterface1");
    }
}
```

```java
public interface MyInterface2 {
    default void myMethod() {
        System.out.println("MyInterface2");
    }
}
```

这个时候，假设有一个类，要实现这两个接口，但是由于这两个接口中有同名的默认方法，所以，编译器无法自动推断出要继承哪一个接口中的默认方法，一般这个时候，处理方式有两种，一种是在实现类中重写方法：

```java
public class MyClass implements MyInterface1, MyInterface2 {

    @Override
    public void myMethod() {
        System.out.println("MyInterface1");
    }

    public static void main(String[] args) {
        MyClass myClass = new MyClass();
        myClass.myMethod();
    }
}
```

这种方式的弊端在于，我们需要将某一个子类中的默认方法实现重写一遍，如果代码很多，既费时，可维护性也比较差，好在JDK为我们提供了另一种方式来完成：

```java
public class MyClass implements MyInterface1, MyInterface2 {

    @Override
    public void myMethod() {
       MyInterface1.super.myMethod();
    }

    public static void main(String[] args) {
        MyClass myClass = new MyClass();
        myClass.myMethod();
    }
}
```

对于以上例子我们再做一个小的扩展，增加一个MyInterface1的实现类：

```java
public class MyInterface1Impl implements MyInterface1 {
    @Override
    public void myMethod() {
        System.out.println("MyInterface1Impl");
    }
}

```

这个时候，我们再定义一个类，这个类继承MyInterface1Impl，并且实现MyInterface2：

```java
public class MyClass2 extends MyInterface1Impl implements MyInterface2 {
    public static void main(String[] args) {
        MyClass2 myClass2 = new MyClass2();
        myClass2.myMethod();
    }
}
```

这个时候调用当前类的myMethod()方法并不会报错，也就是说，编译器自动推断出了我们要想调用MyInterface1Impl中的myMethod()方法，还是MyInterface2中的默认方法myMethod()，这实际上是JDK中的一个约定，编译器会认为继承的优先级大于实现，类中的方法才表示具体的行为，而接口更多的时候还是表示一种模板或者契约。

增加默认方法的特性是Java对于支持函数式编程一个非常重要的改变，在上面排序的例子中可以看到，List这样一个顶层的集合增加了排序的方法，试想，如果没有默认方法，那对于想从JDK7升级到JDK8的人无疑是一场灾难，如果一旦在自己的代码实现过List，那意味你需要重写所有的子类，而JDK在很多的接口中都增加了默认方法，为了升级JDK还需要入侵式的修改客户端的代码，这显然是不合适的，那为什么还会增加默认方法的机制呢？其目的，就是为了更为方便的编写函数式的代码，同时也是为了向后兼容的一种妥协，从这一个层面来说，Java的函数式编程并不是完美无暇的，更像是一个裹足前行的人，这也是面向对象带来限制，但我们还是非常振奋，JDK8使我们看到了Java这门古老的语言的全新面貌。

增加默认方法也可以看到，接口和抽象类的区别越来越小了。

## Stream实践

在前面的章节我们花费了不少的章节整理了Lambda表达式的相关特性，也举出了不少的例子来展示了Lambda表达式的应用，但总有种纸上谈兵的感觉，还是无法理解Lambda表达式到底可以帮我们做哪些事情？函数式编程又指的是什么？在接下来的章节中，我们就会围绕这两个问题展开。

实际上，Lambda表达式在大多数的场景下，都是与Stream相伴出现的，两个配合使用，更加高效、简洁、优雅的处理集合相关的问题。 

首先我们需要了解一些Stream的基本概念，学会新的API使用，在不断的实践中，最后探究Stream的实现原理。一般而言Stream由3个部分组成：

1. 源
2. 零个或多个中间操作
3. 终止操作

流操作的分类又有两种：

1. 惰性求值
2. 及早求值

Stream也可以分为并行流和串行流，可以通过非常简单的方式，就是使用并发来加快运行的效率。

我们首先使用不同的方式来创建一个Stream对象：

```java
public class StreamTest {
    public static void main(String[] args) {
        Stream stream1 = Stream.of("hello", "world", "hello world");
    }
}

```

为什么可以这样创建呢？不妨查看一下Stream这个类中的of()方法：

```java
    public static<T> Stream<T> of(T... values) {
        return Arrays.stream(values);
    }
```

可以看到这是一个静态方法，本身接受的是可变参数，并且会调用Arrays中的stream方法：

```java
 public static <T> Stream<T> stream(T[] array) {
        return stream(array, 0, array.length);
    }
```

其中的"hello", "world", "hello world"就称之为源，源的意思就是要操作的数据对象，使用相似的方式，我们还可以这样创建Stream：

```java
public class StreamTest {
    public static void main(String[] args) {
        Stream stream1 = Stream.of("hello", "world", "hello world");
        String[] myArray = new String[]{"hello", "world", "hello world"};
        Stream stream2 = Stream.of(myArray);
        Stream stream3 = Arrays.stream(myArray);
    }
}
```

本质上而言，这几种创建Stream的方式并没有什么区别，其实最常见的，是采用下面的方式来创建流：

```java
public class StreamTest {
    public static void main(String[] args) {
        List<String> list = Arrays.asList(myArray);
        Stream stream = list.stream();
    }
}
```

以上就是关于如何创建流的对象的例子，接下来我们看看引入Stream会为我们的编码带来什么样的改变，首先我们创建一个Stream，并且调用它的forEach（）方法：

```java
public class StreamTest2 {
    public static void main(String[] args) {
        Stream.of(new int[]{5, 6, 7}).forEach(System.out::println);
    }
}
```

在这段代码中，我们首先创建了一个元素为5，6，7的Stream对象，并且调用forEach()方法，对流中的每一个元素执行打印的操作。

Stream本身其实也提供了针对与特定数据类型的具化的Stream对象，用来避免自动拆箱装箱带来的性能的损耗，所以这段代码也可以这么写：

```java
public class StreamTest2 {
    public static void main(String[] args) {
        IntStream.of(new int[]{5, 6, 7,}).forEach(System.out::println);
    }
}
```

再举一个例子：

```java
public class StreamTest2 {
    public static void main(String[] args) {
        IntStream.range(3, 8).forEach(System.out::println);
    }
}
```

这样我们就在控制台打印了3到7，我们可以来了解一下这个range()方法：

```java
    public static IntStream range(int startInclusive, int endExclusive) {
        if (startInclusive >= endExclusive) {
            return empty();
        } else {
            return StreamSupport.intStream(
                    new Streams.RangeIntSpliterator(startInclusive, endExclusive, false), false);
        }
    }
```

可以看到这个方法返回的是包含最小值，不包含最大值的IntStream对象，那如果要包含最大值改怎么做呢？一种方式当然可以调整范围，比如，可以设置范围是（3，9）就可以打印3到8的内容，也可以调用另一个方法：

```java
IntStream.rangeClosed(3, 8).forEach(System.out::println);
```

我们不妨来看一下这个方法的源码：

```java
    public static IntStream rangeClosed(int startInclusive, int endInclusive) {
        if (startInclusive > endInclusive) {
            return empty();
        } else {
            return StreamSupport.intStream(
                    new Streams.RangeIntSpliterator(startInclusive, endInclusive, true), false);
        }
    }
```

这样，就顺利的同时包含了较小的值和较大的值。

上面的例子看起来还是相对而言比较简陋的，接下来我们给出一个稍微复杂一点的示例：

```java
public class StreamTest3 {
    public static void main(String[] args) {
        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 6);
        System.out.println(list.stream().map(i -> 2 * i).reduce(0, Integer::sum));
    }
}
```

这里我们对于集合中的元素先乘以2，然后求和，这里的map描述的是一种映射，而reduce描述的一种聚合，只有当表达式中具有reduce这样的终止操作的方法的时候，流才会被真正的执行，这就是所谓的终止操作，而map就称之为中间操作。不难看出，与传统的方式，使用函数式的方式，代码变的异常简洁和优雅。

### Stream类源码解析

在初步了解了Sream给我们来了些什么之后，我们来了解一些关于流的特性：

- Collection提供了新的Stream()方法
- 流不存储值，通过管道的方式获取值
- 本质是函数式的，对流的操作会生成一个结果，不过并不会修改底层的数据源，集合可以作为流的底层数据源
- 延迟查找，很多流操作（过滤、映射、排序等）都可以延迟实现

 

接下来再通过一些实际的例子，来加深对于Stream的理解：

```java
public class StreamTest4 {
    public static void main(String[] args) {
        Stream<String> stream = Stream.of("hello", "world", "helloworld");
        String[] stringArray = stream.toArray(length -> new String[length]);
        String[] strings = stream.toArray(String[]::new);
        Arrays.asList(stringArray).forEach(System.out::println);
    }
}
```

上面的例子创建Stream的，那Stream是如何转变成我们常用的List集合呢？这里就要说明一个及其重要的方法collect()：

```java
public class StreamTest4 {
    public static void main(String[] args) {
        Stream<String> stream = Stream.of("hello", "world", "helloworld");
        List<String> list = stream.collect(Collectors.toList());
         list.forEach(System.out::println);
    }
}
```

collect()方法是有几个重载的方法，我们来看接收参数最多的这个：

```java
    /**
     * Performs a <a href="package-summary.html#MutableReduction">mutable
     * reduction</a> operation on the elements of this stream.  A mutable
     * reduction is one in which the reduced value is a mutable result container,
     * such as an {@code ArrayList}, and elements are incorporated by updating
     * the state of the result rather than by replacing the result.  This
     * produces a result equivalent to:
     * <pre>{@code
     *     R result = supplier.get();
     *     for (T element : this stream)
     *         accumulator.accept(result, element);
     *     return result;
     * }</pre>
     *
     * <p>Like {@link #reduce(Object, BinaryOperator)}, {@code collect} operations
     * can be parallelized without requiring additional synchronization.
     *
     * <p>This is a <a href="package-summary.html#StreamOps">terminal
     * operation</a>.
     *
     * @apiNote There are many existing classes in the JDK whose signatures are
     * well-suited for use with method references as arguments to {@code collect()}.
     * For example, the following will accumulate strings into an {@code ArrayList}:
     * <pre>{@code
     *     List<String> asList = stringStream.collect(ArrayList::new, ArrayList::add,
     *                                                ArrayList::addAll);
     * }</pre>
     *
     * <p>The following will take a stream of strings and concatenates them into a
     * single string:
     * <pre>{@code
     *     String concat = stringStream.collect(StringBuilder::new, StringBuilder::append,
     *                                          StringBuilder::append)
     *                                 .toString();
     * }</pre>
     *
     * @param <R> type of the result
     * @param supplier a function that creates a new result container. For a
     *                 parallel execution, this function may be called
     *                 multiple times and must return a fresh value each time.
     * @param accumulator an <a href="package-summary.html#Associativity">associative</a>,
     *                    <a href="package-summary.html#NonInterference">non-interfering</a>,
     *                    <a href="package-summary.html#Statelessness">stateless</a>
     *                    function for incorporating an additional element into a result
     * @param combiner an <a href="package-summary.html#Associativity">associative</a>,
     *                    <a href="package-summary.html#NonInterference">non-interfering</a>,
     *                    <a href="package-summary.html#Statelessness">stateless</a>
     *                    function for combining two values, which must be
     *                    compatible with the accumulator function
     * @return the result of the reduction
     */
    <R> R collect(Supplier<R> supplier,
                  BiConsumer<R, ? super T> accumulator,
                  BiConsumer<R, R> combiner);
```

collect方法接收三个参数，其中的BiConsumer是接收两个参数，并且没有返回值的函数式接口：

```java
@FunctionalInterface
public interface BiConsumer<T, U> 
    void accept(T t, U u);
}
```

我们来阅读一下collect方法的说明：

```txt
Performs a mutable reduction operation on the elements of this stream. A mutable reduction is one in which the reduced value is a mutable result container, such as an ArrayList, and elements are incorporated by updating the state of the result rather than by replacing the result. This produces a result equivalent to:
```

对流当中的元素进行可变的汇聚操作，一个可变的汇聚操作指的是将值汇聚到可变的结果容器，比如ArrayList，并且这个容器是通过更新结果的状态来进行合并的，而不是通过替换结果进行合并的，这个结果相当于下面这段代码：

```java
 R result = supplier.get();
     for (T element : this stream)
         accumulator.accept(result, element);
     return result;
```

首先会通过supplier.get()方法获取到结果集，然后对流中的元素进行遍历，遍历执行累加器accumulator中的accept，最后返回结果，这里总共有三个步骤，对应的就是collect方法的三个函数式接口：

```java
 <R> R collect(Supplier<R> supplier,
                  BiConsumer<R, ? super T> accumulator,
                  BiConsumer<R, R> combiner);
```

我们来举一个具体的例子来说明，这段文字的含义：

```java
public class StreamTest4 {
    public static void main(String[] args) {
        Stream<String> stream = Stream.of("hello", "world", "helloworld");
        List<String> list = stream.collect(() -> new ArrayList<String>(), (theList, item) -> theList.add(item),(theList1, theList2) -> theList1.addAll(theList2));
    }
}
```

supplier就是我们要返回的结果，这里我们选择new一个ArrayList作为返回的容器，accumulator是我们要把流中的元素添加到要返回的结果容器当中，所以这里调用List的add()方法，将流中的元素依次添加到我们新new出来的ArrayList当中，每次将流中的元素添加到的ArrayList时都会新newArrayList，combiner是将上一次返回的结果，添加到的最终的结果theList1当中，当然，这个方法我们也可以用方法引用来完成：

```java
 stream.collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
```

理解了三个参数具体的作用我们具体再往下看：

```txt
Like reduce(Object, BinaryOperator), collect operations can be parallelized without requiring additional synchronization.This is a terminal operation.
```

就像reduce一样，collect无需其他操作就可以很好的支持并行流，并且也是一个终止操作，这也是流式编程给我们带来的好处。

```txt
There are many existing classes in the JDK whose signatures are well-suited for use with method references as arguments to collect(). 
```

在JDK中有很多的方法都可以采用方法引用的方式，作为collect()的参数，这里举了两个例子，一个正是我们前面举出的例子：

```java
 List<String> asList = stringStream.collect(ArrayList::new, ArrayList::add,
                                                ArrayList::addAll);
```

还有一个例子：

```java
   String concat = stringStream.collect(StringBuilder::new, StringBuilder::append,
                                          StringBuilder::append).toString();
```

这里使用StringBuilder作为最终返回的结果容器，遍历集合中的单个的字符串，最终将他们拼接起来。

最后我们来看一下对于参数的说明：

- supplier – a function that creates a new result container. For a parallel execution, this function may be called multiple times and must return a fresh value each time.
- accumulator – an associative, non-interfering, stateless function for incorporating an additional element into a result
- combiner – an associative, non-interfering, stateless function for combining two values, which must be compatible with the accumulator function

supplier会创建一个新的结果容器，在并行流中可能会多次调用，所以它每次返回的一定是一个新的结果容器，accumulator，它是一个相关的，不冲突的，可关联的一个无状态的一个函数，用于将一个额外的元素合并到结果容器当中，combiner用于合并两个值，它必须和accumulator 是兼容的。

最后我们可以看一个JDK实现的一个例子：

```java
    public static <T>
    Collector<T, ?, List<T>> toList() {
        return new CollectorImpl<>((Supplier<List<T>>) ArrayList::new, List::add,
                                   (left, right) -> { left.addAll(right); return left; },
                                   CH_ID);
    }
```

### Stream实例剖析

首先来看一个具体的例子：

```java
public class StreamTest4 {
    public static void main(String[] args) {
      Stream<String> stream = Stream.of("hello", "world", "helloworld");
        ArrayList<String> list = stream.collect(Collectors.toCollection(ArrayList::new));
        list.forEach(System.out::println);
    }
}
```

这里我们使用的Collectors类中的toCollection()方法：

```java
public static <T, C extends Collection<T>>
    Collector<T, ?, C> toCollection(Supplier<C> collectionFactory) {
        return new CollectorImpl<>(collectionFactory, Collection<T>::add,
                                   (r1, r2) -> { r1.addAll(r2); return r1; },
                                   CH_ID);
    }
```

可以看到，它接受一个Supplier参数，这里我们使用构方法引用的方式，这实际上是一种比起toList()更为通用的写法，使用toCollection可以很方便的自定义返回结果容器的类型，比如我们要返回一个LinkedList，我们只需要：

```java
LinkedList<String> list = stream.collect(Collectors.toCollection(LinkedList::new));
```

除了将流转化为List，我们也可以转化为Set、Map等，例如：

```java
public class StreamTest4 {
    public static void main(String[] args) {
        TreeSet<String> set = stream.collect(Collectors.toCollection(TreeSet::new));
        set.forEach(System.out::println);
    }
}
```

上一章节中，JDK中举出的拼接字符串的例子，实际上在Collectors中有一种更为简洁的实现方案：

```java
public class StreamTest4 {
    public static void main(String[] args) {
        Stream<String> stream = Stream.of("hello", "world", "helloworld");
        String str = stream.collect(Collectors.joining()).toString();
    }
}
```

之前我们举的例子要么是将集合转化为Stream，要么是将Stream转化为集合，实际使用的时候，需要两者配合使用，举一个这样的例子，将集合中的字符串传化为大写并打印：

```java
public class StreamTest5 {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "helloworld", "test");
        list.stream().map(String::toUpperCase).collect(Collectors.toList()).
                forEach(System.out::println);
    }
}
```

类似这样的代码，才是在实际应用中使用的最多的，其中的map()是JDK为我们提供的API，表示一种映射关系，将集合中的元素映射成后面表达式的结果的操作，再比如，要求出集合中每一个元素的平方并打印：

```java
public class StreamTest5 {
    public static void main(String[] args) {
        List<Integer> list2 = Arrays.asList(1, 2, 3, 4);
        list2.stream().map(item -> item * item).collect(Collectors.toList()).
                forEach(System.out::println);
    }
}
```

与map比较类似的还有一个flatmap()方法，它表示将流中元素的界限打破，最终返回一个整体，举个例子：

```java
public class StreamTest5 {
    public static void main(String[] args) {
        Stream<List<Integer>> stream = Stream.of(Arrays.asList(1), Arrays.asList(2, 3),
                Arrays.asList(4, 5, 6));
        stream.flatMap(theList -> theList.stream().map(item -> item * item)).forEach(System.out::println);
    }
}
```

这里我们首先对于流中的集合进行了平方的操作，然后将所有的元素作为一个整体进行打印。

再来看一个map和flatMap例子，假设我们要对一个集合中的元素提取出单词并去重：

```java
public class StreamTest11 {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello welcome", "world hello", "hello world hello", "hello welcome");
        list.stream().map(item -> item.split(" ")).distinct().collect(Collectors.toList()).forEach(System.out::println);
    }
}
```

运行的结果：

```txt
[Ljava.lang.String;@4eec7777
[Ljava.lang.String;@3b07d329
[Ljava.lang.String;@41629346
[Ljava.lang.String;@404b9385
```

这显然是不对的，原因就在于这里我们使用map返回的类型实际上变成了String[]，自然的，后续的去重操作当然也都失败了，那如果要实现这个需求改怎么做呢？就需要调用flatMap方法：

```java
public class StreamTest11 {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello welcome", "world hello", "hello world hello", "hello welcome");
        list.stream().map(item -> item.split(" ")).flatMap(Arrays::stream).distinct().
                collect(Collectors.toList()).forEach(System.out::println);
    }
}
```

再举这样一个例子来加深对于flatMap理解的场景，比如我们要获取两个集合的笛卡尔积，我们就可以：

```java
public class StreamTest12 {
    public static void main(String[] args) {
        List<String> list1 = Arrays.asList("Hi", "Hello", "你好");
        List<String> list2 = Arrays.asList("zhangsan", "lisi", "wangwu", "zhaoliu");
        list1.stream().flatMap(item -> list2.stream().map(item2 -> item + " " + item2)).
                collect(Collectors.toList()).forEach(System.out::println);
    }
}
```

接下来介绍generate和iterate这两个特殊的方法：

```java
public class StreamTest6 {
    public static void main(String[] args) {
        Stream<String> stream = Stream.generate(UUID.randomUUID()::toString);
        stream.findFirst().ifPresent(System.out::println);
    }
}
```

接下来介绍iterate方法：

```java
public static<T> Stream<T> iterate(final T seed, final UnaryOperator<T> f) {
        Objects.requireNonNull(f);
        final Iterator<T> iterator = new Iterator<T>() {
            @SuppressWarnings("unchecked")
            T t = (T) Streams.NONE;

            @Override
            public boolean hasNext() {
                return true;
            }

            @Override
            public T next() {
                return t = (t == Streams.NONE) ? seed : f.apply(t);
            }
        };
        return StreamSupport.stream(Spliterators.spliteratorUnknownSize(
                iterator,
                Spliterator.ORDERED | Spliterator.IMMUTABLE), false);
    }
```

它的参数UnaryOperator可以简单的看一下：

```java
@FunctionalInterface
public interface UnaryOperator<T> extends Function<T, T> {
    static <T> UnaryOperator<T> identity() {
        return t -> t;
    }
}
```

Function这个函数式接口本身接口T类型的参数，返回R类型的结果，这里的UnaryOperator表示接收参数与返回结果类型相同的情况，接下来我们阅读一下iterate的文档：

```txt
Returns an infinite sequential ordered Stream produced by iterative application of a function f to an initial element seed, producing a Stream consisting of seed, f(seed), f(f(seed)), etc.
The first element (position 0) in the Stream will be the provided seed. For n > 0, the element at position n, will be the result of applying the function f to the element at position n - 1.

```

这个方法返回无限的、串行的、有序的一个Stream，它是由迭代函数f对于初始值seed的不断迭代，第一个元素作为seed（种子）,而对于n>0，会不断应用n-1次迭代函数f，比如f(seed)、f(f(seed))等等。

举个例子：

```java
public class StreamTest6 {
    public static void main(String[] args) {
        Stream.iterate(1, item -> item + 2).limit(10).forEach(System.out::println);
    }
}
```

需要注意的是，这里之所以使用limit是因为如果不加限制，程序将一直运行下去，这是因为iterate他是无限的。

### Stream陷阱剖析

首先来看这样一个例子，假设有这样一个流，流中的元素为1，3，5，6，7，11，我们要找出流中大于2的元素，然后将每个元素乘以2，忽略掉流中的前两个元素之后，再取出流中的前两个元素，然后求出流中元素的总和：

```java
public class StreamTest6 {
    public static void main(String[] args) {
        Stream<Integer> stream = Stream.iterate(1, item -> item + 2).limit(6);
        int sum = stream.filter(item -> item > 2).mapToInt(item -> item * 2).skip(2).limit(2).sum();
        System.out.println(sum);
    }
}
```

这里有两个新的方法，skip()表示跳过，而limit()表示取前几个元素。

如果我们改一下需求，把求出流中元素的总和改为求出流中元素的最小值，我们猜想代码可能是这样的：

```java
stream.filter(item -> item > 2).mapToInt(item -> item * 2).skip(2).limit(2).min();
```

但是运行之后控制台的输出却不是我们想要的结果，而是这样的：

```txt
OptionalInt[14]
```

原来min()方法的源码是这样的：

```java
OptionalInt min();
```

返回的是一个Optional对象，而不是一个普通的Int，类似的max()方法返回的也是Optional对象，原因就在于，求最大值和最小值有可能为空，而求和则不会，如果流中没有元素返回0即可，从本质上来说，是否会直接返回值，还是返回Optional对象，就是取决于是否可能会出现空指针的情况。

```java
public class StreamTest6 {
    public static void main(String[] args) {
        Stream<Integer> stream = Stream.iterate(1, item -> item + 2).limit(10);
        stream.filter(item -> item > 2).mapToInt(item -> item * 2).skip(2).limit(2).max().ifPresent(System.out::println);
    }
}
```

那如果既想求出最大值，也想求出最小值，也想求出总和，改怎么办呢？

```java
public class StreamTest6 {
    public static void main(String[] args) {
        IntSummaryStatistics intSummaryStatistics = stream.filter(item -> item > 2).mapToInt(item -> item * 2).skip(2).limit(2).summaryStatistics();
        System.out.println(intSummaryStatistics.getMax());
        System.out.println(intSummaryStatistics.getMin());
        System.out.println(intSummaryStatistics.getSum());
    }
}
```

答案就是调用summaryStatistics()方法。

Stream实际上和文件系统中的IO流有很多类似的性质，比如，Stream只能使用一次：

```java
public class StreamTest6 {
    public static void main(String[] args) {
        Stream<Integer> stream = Stream.iterate(1, item -> item + 2).limit(6);
        System.out.println(stream);
        System.out.println(stream.filter(item -> item > 2));
        System.out.println(stream.distinct());
    }
}
```

运行程序，会得到如下的输出：

```txt
java.util.stream.SliceOps$1@816f27d
java.util.stream.ReferencePipeline$2@53d8d10a
Exception in thread "main" java.lang.IllegalStateException: stream has already been operated upon or closed
```

可以看到我们在调用filter方法之后，就会抛出Stream已经被使用的异常，即便我们使用的不是终止操作，而只是一个中间操作，或者说，对于Stream的操作我们只能进行一次，其实中间操作都会返回一个新的Stream对象，为了说明这一点，我们来举个例子：

```java
public class StreamTest6 {
    public static void main(String[] args) {
        Stream<Integer> stream = Stream.iterate(1, item -> item + 2).limit(6);
        System.out.println(stream);
        Stream<Integer> stream2 = stream.filter(item -> item > 2);
        System.out.println(stream2);
        Stream<Integer> stream3 = stream2.distinct();
        System.out.println(stream3);
    }
}
```

这次我们顺利的打印出了Stream对象，但其实每次打印的Stream对象都是不同的，实际使用的时候，我们更多的是使用链式的写法：

```java
stream.filter(item -> item > 2).distinct();
```

接下来我们再了解流的另一个特性：

```java
public class StreamTest7 {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");
        list.stream().map((item->{
            String result = item.substring(0, 1).toUpperCase() + item.substring(1);
            System.out.println(result);
            return result;
        }));
    }
}
```

这段代码会输出什么呢？答案是什么都不会，如果修改成如下：

```java
public class StreamTest7 {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");
        list.stream().map(item -> item.substring(0, 1).toUpperCase() + item.substring(1)).forEach(System.out::println);

        list.stream().map((item -> {
            String result = item.substring(0, 1).toUpperCase() + item.substring(1);
            System.out.println(result);
            return result;
        })).forEach(System.out::println);
    }
}
```

就会顺利的再控制台打印出我们想要的结果了。

这也是流的另一个重要的特性——流是惰性的，流只有在遇到终止操作的时候，才会真正的执行，而map是中间操作，因此流并没有被真正的调用，而forEach是终止操作，所以流会被正常的调用执行。

再来看一个例子：

```java
public class StreamTest8 {
    public static void main(String[] args) {
        IntStream.iterate(0, i -> (i + 1) % 2).distinct().limit(6).forEach(System.out::println);
    }
}
```

在控制台输出了：

```txt
0
1
```

但程序并没有停止，而是在不停的运行，这是为什么呢？这是因为前面在不断的迭代产生0，1，而去重也并没有等待到新的值，所以程序会无限的运行下去，如果我们将刚才的操作反过来：

```java
IntStream.iterate(0, i -> (i + 1) % 2).limit(6).distinct().forEach(System.out::println);
```

可以看到，控制台在输出了0，1之后就停止了，这是因为我们限制了只取流中的前六个元素，这提示我们在使用流的使用后一定要注意编写的顺序和流的相关特性。

### 内部迭代和外部迭代

Stream和SQL语句其实非常的相似，例如，要完成这样的一个SQL的功能，使用SQL语句：

```sql
select name 
from student 
where age > 20 and address = ‘beijing’ order by age desc;
```

该简单的sql所要表达的意思是：从student这张表中查询出年龄>20并且地址=北京的记录，并且对年龄进行降序排序，排序之后将其名字查找出来。对于sql其实是一个描述性的语言，只描述其行为，而具体如何让db完成这个行为是没有暴露出来的，对于该sql所做的工作如果换成咱们的stream来实现那会是个什么样子呢，伪代码可能是这样的：

```java
        students.stream().filter(student -> student.getAge() > 20).filter(student -> student.getAddress().equals(“beijing”))
                .sorted(…).forEach(student -> System.out.println(student.getName()));
```

从表现形式上而言，Stream和SQL非常的类似，这是因为Stream也是属于一种描述性的语句， 整个语句并没有告诉底层Stream要如何去做，等于只要发一些指令给底层就可以了，具体底层怎么做完全不用关心。

如果使用原来传统的方式又该怎么做呢？

```java
 		List list = new ArrayList<>();
        for(int i=0; i < students.size();i++){
            Student student = students.get(i);
            if(student.getAge() > 20 && student.getAddress().equals(“beijing”)){
                list.add(student);
            }
        }
        Collections.sort(list. Comparator()…);
        for(Student student : list){
            System.out.println(student.getName());
        }
```

可以看到，使用传统的方式，代码还相当冗余的，并且从易读性上而言，还是Stream的方式更加简洁明了，那什么是外部迭代，什么是内部迭代呢？实际上在Stream出现之前的都称之为外部迭代，使用Stream的就称之为内部迭代。

针对一个集合：

![1600354418799](assets/1600354418799.png)

对于上面的例子而言：

![1600354444327](assets/1600354444327.png)

集合与我们编写的处理逻辑之间是有清晰的划分的：

![1600354460849](assets/1600354460849.png)

![1600354474589](assets/1600354474589.png)

那对于Stream内部迭代的方式呢？

![1600354503346](assets/1600354503346.png)

总的来说，集合关注的是数据与数据存储本身；而流关注的则是对数据的计算。流与迭代器类似的一点是：流是无法重复使用或消费的，并且流在调用的时候，并不是对于集合中所有的元素先调用第一个filter方法，再调用第二个filter方法，再调用其他方法，实际上并不是这样的，流会将执行的调用链的时候，会有一个容器将所有的操作保存下来，并且针对具体的操作，会优化调用顺序，这一点，在后面源代码分析的时候，就可以看到。

我们一直再说中间操作和终止操作，那如何判断一个操作是中间操作还是终止操作呢？简单来说，中间操纵都会返回一个Stream对象，而终止操作则不会返回Stream类型，可能不返回值，也可能返回其他类型的单个值。

### 流的短路与并发流

单从使用的角度而言，并发流与串行流的区别并不是很大，但在底层实现上是完全不同的。

```java
public class StreamTest9 {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(50000000);
        for (int i = 0; i < list.size(); i++) {
            list.add(UUID.randomUUID().toString());
        }

        System.out.println("==================");
        long startTime = System.nanoTime();
        list.stream().sorted().count();
        long endTime = System.nanoTime();
        long millis = TimeUnit.NANOSECONDS.toMillis(endTime - startTime);
        System.out.println("=======================");
        System.out.println(millis);
    }
}
```

如果要改用串行流改怎么做呢？仅仅需要将我们调用的方法修改为：

```java
  list.parallelStream().sorted().count();
```

这也是使用内部迭代给我们带来的另一个好处，至于底层如何充分利用计算机资源帮助我们快速迭代，实际上在框架的底层就已经帮我们实现了，复杂性永远都是存在的，区别在于框架帮助我们实现了多少。当然，你可能会说，既然调用并行流这么方便，那是不是所有的场景下，都可以使用并行流来代替串行流？答案是否定的，并流行并不一定就比串行流的效率高，这取决于解决的实际问题，需要选择合适的方法，才能效率最高，这一点，在后续分析源码的时候就可以看到。

接下来我们讨论有关流的短路问题，首先来看这样一个例子：

```java
public class StreamTest10 {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");
        list.stream().mapToInt(String::length).filter(length -> length == 5).findFirst().ifPresent(System.out::println);
    }
}
```

显然，如果有长度为5的字符串，就会在控制台打印字符5，将这个例子做如下修改：

```java
public class StreamTest10 {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");
        list.stream().mapToInt(item -> {
            int length = item.length();
            System.out.println(item);
            return length;
        }).filter(length -> length == 5).findFirst().ifPresent(System.out::println);
    }
}
```

控制台会打印什么呢？答案是会在控制台打印出：

```txt
hello
```

为什么会只打印hello呢？原因就在于虽然我们采用的是链式的调用，但其实在调用这些方法的时候并没有先后的顺序，对于流中元素进行处理的时候，会从流中的第一个元素开始应用所有对于流元素的操作，并且对于流的操作也有短路的特性，我们要找到长度为5的字符串，第一个元素就已经满足了所有的操作，所以后面的就不再执行了。

### 分区于分组

我们曾经在内部迭代与外部迭代的章节中提到过，使用Stream的API很像在使用SQL语句，使用SQL语句进行分组的查询是一个很常见的需求，实际上，Stream也对分组提供了强有力的支持。

同样的，我们先创建一个学生类，并生成构造方法、setter、getter方法：

```java
public class Student {
    private String name;
    private int score;
    private int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public Student(String name, int score, int age) {
        this.name = name;
        this.score = score;
        this.age = age;
    }
}
```

然后来创建一些对象：

```java
public class StreamTest13 {
    public static void main(String[] args) {
        Student student1 = new Student("zhangsan", 100, 20);
        Student student2 = new Student("lisi", 90, 20);
        Student student3 = new Student("wangwu", 90, 30);
        Student student4 = new Student("zhangsan", 80, 40);
        List<Student> students = Arrays.asList(student1, student2, student3, student4);

    }
}
```

如果我们使用传统的编码方式来实现对于名字的分组操作，大概要经历如下的步骤：

1. 循环列表
2. 取出学生的名字
3. 检查Map中是否存在该名字，不存在则直接添加到该Map中，存在则将Map中的List对象取出来，然后将该Student对象添加到List中
4. 返回Map对象

那如果我们使用函数式的编程方式呢？

```java
students.stream().collect(Collectors.groupingBy(Student::getName));
```

只需要这一行代码就可以完成根据姓名对于学生的分组操作，这里面用到了Collectors这个类提供的静态方法groupingBy()，我们可以简单的看一下这个方法接收的参数以及它要完成的事情：

```java
    public static <T, K> Collector<T, ?, Map<K, List<T>>>
    groupingBy(Function<? super T, ? extends K> classifier) {
        return groupingBy(classifier, toList());
    }
```

这个方法本身是一个Function的函数式接口，Function我们都知道它接收一个参数，并且有返回值，正如它的方法名称那样描述的，我们需要提供分组的依据，这个方法的文档如下：

```txt
Returns a Collector implementing a "group by" operation on input elements of type T, grouping elements according to a classification function, and returning the results in a Map.
```

这个方法对于给定的输入元素进行了排序的操作，并且返回了一个Map集合，看到这里我们就明白了，T实际上表示的就是流中的每个元素的类型，而我们通过方法引用的方式，返回了流中Student的姓名字段，流就会自动的为我们根据姓名来进行分类了,并且姓名这个字段会作为分组的key。

如果要根据年龄来分组呢，显然只要将分组的key换成分数就可以了：

```java
students.stream().collect(Collectors.groupingBy(Student::getScore));
```

接下来，我们尝试实现一个稍微复杂的需求，假设我们要实现与这样的SQL语句相同的功能：

```sql
select name,count(*) from student group by name;
```

这里我们就要调用groupingBy的一个重载的方式来实现：

```java
 students.stream().collect(Collectors.groupingBy(Student::getName, Collectors.counting()));
```

我们首先来看一下这里面调用的counting()方法：

```java
    public static <T> Collector<T, ?, Long>
    counting() {
        return reducing(0L, e -> 1L, Long::sum);
    }

```

它的相关说明：

```txt
Returns a Collector accepting elements of type T that counts the number of input elements. If no elements are present, the result is 0.
```

这个方法会统计流中元素的个数，如果没有元素，就会返回0。

我们通过这种方式就实现了上述SQL的需求，运行程序就会在控制台打印：

```txt
{lisi=1, zhangsan=2, wangwu=1}
```

我们再举一个例子，之前我们是对于分组中的元素个数进行统计，那如果我们想分组的时候也统计分数的平均值，这里我们也是需要使用另一个Collectors中的方法：

```java
students.stream().collect(Collectors.groupingBy(Student::getName, Collectors.averagingDouble(Student::getScore)));
```

运行效果如下：

```txt
{lisi=90.0, zhangsan=90.0, wangwu=90.0}
```

与分组相关的实际上还有一个概念叫做分区，分区可以认为是特殊的分组，它只会分成两组，调用的Api分别是：

- 分组：group by
- 分区：partition by

比如，90分以上的分成一组，90分以下的分成一组：

```java
students.stream().collect(Collectors.partitioningBy(student -> student.getScore() >= 90));
```

运行的结果：

```txt
{false=[stream.Student@3d494fbf], true=[stream.Student@1ddc4ec2, stream.Student@133314b, stream.Student@b1bc7ed]}
```

至此，对于JDK8中的重要的API全部都介绍完成，学会使用是第一步也是非常重要的一步，在长时间的练习和记忆中，我们才能体会到函数式编程带给我们巨大好处，如果只是从使用的角度而言，掌握本章及之前的内容对于一般的开发者，完全是够用的，然而我想这是远远不够的，学习JDK中优秀的源码，反过来加深我们使用的时候的理解，达到相互促进的作用，这才是更重要的，因此，从下一章节开始，我们将系统而全面的分析JDK是如何实现函数式编程，以及我们之前使用的诸多的API在底层到底是如何实现的。

## Collector接口

Stream的源码复杂而多变，要掌握整个的流程，我们就不得不先要理清楚一些及其重要的概念和几个核心类的作用，当然一开始这是不太容易能够理解的，但是，这会为后面我们能完整的看到流的整个调用顺序打下良好的基础。

首先我们为接下来的部分提前定义好一个学生类作为我们分析源码的入口：

```java
public class Student {
    private String name;
    private int score;

    public String getName() {
        return name;
    }

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", score=" + score +
                '}';
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }
}

```

### Comparator源码分析及实践

Comparator并不是JDK8新增加的内容，但是JDK8对它做了一定程度的增强，在函数式编程中非常的常见，所以也非常的重要，在正式进入Stream源码分析之前，有必要了解关于Comparator比较器的内容。

```java
@FunctionalInterface
public interface Comparator<T> {
    int compare(T o1, T o2);
}
```

首先可以看到这是一个函数式接口，拥有唯一的抽象方法compare，这个方法接口两个参数并且有返回值，并且在这个类中，JDK从1.8开始增加了若干个默认方法。

假如我们要对一个字符串数据按照首字母进行排序：

```java
public class MyComparatorTest {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("nihao", "hello", "world", "welcome");
        Collections.sort(list);
        System.out.println(list);
    }
}
```

如果要按照长度来进行排序：

```java
Collections.sort(list, (item1, item2) -> item1.length() - item2.length());
```

也可以使用方法引用的方式来实现：

```java
Collections.sort(list, Comparator.comparingInt(String::length));
```

如果是降序则：

```java
Collections.sort(list, (item1, item2) -> item2.length() - item1.length());
```

同样的，也可以使用方法引用的方式来实现，只是这里我们调用新的方法reversed：

```java
Collections.sort(list, Comparator.comparingInt(String::length).reversed());
```

但是如果你这么写的话，就会发现有问题：

```java
Collections.sort(list, Comparator.comparingInt(item -> item.length()).reversed());
```

看起来与上面的写法是完全等价的，但IDE却会提示：

```txt
cannot resolve method 'length()'
```

原因就在于，编译器会认为此时的item是一个Object类型的对象，如果要正常编译运行，就需要显示的声明类型：

```java
Collections.sort(list, Comparator.comparingInt((String item) -> item.length()).reversed());
```

在我们之前的所有的例子当中，编译器都可以自动的推断出元素的类型，在这个例子当中，接收的参数ToIntFunction<? super T>由于没有明确的上下文（可能是T类型，也有可能是T类型以上的类型），并且由于调用了reversed获取了新的比较器，所以编译器没有办法准确的推断出类型：

```java
  public static <T> Comparator<T> comparingInt(ToIntFunction<? super T> keyExtractor) {
        Objects.requireNonNull(keyExtractor);
        return (Comparator<T> & Serializable)
            (c1, c2) -> Integer.compare(keyExtractor.applyAsInt(c1), keyExtractor.applyAsInt(c2));
    }
```

这里为什么会是T类型以及T类型以上的类型呢？简而言之，就是可以传入自己本身以及父类的比较器，而如果传入的是父类型的比较器，比较完成之后还是会强转会原来的类型。

其实我们也可以直接调用list的sort方法：

```java
list.sort(Comparator.comparingInt(String::length).reversed());
```

上面的方法都是一次排序，接下来我们看多次排序的方法，比如现根据名称排序，排好序之后对于名称相同的再根据分数进行排序：

```java
Collections.sort(list, Comparator.comparingInt(String::length).thenComparing((item1, item2) -> item1.compareToIgnoreCase(item2)));
```

其实我们也可以这样调用：

```java
Collections.sort(list,Comparator.comparingInt(String::length).thenComparing(String.CASE_INSENSITIVE_ORDER));
```

这里我们使用的静态的常量是：

```java
    public static final Comparator<String> CASE_INSENSITIVE_ORDER
                                         = new CaseInsensitiveComparator();
```

这个类本身就定义在String类当中：

```java
    private static class CaseInsensitiveComparator
            implements Comparator<String>, java.io.Serializable {
        // use serialVersionUID from JDK 1.2.2 for interoperability
        private static final long serialVersionUID = 8575799808933029326L;

        public int compare(String s1, String s2) {
            int n1 = s1.length();
            int n2 = s2.length();
            int min = Math.min(n1, n2);
            for (int i = 0; i < min; i++) {
                char c1 = s1.charAt(i);
                char c2 = s2.charAt(i);
                if (c1 != c2) {
                    c1 = Character.toUpperCase(c1);
                    c2 = Character.toUpperCase(c2);
                    if (c1 != c2) {
                        c1 = Character.toLowerCase(c1);
                        c2 = Character.toLowerCase(c2);
                        if (c1 != c2) {
                            // No overflow because of numeric promotion
                            return c1 - c2;
                        }
                    }
                }
            }
            return n1 - n2;
        }
```

而对于thenComparing方法而言：

```txt
Returns a lexicographic-order comparator with another comparator. If this Comparator considers two elements equal, i.e. compare(a, b) == 0, other is used to determine the order.
```

 与另一个比较器相比，它返回一个字典顺序的比较器，如果它的前一个比较器返回是元素的相等的情况，即compare(a, b) == 0的情况下，当前传入的比较器就会发挥作用，进行二次排序，这意味着，如果前面的比较器返回的结果不是0，那么后面的比较器就不会再调用，这一点在源代码中也有体现：

```java
    default Comparator<T> thenComparing(Comparator<? super T> other) {
        Objects.requireNonNull(other);
        return (Comparator<T> & Serializable) (c1, c2) -> {
            int res = compare(c1, c2);
            // 当比较的结果不为0的时候直接返回，相等再执行传入的比较器。
            return (res != 0) ? res : other.compare(c1, c2);
        };
    }
```

当然，你还可以这么做：

```java
Collections.sort(list,Comparator.comparingInt(String::length).thenComparing(Comparator.comparing(String::toLowerCase)));
```

类似的，比较器也可以进行复合：

```java
Collections.sort(list, Comparator.comparingInt(String::length).thenComparing(String::toLowerCase, Comparator.reverseOrder()));
```

比这个例子稍微复杂一个例子：

```java
Collections.sort(list,Comparator.comparingInt(String::length).reversed().thenComparing(String::toLowerCase, Comparator.reverseOrder()));
```

### Collector源码分析

Collector无疑是整个Stream源码中及其重要的一个类，了解它对于我们认识Stream类有着及其关键的作用，首先回到我们之前的例子当中：

```java
public class StreamTest1 {
    public static void main(String[] args) {
        Student student1 = new Student("zhangsan", 80);
        Student student2 = new Student("lisi", 90);
        Student student3 = new Student("wangwu", 100);
        Student student4 = new Student("zhaoliu", 90);

        List<Student> students = Arrays.asList(student1, student2, student3, student4);
        List<Student> studentList = students.stream().collect(Collectors.toList());
        studentList.forEach(System.out::println);
    }
}
```

毫无疑问，到目前这个阶段，这样的代码我们应该已经掌握的非常的熟练了，现在假设说要求使用流的方式求出列表的长度改怎么做呢？你可以使用Collectors中的静态方法：

```java
 System.out.println("count: " + students.stream().collect(Collectors.counting()));
```

可以看到，实际使用的时候，使用collect（收集器）的频率非常的高，collect本身的定义是这样的：

```java
<R, A> R collect(Collector<? super T, A, R> collector);
```

它本身接收一个参数叫做collector，是Collector类型的，接下来的章节重点分析这个类。

```txt
A mutable reduction operation that accumulates input elements into a mutable result container, optionally transforming the accumulated result into a final representation after all input elements have been processed. Reduction operations can be performed either sequentially or in parallel.
Examples of mutable reduction operations include: accumulating elements into a Collection; concatenating strings using a StringBuilder; computing summary information about elements such as sum, min, max, or average; computing "pivot table" summaries such as "maximum valued transaction by seller", etc. The class Collectors provides implementations of many common mutable reductions.
```

它是一个可变的汇聚操作，作用是将输入元素累积到一个可变的结果容器当中。它可以在所有的元素都处理完毕后，将累积的结果转换为一个最终的表示（这是一个可选的操作），它支持串行与并行两种方式执行。什么是可变的汇聚操作呢？比如将集合中的元素添加到Collection当中，再比如使用StringBuilder将字符串拼接起来，计算关于元素的求和、最小值、最大值、平均值，这也是一种可变操作，计算“数据透视图”的时候一些汇总信息，比如计算卖方交易数量的最大值，Collectors提供了很多对于常见的可变的汇聚操作的实现（Collectors是Collector的实现类，而Collectors本身实际上是一个工厂）。

```txt
A Collector is specified by four functions that work together to accumulate entries into a mutable result container, and optionally perform a final transform on the result. They are:
```

Collector是由以下四个方法构成，用来完成向一个可变结果容器当中添加元素的，并且对于结果进行最终的转换：

- creation of a new result container (supplier())
- incorporating a new data element into a result container (accumulator())
- combining two result containers into one (combiner())
- performing an optional final transform on the container (finisher())

```txt
A function that creates and returns a new mutable result container.
```

supplier()是用来创建新的可变的结果容器。

```java
A function that folds a value into a mutable result container.
```

accumulator()是用来将一个新的数据元素添加到结果容器当中。

```txt
A function that accepts two partial results and merges them. The combiner function may fold state from one argument into the other and return that, or may return a new result container.
```

combiner函数接收两个部分的结果并且合并它们，combiner函数可以将状态从一个折叠成为另一个，并且返回它们，也可能返回一个新的结果容器，实际上这个是在并行中使用的。

```txt
Perform the final transformation from the intermediate accumulation type A to the final result type R.
If the characteristic IDENTITY_TRANSFORM is set, this function may be presumed to be an identity transform with an unchecked cast from A to R.
```

是将中间的累积类型转换称为最终的结果类型，如果设置了IDENTITY_TRANSFORM这个特性，那么这个函数就会直接将A转型为R。

```txt
Collectors also have a set of characteristics, such as Collector.Characteristics.CONCURRENT, that provide hints that can be used by a reduction implementation to provide better performance.
```

Collectors还有一个描述特征的的集合，比如Collector.Characteristics.CONCURRENT，它可以通过不同的枚举值来提高并发流的执行效率。

```java
    enum Characteristics {
        CONCURRENT，
        UNORDERED,
        IDENTITY_FINISH
    }
```

这个枚举是定义在Collector这个接口当中的，首先来看一下类的说明：

```txt
Characteristics indicating properties of a Collector, which can be used to optimize reduction implementations.
```

Characteristics是Collector的一个属性，能够优化汇聚操作。

```txt
A sequential implementation of a reduction using a collector would create a single result container using the supplier function, and invoke the accumulator function once for each input element. A parallel implementation would partition the input, create a result container for each partition, accumulate the contents of each partition into a subresult for that partition, and then use the combiner function to merge the subresults into a combined result.
```

对于流的串行实现会创建一个单个的结果容器，并且每个元素会调用accumulator方法一次，而对于并行实现将会对输入进行分区，对于每一个分区都会创建一个结果容器，然后使用combiner方法将每个分区的结果容器当中的内容进行合并。

```txt
To ensure that sequential and parallel executions produce equivalent results, the collector functions must satisfy an identity and an associativity constraints.
```

为了确保串行与并行生成等价的结果，collector必须满足两个条件，即identity（同一性）和associativity（结合性）。

```txt
The identity constraint says that for any partially accumulated result, combining it with an empty result container must produce an equivalent result. That is, for a partially accumulated result a that is the result of any series of accumulator and combiner invocations, a must be equivalent to combiner.apply(a, supplier.get()).
```

同一性指的是，部分累积的结果与一个空的结果容器运算之后还是它本身，这也就是说，对于一个部分累积的结果a而言，它要满足combiner.apply(a, supplier.get())等于a。

```txt
The associativity constraint says that splitting the computation must produce an equivalent result. That is, for any input elements t1 and t2, the results r1 and r2 in the computation below must be equivalent:
```

结合性指的是分割计算也会得到一个等价的结果，也就是说对于任意的输入t1和t2，和产生的结果r1和r2，下面的计算是等价的。

```java
     // 串行操作
	 A a1 = supplier.get();
     accumulator.accept(a1, t1);
     accumulator.accept(a1, t2);
     R r1 = finisher.apply(a1);
	 // 并行操作
     A a2 = supplier.get();
     accumulator.accept(a2, t1);
     A a3 = supplier.get();
     accumulator.accept(a3, t2);
     R r2 = finisher.apply(combiner.apply(a2, a3)); 
```

也就是说无论对于串行操作还是并行操作，最终生成的结果必须是等价的。

```txt
For collectors that do not have the UNORDERED characteristic, two accumulated results a1 and a2 are equivalent if finisher.apply(a1).equals(finisher.apply(a2)). For unordered collectors, equivalence is relaxed to allow for non-equality related to differences in order. (For example, an unordered collector that accumulated elements to a List would consider two lists equivalent if they contained the same elements, ignoring order.)
```

对于没有UNORDERED特性的collectors来说，如果finisher.apply(a1).equals(finisher.apply(a2))，这两种累加的结果是等价的，对于无序的要求就被放松了，它会考虑到顺序上的区别带来的不相等性，比如无序的collector它累积元素到一个List当中，就会两个List是相同的，他们包含了相同的元素，忽略了顺序。

```txt
Libraries that implement reduction based on Collector, such as Stream.collect(Collector), must adhere to the following constraints:
```

基于Collector实现汇聚操作的库，比如Stream.collect(Collector)，必须要遵守下面的约定。

```txt
The first argument passed to the accumulator function, both arguments passed to the combiner function, and the argument passed to the finisher function must be the result of a previous invocation of the result supplier, accumulator, or combiner functions.
```

传递给accumulator方法的第一个参数，以及传递给combiner方法的两个参数，以及传递给finisher的参数，它们必须都是result supplier, accumulator, combiner上一次调用的结果。

看到这里还是比较难以理解的，我们首先需要理解Collector泛型的含义：

```txt
<T> – the type of input elements to the reduction operation
<A> – the mutable accumulation type of the reduction operation (often hidden as an implementation detail)
<R> – the result type of the reduction operation
```

T类型表示进行汇聚操作的输入元素的类型，即流中的每一个元素的类型，A类型表示汇聚操作的可变的累积类型，可以认为是每次中间结果容器的类型，R类型表示汇聚操作的结果类型，这个时候我们再来分析一个这四个方法对应的泛型：

```java
Supplier<A> supplier();
BiConsumer<A, T> accumulator();
BinaryOperator<A> combiner();
Function<A, R> finisher();
```

BinaryOperator是因为合并的是两个部分的结果容器的类型，那最终的结果一定也是A类型，从泛型的角度就可以清楚的认识到，对于每一次的调用，supplier提供的结果容器就会传递给accumulator，而accumulator将流中待处理的元素添加到结果容器之后，又将这个部分结果传递给combiner，依次类推。

```txt
The implementation should not do anything with the result of any of the result supplier, accumulator, or combiner functions other than to pass them again to the accumulator, combiner, or finisher functions, or return them to the caller of the reduction operation.
```

对于具体的实现不应该对生成的supplier、accumulator、combiner做任何的事情，除了将他们再一次传递给accumulator、combiner或者finisher方法，否则将他们返回给汇聚操作的调用者。

```txt
If a result is passed to the combiner or finisher function, and the same object is not returned from that function, it is never used again.
```

如果一个结果被传递给combiner或者finisher函数了，并没有返回相同的类型的对象，那么它就再也不会被使用了。

```txt
Once a result is passed to the combiner or finisher function, it is never passed to the accumulator function again.
```

一旦一个结果被传递给了combiner或者finisher方法，它就不会再被accumulator方法使用了（这是因为调用顺序的原因）。

```txt
For non-concurrent collectors, any result returned from the result supplier, accumulator, or combiner functions must be serially thread-confined. This enables collection to occur in parallel without the Collector needing to implement any additional synchronization. The reduction implementation must manage that the input is properly partitioned, that partitions are processed in isolation, and combining happens only after accumulation is complete.
```

对于非并发的collectors，从supplier, accumulator, 或者 combiner中返回的结果都一定是线程封闭的，不会被其他线程使用，这样在并发的情况下，就不用再做其他的操作来保证线程安全，每一个部分的操作都是独立的，并且只有当部分完成之后猜会进行合并的操作。

```txt
For concurrent collectors, an implementation is free to (but not required to) implement reduction concurrently. A concurrent reduction is one where the accumulator function is called concurrently from multiple threads, using the same concurrently-modifiable result container, rather than keeping the result isolated during accumulation. A concurrent reduction should only be applied if the collector has the Collector.Characteristics.UNORDERED characteristics or if the originating data is unordered.
```

对于并发的collectors，实现是可以自由的实现，一个多线程的汇聚操作指的是accumulator同时被多个线程调用，他们可以使用相同的可以并发修改的结果容器，而不是保持独立，一个并发的结果容器在什么情况下使用呢？只有当特性值设置为UNORDERED的时候，或者数据源本身不要求有序。

```txt
In addition to the predefined implementations in Collectors, the static factory methods of(Supplier, BiConsumer, BinaryOperator, Characteristics...) can be used to construct collectors. For example, you could create a collector that accumulates widgets into a TreeSet with:
```

除了在Collectors预先定义好的静态工厂方法可以创建一个收集器之外，还可以使用Collector中的of方法，比如你可以使用下面的方式将widget累积到TreeSet当中：

```java
Collector<Widget, ?, TreeSet<Widget>> intoSet =
         Collector.of(TreeSet::new, TreeSet::add,
                      (left, right) -> { left.addAll(right); return left; });
```

实际上就是除了预先定义好的收集器，我们可以通过Collector中的of方法实现自定的收集器。

```txt
Performing a reduction operation with a Collector should produce a result equivalent to:
```

使用一个Collector执行汇聚操作会生成的结果应该和下面的结果等价:

```java
R container = collector.supplier().get();
     for (T t : data)
         collector.accumulator().accept(container, t);
     return collector.finisher().apply(container);
```

这其实就是汇聚操作的整个过程。

```txt
However, the library is free to partition the input, perform the reduction on the partitions, and then use the combiner function to combine the partial results to achieve a parallel reduction. (Depending on the specific reduction operation, this may perform better or worse, depending on the relative cost of the accumulator and combiner functions.)
```

然而，库可以自由的对输入元素分组与分区，在每一个分区上执行这种汇聚操作，然后使用combiner方法合并部分的结果执行一个并行的汇聚操作（取决于具体的并行操作的类型，这可能效率高，也可能效率会变低，这取决于accumulator和combiner消耗的成本和代价）。

```txt
Collectors are designed to be composed; many of the methods in Collectors are functions that take a collector and produce a new collector. For example, given the following collector that computes the sum of the salaries of a stream of employees:
```

收集器是被设计成可以组合的，这意味着，Collectors很多方法可以接收collector作为参数返回一个新的collector，例如一个员工构成的流的工资的总数：

```java
 Collector<Employee, ?, Integer> summingSalaries
         = Collectors.summingInt(Employee::getSalary))
```

如果我们想实现收集器的复合改怎么做呢？

```txt
If we wanted to create a collector to tabulate the sum of salaries by department, we could reuse the "sum of salaries" logic using Collectors.groupingBy(Function, Collector):
```

如果以向创建一个根据部门对于工资的总和表格化，我们就可以重用“工资总和”逻辑，然后使用分组方法Collectors.groupingBy(Function, Collector):

```java
 Collector<Employee, ?, Map<Department, Integer>> summingSalariesByDept
         = Collectors.groupingBy(Employee::getDepartment, summingSalaries);
```

这里的第二个参数就是我们上面定义过的收集器，这就实现了收集器的复合。

### Collector实践

Collector接口有且仅有唯一的实现类CollectorImpl：

```java
    static class CollectorImpl<T, A, R> implements Collector<T, A, R> {
        private final Supplier<A> supplier;
        private final BiConsumer<A, T> accumulator;
        private final BinaryOperator<A> combiner;
        private final Function<A, R> finisher;
        private final Set<Characteristics> characteristics;

        CollectorImpl(Supplier<A> supplier,
                      BiConsumer<A, T> accumulator,
                      BinaryOperator<A> combiner,
                      Function<A,R> finisher,
                      Set<Characteristics> characteristics) {
            this.supplier = supplier;
            this.accumulator = accumulator;
            this.combiner = combiner;
            this.finisher = finisher;
            this.characteristics = characteristics;
        }

        CollectorImpl(Supplier<A> supplier,
                      BiConsumer<A, T> accumulator,
                      BinaryOperator<A> combiner,
                      Set<Characteristics> characteristics) {
            this(supplier, accumulator, combiner, castingIdentity(), characteristics);
        }

        @Override
        public BiConsumer<A, T> accumulator() {
            return accumulator;
        }

        @Override
        public Supplier<A> supplier() {
            return supplier;
        }

        @Override
        public BinaryOperator<A> combiner() {
            return combiner;
        }

        @Override
        public Function<A, R> finisher() {
            return finisher;
        }

        @Override
        public Set<Characteristics> characteristics() {
            return characteristics;
        }
    }
```

需要注意的是，这个类没有定义在一个单独的文件当中，而是定义在Collectors当中，这个类本身并没有做任何事情，只是根据Collector接口的要求，将需要的属性和方法定义好。这么做的理由是什么呢？实际上是一种设计上的考量，Collectors类被用来生产一些常见的方法，它绝大部分的方法都是静态方法，可以直接调用，而作为Collector的工厂，所有的方法一定会返回CollectorImpl类型，而在别的地方，又不会用到CollectorImpl，所以设计者直接将这个类作为一个静态的内部类。

接下来我们就围绕Collectors为我们提供的诸多的静态方法展开，了解这些方法的使用以及实现细节。

```txt
Implementations of Collector that implement various useful reduction operations, such as accumulating elements into collections, summarizing elements according to various criteria, etc.
```

Collectors实现了Collector接口并提供了很多很有用的汇聚操作，比如将元素累积到一个集合当中，比如摘要（最大值、最小值、平均值等等）。

```txt
The following are examples of using the predefined collectors to perform common mutable reduction tasks:
```

下面的例子就是使用JDK预先定义好的方法来执行可变的汇聚任务：

```java
     // Accumulate names into a List
     List<String> list = people.stream().map(Person::getName).collect(Collectors.toList());

     // Accumulate names into a TreeSet
     Set<String> set = people.stream().map(Person::getName).collect(Collectors.toCollection(TreeSet::new));

     // Convert elements to strings and concatenate them, separated by commas
     String joined = things.stream()
                           .map(Object::toString)
                           .collect(Collectors.joining(", "));

     // Compute sum of salaries of employee
     int total = employees.stream()
                          .collect(Collectors.summingInt(Employee::getSalary)));

     // Group employees by department
     Map<Department, List<Employee>> byDept
         = employees.stream()
                    .collect(Collectors.groupingBy(Employee::getDepartment));

     // Compute sum of salaries by department
     Map<Department, Integer> totalByDept
         = employees.stream()
                    .collect(Collectors.groupingBy(Employee::getDepartment,
                                                   Collectors.summingInt(Employee::getSalary)));

     // Partition students into passing and failing
     Map<Boolean, List<Student>> passingFailing =
         students.stream()
                 .collect(Collectors.partitioningBy(s -> s.getGrade() >= PASS_THRESHOLD));
```

在完整的理解了收集器相关的概念之后，我们可以看一些具体的例子，针对于之前的学生的集合，如果我们想求出学生分数的最小值：

```java
students.stream().collect(Collectors.minBy(Comparator.comparingInt(Student::getScore))).ifPresent(System.out::println);
```

如果是最大值呢？

```java
students.stream().collect(Collectors.maxBy(Comparator.comparingInt(Student::getScore))).ifPresent(System.out::println);
```

如果是平均值呢？

```java
System.out.println( students.stream().collect(Collectors.averagingInt(Student::getScore)));
```

如果是求出分数的总和呢？

```java
System.out.println(students.stream().collect(Collectors.summingInt(Student::getScore)));
```

当然也可以调用统计的方法一次将这些特征值都求出来：

```java
System.out.println(students.stream().collect(Collectors.summarizingInt(Student::getScore)));
```

如果想将学生的名字使用字符串拼接呢？

```java
System.out.println(students.stream().map(Student::getName).collect(Collectors.joining()));
```

还可以使用逗号分隔：

```java
System.out.println(students.stream().map(Student::getName).collect(Collectors.joining(",")));
```

还可以拼接前缀和后缀：

```java
System.out.println(students.stream().map(Student::getName).collect(Collectors.joining(",","<begin>","<end>")));
```

除了这些常规的操作，其实对于分组的操作还可以进行二级分组：

```java
students.stream().collect(Collectors.groupingBy(Student::getScore,Collectors.groupingBy(Student::getName)));
```

类似的对于分区的操作也可以进行二级分区：

```java
students.stream().collect(Collectors.partitioningBy(student -> student.getScore() > 90, Collectors.        partitioningBy(student -> student.getScore() > 80)));
```

分组和分区还可以互相嵌套：

```java
students.stream().collect(Collectors.partitioningBy(student -> student.getScore() > 80, Collectors.counting()));
```

下面我们来看一个稍微复杂一点的例子：

```java
students.stream().collect(Collectors.groupingBy(Student::getName,Collectors.collectingAndThen(Collectors.minBy(Comparator.comparingInt(Student::getScore)), Optional::get)));
```

### 自定义Collector

在进行Collector源码分析的时候，我们提到过Characteristics这个内部枚举类，接下来我们首先分析每一个枚举项代表的含义：

1、CONCURRENT

```txt
Indicates that this collector is concurrent, meaning that the result container can support the accumulator function being called concurrently with the same result container from multiple threads.
If a CONCURRENT collector is not also UNORDERED, then it should only be evaluated concurrently if applied to an unordered data source.
```

CONCURRENT表示当前的收集器是并发的，这意味着中间结果容器支持使用多线程进行并发访问，CONCURRENT并不是UNORDERED，只有无序的数据源才可以使用这个属性。

2、UNORDERED

```txt
Indicates that the collection operation does not commit to preserving the encounter order of input elements. (This might be true if the result container has no intrinsic order, such as a Set.)
```

UNORDERED意味着收集的操作并不确保保留输入元素的顺序（可以用在结果容器不要求有序的场景下，比如Set）

3、IDENTITY_FINISH

```txt
Indicates that the finisher function is the identity function and can be elided. If set, it must be the case that an unchecked cast from A to R will succeed.
```

IDENTITY_FINISH表示finisher方法就是identity方法，可以被省略掉，如果设置了这个属性，那么就要确保从A类型到R类型的强制转换是可以成功的。

接下来我们实现一个自定义的收集器：

```java
public class MySetCollector<T> implements Collector<T, Set<T>, Set<T>> {
    @Override
    public Supplier<Set<T>> supplier() {
        System.out.println("supplier invoked!");
        return HashSet::new;
    }

    @Override
    public BiConsumer<Set<T>, T> accumulator() {
        System.out.println("accmulator invoked!");
        // 这里不能调用HashSet::add，因为无法保证与supplier()方法返回的中间结果容器类型相同
        return Set::add;
    }

    @Override
    public BinaryOperator<Set<T>> combiner() {
        System.out.println("combiner invoked!");
        return (set1, set2) -> {
            set1.addAll(set2);
            return set1;
        };
    }

    @Override
    public Function<Set<T>, Set<T>> finisher() {
        System.out.println("finisher invoked!");
        return Function.identity();
    }

    @Override
    public Set<Characteristics> characteristics() {
        System.out.println("characteristics invoked!");
        return Collections.unmodifiableSet(EnumSet.of(Characteristics.IDENTITY_FINISH, Characteristics.UNORDERED));
    }

    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "welcome");
        Set<String> set = list.stream().collect(new MySetCollector<>());
        System.out.println(set);
    }
}
```

程序运行的结果如下：

```txt
supplier invoked!
accmulator invoked!
combiner invoked!
characteristics invoked!
characteristics invoked!
[world, hello, welcome]
```

可以看到supplier、accumulator、combiner分别执行了一次，而characteristics执行了两次，只有finisher没有被调用。

```java
    public final <R, A> R collect(Collector<? super P_OUT, A, R> collector) {
        A container;
        // 如果是并行流
        if (isParallel()
                && (collector.characteristics().contains(Collector.Characteristics.CONCURRENT))
                && (!isOrdered() || collector.characteristics().contains(Collector.Characteristics.UNORDERED))) {
            container = collector.supplier().get();
            BiConsumer<A, ? super P_OUT> accumulator = collector.accumulator();
            forEach(u -> accumulator.accept(container, u));
        }
        else {
            container = evaluate(ReduceOps.makeRef(collector));
        }
        // characteristics()在这里被第二次调用，用于判断中间结果容器与最终返回的类型是否相同,如果包含了IDENTITY_FINISH这个特性，直接进行强制类型转换，会将中间结果容器强制转换为最终的结果类型。
        return collector.characteristics().contains(Collector.Characteristics.IDENTITY_FINISH)
               ? (R) container
               : collector.finisher().apply(container);
    }
```

这里我们显然是串行流，所以直接进入到第二种情况，首先我们来看一下ReduceOps的makeRef方法：

```java
 public static <T, I> TerminalOp<T, I>
    makeRef(Collector<? super T, I, ?> collector) {
        // 我们的方法就是在这里被调用了，返回了supplier、accumulator、combiner三个对象。
        Supplier<I> supplier = Objects.requireNonNull(collector).supplier();
        BiConsumer<I, ? super T> accumulator = collector.accumulator();
        BinaryOperator<I> combiner = collector.combiner();
        class ReducingSink extends Box<I>
                implements AccumulatingSink<T, I, ReducingSink> {
            @Override
            public void begin(long size) {
                state = supplier.get();
            }

            @Override
            public void accept(T t) {
                accumulator.accept(state, t);
            }

            @Override
            public void combine(ReducingSink other) {
                state = combiner.apply(state, other.state);
            }
        }
        return new ReduceOp<T, I, ReducingSink>(StreamShape.REFERENCE) {
            @Override
            public ReducingSink makeSink() {
                return new ReducingSink();
            }
			// Characteristics()在这里被第一次调用，用于判断是否有序
            @Override
            public int getOpFlags() {
                return collector.characteristics().contains(Collector.Characteristics.UNORDERED)
                       ? StreamOpFlag.NOT_ORDERED
                       : 0;
            }
        };
    }
```

为了验证关于Characteristics方法的调用逻辑，我们去掉characteristics方法中的枚举项IDENTITY_FINISH：

```java
	@Override
    public Set<Characteristics> characteristics() {
        System.out.println("characteristics invoked!");
        return Collections.unmodifiableSet(EnumSet.of( Characteristics.UNORDERED));
    }
```

观察结果，finsher就得到了调用：

```txt
supplier invoked!
accmulator invoked!
combiner invoked!
characteristics invoked!
characteristics invoked!
finisher invoked!
[world, hello, welcome]
```

接下来我们定义一个中间结果容器需要进行类型转换的例子：

```java
public class MySetCollector2<T> implements Collector<T, Set<T>, Map<T, T>> {
    @Override
    public Supplier<Set<T>> supplier() {
        System.out.println("supplier invoked!");
        return HashSet::new;
    }

    @Override
    public BiConsumer<Set<T>, T> accumulator() {
        System.out.println("accmulator invoked!");
        return (set, item) -> set.add(item);
    }

    @Override
    public BinaryOperator<Set<T>> combiner() {
        System.out.println("combiner invoked!");
        return (set1, set2) -> {
            set1.addAll(set2);
            return set1;
        };
    }

    @Override
    public Function<Set<T>, Map<T, T>> finisher() {
        System.out.println("finisher invoked!");
        return set -> {
            Map<T, T> map = new HashMap<>(10);
            set.forEach(item -> map.put(item, item));
            return map;
        };
    }

    @Override
    public Set<Characteristics> characteristics() {
        System.out.println("characteristics invoked!");
        return Collections.unmodifiableSet(EnumSet.of(Characteristics.UNORDERED));
    }

    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "welcome", "hello", "a", "b", "c", "d", "e", "f", "g");
        Set<String> set = new HashSet<>();
        set.addAll(list);
        System.out.println("set: " + set);
        Map<String, String> map = set.stream().collect(new MySetCollector2<>());
        System.out.println(map);
    }
}
```

执行的结果：

```txt
supplier invoked!
accmulator invoked!
combiner invoked!
characteristics invoked!
characteristics invoked!
finisher invoked!
{a=a, b=b, world=world, c=c, d=d, e=e, f=f, g=g, hello=hello, welcome=welcome}
```

如果将这个枚举值修改为：

```java
return Collections.unmodifiableSet(EnumSet.of(Characteristics.UNORDERED,Characteristics.IDENTITY_FINISH));
```

就会抛出异常：

```txt
Exception in thread "main" java.lang.ClassCastException: java.util.HashSet cannot be cast to java.util.Map
```

这就是因为我们的中间结果类型是Set类型，而最终的结果类型是Map类型，同时也说明了characteristics就定义了中间结果容器和最终结果的结果容器类型的关系，在运行期间，JDK会根据这个枚举项类判断他们之间的关系，如果编写错误了，就可能会出现错误。

另外如果中间结果容器和最终结果的结果容器类型相同，但是需要对于中间结果容器做一些处理才返回结果，这个时候也要去掉IDENTITY_FINISH这个枚举值，因为在执行过程中，会直接转换类型，而不会操作里面的值。

如果我们在accumulator中打印当前线程的名称：

```java
    @Override
    public BiConsumer<Set<T>, T> accumulator() {
        System.out.println("accmulator invoked!");
        return (set, item) -> {
            set.add(item);
            System.out.println("accmulator: " + Thread.currentThread().getName());
        };
    }
```

控制台就会打印十次：

```txt
accmulator: main
accmulator: main
accmulator: main
accmulator: main
accmulator: main
accmulator: main
accmulator: main
accmulator: main
accmulator: main
accmulator: main
```

去掉集合中重复的元素"hello",正好是十个元素，执行了十次累积的操作，并且都是主线程的，如果我们使用并行流：

```java
Map<String, String> map = set.parallelStream().collect(new MySetCollector2<>());
```

运行的结果就变成了：

```txt
set: [a, b, world, c, d, e, f, g, hello, welcome]
characteristics invoked!
supplier invoked!
accmulator invoked!
combiner invoked!
characteristics invoked!
accmulator: main
accmulator: ForkJoinPool.commonPool-worker-5
accmulator: ForkJoinPool.commonPool-worker-4
accmulator: ForkJoinPool.commonPool-worker-3
accmulator: ForkJoinPool.commonPool-worker-1
accmulator: ForkJoinPool.commonPool-worker-1
accmulator: ForkJoinPool.commonPool-worker-3
accmulator: ForkJoinPool.commonPool-worker-3
accmulator: ForkJoinPool.commonPool-worker-5
accmulator: ForkJoinPool.commonPool-worker-2
characteristics invoked!
finisher invoked!
{a=a, b=b, world=world, c=c, d=d, e=e, f=f, g=g, hello=hello, welcome=welcome}
```

为了方便观察并行流和串行流的区别，我们打印一下，进行累积操作的集合中的元素，再次运行，就会发现：

```txt
set: [a, b, world, c, d, e, f, g, hello, welcome]
characteristics invoked!
supplier invoked!
accmulator invoked!
combiner invoked!
characteristics invoked!
[hello]
[b]
accmulator: ForkJoinPool.commonPool-worker-2
accmulator: main
[f]
accmulator: ForkJoinPool.commonPool-worker-3
[d]
accmulator: ForkJoinPool.commonPool-worker-1
[d, e]
accmulator: ForkJoinPool.commonPool-worker-1
[welcome]
accmulator: ForkJoinPool.commonPool-worker-4
[f, g]
accmulator: ForkJoinPool.commonPool-worker-3
[b, world]
accmulator: ForkJoinPool.commonPool-worker-2
[b, world, c]
accmulator: ForkJoinPool.commonPool-worker-2
[a]
accmulator: ForkJoinPool.commonPool-worker-5
characteristics invoked!
finisher invoked!
{a=a, b=b, world=world, c=c, d=d, e=e, f=f, g=g, hello=hello, welcome=welcome}
```

这里就会开启多个线程，这个时候如果再设置CONCURRENT特性：

```java
return Collections.unmodifiableSet(EnumSet.of(Characteristics.UNORDERED, Characteristics.CONCURRENT));
```

控制台输出：

```txt
set: [a, b, world, c, d, e, f, g, hello, welcome]
characteristics invoked!
supplier invoked!
====================================
accmulator invoked!
[hello]
accmulator: main
[hello, welcome]
accmulator: ForkJoinPool.commonPool-worker-2
[f, hello, welcome]
[b, f, hello, welcome]
accmulator: ForkJoinPool.commonPool-worker-2
accmulator: ForkJoinPool.commonPool-worker-3
[a, b, f, hello, welcome]
accmulator: ForkJoinPool.commonPool-worker-4
[a, b, world, d, f, g, hello, welcome]
accmulator: ForkJoinPool.commonPool-worker-3
[a, b, world, d, f, hello, welcome]
accmulator: ForkJoinPool.commonPool-worker-2
[a, b, d, f, hello, welcome]
accmulator: ForkJoinPool.commonPool-worker-1
[a, b, world, c, d, e, f, g, hello, welcome]
accmulator: ForkJoinPool.commonPool-worker-1
[a, b, world, c, d, f, g, hello, welcome]
accmulator: ForkJoinPool.commonPool-worker-2
characteristics invoked!
finisher invoked!
{a=a, b=b, world=world, c=c, d=d, e=e, f=f, g=g, hello=hello, welcome=welcome}
```

如果执行的次数过多，还有可能会出现如下报错：

```java
Exception in thread "main" java.util.ConcurrentModificationException: java.util.ConcurrentModificationException
```

这是因为设置了CONCURRENT特性，多个线程就会操作同一个中间结果容器，而在我们的程序中，除了往集合中不断累加元素之外，还在打印集合中的元素：

```java
    public BiConsumer<Set<T>, T> accumulator() {
        System.out.println("accmulator invoked!");
        return (set, item) -> {
            set.add(item);
            System.out.println("accmulator: " + Thread.currentThread().getName());
        };
    }
```

这将导致，偶发的情况下就会出现并发修改的异常，这就要求在在定义Collector的是偶，如果设置了CONCURRENT特性，accumulator方法只能进行累积的操作，而尽量不要进行其他的操作。

总结一下，在使用并行流的时候，如果设置了CONCURRENT特性，那么多个线程就会操作操作同一个中间结果容器，而这个唯一的结果容器就是最终的结果容器，如果没有设置这个特性，那么就会操作不同的中间结果容器，换言之，如果设置了CONCURRENT特性，那么combiner就不会被调用，因为无需进行最后的合并操作，而如果没有设置，那么combiner就会得到调用。

总而言之combiner被调用有两个条件，一个是并行流，一个是没有设置CONCURRENT特性，中间结果容器的个数也是类似的，只有当开启并行流，并且没有设置过CONCURRENT特性的时候才会创建和流中元素个数相同的中间结果容器。

开启并行流的方式除了之前我们使用过的parallelStream，其实还可以这样：

```java
Map<String, String> map = set.stream().parallel().collect(new MySetCollector2<>());
```

如果要使用串行流，你也可以：

```java
Map<String, String> map = set.stream().sequential().collect(new MySetCollector2<>());
```

甚至可以：

```java
Map<String, String> map = set.stream().sequential().parallel().sequential().collect(new MySetCollector2<>());
```

但需要注意的是，这里程序并不会依次的调用，而是会调用最后指定的方式，也就是说，上面的代码其实等价于：

```java
Map<String, String> map = set.stream().sequential().collect(new MySetCollector2<>());
```

这两种写法完全是等价的，这是因为，选择并行流还是串行流，仅仅是由一个布尔值来控制的：

```java
   /**
     * True if pipeline is parallel, otherwise the pipeline is sequential; only
     * valid for the source stage.
     */
    private boolean parallel;
```

### Collectors源码分析

自定义Collector的过程帮助我们很好的理解了关于Collector的基本概念，我们也尝试着自己实现了两个相对比较简单的例子，Collectors作为生产Collector的静态工厂类，里面有大量的关于Collector的实现，本节我们就分析JDK已经帮我们实现的Collector的例子，学习这些例子，有助于我们强化对于Collector的理解。

对于Collectors静态工厂来说，实现Collector，总的来说分为两种情况：

1. 通过CollectorImpl来实现
2. 通过reducing方法来实现，而reducing方法本身又是通过CollectorImpl来实现的。

首先我们来分析一下我们使用过的最多的toList方法：

```java
   public static <T> Collector<T, ?, List<T>> toList() {
        return new CollectorImpl<>((Supplier<List<T>>) ArrayList::new, List::add,
                                   (left, right) -> { left.addAll(right); return left; },
                                   CH_ID);
    }
```

这里的(Supplier<List<T>>) ArrayList::new也可以写成`ArrayList<T>::new`，这里的第四个参数是：

```java
    static final Set<Collector.Characteristics> CH_ID
            = Collections.unmodifiableSet(EnumSet.of(Collector.Characteristics.IDENTITY_FINISH));
```

这里的属性值是IDENTITY_FINISH，意味着中间结果容器的类型和最终返回的结果类型相同，所以无需定义finisher。对于toList还有一个接受的更宽广的toCollection：

```java
   public static <T, C extends Collection<T>>
    Collector<T, ?, C> toCollection(Supplier<C> collectionFactory) {
        return new CollectorImpl<>(collectionFactory, Collection<T>::add,
                                   (r1, r2) -> { r1.addAll(r2); return r1; },
                                   CH_ID);
    }
```

这里只是提供了创建结果容器的入口，例如，要使用LinkedList，你只需要：

```java
list.stream().collect(Collectors.toCollection(LinkedList::new));
```

对于toSet方法：

```java
   public static <T>
    Collector<T, ?, Set<T>> toSet() {
        return new CollectorImpl<>((Supplier<Set<T>>) HashSet::new, Set::add,
                                   (left, right) -> { left.addAll(right); return left; },
                                   CH_UNORDERED_ID);
    }
```

由于Set集合本身是无序的，并且最终返回的结果也是Set类型，所以它的特性值是：

```java
    static final Set<Collector.Characteristics> CH_UNORDERED_ID
            = Collections.unmodifiableSet(EnumSet.of(Collector.Characteristics.UNORDERED,
                                                     Collector.Characteristics.IDENTITY_FINISH));
```

对于joining方法：

```java
    public static Collector<CharSequence, ?, String> joining() {
        return new CollectorImpl<CharSequence, StringBuilder, String>(
                StringBuilder::new, StringBuilder::append,
                (r1, r2) -> { r1.append(r2); return r1; },
                StringBuilder::toString, CH_NOID);
    }
```

joining方法与之前的方法不同的是，它还调用了finisher方法，这是因为需要将StringBuilder转为String类型。这里的第四个参数指的是：

```java
static final Set<Collector.Characteristics> CH_NOID = Collections.emptySet();
```

返回的是一个空的集合，说明三个特性都不具备。

joining还有一个重载的方法，可以增加前缀和后缀：

```java
    public static Collector<CharSequence, ?, String> joining(CharSequence delimiter,
                                                             CharSequence prefix,
                                                             CharSequence suffix) {
        return new CollectorImpl<>(
                () -> new StringJoiner(delimiter, prefix, suffix),
                StringJoiner::add, StringJoiner::merge,
                StringJoiner::toString, CH_NOID);
    }
```

StringJoiner是JDK1.8提供的一个新的类，用于完成字符串的拼接操作。

```java
    public static <T, U, A, R>
    Collector<T, ?, R> mapping(Function<? super T, ? extends U> mapper,
                               Collector<? super U, A, R> downstream) {
        BiConsumer<A, ? super U> downstreamAccumulator = downstream.accumulator();
        return new CollectorImpl<>(downstream.supplier(),
                                   (r, t) -> downstreamAccumulator.accept(r, mapper.apply(t)),
                                   downstream.combiner(), downstream.finisher(),
                                   downstream.characteristics());
    }
```

这是一个相对比较复杂的例子，我们先来读一下方法说明：

```txt
Adapts a Collector accepting elements of type U to one accepting elements of type T by applying a mapping function to each input element before accumulation.
```

mapping方法被用来在累积操作之前对每个输入元素都应用mapping方法，将接收的U类型映射为T类型，从而实现收集器的映射。

方法本身接收两个参数：

```txt
mapper – a function to be applied to the input elements
downstream – a collector which will accept mapped values
```

这里的下游指的是，将要被映射的值，给出了一个具体的案例：

```java
 Map<City, Set<String>> lastNamesByCity
         = people.stream().collect(groupingBy(Person::getCity,
                                              mapping(Person::getLastName, toSet())));
```

比这个例子稍微复杂一点的例子：

```java
    public static<T,A,R,RR> Collector<T,A,RR> collectingAndThen(Collector<T,A,R> downstream,
                                                                Function<R,RR> finisher) {
        Set<Collector.Characteristics> characteristics = downstream.characteristics();
        if (characteristics.contains(Collector.Characteristics.IDENTITY_FINISH)) {
            if (characteristics.size() == 1)
                // 如果只有IDENTITY_FINISH特性，就将特性值设置为空
                characteristics = Collectors.CH_NOID;
            else {
                // 将IDENTITY_FINISH去掉
                characteristics = EnumSet.copyOf(characteristics);
                characteristics.remove(Collector.Characteristics.IDENTITY_FINISH);
                characteristics = Collections.unmodifiableSet(characteristics);
            }
        }
        return new CollectorImpl<>(downstream.supplier(),
                                   downstream.accumulator(),
                                   downstream.combiner(),
                                   downstream.finisher().andThen(finisher),
                                   characteristics);
    }

```

首先来读一下方法的说明：

```txt
Adapts a Collector to perform an additional finishing transformation. For example, one could adapt the toList() collector to always produce an immutable list with:
```

适配一个Collector来执行finisher方法的转换，例如，我们可以使用这个方法将使用toList收集的方法来转换为一个不可变的集合，例如：

```java
  List<String> people
         = people.stream().collect(collectingAndThen(toList(), Collections::unmodifiableList));
```

toList本身方法返回的是一个ArrayList对象，本身是可变的，通过这种方式就可以得到一个不可变的集合列表，方法实现中将原来流中的IDENTITY_FINISH特性去掉的原因在于，如果设置了这个特性值，finisher方法就不会得到执行，而collectingAndThen方法的目的就在于转换最终的结果类型，关键就在于需要执行的finisher方法。

接下来我们看一个之前使用的方法，summingInt的实现：

```java
    public static <T> Collector<T, ?, Integer>
    summingInt(ToIntFunction<? super T> mapper) {
        return new CollectorImpl<>(
                () -> new int[1],
                (a, t) -> { a[0] += mapper.applyAsInt(t); },
                (a, b) -> { a[0] += b[0]; return a; },
                a -> a[0], CH_NOID);
    }

```

summingInt方法的说明：

```txt
Returns a Collector that produces the sum of a integer-valued function applied to the input elements. If no elements are present, the result is 0.
```

 返回的Collector是对流中的每一个元素执行传入的整型值函数，如果流中没有元素，就返回0。

需要说明的是，这里为什么不直接使用数字，而是new了一个int类型的数组，原因在于数字是值类型的，而数组是引用类型的，值类型的参数无法进行传递，数组本身也符合容器的定义，只不过这里每次只是取出来数组中唯一的元素，对数组中唯一的元素进行累加的操作。

以上都是通过CollectorImpl来实现的Collector，接下来我们看一下通过reducing来实现的例子，首先来查看reducing方法的定义：

```java
    public static <T, U>
    Collector<T, ?, U> reducing(U identity,
                                Function<? super T, ? extends U> mapper,
                                BinaryOperator<U> op) {
        return new CollectorImpl<>(
                boxSupplier(identity),
                (a, t) -> { a[0] = op.apply(a[0], mapper.apply(t)); },
                (a, b) -> { a[0] = op.apply(a[0], b[0]); return a; },
                a -> a[0], CH_NOID);
    }
```

reducing方法也是借助CollectorImpl来实现的Collector的，我们来阅读一下reducing方法的说明：

```txt
Returns a Collector which performs a reduction of its input elements under a specified mapping function and BinaryOperator. This is a generalization of reducing(Object, BinaryOperator) which allows a transformation of the elements before reduction.
```

groupingBy和partitioningBy是整个Collectors类中比较难以理解的两部分，关键的部分在于，理解每个泛型代表的含义以及每个参数的作用，在有了前面的基础之后，我们有必要了解一下有关分区和分组的实现。首先来看一下groupingBy方法的定义：

```java
    public static <T, K> Collector<T, ?, Map<K, List<T>>>
    groupingBy(Function<? super T, ? extends K> classifier) {
        return groupingBy(classifier, toList());
    }
```

T类型表示流中元素的类型，？表示的是中间结果容器的类型，Map是最终的结果类型，K表示分类的时候的key的类型，`List<T>`就表示根据分类依据K分类之后的列表集合，方法本身的参数并没有直接使用T和K，而是使用T类型以及T以上的类型，K类型以及K类型以下的类型，并且只接受一个参数，调用了另一个重载的groupingBy方法：

```java
    public static <T, K, A, D>
    Collector<T, ?, Map<K, D>> groupingBy(Function<? super T, ? extends K> classifier,
                                          Collector<? super T, A, D> downstream) {
        return groupingBy(classifier, HashMap::new, downstream);
    }
```

方法的第一个参数是一个Function类型，第二个参数是Collector类型的，同样的，我们需要搞清楚这里每一个泛型的含义，T表示流中元素的类型，K表示分类器返回的结果的类型，或者说是返回的Map的key的类型，D表示Map返回的值的类型，方法要完成的事情实际上就是要将downstream在收集的时候，应用分类器classifier。它本身又调用一个重载的方法，在查看之前首先需要了解一个JDK中新增加的方法，在最终构造返回的accumulator的时候，我们要用到Map接口中所新增加的默认方法computeIfAbsent：

```java
default V computeIfAbsent(K key,
            Function<? super K, ? extends V> mappingFunction) {
        Objects.requireNonNull(mappingFunction);
    	// 	V表示当前map的值的类型
        V v;
        if ((v = get(key)) == null) {
            V newValue;
            if ((newValue = mappingFunction.apply(key)) != null) {
                put(key, newValue);
                return newValue;
            }
        }

        return v;
    }
```

方法的说明：

```txt
If the specified key is not already associated with a value (or is mapped to null), attempts to compute its value using the given mapping function and enters it into this map unless null.
```

如果给定一个key与值没有关联起来（或者键映射为空），直接返回结果，如果它不为空的话，将尝试着计算他们的值使用给定的映射方法，就将他放入到map里面。总而言之，如果key不存在，则返回，如果存在，就执行mappingFunction，然后将映射之后的值放入到map当中。

下面的方式是groupingBy真正执行的方法：

```java
public static <T, K, D, A, M extends Map<K, D>>
    Collector<T, ?, M> groupingBy(Function<? super T, ? extends K> classifier,
                                  Supplier<M> mapFactory,
                                  Collector<? super T, A, D> downstream) {
    	// A表示下游收集器的中间结果容器类型
        Supplier<A> downstreamSupplier = downstream.supplier();
    	// T表示流中元素的类型
        BiConsumer<A, ? super T> downstreamAccumulator = downstream.accumulator();
    	// 构造最终所返回的累加器对象
        BiConsumer<Map<K, A>, T> accumulator = (m, t) -> {
            K key = Objects.requireNonNull(classifier.apply(t), "element cannot be mapped to a null key");
            A container = m.computeIfAbsent(key, k -> downstreamSupplier.get());
            downstreamAccumulator.accept(container, t);
        };
    	// 完成两个Map的合并操作
        BinaryOperator<Map<K, A>> merger = Collectors.<K, A, Map<K, A>>mapMerger(downstream.combiner());
    	// 将M类型强转为<K,A>类型，M本身是<K,D>类型，由于中间结果类型一定是<K,A>类型，所以可以强转成功。
        @SuppressWarnings("unchecked")
        Supplier<Map<K, A>> mangledFactory = (Supplier<Map<K, A>>) mapFactory;

        if (downstream.characteristics().contains(Collector.Characteristics.IDENTITY_FINISH)) {
            return new CollectorImpl<>(mangledFactory, accumulator, merger, CH_ID);
        }
        else {
            // 下游收集器本身返回的是<A,D>类型的，这里也是由于一定是<A,A>类型的，所以可以强转成功。
            @SuppressWarnings("unchecked")
            Function<A, A> downstreamFinisher = (Function<A, A>) downstream.finisher();
            // 将Map中的键值对替换 
            Function<Map<K, A>, M> finisher = intermediate -> {
                intermediate.replaceAll((k, v) -> downstreamFinisher.apply(v));
                @SuppressWarnings("unchecked")
                M castResult = (M) intermediate;
                return castResult;
            };
            return new CollectorImpl<>(mangledFactory, accumulator, merger, finisher, CH_NOID);
        }
    }
```

第一个参数是一个分类器，输入类型是T，返回的是K类型，第二个参数是accumulator累加器的类型，对应上面例子中的HashMap::new，第三个参数是下游收集器，其中的A表示的是中间结果的容器类型，在整个方法的返回类型中，泛型M的定义是M extends Map<K, D>。首先我们来阅读以下这个方法的说明：

```txt
Returns a Collector implementing a cascaded "group by" operation on input elements of type T, grouping elements according to a classification function, and then performing a reduction operation on the values associated with a given key using the specified downstream Collector. The Map produced by the Collector is created with the supplied factory function.
```

groupingBy方法返回了完成对于给定T类型的层叠的分组操作的Collector，它是根据提供的分类器来对元素进行分组的，然后会对于给定的key所关联的值（即Map）使用给定的下游收集器执行汇聚操作，Collector所使用的Map是由supplied工厂函数提供的。

 ```txt
The classification function maps elements to some key type K. The downstream collector operates on elements of type T and produces a result of type D. The resulting collector produces a Map<K, D>.
 ```

分类器方法会将元素映射成某个k类型，然后下游收集器会对流中T类型的元素生成一个D类型的结果，所生成的collector类型是Map<K,D>。

```txt
For example, to compute the set of last names of people in each city, where the city names are sorted:
```

比如要根据城市的名字对城市中每个人的姓进行分组，并且返回的结果要求带有排序的功能：

```java
  Map<City, Set<String>> namesByCity
         = people.stream().collect(groupingBy(Person::getCity, TreeMap::new,
                                              mapping(Person::getLastName, toSet())));
```

关于分组的方法还有另外的说明：

```txt
The returned Collector is not concurrent. For parallel stream pipelines, the combiner function operates by merging the keys from one map into another, which can be an expensive operation. If preservation of the order in which elements are presented to the downstream collector is not required, using groupingByConcurrent(Function, Supplier, Collector) may offer better parallel performance.
```

groupingBy方法返回的Collector不是并发的，对于并行流管道，combiner方法会将一个map的key合并到另一个当中，这可能是一个昂贵的操作，如果对于下游收集器而言，元素的顺序不是很重要的话，建议使用groupingByConcurrent，它可以提供更好的并发的性能：

```java
    public static <T, K, A, D>
    Collector<T, ?, ConcurrentMap<K, D>> groupingByConcurrent(Function<? super T, ? extends K> classifier,
                                                              Collector<? super T, A, D> downstream) {
        return groupingByConcurrent(classifier, ConcurrentHashMap::new, downstream);
    }
```

原因就在于groupingByConcurrent使用的是ConcurrentHashMap。

与groupingBy相关联的另一个方法就是分区partitioningBy：

```java
    public static <T>
    Collector<T, ?, Map<Boolean, List<T>>> partitioningBy(Predicate<? super T> predicate) {
        return partitioningBy(predicate, toList());
    }
```

它也有两个重载的方法：

```java
    public static <T, D, A>
    Collector<T, ?, Map<Boolean, D>> partitioningBy(Predicate<? super T> predicate,
                                                    Collector<? super T, A, D> downstream) {
        BiConsumer<A, ? super T> downstreamAccumulator = downstream.accumulator();
        BiConsumer<Partition<A>, T> accumulator = (result, t) ->
                downstreamAccumulator.accept(predicate.test(t) ? result.forTrue : result.forFalse, t);
        BinaryOperator<A> op = downstream.combiner();
        BinaryOperator<Partition<A>> merger = (left, right) ->
                new Partition<>(op.apply(left.forTrue, right.forTrue),
                                op.apply(left.forFalse, right.forFalse));
        Supplier<Partition<A>> supplier = () ->
                new Partition<>(downstream.supplier().get(),
                                downstream.supplier().get());
        if (downstream.characteristics().contains(Collector.Characteristics.IDENTITY_FINISH)) {
            return new CollectorImpl<>(supplier, accumulator, merger, CH_ID);
        }
        else {
            Function<Partition<A>, Map<Boolean, D>> finisher = par ->
                    new Partition<>(downstream.finisher().apply(par.forTrue),
                                    downstream.finisher().apply(par.forFalse));
            return new CollectorImpl<>(supplier, accumulator, merger, finisher, CH_NOID);
        }
    }
```

这里的Partition是用来定义分组结果的一个静态内部类：

```java
   private static final class Partition<T>
            extends AbstractMap<Boolean, T>
            implements Map<Boolean, T> {
        final T forTrue;
        final T forFalse;

        Partition(T forTrue, T forFalse) {
            this.forTrue = forTrue;
            this.forFalse = forFalse;
        }

        @Override
        public Set<Map.Entry<Boolean, T>> entrySet() {
            return new AbstractSet<Map.Entry<Boolean, T>>() {
                @Override
                public Iterator<Map.Entry<Boolean, T>> iterator() {
                    Map.Entry<Boolean, T> falseEntry = new SimpleImmutableEntry<>(false, forFalse);
                    Map.Entry<Boolean, T> trueEntry = new SimpleImmutableEntry<>(true, forTrue);
                    return Arrays.asList(falseEntry, trueEntry).iterator();
                }

                @Override
                public int size() {
                    return 2;
                }
            };
        }
    }
```

之所以这么做的原因是，分区一定是固定的两组结果，如果再使用Map类描述的话并不是特别清晰。

## Stream原理

收集器是我们认识整个Stream的第一步，在了解了有关收集器的内容之后，可以为我们了解Stream打下良好的基础，这一部分是整个函数式编程最核心的部分，我们将会看到JDK在底层到底是如何巧妙的实现函数式编程。

### Stream源码分析

在正式开始介绍之前，需要有一些预备的知识，从JDK1.7开始增加了这样一个接口：

```java
public interface AutoCloseable {
    void close() throws Exception;
}

```

方法的说明：

```txt
An object that may hold resources (such as file or socket handles) until it is closed. The close() method of an AutoCloseable object is called automatically when exiting a try-with-resources block for which the object has been declared in the resource specification header. This construction ensures prompt release, avoiding resource exhaustion exceptions and errors that may otherwise occur.
```

这是一个关闭之前可能持有一些资源（比如文件、socket句柄）的对象，它的close方法会在退出 try-with-resources代码块的时候自动得到调用，这种调用的机制被声明在资源的规范的头里面，这种设置确保了可以适当的释放一些资源，避免了资源被消耗尽造异常外和错误。

举个例子：

```java
public class AutoCloseableTest implements AutoCloseable {
    @Override
    public void close() throws Exception {
        System.out.println("close invoked!");
    }

    public void doSomething() {
        System.out.println("doSomething invoked!");
    }

    public static void main(String[] args) throws Exception {
        try (AutoCloseableTest autoCloseableTest = new AutoCloseableTest()) {
            autoCloseableTest.doSomething();
        }
    }
}
```

使用这种方式可以替换原来的需要人为的显示关闭各种流的操作，close方法会自动的得到调用：

```txt
doSomething invoked!
close invoked!
```

接下来我们就完整的梳理一下关于Sream类本身的内容：

```txt
A sequence of elements supporting sequential and parallel aggregate operations. The following example illustrates an aggregate operation using Stream and IntStream:
```

首先Stream是一个支持并行与串行聚合操作的元素的序列，下面的示例演示了如何让使用Stream和IntStream进行聚合操作：

```java
int sum = widgets.stream()
                      .filter(w -> w.getColor() == RED)
                      .mapToInt(w -> w.getWeight())
                      .sum();
```

对于这个例子的说明：

```txt
In this example, widgets is a Collection<Widget>. We create a stream of Widget objects via Collection.stream(), filter it to produce a stream containing only the red widgets, and then transform it into a stream of int values representing the weight of each red widget. Then this stream is summed to produce a total weight.
```

在这个例子当中，widgets是Widget类型的集合，我们通过使用Collection的stream方法创建了一个Widget对象的流，生成了一个新的只包含红色的Widget的流，然后将它转换成int值的Stream对象，代表了每个红色Widget的重量，最后流被汇总起来生成一个总的重量。

```txt
In addition to Stream, which is a stream of object references, there are primitive specializations for IntStream, LongStream, and DoubleStream, all of which are referred to as "streams" and conform to the characteristics and restrictions described here.
```

Stream本身是一个对象引用流，除了他还有一些原生的、特化的版本。比如IntStream、LongStream、DoubleStream，他们都被称之为Stream，满足Stream的特性，遵循Stream的相关约束。

```txt
To perform a computation, stream operations are composed into a stream pipeline. A stream pipeline consists of a source (which might be an array, a collection, a generator function, an I/O channel, etc), zero or more intermediate operations (which transform a stream into another stream, such as filter(Predicate)), and a terminal operation (which produces a result or side-effect, such as count() or forEach(Consumer)). Streams are lazy; computation on the source data is only performed when the terminal operation is initiated, and source elements are consumed only as needed.
```

为了进行计算，Stream会被组合成一个Stream pipeline（流管道）当中，一个流管道包含了一个元（可以是一个数组，一个集合，一个生成器法，一个I/O通道等等），包含0个或多个中间操作（会将一个Stream转换为另一个Stream，比如filter(Predicate)），包含一个终止操作（将会产生一个结果或者是有副作用的，比如count() 或者forEach(Consumer)），流是延迟的，只有当终止操作开始的时候，才会对元数据的计算才会真正的进行执行，元的数据只有在需要的时候才会被消费。

```txt
Collections and streams, while bearing some superficial similarities, have different goals. Collections are primarily concerned with the efficient management of, and access to, their elements. By contrast, streams do not provide a means to directly access or manipulate their elements, and are instead concerned with declaratively describing their source and the computational operations which will be performed in aggregate on that source. However, if the provided stream operations do not offer the desired functionality, the iterator() and spliterator() operations can be used to perform a controlled traversal.
```

集合与流，他们有一些相似性，但是有不同的目标，集合主要考虑的是高效的访问和管理他们的元素，与之相反，流并不会直接提供直接的去操作元素的方式，而是通过声明式的方式来描述他们元以及操作，这些操作会被聚合起来应用到他们的元上面，流关注的是元的计算。然而，如果提供的流操作并没有所需要的功能，那么iterator()和spliterator() 就可以执行控制性的遍历（即采用传统的方式来进行一些流的操作）。

```txt
A stream pipeline, like the "widgets" example above, can be viewed as a query on the stream source. Unless the source was explicitly designed for concurrent modification (such as a ConcurrentHashMap), unpredictable or erroneous behavior may result from modifying the stream source while it is being queried.
```

一个流管道，比如刚才的widgets，它可以被看成是一种对于流元的查询，除非这个流被显示的设计成可以并发修改的（比如ConcurrentHashMap），否则一些错误的型为就可能会产生并发修改的异常。

```txt
Most stream operations accept parameters that describe user-specified behavior, such as the lambda expression w -> w.getWeight() passed to mapToInt in the example above. To preserve correct behavior, these behavioral parameters:
```

大多数的流都会接收用户指定的一种行为，比如Lambda表达式 w -> w.getWeight()，为了保证最终结果的正确性，这些行为参数都要满足下面的这些条件特性：

```txt
must be non-interfering (they do not modify the stream source); and
in most cases must be stateless (their result should not depend on any state that might change during execution of the stream pipeline).
```

- 他们必须是冲突非干扰的，
- 在大多数情况下都是一种无状态的操作（结果不应该依赖于在流管道执行过程当中可能会修改的任意状态）,即执行的结果与执行的顺序是无关的

```txt
Such parameters are always instances of a functional interface such as Function, and are often lambda expressions or method references. Unless otherwise specified these parameters must be non-null.
```

这些参数总是一个函数式接口的实例。比如说Lamda表达式，除特殊情况外，参数都是非空的。

```txt
stream should be operated on (invoking an intermediate or terminal stream operation) only once. This rules out, for example, "forked" streams, where the same source feeds two or more pipelines, or multiple traversals of the same stream. A stream implementation may throw IllegalStateException if it detects that the stream is being reused. However, since some stream operations may return their receiver rather than a new stream object, it may not be possible to detect reuse in all cases.
```

一个流调用中间操作或者终止操作只能被操作一次，这并不是绝对的，比如”派生“的流，相同的元会提供两个或多个流管道，或者对相同的元执行多次的遍历，如果检测到流被重用了，就会抛出IllegalStateException，然而有些流操作可能会返回他们的接收者而并不是一个新的Stream对象，这种情况下是无法检测到被重用的。

```txt
Streams have a close() method and implement AutoCloseable, but nearly all stream instances do not actually need to be closed after use. Generally, only streams whose source is an IO channel (such as those returned by Files.lines(Path, Charset)) will require closing. Most streams are backed by collections, arrays, or generating functions, which require no special resource management. (If a stream does require closing, it can be declared as a resource in a try-with-resources statement.)
```

流都实现了AutoCloseable接口，因此都会自动的调用close方法，但是几乎所有的流实例在使用完成之后都不需要关闭，只有当流的元是一个IO通道的时候（比如从Files.lines返回对象）需要被关闭，大多数流的元都是集合、数组、或者生成器函数，他们并不需要特殊的资源管理（如果一个流确实需要关闭，它会使用try-with-resources声明成一个资源）。

```txt
Stream pipelines may execute either sequentially or in parallel. This execution mode is a property of the stream. Streams are created with an initial choice of sequential or parallel execution. (For example, Collection.stream() creates a sequential stream, and Collection.parallelStream() creates a parallel one.) This choice of execution mode may be modified by the sequential() or parallel() methods, and may be queried with the isParallel() method.
```

流管道可以通过并行或者是串行的方式来去执行，这种执行方式只是流里面的一个属性而已，流初始被创建的时候就会选择串行还是并行的（比如Collection.stream() 创建的就是串行流，Collection.parallelStream()创建的就是并行流），这种执行模式的选择，还可以通过sequential()或者parallel() 方法进行修改，并且还可以通过isParallel() 方法来查询流的类型。

以上就是关于Stream这个类的内容，Stream本身又继承了BaseStream类，BaseStream定义了所有流、流的操作、流管道以及并行流的行为和种类，我们首先来看一下BaseStream类的定义：

```java
public interface BaseStream<T, S extends BaseStream<T, S>>
        extends AutoCloseable {
    // 返回针对于流中元素的迭代器
    Iterator<T> iterator();
	// 这是流的终止操作，返回流中元素的分割迭代器
    Spliterator<T> spliterator();
	// 判断流是否是并行流，只能在流的终止操作之前进行调用
    boolean isParallel();
	// 返回一个等价的串行流，有可能会返回流本身，也有可能会将底层的流修改为串行流，这是一个中间操作
    S sequential();
	// 返回一个等价的并行流，有可能返回流本身，也有可能将底层的流修改为并行流，这是一个中间操作
    S parallel();
    // 返回一个无序的流，有可能返回流本身，原因是流本身就是无序的，这是一个中间操作
    S unordered();
	// 返回一个额外带有关闭处理器的流，当流的close方法被调用的时候，就会按照被添加进去的顺序得到调用，所有的关闭处理器都会得到调用而无论它之前的关闭处理器是否抛出了异常，如果任意的关闭处理器抛出了异常，那么抛出的第一个异常就会被抛给close方法的调用者，其余的异常就会作为被压制的异常（除非其余的异常是与第一个异常相同的异常，因为一个异常不能压制它本身），同样的，他也有可能返回自己
    S onClose(Runnable closeHandler);
	// 关闭这个流，所有的流管道处理器都会得到调用
    @Override
    void close();
}
```

这里的泛型T代表流中元素的类型，S指的是实现了BaseStream类型的流对象，实际上指的就是中间操作返回的新的流对象，回到Stream类的定义：

```java
public interface Stream<T> extends BaseStream<T, Stream<T>> 
```

对照BaseStream的定义不难发现，这里的泛型S指的就是`Stream<T>`,而`Stream<T>`又正好继承了BaseStream，所以这个泛型是成立的。

关于关闭处理器可以举一个简单的例子：

```java
public class StreamTest2 {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");
        // 使用这种方式是为了执行Stream的close方法
        try (Stream<String> stream = list.stream()) {
            stream.onClose(() -> {
                System.out.println("aaa");
            }).onClose(() -> {
                System.out.println("bbb");
            }).forEach(System.out::println);
        }
    }
}
```

控制台输出：

```txt
hello
world
hello world
aaa
bbb
```

修改一下程序，观察有异常发生的情况：

```java
   try (Stream<String> stream = list.stream()) {
            stream.onClose(() -> {
                System.out.println("aaa");
                throw new NullPointerException("first exception");
            }).onClose(() -> {
                System.out.println("bbb");
            }).forEach(System.out::println);
        }
```

就会输出：

```txt
Exception in thread "main" hello
world
hello world
aaa
bbb
java.lang.NullPointerException: first exception
	at Stream2.StreamTest2.lambda$main$0(StreamTest2.java:18)
	at java.util.stream.Streams$1.run(Streams.java:850)
	at java.util.stream.AbstractPipeline.close(AbstractPipeline.java:323)
	at Stream2.StreamTest2.main(StreamTest2.java:22)

FAILURE: Build failed with an exception.
```

可以看到虽然抛出了异常，但是后面的关闭处理器依然得到了执行。

```txt
hello
Exception in thread "main" world
hello world
aaa
bbb
java.lang.NullPointerException: first exception
	at Stream2.StreamTest2.lambda$main$0(StreamTest2.java:18)
	at java.util.stream.Streams$1.run(Streams.java:850)
	at java.util.stream.AbstractPipeline.close(AbstractPipeline.java:323)
	at Stream2.StreamTest2.main(StreamTest2.java:23)
	Suppressed: java.lang.NullPointerException: second exception
		at Stream2.StreamTest2.lambda$main$1(StreamTest2.java:21)
		at java.util.stream.Streams$1.run(Streams.java:854)
		... 2 more
```

这里的Suppressed就是压制的异常信息，可以看到后续的异常都被压制了,针对于文档中提到相同的异常，就不会被压制，指的是：

```java
    NullPointerException nullPointerException = new NullPointerException("exception");    
	try (Stream<String> stream = list.stream()) {
            stream.onClose(() -> {
                System.out.println("aaa");
                throw nullPointerException;
            }).onClose(() -> {
                System.out.println("bbb");
                throw nullPointerException;
            }).forEach(System.out::println);
        }
```

控制台输出：

```txt
hello
Exception in thread "main" world
hello world
aaa
bbb
java.lang.NullPointerException: exception
	at Stream2.StreamTest2.main(StreamTest2.java:15)

FAILURE: Build failed with an exception.
```

### Spliterator源码分析

Spliterator被称之为分割迭代器，是整个流实现非常重要的一环，从本节开始，就正式进入的流源码的分析。

首先还是定义一个非常简单的例子：

```java
public class StreamTest3 {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("hello", "world", "hello world");
        list.stream().forEach(System.out::println);
    }
}
```

这里调用的Collection接口中的stream方法：

```java
default Stream<E> stream() {
        return StreamSupport.stream(spliterator(), false);
    }
```

我们来阅读一下方法的说明：

```txt
Returns a sequential Stream with this collection as its source.
This method should be overridden when the spliterator() method cannot return a spliterator that is IMMUTABLE, CONCURRENT, or late-binding. (See spliterator() for details.)
```

stream方法会调用的将集合作为流的元，并且返回一个串行流，当spliterator方法无法返回IMMUTABLE（不可变的）、CONCURRENT（并行的）、late-binding（延迟绑定的）的分割迭代器，那么这个方法应该当被重写。

stream方法的参数也是定义在Collection集合中的默认方法：

```java
    default Spliterator<E> spliterator() {
        return Spliterators.spliterator(this, 0);
    }
```

我们来看一下这个方法的说明：

```txt
Creates a Spliterator over the elements in this collection. Implementations should document characteristic values reported by the spliterator. Such characteristic values are not required to be reported if the spliterator reports Spliterator.SIZED and this collection contains no elements.
The default implementation should be overridden by subclasses that can return a more efficient spliterator. In order to preserve expected laziness behavior for the stream() and parallelStream()} methods, spliterators should either have the characteristic of IMMUTABLE or CONCURRENT, or be late-binding. If none of these is practical, the overriding class should describe the spliterator's documented policy of binding and structural interference, and should override the stream() and parallelStream() methods to create streams using a Supplier of the spliterator, as in:
```

创建一个针对于这个集合的元素分割迭代器，实现应该对于spliterator方法所返回的Spliterator特性值进行文档化（记录下来），这些特性值并不要求去报告，如果这个Spliterator报告了Spliterator.SIZED，并且这个集合不包含任何元素，默认的实现应该要被子类所重写，目的是为了返回一个效率更高的分割迭代器，为了保留stream、parallelStream两个方法的延迟特性，spliterators的特性值要么是IMMUTABLE或者CONCURRENT，要么就是late-binding，如果上面这些都无法实现，重写的类需要文档化spliterator的绑定策略，并且使用spliterator的Supplier重写stream和parallelStream方法，例如：

```java
  Stream<E> s = StreamSupport.stream(() -> spliterator(), spliteratorCharacteristics)
```

应该使用这种方式来定义。

```txt
These requirements ensure that streams produced by the stream() and parallelStream() methods will reflect the contents of the collection as of initiation of the terminal stream operation.
```

这些要求确保了由stream和parallelStream方法生成的流从终止流操作开始发起的时候就反应出流的内容。

```txt
The default implementation creates a late-binding spliterator from the collections's Iterator. The spliterator inherits the fail-fast properties of the collection's iterator.
The created Spliterator reports Spliterator.SIZED.
```

默认的实现会从集合的迭代器创建一个延迟绑定的分割迭代器，创建出来的分割迭代器继承了集合迭代器的快速失败（如果碰到问题，程序不再往下执行，直接抛出异常）的属性，创建出来的分割迭代器具有 Spliterator.SIZED（固定大小）的特性。

```txt
The created Spliterator additionally reports Spliterator.SUBSIZED.
```

所创建出来的Spliterator还有一个额外的特性：Spliterator.SUBSIZED（所分割出来的每个块的大小是固定的）。

```txt
If a spliterator covers no elements then the reporting of additional characteristic values, beyond that of SIZED and SUBSIZED, does not aid clients to control, specialize or simplify computation. However, this does enable shared use of an immutable and empty spliterator instance (see Spliterators.emptySpliterator()) for empty collections, and enables clients to determine if such a spliterator covers no elements.
```

 如果分割迭代器中没有任何元素，那么除了IZED和SUBSIZED其他的特性值并不会简化客户端的计算，但是可以重用一个空的、不可变的分割迭代器，是不是里面没有元素，并且对于空的集合，可以帮助客户端来判断spliterator里面是不是没有元素。

Spliterator和Spliterators的关系就好像Collector和Collectors的关系一样，Spliterators针对于Spliterator提供了若干的静态方法，接下来就正式开始了解有关Spliterator的内容。

```txt
An object for traversing and partitioning elements of a source. The source of elements covered by a Spliterator could be, for example, an array, a Collection, an IO channel, or a generator function.
```

Spliterator是一个对于元中的元素进行遍历和分区的对象，Spliterator 元中的元素可以是数组，可以是集合，可以是IO通道，也可以是一个生成器函数。

```txt
A Spliterator may traverse elements individually (tryAdvance()) or sequentially in bulk (forEachRemaining()).
```

一个Spliterator可以使用tryAdvance单个的遍历元素，也可以使用forEachRemaining成块的遍历元素。

```txt
A Spliterator may also partition off some of its elements (using trySplit) as another Spliterator, to be used in possibly-parallel operations. Operations using a Spliterator that cannot split, or does so in a highly imbalanced or inefficient manner, are unlikely to benefit from parallelism. Traversal and splitting exhaust elements; each Spliterator is useful for only a single bulk computation.
```

一个Spliterator也可以对它的元素使用trySplit进行分区，形成另外的Spliterator，并且可以被并行的使用。如果使用Spliterator不能进行分割，或者分割的不平衡或者效率非常低的方式，那使用并行就并没有带来多少的好处。遍历和分割都会消耗元素，每一个Spliterator仅仅是对一个单块的计算是有用的（每一块元素都有自己的分割迭代器）。

```txt
A Spliterator also reports a set of characteristics() of its structure, source, and elements from among ORDERED, DISTINCT, SORTED, SIZED, NONNULL, IMMUTABLE, CONCURRENT, and SUBSIZED. These may be employed by Spliterator clients to control, specialize or simplify computation. For example, a Spliterator for a Collection would report SIZED, a Spliterator for a Set would report DISTINCT, and a Spliterator for a SortedSet would also report SORTED. Characteristics are reported as a simple unioned bit set. Some characteristics additionally constrain method behavior; for example if ORDERED, traversal methods must conform to their documented ordering. New characteristics may be defined in the future, so implementors should not assign meanings to unlisted values.
```

Spliterator还会报告它的结构、元、元素的特性值ORDERED（有序的）、DISTINCT（不同的）、SORTED（排序的）、SIZED（确定大小的）、NONNULL（不为空的）、IMMUTABLE（不可变的）、CONCURRENT（并放大的）、SUBSIZED（子部分固定大小的），这些可以被Spliterator的客户端使用，使用他们来简化一些计算，比如说，如果元是Collection集合，那么它就会报告SIZED的特性值，如果元是Set集合，那么就会报告DISTINCT，如果元是SortedSet集合，那么就会报告SORTED，Characteristics会作为一个位操作来标识的，有一些特性值会额外限制方法的行为，比如ORDERED，那么遍历的时候就必须遵循遍历时候的顺序，未来可能会定义一些新的characteristics，所以不要使用这些特性值之外的值，可能会引起冲突。

```txt
A Spliterator that does not report IMMUTABLE or CONCURRENT is expected to have a documented policy concerning: when the spliterator binds to the element source; and detection of structural interference of the element source detected after binding. A late-binding Spliterator binds to the source of elements at the point of first traversal, first split, or first query for estimated size, rather than at the time the Spliterator is created. A Spliterator that is not late-binding binds to the source of elements at the point of construction or first invocation of any method. Modifications made to the source prior to binding are reflected when the Spliterator is traversed. After binding a Spliterator should, on a best-effort basis, throw ConcurrentModificationException if structural interference is detected. Spliterators that do this are called fail-fast. The bulk traversal method (forEachRemaining()) of a Spliterator may optimize traversal and check for structural interference after all elements have been traversed, rather than checking per-element and failing immediately.
```

当分割迭代器绑定到元上元素的时候，如果Spliterator没有报告IMMUTABLE或者CONCURRENT，期望可以文档化。并且在绑定之后，要对元素的结构上一些修改进行相应检测，延迟绑定的Spliterator会在元素第一次分割、遍历的，或者笫一次查询元素大小的时候绑定。而不是在Spliterator创建的时候绑定的，如果不是延迟绑定的Spliterator，就会在元创建的时候或者说第一次调用方法时候进行绑定。如果在绑定元之前对元进行了修改的话，这种修改就会在分割迭代器遍历的时候反映出来，如果绑定之后对元进行了修改，就会抛出ConcurrentModificationException的异常，按照这种方式我们称之为"快速失败"，块的遍历方法（例如forEachRemaining）会优化遍历并检测结构上的修改，在所有的元素都遍历之后，而不是对每个元素一次检测。

```txt
Spliterators can provide an estimate of the number of remaining elements via the estimateSize method. Ideally, as reflected in characteristic SIZED, this value corresponds exactly to the number of elements that would be encountered in a successful traversal. However, even when not exactly known, an estimated value may still be useful to operations being performed on the source, such as helping to determine whether it is preferable to split further or traverse the remaining elements sequentially.
```

Spliterators通过estimateSize方法来估算剩余元素的个数，理想情况下，通过特性值SIZED获取到的值就是之后遍历元素个数的值，不过，即便不是精确的知道待遍历元素的数量，一个估算的值，对于元的操作也是很有用的，比如可以帮助对元进行进一步的分割或者对于剩余的元素进行串行的遍历。

```txt
Despite their obvious utility in parallel algorithms, spliterators are not expected to be thread-safe; instead, implementations of parallel algorithms using spliterators should ensure that the spliterator is only used by one thread at a time. This is generally easy to attain via serial thread-confinement, which often is a natural consequence of typical parallel algorithms that work by recursive decomposition. A thread calling trySplit() may hand over the returned Spliterator to another thread, which in turn may traverse or further split that Spliterator. The behaviour of splitting and traversal is undefined if two or more threads operate concurrently on the same spliterator. If the original thread hands a spliterator off to another thread for processing, it is best if that handoff occurs before any elements are consumed with tryAdvance(), as certain guarantees (such as the accuracy of estimateSize() for SIZED spliterators) are only valid before traversal has begun.
```

尽管他们显著的功能在算法当中，分割迭代器并不被要求是线程安全的，相反，使用了spliterators并行算法的实现，应该确保了分割迭代器在某个时候一次只有一个线程使用，这可以使用serial thread-confinement这种模式来实现。这是一个通过递归解耦得到的自然的结果。一个调用了trySplit的一个线程，它可以将返回的Spliterator交由另一个线程接管，另一个线程可能会进一步的分割，分割以及遍历的行为是不确定的，如果两个或者多个线程操作同一个Spliterator，如果原来的线程将Spliterator交由另外一个线程处理的话，那么最好这种传递是发生在任何元素在使用tryAdvance方法消费之前完成，因为某些保证实在执行之前才是有效的（比如统计元素个数的estimateSize方法，SIZED特性值）。

```txt
Primitive subtype specializations of Spliterator are provided for int, long, and double values. The subtype default implementations of tryAdvance(Consumer) and forEachRemaining(Consumer) box primitive values to instances of their corresponding wrapper class. Such boxing may undermine any performance advantages gained by using the primitive specializations. To avoid boxing, the corresponding primitive-based methods should be used. For example, Spliterator.OfInt.tryAdvance(IntConsumer) and Spliterator.OfInt.forEachRemaining(IntConsumer) should be used in preference to Spliterator.OfInt.tryAdvance(Consumer) and Spliterator.OfInt.forEachRemaining(Consumer). Traversal of primitive values using boxing-based methods tryAdvance() and forEachRemaining() does not affect the order in which the values, transformed to boxed values, are encountered.
```

原生的子类型的特化也提供了。比如int、long、double，普通的方法接收的参数tryAdvance(Consumer) and forEachRemaining(Consumer)，这些参数就会使用包装类型，这样就有可能影响了性能上的优势，为了避免装箱拆箱操作带来的性能消耗，就应该使用Spliterator.OfInt.tryAdvance(IntConsumer) 和Spliterator.OfInt.forEachRemaining(IntConsumer) ，如果可以使用特化版本就不要使用通用版本。无论使用哪种方式，元素的顺序与之前的保持一致。

```txt
Spliterators, like Iterators, are for traversing the elements of a source. The Spliterator API was designed to support efficient parallel traversal in addition to sequential traversal, by supporting decomposition as well as single-element iteration. In addition, the protocol for accessing elements via a Spliterator is designed to impose smaller per-element overhead than Iterator, and to avoid the inherent race involved in having separate methods for hasNext() and next().
```

Spliterators就像Iterators一样，也是用来遍历元当中的元素的，Spliterator的API设计为串行和高效的并行方式来进行元素的遍历，通过支持解耦、分解、单元素的遍历迭代，此外，相对于Iterator，使用Spliterator来遍历元素的成本是更低的，因为避免了在使用hasNext和next方法的竞争的出现（使用Iterators遍历元素通常需要两者搭配使用，但Spliterator只需要通过一个方法tryAdvance）。

```txt
For mutable sources, arbitrary and non-deterministic behavior may occur if the source is structurally interfered with (elements added, replaced, or removed) between the time that the Spliterator binds to its data source and the end of traversal. For example, such interference will produce arbitrary, non-deterministic results when using the java.util.stream framework.
```

对于可变的元来说，如果元在绑定了Spliterator之后，遍历结束之前在结构上被修改了（元素的添加、替换、移除）就可能出现一些不确定的行为，比如说，在使用java.util.stream 框架的这种修改可能出现这些不确定的结果。

```txt
Structural interference of a source can be managed in the following ways (in approximate order of decreasing desirability):
```

一个元在结构上的改变是可以通过如下的几种方式来进行管理的：

```txt
The source cannot be structurally interfered with. For example, an instance of java.util.concurrent.CopyOnWriteArrayList is an immutable source. A Spliterator created from the source reports a characteristic of IMMUTABLE.
```

1、元的结构是不能被修改的，例如，java.util.concurrent.CopyOnWriteArrayLis就是一个不可变的元，通过这种元创建的Spliterator会返回一个IMMUTABLE的特性值。

```txt
The source manages concurrent modifications. For example, a key set of a java.util.concurrent.ConcurrentHashMap is a concurrent source. A Spliterator created from the source reports a characteristic of CONCURRENT.
```

2、元本身管理并发修改，例如java.util.concurrent.ConcurrentHashMap键的集合就是一个并发的元，通过这种元创建的Spliterator会返回一个CONCURRENT的特性值。

```txt
The mutable source provides a late-binding and fail-fast Spliterator. Late binding narrows the window during which interference can affect the calculation; fail-fast detects, on a best-effort basis, that structural interference has occurred after traversal has commenced and throws ConcurrentModificationException. For example, ArrayList, and many other non-concurrent Collection classes in the JDK, provide a late-binding, fail-fast spliterator.
```

3、可变的元提供了一种延迟绑定和快速失败的Spliterator，延迟绑定会限制修改影响计算的时间间隔，可变的元

```txt
The mutable source provides a non-late-binding but fail-fast Spliterator. The source increases the likelihood of throwing ConcurrentModificationException since the window of potential interference is larger.
```

4、可变的元提供了非延迟绑定但是快速失败的Spliterator，发生ConcurrentModificationException可能性就会增加，因为时间间隔增大了。

```txt
The mutable source provides a late-binding and non-fail-fast Spliterator. The source risks arbitrary, non-deterministic behavior after traversal has commenced since interference is not detected.
```

5、可变的元提供了延迟绑定但是非快速失败的Spliterator，这个时候元就有一些风险，在遍历已经开始之后就可能发生一些不确定的行为。

```txt
The mutable source provides a non-late-binding and non-fail-fast Spliterator. The source increases the risk of arbitrary, non-deterministic behavior since non-detected interference may occur after construction.
```

6、可变的元提供了延迟绑定并且快速失败的Spliterator，也会增加不确定的风险，在构造之后增加不确定的行为的可能。

```txt
Example. Here is a class (not a very useful one, except for illustration) that maintains an array in which the actual data are held in even locations, and unrelated tag data are held in odd locations. Its Spliterator ignores the tags.
```

这里给出了一个例子（并不具有实用性，只是为了说明问题），数据实际上是存储在数组的偶数位置上，不相关的标签数据是存放在基数的位置上的，它对应的Spliterator会忽略掉标签，即只关心偶书位置上的数据：

```java
 class TaggedArray<T> {
   // 构造之后就是一个不可变的数组
   private final Object[] elements;
   TaggedArray(T[] data, Object[] tags) {
     int size = data.length;
     // 数据和标签的个数应该相同
     if (tags.length != size) throw new IllegalArgumentException();
     this.elements = new Object[2 * size];
     for (int i = 0, j = 0; i < size; ++i) {
       elements[j++] = data[i];
       elements[j++] = tags[i];
     }
   }

   public Spliterator<T> spliterator() {
     return new TaggedArraySpliterator<>(elements, 0, elements.length);
   }

   static class TaggedArraySpliterator<T> implements Spliterator<T> {
     private final Object[] array;
     // 当前的索引，在遍历的时候会自增
     private int origin;
     // 超过最大索引值加1
     private final int fence;

     TaggedArraySpliterator(Object[] array, int origin, int fence) {
       this.array = array; this.origin = origin; this.fence = fence;
     }

     public void forEachRemaining(Consumer<? super T> action) {
       for (; origin < fence; origin += 2)
         action.accept((T) array[origin]);
     }

     public boolean tryAdvance(Consumer<? super T> action) {
       if (origin < fence) {
         action.accept((T) array[origin]);
         // tag中的数据不需要
         origin += 2;
         return true;
       }
       else
         return false;
     }

     public Spliterator<T> trySplit() {
       // 分开一半的范围
       int lo = origin;
       // 取中点
       int mid = ((lo + fence) >>> 1) & ~1;
       // 分割左侧的
       if (lo < mid) {
         // 重新设置范围
         origin = mid;
         return new TaggedArraySpliterator<>(array, lo, mid);
       }
       else  // 太小了，无法分割
         return null;
     }

     public long estimateSize() {
       return (long)((fence - origin) / 2);
     }

     public int characteristics() {
       return ORDERED | SIZED | IMMUTABLE | SUBSIZED;
     }
   }
 }
```

上面的例子是一个串行的例子，接下来还提供了一个并行的例子。

```txt
As an example how a parallel computation framework, such as the java.util.stream package, would use Spliterator in a parallel computation, here is one way to implement an associated parallel forEach, that illustrates the primary usage idiom of splitting off subtasks until the estimated amount of work is small enough to perform sequentially. Here we assume that the order of processing across subtasks doesn't matter; different (forked) tasks may further split and process elements concurrently in undetermined order. This example uses a java.util.concurrent.CountedCompleter; similar usages apply to other parallel task constructions.
```

如何使用并行框架来尽心给计算，例如使用java.util.stream package，在并行情况下使用Spliterator，它描述了对于分割子任务的分割方法，如何将子任务进行分割，如果分割的足够小的话，再以串行的方式去执行，下面的例子使用了java.util.concurrent.CountedCompleter：

```java
static <T> void parEach(TaggedArray<T> a, Consumer<T> action) {
   Spliterator<T> s = a.spliterator();
   long targetBatchSize = s.estimateSize() / (ForkJoinPool.getCommonPoolParallelism() * 8);
   new ParEach(null, s, action, targetBatchSize).invoke();
 }

 static class ParEach<T> extends CountedCompleter<Void> {
   final Spliterator<T> spliterator;
   final Consumer<T> action;
   final long targetBatchSize;

   ParEach(ParEach<T> parent, Spliterator<T> spliterator,
           Consumer<T> action, long targetBatchSize) {
     super(parent);
     this.spliterator = spliterator; this.action = action;
     this.targetBatchSize = targetBatchSize;
   }

   public void compute() {
     Spliterator<T> sub;
     while (spliterator.estimateSize() > targetBatchSize &&
            (sub = spliterator.trySplit()) != null) {
       addToPendingCount(1);
       new ParEach<>(this, sub, action, targetBatchSize).fork();
     }
     spliterator.forEachRemaining(action);
     propagateCompletion();
   }
 }
```

```txt
If the boolean system property org.openjdk.java.util.stream.tripwire is set to true then diagnostic warnings are reported if boxing of primitive values occur when operating on primitive subtype specializations.
```

如果系统变量org.openjdk.java.util.stream.tripwire被设置成true的话，如果在操作原生子类型特化的时候，对原生的子类型进行装箱操作，系统就会给出警告。

以上是关于Spliterator这个类本身的说明，接下来Spliterator接口本身提供的一些方法进行说明：

首先是tryAdvance方法：

```java
boolean tryAdvance(Consumer<? super T> action);
```

方法的说明：

```txt
If a remaining element exists, performs the given action on it, returning true; else returns false. If this Spliterator is ORDERED the action is performed on the next element in encounter order. Exceptions thrown by the action are relayed to the caller.
```

如果元素存在，就会对元素执行给定的action方法，同时true，否则返回false，如果这个Spliterator是ORDERED，就会对的下一个元素去执行action方法，由这个动作执行产生的任何的异常都会传递给调用者。

接下来是forEachRemaining方法：

```java
    default void forEachRemaining(Consumer<? super T> action) {
        do { } while (tryAdvance(action));
    }
```

方法的说明：

```txt
Performs the given action for each remaining element, sequentially in the current thread, until all elements have been processed or the action throws an exception. If this Spliterator is ORDERED, actions are performed in encounter order. Exceptions thrown by the action are relayed to the caller.The default implementation repeatedly invokes tryAdvance until it returns false. It should be overridden whenever possible.
```

对剩下的元素都执行action方法，在当前的线程是以串行的方式执行，知道所有的元素都已经被处理了，或者动作本身抛出了异常，如果Spliterator是ORDERED，action会以遇到元素的顺序去执行，由这个动作抛出的异常会被传递给调用者。默认的实现是不断的调用tryAdvance方法直到返回false，在合适的时候应该被重写。 

接下来是trySplit方法：

```java
 Spliterator<T> trySplit();
```

方法的说明：

```txt
If this spliterator can be partitioned, returns a Spliterator covering elements, that will, upon return from this method, not be covered by this Spliterator.
If this Spliterator is ORDERED, the returned Spliterator must cover a strict prefix of the elements.
Unless this Spliterator covers an infinite number of elements, repeated calls to trySplit() must eventually return null. Upon non-null return:
```

如果这个Spliterator是可以被分割的，就会返回一个新的Spliterator对象，新的Spliterator可能可以进一步分割，剩余的元素是由当前的Spliterator继续涵盖的。

如果这个Spliterator是ORDERED，所返回的Spliterator必须也是ORDERED，除了Spliterator涵盖的是一个无限元素的对象的情况，重复调用trySplit最终得到的结果一定是空，当不为空的情况出现的时候：

```txt
the value reported for estimateSize() before splitting, must, after splitting, be greater than or equal to estimateSize() for this and the returned Spliterator; and
```

1、在分割之前estimateSize方法所估算的元的大小的值，必须在分割之后，一定要大于或者等于当前的和返回的新的Spliterator的estimateSize方法所返回的值。

```txt
if this Spliterator is SUBSIZED, then estimateSize() for this spliterator before splitting must be equal to the sum of estimateSize() for this and the returned Spliterator after splitting.
```

2、如果Spliterator是SUBSIZED，那么在分割之前Spliterator的estimateSize的值必须等于分割之后所剩下的estimateSize以及剩下的Spliteratord的estimateSize加起来必须相等。

```txt
This method may return null for any reason, including emptiness, inability to split after traversal has commenced, data structure constraints, and efficiency considerations.
```

这个方法有可能会返回一个空值，包括原来的就是Spliterator就是空的，在遍历开始之后无法分割，数据结构上的限制，效率上的考量等等。

```txt
n ideal trySplit method efficiently (without traversal) divides its elements exactly in half, allowing balanced parallel computation. Many departures from this ideal remain highly effective; for example, only approximately splitting an approximately balanced tree, or for a tree in which leaf nodes may contain either one or two elements, failing to further split these nodes. However, large deviations in balance and/or overly inefficient trySplit mechanics typically result in poor parallel performance.
```

一种理想的trySplit方法在没有进行遍历的情况下，它会恰好就元素分成等量的两部分，这样并行计算的时候工作量是比较平均的。但更多的时候无法达到理想状态，比如说，只是分割一个近似平衡的树，或者对一个树，树中的叶子节点包含了一两个元素，没法再对这些节点进行进一步的分割，对于这种极度不平衡的树，没有效率的trySplit会是的并发执行的效率急剧下降。

接下来是estimateSize方法：

```java
long estimateSize();
```

方法的说明：

```txt
Returns an estimate of the number of elements that would be encountered by a forEachRemaining traversal, or returns Long.MAX_VALUE if infinite, unknown, or too expensive to compute.
```

返回对于遍历可能会遇到的元中的元素的数量的估算值，如果元的元素是无限的、未知的、或者计算成本非常昂贵的时候，就会返回Long.MAX_VALUE。

```txt
If this Spliterator is SIZED and has not yet been partially traversed or split, or this Spliterator is SUBSIZED and has not yet been partially traversed, this estimate must be an accurate count of elements that would be encountered by a complete traversal. Otherwise, this estimate may be arbitrarily inaccurate, but must decrease as specified across invocations of trySplit.
```

如果这个Spliterator是SIZED，并且还没有被分割或者迭代，或者Spliterator是SUBSIZED的，但还没有被部分遍历，那么estimate返回的就一定是一个精确的值，就是要被遍历的元素的个数，否则，estimate估算就可能是不精确的，但是必须要随着trySplit方法的调用次数不断减少。

```txt
Even an inexact estimate is often useful and inexpensive to compute. For example, a sub-spliterator of an approximately balanced binary tree may return a value that estimates the number of elements to be half of that of its parent; if the root Spliterator does not maintain an accurate count, it could estimate size to be the power of two corresponding to its maximum depth.
```

estimate方法估算的值通常而言也是有用的，并且计算起来成本也不高，对一个近似平衡的二叉树的sub-spliterator，它会估算父亲节点的元素的一般，如果根Spliterator没有保存正确的计算结果，那么他就会根据树的深度返回2的指数次方，以此来估算元中元素的个数。

接下来是getExactSizeIfKnown方法：

```java
  default long getExactSizeIfKnown() {
        return (characteristics() & SIZED) == 0 ? -1L : estimateSize();
    }
```

方法的说明：

```txt
Convenience method that returns estimateSize() if this Spliterator is SIZED, else -1.
```

如果Spliterator是SIZED就会返回estimateSize的值，否则返回-1。

接下来是characteristics方法：

```java
int characteristics();
```

方法的说明：

```txt
Returns a set of characteristics of this Spliterator and its elements. The result is represented as ORed values from ORDERED, DISTINCT, SORTED, SIZED, NONNULL, IMMUTABLE, CONCURRENT, SUBSIZED. Repeated calls to characteristics() on a given spliterator, prior to or in-between calls to trySplit, should always return the same result.
```

返回Spliterator和它的元素特性值的集合，这种结果用ORed值来表示的，共有八个，在trySplit调用之前和调用当中重复地调用这个方法，永远都会返回相同的结果。

```txt
If a Spliterator reports an inconsistent set of characteristics (either those returned from a single invocation or across multiple invocations), no guarantees can be made about any computation using this Spliterator.
```

如果返回了不同的特性值的集合（分割之前和分割之后有可能特性值会不同），那么对于Spliterator的任何计算都是不受保障。

接下来是hasCharacteristics方法：

```java
  default boolean hasCharacteristics(int characteristics) {
        return (characteristics() & characteristics) == characteristics;
    }
```

方法的说明：

```txt
Returns true if this Spliterator's characteristics contain all of the given characteristics.
```

判断当前的Spliterator是否包含传入的characteristics特性值。

接下来是getComparator方法：

```java
    default Comparator<? super T> getComparator() {
        throw new IllegalStateException();
    }
```

方法的说明：

```txt
If this Spliterator's source is SORTED by a Comparator, returns that Comparator. If the source is SORTED in natural order, returns null. Otherwise, if the source is not SORTED, throws IllegalStateException.
```

如果这个Spliterator的元通过Comparator是SORTED，那么返回用于排序的比较器，如果元在自然序列下是SORTED，返回null，如果元不是有序的，抛出IllegalStateException异常。

接下来是八个特性值：

```java
  public static final int ORDERED    = 0x00000010;
  public static final int DISTINCT   = 0x00000001;
  public static final int SORTED     = 0x00000004;
  public static final int SIZED      = 0x00000040;
  public static final int NONNULL    = 0x00000100;
  public static final int IMMUTABLE  = 0x00000400;
  // 不能同时返回SIZED和CONCURRENT，如果多个线程访问元，就有可能修改元的大小
  public static final int CONCURRENT = 0x00001000;
  public static final int SUBSIZED = 0x00004000;
```

除了以上非常核心的方法，Spliterator中还有两个接口OfPrimitive和OfInt。

```java
public interface OfPrimitive<T, T_CONS, T_SPLITR extends Spliterator.OfPrimitive<T, T_CONS, T_SPLITR>>
            extends Spliterator<T> {
        @Override
        T_SPLITR trySplit();

        @SuppressWarnings("overloads")
        boolean tryAdvance(T_CONS action);

        @SuppressWarnings("overloads")
        default void forEachRemaining(T_CONS action) {
            do { } while (tryAdvance(action));
        }
    }
```

相关说明：

```txt
A Spliterator specialized for primitive values.
<T> – the type of elements returned by this Spliterator. The type must be a wrapper type for a primitive type, such as Integer for the primitive int type.
<T_CONS> – the type of primitive consumer. The type must be a primitive specialization of Consumer for T, such as IntConsumer for Integer.
<T_SPLITR> – the type of primitive Spliterator. The type must be a primitive specialization of Spliterator for T, such as Spliterator.OfInt for Integer.
```

这是一个针对原生值设定的Spliterator，T表示由当前的Spliterator所返回的元素的类型，类型必须要是原生类型的包装类型，比如int类型的包装类型Integer。T_CONS是原生的consumer特化的类型，这个类型必须是java.util.function.Consumer原生类型的特化，比如对于Integer的IntConsumer，T_SPLITR是原生的Spliterator分割迭代器的类型，必须是对于T类型的原生类型的特化，比如对于Integer的OfInt。

```java
	public interface OfInt extends OfPrimitive<Integer, IntConsumer, OfInt> {

        @Override
        OfInt trySplit();
		// 重写的OfPrimitive中的tryAdvance方法
        @Override
        boolean tryAdvance(IntConsumer action);

        @Override
        default void forEachRemaining(IntConsumer action) {
            do { } while (tryAdvance(action));
        }

        // 重写的Spliterator中的tryAdvance方法
        @Override
        default boolean tryAdvance(Consumer<? super Integer> action) {
            if (action instanceof IntConsumer) {
                // IntConsumer和Consumer类型并没有直接继承的关系，这可以强转的原因是如果参数是Integer类型的，由于自动拆箱和自动装箱的原因存在，传递的action如果是Lambda表达式就既满足了Consumer的要求，也满足了IntConsumer的要求，另外是由于Lambda表达式中的类型判断是需要结合具体的上下文的。
                return tryAdvance((IntConsumer) action);
            }
            else {
                if (Tripwire.ENABLED)
                    Tripwire.trip(getClass(),
                                  "{0} calling Spliterator.OfInt.tryAdvance((IntConsumer) action::accept)");
                return tryAdvance((IntConsumer) action::accept);
            }
        }

        @Override
        default void forEachRemaining(Consumer<? super Integer> action) {
            if (action instanceof IntConsumer) {
                forEachRemaining((IntConsumer) action);
            }
            else {
                if (Tripwire.ENABLED)
                    Tripwire.trip(getClass(),
                                  "{0} calling Spliterator.OfInt.forEachRemaining((IntConsumer) action::accept)");
                forEachRemaining((IntConsumer) action::accept);
            }
        }
    }
```

相关说明：

```txt
A Spliterator specialized for int values.
```

针对于int值的分割迭代器。

这其中比较重要的是第二个tryAdvance方法，首先来看方法的说明

```txt
If the action is an instance of IntConsumer then it is cast to IntConsumer and passed to tryAdvance(IntConsumer); otherwise the action is adapted to an instance of IntConsumer, by boxing the argument of IntConsumer, and then passed to tryAdvance(IntConsumer).
```

如果action是IntConsumer的一个实例，那么就会被强转为IntConsumer并传递给tryAdvance(IntConsumer)，否则，action会被适配成IntConsumer实例，方式是通过IntConsumer的参数进行装箱操作，然后再传递给tryAdvance(IntConsumer)。

对于上面注释中提到的为什么可以强转，我们通过一个具体的例子来说明：

```java
public class ConsumerTest {
    public void test(Consumer<Integer> consumer) {
        consumer.accept(100);
    }

    public static void main(String[] args) {
        ConsumerTest consumerTest = new ConsumerTest();
        // 两个相同的Lambda表达式
        Consumer<Integer> consumer = i -> System.out.println(i);
        IntConsumer intConsumer = i -> System.out.println(i);
        // 面向对象的方式
        consumerTest.test(consumer);
        // 编译通过但执行报错
        consumerTest.test((Consumer<Integer>) intConsumer);
        // 传递行为，函数式的方式
        consumerTest.test(consumer::accept);
        consumerTest.test(intConsumer::accept);
    }
}
```

除了OfInt之外还有其他两种OfLong、OfDouble，原理和功能都是类似的。

### Pipeline源码分析

分割迭代器无疑是函数式编程中一个相当核心的概念，其地位与收集器相同，在了解了分割迭代器的相关内容之后，我们再回到一开始的例子当中，看看JDK是如何使用分割迭代器来构造流源的，还是回到最开始的入口这里：

```java
default Stream<E> stream() {
        return StreamSupport.stream(spliterator(), false);
    }
```

这里的spliterator方法是定义Collection接口当中的一个默认方法：

```java
 default Spliterator<E> spliterator() {
     	// 这里的this表示的是当前集合的引用，当前集合的引用就是在这个时候被传递进去的
        return Spliterators.spliterator(this, 0);
    }
```

Spliterators中静态方法spliterator返回了一个Spliterator实现：

```java
    public static <T> Spliterator<T> spliterator(Collection<? extends T> c,
                                                 int characteristics) {
        return new IteratorSpliterator<>(Objects.requireNonNull(c),
                                         characteristics);
    }
```

可以看到我们实际上使用的分割迭代器是IteratorSpliterator，IteratorSpliterator是实现了Spliterator接口的一个实现类，它本身持有了元数据集合的引用。

创建流元的过程是由StreamSupport这个类来完成的，以下是关于StreamSupport这个类的说明：

````txt
Low-level utility methods for creating and manipulating streams.
This class is mostly for library writers presenting stream views of data structures; most static stream methods intended for end users are in the various Stream classes.
````

提供了一些创建和操作流的底层方法。这个类是给类库的编写者提供的，用于呈现流的数据视图，为用户所设计的大多数的静态的流的方法大多都在stream类中提的方法。

StreamSupport中的stream方法：

```java
    public static <T> Stream<T> stream(Spliterator<T> spliterator, boolean parallel) {
        Objects.requireNonNull(spliterator);
        return new ReferencePipeline.Head<>(spliterator,
                                            StreamOpFlag.fromCharacteristics(spliterator),
                                            parallel);
    }
```

方法的说明：

```txt
Creates a new sequential or parallel Stream from a Spliterator.
The spliterator is only traversed, split, or queried for estimated size after the terminal operation of the stream pipeline commences.
It is strongly recommended the spliterator report a characteristic of IMMUTABLE or CONCURRENT, or be late-binding. Otherwise, stream(Supplier, int, boolean) should be used to reduce the scope of potential interference with the source. See Non-Interference for more details.
```

从一个分割迭代器对象创建一个串行或者并行的流，spliterator在流管道开启之后仅仅是完成遍历、分割、查询、大小的等功能，强烈建议spliterator返回IMMUTABLE、CONCURRENT或者late-binding这样一些特性，否则，stream应该用于减少潜在的干扰，查看Non-Interference获取更多信息。

这里引出了另外一个及其重要的类ReferencePipeline，用于描述中间的管道阶段和管道源阶段的的类，它与流的操作息息相关，Head是ReferencePipeline的一个静态内部类，描述的是管道的源阶段，二者在大部分属性的设定上都是类似的，但存在一些属性是不同的，比如说Head是没有previousStage的，而ReferencePipeline则是存在previousStage的，等等。接下来就需要重点了解管道流相关的内容。

首先是定义在ReferencePipeline类当中的内部类Head：

```java
    static class Head<E_IN, E_OUT> extends ReferencePipeline<E_IN, E_OUT> {
     
        Head(Supplier<? extends Spliterator<?>> source,
             int sourceFlags, boolean parallel) {
            super(source, sourceFlags, parallel);
        }
		// 这里Spliterator作为流的源
        Head(Spliterator<?> source,
             int sourceFlags, boolean parallel) {
            super(source, sourceFlags, parallel);
        }

        @Override
        final boolean opIsStateful() {
            throw new UnsupportedOperationException();
        }

        @Override
        final Sink<E_IN> opWrapSink(int flags, Sink<E_OUT> sink) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void forEach(Consumer<? super E_OUT> action) {
            if (!isParallel()) {
                sourceStageSpliterator().forEachRemaining(action);
            }
            else {
                super.forEach(action);
            }
        }

        @Override
        public void forEachOrdered(Consumer<? super E_OUT> action) {
            if (!isParallel()) {
                sourceStageSpliterator().forEachRemaining(action);
            }
            else {
                super.forEachOrdered(action);
            }
        }
    }
```

Head类本身有两个泛型：

```txt
<E_IN> – type of elements in the upstream source
<E_OUT> – type of elements in produced by this stage
```

E_IN表示上游流源的元素类型，E_OUT表示这个阶段生成的元素类型。

真正在创建的时候又是调用了ReferencePipeline的构造方法：

```java
   ReferencePipeline(Supplier<? extends Spliterator<?>> source,
                      int sourceFlags, boolean parallel) {
        super(source, sourceFlags, parallel);
    }
```

而ReferencePipeline的构造方法又调用了它的父类AbstractPipeline的构造方法：

```java
   AbstractPipeline(Supplier<? extends Spliterator<?>> source,
                     int sourceFlags, boolean parallel) {
        this.previousStage = null;
        this.sourceSupplier = source;
        this.sourceStage = this;
        this.sourceOrOpFlags = sourceFlags & StreamOpFlag.STREAM_MASK;
        // The following is an optimization of:
        // StreamOpFlag.combineOpFlags(sourceOrOpFlags, StreamOpFlag.INITIAL_OPS_VALUE);
        this.combinedFlags = (~(sourceOrOpFlags << 1)) & StreamOpFlag.INITIAL_OPS_VALUE;
        this.depth = 0;
        this.parallel = parallel;
    }
```

AbstractPipeline的说明如下：

```txt
Abstract base class for "pipeline" classes, which are the core implementations of the Stream interface and its primitive specializations. Manages construction and evaluation of stream pipelines.
```

AbstractPipeline是对于管道类抽象出来的一个父类，管道类指的是流接口以及其原生特化的核心的实现，它会管理流管道的构建以及计算。

```txt
An AbstractPipeline represents an initial portion of a stream pipeline, encapsulating a stream source and zero or more intermediate operations. The individual AbstractPipeline objects are often referred to as stages, where each stage describes either the stream source or an intermediate operation.
```

AbstractPipeline代表了流管道初始的阶段，它封装了一个流源和0个或者多个中间操作，每一个单个的AbstractPipeline通常称为stages（阶段），这个阶段要么描述的是流的源，要么描述的是中间操作。

```txt
A concrete intermediate stage is generally built from an AbstractPipeline, a shape-specific pipeline class which extends it (e.g., IntPipeline) which is also abstract, and an operation-specific concrete class which extends that. AbstractPipeline contains most of the mechanics of evaluating the pipeline, and implements methods that will be used by the operation; the shape-specific classes add helper methods for dealing with collection of results into the appropriate shape-specific containers.
```

一个具体的中间阶段通常是通过AbstractPipeline构建出来的，特化的管道类（IntPipeline、LongPipeline）操作都是类似的，AbstractPipeline包含了大多数计算管道的机制，并且实现了操作的时候要使用的方法，与原生特定相关的类增加了用来处理结果集合添加到特定的特化的管道。

```txt
After chaining a new intermediate operation, or executing a terminal operation, the stream is considered to be consumed, and no more intermediate or terminal operations are permitted on this stream instance.
```

当链接一个新的中间操作，或者执行一个终止操作，流就会被认为被消费掉了，不会再有中间操作和终止操作添加到这个流实例上了。

```txt
For sequential streams, and parallel streams without stateful intermediate operations, parallel streams, pipeline evaluation is done in a single pass that "jams" all the operations together. For parallel streams with stateful operations, execution is divided into segments, where each stateful operations marks the end of a segment, and each segment is evaluated separately and the result used as the input to the next segment. In all cases, the source data is not consumed until a terminal operation begins.
```

对于串行流和中间操作都是无状态的并行流，管道的计算是在单个的过程中完成的（即不是通过链式调用，而是拿出一个元素执行所有的中间操作），对于有状态的并行流，管道的计算就会分成不同的段来执行，其中每一个有状态的都会标识一个段的结尾，每个段都会被单独的执行，而且每个段的执行结果会作为下一个段的输入（表示是有顺序的），直到一个终止操作开始的时候，源数据才会被消费。

 接下来是AbstractPipeline类中的一些属性：

```java
    private final AbstractPipeline previousStage;
```

属性的说明：

```txt
The "upstream" pipeline, or null if this is the source stage.
```

上游的pipline，如果是源阶段的话就是null。

```java
    private final AbstractPipeline sourceStage;
```

属性的说明：

```txt
Backlink to the head of the pipeline chain (self if this is the source stage).
```

表示管道反向链接的头（如果是源阶段就是它自身）。

```java
    private int depth;
```

属性的说明：

```txt
The number of intermediate operations between this pipeline object and the stream source if sequential, or the previous stateful if parallel. Valid at the point of pipeline preparation for evaluation.
```

当前的管道对象和流元的管道对象的中间操作的个数，在流准备进行计算的时候是有效的。

```java
    private boolean parallel;
```

属性的说明：

```txt
True if pipeline is parallel, otherwise the pipeline is sequential; only valid for the source stage.
```

如果是true表示并行，如果是false，表示串行，只有在流源这个阶段才有效。

```java
 private Spliterator<?> sourceSpliterator;
```

属性的说明：

```txt
The source spliterator. Only valid for the head pipeline. Before the pipeline is consumed if non-null then sourceSupplier must be null. After the pipeline is consumed if non-null then is set to null.
```

是针对于元的分割迭代器，只会head pipeline起作用，在管道被消费之前，如果sourceSpliterator是非空的话，那么sourceSupplier必须是null，管道被消费之后sourceSpliterator就要设置为空。

```java
    private Supplier<? extends Spliterator<?>> sourceSupplier;
```

属性的说明：

```txt
The source supplier. Only valid for the head pipeline. Before the pipeline is consumed if non-null then sourceSpliterator must be null. After the pipeline is consumed if non-null then is set to null.
```

supplier的元，只会head pipeline起作用，在管道被消费之前，如果sourceSupplier是空的，那么sourceSpliterator必须为空，在管道被消费之后，就要将sourceSupplier置为null。

可以看到这两个成员变量可以认为是互斥的，必须要保证其中一个不为空，在流消费之后都要置为空，表示流已经消费完成，至此为止，流源的对象也已经构造完成。

### 流调用机制与原理

回到一开始的例子当中：

```java
list.stream().forEach(System.out::println);
```

这里调用的第一个stream方法，使用分割迭代器来构造流源的这一步我们已经完成了，接下来我们来查看一下forEach方法的说明：

```txt
Performs an action for each element of this stream.
This is a terminal operation.
```

它表示要对于流中每个元素都执行action操作，并且这是一个终止操作。

```txt
The behavior of this operation is explicitly nondeterministic. For parallel stream pipelines, this operation does not guarantee to respect the encounter order of the stream, as doing so would sacrifice the benefit of parallelism. For any given element, the action may be performed at whatever time and in whatever thread the library chooses. If the action accesses shared state, it is responsible for providing the required synchronization.
```

这个操作的行为是不确定的，对于并行流管道来说，这个操作并不会保证它会遵循流当中元素的顺序，因为如果遵循的话，就会牺牲并行的优势，对于任意给定的元素，这个action可能会在任意的时间或者库所选择的任意线程中去执行，如果库访问了共享的状态，那么它就需要提供完整的同步机制。

```java
list.parallelStream().forEach(System.out::println);
```

这其实指的就是如果使用并行流，那么就无法再保证执行给定的Lambda表达式的元素的顺序了，这个方法实际上在ReferencePipeline中是有两个实现的，一个是在它的静态内部类Head中：

```java
        @Override
        public void forEach(Consumer<? super E_OUT> action) {
            // 对串行流进行优化
            if (!isParallel()) {
                sourceStageSpliterator().forEachRemaining(action);
            }
            else {
                // 如果是并行流，调用ReferencePipeline中的forEach方法
                super.forEach(action);
            }
        }
```

这个是针对于管道源的有过优化的实现，换句话说，如果被流的源调用的话，就是直接进入这个方法，另一个forEach方法是在ReferencePipeline当中：

```java
   @Override
    public void forEach(Consumer<? super P_OUT> action) {
        evaluate(ForEachOps.makeRef(action, false));
    }

```

当有中间操作的时候，都会进入这个方法，之所以会有这个差异，就是为了效率上的考量，如果有中间操作的话，就需要对于中间操作进行一般化的处理，如果没有的话，就可以直接对流源进行操作。

我们不妨来看一下优化的时候调用的sourceStageSpliterator方法，它是定义在AbstractPipeline当中的

```java
    final Spliterator<E_OUT> sourceStageSpliterator() {
        if (this != sourceStage)
            throw new IllegalStateException();
		// 被链接或者被消费，为了保证是在源阶段
        if (linkedOrConsumed)
            // MSG_STREAM_LINKED = "stream has already been operated upon or closed";
            throw new IllegalStateException(MSG_STREAM_LINKED);
        linkedOrConsumed = true;
		// 流源可能通过两种方式来构建，因此有两种情况，并且这两种情况是互斥的
        if (sourceStage.sourceSpliterator != null) {
            @SuppressWarnings("unchecked")
            Spliterator<E_OUT> s = sourceStage.sourceSpliterator;
            sourceStage.sourceSpliterator = null;
            return s;
        }
        else if (sourceStage.sourceSupplier != null) {
            @SuppressWarnings("unchecked")
            Spliterator<E_OUT> s = (Spliterator<E_OUT>) sourceStage.sourceSupplier.get();
            sourceStage.sourceSupplier = null;
            return s;
        }
        else {
            // MSG_CONSUMED = "source already consumed or closed";
            throw new IllegalStateException(MSG_CONSUMED);
        }
    }
```

方法的说明：

```txt
Gets the source stage spliterator if this pipeline stage is the source stage. The pipeline is consumed after this method is called and returns successfully.
```

如果管道的阶段是源阶段的话，就会返回源阶段的分割迭代器，这个管道在被调用之后，就会返回并且销毁。

我们知道一般情况下分割迭代器返回的是IteratorSpliterator实现，我们来看一下IteratorSpliterator中对于forEachRemaining的实现：

```java
        @Override
        public void forEachRemaining(Consumer<? super T> action) {
            if (action == null) throw new NullPointerException();
            Iterator<? extends T> i;
            // it是Spliterator中定义的迭代器
            if ((i = it) == null) {
                // 当前集合的迭代器
                i = it = collection.iterator();
                est = (long)collection.size();
            }
            i.forEachRemaining(action);
        }
```

这里将集合中的迭代器找出来并且估算元素的大小，然后再调用Iterator中的新增加的forEachRemaining方法：

```java
    default void forEachRemaining(Consumer<? super E> action) {
        Objects.requireNonNull(action);
        while (hasNext())
            action.accept(next());
    }
```

看到这里我们就明白了，对于简单的遍历，使用传统的Iterator遍历的效率是要比流的方式效率要高的，当然这是因为我们是没有任何的中间操作，如果有了一系列的中间操作，那么使用流的方式效率还是比传统的方式要高的。

 ```java
list.stream().map(item -> item).forEach(System.out::println);
 ```

在ReferencePipeline当中，map方法只有唯一的实现：

```java
    public final <R> Stream<R> map(Function<? super P_OUT, ? extends R> mapper) {
        Objects.requireNonNull(mapper);
        // 返回StatelessOp的匿名内部类对象，this表示ReferencePipeline，第二个参数表示流的类型是引用类型的，第三个是流的特性值
        return new StatelessOp<P_OUT, R>(this, StreamShape.REFERENCE,
                                     StreamOpFlag.NOT_SORTED | StreamOpFlag.NOT_DISTINCT) {
            @Override
            Sink<P_OUT> opWrapSink(int flags, Sink<R> sink) {
                return new Sink.ChainedReference<P_OUT, R>(sink) {
                    // 真正执行传入Lambda表达式的地方
                    @Override
                    public void accept(P_OUT u) {
                        downstream.accept(mapper.apply(u));
                    }
                };
            }
        };
    }
```

这里的StatelessOp也是定义在ReferencePipeline当中的一个静态内部类：

```java
 abstract static class StatelessOp<E_IN, E_OUT>
            extends ReferencePipeline<E_IN, E_OUT> {
     
        StatelessOp(AbstractPipeline<?, E_IN, ?> upstream,
                    StreamShape inputShape,
                    int opFlags) {
            super(upstream, opFlags);
            assert upstream.getOutputShape() == inputShape;
        }

        @Override
        final boolean opIsStateful() {
            return false;
        }
    }
```

相关说明：

```txt
Construct a new Stream by appending a stateless intermediate operation to an existing stream.
```

构造一个针对无状态的中间的阶段的流，这里的构造方法又调用了ReferencePipeline的构造方法：

```java
    ReferencePipeline(AbstractPipeline<?, P_IN, ?> upstream, int opFlags) {
        super(upstream, opFlags);
    }
```

方法的说明：

```txt
Constructor for appending an intermediate operation onto an existing pipeline.
```

这个构造方法完成的就是对于已经存在的管道追加一个中间操作，upstream表示上游元素的源。

这里又调用了AbstractPipeline的构造方法：

```java
AbstractPipeline(AbstractPipeline<?, E_IN, ?> previousStage, int opFlags) {
        if (previousStage.linkedOrConsumed)
            throw new IllegalStateException(MSG_STREAM_LINKED);
		// 标识为已经消费
        previousStage.linkedOrConsumed = true;
        previousStage.nextStage = this;

        this.previousStage = previousStage;
        this.sourceOrOpFlags = opFlags & StreamOpFlag.OP_MASK;
        this.combinedFlags = StreamOpFlag.combineOpFlags(opFlags, previousStage.combinedFlags);
        this.sourceStage = previousStage.sourceStage;
        if (opIsStateful())
            sourceStage.sourceAnyStateful = true;
    	// 深度加1
        this.depth = previousStage.depth + 1;
    }
```

方法的说明：

```txt
Constructor for appending an intermediate operation stage onto an existing pipeline.
```

向一个已有的管道用于追加一个中间操作。

这里也可以看到这个构造方法与我们之前见过的有关构造流源的构造方法的作用完全不同，回到刚才的例子当中，除了上面追加中间操作的部分，还涉及到了另外一个及其重要的类Sink，一般翻译为饮水槽，这是我们了解整个流调用机制的最后一个类。

### Sink源码分析

```txt
An extension of Consumer used to conduct values through the stages of a stream pipeline, with additional methods to manage size information, control flow, etc. Before calling the accept() method on a Sink for the first time, you must first call the begin() method to inform it that data is coming (optionally informing the sink how much data is coming), and after all data has been sent, you must call the end() method. After calling end(), you should not call accept() without again calling begin(). Sink also offers a mechanism by which the sink can cooperatively signal that it does not wish to receive any more data (the cancellationRequested() method), which a source can poll before sending more data to the Sink.
```

Sink是Consumer接口的一个扩展，用于在整个流管道阶段处理值，还提供了一些额外的信息，比如管理大小的信息，控制流程，等等。在首次调用Sink的accept之前必须先调用begin方法来通知数据即将到达，同时你也可以通知Sink需要处理的数据量是多少，在所有的数据发送完成之后，必须调用end方法，在调用完end方法，你就不应该再去调用accept方法，如果还想调用，就需要再调用一次begin方法，Sink本身可以通过cancellationRequested方法来发出不要再接收数据的信号，那么源在发送数据之前就可以根据判断是否要向Sink发送数据。

```txt
A sink may be in one of two states: an initial state and an active state. It starts out in the initial state; the begin() method transitions it to the active state, and the end() method transitions it back into the initial state, where it can be re-used. Data-accepting methods (such as accept() are only valid in the active state.
```

一个Sink一定是处于两种状态之一的，一种是初始状态，另一种是激活状态，首先它是从初始状态开始的，使用begin方法可以将它从初始状态转换成激活状态，使用end方法可以将它从激活状态转换成初始状态，这样调用完之后就可以重用了，对于Sink来说，只有在激活状态下才可以接收数据。

```txt
A stream pipeline consists of a source, zero or more intermediate stages (such as filtering or mapping), and a terminal stage, such as reduction or for-each. For concreteness, consider the pipeline:
```

一个流管道包含了0个或多个中间阶段（比如过滤、映射），还有一个终止阶段，比如汇聚等等，具体考虑下面这个pipeline：

```java
int longestStringLengthStartingWithA
         = strings.stream()
                  .filter(s -> s.startsWith("A"))
                  .mapToInt(String::length)
                  .max();
```

继续往下：

```txt
Here, we have three stages, filtering, mapping, and reducing. The filtering stage consumes strings and emits a subset of those strings; the mapping stage consumes strings and emits ints; the reduction stage consumes those ints and computes the maximal value.
```

这里对我们而言有三个阶段，过滤，映射，汇聚，过滤阶段会消耗字符串集合，会输出字符串的子集，映射阶段会消耗字符串集合，映射成整型值，汇聚阶段会消耗这个整型值并求出最大值。

```txt
A Sink instance is used to represent each stage of this pipeline, whether the stage accepts objects, ints, longs, or doubles. Sink has entry points for accept(Object), accept(int), etc, so that we do not need a specialized interface for each primitive specialization. (It might be called a "kitchen sink" for this omnivorous tendency.) The entry point to the pipeline is the Sink for the filtering stage, which sends some elements "downstream" -- into the Sink for the mapping stage, which in turn sends integral values downstream into the Sink for the reduction stage. The Sink implementations associated with a given stage is expected to know the data type for the next stage, and call the correct accept method on its downstream Sink. Similarly, each stage must implement the correct accept method corresponding to the data type it accepts.
```

Sink实例是用来表示管道的每一个阶段，而无论这个阶段接收的类型，比如 ints, longs, or doubles，Sink对于accept有一个入口点，这样我们就不需要针对于原生类型的特化版本，上面的例子当中，就是一个过滤阶段，Sink会将值映射成整型值向下游发送，最后进行汇聚操作。

Sink中的方法说明：

```java
    default void begin(long size) {}
```

方法的说明：

```txt
Resets the sink state to receive a fresh data set. This must be called before sending any data to the sink. After calling end(), you may call this method to reset the sink for another calculation.
```

会重新设置Sink的状态并且刷新数据集，向Sink发送任何数据之前一定要调用这个方法，调用完end方法之后，可以再次调用这个方法来重置Sink来进行其他的计算。

```java
   static abstract class ChainedReference<T, E_OUT> implements Sink<T> {
       	// 表示下游的操作
        protected final Sink<? super E_OUT> downstream;
		// 会保存下游的对象
        public ChainedReference(Sink<? super E_OUT> downstream) {
            this.downstream = Objects.requireNonNull(downstream);
        }

        @Override
        public void begin(long size) {
            downstream.begin(size);
        }

        @Override
        public void end() {
            downstream.end();
        }

        @Override
        public boolean cancellationRequested() {
            return downstream.cancellationRequested();
        }
    }
```

类的说明：

```txt
Abstract Sink implementation for creating chains of sinks. The begin, end, and cancellationRequested methods are wired to chain to the downstream Sink. This implementation takes a downstream Sink of unknown input shape and produces a Sink<T>. The implementation of the accept() method must call the correct accept() method on the downstream Sink.
```

它是Sink的一个抽象实现，用于创建Sink的一个链，begin, end, 和cancellationRequested方法都会链接起来，这个实现会接收下游的Sink。

```java
 abstract Sink<E_IN> opWrapSink(int flags, Sink<E_OUT> sink);
```

```txt
Accepts a Sink which will receive the results of this operation, and return a Sink which accepts elements of the input type of this operation and which performs the operation, passing the results to the provided Sink.
```

它会接收一个Sink作为当前操作的结果(E_OUT)，并且返回一个Sink，返回的Sink（E_IN）会接收这个操作的所对应的输入元素的类型并且执行这个操作，然后将结果传递给所提供的Sink。

```txt
a sink which accepts elements, perform the operation upon each element, and passes the results (if any) to the provided Sink.
```

返回的Sink会接收一个元素，并且对每个元素进行操作，最后将执行的结果（如果有的话）传递给提供的Sink。

正是因为将执行的结果传递给了方法参数的Sink，才将一系列的Sink有机的串联了起来。

```txt
The implementation may use the flags parameter to optimize the sink wrapping. For example, if the input is already DISTINCT, the implementation for the Stream#distinct() method could just return the sink it was passed.
```

可以使用flags来优化sink，例如，如果输入一定是不同，那么实现的时候，stream.distinct()方法就可以不用再去执行。

总的来说在进行中间操作的时候，StatelessOp继承了ReferencePipeline，而ReferencePipeline又实现了Stream接口，通过StatelessOp创建饮水槽，将中间操作串联起来。

```java
public static <T> TerminalOp<T, Void> makeRef(Consumer<? super T> action,                                              boolean ordered) {    Objects.requireNonNull(action);    return new ForEachOp.OfRef<>(action, ordered);}
```

```txt
actory for creating instances of TerminalOp that perform an action for every element of a stream. Supported variants include unordered traversal (elements are provided to the Consumer as soon as they are available), and ordered traversal (elements are provided to the Consumer in encounter order.)
```

这是一个工厂，用来创建终止操作的实例，终止操作会对流中的每个元素执行action，支持的变化包括无序的遍历（只要还有元素，就将元素提供给Consumer）还有一种有序的遍历（按照元素输入的顺序提供给Consumer）

```txt
Elements are provided to the Consumer on whatever thread and whatever order they become available. For ordered traversals, it is guaranteed that processing an element happens-before processing subsequent elements in the encounter order.
```

在可用的任意的顺序，任意线程都会将元素提供给Consumer ，对于有序的遍历而言，会保证处理一个元素一定是happens-before（某一件事情一定是发生在另外一件事情之前）处理后续的元素之前，即先遇到的先遍历。

makeRef方法的说明：

```txt
Constructs a TerminalOp that perform an action for every element of a stream.
```

构造了一个终止操作，并且对流中的每个元素都执行给定的动作。

```java
interface TerminalOp<E_IN, R> {
    // 默认是引用类型
    default StreamShape inputShape() { return StreamShape.REFERENCE; }

    default int getOpFlags() { return 0; }

    // 并行的方式
    default <P_IN> R evaluateParallel(PipelineHelper<E_IN> helper,
                                      Spliterator<P_IN> spliterator) {
        if (Tripwire.ENABLED)
            Tripwire.trip(getClass(), "{0} triggering TerminalOp.evaluateParallel serial default");
        return evaluateSequential(helper, spliterator);
    }

    // 串行的方式
    <P_IN> R evaluateSequential(PipelineHelper<E_IN> helper,
                                Spliterator<P_IN> spliterator);
}
```

类的说明：

```txt
An operation in a stream pipeline that takes a stream as input and produces a result or side-effect. A TerminalOp has an input type and stream shape, and a result type. A TerminalOp also has a set of operation flags that describes how the operation processes elements of the stream (such as short-circuiting or respecting encounter order; see StreamOpFlag).
```

这是流管道中的一个操作，它会接收一个流作为输入，生成一个结果或者拥有副作用（修改传入参数的引用），一个终止操作会拥有一个输入类型和一个流的类型（引用、整型、长整型等）和一个结果类型，一个终止操作描述了描述了流是如何处理流中元素的（比如短路、有序的执行）。

```txt
A TerminalOp must provide a sequential and parallel implementation of the operation relative to a given stream source and set of intermediate operations.
```

终止操作对于给定的流源和中间操作一定要提供并行和串行的实现。

实际上，终止操作的数量并不是特别多。

```txt
A TerminalOp that evaluates a stream pipeline and sends the output to itself as a TerminalSink. Elements will be sent in whatever thread they become available. If the traversal is unordered, they will be sent independent of the stream's encounter order.
```

这是一个终止操作，它会计算一个流福安到并且将结果发送给自身作为一个TerminalSink，元素如果可用的话会发送给任意一个线程，如果遍历是无序的，那么在遍历的时候就会独立于流中输入的顺序。

```txt
This terminal operation is stateless. For parallel evaluation, each leaf instance of a ForEachTask will send elements to the same TerminalSink reference that is an instance of this class.
```

这个终止操作是无状态的，对于并行计算，每一个叶子节点都会发送个这个类的同一个TerminalSink实例。

```txt
Evaluate the pipeline with a terminal operation to produce a result.
```

执行一个终止的操作，并且返回一个结果。

```java
    final <R> R evaluate(TerminalOp<E_OUT, R> terminalOp) {
        assert getOutputShape() == terminalOp.inputShape();
        if (linkedOrConsumed)
            throw new IllegalStateException(MSG_STREAM_LINKED);
        linkedOrConsumed = true;

        return isParallel()
               ? terminalOp.evaluateParallel(this, sourceSpliterator(terminalOp.getOpFlags()))
               : terminalOp.evaluateSequential(this, sourceSpliterator(terminalOp.getOpFlags()));
    }
```

串行的实现：

```java
    	@Override
        public <S> Void evaluateSequential(PipelineHelper<T> helper,
                                           Spliterator<S> spliterator) {
            return helper.wrapAndCopyInto(this, spliterator).get();
        }
```

```txt
Helper class for executing stream pipelines, capturing all of the information about a stream pipeline (output shape, intermediate operations, stream flags, parallelism, etc) in one place.
```

这是一个执行流管道的辅助类，它会在一个地方捕获关于流管道的所有信息（输出种类，中间操作，特性值，并行或者串行）。

```txt
A PipelineHelper describes the initial segment of a stream pipeline, including its source, intermediate operations, and may additionally incorporate information about the terminal (or stateful) operation which follows the last intermediate operation described by this PipelineHelper. The PipelineHelper is passed to the TerminalOp.
evaluateParallel(PipelineHelper, Spliterator), TerminalOp.evaluateSequential(PipelineHelper, Spliterator), and AbstractPipeline.opEvaluateParallel(PipelineHelper, Spliterator, IntFunction), methods, which can use the PipelineHelper to access information about the pipeline such as head shape, stream flags, and size, and use the helper methods such as wrapAndCopyInto(Sink, Spliterator), copyInto(Sink, Spliterator), and wrapSink(Sink) to execute pipeline operations.
```

PipelineHelper描述了一个流管道最开始的阶段，包括它的源，中间操作，以及一些附加的信息关于终止的有状态的操作。

```java
abstract class AbstractPipeline<E_IN, E_OUT, S extends BaseStream<E_OUT, S>>
        extends PipelineHelper<E_OUT> implements BaseStream<E_OUT, S>
```

```java
		@Override
        public <S> Void evaluateParallel(PipelineHelper<T> helper,
                                         Spliterator<S> spliterator) {
            if (ordered)
                new ForEachOrderedTask<>(helper, spliterator, this).invoke();
            else
                new ForEachTask<>(helper, spliterator, helper.wrapSink(this)).invoke();
            return null;
        }
```

```java
 abstract<P_IN, S extends Sink<P_OUT>> S wrapAndCopyInto(S sink, Spliterator<P_IN> spliterator);

```

方法的说明：

```txt
Applies the pipeline stages described by this PipelineHelper to the provided Spliterator and send the results to the provided Sink.
```

将PipelineHelper所描述的管道阶段应用到所提供的Spliterator同时把结果发送给提供的Sink。

这个方法在AbstractPipeline中有唯一的实现：

```java
    @Override
    final <P_IN, S extends Sink<E_OUT>> S wrapAndCopyInto(S sink, Spliterator<P_IN> spliterator) {
        copyInto(wrapSink(Objects.requireNonNull(sink)), spliterator);
        return sink;
    }
```

这里的wrapSink方法如下：

```java
       abstract<P_IN> Sink<P_IN> wrapSink(Sink<P_OUT> sink);
```

方法的说明：

```txt
Takes a Sink that accepts elements of the output type of the PipelineHelper, and wrap it with a Sink that accepts elements of the input type and implements all the intermediate operations described by this PipelineHelper, delivering the result into the provided Sink.
```

它会接收PipelineHelper输出类型的元素，使用Sink对于接收到的所有的元素进行包装成由PipelineHelper所描述的中间操作，并且将结果传递给提供的Sink。

这个方法就是对流中的中间操作进行串联的方法，具体的实现如下：

```java
 	@Override
    @SuppressWarnings("unchecked")
    final <P_IN> Sink<P_IN> wrapSink(Sink<E_OUT> sink) {
        Objects.requireNonNull(sink);
		// 深度大于0说明有中间操作。
        for ( @SuppressWarnings("rawtypes") AbstractPipeline p=AbstractPipeline.this; p.depth > 0; p=p.previousStage) {
            // opWrapSink是map等方法中实现的
            sink = p.opWrapSink(p.previousStage.combinedFlags, sink);
        }
        return (Sink<P_IN>) sink;
    }
```

```java
 abstract<P_IN> void copyInto(Sink<P_IN> wrappedSink, Spliterator<P_IN> spliterator);
```

方法的说明：

```txt
Pushes elements obtained from the Spliterator into the provided Sink. If the stream pipeline is known to have short-circuiting stages in it (see StreamOpFlag.SHORT_CIRCUIT), the Sink.cancellationRequested() is checked after each element, stopping if cancellation is requested.
```

将从Spliterator获取到元素推送到Sink当中，如果这个流管道已经知道了拥有短路的阶段，就会进入短路逻辑的判断，方法的实现如下：

```java
    @Override
    final <P_IN> void copyInto(Sink<P_IN> wrappedSink, Spliterator<P_IN> spliterator) {
        Objects.requireNonNull(wrappedSink);

        if (!StreamOpFlag.SHORT_CIRCUIT.isKnown(getStreamAndOpFlags())) {
            wrappedSink.begin(spliterator.getExactSizeIfKnown());
            spliterator.forEachRemaining(wrappedSink);
            wrappedSink.end();
        }
        else {
            copyIntoWithCancel(wrappedSink, spliterator);
        }
    }
```

TerminalSink是Sink最终的形态。

  ### Stream调用流程

BaseStream->Stream->AbstractPipline->ReferencePipline->(Head（流源）、StatelessOp（无状态的中间操作）、StatefulOp（有状态的中间操作））

Terminalop->(FindOp、ForeachOp、MatchOp、ReduceOp)
