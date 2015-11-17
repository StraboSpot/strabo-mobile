(function () {
  'use strict';

  angular
    .module('app')
    .controller('PreferencesController', PreferencesController);

  PreferencesController.$inject = ['$log', '$scope', 'DataModelsFactory', 'FormFactory', 'PreferencesFactory'];

  function PreferencesController($log, $scope, DataModelsFactory, FormFactory, PreferencesFactory) {
    var vm = this;
    var csvFile = 'app/data-models/Preferences.csv';

    vm.data = {};
    vm.dataOriginal = {};
    vm.isPristine = isPristine;
    vm.isValid = isValid;
    vm.pristine = true;
    vm.showField = showField;
    vm.survey = [];
    vm.toggleChecked = toggleChecked;
    vm.submit = submit;
    vm.valid = true;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      DataModelsFactory.readCSV(csvFile, setSurvey);
      getData();

      // Watch whether form has been modified or not
      $scope.$watch('vm.isPristine()', function (pristine) {
        vm.pristine = pristine;
      });

      // Watch whether form is valid
      $scope.$watch('vm.isValid()', function (valid) {
        vm.valid = valid;
        $log.log('valid ', valid);
      });
    }

    function isPristine() {
      vm.data = _.pick(vm.data, _.identity);
      return _.isEqual(vm.dataOriginal, vm.data);
    }

    function isValid() {
      return !$scope.straboForm.$invalid;
    }

    function getData() {
      PreferencesFactory.all().then(function (data) {
        vm.dataOriginal = data;
        vm.data = data;
        $log.log(data);
      });
    }

    function setSurvey(survey) {
      vm.survey = survey;
      $log.log('Survey: ', vm.survey);
    }

    /**
     * Public Functions
     */

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(relevant) {
      return FormFactory.isRelevant(relevant, vm.data);
    }

    function submit() {
      var valid = FormFactory.validate(vm.survey, vm.data);
      if (valid) {
        PreferencesFactory.save(vm.data);
        vm.dataOriginal = vm.data;
      }
    }

    function toggleChecked(field) {
      if (vm.data[field]) {
        delete vm.data[field];
      }
      else {
        vm.data[field] = true;
      }
    }
  }
}());
