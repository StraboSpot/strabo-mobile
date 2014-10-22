angular.module('app.controllers', ['ionic', 'leaflet-directive', 'ngCordova'])

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

.controller('SpotsCtrl', function($scope) {
  $scope.spots = [
    { title: 'Spot1', id: 1 },
    { title: 'Spot2', id: 2 },
    { title: 'Spot3', id: 3 },
    { title: 'Spot4', id: 4 },
    { title: 'Spot5', id: 5 },
    { title: 'Spot6', id: 6 }
  ];
})

.controller('SpotCtrl', function($scope, $stateParams) {
})

.controller("MapCtrl", function($scope, leafletData, $cordovaGeolocation) {
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
			var marker = L.marker(e.latlng, {draggable:'true'}).addTo(map)
			.bindPopup("<b>Spot</b><br />" + e.latlng.lat.toFixed(4) + ", " + e.latlng.lng.toFixed(4) + "<br /> More info here.");
		});
	});
});