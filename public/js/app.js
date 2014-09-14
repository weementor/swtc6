/*global angular: true, FastClick:true*/
(function () {
    'use strict';
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    });

    angular.module('MentorSwitch', ['ui.router']).config([
        '$stateProvider',
        '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/');

            $stateProvider.state('switcher', {
                url: '/',
                templateUrl: 'views/switcher.html'
            }).state('mentor', {
                url: '/mentor',
                templateUrl: 'views/mentor.html'
            }).state('ask', {
                url: '/ask',
                templateUrl: 'views/ask.html'
            }).state('mentor-list', {
                url: '/mentor/list',
                templateUrl: 'views/mentor-matches.html'
            });
        }
    ]).run([
        '$rootScope',
        '$state',
        function ($rootScope, $state) {
            $rootScope.$state = $state;
        }
    ]);
}());
