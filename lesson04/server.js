const { app } = require('./middleware');
const http = require('http');
const server = http.createServer((req, res) => {
  app.handle(req, res);
});

// 监听 3000 端口
server.listen(3000, () => {
  // 服务启动完成的时候会触发该回调，打印日志
  console.info('server listening in', server.address().port);
});
