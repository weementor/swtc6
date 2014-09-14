/*global angular: true*/
(function () {
    'use strict';
    angular.module('MentorSwitch').controller('ConversationController', [
        '$scope',
        '$state',
        '$http',
        function ($scope, $state, $http) {
            var userId = $state.params.userId;

            $http({
                method: 'GET',
                url: '/secure/users/' + userId
            }).success(function (data) {
                $scope.user = data;
            });

            $scope.setupConversation = function () {
                $http({
                    method: 'POST',
                    url: '/secure/conversations',
                    data: {
                        toUser: userId
                    }
                }).success(function (data) {
                    window.location = 'sms:' + data.phoneNumber;
                });
            };
        }
    ]);
}());
