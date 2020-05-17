
const Differify = require('../index');

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
      mode: { array: null, object: true },
    });
    let config = differify.getConfig();
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
    expect(config.mode.array).toEqual('DIFF');
    expect(config.mode.object).toEqual('DIFF');
    expect(config.mode.function).toEqual('REFERENCE');
  });

  test('testing incomplete config', () => {
    differify.setConfig({
      mode: {},
    });
    let config = differify.getConfig();
    expect(config.mode.array).toEqual('DIFF');
    expect(config.mode.object).toEqual('DIFF');
    expect(config.mode.function).toEqual('REFERENCE');
  });

  test('testing good config', () => {
    differify.setConfig({
      mode: {
        array: 'DIFF',
        object: 'DIFF',
        function: 'STRING',
      },
    });
    let config = differify.getConfig();
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

    expect(diff._.name.status === 'ADDED').toBeTruthy();
    expect(diff._.name.original).toBe(null);
    expect(diff._.name.current).toBe('Judith');
    expect(diff._.date.status === 'ADDED').toBeTruthy();
    expect(diff._.date.original).toBe(null);
    expect(Object.prototype.toString.call(diff._.date.current)).toBe(
      '[object Date]'
    );
    expect(diff._.age.status === 'ADDED').toBeTruthy();
    expect(diff._.age.original).toBe(null);
    expect(diff._.age.current).toBe(33);
    expect(diff._.friends.status === 'ADDED').toBeTruthy();
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

    expect(diff.status === 'EQUAL').toBeTruthy();
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
    expect(diff.status).toBe('EQUAL');
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

    expect(diff._.name.status === 'ADDED').toBeTruthy();
    expect(diff._.name.original).toBe(null);
    expect(diff._.name.current).toBe('Judith');
    expect(diff._.date.status === 'ADDED').toBeTruthy();
    expect(diff._.date.original).toBe(null);
    expect(Object.prototype.toString.call(diff._.date.current)).toBe(
      '[object Date]'
    );
    expect(diff._.age.status === 'ADDED').toBeTruthy();
    expect(diff._.age.original).toBe(null);
    expect(diff._.age.current).toBe(33);
    expect(diff._.friends.status === 'ADDED').toBeTruthy();
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

    expect(diff.status === 'MODIFIED').toBeTruthy();

    const newDate = new Date();
    a = newDate;
    b = newDate;
    diff = differify.compare(a, b);
    expect(diff.status === 'EQUAL').toBeTruthy();
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
    expect(differify.compare(1, 2).status === 'MODIFIED').toBeTruthy();
    expect(differify.compare(true, false).status === 'MODIFIED').toBeTruthy();
    expect(differify.compare(null, null).status === 'EQUAL').toBeTruthy();
    expect(
      differify.compare(undefined, undefined).status === 'EQUAL'
    ).toBeTruthy();
    expect(differify.compare('a', 'b').status === 'MODIFIED').toBeTruthy();

    const newDate = new Date();
    const a = newDate;
    const b = newDate;
    const diff = differify.compare(a, b);
    expect(diff.status === 'EQUAL').toBeTruthy();
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

    expect(diff.status === 'MODIFIED').toBeTruthy();
    expect(diff.changes === 4).toBeTruthy();
    expect(diff._[0].status === 'MODIFIED').toBeTruthy();
    expect(diff._[1].status === 'MODIFIED').toBeTruthy();
    expect(diff._[2].status === 'MODIFIED').toBeTruthy();
    expect(diff._[3].status === 'DELETED').toBeTruthy();

    diff = differify.compare(b, a);

    expect(diff.status === 'MODIFIED').toBeTruthy();
    expect(diff.changes === 4).toBeTruthy();
    expect(diff._[0].status === 'MODIFIED').toBeTruthy();
    expect(diff._[1].status === 'MODIFIED').toBeTruthy();
    expect(diff._[2].status === 'MODIFIED').toBeTruthy();
    expect(diff._[3].status === 'ADDED').toBeTruthy();

    // DIFF EQ
    diff = differify.compare(a, a);

    expect(diff.status === 'EQUAL').toBeTruthy();
    expect(diff.changes === 0).toBeTruthy();
    expect(diff._[0].status === 'EQUAL').toBeTruthy();
    expect(diff._[1].status === 'EQUAL').toBeTruthy();
    expect(diff._[2].status === 'EQUAL').toBeTruthy();
    expect(diff._[3].status === 'EQUAL').toBeTruthy();

    // REFERENCE DIFF
    differify.setConfig({ mode: { object: 'DIFF', array: 'REFERENCE' } });
    diff = differify.compare(a, b);
    expect(diff.status === 'MODIFIED').toBeTruthy();
    expect(diff.changes === 1).toBeTruthy();
    expect(diff._ === null).toBeTruthy();

    // REFERENCE EQ
    diff = differify.compare(a, a);
    expect(diff.status === 'EQUAL').toBeTruthy();
    expect(diff.changes === 0).toBeTruthy();

    // STRING DIFF
    differify.setConfig({ mode: { object: 'DIFF', array: 'STRING' } });
    diff = differify.compare(a, b);
    expect(diff.status === 'MODIFIED').toBeTruthy();
    expect(diff.changes === 1).toBeTruthy();
    expect(differify.compare([], [])._ === null).toBeTruthy();

    // STRING EQ
    diff = differify.compare(a, a);
    expect(diff.status === 'EQUAL').toBeTruthy();
    expect(diff.changes === 0).toBeTruthy();
    expect(differify.compare([], [])._ === null).toBeTruthy();
  });

  test('Object comparission with ALL possible configurations', () => {
    // DIFF DIFF
    differify.setConfig({ mode: { object: 'DIFF', array: 'DIFF' } });
    let a = getAObject();
    let b = getBObject();

    expect(differify.compare({}, {})._).toBe(null);
    expect(differify.compare({}, {}).status).toBe('EQUAL');
    expect(differify.compare({}, {}).changes).toBe(0);

    let diff = differify.compare(a, b);
    expect(diff.status).toBe('MODIFIED');
    expect(diff.changes).toBe(7);
    expect(diff._.name.status === 'MODIFIED').toBeTruthy();
    expect(diff._.age.status === 'MODIFIED').toBeTruthy();
    diff._.extras._.hobbies._.forEach((i) =>
      expect(i.status === 'MODIFIED').toBeTruthy()
    );
    expect(diff._.date.status === 'MODIFIED').toBeTruthy();

    // DIFF EQ
    a = getAObject();
    b = getAObject();
    b.date = a.date;
    diff = differify.compare(a, b);
    expect(diff.status).toBe('EQUAL');
    expect(diff.changes).toBe(0);
    expect(diff._.name.status === 'EQUAL').toBeTruthy();
    expect(diff._.age.status === 'EQUAL').toBeTruthy();
    diff._.extras._.hobbies._.forEach((i) =>
      expect(i.status === 'EQUAL').toBeTruthy()
    );
    expect(diff._.date.status === 'EQUAL').toBeTruthy();

    // REFERENCE DIFF
    differify.setConfig({ mode: { object: 'REFERENCE', array: 'REFERENCE' } });
    diff = differify.compare(getAObject(), getBObject());
    expect(diff.status === 'MODIFIED').toBeTruthy();
    expect(diff.changes === 1).toBeTruthy();
    expect(differify.compare({}, {}).status === 'MODIFIED').toBeTruthy();

    // REFERENCE EQ
    a = getAObject();
    b = a;
    diff = differify.compare(a, b);
    expect(diff.status === 'EQUAL').toBeTruthy();
    expect(diff.changes === 0).toBeTruthy();

    // STRING DIFF
    differify.setConfig({ mode: { object: 'STRING', array: 'STRING' } });
    diff = differify.compare(getAObject(), getBObject());
    expect(diff.status === 'MODIFIED').toBeTruthy();
    expect(diff.changes === 1).toBeTruthy();
    expect(differify.compare({}, {}).status === 'EQUAL').toBeTruthy();

    // STRING EQ
    a = getAObject();
    b = a;
    diff = differify.compare(a, b);
    expect(diff.changes === 0).toBeTruthy();
    expect(diff.status === 'EQUAL').toBeTruthy();
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

    differify.setConfig({ mode: { array: 'REFERENCE', object: 'REFERENCE'} });

    expect(JSON.stringify(differify.compare(getAObject(), getBObject()))).toBe(
      '{"_":null,"status":"MODIFIED","changes":1}'
    );

    differify.setConfig({ mode: { array: 'STRING' , object: 'REFERENCE'} });

    expect(JSON.stringify(differify.compare(getAObject(), getBObject()))).toBe(
      '{"_":null,"status":"MODIFIED","changes":1}'
    );
  });
});
