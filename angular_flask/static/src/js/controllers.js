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
    .controller('NewPostController', ['$scope', 'fileUpload', '$location', function ($scope, fileUpload, $location) {

        /*$scope.createPost = function () {
         console.log('The form data is:', $scope.post)
         var post = new newPost($scope.post);
         post.$save();
         }*/
        $scope.createPost = function () {
            var file = $scope.myFile;
            //console.log('logging scope', $scope.htmlVariable);
            fileUpload.newPost(file, $scope.post, $scope.htmlVariable);
            $location.path('/');
        };

    }])
    .controller('PostDetailController', ['$scope', 'allPosts', '$routeParams', function ($scope, allPosts, $routeParams) {
        console.log($routeParams.id)
        $scope.post = {};
        allPosts.getPosts().get({id: parseInt($routeParams.id, 10)})
            .$promise.then(function (response) {
                console.log('response is: ', response)
                $scope.post = response.post;
                $scope.showPost = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
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
