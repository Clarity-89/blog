'use strict';

describe('allPosts service', function () {
    var $httpBackend, authRequestHandler;

    beforeEach(module('app'));

    beforeEach(inject(function ($injector) {
        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
        // backend definition common for all tests
        authRequestHandler = $httpBackend.when('GET', '/blog/api/posts/' + new RegExp('\w+'))
            .respond([
                {
                    "author": "Clarity",
                    "author_id": 2,
                    "avatar": "../static/img/avatars/bd7e3a47-761b-4745-aa43-0f55e2db187d.jpg",
                    "body": "<p>This is a public post.</p>",
                    "comments": [
                        {
                            "author": "Admin",
                            "author_ava": "../img/avatars/default.jpg",
                            "body": "Hey",
                            "date": "Thu, 24 Mar 2016 14:19:50 GMT",
                            "id": 1
                        }
                    ],
                    "cover_photo": "../img/covers/default.jpg",
                    "date": "Thu, 24 Mar 2016 10:54:47 GMT",
                    "favorited": 0,
                    "favorited_by": [],
                    "id": 12,
                    "public": true,
                    "slug": "test-draft",
                    "title": "Test public"
                },
                {
                    "author": "Admin",
                    "author_id": 1,
                    "avatar": "../img/avatars/default.jpg",
                    "body": "<p>ccc</p>",
                    "comments": [],
                    "cover_photo": "../img/covers/default.jpg",
                    "date": "Thu, 24 Mar 2016 08:52:01 GMT",
                    "favorited": 0,
                    "favorited_by": [],
                    "id": 10,
                    "public": true,
                    "slug": "noone",
                    "title": "This is public"
                }
            ]);

    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('getPosts should return a list of posts', inject(function (allPosts) {

        var posts = allPosts.getPosts();
        expect(posts).not.toBeUndefined();

    }));

});