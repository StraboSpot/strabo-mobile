(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapFactory', MapFactory);

  MapFactory.$inject = ['$log', 'OtherMapsFactory'];

  function MapFactory($log, OtherMapsFactory) {
    var maps;
    var defaultMapboxKey = 'pk.eyJ1Ijoic3RyYWJvLWdlb2xvZ3kiLCJhIjoiY2lpYzdhbzEwMDA1ZnZhbTEzcTV3Z3ZnOSJ9.myyChr6lmmHfP8LYwhH5Sg';

    return {
      'getMapProviderInfo': getMapProviderInfo,
      'getMaps': getMaps,
      'setMaps': setMaps
    };

    /**
     *  Private Functions
     */

    function getDefaultMaps() {
      return [{
        'title': 'Mapbox Topo',
        'id': 'mapbox.outdoors',
        'source': 'strabo_spot_mapbox'
      }, {
        'title': 'Mapbox Satellite',
        'id': 'mapbox.satellite',
        'source': 'strabo_spot_mapbox',
      }, {
        'title': 'OSM Streets',
        'id': 'osm',
        'source': 'osm'
      }];
    }

    /**
     *  Public Functions
     */

    function getMapProviderInfo(mapSource) {
      var mapProviders = {
        'mapbox_classic': {
          'attributions': '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
          'imageType': 'png',
          'mime': 'image/png',
          'tilePath': '/{z}/{x}/{y}.png',
          'url': ['https://api.mapbox.com/v4/']
        },
        'mapbox_styles': {
          'attributions': '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
          'mime': 'image/png',
          'tilePath': '/tiles/256/{z}/{x}/{y}',
          'url': ['https://api.mapbox.com/styles/v1/'],
          'maxZoom': 20
        },
        'osm': {
          'attributions': '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
          'imageType': 'png',
          'mime': 'image/png',
          'url': [
            'https://a.tile.openstreetmap.org/',
            'https://b.tile.openstreetmap.org/',
            'https://c.tile.openstreetmap.org/'
          ],
          'maxZoom': 16                  // http://wiki.openstreetmap.org/wiki/Zoom_levels
        },
        'map_warper': {
          'attributions': '© <a href="http://mapwarper.net/home/about">Map Warper</a>',
          'imageType': 'png',
          'mime': 'image/png',
          'tilePath': '/{z}/{x}/{y}.png',
          'url': ['https://www.strabospot.org/mwproxy/']
        },
        'strabo_spot_mapbox': {
          'attributions': '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.',
          'imageType': 'png',
          'mime': 'image/png',
          'tilePath': '/{z}/{x}/{y}.png',
          'url': ['http://tiles.strabospot.org/v4/'],
          'maxZoom': 19                   // https://www.mapbox.com/help/define-mapbox-satellite/
        }
      };
      return mapProviders[mapSource];
    }

    function getMaps() {
      return maps;
    }

    function setMaps() {
      // Load Default Maps
      maps = angular.fromJson(angular.toJson(getDefaultMaps()));
      _.each(maps, function (map, i) {
        maps[i] = _.extend(maps[i], getMapProviderInfo(map.source));
        if (map.source === 'strabo_spot_mapbox') maps[i].key = defaultMapboxKey;
      });

      // Load Other Maps
      var otherMaps = angular.fromJson(angular.toJson(OtherMapsFactory.getOtherMaps()));
      _.each(otherMaps, function (map) {
        maps.push(_.extend(map, getMapProviderInfo(map.source)));
      });

      $log.log('Loaded Maps:', maps);
    }
  }
}());
