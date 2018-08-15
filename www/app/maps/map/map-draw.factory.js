(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapDrawFactory', MapDrawFactory);

  MapDrawFactory.$inject = ['$document', '$ionicPopup', '$location', '$log', '$q', '$rootScope', 'HelpersFactory',
    'SpotFactory', 'IS_WEB'];

  function MapDrawFactory($document, $ionicPopup, $location, $log, $q, $rootScope, HelpersFactory, SpotFactory,
                          IS_WEB) {
    var drawCtrls = {};               // ol3 drawing interactions
    var drawButtonActive;             // drawButtonActive used to keep state of which selected drawing tool is active
    var drawLayer;
    var featuresOrig = [];
    var isFreeHand;
    var lassoMode;                    // mode of current lasso (tag or stereonet)
    var maps = {};
    var modify;
    var segmentLength = undefined;    // real length of a line segment defined by the user
    var spotsEdited = [];             // array of spots edited with the edit button
    var unitChoice = undefined;       // units used for the real length of a line segment defined by the user

    // Variables for a long press event
    var longpress = false;
    var endTime;
    var startTime;

    return {
      'cancelEdits': cancelEdits,
      'doOnDrawEnd': doOnDrawEnd,
      'DrawControls': DrawControls,
      'getDrawMode': getDrawMode,
      'getLassoMode': getLassoMode,
      'groupSpots': groupSpots,
      'isDrawMode': isDrawMode,
      'measureLength': measureLength,
      'saveEdits': saveEdits,
      'setLassoMode': setLassoMode,
      'stereonetSpots': stereonetSpots
    };

    /**
     * Private Functions
     */

    // Calculate the real image width based on the actual width of a segment defined by the user
    function calculateImageWidth(geometry, image) {
      $log.log(geometry.getCoordinates());
      var allPos = _.every(_.flatten(geometry.getCoordinates()), function (pt) {
        return pt >= 0;
      });
      if (!allPos) $log.log('Negative Number');
      else {
        promptForSegmentLength().then(function (segmentReal) {
          $log.log(segmentReal);
          var segmentLengthPixel = geometry.getLength();
          var imageWidthPixel = image.width;
          var imageWidthReal = (segmentReal.length * imageWidthPixel) / segmentLengthPixel;
          imageWidthReal = HelpersFactory.roundToDecimalPlaces(imageWidthReal, 2);
          var unitsDisplay = segmentReal.units === '_m' ? 'um' : segmentReal.units;

          var confirmPopup = $ionicPopup.confirm({
            'title': 'Calculated Image Width',
            'template': 'Image width calculated as ' + imageWidthReal + unitsDisplay + ' based on drawn' +
              ' line segment. Update and save image properties?'
          });
          confirmPopup.then(function (res) {
            if (res) {
              image.width_of_image_view = imageWidthReal;
              image.units_of_image_view = segmentReal.units;
              var spot = SpotFactory.getSpotWithImageId(image.id);
              _.each(spot.properties.images, function (img, i) {
                if (img.id === image.id) spot.properties.images[i] = image;
              });
              SpotFactory.save(spot);
            }
          });
        });
      }
    }

    // Remove draw interaction
    function cancelDraw(mapName) {
      mapName = mapName ? mapName : 'default';
      var draw = drawCtrls[mapName];
      var map = maps[mapName];
      if (draw !== null) {
        $log.log('Canceling draw ...');
        map.removeInteraction(draw);
        drawCtrls[mapName] = null;
        drawButtonActive = null;
      }
      cancelEdits(mapName);
    }

    function enableDrawMode(inIsFreeHand, type, mapName) {
      mapName = mapName ? mapName : 'default';
      var map = maps[mapName];
      isFreeHand = inIsFreeHand;
      if (isFreeHand) {
        // yes -- then disable the map drag pan
        map.getInteractions().forEach(function (interaction) {
          if (interaction instanceof ol.interaction.DragPan) {
            $log.log(interaction);
            map.getInteractions().remove(interaction);
          }
        });
        drawCtrls[mapName] = new ol.interaction.Draw({
          'source': drawLayer.getSource(),
          'type': type,
          'condition': ol.events.condition.singleClick,
          'freehandCondition': ol.events.condition.noModifierKeys,
          'snapTolerance': 96
        });
      }
      else {
        drawCtrls[mapName] = new ol.interaction.Draw({
          'source': drawLayer.getSource(),
          'type': type
        });
      }
      var draw = drawCtrls[mapName];
      map.addInteraction(draw);
      $rootScope.$broadcast('changedDrawMode', mapName);
    }

    function enableEditMode(mapName) {
      mapName = mapName ? mapName : 'default';
      var map = maps[mapName];
      var features = [];
      featuresOrig = [];
      map.getLayers().forEach(function (layerGroup) {
        if (layerGroup.get('name') === 'featureLayer') {
          layerGroup.getLayers().forEach(function (layer) {
            features.push.apply(features, layer.getSource().getFeatures());
          });
          modify = new ol.interaction.Modify({
            'features': new ol.Collection(features),
            // the SHIFT key must be pressed to delete vertices, so
            // that new vertices can be drawn at the same position
            // of existing vertices
            'deleteCondition': function (event) {
              return (ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event)) ||
                (longpress && ol.events.condition.singleClick(event));
            }
          });
        }
      });
      map.addInteraction(modify);
      $rootScope.$broadcast('enableSaveEdits', true, mapName);

      // Create a trigger for a change in any of the features
      features.forEach(function (feature) {
        featuresOrig.push(feature.clone());
        feature.on('change', function (e) {
          var spot = JSON.parse(JSON.stringify(SpotFactory.getSpotById(e.target.get('id'))));

          var newGeom = e.target.get('geometry');
          var newCoords = newGeom.getCoordinates();
          if (map.getView().getProjection().getUnits() !== 'pixels') {
            switch (newGeom.getType()) {
              case 'Point':
                newCoords = ol.proj.toLonLat(newCoords);
                break;
              case 'LineString' || 'MultiPoint':
                newCoords = _.map(newCoords, function (coords) {
                  return ol.proj.toLonLat(coords);
                });
                break;
              case 'Polygon' || 'MultiLineString':
                _.each(newCoords, function (coords, i) {
                  newCoords[i] = _.map(coords, function (coord) {
                    return ol.proj.toLonLat(coord);
                  });
                });
                break;
              case 'MultiPolygon':
                _.each(newCoords, function (polyCoords, i) {
                  _.each(polyCoords, function (coords, j) {
                    polyCoords[j] = _.map(coords, function (coord) {
                      return ol.proj.toLonLat(coord);
                    });
                  });
                  newCoords[i] = polyCoords;
                });
                break;
              default:
                return;
            }
          }
          spot.geometry.coordinates = newCoords;
          spotsEdited = _.reject(spotsEdited, function (spotEdited) {
            return spotEdited.properties.id === spot.properties.id;
          });
          spotsEdited.push(spot);
        });
      });
    }

    function promptForSegmentLength() {
      var deferred = $q.defer(); // init promise

      var template = '<ion-input class="item item-input">' +
        '<input type="number" placeholder="Segment length:" ng-model="segmentLength">' +
        '</ion-input>' +
        '<ion-list>' +
        '<ion-radio ng-model="unitChoice" ng-value="\'_m\'">um</ion-radio>' +
        '<ion-radio ng-model="unitChoice" ng-value="\'mm\'">mm</ion-radio>' +
        '<ion-radio ng-model="unitChoice" ng-value="\'cm\'">cm</ion-radio>' +
        '<ion-radio ng-model="unitChoice" ng-value="\'m\'">m</ion-radio>' +
        '<ion-radio ng-model="unitChoice" ng-value="\'km\'">km</ion-radio>' +
        '</ion-list>';

      var segmentLengthPopup = $ionicPopup.show({
        'title': 'Line Segment Info',
        'template': template,
        'scope': this,
        'buttons': [{
          'text': 'Cancel'
        }, {
          'text': '<b>OK</b>',
          'type': 'button-positive',
          'onTap': function (e) {
            if (this.scope.segmentLength === undefined || this.scope.segmentLength <= 0 ||
              this.scope.unitChoice === undefined) e.preventDefault();
            else {
              segmentLength = this.scope.segmentLength;
              unitChoice = this.scope.unitChoice;
              return e;
            }
          }
        }]
      });

      segmentLengthPopup.then(function (res) {
        if (res) deferred.resolve({'length': segmentLength, 'units': unitChoice});
        else deferred.reject();
      });
      return deferred.promise;
    }

    function startDraw(type, inIsFreeHand, mapName) {
      $log.log('Starting draw ...');
      isFreeHand = inIsFreeHand;
      drawButtonActive = type;
      if (type === 'Edit') enableEditMode(mapName);
      else enableDrawMode(isFreeHand, type, mapName);
    }

    /**
     * Public Functions
     */

    // Restore modified features and remove modify interaction
    function cancelEdits(mapName) {
      mapName = mapName ? mapName : 'default';
      var map = maps[mapName];
      if (!_.isEmpty(modify)) {
        // Cancel the edits (revert to original geometry)
        map.getLayers().forEach(function (layerGroup) {
          if (layerGroup.get('name') === 'featureLayer') {
            layerGroup.getLayers().forEach(function (layer) {
              layer.getSource().getFeatures().forEach(function (feature) {
                var isEdited = _.find(spotsEdited, function (spotEdited) {
                  return spotEdited.properties.id === feature.get('id');
                });
                if (isEdited) {
                  var match = _.find(featuresOrig, function (spotOrig) {
                    return spotOrig.get('id') === feature.get('id');
                  });
                  feature.getGeometry().setCoordinates(match.getGeometry().getCoordinates());
                }
              });
            });
          }
        });
        map.removeInteraction(modify);
        featuresOrig = [];
        spotsEdited = [];
        modify = null;
        drawButtonActive = null;
        var editBtn = $document[0].getElementById('drawEditControl');
        editBtn.style.backgroundColor = '';
        $rootScope.$broadcast('enableSaveEdits', false, mapName);
      }
    }

    function doOnDrawEnd(e, image, spotWithThisImage, mapName) {
      mapName = mapName ? mapName : 'default';
      var draw = drawCtrls[mapName];
      var map = maps[mapName];

      var belongsTo = {};
      if (!_.isEmpty(image) && image.id) belongsTo = {'image_basemap': image.id};
      else if (!_.isEmpty(image) && image.strat_section_id) belongsTo = {'strat_section_id': image.strat_section_id};

      // drawend event needs to end the drawing interaction
      map.removeInteraction(draw);

      // clear the drawing
      drawLayer.setSource(new ol.source.Vector());

      if (lassoMode) {
        // add the regular draw controls back
        var drawControlProps = {
          'map': map,
          'drawLayer': drawLayer
        };

        map.addControl(new DrawControls(drawControlProps));

        // add the layer switcher controls back
        map.addControl(new ol.control.LayerSwitcher());

        // add the dragging back in
        map.addInteraction(new ol.interaction.DragPan());
      }

      // we want a geojson object when the user finishes drawing
      var geojson = new ol.format.GeoJSON();

      // the actual geojson object that was drawn
      var geojsonObj;
      if (map.getView().getProjection().getUnits() === 'pixels') {
        geojsonObj = geojson.writeFeatureObject(e.feature, {'decimals': 6});
        if (!_.isEmpty(belongsTo) && spotWithThisImage) {
          geojsonObj.properties = belongsTo;           // Image Basemap or Strat Section
          // Set lat and lng properties for Spot if it's being mapped on an image basemap or strat section
          if (spotWithThisImage.properties.image_basemap || spotWithThisImage.properties.strat_section_id) {
            // If parent is mapped on an image basemap or strat section grab from lat and lng properties of parent
            if (spotWithThisImage.properties.lat) geojsonObj.properties.lat = spotWithThisImage.properties.lat;
            if (spotWithThisImage.properties.lng) geojsonObj.properties.lng = spotWithThisImage.properties.lng;
          }
          else if (!_.isEmpty(spotWithThisImage.geometry)) {
            // If parent Spot is mapped geographically take the center of the geometry to user for lat and lng
            var center = turf.center(spotWithThisImage);
            geojsonObj.properties.lat = HelpersFactory.roundToDecimalPlaces(turf.getCoords(center)[1], 6);
            geojsonObj.properties.lng = HelpersFactory.roundToDecimalPlaces(turf.getCoords(center)[0], 6);
          }
        }

        if (_.find(_.flatten(geojsonObj.geometry.coordinates),
          function (num) {
            return num < 0;
          }
        )) {
          $ionicPopup.alert({
            'title': 'Out of Bounds',
            'template': 'Spot coordinate is off the image. Try again.'
          });
          return;
        }
      }
      else {
        // Drawing on regular map
        geojsonObj = geojson.writeFeatureObject(e.feature, {
          'featureProjection': map.getView().getProjection(),  // 'EPSG:3857'
          'decimals': 6
        });
      }

      if (lassoMode === 'stereonet' || lassoMode === 'tags') {
        // contains all the lassoed objects
        var lassoedSpots = [];

        var spots = SpotFactory.getActiveSpots();

        var mappedSpots = _.filter(spots, function (spot) {
          return spot.geometry;
        });
        if (!_.isEmpty(belongsTo) && belongsTo.image_basemap) {
          var spotsOnImageBasemap = _.filter(mappedSpots, function (mappedSpot) {
            return mappedSpot.properties.image_basemap;
          });
          mappedSpots = _.filter(spotsOnImageBasemap, function (spotOnImageBasemap) {
            return spotOnImageBasemap.properties.image_basemap === belongsTo.image_basemap;
          });
        }
        if (!_.isEmpty(belongsTo) && belongsTo.strat_section_id) {
          var spotsOnStratSection = _.filter(mappedSpots, function (mappedSpot) {
            return mappedSpot.properties.strat_section_id;
          });
          mappedSpots = _.filter(spotsOnStratSection, function (spotOnStratSection) {
            return spotOnStratSection.properties.strat_section_id === belongsTo.strat_section_id;
          });
        }
        _.each(mappedSpots, function (spot) {
          // if the spot is a point, we test using turf.booleanWithin
          // if the spot is a polygon or line, we test using turf.intersect

          var spotType = spot.geometry.type;

          if (spotType === 'Point') {
            // is the point inside the drawn polygon?
            if (turf.booleanWithin(spot, geojsonObj)) {
              //check here whether it is on map
              lassoedSpots.push(spot);
            }
          }

          if (spotType === 'LineString' || spotType === 'Polygon') {
            // is the line or polygon within/intersected in the drawn polygon?
            if (turf.intersect(spot, geojsonObj)) {
              //check here whether it is on map
              lassoedSpots.push(spot);
            }
          }
        });
        SpotFactory.setSelectedSpots(lassoedSpots);

      }
      else {
        $log.log('Drawend: Normal (not freehand)');
        var currentSpot = SpotFactory.getCurrentSpot();
        if (currentSpot && SpotFactory.moveSpot) {
          currentSpot.geometry = geojsonObj.geometry;
          SpotFactory.save(currentSpot).then(function () {
            $location.path('/app/spotTab/' + currentSpot.properties.id + '/spot');
          });
        }
        else if (lassoMode === 'measure') {
          lassoMode = "";
          if (image) {
            $log.log('Calculating image width ...');
            $log.log('Measure Line:', geojsonObj, 'Image:', image);
            var geometry = e.feature.getGeometry();
            if (geometry.getCoordinates().length > 2) {
              var alertPopup = $ionicPopup.alert({
                'title': 'Multiple Line Segments',
                'template': 'This line has multiple line segments. Using only the first line segment for the width calculation.'
              });
              alertPopup.then(function () {
                geometry.setCoordinates(geometry.getCoordinates().splice(0, 2));
                calculateImageWidth(geometry, image);
              });
            }
            else calculateImageWidth(geometry, image);
          }
        }
        else {
          SpotFactory.setNewSpot(geojsonObj).then(function (id) {
            $location.path('/app/spotTab/' + id + '/spot');
          });
        }
      }
    }

    function DrawControls(opt_options) {
      var map = opt_options.map;
      var mapName = map.getTarget() === 'mapdiv' ? 'default' : map.getTarget();
      maps[mapName] = map;
      drawLayer = opt_options.drawLayer;
      drawCtrls[mapName] = null;
      drawButtonActive = null;
      modify = null;

      var element = $document[0].createElement('div');
      element.className = 'draw-controls ol-unselectable';

      var drawControls = {'Point': {}, 'LineString': {}, 'Polygon': {}, 'Edit': {}};
      _.each(drawControls, function (value, key) {
        drawControls[key] = $document[0].createElement('a');
        drawControls[key].id = 'draw' + key + 'Control';
        drawControls[key].className = key;
        drawControls[key].style.backgroundColor = 'transparent';
        if (IS_WEB) drawControls[key].addEventListener('click', handleClick);
        if (IS_WEB) drawControls[key].addEventListener('dblclick', handleDoubleClick);
        if (!IS_WEB) drawControls[key].addEventListener('touchstart', handleTouchStart);
        if (!IS_WEB) drawControls[key].addEventListener('touchend', handleTouchEnd);
        element.appendChild(drawControls[key]);
      });

      function handleClick(e) {
        longpress = false;
        handleDraw(e, mapName);
      }

      function handleDoubleClick(e) {
        $log.log('double');
        longpress = true;
        handleDraw(e, mapName);
      }

      function handleTouchStart() {
        longpress = false;
        startTime = new Date().getTime();
      }

      function handleTouchEnd(e) {
        endTime = new Date().getTime();
        longpress = endTime - startTime >= 500;
        handleDraw(e, mapName);
      }

      function handleDraw(e, mapName) {
        cancelDraw(mapName);

        // Set clicked control to gray and all others to transparent
        _.each(drawControls, function (value, key) {
          if (value.id === e.target.id) {
            if (e.target.style.backgroundColor === 'transparent' || longpress) {
              drawControls[key].style.backgroundColor = '#DDDDDD';
            }
            else drawControls[key].style.backgroundColor = 'transparent';
          }
          else drawControls[key].style.backgroundColor = 'transparent';
        });

        // Freehand line and freehand poly are still under the controls line and poly respectively
        var control = e.target.className;
        if (e.target.className === 'LineStringFreehand') control = 'LineString';
        else if (e.target.className === 'PolygonFreehand') control = 'Polygon';

        // If long press switch classes for line and poly
        if (longpress && (e.target.id === 'drawLineStringControl' || e.target.id === 'drawPolygonControl')) {
          if (e.target.className === 'LineString') e.target.className = 'LineStringFreehand';
          else if (e.target.className === 'LineStringFreehand') e.target.className = 'LineString';
          else if (e.target.className === 'Polygon') e.target.className = 'PolygonFreehand';
          else if (e.target.className === 'PolygonFreehand') e.target.className = 'Polygon';
        }

        // Cancel draw if button transparent otherwise start draw with or without freehand based on class
        if (e.target.style.backgroundColor === 'transparent') cancelDraw(mapName);
        else if (e.target.className === 'LineStringFreehand' || e.target.className === 'PolygonFreehand') {
          startDraw(control, true, mapName);
        }
        else startDraw(control, false, mapName);
      }

      ol.control.Control.call(this, {
        'element': element//,
        // 'target': options.target  // ToDo Not Needed
      });

      // Recognize a long press - used for deleting vertexes
      map.on('pointerdown', function () {
        longpress = false;
        startTime = new Date().getTime();
      });

      map.on('pointerup', function () {
        endTime = new Date().getTime();
        longpress = endTime - startTime >= 500;
      });
    }

    function getDrawMode(mapName) {
      mapName = mapName ? mapName : 'default';
      return drawCtrls[mapName];
    }

    function getLassoMode() {
      return lassoMode;
    }

    // Create a group of spots by drawing a polygon on the map
    function groupSpots() {
      var map = maps['default'];
      // Remove layer switcher and drawing tools to to avoid confusion
      // with lasso and regular drawing
      map.getControls().forEach(function (control) {
        if (control instanceof ol.control.LayerSwitcher ||
          control instanceof DrawControls) {
          map.removeControl(control);
        }
      });

      var alertPopup = $ionicPopup.alert({
        'title': 'Tag Spots',
        'template': 'Draw a polygon around the Spots you would like to Tag.'
      });
      alertPopup.then(function () {
        // start the draw with freehand enabled
        lassoMode = "tags";
        startDraw('Polygon', true);
      });
    }

    function isDrawMode(mapName) {
      mapName = mapName ? mapName : 'default';
      var draw = drawCtrls[mapName];
      return !_.isEmpty(draw) || !_.isEmpty(modify);
    }

    function saveEdits(clickedFeatureId, mapName) {
      mapName = mapName ? mapName : 'default';
      var map = maps[mapName];
      $log.log('Saving edited spots ...', spotsEdited);
      var promises = [];
      _.each(spotsEdited, function (editedSpot) {
        // If the edited spot was an interval in a strat section recalculate the thickness
        if (editedSpot.properties.strat_section_id && editedSpot.properties.surface_feature &&
          editedSpot.properties.surface_feature.surface_feature_type === 'strat_interval') {
          var geometry = new ol.format.GeoJSON().readFeature(editedSpot).getGeometry();
          // Make sure edited intervals do not have min x or min y values less than 0
          var coords = _.map(geometry.getCoordinates()[0], function (coord) {
            return [coord[0] > 0 ? coord[0] : 0, coord[1] > 0 ? coord[1] : 0];
          });
          editedSpot.geometry.coordinates = [coords];
          geometry.setCoordinates([coords]);
          var extent = geometry.getExtent();
          var thickness = (extent[3] - extent[1]) / 20; // 20 is yMultiplier - see StratSectionFactory
          thickness = HelpersFactory.roundToDecimalPlaces(thickness, 2);
          if (!editedSpot.properties.sed) editedSpot.properties.sed = {};
          if (!editedSpot.properties.sed.lithologies) editedSpot.properties.sed.lithologies = {};
          editedSpot.properties.sed.lithologies.interval_thickness = thickness;
          // Update Map Feature
          map.getLayers().forEach(function (layerGroup) {
            if (layerGroup.get('name') === 'featureLayer') {
              layerGroup.getLayers().forEach(function (layer) {
                layer.getSource().getFeatures().forEach(function (feature) {
                  if (feature.get('id') === editedSpot.properties.id) {
                    feature.setProperties(editedSpot.properties);       // Update map feature with new thickness
                    feature.getGeometry().setCoordinates([coords]);     // Update map feature with new geometry
                  }
                });
              });
            }
          });
        }
        promises.push(SpotFactory.save(editedSpot));
        // Update the displayed geometry if edited feature is being displayed in the map side panel
        if (IS_WEB && editedSpot.properties.id === clickedFeatureId) {
          $rootScope.$broadcast('update-spot-geometry', {'movedSpotGeometry': editedSpot.geometry});
        }
      });
      $q.all(promises).then(function () {
        featuresOrig = [];
        spotsEdited = [];
        cancelEdits(mapName);
      });
    }

    function setLassoMode(lmode) {
      lassoMode = lmode;
    }

    // Prompt the user to define a line on the image which has a known length
    function measureLength() {
      var map = maps['default'];
      // Remove layer switcher and drawing tools to to avoid confusion
      // with lasso and regular drawing
      map.getControls().forEach(function (control) {
        if (control instanceof ol.control.LayerSwitcher ||
          control instanceof DrawControls) {
          map.removeControl(control);
        }
      });
      var alertPopup = $ionicPopup.alert({
        'title': 'Calculate Image Width',
        'template': 'Draw a line on the image which has a known length.'
      });
      alertPopup.then(function () {
        lassoMode = "measure";
        startDraw('LineString', false);
      });
    }

    // Lasso spots and copy to clipboard for Stereonet Output
    function stereonetSpots() {
      var map = maps['default'];
      // Remove layer switcher and drawing tools to to avoid confusion
      // with lasso and regular drawing
      map.getControls().forEach(function (control) {
        if (control instanceof ol.control.LayerSwitcher ||
          control instanceof DrawControls) {
          map.removeControl(control);
        }
      });

      var alertPopup = $ionicPopup.alert({
        'title': 'Choose Spots',
        'template': 'Draw a polygon around the Spots you would like to transfer to Rick Allmendinger\'s Stereonet app.'
      });
      alertPopup.then(function () {
        // start the draw with freehand enabled
        lassoMode = "stereonet";
        startDraw('Polygon', true);
      });
    }
  }
}());
