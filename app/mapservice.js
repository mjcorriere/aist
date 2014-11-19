
hs3.factory('MapService', ['RenderService', 'DataService', '$q', function(RenderService, DataService, $q) {
  
  var stormList       = [];
  var flightList      = [];

  var stormTracks = [];
  var flightTracks = [];

  var selectedWindow;

  var MapService      = {};

  function createIcon() {

    var icon            = {
      path            : google.maps.SymbolPath.CIRCLE
      , fillColor     : randomColor()
      , fillOpacity   : 1.0
      , strokeColor   : 'rgb(0, 0, 0)'
      , strokeWeight  : 2
      , scale         : 6.0
      , optimized     : false
      , map           : null
    };

//    var imgIcon = 'https://google-developers.appspot.com/maps/documentation/javascript/examples/full/images/beachflag.png';

    return icon;
    // return imgIcon;

  }

  MapService.createPolyLines = function() {

    ///******************************

    console.log('initializing storms/flights');

    for (var i = 0; i < stormList.length; i++) {

      stormTracks[i] = {
        "polyline"  : new google.maps.Polyline()
        , "marker"  : new google.maps.Marker({ "icon" : createIcon() })
      };

    }

    for (var i = 0; i < flightList.length; i++) {

      flightTracks[i] = {
        "polyline"  : new google.maps.Polyline()
        , "marker"  : new google.maps.Marker({ "icon" : createIcon() })
      };

    }    

  }

  MapService.drawSelectedStorms = function() {

    var selectedStorms = DataService.getSelectedStorms();

    for(var i = 0; i < selectedStorms.length; i++) {
      var isSelected = selectedStorms[i];

      if (isSelected) {
        
        var options = RenderService.draw(stormList[i], selectedWindow);
        stormTracks[i].polyline.setOptions(options.polylineOptions);

        if (options.polylineOptions.map == null) {
          stormTracks[i].marker.setMap(null);
        } else {
          if (stormTracks[i].marker.map == null) {
            stormTracks[i].marker.setMap(options.markerOptions.map);
          }
          stormTracks[i].marker.setPosition(options.markerOptions.position);          
        }

      } else {
        stormTracks[i].polyline.setMap(null);
        stormTracks[i].marker.setMap(null);
      }      

    }

  }

  MapService.drawSelectedFlights = function() {

    var selectedFlights = DataService.getSelectedFlights();
    
    for(var i = 0; i < selectedFlights.length; i++) {
      var isSelected = selectedFlights[i];

      if (isSelected) {
        
        var options = RenderService.draw(flightList[i], selectedWindow);
        flightTracks[i].polyline.setOptions(options.polylineOptions);

        if (options.polylineOptions.map == null) {
          flightTracks[i].marker.setMap(null);
        } else {
          if (flightTracks[i].marker.map == null) {
            flightTracks[i].marker.setMap(options.markerOptions.map);
          }
          flightTracks[i].marker.setPosition(options.markerOptions.position);          
        }

      } else {
        flightTracks[i].polyline.setMap(null);
        flightTracks[i].marker.setMap(null);
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