var angular = require('angular');

module.exports = angular.module('app', [
  require('./components/components').name,
  require('./dashboard/dashboard').name
]);
