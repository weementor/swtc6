/*global angular: true, FastClick:true*/
(function () {
    'use strict';
    window.addEventListener('load', function () {
        FastClick.attach(document.body);
    });

    angular.module('MentorSwitch', ['ui.router', 'checklist-model']).config([
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
                url: '/mentor/list/:mentorSessionId',
                templateUrl: 'views/mentor-matches.html'
            }).state('question-list', {
                url: '/ask/list/:questionId',
                templateUrl: 'views/question-matches.html'
            }).state('show-profile', {
                url: '/user/:userId',
                templateUrl: 'views/profile.html'
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
