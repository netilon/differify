const COMPARISON_MODE = require('./enums/modes');
const { isObject, isValidString } = require('./utils/validations');

function Configuration(config) {
  this.compareArraysInOrder = true;

  this.mode = {
    array: COMPARISON_MODE.DIFF,
    object: COMPARISON_MODE.DIFF,
    function: COMPARISON_MODE.REFERENCE,
  };

  if (isObject(config)) {
    if (typeof config.compareArraysInOrder === 'boolean') {
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
          comparison === COMPARISON_MODE.REFERENCE
          || comparison === COMPARISON_MODE.STRING
        ) {
          this.mode.function = comparison;
        }
      }
    }
  }
}

module.exports = Configuration;
