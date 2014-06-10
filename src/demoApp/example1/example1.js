(function () {
    'use strict';

    angular.module('FairyDemo')
        .controller('example1Controller',
        ['$scope', 'guideFairies', '$timeout', function ($scope, guideFairies, $timeout) {

            $timeout(function() {
                guideFairies.showStop('example-1-action', 'EXAMPLE_1_FAIRY');
            }, 500);
        }]);

}());