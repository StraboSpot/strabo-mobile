(function () {
  'use strict';

  angular
    .module('app')
    .controller('FormController', FormController);

  FormController.$inject = ['$document', '$ionicModal', '$ionicPopup', '$log', '$scope', 'FormFactory'];

  function FormController($document, $ionicModal, $ionicPopup, $log, $scope, FormFactory) {
    var vm = this;

    vm.choices = {};
    vm.field = undefined;
    vm.showFieldInfoModal = {};
    vm.survey = {};

    vm.closeModal = closeModal;
    vm.getMax = getMax;
    vm.getMin = getMin;
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

    function getSurvey() {
      return FormFactory.getForm().survey
    }

    function isOptionChecked(spot, field, choice, data) {
      if (spot) {
        if (data[field]) return data[field].indexOf(choice) !== -1;
      }
      else return false;
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
      var show = FormFactory.isRelevant(field.relevant, data);
      if (show && field.default) {
        if (!data[field.name]) data[field.name] = field.default;
      }
      if (!show) {
        if (data[field.name]) delete data[field.name];
      }
      return show;
    }

    function showFieldInfo(field) {
      vm.field = field;
      vm.fieldInfoModal.show();
    }

    function toggleAcknowledgeChecked(field, data) {
      if (data.trace_feature) {
        var confirmPopup = $ionicPopup.confirm({
          'title': 'Close Group?',
          'template': 'By closing this group you will be clearing any data in this group. Continue?'
        });
        confirmPopup.then(function (res) {
          if (res) data = FormFactory.toggleAcknowledgeChecked(data, field);
          else $document[0].getElementById(field + 'Toggle').checked = true;
        });
      }
      else data = FormFactory.toggleAcknowledgeChecked(data, field);
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
