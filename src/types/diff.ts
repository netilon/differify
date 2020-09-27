import propertyStatus from '../enums/property-status';

export type propDiff = {
  original: any;
  current: any;
  status: propertyStatus;
  changes: number;
  _?: undefined;
};

export type deepPropDiff = {
  _: { [key: string]: propDiff | deepPropDiff } | Array<any> | null;
  status: propertyStatus;
  changes: number;
  original?: undefined;
  current?: undefined;
};

export type multiPropDiff = deepPropDiff | propDiff;
