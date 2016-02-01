'use strict';

angular.module('AngularFlask', ['ngRoute', 'ngResource', 'ngMaterial', 'ngAnimate', 'textAngular', 'ngSanitize', 'ngMessages', 'ngPassword'])
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
                .otherwise({
                    redirectTo: '/'
                });

            //Customize themes for Angular Material
            $mdThemingProvider.theme('default')
                .primaryPalette('blue-grey')
                .accentPalette('orange')
                .backgroundPalette('grey');

            $locationProvider.html5Mode(true);


        }]).config(function ($provide) {

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
    .controller('UserController', ['$scope', 'createUser', '$location', function ($scope, createUser, $location) {
        $scope.hasAccount = false;
        $scope.changeForm = function () {
            $scope.hasAccount = !$scope.hasAccount;
        };
        $scope.user = {
            username: "",
            email: "",
            password: ""
        };
        $scope.register = function () {
            var user = $scope.user;
            createUser.newUser(user)
                .then(function success() {
                    $location.path('/posts');
                }, function error(response) {
                    console.log('failed to create user', response);
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
        }
    }])
;



//# sourceMappingURL=maps/main.js.map