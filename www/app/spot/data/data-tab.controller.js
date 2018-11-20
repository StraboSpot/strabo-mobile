(function() {
  'use strict';

  angular
    .module('app')
    .controller('DataTabController', DataTabController);

  DataTabController.$inject = ['$document', '$ionicLoading', '$ionicModal', '$ionicPopup', '$log', '$scope', '$state',
  'HelpersFactory', 'IS_WEB'];

  function DataTabController($document, $ionicLoading, $ionicModal, $ionicPopup, $log, $scope, $state, HelpersFactory,
    IS_WEB) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'data';

    vm.csv = '';
    vm.csvArr = [];
    vm.importItem = undefined;
    vm.url = '';
    vm.urlArr = [];

    vm.deleteCSV = deleteCSV;
    vm.deleteLink = deleteLink;
    vm.editLink = editLink;
    vm.importData = importData;
    vm.isWeb = isWeb;
    vm.urlLinkSubmit = urlLinkSubmit;
    vm.viewCSVFile = viewCSVFile;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      createModal();
      if (IS_WEB) ionic.on('change', getFile, $document[0].getElementById('dataFile'));
      $log.log('In DataTabController');

      // Loading tab from Spots list
      if ($state.current.name === 'app.spotTab.' + thisTabName) loadTab($state);
      // Loading tab in Map side panel
      $scope.$on('load-tab', function (event, args) {
        if (args.tabName === thisTabName) {
          vmParent.saveSpot().finally(function () {
            vmParent.spotChanged = false;
            loadTab({
              'current': {'name': 'app.spotTab.' + thisTabName},
              'params': {'spotId': args.spotId}
            });
          });
        }
      });
    }

    function createModal() {
      $ionicModal.fromTemplateUrl('app/spot/data/data-table.html', {
        'scope': $scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false,
        'hardwareBackButtonClose': false
      }).then(function (modal) {
        vm.dataTableModal = modal;
      });

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function () {
        vm.dataTableModal.remove();
      });
    }

    function csvSubmit(fileName, file) {
      if (fileName.endsWith('.csv')) {
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner><br>Loading File Please Wait...'
        });
        var fileNameId = HelpersFactory.getNewId();
        $log.log(fileNameId, fileName);
        var csvToArr = HelpersFactory.csvToArray(file);
        $log.log('CSV to Array', csvToArr);
        var CSVObject = {
          'fileNameId': fileNameId,
          'fileName': fileName,
          'file': csvToArr
        };
        $log.log('CSVObject', CSVObject);
        if (!vmParent.spot.properties.data) vmParent.spot.properties.data = {};
        if (!vmParent.spot.properties.data.csv) vmParent.spot.properties.data.csv = [];
        vmParent.spot.properties.data.csv.push(CSVObject);
      }
      else {
        var alertPopup = $ionicPopup.alert({
          'title': 'Not in CSV Format!',
          'template': 'The filename: <br><b>' + fileName + '</b><br> is not in the correct format. <br>Please ensure that the filename ends is in .csv format.'
        });

        alertPopup.then(function (res) {
          $log.log('File Error:\n', res);
        });
      }
      $ionicLoading.hide();
    }

    function getFile(event) {
      if ($state.current.url === '/:spotId/data' && !_.isEmpty(event.target.files)) {
        $log.log('Getting Data file....');
        var file = event.target.files[0];
        readDataUrl(file);
      }
    }

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      $log.log('Data:', vmParent.spot.properties.data);
    }

    function readDataUrl(file) {
      var reader = new FileReader();
      reader.onloadend = function (evt) {
        $log.log('Read as text', file.name);
        csvSubmit(file.name, evt.target.result);
      };
      reader.readAsText(file);
    }

    /**
     * Public Functions
     */

    function deleteCSV(CSVToDelete) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete CSV File?',
        'template': 'Are you sure you want to delete the CSV file <b>' + CSVToDelete.fileName + '</b>?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.data.csv = _.without(vmParent.spot.properties.data.csv, CSVToDelete);
          if (vmParent.spot.properties.data.csv.length === 0) delete vmParent.spot.properties.data.csv;
          if (_.isEmpty(vmParent.spot.properties.data)) delete vmParent.spot.properties.data;
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
          });
        }
      });
    }

    function deleteLink(urlToDelete) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Link?',
        'template': 'Are you sure you want to delete the link <b>' + urlToDelete + '</b>?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          vmParent.spot.properties.data.links = _.without(vmParent.spot.properties.data.links, urlToDelete);
          if (vmParent.spot.properties.data.links.length === 0) delete vmParent.spot.properties.data.links;
          if (_.isEmpty(vmParent.spot.properties.data)) delete vmParent.spot.properties.data;
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
          });
        }
      });
    }

    // rename url
    function editLink(urlToEdit) {
      var myPopup = $ionicPopup.show({
        'template': '<input type="url" placeholder="http://" ng-model="vmChild.url">',
        'title': 'Enter URL',
        'scope': $scope,
        'buttons': [
          {'text': 'Cancel'},
          {
            'text': '<b>Save</b>',
            'type': 'button-positive',
            'onTap': function (e) {
              if (!vm.url) e.preventDefault();
              else return vm.url;
            }
          }
        ]
      });
      myPopup.then(function (url) {
        if (url) {
          vmParent.spot.properties.data.links = _.without(vmParent.spot.properties.data.links, urlToEdit);
          vmParent.spot.properties.data.links.push(url);
          vmParent.saveSpot().then(function () {
            vmParent.spotChanged = false;
            vm.url = '';
          });
        }
      });
    }

    function importData() {
      vm.fileNames = [];
      if (IS_WEB) $document[0].getElementById('dataFile').click();
    }

    function isWeb() {
      return IS_WEB;
    }

    function urlLinkSubmit() {
      $log.log('Data URL', vm.url);
      if (angular.isUndefined(vm.url)) {
        $ionicPopup.alert({
          'title': 'Invalid URL!',
          'template': 'Please include "http://" or "https://" before entering website'
        });
        vm.url = '';
      }
      else {
        if (!vmParent.spot.properties.data) vmParent.spot.properties.data = {};
        if (!vmParent.spot.properties.data.links) vmParent.spot.properties.data.links = [];
        vmParent.spot.properties.data.links.push(vm.url);
        vm.url = '';
      }
    }

    function viewCSVFile(csvFile) {
      // $log.log('csvFile', csvFile.file);
      vm.csvArr = csvFile.file;
      vm.currentFileTitle = csvFile.fileName;
      vm.dataTableModal.show();
    }
  }
}());
