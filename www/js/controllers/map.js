angular.module('app')

.controller("MapCtrl", function(
  $scope,
  $rootScope,
  $cordovaGeolocation,
  $location,
  $filter,
  $ionicViewService,
  Spots,
  NewSpot,
  MapView,
  OfflineTilesFactory) {

  var map;
  var drawLayer;

  // number of tiles we have in offline storage
  $scope.numOfflineTiles = 0;

  $scope.airplaneMode = true;

  // lets create a new map
  map = new ol.Map({
    target: 'mapdiv',
    view: new ol.View({
      center: [-11000000, 4600000],
      zoom: 4
    })
  });

  // toggles whether we are in airplane or internet mode
  $scope.toggleAirplaneMode = function() {
    if ($scope.airplaneMode === false) {
      $scope.airplaneMode = true;
    } else {
      $scope.airplaneMode = false;
      // clear the tiles, because we need to redraw with internet tiles
      OfflineTileSource.tileCache.clear();
      // re-render the map
      map.render();
    }
  };

  $scope.updateOfflineTileCount = function() {
    // get the image count
    OfflineTilesFactory.getOfflineTileCount(function(count) {
      $scope.$apply(function() {
        // update the number of offline tiles to scope
        $scope.numOfflineTiles = count;
      });

    });
  };

  $scope.clearOfflineTile = function() {
    if (window.confirm("Do you want to delete ALL offline tiles?")) {
      // ok, lets delete now because the user has confirmed ok
      OfflineTilesFactory.clear(function(err) {
        $scope.updateOfflineTileCount();
        alert('Offline tiles are now empty');
        // reload the map layer because the offline tiles are empty
        OfflineTileSource.tileCache.clear();
        // re-render the map
        map.render();
        //TODO: do we want to reset airplane mode?
      });
    }
  };

  // drawButtonActive used to keep state of which selected drawing tool is active
  $scope.drawButtonActive = null;

  // draw is a ol3 drawing interaction
  var draw;

  $scope.startDraw = function(type) {
    //if the type is already selected, we want to stop drawing
    if ($scope.drawButtonActive === type) {
      $scope.drawButtonActive = null;
      $scope.cancelDraw();
      return;
    } else {
      $scope.drawButtonActive = type;
    }

    // is draw already set?
    if (draw != null) {
      // yes, stop and remove the drawing interaction
      $scope.cancelDraw();
    }

    draw = new ol.interaction.Draw({
      source: drawLayer.getSource(),
      type: type
    });

    draw.on("drawend", function(e) {
      // we want a geojson object when the user finishes drawing
      var geojson = new ol.format.GeoJSON;

      // the actual geojson object
      var geojsonObj = geojson.writeFeature(e.feature, {
        featureProjection: "EPSG:3857"
      });
      // console.log(geojsonObj);

      // Initialize new Spot
      NewSpot.setNewSpot(geojsonObj);

      // If we got to the map from the spot view go back to that view
      var backView = $ionicViewService.getBackView();
      if (backView) {
        if (backView.stateName == "app.spot") {
          backView.go();
        }
      } else {
        MapView.setRestoreView(true);

        $rootScope.$apply(function() {
          $location.path("/app/spots/newspot");
        });
      }
    });
    map.addInteraction(draw);
  }

  $scope.cancelDraw = function() {
    if (draw == null) return;
    map.removeInteraction(draw);
  }

  // converts blobs to base64
  var blobToBase64 = function(blob, callback) {
    var reader = new window.FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function() {
      base64data = reader.result;
      callback(base64data);
    }
  }

  var OfflineTileSource = new ol.source.OSM({
    tileLoadFunction: function(imageTile, src) {

      // the tile we will be loading
      var imgElement = imageTile.getImage();

      // the tile coordinates (x,y,z)
      var imageCoords = imageTile.getTileCoord();

      // y needs to be corrected using (-y - 1)
      var y = (imageCoords[2] * -1) - 1;

      var z = imageCoords[0];
      var x = imageCoords[1];

      var tileId = z + "/" + x + "/" + y;

      // check to see if we have the tile in our offline storage
      OfflineTilesFactory.read(tileId, function(blob) {

        // update how many tiles we have
        $scope.updateOfflineTileCount();

        // do we have the image already?
        if (blob != null) {
          // yes, lets load the tile into the map
          blobToBase64(blob, function(base64data) {
            imgElement.src = base64data;
          });
        } else {
          // no, there is no such image in cache
          // are we in airplane mode?
          if ($scope.airplaneMode) {
            // yes, show the user the tile is unavailable
            imgElement.src = "img/offlineTiles/zoom" + z + ".png";
          } else {
            // nope, we are in internet mode!  Lets try to get it from the internet first
            OfflineTilesFactory.downloadInternetMapTile(tileId, function(blob) {
              // load the blob into an image
              blobToBase64(blob, function(base64data) {
                imgElement.src = base64data;
              });
              // now try to write to offline storage
              OfflineTilesFactory.write(tileId, blob, function(blob) {
                // console.log("wrote ", tileId);
              });
            });
          }
        }
      });
    }
  });

  var OfflineTileLayer = new ol.layer.Tile({
    source: OfflineTileSource
  });

  // add the offline tile layer to the map
  map.addLayer(OfflineTileLayer);

  // we want to load all the geojson markers from the persistence storage onto the map

  // creates a ol vector layer for supplied geojson object
  var geojsonToVectorLayer = function(geojson) {
    return new ol.layer.Vector({
      source: new ol.source.GeoJSON({
        object: geojson,
        projection: 'EPSG:3857'
      })
    });
  }

  // Loop through all spots and create ol vector layers
  Spots.all().forEach(function(geojson, index) {
    try {
      // add each layer to the map
      map.addLayer(geojsonToVectorLayer(geojson));
    } catch (err) {
      // GeoJSON isn't properly formed
      console.log("Invalid GeoJSON: " + JSON.stringify(geojson));
    }
  });

  // Zoom
  var myZoom = new ol.control.Zoom();
  map.addControl(myZoom);

  // layer where the drawing will go to
  drawLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#ffcc33'
        })
      })
    })
  });
  map.addLayer(drawLayer);

  // Get current position
  $scope.getLocation = function() {
    $cordovaGeolocation.getCurrentPosition().then(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var newView = new ol.View({
        center: ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
        zoom: 18
      });
      map.setView(newView);
    }, function(err) {
      alert("Unable to get location: " + err.message);
    });
  }
});