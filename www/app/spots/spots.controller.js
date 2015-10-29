(function () {
  'use strict';

  angular
    .module('app')
    .controller('SpotsController', Spots);

  Spots.$inject = ['$scope', '$ionicModal', '$ionicPopup', '$cordovaFile', '$cordovaDevice', '$ionicActionSheet',
    '$log', 'SpotsFactory', 'LoginFactory', 'CurrentSpot', 'ImageMapService'];

  function Spots($scope, $ionicModal, $ionicPopup, $cordovaFile, $cordovaDevice, $ionicActionSheet,
                 $log, SpotsFactory, LoginFactory, CurrentSpot, ImageMapService) {
    var vm = this;

    // Make sure the current spot is empty
    CurrentSpot.clearCurrentSpot();

    vm.groups = [];

    vm.createAccordionGroups = (function (spots) {
      var spotTypesTitle = [
        {'title': 'MEASUREMENTS & OBSERVATIONS', 'type': 'point', 'tab': 'details'},
        {'title': 'CONTACTS & TRACES', 'type': 'line', 'tab': 'details'},
        {'title': 'ROCK DESCRIPTIONS', 'type': 'polygon', 'tab': 'rockdescription'},
        {'title': '3D STRUCTURES', 'type': 'volume', 'tab': 'notes'}
      ];

      for (var i = 0; i < spotTypesTitle.length; i++) {
        vm.groups[i] = {
          'name': spotTypesTitle[i].title,
          'tab': spotTypesTitle[i].tab,
          'items': []
        };
        for (var j = 0; j < spots.length; j++) {
          if (spots[j].properties.type === spotTypesTitle[i].type) {
            vm.groups[i].items.push(spots[j]);
          }
        }
        vm.groups[i].items.reverse(); // Move newest to top
        if (spotTypesTitle[i].type === 'volume') {
          vm.groups[i].items.push({'properties': {'name': '3D Structures have not been implemented yet'}});
        }
      }

      vm.shownGroup = vm.groups[0];
    });

    // Load or initialize Spots
    vm.spots;

    SpotsFactory.all().then(
      function (spots) {
        vm.spots = spots;
        vm.createAccordionGroups(spots);
      }
    );

    /*
     * if given group is the selected group, deselect it
     * else, select the given group
     */
    vm.toggleGroup = function (group) {
      if (vm.isGroupShown(group)) {
        vm.shownGroup = null;
      }
      else {
        vm.shownGroup = group;
      }
    };
    vm.isGroupShown = function (group) {
      return vm.shownGroup === group;
    };

    // Export data to CSV
    vm.exportToCSV = function () {
      // Convert the spot objects to a csv format
      var convertToCSV = function (jsonString) {
        // Get all the fields for the csv header row
        var allHeaders = [];
        _.each(vm.spots,
          function (spot) {
            var headers = _.keys(spot.properties);
            // If there are custom fields, loop through the custom object grabbing those fields
            var i = _.indexOf(headers, 'custom');
            if (i !== -1) {
              headers = _.without(headers, 'custom');
              var customHeaders = _.keys(spot.properties.custom);
              customHeaders = _.map(customHeaders,
                function (header) {
                  return 'custom_' + header;
                }
              );
            }
            allHeaders = _.union(headers, allHeaders, customHeaders);
          }
        );
        // Add the two fields for the geometry
        allHeaders.push('geometry_type');
        allHeaders.push('geometry_coordinates');

        var allHeadersQuoted = _.map(allHeaders,
          function (ele) {
            return '\'' + ele + '\'';
          }
        );
        var csv = allHeadersQuoted.toString() + '\r\n';

        // Get all the values for each csv data row
        _.each(vm.spots,
          function (spot) {
            var row = new Array(allHeaders.length);
            row = _.map(row,
              function (ele) {
                return '';
              }
            );
            _.each(spot.properties,
              function (value, key) {
                // If the value is actually an object
                var i = _.indexOf(allHeaders, key);
                if (_.isObject(value)) {
                  // Get all the custom field values
                  if (key === 'custom') {
                    _.each(value,
                      function (customValue, customKey) {
                        i = _.indexOf(allHeaders, 'custom_' + customKey);
                        row[i] = '\'' + customValue + '\'';
                      }
                    );
                  }
                  // Get just a string of the ids for groups, group_members and links
                  else if (key === 'groups' || key === 'group_members' || key === 'links') {
                    value = _.pluck(value, 'id');
                    row[i] = '\'' + value.join(', ') + '\'';
                  }
                  // Separate date parts
                  else if (value instanceof Date) {
                    if (key === 'time') {
                      row[i] = value.toLocaleTimeString();
                    }
                    else if (key === 'date') {
                      row[i] = value.toLocaleDateString();
                    }
                    else {
                      row[i] = value.toJSON();
                    }
                  }
                  // Flatten the child values
                  else {
                    row[i] = '\'' + _.flatten(value).join(', ') + '\'';
                  }
                }
                else {
                  row[i] = '\'' + value + '\'';
                }
              }
            );
            // Add the values for the geometry fields
            var i = _.indexOf(allHeaders, 'geometry_type');
            row[i] = '\'' + spot.geometry.type + '\'';
            if (spot.geometry.coordinates !== undefined) {
              i = _.indexOf(allHeaders, 'geometry_coordinates');
              row[i] = '\'' + _.flatten(spot.geometry.coordinates).join(', ') + '\'';
            }
            csv += row.toString() + '\r\n';
          }
        );
        return csv;
      };

      var spotData = convertToCSV(vm.spots);

      // If this is a web browser and not using cordova
      if (document.location.protocol !== 'file:') { // Phonegap is not present }
        spotData = spotData.replace(/\r\n/g, '<br>');
        var win = window.open();
        win.document.body.innerHTML = spotData;
        return;
      }

      var d = new Date();
      d = d.toLocaleDateString() + '-' + d.toLocaleTimeString();
      d = d.replace(/\//g, '-');
      d = d.replace(/:/g, '');
      d = d.replace(/ /g, '');
      var fileName = d + '-' + 'strabo-data.csv';

      var devicePath;
      switch ($cordovaDevice.getPlatform()) {
        case 'Android':
          devicePath = cordova.file.externalRootDirectory;
          break;
        case 'iOS':
          devicePath = cordova.file.documentsDirectory;
          break;
        default:
          // uh oh?  TODO: what about windows and blackberry?
          devicePath = cordova.file.externalRootDirectory;
          break;
      }

      var directory = 'strabo';

      var writeFile = function (dir) {
        $cordovaFile.writeFile(devicePath + dir, fileName, spotData, true).then(
          function (success) {
            $log.log(success);
            $ionicPopup.alert({
              'title': 'Success!',
              'template': 'CSV written to ' + devicePath + dir + fileName
            });
          },
          function (error) {
            $log.log(error);
          }
        );
      };

      $cordovaFile.checkDir(devicePath, directory).then(
        function (success) {
          $log.log(success);
          writeFile(success.fullPath);
        },
        function (error) {
          $cordovaFile.createDir(devicePath, directory, false).then(
            function (success) {
              $log.log(success);
              writeFile(success.fullPath);
            },
            function (error) {
              $log.log(error);
            }
          );
        }
      );
    };

    // clears all spots
    vm.clearAllSpots = function () {
      var confirmPopup = $ionicPopup.confirm({
        'title': 'Delete Spots',
        'template': 'Are you sure you want to delete <b>ALL</b> spots?'
      });
      confirmPopup.then(
        function (res) {
          if (res) {
            SpotsFactory.clear(
              function () {
                // update the spots list
                SpotsFactory.all().then(
                  function (spots) {
                    vm.spots = spots;
                    vm.createAccordionGroups(spots);
                  }
                );
                // Remove all of the image maps
                ImageMapService.clearAllImageMaps();
              }
            );
          }
        }
      );
    };

    // Is the user logged in
    LoginFactory.getLogin().then(
      function (login) {
        if (login !== null) {
          vm.loggedIn = true;
        }
      }
    );

    // Is the user online and logged in
    vm.isOnlineLoggedIn = function () {
      return navigator.onLine && vm.loggedIn;
    };

    // Create a new Spot
    vm.newSpot = function () {
      vm.openModal('allModal');
    };

    vm.sync = function () {
      if (navigator.onLine && vm.loggedIn) {
        vm.openModal('syncModal');
      }
      else {
        if (!navigator.onLine && !vm.loggedIn) {
          $ionicPopup.alert({
            'title': 'Get Online and Log In!',
            'template': 'You must be online and logged in to sync with the Strabo database.'
          });
        }
        else if (!navigator.onLine) {
          $ionicPopup.alert({
            'title': 'Not Online!',
            'template': 'You must be online to sync with the Strabo database.'
          });
        }
        else {
          $ionicPopup.alert({
            'title': 'Not Logged In!',
            'template': 'You must be logged in to sync with the Strabo database. Log in on the Settings page.'
          });
        }
      }
    };

    /**
     * MODALS
     */

    $ionicModal.fromTemplateUrl('app/remote-connection/sync-modal.html', {
      'scope': $scope,
      'animation': 'slide-in-up'
    }).then(function (modal) {
      vm.syncModal = modal;
    });

    $ionicModal.fromTemplateUrl('app/spots/spot-types-modal.html', {
      'scope': $scope,
      'animation': 'slide-in-up'
    }).then(function (modal) {
      vm.allModal = modal;
    });

    vm.openModal = function (modal) {
      vm[modal].show();
    };

    vm.closeModal = function (modal) {
      vm[modal].hide();
      SpotsFactory.all().then(function (spots) {
        vm.spots = spots;
        vm.createAccordionGroups(spots);
      });
    };

    // Cleanup the modal when we're done with it!
    // Execute action on hide modal
    $scope.$on('allModal.hidden', function () {
      vm.allModal.remove();
    });
    $scope.$on('syncModal.hidden', function () {
      vm.syncModal.remove();
    });

    /**
     * ACTIONSHEET
     */

    vm.showActionsheet = function () {
      $ionicActionSheet.show({
        'titleText': 'Spot Actions',
        'buttons': [{
          'text': '<i class="icon ion-trash-b"></i> Delete All Spots'
        }, {
          'text': '<i class="icon ion-archive"></i>Export All Spots to CSV'
        }],
        'cancelText': 'Cancel',
        'cancel': function () {
          $log.log('CANCELLED');
        },
        'buttonClicked': function (index) {
          $log.log('BUTTON CLICKED', index);
          switch (index) {
            case 0:
              vm.clearAllSpots();
              break;
            case 1:
              vm.exportToCSV();
              break;
          }
          return true;
        }
      });
    };
  }
}());
