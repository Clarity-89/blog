'use strict';

/* Filters */

angular.module('appFilters', [])
    .filter('localDate', function () {
        return function (input) {
            console.log('inside filter', input)
            return moment(new Date(input)).format('MMM Do YYYY HH:mm');
        }
    });