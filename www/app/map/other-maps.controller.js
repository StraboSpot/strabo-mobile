(function () {
  'use strict';

  angular
    .module('app')
    .controller('OtherMapsController', OtherMapsController);

  OtherMapsController.$inject = ['$http', '$ionicLoading', '$ionicModal', '$ionicPopup', '$log', '$q', '$scope',
    'MapViewFactory', 'OfflineTilesFactory', 'OtherMapsFactory', 'UserFactory'];

  function OtherMapsController($http, $ionicLoading, $ionicModal, $ionicPopup, $log, $q, $scope, MapViewFactory,
                               OfflineTilesFactory, OtherMapsFactory, UserFactory) {
    var vm = this;
    var deleteSelected = false;
    var isEdit = false;

    vm.addMap = addMap;
    vm.addMapModal = {};
    vm.closeModal = closeModal;
    vm.data = {};
    vm.deleteMap = deleteMap;
    vm.editMap = editMap;
    vm.helpText = '';
    vm.mapProviders = {
      'apiUrl': 'http://api.mapbox.com/v4/',
      'attributionHtml': '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      'providerName': 'Mapbox',
      'tileBaseUrl': 'http://api.tiles.mapbox.com/v4/',
      'basePath': [
        'http://a.tiles.mapbox.com/v4/',
        'http://b.tiles.mapbox.com/v4/',
        'http://c.tiles.mapbox.com/v4/',
        'http://d.tiles.mapbox.com/v4/'
      ],
      'imageType': 'jpg',
      'mime': 'image/jpeg',
      'maxZoom': 19
    };
    vm.modalTitle = 'Add a Mapbox Classic Map';
    vm.openModal = openModal;
    vm.otherMaps = [];
    vm.save = save;
    vm.showHelpText = false;
    vm.toggleHelpText = toggleHelpText;

    activate();

    /**
     * Private Functions
     */

    function activate() {
      createModals();
      cleanupModals();
      setHelpText();
      OtherMapsFactory.loadOtherMaps().then(function () {
        vm.otherMaps = OtherMapsFactory.getOtherMaps();
      });
    }

    function cleanupModals() {
      $scope.$on('addMapModal.hidden', function () {
        vm.addMapModal.remove();
      });
    }

    function createModals() {
      $ionicModal.fromTemplateUrl('app/map/add-map-modal.html', {
        'scope': $scope,
        'animation': 'slide-in-up'
      }).then(function (modal) {
        vm.addMapModal = modal;
      });
    }

    function getMapboxId() {
      var user = UserFactory.getUser();
      $log.log('Loaded user: ', user);
      if (user && user.mapboxToken) {
        vm.data.key = user.mapboxToken;
        $log.log('Mapbox token: ', vm.data.key);
      }
    }

    function isNewMapId() {
      var match = _.filter(vm.otherMaps, function (otherMap) {
        return otherMap.id === vm.data.id;
      })[0];
      if (_.isEmpty(match)) {
        match = _.filter(OfflineTilesFactory.getMapProviders(), function (mapProvider) {
          return mapProvider.id === vm.data.id;
        })[0];
      }
      return _.isEmpty(match);
    }

    function setHelpText() {
      vm.helpText = 'If you haven\'t done so already, create a Mapbox account. Create a Mapbox Classic map. Under' +
        ' Account in Mapbox also create an API access token. The name used for the map is up to you but shorter' +
        ' names are better. The Map ID and Access Token you\'ll need to get from your Mapbox account. Save your' +
        ' Mapbox access token in your Strabo user profile to auto-populate this field.';
    }

    function testMapConnection() {
      var deferred = $q.defer(); // init promise
      $log.log('Trying to connect to a new map ...');
      var request = $http({
        'method': 'get',
        'url': vm.data.testUrl
      });
      request.then(function successCallback(response) {
        $log.log('Passed Connection Test - Response: ', response);
        $ionicLoading.hide();
        deferred.resolve();
      }, function errorCallback(response) {
        $log.log('Failed Connection Test - Response: ', response);
        $ionicPopup.alert({
          'title': 'Connection Error!',
          'template': 'Not able to connect to this map. Check your connection parameters.'
        });
        $ionicLoading.hide();
        deferred.reject();
      });
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function addMap() {
      isEdit = false;
      vm.modalTitle = 'Add a Mapbox Classic Map';
      vm.data = angular.copy(vm.mapProviders);
      getMapboxId();
      vm.openModal('addMapModal');
    }

    function closeModal(modal) {
      vm[modal].hide();
    }

    function deleteMap(id) {
      deleteSelected = true;
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Map',
        'template': 'Are you sure you want to delete this map?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          if (MapViewFactory.getVisibleMap() === id) MapViewFactory.setVisibleMapDefault();
          vm.otherMaps = _.reject(vm.otherMaps, function (otherMap) {
            return otherMap.id === id;
          });
          OtherMapsFactory.setOtherMaps(vm.otherMaps);
        }
        deleteSelected = false;
      });
    }

    function editMap(map) {
      if (!deleteSelected) {
        isEdit = true;
        vm.modalTitle = 'Edit Mapbox Classic Map';
        vm.data = angular.copy(map);  // Copy value, not reference
        vm.openModal('addMapModal');
      }
    }

    function openModal(modal) {
      vm.showHelpText = false;
      vm[modal].show();
    }

    function save() {
      if (!vm.data.name || !vm.data.id || !vm.data.key) {
        $ionicPopup.alert({
          'title': 'Incomplete Map Info!',
          'template': 'The map Name, ID and Access Token are all required fields.'
        });
      }
      else if (isEdit || isNewMapId()) {
        vm.data = _.extend(vm.data, vm.mapProviders);
        vm.data.testUrl = vm.data.apiUrl + vm.data.id + '.json?access_token=' + vm.data.key;
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Testing Connection...'});
        testMapConnection().then(function () {
          vm.otherMaps = _.reject(vm.otherMaps, function (otherMap) {
            return otherMap.id === vm.data.id;
          });
          vm.otherMaps.push(angular.copy(vm.data));
          OtherMapsFactory.setOtherMaps(vm.otherMaps);
          closeModal('addMapModal');
        });
      }
      else {
        $ionicPopup.alert({
          'title': 'Duplicate Map Id!',
          'template': 'The map id <b>' + vm.data.id + '</b> is already being used for a map.'
        });
      }
    }

    function toggleHelpText() {
      vm.showHelpText = !vm.showHelpText;
    }
  }
}());
