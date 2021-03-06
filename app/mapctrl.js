hs3.controller('MapCtrl', 
  ['$scope', '$rootScope', '$location', '$http', 'DataService', 'MapService', 
  function($scope, $rootScope, $location, $http, DataService, MapService) {
  
  initializeMap();

  google.maps.event.addListener(drawingManager, 'polygoncomplete', polygonComplete);

  $scope.limits     = DataService.getCurrentAvailabilityWindow();
  $scope.o          = DataService.getSelectedWindow();

  $scope.polygonDrawn = false;
  $scope.drawingPolygon = false;
  $scope.centroid = 'None';

  $scope.polygon = null;

  $scope.keyword = '';
  $scope.selectedKeyword = 'Select a Keyword';
  $scope.keywords = [];


  $scope.makingRequest = false;
  $scope.showRequestPane = false;
  $scope.requestFailed = false;

  $scope.requestProgress = {
    "AOI": false,
    "keywords": false,
    "timeWindow": false
  };

  $scope.keywordList = ["AIRS", "AMSR", "AMSU-A", "AVHRR-3", "CALIOP", "CPR", "METOP-A", "MLS", "MODIS", "PR", "SEVIRI", "SSM", "TANSO-FTS", "TES", "VIRS"];
  $scope.keywordMap = {
    "AIRS": "sensor",
    "AMSR": "instrument",
    "AMSU-A": "instrument",
    "AVHRR-3": "instrument",
    "CALIOP": "platform",
    "CPR": "instrument",
    "METOP-A": "platform",
    "MLS": "sensor",
    "MODIS": "instrument",
    "PR": "instrument",
    "SEVIRI": "instrument",
    "SSM": "sensor",
    "TANSO-FTS": "instrument",
    "TES": "instrument",
    "VIRS": "sensor"
  };

  $scope.makeRequest = function() {

    var startTime, endTime;
    var coordinates = [],
        sensors     = [],
        instruments = [],
        platforms   = [],
        searchTerms = {};

    $scope.makingRequest = true;

    for (var i = 0; i < $scope.keywords.length; i++) {
      var keyword = $scope.keywords[i];
      eval($scope.keywordMap[keyword] + 's').push(keyword);
    }

    var keywords = $scope.keywords.join(' ');

    searchTerms.sensors = sensors;
    searchTerms.instruments = instruments;
    searchTerms.platforms = platforms;
    
    startTime = parseInt($scope.o.lower);
    endTime = parseInt($scope.o.upper);

    if ($scope.polygon) {

      var raw = $scope.polygon.getPath().getArray();

      // ECHO API takes coordinates in (lng, lat) order

      for (var i = 0; i < raw.length; i++) {
        coordinates.push(raw[i].lng());
        coordinates.push(raw[i].lat());
      }

      // ECHO API requires first coordinate as the last coordinate to close the polygon

      coordinates.push(raw[0].lng());
      coordinates.push(raw[0].lat());
      
    }    

    DataService.requestDatasets(startTime, endTime, coordinates, searchTerms)
      .then(function(success) {
        $scope.makingRequest = false;
        if (success) {
          $scope.showRequestPane = true;
          $rootScope.$broadcast('resultsReceived');
        } else {
          $scope.requestFailed = true;
        }
      });

  }

  $scope.cancelTimeoutError = function() {
    $scope.requestFailed = false;
  }

  $scope.startDrawing = function() {
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    $scope.drawingPolygon = true;
  }

  $scope.cancelDrawing = function() {
    drawingManager.setDrawingMode(null);
    $scope.drawingPolygon = false;
  }

  $scope.removePolygon = function() {
    $scope.polygon.setPath([]);
    $scope.polygon.setMap(null);
    $scope.polygonDrawn = false;
    $scope.requestProgress.AOI = false;
    $scope.centroid = 'None'
  }

  $scope.addKeyword = function(keyword) {
    if (keyword !== '') {
      if ($scope.keywords.length == 0) {
        $scope.requestProgress.keywords = true;
      }
      $scope.keywords.push(keyword);
    }
    $scope.selectedKeyword = keyword;
    $scope.keyword = '';

  }

  $scope.removeKeyword = function(keyword) {
    for (var i = 0; i < $scope.keywords.length; i++) {
      if ($scope.keywords[i] == keyword) {
        $scope.keywords.splice(i, 1);
      }
    }
    if ($scope.keywords.length == 0) {
      $scope.requestProgress.keywords = false;
    }
  }

  $scope.dateFormatter = function(value) {
    var date = new Date(parseInt(value)).toLocaleDateString();
    return date;
  }

  $scope.dateTimeFormatter = function(value) {
    var date = new Date(parseInt(value)).toLocaleString();
    return date;
  }

  $scope.redraw = function() {

    MapService.drawSelectedStorms();
    MapService.drawSelectedFlights();

  }

  $scope.nudgeUpperLimit = function(minutes) {
    var delta = minutes * 60 * 1000;
    var upper = parseInt($scope.o.upper);
    if (isValidNudge(delta, 'upper')) {
      $scope.o.upper = upper + delta;
      $scope.redraw();
    }
  }

  $scope.nudgeLowerLimit = function(minutes) {
    var delta = minutes * 60 * 1000;
    var lower = parseInt($scope.o.lower);
    if (isValidNudge(delta, 'lower')) {
      $scope.o.lower = lower + delta;
      $scope.redraw();
    }
  }

  function polygonComplete(polygon) {
    drawingManager.setDrawingMode(null);
    console.log('polygon complete');
    $scope.polygon = polygon;
    $scope.polygonDrawn = true;
    $scope.requestProgress.AOI = true;
    $scope.drawingPolygon = false;
    $scope.centroid = calculateCentroid(polygon);

    $scope.$apply();

  }

  function isValidNudge(delta, handle) {

    var isValid = false;
    if (handle == 'lower') {
      var value = parseInt($scope.o.lower) + delta;
      if (value > $scope.limits.min && value < $scope.o.mid) {
        isValid = true;
      }
    } else if (handle == 'upper') {
      var value = parseInt($scope.o.upper) + delta;
      if (value < $scope.limits.max && value > $scope.o.mid) {
        isValid = true;
      }
    }
    return isValid;
  }

  function calculateCentroid(polygon) {
    var coordinates = $scope.polygon.getPath().getArray();
    var latSum, lngSum, averageLats, averageLngs, centroid;

    latSum = 0;
    lngSum = 0;

    for (var i = 0; i < coordinates.length; i++) {
      latSum += coordinates[i].lat();
      lngSum += coordinates[i].lng();
    }

    averageLats = latSum / coordinates.length;
    averageLngs = lngSum / coordinates.length;

    centroid = averageLats.toFixed(3) + ', ' + averageLngs.toFixed(3);

    return centroid;

  }

}]);