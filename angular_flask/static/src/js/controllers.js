'use strict';
angular.module('AngularFlask')
    .controller('PostListController', ['$scope', 'allPosts', 'favoritePost', function ($scope, allPosts, favoritePost) {
        $scope.posts = [];
        $scope.showPost = false;
        $scope.message = "Loading ...";
        allPosts.getPosts().get()
            .$promise.then(function (response) {
                $scope.posts = response.posts;
                $scope.posts.list = true;
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

        $scope.favorite = function (id) {
            console.log("Favoriting a post");
            favoritePost.favorite(id)
                .then(function success(response) {
                        for (var i = 0; i < $scope.posts.length; i++) {
                            if ($scope.posts[i].id === id) {
                                $scope.posts[i] = response.data.post;
                            }
                        }
                    },
                    function error(response) {
                        console.log('Couldn\'t favorite a post', response);
                    }
                )
        }
    }])
    .controller('NewPostController', ['$scope', 'postUpload', '$location', 'imgPreview', '$cookies',
        function ($scope, postUpload, $location, imgPreview, $cookies) {

            $scope.createPost = function (form) {

                if (form.$valid) {
                    var file = $scope.myFile;
                    postUpload.newPost(file, $scope.post)
                        .then(function success(response) {
                            console.log('Posted');
                            $location.path('/posts');
                        }, function error(response) {
                            console.log('Could not post', response);
                        });
                }
            };

            var currentUser = $cookies.getObject('current_user');

            $scope.post = {
                title: '',
                author: currentUser.username,
                avatar: currentUser.avatar,
                date: new Date(),
                cover_photo: '../img/covers/default.jpg',
                disabled: true
            };

            $scope.setFile = function (element) {
                return imgPreview.preview(element, $scope);
            };

            $scope.activateUpload = function () {
                return imgPreview.activateUpload('uploadImage');
            }
        }])
    .controller('PostDetailController', ['$scope', 'allPosts', '$routeParams', 'favoritePost',
        function ($scope, allPosts, $routeParams, favoritePost) {
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

            $scope.favorite = function (id) {
                favoritePost.favorite(id)
                    .then(function success(response) {
                            $scope.post = response.data.post;
                        },
                        function error(response) {
                            console.log('Couldn\'t favorite a post', response);
                        }
                    )
            };

            $scope.editPost = function ($event) {
                $event.preventDefault();
            }

        }])
    .controller('UserController', ['$scope', 'createUser', '$location', '$timeout', '$rootScope', '$cookies', 'imgPreview',
        function ($scope, createUser, $location, $timeout, $rootScope, $cookies, imgPreview) {
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

                $scope.changeUsername = function () {
                    self.userForm.username.$setValidity("userExists", true);
                };

                $scope.changeEmail = function () {
                    self.userForm.email.$setValidity("emailExists", true);
                };

                if (form.$valid) {
                    var file = self.myAva,
                        user = $scope.user;
                    createUser.newUser(file, user)
                        .then(function success() {
                            $location.path('/posts');
                        }, function error(response) {
                            $scope.userMessage = response.data.message;
                            if ($scope.userMessage.split(' ')[0] === 'User') {
                                self.userForm.username.$setValidity("userExists", false);
                            } else if ($scope.userMessage.split(' ')[0] === 'Email') {
                                self.userForm.email.$setValidity("emailExists", false);
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
                    var user = $scope.user;
                    createUser.loginUser(user)
                        .then(function success(response) {
                            var u = response.data.user,
                            favs = response.data.favs;
                            //console.log(u)
                            $cookies.putObject('current_user', u);
                            $location.path('/posts');
                        }, function error(response) {
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
        }])
    .controller('UserDetailsController', ['$scope', '$rootScope', 'logoutUser', '$cookies', '$location', 'imgPreview',
        'updateUser',
        function ($scope, $rootScope, logoutUser, $cookies, $location, imgPreview, updateUser) {
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
                    logoutUser.logout()
                        .then(function success() {
                            $cookies.remove('current_user');
                            console.log('logged out');
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

            $scope.updateUser = function (form) {
                var self = this;
                $scope.change = function () {
                    self.userDetailsForm.password.$setValidity("passwordIncorrect", true);
                };
                if (form.$valid) {
                    var file = self.myAva,
                        user = $scope.user;
                    updateUser.update(file, user)
                        .then(function success(response) {
                            var u = response.data.user;
                            u.favs = response.data.favs;
                            $cookies.putObject('current_user', u);
                            $location.path('/posts');
                        }, function error(response) {
                            $scope.message = response.data.message;
                            if ($scope.message === 'password') {
                                self.userDetailsForm.password.$setValidity("passwordIncorrect", false);
                            }
                        });
                }
            }
        }])
    .controller('UserPostsController', ['$scope', 'userPosts', '$cookies', function ($scope, userPosts, $cookies) {
        userPosts.getPosts(JSON.parse($cookies.get('current_user')).id)
            .then(function (response) {
                    $scope.posts = response.data.posts;
                },
                function (response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                });
    }])