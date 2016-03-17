'use strict';

app.controller('PostDetailController', ['$scope', '$routeParams', 'favoritePost', 'allPosts', function ($scope, $routeParams, favoritePost, allPosts) {
    $scope.page.loading = true;
    $scope.post = {};
    $scope.size = "lg";
    allPosts.getPosts($routeParams.slug).then(function (response) {
            $scope.post = response.data.post;
            $scope.post.comments = response.data.comments;
            $scope.page.loading = false;
            favoritePost.checkFav($scope.post)
        },
        function (response) {
            console.log('Error:', response.status, response.statusText);
        });
}]);