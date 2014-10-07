hs3.factory('DataService', ['$http', function($http) {
  
  var stormList   = [];
  var ghList      = [];
  
  var DataService = {};

  DataService.getStormList = function() {

    // var rawStorms = $http.get('data/hurricanes.dat');

    
    stormList = [{"name" : "Alberto", "selected" : false, "available" : true},
      {"name" : "Beryl", "selected" : false, "available" : true},
      {"name" : "Chris", "selected" : false, "available" : true},
      {"name" : "Debby", "selected" : false, "available" : false},
      {"name" : "Ernesto", "selected" : false, "available" : true},
      {"name" : "Florence", "selected" : false, "available" : true},
      {"name" : "Helene", "selected" : false, "available" : true},
      {"name" : "Gordon", "selected" : false, "available" : false},
      {"name" : "Isaac", "selected" : false, "available" : true},
      {"name" : "Joyce", "selected" : false, "available" : true},
      {"name" : "Kirk", "selected" : false, "available" : false},
      {"name" : "Leslie", "selected" : false, "available" : false},
      {"name" : "Michael", "selected" : false, "available" : true},
      {"name" : "Nadine", "selected" : false, "available" : true},
      {"name" : "Oscar", "selected" : false, "available" : true},
      {"name" : "Patty", "selected" : false, "available" : true},
      {"name" : "Rafael", "selected" : false, "available" : true},
      {"name" : "Sandy", "selected" : false, "available" : true},
      {"name" : "Tony", "selected" : false, "available" : true}
    ];

    return stormList;
  }

  DataService.getGhList    = function() {
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

  DataService.getHurricaneData      = function() {

    var request = $http.get('data/hurricanes.dat');

    return request.then(parseHurricaneData, handleError);

  }

  function parseHurricaneData(response) {
    console.log('parsing data');
    var data = response.data;
    var lines = data.split('\n');

    for(var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if((line.indexOf('**') < 0) && (line !== '')) {
        var splitLine = line.split(',');
        var name = splitLine[1].trim();
        var numPoints = parseInt(splitLine[2].trim());
        console.log(name, numPoints);

        // SPLIT OUT THE REMAINING LINES. DATE/TIME
        // RETURN


      }
    }

    // REPLACE WITH ACTUAL PARSING OF ACTUAL DATA;
    return [DataService.getStormList(), DataService.getGhList()];
  }

  function handleError(response) {
    console.log('An unknown error occured:',response);
  }

  return DataService;

}]);
