angular
  .module('app')
  .controller('SpotTabCustomCtrl', function ($scope,
                                             $ionicPopup,
                                             $log) {
    $log.log('inside spot tab custom ctrl');

    $scope.createCustomField = function () {
      var errorMsg;
      // Check that both a field name and value has been entered
      if (!this.customField) {
        errorMsg = 'You must enter a field name and field value.';
      }
      else if (!this.customField.name) {
        errorMsg = 'You must enter a field name.';
      }
      else if (!this.customField.value) {
        errorMsg = 'You must enter a field value.';
      }
      else {
        if (!$scope.spot.properties.custom) {
          $scope.spot.properties.custom = {};
        }
        // Check if the field name already exists in properties.custom
        if ($scope.spot.properties.custom[this.customField.name]) {
          errorMsg = 'The field name <b>' + this.customField.name + '</b> is already being used. Choose a different custom field name.';
        }
      }

      if (errorMsg) {
        $ionicPopup.alert({
          'title': 'Alert!',
          'template': errorMsg
        });
        return;
      }

      $scope.spot.properties.custom[this.customField.name] = this.customField.value;
      this.customField.name = undefined;
      this.customField.value = undefined;
    };

    $scope.deleteCustomField = function (key) {
      $scope.spot.properties.custom = _.omit($scope.spot.properties.custom, key);
    };
  });
