/* */ 
"use strict";
var _interopRequireWildcard = function(obj) {
  return obj && obj.__esModule ? obj : {"default": obj};
};
exports.isCreateClass = isCreateClass;
exports.isCompatTag = isCompatTag;
exports.__esModule = true;
var t = _interopRequireWildcard(require("../../types/index"));
var isCreateClassCallExpression = t.buildMatchMemberExpression("React.createClass");
function isCreateClass(node) {
  if (!node || !t.isCallExpression(node))
    return false;
  if (!isCreateClassCallExpression(node.callee))
    return false;
  var args = node.arguments;
  if (args.length !== 1)
    return false;
  var first = args[0];
  if (!t.isObjectExpression(first))
    return false;
  return true;
}
var isReactComponent = t.buildMatchMemberExpression("React.Component");
exports.isReactComponent = isReactComponent;
function isCompatTag(tagName) {
  return tagName && /^[a-z]|\-/.test(tagName);
}
