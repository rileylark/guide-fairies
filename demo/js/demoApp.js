(function () {
    'use strict';

    console.log("Creating demoApp");
    var demoApp = angular.module('FairyDemo', ['guide-fairies']);

    demoApp.controller('MainDemoController', ['guideService', function(guideService) {
        guideService().showStop('showFeaturesButton', 'FEATURE_FAIRY');
    }]);
}());