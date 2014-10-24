hs3.controller('SelectionCtrl', ['$scope', '$q', 'DataService', 'MapService',
  function($scope, $q, DataService, MapService) {

  var polyLines = [];

  $scope.stormList = [];
  $scope.flightList = [];

  $scope.maxAvailabilityWindow = {};
  $scope.availabilityWindow = {};
  
  // $scope.selectedStorms = [];
  // $scope.selectedFlights = [];

  loadData();

  $scope.selectStorm = function(storm) {

    if (storm.available) {
      
      DataService.selectStorm(storm);

      // MapService.drawSelectedStorms($scope.selectedStorms);
      // MapService.drawSelectedFlights($scope.selectedFlights);

      MapService.drawSelectedStorms();
      MapService.drawSelectedFlights();

    } else {
      console.log(storm.name, 'unavailable for selection');
    }

  }

  $scope.selectFlight = function(flight) {

    if (flight.available) {

      DataService.selectFlight(flight);

      // MapService.drawSelectedStorms($scope.selectedStorms);
      // MapService.drawSelectedFlights($scope.selectedFlights);

      MapService.drawSelectedStorms();
      MapService.drawSelectedFlights();

    } else {
      console.log(flight.name, 'unavailable for selection');
    }
  }

  function loadData() {
    
    $q.all([

      DataService.loadStormData()
        .then(function(data) {
          $scope.stormList = data;
        }),
      DataService.loadFlightData()
        .then(function(data) {
          $scope.flightList = data;
        })

    ]).then(function() {
        DataService.initializeAvailability();
        $scope.maxAvailabilityWindow = DataService.getMaxAvailabilityWindow();
        $scope.availabilityWindow = DataService.getCurrentAvailabilityWindow();
    });

  }

}]);