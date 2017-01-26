(function () {
  'use strict';

  angular
    .module('app')
    .controller('OtherMapsController', OtherMapsController);

  OtherMapsController.$inject = ['$http', '$ionicLoading', '$ionicModal', '$ionicPopup', '$log', '$q', '$scope',
    'MapFactory', 'OtherMapsFactory', 'UserFactory'];

  function OtherMapsController($http, $ionicLoading, $ionicModal, $ionicPopup, $log, $q, $scope, MapFactory,
                               OtherMapsFactory, UserFactory) {
    var vm = this;
    var deleteSelected = false;
    var isEdit = false;

    vm.addMap = addMap;
    vm.addMapModal = {};
    vm.closeModal = closeModal;
    vm.data = {};
    vm.deleteMap = deleteMap;
    vm.editMap = editMap;
    vm.getHelpText = getHelpText;
    vm.getIdLabel = getIdLabel;
    vm.getMapTypeName = getMapTypeName;
    vm.helpText = '';
    vm.mapSources = [
      {'name': 'Mapbox Classic', 'source': 'mapbox_classic', 'idLabel': 'Map Id'},
      {'name': 'Mapbox Styles', 'source': 'mapbox_styles', 'idLabel': 'Style URL'},
      {'name': 'Map Warper ', 'source': 'map_warper', 'idLabel': '5 Digit Map ID'}
    ];
    vm.modalTitle = '';
    vm.openModal = openModal;
    vm.otherMaps = [];
    vm.save = save;
    vm.showHelpText = false;
    vm.showTokenInput = false;
    vm.toggleHelpText = toggleHelpText;
    vm.toggleTokenInput = toggleTokenInput;

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
      $ionicModal.fromTemplateUrl('app/maps/other-maps/add-map-modal.html', {
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
      var match = _.find(vm.otherMaps, function (otherMap) {
        return otherMap.id === vm.data.id;
      });
      if (_.isEmpty(match)) {
        if (!MapFactory.getMaps()) MapFactory.setMaps();
        match = _.find(MapFactory.getMaps(), function (map) {
          return map.id === vm.data.id;
        });
      }
      return _.isEmpty(match);
    }

    function setHelpText() {
      var helpText = 'Create a Mapbox account and an API Access Token.';
      vm.mapSources[0].helpText = helpText + ' To get the Map ID create a Classic map with Mapbox Editor or create a Tileset.';
      vm.mapSources[1].helpText = helpText + ' To get the Style URL create a Style map, then select' +
        ' \'Share, develop & use\'. Below \'Develop with this style\' copy the entire Mapbox Style URL.';
      vm.mapSources[2].helpText = ' To get the 5 digit Map ID, select \'Export\' and' +
        ' find the number following \'tile/\' in the Tiles URL.';
    }

    function testMapConnection(testUrl) {
      var deferred = $q.defer(); // init promise
      $log.log('Trying to connect to a new map ...' + testUrl);
      var request = $http({
        'method': 'GET',
        'url': testUrl
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
      vm.modalTitle = 'Add a Map';
      vm.data = {};
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
        vm.modalTitle = 'Edit Mapbox Map';
        vm.data = angular.fromJson(angular.toJson(map));  // Copy value, not reference
        vm.openModal('addMapModal');
      }
    }

    function getHelpText() {
      if (!vm.data.source) return '';
      var mapType = _.find(vm.mapSources, function (mapSource) {
        return mapSource.source === vm.data.source;
      });
      return mapType.helpText;
    }

    function getIdLabel() {
      if (!vm.data.source) return 'Map Id';
      var mapType = _.find(vm.mapSources, function (mapSource) {
        return mapSource.source === vm.data.source;
      });
      return mapType.idLabel;
    }

    function getMapTypeName(source) {
      var mapType = _.find(vm.mapSources, function (mapSource) {
        return mapSource.source === source;
      });
      return mapType.name;
    }

    function openModal(modal) {
      vm.showHelpText = false;
      vm[modal].show();
    }

    function save() {
      if (vm.data.source === 'map_warper' && (!vm.data.title || !vm.data.id )) {
        $ionicPopup.alert({
          'title': 'Incomplete Map Info!',
          'template': 'Title and Map ID required fields.'
        });
      }
      else if (( vm.data.source === 'mapbox_classic' || vm.data.source === 'mapbox_styles' ) && (!vm.data.source || !vm.data.title || !vm.data.id || !vm.data.key)) {
        $ionicPopup.alert({
          'title': 'Incomplete Map Info!',
          'template': 'The map Source, Title, ID or Style and Access Token are all required fields.'
        });
      }
      else if (isEdit || isNewMapId()) {
        var mapProvider = MapFactory.getMapProviderInfo(vm.data.source);
        var testUrl;
        switch (vm.data.source) {
          case 'mapbox_classic':
            testUrl = mapProvider.apiUrl + vm.data.id + '.json?access_token=' + vm.data.key;
            break;
          case 'mapbox_styles':
            var idArray = vm.data.id.split('/');
            vm.data.id = idArray[idArray.length - 2] + '/' + idArray[idArray.length - 1];
            testUrl = mapProvider.apiUrl + vm.data.id + '?access_token=' + vm.data.key;
            break;
          case 'map_warper':
            testUrl = 'https://strabospot.org/map_warper_check/' + vm.data.id;
            break;
        }
        $ionicLoading.show({'template': '<ion-spinner></ion-spinner><br>Testing Connection...'});
        testMapConnection(testUrl).then(function () {
          vm.otherMaps = _.reject(vm.otherMaps, function (otherMap) {
            return otherMap.id === vm.data.id;
          });
          vm.otherMaps.push(angular.fromJson(angular.toJson(vm.data)));
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
      vm.showHelpText = vm.data.source === 'mapbox_classic' || vm.data.source === 'mapbox_styles' || vm.data.source === 'map_warper';
    }

    function toggleTokenInput() {
      vm.showTokenInput = vm.data.source === 'mapbox_classic' || vm.data.source === 'mapbox_styles';
    }



  }
}());
