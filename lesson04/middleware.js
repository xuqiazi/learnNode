const stream = require('stream');
const { router } = require('./router');
const url = require('url');
const accounts = require('./account.json');
const querystring = require('querystring');
const {
  indexController,
  detailController,
  showEditPage,
  submitBlog,
  loginController,
  loginPageController,
  registerController,
  registerPageController,
  sessionStore,
} = require('./controller');
// 实现getCookie方法
function getCookie(ctx, key) {
  if (!ctx.cookie) {
    ctx.cookie = {};
    const cookieStr = ctx.req.headers.cookie || '';
    // 匹配__session_id__=154339717784636451
    cookieStr.replace(/([\w\.]+)=([^;]+)(?:;|$)/g, (_, key, value) => {
      ctx.cookie[key] = value;
    });
  }
  return ctx.cookie[key];
}
// 重定向
function redirect(ctx, url) {
  // 设置重定向响应码
  ctx.status = 302;
  // JS 中重定向的设置 https://en.wikipedia.org/wiki/Server-side_redirect
  ctx.res.setHeader('Location', url);
  // url = escapeHtml(url);
  ctx.body = `Redirecting to <a href="${url}">${url}</a>`;
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
  middleware: [],
  // 添加一个中间件，要求传入的中间件都是 async 的
  use(mid) {
    this.middleware.push(mid);
  },

  async handle(req, res) {
    // 创建个上下文对象
    const context = {
      req,
      res,
    };
    // 开始对中间件的遍历
    let i = 0;
    const traverseMid = async () => {
      const mid = this.middleware[i++];
      if (!mid) {
        return;
      }
      await mid(context, traverseMid);
    };
    await traverseMid();
  },
};

// 博客首页，接收 get 请求
router.get('/', indexController);
// 博客详情，接收 get 请求
router.get('/detail/:id', detailController);
// 博客编辑页面请求
router.get('/edit(/:id)?', showEditPage);
// 博客编辑数据提交
router.post('/edit(/:id)?', submitBlog);
router.get('/login', loginPageController);
router.post('/login', loginController);
router.get('/register', registerPageController);
router.post('/register', registerController);
// router.get('/logout', logoutController);
// // 配置中间件
app.use(startHandle); // 请求开始
app.use(errorHandle); // 错误处理
app.use(dataHandle); // 请求/响应数据处理
app.use(accountHandle); // 登录态中间件
app.use(router.handle.bind(router)); // 路由功能

// 开始撰写中间件，需要撰写的中间件分为四层，第一层和最后一层是请求处理，
// 第二层和倒数第二层为404异常处理
// 第三层和倒数第三层为处理客户端提交的数据表单
// 最后一层为controller

async function startHandle(ctx, next) {
  const startTime = Date.now();
  ctx.status = null; // 用于记录响应码
  ctx.body = ''; // 用于记录响应数据
  ctx.method = ctx.req.method.toLowerCase(); // method 转成小写
  ctx.pathname = url.parse(ctx.req.url).pathname; // 给上下文对象添加个 pathname 的属性
  ctx.type = 'html'; // 响应类型，默认为 html，但由于有的响应为json，所以增加不同的响应类型
  const mines = {
    html: 'text/html',
    json: 'application/json',
  };
  await next();

  // 如果没有设置 body ，也没有设置 status ，默认为 404
  // status为如果设置了status那就返回status，若没有则看是否设置body，如果有则返回200，没有则为404
  ctx.status = ctx.status ? ctx.status : ctx.body ? 200 : 404;
  // 写响应头
  // 状态码传入为前面获得，content-type 根据现在的类型
  ctx.res.writeHead(ctx.status, {
    'content-type': `${mines[ctx.type]};charset=utf-8`,
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
      body =
        ctx.body &&
        (typeof ctx.body === 'string' ? ctx.body : JSON.stringify(ctx.body));
    } catch (e) {
      body = '';
      console.error(e);
    }
    ctx.res.end(body || String(ctx.status));
  }
  console.info(
    `request ${ctx.pathname} ${ctx.status}, cost ${Date.now() - startTime}ms`
  );
  // 打印 accesslog
}

// 错误处理

async function errorHandle(ctx, next) {
  await next().catch(e => {
    console.log(e);
    // 服务器错误
    ctx.status = 500;
    ctx.body = e.message;
  });
}
// 账户处理中间件
async function accountHandle(ctx, next) {
  // 从getCookie 中获得定义好的sessionID
  const sessionId = getCookie(ctx, '__session_id__');
  // const sessinoId=null;
  // 拿到sessionId
  // console.log('direct', sessionId);
  const sessionInfo = sessionId && sessionStore[sessionId];

  // console.log(sessionStore[sessionId]);
  // 拿到将sessionId 里面的 accountId和accounts 里面的用户Id对应上
  const userInfo =
    sessionInfo &&
    accounts.find(user => user.accountId === sessionInfo.accountId);
  console.log(userInfo);
  if (!userInfo) {
    if (ctx.pathname !== '/login') {
      if (ctx.pathname !== '/register') {
        return redirect(ctx, '/login');
      }
    }
  }

  ctx.userInfo = {
    ...userInfo,
    sessionId,
  };

  await next();
}
// 数据处理
async function getDataFromReq(req) {
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
      resolve(plainText);
    })
  ).then(text => {
    // 获取contentType
    const contentType = req.headers['content-type'];
    if (contentType.startsWith('application/x-www-form-urlencoded')) {
      // console.log(querystring.parse(text));
      return querystring.parse(text);
    } else if (contentType.startsWith('application/json')) {
      return JSON.parse(text);
    }
    return text;

  });
}

async function dataHandle(ctx, next) {
  ctx.requestBody =
    ctx.req.method === 'POST' ? await getDataFromReq(ctx.req) : {};
  await next();
}

exports.app = app;
