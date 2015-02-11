hs3.controller('SelectionCtrl', ['$scope', '$q', 'DataService', 'MapService',
  function($scope, $q, DataService, MapService) {

  DEFAULT_SEASON = '2014';

  var polyLines = [];

  $scope.seasons = {
    '2014': false,
    '2013': false,
    '2012': false
  };

  $scope.maxAvailabilityWindow = DataService.getMaxAvailabilityWindow();
  $scope.availabilityWindow = DataService.getCurrentAvailabilityWindow();

  $scope.selectedSeason = DEFAULT_SEASON;
  $scope.seasons[DEFAULT_SEASON] = true;
  
  $scope.selectSeason = function(season) {
    
    $scope.loadSeason(season).then(function() {
        DataService.initializeAvailability();
        MapService.update();
        $scope.maxAvailabilityWindow = DataService.getMaxAvailabilityWindow();
        $scope.availabilityWindow = DataService.getCurrentAvailabilityWindow();
    });

    $scope.seasons[$scope.selectedSeason] = false;
    $scope.selectedSeason = season;
    $scope.seasons[season] = true;

  }

  $scope.selectStorm = function(storm) {

    if (storm.available) {
      
      DataService.selectStorm(storm);

      MapService.drawSelectedStorms();
      MapService.drawSelectedFlights();

    } else {
      console.log(storm.name, 'unavailable for selection');
    }

  }

  $scope.selectFlight = function(flight) {

    if (flight.available) {

      DataService.selectFlight(flight);

      MapService.drawSelectedStorms();
      MapService.drawSelectedFlights();

    } else {
      console.log(flight.name, 'unavailable for selection');
    }
  }

}]);