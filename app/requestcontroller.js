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

        var modalInstance = $modal.open({
            templateUrl : 'dataModal.html',
            controller  : 'ModalController',
            size        : 'lg'
        });

    }

}]);

hs3.controller('ModalController',
  ['$scope', '$modalInstance', 
    function($scope, $modalInstance) {
      $scope.message = 'GTFOOOOOO';      
}]);