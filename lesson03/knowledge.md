# 本章知识点概要

## RegExp.prototype.exec()

如果匹配成功，exec() 方法返回一个数组，并更新正则表达式对象的属性。返回的数组将完全匹配成功的文本作为第一项，将正则括号里匹配成功的作为数组填充到后面。

如果匹配失败，exec() 方法返回 null。


## es6的class类，执行的方法，执行上下文

class 声明创建一个基于原型继承的具有给定名称的新类。

你也可以使用类表达式定义类。但是不同于类表达式，类声明不允许再次声明已经存在的类，否则将会抛出一个类型错误。

在下面的例子中，我们首先定义一个名为Polygon的类，然后继承它来创建一个名为Square的类。注意，构造函数中使用的 super() 只能在构造函数中使用，并且必须在使用 this 关键字前调用。

```
class Polygon {
  constructor(height, width) {
    this.name = 'Polygon';
    this.height = height;
    this.width = width;
  }
}

class Square extends Polygon {
  constructor(length) {
    super(length, length);
    this.name = 'Square';
  }
}
```

## ES6 扩展操作符



## replace 方法 作为函数为替代方法的时候返回的参数为什么


## let 和const的区别

## stream.pipe()

The 'pipe' event is emitted when the stream.pipe() method is called on a readable stream, adding this writable to its set of destinations.
