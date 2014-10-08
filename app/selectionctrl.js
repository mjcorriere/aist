hs3.controller('SelectionCtrl', ['$scope', 'DataService', 
  function($scope, DataService) {

  $scope.stormList = [];
  $scope.ghList    = [];

  $scope.maxAvailabilityWindow = {
    "start" : null,
    "end"   : null
  }
  $scope.availabilityWindow = {
    "start": null,
    "end"  : null
  };
  $scope.selectedStorms = [];

  loadData();

  function loadData() {
    DataService.getHurricaneData()
      .then(function(data) {
        $scope.stormList = data[0];
        $scope.ghList    = data[1];
        initializeAvailability();
      });
  }

  function initializeAvailability() {
    
    console.log('intializing time window');

    var minTime = null;
    var maxTime = null;

    for(var i = 0; i < $scope.stormList.length; i++) {
      console.log(minTime, maxTime);

      if (minTime === null) {
        minTime = +$scope.stormList[i].startTime;
      } else if (minTime >= $scope.stormList[i].startTime) {
        minTime = +$scope.stormList[i].startTime;
        console.log('inner mintime', minTime);
      }

      if (maxTime === null) {
        maxTime = +$scope.stormList[i].endTime;
      } else if (maxTime <= $scope.stormList[i].endTime) {
        maxTime = +$scope.stormList[i].endTime;
        console.log('inner maxtime', maxTime);
      }

    }

    console.log('final window:', minTime, maxTime);

    $scope.maxAvailabilityWindow.start = minTime;
    $scope.maxAvailabilityWindow.end   = maxTime;

    $scope.availabilityWindow.start = minTime;
    $scope.availabilityWindow.end   = maxTime;

  }

  $scope.selectStorm = function(index) {
    var storm = $scope.stormList[index];
    if (storm.available) {
      storm.selected = !storm.selected;

      // If storm is being selected, add it to selected storms
      if(storm.selected) {
        $scope.selectedStorms[index] = true;
      } else {
        $scope.selectedStorms[index] = false;
      }      
      console.log(storm.name, 'selected: ', $scope.stormList[index].selected);
      $scope.updateAvailabilityWindow();
      $scope.updateAvailability();
    } else {
      console.log(storm.name, 'unavailable for selection');
    }
  }

  $scope.updateAvailabilityWindow = function() {
    
    var minTime = null;
    var maxTime = null;
    var anyStormSelected = false;
    // Loop through the currently selected storms and get the
    // maximum window of time.
    console.log('selectedstorms', $scope.selectedStorms);

    for(var i = 0; i < $scope.selectedStorms.length; i++) {
      if($scope.selectedStorms[i] === true) {
        anyStormSelected = true;
        console.log('storm', i, 'is selected. checking time.');
        if (minTime === null) {
          minTime = +$scope.stormList[i].startTime;
        } else if (minTime >= $scope.stormList[i].startTime) {
          minTime = +$scope.stormList[i].startTime;
        }

        if (maxTime === null) {
          maxTime = +$scope.stormList[i].endTime;
        } else if (maxTime <= $scope.stormList[i].endTime) {
          maxTime = +$scope.stormList[i].endTime;
        }

      }

    }

    if(!anyStormSelected) {
      minTime = $scope.maxAvailabilityWindow.start;
      maxTime = $scope.maxAvailabilityWindow.end;
    }

    $scope.availabilityWindow.start = minTime;
    $scope.availabilityWindow.end = maxTime;

  }

  $scope.updateAvailability = function() {
    
    var minTime = $scope.availabilityWindow.start;
    var maxTime = $scope.availabilityWindow.end;

    for(var i = 0; i < $scope.stormList.length; i++) {
      var storm = $scope.stormList[i];

      if(storm.startTime >= minTime) {
        storm.available = true;
      } else {
        storm.available = false;
      }

    }

    console.log($scope.stormList);
  }

}]);