import { multiPropDiff } from './diff';
import config from './config';

export type propertySelector = (prop : multiPropDiff) => any;
export type multipleComparatorSelector = (a: any, b: any) => multiPropDiff;
export type deepComparatorSelector = (a: any, b: any) => multiPropDiff;
export type configure = (config: config) => void;

export type comparator = (a: any, b: any) => multiPropDiff;

export type comparatorTypes = {
  string: comparator | null;
  number: comparator | null;
  boolean: comparator | null;
  function: comparator | null;
  object: comparator | null;
};


export type comparatorTypeMap = (type: string) => comparator;

export type ComparatorMethods = {
  multipleComparatorSelector: multipleComparatorSelector;
  deepComparatorSelector: deepComparatorSelector;
  getComparatorByType: comparatorTypeMap;
  configure: configure;
};

export type ComparatorSelectors = () => ComparatorMethods;
