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

  $scope.makeRequest = function() {

    DataService.getDatasets()
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