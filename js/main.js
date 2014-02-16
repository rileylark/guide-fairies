require.config({

});

require(['guide-fairies'], function () {
    console.log("App loaded!");
    var app = angular.module('guide-fairies-demo', ['guide-fairies']);

    app.controller("MainController", ['$scope', 'guideService', function ($scope, guideService) {
        var guide = guideService();

        guide.showStop('firstStop');

        $scope.guide = guide;

        $scope.showStop = function(stopName) {
            guide.showStop(stopName);
        }

        $scope.showFairyPreferences = {
            firstStop: true,
            header2stop: true,
            header3stop: true
        };

        $scope.test = "Yep, working!";
    }]);

    angular.bootstrap(document.body, [app.name]);
});