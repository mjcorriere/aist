var debug;

hs3.factory('DataService', ['$http', function($http) {
  
  var stormList   = [];
  var ghList      = [];
  
  var DataService = {};

  DataService.getStormList = function() {

    // stormList = [{"name" : "Alberto", "selected" : false, "available" : true},
    //   {"name" : "Beryl", "selected" : false, "available" : true},
    //   {"name" : "Chris", "selected" : false, "available" : true},
    //   {"name" : "Debby", "selected" : false, "available" : false},
    //   {"name" : "Ernesto", "selected" : false, "available" : true},
    //   {"name" : "Florence", "selected" : false, "available" : true},
    //   {"name" : "Helene", "selected" : false, "available" : true},
    //   {"name" : "Gordon", "selected" : false, "available" : false},
    //   {"name" : "Isaac", "selected" : false, "available" : true},
    //   {"name" : "Joyce", "selected" : false, "available" : true},
    //   {"name" : "Kirk", "selected" : false, "available" : false},
    //   {"name" : "Leslie", "selected" : false, "available" : false},
    //   {"name" : "Michael", "selected" : false, "available" : true},
    //   {"name" : "Nadine", "selected" : false, "available" : true},
    //   {"name" : "Oscar", "selected" : false, "available" : true},
    //   {"name" : "Patty", "selected" : false, "available" : true},
    //   {"name" : "Rafael", "selected" : false, "available" : true},
    //   {"name" : "Sandy", "selected" : false, "available" : true},
    //   {"name" : "Tony", "selected" : false, "available" : true}
    // ];

    return stormList;
  }

  DataService.getGhList = function() {
    ghList = [{
      "name"      : "November"
      , "flights" : [{
          "gh" : "AV-6"
          , "date" : "11/16"
          , "available" : true
        }]
    },
    {
      "name"      : "October"
      , "flights" : [{
          "gh" : "AV-1"
          , "date" : "10/09"
          , "available" : false
      }]
    }]    
    return ghList;
  }

  DataService.getHurricaneData = function() {

    var request = $http.get('data/storms2013.dat');

    return request.then(parseHurricaneData, handleError);

  }

  DataService.getGhData = function() {
    var request = $http.get('data/gh2013.dat');

    return request.then(parseGhData, handleError);
  }

  function parseHurricaneData(response) {
    console.log('parsing data');
    var data = response.data;
    var lines = data.split('\n');
    lines.pop();
    console.log(lines);
    for(var i = 0; i < lines.length; i++) {
      var line = lines[i].split(', ');

      var name = line[0];
      var numPoints = parseInt(line[1]);
      console.log(name, numPoints);

      var storm = {
        "name" : name
        , "selected"  : false
        , "available" : true
        , "position"  : []
        , "startTime" : null
        , "endTime"   : null
      };

      for(var j = i + 1; j < i + numPoints + 1; j++) {
        console.log(lines[j]);
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

    console.log(stormList);

    // REPLACE WITH ACTUAL PARSING OF ACTUAL DATA;
    return DataService.getStormList();
  }

  function parseGhData(response) {

    return DataService.getGhList();
  }

  function handleError(response) {
    console.log('An unknown error occured:',response);
  }

  return DataService;

}]);
