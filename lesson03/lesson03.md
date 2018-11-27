# lesson 03

此课程为学习如何去构建一个中间件

## 编写路由类

编写路由类是为了可以直接编写路由规则，意思就是说，当你有新建的一些规则的话，比如增加一个delete的请求的时候，直接配置路由规则就可以了，不需要再往逻辑里面增加delete的请求。

为了达到可以自由编写路由规则的目的，这个路由类需要有三个可自由配置的，一是请求方法，二是请求路径，三是对应的控制器。

### 请求路径匹配

首先说请求路径匹配，为了让请求路径可以匹配多种类型需要了解到本身自己链接pathname的类型，

比如我现在的pathname的类型大致可以归类为\xxx\ddd,\，*三种，

那我所写的正则匹配里面就需要用replace覆盖这三种类型

### 请求方法匹配

请求方法匹配定义一个数组专门放博客会用到的请求方法，比如get，post等

### register 注册路由

提供一个register方法来注册路由规则，并将请求规则路由规则保存到规则数组中

### handle 处理方法

经过上面存储好规则后，需要有个方法来处理接收到的请求

比如判断请求是否匹配在上面保存好的数组里面，路由规则是否匹配，并且获得对应的pathname的值，最后进行调用controller

## 中间件系统

### 为什么要用中间件系统？

按照lesson2的controller里面的写法，先是判断pathname来进入不同的controller，若无该pathname则404，再不同的controller里面如果数据接收不正确，还会进行判断输出404，

那在controller比较多的情况下，每个controller 都要重新判断输出一些404。这样，博客壮大后，代码就会越来越冗余。


### 中间件系统是什么？

简单点来说就是业务抽离，把一些简单点比如404以及响应头等抽离了，一层一层的到达最后的controller层，让controller 更注重于业务逻辑，清楚代码冗余


### 洋葱式设计模式

参考koa，经过事件一层层处理，直到controller，再由controller出来返回原来的层级进行抛出处理。有点像洋葱围绕着中间的芯那样。

### 中间件系统
```
// 中间件系统
const app = {
  middleware: [],

  use(mid) {
    // 添加一个中间件，要求传入的中间件都是 async 的
    this.middleware.push(mid);
  },

  async handle(req, res) {
    // 创建个上下文对象
    const context = { req, res };

    // 开始对中间件的遍历
    let i = 0;
    const traverseMid = async () => {
      // 拿到当前遍历到的中间件
      const mid = this.middleware[i++];
      if (!mid) return;

      // 将当前上下文对象传入中间件，并且传入执行下一个中间件的 async 方法
      await mid(context, traverseMid);
    };

    await traverseMid();
  },
};
```
1，定义一个中间件数组
2，定义一个方法，往数组塞中间件
3，定义一个接收请求后按层级执行中间件的方法

### startHandle

此方法主要在第一次进入的时候初始化定义了状态码，响应头，以及body等，然后执行await next() 执行下一个中间件。

等到执行完下面中间件返回的时候，拿到返回的状态码，响应头，body等后进行判断处理，最后res 响应输出

### errorHandle

此方法集中抛出服务器错误500

### bodyHandle

此方法用语post的数据处理，集中处理完数据后再执行下面的controller 





