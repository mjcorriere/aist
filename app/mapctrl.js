hs3.controller('MapCtrl', ['$scope', function($scope) {
  initializeMap();

  $scope.limits = {
    "min" : 0,
    "max" : 125
  };

  $scope.o = {
    "lower" : 15,
    "upper" : 70,
    "mid"   : 52
  };

  $scope.redraw = function() {
    console.log('redrawing map');
  }

}]);