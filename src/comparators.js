/*!
 * Copyright(c) 2020 Fabian Roberto Orue <fabianorue@gmail.com>
 * BSD Licensed
 */

const PROPERTY_STATUS = require('./enums/property-status');
const { buildDiff, buildDeepDiff } = require('./property-diff-model');
const { has } = require('./utils/validations');

module.exports.valueRefEqualityComparator = function valueRefEqualityComparator(
  a,
  b
) {
  if (a === b) {
    return buildDiff(a, b, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
};

module.exports.dateComparator = function dateComparator(aDate, bDate) {
  if (aDate.getTime() === bDate.getTime()) {
    return buildDiff(aDate, bDate, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(aDate, bDate, PROPERTY_STATUS.MODIFIED, 1);
};

module.exports.arraySimpleComparator = function arraySimpleComparator(
  aArr,
  bArr
) {
  if (aArr.length === bArr.length) {
    if (JSON.stringify(aArr) === JSON.stringify(bArr)) {
      return buildDiff(aArr, bArr, PROPERTY_STATUS.EQUAL);
    }
  }
  return buildDiff(aArr, bArr, PROPERTY_STATUS.MODIFIED, 1);
};

module.exports.JSONStringComparator = function JSONStringComparator(a, b) {
  if (JSON.stringify(a) === JSON.stringify(b)) {
    return buildDiff(a, b, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
};

module.exports.toStringComparator = function toStringComparator(a, b) {
  if (a.toString() === b.toString()) {
    return buildDiff(a, b, PROPERTY_STATUS.EQUAL);
  }

  return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
};

/**
 * Compare each element keeping the order of each one.
 * @param {*} aArr
 * @param {*} bArr
 */

module.exports.getConfiguredOrderedDeepArrayComparator = function getConfiguredOrderedDeepArrayComparator(
  multipleComparator
) {
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
      changes,
    );
  }

  return orderedDeepArrayComparator;
};

/**
 * Compare the array in an unordered way, without having in mind the
 * order of each element. It will look for equality if not, the element
 * is treated as a difference.
 * @param {*} multipleComparator
 */

module.exports.getConfiguredUnorderedDeepArrayComparator = function getConfiguredUnorderedDeepArrayComparator(
  multipleComparator
) {
  function deepUnorderedArrayComparator(aArr, bArr) {
    let maxArr;
    if (aArr.length >= bArr.length) {
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
          //BUG issue 18: el problema esta aca cuando el objeto tiene una comparacion profunda
          //y trae mas propiedades anidadas en lugar de current y original
          ret[index] =
            comparatorRes._ !== undefined
              ? buildDiff(
                  curr.a,
                  curr.b,
                  comparatorRes.status,
                  comparatorRes.changes
                )
              : comparatorRes;

          // if (ret[index].status !== PROPERTY_STATUS.EQUAL) {
          //   console.log('ENTRO: ', keyA);
          //   ++changes;
          // } else {
          --changes;
          // }
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
          ret[index] =
            comparatorRes._ !== undefined
              ? buildDiff(
                  curr.a,
                  curr.b,
                  comparatorRes.status,
                  comparatorRes.changes
                )
              : comparatorRes;
          // if (ret[index].status !== PROPERTY_STATUS.EQUAL) {
          //   console.log('ENTRO: ', keyB);
          //   ++changes;
          // } else {
          --changes;
          // }
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
  return deepUnorderedArrayComparator;
};

module.exports.getConfiguredDeepObjectComparator = function getConfiguredDeepObjectComparator(
  multipleComparator
) {
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
          changes,
        );
  }
  return deepObjectComparator;
};
