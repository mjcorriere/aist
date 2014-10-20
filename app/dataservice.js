var debug;

hs3.factory('DataService', ['$http', function($http) {
  
  var stormDataParsed = false;
  var flightDataParsed = false;

  var stormList   = [];
  var flightList  = [];

  var maxAvailabilityWindow = {
    "min" : null,
    "max" : null
  };

  var currentAvailabilityWindow = {
    "min" : null,
    "max" : null
  };

  var selectedWindow = {
    "lower" : null,
    "upper" : null,
    "mid"   : null
  };

  var availabilityWindow = {
    "lower"  : null,
    "upper"  : null,
    "mid"    : null
  };  
  
  var DataService = {};

  DataService.isStormDataParsed = function() {
    return stormDataParsed;
  }

  DataService.isFlightDataParsed = function() {
    return flightDataParsed;
  }

  DataService.getStormList = function() {
    return stormList;
  }

  DataService.getFlightList = function() {
    return flightList;
  }

  DataService.getMaxAvailabilityWindow = function() {
    return maxAvailabilityWindow;
  }

  DataService.getAvailabilityWindow = function() {
    return availabilityWindow;
  }  

  DataService.loadStormData = function() {
    
    var request = $http.get('data/storms2013.dat');

    return request.then(parseStormData, handleError);

  }

  DataService.loadFlightData = function() {

    var request = $http.get('data/gh2013.dat');

    return request.then(parseFlightData, handleError);

  }

  DataService.initializeAvailability = function() {
    
    // console.log('intializing time window');

    var minTime = null;
    var maxTime = null;

    for(var i = 0; i < stormList.length; i++) {
      // console.log(minTime, maxTime);

      if (minTime === null) {
        minTime = +stormList[i].startTime;
      } else if (minTime >= stormList[i].startTime) {
        minTime = +stormList[i].startTime;
        // console.log('inner mintime', minTime);
      }

      if (maxTime === null) {
        maxTime = +stormList[i].endTime;
      } else if (maxTime <= stormList[i].endTime) {
        maxTime = +stormList[i].endTime;
        // console.log('inner maxtime', maxTime);
      }

    }

    for(var i = 0; i < flightList.length; i++) {
      // console.log(minTime, maxTime);

      if (minTime === null) {
        minTime = +flightList[i].startTime;
      } else if (minTime >= flightList[i].startTime) {
        minTime = +flightList[i].startTime;
        // console.log('inner mintime', minTime);
      }

      if (maxTime === null) {
        maxTime = +flightList[i].endTime;
      } else if (maxTime <= flightList[i].endTime) {
        maxTime = +flightList[i].endTime;
        // console.log('inner maxtime', maxTime);
      }

    }    

    // console.log('final window:', minTime, maxTime);

    maxAvailabilityWindow.min = minTime;
    maxAvailabilityWindow.max   = maxTime;

    availabilityWindow.lower = minTime;
    availabilityWindow.upper   = maxTime;

    availabilityWindow.mid = (maxTime + minTime) / 2;

  }

  DataService.updateAvailabilityWindow = function(selectedFlights, selectedStorms) {
    
    var minTime = null;
    var maxTime = null;
    var nothingSelected = true;
    // Loop through the currently selected flights and get the
    // maximum window of time.
    // console.log('selectedflights', $scope.selectedFlights);

    for(var i = 0; i < selectedFlights.length; i++) {
      if(selectedFlights[i] === true) {
        nothingSelected = false;
        // console.log('flight', i, 'is selected. checking time.');
        if (minTime === null) {
          minTime = +flightList[i].startTime;
        } else if (minTime >= flightList[i].startTime) {
          minTime = +flightList[i].startTime;
        }

        if (maxTime === null) {
          maxTime = +flightList[i].endTime;
        } else if (maxTime <= flightList[i].endTime) {
          maxTime = +flightList[i].endTime;
        }
      }
    }

    for(var i = 0; i < selectedStorms.length; i++) {
      if(selectedStorms[i] === true) {
        nothingSelected = false;
        // console.log('flight', i, 'is selected. checking time.');
        if (minTime === null) {
          minTime = +stormList[i].startTime;
        } else if (minTime >= stormList[i].startTime) {
          minTime = +stormList[i].startTime;
        }

        if (maxTime === null) {
          maxTime = +stormList[i].endTime;
        } else if (maxTime <= stormList[i].endTime) {
          maxTime = +stormList[i].endTime;
        }
      }
    }    

    if(nothingSelected) {
      // Null the thing. This is temporary ...
      minTime = maxAvailabilityWindow.min;
      maxTime = maxAvailabilityWindow.max;
    }

    availabilityWindow.lower = minTime;
    availabilityWindow.upper = maxTime;

    availabilityWindow.mid = (maxTime + minTime) / 2;

  }

  DataService.updateAvailability = function() {
    
    var minTime = availabilityWindow.lower;
    var maxTime = availabilityWindow.upper;

    for (var i = 0; i < stormList.length; i++) {
      var storm = stormList[i];

      if ((storm.startTime >= maxTime) || (storm.endTime <= minTime)) {
        storm.available = false;
      } else {
        storm.available = true;
      }

    }

    for (var i = 0; i < flightList.length; i++) {
      var flight = flightList[i];

      if ((flight.startTime >= maxTime) || (flight.endTime <= minTime)) {
        flight.available = false;
      } else {
        flight.available = true;
      }

    }    

    // console.log($scope.stormList);
  }  

  function parseStormData(response) {
    // console.log('parsing hurricane data');

    if (!stormDataParsed) {
      stormDataParsed = true;
      var data = response.data;
      var lines = data.split('\n');
      lines.pop();
      // console.log(lines);
      for(var i = 0; i < lines.length; i++) {
        var line = lines[i].split(', ');

        var name = line[0];
        var numPoints = parseInt(line[1]);
        // console.log(name, numPoints);

        var storm = {
          "name" : name
          , "selected"  : false
          , "available" : true
          , "position"  : []
          , "startTime" : null
          , "endTime"   : null
        };

        for(var j = i + 1; j < i + numPoints + 1; j++) {
          // console.log(lines[j]);
          var point = lines[j].split(', ');
          storm.position.push({
            "time" : new Date(point[0])
            , "lat" : parseFloat(point[1])
            , "lng" : parseFloat(point[2])
            , "cat" : point[3]
          });

          if (j == (i + 1)) {
            storm.startTime = new Date(point[0]);
          } else if (j == (i + numPoints)) {
            storm.endTime = new Date(point[0]);
          }

        }

        i += numPoints;
        stormList.push(storm);

      }
    }
    // console.log(stormList);

    // REPLACE WITH ACTUAL PARSING OF ACTUAL DATA;
    return DataService.getStormList();
  }

  function parseFlightData(response) {

    // console.log('parsing flight data');
    if (!flightDataParsed) {

      flightDataParsed = true;

      var data = response.data;
      var lines = data.split('\n');

      // console.log(lines);

      for(var i = 0; i < lines.length; i++) {
        var line = lines[i].split(', ');
        // console.log(line);
        var name = line[0];
        var numPoints = parseInt(line[1]);

        // console.log(name, numPoints);

        var flight = {
          "name"        : name
          , "position"  : []
          , "startTime" : null
          , "endTime"   : null
          , "selected"  : false
          , "available" : true
        };

        for(var j = i + 1; j < i + numPoints + 1; j++) {
          
          // console.log(data);
          // console.log(lines);
          // console.log(lines[j]);

          var point = lines[j].split(', ');

          flight.position.push({
            "time" : new Date(point[0])
            , "lat" : parseFloat(point[1])
            , "lng" : parseFloat(point[2])
          });

          if (j == (i+ 1)) {
            flight.startTime = new Date(point[0]);
          } else if (j == (i + numPoints)) {
            flight.endTime = new Date(point[0]);
          }

        }

        i += numPoints;
        flightList.push(flight);

      }
    }

    return DataService.getFlightList();
  }

  function handleError(response) {
    // console.log('An unknown error occured:',response);
  }

  return DataService;

}]);
