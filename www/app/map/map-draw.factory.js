(function () {
  'use strict';

  angular
    .module('app')
    .factory('DrawFactory', DrawFactory);

  DrawFactory.$inject = ['$document', '$ionicPopup', '$log', '$state', 'CurrentSpotFactory', 'NewSpotFactory', 'SpotFactory'];

  function DrawFactory($document, $ionicPopup, $log, $state, CurrentSpotFactory, NewSpotFactory, SpotFactory) {
    var draw;               // draw is a ol3 drawing interaction
    var drawButtonActive;   // drawButtonActive used to keep state of which selected drawing tool is active
    var drawLayer;
    var imageMap;           // id of an image map if an image map is being used
    var map;

    return {
      'cancelDraw': cancelDraw,
      'DrawControls': DrawControls,
      'groupSpots': groupSpots,
      'isDrawMode': isDrawMode,
      'startDraw': startDraw
    };

    /**
     * Private Functions
     */

    function createNewSpot(geojsonObj) {
      switch (drawButtonActive) {
        case 'Point':
          geojsonObj.properties = {'type': 'point'};
          break;
        case 'LineString':
          geojsonObj.properties = {'type': 'line'};
          break;
        case 'Polygon':
          geojsonObj.properties = {'type': 'polygon'};
          break;
      }
      if (imageMap) geojsonObj.properties.image_map = imageMap.id;
      NewSpotFactory.setNewSpot(geojsonObj);
      $state.go('spotTab.spot');
    }

    /**
     * Public Functions
     */

    function cancelDraw() {
      if (draw === null) return;
      map.removeInteraction(draw);
    }

    function DrawControls(opt_options) {
      var options = opt_options || {};
      map = opt_options.map;
      drawLayer = opt_options.drawLayer;
      imageMap = opt_options.imageMap || null;
      draw = null;
      drawButtonActive = null;

      var drawPoint;
      var drawLine;
      var drawPoly;

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

      function handleDraw(e, drawObj, drawType) {
        if (drawObj.style.backgroundColor === '') {
          drawObj.style.backgroundColor = '#DDDDDD';
        }
        else {
          drawObj.style.backgroundColor = '';
        }
        e.preventDefault();
        startDraw(drawType);
      }

      function handleDrawPoint(e) {
        drawLine.style.backgroundColor = '';
        drawPoly.style.backgroundColor = '';
        handleDraw(e, drawPoint, 'Point');
      }

      function handleDrawLine(e) {
        drawPoint.style.backgroundColor = '';
        drawPoly.style.backgroundColor = '';
        handleDraw(e, drawLine, 'LineString');
      }

      function handleDrawPoly(e) {
        drawPoint.style.backgroundColor = '';
        drawLine.style.backgroundColor = '';
        handleDraw(e, drawPoly, 'Polygon');
      }

      drawPoint.addEventListener('click', handleDrawPoint, false);
      drawPoint.addEventListener('touchstart', handleDrawPoint, false);

      drawLine.addEventListener('click', handleDrawLine, false);
      drawLine.addEventListener('touchstart', handleDrawLine, false);

      drawPoly.addEventListener('click', handleDrawPoly, false);
      drawPoly.addEventListener('touchstart', handleDrawPoly, false);

      var element = $document[0].createElement('div');
      element.className = 'draw-controls ol-unselectable';

      element.appendChild(drawPoint);
      element.appendChild(drawLine);
      element.appendChild(drawPoly);

      ol.control.Control.call(this, {
        'element': element,
        'target': options.target
      });
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
        'title': 'Create a Station',
        'template': 'Draw a polygon around the features you would like to add to a new station.'
      });

      // start the draw with freehand enabled
      startDraw('Polygon', true);
    }

    function isDrawMode() {
      return draw !== null;
    }

    function startDraw(type, isFreeHand) {
      // if the type is already selected, we want to stop drawing
      if (drawButtonActive === type && !isFreeHand) {
        drawButtonActive = null;
        cancelDraw();
        return;
      }

      drawButtonActive = type;

      $log.log('isFreeHand, ', isFreeHand);

      // are we in freehand mode?
      if (isFreeHand) {
        // yes -- then disable the map drag pan
        map.getInteractions().forEach(function (interaction) {
          if (interaction instanceof ol.interaction.DragPan) {
            $log.log(interaction);
            map.getInteractions().remove(interaction);
          }
        });
      }

      // is draw already set?
      if (isDrawMode()) {
        // if (draw !== null) {
        // yes, stop and remove the drawing interaction
        cancelDraw();
      }

      if (isFreeHand) {
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

      draw.on('drawend', function (e) {
        // drawend event needs to end the drawing interaction
        map.removeInteraction(draw);

        // clear the drawing
        drawLayer.setSource(new ol.source.Vector());

        // we want a geojson object when the user finishes drawing
        var geojson = new ol.format.GeoJSON();

        // the actual geojson object that was drawn
        var geojsonObj;
        if (imageMap) {
          // Drawing on an image map
          geojsonObj = geojson.writeFeatureObject(e.feature);

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
            'imageMap': imageMap
          }));

          // add the layer switcher controls back
          map.addControl(new ol.control.LayerSwitcher());

          // add the dragging back in
          map.addInteraction(new ol.interaction.DragPan());

          // does the drawing contain a kink, aka self-intersecting polygon?
          if (turf.kinks(geojsonObj).intersections.features.length === 0) {
            // no, good

            // contains all the lassoed objects
            var isLassoed = [];

            var spots = SpotFactory.getSpots();
            var mappedSpots = _.filter(spots, function (spot) {
              return spot.geometry;
            });
            _.each(mappedSpots, function (spot) {
              // if the spot is a point, we test using turf.inside
              // if the spot is a polygon or line, we test using turf.intersect

              var spotType = spot.properties.type;

              if (spotType === 'point') {
                // is the point inside the drawn polygon?
                if (turf.inside(spot, geojsonObj)) {
                  isLassoed.push({
                    'id': spot.properties.id,
                    'name': spot.properties.name,
                    'type': spot.properties.type
                  });
                }
              }

              if (spotType === 'line' || spotType === 'polygon' || spotType === 'group') {
                // is the line or polygon within/intersected in the drawn polygon?
                if (turf.intersect(spot, geojsonObj)) {
                  isLassoed.push({
                    'id': spot.properties.id,
                    'name': spot.properties.name,
                    'type': spot.properties.type
                  });
                }
              }
            });

            $log.log('isLassoed, ', isLassoed);

            if (isLassoed.length === 0) {
              $ionicPopup.alert({
                'title': 'Empty Group!',
                'template': 'No spots are within or intersect the drawn poloygon.'
              });
              return;
            }

            geojsonObj.properties = {
              'type': 'group',
              'group_members': isLassoed
            };
            if (imageMap) {
              geojsonObj.properties.image_map = imageMap.id;
            }

            NewSpotFactory.setNewSpot(geojsonObj);
            $state.go('spotTab.orientation');
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

          // If there is already a current spot only update the geometry if the draw tool used
          // matches the required geometry for the Spot type
          if (CurrentSpotFactory.getCurrentSpot()) {
            var curSpot = CurrentSpotFactory.getCurrentSpot();
            switch (curSpot.properties.type) {
              case 'point':
                if (drawButtonActive === 'Point') {
                  curSpot.geometry = geojsonObj.geometry;
                  CurrentSpotFactory.setCurrentSpot(curSpot);
                }
                else {
                  $ionicPopup.alert({
                    'title': 'Geometry Mismatch!',
                    'template': 'Measurements and observations must be drawn as points. Draw Again.'
                  });
                }
                $state.go('spotTab.georeference');
                break;
              case 'line':
                if (drawButtonActive === 'LineString') {
                  curSpot.geometry = geojsonObj.geometry;
                  CurrentSpotFactory.setCurrentSpot(curSpot);
                }
                else {
                  $ionicPopup.alert({
                    'title': 'Geometry Mismatch!',
                    'template': 'Contacts and traces must be drawn as lines. Draw Again.'
                  });
                }
                $state.go('spotTab.georeference');
                break;
              case 'polygon':
                if (drawButtonActive === 'Polygon') {
                  curSpot.geometry = geojsonObj.geometry;
                  CurrentSpotFactory.setCurrentSpot(curSpot);
                }
                else {
                  $ionicPopup.alert({
                    'title': 'Geometry Mismatch!',
                    'template': 'Rock descriptions must be drawn as polygons. Draw Again.'
                  });
                }
                $state.go('spotTab.georeference');
                break;
              case 'group':
                if (drawButtonActive === 'Polygon') {
                  curSpot.geometry = geojsonObj.geometry;
                  CurrentSpotFactory.setCurrentSpot(curSpot);
                }
                else {
                  $ionicPopup.alert({
                    'title': 'Geometry Mismatch!',
                    'template': 'Stations must be drawn as polygons. Draw Again.'
                  });
                }
                $state.go('spotTab.georeference');
                break;
            }
          }
          else {
            createNewSpot(geojsonObj);
          }
        }
      });
      map.addInteraction(draw);
    }
  }
}());
