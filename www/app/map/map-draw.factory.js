(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapDrawFactory', MapDrawFactory);

  MapDrawFactory.$inject = ['$document', '$ionicPopup', '$location', '$log', '$q', '$rootScope', 'SpotFactory'];

  function MapDrawFactory($document, $ionicPopup, $location, $log, $q, $rootScope, SpotFactory) {
    var draw;               // draw is a ol3 drawing interaction
    var drawButtonActive;   // drawButtonActive used to keep state of which selected drawing tool is active
    var drawLayer;
    var featuresOrig = [];
    var imageBasemap;       // id of an image basemap if an image basemap is being used
    var isFreeHand;
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
      'groupSpots': groupSpots,
      'isDrawMode': isDrawMode,
      'saveEdits': saveEdits
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
          if (!imageBasemap) {
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
      if (imageBasemap) {
        // Drawing on an image basemap
        geojsonObj = geojson.writeFeatureObject(e.feature);
        geojsonObj.properties = {
          'image_basemap': imageBasemap.id
        };

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
          'featureProjection': map.getView().getProjection()  // 'EPSG:3857'
        });
      }

      if (isFreeHand) {
        $log.log('Drawend : Freehand');

        // add the regular draw controls back
        map.addControl(new DrawControls({
          'map': map,
          'drawLayer': drawLayer,
          'imageBasemap': imageBasemap
        }));

        // add the layer switcher controls back
        map.addControl(new ol.control.LayerSwitcher());

        // add the dragging back in
        map.addInteraction(new ol.interaction.DragPan());

        // does the drawing contain a kink, aka self-intersecting polygon?
        if (turf.kinks(geojsonObj).features.length === 0) {
          // no, good

          // contains all the lassoed objects
          var lassoedSpots = [];

          var spots = SpotFactory.getActiveSpots();
          var mappedSpots = _.filter(spots, function (spot) {
            return spot.geometry;
          });
          if (imageBasemap) {
            var spotsOnImageBasemap = _.filter(mappedSpots, function (mappedSpot) {
              return mappedSpot.properties.image_basemap;
            });
            mappedSpots = _.filter(spotsOnImageBasemap, function (spotOnImageBasemap) {
              return spotOnImageBasemap.properties.image_basemap === imageBasemap.id;
            });
          }
          _.each(mappedSpots, function (spot) {
            // if the spot is a point, we test using turf.inside
            // if the spot is a polygon or line, we test using turf.intersect

            var spotType = spot.geometry.type;

            if (spotType === 'Point') {
              // is the point inside the drawn polygon?
              if (turf.inside(spot, geojsonObj)) {
                lassoedSpots.push(spot);
              }
            }

            if (spotType === 'LineString' || spotType === 'Polygon') {
              // is the line or polygon within/intersected in the drawn polygon?
              if (turf.intersect(spot, geojsonObj)) {
                lassoedSpots.push(spot);
              }
            }
          });
          SpotFactory.setSelectedSpots(lassoedSpots);
        }
        else {
          // contains a kink, aka self-intersecting polygon
          $ionicPopup.alert({
            'title': 'Self-Intersecting Polygon!',
            'template': 'Polygon must not intersect itself. Draw again.'
          });
        }
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
      imageBasemap = opt_options.imageBasemap || null;
      draw = null;
      drawButtonActive = null;
      modify = null;

      var drawPoint;
      var drawLine;
      var drawPoly;
      var drawEdit;

      drawPoint = $document[0].createElement('a');
      drawPoint.id = 'drawPointControl';
      drawPoint.href = '#drawPointControl';
      drawPoint.className = 'point';

      drawLine = $document[0].createElement('a');
      drawLine.id = 'drawLineControl';
      drawLine.href = '#drawLineControl';
      drawLine.className = 'line';

      drawPoly = $document[0].createElement('a');
      drawPoly.id = 'drawPolyControl';
      drawPoly.href = '#drawPolyControl';
      drawPoly.className = 'poly';

      drawEdit = $document[0].createElement('a');
      drawEdit.id = 'drawEditControl';
      drawEdit.href = '#drawEditControl';
      drawEdit.className = 'edit';

      function handleDraw(e, drawObj, drawType) {
        if (drawObj.style.backgroundColor === '') drawObj.style.backgroundColor = '#DDDDDD';
        else drawObj.style.backgroundColor = '';
        e.preventDefault();
        startDraw(drawType);
      }

      function handleDrawPoint(e) {
        drawLine.style.backgroundColor = '';
        drawPoly.style.backgroundColor = '';
        drawEdit.style.backgroundColor = '';
        handleDraw(e, drawPoint, 'Point');
      }

      function handleDrawLine(e) {
        drawPoint.style.backgroundColor = '';
        drawPoly.style.backgroundColor = '';
        drawEdit.style.backgroundColor = '';
        handleDraw(e, drawLine, 'LineString');
      }

      function handleDrawPoly(e) {
        drawPoint.style.backgroundColor = '';
        drawLine.style.backgroundColor = '';
        drawEdit.style.backgroundColor = '';
        handleDraw(e, drawPoly, 'Polygon');
      }

      function handleDrawEdit(e) {
        drawPoint.style.backgroundColor = '';
        drawLine.style.backgroundColor = '';
        drawPoly.style.backgroundColor = '';
        handleDraw(e, drawEdit, 'Edit');
      }

      drawPoint.addEventListener('click', handleDrawPoint, false);
      drawPoint.addEventListener('touchstart', handleDrawPoint, false);

      drawLine.addEventListener('click', handleDrawLine, false);
      drawLine.addEventListener('touchstart', handleDrawLine, false);

      drawPoly.addEventListener('click', handleDrawPoly, false);
      drawPoly.addEventListener('touchstart', handleDrawPoly, false);

      drawEdit.addEventListener('click', handleDrawEdit, false);
      drawEdit.addEventListener('touchstart', handleDrawEdit, false);

      var element = $document[0].createElement('div');
      element.className = 'draw-controls ol-unselectable';

      element.appendChild(drawPoint);
      element.appendChild(drawLine);
      element.appendChild(drawPoly);
      element.appendChild(drawEdit);

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

      $ionicPopup.alert({
        'title': 'Tag Spots',
        'template': 'Draw a polygon around the Spots you would like to Tag.'
      });

      // start the draw with freehand enabled
      startDraw('Polygon', true);
    }

    function isDrawMode() {
      return draw !== null || modify !== null;
    }

    function saveEdits() {
      $log.log('Saving edited spots ...', spotsEdited);
      var promises = [];
      _.each(spotsEdited, function (editedSpot) {
        promises.push(SpotFactory.save(editedSpot));
      });
      $q.all(promises).then(function () {
        featuresOrig = [];
        spotsEdited = [];
        cancelEdits();
      });
    }
  }
}());
