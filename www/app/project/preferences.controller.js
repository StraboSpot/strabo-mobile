(function () {
  'use strict';

  angular
    .module('app')
    .controller('PreferencesController', PreferencesController);

  PreferencesController.$inject = ['$location', 'DataModelsFactory', 'FormFactory', 'ProjectFactory', 'SpotFactory'];

  function PreferencesController($location, DataModelsFactory, FormFactory, ProjectFactory, SpotFactory) {
    var vm = this;

    vm.currentSpot = SpotFactory.getCurrentSpot();
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
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        vm.survey = DataModelsFactory.getDataModel('preferences').survey;
        vm.data = ProjectFactory.getPreferences();
      }
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

    function submit(toPath) {
      var valid = FormFactory.validate(vm.survey, vm.data);
      if (valid) {
        ProjectFactory.saveProjectItem('preferences', vm.data).then(function () {
          if (toPath) $location.path(toPath);
        });
      }
    }

    function toggleAcknowledgeChecked(field) {
      vm.data = FormFactory.toggleAcknowledgeChecked(vm.data, field);
    }
  }
}());
