'use strict';

app.controller('UserProfileController', ['userService', '$routeParams', '$scope', 'favoritePost', 'toast',
    function (userService, $routeParams, $scope, favoritePost, toast) {
        $scope.size = "sm";
        $scope.user = {};
        $scope.imageSrc = '';

        userService.getDetails($routeParams.user)
            .then(function (response) {
                $scope.user = response.data.user;
                $scope.user.favs = response.data.favs;
            }, function (response) {
                toast.showToast('Could not get data from the server. Please try again later', 5000);
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
                    $scope.page.loading = false;
                    toast.showToast('Could not get data from the server. Please try again later', 5000);
                });
    }]);