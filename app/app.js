
var GLOBALS = {
    'DEFAULT_SEASON': '2014'
};

var hs3 = angular.module('hs3', ['ngRoute', 'ui.slider', 'ui.bootstrap', 'ngSanitize', 'ngTable']);

hs3.config(function($routeProvider) {
  
  $routeProvider
    .when('/', {
      controller  : 'MainCtrl',
      templateUrl : 'main.html',
      resolve: {
        stormList: function(DataService) { return DataService.loadStormData(GLOBALS.DEFAULT_SEASON); },
        flightList: function(DataService) { return DataService.loadFlightData(GLOBALS.DEFAULT_SEASON); },
      }
    })
    .when('/request', {
      templateUrl : 'request.html',
      controller  : 'RequestController'
    });

});