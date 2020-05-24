const Differify = require('../index');


const differify = new Differify({ 
  mode: { object: 'DIFF', array: 'DIFF' } 
});

const A = {
  id: 1,
  roles: ['developer', 'admin'],
  name: 'Person1',
  color: 'red',
  birthdate: 440305200000,
  another: 'property from A'
};

const B = {
  id: 2,
  roles: ['developer'],
  name: 'Person2',
  color: 'red',
  birthdate: 533444400000
};

const diff = differify.compare(A, B);
console.log(differify.applyRightChanges(diff));
