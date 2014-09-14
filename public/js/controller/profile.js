/*global angular: true*/
(function () {
    'use strict';
    angular.module('MentorSwitch').controller('ProfileController', [
        '$scope',
        '$state',
        '$http',
        function ($scope, $state, $http) {
            var userId = $state.params.userId;

            $http({
                method: 'GET',
                url: '/secure/users/' + userId
            }).success(function (data) {
                $scope._user = data;
            });
        }
    ]);
}());
