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

// OUTPUT:
/*
{ 
  id: 2,
  roles: [ 'developer', 'admin' ],
  name: 'Person2',
  color: 'red',
  birthdate: 533444400000,
  another: 'property from A'
}
*/

console.log(differify.applyLeftChanges(diff));

/*
{ 
  id: 1,
  roles: [ 'developer', 'admin' ],
  name: 'Person1',
  color: 'red',
  birthdate: 440305200000,
  another: 'property from A' 
}
*/

console.log(differify.applyLeftChanges(diff, true));


/* 
JUST the diff (note that there is NO color
property and NO 'development' element (in the
'roles' property), because both properties has
the same value in both entities)

{ 
  id: 1,
  roles: [ 'admin' ],
  name: 'Person1',
  birthdate: 440305200000,
  another: 'property from A' 
}

*/