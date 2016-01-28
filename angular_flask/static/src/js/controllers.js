'use strict';
angular.module('AngularFlask')

    .controller('LatestController', ['$scope', 'allPosts', function ($scope, allPosts) {
        $scope.posts = [];
        $scope.showPost = false;
        $scope.message = "Loading ...";
        allPosts.getPosts().get()
            .$promise.then(function (response) {
                $scope.posts = response.posts;
                $scope.posts.sort(function (a, b) {
                    return a.date > b.date ? -1 : a.date === b.date ? 0 : 1;
                });
                $scope.posts.length = 5;
                $scope.showPost = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
    }])
    .controller('PostListController', ['$scope', 'allPosts', function ($scope, allPosts) {
        $scope.posts = [];
        $scope.showPost = false;
        $scope.message = "Loading ...";
        allPosts.getPosts().get()
            .$promise.then(function (response) {
                $scope.posts = response.posts;
                $scope.showPost = true;
                buildGridModel($scope.posts);
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });

        function buildGridModel(posts) {
            var it, results = [];
            for (var j = 0; j < posts.length; j++) {
                it = posts[j];
                it.span = {row: 1, col: 1};
                it.img = 'img-sm';
                it.para = 'para-sm';
                switch (j + 1) {
                    case 1:
                        it.span.row = it.span.col = 2;
                        it.img = 'img-lg';
                        it.para = 'para-lg';
                        break;
                    case 4:
                        it.span.col = 2;
                        break;
                    case 5:
                        it.span.row = it.span.col = 2;
                        it.img = 'img-lg';
                        it.para = 'para-lg';
                        break;
                }
                results.push(it);
            }
            console.log('logging posts', posts);
            return posts;
        }

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
