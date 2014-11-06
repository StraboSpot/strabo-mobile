angular.module('app')

/**
 * The Spots factory handles saving and loading spots
 * from local storage and loads default or current
 * values for a Spot
 */
.factory('Spots', function() {
  return {
    all: function() {
      var spotString = window.localStorage['spots'];
      if(spotString) {
        return angular.fromJson(spotString);
      }
      return [];
    },
    save: function(spots) {
      window.localStorage['spots'] = angular.toJson(spots);
    }
  }
})
