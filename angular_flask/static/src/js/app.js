'use strict';

angular.module('AngularFlask', ['ngRoute', 'ngResource', 'ngMaterial', 'ngAnimate', 'textAngular', 'ngSanitize', 'ngMessages', 'ngPassword', 'ngCookies', 'material.svgAssetsCache'])
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
                .accentPalette('orange')
                .backgroundPalette('grey');

            $locationProvider.html5Mode(true);
        }
    ])
    .run(function ($rootScope, $location, $cookies, $routeParams) {
        $rootScope.$on("$routeChangeStart", function (event, next) {
            if (next.templateUrl == 'static/partials/new_post.html' || next.templateUrl == 'static/partials/profile.html'
                || next.templateUrl == 'static/partials/my_posts.html') {
                var user = JSON.parse($cookies.get('current_user'));
                if (!user || (next.templateUrl == 'static/partials/profile.html' && user.username != next.params.user)) {
                    $location.path("/login");
                }
            }
        });
    })
;