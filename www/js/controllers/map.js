Math.radians = function(deg) {
  return deg * (Math.PI / 180);
}

angular.module('app')

.controller("MapCtrl", function(
  $scope,
  $rootScope,
  $cordovaGeolocation,
  $location,
  $filter,
  $ionicHistory,
  NewSpot,
  MapView,
  OfflineTilesFactory,
  SlippyTileNamesFactory,
  SpotsFactory,
  ViewExtentFactory) {
  /*
    $scope.$watch('navigator.onLine', function(navigator.onLine) {
      if (navigator.onLine)
        alert("online");
      else
        alert("offline");
    });
  */

  // ol3 map
  var map;

  // draw is a ol3 drawing interaction
  var draw;

  // this is the current visible layer from the layerswitcher
  var currentVisibleLayer;



  $scope.airplaneMode = false;

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

  // lets create a new map
  map = new ol.Map({
    target: 'mapdiv',
    view: new ol.View({
      projection: 'EPSG:3857',
      center: [-11000000, 4600000],
      zoom: 4,
      minZoom: 4
    }),
    // remove rotate icon from controls and add drawing controls
    controls: ol.control.defaults({rotate: false}).extend([
      new drawControls()
    ]),
    // turn off ability to rotate map via keyboard+mouse and using fingers on a mobile device
    interactions: ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false})
  });

  // vector layer where we house all the geojson spot objects
  var featureLayer = new ol.layer.Group({
    'title': 'Spot Features',
    layers: []
  });

  // add the feature layer to the map first
  map.addLayer(featureLayer);

  // overlay layer
  var overlayLayer = new ol.layer.Group({
    'title': 'Overlays',
    layers: [
      new ol.layer.Tile({
        title: "Geologic",
        type: 'overlay',
        opacity: 0.5,
        visible: false,
        source: new ol.source.XYZ({
            url: "http://macrostrat.org/tiles/geologic/{z}/{x}/{y}.png"
        })
      })
    ]
  });

  // 2nd, we add the overlay layer
  map.addLayer(overlayLayer);

  // layer switcher
  map.addControl(new ol.control.LayerSwitcher());

  // restricts the map constraint to these coordinates
  // var mapExtent = ol.proj.transformExtent([-180,80,180,-80], 'EPSG:4326', 'EPSG:3857');

  // online map layer of all possible online map providers
  var onlineLayer = new ol.layer.Group({
    'title': 'Online Maps',
    layers: [
      new ol.layer.Tile({
        title: 'Satellite',
        id: 'mqSat',
        type: 'base',
        visible: false,
        source: new ol.source.MapQuest({
          layer: 'sat'
        })//,
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

  // offline layer source
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
      OfflineTilesFactory.read(currentVisibleLayer, tileId, function(blob) {

        // do we have the image already?
        if (blob != null) {
          // yes, lets load the tile into the map
          blobToBase64(blob, function(base64data) {
            imgElement.src = base64data;
          });
        } else {
          // no, there is no such image in cache
          // show the user the tile is unavailable
          imgElement.src = "img/offlineTiles/zoom" + z + ".png";
        }
      });
    }
  });

  // offline map layer
  var OfflineTileLayer = new ol.layer.Tile({
    source: OfflineTileSource
  });

  // layer where the drawing will go to
  var drawLayer = new ol.layer.Vector({
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

  // Popup
  var popup = new ol.Overlay.Popup();
  map.addOverlay(popup);

  // Zoom
  map.addControl(new ol.control.Zoom());

  /////////////////
  // END MAP LAYERS
  /////////////////

  // update the current visible layer, there is no return type as it updates the scope variable directly
  var updateCurrentVisibleLayer = function() {

    // the first element in the layers array is our ol.layer.group that contains all the map tile layers
    var mapTileLayers = map.getLayers().getArray()[0].getLayers().getArray();

    // loop through and get the first layer that is visible
    var mapTileId = _.find(mapTileLayers, function(layer) {
      return layer.getVisible();
    });

    currentVisibleLayer = mapTileId.get('id');
  }

  // Watch whether we have internet access or not
  // This will eventually have to be read directly from phone
  $scope.$watch('airplaneMode', function(airplaneMode) {

    if (airplaneMode == true) {
      console.log("Offline");

      // update the current visible layer (we need to capture this before we remove the online map layer)
      updateCurrentVisibleLayer();

      // remove the online maps
      map.removeLayer(onlineLayer);

      // Add offline tile layer
      map.getLayers().insertAt(0, OfflineTileLayer);

      // clear the tiles, because we need to redraw if tiles have already been loaded to the screen
      OfflineTileSource.tileCache.clear();

      // re-render the map, grabs "new" tiles from storage
      map.render();
    } else {
      console.log("Online");
      map.removeLayer(OfflineTileLayer);
      // Add online map layer
      map.getLayers().insertAt(0, onlineLayer);

      // update the current visible layer
      updateCurrentVisibleLayer();
    }
  });

  // toggles whether we are in airplane or internet mode
  $scope.toggleAirplaneMode = function() {
    if ($scope.airplaneMode === false)
      $scope.airplaneMode = true;
    else
      $scope.airplaneMode = false;
  };

  // cache offline tiles if in internet mode
  $scope.cacheOfflineTiles = function() {
    if ($scope.airplaneMode === false) {
      // cache the tiles in the current view but don't switch to the offline layer

      // get the map extent
      var mapViewExtent = getMapViewExtent();

      updateCurrentVisibleLayer();

      // set the extent into the ViewExtentFactory
      ViewExtentFactory.setExtent(currentVisibleLayer, mapViewExtent.topRight, mapViewExtent.bottomLeft, mapViewExtent.zoom);

      $location.path("/app/map/archiveTiles");
    } else
      alert("Tiles can't be cached while offline.");
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
      var backView = $ionicHistory.backView();
      if (backView) {
        if (backView.stateName == "app.spot")
          backView.go();
      } else {
        $rootScope.$apply(function() {
          $location.path("/app/spots/newspot");
        });
      }
    });
    map.addInteraction(draw);
  }

  // If the map is moved save the view
  map.on('moveend', function(evt) {
    MapView.setMapView(map.getView());
  });

  //  do we currently have mapview set?  if so, we should reset the map view to that first
  if (MapView.getMapView()) {
    map.setView(MapView.getMapView());
  } else {
    // get the first spot from our database and set the map view with it as center
    SpotsFactory.getFirstSpot()
      .then(function(spot) {
        var mapCenter;
        // did we get a spot?
        if (spot == undefined) {
          // no -- then default the map to US center
          mapCenter = [-11000000, 4600000];
        } else {
          mapCenter = ol.proj.transform(spot.geometry.coordinates, 'EPSG:4326', 'EPSG:3857');
        }

        // reset the view
        map.setView(new ol.View({
          center: mapCenter,
          zoom: 4,
          minZoom: 4
        }));
      });
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

  // Point object
  var Point = function(lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }

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
  }



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
    }

    // imageStyle is a function because each point could have a different strike rotation
    var imageStyle = function(strike) {
      return new ol.style.Icon({
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels',
        opacity: 1,
        rotation: Math.radians(strike),
        src: 'img/strikedip.png'
      });
    }

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
              image: imageStyle(feature.values_.strike)
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
        }
        return styles[feature.getGeometry().getType()];
      }
    });
  }

  // Loop through all spots and create ol vector layers
  SpotsFactory.all().then(function(spots) {

    // bunch all the spots into a geojson feature collection
    var featureCollection = {
      "type": "FeatureCollection",
      "features": spots,
      "properties": {
        "name": "FC-1"
      }
    };

    var vectorLayer = geojsonToVectorLayer(featureCollection);
    // add the feature collection layer to the map
    featureLayer.getLayers().push(vectorLayer);

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
      })

      var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        return feature;
      });

      if (feature) {

        // popup content
        var content = '';
        content += '<table id="popup-table"><tr><td>';
        content += '<b>' + feature.get('name') + '</b>';
        content += '<br><small>' + feature.get('strike') + '&deg; strike / ' + feature.get('dip') + '&deg; dip</small>';
        content += '</td><td>';
        content += '<a href="#/app/spots/' + feature.get('id') + '" class="button icon-right ion-chevron-right button-clear button-dark"></a>';
        content += '</td></tr></table>';

        // setup the popup position
        popup.show(evt.coordinate, content);
      }
    }
  });

  // Get current position
  $scope.getLocation = function() {
    $cordovaGeolocation.getCurrentPosition().then(function(position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var newView = new ol.View({
        center: ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
        zoom: 18,
        minZoom: 4
      });
      map.setView(newView);
    }, function(err) {
      alert("Unable to get location: " + err.message);
    });
  }
});
