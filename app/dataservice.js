hs3.factory('DataService', [function() {
  
  var stormList   = [];
  var ghList      = [];
  
  var DataService = {};

  DataService.getStormList = function() {
    
    stormList = [{
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

    return stormList;
  }

  DataService.getGhList    = function() {
    return ghList;
  }

  return DataService;

}]);
