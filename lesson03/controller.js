const { template } = require('./template');
const data = require('./blog.json');
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
  console.log('已经进来拉');
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
      '</ol><a href="/edit">添加博客</a>';
    ctx.body += template(header, html);
  } else {
    ctx.body += template(header, `${title}<p>暂无博客</p><a href="/edit">添加博客</a>`);
  }
  // console.log(ctx.body);
  // ctx.req.on('data', function(e) {
  //   console.log('problem with request: ' + e.message);
  // });
}
function detailController(ctx) {
  const id = ctx.params.id;
  const blog = id && data.find(blog => blog.id === id);
  const header = `${blog.title}`;
  const html = `<h1>${escapeHtml(blog.title)}</h1>${escapeHtml(blog.content)}`;
  if (blog) {
    ctx.body += template(header, html);
  }
}
// 博客编辑接口
let uniqId = 0;
async function submitBlog(ctx) {
  // 获取请求数据
  const datas = ctx.requestBody;
  const id = ctx.params.id;
  let blog = id && data.find(blog => blog.id === id);
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
  ctx.type = 'json';
  ctx.body = { id: blog.id };
}

function showEditPage(ctx) {
  const id = ctx.params.id;
  const blog = id && data.find(blog => blog.id === id);
  const header = '博客编辑页';
  const html = `
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
`;
  ctx.body += template(header, html);
}

exports.indexController = indexController;
exports.detailController = detailController;
exports.showEditPage = showEditPage;
exports.submitBlog = submitBlog;
