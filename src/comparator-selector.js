/*!
 * Copyright(c) 2020 Fabian Roberto Orue <fabianorue@gmail.com>
 * BSD Licensed
 */

const { buildDiff, buildDeepDiff } = require('./property-diff-model');
const COMPARISON_MODE = require('./enums/modes');
const PROPERTY_STATUS = require('./enums/property-status');
const {
  valueRefEqualityComparator,
  arraySimpleComparator,
  dateComparator,
  toStringComparator,
  getConfiguredOrderedDeepArrayComparator,
  getConfiguredUnorderedDeepArrayComparator,
  getConfiguredDeepObjectComparator,
  JSONStringComparator,
} = require('./comparators');

function comparatorSelector() {
  //types
  const typeMap = {
    string: null,
    number: null,
    function: null,
    object: null,
  };

  const deepTypeMap = {};

  //comparator selectors
  function multipleComparatorSelector(a, b) {
    if (a === b) {
      return buildDiff(a, b, PROPERTY_STATUS.EQUAL);
    }

    const aType = typeof a;
    const bType = typeof b;

    if (aType !== bType) {
      return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
    }
    const comparator = typeMap[aType];
    return comparator ? comparator(a, b) : valueRefEqualityComparator(a, b);
  }

  function deepComparatorSelector(a, b) {
    // checks array => date => object
    const aType = Object.prototype.toString.call(a);
    const bType = Object.prototype.toString.call(b);

    if (aType === bType) {
      const comparator = deepTypeMap[aType];
      return comparator ? comparator(a, b) : valueRefEqualityComparator(a, b);
    }

    return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
  }

  function configure(config) {
    const objectComp = {};
    objectComp[COMPARISON_MODE.DIFF] = getConfiguredDeepObjectComparator(
      multipleComparatorSelector
    );
    objectComp[COMPARISON_MODE.REFERENCE] = (a, b) => {
      const pDiff = valueRefEqualityComparator(a, b);
      return buildDeepDiff(null, pDiff.status, pDiff.changes);
    };
    objectComp[COMPARISON_MODE.STRING] = (a, b) => {
      const pDiff = JSONStringComparator(a, b);
      return buildDeepDiff(null, pDiff.status, pDiff.changes);
    };
    const arrayComp = {};
    //TODO: si el modo es deepUnorderedArrayComparator entonces el comparar objetos
    //dentro del array, debe ser no deep STRING mode
    arrayComp[COMPARISON_MODE.DIFF] = config.compareArraysInOrder
      ? getConfiguredOrderedDeepArrayComparator(multipleComparatorSelector)
      : getConfiguredUnorderedDeepArrayComparator(multipleComparatorSelector);
    arrayComp[COMPARISON_MODE.REFERENCE] = (a, b) => {
      const pDiff = valueRefEqualityComparator(a, b);
      return buildDeepDiff(null, pDiff.status, pDiff.changes);
    };
    arrayComp[COMPARISON_MODE.STRING] = (a, b) => {
      const pDiff = arraySimpleComparator(a, b);
      return buildDeepDiff(null, pDiff.status, pDiff.changes);
    };
    const functionComp = {};
    functionComp[COMPARISON_MODE.REFERENCE] = valueRefEqualityComparator;
    functionComp[COMPARISON_MODE.STRING] = toStringComparator;

    typeMap.string = valueRefEqualityComparator;
    typeMap.number = valueRefEqualityComparator;
    typeMap.boolean = valueRefEqualityComparator;
    typeMap.function = functionComp[config.mode.function];
    typeMap.object = deepComparatorSelector;

    deepTypeMap['[object Array]'] = arrayComp[config.mode.array];
    deepTypeMap['[object Date]'] = dateComparator;
    deepTypeMap['[object Object]'] = objectComp[config.mode.object];
  }

  function getComparatorByType(type) {
    return typeMap[type];
  }

  return {
    multipleComparatorSelector,
    deepComparatorSelector,
    getComparatorByType,
    configure,
  };
}

module.exports = comparatorSelector;
