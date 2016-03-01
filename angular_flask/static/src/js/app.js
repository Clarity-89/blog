'use strict';

angular.module('AngularFlask', ['ngRoute', 'ngResource', 'ngMaterial', 'ngAnimate', 'textAngular', 'ngSanitize', 'ngMessages', 'ngPassword', 'ngCookies'])
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
                            return allPosts.getPosts().get({id: parseInt($route.current.params.id, 10)});
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
                var user = JSON.parse($cookies.get('current_user'));
                if (!user || (next.templateUrl == 'static/partials/profile.html' && user.username != next.params.user)) {
                    $location.path("/login");
                }
            }
        });
    })
;