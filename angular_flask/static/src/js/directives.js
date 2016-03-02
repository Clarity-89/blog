angular.module('app')
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
            controller: 'PostController',
            templateUrl: 'static/partials/post.html',
            replace: true
        };
    });
