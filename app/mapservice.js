
hs3.factory('MapService', ['RenderService', 'DataService', '$q', function(RenderService, DataService, $q) {
  
  var stormList = [];
  var flightList = [];

  var stormPolyLines = [];
  var flightPolyLines = [];

  var selectedStorms = [];
  var selectedFlights = [];

  var selectedWindow;

  var MapService = {};

  MapService.createPolyLines = function() {

    console.log('creating storm polylines');

    console.log('stormlist', stormList);

    for (var i = 0; i < stormList.length; i++) {

      var storm = stormList[i];
      var path = [];

      for(var j = 0; j < storm.position.length; j++) {
        path.push(new google.maps.LatLng(storm.position[j].lat, storm.position[j].lng))
      }

      stormPolyLines[i] = new google.maps.Polyline({
        "path": path
        , "geodesic" : true
        , "strokeColor": randomColor()
        , "strokeOpacity": 1.0
        , "strokeWeight" : 3
        , "map": null
      });      

    }

    console.log('creating flight polylines');

    console.log('flightlist', flightList);

    for (var i = 0; i < flightList.length; i++) {

      var flight = flightList[i];
      var path = [];

      for(var j = 0; j < flight.position.length; j++) {
        path.push(new google.maps.LatLng(flight.position[j].lat, flight.position[j].lng))
      }

      flightPolyLines[i] = new google.maps.Polyline({
        "path": path
        , "geodesic" : true
        , "strokeColor": randomColor()
        , "strokeOpacity": 1.0
        , "strokeWeight" : 3
        , "map": null
      });      

    }    

  }

  MapService.drawSelectedStorms = function(_selectedStorms) {

    console.log('storm polys', stormPolyLines);
    console.log('selected', selectedStorms);

    if (_selectedStorms) {
      selectedStorms = _selectedStorms;
    }
    
    for(var i = 0; i < selectedStorms.length; i++) {
      var isSelected = selectedStorms[i];

      // if (isSelected) {
      //   stormPolyLines[i].setMap(map); 
      // } else {
      //   stormPolyLines[i].setMap(null);
      // }

      if (isSelected) {
        RenderService.draw(stormList[i], selectedWindow);
      } else {
        stormPolyLines[i].setMap(null);
      }      

    }

  }

  MapService.drawSelectedFlights = function(selectedFlights) {

    console.log('flight polys', stormPolyLines);
    console.log('selected', selectedFlights);
    
    for(var i = 0; i < selectedFlights.length; i++) {
      var isSelected = selectedFlights[i];

      if (isSelected) {
        flightPolyLines[i].setMap(map);
      } else {
        flightPolyLines[i].setMap(null);
      }

    }

  }  

  function loadData() {

    $q.all([
      DataService.loadStormData()
      .then(function(data) {
        stormList = data;
      }), 
      DataService.loadFlightData()
        .then(function(data) {
          flightList = data;
        })
      ]).then(function() {
        console.log('******* WORKRKRKRKED');
        MapService.createPolyLines();
        DataService.initializeAvailability();
        // maxAvailabilityWindow = DataService.getMaxAvailabilityWindow();
        // availabilityWindow = DataService.getCurrentAvailabilityWindow();
        selectedWindow = DataService.getSelectedWindow();
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