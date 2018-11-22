const http = require('http'); //获取http
const hostname = '127.0.0.1'; //设置host
const port = 3000; //设置端口号
const url = require('url');

// 普通的http请求，包括请求头状态码，输入等
// const server = http.createServer(function(req, res) {
//   res.statusCode = 200;
//   res.setHeader('Content-type', 'text/html');
//   res.writeHead(404,{'Content-Type':'text/html'});
//   res.write('<h2>hello,siky</h2>')
//   res.end(function(){console.log("it's the end")});
// });
// 动态请求http，链接不同的pathname插入不同的文字
const server = http.createServer(function(req, res) {
  const pathname = url.parse(req.url).pathname;
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(pathname.substring(1));
});
server.listen(port, hostname, () => {
  console.log(`服务器运行在http://${hostname}:${port}`);
});
