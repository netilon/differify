import DIFF_MODES from './enums/modes';
import { isObject, isValidString } from './utils/validations';
import config from './types/config';
export default function Configuration(config?: config) {
  this.compareArraysInOrder = true;

  this.mode = {
    array: DIFF_MODES.DIFF,
    object: DIFF_MODES.DIFF,
    function: DIFF_MODES.REFERENCE,
  };

  if (isObject(config)) {
    if (typeof config.compareArraysInOrder === 'boolean') {
      this.compareArraysInOrder = config.compareArraysInOrder;
    }

    if (isObject(config.mode)) {
      const allowedComparissions = Object.values(DIFF_MODES);

      if (isValidString(config.mode.array)) {
        const comparison = config.mode.array.toUpperCase();
        if (
          allowedComparissions.find((prop) => prop === comparison) !== undefined
        ) {
          this.mode.array = comparison;
        }
      }

      if (isValidString(config.mode.object)) {
        const comparison = config.mode.object.toUpperCase();
        if (
          allowedComparissions.find((prop) => prop === comparison) !== undefined
        ) {
          this.mode.object = comparison;
        }
      }
      if (isValidString(config.mode.function)) {
        const comparison = config.mode.function.toUpperCase();
        if (
          comparison === DIFF_MODES.REFERENCE ||
          comparison === DIFF_MODES.STRING
        ) {
          this.mode.function = comparison;
        }
      }
    }
  }
}
