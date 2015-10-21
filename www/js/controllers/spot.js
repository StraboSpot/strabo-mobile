angular
  .module('app')
  .controller('SpotController', function ($scope,
                                    $rootScope,
                                    $state,
                                    $stateParams,
                                    $location,
                                    $ionicHistory,
                                    $ionicPopup,
                                    $ionicModal,
                                    $ionicActionSheet,
                                    $log,
                                    SpotsFactory,
                                    SettingsFactory,
                                    NewSpot,
                                    CurrentSpot,
                                    ImageMapService,
                                    ContentModelSurveyFactory) {
    // this scope is the parent scope for the SpotController that all child SpotController will inherit

    $rootScope.$state = $state;

    $scope.spotTypes = {
      'point': 'Measument or Observation',
      'line': 'Contact or Trace',
      'polygon': 'Rock Description',
      'group': 'Station or Group'
    };

    $scope.goToSpots = function () {
      $state.go('app.spots');
    };

    $scope.openSpot = function (id) {
      CurrentSpot.clearCurrentSpot();
      $location.path('/spotTab/' + id + '/notes');
    };

    // Set or cleanup some of the properties of the $scope
    var setProperties = function () {
      // Convert date string to Date type
      $scope.spot.properties.date = new Date($scope.spot.properties.date);
      $scope.spot.properties.time = new Date($scope.spot.properties.time);

      // Push spots from linked spots list into selected and unselected arrays so we know which checkboxes to turn on
      $scope.links_selected = [];
      $scope.links_unselected = [];
      if ($scope.spot.properties.links && typeof ($scope.spot.properties.links) === 'object') {
        $scope.spot.properties.links.forEach(function (obj, i) {
          $scope.links_selected.push(obj);
        });
      }

      $scope.groups_selected = [];
      $scope.groups_unselected = [];
      if ($scope.spot.properties.groups && typeof ($scope.spot.properties.groups) === 'object') {
        $scope.spot.properties.groups.forEach(function (obj, i) {
          $scope.groups_selected.push(obj);
        });
      }

      $scope.group_members_selected = [];
      $scope.group_members_unselected = [];
      if ($scope.spot.properties.group_members && typeof ($scope.spot.properties.group_members) === 'object') {
        $scope.spot.properties.group_members.forEach(function (obj, i) {
          $scope.group_members_selected.push(obj);
        });
      }

      if (!$scope.spot.properties.type) {
        $scope.spot.properties.type = 'Custom';
      }

      switch ($scope.spot.properties.type) {
        case 'point':
          $scope.spotTitle = 'Measurement or Observation';
          $scope.showDynamicFields = true;
          $scope.showDetails = true;
          $scope.showRockDescription = true;
          $scope.showRockSample = true;
          $scope.survey = ContentModelSurveyFactory.measurements_and_observations_survey;
          $scope.choices = ContentModelSurveyFactory.measurements_and_observations_choices;
          $scope.showGroupMembers = false;
          break;
        case 'line':
          $scope.spotTitle = 'Contact or Trace';
          $scope.showDynamicFields = true;
          $scope.showDetails = true;
          $scope.survey = ContentModelSurveyFactory.contacts_and_traces_survey;
          $scope.choices = ContentModelSurveyFactory.contacts_and_traces_choices;
          $scope.showGroupMembers = false;
          break;
        case 'polygon':
          $scope.spotTitle = 'Rock Description';
          $scope.showDynamicFields = false;
          $scope.showDetails = false;
          $scope.survey = undefined;
          $scope.choices = undefined;
          $scope.showRockDescription = true;
          $scope.showGroupMembers = false;
          break;
        case 'group':
          $scope.spotTitle = 'Station or Group';
          $scope.showDynamicFields = true;
          $scope.showDetails = true;
          $scope.survey = ContentModelSurveyFactory.spot_grouping_survey;
          $scope.choices = ContentModelSurveyFactory.spot_grouping_choices;
          $scope.showGroupMembers = true;
          break;
        default:
          $scope.showCustomFields = true;
      }

      $scope.rock_description_survey = ContentModelSurveyFactory.rock_description_survey;
      $scope.rock_description_choices = ContentModelSurveyFactory.rock_description_choices;
      $scope.rock_sample_survey = ContentModelSurveyFactory.rock_sample_survey;
      $scope.rock_sample_choices = ContentModelSurveyFactory.rock_sample_choices;

      // Set default values for the spot
      if ($scope.survey) {
        $scope.survey = _.reject($scope.survey, function (field) {
          return (field.type === 'start' || field.type === 'end');
        });

        _.each($scope.survey, function (field) {
          if (!$scope.spot.properties[field.name] && field.default) {
            if (field.type === 'text' || field.type === 'note') {
              $scope.spot.properties[field.name] = field.default;
            }
            else if (field.type === 'integer' && !isNaN(parseInt(field.default))) {
              $scope.spot.properties[field.name] = parseInt(field.default);
            }
            else if (field.type.split(' ')[0] === 'select_one' || field.type.split(' ')[0] === 'select_multiple') {
              var curChoices = _.filter($scope.choices,
                function (choice) {
                  return choice['list name'] === field.type.split(' ')[1];
                }
              );
              // Check that default is in the list of choices for field
              if (_.findWhere(curChoices, {'name': field.default})) {
                if (field.type.split(' ')[0] === 'select_one') {
                  $scope.spot.properties[field.name] = field.default;
                }
                else {
                  $scope.spot.properties[field.name] = [];
                  $scope.spot.properties[field.name].push(field.default);
                }
              }
            }
          }
        });
      }

      // Create checkbox list of other spots for selected as related spots
      SpotsFactory.all().then(function (spots) {
        $scope.spots = spots;
        $scope.other_spots = [];
        $scope.groups = [];
        spots.forEach(function (obj, i) {
          if ($scope.spot.properties.id !== obj.properties.id) {
            $scope.other_spots.push({
              'name': obj.properties.name,
              'id': obj.properties.id,
              'type': obj.properties.type
            });
            if (obj.properties.type === 'group') {
              $scope.groups.push({
                'name': obj.properties.name,
                'id': obj.properties.id,
                'type': obj.properties.type
              });
            }
          }
          // Check for Image Maps
          _.forEach(obj.images, function (image) {
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
        // Don't show links or groups until there are other spots to link to or groups to join
        $scope.showLinks = $scope.other_spots.length;
        $scope.showGroups = $scope.groups.length;
      });
    };

    $scope.load = function (params) {
      // Get the current spot
      if (NewSpot.getNewSpot()) {
        // Load spot stored in the NewSpot service
        $scope.spot = NewSpot.getNewSpot();
        CurrentSpot.setCurrentSpot($scope.spot);
        // now clear the new spot from the service because we have the info in our current scope
        NewSpot.clearNewSpot();

        // Set default name
        SettingsFactory.getNamePrefix().then(function (prefix) {
          if (!prefix) {
            prefix = '';
          }
          if (prefix && !isNaN(prefix)) {
            SettingsFactory.getPrefixIncrement().then(function (prefix_increment) {
              SettingsFactory.setNamePrefix(prefix + prefix_increment);
              prefix = prefix.toString();
            });
          }
          SettingsFactory.getNameRoot().then(function (root) {
            SettingsFactory.getNameSuffix().then(function (suffix) {
              if (!suffix) {
                suffix = '';
              }
              if (suffix && !isNaN(suffix)) {
                SettingsFactory.getSuffixIncrement().then(function (suffix_increment) {
                  SettingsFactory.setNameSuffix(suffix + suffix_increment);
                  suffix = suffix.toString();
                });
              }
              if (root) {
                $scope.spot.properties.name = prefix + root + suffix;
              }
              else {
                $scope.spot.properties.name = prefix + new Date().getTime().toString() + suffix;
              }
              $log.log('attempting to set properties');
              setProperties();
            });
          });
        });
      }
      else {
        if (CurrentSpot.getCurrentSpot()) {
          $scope.spot = CurrentSpot.getCurrentSpot();
          $log.log('attempting to set properties2');
          setProperties();
        }
        else {
          // Load spot from local storage
          SpotsFactory.read(params.spotId, function (spot) {
            $scope.spot = spot;
            $log.log('attempting to set properties3');
            setProperties();
          });
        }
      }
    };

    // Toggle selected for links or groups or group members selected
    $scope.toggleSelection = function toggleSelection(ref_spot, type_selected, type_unselected) {
      var selected_spot = _.findWhere($scope[type_selected], {'id': ref_spot.id});

      // If selected spot is not already in the links_selected object
      if (!selected_spot) {
        $scope[type_selected].push(ref_spot);
      }
      // This spot has been unselected so remove it
      else {
        $scope[type_selected] = _.reject($scope[type_selected], function (spot) {
          return spot.id === ref_spot.id;
        });
        $scope[type_unselected].push(ref_spot);
      }
    };

    // Validate the fields in the given form
    $scope.validateFields = function (form) {
      $log.log('Validating form with spot:', $scope.spot);
      var errorMessages = '';

      // If a field is visible and required but empty give the user an error message and return to the form
      _.each(form, function (field) {
        var ele = document.getElementById(field.name);
        if (getComputedStyle(ele).display !== 'none' && $scope.spot.properties[field.name] === undefined) {
          if (field.required === 'true') {
            errorMessages += '<b>' + field.label + '</b> Required!<br>';
          }
          else if (field.name in $scope.spot.properties) {
            errorMessages += '<b>' + field.label + '</b> ' + field.constraint_message + '<br>';
          }
        }
        else if (getComputedStyle(ele).display === 'none') {
          delete $scope.spot.properties[field.name];
        }
      });

      if (errorMessages) {
        $ionicPopup.alert({
          'title': 'Validation Error!',
          'template': 'Fix the following errors before continuing:<br>' + errorMessages
        });
        return false;
      }
      else {
        return true;
      }
    };

    // Validate the current form
    $scope.validateForm = function () {
      switch ($state.current.url.split('/').pop()) {
        case 'details':
          if (!$scope.validateFields($scope.survey)) {
            return false;
          }
          break;
        case 'notes':
          if (!$scope.spot.properties.name) {
            $ionicPopup.alert({
              'title': 'Validation Error!',
              'template': '<b>Spot Name</b> is required.'
            });
            return false;
          }
          break;
        case 'georeference':
          if ($scope.spot.geometry) {
            if ($scope.spot.geometry.type === 'Point') {
              var geoError;
              if (!$scope.spot.geometry.coordinates[0] && !$scope.spot.geometry.coordinates[1]) {
                geoError = '<b>Latitude</b> and <b>longitude</b> are required.';
              }
              else if (!$scope.spot.geometry.coordinates[0]) {
                geoError = '<b>Longitude</b> is required.';
              }
              else if (!$scope.spot.geometry.coordinates[1]) {
                geoError = '<b>Latitude</b> is required.';
              }
              if (geoError) {
                $ionicPopup.alert({
                  'title': 'Validation Error!',
                  'template': geoError
                });
                return false;
              }
            }
          }
          break;
        case 'rockdescription':
          if (!$scope.validateFields(ContentModelSurveyFactory.rock_description_survey)) {
            return false;
          }
          break;
        case 'rocksample':
          if (!$scope.validateFields(ContentModelSurveyFactory.rock_sample_survey)) {
            return false;
          }
          break;
      }
      return true;
    };

    // When switching tabs validate the form first (if the tab is based on a form),
    // save the properties for the current spot temporarily, then go to the new tab
    $scope.switchTabs = function (toTab) {
      // has the rock description form been touched?
      if ($scope.$$childTail.rockDescriptionForm && !$scope.$$childTail.rockDescriptionForm.$pristine) {
        // yes
        if (!$scope.validateForm()) {
          return 0;
        }
      }

      // has the rock sample form been touched?
      if ($scope.$$childTail.rockSampleForm && !$scope.$$childTail.rockSampleForm.$pristine) {
        // yes
        if (!$scope.validateForm()) {
          return 0;
        }
      }

      // If the pristine variable is undefined or true don't validate the form,
      // but always validate if the spot is a rock description
      if ($scope.spot.properties.type === 'polygon') {
        if (!$scope.validateForm()) {
          return 0;
        }
      }

      CurrentSpot.setCurrentSpot($scope.spot);
      $location.path('/spotTab/' + $scope.spot.properties.id + '/' + toTab);
    };

    // Add or modify Spot
    $scope.submit = function () {
      // Validate the form first
      if (!$scope.validateForm()) {
        return 0;
      }

      $log.log('spot to save: ', $scope.spot);

      // define the geojson feature type
      $scope.spot.type = 'Feature';

      // Remove references from links or groups or group members
      var cleanRefs = function (ref_type, id) {
        // Remove the link reference from the link references for this spot, if it exists
        $scope.spot.properties[ref_type] = _.reject($scope.spot.properties[ref_type], function (ref) {
          return ref.id === id;
        });

        // Get the linked spot or group
        var reference = _.filter($scope.spots, function (item) {
          return _.findWhere(item, {'id': id});
        })[0];

        switch (ref_type) {
          case 'links':
            var inverse_ref = 'links';
            break;
          case 'groups':
            var inverse_ref = 'group_members';
            break;
          case 'group_members':
            var inverse_ref = 'groups';
            break;
        }

        // Remove the link reference to this spot from the link spot, if it exists
        reference.properties[inverse_ref] = _.reject(reference.properties[inverse_ref], function (ref) {
          return ref.id === $scope.spot.properties.id;
        });
        return reference;
      };

      // Add or update linked spots from checked spots
      $scope.links_selected.forEach(function (obj, i) {
        // Remove link references for this obj from this spot and the linked spot
        var linked_spot = cleanRefs('links', obj.id);

        // If a link relationship was not selected mark as 'is otherwise related to'
        obj['relationship'] = obj.relationship ? obj.relationship : 'is otherwise related to';

        // Add the new/updated link reference to the link references for this spot
        $scope.spot.properties.links.push(obj);

        var link_relationship_inverse = _.findWhere($scope.link_relationship.choices,
          {'type': obj.relationship}).inverse;

        // Add the new/updated link reference to the link references for the linked spot
        linked_spot.properties.links.push({
          'name': $scope.spot.properties.name,
          'id': $scope.spot.properties.id,
          'type': $scope.spot.properties.type,
          'relationship': link_relationship_inverse
        });

        // Save the linked spot
        SpotsFactory.save(linked_spot).then(function (data) {
          $log.log('updated inverse spot', data);
        });
      });

      // Remove unchecked spots from linked spots
      $scope.links_unselected.forEach(function (obj, i) {
        // Remove link references for this obj from this spot and the linked spot
        var linked_spot = cleanRefs('links', obj.id);

        // Save the linked spot
        SpotsFactory.save(linked_spot).then(function (data) {
          $log.log('updated inverse spot', data);
        });
      });

      // Add or update the groups for this spot
      $scope.groups_selected.forEach(function (obj, i) {
        // Remove this obj from the group
        var group = cleanRefs('groups', obj.id);

        // Add the new/updated group reference to the group references for this spot
        $scope.spot.properties.groups.push(obj);

        // Add the new/updated spot reference to the group references for this group
        group.properties.group_members.push({
          'name': $scope.spot.properties.name,
          'id': $scope.spot.properties.id,
          'type': $scope.spot.properties.type
        });

        // Save the group
        SpotsFactory.save(group).then(function (data) {
          $log.log('added group member', data);
        });
      });

      // Remove unchecked spots from group
      $scope.groups_unselected.forEach(function (obj, i) {
        // Remove group references for this obj from this spot and the group
        var group = cleanRefs('groups', obj.id);

        // Save the group
        SpotsFactory.save(group).then(function (data) {
          $log.log('removed group member', data);
        });
      });

      // Add or update the group members for this spot
      $scope.group_members_selected.forEach(function (obj, i) {
        // Remove this obj from the group
        var group = cleanRefs('group_members', obj.id);

        // Add the new/updated group reference to the group references for this spot
        $scope.spot.properties.group_members.push(obj);

        // Add the new/updated spot reference to the group references for this group
        group.properties.groups.push({
          'name': $scope.spot.properties.name,
          'id': $scope.spot.properties.id,
          'type': $scope.spot.properties.type
        });

        // Save the group
        SpotsFactory.save(group).then(function (data) {
          $log.log('added group', data);
        });
      });

      // Remove unchecked spots from group memberships
      $scope.group_members_unselected.forEach(function (obj, i) {
        // Remove group references for this obj from this spot and the group
        var group = cleanRefs('group_members', obj.id);

        // Save the group
        SpotsFactory.save(group).then(function (data) {
          $log.log('removed group', data);
        });
      });

      _.forEach($scope.spot.images, function (image) {
        if (image.annotated) {
          ImageMapService.addImageMap(image);
        }
        else {
          ImageMapService.removeImageMap(image);
        }
      });

      // Save the spot
      SpotsFactory.save($scope.spot).then(function (data) {
        $log.log('spot saved: ', data);
        CurrentSpot.clearCurrentSpot();
        $location.path('/app/spots');
        // $ionicHistory.goBack();
      });
    };

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    $scope.showField = function (relevant) {
      if (!relevant) {
        return true;
      }

      relevant = relevant.replace(/selected\(\$/g, '_.contains(');
      relevant = relevant.replace(/\$/g, '');
      relevant = relevant.replace(/{/g, '$scope.spot.properties.');
      relevant = relevant.replace(/}/g, '');
      relevant = relevant.replace(/''/g, 'undefined');
      relevant = relevant.replace(/ = /g, ' == ');
      relevant = relevant.replace(/ or /g, ' || ');
      relevant = relevant.replace(/ and /g, ' && ');

      try {
        return eval(relevant);
      }
      catch (e) {
        return false;
      }
    };

    // Get the min value allowed for a number field
    $scope.getMin = function (constraint) {
      try {
        // Look for >= in constraint, followed by a space and any number of digits
        var regexMin = />=\s(\d*)/i;
        // Return just the number
        return regexMin.exec(constraint)[1];
      }
      catch (e) {
        return undefined;
      }
    };

    // Get the max value allowed for a number field
    $scope.getMax = function (constraint) {
      try {
        // Look for <= in constraint, followed by a space and then a number
        var regexMax = /<=\s(\d*)/i;
        // Return just the number
        return regexMax.exec(constraint)[1];
      }
      catch (e) {
        return undefined;
      }
    };

    // Set the class for the select_multiple fields here because it is not working
    // to set the class in the html the same way as for the other fields
    $scope.setSelMultClass = function (field) {
      if (field.required === 'true') {
        if ($scope.spot.properties[field.name]) {
          if ($scope.spot.properties[field.name].length > 0) {
            return 'no-errors';
          }
        }
        else {
          return 'has-errors';
        }
      }
      return 'no-errors';
    };

    $scope.toggleChecked = function (field, choice) {
      var i = -1;
      if ($scope.spot.properties[field]) {
        i = $scope.spot.properties[field].indexOf(choice);
      }
      else {
        $scope.spot.properties[field] = [];
      }

      // If choice not already selected
      if (i === -1) {
        $scope.spot.properties[field].push(choice);
      }
      // Choice has been unselected so remove it and delete if empty
      else {
        $scope.spot.properties[field].splice(i, 1);
        if ($scope.spot.properties[field].length === 0) {
          delete $scope.spot.properties[field];
        }
      }
    };

    // Is the other_spot is this spot's links list?
    $scope.isOptionChecked = function (field, choice) {
      if ($scope.spot) {
        if ($scope.spot.properties[field]) {
          return $scope.spot.properties[field].indexOf(choice) !== -1;
        }
      }
      else {
        return false;
      }
    };

    // Is the other_spot is this spot's links list?
    $scope.isAcknowledgeChecked = function (field) {
      if ($scope.spot) {
        if ($scope.spot.properties[field]) {
          return true;
        }
      }
      else {
        return false;
      }
    };

    $scope.toggleAcknowledgeChecked = function (field) {
      if ($scope.spot.properties[field]) {
        delete $scope.spot.properties[field];
      }
      else {
        $scope.spot.properties[field] = true;
      }
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

    // Delete the spot
    $scope.deleteSpot = function () {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Spot',
        'template': 'Are you sure you want to delete this spot?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          SpotsFactory.destroy($scope.spot.properties.id);
          $location.path('/app/spots');
        }
      });
    };

    // Create a new spot with the details from this spot
    $scope.copySpot = function () {
      var copySpot = _.omit($scope.spot, 'properties');
      copySpot['properties'] = _.omit($scope.spot.properties, ['id', 'date', 'time', 'links', 'groups', 'group_members']);
      NewSpot.setNewSpot(copySpot);
      $location.path('/spotTab//notes');
    };

    /**
     * MODALS
     */

    $ionicModal.fromTemplateUrl('templates/modals/linkModal.html', {
      'scope': $scope,
      'animation': 'slide-in-up'
    }).then(function (modal) {
      $scope.linkModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modals/groupModal.html', {
      'scope': $scope,
      'animation': 'slide-in-up'
    }).then(function (modal) {
      $scope.groupModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modals/groupMembersModal.html', {
      'scope': $scope,
      'animation': 'slide-in-up'
    }).then(function (modal) {
      $scope.groupMembersModal = modal;
    });

    $scope.openModal = function (modal) {
      $scope[modal].show();
    };

    $scope.closeModal = function (modal) {
      $scope[modal].hide();
    };

    // Cleanup the modal when we're done with it!
    // Execute action on hide modal
    $scope.$on('linkModal.hidden', function () {
      $scope.linkModal.remove();
    });
    $scope.$on('groupModal.hidden', function () {
      $scope.groupModal.remove();
    });
    $scope.$on('groupMembersModal.hidden', function () {
      $scope.groupMembersModal.remove();
    });

    /**
     * Links
     */

    $scope.link_relationship = {
      'choices': [
        {'type': 'has', 'inverse': 'describes'},
        {'type': 'describes', 'inverse': 'has'},
        {'type': 'cross-cuts', 'inverse': 'is cross cut by'},
        {'type': 'is cross-cut by', 'inverse': 'cross-cuts'},
        {'type': 'is younger than', 'inverse': 'is older than'},
        {'type': 'is older than', 'inverse': 'is younger than'},
        {'type': 'is a lower metamorphic grade than', 'inverse': 'is a higher metamorphic grade than'},
        {'type': 'is a higher metamorphic grade than', 'inverse': 'is a lower metamorphic grade than'},
        {'type': 'is included within', 'inverse': 'includes'},
        {'type': 'includes', 'inverse': 'is included within'},
        {'type': 'is otherwise related to', 'inverse': 'is otherwise related to'}
      ]
    };
  });
