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
	
	$scope.spots = [];
})

.controller('SpotsCtrl', function($scope) {
})

.controller('SpotCtrl', function($scope, $stateParams, $location) {
	$scope.spotTypes = [
			{ text: 'Type a', value: 'a' },
			{ text: 'Type b', value: 'b' },
			{ text: 'Type c', value: 'c' }
		];
		
	$scope.spot = {};
	$scope.submit = function() {
		if(!$scope.spot.name) {
			alert('Info required');
			return;
		}
		
	$scope.spots.push($scope.spot);
	$location.path("/app/map");
		};
})

.controller("OfflineMapCtrl", function($scope, $localForage	) {

	var osmPrefix = 'http://b.tile.openstreetmap.org/';

	// sample Arizona tiles
    var osmSampleFilesArray = [
        '14/3143/6641',
        '14/3143/6640',
        '14/3142/6641',
        '14/3144/6641',
        '14/3143/6642',
        '14/3142/6640',
        '14/3144/6640',
        '14/3142/6642',
        '14/3144/6642'
    ];

	

	var writeTileToStorage = function(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', osmPrefix + url + ".png", true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.status == 200) {
                // Note: .response instead of .responseText
                var blob = new Blob([this.response], {
                    type: 'image/png'
                });

                localforage.setItem(url, blob).then(function() {
                    console.log("wrote localforage, ", url);
                });                
            }
        };

        xhr.send();
    }

    // lets preload some AZ tiles to prove that this works
	osmSampleFilesArray.forEach(function(urlSubstring){
		writeTileToStorage(urlSubstring);
	});



    var tileUnavailablePng = "data:image/png;base64,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WHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDExLTA0LTAzVDE4OjEyOjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaDwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOkNyZWF0ZURhdGU+MjAxMS0wNC0wM1QxODoxMjowMDwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjYwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NjAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8ZXhpZjpDb2xvclNwYWNlPjE8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjE3MDA8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTc4MDwvZXhpZjpQaXhlbFlEaW1lbnNpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgom6huZAAAe2ElEQVR4Ae2ddbAltbbGL+4OD3eHGdydd3F3H9xhKKRwGazQKtwp3N3dZXB3d3d3eT9m3bduqnvvnj7ndHqfnP72H7vSyYp9yddJVtJZw/z999//0k8INBWBYZtacdVbCPyDgAigftBoBESARje/Ki8CqA80GgERoNHNr8qLAOoDjUZABGh086vyIoD6QKMREAEa3fyqvAigPtBoBESARje/Ki8CqA80GgERoNHNr8qLAOoDjUZABGh086vyIoD6QKMREAEa3fyqvAigPtBoBESARje/Ki8CqA80GgERoNHNr8qLAOoDjUZABGh086vyIoD6QKMREAEa3fyqvAigPtBoBESARje/Ki8CqA80GgERoNHNr8qLAOoDjUZABGh086vyIoD6QKMREAEa3fyqvAigPtBoBESARje/Ki8CqA80GgERoNHNr8qLAOoDjUZABGh086vyIoD6QKMREAEa3fyqvAigPtBoBESARje/Ki8CqA80GgERoNHNr8qLAOoDjUZABGh086vyIoD6QKMREAEa3fyqvAigPtBoBESARje/Ki8CqA80GgERoNHNr8qLAOoDjUZABGh086vyIoD6QKMREAEa3fyqvAigPtBoBESARje/Ki8CqA80GgERoNHNr8oP31kI3nvvvRdeeOHjIb/hhhvuf4b8+vfvP9VUU3W1YB999NGXX3455ZRTjjnmmJm4v/32Gxn9/vvvJDvKKKNkQvXYaAT+7sTvxx9/POaYY+aff/520Pfr12/vvff+5JNPhlq6V199dYkllhh99NEtqdNOOy2M8thjjy299NLDDvufgc5D99tvP2jGj2KE8jvvvHNL/1BG7r6EQAdGgHvvvXfLLbd888032/V+/BkW+J1yyikHHnjgjjvuOPzwrcv51FNPLb744j/88EPLpF555ZUll1wSsuVD33///eeffx5/xp4wlIHC/OFe6C93X0WgdceKV9uTTz554MCBvELCLCabbLI555yTyckzzzzzxhtv/PXXXxb67bff7rLLLoMHD7700kuZIIVRzH3SSSd5759pppmY/0wyySQudthhh3nvn3766aeeeuow1MXkaDQCdQ5n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bpFaVf2ZcTH4cv6HTQky5XzLKqusEs5z2OYcPHgwOlOowtQir97paknqzLGSvJj0M56gWULPy3SIaSoTv/zOYHkc2F/j8wzUQc899xyTTLYgUXAzxfL9svJJVSjZSQJUWA0lJQS6h0DdU6DulVKxhEAkBESASMAq2TQQEAHSaCeVMhICIkAkYJVsGgiIAGm0k0oZCQERIBKwSjYNBESANNpJpYyEgAgQCVglmwYCIkAa7aRSRkJABIgErJJNAwERII12UikjISACRAJWyaaBgAiQRjuplJEQEAEiAatk00BABEijnVTKSAiIAJGAVbJpICACpNFOKmUkBESASMAq2TQQEAHSaCeVMhICIkAkYJVsGgiIAGm0k0oZCQERIBKwSjYNBESANNpJpYyEgAgQCVglmwYCIkAa7aRSRkJABIgErJJNAwERII12UikjISACRAJWyaaBgAiQRjuplJEQEAEiAatk00BABEijnVTKSAiIAJGAVbJpICACpNFOKmUkBESASMAq2TQQEAHSaCeVMhICIkAkYJVsGgiIAGm0k0oZCQERIBKwSjYNBESANNpJpYyEgAgQCVglmwYCIkAa7aRSRkJABIgErJJNAwERII12UikjISACRAJWyaaBgAiQRjuplJEQEAEiAatk00BABEijnVTKSAiIAJGAVbJpICACpNFOKmUkBESASMAq2TQQEAHSaCeVMhICIkAkYJVsGgiIAGm0k0oZCQERIBKwSjYNBESANNpJpYyEgAgQCVglmwYCIkAa7aRSRkJABIgErJJNAwERII12UikjISACRAJWyaaBgAiQRjuplJEQEAEiAatk00BABEijnVTKSAiIAJGAVbJpICACpNFOKmUkBESASMAq2TQQEAHSaCeVMhICIkAkYJVsGgiIAGm0k0oZCQERIBKwSjYNBESANNpJpYyEgAgQCVglmwYCIkAa7aRSRkJABIgErJJNAwERII12UikjISACRAJWyaaBgAiQRjuplJEQEAEiAatk00BABEijnVTKSAj8H+UOKV6wuhjwAAAAAElFTkSuQmCC";

    // new layer for offline maps, as signaled by getTileUrl
	DatabaseTileServer = L.TileLayer.extend({
        getTileUrl: function(tilePoint, zoom, tile) {
            var z = zoom;
            var x = tilePoint.x;
            var y = tilePoint.y;

            var id = z + "/" + x + "/" + y;

            console.log("need ", id);
            
            localforage.getItem(id).then(function(qwe) {
                if (qwe != null) {
                    // console.log(qwe);
                    var imageUrl = URL.createObjectURL(qwe);
                    tile.src = imageUrl;
                    // console.log(imageUrl);
                } else {
                    // we didn't get a file, so we need to display a blank tile                    
                    tile.src = tileUnavailablePng;
                }
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

	var map = L.map('mapdiv', {
        center: {
            lat: 32.221667,
            lng: -110.92638
        },
        zoom: 14
    });

	map.addLayer(offlineLayer);
})

.controller("MapCtrl", function($scope, leafletData, $cordovaGeolocation, $location) {
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
		},
		id: 0
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
			$scope.id++;
			var markerLocation = new L.LatLng(e.latlng.lat, e.latlng.lng);
			var marker = new L.Marker(markerLocation, {draggable:'true'});
			var form = "<b>Spot #"+$scope.id+"</b><br />" + e.latlng.lat.toFixed(4) + ", " + e.latlng.lng.toFixed(4) + "<br /> More info here."
			marker.addTo(map);
			marker.bindPopup(form)
			$location.path("/app/spots/"+$scope.id+"");
		});
	});
});