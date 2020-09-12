/*!
 * Copyright(c) 2020 Fabian Roberto Orue <fabianorue@gmail.com>
 * BSD Licensed
 */
module.exports.isArray = function isArray(value) {
  return value && Array.isArray(value);
}

module.exports.isObject = function isObject(value) {
  return value && !Array.isArray(value) && typeof value === 'object';
}

module.exports.isValidString = function isValidString(val) {
  return val && typeof val === 'string' && val.length > 0;
}

module.exports.has = function has(obj, prop) {
  return obj.hasOwnProperty
    ? obj.hasOwnProperty(prop)
    : obj[prop] !== undefined;
}