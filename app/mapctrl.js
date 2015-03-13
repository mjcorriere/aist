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
  $scope.keywords = [];

  $scope.makingRequest = false;
  $scope.showRequestPane = false;

  $scope.requestProgress = {
    "AOI": false,
    "keywords": false,
    "timeWindow": true
  }

  $scope.makeRequest = function() {

    var keywords, startTime, endTime, coordinates = [];

    $scope.makingRequest = true;

    keywords = $scope.keywords.join(' ');
    
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

    DataService.requestDatasets(keywords, startTime, endTime, coordinates)
      .then(function() {
        $scope.makingRequest = false;
        $scope.showRequestPane = true;
        $rootScope.$broadcast('resultsReceived');        
        // $location.path('/request');
      });

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
    console.log('redrawing map');
    MapService.drawSelectedStorms();
    MapService.drawSelectedFlights();
  }

  function polygonComplete(polygon) {
    drawingManager.setDrawingMode(null);
    console.log('polygon complete');
    $scope.polygon = polygon;
    $scope.polygonDrawn = true;
    $scope.requestProgress.AOI = true;
    $scope.drawingPolygon = false;
    $scope.centroid = calculateCentroid(polygon);

    // google.maps.event.addListener(polygon, "dragend", function() {
    //   $scope.centroid = calculateCentroid($scope.polygon);
    //   $scope.apply();
    // });

    $scope.$apply();

  }

  $scope.nudgeUpperLimit = function(minutes) {
    var ms = minutes * 60 * 1000;
    var upper = parseInt($scope.o.upper);
    $scope.o.upper = upper + ms;
    $scope.redraw();
  }

  $scope.nudgeLowerLimit = function(minutes) {
    var ms = minutes * 60 * 1000;
    var lower = parseInt($scope.o.lower);
    $scope.o.lower = lower + ms;
    $scope.redraw();
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