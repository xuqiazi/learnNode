const submitBlog = function() {
  const title = document.getElementById('title');
  const content = document.getElementById('content');
  const url = document.location.toString();
  // console.log(getIdFromPathname(url));
  // if (!title || !content) {
  //   title.innerHTML = '数据不能为空';
  // }
  // const showtips = function(ele) {
  //   if (!ele.childNodes[1].value) {
  //     ele.childNodes[2].style.cssText = 'visibility:visible;';
  //   }
  // };
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
// function register() {
//   const xhr = new XMLHttpRequest();
//   const username = document.getElementById('username');
//   const nickname = document.getElementById('nickname');
//   const password = document.getElementById('password');
//   const exitTips = document.getElementsByTagName('span');
//   const p = document.getElementsByTagName('p');
//   const showtips = function(ele) {
//     if (!ele.childNodes[1].value) {
//       ele.childNodes[2].style.cssText = 'visibility:visible;';
//     }
//   };
//   if (username && nickname && password) {
//     xhr.open('POST', '/register');
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.onreadystatechange = function() {
//       if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
//         const resp = JSON.parse(xhr.responseText);
//         if (resp === 500) {
//           exitTips[0].innerHTML = '用户名已存在,请重新输入';
//         } else if (resp === 200) {
//           exitTips[0].innerHTML = '注册成功，现为你跳转登录页';
//           location.href = '/login';
//         }
//       }
//     };
//     xhr.send(
//       JSON.stringify({
//         username: username.value,
//         nickname: nickname.value,
//         password: password.value,
//       })
//     );
//   } else {
//     for (let i = 0; i < p.length; i++) {
//       new showtips(p[i]);
//     }
//   }
// }
