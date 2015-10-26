/**
 * The Spots factory handles saving and loading spots
 * from local storage and loads default or current
 * values for a Spot
 */

'use strict';

angular
  .module('app')
  .factory('Spots', function () {
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
  });
