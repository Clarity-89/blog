'use strict';

/* Filters */

angular.module('appFilters', [])
    .filter('localDate', function () {
        return function (input) {
            return moment(new Date(input)).format('MMM D YYYY HH:mm');
        }
    });