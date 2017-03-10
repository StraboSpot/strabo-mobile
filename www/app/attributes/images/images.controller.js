(function () {
  'use strict';

  angular
    .module('app')
    .controller('ImagesController', ImagesController);

  ImagesController.$inject = ['$ionicHistory', '$location', '$log', '$q', '$scope', 'DataModelsFactory', 'ImageFactory',
    'HelpersFactory', 'SpotFactory', 'IS_WEB'];

  function ImagesController($ionicHistory, $location, $log, $q, $scope, DataModelsFactory, ImageFactory, HelpersFactory,
                            SpotFactory, IS_WEB) {
    var vm = this;
    var vmParent = $scope.vm;

    var imageSources = {};

    vm.images = [];
    vm.imageIdSelected = undefined;

    vm.getImageSrc = getImageSrc;
    vm.getLabel = getLabel;
    vm.goToImage = goToImage;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      gatherImages();
    }

    function gatherImages() {
      var promises = [];
      imageSources = [];
      var spots = angular.fromJson(angular.toJson(SpotFactory.getActiveSpots()));
      _.each(spots, function (spot) {
        if (spot.properties.images) {
          _.each(spot.properties.images, function (image) {
            image.spotId = spot.properties.id;
            vm.images.push(image);
            var promise = ImageFactory.getImageById(image.id).then(function (src) {
              if (IS_WEB) imageSources[image.id] = "https://strabospot.org/pi/" + image.id;
              else if (src) imageSources[image.id] = src;
              else imageSources[image.id] = 'img/image-not-found.png';
            });
            promises.push(promise);
          });
        }
      });
      $log.log(vm.images);
      return $q.all(promises).then(function () {
        //$log.log('Image Sources:', imageSources);
      });
    }

    /**
     * Public Functions
     */

    function getImageSrc(imageId) {
      return imageSources[imageId] || 'img/loading-image.png';
    }

    function getLabel(label) {
      return DataModelsFactory.getLabel(label);
    }

    function goToImage(image) {
      vm.imageIdSelected = image.id;
      if (!IS_WEB) HelpersFactory.setBackView($ionicHistory.currentView().url);
      $location.path('/app/spotTab/' + image.spotId + '/images');
    }
  }
}());
