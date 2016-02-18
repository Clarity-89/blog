angular.module('AngularFlask')
    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }])
    .directive('post', function () {
        return {
            restrict: 'E',
            templateUrl: 'static/partials/post.html',
            replace: true
        };
    })
    .directive('postDetail', function () {
        return {
            restrict: 'E',
            templateUrl: 'static/partials/full-size-post.html',
            replace: true,
            scope: {
                text: '@',
                post: '=',
                favorite: '&',
                imageSrc: '='
            }
        };
    });
;