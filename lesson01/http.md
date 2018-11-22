# node-http
## http.createServer([options][, requestListener])

## http.ServerResponse
这个对象在 HTTP 服务器内部被创建。 作为第二个参数被传入 'request' 事件
### response.end([data][, encoding][, callback])
`res.end(function() {`
    `console.log("it's the end");`
  `}); `

如果指定了 data，则相当于调用 response.write(data, encoding) 之后再调用 response.end(callback)。如果指定了 callback，则当响应流结束时被调用。

`res.end("<h1>It's the ending.</h1>")`

该方法会通知服务器，所有响应头和响应主体都已被发送，即服务器将其视为已完成。 每次响应都必须调用 response.end() 方法。
### response.setHeader(name<string>, value<any>)
`response.setHeader('Content-Type', 'text/html');`

`response.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);`

为一个隐式的响应头设置值。 如果该响应头已存在，则值会被覆盖。 如果要发送多个名称相同的响应头，则使用字符串数组。 非字符串的值会保留原样，所以 response.getHeader() 会返回非字符串的值。 非字符串的值在网络传输时会转换为字符串。

response.setHeader() 设置的响应头会与 response.writeHead() 设置的响应头合并，且 response.writeHead() 的优先。

### response.writeHead(statusCode[, statusMessage][, headers])



## http-request
