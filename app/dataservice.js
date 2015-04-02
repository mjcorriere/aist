var debug;

hs3.factory('DataService', ['$http', function($http) {
  
  servletUrl = "http://mldlinvm.draper.com:8080/aistservlet/";

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

  var keyword, startTime, endTime, coordinates;

  var datasets = [];
  var granules = [];
 
  var DataService = {};

  DataService.requestDatasets = function(_keyword, _startTime, _endTime, _coordinates) {
    // datasets?keyword=AMSU&start=2014-01-03T12:00:00&end=2014-01-04T12:00:00&geotype=bb&coords=116.904,24.527,117.680,39.834    
    var debugRequest = "http://mldlinvm.draper.com:8080/aistservlet/datasets?keyword=airs&start=1999-01-03T12:00:00&end=1999-08-23T12:00:00&geotype=bb&coords=116.904,24.527,141.680,39.834";

    // Format the startTimes

    console.log('Request parameters:', _keyword, _startTime, _endTime, _coordinates)

    keyword     = _keyword      ? _keyword                           : '';
    startTime   = _startTime    ? new Date(_startTime).toISOString() : '';
    endTime     = _endTime      ? new Date(_endTime).toISOString()   : '';
    coordinates = _coordinates  ? _coordinates.join()                : '';

    var request = servletUrl 
                    + 'datasets'
                    + '?keyword=' + keyword
                    + '&start='   + startTime 
                    + '&end='     + endTime 
                    + '&geotype=' + 'polygon'
                    + '&coords='  + coordinates;

    console.log('request: ', request);

    var requestStart = Date.now();
    return $http.get(request, {timeout: 3000})
      .then(function(response) {
        console.log(response);
        datasets = response.data.objects;
        console.log(datasets);
        return true;
      },
      function(response) {
        console.log(response);
        var responseTime = Date.now() - requestStart;
        if (responseTime >= response.config.timeout) {
          console.log('Request timed out after 3 seconds.');
        }
        return false;
      });
  }

  DataService.requestGranules = function(granuleID) {

    var request = servletUrl
                    + 'data'
                    + '?id='      + granuleID
                    + '&start='   + startTime
                    + '&end='     + endTime
                    + '&geotype=' + 'polygon'
                    + '&coords='  + coordinates; 

    return $http.get(request)
      .then(function(response) {
        console.log('Data retrieved');
        console.log(response);
        granules = response.data.objects;
      },
      function() {
        console.log('Data request failed.');
      });

  }

  DataService.getDatasets = function() {
    return datasets;
  }

  DataService.getGranules = function() {
    return granules;
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
    var stormName = storm.name;

    var index = stormList.map(
      function(s) { return s.name; }
    ).indexOf(stormName);

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
    var flightStart = flight.startTime;

    var index = flightList.map(
      function(f) { return +f.startTime; }
    ).indexOf(+flightStart);

    if (flight.selected) {
      selectedFlights[index] = true;
    } else {
      selectedFlights[index] = false;
    }

    DataService.updateAvailabilityWindow();
    DataService.updateAvailability();

  }  

  DataService.loadStormData = function(season) {
    
    var reqestString = 'data/storms' + season + '.dat';
    var request = $http.get(reqestString);

    return request.then(parseStormData, handleError);

  }

  DataService.loadFlightData = function(season) {

    var requestString = 'data/gh' + season + '.dat';
    var request = $http.get(requestString);

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
    maxAvailabilityWindow.max = maxTime;

    currentAvailabilityWindow.min = minTime;
    currentAvailabilityWindow.max = maxTime;

    selectedWindow.lower = minTime;
    selectedWindow.upper = maxTime;

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

  var colorGenerator = new ColorGenerator();

  function parseStormData(response) {
    // console.log('parsing hurricane data');

    // if (!stormDataParsed) {
    //   stormDataParsed = true;
      stormList = [];
      selectedStorms = [];

      var data = response.data;
      var lines = data.split('\n');
      lines.pop();
      // console.log(lines);

      colorGenerator.resetPalletteColors();

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
          , "color"     : colorGenerator.getNextPalletteColor()
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
    // }
    // console.log(stormList);

    return DataService.getStormList();
  }

  function parseFlightData(response) {

    // if (!flightDataParsed) {

    //   flightDataParsed = true;

      flightList = [];
      selectedFlights = [];

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
          , "color"     : colorGenerator.getNextPalletteColor()
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
    // }

    return DataService.getFlightList();
  }

  function handleError(response) {
    // console.log('An unknown error occured:',response);
  }

  function ColorGenerator() {

    // this.colors = [
    //   'rgb(170,  57,  57)',
    //   'rgb(255, 170, 170)',
    //   'rgb(212, 106, 106)',
    //   'rgb(128,  21,  21)',
    //   'rgb( 85,   0,   0)',
    //   'rgb(255,   0,   0)',
    //   'rgb(255,  99,  99)',
    //   'rgb(255,  57,  57)',
    //   'rgb(197,   0,   0)',
    //   'rgb(155,   0,   0)',
    //   'rgb(170, 170,  57)',
    //   'rgb(255, 255, 170)',




    //   'rgb(255, 255,  99)',



    //   'rgb( 45, 136,  45)',
    //   'rgb(136, 204, 136)',
    //   'rgb( 85, 170,  85)',
    //   'rgb( 17, 102,  17)',






    //   'rgb(111,  37, 111)',
    //   'rgb(166, 111, 166)',
    //   'rgb(138,  69, 138)',



    //   'rgb(188,  73, 188)',
    //   'rgb(171,  38, 171)',


    //   'rgb( 41,  80, 109)',
    //   'rgb(113, 142, 164)',
    //   'rgb( 73, 109, 137)',


    //   'rgb( 11,  97, 164)',
    //   'rgb( 80, 140, 187)',
    //   'rgb( 46, 116, 170)',
    //   'rgb(  8,  75, 127)',

    // ];

    this.colors = [

      // Primaries: Red, Yellow, Orange, Purple, Blue
      'rgb(255, 4, 0)',
      'rgb(235, 235, 0)',
      'rgb(232, 131, 12)',
      'rgb(142, 12, 232)',
      'rgb(12, 104, 255)',

      // Shade variation 1: 
      'rgb(255, 84, 0)',
      'rgb(137, 255, 0)',
      'rgb(232, 182, 12)',
      'rgb(232, 12, 160)',
      'rgb(120, 120, 255)',

      // Hand picked:
      'rgb(0, 255, 255)',

      // Blacks, whites, greys
      'rgb(60, 60, 60)',
      'rgb(225, 225, 225)',
      'rgb(150, 150, 150)'

    ];

   this.availableColors = this.colors.slice(0);

  }

  ColorGenerator.prototype.getRandomPalletteColor = function() {

    if (this.availableColors.length == 0) {
      this.availableColors = this.colors.slice(0);
    }

    var length = this.availableColors.length;

    var randomIndex = Math.floor(Math.random() * length);

    var color = this.availableColors[randomIndex];
    this.availableColors.splice(randomIndex, 1);

    return color;

  }

  ColorGenerator.prototype.getNextPalletteColor = function() {
    if (this.availableColors.length == 0) {
      this.resetPalletteColors();
    }
    return this.availableColors.pop();
  }

  ColorGenerator.prototype.resetPalletteColors = function() {
    this.availableColors = this.colors.slice(0);
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


// // Reds, pastels
//    shade 0 = #AA3939 = rgb(170, 57, 57) = rgba(170, 57, 57,1) = rgb0(0.667,0.224,0.224)
//    shade 1 = #FFAAAA = rgb(255,170,170) = rgba(255,170,170,1) = rgb0(1,0.667,0.667)
//    shade 2 = #D46A6A = rgb(212,106,106) = rgba(212,106,106,1) = rgb0(0.831,0.416,0.416)
//    shade 3 = #801515 = rgb(128, 21, 21) = rgba(128, 21, 21,1) = rgb0(0.502,0.082,0.082)
//    shade 4 = #550000 = rgb( 85,  0,  0) = rgba( 85,  0,  0,1) = rgb0(0.333,0,0)

// // Reds, full colors
//    shade 0 = #FF0000 = rgb(255,  0,  0) = rgba(255,  0,  0,1) = rgb0(1,0,0)
//    shade 1 = #FF6363 = rgb(255, 99, 99) = rgba(255, 99, 99,1) = rgb0(1,0.388,0.388)
//    shade 2 = #FF3939 = rgb(255, 57, 57) = rgba(255, 57, 57,1) = rgb0(1,0.224,0.224)
//    shade 3 = #C50000 = rgb(197,  0,  0) = rgba(197,  0,  0,1) = rgb0(0.773,0,0)
//    shade 4 = #9B0000 = rgb(155,  0,  0) = rgba(155,  0,  0,1) = rgb0(0.608,0,0)

// // Yellows, pastels
//    shade 0 = #AAAA39 = rgb(170,170, 57) = rgba(170,170, 57,1) = rgb0(0.667,0.667,0.224)
//    shade 1 = #FFFFAA = rgb(255,255,170) = rgba(255,255,170,1) = rgb0(1,1,0.667)
//    shade 2 = #D4D46A = rgb(212,212,106) = rgba(212,212,106,1) = rgb0(0.831,0.831,0.416)
//    shade 3 = #808015 = rgb(128,128, 21) = rgba(128,128, 21,1) = rgb0(0.502,0.502,0.082)
//    shade 4 = #555500 = rgb( 85, 85,  0) = rgba( 85, 85,  0,1) = rgb0(0.333,0.333,0)

// // Yellows, full colors
//    shade 0 = #FFFF00 = rgb(255,255,  0) = rgba(255,255,  0,1) = rgb0(1,1,0)
//    shade 1 = #FFFF63 = rgb(255,255, 99) = rgba(255,255, 99,1) = rgb0(1,1,0.388)
//    shade 2 = #FFFF39 = rgb(255,255, 57) = rgba(255,255, 57,1) = rgb0(1,1,0.224)
//    shade 3 = #C5C500 = rgb(197,197,  0) = rgba(197,197,  0,1) = rgb0(0.773,0.773,0)
//    shade 4 = #9B9B00 = rgb(155,155,  0) = rgba(155,155,  0,1) = rgb0(0.608,0.608,0)
   
// // Greens, pastels
//    shade 0 = #2D882D = rgb( 45,136, 45) = rgba( 45,136, 45,1) = rgb0(0.176,0.533,0.176)
//    shade 1 = #88CC88 = rgb(136,204,136) = rgba(136,204,136,1) = rgb0(0.533,0.8,0.533)
//    shade 2 = #55AA55 = rgb( 85,170, 85) = rgba( 85,170, 85,1) = rgb0(0.333,0.667,0.333)
//    shade 3 = #116611 = rgb( 17,102, 17) = rgba( 17,102, 17,1) = rgb0(0.067,0.4,0.067)
//    shade 4 = #004400 = rgb(  0, 68,  0) = rgba(  0, 68,  0,1) = rgb0(0,0.267,0)

// // Greens, full colors
//    shade 0 = #00CC00 = rgb(  0,204,  0) = rgba(  0,204,  0,1) = rgb0(0,0.8,0)
//    shade 1 = #54D954 = rgb( 84,217, 84) = rgba( 84,217, 84,1) = rgb0(0.329,0.851,0.329)
//    shade 2 = #2ECF2E = rgb( 46,207, 46) = rgba( 46,207, 46,1) = rgb0(0.18,0.812,0.18)
//    shade 3 = #009E00 = rgb(  0,158,  0) = rgba(  0,158,  0,1) = rgb0(0,0.62,0)
//    shade 4 = #007C00 = rgb(  0,124,  0) = rgba(  0,124,  0,1) = rgb0(0,0.486,0)

// // Purples, pastels
//    shade 0 = #6F256F = rgb(111, 37,111) = rgba(111, 37,111,1) = rgb0(0.435,0.145,0.435)
//    shade 1 = #A66FA6 = rgb(166,111,166) = rgba(166,111,166,1) = rgb0(0.651,0.435,0.651)
//    shade 2 = #8A458A = rgb(138, 69,138) = rgba(138, 69,138,1) = rgb0(0.541,0.271,0.541)
//    shade 3 = #530E53 = rgb( 83, 14, 83) = rgba( 83, 14, 83,1) = rgb0(0.325,0.055,0.325)
//    shade 4 = #370037 = rgb( 55,  0, 55) = rgba( 55,  0, 55,1) = rgb0(0.216,0,0.216)

// // Purples, full colors
//    shade 0 = #A600A6 = rgb(166,  0,166) = rgba(166,  0,166,1) = rgb0(0.651,0,0.651)
//    shade 1 = #BC49BC = rgb(188, 73,188) = rgba(188, 73,188,1) = rgb0(0.737,0.286,0.737)
//    shade 2 = #AB26AB = rgb(171, 38,171) = rgba(171, 38,171,1) = rgb0(0.671,0.149,0.671)
//    shade 3 = #800080 = rgb(128,  0,128) = rgba(128,  0,128,1) = rgb0(0.502,0,0.502)
//    shade 4 = #650065 = rgb(101,  0,101) = rgba(101,  0,101,1) = rgb0(0.396,0,0.396)

// // Blues, pastels
//    shade 0 = #29506D = rgb( 41, 80,109) = rgba( 41, 80,109,1) = rgb0(0.161,0.314,0.427)
//    shade 1 = #718EA4 = rgb(113,142,164) = rgba(113,142,164,1) = rgb0(0.443,0.557,0.643)
//    shade 2 = #496D89 = rgb( 73,109,137) = rgba( 73,109,137,1) = rgb0(0.286,0.427,0.537)
//    shade 3 = #123652 = rgb( 18, 54, 82) = rgba( 18, 54, 82,1) = rgb0(0.071,0.212,0.322)
//    shade 4 = #042037 = rgb(  4, 32, 55) = rgba(  4, 32, 55,1) = rgb0(0.016,0.125,0.216)

// // Blues, full colors
//    shade 0 = #0B61A4 = rgb( 11, 97,164) = rgba( 11, 97,164,1) = rgb0(0.043,0.38,0.643)
//    shade 1 = #508CBB = rgb( 80,140,187) = rgba( 80,140,187,1) = rgb0(0.314,0.549,0.733)
//    shade 2 = #2E74AA = rgb( 46,116,170) = rgba( 46,116,170,1) = rgb0(0.18,0.455,0.667)
//    shade 3 = #084B7F = rgb(  8, 75,127) = rgba(  8, 75,127,1) = rgb0(0.031,0.294,0.498)
//    shade 4 = #053A64 = rgb(  5, 58,100) = rgba(  5, 58,100,1) = rgb0(0.02,0.227,0.392)