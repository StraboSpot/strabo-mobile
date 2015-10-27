/**
 * The Spots factory handles saving and loading spots
 * from local storage and loads default or current
 * values for a Spot
 */

(function () {
  'use strict';

  angular
    .module('app')
    .factory('Spots', Spots);

  function Spots() {
    return {
      'all': function () {
        var spotString = window.localStorage['spots'];
        if (spotString) {
          return angular.fromJson(spotString);
        }
        return [];
      },
      'save': function (key, spots) {
        window.localStorage[key] = angular.toJson(spots);
      }
    };
  }
}());
