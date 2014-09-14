/*global angular: true*/
(function () {
    'use strict';
    angular.module('MentorSwitch').controller('MentorController', [
        '$scope',
        '$http',
        '$state',
        function ($scope, $http, $state) {

            $scope.submit = function submit() {
                if ($scope.form.$valid) {
                    var submission = {
                        topics: $scope.user.knownTopics
                    };

                    $http({
                        method: 'POST',
                        url: '/secure/mentors',
                        data: submission
                    }).success(function (data) {
                        $state.go('mentor-list', {
                            mentorSessionId: data._id
                        });
                    }).error(function (data) {
                        window.alert(data);
                    });
                }
            };
        }
    ]);
}());
