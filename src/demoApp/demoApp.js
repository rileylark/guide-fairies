(function () {
    'use strict';

    var demoApp = angular.module('FairyDemo', ['guide-fairies', 'ui.bootstrap']);

    demoApp.factory('appSpecificGuideService', ['guideFairies', function(guideFairies) {
        // I'd recommend splitting all of your guide-fairy logic that will be specific to your app into its own
        // service. This makes it easier to see all your fairy flows in one spot, and it makes it easier to figure
        // out what is going on in other places of your code, too. When you see a hook elsewhere that specifically
        // references your appSpecificGuideService, it's a lot clearer than just seeing something like
        // $scope.$broadcast('chose-nav-option-1') and having to search for all the places that consume that event
        //
        // This sort of practice isolates your main app from the third-party library, and if you want to swap out
        // guideFairies later (or get rid of it) you only have to look at this one file to see all of your dependency
        // on it. Tight!
        //
        // Also, tests for this module would be so easy to write!

        // In this specific app, I know each of my example segments has a list of fairies that should appear
        // automatically, so I can code that directly here.

        var stopsToShowAutomaticallyForEachExample = {
            0: [{stopName: 'example-1-action', fairyName: 'WELCOME_FAIRY'}],
            1: [{stopName: 'eruminate-your-rendolence'}],
            2: [{stopName: 'checklist-2'}, {stopName: 'checklist-3'}]
        };

        return {
            signalAppLoaded: function() {
                guideFairies.showStop('showFeaturesButton', 'WELCOME_FAIRY');
            },

            signalIntroModalClosed: function() {
                guideFairies.showStop('firstUsageExample', 'WELCOME_FAIRY');
            },

            userOpenedExample: function(exampleNumber) {
                var stops = stopsToShowAutomaticallyForEachExample[exampleNumber];
                angular.forEach(stops, function(stop) {
                    guideFairies.showStop(stop.stopName, stop.fairyName);
                });
            },

            userClosedExample: function(exampleNumber) {
                var stops = stopsToShowAutomaticallyForEachExample[exampleNumber];
                angular.forEach(stops, function(stop) {
                    guideFairies.dismissFairy(stop.stopName);
                });
            },

            signalVisualChecklistFeatureSelected: function(featureNumber) {
                guideFairies.dismissFairy('checklist-' + featureNumber);
            }
        };

    }]);

    demoApp.controller('MainDemoController', ['appSpecificGuideService', '$scope', function(appSpecificGuideService, $scope) {

        var demoController = this;

        // I implemented these little hooks so that the main app could just signal the guide service
        // with succinct, semantic calls like this one. You could use an event bus or anything else to implement this.
        appSpecificGuideService.signalAppLoaded();

        $scope.introModalShowing = true;

        $scope.hideIntroModal = function() {
            $scope.introModalShowing = false;
            appSpecificGuideService.signalIntroModalClosed();
        };

        // The following code is so cumbersome because I don't know of any events fired when the accordions open.
        // The proper place for this code is in the accordion, but that change is beyond the scope of this demo ;)
        demoController.exampleStates = [];
        angular.forEach([0, 1, 2, 3], function(indexNumber) {
            demoController.exampleStates.push({open: false});

            $scope.$watch('demoController.exampleStates[' + indexNumber + '].open', function(newOpen) {
                if (newOpen) {
                    appSpecificGuideService.userOpenedExample(indexNumber);
                } else {
                    appSpecificGuideService.userClosedExample(indexNumber);
                }
            });
        });

    }]);


    demoApp.directive('prettyprint', function() {
        // from http://stackoverflow.com/questions/21081950/calling-prettyprint-dynamically-in-angularjs-ruins-binding
        return {
            restrict: 'C',
            link: function postLink(scope, element, attrs) {
                element.html(prettyPrintOne(element.html()), '', true);
            }
        };
    });

}());