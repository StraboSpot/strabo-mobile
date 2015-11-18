(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotController', SpotController);

  SpotController.$inject = ['$ionicModal', '$ionicPopup', '$location', '$log', '$rootScope', '$scope', '$state',
    'ContentModelSurveyFactory', 'CurrentSpotFactory', 'ImageMapFactory', 'NewSpotFactory', 'ProjectFactory',
    'SpotsFactory'];

  // this scope is the parent scope for the SpotController that all child SpotController will inherit
  function SpotController($ionicModal, $ionicPopup, $location, $log, $rootScope, $scope, $state,
                          ContentModelSurveyFactory, CurrentSpotFactory, ImageMapFactory, NewSpotFactory,
                          ProjectFactory, SpotsFactory) {
    var vm = this;

    $rootScope.$state = $state;

    vm.spotTypes = {
      'point': 'Measument or Observation',
      'line': 'Contact or Trace',
      'polygon': 'Rock Description',
      'group': 'Station or Group'
    };

    vm.goToSpots = function () {
      $state.go('app.spots');
    };

    vm.openSpot = function (id) {
      CurrentSpotFactory.clearCurrentSpot();
      $location.path('/spotTab/' + id + '/notes');
    };

    // Set or cleanup some of the properties of the vm
    var setProperties = function () {
      // Convert date string to Date type
      vm.spot.properties.date = new Date(vm.spot.properties.date);
      vm.spot.properties.time = new Date(vm.spot.properties.time);


      // Push spots from linked spots list into selected and unselected arrays so we know which checkboxes to turn on
      vm.links_selected = [];
      vm.links_unselected = [];
      if (vm.spot.properties.links && angular.isObject(vm.spot.properties.links)) {
        vm.spot.properties.links.forEach(function (obj, i) {
          vm.links_selected.push(obj);
        });
      }

      vm.groups_selected = [];
      vm.groups_unselected = [];
      if (vm.spot.properties.groups && angular.isObject(vm.spot.properties.groups)) {
        vm.spot.properties.groups.forEach(function (obj, i) {
          vm.groups_selected.push(obj);
        });
      }

      vm.group_members_selected = [];
      vm.group_members_unselected = [];
      if (vm.spot.properties.group_members && angular.isObject(vm.spot.properties.group_members)) {
        vm.spot.properties.group_members.forEach(function (obj, i) {
          vm.group_members_selected.push(obj);
        });
      }

      if (!vm.spot.properties.type) {
        vm.spot.properties.type = 'Custom';
      }

      switch (vm.spot.properties.type) {
        case 'point':
          vm.spotTitle = 'Measurement or Observation';
          vm.showDynamicFields = true;
          vm.showDetails = true;
          vm.showRockDescription = true;
          vm.showRockSample = true;
          vm.survey = ContentModelSurveyFactory.measurements_and_observations_survey;
          vm.choices = ContentModelSurveyFactory.measurements_and_observations_choices;
          vm.showGroupMembers = false;
          break;
        case 'line':
          vm.spotTitle = 'Contact or Trace';
          vm.showDynamicFields = true;
          vm.showDetails = true;
          vm.survey = ContentModelSurveyFactory.contacts_and_traces_survey;
          vm.choices = ContentModelSurveyFactory.contacts_and_traces_choices;
          vm.showGroupMembers = false;
          break;
        case 'polygon':
          vm.spotTitle = 'Rock Description';
          vm.showDynamicFields = false;
          vm.showDetails = false;
          vm.survey = undefined;
          vm.choices = undefined;
          vm.showRockDescription = true;
          vm.showGroupMembers = false;
          break;
        case 'group':
          vm.spotTitle = 'Station or Group';
          vm.showDynamicFields = true;
          vm.showDetails = true;
          vm.survey = ContentModelSurveyFactory.spot_grouping_survey;
          vm.choices = ContentModelSurveyFactory.spot_grouping_choices;
          vm.showGroupMembers = true;
          break;
        default:
          vm.showCustomFields = true;
      }

      vm.rock_description_survey = ContentModelSurveyFactory.rock_description_survey;
      vm.rock_description_choices = ContentModelSurveyFactory.rock_description_choices;
      vm.rock_sample_survey = ContentModelSurveyFactory.rock_sample_survey;
      vm.rock_sample_choices = ContentModelSurveyFactory.rock_sample_choices;

      // Set default values for the spot
      if (vm.survey) {
        vm.survey = _.reject(vm.survey, function (field) {
          return (field.type === 'start' || field.type === 'end');
        });

        _.each(vm.survey, function (field) {
          if (!vm.spot.properties[field.name] && field.default) {
            if (field.type === 'text' || field.type === 'note') {
              vm.spot.properties[field.name] = field.default;
            }
            else if (field.type === 'integer' && !isNaN(parseInt(field.default))) {
              vm.spot.properties[field.name] = parseInt(field.default);
            }
            else if (field.type.split(' ')[0] === 'select_one' || field.type.split(' ')[0] === 'select_multiple') {
              var curChoices = _.filter(vm.choices,
                function (choice) {
                  return choice['list name'] === field.type.split(' ')[1];
                }
              );
              // Check that default is in the list of choices for field
              if (_.findWhere(curChoices, {'name': field.default})) {
                if (field.type.split(' ')[0] === 'select_one') {
                  vm.spot.properties[field.name] = field.default;
                }
                else {
                  vm.spot.properties[field.name] = [];
                  vm.spot.properties[field.name].push(field.default);
                }
              }
            }
          }
        });
      }

      // Create checkbox list of other spots for selected as related spots
      SpotsFactory.all().then(function (spots) {
        vm.spots = spots;
        vm.other_spots = [];
        vm.groups = [];
        spots.forEach(function (obj, i) {
          if (vm.spot.properties.id !== obj.properties.id) {
            vm.other_spots.push({
              'name': obj.properties.name,
              'id': obj.properties.id,
              'type': obj.properties.type
            });
            if (obj.properties.type === 'group') {
              vm.groups.push({
                'name': obj.properties.name,
                'id': obj.properties.id,
                'type': obj.properties.type
              });
            }
          }
          // Check for Image Maps
          _.forEach(obj.images, function (image) {
            if (image.annotated) {
              image.annotated = true;
              ImageMapFactory.addImageMap(image);
            }
            else {
              image.annotated = false;
              ImageMapFactory.removeImageMap(image);
            }
          });
        });
        // Don't show links or groups until there are other spots to link to or groups to join
        vm.showLinks = vm.other_spots.length;
        vm.showGroups = vm.groups.length;
      });
    };

    vm.load = function (params) {
      // Get the current spot
      if (NewSpotFactory.getNewSpot()) {
        // Load spot stored in the NewSpotFactory factory
        vm.spot = NewSpotFactory.getNewSpot();
        CurrentSpotFactory.setCurrentSpot(vm.spot);
        // now clear the new spot from the factory because we have the info in our current scope
        NewSpotFactory.clearNewSpot();

        // Set default name
        var prefix = ProjectFactory.getSpotPrefix();
        if (!prefix) prefix = new Date().getTime().toString();
        var number = ProjectFactory.getSpotNumber();
        if (!number) number = '';
        vm.spot.properties.name = prefix + number;
        setProperties();
      }
      else {
        if (CurrentSpotFactory.getCurrentSpot()) {
          vm.spot = CurrentSpotFactory.getCurrentSpot();
          $log.log('attempting to set properties2');
          setProperties();
        }
        else {
          // Load spot from local storage
          SpotsFactory.read(params.spotId, function (spot) {
            vm.spot = spot;
            $log.log('attempting to set properties3');
            setProperties();
          });
        }
      }
    };

    // Toggle selected for links or groups or group members selected
    vm.toggleSelection = function toggleSelection(ref_spot, type_selected, type_unselected) {
      var selected_spot = _.findWhere(vm[type_selected], {'id': ref_spot.id});

      // If selected spot is not already in the links_selected object
      if (!selected_spot) {
        vm[type_selected].push(ref_spot);
      }
      // This spot has been unselected so remove it
      else {
        vm[type_selected] = _.reject(vm[type_selected], function (spot) {
          return spot.id === ref_spot.id;
        });
        vm[type_unselected].push(ref_spot);
      }
    };

    // Validate the fields in the given form
    vm.validateFields = function (form) {
      $log.log('Validating form with spot:', vm.spot);
      var errorMessages = '';

      // If a field is visible and required but empty give the user an error message and return to the form
      _.each(form, function (field) {
        var ele = document.getElementById(field.name);
        if (getComputedStyle(ele).display !== 'none' && angular.isUndefined(vm.spot.properties[field.name])) {
          if (field.required === 'true') {
            errorMessages += '<b>' + field.label + '</b> Required!<br>';
          }
          else if (field.name in vm.spot.properties) {
            errorMessages += '<b>' + field.label + '</b> ' + field.constraint_message + '<br>';
          }
        }
        else if (getComputedStyle(ele).display === 'none') {
          delete vm.spot.properties[field.name];
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
    vm.validateForm = function () {
      switch ($state.current.url.split('/').pop()) {
        case 'details':
          if (!vm.validateFields(vm.survey)) {
            return false;
          }
          break;
        case 'notes':
          if (!vm.spot.properties.name) {
            $ionicPopup.alert({
              'title': 'Validation Error!',
              'template': '<b>Spot Name</b> is required.'
            });
            return false;
          }
          break;
        case 'georeference':
          if (vm.spot.geometry) {
            if (vm.spot.geometry.type === 'Point') {
              var geoError;
              if (!vm.spot.geometry.coordinates[0] && !vm.spot.geometry.coordinates[1]) {
                geoError = '<b>Latitude</b> and <b>longitude</b> are required.';
              }
              else if (!vm.spot.geometry.coordinates[0]) {
                geoError = '<b>Longitude</b> is required.';
              }
              else if (!vm.spot.geometry.coordinates[1]) {
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
          if (!vm.validateFields(ContentModelSurveyFactory.rock_description_survey)) {
            return false;
          }
          break;
        case 'rocksample':
          if (!vm.validateFields(ContentModelSurveyFactory.rock_sample_survey)) {
            return false;
          }
          break;
      }
      return true;
    };

    // When switching tabs validate the form first (if the tab is based on a form),
    // save the properties for the current spot temporarily, then go to the new tab
    vm.switchTabs = function (toTab) {
      // has the rock description form been touched?
      if ($scope.$$childTail.rockDescriptionForm && !$scope.$$childTail.rockDescriptionForm.$pristine) {
        // yes
        if (!vm.validateForm()) {
          return 0;
        }
      }

      // has the rock sample form been touched?
      if ($scope.$$childTail.rockSampleForm && !$scope.$$childTail.rockSampleForm.$pristine) {
        // yes
        if (!vm.validateForm()) {
          return 0;
        }
      }

      // If the pristine variable is undefined or true don't validate the form,
      // but always validate if the spot is a rock description
      if (vm.spot.properties.type === 'polygon') {
        if (!vm.validateForm()) {
          return 0;
        }
      }

      CurrentSpotFactory.setCurrentSpot(vm.spot);
      $location.path('/spotTab/' + vm.spot.properties.id + '/' + toTab);
    };

    // Add or modify Spot
    vm.submit = function () {
      // Validate the form first
      if (!vm.validateForm()) {
        return 0;
      }

      $log.log('spot to save: ', vm.spot);

      // define the geojson feature type
      vm.spot.type = 'Feature';

      // Remove references from links or groups or group members
      var cleanRefs = function (ref_type, id) {
        // Remove the link reference from the link references for this spot, if it exists
        vm.spot.properties[ref_type] = _.reject(vm.spot.properties[ref_type], function (ref) {
          return ref.id === id;
        });

        // Get the linked spot or group
        var reference = _.filter(vm.spots, function (item) {
          return _.findWhere(item, {'id': id});
        })[0];

        var inverse_ref;
        switch (ref_type) {
          case 'links':
            inverse_ref = 'links';
            break;
          case 'groups':
            inverse_ref = 'group_members';
            break;
          case 'group_members':
            inverse_ref = 'groups';
            break;
        }

        // Remove the link reference to this spot from the link spot, if it exists
        reference.properties[inverse_ref] = _.reject(reference.properties[inverse_ref], function (ref) {
          return ref.id === vm.spot.properties.id;
        });
        return reference;
      };

      // Add or update linked spots from checked spots
      vm.links_selected.forEach(function (obj, i) {
        // Remove link references for this obj from this spot and the linked spot
        var linked_spot = cleanRefs('links', obj.id);

        // If a link relationship was not selected mark as 'is otherwise related to'
        obj.relationship = obj.relationship ? obj.relationship : 'is otherwise related to';

        // Add the new/updated link reference to the link references for this spot
        vm.spot.properties.links.push(obj);

        var link_relationship_inverse = _.findWhere(vm.link_relationship.choices,
          {'type': obj.relationship}).inverse;

        // Add the new/updated link reference to the link references for the linked spot
        linked_spot.properties.links.push({
          'name': vm.spot.properties.name,
          'id': vm.spot.properties.id,
          'type': vm.spot.properties.type,
          'relationship': link_relationship_inverse
        });

        // Save the linked spot
        SpotsFactory.save(linked_spot).then(function (data) {
          $log.log('updated inverse spot', data);
        });
      });

      // Remove unchecked spots from linked spots
      vm.links_unselected.forEach(function (obj, i) {
        // Remove link references for this obj from this spot and the linked spot
        var linked_spot = cleanRefs('links', obj.id);

        // Save the linked spot
        SpotsFactory.save(linked_spot).then(function (data) {
          $log.log('updated inverse spot', data);
        });
      });

      // Add or update the groups for this spot
      vm.groups_selected.forEach(function (obj, i) {
        // Remove this obj from the group
        var group = cleanRefs('groups', obj.id);

        // Add the new/updated group reference to the group references for this spot
        vm.spot.properties.groups.push(obj);

        // Add the new/updated spot reference to the group references for this group
        group.properties.group_members.push({
          'name': vm.spot.properties.name,
          'id': vm.spot.properties.id,
          'type': vm.spot.properties.type
        });

        // Save the group
        SpotsFactory.save(group).then(function (data) {
          $log.log('added group member', data);
        });
      });

      // Remove unchecked spots from group
      vm.groups_unselected.forEach(function (obj, i) {
        // Remove group references for this obj from this spot and the group
        var group = cleanRefs('groups', obj.id);

        // Save the group
        SpotsFactory.save(group).then(function (data) {
          $log.log('removed group member', data);
        });
      });

      // Add or update the group members for this spot
      vm.group_members_selected.forEach(function (obj, i) {
        // Remove this obj from the group
        var group = cleanRefs('group_members', obj.id);

        // Add the new/updated group reference to the group references for this spot
        vm.spot.properties.group_members.push(obj);

        // Add the new/updated spot reference to the group references for this group
        group.properties.groups.push({
          'name': vm.spot.properties.name,
          'id': vm.spot.properties.id,
          'type': vm.spot.properties.type
        });

        // Save the group
        SpotsFactory.save(group).then(function (data) {
          $log.log('added group', data);
        });
      });

      // Remove unchecked spots from group memberships
      vm.group_members_unselected.forEach(function (obj, i) {
        // Remove group references for this obj from this spot and the group
        var group = cleanRefs('group_members', obj.id);

        // Save the group
        SpotsFactory.save(group).then(function (data) {
          $log.log('removed group', data);
        });
      });

      _.forEach(vm.spot.images, function (image) {
        if (image.annotated) {
          ImageMapFactory.addImageMap(image);
        }
        else {
          ImageMapFactory.removeImageMap(image);
        }
      });

      // Save the spot
      SpotsFactory.save(vm.spot).then(function (data) {
        $log.log('spot saved: ', data);
        CurrentSpotFactory.clearCurrentSpot();
        ProjectFactory.incrementSpotNumber();
        $location.path('/app/spots');
        // $ionicHistory.goBack();
      });
    };

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    vm.showField = function (relevant) {
      if (!relevant) {
        return true;
      }

      relevant = relevant.replace(/selected\(\$/g, '_.contains(');
      relevant = relevant.replace(/\$/g, '');
      relevant = relevant.replace(/{/g, 'vm.spot.properties.');
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
    vm.getMin = function (constraint) {
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
    vm.getMax = function (constraint) {
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
    vm.setSelMultClass = function (field) {
      if (field.required === 'true') {
        if (vm.spot.properties[field.name]) {
          if (vm.spot.properties[field.name].length > 0) {
            return 'no-errors';
          }
        }
        else {
          return 'has-errors';
        }
      }
      return 'no-errors';
    };

    vm.toggleChecked = function (field, choice) {
      var i = -1;
      if (vm.spot.properties[field]) {
        i = vm.spot.properties[field].indexOf(choice);
      }
      else {
        vm.spot.properties[field] = [];
      }

      // If choice not already selected
      if (i === -1) {
        vm.spot.properties[field].push(choice);
      }
      // Choice has been unselected so remove it and delete if empty
      else {
        vm.spot.properties[field].splice(i, 1);
        if (vm.spot.properties[field].length === 0) {
          delete vm.spot.properties[field];
        }
      }
    };

    // Is the other_spot is this spot's links list?
    vm.isOptionChecked = function (field, choice) {
      if (vm.spot) {
        if (vm.spot.properties[field]) {
          return vm.spot.properties[field].indexOf(choice) !== -1;
        }
      }
      else {
        return false;
      }
    };

    // Is the other_spot is this spot's links list?
    vm.isAcknowledgeChecked = function (field) {
      if (vm.spot) {
        if (vm.spot.properties[field]) {
          return true;
        }
      }
      else {
        return false;
      }
    };

    vm.toggleAcknowledgeChecked = function (field) {
      if (vm.spot.properties[field]) {
        delete vm.spot.properties[field];
      }
      else {
        vm.spot.properties[field] = true;
      }
    };

    // Is the other_spot is this spot's links list?
    vm.isChecked = function (id) {
      return _.find(vm.spot.properties.links, function (rel_spot) {
        return rel_spot.id === id;
      });
    };

    vm.isGroupChecked = function (id) {
      return _.find(vm.spot.properties.groups, function (rel_spot) {
        return rel_spot.id === id;
      });
    };

    vm.isMemberChecked = function (id) {
      return _.find(vm.spot.properties.group_members, function (rel_spot) {
        return rel_spot.id === id;
      });
    };

    // Delete the spot
    vm.deleteSpot = function () {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Spot',
        'template': 'Are you sure you want to delete this spot?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          SpotsFactory.destroy(vm.spot.properties.id);
          $location.path('/app/spots');
        }
      });
    };

    // Create a new spot with the details from this spot
    vm.copySpot = function () {
      var copySpot = _.omit(vm.spot, 'properties');
      copySpot.properties = _.omit(vm.spot.properties,
        ['id', 'date', 'time', 'links', 'groups', 'group_members']);
      NewSpotFactory.setNewSpot(copySpot);
      $location.path('/spotTab//notes');
    };

    /**
     * MODALS
     */

    $ionicModal.fromTemplateUrl('app/spot/links-modal.html', {
      'scope': $scope,
      'animation': 'slide-in-up'
    }).then(function (modal) {
      vm.linkModal = modal;
    });

    $ionicModal.fromTemplateUrl('app/spot/groups-modal.html', {
      'scope': $scope,
      'animation': 'slide-in-up'
    }).then(function (modal) {
      vm.groupModal = modal;
    });

    $ionicModal.fromTemplateUrl('app/spot/groupmembers-modal.html', {
      'scope': $scope,
      'animation': 'slide-in-up'
    }).then(function (modal) {
      vm.groupMembersModal = modal;
    });

    vm.openModal = function (modal) {
      vm[modal].show();
    };

    vm.closeModal = function (modal) {
      vm[modal].hide();
    };

    // Cleanup the modal when we're done with it!
    // Execute action on hide modal
    $scope.$on('linkModal.hidden', function () {
      vm.linkModal.remove();
    });
    $scope.$on('groupModal.hidden', function () {
      vm.groupModal.remove();
    });
    $scope.$on('groupMembersModal.hidden', function () {
      vm.groupMembersModal.remove();
    });

    /**
     * Links
     */

    vm.link_relationship = {
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
  }
}());
