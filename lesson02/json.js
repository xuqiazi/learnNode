const json1=JSON.stringify({});                        // '{}'
const json2=JSON.stringify(true);                      // 'true'
const json3=JSON.stringify("foo");                     // '"foo"'
const json6=JSON.stringify([1, "false", false]);       // '[1,"false",false]'
const json7=JSON.stringify({ x: 5 });                  // '{"x":5}'

const json8=JSON.stringify({x: 5, y: 6});              
// "{"x":5,"y":6}"

const json9=JSON.stringify([new Number(1), new String("false"), new Boolean(false)]); 
// '[1,"false",false]'

const json10=JSON.stringify({x: undefined, y: Object, z: Symbol("")}); 
// '{}'

const json11=JSON.stringify([undefined, Object, Symbol("")]);          
// '[null,null,null]' 

const json12=JSON.stringify({[Symbol("foo")]: "foo"});                 
// '{}'

const json13=JSON.stringify({[Symbol.for("foo")]: "foo"}, [Symbol.for("foo")]);
// '{}'

const json14=JSON.stringify(
    {[Symbol.for("foo")]: "foo"}, 
    function (k, v) {
        if (typeof k === "symbol"){
            return "a symbol";
        }
    }
);


// undefined 

// 不可枚举的属性默认会被忽略：
const json15=JSON.stringify( 
    Object.create(
        null, 
        { 
            x: { value: 'x', enumerable: false }, 
            y: { value: 'y', enumerable: true } 
        }
    )
);
console.log(json1,json2,json3,json6,json8,json9,json10,json11,json12,json13,json14,json15)