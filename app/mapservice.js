
hs3.factory('MapService', ['DataService', function(DataService) {
  
  var stormList = [];
  var flightList = [];

  var polyLines = [];

  var MapService = {};

  MapService.createPolyLines = function() {

    console.log('creating polylines');

    console.log('stormlist', stormList);

    for (var i = 0; i < stormList.length; i++) {

      var storm = stormList[i];
      var path = [];

      for(var j = 0; j < storm.position.length; j++) {
        path.push(new google.maps.LatLng(storm.position[j].lat, storm.position[j].lng))
      }

      polyLines[i] = new google.maps.Polyline({
        "path": path
        , "geodesic" : true
        , "strokeColor": randomColor()
        , "strokeOpacity": 1.0
        , "strokeWeight" : 3
        , "map": null
      });      

    }

  }

  MapService.drawSelectedStorms = function(selectedStorms) {

    console.log('polys', polyLines);
    console.log('selected', selectedStorms);
    
    for(var i = 0; i < selectedStorms.length; i++) {
      var isSelected = selectedStorms[i];

      if (isSelected) {
        polyLines[i].setMap(map); 
      } else {
        polyLines[i].setMap(null);
      }

    }

  }  

  function loadData() {

    DataService.loadStormData()
      .then(function(data) {
        stormList = data;
        MapService.createPolyLines();
      });    

    DataService.loadFlightData()
      .then(function(data) {
        flightList = data;
      });
   
  }


  function randomColor() {
    
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

  loadData();

  return MapService;

}]);