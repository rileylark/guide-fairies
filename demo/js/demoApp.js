(function () {
    'use strict';

    var demoApp = angular.module('FairyDemo', ['guide-fairies', 'ui.bootstrap']);

    demoApp.directive('prettyprint', function() {
        // from http://stackoverflow.com/questions/21081950/calling-prettyprint-dynamically-in-angularjs-ruins-binding
        return {
            restrict: 'C',
            link: function postLink(scope, element, attrs) {
                console.log("Getting: ", element.html());
                element.html(prettyPrintOne(element.html()), '', true);
            }
        };
    });

    demoApp.controller('MainDemoController', ['guideFairies', '$scope', function(guideFairies, $scope) {

        var demoController = this;

        //intro modal
        guideFairies.showStop('showFeaturesButton', 'WELCOME_FAIRY');

        $scope.introModalShowing = true;

        $scope.hideIntroModal = function() {
            $scope.introModalShowing = false;
            guideFairies.showStop('firstUsageExample', 'WELCOME_FAIRY');
        };

        //examples
        demoController.exampleStates = [];
        for (var i = 0; i < 3; i++) {
            demoController.exampleStates.push({open: false});
        }

        function getExampleState(index) {
            if (!demoController.exampleStates[index]) {
                demoController.exampleStates[index] = {};
            }

            return demoController.exampleStates[index];
        }

        $scope.$watch('demoController.exampleStates[0].open', function(open) {
            if (open) {
                guideFairies.showStop('example-1-action', 'WELCOME_FAIRY');
            } else {
                guideFairies.dismissFairy('example-1-action');
            }
        });

    }]);
}());
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.10.0 - 2014-01-15
 * License: MIT
 */
angular.module("ui.bootstrap",["ui.bootstrap.tpls","ui.bootstrap.transition","ui.bootstrap.collapse","ui.bootstrap.accordion"]),angular.module("ui.bootstrap.tpls",["template/accordion/accordion-group.html","template/accordion/accordion.html"]),angular.module("ui.bootstrap.transition",[]).factory("$transition",["$q","$timeout","$rootScope",function(a,b,c){function d(a){for(var b in a)if(void 0!==f.style[b])return a[b]}var e=function(d,f,g){g=g||{};var h=a.defer(),i=e[g.animation?"animationEndEventName":"transitionEndEventName"],j=function(){c.$apply(function(){d.unbind(i,j),h.resolve(d)})};return i&&d.bind(i,j),b(function(){angular.isString(f)?d.addClass(f):angular.isFunction(f)?f(d):angular.isObject(f)&&d.css(f),i||h.resolve(d)}),h.promise.cancel=function(){i&&d.unbind(i,j),h.reject("Transition cancelled")},h.promise},f=document.createElement("trans"),g={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",transition:"transitionend"},h={WebkitTransition:"webkitAnimationEnd",MozTransition:"animationend",OTransition:"oAnimationEnd",transition:"animationend"};return e.transitionEndEventName=d(g),e.animationEndEventName=d(h),e}]),angular.module("ui.bootstrap.collapse",["ui.bootstrap.transition"]).directive("collapse",["$transition",function(a){return{link:function(b,c,d){function e(b){function d(){j===e&&(j=void 0)}var e=a(c,b);return j&&j.cancel(),j=e,e.then(d,d),e}function f(){k?(k=!1,g()):(c.removeClass("collapse").addClass("collapsing"),e({height:c[0].scrollHeight+"px"}).then(g))}function g(){c.removeClass("collapsing"),c.addClass("collapse in"),c.css({height:"auto"})}function h(){k?(k=!1,i(),c.css({height:0})):(c.css({height:c[0].scrollHeight+"px"}),c[0].offsetWidth,c.removeClass("collapse in").addClass("collapsing"),e({height:0}).then(i))}function i(){c.removeClass("collapsing"),c.addClass("collapse")}var j,k=!0;b.$watch(d.collapse,function(a){a?h():f()})}}}]),angular.module("ui.bootstrap.accordion",["ui.bootstrap.collapse"]).constant("accordionConfig",{closeOthers:!0}).controller("AccordionController",["$scope","$attrs","accordionConfig",function(a,b,c){this.groups=[],this.closeOthers=function(d){var e=angular.isDefined(b.closeOthers)?a.$eval(b.closeOthers):c.closeOthers;e&&angular.forEach(this.groups,function(a){a!==d&&(a.isOpen=!1)})},this.addGroup=function(a){var b=this;this.groups.push(a),a.$on("$destroy",function(){b.removeGroup(a)})},this.removeGroup=function(a){var b=this.groups.indexOf(a);-1!==b&&this.groups.splice(this.groups.indexOf(a),1)}}]).directive("accordion",function(){return{restrict:"EA",controller:"AccordionController",transclude:!0,replace:!1,templateUrl:"template/accordion/accordion.html"}}).directive("accordionGroup",["$parse",function(a){return{require:"^accordion",restrict:"EA",transclude:!0,replace:!0,templateUrl:"template/accordion/accordion-group.html",scope:{heading:"@"},controller:function(){this.setHeading=function(a){this.heading=a}},link:function(b,c,d,e){var f,g;e.addGroup(b),b.isOpen=!1,d.isOpen&&(f=a(d.isOpen),g=f.assign,b.$parent.$watch(f,function(a){b.isOpen=!!a})),b.$watch("isOpen",function(a){a&&e.closeOthers(b),g&&g(b.$parent,a)})}}}]).directive("accordionHeading",function(){return{restrict:"EA",transclude:!0,template:"",replace:!0,require:"^accordionGroup",compile:function(a,b,c){return function(a,b,d,e){e.setHeading(c(a,function(){}))}}}}).directive("accordionTransclude",function(){return{require:"^accordionGroup",link:function(a,b,c,d){a.$watch(function(){return d[c.accordionTransclude]},function(a){a&&(b.html(""),b.append(a))})}}}),angular.module("template/accordion/accordion-group.html",[]).run(["$templateCache",function(a){a.put("template/accordion/accordion-group.html",'<div class="panel panel-default">\n  <div class="panel-heading">\n    <h4 class="panel-title">\n      <a class="accordion-toggle" ng-click="isOpen = !isOpen" accordion-transclude="heading">{{heading}}</a>\n    </h4>\n  </div>\n  <div class="panel-collapse" collapse="!isOpen">\n	  <div class="panel-body" ng-transclude></div>\n  </div>\n</div>')}]),angular.module("template/accordion/accordion.html",[]).run(["$templateCache",function(a){a.put("template/accordion/accordion.html",'<div class="panel-group" ng-transclude></div>')}]);
angular.module("FairyDemo").run(["$templateCache", function($templateCache) {$templateCache.put("examples/explainFeature.html","<button guide-stop=\"exacerbate-explanation\" class=\"btn btn-danger btn-lg\">Exacerbate</button>");
$templateCache.put("examples/simpleIntro.html","<div><div ng-if=\"!clickedButton\"><p>When a new user opens your app it should be very clear what they should do first. This makes it easier for people to understand what\'s happening and quickly do something \"right.\"</p><p>Adding a fairy to this action is cute and friendly, and also associates the fairies with actions -\nsafe, useful actions. This initial fairy isn\'t necessary to teach a new person how to do the right action,\nbecause that\'s already so simple that no one could miss it. The first fairy is just to teach people what the\nfairies do, what you can expect out of them, and that they can be trusted.</p><center><button ng-click=\"$parent.clickedButton = true\" guide-stop=\"example-1-action\" guide-on-fairy-tickle=\"$parent.clickedButton = true\" guide-fairy-class=\"fairy--read-on-button\" class=\"btn btn-primary btn-lg\">There\'s only one thing to do</button><p class=\"small\">(and it teaches you what fairies are even if you won\'t read my copy)</p></center></div><div ng-if=\"clickedButton\"><p>Here\'s what the code looks like.</p><pre class=\"prettyprint\">&lt;button guide-stop=\'example-1-action\'&gt;\n    There\'s only one thing to do\n&lt;/button&gt;\n</pre><pre class=\"prettyprint\">guideFairies.showStop(\'example-1-action\'); // this stop id matches\n                                           // the guide-stop value</pre></div></div>");}]);