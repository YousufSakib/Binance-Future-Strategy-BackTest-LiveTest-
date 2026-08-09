const arr = [ { a: 1, b: 2 } ];

const obj = arr[0];
obj.a = 55;

const obj1 = {...obj, c: 3};
obj1.a = 99;

const obj2 = { ...arr[0], c: 3 }

console.log(obj, obj1, obj2)