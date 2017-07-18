(function () {
  'use strict';

  angular
    .module('app')
    .factory('SpotsFactory', SpotsFactory);

  SpotsFactory.$inject = ['$ionicModal', 'ProjectFactory', 'SpotFactory'];

  function SpotsFactory($ionicModal, ProjectFactory, SpotFactory) {
    var activeSpots = {};
    var filteredSpots = {};
    var displayedSpots = {};
    var filterConditions = {};
    var filteredSpots = {};
    var spotsListDetail = {'tabs': true, 'tags': true};  // Only Spots in the active datasets

    return {
      'clearFilterConditions': clearFilterConditions,
      'createSpotsFilterModal': createSpotsFilterModal,
      'createSpotsListDetailModal' :createSpotsListDetailModal,
      'getActiveSpots': getActiveSpots,
      'getFilterConditions': getFilterConditions,
      'getSpotsListDetail': getSpotsListDetail,
      'getFilteredSpots': getFilteredSpots,
      'setFilterConditions': setFilterConditions,
      'setSpotsListDetail': setSpotsListDetail,
      'setFilteredSpots': setFilteredSpots,
      'sortSpots': sortSpots
    };

    /**
     * Public Functions
     */

    function clearFilterConditions() {
      filterConditions = {};
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

    function setSpotsListDetail(inSpotsListDetail) {
      spotsListDetail = inSpotsListDetail;
    }

    function setFilteredSpots() {
      var datasetIdsToSpotIds = ProjectFactory.getSpotIds();
      var filteredSpotsIds = [];
      if (!_.isEmpty(filterConditions.datasets)) {
        _.each(filterConditions.datasets, function (dataset) {
          filteredSpotsIds.push(datasetIdsToSpotIds[dataset]);
        });
        filteredSpotsIds = _.flatten(filteredSpotsIds);
      }
      filteredSpots = _.filter(activeSpots, function (activeSpot) {
        return _.contains(filteredSpotsIds, activeSpot.properties.id);
      });
    }

    function sortSpots(spots) {
      return _.sortBy(spots, function (spot) {
        return spot.properties.modified_timestamp;
      }).reverse();
    }
  }
}());
