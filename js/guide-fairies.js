//in case you're not using requireJS, this just makes a quick define function so this code will work anyway
var define = define || function (dependencies, definer) {
    definer();
};

define([], function () {
    'use strict';
    var undefined;
    var angularGuide = angular.module('guide-fairies', []);

    angularGuide.factory('$$guideFairiesPositionService', ['$window', function ($window) {
        return function position(fairyElement, alignmentElement, fairyPositioning) {
            var rect = alignmentElement[0].getBoundingClientRect();
            var top = rect.top + $window.scrollY;
            var left;

            if (fairyPositioning === 'right') {
                left = rect.right + $window.scrollX;
            } else if (fairyPositioning === 'left') {
                left = rect.left + $window.scrollX;
                var fairyRect = fairyElement[0].getBoundingClientRect();
                left = left - fairyRect.width;
            }

            fairyElement.css({top: top + 'px', left: left + 'px'});
        };
    }]);

    angularGuide.factory('guideService',
        ['$$guideStopTrackerService', '$$guideFairiesPositionService', '$timeout', '$compile', '$rootElement', '$rootScope', '$interval',
            function (tracker, position, $timeout, $compile, $rootElement, $rootScope, $interval) {
                var fairies = {};

                var guide = {
                    showStop: function (stopName, fairyName) {
                        fairyName = fairyName || ('unique' + Math.random());  //come up with a new name if none was supplied
                        tracker.getStop(stopName)
                            .then(function (stop) {
                                getFairy(fairyName).send(stop);
                            });
                    },

                    dismissFairy: function (stopName) {
                        for (var fairyName in fairies) {
                            var fairy = fairies[fairyName];

                            if (fairy && fairy.stop && fairy.stop.name == stopName) {
                                fairy.dismiss();
                            }
                        }
                    }
                };

                function getFairy(fairyName) {
                    if (!fairies[fairyName]) {
                        fairies[fairyName] = createNewFairy(fairyName);
                    }

                    return fairies[fairyName];
                }

                function createNewFairy(fairyName) {

                    var fairyScope = $rootScope.$new();
                    fairyScope.showStop = guide.showStop;

                    function reposition() {
                        if (fairyScope.stop) {
                            var alignmentElement;
                            if (fairyScope.showingExplanation && fairyScope.stop.explanationAlignmentElement) {
                                alignmentElement = angular.element(document.querySelector('#' + fairyScope.stop.explanationAlignmentElement))
                            } else {
                                alignmentElement = fairyScope.stop.element;
                            }

                            position(fairyElement, alignmentElement, fairyScope.stop.fairyPositioning);
                        }
                    }

                    var repositionerPromise = $interval(reposition, 500);

                    fairyScope.$watch('showingExplanation', function () {
                        $timeout(reposition);
                    });

                    fairyScope.$on('$destroy', function () {
                        $interval.cancel(repositionerPromise);
                    });

                    var fairyElement = $compile('<guide-fairy />')(fairyScope);
                    $rootElement.eq(0).append(fairyElement);

                    function cancelDismissal() {
                        if (fairy.dismissalOrder) {
                            $timeout.cancel(fairy.dismissalOrder);
                            fairy.dismissalOrder = null;
                        }
                    }

                    function dismiss(lingerDelay) {
                        lingerDelay = lingerDelay || 0;
                        if (!fairy.dismissalOrder) {
                            fairy.dismissalOrder = $timeout(function () {
                                fairyElement.remove();
                                fairyElement = null;
                                fairyScope.$destroy();
                                fairyScope = null;
                                fairies[fairyName] = null;
                            }, lingerDelay); //we want to linger around a little in case this fairy is sent somewhere else
                        }
                    }

                    var fairy = {
                        dismiss: dismiss,
                        showExplanation: function (explanationUrl) {
                            cancelDismissal();
                            fairyScope.explanationUrl = explanationUrl;
                            fairyScope.showingExplanation = true;
                        },
                        send: function (stop) {
                            cancelDismissal();
                            fairyScope.showingExplanation = false;
                            fairyScope.stop = stop;
                            fairy.stop = stop;
                            fairyScope.classFromStop = stop.fairyClass;
                            fairyScope.tickle = function () {
                                stop.tickle({showStop: guide.showStop, fairy: fairy});
                            };

                            $timeout(reposition);
                        }
                    };

                    fairyScope.fairy = fairy;

                    return fairy;
                }

                return function () {
                    return guide;
                };
            }]);

    angularGuide.directive('guideStop', ['$$guideStopTrackerService', function (tracker) {
        return {
            scope: {
                tickle: '&guideOnFairyTickle'
            },
            link: function (scope, element, attrs) {

                console.log("Got class: " + attrs.guideFairyClass);
                var stop = {
                    element: element,
                    name: attrs.guideStop,
                    fairyPositioning: attrs.guideFairyPositioning || 'right',
                    explanationAlignmentElement: attrs.guideExplanationAlignmentElement,
                    fairyClass: attrs.guideFairyClass || ''
                };

                if (scope.tickle) {
                    stop.tickle = scope.tickle;
                }

                if (attrs.guideExplanationTemplateUrl) {
                    stop.explanationUrl = attrs.guideExplanationTemplateUrl;
                    var originalTickle = stop.tickle || angular.noop;
                    stop.tickle = function (options) {
                        originalTickle(options);
                        options.fairy.showExplanation(stop.explanationUrl);
                    }
                }
                ;

                tracker.registerStop(attrs.guideStop, stop);

                scope.$on('$destroy', function () {
                    tracker.unregisterStop(attrs.guideStop);
                });
            }
        };
    }]);

    angularGuide.directive('guideFairy', ['$rootElement', '$timeout', function ($rootElement, $timeout) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'template/guideFairy.html',
            controller: ['$scope', function ($scope) {
                $scope.hideExplanation = function () {
                    $scope.showingExplanation = false;
                }
            }],
            link: function (scope, myElement, attrs) {
                var listener = function (event) {
                    if (!thisFairyContains(event.target)) {
                        scope.$apply(function () {
                            scope.showingExplanation = false;
                        });
                    }
                };

                scope.$watch('showingExplanation', function (showing) {
                    if (showing) {
                        $timeout(function () {
                            // want to do this on the next frame so we don't catch the click
                            // that changed showingExplanation!
                            $rootElement.on('click', listener);
                        });
                    } else {
                        $rootElement.off('click', listener);
                    }
                });

                scope.$on('$destroy', function () {
                    $rootElement.off('click', listener);
                });


                function thisFairyContains(testElement) {
                    myElement = angular.element(myElement);
                    testElement = angular.element(testElement);
                    var count = 0;
                    while (testElement[0] && testElement[0] != $rootElement[0] && testElement[0] != myElement[0] && count < 20) {
                        count++;
                        testElement = testElement.parent();
                    }

                    return testElement[0] == myElement[0];
                }
            }
        };
    }]);

    angularGuide.factory('$$guideStopTrackerService', ['$q', function ($q) {
        var registeredStops = {};
        var waitingGets = {};

        return {
            registerStop: function (stopName, stop) {
                registeredStops[stopName] = stop;

                if (waitingGets[stopName]) {
                    var deferred = waitingGets[stopName];
                    waitingGets[stopName] = undefined;
                    deferred.resolve(stop);
                }
            },

            unregisterStop: function (stopName) {
                registeredStops[stopName] = undefined;
            },

            getStop: function (stopName) {
                if (registeredStops[stopName]) {
                    return $q.when(registeredStops[stopName]);
                } else {
                    if (typeof waitingGets[stopName] === 'undefined') {
                        waitingGets[stopName] = $q.defer();
                    }
                    return waitingGets[stopName].promise;
                }
            }
        }
    }]);

    return angularGuide;
});