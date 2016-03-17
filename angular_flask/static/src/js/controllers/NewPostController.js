'use strict';

app.controller('NewPostController', ['$scope', 'postUpload', '$location', 'imgPreview', '$cookies', 'toast',
    function ($scope, postUpload, $location, imgPreview, $cookies, toast) {
        $scope.page.loading = false; // loading progress bar
        var currentUser = $cookies.getObject('current_user');
        $scope.heading = 'Create';
        $scope.button = 'Publish';
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
        $scope.createPost = function (form) {

            if (form.$valid) {
                $scope.loading = true; // loading spinner
                var file = $scope.myFile;
                postUpload.newPost(file, $scope.post)
                    .then(function success(response) {
                        $scope.loading = false;
                        toast.showToast('Post created', 1000).then(function () {
                            $location.path('/posts/' + response.data.slug);
                        })
                    }, function error(response) {
                        $scope.loading = false;
                        toast.showToast('Could not create post. Please try again later', 5000);
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