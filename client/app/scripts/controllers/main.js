'use strict';

/**
 * @ngdoc function
 * @name albumPhotoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the albumPhotoApp
 */
angular.module('albumPhotoApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
