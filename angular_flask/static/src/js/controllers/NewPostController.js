'use strict';

app.controller('NewPostController', ['$scope', 'postService', '$location', 'imgPreview', '$cookies', 'toast',
    function ($scope, postService, $location, imgPreview, $cookies, toast) {
        $scope.page.loading = false; // loading progress bar
        var currentUser = $cookies.getObject('current_user');
        $scope.heading = 'Create';
        $scope.button = 'Save';
        if (currentUser) {
            $scope.post = {
                title: '',
                author: currentUser.username,
                avatar: currentUser.avatar,
                date: new Date(),
                cover_photo: '../img/covers/default.jpg',
                disabled: true
            };
        }
        $scope.createPost = function (form, post, publish) {

            if (form.$valid) {
                $scope.loading = true; // loading spinner
                var file = $scope.myFile;
                post.public = publish;
                postService.newPost(file, post)
                    .then(function success(response) {
                        $scope.loading = false;
                        toast.showToast('Post saved', 1000).then(function () {
                            $location.path('/posts/' + response.data.slug);
                        })
                    }, function error(response) {
                        $scope.loading = false;
                        toast.showToast('Could not save post. Please try again later', 5000);
                    });
            }
        };

        $scope.publish = function (form, post) {

            if (form.$valid) {
                $scope.loading = true; // loading spinner
                var file = $scope.myFile;
                postService.newPost(file, $scope.post)
                    .then(function success(response) {
                        $scope.loading = false;
                        toast.showToast('Post saved', 1000).then(function () {
                            $location.path('/posts/' + response.data.slug);
                        })
                    }, function error(response) {
                        $scope.loading = false;
                        toast.showToast('Could not save post. Please try again later', 5000);
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