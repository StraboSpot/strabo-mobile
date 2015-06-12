'use strict';

angular.module('app')
  .factory('MapLayerFactory', function(OfflineTilesFactory) {
    var factory = {};

    // vector layer where we house all the geojson spot objects
    var featureLayer = new ol.layer.Group({
      name: 'featureLayer',
      title: 'Spot Types',
      layers: []
    });

    // layer where the drawing will go to
    var drawLayer = new ol.layer.Vector({
      name: 'drawLayer',
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

    // online map layer of all possible online map providers
    var onlineLayer = new ol.layer.Group({
      name: 'onlineLayer',
      title: 'Online Maps',
      layers: [
        new ol.layer.Tile({
          title: 'Satellite',
          id: 'mqSat',
          type: 'base',
          visible: false,
          source: new ol.source.MapQuest({
              layer: 'sat'
            }) //,
            //extent: mapExtent
        }),
        new ol.layer.Tile({
          title: 'Streets',
          id: 'mqOsm',
          type: 'base',
          visible: true, // default visible layer
          source: new ol.source.MapQuest({
              layer: 'osm'
            })
            //,
            // extent: mapExtent
        })
      ]
    });

    // overlay layer
    var onlineOverlayLayer = new ol.layer.Group({
      name: 'onlineOverlayLayer',
      title: 'Overlays (online)',
      layers: [
        new ol.layer.Tile({
          title: "Geologic (z4-12)",
          id: "macrostratGeologic",
          type: 'overlay',
          opacity: 0.5,
          visible: false,
          source: new ol.source.XYZ({
            url: "http://macrostrat.org/tiles/geologic/{z}/{x}/{y}.png"
          })
        })
      ]
    });


    //////////////////
    // geolocation layers and styles
    //////////////////

    var geolocationCenterIconStyle = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorOrigin: 'top-left',
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 0.75,
        src: 'img/geolocate-center.png',
        scale: 0.25
      })
    });

    var geolocationHeadingIconStyle = function(heading) {
      return new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 2.1],
          anchorOrigin: 'top-left',
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          opacity: 0.75,
          src: 'img/geolocate-heading.png',
          rotation: Math.radians(heading),
          scale: (heading === null) ? 0 : 0.1
        })
      });
    };

    var geolocationAccuracyTextStyle = function(text) {
      return new ol.style.Style({
        text: new ol.style.Text({
          font: '10px Calibri,sans-serif',
          text: (text === null) ? '?' : text + 'm',
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
          })
        })
      });
    };

    var geolocationSpeedTextStyle = function(speed) {
      return new ol.style.Style({
        text: new ol.style.Text({
          font: '10px Calibri,sans-serif',
          offsetY: 30,
          text: (speed === null) ? '' : speed + 'm/s',
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
          })
        })
      });
    };

    // geolocation layer
    var geolocationLayer = new ol.layer.Vector({
      name: 'geolocationLayer',
      style: function(feature, resolution) {
        return [
          geolocationCenterIconStyle,
          geolocationHeadingIconStyle(feature.get('heading')),
          geolocationAccuracyTextStyle(feature.get('accuracy')),
          geolocationSpeedTextStyle(feature.get('speed'))
        ];
      }
    });

    // tileLoadFunction is used for offline access mode, required by OL3 for specifying how tiles are retrieved
    var tileLoadFunction = function(mapProvider, isOverlay) {
      return function(imageTile, src) {

        // console.log(mapProvider, isOverlay);
        // console.log(imageTile);
        // console.log(src);

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
        OfflineTilesFactory.read(mapProvider, tileId, function(blob) {

          // do we have the image already?
          if (blob !== null) {

            // converts blobs to base64
            var blobToBase64 = function(blob, callback) {
              var reader = new window.FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = function() {
                var base64data = reader.result;
                callback(base64data);
              };
            };

            // yes, lets load the tile into the map
            blobToBase64(blob, function(base64data) {
              imgElement.src = base64data;
            });
          } else {
            // no, there is no such image in cache

            // is this a non-overlay tile?  we only show the unavailable tile image for non overlay tiles
            if (!isOverlay) {
              // not an overlay so show the user that the tile is unavailable
              imgElement.src = "img/offlineTiles/zoom" + z + ".png";
            }
          }
        });
      };
    };

    var offlineOverlayLayer = new ol.layer.Group({
      name: 'offlineOverlayLayer',
      title: 'Overlays (offline)',
      layers: [
        new ol.layer.Tile({
          title: "Geologic (z4-12)",
          id: "macrostratGeologic",
          type: 'overlay',
          opacity: 0.5,
          visible: false,
          source: new ol.source.OSM({
            tileLoadFunction: tileLoadFunction('macrostratGeologic', true)
          })
        })
      ]
    });

    // offline layer using tileLoadFunction source
    var offlineLayer = new ol.layer.Group({
      name: 'offlineLayer',
      title: 'Offline Maps',
      layers: [
        new ol.layer.Tile({
          title: 'Satellite',
          id: 'mqSat',
          type: 'base',
          visible: false,
          source: new ol.source.OSM({
              tileLoadFunction: tileLoadFunction('mqSat', false)
            }) //,
            //extent: mapExtent
        }),
        new ol.layer.Tile({
          title: 'Streets',
          id: 'mqOsm',
          type: 'base',
          visible: true, // default visible layer
          source: new ol.source.OSM({
              tileLoadFunction: tileLoadFunction('mqOsm', false)
            }) //,
            // extent: mapExtent
        })
      ]
    });


    factory.getFeatureLayer = function() {
      return featureLayer;
    };

    // factory.getDrawLayer = function() {
    //   return drawLayer;
    // };

    factory.getGeolocationLayer = function() {
      return geolocationLayer;
    };

    factory.getOnlineLayer = function() {
      return onlineLayer;
    };

    factory.getOnlineOverlayLayer = function() {
      return onlineOverlayLayer;
    };

    factory.getOfflineLayer = function() {
      return offlineLayer;
    };

    factory.getOfflineOverlayLayer = function() {
      return offlineOverlayLayer;
    };

    return factory;
  });
