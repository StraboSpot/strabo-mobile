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
    };

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
          if ($scope.spot.images === undefined) {
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
    };

    // Set or cleanup some of the properties of the $scope
    var setProperties = function() {
      // Convert date string to Date type
      $scope.spot.properties.date = new Date($scope.spot.properties.date);
      $scope.spot.properties.time = new Date($scope.spot.properties.time);

      // Push spots from related_spots into selected and unselected arrays so we know which checkboxes to turn on
      $scope.related_spots_selection = [];
      $scope.related_spots_unselected = [];
      if ($scope.spot.properties.related_spots && typeof($scope.spot.properties.related_spots) == "object") {
        $scope.spot.properties.related_spots.forEach(function (obj, i) {
          $scope.related_spots_selection.push(obj);
        });
      }

      if ($scope.spot.properties.spottype == "Orientation") {
        $scope.showFeatureType = true;
        $scope.showOrientation_quality = true;
        $scope.showUnit_name = true;
        $scope.showUnit_label = true;

        // Set default values for Orientation Spot Type
        if (!$scope.spot.properties.feature_type) {
          $scope.spot.properties.feature_type = "bedding";
        }
        if (!$scope.spot.properties.orientation_quality)
          $scope.spot.properties.orientation_quality = "accurate";
      }

      // If current spot is a point
      $scope.point = {};
      if ($scope.spot.geometry && $scope.spot.geometry.type === "Point") {
        $scope.showMyLocationButton = true;
        // toggles the Lat/Lng input boxes based on available Lat/Lng data
        $scope.showLatLng = true;

        // Assign lat and long from current spot geometry
        $scope.point.latitude = $scope.spot.geometry.coordinates[1];
        $scope.point.longitude = $scope.spot.geometry.coordinates[0];
      }
      // Current spot is not a point, put placeholder values for lat and long
      else {
        $scope.point.latitude = 0;
        $scope.point.longitude = 0;
      }

      // Don't show related spots until spot has been saved and id assigned -- Need to fix this
      if ($scope.spot.properties.id)
        $scope.showRelatedSpots = true;

      // Initially the fields or not
      $scope.show = {
        strike: $scope.spot.properties.spottype == 'Orientation',
        dip: $scope.spot.properties.spottype == 'Orientation',
        trend: ($scope.spot.properties.trend) ? true : false,
        plunge: ($scope.spot.properties.plunge) ? true : false,

        plane_facing: $scope.spot.properties.spottype == 'Orientation',
        facing_direction: ($scope.spot.properties.facing_direction) ? true : false,

        fold_type: ($scope.spot.properties.fold_type) ? true : false,
        fold_detail: ($scope.spot.properties.fold_detail) ? true : false,

        directed: ($scope.spot.properties.directed) ? true : false,
        vergence: ($scope.spot.properties.vergence) ? true : false
      };

      if ($scope.spot.properties.spottype == "Contact Outcrop" ||
        $scope.spot.properties.spottype == "Fault Outcrop" ||
        $scope.spot.properties.spottype == "Rock Description" ||
        $scope.spot.properties.spottype == "Sample")
        $scope.showLinkToNewOrientation = true;
      else
        $scope.showLinkToNewOrientation = false;

      // Create checkbox list of other spots for selection as related spots
      SpotsFactory.all().then(function (spots) {
        $scope.spots = spots;
        $scope.other_spots = [];
        spots.forEach(function (obj, i) {
          if ($scope.spot.properties.id != obj.properties.id) {
            $scope.other_spots.push({
              text: obj.properties.name, value: obj.properties.id
            });
          }
        });
      });
    };

    // Get the current spot
    if (NewSpot.getNewSpot()){
      // Load spot stored in the NewSpot service
      $scope.spot = NewSpot.getNewSpot();
      // now clear the new spot from the service because we have the info in our current scope
      NewSpot.clearNewSpot();
      setProperties();
    }
    else {
      // Load spot from local storage
      SpotsFactory.read($stateParams.spotId, function (spot) {
        $scope.spot = spot;
        setProperties();
      });
    }

    // Toggle selection for related spots
    $scope.toggleSelection = function toggleSelection(other_spot_id) {
      var idx = $scope.related_spots_selection.indexOf(other_spot_id);
       // is currently selected
      if (idx > -1) {
        $scope.related_spots_selection.splice(idx, 1);
        $scope.related_spots_unselected.push(other_spot_id);
      }
       // is newly selected
      else {
        $scope.related_spots_selection.push(other_spot_id);
      }
    };

    // ********************
    // * Data Fields
    // ********************

    $scope.feature_type = {
      choices: [
        { text: 'bedding', value: 'bedding' },
        { text: 'flow layering', value: 'flow_layering' },
        { text: 'foliation', value: 'foliation' },
        { text: 'joint', value: 'joint' },
        { text: 'fracture', value: 'fracture' },
        { text: 'fault plane', value: 'fault_plane' },
        { text: 'axial surface', value: 'axial_surface' },
        { text: 'stylolite', value: 'stylolite' },
        { text: 'fold hinge', value: 'fold_hinge' },
        { text: 'stretching lineation', value: 'stretching_lineation' },
        { text: 'slicken side striae', value: 'slicken_side_striae' },
        { text: 'foliation with lineation', value: 'foliation_with_lineation' },
        { text: 'bedding with cleavage', value: 'bedding_with_cleavage' },
        { text: 'shear zone', value: 'shear_zone' },
        { text: 'movement direction', value: 'movement_direction' }
      ],
      required: true,
      default: "bedding"
    };

    $scope.strike = {
      relevant: [
        { field: 'feature_type', value: 'bedding' },
        { field: 'feature_type', value: 'flow_layering' },
        { field: 'feature_type', value: 'foliation' },
        { field: 'feature_type', value: 'joint' },
        { field: 'feature_type', value: 'fracture' },
        { field: 'feature_type', value: 'fault_plane' },
        { field: 'feature_type', value: 'axial_surface' },
        { field: 'feature_type', value: 'stylolite' },
        { field: 'feature_type', value: 'foliation_with_lineation' },
        { field: 'feature_type', value: 'bedding_with_cleavage' },
        { field: 'feature_type', value: 'shear_zone' }
      ],
      required: true
    };

    $scope.dip = {
      relevant: [
        { field: 'feature_type', value: 'bedding' },
        { field: 'feature_type', value: 'flow_layering' },
        { field: 'feature_type', value: 'foliation' },
        { field: 'feature_type', value: 'joint' },
        { field: 'feature_type', value: 'fracture' },
        { field: 'feature_type', value: 'fault_plane' },
        { field: 'feature_type', value: 'axial_surface' },
        { field: 'feature_type', value: 'stylolite' },
        { field: 'feature_type', value: 'foliation_with_lineation' },
        { field: 'feature_type', value: 'bedding_with_cleavage' },
        { field: 'feature_type', value: 'shear_zone' }
      ],
      required: true
    };

    $scope.trend = {
      relevant: [
        { field: 'feature_type', value: 'fold_hinge' },
        { field: 'feature_type', value: 'stretching_lineation' },
        { field: 'feature_type', value: 'slicken_side_striae' },
        { field: 'feature_type', value: 'foliation_with_lineation' },
        { field: 'feature_type', value: 'movement_direction' }
      ],
      required: true
    };

    $scope.plunge = {
      relevant: [
        { field: 'feature_type', value: 'fold_hinge' },
        { field: 'feature_type', value: 'stretching_lineation' },
        { field: 'feature_type', value: 'slicken_side_striae' },
        { field: 'feature_type', value: 'foliation_with_lineation' },
        { field: 'feature_type', value: 'movement_direction' }
      ],
      required: true
    };

    $scope.orientation_quality = {
      choices: [
        { text: 'accurate', value: 'accurate' },
        { text: 'approximate', value: 'approximate' },
        { text: 'irregular', value: 'irregular' }
      ],
      required: true,
      default: "accurate"
    };

    $scope.plane_facing = {
      choices: [
        {text: 'upright', value: 'upright'},
        {text: 'overturned', value: 'overturned'},
        {text: 'vertical', value: 'vertical'},
        {text: 'unknown', value: 'unknown'}
      ],
      required: true,
      default: 'upright',
      relevant: [
        { field: 'feature_type', value: 'bedding' },
        { field: 'feature_type', value: 'axial_surface' }
      ]
    };

    $scope.facing_direction = {
      required: false,
      relevant: [
        { field: 'plane_facing', value: 'vertical' }
      ]
    };

    $scope.directed = {
      choices: [
        { text: 'yes', value: 'yes'},
        { text: 'no', value: 'no'}
      ],
      required: false,
      relevant: [
        { field: 'feature_type', value: 'fold_hinge' },
        { field: 'feature_type', value: 'foliation_with_lineation' },
        { field: 'feature_type', value: 'slicken_side_striae' }
      ]
    };

    $scope.vergence = {
      required: false,
      relevant: [
        { field: 'directed', value: 'yes' }
      ]
    };

    $scope.fold_type = {
      choices: [
        {text: 'anticline', value: 'anticline'},
        {text: 'monocline', value: 'monocline'},
        {text: 'antiformal syncline', value: 'antiformal syncline'},
        {text: 'synformal anticline', value: 'synformal anticline'},
        {text: 'antiform', value: 'antiform'},
        {text: 'synform', value: 'synform'},
        {text: 's-fold', value: 's-fold'},
        {text: 'z-fold', value: 'z-fold'},
        {text: 'm-fold', value: 'm-fold'}
      ],
      required: false,
      default: 'antiform',
      relevant: [
        { field: 'feature_type', value: 'fold_hinge' },
        { field: 'feature_type', value: 'fault_plane' },
        { field: 'feature_type', value: 'axial_surface' }
      ]
    };

    $scope.fold_detail = {
      choices: [
        { text: 'overturned', value: 'overturned' },
        { text: 'vertical', value: 'vertical' },
        { text: 'horizontal', value: 'horizontal' },
        { text: 'recumbent', value: 'recumbent' },
        { text: 'inclined', value: 'inclined' },
        { text: 'upright', value: 'upright' }
      ],
      required: false,
      default: 'upright',
      relevant: [
        { field: 'feature_type', value: 'fold_hinge' },
        { field: 'feature_type', value: 'fault_plane' },
        { field: 'feature_type', value: 'axial_surface' }
      ]
    };

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

      // loop through $scope.show to see if they are set to hidden or visible
      for (var property in $scope.show) {
        if ($scope.show.hasOwnProperty(property)) {
          // is it hidden?
          if ($scope.show[property] === false) {
            // yes, then nullify the property value
            $scope.spot.properties[property] = undefined;
          }
        }
      }
    };

    // finds the property in the scope[property].relevant to see if the value exists
    var wasPropertyFound = function(property) {
      var thePropertyFound = _.find(_.pluck($scope[property].relevant, 'value'), function(feature) {
        return feature == $scope.spot.properties.feature_type;
      });

      if (thePropertyFound)
        return true;
      else
        return false;
    };

    $scope.onChange = {
      feature: function() {
        console.log("feature, ", $scope.spot.properties.feature_type);

        $scope.show.strike = wasPropertyFound('strike');
        $scope.show.dip = wasPropertyFound('dip');
        $scope.show.trend = wasPropertyFound('trend');
        $scope.show.plunge = wasPropertyFound('plunge');
        $scope.show.fold_type = wasPropertyFound('fold_type');

        if ($scope.show.fold_type && !$scope.spot.properties.fold_type)
          $scope.spot.properties.fold_type = $scope.fold_type.default;

        $scope.show.fold_detail = wasPropertyFound('fold_detail');

        if ($scope.show.fold_detail && !$scope.spot.properties.fold_detail)
          $scope.spot.properties.fold_detail = $scope.fold_detail.default;

        $scope.show.plane_facing = wasPropertyFound('plane_facing');
        $scope.show.directed = wasPropertyFound('directed');

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

        $scope.show.vergence = ($scope.spot.properties.directed === 'yes');

        resetValues();
      }
    };

    // Get current location
    $scope.getLocation = function() {
      $cordovaGeolocation.getCurrentPosition().then(function(position) {

        // assign the lat/lng upon getting location
        $scope.point.latitude = position.coords.latitude;
        $scope.point.longitude = position.coords.longitude;

        $scope.spot.geometry = {
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude]
        };
      }, function(err) {
        alert("Unable to get location: " + err.message);
      });
    };

    $scope.openMap = function() {
      // Save current spot
      NewSpot.setNewSpot($scope.spot);
      $location.path("/app/map");
    };

    // Add or modify Spot
    $scope.submit = function() {

      console.log("spot, ", $scope.spot);

      if (!$scope.spot.properties.name) {
        alert('Name required.');
        return;
      }
      // For the time being make this not required
      /*if (!$scope.spot.properties.feature_type) {
        alert('Feature required.');
        return;
      }*/

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

      // Add or remove ids for related spots
      if ($scope.spot.properties.related_spots)
        delete $scope.spot.properties.related_spots;
      if ($scope.related_spots_selection.length > 0)
        $scope.spot.properties.related_spots = [];

      // Get all selected and unselected related spots
      var selAndUnSel = _.union($scope.related_spots_selection, $scope.related_spots_unselected);
      selAndUnSel.forEach(function (obj, i) {

        // Get the related spot
        var related_spot = _.filter($scope.spots, function (spot) {
          return spot.properties.id === obj;
        })[0];

        // If obj in selected related spots array
        var idx = $scope.related_spots_selection.indexOf(obj);
        if (idx > -1) {
          // Add id for related spot to this spot
          if ($scope.spot.properties.related_spots.indexOf(obj) == -1)
            $scope.spot.properties.related_spots.push(obj);

          // Add id for this spot to related spot
          if (!related_spot.properties.related_spots)
            related_spot.properties.related_spots = [];
          if (related_spot.properties.related_spots.indexOf($scope.spot.properties.id) == -1)
            related_spot.properties.related_spots.push($scope.spot.properties.id);
        }
        // If obj is in unselected related spots array
        idx = $scope.related_spots_unselected.indexOf(obj);
        if (idx > -1) {
          // Remove id for this spot from related spot
          if (related_spot.properties.related_spots)
            if (related_spot.properties.related_spots.indexOf($scope.spot.properties.id) > -1) {
              related_spot.properties.related_spots.splice(related_spot.properties.related_spots.indexOf($scope.spot.properties.id), 1);
              if (related_spot.properties.related_spots.length == 0)
                delete related_spot.properties.related_spots;
            }
        }

        // Save the related spot
        SpotsFactory.save(related_spot, related_spot.properties.id).then(function(data){
          console.log("updated", data);
        });
      });

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
          if (buttonIndex == 1) {
            SpotsFactory.destroy($scope.spot.properties.id);
            $location.path("/app/spots");
          }
        });
    };

    // View the spot on the map
    $scope.goToSpot = function() {
      var center = SpotsFactory.getCenter($scope.spot);
      var spotCenter = ol.proj.transform([center.lon, center.lat], 'EPSG:4326', 'EPSG:3857');
      MapView.setMapView(new ol.View({
        center: spotCenter,
        zoom: 16
      }));
      $location.path("/app/map");
    };

    $scope.newOrientation = function() {
      NewSpot.setNewSpot({"geometry": $scope.spot.geometry});
      $scope.newOrientation = NewSpot.getNewSpot();
      $scope.newOrientation.properties.name = $scope.spot.properties.name;
      $scope.newOrientation.properties.spottype = "Orientation";
      NewSpot.setNewSpot($scope.newOrientation);
      $location.path(href="/app/spots/newspot");
    };
  });
