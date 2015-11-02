(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotTabCustomController', SpotTabCustomController);

  SpotTabCustomController.$inject = ['$scope', '$stateParams', '$ionicPopup', '$log'];

  function SpotTabCustomController($scope, $stateParams, $ionicPopup, $log) {
    var vm = this;
    var vmParent = $scope.vm;
    vmParent.load($stateParams);  // Need to load current state into parent

    $log.log('inside spot tab custom Controller');

    vm.createCustomField = function () {
      var errorMsg;
      // Check that both a field name and value has been entered
      if (!vm.customField) {
        errorMsg = 'You must enter a field name and field value.';
      }
      else if (!vm.customField.name) {
        errorMsg = 'You must enter a field name.';
      }
      else if (!vm.customField.value) {
        errorMsg = 'You must enter a field value.';
      }
      else {
        if (!vmParent.spot.properties.custom) {
          vmParent.spot.properties.custom = {};
        }
        // Check if the field name already exists in properties.custom
        if (vmParent.spot.properties.custom[vm.customField.name]) {
          errorMsg = 'The field name <b>' + vm.customField.name + '</b> is already being used. Choose a different custom field name.';
        }
      }

      if (errorMsg) {
        $ionicPopup.alert({
          'title': 'Alert!',
          'template': errorMsg
        });
        return;
      }

      vmParent.spot.properties.custom[vm.customField.name] = vm.customField.value;
      vm.customField.name = undefined;
      vm.customField.value = undefined;
    };

    vm.deleteCustomField = function (key) {
      vmParent.spot.properties.custom = _.omit(vmParent.spot.properties.custom, key);
    };
  }
}());
