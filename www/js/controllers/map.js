angular.module('app')

.controller("MapCtrl", function($scope, $rootScope, $cordovaGeolocation, $location, $filter, $ionicViewService, Spots, NewSpot, MapView) {

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

            // we want a geojson object when the user finishes drawing
            var geojson = new ol.format.GeoJSON;

            // the actual geojson object
            var geojsonObj = geojson.writeFeature(e.feature, {
                featureProjection: "EPSG:3857"
            });

            // console.log(geojsonObj);


            // Initialize new Spot
            NewSpot.setGeoJson(geojsonObj);

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


    // Get current position
    $scope.getLocation = function() {
        $cordovaGeolocation.getCurrentPosition()
            .then(function(position) {

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