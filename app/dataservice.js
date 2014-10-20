var debug;

hs3.factory('DataService', ['$http', function($http) {
  
  var stormDataParsed = false;
  var flightDataParsed = false;

  var stormList   = [];
  var flightList  = [];
  
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

  DataService.loadStormData = function() {
    
    var request = $http.get('data/storms2013.dat');

    return request.then(parseStormData, handleError);

  }

  DataService.loadFlightData = function() {

    var request = $http.get('data/gh2013.dat');

    return request.then(parseFlightData, handleError);

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
