'use strict';
angular.module('AngularFlask')

    .controller('PostListController', ['$scope', 'allPosts', function ($scope, allPosts) {
        $scope.posts = [];
        $scope.showPost = false;
        $scope.message = "Loading ...";
        allPosts.getPosts().get()
            .$promise.then(function (response) {
                $scope.posts = response.posts;
                $scope.showPost = true;
                console.log('The response is:', $scope.posts)
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
    }])
    .controller('NewPostController', ['$scope', 'newPost', function ($scope, newPost) {

        $scope.createPost = function () {
            console.log('scope is:', $scope.post)
            var post = new newPost($scope.post);
            post.$save();
        }

    }])

function IndexController($scope) {

}

function AboutController($scope) {

}


function PostDetailController($scope, $routeParams, Post) {
    var postQuery = Post.get({postId: $routeParams.postId}, function (post) {
        $scope.post = post;
    });
}
