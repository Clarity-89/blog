'use strict';

describe('postService service', function () {
    var $httpBackend;

    beforeEach(module('app'));

    beforeEach(inject(function ($injector) {
        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
        // backend definition common for all tests
        $httpBackend.when('GET', '/blog/api/current_user')
            .respond({"message": "logged in"});
    }));

    it('getPosts should return a list of posts when used without a param', inject(function (postService) {
        $httpBackend.when('GET', '/blog/api/posts')
            .respond([
                {
                    "author": "Clarity",
                    "author_id": 2,
                    "id": 12,
                    "slug": "test-draft",
                    "title": "Test public"
                },
                {
                    "author": "Admin",
                    "author_id": 1,
                    "avatar": "../img/avatars/default.jpg",
                    "id": 10,
                    "public": true,
                    "title": "This is public"
                }
            ]);
        var posts;
        postService.getPosts().then(function (response) {
            posts = response.data;
            expect(posts).not.toBeUndefined();
            expect(posts.length).toBe(2);
        });

        $httpBackend.flush();
    }));

    it('getPosts should return a single post when passed in slug as a param', inject(function (postService) {
        $httpBackend.when('GET', /\/blog\/api\/posts\/(.+)/, undefined, undefined, ['slug'])
            .respond(function (method, url, data, headers, params) {
                // console.log(params);
                return {
                    "author": "Admin",
                    "author_id": 1,
                    "body": "<p>ccc</p>",
                    "id": 10,
                    "slug": "test",
                    "title": "Testing"
                }
            });
        var post;
        postService.getPosts('h').then(function (response) {
            post = response.data;
            expect(post).not.toBeUndefined();
            expect(post.author).toBe('Admin');
        });

        $httpBackend.flush();
    }));

    it('checkFav should return true if user\'s name is in the favorited_by array or a post', inject(function (postService) {
        var post = {
                "author": "Admin",
                "author_id": 1,
                "favorited_by": [
                    {
                        "id": 1,
                        "name": null,
                        "username": "Clarity"
                    }, {
                        "id": 2,
                        "name": null,
                        "username": "Admin"
                    }, {
                        "id": 3,
                        "name": null,
                        "username": "test"
                    }
                ]
            },
            user = {
                "id": 1,
                "name": null,
                "username": "Clarity"
            };
        expect(postService.checkFav(post, user)).toBe(true);
        expect(postService.checkFav(post, {username: 'John'})).toBe(false);
    }));

});