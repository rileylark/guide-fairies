(function () {
    'use strict';

    angular.module('FairyDemo')
        .controller('example1Controller',
        ['$scope', 'guideFairies', '$timeout', function ($scope, guideFairies, $timeout) {

            $scope.$watch('demoController.firstUsageExampleOpen', function(open) {
                if (open) {
                    guideFairies.showStop('example-1-action', 'EXAMPLE_1_FAIRY');
                } else {
                    guideFairies.dismissFairy('example-1-action');
                }
            });
        }]);

}());