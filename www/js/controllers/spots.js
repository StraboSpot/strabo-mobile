angular.module('app')
  .controller('SpotsCtrl', function ($scope,
                                     $location,
                                     $ionicModal,
                                     $ionicPopup,
                                     $cordovaFile,
                                     $ionicActionSheet,
                                     SpotsFactory,
                                     LoginFactory,
                                     CurrentSpot,
                                     ImageMapService) {

    // Make sure the current spot is empty
    CurrentSpot.clearCurrentSpot();

    $scope.groups = [];

    $scope.createAccordionGroups = (function (spots) {
      var spotTypesTitle = [
        {"title": "MEASUREMENTS & OBSERVATIONS", "type": "point", "tab": "details"},
        {"title": "CONTACTS & TRACES", "type": "line", "tab": "details"},
        {"title": "ROCK DESCRIPTIONS", "type": "polygon", "tab": "rockdescription"},
        {"title": "3D STRUCTURES", "type": "volume", "tab": "notes"}
      ];

      for (var i = 0; i < spotTypesTitle.length; i++) {
        $scope.groups[i] = {
          name: spotTypesTitle[i].title,
          tab: spotTypesTitle[i].tab,
          items: []
        };
        for (var j = 0; j < spots.length; j++) {
          if (spots[j].properties.type == spotTypesTitle[i].type)
            $scope.groups[i].items.push(spots[j]);
        }
        $scope.groups[i].items.reverse(); // Move newest to top
        if (spotTypesTitle[i].type == "volume")
          $scope.groups[i].items.push({"properties": {"name": "3D Structures have not been implemented yet"}});
      }

      $scope.shownGroup = $scope.groups[0];
    });

    // Load or initialize Spots
    $scope.spots;

    SpotsFactory.all().then(function (spots) {
      $scope.spots = spots;
      $scope.createAccordionGroups(spots);
    });

    /*
     * if given group is the selected group, deselect it
     * else, select the given group
     */
    $scope.toggleGroup = function (group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };
    $scope.isGroupShown = function (group) {
      return $scope.shownGroup === group;
    };

    // Export data to CSV
    $scope.exportToCSV = function () {

      // Convert the spot objects to a csv format
      var convertToCSV = function (jsonString) {
        // Get all the fields for the csv header row
        var allHeaders;
        _.each($scope.spots, function (spot) {
            var headers = _.keys(spot.properties);
            // If there are custom fields, loop through the custom object grabbing those fields
            var i = _.indexOf(headers, "custom");
            if (i != -1) {
              headers = _.without(headers, "custom");
              var customHeaders = _.keys(spot.properties.custom);
              customHeaders = _.map(customHeaders, function (header) {
                return "custom_" + header;
              })
            }
            allHeaders = _.union(headers, allHeaders, customHeaders);
          }
        );
        // Add the two fields for the geometry
        allHeaders.push("geometry_type");
        allHeaders.push("geometry_coordinates");

        var allHeadersQuoted = _.map(allHeaders, function (ele) {
          return "\"" + ele + "\"";
        });
        var csv = allHeadersQuoted.toString() + "\r\n";

        // Get all the values for each csv data row
        _.each($scope.spots, function (spot) {
            var row = new Array(allHeaders.length);
            row = _.map(row, function (ele) {
              return "";
            });
            _.each(spot.properties, function (value, key) {
                // If the value is actually an object
                var i = _.indexOf(allHeaders, key);
                if (_.isObject(value)) {
                  // Get all the custom field values
                  if (key == "custom") {
                    _.each(value, function (customValue, customKey) {
                        i = _.indexOf(allHeaders, "custom_" + customKey);
                        row[i] = "\"" + customValue + "\"";
                      }
                    )
                  }
                  // Get just a string of the ids for groups, group_members and links
                  else if (key == "groups" || key == "group_members" || key == "links") {
                    value = _.pluck(value, "id");
                    row[i] = "\"" + value.join(", ") + "\"";
                  }
                  // Separate date parts
                  else if (value instanceof Date) {
                    if (key == "time")
                      row[i] = value.toLocaleTimeString();
                    else if (key == "date")
                      row[i] = value.toLocaleDateString();
                    else
                      row[i] = value.toJSON();
                  }
                  // Flatten the child values
                  else
                    row[i] = "\"" + _.flatten(value).join(", ") + "\"";
                }
                else
                  row[i] = "\"" + value + "\"";
              }
            );
            // Add the values for the geometry fields
            i = _.indexOf(allHeaders, "geometry_type");
            row[i] = "\"" + spot.geometry.type + "\"";
            if (spot.geometry.coordinates != undefined) {
              i = _.indexOf(allHeaders, "geometry_coordinates");
              row[i] = "\"" + _.flatten(spot.geometry.coordinates).join(", ") + "\"";
            }

            csv += row.toString() + "\r\n";
          }
        );
        return csv;
      };

      var spotData = convertToCSV($scope.spots);

      // If this is a web browser and not using cordova
      if (document.location.protocol != 'file:') { //Phonegap is not present }
        spotData = spotData.replace(/\r\n/g, "<br>");
        var win = window.open();
        win.document.body.innerHTML = spotData;
        return;
      }

      var d = new Date();
      d = d.toLocaleDateString() + "-" + d.toLocaleTimeString();
      d = d.replace(/\//g, "-");
      d = d.replace(/:/g, "");
      d = d.replace(/ /g, "");
      var fileName = d + "-" + "strabo-data.csv";

      var devicePath;
      switch (device.platform) {
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

      var directory = "strabo";

      var writeFile = function (dir) {
        $cordovaFile.writeFile(devicePath + dir, fileName, spotData, true)
          .then(function (success) {
            console.log(success);
            $ionicPopup.alert({
              title: 'Success!',
              template: 'CSV written to ' + devicePath + dir + fileName
            });
          }, function (error) {
            console.log(error);
          });
      };

      $cordovaFile.checkDir(devicePath, directory)
        .then(function (success) {
          console.log(success);
          writeFile(success.fullPath);
        }, function (error) {
          $cordovaFile.createDir(devicePath, directory, false)
            .then(function (success) {
              console.log(success);
              writeFile(success.fullPath);
            }, function (error) {
              console.log(error);
            })
        });
    };


    // clears all spots
    $scope.clearAllSpots = function () {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Delete Spots',
        template: 'Are you sure you want to delete <b>ALL</b> spots?'
      });
      confirmPopup.then(function (res) {
        if (res) {
          SpotsFactory.clear(function () {
            // update the spots list
            SpotsFactory.all().then(function (spots) {
              $scope.spots = spots;
              $scope.createAccordionGroups(spots);
            });

            // Remove all of the image maps
            ImageMapService.clearAllImageMaps();
          });
        }
      });
    };

    // Is the user logged in
    LoginFactory.getLogin()
      .then(function (login) {
        if (login !== null)
          $scope.loggedIn = true;
      });

    // Is the user online and logged in
    $scope.isOnlineLoggedIn = function () {
      return navigator.onLine && $scope.loggedIn;
    };

    // Create a new Spot
    $scope.newSpot = function () {
      $scope.openModal('allModal');
    };

    $scope.sync = function () {
      if (navigator.onLine && $scope.loggedIn)
        $scope.openModal('syncModal');
      else {
        if (!navigator.onLine && !$scope.loggedIn)
          $ionicPopup.alert({
            title: 'Get Online and Log In!',
            template: 'You must be online and logged in to sync with the Strabo database.'
          });
        else if (!navigator.onLine)
          $ionicPopup.alert({
            title: 'Not Online!',
            template: 'You must be online to sync with the Strabo database.'
          });
        else
          $ionicPopup.alert({
            title: 'Not Logged In!',
            template: 'You must be logged in to sync with the Strabo database. Log in on the Settings page.'
          });
      }
    };

    /////////////////
    // MODALS
    /////////////////

    $ionicModal.fromTemplateUrl('templates/modals/syncModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.syncModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modals/allModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.allModal = modal;
    });

    $scope.openModal = function (modal) {
      $scope[modal].show();
    };

    $scope.closeModal = function (modal) {
      $scope[modal].hide();
      SpotsFactory.all().then(function (spots) {
        $scope.spots = spots;
        $scope.createAccordionGroups(spots);
      });
    };

    //Cleanup the modal when we're done with it!
    // Execute action on hide modal
    $scope.$on('allModal.hidden', function () {
      $scope.allModal.remove();
    });
    $scope.$on('syncModal.hidden', function () {
      $scope.syncModal.remove();
    });

    /////////////////
    // ACTIONSHEET
    /////////////////

    $scope.showActionsheet = function () {

      $ionicActionSheet.show({
        titleText: 'Spot Actions',
        buttons: [{
          text: '<i class="icon ion-trash-b"></i> Delete All Spots'
        }, {
          text: '<i class="icon ion-archive"></i>Export All Spots to CSV'
        }],
        cancelText: 'Cancel',
        cancel: function () {
          console.log('CANCELLED');
        },
        buttonClicked: function (index) {
          console.log('BUTTON CLICKED', index);
          switch (index) {
            case 0:
              $scope.clearAllSpots();
              break;
            case 1:
              $scope.exportToCSV();
              break;
          }
          return true;
        }
      });
    };
  });
