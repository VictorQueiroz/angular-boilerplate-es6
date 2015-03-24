var angular = require('angular');

require('angular-aria');
require('angular-animate');
require('angular-messages');
require('angular-ui-router');

module.exports = angular.module('app.components.ui', [
  'ngAria',
  'ngAnimate',
  'ngMessages',
  'ui.router'
]);
