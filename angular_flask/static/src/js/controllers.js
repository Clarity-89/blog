'use strict';
angular.module('AngularFlask')
    .controller('PostListController', ['$scope', 'allPosts', function ($scope, allPosts) {
        $scope.posts = [];
        $scope.showPost = false;
        $scope.message = "Loading ...";
        allPosts.getPosts().get()
            .$promise.then(function (response) {
                $scope.posts = response.posts;
                //console.log('Got posts:', response);
                $scope.showPost = true;
                buildGridModel($scope.posts);
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });

        function buildGridModel(posts) {
            var it, results = [];
            for (var j = 0; j < posts.length; j++) {
                it = posts[j];
                it.span = {row: 1, col: 1};
                it.img = 'img-sm';
                it.para = 'para-sm';
                switch (j + 1) {
                    case 1:
                        it.span.row = it.span.col = 2;
                        it.img = 'img-lg';
                        it.para = 'para-lg';
                        break;
                    case 4:
                        it.span.col = 2;
                        break;
                    case 5:
                        it.span.row = it.span.col = 2;
                        it.img = 'img-lg';
                        it.para = 'para-lg';
                        break;
                }
                results.push(it);
            }
            return posts;
        }
    }])
    .controller('NewPostController', ['$scope', 'fileUpload', '$location', function ($scope, fileUpload, $location) {

        $scope.createPost = function () {
            var file = $scope.myFile;
            fileUpload.newPost(file, $scope.post, $scope.htmlVariable);
            $location.path('/');
        };

    }])
    .controller('PostDetailController', ['$scope', 'allPosts', '$routeParams', function ($scope, allPosts, $routeParams) {
        $scope.post = {};
        allPosts.getPosts().get({id: parseInt($routeParams.id, 10)})
            .$promise.then(function (response) {
                //console.log('response is: ', response)
                $scope.post = response.post;
                $scope.showPost = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
    }])
    .controller('UserController', ['$scope', 'createUser', '$location', '$timeout', '$rootScope', '$cookies',
        function ($scope, createUser, $location, $timeout, $rootScope, $cookies) {
            $scope.hasAccount = true;
            $scope.changeForm = function () {
                $scope.hasAccount = !$scope.hasAccount;
            };
            $scope.user = {
                username: "",
                email: "",
                password: ""
            };
            $scope.register = function () {
                var self = this,
                    file = self.myAva,
                    user = $scope.user;
                createUser.newUser(file, user)
                    .then(function success() {
                        $location.path('/posts');
                    }, function error(response) {
                        $scope.userMessage = response.data.message;
                        if ($scope.userMessage.split(' ')[0] === 'User') {
                            self.userForm.username.$setValidity("userExists", false);
                            $timeout(function () {
                                // Set form to valid after timeout to enable submitting it again
                                self.userForm.username.$setValidity("userExists", true);
                            }, 2000);
                        } else if ($scope.userMessage.split(' ')[0] === 'Email') {
                            self.userForm.email.$setValidity("emailExists", false);
                            $timeout(function () {
                                self.userForm.email.$setValidity("emailExists", true);
                            }, 2000);
                        }
                    });
            };
            $scope.login = function () {
                var self = this;
                var user = $scope.user;
                createUser.loginUser(user)
                    .then(function success(response) {
                        var u = response.data;
                        $cookies.putObject('current_user', u);
                        $location.path('/posts');
                    }, function error(response) {
                        $scope.userMessage = response.data.message;
                        console.log('Error message: ', $scope.userMessage)
                        if ($scope.userMessage === 'username') {
                            self.loginForm.username.$setValidity("userExists", false);
                            $timeout(function () {
                                // Set form to valid after timeout to enable submitting it again
                                self.loginForm.username.$setValidity("userExists", true);
                            }, 2000);
                        } else if ($scope.userMessage === 'password') {
                            self.loginForm.password.$setValidity("passwordIncorrect", false);
                            $timeout(function () {
                                self.loginForm.password.$setValidity("passwordIncorrect", true);
                            }, 2000);
                        }
                    });
            };
            $scope.setFile = function (element) {
                /*var self = this;
                 $scope.currentFile = element.files[0];
                 var filesize = Math.round(element.files[0].size / 1024);*/
                var reader = new FileReader();
                reader.onload = function (event) {
                    $scope.imageSrc = event.target.result;
                    $scope.$apply();

                };
                // when the file is read it triggers the onload event above.
                reader.readAsDataURL(element.files[0]);
            };
            $scope.activateUpload = function () {
                document.getElementById('uploadAva').click();
            }
        }])
    .controller('MainCtrl', ['$scope', '$rootScope', 'logoutUser', '$cookies', function ($scope, $rootScope, logoutUser, $cookies) {

        $scope.currentUser = function () {
            return $cookies.get('current_user');
        };

        // Separate function to get user details to avoid loops with JSON.parse
        $scope.getUserDetails = function () {
            if ($scope.currentUser()) {
                return JSON.parse($scope.currentUser());
            }
        };

        $scope.logout = function () {
            if ($scope.currentUser()) {
                logoutUser.logout()
                    .then(function success() {
                        $cookies.remove('current_user');
                        console.log('logged out');
                    }, function error(response) {
                        console.log('Could not log out', response);
                    });
            }
        };
    }])
