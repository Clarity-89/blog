'use strict';

angular.module('AngularFlask')
    .constant("baseURL", "http://0.0.0.0:5000")
    .service('allPosts', ['$resource', 'baseURL', function ($resource, baseURL) {
        this.getPosts = function () {
            return $resource(baseURL + '/blog/api/posts', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            });
        }
    }])
    /*.service('newPost', ['$resource', 'baseURL', function ($resource, baseURL) {
     return $resource(baseURL + "/blog/api/posts/new", {});
     }])*/
    .service('fileUpload', ['$http', function ($http) {
        this.newPost = function (file, data) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append("content", JSON.stringify(data));
            console.log('formdata', fd)
            $http.post("http://0.0.0.0:5000" + "/blog/api/posts/new", fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                .success(function () {
                    console.log('File saved');
                })
                .error(function (data) {
                    console.log('Error, did not save', data);
                });
        }
    }])
;


