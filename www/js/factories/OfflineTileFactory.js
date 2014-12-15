'use strict';

angular.module('app')
  .factory('OfflineTilesFactory', function() {

    var factory = {};

    // map providers
    var mapProviders = [{
      id: "osm",
      name: "OSM Standard",
      url: [
        'http://a.tile.openstreetmap.org/',
        'http://b.tile.openstreetmap.org/',
        'http://c.tile.openstreetmap.org/'
      ],
      imageType: "png",
      mime: "image/png"
    }, {
      id: "mqSat",
      name: "MapQuest - Satellite",
      url: [
        'http://otile1-s.mqcdn.com/tiles/1.0.0/sat/',
        'http://otile2-s.mqcdn.com/tiles/1.0.0/sat/',
        'http://otile3-s.mqcdn.com/tiles/1.0.0/sat/',
        'http://otile4-s.mqcdn.com/tiles/1.0.0/sat/'
      ],
      imageType: "jpg",
      mime: "image/jpeg"
    }, {
      id: "mqOsm",
      name: "MapQuest - OSM",
      url: [
        'http://otile1-s.mqcdn.com/tiles/1.0.0/osm/',
        'http://otile2-s.mqcdn.com/tiles/1.0.0/osm/',
        'http://otile3-s.mqcdn.com/tiles/1.0.0/osm/',
        'http://otile4-s.mqcdn.com/tiles/1.0.0/osm/'
      ],
      imageType: "jpg",
      mime: "image/jpeg"
    }];

    // randomly selects an element from an array
    var getRandomElement = function(ary) {
      var num = _.random(0, ary.length - 1);
      return ary[num];
    }

    var getMapTileProvider = function(id) {
      var provider = _.find(mapProviders, function(provider) {
        return provider.id == id;
      });
      return provider;
    }


    // gets the number of tiles from offline storage
    factory.getOfflineTileCount = function(callback) {
      localforage.length(function(err, numberOfKeys) {
        callback(err || numberOfKeys);
      });
    }

    // wipes the offline database
    factory.clear = function(callback) {
      localforage.clear(function(err) {
        if (err) {
          callback(err);
        } else {
          callback();
        }
      });
    }

    // write to storage
    factory.write = function(mapProvider, tileId, blob, callback) {
      tileId = mapProvider + "/" + tileId;
      localforage.setItem(tileId, blob).then(function() {
        callback();
      });
    };

    // read from storage
    factory.read = function(mapProvider, tileId, callback) {
      tileId = mapProvider + "/" + tileId;
      localforage.getItem(tileId).then(function(blob) {
        callback(blob);
      });
    };

    // download from internet
    factory.downloadInternetMapTile = function(mapProvider, tileId, callback) {

      var mapTileProvider = getMapTileProvider(mapProvider);
      var url = getRandomElement(mapTileProvider.url);
      var mime = mapTileProvider.mime;

      var imageUrl = url + tileId + "." + mapTileProvider.imageType;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', imageUrl, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function(e) {
        if (this.status == 200) {
          // Note: .response instead of .responseText
          var blob = new Blob([this.response], {
            type: mime
          });
          callback(blob);
        }
      };
      xhr.send();
    };

    factory.downloadTileToStorage = function(mapProvider, tileId, callback) {
      var self = this;
      self.downloadInternetMapTile(mapProvider, tileId, function(blob) {
        self.write(mapProvider, tileId, blob, function() {
          callback();
        });
      });
    }

    // return factory
    return factory;
  });