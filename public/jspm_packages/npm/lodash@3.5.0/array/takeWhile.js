/* */ 
var baseCallback = require("../internal/baseCallback"),
    baseSlice = require("../internal/baseSlice");
function takeWhile(array, predicate, thisArg) {
  var length = array ? array.length : 0;
  if (!length) {
    return [];
  }
  var index = -1;
  predicate = baseCallback(predicate, thisArg, 3);
  while (++index < length && predicate(array[index], index, array)) {}
  return baseSlice(array, 0, index);
}
module.exports = takeWhile;
