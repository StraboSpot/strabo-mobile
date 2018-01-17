(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapDrawFactory', MapDrawFactory);

  MapDrawFactory.$inject = ['$document', '$ionicPopup', '$location', '$log', '$q', '$rootScope', 'HelpersFactory',
    'SpotFactory', 'IS_WEB'];

  function MapDrawFactory($document, $ionicPopup, $location, $log, $q, $rootScope, HelpersFactory, SpotFactory,
                          IS_WEB) {
    var belongsTo;
    var draw;               // draw is a ol3 drawing interaction
    var drawButtonActive;   // drawButtonActive used to keep state of which selected drawing tool is active
    var drawLayer;
    var featuresOrig = [];
    var isFreeHand;
    var lassoMode;          // mode of current lasso (tag or stereonet)
    var map;
    var modify;
    var spotsEdited = [];    // array of spots edited with the edit button

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
      'saveEdits': saveEdits,
      'setLassoMode': setLassoMode,
      'stereonetSpots': stereonetSpots
    };

    /**
     * Private Functions
     */

    // Remove draw interaction
    function cancelDraw() {
      if (draw !== null) {
        map.removeInteraction(draw);
        draw = null;
        drawButtonActive = null;
      }
    }

    function enableDrawMode(inIsFreeHand, type) {
      isFreeHand = inIsFreeHand;
      if (isFreeHand) {
        // yes -- then disable the map drag pan
        map.getInteractions().forEach(function (interaction) {
          if (interaction instanceof ol.interaction.DragPan) {
            $log.log(interaction);
            map.getInteractions().remove(interaction);
          }
        });
        draw = new ol.interaction.Draw({
          'source': drawLayer.getSource(),
          'type': type,
          'condition': ol.events.condition.singleClick,
          'freehandCondition': ol.events.condition.noModifierKeys,
          'snapTolerance': 96
        });
      }
      else {
        draw = new ol.interaction.Draw({
          'source': drawLayer.getSource(),
          'type': type
        });
      }
      map.addInteraction(draw);
      $rootScope.$broadcast('changedDrawMode');
    }

    function enableEditMode() {
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
      $rootScope.$broadcast('enableSaveEdits', true);

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

    function startDraw(type, inIsFreeHand) {
      isFreeHand = inIsFreeHand;
      // if the type is already selected, we want to stop drawing
      if (drawButtonActive === type && !isFreeHand) {
        cancelDraw();
        cancelEdits();
        return;
      }

      drawButtonActive = type;

      // $log.log('isFreeHand, ', isFreeHand);

      // is draw already set?
      if (isDrawMode()) {
        // if (draw !== null) {
        // yes, stop and remove the drawing interaction
        cancelDraw();
        cancelEdits();
      }

      if (type === 'Edit') enableEditMode();
      else enableDrawMode(isFreeHand, type);
    }

    /**
     * Public Functions
     */

    // Restore modified features and remove modify interaction
    function cancelEdits() {
      if (modify !== null) {
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
        $rootScope.$broadcast('enableSaveEdits', false);
      }
    }

    function doOnDrawEnd(e) {
      // drawend event needs to end the drawing interaction
      map.removeInteraction(draw);

      // clear the drawing
      drawLayer.setSource(new ol.source.Vector());

      // we want a geojson object when the user finishes drawing
      var geojson = new ol.format.GeoJSON();

      // the actual geojson object that was drawn
      var geojsonObj;
      if (map.getView().getProjection().getUnits() === 'pixels') {
        geojsonObj = geojson.writeFeatureObject(e.feature, {'decimals': 4});
        if (belongsTo) geojsonObj.properties = belongsTo;     // Image Basemap or Strat Section

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
          'decimals': 4
        });
      }

      if (isFreeHand) {
        $log.log('Drawend : Freehand');

        // add the regular draw controls back
        var drawControlProps = {
          'map': map,
          'drawLayer': drawLayer
        };
        if (belongsTo) drawControlProps[belongsTo] = belongsTo;
        map.addControl(new DrawControls(drawControlProps));

        // add the layer switcher controls back
        map.addControl(new ol.control.LayerSwitcher());

        // add the dragging back in
        map.addInteraction(new ol.interaction.DragPan());

        // contains all the lassoed objects
        var lassoedSpots = [];

        var spots = SpotFactory.getActiveSpots();

        var mappedSpots = _.filter(spots, function (spot) {
          return spot.geometry;
        });
        if (belongsTo && belongsTo.image_basemap) {
          var spotsOnImageBasemap = _.filter(mappedSpots, function (mappedSpot) {
            return mappedSpot.properties.image_basemap;
          });
          mappedSpots = _.filter(spotsOnImageBasemap, function (spotOnImageBasemap) {
            return spotOnImageBasemap.properties.image_basemap === belongsTo[image_basemap];
          });
        }
        if (belongsTo && belongsTo.strat_section_id) {
          var spotsOnStratSection = _.filter(mappedSpots, function (mappedSpot) {
            return mappedSpot.properties.strat_section_id;
          });
          mappedSpots = _.filter(spotsOnStratSection, function (spotOnStratSection) {
            return spotOnStratSection.properties.strat_section_id === belongsTo[strat_section_id];
          });
        }
        _.each(mappedSpots, function (spot) {
          // if the spot is a point, we test using turf.inside
          // if the spot is a polygon or line, we test using turf.intersect

          var spotType = spot.geometry.type;

          if (spotType === 'Point') {
            // is the point inside the drawn polygon?
            if (turf.inside(spot, geojsonObj)) {
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
        else {
          SpotFactory.setNewSpot(geojsonObj).then(function (id) {
            $location.path('/app/spotTab/' + id + '/spot');
          });
        }
      }
    }

    function DrawControls(opt_options) {
      var options = opt_options || {};
      map = opt_options.map;
      drawLayer = opt_options.drawLayer;
      if (opt_options.belongsTo) belongsTo = opt_options.belongsTo;
      draw = null;
      drawButtonActive = null;
      modify = null;

      var element = $document[0].createElement('div');
      element.className = 'draw-controls ol-unselectable';

      var drawControls = {'Point': {}, 'LineString': {}, 'Polygon': {}, 'Edit': {}};
      _.each(drawControls, function (value, key) {
        drawControls[key] = $document[0].createElement('a');
        drawControls[key].id = 'draw' + key + 'Control';
        drawControls[key].className = key;
        drawControls[key].addEventListener('click', handleDraw, false);
        drawControls[key].addEventListener('touchstart', handleDraw, false);
        element.appendChild(drawControls[key]);
      });

      function handleDraw(e) {
        _.each(drawControls, function (value, key) {
          if (value.id !== e.target.id) drawControls[key].style.backgroundColor = '';
        });
        if (e.target.style.backgroundColor === '') drawControls[e.target.className].style.backgroundColor = '#DDDDDD';
        else drawControls[e.target.className].style.backgroundColor = '';
        e.preventDefault();
        startDraw(e.target.className);
      }

      ol.control.Control.call(this, {
        'element': element,
        'target': options.target
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

    function getDrawMode() {
      return draw;
    }

    function getLassoMode() {
      return lassoMode;
    }

    // Create a group of spots by drawing a polygon on the map
    function groupSpots() {
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

    function isDrawMode() {
      return draw !== null || modify !== null;
    }

    function saveEdits(clickedFeatureId) {
      $log.log('Saving edited spots ...', spotsEdited);
      var promises = [];
      _.each(spotsEdited, function (editedSpot) {
        // If the edited spot was an interval in a strat section recalculate the thickness
        if (editedSpot.properties.strat_section_id && editedSpot.properties.surface_feature &&
          editedSpot.properties.surface_feature.surface_feature_type === 'strat_interval') {
          var extent = new ol.format.GeoJSON().readFeature(editedSpot).getGeometry().getExtent();
          var thickness = (extent[3] - extent[1]) / 20; // 20 is yMultiplier - see StratSectionFactory
          thickness = HelpersFactory.roundToDecimalPlaces(thickness, 2);
          if (!editedSpot.properties.sed) editedSpot.properties.sed = {};
          if (!editedSpot.properties.sed.lithologies) editedSpot.properties.sed.lithologies = {};
          editedSpot.properties.sed.lithologies.interval_thickness = thickness;
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
        cancelEdits();
      });
    }

    function setLassoMode(lmode) {
      lassoMode = lmode;
    }

    // Lasso spots and copy to clipboard for Stereonet Output
    function stereonetSpots() {
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
