angular.module('app')
  .controller('ImageMapsCtrl', function ($scope,
                                         $location,
                                         $window,
                                         ImageMapService,
                                         SpotsFactory) {

    SpotsFactory.all().then(function (spots) {
      var spotsWithImages = _.filter(spots, function (spot) {
        return spot.images
      });
      _.forEach(spotsWithImages, function (spot) {
        _.forEach(spot.images, function (image) {
          var title = image.caption ? image.caption.substring(0, 24) : "Untitled " + _.indexOf(spot.images, image);
          if (!image["title"] == title) {
            image["title"] = title;
            SpotsFactory.save(spot).then(function (data) {
              console.log("image title updated for spot: ", data);
            });
          }
          if (image.annotated) {
            image["annotated"] = true;
            ImageMapService.addImageMap(image);
          }
          else {
            image["annotated"] = false;
            ImageMapService.removeImageMap(image);
          }
        });
      });
      $scope.imageMaps = ImageMapService.getImageMaps();
      console.log($scope.imageMaps);
    });

    $scope.getParentSpotName = function(imageID) {

    };

    $scope.goToImageMap = function (imageMap) {
      ImageMapService.setCurrentImageMap(imageMap);
      $location.path("/app/image-maps/" + imageMap.id);
    };
  });