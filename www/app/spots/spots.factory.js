(function () {
  'use strict';

  angular
    .module('app')
    .factory('SpotsFactory', SpotsFactory);

  SpotsFactory.$inject = ['$ionicModal', '$ionicPopup', 'ProjectFactory', 'SpotFactory'];

  function SpotsFactory($ionicModal, $ionicPopup, ProjectFactory, SpotFactory) {
    var activeSpots = {};
    var filteredSpots = {};
    var displayedSpots = {};
    var filterConditions = {};
    var filteredSpots = {};
    var spotsListDetail = {'tabs': true, 'tags': true};  // Only Spots in the active datasets

    return {
      'areValidFilters': areValidFilters,
      'createSpotsFilterModal': createSpotsFilterModal,
      'createSpotsListDetailModal': createSpotsListDetailModal,
      'getActiveSpots': getActiveSpots,
      'getFilterConditions': getFilterConditions,
      'getSpotsListDetail': getSpotsListDetail,
      'getFilteredSpots': getFilteredSpots,
      'setFilterConditions': setFilterConditions,
      'setFilteredSpots': setFilteredSpots,
      'sortSpots': sortSpots
    };

    /**
     * Public Functions
     */

    function areValidFilters(inFilterConditions) {
      // First make sure anything that was toggled on was not left empty
      _.each(inFilterConditions, function (value, key) {
        if (_.isEmpty(value)) delete inFilterConditions[key];
      });
      if (_.isEmpty(inFilterConditions)) {
        $ionicPopup.alert({
          'title': 'No Filters',
          'template': 'There are no filters to apply.'
        });
        return false;
      }
      // Check Date Filter
      if (inFilterConditions.date) {
        if (!inFilterConditions.date.start) {
          inFilterConditions.date.start = new Date("1000-02-01T05:00:00.000Z");    // Jan 31, 1000
        }
        if (!inFilterConditions.date.end) inFilterConditions.date.end = new Date(); // today
        inFilterConditions.date.end.setHours(23, 59, 59, 999);
        if (inFilterConditions.date.start > inFilterConditions.date.end) {
          $ionicPopup.alert({
            'title': 'Invalid Dates',
            'template': 'There is a problem with the entered dates. Please fix your dates or turn off the date filter.'
          });
          return false;
        }
      }
      // Check Date Modified Filter
      if (inFilterConditions.dateModified) {
        if (!inFilterConditions.dateModified.start) {
          inFilterConditions.dateModified.start = new Date("1000-02-01T05:00:00.000Z");     // Jan 31, 1000
        }
        if (!inFilterConditions.dateModified.end) inFilterConditions.dateModified.end = new Date(); // today
        inFilterConditions.dateModified.end.setHours(23, 59, 59, 999);
        if (inFilterConditions.dateModified.start > inFilterConditions.dateModified.end) {
          $ionicPopup.alert({
            'title': 'Invalid Modified Dates',
            'template': 'There is a problem with the entered dates. Please fix your modified dates or turn' +
            ' off the date modified filter.'
          });
          return false;
        }
      }
      return true;
    }

    function createSpotsFilterModal(scope) {
      return $ionicModal.fromTemplateUrl('app/spots/spots-filter-modal.html', {
        'scope': scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        return modal;
      });
    }

    function createSpotsListDetailModal(scope) {
      return $ionicModal.fromTemplateUrl('app/spots/spots-list-detail-modal.html', {
        'scope': scope,
        'animation': 'slide-in-up',
        'backdropClickToClose': false
      }).then(function (modal) {
        return modal;
      });
    }

    function getActiveSpots() {
      setActiveSpots();
      return activeSpots;
    }

    function getFilterConditions() {
      return filterConditions;
    }

    function getSpotsFilterModal() {
      return spotsFilterModal;
    }

    function getSpotsListDetail() {
      return spotsListDetail || {};
    }

    function getFilteredSpots() {
      if (!_.isEmpty(filterConditions)) setFilteredSpots();
      return filteredSpots;
    }

    function setActiveSpots() {
      activeSpots = SpotFactory.getActiveSpots();
    }

    function setFilterConditions(inFilterConditions) {
      filterConditions = inFilterConditions;
    }

    function setFilteredSpots() {
      filteredSpots = activeSpots;
      // Filter by dataset
      if (filterConditions.datasets) {
        var datasetIdsToSpotIds = ProjectFactory.getSpotIds();
        var filteredSpotsIds = [];
        _.each(filterConditions.datasets, function (dataset) {
          filteredSpotsIds.push(datasetIdsToSpotIds[dataset]);
        });
        filteredSpotsIds = _.flatten(filteredSpotsIds);
        filteredSpots = _.filter(activeSpots, function (activeSpot) {
          return _.contains(filteredSpotsIds, activeSpot.properties.id);
        });
      }
      // Filter by name
      if (filterConditions.name) {
        filteredSpots = _.filter(filteredSpots, function (spot) {
          return spot.properties.name.toLowerCase().includes(filterConditions.name.toLowerCase());
        });
      }
      // Filter by date
      if (filterConditions.date) {
        filteredSpots = _.filter(filteredSpots, function (spot) {
          if (spot.properties.date) {
            return new Date(spot.properties.date) >= filterConditions.date.start &&
              new Date(spot.properties.date) <= filterConditions.date.end;
          }
        });
      }
      // Filter by date modified
      if (filterConditions.dateModified) {
        filteredSpots = _.filter(filteredSpots, function (spot) {
          if (spot.properties.modified_timestamp) {
            return new Date(spot.properties.modified_timestamp) >= filterConditions.dateModified.start &&
              new Date(spot.properties.modified_timestamp) <= filterConditions.dateModified.end;
          }
        });
      }
      // Filter by Spot Type
      if (filterConditions.spotType) {
        filteredSpots = _.filter(filteredSpots, function (spot) {
          var match = false;
          if (!spot.properties.image_basemap && !spot.properties.strat_section_id) {
            if (_.contains(filterConditions.spotType, 'geo')) match = true;
          }
          if (spot.properties.image_basemap && _.contains(filterConditions.spotType, 'image-basemap')) match = true;
          if (spot.properties.strat_section_id && _.contains(filterConditions.spotType, 'strat-section')) match = true;
          if (spot.properties.samples && _.contains(filterConditions.spotType, 'samples')) match = true;
          return match;
        });
      }
    }

    function sortSpots(spots) {
      return _.sortBy(spots, function (spot) {
        return spot.properties.modified_timestamp;
      }).reverse();
    }
  }
}());
