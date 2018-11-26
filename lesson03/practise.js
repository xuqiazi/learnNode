const http = require('http');
const stream = require('stream');
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
    .replace('/(/', '(?:')
    .replace('//:(w+)/', (_, k) => {
      keys.push(k);
      return '/(\\w+)';
    })
    .replace('/*/', '.*');

  return {
    ruleRE: new RegExp(`^$${regExpStr}$`),
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
      ...pathToRegexp(rule).ruleRE,
      controller
    });
  }

  handle(ctx) {
    const pathname = ctx.pathname;
    // 遍历保存的路由规则
    for (i = 0; i < this.rules.length; i++) {
      // 把method，rules，keys，controller从构造函数的属性中提取出来
      const {
        methods,
        ruleRE,
        keys,
        controller
      } = this.rules[i];
      // 当请求类型匹配(请求类型在存储好的构造函数属性里面)，同时能匹配上路由规则的时候才继续
      const result = methods.includs(ctx.req.method.toLowerCase()) && ruleRE.exec(pathname);
      if (!result) {
        continue;
      }
      // 如果规则中是 /:id ，这里就将匹配到的值，跟 id 对应起来
      const params = {};
      keys.forEach((item, index) => {
        //   id,0
        params[item] = result[index + 1];
        //   id=123
      })
      ctx.params = params;
      // 调用保存的 controller ，然后退出循环
      await constroller(ctx);
      break;
    }
  }
}

// 实现中间件
// 洋葱式中间件的原理是，层层进入，再层层出去，这样子可以避免在上一节课里面进入到controller 里面还要写if else 来判断404响应。
// 让controller 专注于展示内容，某些响应的404内容就可以。还比如一些获取数据的部分，如果获取到的数据是不符合要求的，那又要抛出404
// 所以利用了一个洋葱式的一个设计原型来进行处理。
// 简单的中间件方法为往中间塞入中间件，然后等下一个中间件执行，直到最后一个中间件，再往回执行。
// 写中间件的逻辑
// 1，定义一个数组来存放中间件
// 2，定义一个方法来往数组里面塞中间件
// 3，handle是中间件处理方法，在httpserver监听的时候，如果有请求进来进行回调。

const app = {
  middleware = [],
  // 添加一个中间件，要求传入的中间件都是 async 的
  use(mid) {
    this.middleware.push(mid);
  },

  async handle(req, res) {
    // 创建个上下文对象
    const constext = {
      req,
      res
    }
    // 开始对中间件的遍历
    let i = 0;
    const traverseMid = async () => {
      const mid = this.middleware[i++];
      if (!mid) {
        return;
      }
      await mid(context, traverseMid)
    }
    await traverseMid();
  }
}

// 开始撰写中间件，需要撰写的中间件分为四层，第一层和最后一层是请求处理，
// 第二层和倒数第二层为404异常处理
// 第三层和倒数第三层为处理客户端提交的数据表单
// 最后一层为controller

function startHandle(ctx, handle) {
  const startTime = Date.now();
  ctx.status = null; // 用于记录响应码
  ctx.body = '' // 用于记录响应数据
  ctx.method = ctx.req.method.toLowerCase(); // method 转成小写
  ctx.pathname = url.parse(ctx.req.url).pathname; // 给上下文对象添加个 pathname 的属性
  ctx.type = 'html'; // 响应类型，默认为 html，但由于有的响应为json，所以增加不同的响应类型
  const mines = {
    html: 'text/html',
    json: 'application/json'
  }

  await next();

  // 如果没有设置 body ，也没有设置 status ，默认为 404
  // status为如果设置了status那就返回status，若没有则看是否设置body，如果有则返回200，没有则为404
  ctx.status = ctx.status ? ctx.status : (ctx.body ? 200 : 404)
  // 写响应头
  // 状态码传入为前面获得，content-type 根据现在的类型
  ctx.res.writeHead(ctx.status, {
    'content-type': `${mines[ctx.type]};charset=utf-8`
  });
  // 写响应，主要是为了实现res.end这个功能
  // 如果body 为流的话，以管道的形式边读边输出
  if (ctx.body && ctx.body instanceof stream.Stream) {
    // body 可以直接设置为流
    ctx.body.pipe(ctx.res);
  } else {

    // 普通 json 对象或者字符串
    let body = '';
    try {


      // 防止 stringify 出错，start 中不能出错，因为 errorHandle 在该中间件后面
      // 传入body 并判断 是否为字符串，如果是字符串则直接返回，否则返回json的tringify
      body = ctx.body && (typeof ctx.body === 'string' ? ctx.body : JSON.stringify(ctx.body));
    } catch (e) {
      body = '';
      console.error(e);
    }
  }
  console.info(`request ${ctx.pathname} ${ctx.status}, cost ${Date.now() - startTime}ms`);
  // 打印 accesslog
}

// 错误处理

function errorHandle(ctx, next) {
  await next().catch(e => {
    console.log(e);
    // 服务器错误
    ctx.status = 500;
    ctx.body = e.message;
  })
}

// 数据处理
function getDataFromReq(req) {
  let len = 0;
  const chunks = [];

  // 监听 data 事件
  req.on('data', buf => {
    // 如果数据量比较大的情况下，回调有可能会触发多次
    // 因此用个数组在这个回调中收集数据，数据均是 buffer
    chunks.push(buf);
    len += buf.length;
  });

  // 当触发 end 事件的时候，说明数据已经接收完了
  return new Promise(resolve =>
    req.on('end', () => {
      // 将收集的数据 buffer 组合成一个完整的 buffer ，然后通过 toString 将 buffer 转成字符串
      const plainText = Buffer.concat(chunks, len).toString();

      // 将数据返回
      resolve(JSON.parse(plainText));
    })
  );
}

function dataHandle(ctx, next) {
  ctx.requestBody = ctx.req === "POST" ? await getDataFromReq(ctx.req) : {};
  await next();
}



