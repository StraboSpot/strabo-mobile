(function () {
  'use strict';

  angular
    .module('app')
    .controller('ProjectController', ProjectController);

  ProjectController.$inject = ['$log', '$http', '$scope', 'FormFactory', 'ProjectFactory'];

  function ProjectController($log, $http, $scope, FormFactory, ProjectFactory) {
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
      readCSV();
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

    // Remove objects created without a label and name (that is objects created from blank lines
    // as well as the default start and end objects)
    function cleanJson(json) {
      $log.log('Parsed csv: ', json);
      vm.survey = _.filter(json.data, function (obj) {
        return obj.name && obj.label;
      });
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

    // Read the CSV file
    function readCSV() {
      $http.get(
        csvFile, {
          'transformResponse': function (csv) {
            Papa.parse(csv, {
              'header': true,
              'complete': cleanJson
            });
          }
        });
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
