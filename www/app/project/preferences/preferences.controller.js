(function () {
  'use strict';

  angular
    .module('app')
    .controller('PreferencesController', PreferencesController);

  PreferencesController.$inject = ['$location', '$log', '$rootScope', '$scope', '$timeout', 'FormFactory',
    'HelpersFactory', 'LiveDBFactory', 'ProjectFactory', 'SpotFactory', 'IS_WEB'];

  function PreferencesController($location, $log, $rootScope, $scope, $timeout, FormFactory, HelpersFactory,
                                 LiveDBFactory, ProjectFactory, SpotFactory, IS_WEB) {
    var vm = this;

    var initializing = true;

    vm.currentSpot = SpotFactory.getCurrentSpot();
    vm.data = {};
    vm.dataChanged = false;
    vm.pristine = true;

    vm.submit = submit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      if (_.isEmpty(ProjectFactory.getCurrentProject())) $location.path('app/manage-project');
      else {
        FormFactory.setForm('preferences');
        vm.data = ProjectFactory.getPreferences();
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
          if (vm.dataChanged && fromState.name === 'app.preferences') submit();
        });
      }
    }

    /**
     * Public Functions
     */

    function submit(toPath) {
      vm.data = HelpersFactory.cleanObj(vm.data);
      var valid = FormFactory.validate(vm.data);
      if (valid) {
        ProjectFactory.saveProjectItem('preferences', vm.data).then(function () {
          $log.log('Save Project to LiveDB Here.', ProjectFactory.getCurrentProject());
          LiveDBFactory.save(null, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
          vm.dataChanged = false;
          if (toPath) $location.path(toPath);
        });
      }
    }
  }
}());
