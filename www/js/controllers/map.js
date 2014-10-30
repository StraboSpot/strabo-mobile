angular.module('app')

  .controller("MapCtrl", function($scope, leafletData, $cordovaGeolocation, $location, $filter, $ionicViewService, Spots, NewSpot, MapView) {
    angular.extend($scope, {
      center: {
        lat: 39.828127,
        lng: -98.579404,
        zoom: 4
      },
      layers: {
        baselayers: {
          mq: {
            name: 'MapQuest',
            type: 'xyz',
            url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
            layerOptions: {
              subdomains: '1234',
              attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">',
              continuousWorld: true
            }
          },
          mqAerial: {
            name: 'MapQuestAerial',
            type: 'xyz',
            url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpeg',
            layerOptions: {
              subdomains: '1234',
              attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">',
              continuousWorld: true
            }
          },
          osm: {
            name: 'OpenStreetMap',
            type: 'xyz',
            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            layerOptions: {
              subdomains: ['a', 'b', 'c'],
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              continuousWorld: true
            }
          }
        }
      },
      defaults: {
        scrollWheelZoom: false
      }
    });
    
    // Load markers
    $scope.getMarkers = function() {
      $scope.spots = Spots.all();
      var markers = [];
      for (var i=0; i<$scope.spots.length; i++) {  
        var lat = $scope.spots[i].lat;
        var lng = $scope.spots[i].lng;
        if (lat && lng) {
          var message = "<b>"+$scope.spots[i].name+"</b><br />" + lat.toFixed(4) + ", " + lng.toFixed(4) + "<br /> More info here."
          var marker = {
              lat: lat,
              lng: lng,
              focus: false,
              message: message,
              draggable: false,
          };
          markers.push(marker);
        }
      }
      return markers;
    }

    // Point markers
    $scope.markers = $scope.getMarkers();              

    // Get current position
    $scope.getLocation = function(){
      $cordovaGeolocation.getCurrentPosition().then(function (position) {
        $scope.updateMap(position.coords.latitude, position.coords.longitude, 18);
        }, function(err) {
          alert("Unable to get location: " + err.message);
      });
    }

    // Redraw map with new center and zoom
    $scope.updateMap = function(lat, lng, zoom) {
      leafletData.getMap().then(function(map) {
        map.setView(new L.LatLng(lat, lng), zoom);});
    }
    
    // Watch the Lat, Long and Zoom so we can return to that view if we need to
    $scope.$watch("center.zoom", function(zoom) {
      MapView.setZoom(zoom);
      MapView.setRestoreView(true);
    });
    $scope.$watch("center.lat", function(lat) {
      MapView.setLat(lat);
      MapView.setRestoreView(true);
    });
    $scope.$watch("center.lng", function(lng) {
      MapView.setLng(lng);
      MapView.setRestoreView(true);
    });
    
    // Return to the previous map view
    if (MapView.getRestoreView() == true) {
      $scope.updateMap(MapView.getMapView().lat, MapView.getMapView().lng, MapView.getMapView().zoom);
      //MapView.setRestoreView(false);
    }
    
    leafletData.getMap().then(function(map) {
      map.on('click', function (e) {
        // Initialize new Spot
        NewSpot.setNewLocation(e.latlng.lat, e.latlng.lng);
        
        // If we got to the map from the spot view go back to that view
        var backView = $ionicViewService.getBackView();
        if (backView) {
          if (backView.stateName == "app.spot") {
            backView.go();
          }
        }
        else {
          MapView.setRestoreView(true);
          $location.path("/app/spots/newspot");
        }
      });
    });
  });