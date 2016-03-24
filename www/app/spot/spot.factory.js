(function () {
  'use strict';

  angular
    .module('app')
    .factory('SpotFactory', SpotFactory);

  SpotFactory.$inject = ['$ionicPopup', '$log', '$state', '$q', 'LocalStorageFactory', 'ProjectFactory'];

  function SpotFactory($ionicPopup, $log, $state, $q, LocalStorageFactory, ProjectFactory) {
    var activeSpots;
    var currentSpot;
    var currentAssociatedOrientationIndex;
    var currentOrientationIndex;
    var moveSpot = false;
    var spots;
    var visibleDatasets = [];

    return {
      'clearActiveSpots': clearActiveSpots,
      'clearAllSpots': clearAllSpots,
      'clearCurrentSpot': clearCurrentSpot,
      'destroy': destroy,
      'destroyOrientation': destroyOrientation,
      'getActiveSpots': getActiveSpots,
      'getCenter': getCenter,
      'getCurrentAssociatedOrientationIndex': getCurrentAssociatedOrientationIndex,
      'getCurrentOrientationIndex': getCurrentOrientationIndex,
      'getCurrentSpot': getCurrentSpot,
      'getFirstSpot': getFirstSpot,
      'getNameFromId': getNameFromId,
      'getOrientations': getOrientations,
      'getSpotById': getSpotById,
      'getSpotCount': getSpotCount,
      'getSpots': getSpots,
      'getVisibleDatasets': getVisibleDatasets,
      'isRockUnitUsed': isRockUnitUsed,
      'isSafeDelete': isSafeDelete,
      'loadSpots': loadSpots,
      'moveSpot': moveSpot,
      'save': save,
      'setCurrentOrientationIndex': setCurrentOrientationIndex,
      'setCurrentSpotById': setCurrentSpotById,
      'setNewSpot': setNewSpot,
      'setVisibleDatasets': setVisibleDatasets,
      'updateSpotsWithRockUnit': updateSpotsWithRockUnit
    };

    /**
     * Private Functions
     */

    // Load all spots from local storage
    function all() {
      var deferred = $q.defer(); // init promise
      spots = [];

      LocalStorageFactory.getDb().spotsDb.iterate(function (value, key) {
        spots.push(value);
      }, function () {
        deferred.resolve(spots);
      });
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    // wipes the spots database
    function clearActiveSpots() {
      var deferred = $q.defer(); // init promise
      var promises = [];
      _.each(activeSpots, function (activeSpot) {
        spots = _.reject(spots, function (spot) {
          return spot.properties.id === activeSpot.properties.id;
        });
        promises.push(LocalStorageFactory.getDb().spotsDb.removeItem(activeSpot.properties.id).then(function () {
          ProjectFactory.removeSpotFromDataset(activeSpot.properties.id);
        }));
      });

      $q.all().then(function () {
        activeSpots = undefined;
        deferred.resolve();
      });
      return deferred.promise;
    }

    // wipes the spots database
    function clearAllSpots() {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().spotsDb.clear().then(function () {
        $log.log('All spots deleted from local storage.');
        spots = undefined;
        activeSpots = undefined;
        deferred.resolve();
      });
      return deferred.promise;
    }

    function clearCurrentSpot() {
      currentSpot = null;
    }

    // delete the spot
    function destroy(key) {
      var deferred = $q.defer(); // init promise
      spots = _.reject(spots, function (spot) {
        return spot.properties.id === key;
      });
      ProjectFactory.removeSpotFromDataset(key);
      LocalStorageFactory.getDb().spotsDb.removeItem(key).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function destroyOrientation(i, j) {
      if (angular.isNumber(j)) {
        currentSpot.properties.orientation_data[i].associated_orientation.splice(j, 1);
        if (currentSpot.properties.orientation_data[i].associated_orientation.length === 0) {
          delete currentSpot.properties.orientation_data[i].associated_orientation;
        }
      }
      else {
        currentSpot.properties.orientation_data.splice(i, 1);
        if (currentSpot.properties.orientation_data.length === 0) delete currentSpot.properties.orientation_data;
      }
    }


    function getActiveSpots() {
      activeSpots = [];
      var activeDatasets = ProjectFactory.getActiveDatasets();
      _.each(activeDatasets, function (activeDataset) {
        _.each(ProjectFactory.getSpotIds()[activeDataset.id], function (spotId) {
          var found = _.find(spots, function (spot) {
            return spot.properties.id === spotId;
          });
          if (found) activeSpots.push(found);
        });
      });
      return activeSpots;
    }

    // Get the center of a geoshape
    function getCenter(spot) {
      var coords = spot.geometry.coordinates;
      var lon = coords[0];
      var lat = coords[1];
      // Get the center lat & lon of non-point features
      if (isNaN(lon) || isNaN(lat)) {
        if (spot.geometry.type === 'Polygon') {
          coords = coords[0];
        }
        var lons = _.pluck(coords, 0);
        var lats = _.pluck(coords, 1);
        lon = (_.min(lons) + _.max(lons)) / 2;
        lat = (_.min(lats) + _.max(lats)) / 2;
      }
      return {
        'lon': lon,
        'lat': lat
      };
    }

    function getCurrentAssociatedOrientationIndex() {
      return currentAssociatedOrientationIndex;
    }

    function getCurrentOrientationIndex() {
      return currentOrientationIndex;
    }

    function getCurrentSpot() {
      return currentSpot;
    }

    // gets the first spot in the db (if exists) -- used to set the map view
    function getFirstSpot() {
      var deferred = $q.defer(); // init promise

      LocalStorageFactory.getDb().spotsDb.keys().then(function (keys, err) {
        if (angular.isUndefined(keys[0])) {
          deferred.resolve(undefined);
        }
        else {
          deferred.resolve(LocalStorageFactory.getDb().spotsDb.getItem(keys[0]));
        }
      });

      return deferred.promise;
    }

    function getNameFromId(id) {
      var spotCur = _.find(spots, function (spot) {
        return spot.properties.id === id;
      });
      return spotCur.properties.name;
    }

    function getOrientations() {
      return currentSpot.properties.orientation || [];
    }

    function getSpotById(id) {
      var spotCur = _.find(spots, function (spot) {
        return spot.properties.id === id;
      });
      return spotCur;
    }

    // gets the number of spots
    function getSpotCount() {
      return LocalStorageFactory.getDb().spotsDb.length();
    }

    function getSpots() {
      return spots || [];
    }

    function getVisibleDatasets() {
      return visibleDatasets;
    }

    function isRockUnitUsed(key, value) {
      return _.find(spots, function (spot) {
        if (spot.properties.rock_unit) return spot.properties.rock_unit[key] === value;
      });
    }

    function isSafeDelete(spotToDelete) {
      if (!spotToDelete.properties.images) return true;
      return !_.find(spotToDelete.properties.images, function (image) {
        return image.annotated === true;
      });
    }

    function loadSpots() {
      var deferred = $q.defer(); // init promise
      if (!spots) {
        $log.log('Loading Spots ....');
        all().then(function (savedData) {
          spots = savedData;
          spots = _.sortBy(spots, function (spot) {
            return spot.properties.modified_timestamp;
          }).reverse();
          $log.log('Finished loading Spots: ', spots);
          deferred.resolve();
        });
      }
      else deferred.resolve();
      return deferred.promise;
    }

    function save(saveSpot) {
      saveSpot.properties.modified_timestamp = Date.now();

      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().spotsDb.setItem(saveSpot.properties.id, saveSpot).then(function () {
        $log.log('Saved spot: ', saveSpot);
        spots = _.reject(spots, function (spot) {
          return spot.properties.id === saveSpot.properties.id;
        });
        spots.push(saveSpot);
        spots = _.sortBy(spots, function (spot) {
          return spot.properties.modified_timestamp;
        }).reverse();
        $log.log('All spots: ', spots);
        deferred.notify();
        deferred.resolve(spots);
      });
      return deferred.promise;
    }

    function setCurrentOrientationIndex(index, assoicatedIndex) {
      currentOrientationIndex = index;
      currentAssociatedOrientationIndex = assoicatedIndex;
    }

    function setCurrentSpotById(id) {
      var match = _.filter(spots, function (spot) {
        return String(spot.properties.id) === String(id);
      })[0];  // Should only be one match
      currentSpot = angular.fromJson(angular.toJson(match));  // Deep clone
    }

    // Initialize a new Spot
    function setNewSpot(jsonObj) {
      var deferred = $q.defer(); // init promise

      if (_.isEmpty(ProjectFactory.getSpotsDataset())) {
        $ionicPopup.alert({
          'title': 'No Default Dataset',
          'template': 'A default dataset for new Spots has not been specified. Set this from the Manage Project page.'
        });
        $state.go('app.manage-project');
        deferred.reject();
      }
      else {
        currentSpot = jsonObj;
        currentSpot.type = 'Feature';
        if (!currentSpot.properties) currentSpot.properties = {};

        // Set the date and time to now
        var d = new Date(Date.now());
        d.setMilliseconds(0);
        currentSpot.properties.date = d;
        currentSpot.properties.time = d;

        // Set id from the timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id)
        currentSpot.properties.id = Math.floor((new Date().getTime() + Math.random()) * 10);

        // Set default name
        var prefix = ProjectFactory.getSpotPrefix();
        if (!prefix) prefix = new Date().getTime().toString();
        var number = ProjectFactory.getSpotNumber();
        if (!number) number = '';
        currentSpot.properties.name = prefix + number;

        ProjectFactory.incrementSpotNumber();
        ProjectFactory.addSpotToDataset(currentSpot.properties.id, ProjectFactory.getSpotsDataset().id);
        save(currentSpot).then(function () {
          deferred.resolve(currentSpot.properties.id);
        });
      }
      return deferred.promise;
    }

    function setVisibleDatasets(datasets) {
      visibleDatasets = datasets;
    }

    function updateSpotsWithRockUnit(key, rock_unit) {
      _.each(spots, function (spot) {
        if (spot.properties.rock_unit && spot.properties.rock_unit[key] === rock_unit[key]) {
          spot.properties.rock_unit = rock_unit;
          $log.log('Updated Spot using modified rock unit: ', spot);
        }
      });
    }
  }
}());
