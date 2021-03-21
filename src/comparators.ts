/*!
 * Copyright(c) 2020 Fabian Roberto Orue <fabianorue@gmail.com>
 * BSD Licensed
 */

import PROPERTY_STATUS from './enums/property-status';
import { buildDiff, buildDeepDiff } from './property-diff-model';
import { multiPropDiff, deepPropDiff } from './types/diff';
import { comparator } from './types/comparators';
import { has } from './utils/validations';

export function valueRefEqualityComparator(a, b): multiPropDiff {
  if (a === b) {
    return buildDiff(a, b, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
}

export function dateComparator(aDate, bDate): multiPropDiff {
  if (aDate.getTime() === bDate.getTime()) {
    return buildDiff(aDate, bDate, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(aDate, bDate, PROPERTY_STATUS.MODIFIED, 1);
}

export function arraySimpleComparator(aArr, bArr): multiPropDiff {
  if (aArr.length === bArr.length) {
    if (JSON.stringify(aArr) === JSON.stringify(bArr)) {
      return buildDiff(aArr, bArr, PROPERTY_STATUS.EQUAL);
    }
  }
  return buildDiff(aArr, bArr, PROPERTY_STATUS.MODIFIED, 1);
}

export function JSONStringComparator(a, b): multiPropDiff {
  if (JSON.stringify(a) === JSON.stringify(b)) {
    return buildDiff(a, b, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
}

export function toStringComparator(a, b): multiPropDiff {
  if (a.toString() === b.toString()) {
    return buildDiff(a, b, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
}

/**
 * Compare each element keeping the order of each one.
 * @param {*} aArr
 * @param {*} bArr
 */

export function getConfiguredOrderedDeepArrayComparator(
  multipleComparator: comparator
): comparator {
  function orderedDeepArrayComparator(aArr, bArr) {
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

  return orderedDeepArrayComparator;
}

/**
 * Compare the array in an unordered way, without having in mind the
 * order of each element. It will look for equality if not, the element
 * is treated as a difference.
 * @param {*} multipleComparator
 */

export function getConfiguredUnorderedDeepArrayComparator(
  multipleComparator: comparator
): comparator {
  function deepUnorderedArrayComparator(aArr, bArr) {
    let maxArr;
    if (aArr.length >= bArr.length) {
      maxArr = aArr;
    } else {
      maxArr = bArr;
    }

    let changes = 0;
    let i;
    const ret = [];
    let key;
    let comparatorRes;
    let currElement;
    let currMapElement;
    let keyList;

    const comparisonPairsMap = Object.create(null);
    for (i = 0; i < maxArr.length; ++i) {
      if (i < aArr.length) {
        currElement = aArr[i];
        key = JSON.stringify(currElement);
        keyList = comparisonPairsMap[key];
        if (keyList !== undefined && keyList.length > 0) {
          currMapElement = keyList[keyList.length - 1];
          if (currMapElement.b !== null) {
            comparatorRes = multipleComparator(currElement, currMapElement.b);

            ret.push(comparatorRes);
            keyList.pop();
            if (keyList.length === 0) {
              delete comparisonPairsMap[key];
            }
          } else {
            keyList.unshift({
              a: currElement,
              b: null,
            });
          }
        } else {
          comparisonPairsMap[key] = [
            {
              a: currElement,
              b: null,
            },
          ];
        }
      }
      if (i < bArr.length) {
        currElement = bArr[i];
        key = JSON.stringify(currElement);
        keyList = comparisonPairsMap[key];
        if (keyList !== undefined && keyList.length > 0) {
          currMapElement = keyList[keyList.length - 1];
          if (currMapElement.a !== null) {
            comparatorRes = multipleComparator(currMapElement.a, currElement);

            ret.push(comparatorRes);
            keyList.pop();
            if (keyList.length === 0) {
              delete comparisonPairsMap[key];
            }
          } else {
            keyList.unshift({
              a: null,
              b: currElement,
            });
          }
        } else {
          comparisonPairsMap[key] = [
            {
              a: null,
              b: currElement,
            },
          ];
        }
      }
    }

    //matchAll
    let uncomparedPair = Object.create(null);
    uncomparedPair.a = [];
    uncomparedPair.b = [];

    for (let key in comparisonPairsMap) {
      keyList = comparisonPairsMap[key];
      for (let i = 0; i < keyList.length; ++i) {
        currMapElement = keyList[i];
        if (currMapElement.a) {
          if (uncomparedPair.b.length > 0) {
            comparatorRes = multipleComparator(
              currMapElement.a,
              uncomparedPair.b.pop()
            );

            changes += comparatorRes.changes;
            ret.push(comparatorRes);
          } else {
            uncomparedPair.a.unshift(currMapElement.a);
          }
        } else if (currMapElement.b) {
          if (uncomparedPair.a.length > 0) {
            comparatorRes = multipleComparator(
              uncomparedPair.a.pop(),
              currMapElement.b
            );

            changes += comparatorRes.changes;
            ret.push(comparatorRes);
          } else {
            uncomparedPair.b.unshift(currMapElement.b);
          }
        }
      }
    }

    for (let i = uncomparedPair.a.length - 1; i > -1; --i) {
      ret.push(
        buildDiff(uncomparedPair.a[i], null, PROPERTY_STATUS.DELETED, 1)
      );
      ++changes;
    }

    for (let i = uncomparedPair.b.length - 1; i > -1; --i) {
      ret.push(buildDiff(null, uncomparedPair.b[i], PROPERTY_STATUS.ADDED, 1));
      ++changes;
    }

    return buildDeepDiff(
      ret,
      changes > 0 ? PROPERTY_STATUS.MODIFIED : PROPERTY_STATUS.EQUAL,
      changes
    );
  }
  return deepUnorderedArrayComparator;
}

export function getConfiguredDeepObjectComparator(
  multipleComparator: comparator
): comparator {
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
  return deepObjectComparator;
}
