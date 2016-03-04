'use strict';

angular.module('app')
    .constant("baseURL", "https://thee-blog.herokuapp.com")
    // A service to share 'post' object between controllers
    .service('sharedPost', function () {
        var post = this;
    })
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
    .service('postUpload', ['$http', function ($http) {
        this.newPost = function (file, data) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('post', JSON.stringify(data));
            return $http.post("https://thee-blog.herokuapp.com/blog/api/posts/new", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        }
    }])
    .service('editPost', ['$http', function ($http) {
        this.editPost = function (file, data) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('post', JSON.stringify(data));
            return $http.post("/blog/api/posts/" + data.id + "/edit", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        }
    }])
    // Reusable service to ask user for confirmation and delete a post
    .service('deletePost', ['$http', '$mdDialog', function ($http, $mdDialog) {
        this.delete = function (ev, postId) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this post?')
                .textContent('This action cannot be undone.')
                .ariaLabel('Confirm post deletion')
                .targetEvent(ev)
                .ok('Delete')
                .cancel('Cancel');
            return $mdDialog.show(confirm).then(function () {
                return $http.post("https://thee-blog.herokuapp.com/blog/api/posts/" + postId + "/delete", {})
                    .then(function success() {
                            console.log('Deleted post with id', postId);
                        },
                        function error(response) {
                            console.log('Could not delete', response);
                        })
            });
        }
    }])
    .service('createUser', ['$http', function ($http) {
        this.newUser = function (file, user) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('user', JSON.stringify(user));
            return $http.post("/blog/api/users", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        };
        this.loginUser = function (user) {
            return $http.post("/login", user);
        }
    }])
    .service('logoutUser', ['$http', function ($http) {
        this.logout = function () {
            return $http.post("https://thee-blog.herokuapp.com/logout", {});
        }
    }])
    .service('userPosts', ['$http', function ($http) {
        this.getPosts = function (user_id) {
            return $http.get("/blog/api/users/" + user_id + "/posts")
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
    .service('updateUser', ['$http', function ($http) {
        this.update = function (file, user) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('user', JSON.stringify(user));
            return $http.post("/blog/api/users/edit", fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        };
    }])
    .service('favoritePost', ['$http', '$cookies', function ($http, $cookies) {
        this.favorite = function (post) {
            return $http.post("/blog/api/posts/" + post.id, {});
        };

        /* Check if the logged in user has favorited the post and add red color to fav icon if yes */
        this.checkFav = function (post) {
            var user = $cookies.getObject('current_user');
            if (user) {
                var filtered = post.favorited_by.filter(function (el) {
                    return el.username == user.username;
                });
                if (filtered.length) {
                    post.favClass = 'red';
                } else {
                    post.favClass = '';
                }
            }
        }
    }])
    .service('addComment', ['$http', function ($http) {
        this.add = function (comment, postId) {
            return $http.post("/blog/api/posts/" + postId + "/comments/new", JSON.stringify(comment))
        }
    }])
    .service('goTo', ['$anchorScroll', '$location', function ($anchorScroll, $location) {
        this.goTo = function (post, el) {
            var selector = document.getElementById(el);
            // If we are on post detail page, scroll to comments
            if (selector) {
                $location.hash(el);
                $anchorScroll();
                // Else go to post detail page and jump to comments
            } else {
                $location.path('/posts/' + post.id).hash(el);
            }
        }
    }])
    .service('checkRedirect', ['$location', '$window', function ($location, $window) {
        this.forceSSL = function () {
            if ($location.protocol() !== 'https') {
                $window.location.href = $location.absUrl().replace('http', 'https');
            }
        };
    }])
;


