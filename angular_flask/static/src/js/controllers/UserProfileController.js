'use strict';

app.controller('UserProfileController', ['userService', '$routeParams', '$scope', 'favoritePost',
    function (userService, $routeParams, $scope, favoritePost) {
        $scope.size = "sm";
        $scope.user = {};
        $scope.imageSrc = '';

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


    }]);