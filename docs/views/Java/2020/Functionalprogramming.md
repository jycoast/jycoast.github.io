---
title: 函数式编程
date: 2020-07-13
categories:
 - Java
author: jyc

---

## 匿名内部类

JDK8或者说Java8是目前企业开发中最常用的JDK版本，Java8可谓Java语言历史上变化最大的一个版本，其承诺要调整Java编程向着函数式风格迈进，这有助于编写出更为简洁、表达力更强，并且在很多情况下能够利用并行运行的代码。

但是很多人在使用Java8的时候，还是使用传统的面向对象的编程方式，这样在使用Java8的好处也仅仅停留在JVM带来的性能上的提升，而事实上Java8的新特性可以极大提升我们的开发效率，面向函数式编程也是将来编程语言的重要趋势，可以说，学习函数式编程风格，刻不容缓。

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

而使用Lambda表达式所带来的好处其实远不止简化代码，它还可以为我们带来代码执行效率上的提升，所以，无论是处于开发效率，还是代码的执行速度上来看，都应该使用Lambda表达式，在后面的文章中，我们首先认识一下函数式编程中两个核心的概念Lambda表达式和Stream。

## Lambda表达式和Stream

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

前面我们提到过，在Java中，Lambda表达式需要依赖于函数式接口这样一种特殊的形式，实际上，对于一个特定的Lambda表达式是什么类型的，是需要上下文才能解读的，来看这样一个例子：

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

```txt
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



