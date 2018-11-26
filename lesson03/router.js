const http = require('http');
const {
  indexController,
  detailController,
  showEditPage,
  submitBlog
} = require('./controller');
// 第一步 路由规则

// pathToRegexp(rules);
// 1，撰写路由规则的匹配
// 2，思路是首先你想要匹配的形式是什么，整理出来的情况是，需要匹配的pathname 是‘detail/123’,'edit/123','edit/'
// 3，撰写路由规则的匹配首先要满足我可以配置前面文件夹部分，后面的数字部分是通过keys去提取。'/detail/:id'
// 4，将 (xxx) 转换成 (?:xxx)，以防被捕获
// 5，将 /:id 转成 /(\\w+)
// 6，将 id 这个字符塞入到 keys 中，以便后面匹配到的值跟 key 对得上
// 7，将 * 转换成 .*
// 8，将上面转换后的正则字符，转换成正则

function pathToRegexp(rule) {
  const keys = [];
  const regExpStr = rule
    .replace(/\(/, '(?:')
    .replace(/\/:(\w+)/, (_, k) => {
      keys.push(k);
      return '/(\\w+)';
    })
    .replace(/\*/, '.*');

  return {
    ruleRE: new RegExp(`^${regExpStr}$`),
    keys
  };
}
// 实现路由类
// 路由主要的目的是实现不同的请求不同的url进来，做出不同的controller的响应。
// 所以，construtor 里面需要有定义请求的属性，然后需要有路由规则的属性，需要定义个注册函数，
// 把不同的请求方法，不同的url，不同的路由规则下，调用的的controller 给放进rules 里面
// 将路由器的方法给统一定义好了以后，那传入的参数怎么处理呢。需要有一个统一处理的函数。
// 这个统一处理的函数所实现的功能其实很简单，就等于我们第二节课的当pathname 为什么的时候，我进入什么controller
// 为了代码的健壮性，当然是不能够用if else 来简单判断了，而是利用了前面构造器的属性，进行了处理。可以说前面构造器的方法以及属性的存储
// 是为了下面这个handle方法的处理
// handle 方法的第一步，获取pathname
class Router {
  constructor() {
    this.rules = [];
    // 支持的请求类型
    this.supportedMethods = ['get', 'post'];
    // 给 Router 对象加上请求类型的方法
    this.supportedMethods.forEach(method => {
      this[method] = this.register.bind(this, [method]);
    });
    // 加上 all 方法，代表支持所有请求
    this.all = this.register.bind(this, this.supportedMethods);
  }
  register(methods, rule, controller) {
    this.rules.push({
      methods,
      ...pathToRegexp(rule),
      controller
    });
  }

  async handle(ctx, next) {
    const pathname = ctx.pathname;
    // 遍历保存的路由规则
    for (let i = 0; i < this.rules.length; i++) {
      // 把method，rules，keys，controller从构造函数的属性中提取出来
      const { methods, ruleRE, keys, controller } = this.rules[i];
      // console.log(this.rules[i]);
      // 当请求类型匹配(请求类型在存储好的构造函数属性里面)，同时能匹配上路由规则的时候才继续
      //   const result = methods.includes(ctx.method)&& ruleRE.exec(pathname);
      console.log(ctx.method, ruleRE.exec(pathname));
      const result = methods.includes(ctx.method) && ruleRE.exec(pathname);
      console.log(result);
      if (!result) {
        continue;
      }
      // 如果规则中是 /:id ，这里就将匹配到的值，跟 id 对应起来
      const params = {};
      keys.forEach((item, index) => {
        //   id,0
        params[item] = result[index + 1];
        //   id=123
      });
      ctx.params = params;
      console.log(ctx);
      // 调用保存的 controller ，然后退出循环
      // console.log('controller',controller(ctx));
      await controller(ctx);
      break;
    }
    await next();
  }
}
const router = new Router();

// 除此之外的都到 404
// router.all('*', notFoundController);
exports.router = router;
