const Differify = require('./src/differify');

const differify = new Differify({ mode: { object: 'DIFF', array: 'STRING', function: 'REFERENCE' } });

// Object to be compared
const A = {
  id: 1,
  role: 'developer',
  name: 'Person1',
  birthdate: 440305200000,
};

// Object to be compared
const B = {
  id: 2,
  role: 'developer',
  name: 'Person2',
  birthdate: 533444400000,
};

const testA = [1,2];
    const testB = [1,3];
const diff = differify.compare([], []);





















// get Diff!
// const diff = differify.getDiff(Object.create(null), B);
const start = Date.now();
console.log(JSON.stringify(diff));
console.log('Time: ', Date.now() - start);

// {
//   id: 1,
//   name: 'Leanne Graham',
//   username: 'Bret',
//   email: 'Sincere@april.biz',
//   address: {
//     street: 'Kulas Light',
//     suite: 'Apt. 556',
//     city: 'Gwenborough',
//     zipcode: '92998-3874',
//     geo: {
//       lat: '-37.3159',
//       lng: '81.1496',
//     },
//   },
//   phone: '1-770-736-8031 x56442',
//   website: 'hildegard.org',
//   company: {
//     name: 'Romaguera-Crona',
//     catchPhrase: 'Multi-layered client-server neural-net',
//     bs: 'harness real-time e-markets',
//   },
// },
// {
//   id: 2,
//   name: 'Ervin Howell',
//   username: 'Antonette',
//   email: 'Shanna@melissa.tv',
//   address: {
//     street: 'Victor Plains',
//     suite: 'Suite 879',
//     city: 'Wisokyburgh',
//     zipcode: '90566-7771',
//     geo: {
//       lat: '-43.9509',
//       lng: '-34.4618',
//     },
//   },
//   phone: '010-692-6593 x09125',
//   website: 'anastasia.net',
//   company: {
//     name: 'Deckow-Crist',
//     catchPhrase: 'Proactive didactic contingency',
//     bs: 'synergize scalable supply-chains',
//   },
// }

// console.log(JSON.stringify(diff));

// const start = Date.now();
// console.log(JSON.stringify());
// console.log('Time: ', Date.now() - start);

//typeof avg 11
//Object.prototype.toString.call avg 160
