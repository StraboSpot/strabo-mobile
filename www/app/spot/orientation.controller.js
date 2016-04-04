(function () {
  'use strict';

  angular
    .module('app')
    .controller('OrientationController', OrientationController);

  OrientationController.$inject = ['$ionicPopover', '$ionicPopup', '$location', '$log', '$q', '$scope', '$state',
    'DataModelsFactory', 'FormFactory', 'SpotFactory'];

  function OrientationController($ionicPopover, $ionicPopup, $location, $log, $q, $scope, $state, DataModelsFactory,
                                 FormFactory, SpotFactory) {
    var vm = this;

    vm.choices = {};
    vm.copyThisOrientation = copyThisOrientation;
    vm.currentSpot = SpotFactory.getCurrentSpot();
    vm.data = {};
    vm.featureTypeLabel = featureTypeLabel;
    vm.isOptionChecked = isOptionChecked;
    vm.newOrientation = newOrientation;
    vm.popover = {};
    vm.returnToSpot = returnToSpot;
    vm.showAssociatedOrientation = showAssociatedOrientation;
    vm.showField = showField;
    vm.survey = {};
    vm.submit = submit;
    vm.title = '';
    vm.toggleChecked = toggleChecked;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      switch ($state.current.name) {
        case 'app.new-linear-orientation':
          vm.survey = DataModelsFactory.getDataModel('orientation_data').linear_orientation.survey;
          vm.choices = DataModelsFactory.getDataModel('orientation_data').linear_orientation.choices;
          vm.title = 'New Linear Orienation';
          vm.data.orientation_type = 'linear_orientation';
          break;
        case 'app.new-planar-orientation':
          vm.survey = DataModelsFactory.getDataModel('orientation_data').planar_orientation.survey;
          vm.choices = DataModelsFactory.getDataModel('orientation_data').planar_orientation.choices;
          vm.title = 'New Planar Orientation';
          vm.data.orientation_type = 'planar_orientation';
          break;
        case 'app.new-tabular-zone-orientation':
          vm.survey = DataModelsFactory.getDataModel('orientation_data').tabular_orientation.survey;
          vm.choices = DataModelsFactory.getDataModel('orientation_data').tabular_orientation.choices;
          vm.title = 'New Tabular Zone Orientation';
          vm.data.orientation_type = 'tabular_zone_orientation';
          break;
        case 'app.orientation':
          var i = SpotFactory.getCurrentOrientationIndex();
          var aI = SpotFactory.getCurrentAssociatedOrientationIndex();
          vm.data = vm.currentSpot.properties.orientation_data[i];
          if (angular.isDefined(aI)) vm.data = vm.data.associated_orientation[aI];
          switch (vm.data.orientation_type) {
            case 'linear_orientation':
              vm.survey = DataModelsFactory.getDataModel('orientation_data').linear_orientation.survey;
              vm.choices = DataModelsFactory.getDataModel('orientation_data').linear_orientation.choices;
              vm.title = 'Linear Orientation';
              break;
            case 'planar_orientation':
              vm.survey = DataModelsFactory.getDataModel('orientation_data').planar_orientation.survey;
              vm.choices = DataModelsFactory.getDataModel('orientation_data').planar_orientation.choices;
              vm.title = 'Planar Orientation';
              break;
            case 'tabular_zone_orientation':
              vm.survey = DataModelsFactory.getDataModel('orientation_data').tabular_orientation.survey;
              vm.choices = DataModelsFactory.getDataModel('orientation_data').tabular_orientation.choices;
              vm.title = 'Tabular Zone Orientation';
              break;
          }
          break;
      }
      createPopover();
    }

    function createPopover() {
      $ionicPopover.fromTemplateUrl('app/spot/orientation-popover.html', {
        'scope': $scope
      }).then(function (popover) {
        vm.popover = popover;
      });

      // Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        vm.popover.remove();
      });
    }

    function doCopy() {
      // Set new index
      var i = SpotFactory.getCurrentOrientationIndex();
      var aI = SpotFactory.getCurrentAssociatedOrientationIndex();
      var iNew = i;
      var aINew;
      if (angular.isDefined(aI)) {
        aINew = vm.currentSpot.properties.orientation_data[i].associated_orientation.length;
      }
      else iNew = vm.currentSpot.properties.orientation_data.length;
      SpotFactory.setCurrentOrientationIndex(iNew, aINew);

      // Copy data
      var copy = angular.copy(vm.data);
      delete copy.name;
      copy.id = Math.floor((new Date().getTime() + Math.random()) * 10);
      if (angular.isDefined(aI)) {
        vm.currentSpot.properties.orientation_data[i].associated_orientation.push(copy);
      }
      else vm.currentSpot.properties.orientation_data.push(copy);

      vm.popover.hide();
      $state.go('app.orientation', {}, {'reload': true});
    }

    /**
     * Public Functions
     */

    function copyThisOrientation() {
      submit().then(doCopy,
        function (err) {
          $ionicPopup.alert({
            'title': 'Unable To Copy!',
            'template': err
          });
          vm.popover.hide();
        });
    }

    function featureTypeLabel(type) {
      return DataModelsFactory.getFeatureTypeLabel(type);
    }

    function isOptionChecked(field, choice) {
      if (vm.data) {
        if (vm.data[field]) {
          return vm.data[field].indexOf(choice) !== -1;
        }
      }
      else {
        return false;
      }
    }

    function newOrientation() {
      $log.log('new');
    }

    function returnToSpot() {
      submit().then(function () {
        $location.path('/app/spotTab/' + vm.currentSpot.properties.id + '/orientation-data');
      }, function () {
        $location.path('/app/spotTab/' + vm.currentSpot.properties.id + '/orientation-data');
      });
    }

    function showAssociatedOrientation() {
      var i = SpotFactory.getCurrentOrientationIndex();
      var aI = SpotFactory.getCurrentAssociatedOrientationIndex();
      if (angular.isDefined(aI) ||
        ((angular.isDefined(i) && (($state.current.name === 'app.new-linear-orientation' ||
        $state.current.name === 'app.new-planar-orientation' ||
        $state.current.name === 'app.new-tabular-zone-orientation'))))) {
        vm.parentOrientation = vm.currentSpot.properties.orientation_data[i];
        if (vm.parentOrientation.strike || vm.parentOrientation.dip_direction || vm.parentOrientation.dip ||
          vm.parentOrientation.trend || vm.parentOrientation.plunge || vm.parentOrientation.feature_type) {
          return true;
        }
      }
      return false;
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field) {
      var show = FormFactory.isRelevant(field.relevant, vm.data);
      if (!show) delete vm.data[field.name];
      return show;
    }

    function submit() {
      var deferred = $q.defer(); // init promise
      // Don't validate if no fields are filled in
      var validate = false;
      _.each(vm.survey, function (field) {
        if (vm.data[field.name]) {
          validate = true;
        }
      });
      if (!validate) deferred.reject('Empty Orientation Data');
      else {
        var valid = FormFactory.validate(vm.survey, vm.data);
        if (valid) {
          // If there is an index for a current orientation remove that orientation and
          // add the modifed data back in. If not, just push the new orientation data.
          var i = SpotFactory.getCurrentOrientationIndex();
          if (angular.isDefined(i)) {
            if ($state.current.name === 'app.new-linear-orientation' ||
              $state.current.name === 'app.new-planar-orientation' ||
              $state.current.name === 'app.new-tabular-zone-orientation') {
              if (!vm.currentSpot.properties.orientation_data[i].associated_orientation) {
                vm.currentSpot.properties.orientation_data[i].associated_orientation = [];
              }
              vm.data.id = Math.floor((new Date().getTime() + Math.random()) * 10);
              SpotFactory.setCurrentOrientationIndex(i,
                vm.currentSpot.properties.orientation_data[i].associated_orientation.length);
              vm.currentSpot.properties.orientation_data[i].associated_orientation.push(vm.data);
            }
            else {
              var aI = SpotFactory.getCurrentAssociatedOrientationIndex();
              if (angular.isDefined(aI)) {
                vm.currentSpot.properties.orientation_data[i].associated_orientation.splice(aI, 1, vm.data);
              }
              else {
                vm.currentSpot.properties.orientation_data.splice(i, 1, vm.data);
              }
            }
          }
          else {
            if (!vm.currentSpot.properties.orientation_data) vm.currentSpot.properties.orientation_data = [];
            vm.data.id = Math.floor((new Date().getTime() + Math.random()) * 10);
            vm.currentSpot.properties.orientation_data.push(vm.data);
          }
          SpotFactory.save(vm.currentSpot).then(function () {
            deferred.resolve();
          });
        }
        else deferred.reject('Invalid Orientation Data');
      }
      return deferred.promise;
    }

    function toggleChecked(field, choice) {
      var i = -1;
      if (vm.data[field]) {
        i = vm.data[field].indexOf(choice);
      }
      else {
        vm.data[field] = [];
      }

      // If choice not already selected
      if (i === -1) {
        vm.data[field].push(choice);
      }
      // Choice has been unselected so remove it and delete if empty
      else {
        vm.data[field].splice(i, 1);
        if (vm.data[field].length === 0) {
          delete vm.data[field];
        }
      }
    }
  }
}());
