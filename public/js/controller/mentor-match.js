/*global angular: true*/
(function () {
    'use strict';
    angular.module('MentorSwitch').controller('MentorMatchController', [
        '$scope',
        '$state',
        '$http',
        function ($scope, $state, $http) {
            var mentorSessionId = $state.params.mentorSessionId;

            $http({
                method: 'GET',
                url: '/secure/questions/' + mentorSessionId
            }).success(function (data) {
                $scope.questions = data;
                console.log(data);
            });
        }
    ]);
}());
