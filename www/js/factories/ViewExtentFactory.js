'use strict';

angular.module('app')
  .factory('ViewExtentFactory', function() {

  	var viewExtent;  	

  	var factory = {};

  	factory.setExtent = function(topRight, bottomLeft, zoom) {
  		viewExtent = {
  			topRight: topRight,
  			bottomLeft: bottomLeft,
  			zoom: zoom
  		}
  	}

  	factory.getExtent = function() {
  		return viewExtent;
  	}

  	factory.clearExtent = function() {
  		viewExtent = null;
  	}

    // return factory
    return factory;
  });