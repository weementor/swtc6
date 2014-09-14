/*global angular: true*/
(function () {
    'use strict';
    angular.module('MentorSwitch').controller('QuestionMatchController', [
        '$scope',
        '$state',
        '$http',
        function ($scope, $state, $http) {
            var questionId = $state.params.questionId;

            $http({
                method: 'GET',
                url: '/secure/mentors/' + questionId
            }).success(function (data) {
                $scope.mentors = data;
                console.log(data);
            });
        }
    ]);
}());
