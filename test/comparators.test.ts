import {
  JSONStringComparator,
  arraySimpleComparator,
  dateComparator,
  getConfiguredDeepObjectComparator,
  getConfiguredOrderedDeepArrayComparator,
  getConfiguredUnorderedDeepArrayComparator,
  toStringComparator,
  valueRefEqualityComparator,
} from '../src/comparators';
import comparatorSelector from '../src/comparator-selector';

let A = {};
let B = {};

const compSelector = comparatorSelector();

beforeEach(() => {
  A = {
    name: 'Fabian',
    age: 18,
    nested: {
      id: 1,
      roles: ['admin', 'user'],
    },
    hobbies: [
      { points: 10, desc: 'football soccer' },
      { points: 9, desc: 'programming' },
    ],
  };

  B = {
    name: 'Judith',
    age: 18,
    nested: {
      id: 2,
      roles: ['user'],
    },
    hobbies: [
      { points: 10, desc: 'dance' },
      { points: 9, desc: 'programming' },
    ],
  };
});

describe('Testing each comparator separately', () => {
  test('JSONStringComparator: should return JSON String comparison', () => {
    let res = JSONStringComparator(A, B);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('MODIFIED');
    expect(res.changes).toEqual(1);
    expect(res.original).toEqual(A);
    expect(res.current).toEqual(B);

    res = JSONStringComparator(A, A);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('EQUAL');
    expect(res.changes).toEqual(0);
    expect(res.original).toEqual(A);
    expect(res.current).toEqual(A);
  });
  test('toStringComparator: should return String comparison', () => {
    // returns equals because it checks the prototype.toString() of each object
    // and both are objects [object Object]
    let res = toStringComparator(A, B);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('EQUAL');
    expect(res.changes).toEqual(0);
    expect(res.original).toEqual(A);
    expect(res.current).toEqual(B);

    res = toStringComparator(A, A);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('EQUAL');
    expect(res.changes).toEqual(0);
    expect(res.original).toEqual(A);
    expect(res.current).toEqual(A);

    const C = function C() {};
    res = toStringComparator(A, C);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('MODIFIED');
    expect(res.changes).toEqual(1);
    expect(res.original).toEqual(A);
    expect(res.current).toEqual(C);
  });

  test('arraySimpleComparator: should return JSON String comparison between arrays', () => {
    let res = arraySimpleComparator([A], [B]);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('MODIFIED');
    expect(res.changes).toEqual(1);
    expect(res.original).toEqual([A]);
    expect(res.current).toEqual([B]);

    res = arraySimpleComparator([A], [A]);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('EQUAL');
    expect(res.changes).toEqual(0);
    expect(res.original).toEqual([A]);
    expect(res.current).toEqual([A]);
  });

  test('dateComparator: should return JSON String comparison between arrays', () => {
    const dateA = new Date();
    const dateB = new Date();
    dateB.setDate(dateA.getDate() + 1);

    let res = dateComparator(dateA, dateB);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('MODIFIED');
    expect(res.changes).toEqual(1);
    expect(res.original).toEqual(dateA);
    expect(res.current).toEqual(dateB);

    dateB.setDate(dateA.getDate());

    res = dateComparator(dateA, dateB);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('EQUAL');
    expect(res.changes).toEqual(0);
    expect(res.original).toEqual(dateA);
    expect(res.current).toEqual(dateB);
  });

  test('valueRefEqualityComparator: should return reference or value comparison', () => {
    let res = valueRefEqualityComparator(A, B);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('MODIFIED');
    expect(res.changes).toEqual(1);
    expect(res.original).toEqual(A);
    expect(res.current).toEqual(B);

    res = valueRefEqualityComparator(A, A);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('EQUAL');
    expect(res.changes).toEqual(0);
    expect(res.original).toEqual(A);
    expect(res.current).toEqual(A);

    res = valueRefEqualityComparator(B, B);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('EQUAL');
    expect(res.changes).toEqual(0);
    expect(res.original).toEqual(B);
    expect(res.current).toEqual(B);

    res = valueRefEqualityComparator(1, 2);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('MODIFIED');
    expect(res.changes).toEqual(1);
    expect(res.original).toEqual(1);
    expect(res.current).toEqual(2);

    res = valueRefEqualityComparator(1, 1);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('EQUAL');
    expect(res.changes).toEqual(0);
    expect(res.original).toEqual(1);
    expect(res.current).toEqual(1);

    res = valueRefEqualityComparator([], []);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('MODIFIED');
    expect(res.changes).toEqual(1);
    expect(res.original).toEqual([]);
    expect(res.current).toEqual([]);

    var sameArr = [];
    res = valueRefEqualityComparator(sameArr, sameArr);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('EQUAL');
    expect(res.changes).toEqual(0);
    expect(res.original).toEqual(sameArr);
    expect(res.current).toEqual(sameArr);
  });

  test('deepObjectComparator: should return a deep object comparison', () => {
    compSelector.configure({
      compareArraysInOrder: true, //default value
      mode: { object: 'DIFF', array: 'DIFF' },
    });

    const deepObjectComparator = getConfiguredDeepObjectComparator(
      compSelector.multipleComparatorSelector
    );

    const res = deepObjectComparator(A, B);

    expect(res).not.toBe(null);
    expect(res.status).toEqual('MODIFIED');
    expect(res.changes).toEqual(5);
    expect(res._).not.toBe(null);
    expect(res._.age).not.toBe(null);
    expect(res._.age.original).toBe(A.age);
    expect(res._.age.current).toBe(B.age);
    expect(res._.name).not.toBe(null);
    expect(res._.name.original).toBe(A.name);
    expect(res._.name.current).toBe(B.name);
    expect(res._.nested).not.toBe(null);
    expect(res._.nested._).not.toBe(null);
    expect(res._.nested._.id.original).toBe(A.nested.id);
    expect(res._.nested._.id.current).toBe(B.nested.id);
    //Object
    expect(res._.nested._.roles._).not.toBe(null);
    expect(
      Object.prototype.toString.call(res._.nested._.roles._) ===
        '[object Array]'
    ).toBe(true);
    expect(res._.nested._.roles._.length).toBe(2);
    expect(res._.nested._.roles._[0].status).toBe('MODIFIED');
    expect(res._.nested._.roles._[0].changes).toBe(1);
    expect(res._.nested._.roles._[0].original).toBe(A.nested.roles[0]);
    expect(res._.nested._.roles._[0].current).toBe(B.nested.roles[0]);

    expect(res._.nested._.roles._[1].status).toBe('DELETED');
    expect(res._.nested._.roles._[1].changes).toBe(1);
    expect(res._.nested._.roles._[1].original).toBe(A.nested.roles[1]);
    expect(res._.nested._.roles._[1].current).toBe(null);

    //Array
    expect(res._.hobbies._).not.toBe(null);
    expect(
      Object.prototype.toString.call(res._.hobbies._) === '[object Array]'
    ).toBe(true);
    expect(res._.hobbies._.length).toBe(2);
    expect(res._.hobbies._[0].status).toBe('MODIFIED');
    expect(res._.hobbies._[0].changes).toBe(1);
    expect(res._.hobbies._[0]._.points.original).toBe(A.hobbies[0].points);
    expect(res._.hobbies._[0]._.points.current).toBe(B.hobbies[0].points);
    expect(res._.hobbies._[0]._.points.status).toBe('EQUAL');
    expect(res._.hobbies._[0]._.points.changes).toBe(0);
    expect(res._.hobbies._[0]._.desc.original).toBe(A.hobbies[0].desc);
    expect(res._.hobbies._[0]._.desc.current).toBe(B.hobbies[0].desc);
    expect(res._.hobbies._[0]._.desc.status).toBe('MODIFIED');
    expect(res._.hobbies._[0]._.desc.changes).toBe(1);
    expect(res._.hobbies._[1].status).toBe('EQUAL');
    expect(res._.hobbies._[1].changes).toBe(0);
    expect(res._.hobbies._[1]._.points.original).toBe(A.hobbies[1].points);
    expect(res._.hobbies._[1]._.points.current).toBe(B.hobbies[1].points);
    expect(res._.hobbies._[1]._.points.status).toBe('EQUAL');
    expect(res._.hobbies._[1]._.points.changes).toBe(0);
    expect(res._.hobbies._[1]._.desc.original).toBe(A.hobbies[1].desc);
    expect(res._.hobbies._[1]._.desc.current).toBe(B.hobbies[1].desc);
    expect(res._.hobbies._[1]._.desc.status).toBe('EQUAL');
    expect(res._.hobbies._[1]._.desc.changes).toBe(0);
  });

  test('getConfiguredOrderedDeepArrayComparator: should return a deep array ORDERED comparison', () => {
    compSelector.configure({
      compareArraysInOrder: true, //default value
      mode: { object: 'DIFF', array: 'DIFF' },
    });

    const orderedDeepArrayComparator = getConfiguredOrderedDeepArrayComparator(
      compSelector.multipleComparatorSelector
    );

    const res = orderedDeepArrayComparator(A.hobbies, B.hobbies);

    expect(res._).not.toBe(null);
    expect(Object.prototype.toString.call(res._) === '[object Array]').toBe(
      true
    );
    expect(res._.length).toBe(2);
    expect(res._[0].status).toBe('MODIFIED');
    expect(res._[0].changes).toBe(1);
    expect(res._[0]._.points.original).toBe(A.hobbies[0].points);
    expect(res._[0]._.points.current).toBe(B.hobbies[0].points);
    expect(res._[0]._.points.status).toBe('EQUAL');
    expect(res._[0]._.points.changes).toBe(0);
    expect(res._[0]._.desc.original).toBe(A.hobbies[0].desc);
    expect(res._[0]._.desc.current).toBe(B.hobbies[0].desc);
    expect(res._[0]._.desc.status).toBe('MODIFIED');
    expect(res._[0]._.desc.changes).toBe(1);
    expect(res._[1].status).toBe('EQUAL');
    expect(res._[1].changes).toBe(0);
    expect(res._[1]._.points.original).toBe(A.hobbies[1].points);
    expect(res._[1]._.points.current).toBe(B.hobbies[1].points);
    expect(res._[1]._.points.status).toBe('EQUAL');
    expect(res._[1]._.points.changes).toBe(0);
    expect(res._[1]._.desc.original).toBe(A.hobbies[1].desc);
    expect(res._[1]._.desc.current).toBe(B.hobbies[1].desc);
    expect(res._[1]._.desc.status).toBe('EQUAL');
    expect(res._[1]._.desc.changes).toBe(0);
  });
  test('getConfiguredUnorderedDeepArrayComparator: should return a deep array UNORDERED comparison', () => {
    // for unordered array comparison, is not possible to go deeper
    // when array elements are objects, because there is no way
    // to know wich object in the A array is related to another object
    // in the B array. TODO: make a relateElementsBy? to match elements?
    compSelector.configure({
      compareArraysInOrder: false, //default value
      mode: { object: 'DIFF', array: 'DIFF' },
    });

    const unorderedDeepArrayComparator = getConfiguredUnorderedDeepArrayComparator(
      compSelector.multipleComparatorSelector
    );

    let res = unorderedDeepArrayComparator(A.hobbies, B.hobbies);

    expect(res._).not.toBe(null);
    expect(Object.prototype.toString.call(res._) === '[object Array]').toBe(
      true
    );

    expect(res._.length).toBe(2);
    expect(res.status).toBe('MODIFIED');

    expect(res._[0].changes).toBe(0);

    expect(res._[0]._.points.original).toBe(A.hobbies[1].points);
    expect(res._[0]._.points.current).toBe(B.hobbies[1].points);
    expect(res._[0]._.points.changes).toBe(0);
    expect(res._[0]._.points.status).toBe('EQUAL');
    expect(res._[0]._.desc.original).toBe(A.hobbies[1].desc);
    expect(res._[0]._.desc.current).toBe(B.hobbies[1].desc);
    expect(res._[0]._.desc.changes).toBe(0);
    expect(res._[0]._.desc.status).toBe('EQUAL');

    expect(res._[1]._.points.original).toBe(A.hobbies[0].points);
    expect(res._[1]._.points.current).toBe(B.hobbies[0].points);
    expect(res._[1]._.points.changes).toBe(0);
    expect(res._[1]._.points.status).toBe('EQUAL');
    expect(res._[1]._.desc.original).toBe(A.hobbies[0].desc);
    expect(res._[1]._.desc.current).toBe(B.hobbies[0].desc);
    expect(res._[1]._.desc.changes).toBe(1);
    expect(res._[1]._.desc.status).toBe('MODIFIED');
  });
});
