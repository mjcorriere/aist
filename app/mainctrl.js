
hs3.controller('MainCtrl', function($scope, $q, DataService, stormList, flightList) {

  $scope.stormList = stormList;
  $scope.flightList = flightList;

  $scope.loadSeason = function(season) {

    return $q.all([
      DataService.loadStormData(season)
        .then(function(data) {
          $scope.stormList = data;
        }),
      DataService.loadFlightData(season)
        .then(function(data) {
          $scope.flightList = data;
        })
    ]);
   
  }

});