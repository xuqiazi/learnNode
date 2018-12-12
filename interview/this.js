// const hello = () => {
//   console.log(this);
// };
// const hello2 = function() {
//   console.log(this);
// };
// hello();
// hello2();
// const abc = {
//   bbb() {
//     console.log(this);
//   },
// }
// ;
// const b = abc.bbb;
// b();
const a = {
  i: 1,
  toString() {
    return a.i++;
  },
};
if (a == 1 && a == 2 && a == 3) {
  console.log('Hello World!');
}
// let aﾠ = 1;
// let a = 2;
// let ﾠa = 3;
// if (aﾠ == 1 && a == 2 && ﾠa == 3) {
//   console.log('Why hello there!');
// }
// let val = 0;
// Object.defineProperty(window, 'a', {
//   get() {
//     return ++val;
//   },
// });
// if (a == 1 && a == 2 && a == 3) {
//   console.log('yay');
// }
