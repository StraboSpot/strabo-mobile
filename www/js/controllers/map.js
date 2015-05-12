Math.radians = function(deg) {
  return deg * (Math.PI / 180);
};

angular.module('app')
  .controller("MapCtrl", function(
    $scope,
    $rootScope,
    $cordovaGeolocation,
    $location,
    $filter,
    $ionicHistory,
    $ionicModal,
    $ionicPopup,
    $ionicActionSheet,
    NewSpot,
    MapView,
    OfflineTilesFactory,
    SlippyTileNamesFactory,
    SpotsFactory,
    ViewExtentFactory,
    ImagesFactory,
    MapLayerFactory) {

    // ol3 map
    var map;

    // draw is a ol3 drawing interaction
    var draw;

    // added draw controls
    var drawControls = function(opt_options) {

      var options = opt_options || {};

      var drawPoint, drawLine, drawPoly;

      drawPoint = document.createElement('a');
      drawPoint.id = 'drawPointControl';
      drawPoint.href = '#drawPointControl';
      drawPoint.className = 'point';

      drawLine = document.createElement('a');
      drawLine.id = 'drawLineControl';
      drawLine.href = '#drawLineControl';
      drawLine.className = 'line';

      drawPoly = document.createElement('a');
      drawPoly.id = 'drawPolyControl';
      drawPoly.href = '#drawPolyControl';
      drawPoly.className = 'poly';

      var handleDrawPoint = function(e) {
        if (drawPoint.style.backgroundColor === '')
          drawPoint.style.backgroundColor = '#DDDDDD';
        else
          drawPoint.style.backgroundColor = '';
        drawLine.style.backgroundColor = '';
        drawPoly.style.backgroundColor = '';

        e.preventDefault();
        $scope.startDraw("Point");
      };
      var handleDrawLine = function(e) {
        if (drawLine.style.backgroundColor === '')
          drawLine.style.backgroundColor = '#DDDDDD';
        else
          drawLine.style.backgroundColor = '';
        drawPoint.style.backgroundColor = '';
        drawPoly.style.backgroundColor = '';

        e.preventDefault();
        $scope.startDraw("LineString");
      };
      var handleDrawPoly = function(e) {
        if (drawPoly.style.backgroundColor === '')
          drawPoly.style.backgroundColor = '#DDDDDD';
        else
          drawPoly.style.backgroundColor = '';
        drawPoint.style.backgroundColor = '';
        drawLine.style.backgroundColor = '';

        e.preventDefault();
        $scope.startDraw("Polygon");
      };

      drawPoint.addEventListener('click', handleDrawPoint, false);
      drawPoint.addEventListener('touchstart', handleDrawPoint, false);

      drawLine.addEventListener('click', handleDrawLine, false);
      drawLine.addEventListener('touchstart', handleDrawLine, false);

      drawPoly.addEventListener('click', handleDrawPoly, false);
      drawPoly.addEventListener('touchstart', handleDrawPoly, false);

      var element = document.createElement('div');
      element.className = 'draw-controls ol-unselectable';

      element.appendChild(drawPoint);
      element.appendChild(drawLine);
      element.appendChild(drawPoly);

      ol.control.Control.call(this, {
        element: element,
        target: options.target
      });

    };

    ol.inherits(drawControls, ol.control.Control);

    // initial map view, used for setting the view upon map creation
    var initialMapView = new ol.View({
      projection: 'EPSG:3857',
      center: [-11000000, 4600000],
      zoom: 4,
      minZoom: 4
    });

    // lets create a new map
    map = new ol.Map({
      target: 'mapdiv',
      view: initialMapView,
      // remove rotate icon from controls and add drawing controls
      controls: ol.control.defaults({
        rotate: false
      }).extend([
        new drawControls()
      ]),
      // turn off ability to rotate map via keyboard+mouse and using fingers on a mobile device
      interactions: ol.interaction.defaults({
        altShiftDragRotate: false,
        pinchRotate: false
      })
    });



    // restricts the map constraint to these coordinates
    // var mapExtent = ol.proj.transformExtent([-180,80,180,-80], 'EPSG:4326', 'EPSG:3857');


    var mlf = MapLayerFactory;

    // map layers
    var onlineLayer = mlf.getOnlineLayer();
    var onlineOverlayLayer = mlf.getOnlineOverlayLayer();
    var offlineLayer = mlf.getOfflineLayer();
    var offlineOverlayLayer = mlf.getOfflineOverlayLayer();
    var geolocationLayer = mlf.getGeolocationLayer();
    var featureLayer = mlf.getFeatureLayer();
    // var drawLayer = mlf.getDrawLayer();  //bug, TODO

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

    ///////////////////////////
    // map adding layers
    ///////////////////////////

    // add the feature layer to the map first
    map.addLayer(featureLayer);

    // add draw layer
    map.addLayer(drawLayer);

    // add geolocation layer
    map.addLayer(geolocationLayer);

    // layer switcher
    map.addControl(new ol.control.LayerSwitcher());

    // Popup
    var popup = new ol.Overlay.Popup();
    map.addOverlay(popup);

    // Zoom
    map.addControl(new ol.control.Zoom());

    /////////////////
    // END MAP LAYERS
    /////////////////

    // did we come back from a map provider?
    if (OfflineTilesFactory.getCurrentMapProvider()) {
      // yes -- then we need to change the current visible layer
      console.log("back at map, ", OfflineTilesFactory.getCurrentMapProvider());

      var onlineLayerCollection = onlineLayer.getLayers().getArray();

      _.each(onlineLayerCollection, function(layer) {
        if (layer.get('id') == OfflineTilesFactory.getCurrentMapProvider()) {
          layer.setVisible(true);
        } else {
          layer.setVisible(false);
        }
      });
    }

    // update the current visible layer, there is no return type as it updates the scope variable directly
    var getCurrentVisibleLayer = function() {

      // the first element in the layers array is our ol.layer.group that contains all the map tile layers
      var mapTileLayers = map.getLayers().getArray()[0].getLayers().getArray();

      // loop through and get the first layer that is visible
      var mapTileId = _.find(mapTileLayers, function(layer) {
        return layer.getVisible();
      });

      return mapTileId.get('id');
    };

    $scope.isOnline = function() {
      return navigator.onLine;
    };

    // Watch whether we have internet access or not
      $scope.$watch('isOnline()', function(online) {

      if (!online) {
        console.log("Offline");

        // remove the online maps
        map.removeLayer(onlineLayer);
        map.removeLayer(onlineOverlayLayer);

        // Add offline tile layer
        map.getLayers().insertAt(0, offlineLayer);
        map.getLayers().insertAt(1, offlineOverlayLayer);

        // clear the tiles, because we need to redraw if tiles have already been loaded to the screen
        map.getLayers().getArray()[0].getLayers().item(0).getSource().tileCache.clear();
        map.getLayers().getArray()[0].getLayers().item(1).getSource().tileCache.clear();
        map.getLayers().getArray()[1].getLayers().item(0).getSource().tileCache.clear();

        // re-render the map, grabs "new" tiles from storage
        map.render();
      }
      else {
        console.log("Online");

        // remove the offline layers
        map.removeLayer(offlineLayer);
        map.removeLayer(offlineOverlayLayer);

        // Add online map layer
        map.getLayers().insertAt(0, onlineLayer);
        map.getLayers().insertAt(1, onlineOverlayLayer);
      }
    });

      // cache the tiles in the current view but don't switch to the offline layer
    $scope.cacheOfflineTiles = function() {
      if (navigator.onLine) {
        // get the map extent
        var mapViewExtent = getMapViewExtent();

        // set the extent into the ViewExtentFactory
        ViewExtentFactory.setExtent(getCurrentVisibleLayer(), mapViewExtent.topRight, mapViewExtent.bottomLeft, mapViewExtent.zoom);

        // we set the current map provider so if we ever come back, we should try to use that map provider instead of the default provider
        OfflineTilesFactory.setCurrentMapProvider(getCurrentVisibleLayer());

        $location.path("/app/map/archiveTiles");
      }
      else
        $ionicPopup.alert({
          title: 'Offline!',
          template: 'You must be online to save a map!'
        });
    };

    // drawButtonActive used to keep state of which selected drawing tool is active
    $scope.drawButtonActive = null;

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
      if (draw !== null) {
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
        var geojsonObj = JSON.parse(geojson.writeFeature(e.feature, {
          featureProjection: "EPSG:3857"
        }));

        // Initialize new Spot
        NewSpot.setNewSpot(geojsonObj);

        // If we got to the map from the spot view go back to that view
        var backView = $ionicHistory.backView();
        if (backView) {
          if (backView.stateName == "app.spot") {
            $rootScope.$apply(function() {
              $location.path("/app/spots/newspot");
            });
          }
        }
        else {
          // Initialize new Spot
          NewSpot.setNewSpot(geojsonObj);
          switch ($scope.drawButtonActive) {
            case "Point":
              $scope.openModal("pointModal");
              break;
            case "LineString":
              $scope.openModal("lineModal");
              break;
            case "Polygon":
              $scope.openModal("polyModal");
              break;
          }
        }
      });
      map.addInteraction(draw);
    };

    // If the map is moved save the view
    map.on('moveend', function(evt) {
      MapView.setMapView(map.getView());
    });

    // Zoom to the extent of the spots, if that fails geolocate the user
    $scope.zoomToSpotsExtent = function() {
      // nope, we have NO mapview set, so...

      // Loop through all spots and create ol vector layers
      SpotsFactory.all().then(function(spots) {

        // do we even have any spots?
        if (spots.length > 0) {
          console.log("found spots, attempting to get the center of all spots and change the map view to that");
          var cr = new CoordinateRange(spots);
          var newExtent = ol.extent.boundingExtent(cr._getAllCoordinates());
          var newExtentCenter = ol.extent.getCenter(newExtent);

          // fly-by map animation
          var duration = 2000;
          var start = +new Date();
          var pan = ol.animation.pan({
            duration: duration,
            source: map.getView().getCenter(),
            start: start
          });
          var bounce = ol.animation.bounce({
            duration: duration,
            resolution: map.getView().getResolution(),
            start: start
          });
          map.beforeRender(pan, bounce);

          if (spots.length === 1) {
            // we just have a single spot, so we should fixate the resolution manually
            initialMapView.setCenter(ol.proj.transform([newExtentCenter[0], newExtentCenter[1]], 'EPSG:4326', 'EPSG:3857'));
            initialMapView.setZoom(15);
          } else {
            // we have multiple spots -- need to create the new view with the new center
            var newView = new ol.View({
              center: ol.proj.transform([newExtentCenter[0], newExtentCenter[1]], 'EPSG:4326', 'EPSG:3857')
            });

            map.setView(newView);
            map.getView().fitExtent(ol.proj.transformExtent(newExtent, 'EPSG:4326', 'EPSG:3857'), map.getSize());
          }
        }
        // no spots either, then attempt to geolocate the user
        else {
          console.log("no spots found, attempting to geolocate");
          // attempt to geolocate instead
          $cordovaGeolocation.getCurrentPosition({
              maximumAge: 0,
              timeout: 10000,
              enableHighAccuracy: true
            })
            .then(function(position) {
              var lat = position.coords.latitude;
              var lng = position.coords.longitude;

              console.log("initial getLocation ", [lat, lng]);

              var newView = new ol.View({
                center: ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
                zoom: 17,
                minZoom: 4
              });
              map.setView(newView);
            }, function(err) {
              // uh oh, cannot geolocate, nor have any spots
              $ionicPopup.alert({
                title: 'Alert!',
                template: 'Could not geolocate your position.  Defaulting you to 0,0'
              });
              var newView = new ol.View({
                center: ol.proj.transform([0, 0], 'EPSG:4326', 'EPSG:3857'),
                zoom: 4,
                minZoom: 4
              });
              map.setView(newView);
            });
        }
      });
    };


    //  do we currently have mapview set?  if so, we should reset the map view to that first
    if (MapView.getMapView()) {
      console.log("have mapview set, changing map view to that");
      map.setView(MapView.getMapView());
    } else {
      $scope.zoomToSpotsExtent();
    }

    $scope.cancelDraw = function() {
      if (draw === null) return;
      map.removeInteraction(draw);
    };

    // converts blobs to base64
    var blobToBase64 = function(blob, callback) {
      var reader = new window.FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function() {
        base64data = reader.result;
        callback(base64data);
      };
    };

    // Point object
    var Point = function(lat, lng) {
      this.lat = lat;
      this.lng = lng;
    };

    var getMapViewExtent = function() {
      var extent = map.getView().calculateExtent(map.getSize());
      var zoom = map.getView().getZoom();
      var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent),
        'EPSG:3857', 'EPSG:4326');
      var topRight = ol.proj.transform(ol.extent.getTopRight(extent),
        'EPSG:3857', 'EPSG:4326');

      return {
        topRight: new Point(topRight[1], topRight[0]),
        bottomLeft: new Point(bottomLeft[1], bottomLeft[0]),
        zoom: zoom
      };
    };



    // we want to load all the geojson markers from the persistence storage onto the map
    // creates a ol vector layer for supplied geojson object
    var geojsonToVectorLayer = function(geojson) {

      // textStyle is a function because each point has a different text associated
      var textStyle = function(text) {
        return new ol.style.Text({
          font: '12px Calibri,sans-serif',
          text: text,
          fill: new ol.style.Fill({
            color: '#000'
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
          })
        });
      };

      var icon = {
        contact_outcrop: function(rotation) {
          return new ol.style.Icon({
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            opacity: 1,
            rotation: Math.radians(rotation),
            src: ImagesFactory.getImagePath('contact_outcrop'),
            scale: 0.75
          });
        },
        fault_outcrop: function(rotation) {
          return new ol.style.Icon({
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            opacity: 1,
            rotation: Math.radians(rotation),
            src: ImagesFactory.getImagePath('fault_outcrop'),
            scale: 1
          });
        },
        notes: function(rotation) {
          return new ol.style.Icon({
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            opacity: 1,
            rotation: Math.radians(rotation),
            src: ImagesFactory.getImagePath('notes'),
            scale: 0.75
          });
        },
        orientation: function(rotation) {
          return new ol.style.Icon({
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            opacity: 1,
            rotation: Math.radians(rotation),
            src: ImagesFactory.getImagePath('orientation'),
            scale: 1
          });
        },
        sample: function(rotation) {
          return new ol.style.Icon({
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            opacity: 1,
            rotation: Math.radians(rotation),
            src: ImagesFactory.getImagePath('sample'),
            scale: 0.07
          });
        },
        group: function(rotation) {
          return new ol.style.Icon({
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            opacity: 1,
            rotation: Math.radians(rotation),
            src: ImagesFactory.getImagePath('group'),
            scale: 0.4
          });
        },
        default: function(rotation) {
          return new ol.style.Icon({
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            opacity: 1,
            rotation: Math.radians(rotation),
            src: ImagesFactory.getImagePath('default'),
            scale: 0.75
          });
        }
      };


      var getIconForFeature = function(feature) {
        var contentModel = feature.get('type');
        var dip = null;
        var plunge = null;

        // do we have a dip?
        if (typeof feature.get('dip') !== 'undefined') {
          dip = feature.get('dip');
        }

        // do we have a plunge?
        if (typeof feature.get('plunge') !== 'undefined') {
          plunge = feature.get('plunge');
        }

        var rotation = (dip || plunge) ? dip || plunge : 0;

        switch (contentModel) {
          case "Contact":
            return icon.contact_outcrop(rotation);
          case "Fault":
            return icon.fault_outcrop(rotation);
          case "Notes":
            return icon.notes(rotation);
          case "Orientation":
            return icon.orientation(rotation);
          case "Rock Description":
            return icon.notes(rotation);
          case "Sample Locality":
            return icon.sample(rotation);
          case "Spot Grouping":
            return icon.group(rotation);
          default:
            return icon.default(rotation);
        }

        // if (contentModel == "Orientation") {
        //   // we do something else with orientation content models
        // } else {
        //   // get the links
        //   // TODO: what if there's more than one relationship?  What do we use then?
        //
        //   if (feature.get('links') === undefined) {
        //     // TODO: what if there's NO relationship?
        //     return;
        //   } else {
        //     var linkedRelationshipId = feature.get('links')[0].id;
        //     console.log("aaa", linkedRelationshipId);
        //
        //     // get the actual spot
        //     return SpotsFactory.getSpotId(linkedRelationshipId).then(function(spot) {
        //
        //       // we only care about orientations linkages at this point
        //       if (spot.properties.type == "Orientation") {
        //
        //         console.log("the spot is", spot);
        //
        //         var dip = null;
        //         var plunge = null;
        //
        //         // do we have a dip?
        //         if (typeof spot.properties.dip !== 'undefined') {
        //           dip = spot.properties.dip;
        //         }
        //
        //         // do we have a plunge?
        //         if (typeof spot.properties.plunge !== 'undefined') {
        //           plunge = spot.properties.plunge;
        //         }
        //
        //         var rotation = (dip || plunge) ? dip || plunge : 0;
        //
        //         switch(contentModel) {
        //           case "Contact Outcrop":
        //             return icon.contact_outcrop(rotation);
        //           case "Fault Outcrop":
        //             return icon.fault_outcrop(rotation);
        //           default:
        //             // TODO: do we want to put a default image when everything fails?
        //             break;
        //         }
        //
        //
        //       }
        //
        //
        //
        //
        //     });
        //   }
      };

      return new ol.layer.Vector({
        source: new ol.source.GeoJSON({
          object: geojson,
          projection: 'EPSG:3857'
        }),
        title: geojson.properties.name,
        style: function(feature, resolution) {

          var styles = {
            'Point': [
              new ol.style.Style({
                image: getIconForFeature(feature)
              }),
              new ol.style.Style({
                text: textStyle(feature.values_.name)
              })
            ],

            'LineString': [
              new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: "#000000",
                  width: 10
                })
              }),
              new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: "#ff0000",
                  width: 8
                })
              }),
              new ol.style.Style({
                text: textStyle(feature.values_.name)
              })
            ],

            'Polygon': [
              new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: "#000000",
                  width: 10
                })
              }),
              new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: "#035339",
                  width: 8
                })
              }),
              new ol.style.Style({
                text: textStyle(feature.values_.name)
              })
            ]
          };
          return styles[feature.getGeometry().getType()];
        }
      });
    };

    // Loop through all spots and create ol vector layers
    SpotsFactory.all().then(function(spots) {

      // wipe the array because we want to avoid duplicating the feature in the ol.Collection
      featureLayer.getLayers().clear();

      // get distinct groups and aggregate spots by group type
      var spotGroup = _.groupBy(spots, function(spot) {
        return spot.properties.type;
      });

      // go through each group and assign all the aggregates to the geojson feature
      for (var key in spotGroup) {
        if (spotGroup.hasOwnProperty(key)) {
          // create a geojson to hold all the spots that fit the same spot type
          var spotTypeLayer = {
            type: 'FeatureCollection',
            features: spotGroup[key],
            properties: {
              name: key + ' (' + spotGroup[key].length + ')'
            }
          };

          // add the feature collection layer to the map
          featureLayer.getLayers().push(geojsonToVectorLayer(spotTypeLayer));
        }
      }
    });

    map.on('touchstart', function(event) {
      console.log("touch");
      console.log(event);
    });

    // display popup on click
    map.on('click', function(evt) {

      console.log("map clicked");

      // are we in draw mode?  If so we dont want to display any popovers during draw mode
      if (!draw) {

        // where the user just clicked
        var coordinate = evt.coordinate;

        // clear any existing popovers
        popup.hide();

        map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
          console.log("feature", feature);
          console.log("layer", layer);
        });

        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
          return feature;
        });

        var layer = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
          return layer;
        });

        // we need to check that we're not clicking on the geolocation layer
        if (feature && layer.get('name') != 'geolocationLayer') {

          // popup content
          var content = '';
          content += '<a href="#/app/spots/' + feature.get('id') + '"><b>' + feature.get('name') + '</b></a>';
          content += '<br>';
          content += '<small>' + feature.get('type') + '</small>';
          content += '<small> (' + feature.getGeometry().getType() + ')</small>';

          if (feature.get('strike') && feature.get('dip')) {
            content += '<br>';
            content += '<small>' + feature.get('strike') + '&deg; strike / ' + feature.get('dip') + '&deg; dip</small>';
          }

          if (feature.get('trend') && feature.get('plunge')) {
            content += '<br>';
            content += '<small>' + feature.get('trend') + '&deg; trend / ' + feature.get('plunge') + '&deg; plunge</small>';
          }

          // setup the popup position
          popup.show(evt.coordinate, content);
        }
      }
    });

    // Get current position
    $scope.getLocation = function() {

      console.log("clicked getLocation");

      $cordovaGeolocation.getCurrentPosition({
          maximumAge: 0,
          timeout: 10000,
          enableHighAccuracy: true
        })
        .then(function(position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          var altitude =  position.coords.altitude;
          var accuracy = position.coords.accuracy;
          var heading = position.coords.heading;
          var speed = position.coords.speed;

          console.log("getLocation ", [lat, lng], "(accuracy: " + accuracy + ") (altitude: " + altitude + ") (heading: " + heading + ") (speed: " + speed + ")");

          var newView = new ol.View({
            center: ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
            zoom: 18,
            minZoom: 4
          });
          map.setView(newView);
        }, function(err) {
          $ionicPopup.alert({
            title: 'Alert!',
            template: "Unable to get location: " + err.message
          });
        });

      $cordovaGeolocation.watchPosition({
          frequency: 1000,
          timeout: 10000,
          enableHighAccuracy: true // may cause errors if true
        })
        .then(
          null,
          function(err) {
            $ionicPopup.alert({
              title: 'Alert!',
              template: "Unable to get location: " + err.message
            });
            // TODO: what do we do here?
          },
          function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var altitude =  position.coords.altitude;
            var accuracy = position.coords.accuracy;
            var altitudeAccuracy = position.coords.altitudeAccuracy;
            var heading = position.coords.heading;
            var speed = position.coords.speed;

            console.log("getLocation-watch ", [lat, lng], "(accuracy: " + accuracy + ") (altitude: " + altitude + ") (heading: " + heading + ") (speed: " + speed + ")");

            // create a point feature and assign the lat/long to its geometry
            var iconFeature = new ol.Feature({
              geometry: new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'))
            });

            // add addition geolocation data to the feature so we can recall it later
            iconFeature.set('altitude', altitude);
            iconFeature.set('accuracy', (accuracy === null) ? null : Math.floor(accuracy));
            iconFeature.set('altitudeAccuracy', altitudeAccuracy);
            iconFeature.set('heading', heading);
            iconFeature.set('speed', (speed === null) ? null : Math.floor(speed));

            var vectorSource = new ol.source.Vector({
              features: [iconFeature]
            });

            geolocationLayer.setSource(vectorSource);
          });
    };

    /////////////////
    // ACTIONSHEET
    /////////////////

    $scope.showActionsheet = function() {

      $ionicActionSheet.show({
        titleText: 'Map Actions',
        buttons: [
          {text: '<i class="icon ion-map"></i> Zoom to Extent of Spots'},
          {text: '<i class="icon ion-archive"></i>Save Map for Offline Use'},
        ],
        cancelText: 'Cancel',
        cancel: function () {
          console.log('CANCELLED');
        },
        buttonClicked: function (index) {
          console.log('BUTTON CLICKED', index);
          switch(index) {
            case 0:
              $scope.zoomToSpotsExtent();
              break;
            case 1:
              $scope.cacheOfflineTiles();
              break;
          }
          return true;
        }
      });
    };

    /////////////////
    // MODALS
    /////////////////

    $ionicModal.fromTemplateUrl('templates/modals/pointModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.pointModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modals/lineModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.lineModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modals/polyModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.polyModal = modal;
    });

    $scope.openModal = function(modal) {
      $scope[modal].show();
    };

    $scope.closeModal = function() {
      $scope.pointModal.hide();
      $scope.lineModal.hide();
      $scope.polyModal.hide();
    };

    //Cleanup the modal when we're done with it!
    // Execute action on hide modal
    $scope.$on('pointModal.hidden', function() {
      $scope.pointModal.remove();
    });
    $scope.$on('lineModal.hidden', function() {
      $scope.lineModal.remove();
    });
    $scope.$on('polyModal.hidden', function() {
      $scope.polyModal.remove();
    });
  });
