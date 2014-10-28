angular.module('app.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('SpotsCtrl', function($scope, $location, Spots) {
  // Load or initialize Spots
  $scope.spots = Spots.all();

  // Create a new Spot
  $scope.newSpot = function() {
    $location.path("/app/spots/newspot");
    //$location.path("/app/spots/"+$scope.spots.length);
  };
})

.controller('SpotCtrl', function($scope, $stateParams, $location, $filter, Spots, $ionicViewService) {
  // Load or initialize Spot
  $scope.spots = Spots.all();
  
  // Load or initialize current Spot
  $scope.spot = Spots.getSpot($scope.spots, $stateParams.spotId, $filter);
  
  // Define Spot parameters
  $scope.spotTypes = [
      { text: 'Type a', value: 'a' },
      { text: 'Type b', value: 'b' },
      { text: 'Type c', value: 'c' }
    ];
  
  // Add or modify Spot
  $scope.submit = function() {
    if(!$scope.spot.name) {
      alert('Name required');
      return;
    }

    if (typeof $scope.spot.id == "undefined")
      $scope.spot.id = $scope.spots.length;

    $scope.spots[$scope.spot.id] = $scope.spot;
    Spots.save($scope.spots);

    // Go back one view in history
    var backView = $ionicViewService.getBackView();
    backView.go();
  };
})

.controller("OfflineMapCtrl", function($scope, $localForage) {

  var osmUrlPrefix = 'http://b.tile.openstreetmap.org/';

  var map = L.map('mapdiv', {
    center: {
      lat: 32.221667,
      lng: -110.92638
    },
    zoom: 14,
    drawControl: true
  });

  $scope.numOfflineTiles;

  $scope.airplaneMode = true;

  $scope.toggleAirplaneMode = function() {
    if ($scope.airplaneMode === false) {
      $scope.airplaneMode = true;
    } else {
      $scope.airplaneMode = false;
      // we remove and then re-add the map layer because leaflet caches files.
      // This becomes problematic when we have already loaded the offline tile image
      map.removeLayer(offlineLayer);
      map.addLayer(offlineLayer);
    }
  };

  $scope.updateOfflineTileCount = function() {
    //update the image count
    localforage.length(function(err, numberOfKeys) {
      $scope.$apply(function() {
        //update the number of offline tiles to scope
        $scope.numOfflineTiles = err || numberOfKeys;
      });
    });
  };

  $scope.clearOfflineTile = function() {
    if (window.confirm("Do you want to delete ALL offline tiles?")) {
      // ok, lets delete now because the user has confirmed ok
      localforage.clear(function(err) {
        $scope.updateOfflineTileCount();
        alert('Offline tiles are now empty');
        //reload the map layer because the offline tiles are empty
        map.removeLayer(offlineLayer);
        map.addLayer(offlineLayer);
        //TODO: do we want to reset airplane mode?
      });
    }
  };

  var writeTileToStorage = function(url, isAirplaneMode, callback) {
    // are we in airplane mode?
    if (isAirplaneMode) {
      callback();
    } else {
      //no, user wants to retrieve data from the internet
      var xhr = new XMLHttpRequest();
      xhr.open('GET', osmUrlPrefix + url + ".png", true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function(e) {
        if (this.status == 200) {
          // Note: .response instead of .responseText
          var blob = new Blob([this.response], {
            type: 'image/png'
          });

          localforage.setItem(url, blob).then(function() {
            console.log("wrote localforage, ", url);
            callback();
          });
        }
      };
      xhr.send();
    }
  }

  // new layer for offline maps, as signaled by getTileUrl
  DatabaseTileServer = L.TileLayer.extend({
    getTileUrl: function(tilePoint, zoom, tile) {
      var z = zoom;
      var x = tilePoint.x;
      var y = tilePoint.y;

      var id = z + "/" + x + "/" + y;

      // console.log("need ", id);

      // test to see if we want to write the tile into the storage
      writeTileToStorage(id, $scope.airplaneMode, function() {

        $scope.updateOfflineTileCount();

        //now get the image back
        localforage.getItem(id).then(function(blob) {
          if (blob != null) {
            var imageUrl = URL.createObjectURL(blob);
            tile.src = imageUrl;
            // console.log(imageUrl);
          } else {
            // we didn't get a file, so we need to display a blank tile base on zoom                  
            tile.src = "img/offlineTiles/zoom" + z + ".png";
          }
        });
      });

    },
    _loadTile: function(tile, tilePoint, zoom) {
      tile._layer = this;
      tile.onload = this._tileOnLoad;
      tile.onerror = this._tileOnError;
      this.getTileUrl(tilePoint, this._getZoomForUrl(), tile);
    }
  });

  var offlineLayer = new DatabaseTileServer();

  // add the offline layer
  map.addLayer(offlineLayer);
})

.controller("MapCtrl", function($scope, leafletData, $cordovaGeolocation, $location, $filter, Spots) {
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

      var markerLocation = new L.LatLng(e.latlng.lat, e.latlng.lng);
      var marker = new L.Marker(markerLocation, {draggable:'true'});
      var form = "<b>Spot</b><br />" + e.latlng.lat.toFixed(4) + ", " + e.latlng.lng.toFixed(4) + "<br /> More info here."
      marker.addTo(map);
      marker.bindPopup(form);

      $location.path("/app/spots/newspot");
    });
  });
});
