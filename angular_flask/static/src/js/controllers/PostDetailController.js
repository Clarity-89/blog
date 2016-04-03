'use strict';

app.controller('PostDetailController', ['$scope', '$routeParams', 'postService', function ($scope, $routeParams, postService) {
    $scope.page.loading = true;
    $scope.post = {};
    $scope.size = "lg";
    postService.getPosts($routeParams.slug).then(function (response) {
            $scope.post = response.data.post;
            $scope.post.comments = response.data.comments;
            $scope.page.loading = false;
            postService.checkFav($scope.post)
        },
        function (response) {
            console.log('Error:', response.status, response.statusText);
        });
}]);