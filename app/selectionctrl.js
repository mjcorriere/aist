hs3.controller('SelectionCtrl', ['$scope', 'DataService', 
  function($scope, DataService) {

  $scope.helloWorld = 'goodbye world';
  $scope.stormList = DataService.getStormList();

}]);