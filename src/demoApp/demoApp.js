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

        //intro modal
        guideFairies.showStop('showFeaturesButton', 'WELCOME_FAIRY');

        $scope.introModalShowing = true;

        $scope.hideIntroModal = function() {
            $scope.introModalShowing = false;
            guideFairies.showStop('firstUsageExample', 'WELCOME_FAIRY');
        };

        //examples
        demoController.exampleStates = [];
        for (var i = 0; i < 3; i++) {
            demoController.exampleStates.push({open: false});
        }

        function getExampleState(index) {
            if (!demoController.exampleStates[index]) {
                demoController.exampleStates[index] = {};
            }

            return demoController.exampleStates[index];
        }

        $scope.$watch('demoController.exampleStates[0].open', function(open) {
            if (open) {
                guideFairies.showStop('example-1-action', 'WELCOME_FAIRY');
            } else {
                guideFairies.dismissFairy('example-1-action');
            }
        });

        $scope.$watch('demoController.exampleStates[1].open', function(open) {
            if (open) {
                guideFairies.showStop('eruminate-your-rendolence', 'RENDOLENT_FAIRY');
            } else {
                guideFairies.dismissFairy('eruminate-your-rendolence');
            }
        });

    }]);
}());