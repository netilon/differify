const Differify = require('../index');
const differify = new Differify();

const A = {
  id: 1,
  role: 'developer',
  name: 'Person1',
  birthdate: 440305200000,
};

const B = {
  id: 2,
  role: 'developer',
  name: 'Person2',
  birthdate: 533444400000,
};

const diff = differify.compare(A, B);

// easy access!

console.log(diff);
// console.log(
//   `Property name
//    status is: ${diff._.name.status}
// 	 prev value: ${diff._.name.original} and
// 	 the current: ${diff._.name.current}`
// );

// OUTPUT:
// Property name
// status is: MODIFIED
// prev value: Person1 and
// the current value: Person2
