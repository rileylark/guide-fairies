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

                showStop: guide.showStop
            };

            function showFeatures() {
                guide.showStop('featuresHeader', 'FEATURE_FAIRY');
            }
        }]);

    angular.bootstrap(document.body, [app.name]);
});