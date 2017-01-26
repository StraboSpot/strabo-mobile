(function () {
  'use strict';

  angular
    .module('app')
    .factory('ProjectFactory', ProjectFactory);

  ProjectFactory.$inject = ['$log', '$q', 'LocalStorageFactory', 'OtherMapsFactory', 'RemoteServerFactory',
    'UserFactory', 'IS_WEB'];

  function ProjectFactory($log, $q, LocalStorageFactory, OtherMapsFactory, RemoteServerFactory, UserFactory, IS_WEB) {
    var currentDatasets = [];
    var currentProject = {};
    var activeDatasets = [];
    var defaultTypes = ['geomorhic', 'hydrologic', 'paleontological', 'igneous', 'metamorphic', 'sedimentological',
      'other'];
    var defaultRelationshipTypes = ['cross-cuts', 'is cut by', 'is younger than', 'is older than',
      'is lower metamorphic grade than', 'is higher metamorphic grade than', 'is included within', 'includes'];
    var spotsDataset = {};
    var spotIds = {};
    var switchProject = false;
    var user = {};

    return {
      'addSpotToDataset': addSpotToDataset,
      'createNewDataset': createNewDataset,
      'createNewProject': createNewProject,
      'destroyDataset': destroyDataset,
      'destroyProject': destroyProject,
      'destroyOtherFeature': destroyOtherFeature,
      'destroyRelationshipType': destroyRelationshipType,
      'destroyTag': destroyTag,
      'destroyTags': destroyTags,
      'destroyRelationship': destroyRelationship,
      'destroyRelationships': destroyRelationships,
      'getActiveDatasets': getActiveDatasets,
      'getCurrentDatasets': getCurrentDatasets,
      'getCurrentProject': getCurrentProject,
      'getDefaultOtherFeatureTypes': getDefaultOtherFeatureTypes,
      'getDefaultRelationshipTypes': getDefaultRelationshipTypes,
      'getPreferences': getPreferences,
      'getProjectName': getProjectName,
      'getProjectDescription': getProjectDescription,
      'getProjectTools': getProjectTools,
      'getOtherFeatures': getOtherFeatures,
      'getRelationship': getRelationship,
      'getRelationships': getRelationships,
      'getRelationshipsBySpotId': getRelationshipsBySpotId,
      'getRelationshipTypes': getRelationshipTypes,
      'getSampleNumber': getSampleNumber,
      'getSamplePrefix': getSamplePrefix,
      'getSpotNumber': getSpotNumber,
      'getSpotPrefix': getSpotPrefix,
      'getSpotIds': getSpotIds,
      'getSpotsDataset': getSpotsDataset,
      'getTag': getTag,
      'getTags': getTags,
      'getTagsBySpotId': getTagsBySpotId,
      'incrementSampleNumber': incrementSampleNumber,
      'incrementSpotNumber': incrementSpotNumber,
      'isSyncReady': isSyncReady,
      'loadProjectRemote': loadProjectRemote,
      'loadProjectsRemote': loadProjectsRemote,
      'prepProject': prepProject,                     // Run from app config
      'removeFeatureFromTags': removeFeatureFromTags,
      'removeSpotFromDataset': removeSpotFromDataset,
      'removeSpotFromTags': removeSpotFromTags,
      'removeTagFromFeature': removeTagFromFeature,
      'removeTagFromFeatures': removeTagFromFeatures,
      'removeTagFromSpot': removeTagFromSpot,
      'saveActiveDatasets': saveActiveDatasets,
      'saveProjectItem': saveProjectItem,
      'saveRelationship': saveRelationship,
      'saveTag': saveTag,
      'saveSpotsDataset': saveSpotsDataset,
      'setModifiedTimestamp': setModifiedTimestamp,
      'setUser': setUser,
      'switchProject': switchProject,
      'uploadProject': uploadProject
    };

    /**
     * Private Functions
     */

    // Load all project properties from local storage
    function all() {
      var deferred = $q.defer(); // init promise
      LocalStorageFactory.getDb().projectDb.iterate(function (value, key) {
        if (key === 'active_datasets') activeDatasets = value;
        else if (key === 'spots_dataset') spotsDataset = value;
        else if (key.startsWith('dataset_')) currentDatasets.push(value);
        else if (key.startsWith('spots_')) spotIds[key.split('_')[1]] = value;
        else currentProject[key] = value;
      }).then(function () {
        $log.log('Finished loading current project:', currentProject);
        $log.log('Finished loading current datasets:', currentDatasets);
        $log.log('Finished loading active datasets:', activeDatasets);
        $log.log('Finished loading spots dataset', spotsDataset);
        $log.log('Finished loading spots in datasets', spotIds);
        deferred.resolve();
      });
      return deferred.promise;
    }

    function createDefaultDataset() {
      var id = Math.floor((new Date().getTime() + Math.random()) * 10);
      var defaultDataset = {
        'name': 'Default',
        'date': new Date(),
        'id': id,
        'modified_timestamp': Date.now()
      };
      return defaultDataset;
    }

    function loadDatasetsRemote() {
      var deferred = $q.defer(); // init promise
      if (isSyncReady()) {
        $log.log('Loading remote datsets for this project...');
        RemoteServerFactory.getProjectDatasets(currentProject.id, user.encoded_login).then(function (response) {
          if (response.status === 200 && response.data && response.data.datasets) {
            $log.log('Loaded remote current datsets:', response);
            currentDatasets = response.data.datasets;
            saveDatasets().then(function () {
              deferred.resolve();
            });
          }
          else $log.log('Error communicating with server!');
        });
      }
      else deferred.resolve();
      return deferred.promise;
    }

    function saveDatasets() {
      var deferred = $q.defer(); // init promise
      if (currentDatasets.length === 0) currentDatasets.push(createDefaultDataset());
      var promises = [];
      _.each(currentDatasets, function (dataset) {
        promises.push(saveProjectItem('dataset_' + dataset.id, dataset));
      });
      $q.all(promises).then(function () {
        $log.log('Saved datasets:', currentDatasets);
        deferred.resolve();
      });
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function addSpotToDataset(spotId, datasetId) {
      if (!spotIds[datasetId]) spotIds[datasetId] = [];
      if (!_.contains(spotIds[datasetId], spotId)) {
        spotIds[datasetId].push(spotId);
        saveProjectItem('spots_' + datasetId, spotIds[datasetId]).then(function () {
          //$log.log('Added spot to dataset ' + datasetId + ': ' + spotIds[datasetId]);
        });
      }
    }

    function createNewDataset(datasetName) {
      var id = Math.floor((new Date().getTime() + Math.random()) * 10);
      var newDataset = {
        'name': datasetName,
        'date': new Date(),
        'modified_timestamp': Date.now(),
        'id': id
      };
      currentDatasets.push(newDataset);
      saveDatasets();
    }

    function createNewProject(descriptionData) {
      var deferred = $q.defer(); // init promise
      if (!descriptionData.start_date) delete descriptionData.start_date;
      if (!descriptionData.end_date) delete descriptionData.end_date;
      var id = Math.floor((new Date().getTime() + Math.random()) * 10);
      var promises = [];
      promises.push(saveProjectItem('description', descriptionData));
      promises.push(saveProjectItem('date', new Date()));
      promises.push(saveProjectItem('modified_timestamp', Date.now()));
      promises.push(saveProjectItem('id', id));
      promises.push(saveProjectItem('other_features', defaultTypes));
      promises.push(saveProjectItem('relationship_types', defaultRelationshipTypes));
      $q.all(promises).then(function () {
        $log.log('New project:', currentProject);
        saveDatasets().then(function () {
          saveSpotsDataset(currentDatasets[0]);
          saveActiveDatasets([currentDatasets[0]]);
          deferred.resolve();
        });
      });
      return deferred.promise;
    }

    function destroyDataset(dataset) {
      var deferred = $q.defer(); // init promise
      var promises = [];
      promises.push(saveProjectItem('spots_' + dataset.id, undefined));
      promises.push(saveProjectItem('dataset_' + dataset.id, undefined));
      activeDatasets = _.reject(activeDatasets, function (activeDataset) {
        return activeDataset.id === dataset.id;
      });
      // Don't call saveProjectItem for next line since we don't want to update the modified_timestamp
      promises.push(LocalStorageFactory.getDb().projectDb.setItem('active_datasets', activeDatasets));
      currentDatasets = _.reject(currentDatasets, function (currentDataset) {
        return currentDataset.id === dataset.id;
      });
      if (dataset.id === spotsDataset.id) spotsDataset = {};
      promises.push(saveDatasets());

      $q.all(promises).then(function () {
        var spotsToDestroy = spotIds[dataset.id];
        delete spotIds[dataset.id];
        deferred.resolve(spotsToDestroy);
      });
      return deferred.promise;
    }

    function destroyProject() {
      var deferred = $q.defer(); // init promise
      currentDatasets = [];
      currentProject = {};
      activeDatasets = [];
      spotsDataset = {};
      spotIds = {};

      LocalStorageFactory.getDb().projectDb.clear().then(function () {
        $log.log('Current project deleted from local storage.');
        deferred.resolve();
      });
      return deferred.promise;
    }

    function destroyOtherFeature(i) {
      currentProject.other_features.splice(i, 1);
      saveProjectItem('other_features', currentProject.other_features);
    }

    function destroyRelationshipType(i) {
      currentProject.relationship_types.splice(i, 1);
      saveProjectItem('relationship_types', currentProject.relationship_types);
    }

    function destroyTag(id) {
      var deferred = $q.defer(); // init promise
      currentProject.tags = _.reject(currentProject.tags, function (tag) {
        return tag.id === id;
      });
      if (currentProject.tags.length === 0) destroyTags().then(function () {
        deferred.resolve()
      });
      else {
        saveProjectItem('tags', currentProject.tags).then(function () {
          deferred.resolve();
        });
      }
      return deferred.promise;
    }

    function destroyTags() {
      var deferred = $q.defer(); // init promise
      delete currentProject.tags;
      LocalStorageFactory.getDb().projectDb.removeItem('tags').then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function destroyRelationship(id) {
      var deferred = $q.defer(); // init promise
      currentProject.relationships = _.reject(currentProject.relationships, function (relationship) {
        return relationship.id === id;
      });
      if (currentProject.relationships.length === 0) destroyRelationships().then(deferred.resolve);
      else {
        saveProjectItem('relationships', currentProject.relationships).then(function () {
          deferred.resolve();
        });
      }
      return deferred.promise;
    }

    function destroyRelationships() {
      var deferred = $q.defer(); // init promise
      delete currentProject.relationships;
      LocalStorageFactory.getDb().projectDb.removeItem('relationships').then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function getCurrentDatasets() {
      return currentDatasets;
    }

    function getCurrentProject() {
      return currentProject || {};
    }

    function getActiveDatasets() {
      return activeDatasets;
    }

    function getDefaultOtherFeatureTypes() {
      return defaultTypes;
    }

    function getDefaultRelationshipTypes() {
      return defaultRelationshipTypes;
    }

    function getOtherFeatures() {
      if (!currentProject) return undefined;
      return currentProject.other_features ? currentProject.other_features : [];
    }

    function getRelationshipTypes() {
      if (!currentProject) return undefined;
      return currentProject.relationship_types ? currentProject.relationship_types : [];
    }

    function getPreferences() {
      if (!currentProject) return undefined;
      return currentProject.preferences || {};
    }

    function getProjectDescription() {
      if (!currentProject) return undefined;
      return currentProject.description || {};
    }

    function getProjectName() {
      if (!currentProject) return undefined;
      return currentProject.description ? currentProject.description.project_name : undefined;
    }

    function getProjectTools() {
      if (!currentProject) return undefined;
      return currentProject.tools || {};
    }

    function getRelationship(id) {
      if (!currentProject.relationships) return {};
      return _.find(currentProject.relationships,
          function (relationship) {
            return relationship.id === id;
          }) || {};
    }

    function getRelationships() {
      return currentProject.relationships || [];
    }

    function getRelationshipsBySpotId(spotId) {
      return _.filter(currentProject.relationships, function (tag) {
        if (tag.a && tag.a.spots && _.contains(tag.a.spots, spotId)) return true;
        else if (tag.a && tag.a.features && tag.a.features[spotId]) return true;
        else if (tag.b && tag.b.spots && _.contains(tag.b.spots, spotId)) return true;
        else if (tag.b && tag.b.features && tag.b.features[spotId]) return true;
        return false;
      });
    }

    function getSpotIds() {
      return spotIds;
    }

    function getSpotsDataset() {
      return spotsDataset;
    }

    function getSampleNumber() {
      if (!currentProject.preferences) return undefined;
      return currentProject.preferences.starting_sample_number;
    }

    function getSamplePrefix() {
      if (!currentProject.preferences) return undefined;
      return currentProject.preferences.sample_prefix;
    }

    function getSpotNumber() {
      if (!currentProject.preferences) return undefined;
      return currentProject.preferences.starting_number_for_spot;
    }

    function getSpotPrefix() {
      if (!currentProject.preferences) return undefined;
      return currentProject.preferences.spot_prefix;
    }

    function getTag(id) {
      if (!currentProject.tags) return {};
      return _.find(currentProject.tags,
          function (tag) {
            return tag.id === id;
          }) || {};
    }

    function getTags() {
      return currentProject.tags || [];
    }

    function getTagsBySpotId(spotId) {
      return _.filter(currentProject.tags, function (tag) {
        if (tag.spots && _.contains(tag.spots, spotId)) return true;
        else if (tag.features && tag.features[spotId]) return true;
        return false;
      });
    }

    // Increment starting spot number by 1
    function incrementSpotNumber() {
      var start_number = getSpotNumber();
      if (start_number) {
        start_number += 1;
        currentProject.preferences.starting_number_for_spot = start_number;
        saveProjectItem('preferences', currentProject.preferences);
      }
    }

    // Increment starting sample number by 1
    function incrementSampleNumber() {
      var start_number = getSampleNumber();
      if (start_number) {
        start_number += 1;
        currentProject.preferences.starting_sample_number = start_number;
        saveProjectItem('preferences', currentProject.preferences);
      }
    }

    function isSyncReady() {
      return !_.isEmpty(user) && navigator.onLine;
    }

    function loadProjectRemote(project) {
      var deferred = $q.defer(); // init promise
      if (isSyncReady()) {
        RemoteServerFactory.getProject(project.id, user.encoded_login).then(function (response) {
          $log.log('Loaded project', response);
          var remoteProject = response.data;
          var promises = [];
          if (!remoteProject.description) remoteProject.description = {};
          if (!remoteProject.description.project_name) remoteProject.description.project_name = 'Unnamed';
          if (!remoteProject.other_features) remoteProject.other_features = defaultTypes;
          promises.push(saveProjectItem('description', remoteProject.description));
          promises.push(saveProjectItem('date', remoteProject.date));
          promises.push(
            saveProjectItem('modified_timestamp', remoteProject.date.modified_timestamp || remoteProject.date));
          promises.push(saveProjectItem('id', remoteProject.id));
          promises.push(saveProjectItem('other_features', remoteProject.other_features));
          if (remoteProject.preferences) promises.push(saveProjectItem('preferences', remoteProject.preferences));
          if (remoteProject.daily_setup) promises.push(saveProjectItem('daily_setup', remoteProject.daily_setup));
          if (remoteProject.relationships) promises.push(saveProjectItem('relationships', remoteProject.relationships));
          if (remoteProject.tags) promises.push(saveProjectItem('tags', remoteProject.tags));
          if (remoteProject.tools) promises.push(saveProjectItem('tools', remoteProject.tools));
          if (remoteProject.other_maps) promises.push(OtherMapsFactory.addRemoteOtherMaps(remoteProject.other_maps));
          $q.all(promises).then(function () {
            loadDatasetsRemote().then(function () {
              deferred.resolve();
            });
          });
        }, function (response) {
          $log.log('Error downloading project', project, '. Response:', response);
          if (response.data && response.data.Error) deferred.reject(response.data.Error);
          else deferred.reject('Unknown Error Loading  Remote Project');
        });
      }
      else deferred.reject('You must be online and logged in to load a remote project.');
      return deferred.promise;
    }

    function loadProjectsRemote() {
      var deferred = $q.defer(); // init promise
      if (!_.isEmpty(user) && navigator.onLine) {
        $log.log('Loading list of projects from server...');
        RemoteServerFactory.getMyProjects(user.encoded_login).then(function (response) {
          var remoteProjects = [];
          if (response.status === 200 &&  response.data && response.data.projects) {
            $log.log('Loaded list of all projects from server:', response);
            remoteProjects = response.data.projects;
          }
          else {
            $log.log('Error loading list of all projects from server. Response:', response);
            deferred.reject('Error loading the list of projects from server!');
          }
          deferred.resolve(remoteProjects);
        }, function (response) {
          $log.log('Error loading list of all projects from server. Response:', response);
          deferred.reject('Error loading the list of projects from server!');
        });
      }
      else deferred.resolve();
      return deferred.promise;
    }

    function prepProject() {
      var deferred = $q.defer(); // init promise
      spotsDataset = {};
      currentProject = {};
      currentDatasets = [];
      activeDatasets = [];

      $log.log('Loading current project ....');
      all().then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function removeFeatureFromTags(spotId, featureId) {
      var deferred = $q.defer(); // init promise
      var promises = [];
      _.each(currentProject.tags, function (tag) {
        if (tag.features && tag.features[spotId]) {
          tag.features[spotId] = _.without(tag.features[spotId], featureId);
          if (tag.features[spotId].length === 0) delete tag.features[spotId];
        }
        if (_.isEmpty(tag.features)) delete tag.features;
        promises.push(saveTag(tag));
      });
      $q.all(promises).then(function () {
        return deferred.promise;
      });
    }

    function removeSpotFromDataset(spotId) {
      var deferred = $q.defer(); // init promise
      _.each(spotIds, function (spotsInDataset, datasetId) {
        if (_.contains(spotsInDataset, spotId)) {
          spotIds[datasetId] = _.without(spotsInDataset, spotId);
          if (_.isEmpty(spotIds[datasetId])) spotIds[datasetId] = undefined;
          if(IS_WEB && UserFactory.getUser()){ //are we on the desktop?
            $log.log('Remove Spot from LiveDB here', spotId, UserFactory.getUser().encoded_login);
            RemoteServerFactory.deleteSpot(spotId, UserFactory.getUser().encoded_login);
          }
          $log.log('Removed Spot id from dataset', datasetId, 'SpotIds:', spotIds);
          saveProjectItem('spots_' + datasetId, spotIds[datasetId]);
        }
      });
      return deferred.promise;
    }

    function removeSpotFromTags(spotId) {
      var tags = getTagsBySpotId(spotId);
      _.each(tags, function (tag) {
        removeTagFromSpot(tag.id, spotId);
        if (tag.features && tag.features[spotId]) delete tag.features[spotId];
        if (_.isEmpty(tag.features)) delete tag.features;
        saveTag(tag);
      });
    }

    function removeTagFromFeature(tagId, spotId, featureId) {
      var deferred = $q.defer(); // init promise
      var tag = _.findWhere(currentProject.tags, {'id': tagId});
      if (tag.features[spotId]) {
        tag.features[spotId] = _.without(tag.features[spotId], featureId);
        if (tag.features[spotId].length === 0) delete tag.features[spotId];
      }
      if (_.isEmpty(tag.features)) delete tag.features;
      saveTag(tag).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function removeTagFromFeatures(tagId, spotId) {
      var deferred = $q.defer(); // init promise
      var tag = _.findWhere(currentProject.tags, {'id': tagId});
      delete tag.features[spotId];
      if (_.isEmpty(tag.features)) delete tag.features;
      saveTag(tag).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function removeTagFromSpot(tagId, spotId) {
      var deferred = $q.defer(); // init promise
      var tag = _.findWhere(currentProject.tags, {'id': tagId});
      tag.spots = _.without(tag.spots, spotId);
      if (_.isEmpty(tag.spots)) delete tag.spots;
      saveTag(tag).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function saveActiveDatasets(newActiveDatasets) {
      activeDatasets = newActiveDatasets;
      LocalStorageFactory.getDb().projectDb.setItem('active_datasets', activeDatasets).then(function () {
        $log.log('Saved active datsets:', activeDatasets);
      });
    }

    function saveProjectItem(key, value) {
      var deferred = $q.defer(); // init promise
      var timestamp = Date.now();
      LocalStorageFactory.getDb().projectDb.setItem('modified_timestamp', timestamp).then(function () {
        currentProject.modified_timestamp = timestamp;
        if (value) {
          if (!key.startsWith('dataset_') && !key.startsWith('spots_')) currentProject[key] = value;
          LocalStorageFactory.getDb().projectDb.setItem(key, value).then(function () {
            // $log.log('Saved', key, ':', value);
            deferred.resolve();
          });
        }
        else {
          delete currentProject[key];
          LocalStorageFactory.getDb().projectDb.removeItem(key, function () {
            $log.log('No', key, '- Removed from local storage');
            deferred.resolve();
          });
        }
      });
      return deferred.promise;
    }

    function saveRelationship(relationshipToSave) {
      var deferred = $q.defer(); // init promise
      currentProject.relationships = _.reject(currentProject.relationships, function (relationship) {
        return relationship.id === relationshipToSave.id;
      });
      currentProject.relationships.push(relationshipToSave);
      saveProjectItem('relationships', currentProject.relationships).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }


    function saveTag(tagToSave) {
      var deferred = $q.defer(); // init promise
      currentProject.tags = _.reject(currentProject.tags, function (tag) {
        return tag.id === tagToSave.id;
      });
      currentProject.tags.push(tagToSave);
      saveProjectItem('tags', currentProject.tags).then(function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function saveSpotsDataset(dataset) {
      var deferred = $q.defer(); // init promise
      spotsDataset = dataset;
      LocalStorageFactory.getDb().projectDb.setItem('spots_dataset', spotsDataset).then(function () {
        $log.log('Saved spots dataset:', spotsDataset);
        deferred.resolve();
      });
      return deferred.promise;
    }

    function setModifiedTimestamp() {
      currentProject.modified_timestamp=Date.now();
    }

    function setUser(inUser) {
      user = inUser;
    }

    function uploadProject() {
      var deferred = $q.defer(); // init promise
      if (!_.isEmpty(user) && navigator.onLine) {
        $log.log('Sync Project');
        deferred.resolve(true);
      }
      else deferred.resolve(false);
      return deferred.promise;
    }
  }
}());
