hs3.controller('RequestController', 
['$scope', '$filter', '$modal', 'DataService', 'ngTableParams', 
  function($scope, $filter, $modal, DataService, ngTableParams) {

  //TODO: Handle the case where the user starts on / refreshes this page
  
  var data = DataService.getDatasets();

  $scope.tableParams = new ngTableParams({
      page: 1,            // show first page
      count: 10,           // count per page
      filter: {
        title: ''
      },
      sorting: {
        title: 'asc'
      }

  }, {
      total: data.length, // length of data
      getData: function($defer, params) {
          
          var filteredData = params.filter() ?
                  $filter('filter')(data, params.filter()) :
                  data;
          var orderedData = params.sorting() ?
                  $filter('orderBy')(filteredData, params.orderBy()) :
                  data;
          params.total(orderedData.length); // set total for recalc pagination
          $defer.resolve(orderedData.slice((params.page() - 1) 
                          * params.count(), params.page() * params.count()));
      }
  });

  $scope.download = function(granule_id) {

    DataService.requestGranules(granule_id)
      .then(function() {

        var granules = DataService.getGranules();

        var modalOptions = {
          templateUrl : 'partials/dataModal.html',
          controller  : 'ModalController',
          size        : 'lg',
          resolve     : {
              id : function() {
                  return granule_id;
              },
              granules : function() {
                return granules;
              }
          }
        };

        var modalInstance = $modal.open(modalOptions);        

      })



  }

}]);

hs3.controller('ModalController', ['$scope', '$modalInstance', 'id', 'granules',
  function($scope, $modalInstance, id, granules) {

    for(var i = 0; i < granules.length; i++) {
      granules[i].granule_size = parseInt(granules[i].granule_size);
    }

    $scope.id       = id;
    $scope.granules = granules;

    $scope.close = function() {
      $modalInstance.close();
    }

}]);