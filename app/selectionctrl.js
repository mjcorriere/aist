hs3.controller('SelectionCtrl', ['$scope', '$q', 'DataService', 'MapService',
  function($scope, $q, DataService, MapService) {

  var polyLines = [];

  $scope.stormList = [];
  $scope.flightList = [];

  $scope.maxAvailabilityWindow = {};
  $scope.availabilityWindow = {};
  
  $scope.selectedStorms = [];
  $scope.selectedFlights = [];

  loadData();

  $scope.selectStorm = function(storm) {

    if (storm.available) {
      storm.selected = !storm.selected;
      var index = $scope.stormList.indexOf(storm);
      // If storm is being selected, add it to selected storms
      if(storm.selected) {
        $scope.selectedStorms[index] = true;
      } else {
        $scope.selectedStorms[index] = false;
      }      
      // console.log(storm.name, 'selected: ', $scope.stormList[index].selected);
      DataService.updateAvailabilityWindow($scope.selectedFlights, $scope.selectedStorms);
      DataService.updateAvailability();

      MapService.drawSelectedStorms($scope.selectedStorms);
      MapService.drawSelectedFlights($scope.selectedFlights);

    } else {
      // console.log(storm.name, 'unavailable for selection');
    }
  }

  $scope.selectFlight = function(flight) {

    if (flight.available) {
      flight.selected = !flight.selected;
      var index = $scope.flightList.indexOf(flight);
      if(flight.selected) {
        $scope.selectedFlights[index] = true;
      } else {
        $scope.selectedFlights[index] = false;
      }
      // console.log(flight.name, 'selected: ', $scope.flightList[index].selected);
      DataService.updateAvailabilityWindow($scope.selectedFlights, $scope.selectedStorms);
      DataService.updateAvailability();

      MapService.drawSelectedStorms($scope.selectedStorms);
      MapService.drawSelectedFlights($scope.selectedFlights);

    } else {
      // console.log(flight.name, 'unavailable for selection');
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
        console.log('ha durrrrr');
        DataService.initializeAvailability();
        $scope.maxAvailabilityWindow = DataService.getMaxAvailabilityWindow();
        $scope.availabilityWindow = DataService.getCurrentAvailabilityWindow();
    });

  }

}]);