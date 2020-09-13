/*!
 * Copyright(c) 2020 Fabian Roberto Orue <fabianorue@gmail.com>
 * BSD Licensed
 */

module.exports.buildDiff = function buildDiff(
  original,
  current,
  status,
  changes = 0,
) {
  return {
    original,
    current,
    status,
    changes,
  };
};

module.exports.buildDeepDiff = function buildDeepDiff(
  data,
  status,
  changes = 0,
) {
  return {
    _: data,
    status,
    changes,
  };
};
