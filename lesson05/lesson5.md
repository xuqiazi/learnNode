# lesson05 静态资源服务

    静态资源服务，主要把一些前端的hardcode放置到专门的静态资源服务中进行处理

## 静态资源中间件

    在数据处理中间件以及登录中间件之间进行静态资源处理，因为静态资源是不需要经过登录态验证的

    1，若pathname 匹配到static文件夹后将不再执行下面的中间件

    2，若校验资源不存在或者资源类型不存在则直接返回上一个中间件

    3，设置cxt.type

    4，进行资源缓存处理

## 资源缓存
   
    1，判断请求头的cache-control 是否为no-cache，若为nocache 则直接返回资源

    2，若no-cache 并且资源未过期，则设置304，代表请求已允许，但是请求文档内容没有更新

    3，判断资源未过期主要判断两个请求头，一个是if-none-match，主要是指客户端上次存储的Etag，作为if-none-match请求头返回给服务端

    4，另外一个是if-modified-since请求头的时间是否大于文件最后一次修改的时间。

    5，根据if-modified-since 以及 if-none-match 的判断 设置资源请求是否为304。

    6，若资源已过期，则重新设置last-modified 以及Etag Cache-Control的max-age值

    
## 大文件处理

    判断请求头里面的accept-encoding的编码是否包含gzip，若包含，则通过的node的zlib 进行资源压缩
    