
hs3.factory('MapService', ['RenderService', 'DataService', '$q', function(RenderService, DataService, $q) {
  
  var stormList       = [];
  var flightList      = [];

  var stormTracks     = [];
  var flightTracks    = [];

  var selectedWindow;

  var MapService      = {};

  function createIcon(color) {

    var icon            = {
      path            : google.maps.SymbolPath.CIRCLE
      , fillColor     : color
      , fillOpacity   : 1.0
      , strokeColor   : 'rgb(0, 0, 0)'
      , strokeWeight  : 2
      , scale         : 6.0
      , optimized     : false
      , map           : null
    };

    return icon;

  }

  MapService.createPolyLines = function() {

    console.log('initializing storms/flights');
    stormTracks = [];
    flightTracks = [];

    for (var i = 0; i < stormList.length; i++) {

      stormTracks[i] = {
        "polyline"  : new google.maps.Polyline()
        , "marker"  : new google.maps.Marker({ "icon" : createIcon(stormList[i].color) })
        , "color"   : stormList[i].color
      };

    }

    for (var i = 0; i < flightList.length; i++) {

      flightTracks[i] = {
        "polyline"  : new google.maps.Polyline()
        , "marker"  : new google.maps.Marker({ "icon" : createIcon(flightList[i].color) })
        , "color"   : flightList[i].color
      };

    }    

  }

  MapService.drawSelectedStorms = function() {

    var selectedStorms = DataService.getSelectedStorms();

    for(var i = 0; i < selectedStorms.length; i++) {
      var isSelected = selectedStorms[i];

      if (isSelected) {

        var color = stormTracks[i].color;
        
        var options = RenderService.draw(stormList[i], selectedWindow, color);
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

        var color = flightTracks[i].color;
        
        var options = RenderService.draw(flightList[i], selectedWindow, color);
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

  MapService.update = function() {
    
    // Get rid of any currently drawn paths
    for(var i = 0; i < stormTracks.length; i++) {
      stormTracks[i].polyline.setMap(null);
      stormTracks[i].marker.setMap(null);      
    }

    for(var i = 0; i < flightTracks.length; i++) {
      flightTracks[i].polyline.setMap(null);
      flightTracks[i].marker.setMap(null);      
    }

    stormList = DataService.getStormList();
    flightList = DataService.getFlightList();
    MapService.createPolyLines();
    DataService.initializeAvailability();
    selectedWindow = DataService.getSelectedWindow();    
  }

  function loadData() {

    var season = GLOBALS.DEFAULT_SEASON;

    $q.all([
      DataService.loadStormData(season)
      .then(function(data) {
        stormList = data;
      }), 
      DataService.loadFlightData(season)
        .then(function(data) {
          flightList = data;
        })
      ]).then(function() {
        MapService.createPolyLines();
        DataService.initializeAvailability();
        selectedWindow = DataService.getSelectedWindow();
      });
   
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

  loadData();

  return MapService;

}]);