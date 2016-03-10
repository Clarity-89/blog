'use strict';
angular.module('app')
    .controller('PostListController', ['$scope', 'allPosts', 'favoritePost', 'goTo',
        function ($scope, allPosts, favoritePost, goTo) {
            $scope.page.loading = true;
            $scope.posts = [];
            $scope.size = "sm"; // Set the last part of 'body-text-' class to sm i.e. 'small'
            allPosts.getPosts()
                .then(function (response) {
                        $scope.posts = response.data.posts;
                        $scope.page.loading = false;
                        $scope.posts.forEach(function (el) {
                            favoritePost.checkFav(el);
                            el.date = new Date(el.date);
                        });
                        buildGridModel($scope.posts);
                    },
                    function (response) {
                        console.log('Error:', response.status, response.statusText);
                    });

            // Build a grid of posts of various sizes
            function buildGridModel(posts) {
                var it, results = [];

                for (var j = 0; j < posts.length; j++) {

                    it = posts[j];
                    it.span = {
                        row: randomSpan(),
                        col: randomSpan()
                    };
                    it.img = it.span.row === 2 ? 'img-lg' : 'img-sm';
                    it.para = it.span.col === 2 && it.span.row === 1 ? 'para-md' : it.span.col === 1 && it.span.row === 1 ? 'para-sm' : 'para-lg';
                    results.push(it);
                }
                return posts;
            }

            // Get a random number for spans
            function randomSpan() {
                var r = Math.random();
                if (r < 0.7) {
                    return 1;
                } else {
                    return 2;
                }
            }

            $scope.favorite = function (post) {
                favoritePost.favorite(post)
                    .then(function success(response) {
                            angular.extend(post, response.data.post);
                            favoritePost.checkFav(post);
                        },
                        function error(response) {
                            console.log('Couldn\'t favorite a post', response);
                        }
                    )
            };

            $scope.gotoComments = function (post) {
                goTo.goTo(post, 'comments');
            };
        }])
    .controller('PostDetailController', ['$scope', '$routeParams', 'favoritePost', 'allPosts', function ($scope, $routeParams, favoritePost, allPosts) {
        $scope.page.loading = true;
        $scope.post = {};
        $scope.size = "lg";
        allPosts.getPosts(parseInt($routeParams.id, 10)).then(function (response) {
                $scope.post = response.data.post;
                $scope.post.comments = response.data.comments;
                $scope.page.loading = false;
                favoritePost.checkFav($scope.post)
            },
            function (response) {
                console.log('Error:', response.status, response.statusText);
            });
    }])
    .controller('NewPostController', ['$scope', 'postUpload', '$location', 'imgPreview', '$cookies', 'toast',
        function ($scope, postUpload, $location, imgPreview, $cookies, toast) {
            $scope.page.loading = false; // loading progress bar
            var currentUser = $cookies.getObject('current_user');
            $scope.heading = 'Create';
            $scope.button = 'Publish';
            if (currentUser) {
                $scope.post = {
                    title: '',
                    author: currentUser.username,
                    avatar: currentUser.avatar,
                    date: new Date(),
                    cover_photo: '../img/covers/default.jpg',
                    disabled: true
                };
            }
            $scope.createPost = function (form) {

                if (form.$valid) {
                    $scope.loading = true; // loading spinner
                    var file = $scope.myFile;
                    postUpload.newPost(file, $scope.post)
                        .then(function success(response) {
                            $scope.loading = false;
                            toast.showToast('Post created', 1000).then(function () {
                                $location.path('/posts/' + response.data.id);
                            })
                        }, function error(response) {
                            $scope.loading = false;
                            toast.showToast('Could not create post. Please try again later', 5000);
                        });
                }
            };

            $scope.setFile = function (element) {
                return imgPreview.preview(element, $scope);
            };

            $scope.activateUpload = function () {
                return imgPreview.activateUpload('uploadImage');
            }
        }])
    .controller('EditPostController', ['$scope', 'editPost', '$location', 'imgPreview', 'sharedPost', 'toast', '$window',
        function ($scope, editPost, $location, imgPreview, sharedPost, toast, $window) {
            $scope.page.loading = false; // loading progress bar
            $scope.heading = 'Edit';
            $scope.button = 'Save changes';
            $scope.post = sharedPost.post;
            $scope.post.disabled = true;
            $scope.createPost = function (form) {

                if (form.$valid) {
                    $scope.loading = true; // loading spinner
                    var file = $scope.myFile;
                    editPost.editPost(file, $scope.post)
                        .then(function success(response) {
                            $scope.loading = false;
                            toast.showToast('Post edited', 1000).then(function () {
                                $location.path('/posts/' + response.data.id);
                                $window.location.reload();
                            });
                        }, function error(response) {
                            $scope.loading = false;
                            toast.showToast('Could not edit post. Please try again later', 5000);
                        });
                }
            };

            $scope.setFile = function (element) {
                return imgPreview.preview(element, $scope);
            };

            $scope.activateUpload = function () {
                return imgPreview.activateUpload('uploadImage');
            }
        }])

    .controller('UserController', ['$scope', 'createUser', '$location', '$timeout', '$rootScope', '$cookies', 'imgPreview', 'toast',
        function ($scope, createUser, $location, $timeout, $rootScope, $cookies, imgPreview, toast) {
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
                    createUser.newUser(file, user)
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
                    createUser.loginUser(user)
                        .then(function success(response) {
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
        }])
    .controller('UserDetailsController', ['$scope', '$rootScope', 'logoutUser', '$cookies', '$location', 'imgPreview',
        'updateUser', 'sharedPost',
        function ($scope, $rootScope, logoutUser, $cookies, $location, imgPreview, updateUser, sharedPost) {
            $scope.page = {};
            $scope.page.loading = true;
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
            };

            /* Redirect to '/new' route and clear the sharedPost since we are not editing but creating a new post */
            $scope.createPost = function () {
                sharedPost.post = {};
                $location.path('/new');
            }
        }])
    .controller('UserPostsController', ['$scope', 'userPosts', '$cookies', 'favoritePost', function ($scope, userPosts, $cookies, favoritePost) {
        $scope.size = "sm";
        $scope.page.loading = true;
        userPosts.getPosts($cookies.getObject('current_user').id)
            .then(function (response) {
                    $scope.posts = response.data.posts;
                    $scope.page.loading = false;
                    $scope.posts.forEach(function (el) {
                        favoritePost.checkFav(el);
                    });
                },
                function (response) {
                    console.log('Error:', response.status, response.statusText);
                });

    }])
    .controller('PostController', ['$scope', 'favoritePost', 'deletePost', '$location', 'sharedPost', 'addComment', '$mdDialog', 'goTo',
        function ($scope, favoritePost, deletePost, $location, sharedPost, addComment, $mdDialog, goTo) {

            $scope.favorite = function (post) {
                favoritePost.favorite(post)
                    .then(function success(response) {
                            angular.extend(post, response.data.post);
                            favoritePost.checkFav(post);
                        },
                        function error(response) {
                            console.log('Couldn\'t favorite a post', response);
                        }
                    )
            };

            $scope.editPost = function (post) {
                sharedPost.post = post;
                $location.path('/edit');
            };

            // Show modal to ask for confirmation of post deletion
            $scope.showConfirm = function (ev, postId) {
                deletePost.delete(ev, postId)
                    .then(function () {
                        // if there's posts array, we're in the post list controller or user posts controller and have to update the list
                        if ($scope.posts) {
                            for (var i = 0; i < $scope.posts.length; i++) {
                                if ($scope.posts[i].id === postId) {
                                    $scope.posts.splice(i, 1);
                                }
                            }
                            // Else just redirect to /posts
                        } else {
                            $location.path('/posts');
                        }
                    })
            };

            $scope.addComment = function (post) {
                var self = this;
                addComment.add(self.comment, post.id)
                    .then(function success(response) {
                        self.comment = '';
                        angular.extend(post.comments, response.data.comments);
                    }, function error(response) {
                        console.log('Could not add comment', response);
                    });
            };

            $scope.gotoComments = function (post) {
                goTo.goTo(post, 'comments');
            };

            $scope.showAdvanced = function (ev, post) {

                $mdDialog.show({
                    templateUrl: 'static/partials/user-list.html',
                    locals: {
                        post: post
                    },
                    controller: 'DialogController',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: false
                });
            }
        }])
    .controller('DialogController', ['$scope', '$mdDialog', 'post', function ($scope, $mdDialog, post) {

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.post = post;
    }])
    .controller('page404Controller', ['$scope', '$location', '$window', function ($scope, $location, $window) {
        $scope.goHome = function () {
            $location.path('/');
            $window.location.reload();
        }
    }])
    .controller('aboutController', ['$scope', function ($scope) {
        $scope.page.loading = false;
    }])
;