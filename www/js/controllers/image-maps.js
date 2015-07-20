angular.module('app')
  .controller('ImageMapsCtrl', function ($scope,
                                         $location,
                                         $window,
                                         ImageMapService,
                                         SpotsFactory) {

 /*   $scope.imageMaps = [
      {
        name: "Test",
        id: 12345,
        source: 'http://imgs.xkcd.com/comics/online_communities.png',
        extent: [0, 0, 1024, 968]
      },
      {
        name: "Test2",
        id: 54321,
        source: 'http://minerva.union.edu/hollochk/c_petrology/ig_minerals/quartz1-X.jpg',
        extent: [0, 0, 650, 480]
      }
    ];*/

    $scope.imageMaps = [];
    SpotsFactory.all().then(function (spots) {
      var spotsWithImages = _.filter(spots, function (spot) {
        return spot.images
      });
      _.forEach(spotsWithImages, function (spot) {
        _.forEach(spot.images, function(image) {
          $scope.imageMaps.push(image);
        });
      });

      _.forEach($scope.imageMaps, function (image) {
        image["name"] = image.caption ? image.caption.substring(0, 16) : "Untitled " + _.indexOf($scope.imageMaps, image);
        image["id"] = _.indexOf($scope.imageMaps, image);
        image["extent"] = [0, 0, 1024, 968];
        image["source"] = image.src;
      });
      console.log($scope.imageMaps);
    });


    /*
     _.each($scope.imageMaps, function (imageMap) {
     ImageMapService.addImageMap(imageMap);
     });*/

    $scope.newImageMap = function () {
      console.log("new");
    };

    $scope.goToImageMap = function (imageMap) {
      console.log(imageMap);
      ImageMapService.setCurrentImageMap(imageMap);
      $location.path("/app/image-map");
    };
  });