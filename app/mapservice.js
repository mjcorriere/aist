
hs3.factory('MapService', ['RenderService', 'DataService', '$q', function(RenderService, DataService, $q) {
  
  var stormList       = [];
  var flightList      = [];

  var stormPolyLines  = [];
  var flightPolyLines = [];

  var stormTracks = [];
  var flightTracks = [];

  var selectedWindow;

  var MapService      = {};

  MapService.createPolyLines = function() {

    // console.log('creating storm polylines');

    // console.log('stormlist', stormList);

    // for (var i = 0; i < stormList.length; i++) {

    //   var storm = stormList[i];
    //   var path  = [];

    //   for(var j = 0; j < storm.position.length; j++) {
    //     path.push(new google.maps.LatLng(storm.position[j].lat, storm.position[j].lng))
    //   }

    //   stormPolyLines[i] = new google.maps.Polyline({
    //     "path"            : path
    //     , "geodesic"      : true
    //     , "strokeColor"   : randomColor()
    //     , "strokeOpacity" : 1.0
    //     , "strokeWeight"  : 3
    //     , "map"           : null
    //   });      

    // }

    console.log('creating flight polylines');

    console.log('flightlist', flightList);

    for (var i = 0; i < flightList.length; i++) {

      var flight = flightList[i];
      var path = [];

      for(var j = 0; j < flight.position.length; j++) {
        path.push(new google.maps.LatLng(flight.position[j].lat, flight.position[j].lng))
      }

      flightPolyLines[i] = new google.maps.Polyline({
        "path"            : path
        , "geodesic"      : true
        , "strokeColor"   : randomColor()
        , "strokeOpacity" : 1.0
        , "strokeWeight"  : 3
        , "map"           : null
      });      

    }    

    ///******************************

    console.log('initializing storms/flights');

    for (var i = 0; i < stormList.length; i++) {

      stormTracks[i] = {
        "polyline"  : new google.maps.Polyline()
        , "marker"  : new google.maps.Marker()
      };

    }

  }

  MapService.drawSelectedStorms = function() {

    console.log('storm polys', stormPolyLines);
    console.log('selected', selectedStorms);

    var selectedStorms = DataService.getSelectedStorms();
    
    // for(var i = 0; i < selectedStorms.length; i++) {
    //   var isSelected = selectedStorms[i];

    //   if (isSelected) {
    //     RenderService.draw(stormList[i], selectedWindow);
    //   } else {
    //     stormPolyLines[i].setMap(null);
    //   }      

    // }

    for(var i = 0; i < selectedStorms.length; i++) {
      var isSelected = selectedStorms[i];

      if (isSelected) {
        var options = RenderService.draw(stormList[i], selectedWindow);
        stormTracks[i].polyline.setOptions(options.polylineOptions);
        stormTracks[i].marker.setOptions(options.markerOptions);
      } else {
        stormTracks[i].polyline.setMap(null);
        stormTracks[i].marker.setMap(null);
      }      

    }    

  }

  MapService.drawSelectedFlights = function() {

    console.log('flight polys', stormPolyLines);
    console.log('selected', selectedFlights);

    var selectedFlights = DataService.getSelectedFlights();
    
    for(var i = 0; i < selectedFlights.length; i++) {
      var isSelected = selectedFlights[i];

      if (isSelected) {
        RenderService.draw(flightList[i], selectedWindow);
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