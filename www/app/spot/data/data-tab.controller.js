(function () {
  'use strict';

  angular
    .module('app')
    .controller('DataTabController', DataTabController);

  DataTabController.$inject = ['$ionicModal', '$ionicPopup', '$log', '$scope', '$state'];

  function DataTabController($ionicModal, $ionicPopup, $log, $scope, $state) {
    var vm = this;
    var vmParent = $scope.vm;

    var thisTabName = 'data';

    vm.url = '';
    vm.urlArr = [];

    vm.deleteLink = deleteLink;
    vm.editLink = editLink;
    vm.urlLinkSubmit = urlLinkSubmit;

    activate();

    /**
     * Private Functions
     */

    function activate() {
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

    function loadTab(state) {
      vmParent.loadTab(state);     // Need to load current state into parent
      $log.log('Data:', vmParent.spot.properties.data);
    }

    /**
     * Public Functions
     */

    function deleteLink(urlToDelete) {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Link',
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

    function urlLinkSubmit() {
      $log.log('Data URL', vm.url);
      if (angular.isUndefined(vm.url)) {
        $ionicPopup.alert({
          'title': 'Invalid URL!',
          'template': 'Please include "http://" or "https://" before entering website'}
        );
        vm.url = '';
      }
      else {
        if (!vmParent.spot.properties.data) vmParent.spot.properties.data = {};
        if (!vmParent.spot.properties.data.links) vmParent.spot.properties.data.links = [];
        vmParent.spot.properties.data.links.push(vm.url);
        vm.url = '';
      }
    }
  }
}());
