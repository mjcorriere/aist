hs3.controller('MapCtrl', ['$scope', 'DataService', function($scope, DataService) {
  initializeMap();

  $scope.stormList = [];
  $scope.flightList = [];

  $scope.limits = {};
  $scope.o = {};

  $scope.formatter = function(value) {
    var date = new Date(parseInt(value)).toLocaleDateString();
    return date;
  }

  $scope.redraw = function() {
    console.log('redrawing map');
  }

  loadData();

  function loadData() {
    
    DataService.loadStormData()
      .then(function(data) {
        DataService.initializeAvailability();

        $scope.stormList  = data;
        $scope.limits     = DataService.getMaxAvailabilityWindow();
        $scope.o          = DataService.getAvailabilityWindow();

        console.log('maxAvailabilityWindow', $scope.limits);

        // $scope.o.lower = $scope.limits.min;
        // $scope.o.upper = $scope.limits.max;
        // $scope.o.mid   = ($scope.limits.max + $scope.limits.min) / 2;
       
      });

    DataService.loadFlightData()
      .then(function(data) {
        $scope.flightList = data;
      });

  }  

}]);