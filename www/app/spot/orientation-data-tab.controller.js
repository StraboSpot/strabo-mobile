(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationDataTabController', OrientationDataTabController);

  OrientationDataTabController.$inject = ['$cordovaDeviceMotion', '$cordovaDeviceOrientation', '$ionicModal',
    '$ionicPopup', '$log', '$q', '$scope', '$state', 'DataModelsFactory', 'FormFactory', 'HelpersFactory',
    'ProjectFactory'];

  function OrientationDataTabController($cordovaDeviceMotion, $cordovaDeviceOrientation, $ionicModal, $ionicPopup, $log,
                                        $q, $scope, $state, DataModelsFactory, FormFactory, HelpersFactory,
                                        ProjectFactory) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.loadTab($state);  // Need to load current state into parent

    vm.addAssociatedOrientation = addAssociatedOrientation;
    vm.addOrientation = addOrientation;
    vm.basicFormModal = {};
    vm.copyAssociatedOrientation = copyAssociatedOrientation;
    vm.copyOrientation = copyOrientation;
    vm.deleteAssociatedOrientation = deleteAssociatedOrientation;
    vm.deleteOrientation = deleteOrientation;
    vm.editAssociatedOrientation = editAssociatedOrientation;
    vm.editOrientation = editOrientation;
    vm.getCompassInfo = getCompassInfo;
    vm.modalTitle = '';
    vm.parentOrientation = {};
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      $log.log('Orientation Data:', vmParent.spot.properties.orientation_data);
      checkProperties();
      createModal();
    }

    function assignProperties(item) {
      if (!item.label) item.label = item.name || createDefaultLabel(item);
      if (!item.id) item.id = HelpersFactory.newId();
      if (!item.type) item.type = item.orientation_type || 'planar_orientation';
    }

    function calculateOrientation(magneticHeading, x, y, z) {
      var g = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
      var s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      var B = Math.acos(Math.abs(y) / s);
      var R = 90 - B;
      var d = Math.acos(Math.abs(z) / g);
      var b = Math.atan(Math.tan(R) * Math.cos(d));
      var dipdir;
      var diry = magneticHeading;

      if (x === 0 && y === 0) {
        d = 0;
        dipdir = 180;
      }
      else if (x >= 0 && y >= 0) dipdir = diry - 90 - b;
      else if (y <= 0 && x >= 0) dipdir = diry - 90 + b;
      else if (y <= 0 && x <= 0) dipdir = diry + 90 - b;
      else if (x <= 0 && y >= 0) dipdir = diry + 90 + b;

      var strike = dipdir - 90;
      strike = strike % 360;
      dipdir = dipdir % 360;
      var dip = d;
      var trend = diry;
      var plunge = Math.acos(Math.abs(y) / g);
      var rake = R;

      if (vmParent.data.type === 'linear_orientation') {
        vmParent.data.trend = Math.round(trend * 1000) / 1000;
        vmParent.data.plunge = Math.round(plunge * 1000) / 1000;
        vmParent.data.rake = Math.round(rake * 1000) / 1000;
        vmParent.data.rake_calculated = 'yes';
      }
      else {
        vmParent.data.strike = Math.round(strike * 1000) / 1000;
        vmParent.data.dip_direction = Math.round(dipdir * 1000) / 1000;
        vmParent.data.dip = Math.round(dip * 1000) / 1000;
      }

      return {
        'strike': vmParent.data.strike, 'dipdir': vmParent.data.dip_direction, 'dip': vmParent.data.dip,
        'trend': vmParent.data.trend, 'plunge': vmParent.data.plunge, 'rake': vmParent.data.rake
      };
    }

    function checkProperties() {
      _.each(vmParent.spot.properties.orientation_data, function (orientation) {
        assignProperties(orientation);
        _.each(orientation.associated_orientation, function (associated_orientation) {
          assignProperties(associated_orientation);
        });
      });
    }

    function createDefaultLabel(orientationToLabel) {
      var label = DataModelsFactory.getFeatureTypeLabel(orientationToLabel.feature_type);
      if (!label && orientationToLabel.type) label = orientationToLabel.type.split('_')[0] + ' feature';
      if (orientationToLabel.strike) label += ' ' + orientationToLabel.strike.toString();
      else if (orientationToLabel.trend) label += ' ' + orientationToLabel.trend.toString();
      return label;
    }

    function createModal() {
      $ionicModal.fromTemplateUrl('app/spot/basic-form-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'focusFirstInput': true,
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.basicFormModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.basicFormModal.remove();
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

    function addAssociatedOrientation(parentThisOrientation, type) {
      vm.parentOrientation = parentThisOrientation;
      vmParent.survey = DataModelsFactory.getDataModel('orientation_data')[type].survey;
      vmParent.choices = DataModelsFactory.getDataModel('orientation_data')[type].choices;
      vmParent.data = {};
      vmParent.data.type = type;
      vmParent.data.id = HelpersFactory.newId();
      vm.modalTitle = 'Add a ' + getModalTitlePart();
      vm.basicFormModal.show();
    }

    function addOrientation(type) {
      vm.parentOrientation = undefined;
      vmParent.survey = DataModelsFactory.getDataModel('orientation_data')[type].survey;
      vmParent.choices = DataModelsFactory.getDataModel('orientation_data')[type].choices;
      vmParent.data = {};
      vmParent.data.type = type;
      vmParent.data.id = HelpersFactory.newId();
      vm.modalTitle = 'Add a ' + getModalTitlePart();
      vm.basicFormModal.show();
    }

    function copyAssociatedOrientation(parentThisOrientation, orientation) {
      var copy = angular.copy(orientation);
      delete copy.id;
      assignProperties(copy);
      parentThisOrientation.associated_orientation.push(copy);
    }

    function copyOrientation(orientation) {
      var copy = angular.copy(orientation);
      delete copy.id;
      _.each(copy.associated_orientation, function (associatedOrientation) {
        delete associatedOrientation.id;
        assignProperties(associatedOrientation);
      });
      assignProperties(copy);
      vmParent.spot.properties.orientation_data.push(copy);
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
      var promises = [];
      var promise;
      var msgText = '';
      var magneticHeading, x, y, z;

      promise = $cordovaDeviceOrientation.getCurrentHeading().then(function (result) {
        magneticHeading = result.magneticHeading;
        msgText += 'Magnetic Heading = ' + magneticHeading + '<br>';
      }, function (err) {
        msgText += 'Compass Error: ' + err + '<br>';
        $log.log(err);
      });
      promises.push(promise);

      if (navigator.accelerometer) {
        promise = $cordovaDeviceMotion.getCurrentAcceleration().then(function (result) {
          x = result.x;
          y = result.y;
          z = result.z;
          msgText += 'X = ' + x + '<br>';
          msgText += 'Y = ' + y + '<br>';
          msgText += 'Z = ' + z + '<br>';
        }, function (err) {
          msgText = 'Acceleration Error: ' + err + '<br>';
        });
        promises.push(promise);
      }
      else msgText += 'Accelerometer Error: No accelerometer on Device<br>';

      $q.all(promises).then(function () {
        if (magneticHeading && x && y && z) {
          var orientation = calculateOrientation(magneticHeading, x, y, z);
          if (vmParent.data.type === 'linear_orientation') {
            msgText += 'Trend = ' + orientation.trend + '<br>';
            msgText += 'Plunge = ' + orientation.plunge + '<br>';
            msgText += 'Rake = ' + orientation.rake + '<br>';
          }
          else {
            msgText += 'Strike = ' + orientation.strike + '<br>';
            msgText += 'Dip Direction = ' + orientation.dipdir + '<br>';
            msgText += 'Dip = ' + orientation.dip + '<br>';
          }
        }
        $ionicPopup.alert({
          'title': 'Compass & Accelerometer Info',
          'template': msgText
        });
      });
    }

    function submit() {
      if (_.size(vmParent.data) <= 2) {
        // If not more than type and id fields no data has been entered so don't continue, just close modal
        vmParent.data = {};
        vm.parentOrientation = undefined;
        vm.basicFormModal.hide();
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
      }
    }
  }
}());
