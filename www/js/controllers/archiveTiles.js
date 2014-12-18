'use strict';

angular.module('app')
.controller('MapNameCtrl', function(
  $scope,
  ViewExtentFactory) {

  // name of the map
  $scope.mapName;

  // is the user choosing to download inner zooms?  default is false
  $scope.downloadZooms = {
    checked: false
  };


  $scope.onChangeDownloadZooms = function() {
    console.log($scope.downloadZooms);
  }


  $scope.submit = function() {
    console.log("submit");
    console.log(ViewExtentFactory.getExtent());
  }

});