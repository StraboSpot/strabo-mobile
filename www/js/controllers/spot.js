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

    angular.module('app').addContactSurvey($scope);
    angular.module('app').addContactChoices($scope);
    angular.module('app').addFaultSurvey($scope);
    angular.module('app').addFaultChoices($scope);
    angular.module('app').addFoldSurvey($scope);
    angular.module('app').addFoldChoices($scope);
    angular.module('app').addOrientationSurvey($scope);
    angular.module('app').addOrientationChoices($scope);
    angular.module('app').addShearZoneSurvey($scope);
    angular.module('app').addShearZoneChoices($scope);

    $scope.showImages = function(index) {
      $scope.activeSlide = index;
      $ionicModal.fromTemplateUrl('templates/modals/imageModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.imageModal = modal;
        $scope.imageModal.show();
      });
    };

    $scope.closeImageModal = function() {
      $scope.imageModal.hide();
      $scope.imageModal.remove();
    };

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
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: source,
          allowEdit: true,
          encodingType: Camera.EncodingType.PNG,
          // popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: true
        };

        $cordovaCamera.getPicture(cameraOptions).then(function(imageURI) {

          // the image has been written to mobile device.  It is written in two places:
          // 1) the local strabo-mobile cache, aka "/storage/emulated/0/Android/data/com.ionicframework.strabomobile327690/cache/filename.jpg"
          // 2) the Photo Album folder, on Android, this is: /Pictures
          // 3) in iOS, this is in the Photos Gallery

          console.log(imageURI);

          // now we read the image from the filesystem and save the image to the spot

          // create an images array if it doesn't exist -- camera images are stored here
          if ($scope.spot.images === undefined) {
            $scope.spot.images = [];
          }

          var gotFileEntry = function(fileEntry) {
            // console.log("inside gotFileEntry");
            fileEntry.file(gotFile, fail);
          };

          var gotFile = function(file) {
            // console.log("inside gotFile");
            readDataUrl(file);
          };

          var readDataUrl = function(file) {
            // console.log("inside readDataUrl");
            var reader = new FileReader();
            reader.onloadend = function(evt) {
              // console.log("Read as data URL");
              // console.log(evt.target.result);
              var base64Image = evt.target.result;

              // push the image data to our camera images array
              $scope.$apply(function() {
                $scope.spot.images.push({
                  src: base64Image
                });
              });
            };

            reader.readAsDataURL(file);
          };

          var fail = function(evt) {
            // console.log("inside fail");
            console.log(evt);
          };

          // invoke the reading of the image file from the local filesystem
          window.resolveLocalFileSystemURL(imageURI, gotFileEntry, fail);


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

      switch ($scope.spot.properties.spottype) {
        case "Contact":
          $scope.showDynamicFields = true;
          $scope.survey = $scope.contact_survey;
          $scope.choices = $scope.contact_choices;
          break;
        case "Fault":
          $scope.showDynamicFields = true;
          $scope.survey = $scope.fault_survey;
          $scope.choices = $scope.fault_choices;
          break;
        case "Fold":
          $scope.showDynamicFields = true;
          $scope.survey = $scope.fold_survey;
          $scope.choices = $scope.fold_choices;
          break;
        case "Hinge Surface Trace":
          break;
        case "Notes":
          break;
        case "Orientation":
          $scope.showDynamicFields = true;
          $scope.survey = $scope.orientation_survey;
          $scope.choices = $scope.orientation_choices;
          break;
        case "Rock Description":
          break;
        case "Sample":
          break;
        case "Shear Zone":
          $scope.showDynamicFields = true;
          $scope.survey = $scope.shear_zone_survey;
          $scope.choices = $scope.shear_zone_choices;
          break;
        case "Spot Grouping":
          $scope.showGroupFields = true;
          break;
      }

      $scope.survey = _.reject($scope.survey, function (field) {
        return (field.type == "start" || field.type == "end")
      });

      // Set default values for the spot
      if ($scope.survey) {
        _.each($scope.survey, function (field) {
          if (!$scope.spot.properties[field.name] && field.default)
            // Check that default is in the list of choices for field
            if (field.type.split(' ')[0] == "select_one" || field.type.split(' ')[0] == "select_mulitple"){
              var curChoices = _.filter($scope.choices, function (choice) {
                return choice["list name"] == field.type.split(' ')[1] }
              );
              if (_.findWhere(curChoices, { name: field.default }))
                $scope.spot.properties[field.name] = field.default;
            }
            // Leave the field blank instead of writing not specified
            else if (field.default != "not specified")
              $scope.spot.properties[field.name] = field.default;
        });
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

      $scope.showLinkToNewOrientation = $scope.spot.properties.spottype != "Orientation";

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
        // Don't show links or groups until there are other spots to link to or groups to join
        $scope.showLinks = $scope.other_spots.length;
        $scope.showGroups = $scope.groups.length;
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
      var errorMessages = "";

      // Run validation check on the forms that are generated dynamically
      if ($scope.survey) {
        // If a field is visible and required but empty give the user an error message and return to the form
        _.each($scope.survey, function (field) {
          var ele = document.getElementById(field.name);
          if (getComputedStyle(ele).display != "none" && !$scope.spot.properties[field.name]) {
            if (field.required == "true")
              errorMessages += field.label + " Required!\n";
            else
              if (field.name in $scope.spot.properties)
                errorMessages += field.label + " " + field.constraint_message + "\n";
          }
          else if (getComputedStyle(ele).display == "none")
            delete $scope.spot.properties[field.name];
        });

        if (errorMessages) {
          alert("Fix the following errors before saving:\n" + errorMessages);
          return 0;
        }
      }

      if (!$scope.spot.properties.name) {
        alert('Name required.');
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

    $scope.copySpot = function() {
      console.log("hi");
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

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    $scope.showField = function(relevant) {
      if (!relevant)
        return true;

      relevant = relevant.replace(/\$/g,"");
      relevant = relevant.replace(/{/g,"$scope.spot.properties.");
      relevant = relevant.replace(/}/g,"");
      relevant = relevant.replace(/''/g,"undefined");
      relevant = relevant.replace(/ = /g," == ");
      relevant = relevant.replace(/ or /g," || ");
      relevant = relevant.replace(/ and /g," && ");

      try {
        return eval(relevant);
      }
      catch (e) {
        return false;
      }
    };

    // Get the min value allowed for a number field
    $scope.getMin = function(constraint) {
      try{
        // Look for >= in constraint, followed by a space and any number of digits
        var regexMin = />=\s(\d*)/i;
        // Return just the number
        return regexMin.exec(constraint)[1];
      }
      catch(e) {
        return undefined;
      }
    };

    // Get the max value allowed for a number field
    $scope.getMax = function(constraint) {
      try{
        // Look for <= in constraint, followed by a space and then a number
        var regexMax = /<=\s(\d*)/i;
        // Return just the number
        return regexMax.exec(constraint)[1];
      }
      catch(e) {
        return undefined;
      }
    };

    $scope.toggleChecked = function (field, choice) {
      var i = -1;
      if ($scope.spot.properties[field])
        i = $scope.spot.properties[field].indexOf(choice);
      else
        $scope.spot.properties[field] = [];

      // If choice not already selected
      if (i == -1) {
        $scope.spot.properties[field].push(choice);
      }
      // Choice has been unselected so remove it and delete if empty
      else {
        $scope.spot.properties[field].splice(i, 1);
        if ($scope.spot.properties[field].length == 0)
          delete $scope.spot.properties[field];
      }
    };

    // Is the other_spot is this spot's links list?
    $scope.isOptionChecked = function (field, choice) {
      if ($scope.spot) {
        if ($scope.spot.properties[field])
          return $scope.spot.properties[field].indexOf(choice) == -1 ? false : true;
      }
      else
        return false;
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

    /*************************************
    /* Spot Grouping
    /************************************/

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

    /*************************************
    /* Links
    /************************************/

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
  });
