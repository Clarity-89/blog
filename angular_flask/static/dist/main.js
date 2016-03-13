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
                    templateUrl: 'static/partials/user_details.html',
                })
                .when('/me/profile', {
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
    .run(function ($rootScope, $location, $cookies, userService) {
        $rootScope.$on("$routeChangeStart", function (event, next) {
            if (next.templateUrl == 'static/partials/new_post.html' || next.templateUrl == 'static/partials/profile.html'
                || next.templateUrl == 'static/partials/my_posts.html') {
                var user = $cookies.get('current_user');
                if (!user) {
                    $location.path("/login");
                }
            }
        });


        /*
         * Check if the user is still logged in on the server in case there were some errors or database reset
         * to prevent the situations when user is logged out on the server but logged in in the browser
         */
        userService.isLoggedIn().then(function (response) {
            var msg = response.data.message;
            if (msg === 'no user' && $cookies.get('current_user')) {
                console.log('user removed');
                $cookies.remove('current_user');
            }
            // Fallback in case there is an unexpected server error
        }, function (response) {
            if ($cookies.get('current_user')) {
                $cookies.remove('current_user');
            }
        })
    })
;
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
                                $window.location.reload();
                                $location.path('/posts/' + response.data.id);

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

    .controller('UserController', ['$scope', 'userService', '$location', '$timeout', '$rootScope', '$cookies', 'imgPreview', 'toast',
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
        }])
    .controller('UserDetailsController', ['$scope', '$rootScope', 'userService', '$cookies', '$location', 'imgPreview', 'toast',
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

            /* Redirect to '/new' route and clear the sharedPost since we are not editing but creating a new post */
            $scope.createPost = function () {
                sharedPost.post = {};
                $location.path('/new');
            };

        }])
    .controller('UserPostsController', ['$scope', 'userService', '$cookies', 'favoritePost',
        function ($scope, userService, $cookies, favoritePost) {
            $scope.size = "sm";
            $scope.page.loading = true;
            userService.getPosts($cookies.getObject('current_user').id)
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
    .controller('UserProfileController', ['userService', '$routeParams', '$scope', 'favoritePost',
        function (userService, $routeParams, $scope, favoritePost) {
            $scope.size = "sm";
            $scope.user = {};

            userService.getDetails($routeParams.user)
                .then(function (response) {
                    $scope.user = response.data.user;
                    $scope.user.favs = response.data.favs;
                }, function (response) {
                    console.log('error', response);
                });

            userService.getPosts($routeParams.user)
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
    // A service to share 'post' object between controllers
    .service('sharedPost', function () {
        var post = this;
    })
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
    .service('toast', ['$mdToast', function ($mdToast) {
        this.showToast = function (message, delay) {
            return $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .position('right top')
                    .parent('#toast')
                    .hideDelay(delay)
            );
        }
    }])
    .service('userService', ['$http', function ($http) {
        this.isLoggedIn = function () {
            return $http.get("/blog/api/current_user");
        };
        this.newUser = function (file, user) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('user', JSON.stringify(user));
            return $http.post("/blog/api/users", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        };

        this.update = function (file, user) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('user', JSON.stringify(user));
            return $http.post("/blog/api/users/edit", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        };

        this.login = function (user) {
            return $http.post("/login", user);
        };

        this.logout = function () {
            return $http.post("/logout", {});
        };

        this.getPosts = function (user_id) {
            return $http.get("/blog/api/users/" + user_id + "/posts")
        };

        this.getDetails = function (id) {
            return $http.get("/blog/api/users/" + id);
        }
    }])
;


//# sourceMappingURL=maps/main.js.map