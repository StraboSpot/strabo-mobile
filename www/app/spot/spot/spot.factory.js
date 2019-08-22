(function () {
  'use strict';

  angular
    .module('app')
    .factory('SpotFactory', SpotFactory);

  SpotFactory.$inject = ['$cordovaGeolocation', '$ionicPopup', '$location', '$log', '$state', '$q', 'HelpersFactory',
    'LiveDBFactory', 'LocalStorageFactory', 'ProjectFactory', 'IS_WEB'];

  function SpotFactory($cordovaGeolocation, $ionicPopup, $location, $log, $state, $q, HelpersFactory, LiveDBFactory,
                       LocalStorageFactory, ProjectFactory, IS_WEB) {
    var activeNest = [];
    var activeSpots;  // Only Spots in the active datasets
    var currentSpotId;
    var isActiveNesting = false;
    var isKeepSpotSelected = false;
    var moveSpot = false;
    var newNest = {};
    var newNestProperties = {};
    var selectedSpots = {};
    var spots = {};        // All Spots
    var tabs = [
      {'value': 'spot', 'label': 'Spot', 'path': 'spot'},
      {'value': 'orientations', 'label': 'Orientations', 'path': 'orientations'},
      {'value': '_3dstructures', 'label': '3D Structures', 'path': '_3dstructures'},
      {'value': 'images', 'label': 'Images', 'path': 'images'},
      {'value': 'minerals', 'label': 'Minerals', 'path': 'minerals'},
      {'value': 'nesting', 'label': 'Nesting', 'path': 'nesting'},
      {'value': 'samples', 'label': 'Samples', 'path': 'samples'},
      {'value': 'other_features', 'label': 'Other Features', 'path': 'other-features'},
      {'value': 'relationships', 'label': 'Relationships', 'path': 'relationships'},
      {'value': 'tags', 'label': 'Tags', 'path': 'tags'},
      {'value': 'data', 'label': 'Data', 'path': 'data'},
      {'value': 'strat_section', 'label': 'Strat Section', 'path': 'strat-section'},
      {'value': 'sed_lithologies', 'label': 'Sed Lithologies', 'path': 'sed-lithologies'},
      {'value': 'sed_structures', 'label': 'Sed Structures', 'path': 'sed-structures'},
      {'value': 'sed_interpretations', 'label': 'Sed Interpretations', 'path': 'sed-interpretations'},
      {'value': 'experimental', 'label': 'Experimental', 'path': 'experimental'},
      {'value': 'experimental_set_up', 'label': 'Experimental Set Up', 'path': 'experimental-set-up'},
      {'value': 'experimental_results', 'label': 'Experimental Results', 'path': 'experimental-results'},
      {'value': 'pet_basics', 'label': 'Pet Basics', 'path': 'pet-basics'},
      {'value': 'pet_minerals', 'label': 'Pet Minerals', 'path': 'pet-minerals'}
    ];

    return {
      'addSpotToActiveNest': addSpotToActiveNest,
      'clearActiveNest': clearActiveNest,
      'clearActiveSpots': clearActiveSpots,
      'clearAllSpots': clearAllSpots,
      'clearCurrentSpot': clearCurrentSpot,
      'clearSelectedSpots': clearSelectedSpots,
      'destroy': destroy,
      'getActiveSpots': getActiveSpots,
      'getActiveNest': getActiveNest,
      'getActiveNesting': getActiveNesting,
      'getCenter': getCenter,
      'getChildrenGenerationsSpots': getChildrenGenerationsSpots,
      'getCurrentSpot': getCurrentSpot,
      'getFirstSpot': getFirstSpot,
      'getImagePropertiesById': getImagePropertiesById,
      'getKeepSpotSelected': getKeepSpotSelected,
      'getNameFromId': getNameFromId,
      'getParentGenerationsSpots': getParentGenerationsSpots,
      'getSelectedSpots': getSelectedSpots,
      'getSpotsByDatasetId': getSpotsByDatasetId,
      'getSpotById': getSpotById,
      'getSpotWithImageId': getSpotWithImageId,
      'getSpots': getSpots,
      'getSpotsWithPetBasics': getSpotsWithPetBasics,
      'getTabs': getTabs,
      'goToSpot': goToSpot,
      'isSafeDelete': isSafeDelete,
      'loadSpots': loadSpots,
      'moveSpot': moveSpot,
      'save': save,
      'saveDownloadedSpot': saveDownloadedSpot,
      'setActiveNesting': setActiveNesting,
      'setCurrentSpotById': setCurrentSpotById,
      'setKeepSpotSelected': setKeepSpotSelected,
      'setNewSpot': setNewSpot,
      'setNewNestProperties': setNewNestProperties,
      'setSelectedSpots': setSelectedSpots
    };

    /**
     * Private Functions
     */

    // Merge a geometry collection into a single polygon
    function dissolveCollection(spot) {
      var polys = [];
      _.each(spot.geometry.geometries, function (geometry) {
        polys.push(turf.feature(geometry));
      });
      var featureCollection = turf.featureCollection(polys);
      // Not all polys dissolving together the first time so repeat dissolve a bunch of times (ToDo: Why not working first time?)
      _.times(10, function (i) {
        if (featureCollection.features.length > 1) featureCollection = turf.dissolve(featureCollection);
      });
      return featureCollection.features[0];
    }

    // Get the children of an array of Spots
    function getChildrenOfSpots(spots) {
      var allChildrenSpots = [];
      _.each(spots, function (spot) {
        var childrenSpots = getChildrenSpots(spot);
        if (!_.isEmpty(childrenSpots)) allChildrenSpots.push(childrenSpots);
      });
      return _.flatten(allChildrenSpots);
    }

    // Get all the children Spots of thisSpot, based on image basemaps, strat sections and geometry
    // & also Spots stored in spot.properties.nesting not nested through geometry
    function getChildrenSpots(thisSpot) {
      var childrenSpots = [];
      // Find children spots based on image basemap
      if (thisSpot.properties.images) {
        var imageBasemaps = _.map(thisSpot.properties.images, function (image) {
          return image.id;
        });
        var imageBasemapChildrenSpots = _.filter(spots, function (spot) {
          return _.contains(imageBasemaps, spot.properties.image_basemap);
        });
        childrenSpots.push(imageBasemapChildrenSpots);
      }
      // Find children spots based on strat section
      if (thisSpot.properties.sed && thisSpot.properties.sed.strat_section) {
        var stratSectionChildrenSpots = _.filter(spots, function (spot) {
          return thisSpot.properties.sed.strat_section.strat_section_id === spot.properties.strat_section_id;
        });
        childrenSpots.push(stratSectionChildrenSpots);
      }
      // Find children spots not nested through geometry - nested directly in spot.properties.nesting
      if (thisSpot.properties.nesting) {
        var nonGeomChildrenSpots = [];
        _.each(thisSpot.properties.nesting, function (spotId) {
          if (getSpotById(spotId)) nonGeomChildrenSpots.push(getSpotById(spotId));
          else {
            thisSpot.properties.nesting = _.without(thisSpot.properties.nesting, spotId);
            if (_.isEmpty(thisSpot.properties.nesting)) delete thisSpot.properties.nesting;
          }
        });
        childrenSpots.push(nonGeomChildrenSpots);
      }
      childrenSpots = _.flatten(childrenSpots);
      // Find children spots based on geometry
      // Only non-point features can have children
      if (_.propertyOf(thisSpot.geometry)('type')) {
        if (_.propertyOf(thisSpot.geometry)('type') !== 'Point') {
          var otherSpots = _.reject(spots, function (spot) {
            return spot.properties.id === thisSpot.properties.id || !spot.geometry;
          });
          _.each(otherSpots, function (spot) {
            if ((!thisSpot.properties.image_basemap && !spot.properties.image_basemap) ||
              (thisSpot.properties.image_basemap && spot.properties.image_basemap &&
                thisSpot.properties.image_basemap === spot.properties.image_basemap)) {
              if (_.propertyOf(thisSpot.geometry)('type') && (_.propertyOf(thisSpot.geometry)('type') === 'Polygon'
                || _.propertyOf(thisSpot.geometry)('type') === 'MutiPolygon'
                || _.propertyOf(thisSpot.geometry)('type') === 'GeometryCollection')) {
                if (isWithin(spot, thisSpot)) childrenSpots.push(spot);
              }
            }
          });
        }
      }
      return childrenSpots;
    }

    // Get the parents of an array of Spots
    function getParentsOfSpots(spots) {
      var allParentSpots = [];
      _.each(spots, function (spot) {
        var parentSpots = getParentSpots(spot);
        if (!_.isEmpty(parentSpots)) allParentSpots.push(parentSpots);
      });
      return _.flatten(allParentSpots);
    }

    // Get all the parent Spots of thisSpot, based on image basemaps, strat sections and geometry
    // & also Spots stored in spot.properties.nesting not nested through geometry
    function getParentSpots(thisSpot) {
      var parentSpots = [];
      // Find parent spots based on image basemap
      if (thisSpot.properties.image_basemap) {
        var parentImageBasemapSpot = _.find(spots, function (spot) {
          return _.find(spot.properties.images, function (image) {
            return image.id === thisSpot.properties.image_basemap;
          });
        });
        parentSpots.push(parentImageBasemapSpot);
      }
      // Find parent spots based on strat section
      if (thisSpot.properties.strat_section_id) {
        var parentStratSectionSpot = _.find(spots, function (spot) {
          return _.find(spot.properties.sed, function (sed) {
            return sed.strat_section_id === thisSpot.properties.strat_section_id;
          });
        });
        parentSpots.push(parentStratSectionSpot);
      }
      // Find parent Spots not nested through geometry - nested directly in spot.properties.nesting
      var parentNonGeomSpot = _.find(spots, function (spot) {
        return _.contains(spot.properties.nesting, thisSpot.properties.id);
      });
      if (parentNonGeomSpot) parentSpots.push(parentNonGeomSpot);
      parentSpots = _.flatten(parentSpots);
      // Find parent spots based on geometry
      if (_.has(thisSpot, 'geometry')) {
        var otherSpots = _.reject(spots, function (spot) {
          return spot.properties.id === thisSpot.properties.id || !spot.geometry;
        });
        _.each(otherSpots, function (spot) {
          if ((!thisSpot.properties.image_basemap && !spot.properties.image_basemap) ||
            (thisSpot.properties.image_basemap && spot.properties.image_basemap &&
              thisSpot.properties.image_basemap === spot.properties.image_basemap)) {
            if (_.propertyOf(spot.geometry)('type') && (_.propertyOf(spot.geometry)('type') === 'Polygon'
              || _.propertyOf(spot.geometry)('type') === 'MutiPolygon'
              || _.propertyOf(spot.geometry)('type') === 'GeometryCollection')) {
              if (isWithin(thisSpot, spot)) parentSpots.push(spot);
            }
          }
        });
      }
      return parentSpots;
    }

    // Get the the first Spot that has this Spot nested manually in spot.properties.nesting
    function isManuallyNested(spotId) {
      return _.find(spots, function (spot) {
        return spot.properties.nesting && _.contains(spot.properties.nesting, spotId);
      });
    }

    // Is spot 1 completely within spot 2?
    function isWithin(spot1, spot2) {
      if (spot1.geometry.type === 'GeometryCollection') spot1 = dissolveCollection(spot1);
      if (spot2.geometry.type === 'GeometryCollection') spot2 = dissolveCollection(spot2);
      return turf.booleanWithin(spot1, spot2);
    }

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
        newSpot = turf.buffer(newSpot, 5, {'units': 'meters'});
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
      currentSpotId = undefined;
    }

    function clearSelectedSpots() {
      selectedSpots = {};
    }

    // delete the spot
    function destroy(key) {
      var deferred = $q.defer(); // init promise
      ProjectFactory.removeSpotFromTags(key).then(function () {
        ProjectFactory.removeSpotFromDataset(key).then(function () {
          delete spots[key];
          LocalStorageFactory.getDb().spotsDb.removeItem(key.toString()).then(function () {
            deferred.resolve();
          });
        });
      });
      return deferred.promise;
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

    // Get i generations of children spots for thisSpot
    function getChildrenGenerationsSpots(thisSpot, i) {
      var childrenGenerations = [];
      var childSpots = [thisSpot];
      _.times(5, function (i) {
        childSpots = getChildrenOfSpots(childSpots);
        // Remove a child Spot if already in the list of children generation Spots
        childSpots = _.reject(childSpots, function (childSpot) {
          return _.find(_.flatten(childrenGenerations), function (knownChildSpot) {
            return childSpot.properties.id === knownChildSpot.properties.id;
          });
        });
        if (!_.isEmpty(childSpots)) childrenGenerations.push(childSpots);
      });
      return childrenGenerations;
    }

    function getCurrentSpot() {
      return angular.fromJson(angular.toJson(spots[currentSpotId]));
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

    function getImagePropertiesById(imageId) {
      var foundImage = undefined;
      _.each(spots, function (spot) {
        _.each(spot.properties.images, function (image) {
          if (imageId === image.id) foundImage = image;
        });
      });
      return foundImage;
    }

    function getKeepSpotSelected() {
      return isKeepSpotSelected;
    }

    function getNameFromId(id) {
      var spotCur = spots[id];
      if (spotCur) return spotCur.properties.name;
      return 'Spot Not Found (Id: ' + id + ')';
    }

    // Get i generations of parent spots for thisSpot
    function getParentGenerationsSpots(thisSpot, i) {
      var parentGenerations = [];
      var parentSpots = [thisSpot];
      _.times(i, function (i) {
        parentSpots = getParentsOfSpots(parentSpots);
        // Remove a parent Spot if already in the list of parent generation Spots
        parentSpots = _.reject(parentSpots, function (parentSpot) {
          return _.find(_.flatten(parentGenerations), function (knownParentSpot) {
            return parentSpot.properties.id === knownParentSpot.properties.id;
          });
        });
        if (!_.isEmpty(parentSpots)) parentGenerations.push(parentSpots);
      });
      return parentGenerations;
    }

    function getSelectedSpots() {
      return selectedSpots;
    }

    function getSpotById(id) {
      if (!spots[id]) $log.warn('Spot', id, 'not found. New Spot or missing Spot?');
      return spots[id];
    }

    function getSpots() {
      return spots;
    }

    // Get all active Spots that have petrology basics data
    function getSpotsWithPetBasics() {
     return _.filter(activeSpots, function (spot) {
        return _.has(spot.properties, 'pet') && _.has(spot.properties.pet, 'basics');
      });
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

    function getSpotWithImageId(imageId) {
      return _.find(spots, function (spot) {
        return _.find(spot.properties.images, function (image) {
          return image.id == imageId;       // Allow for comparison between string and integer
        });
      });
    }

    function getTabs() {
      return tabs;
    }

    function goToSpot(id) {
      var spotCur = spots[id];
      if (spotCur) $location.path('/app/spotTab/' + id + '/spot');
      else {
        $ionicPopup.alert({
          'title': 'Spot Not Found!',
          'template': 'This Spot was not found in the local database. It may need to be downloaded from the server' +
            ' or an unknown error has occurred.'
        });
      }
    }

    function isSafeDelete(spotToDelete) {
      var spotWithManualNest = isManuallyNested(spotToDelete.properties.id);
      if (spotWithManualNest) {
        return "Remove the link to this Spot from the Samples page in Spot " + spotWithManualNest.properties.name +
          " before deleting.";
      }
      if (!_.isEmpty(getChildrenGenerationsSpots(spotToDelete, 1)[0])) {
        return "Delete the nested Spots for this Spot before deleting.";
      }
      if (spotToDelete.properties && spotToDelete.properties.sed && spotToDelete.properties.sed.strat_section) {
        return "Remove the strat section from this Spot before deleting.";
      }
      if (!_.isEmpty(spotToDelete.properties.images)) return "Remove all images from this Spot before deleting.";
      return null;
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
      var deferred = $q.defer(); // init promise
      saveSpot.properties.modified_timestamp = Date.now();
      $log.log('Spot has changed. Saving Spot:', saveSpot, '...');
      if (IS_WEB) LiveDBFactory.save(saveSpot, ProjectFactory.getCurrentProject(), ProjectFactory.getSpotsDataset());
      LocalStorageFactory.getDb().spotsDb.setItem(saveSpot.properties.id.toString(), saveSpot).then(function () {
        spots[saveSpot.properties.id] = angular.fromJson(angular.toJson(saveSpot));
        deferred.notify();
        $log.log('Spot Saved. All Spots:', spots);
        deferred.resolve(spots);
      });
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

    function setCurrentSpotById(id) {
      currentSpotId = id;
    }

    function setKeepSpotSelected(inVal) {
      isKeepSpotSelected = inVal;
    }

    function setNewNestProperties(properties) {
      newNestProperties = properties;
    }

    // Initialize a new Spot
    function setNewSpot(newSpot) {
      var deferred = $q.defer(); // init promise

      if (_.isEmpty(ProjectFactory.getCurrentProject())) {
        $state.go('app.manage-project');
        deferred.reject();
      }
      else if (_.isEmpty(ProjectFactory.getSpotsDataset())) {
        $ionicPopup.alert({
          'title': 'Set Your Default Dataset',
          'template': 'Please toggle ON a default dataset for new Spots first.'
        });
        $state.go('app.manage-project');
        deferred.reject();
      }
      else {
        newSpot.type = 'Feature';
        if (!newSpot.properties) newSpot.properties = {};

        // Set the date and time to now
        var d = new Date(Date.now());
        d.setMilliseconds(0);
        newSpot.properties.date = d.toISOString();
        newSpot.properties.time = d.toISOString();  // ToDo: Can remove time when switch to only using date

        // Set the ID
        newSpot.properties.id = HelpersFactory.getNewId();
        currentSpotId = newSpot.properties.id;

        // Set default name
        if (!newSpot.properties.name) {
          var prefix = ProjectFactory.getSpotPrefix();
          if (!prefix) prefix = newSpot.properties.id.toString();
          var number = ProjectFactory.getSpotNumber();
          if (!number) number = '';
          newSpot.properties.name = prefix + number;
        }

        ProjectFactory.incrementSpotNumber();
        ProjectFactory.addSpotToDataset(newSpot.properties.id, ProjectFactory.getSpotsDataset().id);

        // Get current location when creating a new Spot that is mapped on a strat section
        if (newSpot.properties.strat_section_id) {
          $cordovaGeolocation.getCurrentPosition().then(function (position) {
            newSpot.properties.lat = HelpersFactory.roundToDecimalPlaces(position.coords.latitude, 6);
            newSpot.properties.lng = HelpersFactory.roundToDecimalPlaces(position.coords.longitude, 6);
            if (position.coords.altitude) {
              newSpot.properties.altitude = HelpersFactory.roundToDecimalPlaces(position.coords.altitude, 2);
            }
          }, function (err) {
            $log.log('Unable to get current location: ' + err.message);
            // ToDo: The following freezes the app in the Chrome dev evnvironment
            /*$ionicPopup.alert({
              'title': 'Alert!',
              'template': 'Unable to get current location: ' + err.message
            });*/
          }).finally(function () {
            save(newSpot).then(function () {
              deferred.resolve(newSpot.properties.id);
            });
          });
        }
        else {
          save(newSpot).then(function () {
            deferred.resolve(newSpot.properties.id);
          });
        }
      }
      return deferred.promise;
    }

    function setSelectedSpots(spots) {
      selectedSpots = spots;
    }
  }
}());
