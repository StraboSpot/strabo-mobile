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
    getSpot: function(spots, id, filter) {
      var thisSpot;
      
      if(id == "newspot")
        thisSpot = {};
      else
        thisSpot = spots[id];
   
      if(!thisSpot.date)
        thisSpot.date = filter("date")(Date.now(), 'yyyy-MM-dd');
      
      return thisSpot;
    },
    save: function(spots) {
      window.localStorage['spots'] = angular.toJson(spots);
    }
  }
})