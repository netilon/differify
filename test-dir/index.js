const Differify = require('../src/differify');

const differify = new Differify({
  compareArraysInOrder: true,
  mode: { object: 'DIFF', array: 'DIFF' },
});

const A = [
  {
    id: 155,
    phrase: "I was deleted",
  },
  {
    id: 156,
    phrase: "Can you help me with",
  },
  {
    id: 123,
    phrase: "Was edite",
  },
  {
    id: 157,
    phrase: "Help me with",
  },
]

const B = [
  {
    id: 156,
    phrase: "Can you help me with",
  },
  {
    id: 123,
    phrase: "Was edited",
  },
  {
    id: 88,
    phrase: "Was added in between",
  },
  {
    id: 157,
    phrase: "Help me with",
  },
]



const diff = differify.compare(A, B);
console.log(JSON.stringify(diff));
// console.log(differify.applyRightChanges(diff));
