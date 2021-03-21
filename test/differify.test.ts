import Differify from '../src/differify';
import PROPERTY_STATUS from '../src/enums/property-status';
import DIFF_MODES from '../src/enums/modes';
const differify = new Differify();

describe('Testing differify lib: ', () => {
  const getAObject = () => ({
    name: 'Judith',
    age: 33,
    friends: ['Cecilia', 'Stephanie'],
    extras: {
      hobbies: ['Gym', 'Dance'],
    },
    date: new Date(),
  });

  const getBObject = () => ({
    name: 'Fabian',
    age: 36,
    friends: ['Finn', 'Jake'],
    extras: {
      hobbies: ['Football Soccer', 'Programming'],
    },
    date: new Date('12/15/1983 12:00:00'),
  });

  test('testing bad config arguments', () => {
    differify.setConfig({
      compareArraysInOrder: null,
      mode: { array: null, object: true },
    });
    let config = differify.getConfig();
    expect(typeof config.compareArraysInOrder).toEqual('boolean');
    expect(config.compareArraysInOrder).toBeTruthy();
    expect(config.mode.array).toEqual('DIFF');
    expect(config.mode.object).toEqual('DIFF');
    expect(config.mode.function).toEqual('REFERENCE');
  });

  test('testing case insensitive config arguments', () => {
    differify.setConfig({
      mode: { array: 'diff', object: 'string', function: 'string' },
    });
    const config = differify.getConfig();
    expect(config.mode.array).toEqual('DIFF');
    expect(config.mode.object).toEqual('STRING');
    expect(config.mode.function).toEqual('STRING');
  });

  test('testing empty config', () => {
    differify.setConfig();
    let config = differify.getConfig();
    expect(typeof config.compareArraysInOrder).toEqual('boolean');
    expect(config.compareArraysInOrder).toBeTruthy();
    expect(config.mode.array).toEqual('DIFF');
    expect(config.mode.object).toEqual('DIFF');
    expect(config.mode.function).toEqual('REFERENCE');
  });

  test('testing multiple instance config', () => {
    const diff = new Differify({
      mode: {
        object: DIFF_MODES.DIFF,
        array: DIFF_MODES.DIFF,
      },
    });

    const diff2 = new Differify({
      compareArraysInOrder: false,
      mode: {
        object: DIFF_MODES.DIFF,
        array: DIFF_MODES.STRING,
      },
    });

    expect(JSON.stringify(diff.getConfig())).toBe(
      JSON.stringify({
        compareArraysInOrder: true,
        mode: { array: 'DIFF', object: 'DIFF', function: 'REFERENCE' },
      })
    );
    expect(JSON.stringify(diff2.getConfig())).toBe(
      JSON.stringify({
        compareArraysInOrder: false,
        mode: { array: 'STRING', object: 'DIFF', function: 'REFERENCE' },
      })
    );
  });

  test('testing incomplete config', () => {
    differify.setConfig({
      mode: {},
    });
    let config = differify.getConfig();
    expect(typeof config.compareArraysInOrder).toEqual('boolean');
    expect(config.compareArraysInOrder).toBeTruthy();
    expect(config.mode.array).toEqual('DIFF');
    expect(config.mode.object).toEqual('DIFF');
    expect(config.mode.function).toEqual('REFERENCE');
  });

  test('testing good config', () => {
    differify.setConfig({
      compareArraysInOrder: false,
      mode: {
        array: 'DIFF',
        object: 'DIFF',
        function: 'STRING',
      },
    });
    let config = differify.getConfig();
    expect(typeof config.compareArraysInOrder).toEqual('boolean');
    expect(config.compareArraysInOrder).toBeFalsy();
    expect(config.mode.array).toEqual('DIFF');
    expect(config.mode.object).toEqual('DIFF');
    expect(config.mode.function).toEqual('STRING');
  });

  test('if no property match, should return null', () => {
    differify.setConfig({
      mode: {
        array: 'DIFF',
        object: 'DIFF',
        function: 'STRING',
      },
    });
    const diff = differify.compare(Object.create(null), getAObject());

    expect(diff._.name.status === PROPERTY_STATUS.ADDED).toBeTruthy();
    expect(diff._.name.original).toBe(null);
    expect(diff._.name.current).toBe('Judith');
    expect(diff._.date.status === PROPERTY_STATUS.ADDED).toBeTruthy();
    expect(diff._.date.original).toBe(null);
    expect(Object.prototype.toString.call(diff._.date.current)).toBe(
      '[object Date]'
    );
    expect(diff._.age.status === PROPERTY_STATUS.ADDED).toBeTruthy();
    expect(diff._.age.original).toBe(null);
    expect(diff._.age.current).toBe(33);
    expect(diff._.friends.status === PROPERTY_STATUS.ADDED).toBeTruthy();
    expect(diff._.friends.original).toBe(null);
    expect(Object.prototype.toString.call(diff._.friends.current)).toBe(
      '[object Array]'
    );
  });

  test('empty objects, should return EQUAL', () => {
    differify.setConfig({
      mode: {
        array: 'DIFF',
        object: 'DIFF',
        function: 'STRING',
      },
    });
    const diff = differify.compare({}, {});

    expect(diff.status === PROPERTY_STATUS.EQUAL).toBeTruthy();
    expect(diff.changes === 0).toBeTruthy();
    expect(diff._ === null).toBeTruthy();
  });

  test('empty array, should return an empty array', () => {
    differify.setConfig({
      mode: {
        array: 'DIFF',
        object: 'DIFF',
        function: 'STRING',
      },
    });
    const diff = differify.compare([], []);

    expect(
      Object.prototype.toString.call(diff._) === '[object Array]'
    ).toBeTruthy();
    expect(diff._.length).toBe(0);
    expect(diff.status).toBe(PROPERTY_STATUS.EQUAL);
    expect(diff.changes).toBe(0);
  });

  test('diff with no prototyped object', () => {
    differify.setConfig({
      mode: {
        array: 'DIFF',
        object: 'DIFF',
        function: 'STRING',
      },
    });

    let diff = differify.compare(Object.create(null), getAObject());

    expect(diff._.name.status === PROPERTY_STATUS.ADDED).toBeTruthy();
    expect(diff._.name.original).toBe(null);
    expect(diff._.name.current).toBe('Judith');
    expect(diff._.date.status === PROPERTY_STATUS.ADDED).toBeTruthy();
    expect(diff._.date.original).toBe(null);
    expect(Object.prototype.toString.call(diff._.date.current)).toBe(
      '[object Date]'
    );
    expect(diff._.age.status === PROPERTY_STATUS.ADDED).toBeTruthy();
    expect(diff._.age.original).toBe(null);
    expect(diff._.age.current).toBe(33);
    expect(diff._.friends.status === PROPERTY_STATUS.ADDED).toBeTruthy();
    expect(diff._.friends.original).toBe(null);
    expect(Object.prototype.toString.call(diff._.friends.current)).toBe(
      '[object Array]'
    );

    diff = differify.compare(getAObject(), Object.create(null));

    expect(diff._.name.status === 'DELETED').toBeTruthy();
    expect(diff._.name.current).toBe(null);
    expect(diff._.name.original).toBe('Judith');
    expect(diff._.date.status === 'DELETED').toBeTruthy();
    expect(diff._.date.current).toBe(null);
    expect(Object.prototype.toString.call(diff._.date.original)).toBe(
      '[object Date]'
    );
    expect(diff._.age.status === 'DELETED').toBeTruthy();
    expect(diff._.age.current).toBe(null);
    expect(diff._.age.original).toBe(33);
    expect(diff._.friends.status === 'DELETED').toBeTruthy();
    expect(diff._.friends.current).toBe(null);
    expect(Object.prototype.toString.call(diff._.friends.original)).toBe(
      '[object Array]'
    );
  });

  test('checking Date diff', () => {
    differify.setConfig({
      mode: {
        array: 'DIFF',
        object: 'DIFF',
        function: 'STRING',
      },
    });
    let a = new Date();
    let b = new Date(1983, 11, 15);

    let diff = differify.compare(a, b);

    expect(diff.status === PROPERTY_STATUS.MODIFIED).toBeTruthy();

    const newDate = new Date();
    a = newDate;
    b = newDate;
    diff = differify.compare(a, b);
    expect(diff.status === PROPERTY_STATUS.EQUAL).toBeTruthy();
  });

  test('checking Native values diff', () => {
    differify.setConfig({
      mode: {
        array: 'DIFF',
        object: 'DIFF',
        function: 'STRING',
      },
    });

    // NATIVE DIFF
    expect(
      differify.compare(1, 2).status === PROPERTY_STATUS.MODIFIED
    ).toBeTruthy();
    expect(
      differify.compare(true, false).status === PROPERTY_STATUS.MODIFIED
    ).toBeTruthy();
    expect(
      differify.compare(null, null).status === PROPERTY_STATUS.EQUAL
    ).toBeTruthy();
    expect(
      differify.compare(undefined, undefined).status === PROPERTY_STATUS.EQUAL
    ).toBeTruthy();
    expect(
      differify.compare('a', 'b').status === PROPERTY_STATUS.MODIFIED
    ).toBeTruthy();

    const newDate = new Date();
    const a = newDate;
    const b = newDate;
    const diff = differify.compare(a, b);
    expect(diff.status === PROPERTY_STATUS.EQUAL).toBeTruthy();
  });

  test('should return the diff between two entities with different typeof result', () => {
    differify.setConfig({
      mode: {
        array: 'DIFF',
        object: 'DIFF',
      },
    });

    const a = [1, 2, 3];
    const b = 1;
    let diff = differify.compare(a, b);

    expect(diff._).toBe(undefined);
    expect(diff.status).toBe(PROPERTY_STATUS.MODIFIED);
    expect(diff.changes).toBe(1);
    expect(diff.original).toBe(a);
    expect(diff.current).toBe(b);
  });
  test('should return null when the passed status is not a valid one', () => {
    differify.setConfig({
      mode: {
        array: 'DIFF',
        object: 'DIFF',
      },
    });

    const a = [1, 2, 3];
    const b = 1;
    const diff = differify.compare(a, b);
    let res = differify.filterDiffByStatus(diff, PROPERTY_STATUS.MODIFIED);
    expect(typeof res).toBe('object');
    expect(res.status).toBe(PROPERTY_STATUS.MODIFIED);
    expect(res.changes).toBe(1);
    expect(res.original).toBe(a);
    expect(res.current).toBe(b);

    res = differify.filterDiffByStatus(diff, null);
    expect(res).toBe(null);
  });

  test('applyChanges: should return undefined when the data passed in is not a valid property descriptor', () => {
    let res = differify.applyLeftChanges({ _: 1 }, true);
    expect(res).toBe(undefined);

    res = differify.applyRightChanges({ _: 1 }, true);
    expect(res).toBe(undefined);

    res = differify.applyLeftChanges(
      {
        _: {
          name: {
            original: 'Fabian',
            current: 'Fabian',
            status: PROPERTY_STATUS.EQUAL,
            changes: 0,
          },
        },
        status: PROPERTY_STATUS.EQUAL,
        changes: 0,
      },
      true
    );
    expect(res).toStrictEqual({});

    res = differify.applyLeftChanges(
      {
        current: 'Judith',
        original: 'Fabian',
        status: PROPERTY_STATUS.EQUAL,
        changes: 0,
      },
      true
    );
    expect(res).toBe('Fabian');

    res = differify.applyLeftChanges(
      {
        _: {
          name: {
            current: 'Fabian',
            original: 'Judith',
            status: PROPERTY_STATUS.MODIFIED,
            changes: 1,
          },
        },
      },
      true
    );
    expect(res).toStrictEqual({
      name: 'Judith',
    });

    res = differify.applyRightChanges(
      {
        _: {
          name: {
            current: 'Fabian',
            original: 'Judith',
            status: PROPERTY_STATUS.MODIFIED,
            changes: 1,
          },
        },
      },
      true
    );

    expect(res).toStrictEqual({
      name: 'Fabian',
    });

    res = differify.applyRightChanges(
      {
        current: 'Judith',
        original: 'Fabian',
        status: PROPERTY_STATUS.EQUAL,
        changes: 0,
      },
      true
    );
    expect(res).toBe('Judith');

    res = differify.applyRightChanges({}, true);
    expect(res).toBe(null);
  });

  test('compare different types input but same prototype', () => {
    differify.setConfig({
      mode: {
        array: 'DIFF',
        object: 'DIFF',
      },
    });

    const a = [1, 2, 3];
    const b = { a: 'foo', b: 'bar' };
    let diff = differify.compare(a, b);

    expect(diff.original).toBe(a);
    expect(diff.current).toBe(b);
    expect(diff.status).toBe(PROPERTY_STATUS.MODIFIED);
    expect(diff.changes).toBe(1);

    diff = differify.compare({ a: [1, 2, 3] }, { a: 'foo', b: 'bar' });
    expect(diff.changes).toBe(2);
    expect(diff._.a.changes).toBe(1);
    expect(diff._.a.status).toBe(PROPERTY_STATUS.MODIFIED);
    expect(JSON.stringify(diff._.a.original)).toBe(JSON.stringify([1, 2, 3]));
    expect(diff._.a.current).toBe('foo');
    expect(diff._.b.changes).toBe(1);
    expect(diff._.b.status).toBe(PROPERTY_STATUS.ADDED);
    expect(diff._.b.original).toBe(null);
    expect(diff._.b.current).toBe('bar');
  });

  test('Array comparission with ALL possible configurations', () => {
    // DIFF DIFF
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    const a = ['Hello', 'how', 'are', 'you'];
    const b = ['fine', 'and', 'you'];

    expect(Object.prototype.toString.call(differify.compare([], [])._)).toBe(
      '[object Array]'
    );
    expect(differify.compare([], [])._.length).toBe(0);

    let diff = differify.compare(a, b);

    expect(diff.status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff.changes === 4).toBeTruthy();
    expect(diff._[0].status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff._[1].status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff._[2].status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff._[3].status === 'DELETED').toBeTruthy();

    diff = differify.compare(b, a);

    expect(diff.status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff.changes === 4).toBeTruthy();
    expect(diff._[0].status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff._[1].status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff._[2].status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff._[3].status === PROPERTY_STATUS.ADDED).toBeTruthy();

    // DIFF EQ
    diff = differify.compare(a, a);

    expect(diff.status === PROPERTY_STATUS.EQUAL).toBeTruthy();
    expect(diff.changes === 0).toBeTruthy();
    expect(diff._[0].status === PROPERTY_STATUS.EQUAL).toBeTruthy();
    expect(diff._[1].status === PROPERTY_STATUS.EQUAL).toBeTruthy();
    expect(diff._[2].status === PROPERTY_STATUS.EQUAL).toBeTruthy();
    expect(diff._[3].status === PROPERTY_STATUS.EQUAL).toBeTruthy();

    // REFERENCE DIFF
    differify.setConfig({ mode: { object: 'DIFF', array: 'REFERENCE' } });
    diff = differify.compare(a, b);
    expect(diff.status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff.changes === 1).toBeTruthy();
    expect(diff._ === null).toBeTruthy();

    // REFERENCE EQ
    diff = differify.compare(a, a);
    expect(diff.status === PROPERTY_STATUS.EQUAL).toBeTruthy();
    expect(diff.changes === 0).toBeTruthy();

    // STRING DIFF
    differify.setConfig({ mode: { object: 'DIFF', array: 'STRING' } });
    diff = differify.compare(a, b);
    expect(diff.status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff.changes === 1).toBeTruthy();
    expect(differify.compare([], [])._ === null).toBeTruthy();

    // STRING EQ
    diff = differify.compare(a, a);
    expect(diff.status === PROPERTY_STATUS.EQUAL).toBeTruthy();
    expect(diff.changes === 0).toBeTruthy();
    expect(differify.compare([], [])._ === null).toBeTruthy();
  });

  test('Object comparission with ALL possible configurations', () => {
    // DIFF DIFF
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    let a = getAObject();
    let b = getBObject();

    expect(differify.compare({}, {})._).toBe(null);
    expect(differify.compare({}, {}).status).toBe(PROPERTY_STATUS.EQUAL);
    expect(differify.compare({}, {}).changes).toBe(0);

    let diff = differify.compare(a, b);
    expect(diff.status).toBe(PROPERTY_STATUS.MODIFIED);
    expect(diff.changes).toBe(7);
    expect(diff._.name.status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff._.age.status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    diff._.extras._.hobbies._.forEach((i) =>
      expect(i.status === PROPERTY_STATUS.MODIFIED).toBeTruthy()
    );
    expect(diff._.date.status === PROPERTY_STATUS.MODIFIED).toBeTruthy();

    // DIFF EQ
    a = getAObject();
    b = getAObject();
    b.date = a.date;
    diff = differify.compare(a, b);
    expect(diff.status).toBe(PROPERTY_STATUS.EQUAL);
    expect(diff.changes).toBe(0);
    expect(diff._.name.status === PROPERTY_STATUS.EQUAL).toBeTruthy();
    expect(diff._.age.status === PROPERTY_STATUS.EQUAL).toBeTruthy();
    diff._.extras._.hobbies._.forEach((i) =>
      expect(i.status === PROPERTY_STATUS.EQUAL).toBeTruthy()
    );
    expect(diff._.date.status === PROPERTY_STATUS.EQUAL).toBeTruthy();

    // REFERENCE DIFF
    differify.setConfig({ mode: { object: 'REFERENCE', array: 'REFERENCE' } });
    diff = differify.compare(getAObject(), getBObject());
    expect(diff.status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff.changes === 1).toBeTruthy();
    expect(
      differify.compare({}, {}).status === PROPERTY_STATUS.MODIFIED
    ).toBeTruthy();

    // REFERENCE EQ
    a = getAObject();
    b = a;
    diff = differify.compare(a, b);
    expect(diff.status === PROPERTY_STATUS.EQUAL).toBeTruthy();
    expect(diff.changes === 0).toBeTruthy();

    // STRING DIFF
    differify.setConfig({ mode: { object: 'STRING', array: 'STRING' } });
    diff = differify.compare(getAObject(), getBObject());
    expect(diff.status === PROPERTY_STATUS.MODIFIED).toBeTruthy();
    expect(diff.changes === 1).toBeTruthy();
    expect(
      differify.compare({}, {}).status === PROPERTY_STATUS.EQUAL
    ).toBeTruthy();

    // STRING EQ
    a = getAObject();
    b = a;
    diff = differify.compare(a, b);
    expect(diff.changes === 0).toBeTruthy();
    expect(diff.status === PROPERTY_STATUS.EQUAL).toBeTruthy();
  });

  test('test output for ALL object modes', () => {
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    const a = getAObject();
    a.date = 1589657835225;
    const b = getBObject();
    b.date = 1589657835225;

    expect(JSON.stringify(differify.compare(a, b))).toBe(
      '{"_":{"name":{"original":"Judith","current":"Fabian","status":"MODIFIED","changes":1},"age":{"original":33,"current":36,"status":"MODIFIED","changes":1},"friends":{"_":[{"original":"Cecilia","current":"Finn","status":"MODIFIED","changes":1},{"original":"Stephanie","current":"Jake","status":"MODIFIED","changes":1}],"status":"MODIFIED","changes":2},"extras":{"_":{"hobbies":{"_":[{"original":"Gym","current":"Football Soccer","status":"MODIFIED","changes":1},{"original":"Dance","current":"Programming","status":"MODIFIED","changes":1}],"status":"MODIFIED","changes":2}},"status":"MODIFIED","changes":2},"date":{"original":1589657835225,"current":1589657835225,"status":"EQUAL","changes":0}},"status":"MODIFIED","changes":6}'
    );

    differify.setConfig({ mode: { object: 'REFERENCE' } });

    expect(JSON.stringify(differify.compare(a, b))).toBe(
      '{"_":null,"status":"MODIFIED","changes":1}'
    );

    differify.setConfig({ mode: { object: 'STRING' } });

    expect(JSON.stringify(differify.compare(a, b))).toBe(
      '{"_":null,"status":"MODIFIED","changes":1}'
    );
  });

  test('test output for ALL array modes', () => {
    const a = [1, 2, 3, 4, 5];
    const b = [1, 2, 4, 6, 8, 10];

    differify.setConfig({ mode: { array: 'DIFF' } });
    expect(JSON.stringify(differify.compare(a, b))).toBe(
      '{"_":[{"original":1,"current":1,"status":"EQUAL","changes":0},{"original":2,"current":2,"status":"EQUAL","changes":0},{"original":3,"current":4,"status":"MODIFIED","changes":1},{"original":4,"current":6,"status":"MODIFIED","changes":1},{"original":5,"current":8,"status":"MODIFIED","changes":1},{"original":null,"current":10,"status":"ADDED","changes":1}],"status":"MODIFIED","changes":4}'
    );

    differify.setConfig({ mode: { array: 'REFERENCE', object: 'REFERENCE' } });

    expect(JSON.stringify(differify.compare(getAObject(), getBObject()))).toBe(
      '{"_":null,"status":"MODIFIED","changes":1}'
    );

    differify.setConfig({ mode: { array: 'STRING', object: 'REFERENCE' } });

    expect(JSON.stringify(differify.compare(getAObject(), getBObject()))).toBe(
      '{"_":null,"status":"MODIFIED","changes":1}'
    );
  });

  test('should merge right changes properly', () => {
    const A = {
      id: 1,
      roles: ['developer'],
      name: 'Person1',
      hobbies: {
        a: 'futbol',
        b: [{ name: 'willy' }],
      },
      birthdate: 440305200000,
    };

    const B = {
      id: 2,
      roles: ['developer', 'admin'],
      name: 'Person2',
      hobbies: {
        a: 'dance',
        b: [{ name: 'willys' }],
      },
      birthdate: 533444400000,
    };
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });

    let diff = differify.compare(A, B);

    let merged = differify.applyRightChanges(diff);

    expect(merged.id).toBe(2);
    expect(merged.name).toBe('Person2');
    expect(merged.birthdate).toBe(533444400000);
    expect(merged.hobbies.a).toBe('dance');
    expect(Object.prototype.toString.call(merged.hobbies.b)).toBe(
      '[object Array]'
    );
    expect(merged.hobbies.b.length).toBe(1);
    expect(merged.hobbies.b[0].name).toBe('willys');

    diff = differify.compare({ a: 'a', b: 'b', c: 'c' }, { a: 'b', b: 'a' });
    merged = differify.applyRightChanges(diff);

    expect(merged.a).toBe('b');
    expect(merged.b).toBe('a');
    expect(merged.c).toBe('c');

    diff = differify.compare([1, 2, 3, 9], [4, 5, 6]);
    merged = differify.applyRightChanges(diff);

    expect(Object.prototype.toString.call(merged)).toBe('[object Array]');
    expect(merged.length).toBe(4);
    expect(merged[0]).toBe(4);
    expect(merged[1]).toBe(5);
    expect(merged[2]).toBe(6);
    expect(merged[3]).toBe(9);

    diff = differify.compare([1, 2], [4, 5, 6]);
    merged = differify.applyRightChanges(diff);

    expect(Object.prototype.toString.call(merged)).toBe('[object Array]');
    expect(merged.length).toBe(3);
    expect(merged[0]).toBe(4);
    expect(merged[1]).toBe(5);
    expect(merged[2]).toBe(6);

    differify.setConfig({
      ...differify.getConfig(),
      compareArraysInOrder: false,
    });
    diff = differify.compare([1, 2], [1, 4, 5, 6]);
    merged = differify.applyRightChanges(diff);

    expect(Object.prototype.toString.call(merged)).toBe('[object Array]');
    expect(merged.length).toBe(4);
    expect(merged[0]).toBe(1);
    expect(merged[1]).toBe(4);
    expect(merged[2]).toBe(5);
    expect(merged[3]).toBe(6);
  });

  test('should merge left changes properly', () => {
    const B = {
      id: 2,
      roles: ['developer', 'admin'],
      name: 'Person2',
      hobbies: {
        a: 'dance',
        b: [{ name: 'willys' }],
      },
      birthdate: 533444400000,
    };

    const A = {
      id: 1,
      roles: ['developer'],
      name: 'Person1',
      hobbies: {
        a: 'futbol',
        b: [{ name: 'willy' }],
      },
      birthdate: 440305200000,
    };

    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    let diff = differify.compare(A, B);

    let merged = differify.applyLeftChanges(diff);

    expect(merged.id).toBe(1);
    expect(merged.name).toBe('Person1');
    expect(merged.birthdate).toBe(440305200000);
    expect(merged.hobbies.a).toBe('futbol');
    expect(Object.prototype.toString.call(merged.hobbies.b)).toBe(
      '[object Array]'
    );
    expect(merged.hobbies.b.length).toBe(1);
    expect(merged.hobbies.b[0].name).toBe('willy');

    diff = differify.compare({ a: 'a', b: 'b', c: 'c' }, { a: 'b', b: 'a' });
    merged = differify.applyLeftChanges(diff);

    expect(merged.a).toBe('a');
    expect(merged.b).toBe('b');
    expect(merged.c).toBe('c');

    diff = differify.compare([1, 2, 3], [4, 5, 6, 7]);
    merged = differify.applyLeftChanges(diff);

    expect(Object.prototype.toString.call(merged)).toBe('[object Array]');
    expect(merged.length).toBe(4);
    expect(merged[0]).toBe(1);
    expect(merged[1]).toBe(2);
    expect(merged[2]).toBe(3);
    expect(merged[3]).toBe(7);

    diff = differify.compare([1, 2, 3], [4, 5]);
    merged = differify.applyLeftChanges(diff);

    expect(Object.prototype.toString.call(merged)).toBe('[object Array]');
    expect(merged.length).toBe(3);
    expect(merged[0]).toBe(1);
    expect(merged[1]).toBe(2);
    expect(merged[2]).toBe(3);
  });

  test('should merge the difference ONLY', () => {
    const B = {
      id: 1,
      roles: ['developer', 'admin'],
      name: 'Person2',
      birthdate: 533444400000,
      color: 'red',
    };

    const A = {
      id: 1,
      roles: ['developer'],
      name: 'Person1',
      birthdate: 440305200000,
    };

    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    let diff = differify.compare(A, B);

    let merged = differify.applyLeftChanges(diff, true);

    expect(merged.id).toBe(undefined);
    expect(merged.name).toBe('Person1');
    expect(merged.birthdate).toBe(440305200000);
    expect(merged.birthdate).toBe(440305200000);
    expect(merged.color).toBe('red');
    expect(Object.prototype.toString.call(merged.roles)).toBe('[object Array]');
    expect(merged.roles.length).toBe(1);
    expect(merged.roles[0]).toBe('admin');

    diff = differify.compare({ a: 'a', b: 'b', c: 'c' }, { a: 'a', b: 'b' });
    merged = differify.applyLeftChanges(diff, true);

    expect(merged.a).toBe(undefined);
    expect(merged.b).toBe(undefined);
    expect(merged.c).toBe('c');

    diff = differify.compare([1, 2, 3], [1, 2, 3, 4]);
    merged = differify.applyLeftChanges(diff, true);
    expect(Object.prototype.toString.call(merged)).toBe('[object Array]');
    expect(merged.length).toBe(1);
    expect(merged[0]).toBe(4);

    diff = differify.compare([1, 2, 3], [1, 4, 3, 2]);
    merged = differify.applyLeftChanges(diff, true);
    expect(Object.prototype.toString.call(merged)).toBe('[object Array]');
    expect(merged.length).toBe(2);
    expect(merged[0]).toBe(2);
    expect(merged[1]).toBe(2);

    diff = differify.compare({ a: 'a', b: 'b', c: 'c' }, { a: 'b', b: 'a' });
    merged = differify.applyLeftChanges(diff, true);

    expect(merged.a).toBe('a');
    expect(merged.b).toBe('b');
    expect(merged.c).toBe('c');

    diff = differify.compare([1, 2, 3], [4, 5, 6, 7]);
    merged = differify.applyLeftChanges(diff, true);

    expect(Object.prototype.toString.call(merged)).toBe('[object Array]');
    expect(merged.length).toBe(4);
    expect(merged[0]).toBe(1);
    expect(merged[1]).toBe(2);
    expect(merged[2]).toBe(3);
    expect(merged[3]).toBe(7);

    diff = differify.compare([1, 2, 3], [4, 5]);
    merged = differify.applyLeftChanges(diff, true);

    expect(Object.prototype.toString.call(merged)).toBe('[object Array]');
    expect(merged.length).toBe(3);
    expect(merged[0]).toBe(1);
    expect(merged[1]).toBe(2);
    expect(merged[2]).toBe(3);

    diff = differify.compare([1, 2], [1, 2]);
    merged = differify.applyLeftChanges(diff, true);

    expect(merged).not.toBe(undefined);
    expect(merged.length).toBe(0);
  });

  test('should return falsy values when right changes are applied', () => {
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });

    const oldObj = { hasDocument: true };
    const newObj = { hasDocument: false };

    let diff = differify.compare(oldObj, newObj);
    expect(diff._).not.toBe(undefined);
    expect(diff.changes).toBe(1);
    expect(diff._.hasDocument.original).toBe(true);
    expect(diff._.hasDocument.current).toBe(false);
    let changes = differify.applyRightChanges(diff, true);
    expect(changes).not.toBe(undefined);
    expect(changes.hasDocument).toBe(false);

    newObj.hasDocument = null;
    diff = differify.compare(oldObj, newObj);
    expect(diff._).not.toBe(undefined);
    expect(diff.changes).toBe(1);
    expect(diff._.hasDocument.original).toBe(true);
    expect(diff._.hasDocument.current).toBe(null);
    changes = differify.applyRightChanges(diff, true);
    expect(changes).not.toBe(undefined);
    expect(changes.hasDocument).toBe(null);

    newObj.hasDocument = undefined;
    diff = differify.compare(oldObj, newObj);
    expect(diff._).not.toBe(undefined);
    expect(diff.changes).toBe(1);
    expect(diff._.hasDocument.original).toBe(true);
    expect(diff._.hasDocument.current).toBe(undefined);
    changes = differify.applyRightChanges(diff, true);
    expect(changes).not.toBe(undefined);
    expect(changes.hasDocument).toBe(undefined);
  });

  test('should return falsy values when left changes are applied', () => {
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });

    const oldObj = { hasDocument: false };
    const newObj = { hasDocument: true };

    let diff = differify.compare(oldObj, newObj);
    expect(diff._).not.toBe(undefined);
    expect(diff.changes).toBe(1);
    expect(diff._.hasDocument.current).toBe(true);
    expect(diff._.hasDocument.original).toBe(false);
    let changes = differify.applyLeftChanges(diff, true);
    expect(changes).not.toBe(undefined);
    expect(changes.hasDocument).toBe(false);

    oldObj.hasDocument = null;
    diff = differify.compare(oldObj, newObj);
    expect(diff._).not.toBe(undefined);
    expect(diff.changes).toBe(1);
    expect(diff._.hasDocument.current).toBe(true);
    expect(diff._.hasDocument.original).toBe(null);
    changes = differify.applyLeftChanges(diff, true);
    expect(changes).not.toBe(undefined);
    expect(changes.hasDocument).toBe(null);

    oldObj.hasDocument = undefined;
    diff = differify.compare(oldObj, newObj);
    expect(diff._).not.toBe(undefined);
    expect(diff.changes).toBe(1);
    expect(diff._.hasDocument.current).toBe(true);
    expect(diff._.hasDocument.original).toBe(undefined);
    changes = differify.applyLeftChanges(diff, true);
    expect(changes).not.toBe(undefined);
    expect(changes.hasDocument).toBe(undefined);
  });

  test('should return a non null result when the config parameters are DIFF for objects and arrays', () => {
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    let diff = differify.compare(
      { a: 'a', b: 'b', c: 'c' },
      { a: 'b', b: 'a' }
    );
    let merged = differify.applyLeftChanges(diff);
    expect(Object.prototype.toString.call(merged)).toBe('[object Object]');
    expect(merged).not.toBe(null);

    diff = differify.compare([1, 2, 3], [2, 5, 6]);
    merged = differify.applyLeftChanges(diff);
    expect(Object.prototype.toString.call(merged)).toBe('[object Array]');
    expect(merged).not.toBe(null);
  });

  test('should return null if the config is not DIFF for objects and arrays', () => {
    differify.setConfig({ mode: { object: 'REFERENCE', array: 'DIFF' } });
    let diff = differify.compare(
      { a: 'a', b: 'b', c: 'c' },
      { a: 'b', b: 'a' }
    );
    let merged = differify.applyLeftChanges(diff);
    expect(merged).toBe(null);

    differify.setConfig({ mode: { object: 'DIFF', array: 'STRING' } });
    diff = differify.compare({ a: 'a', b: 'b', c: 'c' }, { a: 'b', b: 'a' });
    merged = differify.applyLeftChanges(diff);
    expect(merged).toBe(null);
  });

  test('should return null if wrong diff data is provided', () => {
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    let diff = [];
    let merged = differify.applyLeftChanges(diff);
    expect(merged).toBe(null);

    diff = {};
    merged = differify.applyLeftChanges(diff);
    expect(merged).toBe(null);

    diff = null;
    merged = differify.applyLeftChanges(diff);
    expect(merged).toBe(null);

    diff = null;
    merged = differify.filterDiffByStatus(diff);
    expect(merged).toBe(null);
  });

  test('if no changes between two entities, the left or right apply method, should return the object when called', () => {
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    const A = {
      name: 'Person1',
      extras: {
        something: '1',
        somethingElse: '2',
      },
    };
    const B = {
      name: 'Person1',
      extras: {
        something: '1',
        somethingElse: '2',
      },
    };

    const diff = differify.compare(A, B);
    const merged = differify.applyLeftChanges(diff);
    expect(merged).not.toBe(null);
    expect(merged.name).toBe('Person1');
    expect(Object.prototype.toString.call(merged.extras)).toBe(
      '[object Object]'
    );
    expect(merged.extras.something).toBe('1');
    expect(merged.extras.somethingElse).toBe('2');
  });

  test('should return the props filtered by status', () => {
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    const A = {
      name: 'Person1',
      extras: {
        something: '1',
        somethingElse: '2',
      },
      member: true,
      doc: 10,
      friends: ['A', 'B', 'C'],
    };
    const B = {
      name: 'Person1',
      extras: {
        something: '1',
        somethingElse: '2',
      },
      member: false,
      badges: 7,
      friends: ['A', 'D', 'C', 'F'],
    };

    const diff = differify.compare(A, B);
    let merged = differify.filterDiffByStatus(diff, 'DELETED');
    expect(merged).not.toBe(null);
    expect(merged.name).toBe(undefined);
    expect(merged.extras).toBe(undefined);
    expect(merged.doc).toBe(10);
    expect(merged.member).toBe(undefined);
    expect(merged.friends).toBe(undefined);

    //Extended information
    merged = differify.filterDiffByStatus(diff, 'DELETED', true);
    expect(merged).not.toBe(null);
    expect(merged.name).toBe(undefined);
    expect(merged.extras).toBe(undefined);
    expect(merged.doc.original).toBe(10);
    expect(merged.doc.current).toBe(null);
    expect(merged.member).toBe(undefined);
    expect(merged.friends).toBe(undefined);

    merged = differify.filterDiffByStatus(diff, PROPERTY_STATUS.ADDED);
    expect(merged).not.toBe(null);
    expect(merged.name).toBe(undefined);
    expect(merged.extras).toBe(undefined);
    expect(merged.doc).toBe(undefined);
    expect(merged.badges).toBe(7);
    expect(merged.member).toBe(undefined);
    expect(merged.friends.length).toBe(1);
    expect(merged.friends[0]).toBe('F');

    //Extended information
    merged = differify.filterDiffByStatus(diff, PROPERTY_STATUS.ADDED, true);
    expect(merged).not.toBe(null);
    expect(merged.name).toBe(undefined);
    expect(merged.extras).toBe(undefined);
    expect(merged.doc).toBe(undefined);
    expect(merged.badges.current).toBe(7);
    expect(merged.badges.original).toBe(null);
    expect(merged.member).toBe(undefined);
    expect(merged.friends.length).toBe(1);
    expect(merged.friends[0].original).toBe(null);
    expect(merged.friends[0].current).toBe('F');

    merged = differify.filterDiffByStatus(diff, PROPERTY_STATUS.MODIFIED);
    expect(merged).not.toBe(null);
    expect(merged.name).toBe(undefined);
    expect(merged.extras).toBe(undefined);
    expect(merged.doc).toBe(undefined);
    expect(merged.badges).toBe(undefined);
    expect(merged.member).toBeFalsy();
    expect(merged.friends.length).toBe(1);
    expect(merged.friends[0]).toBe('D');

    //Extended information
    merged = differify.filterDiffByStatus(diff, PROPERTY_STATUS.MODIFIED, true);
    expect(merged).not.toBe(null);
    expect(merged.name).toBe(undefined);
    expect(merged.extras).toBe(undefined);
    expect(merged.doc).toBe(undefined);
    expect(merged.badges).toBe(undefined);
    expect(merged.member.original).toBeTruthy();
    expect(merged.member.current).toBeFalsy();
    expect(merged.friends.length).toBe(1);
    expect(merged.friends[0].current).toBe('D');
    expect(merged.friends[0].original).toBe('B');

    merged = differify.filterDiffByStatus(diff, PROPERTY_STATUS.EQUAL);
    expect(merged).not.toBe(null);
    expect(merged.name).toBe('Person1');
    expect(Object.prototype.toString.call(merged.extras)).toBe(
      '[object Object]'
    );
    expect(merged.extras.something).toBe('1');
    expect(merged.extras.somethingElse).toBe('2');
    expect(merged.doc).toBe(undefined);
    expect(merged.badges).toBe(undefined);
    expect(merged.member).toBe(undefined);
    expect(merged.friends.length).toBe(2);
    expect(merged.friends[0]).toBe('A');
    expect(merged.friends[1]).toBe('C');

    //Extended information
    merged = differify.filterDiffByStatus(diff, PROPERTY_STATUS.EQUAL, true);
    expect(merged).not.toBe(null);
    expect(merged.name.original).toBe('Person1');
    expect(merged.name.current).toBe('Person1');
    expect(Object.prototype.toString.call(merged.extras)).toBe(
      '[object Object]'
    );
    expect(merged.extras.something.original).toBe('1');
    expect(merged.extras.something.current).toBe('1');
    expect(merged.extras.somethingElse.original).toBe('2');
    expect(merged.extras.somethingElse.current).toBe('2');
    expect(merged.doc).toBe(undefined);
    expect(merged.badges).toBe(undefined);
    expect(merged.member).toBe(undefined);
    expect(merged.friends.length).toBe(2);
    expect(merged.friends[0].current).toBe('A');
    expect(merged.friends[0].original).toBe('A');
    expect(merged.friends[1].current).toBe('C');
    expect(merged.friends[1].original).toBe('C');
  });

  test('if the input is an Array, must return an array with the elements filtered by status', () => {
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    const A = ['A', 'B', 'C'];
    const B = ['A', 'D', 'C', 'F'];

    const diff = differify.compare(A, B);
    let merged = differify.filterDiffByStatus(diff, PROPERTY_STATUS.ADDED);
    expect(merged).not.toBe(null);
    expect(merged._).toBe(undefined);
    expect(Array.isArray(merged)).toBeTruthy();
    expect(merged.length).toBe(1);
    expect(merged[0]).toBe('F');

    merged = differify.filterDiffByStatus(diff, PROPERTY_STATUS.MODIFIED);
    expect(merged).not.toBe(null);
    expect(merged._).toBe(undefined);
    expect(Array.isArray(merged)).toBeTruthy();
    expect(merged.length).toBe(1);
    expect(merged[0]).toBe('D');

    merged = differify.filterDiffByStatus(diff, PROPERTY_STATUS.EQUAL);
    expect(merged).not.toBe(null);
    expect(merged._).toBe(undefined);
    expect(Array.isArray(merged)).toBeTruthy();
    expect(merged.length).toBe(2);
    expect(merged[0]).toBe('A');
    expect(merged[1]).toBe('C');

    merged = differify.filterDiffByStatus(
      differify.compare([1, 2], [1]),
      'DELETED'
    );
    expect(merged).not.toBe(null);
    expect(merged._).toBe(undefined);
    expect(Array.isArray(merged)).toBeTruthy();
    expect(merged.length).toBe(1);
    expect(merged[0]).toBe(2);
  });

  test('Testing Unordered array comparison', () => {
    differify.setConfig({
      compareArraysInOrder: false,
      mode: { object: 'DIFF', array: 'DIFF' },
    });
    const A = ['A', 'B', 'C'];
    const B = ['A', 'D', 'C', 'F'];

    let diff = differify.compare(A, B);

    expect(diff.changes).toEqual(2);
    expect(diff._.length).toEqual(4);
    expect(diff._[0].status).toEqual(PROPERTY_STATUS.EQUAL);
    expect(diff._[0].original).toEqual('A');
    expect(diff._[0].current).toEqual('A');
    expect(diff._[1].status).toEqual(PROPERTY_STATUS.EQUAL);
    expect(diff._[1].original).toEqual('C');
    expect(diff._[1].current).toEqual('C');
    expect(diff._[2].status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[2].original).toEqual('B');
    expect(diff._[2].current).toEqual('D');
    expect(diff._[3].status).toEqual(PROPERTY_STATUS.ADDED);
    expect(diff._[3].original).toEqual(null);
    expect(diff._[3].current).toEqual('F');

    diff = differify.compare(B, A);

    expect(diff.changes).toEqual(2);
    expect(diff._.length).toEqual(4);
    expect(diff._[0].status).toEqual(PROPERTY_STATUS.EQUAL);
    expect(diff._[0].original).toEqual('A');
    expect(diff._[0].current).toEqual('A');
    expect(diff._[1].status).toEqual(PROPERTY_STATUS.EQUAL);
    expect(diff._[1].original).toEqual('C');
    expect(diff._[1].current).toEqual('C');
    expect(diff._[2].status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[2].original).toEqual('D');
    expect(diff._[2].current).toEqual('B');
    expect(diff._[3].status).toEqual('DELETED');
    expect(diff._[3].original).toEqual('F');
    expect(diff._[3].current).toEqual(null);

    diff = differify.compare([1, 2, 3], [4, 5, 6, 1]);

    expect(diff.changes).toEqual(3);
    expect(diff._.length).toEqual(4);
    expect(diff._[0].status).toEqual(PROPERTY_STATUS.EQUAL);
    expect(diff._[0].original).toEqual(1);
    expect(diff._[0].current).toEqual(1);
    expect(diff._[1].status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[1].original).toEqual(2);
    expect(diff._[1].current).toEqual(4);
    expect(diff._[2].status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[2].original).toEqual(3);
    expect(diff._[2].current).toEqual(5);
    expect(diff._[3].status).toEqual(PROPERTY_STATUS.ADDED);
    expect(diff._[3].original).toEqual(null);
    expect(diff._[3].current).toEqual(6);

    diff = differify.compare(
      [
        { name: 'Fabian', age: 18 },
        { name: 'Judith', age: 18 },
      ],
      [
        { name: 'Andres', age: 18 },
        { name: 'Fabian', age: 18 },
      ]
    );

    expect(diff.changes).toEqual(1);
    expect(diff._.length).toEqual(2);
    expect(diff.status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[0].status).toEqual(PROPERTY_STATUS.EQUAL);
    expect(diff._[0]._.name.original).toEqual('Fabian');
    expect(diff._[0]._.name.current).toEqual('Fabian');
    expect(diff._[0]._.age.original).toEqual(18);
    expect(diff._[0]._.age.current).toEqual(18);

    expect(diff._[1].status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[1]._.name.original).toEqual('Judith');
    expect(diff._[1]._.name.current).toEqual('Andres');
    expect(diff._[1]._.age.original).toEqual(18);
    expect(diff._[1]._.age.current).toEqual(18);

    diff = differify.compare(
      [
        { name: 'Fabian', age: 19 },
        { name: 'Judith', age: 18 },
      ],
      [
        { name: 'Andres', age: 18 },
        { name: 'Fabian', age: 18 },
      ]
    );

    expect(diff.changes).toEqual(3);
    expect(diff._.length).toEqual(2);
    expect(diff.status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[0].status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[0]._.name.original).toEqual('Fabian');
    expect(diff._[0]._.name.current).toEqual('Andres');
    expect(diff._[0]._.name.status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[0]._.age.original).toEqual(19);
    expect(diff._[0]._.age.current).toEqual(18);
    expect(diff._[0]._.age.status).toEqual(PROPERTY_STATUS.MODIFIED);

    expect(diff._[1]._.name.original).toEqual('Judith');
    expect(diff._[1]._.name.current).toEqual('Fabian');
    expect(diff._[1]._.name.status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[1]._.age.original).toEqual(18);
    expect(diff._[1]._.age.current).toEqual(18);
    expect(diff._[1]._.age.status).toEqual(PROPERTY_STATUS.EQUAL);

    diff = differify.compare(
      [
        {
          id: 155,
          phrase: 'I was deleted',
        },
        {
          id: 156,
          phrase: 'Can you help me with',
        },
        {
          id: 123,
          phrase: 'Was edite',
        },
        {
          id: 157,
          phrase: 'Help me with',
        },
      ],
      [
        {
          id: 156,
          phrase: 'Can you help me with',
        },
        {
          id: 123,
          phrase: 'Was edited',
        },
        {
          id: 88,
          phrase: 'Was added in between',
        },
        {
          id: 157,
          phrase: 'Help me with',
        },
      ]
    );

    expect(diff.changes).toEqual(4);
    expect(diff._.length).toEqual(4);
    expect(diff.status).toEqual(PROPERTY_STATUS.MODIFIED);

    expect(diff._[0].status).toEqual(PROPERTY_STATUS.EQUAL);
    expect(diff._[0]._.id.original).toEqual(156);
    expect(diff._[0]._.id.current).toEqual(156);
    expect(diff._[0]._.id.status).toEqual(PROPERTY_STATUS.EQUAL);
    expect(diff._[0]._.phrase.original).toEqual('Can you help me with');
    expect(diff._[0]._.phrase.current).toEqual('Can you help me with');
    expect(diff._[0]._.phrase.status).toEqual(PROPERTY_STATUS.EQUAL);

    expect(diff._[1].status).toEqual(PROPERTY_STATUS.EQUAL);
    expect(diff._[1]._.id.original).toEqual(157);
    expect(diff._[1]._.id.current).toEqual(157);
    expect(diff._[1]._.id.status).toEqual(PROPERTY_STATUS.EQUAL);
    expect(diff._[1]._.phrase.original).toEqual('Help me with');
    expect(diff._[1]._.phrase.current).toEqual('Help me with');
    expect(diff._[1]._.phrase.status).toEqual(PROPERTY_STATUS.EQUAL);

    expect(diff._[2].status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[2]._.id.original).toEqual(155);
    expect(diff._[2]._.id.current).toEqual(123);
    expect(diff._[2]._.id.status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[2]._.phrase.original).toEqual('I was deleted');
    expect(diff._[2]._.phrase.current).toEqual('Was edited');
    expect(diff._[2]._.phrase.status).toEqual(PROPERTY_STATUS.MODIFIED);

    expect(diff._[3].status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[3]._.id.original).toEqual(123);
    expect(diff._[3]._.id.current).toEqual(88);
    expect(diff._[3]._.id.status).toEqual(PROPERTY_STATUS.MODIFIED);
    expect(diff._[3]._.phrase.original).toEqual('Was edite');
    expect(diff._[3]._.phrase.current).toEqual('Was added in between');
    expect(diff._[3]._.phrase.status).toEqual(PROPERTY_STATUS.MODIFIED);

    const before = {
      members: [
        {
          memberIds: ['a', 'b'],
          originalMemberId: '1',
          type: 'COUNTRYCLUB',
        },
        {
          memberIds: ['a', 'b'],
          originalMemberId: '1',
          type: 'COUNTRYCLUB',
        },
        {
          memberIds: ['a', 'b', 'f'],
          originalMemberId: '1',
          type: 'COUNTRYCLUB',
        },
      ],
    };

    const after = {
      members: [
        {
          memberIds: ['a', 'z', 'b'],
          originalMemberId: '1',
          type: 'COUNTRYCLUB',
        },
        {
          memberIds: ['a', 'z', 'b'],
          originalMemberId: '1',
          type: 'COUNTRYCLUB',
        },
        {
          memberIds: ['a', 'b'],
          originalMemberId: '1',
          type: 'COUNTRYCLUB',
        },
        {
          memberIds: ['a', 'z', 'b'],
          originalMemberId: '1',
          type: 'COUNTRYCLUB',
        },
      ],
    };

    diff = differify.compare(before, after);
    expect(diff.status).toBe(PROPERTY_STATUS.MODIFIED);
    expect(diff.changes).toBe(3);

    expect(JSON.stringify(diff)).toBe(
      '{"_":{"members":{"_":[{"_":{"memberIds":{"_":[{"original":"a","current":"a","status":"EQUAL","changes":0},{"original":"b","current":"b","status":"EQUAL","changes":0}],"status":"EQUAL","changes":0},"originalMemberId":{"original":"1","current":"1","status":"EQUAL","changes":0},"type":{"original":"COUNTRYCLUB","current":"COUNTRYCLUB","status":"EQUAL","changes":0}},"status":"EQUAL","changes":0},{"_":{"memberIds":{"_":[{"original":"a","current":"a","status":"EQUAL","changes":0},{"original":"b","current":"b","status":"EQUAL","changes":0},{"original":null,"current":"z","status":"ADDED","changes":1}],"status":"MODIFIED","changes":1},"originalMemberId":{"original":"1","current":"1","status":"EQUAL","changes":0},"type":{"original":"COUNTRYCLUB","current":"COUNTRYCLUB","status":"EQUAL","changes":0}},"status":"MODIFIED","changes":1},{"_":{"memberIds":{"_":[{"original":"a","current":"a","status":"EQUAL","changes":0},{"original":"b","current":"b","status":"EQUAL","changes":0},{"original":"f","current":"z","status":"MODIFIED","changes":1}],"status":"MODIFIED","changes":1},"originalMemberId":{"original":"1","current":"1","status":"EQUAL","changes":0},"type":{"original":"COUNTRYCLUB","current":"COUNTRYCLUB","status":"EQUAL","changes":0}},"status":"MODIFIED","changes":1},{"original":null,"current":{"memberIds":["a","z","b"],"originalMemberId":"1","type":"COUNTRYCLUB"},"status":"ADDED","changes":1}],"status":"MODIFIED","changes":3}},"status":"MODIFIED","changes":3}'
    );

    diff = differify.compare(
      {
        members: [
          {
            memberIds: ['a', 'b'],
            originalMemberId: '1',
            type: 'COUNTRYCLUB',
          },
        ],
      },
      {
        members: [
          {
            memberIds: ['a', 'z', 'b'],
            originalMemberId: '1',
            type: 'COUNTRYCLUB',
          },
        ],
      }
    );

    expect(JSON.stringify(diff)).toBe(
      '{"_":{"members":{"_":[{"_":{"memberIds":{"_":[{"original":"a","current":"a","status":"EQUAL","changes":0},{"original":"b","current":"b","status":"EQUAL","changes":0},{"original":null,"current":"z","status":"ADDED","changes":1}],"status":"MODIFIED","changes":1},"originalMemberId":{"original":"1","current":"1","status":"EQUAL","changes":0},"type":{"original":"COUNTRYCLUB","current":"COUNTRYCLUB","status":"EQUAL","changes":0}},"status":"MODIFIED","changes":1}],"status":"MODIFIED","changes":1}},"status":"MODIFIED","changes":1}'
    );
  });
});
