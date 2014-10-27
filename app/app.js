
var hs3 = angular.module('hs3', ['ngRoute', 'ui.slider', 'ngSanitize', 'ngTable']);

hs3.config(function($routeProvider) {
  
  $routeProvider
    .when('/', {
      templateUrl : 'main.html',
    })
    .when('/request', {
      templateUrl : 'request.html',
      controller  : 'RequestController'
    });

});