/*!
 * Copyright(c) 2020 Fabian Roberto Orue <fabianorue@gmail.com>
 * BSD Licensed
 */

import { deepPropDiff, propDiff } from './types/diff';
import propertyStatus from './enums/property-status';

export function buildDiff(
  original: any,
  current: any,
  status: propertyStatus,
  changes: number = 0
): propDiff {
  return {
    original,
    current,
    status,
    changes,
  };
}

export function buildDeepDiff(
  data,
  status: propertyStatus,
  changes: number = 0
): deepPropDiff {
  return {
    _: data,
    status,
    changes,
  };
}
