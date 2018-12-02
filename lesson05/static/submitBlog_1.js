const submitBlog = function() {
  const title = document.getElementById('title');
  const content = document.getElementById('content');
  const url = document.location.toString();
  // console.log(getIdFromPathname(url));
  if (!title || !content) {
    title.innerHTML = '数据不能为空';
  }
  console.log(title, content);
  // 发个异步请求
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      const resp = JSON.parse(xhr.responseText);
      // 提交完成，跳转到详情页
      if (resp.id) location.href = '/detail/' + resp.id;
    }
  };
  // 发送请求
  xhr.send(JSON.stringify({ title: title.value, content: content.value }));
};

const button = document.getElementsByTagName('button');

button.bind(submitBlog());
