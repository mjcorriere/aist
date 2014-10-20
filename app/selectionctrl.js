hs3.controller('SelectionCtrl', ['$scope', 'DataService', 'MapService',
  function($scope, DataService, MapService) {

  var polyLines = [];

  $scope.stormList = [];
  $scope.flightList = [];

  $scope.maxAvailabilityWindow = {
    "start" : null,
    "end"   : null
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
      $scope.updateAvailabilityWindow();
      $scope.updateAvailability();

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
      $scope.updateAvailabilityWindow();
      $scope.updateAvailability();

    } else {
      // console.log(flight.name, 'unavailable for selection');
    }
  }

  $scope.updateAvailabilityWindow = function() {
    
    var minTime = null;
    var maxTime = null;
    var anyFlightSelected = false;
    // Loop through the currently selected storms and get the
    // maximum window of time.
    // console.log('selectedflights', $scope.selectedFlights);

    for(var i = 0; i < $scope.selectedFlights.length; i++) {
      if($scope.selectedFlights[i] === true) {
        anyFlightSelected = true;
        // console.log('flight', i, 'is selected. checking time.');
        if (minTime === null) {
          minTime = +$scope.flightList[i].startTime;
        } else if (minTime >= $scope.flightList[i].startTime) {
          minTime = +$scope.flightList[i].startTime;
        }

        if (maxTime === null) {
          maxTime = +$scope.flightList[i].endTime;
        } else if (maxTime <= $scope.flightList[i].endTime) {
          maxTime = +$scope.flightList[i].endTime;
        }

      }

    }

    if(!anyFlightSelected) {
      minTime = $scope.maxAvailabilityWindow.start;
      maxTime = $scope.maxAvailabilityWindow.end;
    }

    $scope.availabilityWindow.start = minTime;
    $scope.availabilityWindow.end = maxTime;

  }

  $scope.updateAvailability = function() {
    
    var minTime = $scope.availabilityWindow.start;
    var maxTime = $scope.availabilityWindow.end;

    for (var i = 0; i < $scope.stormList.length; i++) {
      var storm = $scope.stormList[i];

      if ((storm.startTime >= maxTime) || (storm.endTime <= minTime)) {
        storm.available = false;
      } else {
        storm.available = true;
      }

    }

    // console.log($scope.stormList);
  }


  function loadData() {
    
    DataService.loadStormData()
      .then(function(data) {
        $scope.stormList = data;
        initializeAvailability();
      });

    DataService.loadFlightData()
      .then(function(data) {
        $scope.flightList = data;
      });

  }

  function initializeAvailability() {
    
    // console.log('intializing time window');

    var minTime = null;
    var maxTime = null;

    for(var i = 0; i < $scope.stormList.length; i++) {
      // console.log(minTime, maxTime);

      if (minTime === null) {
        minTime = +$scope.stormList[i].startTime;
      } else if (minTime >= $scope.stormList[i].startTime) {
        minTime = +$scope.stormList[i].startTime;
        // console.log('inner mintime', minTime);
      }

      if (maxTime === null) {
        maxTime = +$scope.stormList[i].endTime;
      } else if (maxTime <= $scope.stormList[i].endTime) {
        maxTime = +$scope.stormList[i].endTime;
        // console.log('inner maxtime', maxTime);
      }

    }

    // console.log('final window:', minTime, maxTime);

    $scope.maxAvailabilityWindow.start = minTime;
    $scope.maxAvailabilityWindow.end   = maxTime;

    $scope.availabilityWindow.start = minTime;
    $scope.availabilityWindow.end   = maxTime;

  }


}]);