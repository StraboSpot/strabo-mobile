(function () {
  'use strict';

  angular
    .module('app')
    .factory('SpotFactory', SpotFactory);

  SpotFactory.$inject = ['$ionicPopup', '$location', '$log', '$state', '$q', 'HelpersFactory', 'LiveDBFactory', 'LocalStorageFactory',
    'ProjectFactory'];

  function SpotFactory($ionicPopup, $location, $log, $state, $q, HelpersFactory, LiveDBFactory, LocalStorageFactory, ProjectFactory) {
    var activeNest = [];
    var activeSpots;  // Only Spots in the active datasets
    var currentSpot;
    var currentAssociatedOrientationIndex;
    var currentOrientationIndex;
    var isActiveNesting = false;
    var moveSpot = false;
    var newNest = {};
    var newNestProperties = {};
    var selectedSpots = {};
    var spots = {};        // All Spots
    var visibleDatasets = [];

    return {
      'addSpotToActiveNest': addSpotToActiveNest,
      'clearActiveNest': clearActiveNest,
      'clearActiveSpots': clearActiveSpots,
      'clearAllSpots': clearAllSpots,
      'clearCurrentSpot': clearCurrentSpot,
      'clearSelectedSpots': clearSelectedSpots,
      'destroy': destroy,
      'destroyOrientation': destroyOrientation,
      'getActiveSpots': getActiveSpots,
      'getActiveNest': getActiveNest,
      'getActiveNesting': getActiveNesting,
      'getCenter': getCenter,
      'getCurrentAssociatedOrientationIndex': getCurrentAssociatedOrientationIndex,
      'getCurrentOrientationIndex': getCurrentOrientationIndex,
      'getCurrentSpot': getCurrentSpot,
      'getFirstSpot': getFirstSpot,
      'getNameFromId': getNameFromId,
      'getOrientations': getOrientations,
      'getSelectedSpots': getSelectedSpots,
      'getSpotsByDatasetId': getSpotsByDatasetId,
      'getSpotById': getSpotById,
      'getSpots': getSpots,
      'getVisibleDatasets': getVisibleDatasets,
      'goToSpot': goToSpot,
      'isSafeDelete': isSafeDelete,
      'loadSpots': loadSpots,
      'moveSpot': moveSpot,
      'save': save,
      'saveDownloadedSpot': saveDownloadedSpot,
      'setActiveNesting': setActiveNesting,
      'setCurrentOrientationIndex': setCurrentOrientationIndex,
      'setCurrentSpotById': setCurrentSpotById,
      'setNewSpot': setNewSpot,
      'setNewNestProperties': setNewNestProperties,
      'setSelectedSpots': setSelectedSpots,
      'setVisibleDatasets': setVisibleDatasets
    };

    /**
     * Public Functions
     */

    // Add the Spot to the Nest but only if
    // {1} the Nest is empty or
    // (2) neither the Spot nor any Spots already in the Nest are mapped on image basemaps or
    // (3) the Spot and all Spots already in the Nest are mapped on the same image basemap
    function addSpotToActiveNest(inSpot) {
      if (!_.isEmpty(newNest) && inSpot.properties.id === newNest.properties.id) return $q.when(null);
      activeNest = _.reject(activeNest, function (spotInNest) {
        return spotInNest.properties.id === inSpot.properties.id;
      });
      if (_.isEmpty(activeNest)) activeNest.push(inSpot);
      else if (!_.has(activeNest[0].properties, 'image_basemap') && !_.has(inSpot.properties, 'image_basemap')) {
        activeNest.push(inSpot);
      }
      else if (_.has(activeNest[0].properties, 'image_basemap') && _.has(inSpot.properties, 'image_basemap')
        && activeNest[0].properties.image_basemap === inSpot.properties.image_basemap) {
        activeNest.push(inSpot);
      }
      else return $q.when(null);
      $log.log('Active Nest', activeNest);
      var calculatedNest = calculateNest();
      if (_.isEmpty(newNest)) {
        _.extend(calculatedNest.properties, newNestProperties);
        return setNewSpot(calculatedNest).then(function (id) {
          newNest = angular.fromJson(angular.toJson(getSpotById(id)));
        });
      }
      else {
        newNest.geometry = calculatedNest.geometry;
        return save(angular.fromJson(angular.toJson(newNest)));
      }
    }

    function calculateNest() {
      var fc = turf.featureCollection(activeNest);
      var newSpot = {};
      if (_.size(activeNest) === 1) newSpot = angular.fromJson(angular.toJson(activeNest[0]));
      else if (_.size(activeNest) === 2
        && activeNest[0].geometry.type === 'Point' && activeNest[1].geometry.type === 'Point') {
        newSpot = turf.lineString([activeNest[0].geometry.coordinates, activeNest[1].geometry.coordinates]);
      }
      else newSpot = turf.convex(fc);

      // Buffer the polygon so Spots are included within the polygon, not just as vertices
      if (!_.has(activeNest[0].properties, 'image_basemap')) {
        var unit = 'meters';
        newSpot = turf.buffer(newSpot, 5, unit);
      }
      else {
        // Need to JSTS to buffer if pixel geometry
        // convert the OpenLayers geometry to a JSTS geometry
        var format = new ol.format.GeoJSON();
        var features = format.readFeatures(newSpot);
        var feature = features[0];
        var parser = new jsts.io.OL3Parser();
        var jstsGeom = parser.read(feature.getGeometry());

        var buffered = jstsGeom.buffer(20);

        // convert back from JSTS and replace the geometry on the feature
        feature.setGeometry(parser.write(buffered));
        newSpot = format.writeFeatureObject(feature);
      }
      return newSpot;
    }

    function clearActiveNest() {
      activeNest = [];
      newNestProperties = {};
      newNest = {};
      $log.log('Cleared active nest:', activeNest);
    }

    // wipes the spots database
    function clearActiveSpots() {
      var deferred = $q.defer(); // init promise
      var promises = [];
      _.each(activeSpots, function (activeSpot) {
        ProjectFactory.removeSpotFromTags(activeSpot.properties.id);
        delete spots[activeSpot.properties.id];
        promises.push(LocalStorageFactory.getDb().spotsDb.removeItem(activeSpot.properties.id).then(function () {
          ProjectFactory.removeSpotFromDataset(activeSpot.properties.id);
        }));
      });

      $q.all(promises).then(function () {
        activeSpots = {};
        deferred.resolve();
      });
      return deferred.promise;
    }

    // wipes the spots database
    function clearAllSpots() {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().spotsDb.clear().then(function () {
        $log.log('All spots deleted from local storage.');
        spots = {};
        activeSpots = {};
        deferred.resolve();
      });
      return deferred.promise;
    }

    function clearCurrentSpot() {
      currentSpot = undefined;
    }

    function clearSelectedSpots() {
      selectedSpots = {};
    }

    // delete the spot
    function destroy(key) {
      var deferred = $q.defer(); // init promise
      ProjectFactory.removeSpotFromTags(key);
      ProjectFactory.removeSpotFromDataset(key);
      delete spots[key];
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
      activeSpots = {};
      var activeDatasets = ProjectFactory.getActiveDatasets();
      _.each(activeDatasets, function (activeDataset) {
        var spotIds = ProjectFactory.getSpotIds()[activeDataset.id];
        _.each(spotIds, function (spotId) {
          var spot = spots[spotId];
          if (spot) activeSpots[spotId] = spot;
          else $log.log('Missing Spot', spotId, 'which should be in dataset', activeDataset);
        });
      });
      return activeSpots;
    }

    function getActiveNest() {
      return activeNest;
    }

    function getActiveNesting() {
      return isActiveNesting;
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
        if (angular.isUndefined(keys[0])) deferred.resolve(undefined);
        else deferred.resolve(LocalStorageFactory.getDb().spotsDb.getItem(keys[0]));
      });
      return deferred.promise;
    }

    function getNameFromId(id) {
      var spotCur = spots[id];
      if (spotCur) return spotCur.properties.name;
      return 'Spot Not Found (Id: ' + id + ')';
    }

    function getOrientations() {
      return currentSpot.properties.orientation || [];
    }

    function getSelectedSpots() {
      return selectedSpots;
    }

    function getSpotById(id) {
      return spots[id];
    }

    function getSpots() {
      return spots;
    }

    function getSpotsByDatasetId(datasetId) {
      var spotsIds = ProjectFactory.getSpotIds()[datasetId];
      var spotsTemp = {};
      _.each(spotsIds, function (spotId) {
        if (spots[spotId]) spotsTemp[spotId] = spots[spotId];
        else ProjectFactory.removeSpotFromDataset(spotId);
      });
      return spotsTemp;
    }

    function getVisibleDatasets() {
      return visibleDatasets;
    }

    function goToSpot(id) {
      var spotCur = spots[id];
      if (spotCur) $location.path('/app/spotTab/' + id + '/spot');
      else {
        $ionicPopup.alert({
          'title': 'Spot Not Found!',
          'template': 'This Spot was not found in the local database. It may need to be downloaded from the server or an unknown error has occurred.'
        });
      }
    }

    function isSafeDelete(spotToDelete) {
      if (!spotToDelete.properties.images) return true;
      return !_.find(spotToDelete.properties.images, function (image) {
        return image.annotated === true;
      });
    }

    function loadSpots() {
      var deferred = $q.defer(); // init promise
      if (_.isEmpty(spots)) {
        $log.log('Loading Spots ....');
        LocalStorageFactory.getDb().spotsDb.iterate(function (value, key) {
          if (value) spots[key] = value;
          else LocalStorageFactory.getDb().spotsDb.removeItem(key);
        }, function () {
          deferred.resolve();
          $log.log('Finished loading Spots: ', spots);
        });
      }
      else deferred.resolve();
      return deferred.promise;
    }

    // Save the Spot to the local database if it's been changed
    function save(saveSpot) {
      $log.log('In Spot Factory Save();');
      $log.log('Incoming Spot: ', saveSpot);
      $log.log('Existing Spot: ', spots[saveSpot.properties.id]);
      $log.log('In Spot Factory Save();');
      var deferred = $q.defer(); // init promise
      var isEqual = _.isEqual(saveSpot, spots[saveSpot.properties.id]);
      if (isEqual){
        $log.log('Spot has not changed.');
        deferred.resolve(spots);
      }else {
        $log.log('Spot has changed.');
        saveSpot.properties.modified_timestamp = Date.now();
        $log.log('Call LiveDBFactory here:');
        LiveDBFactory.save(saveSpot, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
        LocalStorageFactory.getDb().spotsDb.setItem(saveSpot.properties.id.toString(), saveSpot).then(function () {
          spots[saveSpot.properties.id] = saveSpot;
          deferred.notify();
          deferred.resolve(spots);
        });
      }
      return deferred.promise;
    }

    // Save the Spot to the local database if it's been changed
    function saveDownloadedSpot(saveSpot) {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().spotsDb.setItem(saveSpot.properties.id.toString(), saveSpot).then(function () {
        spots[saveSpot.properties.id] = saveSpot;
        deferred.notify();
        deferred.resolve(spots);
      });
      return deferred.promise;
    }

    function setActiveNesting(inNesting) {
      isActiveNesting = inNesting;
    }

    function setCurrentOrientationIndex(index, assoicatedIndex) {
      currentOrientationIndex = index;
      currentAssociatedOrientationIndex = assoicatedIndex;
    }

    function setCurrentSpotById(id) {
      currentSpot = angular.fromJson(angular.toJson(spots[id]));
    }

    function setNewNestProperties(properties) {
      newNestProperties = properties;
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
        currentSpot.properties.date = d.toISOString();
        currentSpot.properties.time = d.toISOString();  // ToDo: Can remove time when switch to only using date
        currentSpot.properties.id = HelpersFactory.getNewId();

        // Set default name
        if (!currentSpot.properties.name) {
          var prefix = ProjectFactory.getSpotPrefix();
          if (!prefix) prefix = currentSpot.properties.id.toString();
          var number = ProjectFactory.getSpotNumber();
          if (!number) number = '';
          currentSpot.properties.name = prefix + number;
        }

        ProjectFactory.incrementSpotNumber();
        ProjectFactory.addSpotToDataset(currentSpot.properties.id, ProjectFactory.getSpotsDataset().id);
        save(currentSpot).then(function () {
          deferred.resolve(currentSpot.properties.id);
        });
      }
      return deferred.promise;
    }

    function setSelectedSpots(spots) {
      selectedSpots = spots;
    }

    function setVisibleDatasets(datasets) {
      visibleDatasets = datasets;
    }
  }
}());
