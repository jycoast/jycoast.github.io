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

## Stream初识

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

## Stream类源码解析

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

## Stream实例剖析

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

这里我们首先对于流中的集合畸形了平方的操作，然后将所有的元素作为一个整体进行打印。

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

## Stream陷阱剖析

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