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
    $ionicModal,
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

      // Push spots from linked spots list into selected and unselected arrays so we know which checkboxes to turn on
      $scope.links_selected = [];
      $scope.links_unselected = [];
      if ($scope.spot.properties.links && typeof($scope.spot.properties.links) == "object") {
        $scope.spot.properties.links.forEach(function (obj, i) {
          $scope.links_selected.push(obj);
        });
      }

      $scope.groups_selected = [];
      $scope.groups_unselected = [];
      if ($scope.spot.properties.groups && typeof($scope.spot.properties.groups) == "object") {
        $scope.spot.properties.groups.forEach(function (obj, i) {
          $scope.groups_selected.push(obj);
        });
      }

      $scope.group_members_selected = [];
      $scope.group_members_unselected = [];
      if ($scope.spot.properties.group_members && typeof($scope.spot.properties.group_members) == "object") {
        $scope.spot.properties.group_members.forEach(function (obj, i) {
          $scope.group_members_selected.push(obj);
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
      else if ($scope.spot.properties.spottype == "Spot Grouping") {
        $scope.showGroupFields = true;
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

      $scope.showLinkToNewOrientation =
          $scope.spot.properties.spottype == "Contact Outcrop" ||
          $scope.spot.properties.spottype == "Fault Outcrop" ||
          $scope.spot.properties.spottype == "Rock Description" ||
          $scope.spot.properties.spottype == "Sample";

      // Create checkbox list of other spots for selected as related spots
      SpotsFactory.all().then(function (spots) {
        $scope.spots = spots;
        $scope.other_spots = [];
        $scope.groups = [];
        spots.forEach(function (obj, i) {
          if ($scope.spot.properties.id != obj.properties.id) {
            $scope.other_spots.push({
              name: obj.properties.name, id: obj.properties.id
            });
            if (obj.properties.spottype == "Spot Grouping") {
              $scope.groups.push({
                name: obj.properties.name, id: obj.properties.id
              });
            }
          }
        });
        // Don't show related spots until spot has been saved and id assigned -- Need to fix this
        $scope.showLinks = $scope.other_spots.length > 0 && $scope.spot.properties.id;
        $scope.showGroups = $scope.groups.length > 0 && $scope.spot.properties.id;
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

    // Toggle selected for links or groups or group members selected
    $scope.toggleSelection = function toggleSelection(ref_spot, type_selected, type_unselected) {
      var selected_spot = _.findWhere($scope[type_selected], { id: ref_spot.id });
      // If selected spot is not already in the links_selected object
      if (!selected_spot) {
        $scope[type_selected].push(ref_spot);
      }
      // This spot has been unselected so remove it
      else {
        $scope[type_selected] = _.reject($scope[type_selected], function (spot) { return spot.id == ref_spot.id });
        $scope[type_unselected].push(ref_spot);
      }
    };

    // ********************
    // * Data Fields
    // ********************

    $scope.feature_type = {
      label: "Feature Type",
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

    /////////////////
    // SPOT GROUPING
    /////////////////

    $scope.group_relationship = {
      label: "What do the elements of this group have in common?",
      choices: [
        { text: 'other', value: 'other' },
        { text: 'feature type', value: 'feature_type' },
        { text: 'part of larger structure', value: 'larger_structure' },
        { text: 'age', value: 'age' },
        { text: 'location', value: 'location' },
        { text: 'part of the same process or event', value: 'process' }
      ],
      required: true,
      hint: "(How are these data similar?)"
    };

    $scope.larger_structure = {
      label: "Larger structure is a:",
      choices: [
        { text: 'fault', value: 'fault' },
        { text: 'fold', value: 'fold' },
        { text: 'shear zone', value: 'shear_zone' },
        { text: 'intrusive body', value: 'intrusive_body' },
        { text: 'other', value: 'other' }
      ],
      required: true
    };

    /////////////////
    // LINKS
    /////////////////

    $scope.link_relationship = {
      choices: [
        { type: 'cross-cuts', inverse: 'is cross cut by' },
        { type: 'is cross-cut by', inverse: 'cross cuts' },
        { type: 'is younger than', inverse: 'is older than' },
        { type: 'is older than', inverse: 'is younger than' },
        { type: 'is a lower metamorphic grade than', inverse: 'is a higher metamorphic grade than' },
        { type: 'is a higher metamorphic grade than', inverse: 'is a lower metamorphic grade than' },
        { type: 'is included within',inverse: 'includes' },
        { type: 'includes', inverse: 'is included within' },
        { type: 'is otherwise related to', inverse: 'is otherwise related to' }
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
      return thePropertyFound;
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

      // Remove references from links or groups or group members
      var cleanRefs = function (ref_type, id) {
        // Remove the link reference from the link references for this spot, if it exists
        $scope.spot.properties[ref_type] = _.reject($scope.spot.properties[ref_type], function (ref) {
          return ref.id == id;
        });

        // Get the linked spot or group
        var reference = _.filter($scope.spots, function(item) {
          return _.findWhere(item, { id: id });
        })[0];

        switch (ref_type) {
          case "links":
            var inverse_ref = "links";
            break;
          case "groups":
            var inverse_ref = "group_members";
            break;
          case "group_members":
            var inverse_ref = "groups";
            break;
        }

        // Remove the link reference to this spot from the link spot, if it exists
        reference.properties[inverse_ref] = _.reject(reference.properties[inverse_ref], function (ref) {
          return ref.id == $scope.spot.properties.id;
        });
        return reference;
      };

      // Add or update linked spots from checked spots
      $scope.links_selected.forEach(function (obj, i) {
        // Remove link references for this obj from this spot and the linked spot
        var linked_spot = cleanRefs("links", obj.id);

        // If a link relationship was not selected mark as "is otherwise related to"
        obj["relationship"] = obj.relationship ? obj.relationship : "is otherwise related to";

        // Add the new/updated link reference to the link references for this spot
        $scope.spot.properties.links.push(obj);

        var link_relationship_inverse = _.findWhere($scope.link_relationship.choices,
          { type: obj.relationship }).inverse;

        // Add the new/updated link reference to the link references for the linked spot
        linked_spot.properties.links.push({
          name: $scope.spot.properties.name,
          id: $scope.spot.properties.id,
          relationship: link_relationship_inverse
        });

        // Save the linked spot
        SpotsFactory.save(linked_spot).then(function(data){
          console.log("updated inverse spot", data);
        });
      });

      // Remove unchecked spots from linked spots
      $scope.links_unselected.forEach(function (obj, i) {
        // Remove link references for this obj from this spot and the linked spot
        var linked_spot = cleanRefs("links", obj.id);

        // Save the linked spot
        SpotsFactory.save(linked_spot).then(function(data){
          console.log("updated inverse spot", data);
        });
      });

      // Add or update the groups for this spot
      $scope.groups_selected.forEach(function (obj, i) {
        // Remove this obj from the group
        var group = cleanRefs("groups", obj.id);

        // Add the new/updated group reference to the group references for this spot
        $scope.spot.properties.groups.push(obj);

        // Add the new/updated spot reference to the group references for this group
        group.properties.group_members.push({
          name: $scope.spot.properties.name,
          id: $scope.spot.properties.id
        });

        // Save the group
        SpotsFactory.save(group).then(function(data){
          console.log("added group member", data);
        });
      });

      // Remove unchecked spots from group
      $scope.groups_unselected.forEach(function (obj, i) {
        // Remove group references for this obj from this spot and the group
        var group = cleanRefs("groups", obj.id);

        // Save the group
        SpotsFactory.save(group).then(function(data){
          console.log("removed group member", data);
        });
      });

      // Add or update the group members for this spot
      $scope.group_members_selected.forEach(function (obj, i) {
        // Remove this obj from the group
        var group = cleanRefs("group_members", obj.id);

        // Add the new/updated group reference to the group references for this spot
        $scope.spot.properties.group_members.push(obj);

        // Add the new/updated spot reference to the group references for this group
        group.properties.groups.push({
          name: $scope.spot.properties.name,
          id: $scope.spot.properties.id
        });

        // Save the group
        SpotsFactory.save(group).then(function(data){
          console.log("added group", data);
        });
      });

      // Remove unchecked spots from group memberships
      $scope.group_members_unselected.forEach(function (obj, i) {
        // Remove group references for this obj from this spot and the group
        var group = cleanRefs("group_members", obj.id);

        // Save the group
        SpotsFactory.save(group).then(function(data){
          console.log("removed group", data);
        });
      });

      // Save the spot
      SpotsFactory.save($scope.spot).then(function(data) {
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

    // Is the other_spot is this spot's links list?
    $scope.isChecked = function (id) {
      return _.find($scope.spot.properties.links, function (rel_spot) {
        return rel_spot.id === id;
      });
    };

    $scope.isGroupChecked = function (id) {
      return _.find($scope.spot.properties.groups, function (rel_spot) {
        return rel_spot.id === id;
      });
    };

    $scope.isMemberChecked = function (id) {
      return _.find($scope.spot.properties.group_members, function (rel_spot) {
        return rel_spot.id === id;
      });
    };

    $scope.linkSpot = function() {
      NewSpot.setNewSpot($scope.spot);
      $scope.openModal("linkModal");
    };

    $scope.setLinkRelationship = function(item, relationship) {
      var related_spot = _.find($scope.links_selected, function (rel_spot) {
        return rel_spot.id === item.id;
      });
      related_spot['relationship'] = relationship.type;
    };

    $scope.linkGroup = function() {
      NewSpot.setNewSpot($scope.spot);
      $scope.openModal("groupModal");
    };

    $scope.addGroupMember = function () {
      NewSpot.setNewSpot($scope.spot);
      $scope.openModal("groupMembersModal");
    };

    /////////////////
    // MODALS
    /////////////////

    $ionicModal.fromTemplateUrl('templates/modals/linkModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.linkModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modals/groupModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.groupModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modals/groupMembersModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.groupMembersModal = modal;
    });

    $scope.openModal = function(modal) {
      $scope[modal].show();
    };

    $scope.closeModal = function(modal) {
      $scope[modal].hide();
    };

    //Cleanup the modal when we're done with it!
    // Execute action on hide modal
    $scope.$on('linkModal.hidden', function() {
      $scope.linkModal.remove();
    });
    $scope.$on('groupModal.hidden', function() {
      $scope.groupModal.remove();
    });
    $scope.$on('groupMembersModal.hidden', function() {
      $scope.groupMembersModal.remove();
    });
  });
