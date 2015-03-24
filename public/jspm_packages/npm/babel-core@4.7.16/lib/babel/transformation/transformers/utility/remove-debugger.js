/* */ 
"use strict";
var _interopRequireWildcard = function(obj) {
  return obj && obj.__esModule ? obj : {"default": obj};
};
exports.ExpressionStatement = ExpressionStatement;
exports.__esModule = true;
var t = _interopRequireWildcard(require("../../../types/index"));
var optional = true;
exports.optional = optional;
function ExpressionStatement(node) {
  if (this.get("expression").isIdentifier({name: "debugger"})) {
    this.remove();
  }
}
