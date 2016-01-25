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

            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
    }])
    .controller('NewPostController', ['$scope', 'fileUpload', function ($scope, fileUpload) {

        /*$scope.createPost = function () {
         console.log('The form data is:', $scope.post)
         var post = new newPost($scope.post);
         post.$save();
         }*/
        $scope.createPost = function () {
            var file = $scope.myFile;
            //console.log('logging scope', $scope.htmlVariable);
            fileUpload.newPost(file, $scope.post, $scope.htmlVariable);
        };

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
