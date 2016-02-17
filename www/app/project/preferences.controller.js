(function () {
  'use strict';

  angular
    .module('app')
    .controller('PreferencesController', PreferencesController);

  PreferencesController.$inject = ['$ionicSideMenuDelegate', 'DataModelsFactory', 'FormFactory', 'PreferencesFactory'];

  function PreferencesController($ionicSideMenuDelegate, DataModelsFactory, FormFactory, PreferencesFactory) {
    var vm = this;

    vm.data = {};
    vm.pristine = true;
    vm.showField = showField;
    vm.survey = [];
    vm.toggleAcknowledgeChecked = toggleAcknowledgeChecked;
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      vm.survey = DataModelsFactory.getDataModel('preferences').survey;
      vm.data = PreferencesFactory.getPreferencesData();
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
