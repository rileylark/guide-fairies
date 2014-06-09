(function () {
    'use strict';

    console.log("Creating demoApp");
    var demoApp = angular.module('FairyDemo', ['guide-fairies', 'ui.bootstrap']);

    demoApp.controller('MainDemoController', ['guideService', '$scope', function(guideService, $scope) {
        guideService().showStop('showFeaturesButton', 'FEATURE_FAIRY');

        $scope.introModalShowing = true;

        $scope.hideIntroModal = function() {
            $scope.introModalShowing = false;
        };

        $scope.usageExamples = [
            {
                heading: 'A simple fairy to welcome users and teach them to click fairies',
                templateUrl: 'usageExamples/simpleIntro.html'
            }
        ]
    }]);
}());