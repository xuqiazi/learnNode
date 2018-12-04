const { template } = require('./template');
const fs = require('fs');
const data = require('./blog.json');
const accounts = require('./account.json');
const { redirect } = require('./redirect');
const path = require('path');
const sessionStore = {};
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
// indexController
function indexController(ctx) {
  const title = '<h1>博文列表页</h1>';
  const header = '博文列表页';
  if (data.length) {
    const script = `
       <script>
       function deleteBlog(id) {
          var xhr = new XMLHttpRequest();
          var parent=document.getElementById("olList");
          var child = document.getElementById('list-'+id);
          parent.removeChild(child);
          // xhr.open('GET', '/delete?id='+id);
          xhr.open('POST', '/delete');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
              // var resp = xhr.responseText;
              // console.log('已成功');
              
            }
          };
          xhr.send(JSON.stringify({ id: id }));
        }
       </script>
      `;
    const html =
      script +
      title +
      '<ol id="olList">' +
      data
        .map(data => {
          const author = accounts.find(
            account => account.accountId === data.accountId
          );
          // console.log(accounts, author);
          const listHtml = `<a href='/detail/${
            data.id
          }' target='_blank'>${escapeHtml(data.title)}作者：${escapeHtml(
            author.username
          )}</a>`;
          const editHtml =
            data.accountId === ctx.userInfo.accountId
              ? `<a href='/edit/${data.id}' target='_blank'>编辑</a>`
              : '';
          const deleteHtml =
            data.accountId === ctx.userInfo.accountId
              ? `<button onclick="deleteBlog(${data.id})">删除</button>`
              : '';
          return `<li id="list-${
            data.id
          }">${listHtml}&nbsp;&nbsp;${editHtml}&nbsp;&nbsp;${deleteHtml}</li>`;
        })
        .join('') +
      '</ol><a href="/edit">添加博客</a>';
    ctx.body += template(header, html);
  } else {
    ctx.body += template(
      header,
      `${title}<p>暂无博客</p><a href="/edit">添加博客</a>`
    );
  }
}
function detailController(ctx) {
  const id = ctx.params.id;
  const blog = id && data.find(blog => blog.id === id);
  const header = `${blog.title}`;

  if (blog) {
    const author = accounts.find(
      account => account.accountId === blog.accountId
    );
    const html = `<h1>${escapeHtml(blog.title)}</h1><p>作者：${escapeHtml(
      author.nickname
    )}</p>${escapeHtml(blog.content)}<br/>`;
    ctx.body += template(header, html);
  }
}
// 博客编辑接口
let uniqId = 0;
function submitBlog(ctx) {
  // 获取请求数据
  const datas = ctx.requestBody;
  const id = ctx.params.id;
  let blog = id && data.find(blog => blog.id === id);
  if (blog && ctx.userInfo.accountId !== blog.accountId) {
    return;
  }
  if (blog && blog.id) {
    console.log(datas.title, datas.content);
    // 有 id ，说明是更新博文
    blog.title = datas.title;
    blog.content = datas.content;
  } else {
    // 无 id，说明是添加新博文
    blog = {
      id: `${Date.now()}${uniqId++}`, // 以时间戳作为 id
      title: datas.title,
      content: datas.content,
      accountId: ctx.userInfo.accountId,
    };
    data.push(blog);
  }
  // 这里的 content-type 就是写 json 的 mime
  ctx.type = 'json';
  ctx.body = { id: blog.id };
}

function showEditPage(ctx) {
  const id = ctx.params.id;
  const blog = id && data.find(blog => blog.id === id);
  if (blog && ctx.userInfo.accountId !== blog.accountId) {
    return;
  }
  const header = '博客编辑页';
  const html = `
  <script>
    function submitBlog() {
      var title = document.getElementById('title');
      var content = document.getElementById('content');
      if (!title || !content) return alert('数据不能为空');
      console.log(title.value,content.value);
      // 发个异步请求
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/edit${blog ? `/${blog.id}` : ''}');
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

  <p>标题：<input id="title" type="text" placeholder="输入博客标题" value="${
  blog ? blog.title : ''
}"></p>
  <p>内容：<textarea id="content" placeholder="输入内容">${
  blog ? blog.content : ''
}</textarea></p>
  <p><button onclick="submitBlog()">提交数据</button></p>
`;
  ctx.body += template(header, html);
}
function loginPageController(ctx) {
  const header = '登录页';
  const body = `
    <form action="/login" method="post">
      <p><label>用户名</label><input type="text" name="username" placeholder="请输入用户名"/></p>
      <p><label>密码</label><input type="password" name="password" placeholder="请输入密码"/></p>
      <p><button type="submit">登录</button></p>
      </form>
    <a href="/register">注册</a>
  `;
  ctx.body = template(header, body);
}
function registerPageController(ctx) {
  const header = '注册页';
  const script = `
  <script>
  function register() {
    const xhr = new XMLHttpRequest();
    const username = document.getElementById('username');
    const nickname = document.getElementById('nickname');
    const password = document.getElementById('password');
    const exitTips = document.getElementsByTagName('span');
    const p = document.getElementsByTagName('p');
    const showtips = function(ele) {
      if (!ele.childNodes[1].value) {
        ele.childNodes[2].style.cssText = 'visibility:visible;';
      }
    };
    if (username && nickname && password) {
      xhr.open('POST', '/register');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          const resp = JSON.parse(xhr.responseText);
          console.log(resp.code);
          if (resp.code === 500) {
            exitTips[0].innerHTML = '用户名已存在,请重新输入';
          } else if (resp.code === 200) {
            exitTips[0].innerHTML = '注册成功，现为你跳转登录页';
            location.href = '/login';
          }
        }
      };
      xhr.send(
        JSON.stringify({
          username: username.value,
          nickname: nickname.value,
          password: password.value,
        })
      );
    } else {
      for (let i = 0; i < p.length; i++) {
        new showtips(p[i]);
      }
    }
  }
  
  </script>
 `;
  const body = script + `
      <style>i{visibility:hidden;}</style>
      <p class="username"><label>用户名</label><input type="text" name="username" placeholder="请输入用户名" id="username"/><i>用户名不能为空</i></p>
      <p class="nikename"><label>昵称</label><input type="text" name="nickname" placeholder="请输入昵称" id="nickname"/><i>昵称不能为空</i></p>
      <p class="password"><label>密码</label><input type="password" name="password" placeholder="请输入密码" id="password"/><i>密码不能为空</i></p>
      <span></span></br>
      <button onclick="register()">注册</button>
  `;
  ctx.body = template(header, body);
}
// 单独的方法设置cookie；
function setCookie(ctx, key, val, opt = {}) {
  const setCookie = ctx.res.getHeader('Set-Cookie') || [];
  setCookie.push(
    // key-value为开发者设定的值，可以有多对
    [
      `${key}=${val}`,
      // cookie指定的path，该path下的所有的链接都会被匹配到。默认为/
      opt.path ? `path=${opt.path}` : '/',
      // cookie 指定的cookie 所能用的最大的生命周期即在什么之前有效，有服务器置顶。
      opt.expires ? `expires=${opt.expires}` : '',
      // 可选，设置了httponly 的操作的，不可通过JS等脚本语言获得
      opt.httponly ? 'httponly' : '',
      // 设置为安全的，只有带有安全属性的请求才能被发送到服务器
      opt.secure ? 'secure' : '',
      // 指定可送达的主机名
      opt.domain ? `domain=${opt.domain}` : '',
      // 比expires 更优先级，它是指cookies失效前所经过的秒数。
      opt.maxAge ? `maxAge=${opt.maxAge}` : '',
    ]
      .filter(k => !!k)
      .join('; ')
  );
  ctx.res.setHeader('Set-cookie', setCookie);
}
// 登录校验逻辑
function loginController(ctx) {
  // 拿到传进来的username,password
  const { username, password } = ctx.requestBody;
  // console.log(ctx.requestBody);
  const user = accounts.find(account => account.username === username);
  // console.log(user);
  if (!user || user.password !== password) {
    ctx.body = '用户名或密码错误';
    return;
  }
  const sessionId = `${Date.now()}${Number(Math.random() * 99999 * 10000)}`;

  Object.keys(sessionStore).forEach(k => {
    if (sessionStore[k].accountId === user.accountId) {
      delete sessionStore[k];
    }
  });
  sessionStore[sessionId] = {
    accountId: user.accountId,
    createTime: Date.now(),
  };
  const oneDay = 24 * 60 * 60 * 10000;
  setCookie(ctx, '__session_id__', sessionId, {
    expires: new Date(Date.now() + oneDay).toUTCString(),
    httponly: true,
  });
  redirect(ctx, '/');
}

async function registerController(ctx) {
  const { username } = ctx.requestBody;
  const user = accounts.find(account => account.username === username);
  let code;
  if (user) {
    code = 500;
  } else {
    code = await registerWriteFile(ctx);
  }
  const data = {
    code: `${code}`,
  };
  ctx.body = data;
}
async function registerReadFile(ctx) {
  const url = path.resolve(__dirname, 'account.json');
  const { username, nickname, password } = ctx.requestBody;
  const Data = await new Promise((resolve, reject) => {
    fs.readFile(url, (err, data) => {
      if (err) { reject(err); }
      const accountData = JSON.parse(data.toString());
      const accountId = (accountData.length + 1).toString();
      accountData.push({
        username,
        nickname,
        password,
        accountId,
      });
      resolve(accountData);
    });
  });
  return Data;
}
async function registerWriteFile(ctx) {
  const accountData = await registerReadFile(ctx);
  const str = JSON.stringify(accountData);
  const url = path.resolve(__dirname, 'account.json');
  let status;
  const satusTime = await new Promise((resolve, reject) => {
    fs.writeFile(url, str, function(err) {
      if (err) {
        status = 404;
        reject(err);
      }
      status = 200;
      resolve(status);
    });
  });
  return satusTime;
}
function deleteJson(id) {
  const url = path.resolve(__dirname, 'blog.json');
  fs.readFile(url, function(err, data) {
    if (err) {
      return console.error(err);
    }

    const blog = JSON.parse(data.toString());
    const blogId = id.toString();
    // 把数据读出来删除
    for (let i = 0; i < blog.length; i++) {
      if (blogId === blog[i].id) {
        blog.splice(i, 1);
        break;
      }
    }
    const str = JSON.stringify(blog);
    // 然后再把数据写进去
    fs.writeFile(url, str, function(err) {
      if (err) {
        console.error(err);
      }
      console.log('删除成功');
    });
  });
}
function deleteController(ctx) {
  const datas = ctx.requestBody;
  if (datas && datas.id) {
    deleteJson(datas.id);
    ctx.status = '200';
  }
}
exports.indexController = indexController;
exports.detailController = detailController;
exports.showEditPage = showEditPage;
exports.showEditPage = showEditPage;
exports.submitBlog = submitBlog;
exports.loginController = loginController;
exports.loginPageController = loginPageController;
exports.registerController = registerController;
exports.registerPageController = registerPageController;
exports.sessionStore = sessionStore;
exports.deleteController = deleteController;
