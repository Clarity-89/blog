'use strict';

angular.module('AngularFlask', ['ngRoute', 'ngResource', 'ngMaterial', 'ngAnimate', 'textAngular', 'ngSanitize', 'ngMessages', 'ngPassword'])
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
                .otherwise({
                    redirectTo: '/'
                });

            //Customize themes for Angular Material
            $mdThemingProvider.theme('default')
                .primaryPalette('blue-grey')
                .accentPalette('orange')
                .backgroundPalette('grey');

            $locationProvider.html5Mode(true);

           /* $httpProvider.responseInterceptors.push(['$rootScope', '$q', '$injector', '$location',
                function ($rootScope, $q, $injector, $location) {
                    return function (promise) {
                        return promise.then(function (response) {
                            return response; // no action, was successful
                        }, function (response) { // error - was it 401 or something else?
                            if (response.status === 401 && response.data.error && response.data.error === "invalid_token") {
                                var deferred = $q.defer(); // defer until we can re-request a new token
                                // Get a new token... (cannot inject $http directly as will cause a circular ref)
                                $injector.get("$http").jsonp('/blog/api/token')
                                    .then(function (loginResponse) {
                                        if (loginResponse.data) {
                                            $rootScope.oauth = loginResponse.data.oauth; // we have a new oauth token - set at $rootScope
                                            // now let's retry the original request - transformRequest in .run() below will add the new OAuth token
                                            $injector.get("$http")(response.config).then(function (response) {
                                                // we have a successful response - resolve it using deferred
                                                deferred.resolve(response);
                                            }, function (response) {
                                                deferred.reject(); // something went wrong
                                            });
                                        } else {
                                            deferred.reject(); // login.json didn't give us data
                                        }
                                    }, function (response) {
                                        deferred.reject(); // token retry failed, redirect so user can login again
                                        $location.path('/register');
                                        return;
                                    });
                                return deferred.promise; // return the deferred promise
                            }
                            return $q.reject(response); // not a recoverable error
                        });
                    };
                }])*/
        }
    ])
    .config(function ($provide) {

    $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) {
        taRegisterTool('uploadImage', {
            buttontext: 'Upload Image',
            iconclass: "fa fa-image",
            action: function () {
                //angular.element('#uploadImage').click();
                document.getElementById('uploadImage').click();
            }
        });
        taOptions.toolbar[1].push('uploadImage');
        return taOptions;
    }]);
})
;
'use strict';
angular.module('AngularFlask')

    .controller('LatestController', ['$scope', 'allPosts', function ($scope, allPosts) {
        $scope.posts = [];
        $scope.showPost = false;
        $scope.message = "Loading ...";
        allPosts.getPosts().get()
            .$promise.then(function (response) {
                $scope.posts = response.posts;
                if ($scope.posts.length > 5) {
                    $scope.posts.sort(function (a, b) {
                        return a.date > b.date ? -1 : a.date === b.date ? 0 : 1;
                    });
                    $scope.posts.length = 5;
                }
                $scope.showPost = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
    }])
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
    .controller('UserController', ['$scope', 'createUser', '$location', '$timeout', function ($scope, createUser, $location, $timeout) {
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
            var user = $scope.user;
            console.log('User ', user);
            createUser.loginUser(user)
                .then(function success() {
                    console.log("Successfully logged in");
                    $location.path('/posts');
                }, function error(response) {
                    console.log('Error: ', response);
                });
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
    }]);
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
                .success(function () {
                    console.log('File saved');
                })
                .error(function (data) {
                    console.log('Error, did not save', data);
                });
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
;



//# sourceMappingURL=maps/main.js.map