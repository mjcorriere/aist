hs3.controller('SelectionCtrl', ['$scope', '$q', 'DataService', 'MapService',
  function($scope, $q, DataService, MapService) {

  DEFAULT_SEASON = '2014';

  var polyLines = [];

  $scope.stormList = [];
  $scope.flightList = [];
  $scope.seasons = {
    '2014': false,
    '2013': false,
    '2012': false
  };

  $scope.maxAvailabilityWindow = {};
  $scope.availabilityWindow = {};

  $scope.selectedSeason = DEFAULT_SEASON;
  $scope.seasons[DEFAULT_SEASON] = true;
  loadData(DEFAULT_SEASON);
  
  $scope.selectSeason = function(season) {
    loadData(season);
    $scope.seasons[$scope.selectedSeason] = false;
    $scope.selectedSeason = season;
    $scope.seasons[season] = true;
  }

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

  function loadData(season) {

    $q.all([

      DataService.loadStormData(season)
        .then(function(data) {
          $scope.stormList = data;
        }),
      DataService.loadFlightData(season)
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