var angular = require('angular');

module.exports = angular.module('app.admin', [])
  .config(function ($stateProvider) {
    $stateProvider
      .state('dashboard', {
        url: '/dashboard',
        views: {
          'bodyView': {
            templateUrl: 'dashboard/dashboard.html'
          }
        }
      });
  });
