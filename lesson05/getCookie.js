const http = require('http');

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
const server = http.createServer(function(req, res) {
  const ctx = { req, res };
  // const key = ctx;
  ctx.res.writeHead(200, { 'Content-Type': 'text/html' });
  ctx.res.end(getCookie(ctx, '__session_id__'));
});

server.listen(8080, () => {
  // 服务启动完成的时候会触发该回调，打印日志
  console.info('server listening in', server.address().port);
});

module.exports = server;
