(function () {
    'use strict';

    var demoApp = angular.module('FairyDemo', ['guide-fairies', 'ui.bootstrap']);

    demoApp.directive('prettyprint', function() {
        // from http://stackoverflow.com/questions/21081950/calling-prettyprint-dynamically-in-angularjs-ruins-binding
        return {
            restrict: 'C',
            link: function postLink(scope, element, attrs) {
                console.log("Getting: ", element.html());
                element.html(prettyPrintOne(element.html()), '', true);
            }
        };
    });

    demoApp.controller('MainDemoController', ['guideFairies', '$scope', function(guideFairies, $scope) {

        var demoController = this;

        guideFairies.showStop('showFeaturesButton', 'WELCOME_FAIRY');

        $scope.introModalShowing = true;

        $scope.hideIntroModal = function() {
            $scope.introModalShowing = false;
            guideFairies.showStop('firstUsageExample', 'WELCOME_FAIRY');
        };

        $scope.openFirstUsageExample = function() {
            demoController.firstUsageExampleOpen = true;
        };

        $scope.$watch('demoController.firstUsageExampleOpen', function(open) {
            if (open) {
                guideFairies.dismissFairy('firstUsageExample');
            }
        });

    }]);
}());