'use strict';

/**
 * @ngdoc function
 * @name albumPhotoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the albumPhotoApp
 */
angular.module('albumPhotoApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
