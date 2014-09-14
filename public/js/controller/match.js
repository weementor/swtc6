/*global angular: true*/
(function () {
    'use strict';
    angular.module('MentorSwitch').controller('MatchController', [
        '$scope',
        '$state',
        function ($scope, $state) {
            console.log($state.params);
        }
    ]);
}());
