/**
 * MIT License
 *
 * Copyright (c) 2020 netilon.com (Fabian Roberto Orue)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function isArray(value) {
  return value && Object.prototype.toString.call(value) === '[object Array]';
}

function isObject(value) {
  return value && !isArray(value) && typeof value === 'object';
}

function isValidString(val) {
  return val && typeof val === 'string' && val.length > 0;
}

function has(obj, prop) {
  return obj.hasOwnProperty
    ? obj.hasOwnProperty(prop)
    : obj[prop] !== undefined;
}

const COMPARISSION_MODE = {
  REFERENCE: 'REFERENCE',
  DIFF: 'DIFF',
  STRING: 'STRING',
};

function Configuration(config) {
  this.mode = {
    array: COMPARISSION_MODE.REFERENCE,
    object: COMPARISSION_MODE.REFERENCE,
    function: COMPARISSION_MODE.REFERENCE,
  };

  if (isObject(config) && isObject(config.mode)) {
    const allowedComparissions = Object.values(COMPARISSION_MODE);

    if (isValidString(config.mode.array)) {
      const comparission = config.mode.array.toUpperCase();
      if (allowedComparissions.indexOf(comparission) !== -1) {
        this.mode.array = config.mode.array;
      }
    }

    if (isValidString(config.mode.object)) {
      const comparission = config.mode.object.toUpperCase();
      if (allowedComparissions.indexOf(comparission) !== -1) {
        this.mode.object = config.mode.object;
      }
    }
    if (isValidString(config.mode.function)) {
      const comparission = config.mode.function.toUpperCase();
      if (
        comparission === COMPARISSION_MODE.REFERENCE ||
        comparission === COMPARISSION_MODE.STRING
      ) {
        this.mode.function = config.mode.function;
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
  for (let propA in a) {
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

  for (let propB in b) {
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

  return buildDiff(a, b, PROPERTY_STATUS.MODIFIED);
}

const configureComparators = (config) => {
  const objectComp = {};
  objectComp[COMPARISSION_MODE.DIFF] = deepObjectComparator;
  objectComp[COMPARISSION_MODE.REFERENCE] = (a, b) => {
    const pDiff = nativeEqualityComparator(a, b);
    return buildDeepDiff(null, pDiff.status, pDiff.changes);
  };
  objectComp[COMPARISSION_MODE.STRING] = (a, b) => {
    const pDiff = JSONStringComparator(a, b);
    return buildDeepDiff(null, pDiff.status, pDiff.changes);
  };
  const arrayComp = {};
  arrayComp[COMPARISSION_MODE.DIFF] = deepArrayComparator;
  arrayComp[COMPARISSION_MODE.REFERENCE] = (a, b) => {
    const pDiff = nativeEqualityComparator(a, b);
    return buildDeepDiff(null, pDiff.status, pDiff.changes);
  };
  arrayComp[COMPARISSION_MODE.STRING] = (a, b) => {
    const pDiff = arraySimpleComparator(a, b);
    return buildDeepDiff(null, pDiff.status, pDiff.changes);
  };
  const functionComp = {};
  functionComp[COMPARISSION_MODE.REFERENCE] = nativeEqualityComparator;
  functionComp[COMPARISSION_MODE.STRING] = toStringComparator;

  typeMap.string = nativeEqualityComparator;
  typeMap.number = nativeEqualityComparator;
  typeMap.boolean = nativeEqualityComparator;
  typeMap.function = functionComp[config.mode.function];
  typeMap.object = deepComparator;

  deepTypeMap['[object Array]'] = arrayComp[config.mode.array];
  deepTypeMap['[object Date]'] = dateComparator;
  deepTypeMap['[object Object]'] = objectComp[config.mode.object];
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
  return { mode: { ...this.config.mode } };
};

Differify.prototype.compare = function compare(a, b) {
  return diff(a, b);
};

export default Differify;
