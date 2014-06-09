(function () {
    'use strict';

    console.log("Creating demoApp");
    var demoApp = angular.module('FairyDemo', ['guide-fairies', 'ui.bootstrap']);

    demoApp.controller('MainDemoController', ['guideService', '$scope', function(guideService, $scope) {

        var demoController = this;

        guideService().showStop('showFeaturesButton', 'WELCOME_FAIRY');

        $scope.introModalShowing = true;

        $scope.hideIntroModal = function() {
            $scope.introModalShowing = false;
            guideService().showStop('firstUsageExample', 'WELCOME_FAIRY');
        };

        $scope.openFirstUsageExample = function() {
            demoController.firstUsageExampleOpen = true;
        };

        $scope.$watch('demoController.firstUsageExampleOpen', function(open) {
            if (open) {
                guideService().dismissFairy('firstUsageExample');
            }
        });

    }]);
}());