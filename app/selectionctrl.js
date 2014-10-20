hs3.controller('SelectionCtrl', ['$scope', 'DataService', 'MapService',
  function($scope, DataService, MapService) {

  var polyLines = [];

  $scope.stormList = [];
  $scope.flightList = [];

  $scope.maxAvailabilityWindow = {
    "min" : null,
    "max"   : null
  }
  $scope.availabilityWindow = {
    "start": null,
    "end"  : null
  };
  
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

    } else {
      // console.log(flight.name, 'unavailable for selection');
    }
  }

  function loadData() {
    
    DataService.loadStormData()
      .then(function(data) {
        DataService.initializeAvailability();
        $scope.stormList = data;
        $scope.maxAvailabilityWindow = DataService.getMaxAvailabilityWindow();
        $scope.availabilityWindow = DataService.getAvailabilityWindow();
      });

    DataService.loadFlightData()
      .then(function(data) {
        $scope.flightList = data;
      });

  }

}]);