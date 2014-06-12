angular.module('FairyDemo')
    .controller('visualChecklistController', ['$scope', 'appSpecificGuideService', function ($scope, appSpecificGuideService) {
        'use strict';

        this.selectedFeature = 1;

        $scope.$watch('visualChecklistController.selectedFeature', function (newFeatureNumber) {
            appSpecificGuideService.signalVisualChecklistFeatureSelected(newFeatureNumber);
        });

    }]);