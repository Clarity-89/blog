'use strict';
app.controller('UserController', ['$scope', 'userService', '$location', '$timeout', '$rootScope', '$cookies', 'imgPreview', 'toast',
    function ($scope, userService, $location, $timeout, $rootScope, $cookies, imgPreview, toast) {
        $scope.page.loading = false;
        $scope.hasAccount = true;
        $scope.changeForm = function () {
            $scope.hasAccount = !$scope.hasAccount;
        };
        $scope.user = {
            username: "",
            email: "",
            password: ""
        };

        $scope.register = function (form) {
            var self = this;

            /* Use logical and here to make sure the function executes only userForm is not undefined, preventing errors*/
            $scope.changeUsername = function () {
                self.userForm && self.userForm.username.$setValidity("userExists", true);
            };

            $scope.changeEmail = function () {
                self.userForm && self.userForm.email.$setValidity("emailExists", true);
            };

            if (form.$valid) {
                $scope.loading = true; // loading spinner
                var file = self.myAva,
                    user = $scope.user;
                userService.newUser(file, user)
                    .then(function success() {
                        $scope.loading = false;
                        toast.showToast('Successfully registered. Please log in with your details.', 1000).then(function () {
                            // Show log in form
                            $scope.hasAccount = true;
                            // Clear form for login in
                            $scope.user = {
                                username: "",
                                password: ""
                            };
                        })
                    }, function error(response) {
                        var userMessage = response.data.message;
                        $scope.loading = false;
                        if (userMessage) {
                            if (userMessage.split(' ')[0] === 'User') {
                                self.userForm.username.$setValidity("userExists", false);
                            } else if (userMessage.split(' ')[0] === 'Email') {
                                self.userForm.email.$setValidity("emailExists", false);
                            } else {
                                toast.showToast('Could not create user. Please try again later', 5000);
                            }
                        } else {
                            toast.showToast('Could not create user. Please try again later', 5000);
                        }
                    });
            }
        };
        $scope.login = function (form) {
            var self = this;

            $scope.changeUsername = function () {
                self.loginForm.username.$setValidity("userExists", true);
            };

            $scope.changePassword = function () {
                self.loginForm.password.$setValidity("passwordIncorrect", true);
            };
            if (form.$valid) {
                $scope.loading = true; // loading spinner
                var user = $scope.user;
                userService.login(user)
                    .then(function success(response) {
                        toast.showToast('Successfully logged in', 3000);
                        $scope.loading = false;
                        var u = response.data.user;
                        $cookies.putObject('current_user', u);
                        $location.path('/posts');
                    }, function error(response) {
                        $scope.loading = false;
                        $scope.userMessage = response.data.message;
                        if ($scope.userMessage === 'username') {
                            self.loginForm.username.$setValidity("userExists", false);
                        } else if ($scope.userMessage === 'password') {
                            self.loginForm.password.$setValidity("passwordIncorrect", false);
                        }
                    });
            }
        };

        $scope.setFile = function (element) {
            return imgPreview.preview(element, $scope);
        };

        $scope.activateUpload = function () {
            return imgPreview.activateUpload('uploadAva');
        }

    }]);