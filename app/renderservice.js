
hs3.service('RenderService', [function() {

  var markers         = [];
  var positionMarker  = null;
  var point           = null;
  var defaultColor    = 'rgb(225, 0, 0)';
  var disabledColor   = 'rgb(225, 225, 225)';
  var strokeOpacity   = 0;
  var stormStrokeOpacity   = 0;
  var flightStrokeOpacity  = 0.9;  
  var disabledOpacity = 0.75;
  var polyLine        = new google.maps.Polyline();
  var pointIcon       = {
    path: google.maps.SymbolPath.CIRCLE
    , fillColor     : defaultColor
    , fillOpacity   : 1.0
    , strokeWeight  : 0
    , scale         : 4.0
  };  
  var icon            = {
    path: google.maps.SymbolPath.CIRCLE
    , fillColor     : defaultColor
    , fillOpacity   : 1.0
    , strokeColor   : 'rgb(0, 0, 0)'
    , strokeWeight  : 2
    , scale         : 6.0
  };
  var dashedLine       = {
    path            : 'M 0,-1 0,1'
    , strokeOpacity : 1
    , scale: 3
  };
  var polylineOptions  = {
    clickable       : false
    , draggable     : false
    , editable      : false
    , geodesic      : true
    , icons         : null
    , map           : map
    , strokeColor   : defaultColor
    , strokeOpacity : strokeOpacity
    , strokeWeight  : 2.0
    , visible       : true
  };
  var stormPolylineOptions  = {
    clickable       : false
    , draggable     : false
    , editable      : false
    , geodesic      : true
    , map           : map
    , strokeColor   : defaultColor
    , strokeOpacity : stormStrokeOpacity
    , strokeWeight  : 2.0
    , visible       : true
    , icons         : [{
        icon        : dashedLine
        , offset    : '0'
        , repeat    : '15px'
    }]
  };
  var flightPolylineOptions  = {
    clickable       : false
    , draggable     : false
    , editable      : false
    , geodesic      : true
    , icons         : null
    , map           : map
    , strokeColor   : defaultColor
    , strokeOpacity : flightStrokeOpacity
    , strokeWeight  : 2.0
    , visible       : true
  };  

  var RenderService = {}

  RenderService.draw = function(trackable, timeWindow, color) {

    var options, markerOptions;

    if (!timeWindow) {
        return null;
    } else if (!timeWindow.hasOwnProperty('lower') 
      || !timeWindow.hasOwnProperty('upper')
      || !timeWindow.hasOwnProperty('mid')) {
      return null;
    }

    if (trackable.type == 'storm') {
      strokeOpacity = stormStrokeOpacity;
      polylineOptions = stormPolylineOptions;
    } else if (trackable.type == 'flight') {
      strokeOpacity = flightStrokeOpacity;
      polylineOptions = flightPolylineOptions;
    }
    
    var position, startIndex, endIndex, startPosition, endPosition, time;

    time      = timeWindow.mid;
    position  = trackable.position;

    if (time < trackable.startTime || time > trackable.endTime) {

      markerOptions = {
        "map"       : null
      };

      polylineOptions.path          = position;
      polylineOptions.strokeOpacity = disabledOpacity;
      polylineOptions.map           = map;
      polylineOptions.strokeColor   = disabledColor;

      options = {
        "polylineOptions" : polylineOptions
        , "markerOptions" : markerOptions
      };

      console.log('Returning greyed path for trackable: ', trackable.name);

      return options;

    }

    if (timeWindow.lower < trackable.startTime) {
      startIndex = 0;
      // startPosition = track[0].position;
      startPosition = new google.maps.LatLng(position[0].lat, position[0].lng);

    } else {
      startIndex = getNearestIndex(trackable, timeWindow.lower);
      startPosition = getPosition(trackable, timeWindow.lower);
    }

    if (timeWindow.upper > trackable.endTime) {
      endIndex = position.length - 2;
      // endPosition = track[track.length - 1].position;
      endPosition = new google.maps.LatLng(
        position[position.length - 1].lat, 
        position[position.length - 1].lng
      );
    } else {
      endIndex = getNearestIndex(trackable, timeWindow.upper);
      endPosition = getPosition(trackable, timeWindow.upper);
    }

    var p = getPosition(trackable, time);

    var subTrack = position.slice(startIndex + 1, endIndex + 1);

    var coordinates = new Array(subTrack.length + 2);

    for(i = 0; i < coordinates.length; i++) {
      // console.log('i: ', i);
      if (i == 0) {
        // console.log('i == 0');
        coordinates[i] = startPosition;
      } else if (i == (coordinates.length - 1)) {
        // console.log('i == coordinates.length');
        coordinates[i] = endPosition;
      } else {
        // console.log('regular i');
        coordinates[i] = new google.maps.LatLng(subTrack[i-1].lat, subTrack[i-1].lng);
      }

    }

    markerOptions = {
      "position"    : p
      , "map"       : map
    };

    polylineOptions.path          = coordinates;
    polylineOptions.strokeColor   = color;
    polylineOptions.strokeOpacity = strokeOpacity;
    polylineOptions.map           = map;

    options = {
      "polylineOptions" : polylineOptions
      , "markerOptions" : markerOptions
    };

    console.log('Returning regular color for trackable: ', trackable.name);

    return options;

  }

  function getNearestIndex(trackable, time) {

    var found     = false
      , position  = trackable.position
      , start     = 0
      , stop      = position.length - 1
      , i         = Math.floor((stop - start) / 2)
    ;

    if (time < position[0].time) {
      return 0;
    } else if (time > (position[position.length - 2].time)) {
      return position.length - 2;
    } else {

      while (!found) {

        if ((time >= position[i].time) && (time <= position[i+1].time)) {
          found = true;
        } else if (time < position[i].time) {
          stop = i - 1;
        } else if (time > position[i].time) {
          start = i + 1;    
        }

        i = start + Math.floor((stop - start) / 2);

      }
    }

    return i;
  
  }

  function getPosition(trackable, time) {

    var position = trackable.position;

    var index = getNearestIndex(trackable, time);
    
    var t0 = position[index].time;
    var p0 = {lat: position[index].lat, lng: position[index].lng};
    
    var t1 = position[index+1].time;
    var p1 = {lat: position[index+1].lat, lng: position[index+1].lng};

    var s = (time - t0) / (t1 - t0);
    var p = {};

    p.lat = s * (p1.lat - p0.lat) + p0.lat;
    p.lng = s * (p1.lng - p0.lng) + p0.lng;

    return new google.maps.LatLng(p.lat, p.lng);

  }

  function clearMarkers() {
    for(i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }

  function deleteMarkers() {
    clearMarkers();
    markers = [];
  }  

  return RenderService;

}]);
