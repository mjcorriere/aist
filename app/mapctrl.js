hs3.controller('MapCtrl', 
  ['$scope', '$rootScope', '$location', '$http', 'DataService', 'MapService', 
  function($scope, $rootScope, $location, $http, DataService, MapService) {
  
  initializeMap();

  google.maps.event.addListener(drawingManager, 'polygoncomplete', polygonComplete);

  $scope.limits     = DataService.getCurrentAvailabilityWindow();
  $scope.o          = DataService.getSelectedWindow();

  $scope.polygonDrawn = false;
  $scope.drawingPolygon = false;

  $scope.polygon = null;

  $scope.keyword = '';

  $scope.makingRequest = false;
  $scope.showRequestPane = false;

  $scope.makeRequest = function() {

    var keyword, startTime, endTime, coordinates = [];

    $scope.makingRequest = true;

    keyword = $scope.keyword;
    
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

}]);