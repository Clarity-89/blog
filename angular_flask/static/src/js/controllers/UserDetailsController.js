'use strict';

app.controller('UserDetailsController', ['$scope', 'toast', 'userService', '$cookies', function ($scope, toast, userService, $cookies) {

    $scope.currentUser = function () {
        return $cookies.get('current_user');
    };

    /* Separate function to get user details to avoid loops with JSON.parse since
     currentUser() is called constantly */
    $scope.getUserDetails = function () {
        if ($scope.currentUser()) {
            return JSON.parse($scope.currentUser());
        }
    };

    $scope.user = $scope.getUserDetails();

    $scope.updateUser = function (form) {
        var self = this;
        $scope.change = function () {
            self.userDetailsForm.password.$setValidity("passwordIncorrect", true);
        };
        if (form.$valid) {
            $scope.loading = true; // loading spinner
            var file = self.myAva,
                user = $scope.user;
            userService.update(file, user)
                .then(function success(response) {
                    $scope.loading = false;
                    toast.showToast('Changes saved', 1000).then(function () {
                        var u = response.data.user;
                        $cookies.putObject('current_user', u);
                    });
                }, function error(response) {
                    $scope.loading = false;
                    $scope.message = response.data.message;
                    if ($scope.message === 'password') {
                        self.userDetailsForm.password.$setValidity("passwordIncorrect", false);
                    } else {
                        toast.showToast('Could not save changes. Please try again later', 3000);
                    }
                });
        }
    };
}]);