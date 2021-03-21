/*!
 * Copyright(c) 2020 Fabian Roberto Orue <fabianorue@gmail.com>
 * BSD Licensed
 */
import DIFF_MODES from './enums/modes';
import { isArray } from './utils/validations';
import { buildDiff } from './property-diff-model';
import Configuration from './config-builder';
import PROPERTY_STATUS from './enums/property-status';
import { valueRefEqualityComparator } from './comparators';
import comparatorSelector from './comparator-selector';
import { propertySelector } from './types/comparators';
import config from './types/config';
import { multiPropDiff, deepPropDiff, propDiff } from './types/diff';

const INVALID_VAL = Symbol('invalid');

const compSelector = comparatorSelector();

function diff(a: any, b: any): multiPropDiff {
  // here, we avoid comparing by reference because of the nested objects can be changed
  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) {
    return buildDiff(a, b, PROPERTY_STATUS.MODIFIED, 1);
  }
  const comparator = compSelector.getComparatorByType(aType);
  return comparator ? comparator(a, b) : valueRefEqualityComparator(a, b);
}

/**
 * It returns a normalized output based on the type of the
 * input when the output is invalid.
 * @param inputData
 * @param outputData
 * @returns
 */
function normalizeInvalidOutputFormat(inputData, outputData) {
  return outputData === INVALID_VAL
    ? Array.isArray(inputData)
      ? []
      : {}
    : outputData;
}

const applyChanges = (next, selector: propertySelector) => {
  if (isArray(next)) {
    const list = [];
    let curr;
    for (let i = 0; i < next.length; i++) {
      curr = selector(next[i]);
      if (curr !== INVALID_VAL) {
        list.push(curr);
      }
    }

    return list.length === 0 ? INVALID_VAL : list;
  }

  if (typeof next === 'object') {
    const o = {};
    let curr;
    let atLeastOneProp = false;
    /* eslint-disable no-debugger,guard-for-in */
    for (const i in next) {
      if (Object.prototype.hasOwnProperty.call(next, i)) {
        curr = selector(next[i]);
        if (curr !== INVALID_VAL) {
          o[i] = curr;
          atLeastOneProp = true;
        }
      }
    }
    /* eslint-enable no-alert,guard-for-in */
    return atLeastOneProp ? o : INVALID_VAL;
  }

  return selector(next);
};

const rightChangeSelector = (curr: multiPropDiff) => {
  if (curr._) {
    return applyChanges(curr._, rightChangeSelector);
  }
  return curr.status === PROPERTY_STATUS.DELETED ? curr.original : curr.current;
};

const leftChangeSelector = (curr: multiPropDiff) => {
  if (curr._) {
    return applyChanges(curr._, leftChangeSelector);
  }
  return curr.status === PROPERTY_STATUS.ADDED ? curr.current : curr.original;
};

const diffChangeSelectorCreator = (selector: propertySelector) => {
  const diffChangeSelector = (curr) => {
    if (curr._ && curr.changes > 0) {
      return applyChanges(curr._, diffChangeSelector);
    }
    return curr.status === PROPERTY_STATUS.EQUAL ? INVALID_VAL : selector(curr);
  };
  return diffChangeSelector;
};

const statusSelectorCreator = (status: string) => {
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

const isMergeable = (config: config) =>
  config.mode.object === DIFF_MODES.DIFF &&
  config.mode.array === DIFF_MODES.DIFF;

const getValidStatus = (status: string): string | null => {
  if (typeof status === 'string') {
    const s = status.toUpperCase().trim();
    return Object.keys(PROPERTY_STATUS).find((prop) => s === prop) !== undefined
      ? s
      : null;
  }
  return null;
};

const isValidPropertyDescriptor = (prop) =>
  prop && 'original' in prop && 'current' in prop && 'status' in prop;

class Differify {
  static DIFF_MODES = DIFF_MODES;
  static PROPERTY_STATUS = PROPERTY_STATUS;
  static multiPropDiff: multiPropDiff;
  static deepPropDiff: deepPropDiff;
  static propDiff: propDiff;
  static config: config;

  private config: config = null;
  constructor(config?: config) {
    this.config = new Configuration(config);
    compSelector.configure(this.config);
  }
  /**
   * It sets the configuration options that will be applied when compare() method is called.
   * @param _config
   */
  setConfig = (_config: config) => {
    this.config = new Configuration(_config);
    compSelector.configure(this.config);
  };

  /**
   * It returns a copy of the current configuration object.
   * @returns {config}
   */
  getConfig = (): config => {
    return {
      compareArraysInOrder: this.config.compareArraysInOrder,
      mode: { ...this.config.mode },
    };
  };

  /**
   * It returns the difference between two entities.
   * @param a
   * @param b
   * @returns {multiPropDiff}
   */
  compare = (a: any, b: any): multiPropDiff => {
    return diff(a, b);
  };

  /**
   * It will apply the changes (merge both entities) and will keep the modified values
   * @param {multiPropDiff} diffResult | it is the Object returned by the compare() method call.
   * @param {boolean} diffOnly | It returns just the difference (only the !== EQUAL properties) [default: false].
   * @returns {Object|Array}
   */
  applyLeftChanges = (diffResult: multiPropDiff, diffOnly: boolean = false) => {
    if (diffResult && diffResult._ && isMergeable(this.config)) {
      return normalizeInvalidOutputFormat(
        diffResult._,
        applyChanges(
          diffResult._,
          diffOnly
            ? diffChangeSelectorCreator(leftChangeSelector)
            : leftChangeSelector
        )
      );
    }

    if (isValidPropertyDescriptor(diffResult)) {
      return diffResult.original;
    }

    return null;
  };

  /**
   * It will apply the changes (merge both entities) and will keep the modified values
   * @param {multiPropDiff} diffResult | it is the Object returned by the compare() method call.
   * @param {boolean} diffOnly | It returns just the difference (only the !== EQUAL properties)
   * @returns {Object}
   */
  applyRightChanges = (
    diffResult: multiPropDiff,
    diffOnly: boolean = false
  ) => {
    if (diffResult && diffResult._ && isMergeable(this.config)) {
      return normalizeInvalidOutputFormat(
        diffResult._,
        applyChanges(
          diffResult._,
          diffOnly
            ? diffChangeSelectorCreator(rightChangeSelector)
            : rightChangeSelector
        )
      );
    }

    if (isValidPropertyDescriptor(diffResult)) {
      return diffResult.current;
    }

    return null;
  };

  /**
   * It will return the changes that match with the specified status (second parameter).
   * @param {multiPropDiff} diffResult | It is the Object returned by the compare() method call.
   * @param {boolean} status | one of the following (ADDED || MODIFIED || DELETED || EQUAL).
   * @returns {Object|Array} | depending on if the input is an Object or an Array.
   */
  filterDiffByStatus = (
    diffResult: multiPropDiff,
    status: string = PROPERTY_STATUS.MODIFIED
  ) => {
    const propStatus = getValidStatus(status);
    if (propStatus && diffResult) {
      if (diffResult._ && isMergeable(this.config)) {
        return normalizeInvalidOutputFormat(
          diffResult._,
          applyChanges(diffResult._, statusSelectorCreator(status))
        );
      }

      if (
        isValidPropertyDescriptor(diffResult) &&
        diffResult.status === propStatus
      ) {
        return diffResult;
      }
    }
    return null;
  };
}

export default Differify;
