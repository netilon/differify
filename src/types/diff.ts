import PROPERTY_STATUS from '../enums/property-status';

export type propDiff = {
  original: any;
  current: any;
  status: PROPERTY_STATUS;
  changes: number;
  _?: undefined;
};

export type deepPropDiff = {
  _: { [key: string]: propDiff | deepPropDiff } | Array<any> | null;
  status: PROPERTY_STATUS;
  changes: number;
  original?: undefined;
  current?: undefined;
};

export type multiPropDiff = deepPropDiff | propDiff;
