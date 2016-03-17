'use strict';

app.controller('page404Controller', ['$scope', '$location', '$window', function ($scope, $location, $window) {
    $scope.goHome = function () {
        $location.path('/');
        $window.location.reload();
    }
}]);