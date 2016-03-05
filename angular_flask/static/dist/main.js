'use strict';

angular.module('app', ['ngRoute', 'ngResource', 'ngMaterial', 'ngAnimate', 'textAngular', 'ngSanitize', 'ngMessages', 'ngPassword', 'ngCookies', 'appFilters'])
    .config(['$routeProvider', '$locationProvider', '$mdThemingProvider',
        function ($routeProvider, $locationProvider, $mdThemingProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'static/partials/landing.html',
                })
                .when('/about', {
                    templateUrl: 'static/partials/about.html',
                })
                .when('/posts', {
                    templateUrl: 'static/partials/post-list.html',
                })
                .when('/new', {
                    templateUrl: 'static/partials/new_post.html',
                    controller: 'NewPostController'
                })
                .when('/edit', {
                    templateUrl: 'static/partials/new_post.html',
                    controller: 'EditPostController'
                })
                .when('/posts/:id', {
                    templateUrl: '/static/partials/post-detail.html',
                    controller: 'PostDetailController',
                    resolve: {
                        response: function ($route, allPosts) {
                            return allPosts.getPosts(parseInt($route.current.params.id, 10));
                        }
                    }
                })
                .when('/blog', {
                    templateUrl: 'static/partials/post-list.html',
                })
                .when('/register', {
                    templateUrl: 'static/partials/register.html',
                })
                .when('/login', {
                    templateUrl: 'static/partials/register.html',
                })
                .when('/me/posts', {
                    templateUrl: 'static/partials/my_posts.html',
                })
                .when('/users/:user', {
                    templateUrl: 'static/partials/profile.html',
                })
                .otherwise({
                    redirectTo: '/'
                });

            //Customize themes for Angular Material
            $mdThemingProvider.theme('default')
                .primaryPalette('blue-grey')
                .accentPalette('red')
                .warnPalette('deep-orange')
                .backgroundPalette('grey');

            $locationProvider.html5Mode(true);
        }
    ])
    .run(function ($rootScope, $location, $cookies) {
        $rootScope.$on("$routeChangeStart", function (event, next) {
            if (next.templateUrl == 'static/partials/new_post.html' || next.templateUrl == 'static/partials/profile.html'
                || next.templateUrl == 'static/partials/my_posts.html') {
                var user = $cookies.get('current_user');
                if (!user || (next.templateUrl == 'static/partials/profile.html' && JSON.parse(user).username != next.params.user)) {
                    $location.path("/login");
                }
            }
        });
    })
;
'use strict';
angular.module('app')
    .controller('PostListController', ['$scope', 'allPosts', 'favoritePost', 'goTo',
        function ($scope, allPosts, favoritePost, goTo) {
            $scope.posts = [];
            $scope.size = "sm"; // Set the last part of 'body-text-' class to sm i.e. 'small'
            allPosts.getPosts()
                .then(function (response) {
                        $scope.posts = response.data.posts;
                        $scope.posts.forEach(function (el) {
                            favoritePost.checkFav(el);
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
        $scope.post = {};
        $scope.size = "lg";
        allPosts.getPosts(parseInt($routeParams.id, 10)).then(function (response) {
                $scope.post = response.data.post;
                $scope.post.comments = response.data.comments;
                favoritePost.checkFav($scope.post)
            },
            function (response) {
                console.log('Error:', response.status, response.statusText);
            });
    }])
    .controller('NewPostController', ['$scope', 'postUpload', '$location', 'imgPreview', '$cookies',
        function ($scope, postUpload, $location, imgPreview, $cookies) {
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
                    $scope.loading = true;
                    var file = $scope.myFile;
                    postUpload.newPost(file, $scope.post)
                        .then(function success(response) {
                            $scope.loading = false;
                            $location.path('/posts');
                        }, function error(response) {
                            console.log('Could not post', response);
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
    .controller('EditPostController', ['$scope', 'editPost', '$location', 'imgPreview', 'sharedPost',
        function ($scope, editPost, $location, imgPreview, sharedPost) {
            $scope.heading = 'Edit';
            $scope.button = 'Save changes';
            $scope.post = sharedPost.post;
            $scope.post.disabled = true;
            $scope.createPost = function (form) {

                if (form.$valid) {
                    $scope.loading = true;
                    var file = $scope.myFile;
                    editPost.editPost(file, $scope.post)
                        .then(function success(response) {
                            $scope.loading = false;
                            $location.path('/posts');
                        }, function error(response) {
                            console.log('Could not edit', response);
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
                            var u = response.data.user;
                            //favs = response.data.favs;
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
        'updateUser', 'sharedPost',
        function ($scope, $rootScope, logoutUser, $cookies, $location, imgPreview, updateUser, sharedPost) {
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
            };

            /* Redirect to '/new' route and clear the sharedPost since we are not editing but creating a new post */
            $scope.createPost = function () {
                sharedPost.post = {};
                $location.path('/new');
            }
        }])
    .controller('UserPostsController', ['$scope', 'userPosts', '$cookies', 'favoritePost', function ($scope, userPosts, $cookies, favoritePost) {
        $scope.size = "sm";

        userPosts.getPosts($cookies.getObject('current_user').id)
            .then(function (response) {
                    $scope.posts = response.data.posts;
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
;
angular.module('app')
    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }])

    .directive('post', function () {
        return {
            restrict: 'E',
            controller: 'PostController',
            templateUrl: 'static/partials/post.html',
            replace: true
        };
    });

'use strict';

/* Filters */

angular.module('appFilters', [])
    .filter('localDate', function () {
        return function (input) {
            return moment(new Date(input)).format('MMM D YYYY HH:mm');
        }
    });
'use strict';

angular.module('app')
    .constant("baseURL", "https://thee-blog.herokuapp.com")
    // A service to share 'post' object between controllers
    .service('sharedPost', function () {
        var post = this;
    })
    /* .service('allPosts', ['$resource', 'baseURL', function ($resource, baseURL) {
     this.getPosts = function () {
     return $resource(baseURL + '/blog/api/posts/:id', {}, {
     query: {
     method: 'GET',
     isArray: true
     }
     });
     }
     }])*/
    .service('allPosts', ['$http', function ($http) {
        this.getPosts = function (id) {
            if (id) {
                return $http.get('/blog/api/posts/' + id, {});
            } else {
                return $http.get('/blog/api/posts', {});
            }

        }
    }])
    .service('postUpload', ['$http', function ($http) {
        this.newPost = function (file, data) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('post', JSON.stringify(data));
            return $http.post("/blog/api/posts/new", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        }
    }])
    .service('editPost', ['$http', function ($http) {
        this.editPost = function (file, data) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('post', JSON.stringify(data));
            return $http.post("/blog/api/posts/" + data.id + "/edit", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        }
    }])
    // Reusable service to ask user for confirmation and delete a post
    .service('deletePost', ['$http', '$mdDialog', function ($http, $mdDialog) {
        this.delete = function (ev, postId) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this post?')
                .textContent('This action cannot be undone.')
                .ariaLabel('Confirm post deletion')
                .targetEvent(ev)
                .ok('Delete')
                .cancel('Cancel');
            return $mdDialog.show(confirm).then(function () {
                return $http.post("/blog/api/posts/" + postId + "/delete", {})
                    .then(function success() {
                            console.log('Deleted post with id', postId);
                        },
                        function error(response) {
                            console.log('Could not delete', response);
                        })
            });
        }
    }])
    .service('createUser', ['$http', function ($http) {
        this.newUser = function (file, user) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('user', JSON.stringify(user));
            return $http.post("/blog/api/users", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        };
        this.loginUser = function (user) {
            return $http.post("/login", user);
        }
    }])
    .service('logoutUser', ['$http', function ($http) {
        this.logout = function () {
            return $http.post("/logout", {});
        }
    }])
    .service('userPosts', ['$http', function ($http) {
        this.getPosts = function (user_id) {
            return $http.get("/blog/api/users/" + user_id + "/posts")
        }
    }])
    .service('imgPreview', function () {
        this.preview = function (element, scope) {
            var reader = new FileReader();
            reader.onload = function (event) {
                scope.imageSrc = event.target.result;
                scope.$apply();
            };
            // when the file is read it triggers the onload event above.
            reader.readAsDataURL(element.files[0]);
        };
        this.activateUpload = function (id) {
            document.getElementById(id).click();
        }
    })
    .service('updateUser', ['$http', function ($http) {
        this.update = function (file, user) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('user', JSON.stringify(user));
            return $http.post("/blog/api/users/edit", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        };
    }])
    .service('favoritePost', ['$http', '$cookies', function ($http, $cookies) {
        this.favorite = function (post) {
            return $http.post("/blog/api/posts/" + post.id, {});
        };

        /* Check if the logged in user has favorited the post and add red color to fav icon if yes */
        this.checkFav = function (post) {
            var user = $cookies.getObject('current_user');
            if (user) {
                var filtered = post.favorited_by.filter(function (el) {
                    return el.username == user.username;
                });
                if (filtered.length) {
                    post.favClass = 'red';
                } else {
                    post.favClass = '';
                }
            }
        }
    }])
    .service('addComment', ['$http', function ($http) {
        this.add = function (comment, postId) {
            return $http.post("/blog/api/posts/" + postId + "/comments/new", JSON.stringify(comment))
        }
    }])
    .service('goTo', ['$anchorScroll', '$location', function ($anchorScroll, $location) {
        this.goTo = function (post, el) {
            var selector = document.getElementById(el);
            // If we are on post detail page, scroll to comments
            if (selector) {
                $location.hash(el);
                $anchorScroll();
                // Else go to post detail page and jump to comments
            } else {
                $location.path('/posts/' + post.id).hash(el);
            }
        }
    }])
    ;


//# sourceMappingURL=maps/main.js.map