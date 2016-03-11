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