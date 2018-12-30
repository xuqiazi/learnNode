## 一元正号

一元正号运算符位于其操作数前面，计算其操作数的数值，如果操作数不是一个数值，会尝试将其转换成一个数值。 尽管一元负号也能转换非数值类型，但是一元正号是转换其他对象到数值的最快方法，也是最推荐的做法，因为它不会对数值执行任何多余操作。它可以将字符串转换成整数和浮点数形式，也可以转换非字符串值 true，false 和 null。小数和十六进制格式字符串也可以转换成数值。负数形式字符串也可以转换成数值（对于十六进制不适用）。如果它不能解析一个值，则计算结果为 NaN.

## ~~操作符

其实本质上就是连做两次按位取反
可以比较方便的得到一个数的整形近似值相当于Math.floor();

## path.extname

返回 path 的扩展名，即从 path 的最后一部分中的最后一个 .（句号）字符到字符串结束。 如果 path 的最后一部分没有 . 或 path 的文件名（参考 path.basename()）的第一个字符是 .，则返回空字符串。

## fs.existsSync

如果文件存在，则返回 true，否则返回 false。(同步方法)

## fs.readFileSync

同步地读取文件的内容。

## fs.statSync

同步返回Stats类，stats 对象提供了文件的相关属性
比如文件信息的时间，atime访问时间,ctime变化时间,mtime修改时间,birthtime 文件创建时间

## HTTP强缓存，expires 和 cache-control

在http1.0 的时候，利用expires 来设置强缓存，服务器的响应头会返回expires作为资源的过期时间，浏览器重新请求时会将本机时间以及expires的时间戳作比较。

由于本机时间设置是有问题的，只要将本机时间改掉，那浏览器则一直可以不更新资源，所以在http1.0中增加了cache-control 字段来控制页面的强缓存信息

在Cache-Control中，我们通过 max-age 来控制资源的有效期。这个为一个时间长度，过了这个时间长度资源自动过期。

s-maxage 优先级高于 max-age，两者同时出现时，优先考虑 s-maxage。如果 s-maxage 未过期，则向代理服务器请求其缓存内容。

public 与 private 是针对资源是否能够被代理服务缓存而存在的一组对立概念。默认为private.

no-store与no-cache。no-cache 绕开了浏览器：我们为资源设置了 no-cache 后，每一次发起请求都不会再去询问浏览器的缓存情况，而是直接向服务端去确认该资源是否过期（即走我们下文即将讲解的协商缓存的路线）。no-store 比较绝情，顾名思义就是不使用任何缓存策略。在 no-cache 的基础上，它连服务端的缓存确认也绕开了，只允许你直接向服务端发送请求、并下载完整的响应。

## HTTP协商缓存 if-modified-since && Etag

if-modified-since 为上一次请求的响应头里面的last-modified的值，服务器接收到这个时间戳后，会比对该时间戳和资源在服务器上的最后修改时间是否一致，从而判断资源是否发生了变化。如果发生了变化，就会返回一个完整的响应内容，并在 Response Headers 中添加新的 Last-Modified 值；否则，返回如上图的 304 响应，Response Headers 不会再添加 Last-Modified 字段。

Etag 是由服务器为每个资源生成的唯一的标识字符串，这个标识字符串是基于文件内容编码的，只要文件内容不同，它们对应的 Etag 就是不同的，反之亦然。因此 Etag 能够精准地感知文件的变化。


## zlib&&zlib.createGzip

zlib模块提供通过 Gzip 和 Deflate/Inflate 实现的压缩功能
压缩或者解压数据流(例如一个文件)通过zlib流将源数据流传输到目标流中来完成。
```
const gzip = zlib.createGzip();
const fs = require('fs');
const inp = fs.createReadStream('input.txt');
const out = fs.createWriteStream('input.txt.gz');
inp.pipe(gzip).pipe(out);
```


zlib.createGzip:创建并返回一个带有给定 options 的新的 [Gzip][] 对象。




