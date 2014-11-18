angular.module('app')

.controller("DrawCtrl", function($scope, $localForage) {
    var map;
    var drawLayer;

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
            var feature = e.feature;
            console.log(feature.getGeometry());
        });

        map.addInteraction(draw);
    }

    $scope.cancelDraw = function() {
        if (draw == null) return;

        map.removeInteraction(draw);
    }

    // lets create a new map
    map = new ol.Map({
        target: 'mapdiv',
        view: new ol.View({
            center: [-11000000, 4600000],
            zoom: 4
        })
    });

    //OSM layer
    var OsmLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    map.addLayer(OsmLayer);


    //Zoom
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

});