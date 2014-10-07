hs3.controller('SelectionCtrl', ['$scope', 'DataService', 
  function($scope, DataService) {

  $scope.stormList = [];
  $scope.ghList    = [];

  loadData();

  // $scope.stormList = DataService.getStormList();
  // $scope.ghList    = DataService.getGhList();

  function loadData() {
    DataService.getHurricaneData()
      .then(function(data) {
        $scope.stormList = data[0];
        $scope.ghList    = data[1];
      });
  }

  $scope.selectStorm = function(index) {
    var storm = $scope.stormList[index];
    if (storm.available) {
      storm.selected = !storm.selected;
      console.log(storm.name, 'selected: ', $scope.stormList[index].selected);
      $scope.updateAvailability(storm.start, storm.end);
    } else {
      console.log(storm.name, 'unavailable for selection');
    }
  }

  $scope.updateAvailability = function(start, end) {
    for(var i = 0; i < $scope.stormList.length; i++) {

    }

    for(var i = 0; i < $scope.ghList.length; i++) {

    }

  }

}]);