hs3.controller('MapCtrl', 
  ['$scope', '$location', '$http', 'DataService', 'MapService', 
  function($scope, $location, $http, DataService, MapService) {
  
  initializeMap();

  google.maps.event.addListener(drawingManager, 'polygoncomplete', polygonComplete);

  $scope.stormList = [];
  $scope.flightList = [];

  $scope.limits = {};
  $scope.o = {};

  $scope.polygonDrawn = false;
  $scope.drawingPolygon = false;

  $scope.polygon = null;

  $scope.sensorType = '';

  $scope.makeRequest = function() {

    var keyword, startTime, endTime, coordinates = [];

    keyword = $scope.sensorType;
    
    startTime = parseInt($scope.o.lower);
    endTime = parseInt($scope.o.upper);

    console.log('start', startTime, 'end', endTime);

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

      console.log(coordinates);
      
    }

    DataService.requestDatasets(keyword, startTime, endTime, coordinates)
      .then(function() {
        $location.path('/request');
      });

  }

  $scope.startDrawing = function() {
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    $scope.drawingPolygon = true;
  }

  $scope.removePolygon = function() {
    $scope.polygon.setPath([]);
    $scope.polygon.setMap(null);
  }

  $scope.formatter = function(value) {
    var date = new Date(parseInt(value)).toLocaleDateString();
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
    $scope.drawingPolygon = false;
    $scope.$apply();
  }

  loadData();

  function loadData() {
    
    DataService.loadStormData()
      .then(function(data) {
        DataService.initializeAvailability();

        $scope.stormList  = data;
        $scope.limits     = DataService.getCurrentAvailabilityWindow();
        $scope.o          = DataService.getSelectedWindow();

        console.log('maxAvailabilityWindow', $scope.limits);

        // $scope.o.lower = $scope.limits.min;
        // $scope.o.upper = $scope.limits.max;
        // $scope.o.mid   = ($scope.limits.max + $scope.limits.min) / 2;
       
      });

    DataService.loadFlightData()
      .then(function(data) {
        $scope.flightList = data;
      });

  }  

}]);