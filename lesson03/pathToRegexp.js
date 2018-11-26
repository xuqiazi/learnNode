// function pathToRegexp(rule) {
//   const keys = [];
//   const regExpStr = rule
//     .replace(/\(/, '(?:') // 将 (xxx) 转换成 (?:xxx)，以防被捕获
//     .replace(/\/:(\w+)/, (_, k) => {
//       // 将 /:id 转成 /(\\w+)
//       console.log(_, k);
//       keys.push(k); // 将 id 这个字符塞入到 keys 中，以便后面匹配到的值跟 key 对得上
//       return '/(\\w+)';
//     })
//     .replace(/\*/, '.*'); // 将 * 转换成 .*

//   return {
//     ruleRE: new RegExp(`^${regExpStr}$`), // 将上面转换后的正则字符，转换成正则
//     keys
//   };
// }
// const rules = '/detail/:id';

// pathToRegexp(rules);
// 1，撰写路由规则的匹配
// 2，思路是首先你想要匹配的形式是什么，整理出来的情况是，需要匹配的pathname 是‘detail/123’,'edit/123','edit/'
// 3，撰写路由规则的匹配首先要满足我可以配置前面文件夹部分，后面的数字部分是通过keys去提取。'/detail/:id'
// 4，将 (xxx) 转换成 (?:xxx)，以防被捕获
// 5，将 /:id 转成 /(\\w+)
// 6，将 id 这个字符塞入到 keys 中，以便后面匹配到的值跟 key 对得上
// 7，将 * 转换成 .*
// 8，将上面转换后的正则字符，转换成正则

function pathToRegexp(rule) {
  const keys = [];
  const regExpStr = rule
  .replace('/(/', '(?:')
  .replace('/\/\:(\w+)/',(_,k)=>{
      keys.push(k);
      return('/(\\w+)');
  }).replace('/\*/','.*');

  return{
      ruleRE:new RegExp(`^$${regExpStr}$`),
      keys
  }
}



