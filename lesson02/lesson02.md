#lesson02 相关基础知识

## 正则捕获组

```
const matches = pathname.match(/^\/\w+\/(\d+)$/);
return matches ? matches[1] : null;
```
捕获组的意思为捕获第几个()组里面的内容。比如头部匹配链接后面的数字部分，把数字部分取出。

## XSS 防护

在博客页有标题以及内容可供用户编写，如果输入的内容不经过处理，用户就可以编辑为`<script>alert('hahahhaha')</script>`;这种形式。
为了防止注入，对一些方法为将某些敏感数据用正则进行转义；


## http 请求get和post 的区别

get请求的数据为拼接在请求链接上的query，发的是queryString，基本上只能提供一层key和value

post可以提交payload，数据可以多样化

## es6 array.prototype.find()

方法返回数组中满足提供的测试函数的第一个元素的值。否则返回 undefined
`data.find(blog => blog.id === id)`
从数据中读取是否有这个id 的，有的话返回该值
延伸方法 `Array.findIndex()`findIndex()方法返回数组中满足提供的测试函数的第一个元素的索引。否则返回-1。

## Buffer.concat

Buffer 类用于在 TCP 流或文件系统操作等场景中处理字节流。
Buffer 类的实例类似于整数数组，但 Buffer 的大小是固定的、且在 V8 堆外分配物理内存。 Buffer 的大小在创建时确定，且无法改变。
Buffer 类是一个全局变量，使用时无需 require('buffer').Buffer。

`Buffer.concat(chunks, len).toString()`

返回一个合并了 list 中所有 Buffer 的新 Buffer。
如果 list 中没有元素、或 totalLength 为 0，则返回一个长度为 0 的 Buffer。
如果没有指定 totalLength，则计算 list 中的 Buffer 的总长度。
如果 list 中的 Buffer 的总长度大于 totalLength，则合并后的 Buffer 会被截断到 totalLength 的长度。

## Promise


Promise 本质上是一个绑定了回调的对象，而不是将回调传进函数内部。
## fs

文件路径

`fs.writeFile(file, data[, options], callback)`

```
const data = new Uint8Array(Buffer.from('Node.js中文网'));
fs.writeFile('文件名.txt', data, (err) => {
  if (err) throw err;
  console.log('文件已保存');
});
```
`fs.readFile(path[, options], callback)`

```
fs.readFile('/etc/passwd', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```
## eval

eval() 函数会将传入的字符串当做 JavaScript 代码进行执行。
## JSON.stringify()  JSON.parse() 


`JSON.stringify(value[, replacer[, space]])`
JSON.stringify() 方法是将一个JavaScript值(对象或者数组)转换为一个 JSON字符串，如果指定了replacer是一个函数，则可以替换值，或者如果指定了replacer是一个数组，可选的仅包括指定的属性。

`JSON.parse(text[, reviver])`
JSON.parse() 方法用来解析JSON字符串，构造由字符串描述的JavaScript值或对象。提供可选的reviver函数用以在返回之前对所得到的对象执行变换(操作)。