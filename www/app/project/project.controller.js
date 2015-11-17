(function () {
  'use strict';

  angular
    .module('app')
    .controller('ProjectController', ProjectController);

  ProjectController.$inject = ['$log', '$http', '$scope', 'DataModelsFactory', 'FormFactory', 'ProjectFactory'];

  function ProjectController($log, $http, $scope, DataModelsFactory, FormFactory, ProjectFactory) {
    var vm = this;
    var csvFile = 'app/data-models/ProjectsPage.csv';

    vm.data = {};
    vm.dataOriginal = {};
    vm.isPristine = isPristine;
    vm.isValid = isValid;
    vm.pristine = true;
    vm.showField = showField;
    vm.survey = [];
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
      ProjectFactory.all().then(function (data) {
        // Convert date string to Date type
        if (data.start_date) data.start_date = new Date(data.start_date);
        if (data.end_date) data.end_date = new Date(data.end_date);
        ProjectFactory.setProjectName(data.project_name);
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
        ProjectFactory.setProjectName(vm.data.project_name);
        ProjectFactory.save(vm.data);
        vm.dataOriginal = vm.data;
      }
    }
  }
}());
