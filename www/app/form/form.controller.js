(function () {
  'use strict';

  angular
    .module('app')
    .controller('FormController', FormController);

  FormController.$inject = ['$document', '$ionicModal', '$ionicPopup', '$log', '$scope', 'FormFactory',
    'PetrologyFactory', 'ProjectFactory'];

  function FormController($document, $ionicModal, $ionicPopup, $log, $scope, FormFactory, PetrologyFactory,
                          ProjectFactory) {
    var vm = this;

    vm.additionalFieldInfo = undefined;
    vm.choices = {};
    vm.field = undefined;
    vm.showFieldInfoModal = {};
    vm.survey = {};

    vm.closeModal = closeModal;
    vm.getMax = getMax;
    vm.getMin = getMin;
    vm.getPattern = getPattern;
    vm.getSurvey = getSurvey;
    vm.isOptionChecked = isOptionChecked;
    vm.setSelMultClass = setSelMultClass;
    vm.showField = showField;
    vm.showFieldInfo = showFieldInfo;
    vm.toggleAcknowledgeChecked = toggleAcknowledgeChecked;
    vm.toggleChecked = toggleChecked;

    activate();

    function activate() {
      vm.survey = FormFactory.getForm().survey;
      vm.choices = FormFactory.getForm().choices;
      $scope.$on('formUpdated', function (e, form) {
        //$log.log('Form updated to', form);
        vm.survey = form.survey;
        vm.choices = form.choices;
      });

      $ionicModal.fromTemplateUrl('app/form/field-info-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        vm.fieldInfoModal = modal;
      });
    }

    /**
     * Public Functions
     */

    function closeModal(modal) {
      vm[modal].hide();
    }

    function getMax(constraint) {
      return FormFactory.getMax(constraint);
    }

    function getMin(constraint) {
      return FormFactory.getMin(constraint);
    }

    function getPattern(fieldName) {
      return FormFactory.getPattern(fieldName);
    }

    function getSurvey() {
      return FormFactory.getForm().survey
    }

    function isOptionChecked(field, choice, data) {
      return _.contains(data[field], choice);
    }

    // Set the class for the select_multiple fields here because it is not working
    // to set the class in the html the same way as for the other fields
    function setSelMultClass(field, data) {
      if (field.required === 'true') {
        if (data[field.name]) {
          if (data[field.name].length > 0) {
            return 'no-errors';
          }
        }
        else {
          return 'has-errors';
        }
      }
      return 'no-errors';
    }

    // Determine if the field should be shown or not by looking at the relevant key-value pair
    function showField(field, data) {
      if (typeof data[field.name] !== 'boolean' && typeof data[field.name] !== 'number'
        && _.isEmpty(data[field.name])) delete data[field.name];
      var show = FormFactory.isRelevant(field.relevant, data);
      if (show && field.default) {
        if (!data[field.name]) data[field.name] = field.default;
      }
      if (!show) {
        if (data[field.name]) delete data[field.name];
      }
      var project = ProjectFactory.getCurrentProject();
      if (!project.is_testing_mode) {
        if (field.name === 'group_experimental_tab_control' || field.name === 'experimental' ||
          field.name === 'experimental_results' || field.name === 'experimental_set_up' ||
          field.name === 'data') {
          show = false;
        }
      }
      return show;
    }

    function showFieldInfo(field) {
      vm.field = field;
      vm.additionalFieldInfo = undefined;
      if (vm.field.name === 'mineral_abbrev') {
        vm.additionalFieldInfo = PetrologyFactory.getMineralAbbreviations().join('<br>');
      }
      vm.fieldInfoModal.show();
    }

    // Handle a toggle (called being turned on or off
    function toggleAcknowledgeChecked(field, data) {
      if (field === 'trace_feature') FormFactory.handleTraceFeatureToggled(field, data);
      //else if (field === 'strat_mode') FormFactory.handleStratModeToggled(field, data);
    }

    function toggleChecked(field, choice, data) {
      var i = -1;
      if (data[field]) i = data[field].indexOf(choice);
      else data[field] = [];

      // If choice not already selected
      if (i === -1) data[field].push(choice);
      // Choice has been unselected so remove it and delete if empty
      else {
        data[field].splice(i, 1);
        if (data[field].length === 0) delete data[field];
      }
    }
  }
}());
