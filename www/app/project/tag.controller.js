(function () {
  'use strict';

  angular
    .module('app')
    .controller('TagController', TagController);

  TagController.$inject = ['$location', '$log', '$state', 'DataModelsFactory', 'FormFactory', 'ProjectFactory'];

  function TagController($location, $log, $state, DataModelsFactory, FormFactory, ProjectFactory) {
    var vm = this;

    vm.choices = [];
    vm.data = {};
    vm.go = go;
    vm.showField = showField;
    vm.survey = [];

    activate();

    /**
     * Private Functions
     */

    function activate() {
      loadTag();
      vm.survey = DataModelsFactory.getDataModel('tag').survey;
      vm.choices = DataModelsFactory.getDataModel('tag').choices;
    }

    function loadTag() {
      var id = $state.params.tag_id;
      vm.data = ProjectFactory.getTag(id);
      vm.data.id = id;  // Just in case vm.tag is undefined
      $log.log(vm.data);
    }

    /**
     * Public Functions
     */

    function go(path) {
      if (Object.keys(vm.data).length > 1) {
        var valid = FormFactory.validate(vm.survey, vm.data);
        if (valid) {
          ProjectFactory.saveTag(vm.data).then(function () {
            $location.path(path);
          });
        }
      }
      else $location.path(path);
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }
  }
}());
