System.import('app').then(function () {
  return System.import('angular');
}).then(function (angular) {
  angular.element(document).ready(function () {
    angular.bootstrap(document, ['app']);
  });
});
