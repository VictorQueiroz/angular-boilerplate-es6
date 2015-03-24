/* */ 
"use strict";
module.exports = {
  strict: require("./other/strict"),
  _validation: require("./internal/validation"),
  "validation.undeclaredVariableCheck": require("./validation/undeclared-variable-check"),
  "validation.react": require("./validation/react"),
  "spec.functionName": require("./spec/function-name"),
  "spec.blockScopedFunctions": require("./spec/block-scoped-functions"),
  "es6.arrowFunctions": require("./es6/arrow-functions"),
  "playground.malletOperator": require("./playground/mallet-operator"),
  "playground.methodBinding": require("./playground/method-binding"),
  "playground.memoizationOperator": require("./playground/memoization-operator"),
  "playground.objectGetterMemoization": require("./playground/object-getter-memoization"),
  reactCompat: require("./other/react-compat"),
  flow: require("./other/flow"),
  react: require("./other/react"),
  _modules: require("./internal/modules"),
  "es7.comprehensions": require("./es7/comprehensions"),
  "es6.classes": require("./es6/classes"),
  asyncToGenerator: require("./other/async-to-generator"),
  bluebirdCoroutines: require("./other/bluebird-coroutines"),
  "es6.objectSuper": require("./es6/object-super"),
  "es7.objectRestSpread": require("./es7/object-rest-spread"),
  "es7.exponentiationOperator": require("./es7/exponentiation-operator"),
  "es6.templateLiterals": require("./es6/template-literals"),
  "es5.properties.mutators": require("./es5/properties.mutators"),
  "es6.properties.shorthand": require("./es6/properties.shorthand"),
  "es6.properties.computed": require("./es6/properties.computed"),
  "es6.forOf": require("./es6/for-of"),
  "es6.regex.sticky": require("./es6/regex.sticky"),
  "es6.regex.unicode": require("./es6/regex.unicode"),
  "es7.abstractReferences": require("./es7/abstract-references"),
  "es6.constants": require("./es6/constants"),
  "es6.parameters.rest": require("./es6/parameters.rest"),
  "es6.spread": require("./es6/spread"),
  "es6.parameters.default": require("./es6/parameters.default"),
  "es6.destructuring": require("./es6/destructuring"),
  "es6.blockScoping": require("./es6/block-scoping"),
  "es6.blockScopingTDZ": require("./es6/block-scoping-tdz"),
  "es6.tailCall": require("./es6/tail-call"),
  regenerator: require("./other/regenerator"),
  runtime: require("./other/runtime"),
  "es6.modules": require("./es6/modules"),
  _blockHoist: require("./internal/block-hoist"),
  "spec.protoToAssign": require("./spec/proto-to-assign"),
  _declarations: require("./internal/declarations"),
  _aliasFunctions: require("./internal/alias-functions"),
  "es6.symbols": require("./es6/symbols"),
  "spec.undefinedToVoid": require("./spec/undefined-to-void"),
  _strict: require("./internal/strict"),
  _moduleFormatter: require("./internal/module-formatter"),
  "es3.propertyLiterals": require("./es3/property-literals"),
  "es3.memberExpressionLiterals": require("./es3/member-expression-literals"),
  "utility.removeDebugger": require("./utility/remove-debugger"),
  "utility.removeConsole": require("./utility/remove-console"),
  "utility.inlineEnvironmentVariables": require("./utility/inline-environment-variables"),
  "utility.inlineExpressions": require("./utility/inline-expressions"),
  "utility.deadCodeElimination": require("./utility/dead-code-elimination"),
  _cleanUp: require("./internal/cleanup")
};