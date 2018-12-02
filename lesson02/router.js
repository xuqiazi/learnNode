const { template } = require('./template');
const fs = require('fs');
const data = require('./blog.json');
const http = require('http');
const url = require('url');
function okHeader(res) {
  res.writeHead('200', { 'content-Type': 'text/html;charset=utf-8' });
}

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
function getIdFromPathname(pathname) {
  // 匹配 /xxx/{number}
  const matches = pathname.match(/^\/\w+\/(\d+)$/);
  return matches ? matches[1] : null;
}
// 404controller
function notFoundController(req, res) {
  res.writeHead('404');
  res.end('404 is not found');
}
// indexController
function indexController(req, res) {
  okHeader(res);
  const title = '<h1>这是斯琪的博客列表</h1>';
  const header = '博客列表页';
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
          const listHtml = `<a href='/detail/${data.id}' target='_blank'>${
            data.title
          }</a>`;
          const editHtml = `<a href='/edit/${
            data.id
          }' target='_blank'>编辑</a>`;
          const deleteHtml = `<button onclick="deleteBlog(${
            data.id
          })">删除</button>`;
          return `<li id="list-${
            data.id
          }">${listHtml}&nbsp;&nbsp;${editHtml}&nbsp;&nbsp;${deleteHtml}</li>`;
        })
        .join('') +
      '</ol>';
    res.write(template(header, html));
  } else {
    res.write(template(header, `${title}<p>暂无博客</p>`));
  }
  req.on('data', function(e) {
    console.log('problem with request: ' + e.message);
  });
  res.end('<a href="/edit">添加博客</a>');
}
function detailController(req, res, pathname) {
  const id = getIdFromPathname(pathname);
  const blog = id && data.find(blog => blog.id === id);
  if (blog) {
    res.writeHead(200, { 'content-type': 'text/html;charset=utf-8' }); // 写响应头
    res.end(`<h1>${escapeHtml(blog.title)}</h1>${escapeHtml(blog.content)}`);
  }

  // 根据 id 找不到博客，就直接 404
  return notFoundController(req, res);
}
function showEditPage(req, res, blog) {
  res.writeHead(200, { 'content-type': 'text/html;charset=utf-8' });
  res.end(`
      <script>
        function submitBlog() {
          var title = document.getElementById('title');
          var content = document.getElementById('content');
          if (!title || !content) return alert('数据不能为空');
  
          // 发个异步请求
          var xhr = new XMLHttpRequest();
          xhr.open('POST', '/edit${blog ? `/${blog.id}` : ''}');
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
    `);
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
      const plainText = Buffer.concat(chunks, len).toString();

      // 将数据返回
      resolve(JSON.parse(plainText));
    })
  );
}

// 博客编辑接口
let uniqId = 0;
async function submitBlog(req, res, blog) {
  // 获取请求数据
  const datas = await getDataFromReq(req);
  if (blog && blog.id) {
    // 有 id ，说明是更新博文
    blog.title = datas.title;
    blog.content = datas.content;
  } else {
    // 无 id，说明是添加新博文
    blog = {
      id: `${Date.now()}${uniqId++}`, // 以时间戳作为 id
      title: datas.title,
      content: datas.content,
    };
    data.push(blog);
  }
  // 这里的 content-type 就是写 json 的 mime
  res.writeHead(200, { 'content-type': 'application/json;charset=utf-8' });
  res.end(JSON.stringify({ id: blog.id }));
}


function editController(req, res, pathname) {
  const id = getIdFromPathname(pathname);
  const blog = id && data.find(blog => blog.id === id);
  if (req.method === 'GET') {
    // 展示博文编辑页
    return showEditPage(req, res, blog);
  } else if (req.method === 'POST') {
    // 提交博文更改
    return submitBlog(req, res, blog);
  }

  // 其他情况全部 404
  notFoundController(req, res);
}

function deleteJson(id) {
  fs.readFile('./blog.json', function(err, data) {
    if (err) {
      return console.error(err);
    }
    const blog = data.toString();
    console.log('斯琪测试', blog);
    // 把数据读出来删除
    for (let i = 0; i < blog.length; i++) {
      if (id === blog[i].id) {
        blog.splice(i, 1);
      }
    }
    const str = JSON.stringify(blog);
    console.log(str);
    // 然后再把数据写进去
    fs.writeFile('./blog.json', str, function(err) {
      if (err) {
        console.error(err);
      }
      console.log('删除成功');
    });
  });
}
function getDeletePage(req, res, blog) {
  // console.info(blog);
  if (blog && blog.id) {
    // console.info(2323232);
    deleteJson(blog.id);
  }
  //   console.info(2);
  res.writeHead(200, { 'content-type': 'application/json;charset=utf-8' });
  res.end('删除成功');
}
async function postDeletePage(req, res) {
  const datas = await getDataFromReq(req);
  if (datas && datas.id) {
    deleteJson(datas.id);
  }
  res.writeHead(200, { 'content-type': 'application/json;charset=utf-8' });
  res.end('删除成功');
}
function deleteController(req, res) {
  const id = require('querystring').parse(url.parse(req.url).query).id;
  const blog = id && data.find(blog => blog.id === id);
  if (req.method === 'GET') {
    // get 删除
    return getDeletePage(req, res, blog);
  } else if (req.method === 'POST') {
    // post 删除
    return postDeletePage(req, res);
  }
  // 其他情况全部 404
  notFoundController(req, res);
}

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  if (pathname === '/') {
    // 博客首页
    return indexController(req, res);
  } else if (pathname.startsWith('/detail')) {
    // 博客详情页
    return detailController(req, res, pathname);
  } else if (pathname.startsWith('/edit')) {
    // 博客编辑页
    return editController(req, res, pathname);
  } else if (pathname.startsWith('/delete')) {
    return deleteController(req, res, pathname);
  }

  // 404 页面
  notFoundController(req, res);
});
// exports.router = router;
server.listen(3000, () => {
  // 服务启动完成的时候会触发该回调，打印日志
  console.info('server listening in', server.address().port);
});
