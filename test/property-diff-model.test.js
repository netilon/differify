const { buildDeepDiff, buildDiff } = require('../src/property-diff-model');

describe('Testing property models', () => {
  test('buildDiff: should return simple diff model', () => {
    let res = buildDiff(1, 2, 'MODIFIED', 1);
    expect(res.status).toBe('MODIFIED');
    expect(res.changes).toBe(1);
    expect(res.original).toBe(1);
    expect(res.current).toBe(2);
    res = buildDiff(1, 1, 'EQUAL');
    expect(res.status).toBe('EQUAL');
    expect(res.changes).toBe(0);
    expect(res.original).toBe(1);
    expect(res.current).toBe(1);
  });

  test('buildDeepDiff: should return nested diff model', () => {
    let res = buildDeepDiff(
      {
        name: {
          original: 'Fabian',
          current: 'Judith',
          status: 'MODIFIED',
          changes: 1,
        },
      },
      'MODIFIED',
      1
    );
    expect(res.status).toBe('MODIFIED');
    expect(res.changes).toBe(1);
    expect(res._).not.toBe(undefined);
    expect(res._).not.toBe(null);
    expect(res._.name.original).toBe('Fabian');
    expect(res._.name.current).toBe('Judith');
    res = buildDeepDiff({
      name: {
        original: 'Fabian',
        current: 'Fabian',
        status: 'EQUAL',
        changes: 0,
      },
    },
    'EQUAL');
    expect(res.status).toBe('EQUAL');
    expect(res.changes).toBe(0);
    expect(res._).not.toBe(undefined);
    expect(res._).not.toBe(null);
    expect(res._.name.original).toBe('Fabian');
    expect(res._.name.current).toBe('Fabian');
  });
});
