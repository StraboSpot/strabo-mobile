'use strict';

angular.module('app')
  .factory('OfflineTilesFactory', function() {

    var factory = {};

    // the internet map tile source
    var osmUrlPrefix = 'http://otile1.mqcdn.com/tiles/1.0.0/osm/';

    // map providers, still need to work on this
    var mapProviders = [{
      id: "osm",
      name: "OSM Standard",
      url: ['http://a.tile.openstreetmap.org/', 'http://b.tile.openstreetmap.org/', 'http://c.tile.openstreetmap.org/'],
      imageType: ".png"
    }, {
      id: "ocm",
      name: "OpenCycleMap",
      url: [],
      imageType: ""
    }, {
      id: "mq",
      name: "MapQuest",
      url: [],
      imageType: ".jpg"
    }, {
      id: "mqoa",
      name: "MapQuest Open Arial",
      url: [],
      imageType: ""
    }];

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
    factory.write = function(tileId, blob, callback) {
      localforage.setItem(tileId, blob).then(function() {
        callback();
      });
    };

    // read from storage
    factory.read = function(tileId, callback) {
      localforage.getItem(tileId).then(function(blob) {
        callback(blob);
      });
    };

    // download from internet
    factory.downloadInternetMapTile = function(tileId, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', osmUrlPrefix + tileId + ".jpg", true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function(e) {
        if (this.status == 200) {
          // Note: .response instead of .responseText
          var blob = new Blob([this.response], {
            type: 'image/png'
          });
          callback(blob);
        }
      };
      xhr.send();
    };

    factory.downloadTileToStorage = function(tileId, callback) {
      var self = this;
      self.downloadInternetMapTile(tileId, function(blob) {
        self.write(tileId, blob, function() {
          callback();
        });
      });
    }

    // return factory
    return factory;
  });