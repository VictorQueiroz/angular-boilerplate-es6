/* */ 
"use strict";
var _interopRequireWildcard = function(obj) {
  return obj && obj.__esModule ? obj : {"default": obj};
};
exports.toComputedKey = toComputedKey;
exports.__esModule = true;
var t = _interopRequireWildcard(require("../../types/index"));
function toComputedKey() {
  var node = this.node;
  var key;
  if (this.isMemberExpression()) {
    key = node.property;
  } else if (this.isProperty()) {
    key = node.key;
  } else {
    throw new ReferenceError("todo");
  }
  if (!node.computed) {
    if (t.isIdentifier(key))
      key = t.literal(key.name);
  }
  return key;
}
