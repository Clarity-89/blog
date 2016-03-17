'use strict';

app.controller('UserPostsController', ['$scope', 'userService', '$cookies', 'favoritePost',
    function ($scope, userService, $cookies, favoritePost) {
        $scope.size = "sm";
        $scope.page.loading = true;
        $scope.imageSrc = '';
        userService.getPosts($cookies.getObject('current_user').username)
            .then(function (response) {
                    $scope.posts = response.data.posts;
                    $scope.page.loading = false;
                    $scope.posts.forEach(function (el) {
                        favoritePost.checkFav(el);
                    });
                },
                function (response) {
                    $scope.page.loading = false;
                    console.log('Error:', response.status, response.statusText);
                });
    }]);