const http = require('http');
const url = require('url');
const stream = require('stream');

// 转义 mapping
const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"'`=\/]/g, s => entityMap[s]);
}

// 用于存储博客数据，给一条初始数据先
const blogs = [{
  id: '123',
  title: '我是标题',
  content: '666',
}];

function pathToRegexp(rule) {
  const keys = [];
  const regExpStr = rule
    .replace(/\(/, '(?:') // 将 (xxx) 转换成 (?:xxx)，以防被捕获
    .replace(/\/:(\w+)/, (_, k) => { // 将 /:id 转成 /(\\w+)
      keys.push(k); // 将 id 这个字符塞入到 keys 中，以便后面匹配到的值跟 key 对得上
      return '/(\\w+)';
    })
    .replace(/\*/, '.*'); // 将 * 转换成 .*

  return {
    ruleRE: new RegExp(`^${regExpStr}$`), // 将上面转换后的正则字符，转换成正则
    keys,
  };
}

class Router {
  constructor() {
    this.rules = [];

    // 支持的请求类型
    this.supportMethods = [ 'get', 'post', 'options', 'delete', 'put' ];

    // 给 Router 对象加上请求类型的方法
    this.supportMethods.forEach(method => {
      this[method] = this.register.bind(this, [ method ]);
    });

    // 加上 all 方法，代表支持所有请求
    this.all = this.register.bind(this, this.supportMethods);
  }

  register(methods, rule, controller) {
    // 将每个规则塞入数组
    this.rules.push({
      methods,
      controller,
      ...pathToRegexp(rule),
    });
  }

  async handle(ctx, next) {
    // 获取 pathname
    const pathname = ctx.pathname;

    // 遍历保存的路由规则
    for (let i = 0; i < this.rules.length; i++) {
      const { methods, ruleRE, keys, controller } = this.rules[i];

      // 当请求类型匹配，同时能匹配上路由规则的时候才继续
      const result = methods.includes(ctx.method) && ruleRE.exec(pathname);
      console.log(result);
      if (!result) {
        continue;
      }

      // 如果规则中是 /:id ，这里就将匹配到的值，跟 id 对应起来
      const params = {};
      
      keys.forEach((item, index) => {
          console.log(item,index);
        params[item] = result[index + 1];
      });
      console.log(keys);
      // 调用保存的 controller ，然后退出循环
      ctx.params = params;
      await controller(ctx);
      break;
    }
    // console.log(next);
    await next();
  }
}

// 中间件系统
const app = {
  middleware: [],

  use(mid) {
    // 添加一个中间件
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

// 创建路由实例
const router = new Router();

// 配置中间件
app.use(startHandle); // 请求开始
app.use(errorHandle); // 错误处理
app.use(bodyHandle); // 请求/响应数据处理
app.use(router.handle.bind(router)); // 路由功能

// 路由配置
router.get('/', indexController);
router.get('/detail/:id', detailController);
router.get('/edit(/:id)?', showEditPage);
router.post('/edit(/:id)?', submitBlog);

// 错误处理
async function errorHandle(ctx, next) {
  await next().catch(e => {
    console.error(e);
    ctx.status = 500;
    ctx.body = e.message;
  });
}

// 请求开始
async function startHandle(ctx, next) {
  
  const startTime = Date.now();
  ctx.status = null; // 用于记录响应码
  ctx.body = ''; // 用于记录响应数据
  ctx.method = ctx.req.method.toLowerCase(); // method 转成小写
  ctx.pathname = url.parse(ctx.req.url).pathname; // 给上下文对象添加个 pathname 的属性
  ctx.type = 'html'; // 响应类型，默认为 html
  const mimes = { html: 'text/html', json: 'application/json' };
  await next();
//   console.log(ctx.status,ctx.body);
  // 如果没有设置 body ，也没有设置 status ，默认为 404
  ctx.status = ctx.status ? ctx.status : (ctx.body ? 200 : 404);
  // 写状态码
  console.log(ctx.status);
  ctx.res.writeHead(ctx.status, { 'Content-Type': `${mimes[ctx.type]};charset=utf-8` });
  // 写响应
  if (ctx.body && ctx.body instanceof stream.Stream) {
    // body 可以直接设置为流
    ctx.body.pipe(ctx.res);
  } else {
    // 普通 json 对象或者字符串
    let body = '';
    try {
      // 防止 stringify 出错，start 中不能出错，因为 errorHandle 在该中间件后面
      body = ctx.body && (typeof ctx.body === 'string' ? ctx.body : JSON.stringify(ctx.body));
    } catch (e) {
      body = '';
      console.error(e);
    }
    ctx.res.end(body || String(ctx.status));
  }

  // 打印 accesslog
  console.info(`request ${ctx.pathname} ${ctx.status}, cost ${Date.now() - startTime}ms`);
}

// 请求数据处理
async function bodyHandle(ctx, next) {
  ctx.requestBody = ctx.req.method === 'POST'
    ? await getDataFromReq(ctx.req)
    : {};

  await next();
}
// 博客首页
function indexController(ctx) {
  ctx.body = '<h1>博客列表</h1>';

  if (blogs.length) {
    // 有博客的情况
    const html = blogs
      .map(blog => {
        // 博客标题
        const blogHtml = `<a href="/detail/${blog.id}">${escapeHtml(blog.title)}</a>`;
        // 博客编辑
        const editHtml = `<a href="/edit/${blog.id}">编辑</a>`;
        // 合并 html
        return `<p>${blogHtml} &nbsp;&nbsp; ${editHtml}</p>`;
      })
      .join('');

    ctx.body += html;
  } else {
    // 没有博客的情况
    ctx.body += '<p>暂无博客</p>';
  }

  // 结束响应，顺便加个添加博客入口
  ctx.body += '<a href="/edit">添加博客</a>';
}

// 博客详情页
function detailController(ctx) {
  const id = ctx.params.id;
  const blog = id && blogs.find(blog => blog.id === id);
  if (blog) {
    ctx.body = `<h1>${escapeHtml(blog.title)}</h1>${escapeHtml(blog.content)}`;
  }
}

// 博客编辑页
function showEditPage(ctx) {
  const id = ctx.params.id;
  const blog = id && blogs.find(blog => blog.id === id);
  ctx.body = `
    <script>
      function submitBlog() {
        var title = document.getElementById('title');
        var content = document.getElementById('content');
        if (!title || !content) return alert('数据不能为空');

        // 发个异步请求
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/edit${blog ? `/${blog.id}` : ''}');
        // 设置请求数据类型为 json
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            var resp = JSON.parse(xhr.responseText);

            // 提交完成，跳转到详情页
            if (resp.id) location.href = '/detail/' + resp.id;
          }
        };

        // 发送请求
        xhr.send(JSON.stringify({ title: title.value, content: content.value }));
      }
    </script>

    <p>标题：<input id="title" type="text" placeholder="输入博客标题" value="${blog ? blog.title : ''}"></p>
    <p>内容：<textarea id="content" placeholder="输入内容">${blog ? blog.content : ''}</textarea></p>
    <p><button onclick="submitBlog()">提交数据</button></p>
  `;
}

// 数据获取
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
      resolve(Buffer.concat(chunks, len).toString());
    })
  ).then(text => {
    const contentType = req.headers['content-type'];

    if (contentType.startsWith('application/json')) {
      return JSON.parse(text);
    }

    return text;
  });
}

// 博客编辑接口
let uniqId = 0;
async function submitBlog(ctx) {
  const id = ctx.params.id;
  let blog = id && blogs.find(blog => blog.id === id);

  if (blog && blog.id) {
    // 有 id ，说明是更新博文
    blog.title = ctx.requestBody.title;
    blog.content = ctx.requestBody.content;
  } else {
    // 无 id，说明是添加新博文
    blog = {
      id: `${Date.now()}${uniqId++}`, // 以时间戳作为 id
      title: ctx.requestBody.title,
      content: ctx.requestBody.content,
    };

    blogs.push(blog);
  }

  // 这里的 content-type 就是写 json 的 mime
  ctx.type = 'json';
  ctx.body = { id: blog.id };
}

const server = http.createServer((req, res) => {
  app.handle(req, res);
});

// 监听 3000 端口
server.listen(3000, () => {
  // 服务启动完成的时候会触发该回调，打印日志
  console.info('server listening in', server.address().port);
});