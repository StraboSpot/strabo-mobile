(function () {
  'use strict';

  angular
    .module('app')
    .controller('DescriptionController', DescriptionController);

  DescriptionController.$inject = ['$ionicModal', '$ionicPopup', '$location', '$log', '$rootScope', '$scope',
    '$timeout', 'FormFactory', 'LiveDBFactory', 'ProjectFactory', 'IS_WEB'];

  function DescriptionController($ionicModal, $ionicPopup, $location, $log, $rootScope, $scope, $timeout, FormFactory,
                                 LiveDBFactory, ProjectFactory, IS_WEB) {
    var vm = this;

    var initializing = true;

    vm.dailySetup = {'date': new Date(), 'notes': ''};
    vm.data = {};
    vm.dataChanged = false;
    vm.descriptionModal = {};
    vm.isNewProject = null;
    vm.valid = true;

    vm.closeModal = closeModal;
    vm.deleteDailySetup = deleteDailySetup;
    vm.showDailySetupModal = showDailySetupModal;
    vm.showDescriptionModal = showDescriptionModal;
    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        FormFactory.setForm('project');
        vm.data = ProjectFactory.getCurrentProject().description;
        fixDates();
        createModals();
      }

      if (IS_WEB) {
        $scope.$watch('vm.data', function (newValue, oldValue, scope) {
          if (!_.isEmpty(newValue)) {
            if (initializing) {
              vm.dataChanged = false;
              $timeout(function () {
                initializing = false;
              });
            }
            else {
              //$log.log('CHANGED vm.data', 'new value', newValue, 'oldValue', oldValue);
              vm.dataChanged = true;
            }
          }
        }, true);

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
          if (vm.dataChanged && fromState.name === 'app.description') submit();
        });
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
        var valid = FormFactory.validate(vm.data);
        if (valid) vm[modal].hide();
      }
    }

    function deleteDailySetup(i) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Daily Setup',
        'template': 'Are you sure you want to delete this Daily Setup?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vm.data.daily_setup.splice(i, 1);
          if (_.isEmpty(vm.data.daily_setup)) delete vm.data.daily_setup;
        }
      });
    }

    function showDailySetupModal(setup) {
      if (setup) {
        if (setup.date) setup.date = new Date(setup.date);
        vm.dailySetup = setup;
      }
      else {
        vm.dailySetup.date = new Date();
        vm.dailySetup.date.setMilliseconds(0);
        vm.dailySetup.notes = '';
      }
      vm.dailySetupModal.show();
    }

    function showDescriptionModal() {
      vm.descriptionModal.show();
    }

    function submit() {
      ProjectFactory.saveProjectItem('description', vm.data).then(function () {
        //Project modified_timestamp isn't getting set here... need to fix
        ProjectFactory.setModifiedTimestamp();
        $log.log('Save project changes to liveDB:', ProjectFactory.getCurrentProject());
        LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
        vm.dataChanged = false;
      });
    }
  }
}());
