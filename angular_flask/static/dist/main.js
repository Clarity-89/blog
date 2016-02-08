'use strict';

angular.module('AngularFlask', ['ngRoute', 'ngResource', 'ngMaterial', 'ngAnimate', 'textAngular', 'ngSanitize', 'ngMessages', 'ngPassword', 'ngCookies'])
    .config(['$routeProvider', '$locationProvider', '$mdThemingProvider', '$httpProvider',
        function ($routeProvider, $locationProvider, $mdThemingProvider, $httpProvider) {
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
                })
                .when('/posts/:id', {
                    templateUrl: '/static/partials/post-detail.html',
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
            /* .otherwise({
             redirectTo: '/'
             });*/

            //Customize themes for Angular Material
            $mdThemingProvider.theme('default')
                .primaryPalette('blue-grey')
                .accentPalette('orange')
                .backgroundPalette('grey');

            $locationProvider.html5Mode(true);
        }
    ])
    .config(function ($provide) {

        $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) {
            taRegisterTool('uploadImage', {
                buttontext: 'Upload Image',
                iconclass: "fa fa-image",
                action: function () {
                    document.getElementById('uploadImage').click();
                }
            });
            taOptions.toolbar[1].push('uploadImage');
            return taOptions;
        }]);
    })
    .run(function ($rootScope, $location, $cookies) {
        $rootScope.$on("$routeChangeStart", function (event, next) {
            if (next.templateUrl == 'static/partials/new_post.html') {
                var user = $cookies.get('current_user');
                if (!user) {
                    $location.path("/login");
                }
            }
        });
    })
;
'use strict';
angular.module('AngularFlask')
    .controller('PostListController', ['$scope', 'allPosts', function ($scope, allPosts) {
        $scope.posts = [];
        $scope.showPost = false;
        $scope.message = "Loading ...";
        allPosts.getPosts().get()
            .$promise.then(function (response) {
                $scope.posts = response.posts;
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
                var self = this;
                var user = $scope.user;
                createUser.newUser(user)
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
                    .then(function success() {
                        console.log("Successfully logged in");
                        $cookies.putObject('current_user', user);
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
        $scope.logout = function () {
            if ($cookies.get('current_user')) {
                logoutUser.logout()
                    .then(function success() {
                        $cookies.remove('current_user');
                        console.log('logged out');
                    }, function error(response) {
                        console.log('Could not log out', response);
                    });
            }
        };
        $scope.isLoggedIn = function () {
            return $cookies.get('current_user');
        }
    }])

angular.module('AngularFlask')
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

'use strict';

/* Filters */

angular.module('angularFlaskFilters', []).filter('uppercase', function () {
    return function (input) {
        return input.toUpperCase();
    }
});
'use strict';

angular.module('AngularFlask')
    .constant("baseURL", "http://0.0.0.0:5000")
    .service('allPosts', ['$resource', 'baseURL', function ($resource, baseURL) {
        this.getPosts = function () {
            return $resource(baseURL + '/blog/api/posts/:id', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            });
        }
    }])
    .service('fileUpload', ['$http', function ($http) {
        this.newPost = function (file, data1, data2) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append("content", JSON.stringify(data1));
            fd.append("content2", JSON.stringify(data2));
            $http.post("http://0.0.0.0:5000" + "/blog/api/posts/new", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        }
    }])
    .service('createUser', ['$http', function ($http) {
        this.newUser = function (user) {
            return $http.post("http://0.0.0.0:5000" + "/blog/api/users", user);
        };
        this.loginUser = function (user) {
            return $http.post("http://0.0.0.0:5000" + "/login", user);
        }
    }])
    .service('logoutUser', ['$http', function ($http) {
        this.logout = function () {
            return $http.post("http://0.0.0.0:5000/logout", {});
        }
    }])
;



//# sourceMappingURL=maps/main.js.map