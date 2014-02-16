require.config({

});

require(['guide-fairies'], function (guideFairies) {
    console.log("App loaded!");
    var app = angular.module('guide-fairies-demo', [guideFairies.name]);

    app.run(['demoFeaturesGuideRunner', function(featureRunner) {
        // I think of the guide as a program that's kind of running parallel
        // to the main functionality of the app, so I split out as much
        // as I can from the controllers.  I think a run block is a good
        // place to start the guide service.
        featureRunner.start();
    }]);


    app.controller("MainController", ['$scope', 'demoFeaturesGuideRunner', function ($scope, featureRunner) {
        // some pollution of your controller is necessary to link the UI
        // to the guide service.  Instead of linking functions directly
        // like this it might be better to publish an event bus that the
        // guide runner can listen to... maybe version 2?
        $scope.showFeatures = featureRunner.showFeatures;

        //this is a feature of the demo app, completely unrelated to the fairy guide.
        $scope.retablize = function() {
            alert("Wow, you retablized!  You can retablize up to 62 more times!");
        }

        $scope.seriesStopNumber = 1;
        $scope.showNextSeriesStop = function() {
            //this would also be a function of your app, but this one needs to
            //know a little bit about the guide to send the fairies to the next step
            $scope.seriesStopNumber = ($scope.seriesStopNumber + 1) % 4;
            featureRunner.showSeriesStop($scope.seriesStopNumber)
        }

        $scope.showNextNewGuyStop = function() {
            $scope.seriesStopNumber = ($scope.seriesStopNumber + 1) % 4;
            featureRunner.showNewGuyStop($scope.seriesStopNumber);
        }

        $scope.hideAllSeriesFairies = function() {
            featureRunner.hideSeriesFairies();
        }
    }]);

    app.factory('demoFeaturesGuideRunner', ['$rootScope', 'guideService',
        function ($rootScope, guideService) {

            //this is the actual definition of the guide.  It includes:
            // * The instructions that tell which fairy to go to which stop
            // * Any extra behavior you want to add.  In my app I use the runner
            //   to send messages to the server, and to check which stops
            //   the user has already seen so we can avoid showing them again.

            var guide = guideService();

            return {
                start: function() {
                    guide.showStop('showFeaturesButton', 'FEATURE_FAIRY');
                },

                showFeatures: showFeatures,

                showStop: guide.showStop,

                showSeriesStop: function(stopNumber) {
                    // specifying which fairy you want by name (in this case
                    // with 'SERIES_FAIRY') causes the service to reuse the same
                    // fairy if possible.  Great for sequential introductions!
                    guide.showStop('seriesStop' + stopNumber, 'SERIES_FAIRY');
                },

                showNewGuyStop: function(stopNumber) {
                    guide.showStop('seriesStop' + stopNumber);
                },

                hideSeriesFairies: function() {
                    for (var i = 0; i < 4; i++) {
                        guide.dismissFairy('seriesStop' + i);
                    }
                }
            };

            function showFeatures() {
                guide.showStop('featuresHeader', 'FEATURE_FAIRY');

                guide.showStop('classStop0');
                guide.showStop('classStop1');
                guide.showStop('classStop2');
                guide.showStop('classStop3');

                guide.showStop('positionStop');
                guide.showStop('explanationStop');
            }
        }]);

    angular.bootstrap(document.body, [app.name]);
});