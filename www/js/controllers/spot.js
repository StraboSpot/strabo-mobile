angular.module('app')

.controller('SpotCtrl', function(
  $scope,
  $stateParams,
  $location,
  SpotsFactory,
  NewSpot,
  MapView,
  $ionicHistory,
  $ionicPopup,
  $cordovaGeolocation,
  $cordovaDialogs,
  $cordovaCamera) {


  $scope.cameraSource = [{
    text: 'Photo Library',
    value: 'PHOTOLIBRARY'
  }, {
    text: 'Camera',
    value: 'CAMERA'
  }, {
    text: 'Saved Photo Album',
    value: 'SAVEDPHOTOALBUM'
  }];

  $scope.selectedCameraSource = {
    // default is always camera
    source: "CAMERA"
  }

  $scope.cameraModal = function(source) {

    // camera modal popup
    var myPopup = $ionicPopup.show({
      template: '<ion-radio ng-repeat="source in cameraSource" ng-value="source.value" ng-model="selectedCameraSource.source">{{ source.text }}</ion-radio>',
      title: 'Select an image source',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: '<b>Go</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.selectedCameraSource.source) {
            //don't allow the user to close unless a value is set
            e.preventDefault();
          } else {
            return $scope.selectedCameraSource.source;
          }
        }
      }]
    });

    myPopup.then(function(cameraSource) {
      if (cameraSource) {
        launchCamera(cameraSource);
      }
    });
  };


  var launchCamera = function(source) {
    // all plugins must be wrapped in a ready function
    document.addEventListener("deviceready", function() {

      if (source == "PHOTOLIBRARY") {
        source = Camera.PictureSourceType.PHOTOLIBRARY;
      } else if (source == "CAMERA") {
        source = Camera.PictureSourceType.CAMERA;
      } else if (source == "SAVEDPHOTOALBUM") {
        source = Camera.PictureSourceType.SAVEDPHOTOALBUM;
      }

      var cameraOptions = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: source,
        allowEdit: true,
        encodingType: Camera.EncodingType.PNG,
        targetWidth: 100,
        targetHeight: 100,
        // popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      $cordovaCamera.getPicture(cameraOptions).then(function(imageURI) {
        // create an images array if it doesn't exist -- camera images are stored here
        if ($scope.spot.images == undefined) {
          $scope.spot.images = [];
        }

        // push the image data to our camera images array
        $scope.spot.images.push({
          src: "data:image/png;base64," + imageURI
        });

      }, function(err) {
        console.log("error: ", err);
      });
    });
  }




  // all the spots available in offline
  $scope.spots;

  SpotsFactory.all().then(function(spots) {
    $scope.spots = spots;

    // a single spot
    $scope.spot;

    $scope.point = {};

    // Initialize new Spot
    if (NewSpot.getNewSpot()) {
      $scope.spot = NewSpot.getNewSpot();
      $scope.spot.properties.date = new Date($scope.spot.properties.date);
      $scope.spot.properties.time = new Date($scope.spot.properties.time);
      // now clear the new spot from the service because we have the info in our current scope
      NewSpot.clearNewSpot();
    }
    // Load current Spot
    else {
      $scope.spot = _.filter($scope.spots, function(spot) {
        return spot.properties.id === $stateParams.spotId;
      })[0];
      $scope.spot.properties.date = new Date($scope.spot.properties.date);
      $scope.spot.properties.time = new Date($scope.spot.properties.time);
    }

    // is the new spot a single point?
    if ($scope.spot.geometry && $scope.spot.geometry.type === "Point") {
      // toggles the Lat/Lng input boxes based on available Lat/Lng data
      $scope.showLatLng = true;

      // pre-assign the lat/lng from the geometry
      $scope.point.latitude = $scope.spot.geometry.coordinates[1];
      $scope.point.longitude = $scope.spot.geometry.coordinates[0];
    }

    $scope.friendlyGeom = JSON.stringify($scope.spot.geometry);


    $scope.show = {
      strike: ($scope.spot.properties.strike) ? true : false,
      dip: ($scope.spot.properties.dip) ? true : false,
      trend: ($scope.spot.properties.trend) ? true : false,
      plunge: ($scope.spot.properties.plunge) ? true : false,

      plane_facing: ($scope.spot.properties.plane_facing) ? true : false,
      facing_direction: ($scope.spot.properties.facing_direction) ? true : false,

      fold_type: ($scope.spot.properties.fold_type) ? true : false,
      fold_detail: ($scope.spot.properties.fold_detail) ? true : false,

      directed: ($scope.spot.properties.directed) ? true : false,
      vergence: ($scope.spot.properties.vergence) ? true : false
    };

  });




  // generic yes or no value collection to be used in forms
  var yesNo = [{
    text: "Yes",
    value: "Yes"
  }, {
    text: "No",
    value: "No"
  }, ];

  // ********************
  // * features
  // ********************

  $scope.feature_type = [{
    text: 'bedding',
    value: 'bedding'
  }, {
    text: 'flow layering',
    value: 'flow layering'
  }, {
    text: 'foliation',
    value: 'foliation'
  }, {
    text: 'joint',
    value: 'joint'
  }, {
    text: 'fracture',
    value: 'fracture'
  }, {
    text: 'fault plane',
    value: 'fault plane'
  }, {
    text: 'axial surface',
    value: 'axial surface'
  }, {
    text: 'stylolite',
    value: 'stylolite'
  }, {
    text: 'fold hinge',
    value: 'fold hinge'
  }, {
    text: 'stretching lineation',
    value: 'stretching lineation'
  }, {
    text: 'slicken side striae',
    value: 'slicken side striae'
  }, {
    text: 'foliation with lineation',
    value: 'foliation with lineation'
  }, {
    text: 'bedding with cleavage',
    value: 'bedding with cleavage'
  }, {
    text: 'shear zone',
    value: 'shear zone'
  }, {
    text: 'movement direction',
    value: 'movement direction'
  }];

  $scope.orientation_quality = [{
    text: 'accurate',
    value: 'accurate'
  }, {
    text: 'approximate',
    value: 'approximate'
  }, {
    text: 'irregular',
    value: 'irregular'
  }];

  $scope.plane_facing = [{
    text: 'upright',
    value: 'upright'
  }, {
    text: 'overturned',
    value: 'overturned'
  }, {
    text: 'vertical',
    value: 'vertical'
  }, {
    text: 'unknown',
    value: 'unknown'
  }];

  $scope.fold_type = [{
    text: 'anticline',
    value: 'anticline'
  }, {
    text: 'monocline',
    value: 'monocline'
  }, {
    text: 'antiformal syncline',
    value: 'antiformal syncline'
  }, {
    text: 'synformal anticline',
    value: 'synformal anticline'
  }, {
    text: 'antiform',
    value: 'antiform'
  }, {
    text: 'synform',
    value: 'synform'
  }, {
    text: 's-fold',
    value: 's-fold'
  }, {
    text: 'z-fold',
    value: 'z-fold'
  }, {
    text: 'm-fold',
    value: 'm-fold'
  }];

  $scope.fold_detail = [{
    text: 'overturned',
    value: 'overturned'
  }, {
    text: 'vertical',
    value: 'vertical'
  }, {
    text: 'horizontal',
    value: 'horizontal'
  }, {
    text: 'recumbent',
    value: 'recumbent'
  }, {
    text: 'inclined',
    value: 'inclined'
  }, {
    text: 'upright',
    value: 'upright'
  }];

  $scope.directed = yesNo;

  var resetValues = function() {

    // ********************
    // * reset show/hide
    // ********************

    if (!$scope.show.fold_type) {
      $scope.show.fold_detail = false;
    }
    if (!$scope.show.plane_facing) {
      $scope.show.facing_direction = false;
    }
    if (!$scope.show.directed) {
      $scope.show.vergence = false;
    }

    // ********************
    // * reset values
    // ********************

    if (!$scope.show.strike) {
      $scope.spot.properties.strike = undefined;
    }
    if (!$scope.show.dip) {
      $scope.spot.properties.dip = undefined;
    }
    if (!$scope.show.trend) {
      $scope.spot.properties.trend = undefined;
    }
    if (!$scope.show.plunge) {
      $scope.spot.properties.plunge = undefined;
    }
    if (!$scope.show.fold_type) {
      $scope.spot.properties.fold_type = undefined;
    }
    if (!$scope.show.fold_detail) {
      $scope.spot.properties.fold_detail = undefined;
    }
    if (!$scope.show.plane_facing) {
      $scope.spot.properties.plane_facing = undefined;
    }
    if (!$scope.show.facing_direction) {
      $scope.spot.properties.facing_direction = undefined;
    }
    if (!$scope.show.directed) {
      $scope.spot.properties.directed = undefined;
    }
    if (!$scope.show.vergence) {
      $scope.spot.properties.vergence = undefined;
    }
  };



  $scope.onChange = {
    feature: function() {
      console.log("feature, ", $scope.spot.properties.feature_type);

      var strikeAndDip = [
        'bedding',
        'flow layering',
        'foliation',
        'joint',
        'fracture',
        'fault plane',
        'axial surface',
        'stylolite',
        'foliation with lineation',
        'bedding with cleavage',
        'shear zone'
      ];

      var trendAndPlunge = [
        'fold hinge',
        'stretching lineation',
        'slicken side striae',
        'foliation with lineation',
        'movement direction'
      ];

      var folds = [
        'fold hinge',
        'fault plane',
        'axial surface'
      ];

      var beddingAndAxialSurface = [
        'bedding',
        'axial surface'
      ];

      var directed = [
        'fold hinge',
        'foliation with lineation',
        'slicken side striae'
      ];


      var shouldShowStrikeDip = _.find(strikeAndDip, function(feature) {
        return feature == $scope.spot.properties.feature_type;
      });
      $scope.show.strike = (shouldShowStrikeDip) ? true : false;
      $scope.show.dip = (shouldShowStrikeDip) ? true : false;

      var shouldShowTrendPlunge = _.find(trendAndPlunge, function(feature) {
        return feature == $scope.spot.properties.feature_type;
      });
      $scope.show.trend = (shouldShowTrendPlunge) ? true : false;
      $scope.show.plunge = (shouldShowTrendPlunge) ? true : false;

      var shouldShowFoldTypeAndDetail = _.find(folds, function(feature) {
        return feature == $scope.spot.properties.feature_type;
      });
      $scope.show.fold_type = (shouldShowFoldTypeAndDetail) ? true : false;
      $scope.show.fold_detail = (shouldShowFoldTypeAndDetail) ? true : false;

      var shouldShowPlaneFacing = _.find(beddingAndAxialSurface, function(feature) {
        return feature == $scope.spot.properties.feature_type;
      });
      $scope.show.plane_facing = (shouldShowPlaneFacing) ? true : false;

      var shouldShowDirected = _.find(directed, function(feature) {
        return feature == $scope.spot.properties.feature_type;
      });
      $scope.show.directed = (shouldShowDirected) ? true : false;

      resetValues();
    },
    orientation: function() {
      console.log("orientation, ", $scope.spot.properties.orientation);
    },
    plane_facing: function() {
      console.log("plane_facing, ", $scope.spot.properties.plane_facing);

      // show facing direction if plane facing is vertical
      $scope.show.facing_direction = ($scope.spot.properties.plane_facing === "vertical");
      resetValues();
    },
    fold_type: function() {
      console.log("fold_type, ", $scope.spot.properties.fold_type);
    },
    fold_detail: function() {
      console.log("fold_detail, ", $scope.spot.properties.fold_detail);
    },
    directed: function() {
      console.log("directed, ", $scope.spot.properties.directed);

      $scope.show.vergence = ($scope.spot.properties.directed === 'Yes');

      resetValues();
    }
  };









  // Define Spot attributes
  $scope.attitude_type = [{
    text: 'planar',
    value: 'planar'
  }, {
    text: 'linear',
    value: 'linear'
  }, {
    text: 'planar and linear',
    value: 'planar and linear'
  }];

  $scope.plane_type = [{
    text: 'bedding',
    value: 'bedding'
  }, {
    text: 'flow layering',
    value: 'flow layering'
  }, {
    text: 'foliation',
    value: 'foliation'
  }, {
    text: 'joint',
    value: 'joint'
  }, {
    text: 'fracture',
    value: 'fracture'
  }, {
    text: 'fault plane',
    value: 'fault plane'
  }, {
    text: 'axial surface',
    value: 'axial surface'
  }, {
    text: 'stylolite',
    value: 'stylolite'
  }];

  $scope.plane_quality = [{
    text: 'known',
    value: 'known'
  }, {
    text: 'approximate',
    value: 'approximate'
  }, {
    text: 'inferred',
    value: 'inferred'
  }, {
    text: 'approximate(?)',
    value: 'approximate(?)'
  }, {
    text: 'inferred(?)',
    value: 'inferred(?)'
  }, {
    text: 'unknown',
    value: 'unknown'
  }];

  $scope.plane_facing = [{
    text: 'upright',
    value: 'upright'
  }, {
    text: 'overturned',
    value: 'overturned'
  }, {
    text: 'vertical',
    value: 'vertical'
  }, {
    text: 'approximate(?)',
    value: 'approximate(?)'
  }, {
    text: 'unknown',
    value: 'unknown'
  }];


  // Get current location
  $scope.getLocation = function() {
    $cordovaGeolocation.getCurrentPosition().then(function(position) {

      // assign the lat/lng upon getting location
      $scope.point.latitude = position.coords.latitude;
      $scope.point.longitude = position.coords.longitude;

      $scope.spot.geometry = {
        type: "Point",
        coordinates: [position.coords.longitude, position.coords.latitude]
      }
      $scope.friendlyGeom = JSON.stringify($scope.spot.geometry);
    }, function(err) {
      alert("Unable to get location: " + err.message);
    });
  }

  $scope.openMap = function() {
    // Save current spot
    NewSpot.setNewSpot($scope.spot);
    $location.path("/app/map");
  }

  // Add or modify Spot
  $scope.submit = function() {

    console.log("spot, ", $scope.spot);

    if (!$scope.spot.properties.name) {
      alert('Name required.');
      return;
    }
    if (!$scope.spot.properties.feature_type) {
      alert('Feature required.');
      return;
    }

    // console.log($scope.show.strike);
    // console.log($scope.spot.properties.strike);

    if ($scope.show.strike && ($scope.spot.properties.strike < 0 || $scope.spot.properties.strike > 360 || $scope.spot.properties.strike === undefined || $scope.spot.properties.strike === null)) {
      alert('Strike must be between 0-360.');
      return;
    }
    if ($scope.show.dip && ($scope.spot.properties.dip < 0 || $scope.spot.properties.dip > 90 || $scope.spot.properties.dip === undefined || $scope.spot.properties.dip === null)) {
      alert('Dip must be between 0-90.');
      return;
    }
    if ($scope.show.trend && ($scope.spot.properties.trend < 0 || $scope.spot.properties.trend > 90 || $scope.spot.properties.trend === undefined || $scope.spot.properties.trend === null)) {
      alert('Trend must be between 0-90.');
      return;
    }
    if ($scope.show.plunge && ($scope.spot.properties.plunge < 0 || $scope.spot.properties.plunge > 90 || $scope.spot.properties.plunge === undefined || $scope.spot.properties.plunge === null)) {
      alert('Plunge must be between 0-90.');
      return;
    }
    if ($scope.show.plane_facing && ($scope.spot.properties.plane_facing === undefined || $scope.spot.properties.plane_facing === null)) {
      alert('plane facing required');
      return;
    }
    if ($scope.show.facing_direction && ($scope.spot.properties.facing_direction === undefined || $scope.spot.properties.facing_direction === null)) {
      alert('facing direction required');
      return;
    }
    if ($scope.show.fold_type && ($scope.spot.properties.fold_type === undefined || $scope.spot.properties.fold_type === null)) {
      alert('fold type required');
      return;
    }
    if ($scope.show.fold_detail && ($scope.spot.properties.fold_detail === undefined || $scope.spot.properties.fold_detail === null)) {
      alert('fold detail required');
      return;
    }
    if ($scope.show.directed && ($scope.spot.properties.directed === undefined || $scope.spot.properties.directed === null)) {
      alert('directed required');
      return;
    }
    if ($scope.show.vergence && ($scope.spot.properties.vergence === undefined || $scope.spot.properties.vergence === null)) {
      alert('vergence require');
      return;
    }









    // define the geojson feature type
    $scope.spot.type = "Feature";

    // is the new spot a single point?
    if ($scope.spot.geometry.type === "Point") {
      // yes, replace the geojson geometry with the lat/lng from the input fields
      $scope.spot.geometry.coordinates[1] = $scope.point.latitude;
      $scope.spot.geometry.coordinates[0] = $scope.point.longitude;
    }

    // save the spot -- if the id is defined, we overwrite existing id; otherwise create new id/spot
    SpotsFactory.save($scope.spot, $scope.spot.properties.id).then(function(data) {
      console.log("wrote", data);
    });

    // Go back one view in history
    var backView = $ionicHistory.backView();
    backView.go();
  };

  // Delete the spot
  $scope.deleteSpot = function() {
    $cordovaDialogs.confirm('Delete this Spot?', 'Delete', ['OK', 'Cancel'])
      .then(function(buttonIndex) {
        // no button = 0, 'OK' = 1, 'Cancel' = 2
        var btnIndex = buttonIndex;
        if (btnIndex == 1) {
          SpotsFactory.destroy($scope.spot.properties.id);
          $location.path("/app/spots");
        }
      });
  }

  // View the spot on the map
  $scope.goToSpot = function() {
    var center = SpotsFactory.getCenter($scope.spot);
    var spotCenter = ol.proj.transform([center.lon, center.lat], 'EPSG:4326', 'EPSG:3857');
    MapView.setMapView(new ol.View({
      center: spotCenter,
      zoom: 16
    }));
    $location.path("/app/map");
  }
});
