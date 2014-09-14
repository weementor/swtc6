/*globals angular:true*/
(function () {
    'use strict';

    angular.module('MentorSwitch').directive('peopleCard', function () {
        return {
            templateUrl: '/views/people-card.html',
            controller: [
                '$scope',
                function ($scope) {
                    if ($scope.question) {
                        $scope.body = $scope.question.body;
                        $scope.isQuestion = true;
                    } else {
                        $scope.body = $scope.user.about;
                    }
                }
            ],
            scope: {
                user: '=user',
                question: '=question'
            }
        };
    });
}());
