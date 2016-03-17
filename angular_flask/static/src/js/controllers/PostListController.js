'use strict';

app.controller('PostListController', ['$scope', 'allPosts', 'favoritePost', 'goTo',
    function ($scope, allPosts, favoritePost, goTo) {
        $scope.page.loading = true;
        $scope.posts = [];
        $scope.size = "sm"; // Set the last part of 'body-text-' class to sm i.e. 'small'
        $scope.imageSrc = '';
        allPosts.getPosts()
            .then(function (response) {
                    $scope.posts = response.data.posts;
                    $scope.page.loading = false;
                    $scope.posts.forEach(function (el) {
                        favoritePost.checkFav(el);
                        el.date = new Date(el.date);
                    });
                    buildGridModel($scope.posts);
                },
                function (response) {
                    console.log('Error:', response.status, response.statusText);
                });

        // Build a grid of posts of various sizes
        function buildGridModel(posts) {
            var it, results = [];

            for (var j = 0; j < posts.length; j++) {

                it = posts[j];
                it.span = {
                    row: randomSpan(),
                    col: randomSpan()
                };
                it.img = it.span.row === 2 ? 'img-lg' : 'img-sm';
                it.para = it.span.col === 2 && it.span.row === 1 ? 'para-md' : it.span.col === 1 && it.span.row === 1 ? 'para-sm' : 'para-lg';
                results.push(it);
            }
            return posts;
        }

        // Get a random number for spans
        function randomSpan() {
            var r = Math.random();
            if (r < 0.7) {
                return 1;
            } else {
                return 2;
            }
        }

        $scope.favorite = function (post) {
            favoritePost.favorite(post)
                .then(function success(response) {
                        angular.extend(post, response.data.post);
                        favoritePost.checkFav(post);
                    },
                    function error(response) {
                        console.log('Couldn\'t favorite a post', response);
                    }
                )
        };

        $scope.gotoComments = function (post) {
            goTo.goTo(post, 'comments');
        };
    }]);