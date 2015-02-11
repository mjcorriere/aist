
hs3.controller('MainCtrl', function($scope, $q, DataService, stormList, flightList) {

  $scope.stormList = stormList;
  $scope.flightList = flightList;

  console.log('initial load', stormList, flightList);

  $scope.loadSeason = function(season) {

    console.log('freshhhh season', season);
    return $q.all([
      DataService.loadStormData(season)
        .then(function(data) {
          $scope.stormList = data;
          console.log('explicit load', $scope.stormList);
        }),
      DataService.loadFlightData(season)
        .then(function(data) {
          $scope.flightList = data;
          console.log('explicit load', $scope.flightList);
        })
    ]);
   
  }

});