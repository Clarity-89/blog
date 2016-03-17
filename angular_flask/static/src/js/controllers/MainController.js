'use strict';

app.controller('MainController', ['$scope', '$rootScope', 'userService', '$cookies', '$location', 'imgPreview', 'toast',
    'sharedPost', function ($scope, $rootScope, userService, $cookies, $location, imgPreview, toast, sharedPost) {
        $scope.page = {};
        $scope.page.loading = false;
        $scope.isOpen = false;
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

        $scope.logout = function () {
            if ($scope.currentUser()) {
                userService.logout()
                    .then(function success() {
                        $cookies.remove('current_user');
                        $location.path('/');
                    }, function error(response) {
                        console.log('Could not log out', response);
                    });
            }
        };

        $scope.setFile = function (element) {
            return imgPreview.preview(element, $scope);
        };

        $scope.activateUpload = function () {
            return imgPreview.activateUpload('uploadAva');
        };

        /* Redirect to '/new' route and clear the sharedPost since we are not editing but creating a new post */
        $scope.createPost = function () {
            sharedPost.post = {};
            $location.path('/new');
        };

    }]);