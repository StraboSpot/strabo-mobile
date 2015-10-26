'use strict';

angular
  .module('app')
  .controller('ImageMapsController', function ($scope,
                                               $location,
                                               $window,
                                               $log,
                                               ImageMapService,
                                               SpotsFactory) {
    SpotsFactory.all().then(function (spots) {
      var spotsWithImages = _.filter(spots, function (spot) {
        return spot.images;
      });
      _.forEach(spotsWithImages, function (spot) {
        _.forEach(spot.images, function (image) {
          image['title'] = image.caption ? image.caption.substring(0, 24) : 'Untitled ' + _.indexOf(spot.images, image);
          if (image.annotated) {
            image['annotated'] = true;
            ImageMapService.addImageMap(image);
          }
          else {
            image['annotated'] = false;
            ImageMapService.removeImageMap(image);
          }
        });
      });
      $scope.imageMaps = ImageMapService.getImageMaps();
      $log.log($scope.imageMaps);
    });

    $scope.goToImageMap = function (imageMap) {
      ImageMapService.setCurrentImageMap(imageMap);
      $location.path('/app/image-maps/' + imageMap.id);
    };
  });
