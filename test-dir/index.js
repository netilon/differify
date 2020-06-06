const Differify = require('../index');

const differify = new Differify({
  compareArraysInOrder: false,
  mode: { object: 'DIFF', array: 'DIFF' },
});

const A = {
  id: 1,
  roles: ['admin', 'developer'],
  name: 'Person1',
  color: 'red',
  birthdate: 440305200000,
  another: 'property from A',
};

const B = {
  id: 2,
  roles: ['developer'],
  name: 'Person2',
  color: 'red',
  birthdate: 533444400000,
};

const diff = differify.compare(A, B);
console.log(JSON.stringify(diff));
console.log(differify.applyRightChanges(diff));
