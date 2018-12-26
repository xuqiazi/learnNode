
function redirect(ctx, url) {
  // 设置重定向响应码
  ctx.status = 302;
  // JS 中重定向的设置 https://en.wikipedia.org/wiki/Server-side_redirect
  ctx.res.setHeader('Location', url);
  // url = escapeHtml(url);
  ctx.body = `Redirecting to <a href="${url}">${url}</a>`;
}

exports.redirect = redirect;

