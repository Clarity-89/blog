'use strict';

app.controller('UserPostsController', ['$scope', 'userService', '$cookies', 'postService', 'toast',
    function ($scope, userService, $cookies, postService, toast) {
        $scope.size = "sm";
        $scope.page.loading = true;
        $scope.imageSrc = '';
        userService.getPosts($cookies.getObject('current_user').username)
            .then(function (response) {
                    response.data.posts.forEach(function (el) {
                        postService.checkFav(el);
                    });
                    $scope.posts = response.data.posts;
                    $scope.page.loading = false;
                },
                function (response) {
                    $scope.page.loading = false;
                    toast.showToast('Could not get data from the server. Please try again later', 5000);
                    console.log('Error:', response.status, response.statusText);
                });
    }]);