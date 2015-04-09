hs3.controller('RequestController', 
['$scope', '$filter', '$modal', 'DataService', 'ngTableParams', 
  function($scope, $filter, $modal, DataService, ngTableParams) {

  $scope.requestNumber = 1;
  $scope.showRequestPane = false;

  $scope.$on('resultsReceived', function(event, arg) {
    console.log('I heard that the results were received');
    $scope.showRequestPane = true;
    $scope.init();
  });

  $scope.close = function() {
    $scope.showRequestPane = false;
  }

  $scope.init = function() {

    $scope.requestNumber += 1;
    
    var data = DataService.getDatasets();
    
    var count = tableUpdateHack($scope.requestNumber);

    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: count,           // count per page
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

  }

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

      });

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

function tableUpdateHack(n) {

  // The only way to get ngTable to update the data in the table is to
  // change the number of elements per page (count). This 
  // swaps the count between 10 and 11 every time a request is made
  // to ensure the table updates.

    if ((n % 2) == 0) {
      return 10;
    } else {
      return 11;
    }  

}
