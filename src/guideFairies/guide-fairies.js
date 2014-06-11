(function () {
    'use strict';

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

    angularGuide.factory('guideFairies',
        ['$$fairyManagementService', '$$guideStopTrackerService',
            function (fairyManagementService, tracker) {

                var guide = {
                    showStop: function (stopName, fairyName) {
                        fairyName = fairyName || ('unique' + Math.random());  //come up with a new name if none was supplied
                        fairyManagementService.getFairy(fairyName).send(stopName);
                    },

                    showExplanation: function (fairyName) {
                        fairyManagementService.getFairy(fairyName).showExplanation();
                    },

                    dismissFairy: function (stopName) {
                        fairyManagementService.dismissAnyFairiesAtStop(stopName);
                    },

                    onGuideStopLinked: function onGuideStopLinked(stopName, callback) {
                        return tracker.onGuideStopLinked(stopName, callback);
                    }
                };

                tracker.addGuideStopUnlinkedHandler(function (stopName) {
                    fairyManagementService.dismissAnyFairiesAtStop(stopName);
                });

                return guide;
            }]);

    angularGuide.directive('guideStop', ['$$guideStopTrackerService', function (tracker) {
        return {
            scope: {
                tickle: '&guideOnFairyTickle'
            },
            link: function (scope, element, attrs) {

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
            templateUrl: 'guideFairy.html',
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

    angularGuide.factory('$$fairyManagementService', [
        '$$guideStopTrackerService', '$$guideFairiesPositionService', '$timeout', '$compile', '$rootElement', '$rootScope', '$interval',
        function (tracker, position, $timeout, $compile, $rootElement, $rootScope, $interval) {
            var fairies = {};

            function getFairy(fairyName) {
                if (!fairies[fairyName]) {
                    fairies[fairyName] = createNewFairy(fairyName);
                }

                return fairies[fairyName];
            }


            function createNewFairy(fairyName) {

                var fairyScope = $rootScope.$new();

                function reposition() {
                    tracker.getStop(fairy.stopName)
                        .then(function (stop) {
                            if (!fairyScope) {
                                return; //this fairy was destroyed before getStop resolved :(
                            }

                            var alignmentElement;
                            if (fairyScope.showingExplanation && stop.explanationAlignmentElement) {
                                alignmentElement = angular.element(document.querySelector('#' + stop.explanationAlignmentElement))
                            } else {
                                alignmentElement = stop.element;
                            }

                            position(fairyElement, alignmentElement, stop.fairyPositioning);
                        });
                }

                var repositionerPromise = $interval(reposition, 500);

                fairyScope.$watch('showingExplanation', function () {
                    $timeout(function () {
                        if (fairyScope) {  //unfortunately angular is triggering this $watch even after fairyScope.$destroy() :(
                            reposition();
                        }
                    });
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

                fairyScope.dismissFairy = dismiss;

                var fairy = {
                    dismiss: dismiss,
                    showExplanation: function (explanationUrl) {
                        cancelDismissal();
                        if (explanationUrl) {
                            fairyScope.explanationUrl = explanationUrl;
                        }
                        fairyScope.showingExplanation = true;
                    },
                    send: function (stopName) {
                        cancelDismissal();
                        tracker.getStop(stopName)
                            .then(function (stop) {
                                if (!fairyScope) {
                                    return; //this fairy was destroyed before getStop resolved :(
                                }

                                fairyScope.showingExplanation = false;
                                fairyScope.explanationUrl = stop.explanationUrl;
                                fairy.stopName = stopName;

                                fairyScope.classFromStop = stop.fairyClass;
                                fairyScope.tickle = function () {
                                    //TODO: we should not be sending the fairy out of this code.
                                    //      it is private and we assume we have complete control of it.
                                    stop.tickle({fairy: fairy});
                                };
                                $timeout(reposition);
                            });
                    }
                };

                fairyScope.fairy = fairy;

                return fairy;
            }

            return {
                getFairy: getFairy,
                dismissAnyFairiesAtStop: function (stopName) {
                    for (var fairyName in fairies) {
                        var fairy = fairies[fairyName];

                        if (fairy && fairy.stopName === stopName) {
                            fairy.dismiss();
                        }
                    }
                }
            };
        }]);

    angularGuide.factory('$$guideStopTrackerService', ['$q', function ($q) {
        var registeredStops = {};
        var waitingGets = {};
        var registrationListeners = {};
        var anyStopDeregistrationListeners = [];

        function getRegistrationListeners(stopName) {
            if (!registrationListeners[stopName]) {
                registrationListeners[stopName] = [];
            }

            return registrationListeners[stopName];
        }

        function fireRegistrationListeners(stopName) {
            angular.forEach(getRegistrationListeners(stopName), function fireListener(listener) {
                listener.callback();
            });
        }

        function fireDeregistrationListeners(stopName) {
            angular.forEach(anyStopDeregistrationListeners, function (listener) {
                listener.callback(stopName);
            })
        }

        function fireWaitingGets(stopName, stop) {
            if (waitingGets[stopName]) {
                var deferred = waitingGets[stopName];
                waitingGets[stopName] = undefined;
                deferred.resolve(stop);
            }
        }

        return {
            registerStop: function (stopName, stop) {
                registeredStops[stopName] = stop;

                fireRegistrationListeners(stopName);
                fireWaitingGets(stopName, stop);
            },

            unregisterStop: function (stopName) {
                fireDeregistrationListeners(stopName);
                registeredStops[stopName] = undefined;
            },

            getStop: function (stopName) {
                if (registeredStops[stopName]) {
                    return $q.when(registeredStops[stopName]);
                } else {
                    if (!waitingGets[stopName]) {
                        waitingGets[stopName] = $q.defer();
                    }
                    return waitingGets[stopName].promise;
                }
            },

            onGuideStopLinked: function onGuideStopLinked(stopName, callback) {
                var listeners = getRegistrationListeners(stopName);

                var newListener = {
                    callback: callback,
                    unregister: function () {
                        var index = listeners.indexOf(newListener);
                        if (index !== -1) {
                            listeners.splice(index, 1);
                        }
                    }
                };

                listeners.push(newListener);

                return {
                    unregister: newListener.unregister
                };
            },

            addGuideStopUnlinkedHandler: function addGuideStopUnlinkedHandler(callback) {
                var newListener = {
                    callback: callback,
                    unregister: function () {
                        var index = anyStopDeregistrationListeners.indexOf(newListener);
                        if (index !== -1) {
                            anyStopDeregistrationListeners.splice(index, 1);
                        }
                    }
                };

                anyStopDeregistrationListeners.push(newListener);

                return {
                    unregister: newListener.unregister
                };
            }
        }
    }]);

}());