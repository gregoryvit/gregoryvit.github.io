'use strict';

/* App Module */

var phonecatApp = angular.module('rulesEditorApp', ['ngSanitize', 'ui.bootstrap', 'ui.select2']);


phonecatApp.service('myService', function($http, $q) {
    var _this = this;

    this.promiseToHaveData = function() {
        var defer = $q.defer();

        $http.get('result.json')
            .success(function(data) {
                angular.extend(_this, data);
                defer.resolve(data);
            })
            .error(function() {
                defer.reject('could not find result.json');
            });

        return defer.promise;
    }
});

phonecatApp.controller('questions_controller', ['$scope', 'myService', function($scope, myService){
    $scope.test = '';
    $scope.questions = [];
    $scope.total_answers_cnt = 0;
    $scope.right_answers_cnt = 0;

    function shuffle(array) {
        var currentIndex = array.length
            , temporaryValue
            , randomIndex
            ;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function has_similar_elements(array) {
        for (var i = 0; i < array.length; i++) {
            for (var j = i+1; j < array.length; j++) {
                if (array[i].toLowerCase() === array[j].toLowerCase()) {
                    return true;
                }
            }
        }
        return false;
    }

    var promise = myService.promiseToHaveData();
    promise.then(function(data) {
        $scope.questions = shuffle(data);
        $scope.loadNextQuestion();
    }, function(reason) {
        alert('Failed: ' + reason);
    }, function(update) {
        alert('Got notification: ' + update);
    });

    $scope.answers = [];

    // selected fruits
    $scope.userAnswers = [];

    // toggle selection for a given fruit by name
    $scope.toggleSelection = function toggleSelection(answer) {
        var idx = $scope.userAnswers.indexOf(answer);

        // is currently selected
        if (idx > -1) {
            $scope.userAnswers.splice(idx, 1);
        }

        // is newly selected
        else {
            $scope.userAnswers.push(answer);
        }
    };

    $scope.questionNumber = 0;
    $scope.questionType = 'choose';
    $scope.loadQuestion = function(question_number) {
        console.log($scope.questions[question_number]['title']);
        $scope.questionNumber = question_number;
        $scope.title = 'Задание ' + $scope.questions[question_number].title;
        $scope.body = $scope.questions[question_number].body;

        $scope.answers = [];
        if ('right_answers' in $scope.questions[question_number]) {
            $scope.questions[question_number]['right_answers'].forEach(function(item) {
                $scope.answers.push(item);
            });
        }
        if ('wrong_answers' in $scope.questions[question_number]) {
            $scope.questions[question_number]['wrong_answers'].forEach(function(item) {
                $scope.answers.push(item);
            });
        }

        if (has_similar_elements($scope.answers) || $scope.answers.length == 1) {
            console.log($scope.answers[0]);
            $scope.answers = [$scope.answers[0]];
            $scope.userAnswer = '';
            $scope.questionType = 'write';
        }
        else {
            $scope.answers = shuffle($scope.answers);
            $scope.questionType = 'choose';
        }
    };

    $scope.checkAnswer = function(){
        $scope.total_answers_cnt += 1;
        var mach_count = 0;

        var rightAnswers = [];
        if ('right_answers' in $scope.questions[$scope.questionNumber]) {
            rightAnswers = $scope.questions[$scope.questionNumber]['right_answers'];
        }

        for (var i = 0; i < $scope.userAnswers.length; i++) {
            for (var j = 0; j < rightAnswers.length; j++) {
                console.log(rightAnswers[j].toLowerCase() + ' === ' + $scope.userAnswers[i].toLowerCase());
                if (rightAnswers[j].toLowerCase() === $scope.userAnswers[i].toLowerCase()) {
                    mach_count += 1;
                }
            }
        }

        console.log('matches: ' + mach_count + ' ' + 'userAnswers:')
        console.log($scope.userAnswers);
        console.log(rightAnswers);


        if (mach_count == $scope.userAnswers.length && mach_count == rightAnswers.length && $scope.questionType === 'choose') {
            alert('Правильно!');
            $scope.right_answers_cnt += 1;
        }
        else if (mach_count > 0 && $scope.questionType === 'write'){
            alert('Правильно!');
            $scope.right_answers_cnt += 1;
        }
        else {
            var result = '';
            for (var i = 0; i < rightAnswers.length; i++) {
                result += rightAnswers[i];
                if (i < rightAnswers.length - 1) {
                    result += ', ';
                }
            }
            alert('Не правильно!\n\nПравильные ответы:\n' + result);
        }

        $scope.userAnswers = [];
        $scope.loadNextQuestion();
    }

    $scope.loadNextQuestion = function() {
        $scope.loadQuestion($scope.questionNumber + 1);
    }
}]);