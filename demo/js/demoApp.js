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
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.10.0 - 2014-01-15
 * License: MIT
 */
angular.module("ui.bootstrap",["ui.bootstrap.tpls","ui.bootstrap.transition","ui.bootstrap.collapse","ui.bootstrap.accordion"]),angular.module("ui.bootstrap.tpls",["template/accordion/accordion-group.html","template/accordion/accordion.html"]),angular.module("ui.bootstrap.transition",[]).factory("$transition",["$q","$timeout","$rootScope",function(a,b,c){function d(a){for(var b in a)if(void 0!==f.style[b])return a[b]}var e=function(d,f,g){g=g||{};var h=a.defer(),i=e[g.animation?"animationEndEventName":"transitionEndEventName"],j=function(){c.$apply(function(){d.unbind(i,j),h.resolve(d)})};return i&&d.bind(i,j),b(function(){angular.isString(f)?d.addClass(f):angular.isFunction(f)?f(d):angular.isObject(f)&&d.css(f),i||h.resolve(d)}),h.promise.cancel=function(){i&&d.unbind(i,j),h.reject("Transition cancelled")},h.promise},f=document.createElement("trans"),g={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",transition:"transitionend"},h={WebkitTransition:"webkitAnimationEnd",MozTransition:"animationend",OTransition:"oAnimationEnd",transition:"animationend"};return e.transitionEndEventName=d(g),e.animationEndEventName=d(h),e}]),angular.module("ui.bootstrap.collapse",["ui.bootstrap.transition"]).directive("collapse",["$transition",function(a){return{link:function(b,c,d){function e(b){function d(){j===e&&(j=void 0)}var e=a(c,b);return j&&j.cancel(),j=e,e.then(d,d),e}function f(){k?(k=!1,g()):(c.removeClass("collapse").addClass("collapsing"),e({height:c[0].scrollHeight+"px"}).then(g))}function g(){c.removeClass("collapsing"),c.addClass("collapse in"),c.css({height:"auto"})}function h(){k?(k=!1,i(),c.css({height:0})):(c.css({height:c[0].scrollHeight+"px"}),c[0].offsetWidth,c.removeClass("collapse in").addClass("collapsing"),e({height:0}).then(i))}function i(){c.removeClass("collapsing"),c.addClass("collapse")}var j,k=!0;b.$watch(d.collapse,function(a){a?h():f()})}}}]),angular.module("ui.bootstrap.accordion",["ui.bootstrap.collapse"]).constant("accordionConfig",{closeOthers:!0}).controller("AccordionController",["$scope","$attrs","accordionConfig",function(a,b,c){this.groups=[],this.closeOthers=function(d){var e=angular.isDefined(b.closeOthers)?a.$eval(b.closeOthers):c.closeOthers;e&&angular.forEach(this.groups,function(a){a!==d&&(a.isOpen=!1)})},this.addGroup=function(a){var b=this;this.groups.push(a),a.$on("$destroy",function(){b.removeGroup(a)})},this.removeGroup=function(a){var b=this.groups.indexOf(a);-1!==b&&this.groups.splice(this.groups.indexOf(a),1)}}]).directive("accordion",function(){return{restrict:"EA",controller:"AccordionController",transclude:!0,replace:!1,templateUrl:"template/accordion/accordion.html"}}).directive("accordionGroup",["$parse",function(a){return{require:"^accordion",restrict:"EA",transclude:!0,replace:!0,templateUrl:"template/accordion/accordion-group.html",scope:{heading:"@"},controller:function(){this.setHeading=function(a){this.heading=a}},link:function(b,c,d,e){var f,g;e.addGroup(b),b.isOpen=!1,d.isOpen&&(f=a(d.isOpen),g=f.assign,b.$parent.$watch(f,function(a){b.isOpen=!!a})),b.$watch("isOpen",function(a){a&&e.closeOthers(b),g&&g(b.$parent,a)})}}}]).directive("accordionHeading",function(){return{restrict:"EA",transclude:!0,template:"",replace:!0,require:"^accordionGroup",compile:function(a,b,c){return function(a,b,d,e){e.setHeading(c(a,function(){}))}}}}).directive("accordionTransclude",function(){return{require:"^accordionGroup",link:function(a,b,c,d){a.$watch(function(){return d[c.accordionTransclude]},function(a){a&&(b.html(""),b.append(a))})}}}),angular.module("template/accordion/accordion-group.html",[]).run(["$templateCache",function(a){a.put("template/accordion/accordion-group.html",'<div class="panel panel-default">\n  <div class="panel-heading">\n    <h4 class="panel-title">\n      <a class="accordion-toggle" ng-click="isOpen = !isOpen" accordion-transclude="heading">{{heading}}</a>\n    </h4>\n  </div>\n  <div class="panel-collapse" collapse="!isOpen">\n	  <div class="panel-body" ng-transclude></div>\n  </div>\n</div>')}]),angular.module("template/accordion/accordion.html",[]).run(["$templateCache",function(a){a.put("template/accordion/accordion.html",'<div class="panel-group" ng-transclude></div>')}]);
angular.module('FairyDemo')
    .controller('visualChecklistController', ['$scope', 'appSpecificGuideService', function ($scope, appSpecificGuideService) {
        'use strict';

        this.selectedFeature = 1;

        $scope.$watch('visualChecklistController.selectedFeature', function (newFeatureNumber) {
            appSpecificGuideService.signalVisualChecklistFeatureSelected(newFeatureNumber);
        });

    }]);
angular.module("FairyDemo").run(["$templateCache", function($templateCache) {$templateCache.put("examples/explainFeature.html","<div class=\"row\"><div ng-init=\"selectedFeature = &quot;Manage Tasks&quot;\" class=\"col-lg-4\"><div class=\"btn-group-vertical\"><button ng-repeat=\"feature in [&quot;Manage Tasks&quot;, &quot;Check Your Email&quot;, &quot;Empower Your Users&quot;] track by $index\" ng-click=\"$parent.selectedFeature = feature\" class=\"btn btn-default btn-lg\">{{feature}}</button><button ng-click=\"selectedFeature = &quot;Eruminate Your Rendolence&quot;\" guide-stop=\"eruminate-your-rendolence\" guide-fairy-class=\"special-fairy-class-for-explainers\" guide-explanation-template-url=\"examples/simpleIntro__eruminate.html\" class=\"btn btn-default btn-lg\">Eruminate Your Rendolence</button><button ng-repeat=\"feature in [&quot;Analytics&quot;, &quot;Log Out&quot;] track by $index\" ng-click=\"$parent.selectedFeature = feature\" class=\"btn btn-default btn-lg\">{{feature}}</button></div></div><div class=\"col-lg-8\"><div ng-if=\"selectedFeature == &quot;Eruminate Your Rendolence&quot;\"><h3>{{selectedFeature}}</h3><p>Honestly, your user has no chance of understanding this crazy interface without at least some context.</p><p>I recommend you redesign until your interface is easy to understand, but if you don\'t have time for that,\nyou could use a fairy to explain something. They are less annoying than modal popups and less invisible\nthan explanatory text.</p></div><div ng-if=\"selectedFeature != &quot;Eruminate Your Rendolence&quot;\"><h3>{{selectedFeature}}</h3><p>This feature has an easy interface that everyone can quickly understand.</p><p class=\"well\">Note: an explanation might still be useful for helping your users feel powerful, with a tip for\nextremely effective use or an affirmation of how great your user is when he \"{{selectedFeature}}\"s</p></div></div></div>");
$templateCache.put("examples/simpleIntro.html","<div><div ng-if=\"!clickedButton\"><p>When a new user opens your app it should be very clear what they should do first. This makes it easier for people to understand what\'s happening and quickly do something \"right.\"</p><p>Adding a fairy to this action is cute and friendly, and also associates the fairies with actions -\nsafe, useful actions. This initial fairy isn\'t necessary to teach a new person how to do the right action,\nbecause that\'s already so simple that no one could miss it. The first fairy is just to teach people what the\nfairies do, what you can expect out of them, and that they can be trusted.</p><center><button ng-click=\"$parent.clickedButton = true\" guide-stop=\"example-1-action\" guide-on-fairy-tickle=\"$parent.clickedButton = true\" guide-fairy-class=\"fairy--read-on-button\" class=\"btn btn-primary btn-lg\">There\'s only one thing to do</button><p class=\"small\">(and it teaches you what fairies are even if you won\'t read my copy)</p></center></div><div ng-if=\"clickedButton\"><p>Here\'s what the code looks like.</p><pre class=\"prettyprint\">&lt;button guide-stop=\'example-1-action\'&gt;\n    There\'s only one thing to do\n&lt;/button&gt;\n</pre><pre class=\"prettyprint\">guideFairies.showStop(\'example-1-action\'); // this stop id matches\n                                           // the guide-stop value</pre></div></div>");
$templateCache.put("examples/simpleIntro__eruminate.html","<div style=\"background-color: white; border: 1px solid gray; border-radius: 5px; max-width: 500px\" class=\"container\"><div class=\"row\"><div class=\"col-sm-12\"><h4>Rendolent Erumination</h4><p>This is a quick explanation of how eruminating rendolently can help you be better at your job. You\'re going\nto feel like you\'ve got superpowers after you start using this tool!</p><p><a href=\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\" target=\"_blank\">Learn More</a></p></div></div><div class=\"row\"><div class=\"col-sm-12\"><pre class=\"prettyprint\">&lt;button\n    guide-stop = \'example-1-action\'\n    guide-fairy-class = \'custom-class\'\n    guide-explanation-template-url = \'explanation.html\'&gt;\n        Eruminate Your Rendolence\n&lt;/button&gt;\n</pre></div></div><div class=\"row\"><div class=\"col-sm-12\"><p>Notice how your fairy display code works directly into your markup. I thought this was the easiest way to\ntell the fairies exactly where to go. It also makes it easy to see how css classes are related, etc.</p><p>But: the javascript controlling these fairies can be completely separated into a separate module. The logic\nfor running the fairies does not need to be entwined with the logic for running your normal application. Perfect!</p></div></div><div class=\"row\"><div class=\"col-sm-12\"><button ng-click=\"dismissFairy()\" class=\"btn btn-default\">Got it!</button></div></div></div>");
$templateCache.put("examples/visualChecklist.html","<div ng-controller=\"visualChecklistController as visualChecklistController\"><p>Maybe your app has a few different features that your user might be interested in. If you can\'t count on a certain\npriority in which to introduce the features, a subtle fairy at each point can serve as standing reminders to check\nout the features later.</p><div class=\"navbar navbar-default\"><div class=\"container-fluid\"><div class=\"navbar-header\"><span class=\"navbar-brand\">AMAZING NAV UI</span></div><div class=\"collapse navbar-collapse\"><ul class=\"nav navbar-nav\"><li ng-repeat=\"featureNumber in [1, 2, 3] track by $index\" ng-class=\"{&quot;active&quot;: visualChecklistController.selectedFeature == featureNumber}\"><a ng-click=\"visualChecklistController.selectedFeature = featureNumber\" guide-stop=\"checklist-{{featureNumber}}\" guide-fairy-class=\"fairy--read-on-button\" guide-on-fairy-tickle=\"visualChecklistController.selectedFeature = featureNumber\">Feature {{ featureNumber }}</a></li></ul></div></div></div><div class=\"well\"><h1>Feature {{visualChecklistController.selectedFeature}}</h1><p>This would be the interface for feature {{visualChecklistController.selectedFeature}}.\nThere\'s no urgency for the user to try out the other\nfeatures right now, but the fairies serve as cute little reminders that there is other stuff to try.</p><p>You could even do something like highlighting feature [2] on the user\'s third visit, if he\'s never tried feature [2]\nbefore. Or, if you saw her using feature x a lot, and that was especially complementary to feature y, maybe suggest\nit with a little fairy!</p></div></div>");}]);