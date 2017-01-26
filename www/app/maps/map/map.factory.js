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
        'title': 'No Basemap',
        'id': 'nobasemap'
      }, {
        'title': 'Mapbox Topo',
        'id': 'mapbox.outdoors',
        'source': 'mapbox_classic'
      }, {
        'title': 'Mapbox Satellite',
        'id': 'mapbox.satellite',
        'source': 'mapbox_classic'
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
          'attributions': [
            new ol.Attribution({
              'html': '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            })
          ],
          'apiUrl': 'http://api.mapbox.com/v4/',
          'basePath': 'http://api.tiles.mapbox.com/v4/',
          'imageType': 'jpg',
          'mime': 'image/jpeg',
          'maxZoom': 19,
          'url': [
            'http://a.tiles.mapbox.com/v4/',
            'http://b.tiles.mapbox.com/v4/',
            'http://c.tiles.mapbox.com/v4/',
            'http://d.tiles.mapbox.com/v4/'
          ]
        },
        'mapbox_styles': {
          'attributions': [
            new ol.Attribution({
              'html': '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            })
          ],
          'apiUrl': 'https://api.mapbox.com/styles/v1/',
          'basePath': 'https://api.mapbox.com/styles/v1/',
          'mime': 'image/jpeg',
          'maxZoom': 19,
          'url': ['https://api.mapbox.com/styles/v1/']
        },
        'osm': {
          'imageType': 'png',
          'mime': 'image/png',
          'maxZoom': 17,
          'url': [
            'http://a.tile.openstreetmap.org/',
            'http://b.tile.openstreetmap.org/',
            'http://c.tile.openstreetmap.org/'
          ]
        },
        'map_warper': {
          'attributions': [
            new ol.Attribution({
              'html': '© <a href="http://mapwarper.net/home/about">Map Warper</a>'
            })
          ],
          'apiUrl': 'http://mapwarper.net/maps/tile/',
          'basePath': 'http://mapwarper.net/maps/tile/',
          'imageType': 'png',
          'mime': 'image/png',
          'maxZoom': 19,
          'url': ['https://www.strabospot.org/mwproxy/']
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
        if (map.source === 'mapbox_classic' || 'mapbox_styles') maps[i].key = defaultMapboxKey;
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
