
hs3.service('RenderService', [function() {

  var markers      = [];
  var pmarker      = null;
  var point        = null;
  var color        = 'rgb(225, 0, 0)';
  var polyLine     = new google.maps.Polyline();
  var pointIcon    = {
    path: google.maps.SymbolPath.CIRCLE
    , fillColor: color
    , fillOpacity: 1.0
    , strokeWeight: 0
    , scale: 4.0
  };  
  var icon         = {
    path: google.maps.SymbolPath.CIRCLE
    , fillColor: color
    , fillOpacity: 1.0
    , strokeColor: 'rgb(0, 0, 0)'
    , strokeWeight: 2
    , scale: 6.0
  };
  var polyLineOptions  = {
    clickable:      false
    , draggable:    false
    , editable:     false
    , geodesic:     true
    , icons:        null
    , map:          map
    , strokeColor:    color
    , strokeOpacity:  0.9
    , strokeWeight:   2.0
    , visible:      true
  }; 

  var RenderService = {}

  RenderService.draw = function(trackable, timeWindow) {

    if (!timeWindow) {
        return null;
    } else if (!timeWindow.hasOwnProperty('lower') 
      || !timeWindow.hasOwnProperty('upper')
      || !timeWindow.hasOwnProperty('mid')) {
      return null;
    }
    // console.log('DRAW:');
    
    var position, startIndex, endIndex, startPosition, endPosition, time;

    time      = timeWindow.mid;
    position  = trackable.position;

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
    // console.log('subTrack: ', subTrack);
    // console.log('subTrack length: ', subTrack.length);

    var coordinates = new Array(subTrack.length + 2);
    // console.log('coordinates length: ', coordinates.length);
    // deleteMarkers();

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
      
      // marker = new google.maps.Marker({
      //   icon: pointIcon
      //   , position: coordinates[i]
      //   , map: map
      // });
      // markers.push(marker);

    }

    if (pmarker) {

      pmarker.setPosition(p);

    } else {

      pmarker = new google.maps.Marker({
          icon: icon
          , position: p
          , map: map
      });
  
    }

    // console.log(subTrack);

    polyLineOptions.path = coordinates;
    polyLineOptions.map  = map;
    // console.log(this.polyLineOptions);
    polyLine.setOptions(polyLineOptions);

  }

  function getNearestIndex(trackable, time) {

    var found     = false
      , position  = trackable.position
      , start     = 0
      , stop      = position.length - 1
      , i         = Math.floor((stop - start) / 2)
    ;

    // console.log(start, stop, i, found);

    // if ((time < track[0].time) || (time > track[track.length - 1].time)) {
    //  console.log('Value out of bounds');
    //  return null;
    if (time < position[0].time) {
      return 0;
    } else if (time > (position[position.length - 2].time)) {
      return position.length - 2;
    } else {
      //console.log('Searching');
      while (!found) {
        //console.log('start:' + start + ' stop:' + stop + ' i:' + i);
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

    //console.log('found at: ' + i);
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

// Trackable.prototype.setColor = function(color) {
//   this.color = color;
//   this.polyLineOptions.strokeColor = this.color;
//   this.pointIcon.fillColor = this.color;

//   this.polyLine.setOptions(this.polyLineOptions);
//   for(i = 0; i < this.markers.length; i++) {
//     this.markers[i].setIcon(this.pointIcon);
//   }
// }

// Trackable.prototype.setVisible = function(visibility) {
//   this.polyLine.setVisible(visibility);
//   this.pmarker.setVisible(visibility);
//   for (i = 0; i < this.markers.length; i++) {
//     this.markers[i].setVisible(visibility);
//   }
// }



var sampleTrack, t, s, twin;

function makeSample() {

  sampleTrack = [
    {time: +new Date(), position: new google.maps.LatLng(45.713851,-69.918709)}
    , {time: +new Date() + (10 * 60 * 1000), position: new google.maps.LatLng(45.828799, -66.699715)}
    , {time: +new Date() + (20 * 60 * 1000), position: new google.maps.LatLng(45.955213, -66.365433)}
    , {time: +new Date() + (30 * 60 * 1000), position: new google.maps.LatLng(46.235435, -67.053632)}
    , {time: +new Date() + (40 * 60 * 1000), position: new google.maps.LatLng(47.235435, -68.053632)}
    , {time: +new Date() + (50 * 60 * 1000), position: new google.maps.LatLng(48.235435, -69.053632)}
    , {time: +new Date() + (60 * 60 * 1000), position: new google.maps.LatLng(49.235435, -70.053632)}
    , {time: +new Date() + (70 * 60 * 1000), position: new google.maps.LatLng(50.235435, -71.053632)}
    , {time: +new Date() + (80 * 60 * 1000), position: new google.maps.LatLng(51.235435, -72.053632)}
  ]

  t = new Trackable('t', sampleTrack, map);
  t1 = new Trackable('t1', sampleTrack, map);
  t1.setColor('rgb(0, 0, 255)');

  twin = {start: t.track[2].time, end: t.track[5].time};
  twinMid = {start: t.track[2].time - 300000, end: t.track[5].time - 300000};

}