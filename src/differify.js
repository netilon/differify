/*!
 * Copyright(c) 2020 Fabian Roberto Orue <fabianorue@gmail.com>
 * BSD Licensed
 */

//TODO: the library has increased it size a lot, break this file in separate ones.
function isArray(value) {
  return value && Array.isArray(value);
}

function isObject(value) {
  return value && !Array.isArray(value) && typeof value === 'object';
}

function isValidString(val) {
  return val && typeof val === 'string' && val.length > 0;
}

function has(obj, prop) {
  return obj.hasOwnProperty
    ? obj.hasOwnProperty(prop)
    : obj[prop] !== undefined;
}

const COMPARISON_MODE = {
  REFERENCE: 'REFERENCE',
  DIFF: 'DIFF',
  STRING: 'STRING',
};

function Configuration(config) {
  this.compareArraysInOrder = true;

  this.mode = {
    array: COMPARISON_MODE.DIFF,
    object: COMPARISON_MODE.DIFF,
    function: COMPARISON_MODE.REFERENCE,
  };

  if (isObject(config)) {
    if (
      typeof config.compareArraysInOrder === 'boolean'
    ) {
      this.compareArraysInOrder = config.compareArraysInOrder;
    }

    if (isObject(config.mode)) {
      const allowedComparissions = Object.values(COMPARISON_MODE);

      if (isValidString(config.mode.array)) {
        const comparison = config.mode.array.toUpperCase();
        if (allowedComparissions.indexOf(comparison) !== -1) {
          this.mode.array = comparison;
        }
      }

      if (isValidString(config.mode.object)) {
        const comparison = config.mode.object.toUpperCase();
        if (allowedComparissions.indexOf(comparison) !== -1) {
          this.mode.object = comparison;
        }
      }
      if (isValidString(config.mode.function)) {
        const comparison = config.mode.function.toUpperCase();
        if (
          comparison === COMPARISON_MODE.REFERENCE ||
          comparison === COMPARISON_MODE.STRING
        ) {
          this.mode.function = comparison;
        }
      }
    }
  }
}

const PROPERTY_STATUS = {
  ADDED: 'ADDED',
  DELETED: 'DELETED',
  MODIFIED: 'MODIFIED',
  EQUAL: 'EQUAL',
};

const INVALID_VAL = Symbol('invalid');

function buildDiff(original, current, status, changes = 0) {
  return {
    original,
    current,
    status,
    changes,
  };
}

function buildDeepDiff(data, status, changes = 0) {
  return {
    _: data,
    status,
    changes,
  };
}

//types

const typeMap = {
  string: null,
  number: null,
  function: null,
  object: null,
};

const deepTypeMap = {};

//comparators

function nativeEqualityComparator(a, b) {
  if (a === b) {
    return buildDiff(a, b, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
}

function diff(a, b) {
  //here, we avoid comparing by reference because of the nested objects can be changed
  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) {
    return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
  }
  const comparator = typeMap[aType];
  return comparator ? comparator(a, b) : nativeEqualityComparator(a, b);
}

function multipleComparator(a, b) {
  if (a === b) {
    return buildDiff(a, b, PROPERTY_STATUS.EQUAL);
  }

  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) {
    return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
  }
  const comparator = typeMap[aType];
  return comparator ? comparator(a, b) : nativeEqualityComparator(a, b);
}

function dateComparator(aDate, bDate) {
  if (aDate.getTime() === bDate.getTime()) {
    return buildDiff(aDate, bDate, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(aDate, bDate, PROPERTY_STATUS.MODIFIED, 1);
}

function arraySimpleComparator(aArr, bArr) {
  if (aArr.length === bArr.length) {
    if (JSON.stringify(aArr) === JSON.stringify(bArr)) {
      return buildDiff(aArr, bArr, PROPERTY_STATUS.EQUAL);
    }
  }
  return buildDiff(aArr, bArr, PROPERTY_STATUS.MODIFIED, 1);
}

/**
 * Compare each element keeping the order of each one.
 * @param {*} aArr
 * @param {*} bArr
 */
function deepArrayComparator(aArr, bArr) {
  let maxArr;
  let minArr;
  let listALargerThanB = 0; // 0 equal \ -1 a major | 1 b major
  if (aArr.length > bArr.length || aArr.length === bArr.length) {
    maxArr = aArr;
    minArr = bArr;
    listALargerThanB = -1;
  } else {
    maxArr = bArr;
    minArr = aArr;
    listALargerThanB = 1;
  }

  const ret = [];
  let changes = 0;
  let i;
  for (i = 0; i < minArr.length; ++i) {
    ret.push(multipleComparator(aArr[i], bArr[i]));
    changes += ret[i].changes || 0;
  }
  if (listALargerThanB === -1) {
    for (i; i < maxArr.length; ++i) {
      ret.push(buildDiff(aArr[i], null, PROPERTY_STATUS.DELETED, 1));
      ++changes;
    }
  } else if (listALargerThanB === 1) {
    for (i; i < maxArr.length; ++i) {
      ret.push(buildDiff(null, bArr[i], PROPERTY_STATUS.ADDED, 1));
      ++changes;
    }
  }

  return buildDeepDiff(
    ret,
    changes > 0 ? PROPERTY_STATUS.MODIFIED : PROPERTY_STATUS.EQUAL,
    changes
  );
}

function deepUnorderedArrayComparator(aArr, bArr) {
  let maxArr;
  if (aArr.length > bArr.length || aArr.length === bArr.length) {
    maxArr = aArr;
  } else {
    maxArr = bArr;
  }

  const occurencesMap = Object.create(null);
  const occurencesList = [];

  let changes = 0;
  let i;
  let index;
  let curr;
  const ret = [];
  let keyA;
  let keyB;
  let comparatorRes;
  for (i = 0; i < maxArr.length; ++i) {
    if (i < aArr.length) {
      keyA = JSON.stringify(aArr[i]);
      index = occurencesMap[keyA];
      if (index !== undefined) {
        curr = occurencesList[index];
        curr.a = aArr[i];
        comparatorRes = multipleComparator(curr.a, curr.b);
        ret[index] = comparatorRes._ !== undefined
            ? buildDiff(
                comparatorRes._.original,
                comparatorRes._.current,
                comparatorRes.status,
                comparatorRes.changes
              )
            : comparatorRes;

        if (ret[index].status !== PROPERTY_STATUS.EQUAL) {
          ++changes;
        } else {
          --changes;
        }
        delete occurencesMap[keyA];
      } else {
        occurencesList.push({
          a: aArr[i],
          b: null,
        });
        ret.push(buildDiff(aArr[i], null, PROPERTY_STATUS.DELETED, 1));
        ++changes;
        occurencesMap[keyA] = occurencesList.length - 1;
      }
    }
    if (i < bArr.length) {
      keyB = JSON.stringify(bArr[i]);
      index = occurencesMap[keyB];
      if (index !== undefined) {
        curr = occurencesList[index];
        curr.b = bArr[i];
        comparatorRes = multipleComparator(curr.a, curr.b);
        ret[index] = comparatorRes._ !== undefined
            ? buildDiff(
                curr.a,
                curr.b,
                comparatorRes.status,
                comparatorRes.changes
              )
            : comparatorRes;
        if (ret[index].status !== PROPERTY_STATUS.EQUAL) {
          ++changes;
        } else {
          --changes;
        }
        delete occurencesMap[keyB];
      } else {
        occurencesList.push({
          b: bArr[i],
          a: null,
        });
        occurencesMap[keyB] = occurencesList.length - 1;
        ret.push(buildDiff(null, bArr[i], PROPERTY_STATUS.ADDED, 1));
        ++changes;
      }
    }
  }

  return buildDeepDiff(
    ret,
    changes > 0 ? PROPERTY_STATUS.MODIFIED : PROPERTY_STATUS.EQUAL,
    changes
  );
}

function toStringComparator(a, b) {
  const aStringified = a.toString();
  const bStringified = b.toString();
  if (aStringified === bStringified) {
    return buildDiff(aStringified, bStringified, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(aStringified, bStringified, PROPERTY_STATUS.MODIFIED, 1);
}

function deepObjectComparator(a, b) {
  const ret = {};
  let aLength = 0;
  let bLength = 0;
  let changes = 0;
  for (const propA in a) {
    if (has(a, propA)) {
      ++aLength;
      if (has(b, propA)) {
        ret[propA] = multipleComparator(a[propA], b[propA]);
      } else {
        ret[propA] = buildDiff(a[propA], null, PROPERTY_STATUS.DELETED, 1);
      }
      changes += ret[propA].changes;
    }
  }

  for (const propB in b) {
    if (has(b, propB)) {
      ++bLength;
      if (!has(a, propB)) {
        //TODO: avoid multiple indirections.
        ret[propB] = buildDiff(null, b[propB], PROPERTY_STATUS.ADDED, 1);
        changes += ret[propB].changes;
      }
    }
  }

  return aLength === 0 && bLength === 0
    ? buildDeepDiff(null, PROPERTY_STATUS.EQUAL, changes)
    : buildDeepDiff(
        ret,
        changes > 0 ? PROPERTY_STATUS.MODIFIED : PROPERTY_STATUS.EQUAL,
        changes
      );
}

function JSONStringComparator(a, b) {
  const aStringified = JSON.stringify(a);
  const bStringified = JSON.stringify(b);
  if (aStringified === bStringified) {
    return buildDiff(aStringified, bStringified, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(aStringified, bStringified, PROPERTY_STATUS.MODIFIED, 1);
}

function deepComparator(a, b) {
  // check array => date => object
  const aType = Object.prototype.toString.call(a);
  const bType = Object.prototype.toString.call(b);

  if (aType === bType) {
    const comparator = deepTypeMap[aType];
    return comparator ? comparator(a, b) : nativeEqualityComparator(a, b);
  }

  return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
}

const configureComparators = (config) => {
  const objectComp = {};
  objectComp[COMPARISON_MODE.DIFF] = deepObjectComparator;
  objectComp[COMPARISON_MODE.REFERENCE] = (a, b) => {
    const pDiff = nativeEqualityComparator(a, b);
    return buildDeepDiff(null, pDiff.status, pDiff.changes);
  };
  objectComp[COMPARISON_MODE.STRING] = (a, b) => {
    const pDiff = JSONStringComparator(a, b);
    return buildDeepDiff(null, pDiff.status, pDiff.changes);
  };
  const arrayComp = {};
  arrayComp[COMPARISON_MODE.DIFF] = config.compareArraysInOrder
    ? deepArrayComparator
    : deepUnorderedArrayComparator;
  arrayComp[COMPARISON_MODE.REFERENCE] = (a, b) => {
    const pDiff = nativeEqualityComparator(a, b);
    return buildDeepDiff(null, pDiff.status, pDiff.changes);
  };
  arrayComp[COMPARISON_MODE.STRING] = (a, b) => {
    const pDiff = arraySimpleComparator(a, b);
    return buildDeepDiff(null, pDiff.status, pDiff.changes);
  };
  const functionComp = {};
  functionComp[COMPARISON_MODE.REFERENCE] = nativeEqualityComparator;
  functionComp[COMPARISON_MODE.STRING] = toStringComparator;

  typeMap.string = nativeEqualityComparator;
  typeMap.number = nativeEqualityComparator;
  typeMap.boolean = nativeEqualityComparator;
  typeMap.function = functionComp[config.mode.function];
  typeMap.object = deepComparator;

  deepTypeMap['[object Array]'] = arrayComp[config.mode.array];
  deepTypeMap['[object Date]'] = dateComparator;
  deepTypeMap['[object Object]'] = objectComp[config.mode.object];
};

const applyChanges = (next, selector) => {
  if (isArray(next)) {
    const list = [];
    let curr;
    for (let i = 0; i < next.length; i++) {
      curr = selector(next[i]);
      if (curr !== INVALID_VAL) {
        list.push(curr);
      }
    }

    return list;
  }

  if (typeof next === 'object') {
    const o = {};
    let curr;
    for (let i in next) {
      if (next.hasOwnProperty(i)) {
        curr = selector(next[i]);
        if (curr !== INVALID_VAL) {
          o[i] = curr;
        }
      }
    }

    return o;
  }

  return selector(next);
};

const rightChangeSelector = (curr) => {
  if (curr._) {
    return applyChanges(curr._, rightChangeSelector);
  }
  return curr.status === PROPERTY_STATUS.DELETED ? curr.original : curr.current;
};

const leftChangeSelector = (curr) => {
  if (curr._) {
    return applyChanges(curr._, leftChangeSelector);
  }
  return curr.status === PROPERTY_STATUS.ADDED ? curr.current : curr.original;
};

const diffChangeSelectorCreator = (selector) => {
  const diffChangeSelector = (curr) => {
    if (curr._ && curr.changes > 0) {
      return applyChanges(curr._, diffChangeSelector);
    }
    return curr.status === PROPERTY_STATUS.EQUAL ? INVALID_VAL : selector(curr);
  };
  return diffChangeSelector;
};

const statusSelectorCreator = (status) => {
  const property = status === PROPERTY_STATUS.DELETED ? 'original' : 'current';
  const check = status === PROPERTY_STATUS.EQUAL;
  const statusChangeSelector = (curr) => {
    if (curr._ && (check || curr.changes > 0)) {
      return applyChanges(curr._, statusChangeSelector);
    }
    return curr.status === status ? curr[property] : INVALID_VAL;
  };
  return statusChangeSelector;
};

const isMergeable = (config) => {
  // It's no necessary to check the config because
  // it's allways valid.
  return (
    config.mode.object === COMPARISON_MODE.DIFF &&
    config.mode.array === COMPARISON_MODE.DIFF
  );
};

const getValidStatus = (status) => {
  if (typeof status === 'string') {
    const s = status.toUpperCase().trim();
    return Object.values(PROPERTY_STATUS).indexOf(s) !== -1 ? s : null;
  }
  return null;
};

function Differify(_config) {
  this.config = new Configuration(_config);
  configureComparators(this.config);
}

Differify.prototype.setConfig = function setConfig(_config) {
  this.config = new Configuration(_config);
  configureComparators(this.config);
};

Differify.prototype.getConfig = function getConfig() {
  return { compareArraysInOrder: this.config.compareArraysInOrder , mode: { ...this.config.mode } };
};

Differify.prototype.compare = function compare(a, b) {
  return diff(a, b);
};

// TODO: create a leftMerge > left changes && rightMerge > right changes and diffMerge > difference
Differify.prototype.applyLeftChanges = function mergeLeft(
  diffResult,
  diffOnly = false
) {
  if (diffResult && diffResult._ && isMergeable(this.config)) {
    return applyChanges(
      diffResult._,
      diffOnly
        ? diffChangeSelectorCreator(leftChangeSelector)
        : leftChangeSelector
    );
  }
  return null;
};

Differify.prototype.applyRightChanges = function mergeRight(
  diffResult,
  diffOnly = false
) {
  if (diffResult && diffResult._ && isMergeable(this.config)) {
    return applyChanges(
      diffResult._,
      diffOnly
        ? diffChangeSelectorCreator(rightChangeSelector)
        : rightChangeSelector
    );
  }
  return null;
};

Differify.prototype.filterDiffByStatus = function filterStatus(
  diffResult,
  status = PROPERTY_STATUS.MODIFIED
) {
  const propStatus = getValidStatus(status);
  if (diffResult && diffResult._ && propStatus && isMergeable(this.config)) {
    return applyChanges(diffResult._, statusSelectorCreator(status));
  }
  return null;
};

export default Differify;
