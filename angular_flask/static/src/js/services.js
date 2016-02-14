'use strict';

angular.module('AngularFlask')
    .constant("baseURL", "http://0.0.0.0:5000")
    .service('allPosts', ['$resource', 'baseURL', function ($resource, baseURL) {
        this.getPosts = function () {
            return $resource(baseURL + '/blog/api/posts/:id', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            });
        }
    }])
    .service('fileUpload', ['$http', function ($http) {
        this.newPost = function (file, data1, data2) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append("content", JSON.stringify(data1));
            fd.append("content2", JSON.stringify(data2));
            $http.post("http://0.0.0.0:5000/blog/api/posts/new", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        }
    }])
    .service('createUser', ['$http', function ($http) {
        this.newUser = function (file, user) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('user', JSON.stringify(user));
            return $http.post("http://0.0.0.0:5000/blog/api/users", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        };
        this.loginUser = function (user) {
            return $http.post("http://0.0.0.0:5000/login", user);
        }
    }])
    .service('logoutUser', ['$http', function ($http) {
        this.logout = function () {
            return $http.post("http://0.0.0.0:5000/logout", {});
        }
    }])
    .service('userPosts', ['$http', function ($http) {
        this.getPosts = function (user_id) {
            return $http.get("http://0.0.0.0:5000/blog/api/users/" + user_id + "/posts")
        }
    }])
    .service('imgPreview', function () {
        this.preview = function (element, scope) {
            var reader = new FileReader();
            reader.onload = function (event) {
                scope.imageSrc = event.target.result;
                scope.$apply();
            };
            // when the file is read it triggers the onload event above.
            reader.readAsDataURL(element.files[0]);
        };
        this.activateUpload = function (id) {
            document.getElementById(id).click();
        }
    })
;


