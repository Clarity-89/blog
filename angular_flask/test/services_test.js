'use strict';

describe('allPosts service', function () {
    var $httpBackend, authRequestHandler;

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

});