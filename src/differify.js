/*!
 * Copyright(c) 2020 Fabian Roberto Orue <fabianorue@gmail.com>
 * BSD Licensed
 */
const { isArray } = require('./utils/validations');
const { buildDiff } = require('./property-diff-model');
const Configuration = require('./config-builder');
const COMPARISON_MODE = require('./enums/modes');
const PROPERTY_STATUS = require('./enums/property-status');
const { valueRefEqualityComparator } = require('./comparators');
const comparatorSelector = require('./comparator-selector');

const INVALID_VAL = Symbol('invalid');

const compSelector = comparatorSelector();

function diff(a, b) {
  // here, we avoid comparing by reference because of the nested objects can be changed
  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) {
    return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
  }
  const comparator = compSelector.getComparatorByType(aType);
  return comparator ? comparator(a, b) : valueRefEqualityComparator(a, b);
}

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
    /* eslint-disable no-debugger,guard-for-in */
    for (const i in next) {
      if (Object.prototype.hasOwnProperty.call(next, i)) {
        curr = selector(next[i]);
        if (curr !== INVALID_VAL) {
          o[i] = curr;
        }
      }
    }
    /* eslint-enable no-alert,guard-for-in */
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

const isMergeable = (config) => (config.mode.object === COMPARISON_MODE.DIFF
    && config.mode.array === COMPARISON_MODE.DIFF);

const getValidStatus = (status) => {
  if (typeof status === 'string') {
    const s = status.toUpperCase().trim();
    return Object.values(PROPERTY_STATUS).indexOf(s) !== -1 ? s : null;
  }
  return null;
};

const isValidPropertyDescriptor = (prop) => prop && 'original' in prop && 'current' in prop && 'status' in prop;

function Differify(_config) {
  this.config = new Configuration(_config);
  compSelector.configure(this.config);
}

Differify.prototype.setConfig = function setConfig(_config) {
  this.config = new Configuration(_config);
  compSelector.configure(this.config);
};

Differify.prototype.getConfig = function getConfig() {
  return {
    compareArraysInOrder: this.config.compareArraysInOrder,
    mode: { ...this.config.mode },
  };
};

Differify.prototype.compare = function compare(a, b) {
  return diff(a, b);
};

Differify.prototype.applyLeftChanges = function mergeLeft(
  diffResult,
  diffOnly = false,
) {
  if (diffResult && diffResult._ && isMergeable(this.config)) {
    return applyChanges(
      diffResult._,
      diffOnly
        ? diffChangeSelectorCreator(leftChangeSelector)
        : leftChangeSelector,
    );
  }

  if (isValidPropertyDescriptor(diffResult)) {
    return diffResult.original;
  }

  return null;
};

Differify.prototype.applyRightChanges = function mergeRight(
  diffResult,
  diffOnly = false,
) {
  if (diffResult && diffResult._ && isMergeable(this.config)) {
    return applyChanges(
      diffResult._,
      diffOnly
        ? diffChangeSelectorCreator(rightChangeSelector)
        : rightChangeSelector,
    );
  }

  if (isValidPropertyDescriptor(diffResult)) {
    return diffResult.current;
  }

  return null;
};

Differify.prototype.filterDiffByStatus = function filterStatus(
  diffResult,
  status = PROPERTY_STATUS.MODIFIED,
) {
  const propStatus = getValidStatus(status);
  if (propStatus && diffResult) {
    if (diffResult._ && isMergeable(this.config)) {
      return applyChanges(diffResult._, statusSelectorCreator(status));
    }

    if (
      isValidPropertyDescriptor(diffResult)
      && diffResult.status === propStatus
    ) {
      return diffResult;
    }
  }
  return null;
};

module.exports = Differify;
// export default Differify;
