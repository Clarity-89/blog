'use strict';

app.controller('Page404Controller', ['$scope', '$location', '$window', function ($scope, $location, $window) {
    $scope.goHome = function () {
        $location.path('/');
        $window.location.reload();
    }
}]);