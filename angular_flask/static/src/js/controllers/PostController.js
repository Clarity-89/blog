'use strict';

app.controller('PostController', ['$scope', 'favoritePost', 'deletePost', '$location', 'sharedPost', 'addComment', '$mdDialog', 'goTo', 'postService', 'toast',
    function ($scope, favoritePost, deletePost, $location, sharedPost, addComment, $mdDialog, goTo, postService, toast) {

        $scope.favorite = function (post) {
            favoritePost.favorite(post)
                .then(function success(response) {
                        angular.extend(post, response.data.post);
                        favoritePost.checkFav(post);
                    },
                    function error(response) {
                        toast.showToast('Server error. Please try again later', 5000);
                        console.log('Couldn\'t favorite a post', response);
                    }
                )
        };

        $scope.editPost = function (post) {
            sharedPost.post = post;
            $location.path('/edit');
        };

        $scope.unpublishPost = function (ev, post) {
            postService.unpublish(post)
                .then(function (response) {
                    angular.extend(post, response.data.post);
                }, function (response) {
                    toast.showToast('Server error. Please try again later', 5000);
                })
        };

        // Show modal to ask for confirmation of post deletion
        $scope.showConfirm = function (ev, postId) {
            deletePost.delete(ev, postId)
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
                    console.log('Could not add comment', response);
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
