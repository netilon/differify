/*!
 * Copyright(c) 2020 Fabian Roberto Orue <fabianorue@gmail.com>
 * BSD Licensed
 */
export function isArray(value) : boolean {
  return value && Array.isArray(value);
}

export function isObject(value) : boolean {
  return value && !Array.isArray(value) && typeof value === 'object';
}

export function isValidString(val) : boolean{
  return val && typeof val === 'string' && val.length > 0;
}

export function has(obj, prop) : boolean {
  return obj.hasOwnProperty
    ? obj.hasOwnProperty(prop)
    : obj[prop] !== undefined;
}