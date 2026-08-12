const arr1 = [1, 2, 3];
const arr2 = [2, 4, 5];

arr2.push(...arr1);

console.log(arr1);
console.log(arr2);