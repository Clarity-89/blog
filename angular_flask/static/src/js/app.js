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