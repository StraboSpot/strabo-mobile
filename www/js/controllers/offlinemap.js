angular.module('app')

  .controller("OfflineMapCtrl", function($scope, $localForage) {

    var osmUrlPrefix = 'http://b.tile.openstreetmap.org/';

    var map = L.map('mapdiv', {
      center: {
        lat: 32.221667,
        lng: -110.92638
      },
      zoom: 14,
      drawControl: false
    });

    $scope.numOfflineTiles;

    $scope.airplaneMode = true;

    $scope.toggleAirplaneMode = function() {
      if ($scope.airplaneMode === false) {
        $scope.airplaneMode = true;
      } else {
        $scope.airplaneMode = false;
        // we remove and then re-add the map layer because leaflet caches files.
        // This becomes problematic when we have already loaded the offline tile image
        map.removeLayer(offlineLayer);
        map.addLayer(offlineLayer);
      }
    };

    $scope.updateOfflineTileCount = function() {
      //update the image count
      localforage.length(function(err, numberOfKeys) {
        $scope.$apply(function() {
          //update the number of offline tiles to scope
          $scope.numOfflineTiles = err || numberOfKeys;
        });
      });
    };

    $scope.clearOfflineTile = function() {
      if (window.confirm("Do you want to delete ALL offline tiles?")) {
        // ok, lets delete now because the user has confirmed ok
        localforage.clear(function(err) {
          $scope.updateOfflineTileCount();
          alert('Offline tiles are now empty');
          //reload the map layer because the offline tiles are empty
          map.removeLayer(offlineLayer);
          map.addLayer(offlineLayer);
          //TODO: do we want to reset airplane mode?
        });
      }
    };

    var writeTileToStorage = function(url, isAirplaneMode, callback) {
      // are we in airplane mode?
      if (isAirplaneMode) {
        callback();
      } else {
        //no, user wants to retrieve data from the internet
        var xhr = new XMLHttpRequest();
        xhr.open('GET', osmUrlPrefix + url + ".png", true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) {
          if (this.status == 200) {
            // Note: .response instead of .responseText
            var blob = new Blob([this.response], {
              type: 'image/png'
            });

            localforage.setItem(url, blob).then(function() {
              console.log("wrote localforage, ", url);
              callback();
            });
          }
        };
        xhr.send();
      }
    }

    // new layer for offline maps, as signaled by getTileUrl
    DatabaseTileServer = L.TileLayer.extend({
      getTileUrl: function(tilePoint, zoom, tile) {
        var z = zoom;
        var x = tilePoint.x;
        var y = tilePoint.y;

        var id = z + "/" + x + "/" + y;

        // console.log("need ", id);

        // test to see if we want to write the tile into the storage
        writeTileToStorage(id, $scope.airplaneMode, function() {

          $scope.updateOfflineTileCount();

          //now get the image back
          localforage.getItem(id).then(function(blob) {
            if (blob != null) {
              var imageUrl = URL.createObjectURL(blob);
              tile.src = imageUrl;
              // console.log(imageUrl);
            } else {
              // we didn't get a file, so we need to display a blank tile base on zoom                  
              tile.src = "img/offlineTiles/zoom" + z + ".png";
            }
          });
        });

      },
      _loadTile: function(tile, tilePoint, zoom) {
        tile._layer = this;
        tile.onload = this._tileOnLoad;
        tile.onerror = this._tileOnError;
        this.getTileUrl(tilePoint, this._getZoomForUrl(), tile);
      }
    });

    var offlineLayer = new DatabaseTileServer();

    // add the offline layer
    map.addLayer(offlineLayer);
  });