(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotController', SpotController);

  SpotController.$inject = ['$document', '$ionicActionSheet', '$ionicModal', '$ionicPopup', '$location', '$log',
    '$scope', '$state', 'ContentModelSurveyFactory', 'DataModelsFactory', 'FormFactory', 'ImageBasemapFactory',
    'PreferencesFactory', 'ProjectFactory', 'SpotFactory', 'SpotFormsFactory'];

  // This scope is the parent scope for the SpotController that all child SpotController will inherit
  function SpotController($document, $ionicActionSheet, $ionicModal, $ionicPopup, $location, $log, $scope, $state,
                          ContentModelSurveyFactory, DataModelsFactory, FormFactory, ImageBasemapFactory,
                          PreferencesFactory, ProjectFactory, SpotFactory, SpotFormsFactory) {
    var vm = this;

    vm.choices = null;
    vm.closeModal = closeModal;
    vm.data = {};
    vm.fields = {};
    vm.getMax = getMax;
    vm.getMin = getMin;
    vm.goToSpots = goToSpots;
    vm.isAcknowledgeChecked = isAcknowledgeChecked;
    vm.isChecked = isChecked;
    vm.isGroupChecked = isGroupChecked;
    vm.isMemberChecked = isMemberChecked;
    vm.isOptionChecked = isOptionChecked;
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
    vm.loadTab = loadTab;
    vm.openModal = openModal;
    vm.openSpot = openSpot;
    vm.setSelMultClass = setSelMultClass;
    vm.showActionsheet = showActionsheet;
    vm.showCustomFields = false;
    vm.showDynamicFields = true;
    vm.showField = showField;
    vm.showGroupMembers = true;
    vm.showRockUnit = true;
    vm.showTab = showTab;
    vm.showTrace = false;
    vm.spot = {};
    vm.submit = submit;
    vm.survey = null;
    vm.switchTabs = switchTabs;
    vm.toggleAcknowledgeChecked = toggleAcknowledgeChecked;
    vm.toggleAcknowledgeCheckedOrig = toggleAcknowledgeCheckedOrig;
    vm.toggleChecked = toggleChecked;
    vm.toggleSelection = toggleSelection;
    vm.validateFields = validateFields;
    vm.validateForm = validateForm;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('In SpotController');
      loadForms();

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
    }

    // Create a new spot with the details from this spot
    function copySpot() {
      var newSpot = _.omit(vm.spot, 'properties');
      newSpot.properties = _.omit(vm.spot.properties,
        ['name', 'id', 'date', 'time', 'links', 'groups', 'group_members', 'modified_timestamp']);
      SpotFactory.setNewSpot(newSpot);
      loadSpot(undefined);
    }

    // Delete the spot
    function deleteSpot() {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Spot',
        'template': 'Are you sure you want to delete this spot?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          SpotFactory.destroy(vm.spot.properties.id);
          $location.path('/app/spots');
        }
      });
    }

    // Get the form fields
    function getFields(value, key) {
      $log.log('Loading ' + key + ' ....');
      var csvFile = DataModelsFactory.dataModels[key];
      DataModelsFactory.readCSV(csvFile, function (fields) {
        $log.log('Finished loading ' + key + ' : ', fields);
        vm.fields[key] = fields;
      });
    }

    // Load the form survey (and choices, if applicable)
    function loadForm(tab) {
      switch (tab) {
        case 'spotTab._3dstructures':
          vm.survey = vm.fields._3dstructures_survey;
          vm.choices = vm.fields._3dstructures_choices;
          break;
        case 'spotTab.orientation-old':
          vm.showDynamicFields = true;
          vm.survey = ContentModelSurveyFactory.measurements_and_observations_survey;
          vm.choices = ContentModelSurveyFactory.measurements_and_observations_choices;
          break;
        case 'spotTab.sample':
          vm.survey = vm.fields.sample_survey;
          vm.choices = vm.fields.sample_choices;
          break;
        case 'spotTab.spot':
          vm.survey = vm.fields.traces_survey;
          vm.choices = vm.fields.traces_choices;
          break;
      }
    }

    function loadForms() {
      // Start loading fields for all forms except traces form in first tab
      vm.fields._3dstructures_survey = {};
      vm.fields._3dstructures_choices = {};
      vm.fields.sample_survey = {};
      vm.fields.sample_choices = {};
      _.forEach(vm.fields, getFields);

      // Loaded traces form in factory before controller since traces are on the first tab
      // Load traces fields
      vm.fields.traces_survey = SpotFormsFactory.getTracesSurvey();
      vm.fields.traces_choices = SpotFormsFactory.getTracesChoices();
    }

    // Get the current spot
    function loadSpot(id) {
      if (!_.isEmpty(SpotFactory.getNewSpot())) {
        // Load spot stored in the SpotFactory factory
        vm.spot = SpotFactory.getNewSpot();
        SpotFactory.setCurrentSpot(vm.spot);
        vm.spot = SpotFactory.getCurrentSpot();
        // now clear the new spot from the factory because we have the info in our current scope
        SpotFactory.clearNewSpot();

        // Set default name
        var prefix = ProjectFactory.getSpotPrefix();
        if (!prefix) prefix = new Date().getTime().toString();
        var number = ProjectFactory.getSpotNumber();
        if (!number) number = '';
        vm.spot.properties.name = prefix + number;
        setProperties();
      }
      else {
        if (!_.isEmpty(SpotFactory.getCurrentSpot())) {
          vm.spot = SpotFactory.getCurrentSpot();
          $log.log('attempting to set properties2');
          setProperties();
        }
        else {
          SpotFactory.setCurrentSpotById(id);
          vm.spot = SpotFactory.getCurrentSpot();
          $log.log('attempting to set properties3');
          setProperties();
        }
      }
    }

    // Set or cleanup some of the properties of the vm
    function setProperties() {
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

      vm.spotTitle = vm.spot.properties.name;

      // Set default values for the spot
      if (vm.survey) {
        vm.survey = _.reject(vm.survey, function (field) {
          return ((field.type === 'start' && field.name === 'start') || (field.type === 'end' && field.name === 'end'));
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
      vm.spots = SpotFactory.getSpots();
      vm.other_spots = [];
      vm.groups = [];
      if (!_.isEmpty(vm.spots)) {
        vm.spots.forEach(function (obj, i) {
          if (vm.spot.properties.id !== obj.properties.id) {
            vm.other_spots.push({
              'name': obj.properties.name,
              'id': obj.properties.id
            });
            vm.groups.push({
              'name': obj.properties.name,
              'id': obj.properties.id
            });
          }
          // Check for image basemaps
          _.forEach(obj.images, function (image) {
            if (image.annotated) {
              image.annotated = true;
              ImageBasemapFactory.addImageBasemap(image);
            }
            else {
              image.annotated = false;
              ImageBasemapFactory.removeImageBasemap(image);
            }
          });
        });
        vm.data = vm.spot.properties;
      }
      // Don't show links or groups until there are other spots to link to or groups to join
      vm.showLinks = vm.other_spots.length;
      vm.showGroups = vm.groups.length;

      $log.log('Spot loaded: ', vm.spot);
    }

    /**
     * Public Functions
     */

    function closeModal(modal) {
      vm[modal].hide();
    }

    // Get the max value allowed for a number field
    function getMax(constraint) {
      try {
        // Look for <= in constraint, followed by a space and then a number
        var regexMax = /<=\s(\d*)/i;
        // Return just the number
        return regexMax.exec(constraint)[1];
      }
      catch (e) {
        return undefined;
      }
    }

    // Get the min value allowed for a number field
    function getMin(constraint) {
      try {
        // Look for >= in constraint, followed by a space and any number of digits
        var regexMin = />=\s(\d*)/i;
        // Return just the number
        return regexMin.exec(constraint)[1];
      }
      catch (e) {
        return undefined;
      }
    }

    function goToSpots() {
      $state.go('app.spots');
    }

    // Is the other_spot is this spot's links list?
    function isAcknowledgeChecked(field) {
      if (vm.spot) {
        if (vm.spot.properties[field]) {
          return true;
        }
      }
      else {
        return false;
      }
    }

    // Is the other_spot is this spot's links list?
    function isChecked(id) {
      return _.find(vm.spot.properties.links, function (rel_spot) {
        return rel_spot.id === id;
      });
    }

    function isGroupChecked(id) {
      return _.find(vm.spot.properties.groups, function (rel_spot) {
        return rel_spot.id === id;
      });
    }

    function isMemberChecked(id) {
      return _.find(vm.spot.properties.group_members, function (rel_spot) {
        return rel_spot.id === id;
      });
    }

    // Is the other_spot is this spot's links list?
    function isOptionChecked(field, choice) {
      if (vm.spot) {
        if (vm.spot.properties[field]) {
          return vm.spot.properties[field].indexOf(choice) !== -1;
        }
      }
      else {
        return false;
      }
    }

    function loadTab(state) {
      loadSpot(state.params.spotId);
      loadForm(state.current.name);

      vm.showTrace = false;
      vm.showRockUnit = true;
      if (vm.spot.geometry.type === 'LineString') {
        vm.showTrace = true;
        vm.showRockUnit = false;
      }
    }

    function openModal(modal) {
      vm[modal].show();
    }

    function openSpot(id) {
      SpotFactory.clearCurrentSpot();
      $location.path('/spotTab/' + id + '/spot');
    }

    // Set the class for the select_multiple fields here because it is not working
    // to set the class in the html the same way as for the other fields
    function setSelMultClass(field) {
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
    }

    function showActionsheet() {
      $ionicActionSheet.show({
        'titleText': 'Spot Actions',
        'buttons': [{
          'text': '<i class="icon ion-trash-b"></i>Delete this Spot'
        }, {
          'text': '<i class="icon ion-ios-copy"></i>Copy this Spot to a New Spot'
        }],
        'cancelText': 'Cancel',
        'cancel': function () {
          $log.log('CANCELLED');
        },
        'buttonClicked': function (index) {
          $log.log('BUTTON CLICKED', index);
          switch (index) {
            case 0:
              deleteSpot();
              break;
            case 1:
              copySpot();
              break;
          }
          return true;
        }
      });
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function showTab(tab) {
      var preferences = PreferencesFactory.getPreferencesData();
      return preferences[tab];
    }

    // Add or modify Spot
    function submit() {
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
          'relationship': link_relationship_inverse
        });

        // Save the linked spot
        SpotFactory.save(linked_spot).then(function (data) {
          $log.log('updated inverse spot', data);
        });
      });

      // Remove unchecked spots from linked spots
      vm.links_unselected.forEach(function (obj, i) {
        // Remove link references for this obj from this spot and the linked spot
        var linked_spot = cleanRefs('links', obj.id);

        // Save the linked spot
        SpotFactory.save(linked_spot).then(function (data) {
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
          'id': vm.spot.properties.id
        });

        // Save the group
        SpotFactory.save(group).then(function (data) {
          $log.log('added group member', data);
        });
      });

      // Remove unchecked spots from group
      vm.groups_unselected.forEach(function (obj, i) {
        // Remove group references for this obj from this spot and the group
        var group = cleanRefs('groups', obj.id);

        // Save the group
        SpotFactory.save(group).then(function (data) {
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
          'id': vm.spot.properties.id
        });

        // Save the group
        SpotFactory.save(group).then(function (data) {
          $log.log('added group', data);
        });
      });

      // Remove unchecked spots from group memberships
      vm.group_members_unselected.forEach(function (obj, i) {
        // Remove group references for this obj from this spot and the group
        var group = cleanRefs('group_members', obj.id);

        // Save the group
        SpotFactory.save(group).then(function (data) {
          $log.log('removed group', data);
        });
      });

      _.forEach(vm.spot.images, function (image) {
        if (image.annotated) {
          ImageBasemapFactory.addImageBasemap(image);
        }
        else {
          ImageBasemapFactory.removeImageBasemap(image);
        }
      });

      var found = _.find(vm.spots, function (spot) {
        return spot.properties.id === vm.spot.properties.id;
      });

      // Save the spot
      SpotFactory.save(vm.spot).then(function (data) {
        vm.spots = data;
        SpotFactory.clearCurrentSpot();
        if (!found) ProjectFactory.incrementSpotNumber();
        $location.path('/app/spots');
        // $ionicHistory.goBack();
      });
    }

    // When switching tabs validate the form first (if the tab is based on a form),
    // save the properties for the current spot temporarily, then go to the new tab
    function switchTabs(toTab) {
      // Has the rock sample form been touched?
      if ($scope.$$childTail.SampleTabForm && !$scope.$$childTail.SampleTabForm.$pristine) {
        // yes
        if (!vm.validateForm()) {
          return 0;
        }
      }
      else {
        if (!vm.validateForm()) {
          return 0;
        }
      }

      $location.path('/spotTab/' + vm.spot.properties.id + '/' + toTab);
    }

    function toggleAcknowledgeChecked(field) {
      if (vm.spot.properties[field]) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Close Group?',
          'template': 'By closing this group you will be clearing any data in this group. Continue?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            vm.spot.properties = FormFactory.toggleAcknowledgeChecked(vm.spot.properties, field);
          }
          else {
            $document[0].getElementById(field + 'Toggle').checked = true;
          }
        });
      }
      else {
        vm.spot.properties = FormFactory.toggleAcknowledgeChecked(vm.spot.properties, field);
      }
    }

    function toggleAcknowledgeCheckedOrig(field) {
      if (vm.spot.properties[field]) {
        delete vm.spot.properties[field];
      }
      else {
        vm.spot.properties[field] = true;
      }
    }

    function toggleChecked(field, choice) {
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
    }

    // Toggle selected for links or groups or group members selected
    function toggleSelection(ref_spot, type_selected, type_unselected) {
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
    }

    // Validate the fields in the given form
    function validateFields(form) {
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
    }

    // Validate the current form
    function validateForm() {
      switch ($state.current.url.split('/').pop()) {
        case 'orientation-old':
          if (!vm.validateFields(vm.survey)) {
            return false;
          }
          break;
        case 'spot':
          if (!vm.spot.properties.name) {
            $ionicPopup.alert({
              'title': 'Validation Error!',
              'template': '<b>Spot Name</b> is required.'
            });
            return false;
          }
          if (!vm.validateFields(vm.survey)) {
            return false;
          }
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
      }
      return true;
    }
  }
}());
