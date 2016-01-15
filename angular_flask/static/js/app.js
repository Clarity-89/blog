'use strict';

angular.module('AngularFlask', ['angularFlaskServices', 'ngRoute', 'ngMaterial'])
    .config(['$routeProvider', '$locationProvider', '$mdThemingProvider',
        function ($routeProvider, $locationProvider, $mdThemingProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'static/partials/landing.html',
                    controller: IndexController
                })
                .when('/about', {
                    templateUrl: 'static/partials/about.html',
                    controller: AboutController
                })
                .when('/post', {
                    templateUrl: 'static/partials/post-list.html',
                    controller: PostListController
                })
                .when('/post/:postId', {
                    templateUrl: '/static/partials/post-detail.html',
                    controller: PostDetailController
                })
                /* Create a "/blog" route that takes the user to the same place as "/post" */
                .when('/blog', {
                    templateUrl: 'static/partials/post-list.html',
                    controller: PostListController
                })
                .otherwise({
                    redirectTo: '/'
                });
            $mdThemingProvider.theme('default')
                .primaryPalette('blue-grey')
                .accentPalette('orange')
                .backgroundPalette('grey');

            $locationProvider.html5Mode(true);
        }])
;