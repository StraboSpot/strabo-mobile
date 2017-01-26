(function () {
  'use strict';

  angular
    .module('app')
    .controller('DescriptionController', DescriptionController);

  DescriptionController.$inject = ['$ionicModal', '$ionicPopup', '$location', '$log', '$scope', 'DataModelsFactory',
    'FormFactory', 'LiveDBFactory', 'ProjectFactory'];

  function DescriptionController($ionicModal, $ionicPopup, $location, $log, $scope, DataModelsFactory, FormFactory, LiveDBFactory, ProjectFactory) {
    var vm = this;
    var isDelete = false;

    vm.closeModal = closeModal;
    vm.dailySetup = {'date': new Date(), 'notes': ''};
    vm.data = {};
    vm.deleteDailySetup = deleteDailySetup;
    vm.descriptionModal = {};
    vm.isNewProject = null;
    vm.showDailySetupModal = showDailySetupModal;
    vm.showDescriptionModal = showDescriptionModal;
    vm.showField = showField;
    vm.survey = {};
    vm.submit = submit;
    vm.valid = true;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        vm.survey = DataModelsFactory.getDataModel('project').survey;
        vm.data = ProjectFactory.getCurrentProject().description;
        fixDates();
        createModals();
      }
    }

    function createModals() {
      $ionicModal.fromTemplateUrl('app/project/description/description-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.descriptionModal = modal;
      });

      $ionicModal.fromTemplateUrl('app/project/description/daily-setup-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.dailySetupModal = modal;
      });
    }

    // Convert date string to Date type
    function fixDates() {
      if (vm.data.start_date) vm.data.start_date = new Date(vm.data.start_date);
      if (vm.data.end_date) vm.data.end_date = new Date(vm.data.end_date);
    }

    /**
     * Public Functions
     */

    function closeModal(modal) {
      if (modal === 'dailySetupModal') {
        vm[modal].hide();
        if (vm.dailySetup.notes) {
          if (!vm.data.daily_setup) vm.data.daily_setup = [];
          var i = _.indexOf(vm.data.daily_setup, vm.dailySetup);
          if (i !== -1) vm.data.daily_setup.splice(i, 1);
          vm.data.daily_setup.push(angular.fromJson(angular.toJson(vm.dailySetup)));
        }
      }
      else {
        var valid = FormFactory.validate(vm.survey, vm.data);
        if (valid){
          vm[modal].hide();
          //Project modified_timestamp isn't getting set here... need to fix
          ProjectFactory.setModifiedTimestamp();
          $log.log('Save project changes to liveDB:', ProjectFactory.getCurrentProject());
          LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
        }
      }
    }

    function deleteDailySetup(i) {
      isDelete = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Daily Setup',
        'template': 'Are you sure you want to delete this Daily Setup?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vm.data.daily_setup.splice(i, 1);
          if (_.isEmpty(vm.data.daily_setup)) delete vm.data.daily_setup;
        }
        isDelete = false;
      });
    }

    function showDailySetupModal(setup) {
      if (!isDelete) {
        if (setup) {
          vm.dailySetup = setup;
        }
        else {
          vm.dailySetup.date = new Date();
          vm.dailySetup.date.setMilliseconds(0);
          vm.dailySetup.notes = '';
        }
        vm.dailySetupModal.show();
      }
    }

    function showDescriptionModal() {
      vm.descriptionModal.show();
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function submit() {
      ProjectFactory.saveProjectItem('description', vm.data);
    }
  }
}());
