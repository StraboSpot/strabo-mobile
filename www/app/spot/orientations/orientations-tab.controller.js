(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationsTabController', OrientationsTabController);

  OrientationsTabController.$inject = ['$cordovaDeviceMotion', '$cordovaDeviceOrientation', '$ionicModal',
    '$ionicPopup', '$log', '$scope', '$state', 'DataModelsFactory', 'FormFactory', 'HelpersFactory', 'ProjectFactory'];

  function OrientationsTabController($cordovaDeviceMotion, $cordovaDeviceOrientation, $ionicModal, $ionicPopup, $log,
                                        $scope, $state, DataModelsFactory, FormFactory, HelpersFactory,
                                        ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    var isCancelOrAccept = false;
    var watchDeviceAcceleration = {};

    vm.basicFormModal = {};
    vm.compassData = {};
    vm.compassModal = {};
    vm.error = {};
    vm.modalTitle = '';
    vm.msgText = '';
    vm.parentOrientation = {};
    vm.result = {};

    vm.acceptCompass = acceptCompass;
    vm.addAssociatedOrientation = addAssociatedOrientation;
    vm.addOrientation = addOrientation;
    vm.closeCompass = closeCompass;
    vm.copyAssociatedOrientation = copyAssociatedOrientation;
    vm.copyOrientation = copyOrientation;
    vm.deleteAssociatedOrientation = deleteAssociatedOrientation;
    vm.deleteOrientation = deleteOrientation;
    vm.editAssociatedOrientation = editAssociatedOrientation;
    vm.editOrientation = editOrientation;
    vm.getCompassInfo = getCompassInfo;
    vm.openCompass = openCompass;
    vm.pause = pause;
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('Orientation Data:', vmParent.spot.properties.orientation_data);
      checkProperties();
      createModals();
    }

    function assignProperties(item) {
      if (!item.label) item.label = item.name || createDefaultLabel(item);
      if (!item.id) item.id = HelpersFactory.getNewId();
      if (!item.type) item.type = item.orientation_type || 'planar_orientation';
    }

    function calculateOrientation() {
      var x = vm.result.x;
      var y = vm.result.y;
      var z = vm.result.z;
      var magneticHeading = vm.result.magneticHeading;

      // Calculate base values given the x, y, and z from the device. The x-axis runs side-to-side across
      // the mobile phone screen, or the laptop keyboard, and is positive towards the right side. The y-axis
      // runs front-to-back across the mobile phone screen, or the laptop keyboard, and is positive towards as
      // it moves away from you. The z-axis comes straight up out of the mobile phone screen, or the laptop
      // keyboard, and is positive as it moves up.
      // All results in this section are in radians
      var g = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
      var s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      var B = Math.acos(Math.abs(y) / s);
      var R = HelpersFactory.toRadians(90 - HelpersFactory.toDegrees(B));
      var d = Math.acos(Math.abs(z) / g);
      var b = Math.atan(Math.tan(R) * Math.cos(d));

      // Calculate dip direction, strike and dip (in degrees)
      var dipdir, strike, dip;
      var diry = magneticHeading;
      if (x === 0 && y === 0) {
        d = 0;
        dipdir = 180;
      }
      else if (x >= 0 && y >= 0) dipdir = diry - 90 - HelpersFactory.toDegrees(b);
      else if (y <= 0 && x >= 0) dipdir = diry - 90 + HelpersFactory.toDegrees(b);
      else if (y <= 0 && x <= 0) dipdir = diry + 90 - HelpersFactory.toDegrees(b);
      else if (x <= 0 && y >= 0) dipdir = diry + 90 + HelpersFactory.toDegrees(b);
      dipdir = HelpersFactory.mod(dipdir, 360);
      strike = HelpersFactory.mod(dipdir - 90, 360);
      dip = HelpersFactory.toDegrees(d);

      // Calculate trend, plunge and rake (in degrees)
      var trend, plunge, rake;
      if (y > 0) trend = HelpersFactory.mod(diry + 180, 360);
      if (y <= 0) trend = diry;
      plunge = HelpersFactory.toDegrees(Math.asin(Math.abs(y) / g));
      rake = HelpersFactory.toDegrees(R);

      if (vmParent.data.type === 'linear_orientation') {
        vm.compassData.trend = HelpersFactory.roundToDecimalPlaces(trend, 2);
        vm.compassData.plunge = HelpersFactory.roundToDecimalPlaces(plunge, 2);
        vm.compassData.rake = HelpersFactory.roundToDecimalPlaces(rake, 2);
        vm.compassData.rake_calculated = 'yes';
      }
      else {
        vm.compassData.strike = HelpersFactory.roundToDecimalPlaces(strike, 2);
        vm.compassData.dipdir = HelpersFactory.roundToDecimalPlaces(dipdir, 2);
        vm.compassData.dip = HelpersFactory.roundToDecimalPlaces(dip, 2);
      }
    }

    function checkProperties() {
      _.each(vmParent.spot.properties.orientation_data, function (orientation) {
        assignProperties(orientation);
        _.each(orientation.associated_orientation, function (associated_orientation) {
          assignProperties(associated_orientation);
        });
      });
    }

    function copyFeatureTags(feature, copy) {
      _.each(vmParent.featureLevelTags, function (tag) {
        var features = tag.features[vmParent.spot.properties.id];
        if (_.contains(features, feature.id)) tag.features[vmParent.spot.properties.id].push(copy.id);
        ProjectFactory.saveTag(tag);
      });
    }

    function createDefaultLabel(orientationToLabel) {
      var label = DataModelsFactory.getFeatureTypeLabel(orientationToLabel.feature_type);
      if (!label && orientationToLabel.type) label = orientationToLabel.type.split('_')[0] + ' feature';
      if (orientationToLabel.strike) label += ' ' + orientationToLabel.strike.toString();
      else if (orientationToLabel.trend) label += ' ' + orientationToLabel.trend.toString();
      return label;
    }

    function createModals() {
      $ionicModal.fromTemplateUrl('app/spot/basic-form-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.basicFormModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/spot/orientations/compass-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.compassModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.basicFormModal.remove();
        vm.compassModal.remove();
      });
    }

    function getModalTitlePart() {
      if (vmParent.data.type === 'linear_orientation') return 'Line';
      if (vmParent.data.type === 'planar_orientation') return 'Plane';
      if (vmParent.data.type === 'tabular_orientation') return 'Tabular Zone';
    }

    /**
     * Public Functions
     */

    function acceptCompass() {
      isCancelOrAccept = true;
      if (vmParent.data.type === 'linear_orientation' &&
        vm.compassData.trend && vm.compassData.plunge && vm.compassData.rake) {
        vmParent.data.trend = vm.compassData.trend;
        vmParent.data.plunge = vm.compassData.plunge;
        vmParent.data.rake = vm.compassData.rake;
        vmParent.data.rake_calculated = 'yes';
      }
      else if (vm.compassData.strike && vm.compassData.dipdir && vm.compassData.dip) {
        vmParent.data.strike = vm.compassData.strike;
        vmParent.data.dip_direction = vm.compassData.dipdir;
        vmParent.data.dip = vm.compassData.dip;
      }
      if (!_.isEmpty(watchDeviceAcceleration)) {
        watchDeviceAcceleration.clearWatch();
        watchDeviceAcceleration = {};
      }
      vm.compassModal.hide();
    }

    function addAssociatedOrientation(parentThisOrientation, type) {
      vm.parentOrientation = parentThisOrientation;
      vmParent.survey = DataModelsFactory.getDataModel('orientation_data')[type].survey;
      vmParent.choices = DataModelsFactory.getDataModel('orientation_data')[type].choices;
      vmParent.data = {};
      vmParent.data.type = type;
      vmParent.data.id = HelpersFactory.getNewId();
      vm.modalTitle = 'Add a ' + getModalTitlePart();
      vm.basicFormModal.show();
    }

    function addOrientation(type) {
      vm.parentOrientation = undefined;
      vmParent.survey = DataModelsFactory.getDataModel('orientation_data')[type].survey;
      vmParent.choices = DataModelsFactory.getDataModel('orientation_data')[type].choices;
      vmParent.data = {};
      vmParent.data.type = type;
      vmParent.data.id = HelpersFactory.getNewId();
      vm.modalTitle = 'Add a ' + getModalTitlePart();
      vm.basicFormModal.show();
    }

    function closeCompass() {
      isCancelOrAccept = true;
      if (!_.isEmpty(watchDeviceAcceleration)) {
        watchDeviceAcceleration.clearWatch();
        watchDeviceAcceleration = {};
      }
      vm.compassModal.hide();
    }

    function copyAssociatedOrientation(parentThisOrientation, orientation) {
      var copy = angular.fromJson(angular.toJson(orientation));
      copy = _.omit(copy, ['id', 'strike', 'dip_direction', 'dip', 'trend', 'plunge', 'rake', 'rake_calculated']);
      copy.label = copy.label + 'Copy';
      copy.id = HelpersFactory.getNewId();
      parentThisOrientation.associated_orientation.push(copy);
    }

    function copyOrientation(orientation) {
      var copy = angular.fromJson(angular.toJson(orientation));
      copy = _.omit(copy, ['id', 'strike', 'dip_direction', 'dip', 'trend', 'plunge', 'rake', 'rake_calculated']);
      copy.id = HelpersFactory.getNewId();
      copy.label = copy.label + 'Copy';
      _.each(copy.associated_orientation, function (associatedOrientation, i) {
        copy.associated_orientation[i] = _.omit(associatedOrientation,
          ['id', 'strike', 'dip_direction', 'dip', 'trend', 'plunge', 'rake', 'rake_calculated']);
        copy.associated_orientation[i].label = associatedOrientation.label + 'Copy';
        copy.associated_orientation[i].id = HelpersFactory.getNewId();
      });
      vmParent.spot.properties.orientation_data.push(copy);
      copyFeatureTags(orientation, copy);
    }

    function deleteAssociatedOrientation(parentThisOrientation, orientationToDelete) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Associated Orientation',
        'template': 'Are you sure you want to delete this  associated orientation?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          parentThisOrientation.associated_orientation = _.reject(parentThisOrientation.associated_orientation,
            function (associatedOrientation) {
              return associatedOrientation.id === orientationToDelete.id;
            });
          if (parentThisOrientation.associated_orientation === 0) delete parentThisOrientation.associated_orientation;
        }
      });
    }

    function deleteOrientation(orientationToDelete) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Orientation',
        'template': 'Are you sure you want to delete this orientation?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.orientation_data = _.reject(vmParent.spot.properties.orientation_data,
            function (orientation) {
              return orientation.id === orientationToDelete.id;
            });
          if (vmParent.spot.properties.orientation_data === 0) delete vmParent.spot.properties.orientation_data;
          ProjectFactory.removeFeatureFromTags(vmParent.spot.properties.id, orientationToDelete.id);
        }
      });
    }

    function editAssociatedOrientation(parentThisOrientation, orientationToEdit) {
      vm.parentOrientation = parentThisOrientation;
      vmParent.data = angular.fromJson(angular.toJson(orientationToEdit));  // Copy value, not reference
      vmParent.survey = DataModelsFactory.getDataModel('orientation_data')[vmParent.data.type].survey;
      vmParent.choices = DataModelsFactory.getDataModel('orientation_data')[vmParent.data.type].choices;
      vm.modalTitle = 'Edit ' + getModalTitlePart();
      vm.basicFormModal.show();
    }

    function editOrientation(orientationToEdit) {
      vm.parentOrientation = undefined;
      vmParent.data = angular.fromJson(angular.toJson(orientationToEdit));  // Copy value, not reference
      vmParent.survey = DataModelsFactory.getDataModel('orientation_data')[vmParent.data.type].survey;
      vmParent.choices = DataModelsFactory.getDataModel('orientation_data')[vmParent.data.type].choices;
      vm.modalTitle = 'Edit ' + getModalTitlePart();
      vm.basicFormModal.show();
    }

    function getCompassInfo() {
      isCancelOrAccept = false;
      var options = {frequency: 1000};
      if (navigator.accelerometer) {
        watchDeviceAcceleration = $cordovaDeviceMotion.watchAcceleration(options);
        watchDeviceAcceleration.then(
          null,
          function (err) {
            vm.error.acceleration = err;
          },
          function (accelerationResult) {
            vm.result.x = accelerationResult.x;
            vm.result.y = accelerationResult.y;
            vm.result.z = accelerationResult.z;
            $cordovaDeviceOrientation.getCurrentHeading().then(function (headingResult) {
              vm.result.magneticHeading = headingResult.magneticHeading;
              if (vm.result.magneticHeading && vm.result.x && vm.result.y && vm.result.z) {
                calculateOrientation();
              }
            }, function (err) {
              vm.error.compass = err;
            });
          });
      }
      else vm.error.both = "No compass or accelerometer on this device.";
    }

    function pause() {
      if (!isCancelOrAccept) {
        if (_.isEmpty(watchDeviceAcceleration)) getCompassInfo();
        else {
          watchDeviceAcceleration.clearWatch();
          watchDeviceAcceleration = {};
        }
      }
    }

    function openCompass() {
      vm.msgText = '';
      vm.compassModal.show();
      getCompassInfo();
    }

    function submit() {
      if (_.size(vmParent.data) <= 2) {
        // If not more than type and id fields no data has been entered so don't continue, just close modal
        vmParent.data = {};
        vm.parentOrientation = undefined;
        vm.basicFormModal.hide();
        vmParent.survey = undefined;
        vmParent.choices = undefined;
        return;
      }
      if (!vmParent.data.label) vmParent.data.label = createDefaultLabel(vmParent.data);
      if (FormFactory.validate(vmParent.survey, vmParent.data)) {
        if (!vm.parentOrientation) {
          if (!vmParent.spot.properties.orientation_data) vmParent.spot.properties.orientation_data = [];
          vmParent.spot.properties.orientation_data = _.reject(vmParent.spot.properties.orientation_data,
            function (orientation) {
              return orientation.id === vmParent.data.id;
            });
          vmParent.spot.properties.orientation_data.push(vmParent.data);
        }
        else {
          if (!vm.parentOrientation.associated_orientation) vm.parentOrientation.associated_orientation = [];
          vm.parentOrientation.associated_orientation = _.reject(vm.parentOrientation.associated_orientation,
            function (associatedOrientation) {
              return associatedOrientation.id === vmParent.data.id;
            });
          vm.parentOrientation.associated_orientation.push(vmParent.data);
          vmParent.spot.properties.orientation_data = _.reject(vmParent.spot.properties.orientation_data,
            function (orientation) {
              return orientation.id === vm.parentOrientation.id;
            });
          vmParent.spot.properties.orientation_data.push(vm.parentOrientation);
        }
        vmParent.data = {};
        vm.basicFormModal.hide();
        vmParent.survey = undefined;
        vmParent.choices = undefined;
      }
    }
  }
}());
