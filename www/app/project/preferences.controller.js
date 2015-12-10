(function () {
  'use strict';

  angular
    .module('app')
    .controller('PreferencesController', PreferencesController);

  PreferencesController.$inject = ['$ionicSideMenuDelegate', '$scope', 'FormFactory', 'PreferencesFactory'];

  function PreferencesController($ionicSideMenuDelegate, $scope, FormFactory, PreferencesFactory) {
    var vm = this;

    vm.data = {};
    vm.dataOriginal = {};
    vm.isPristine = isPristine;
    vm.isValid = isValid;
    vm.pristine = true;
    vm.showField = showField;
    vm.survey = [];
    vm.toggleAcknowledgeChecked = toggleAcknowledgeChecked;
    vm.submit = submit;
    vm.valid = true;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.survey = PreferencesFactory.getSurvey();
      vm.data = PreferencesFactory.getPreferencesData();
      vm.dataOriginal = vm.data;

      // Watch whether form has been modified or not
      $scope.$watch('vm.isPristine()', function (pristine) {
        vm.pristine = pristine;
      });

      // Watch whether form is valid
      $scope.$watch('vm.isValid()', function (valid) {
        vm.valid = valid;
      });
    }

    function isPristine() {
      vm.data = _.pick(vm.data, _.identity);
      return _.isEqual(vm.dataOriginal, vm.data);
    }

    function isValid() {
      return !$scope.straboForm.$invalid;
    }

    /**
     * Public Functions
     */

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function submit() {
      var valid = FormFactory.validate(vm.survey, vm.data);
      if (valid) {
        PreferencesFactory.save(vm.data);
        vm.dataOriginal = vm.data;
        $ionicSideMenuDelegate.toggleLeft();
      }
    }

    function toggleAcknowledgeChecked(field) {
      vm.data = FormFactory.toggleAcknowledgeChecked(vm.data, field);
    }
  }
}());
