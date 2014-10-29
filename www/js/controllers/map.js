angular.module('app')

  .controller("MapCtrl", function($scope, leafletData, $cordovaGeolocation, $location, $filter, Spots, NewSpot, $ionicViewService) {
    angular.extend($scope, {
      center: {
        lat: 39.828127,
        lng: -98.579404,
        zoom: 4
      },
      layers: {
        baselayers: {
          osm: {
            name: 'OpenStreetMap',
            type: 'xyz',
            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            layerOptions: {
              subdomains: ['a', 'b', 'c'],
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
          mq: {
            name: 'MapQuest',
            type: 'xyz',
            url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
            layerOptions: {
              subdomains: '1234',
              attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">',
              continuousWorld: true
            }
          }
        }
      },
      defaults: {
        scrollWheelZoom: false
      }
    });

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

    leafletData.getMap().then(function(map) {
      map.on('click', function (e) {
        // Load or initialize Spot
        $scope.spots = Spots.all();
    
        // Load or initialize current Spot
        $scope.spot = Spots.getSpot($scope.spots, "newspot", $filter);
        NewSpot.setNewLocation(e.latlng.lat, e.latlng.lng);

        // If we got to the map from the spot view go back to that view
        var backView = $ionicViewService.getBackView();
        if (backView) {
          if (backView.stateName == "app.spot")
            backView.go();
        }
        else {
          var markerLocation = new L.LatLng(e.latlng.lat, e.latlng.lng);
          var marker = new L.Marker(markerLocation, {draggable:'true'});
          var form = "<b>Spot</b><br />" + e.latlng.lat.toFixed(4) + ", " + e.latlng.lng.toFixed(4) + "<br /> More info here."
          marker.addTo(map);
          marker.bindPopup(form);

          $location.path("/app/spots/newspot");
        }
      });
    });
  });