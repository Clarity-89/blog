'use strict';

app.controller('PostController', ['$scope', '$location', 'sharedPost', 'addComment', '$mdDialog', 'goTo', 'postService',
    'toast', '$cookies', function ($scope, $location, sharedPost, addComment, $mdDialog, goTo, postService, toast, $cookies) {

        $scope.favorite = function (post) {
            var user = $cookies.getObject('current_user');
            // Allow to favorite a post only if user is logged in
            if (user) {
                postService.favorite(post)
                    .then(function success(response) {
                            angular.extend(post, response.data.post);
                        },
                        function error(response) {
                            toast.showToast('Server error. Please try again later', 5000);
                            console.log('Couldn\'t favorite a post', response);
                        }
                    )
            }
        };

        $scope.hasFavorited = function (post) {
            return postService.checkFav(post);
        };

        $scope.editPost = function (post) {
            sharedPost.post = post;
            $location.path('/edit');
        };

        $scope.unpublishPost = function (ev, post) {
            postService.unpublish(ev, post)
                .then(function (response) {
                    angular.extend(post, response.data.post);
                }, function () {
                    toast.showToast('Server error. Please try again later', 5000);
                })
        };

        // Show modal to ask for confirmation of post deletion
        $scope.showConfirm = function (ev, postId) {
            postService.delete(ev, postId)
                .then(function () {
                    // if there's posts array, we're in the post list controller or user posts controller and have to update the list
                    if ($scope.posts) {
                        for (var i = 0; i < $scope.posts.length; i++) {
                            if ($scope.posts[i].id === postId) {
                                $scope.posts.splice(i, 1);
                            }
                        }
                        // Else just redirect to /posts
                    } else {
                        $location.path('/posts');
                    }
                })
        };

        $scope.addComment = function (post) {
            var self = this;
            addComment.add(self.comment, post.id)
                .then(function success(response) {
                    self.comment = '';
                    angular.extend(post.comments, response.data.comments);
                }, function error(response) {
                    toast.showToast('Server error. Please try again later', 5000);
                });
        };

        $scope.gotoComments = function (post) {
            goTo.goTo(post, 'comments');
        };

        $scope.showAdvanced = function (ev, post) {

            $mdDialog.show({
                templateUrl: 'static/partials/user-list.html',
                locals: {
                    post: post
                },
                controller: DialogController,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: false
            });
        };


    }]);

function DialogController($scope, $mdDialog, post) {

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.post = post;
}
