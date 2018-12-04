async function hello() {
//   console.log('ddssdd');
  return await new Promise(resolve => {
    // const status = 1;
    resolve(1);
  });

//   return hellohh;
//   console.log(hello1);
}
hello().then(function(data) {
  console.log(data);
});
// const heihei = hello();
// console.log(heihei);
