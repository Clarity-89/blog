'use strict';

app.controller('EditPostController', ['$scope', 'postService', '$location', 'imgPreview', 'sharedPost', 'toast', '$window',
    function ($scope, postService, $location, imgPreview, sharedPost, toast, $window) {
        $scope.page.loading = false; // loading progress bar
        $scope.heading = 'Edit';
        $scope.button = 'Save changes';
        $scope.post = sharedPost.post;
        $scope.post.disabled = true;

        $scope.createPost = function (form, post, publish) {

            if (form.$valid) {
                $scope.loading = true; // loading spinner
                var file = $scope.myFile;
                post.public = publish || post.public;
                postService.editPost(file, post)
                    .then(function success(response) {
                        $scope.loading = false;
                        if (post.public) {
                            toast.showToast('Post edited', 1000).then(function () {
                                $window.location.reload();
                                $location.path('/posts/' + response.data.slug);
                            });
                        } else {
                            toast.showToast('Changes saved', 1000)
                        }
                    }, function error(response) {
                        $scope.loading = false;
                        toast.showToast('Could not edit post. Please try again later', 5000);
                    });
            }
        };

        $scope.setFile = function (element) {
            return imgPreview.preview(element, $scope);
        };

        $scope.activateUpload = function () {
            return imgPreview.activateUpload('uploadImage');
        }
    }]);
