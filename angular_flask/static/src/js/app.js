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