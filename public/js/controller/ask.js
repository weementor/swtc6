/*global angular: true*/
(function () {
    'use strict';
    angular.module('MentorSwitch').controller('AskController', [
        '$scope',
        '$http',
        '$state',
        function ($scope, $http, $state) {

            $scope.submit = function submit() {
                if ($scope.form.$valid) {
                    var submission = {
                        topic: $scope.questionTopic,
                        body: $scope.question
                    };

                    $http({
                        method: 'POST',
                        url: '/secure/user/questions',
                        data: submission
                    }).success(function (data) {
                        $state.go('question-list', {
                            questionId: data._id
                        });
                    }).error(function (data) {
                        window.alert(data);
                    });
                }
            };
        }
    ]);
}());
