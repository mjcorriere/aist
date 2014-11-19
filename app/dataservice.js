var debug;

hs3.factory('DataService', ['$http', function($http) {
  
  var stormDataParsed   = false;
  var flightDataParsed  = false;

  var stormList         = [];
  var flightList        = [];

  var selectedStorms    = [];
  var selectedFlights   = [];

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

  var datasets = [];
 
  var DataService = {};

  DataService.requestDatasets = function(_keyword, _startTime, _endTime, _coordinates) {
        // datasets?keyword=AMSU&start=2014-01-03T12:00:00&end=2014-01-04T12:00:00&geotype=bb&coords=116.904,24.527,117.680,39.834    
    var servletUrl = "http://mldlinvm.draper.com:8080/aistservlet/";
    var debugRequest = "http://mldlinvm.draper.com:8080/aistservlet/datasets?start=1999-01-03T12:00:00&end=1999-08-23T12:00:00&geotype=bb&coords=116.904,24.527,141.680,39.834";

    // Format the startTimes

    console.log('Request parameters:', _keyword, _startTime, _endTime, _coordinates)

    var keyword     = _keyword      ? _keyword                           : '';
    var startTime   = _startTime    ? new Date(_startTime).toISOString() : '';
    var endTime     = _endTime      ? new Date(_endTime).toISOString()   : '';
    var coordinates = _coordinates  ? _coordinates.join()                : '';

    var request = servletUrl 
                    + 'datasets?start=' + startTime 
                    + '&end=' + endTime 
                    + '&geotype=poly&coords=' + coordinates;


    return $http.get(request)
      .then(function(response) {
        console.log(response);
        datasets = response.data.objects;
        console.log(datasets);
      },
      function() {
        console.log('failed. continuing');
      });
  }

  DataService.getDatasets = function() {
    return datasets;
  }

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

  DataService.getCurrentAvailabilityWindow = function() {
    return currentAvailabilityWindow;
  }

  DataService.getSelectedWindow = function() {
    return selectedWindow;
  }

  DataService.getSelectedStorms = function () {
    return selectedStorms;
  }

  DataService.getSelectedFlights = function () {
    return selectedFlights;
  }  

  DataService.selectStorm = function(storm) {

    storm.selected = !storm.selected;

    var index = stormList.indexOf(storm);

    if (storm.selected) {
      selectedStorms[index] = true;
    } else {
      selectedStorms[index] = false;
    }

    DataService.updateAvailabilityWindow();
    DataService.updateAvailability();

  }

  DataService.selectFlight = function(flight) {

    flight.selected = !flight.selected;

    var index = flightList.indexOf(flight);

    if (flight.selected) {
      selectedFlights[index] = true;
    } else {
      selectedFlights[index] = false;
    }

    DataService.updateAvailabilityWindow();
    DataService.updateAvailability();

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

    currentAvailabilityWindow.min = minTime;
    currentAvailabilityWindow.max   = maxTime;

    selectedWindow.lower = minTime;
    selectedWindow.upper   = maxTime;

    selectedWindow.mid = (maxTime + minTime) / 2;

  }

  DataService.updateAvailabilityWindow = function() {
    
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

    currentAvailabilityWindow.min = minTime;
    currentAvailabilityWindow.max = maxTime;

    selectedWindow.lower = minTime;
    selectedWindow.upper = maxTime;
    selectedWindow.mid = (maxTime + minTime) / 2;

  }

  DataService.updateAvailability = function() {
    
    var minTime = currentAvailabilityWindow.min;
    var maxTime = currentAvailabilityWindow.max;

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

    var colorGenerator = new ColorGenerator();

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
          , "color"     : colorGenerator.getRandomColor()
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

    return DataService.getStormList();
  }

  function parseFlightData(response) {

    var colorGenerator = new ColorGenerator();

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
          , "color"     : colorGenerator.getRandomColor()
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

  function ColorGenerator() {

    this.colors = [
     'rgb(153, 15, 15)',
     'rgb(178, 44, 44)',
     'rgb(204, 81, 81)',
     'rgb(229, 126, 126)',
     'rgb(255, 178, 178)',
     'rgb(153, 84, 15)',
     'rgb(178, 111, 44)',
     'rgb(204, 142, 81)',
     'rgb(229, 177, 126)',
     'rgb(255, 216, 178)',
     'rgb(107, 153, 15)',
     'rgb(133, 178, 44)',
     'rgb(163, 204, 81)',
     'rgb(195, 229, 126)',
     'rgb(229, 255, 178)',
     'rgb(15, 107, 153)',
     'rgb(44, 133, 178)',
     'rgb(81, 163, 204)',
     'rgb(126, 195, 229)',
     'rgb(178, 229, 255)',
     'rgb(38, 15, 153)',
     'rgb(66, 44, 178)',
     'rgb(101, 81, 204)',
     'rgb(143, 126, 229)',
     'rgb(191, 178, 255)'
   ];

   this.availableColors = this.colors.slice(0);

  }

  ColorGenerator.prototype.getPalletteColor = function() {

    if (this.availableColors.length == 0) {
      this.availableColors = this.colors.slice(0);
    }

    var length = this.availableColors.length;

    var randomIndex = Math.floor(Math.random() * length);

    var color = this.availableColors[randomIndex];
    this.availableColors.splice(randomIndex, 1);

    return color;

  }

  ColorGenerator.prototype.getRandomColor = function() {

    var red   = Math.floor(255 * Math.random())
      , green = Math.floor(255 * Math.random())
      , blue  = Math.floor(255 * Math.random())
    ;

    var color = 'rgb('
            + red   + ','
            + green + ','
            + blue  + ')';

    return color;
 
  }  

  return DataService;

}]);
