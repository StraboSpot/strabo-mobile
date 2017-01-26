(function () {
  'use strict';

  angular
    .module('app')
    .factory('RemoteServerFactory', RemoteServerFactory);

  RemoteServerFactory.$inject = ['$http', '$log', '$q', 'LocalStorageFactory'];

  function RemoteServerFactory($http, $log, $q, LocalStorageFactory) {
    var baseUrl = 'https://strabospot.org/db';

    // Return public API
    return {
      'addDatasetToProject': addDatasetToProject,
      'addSpotToDataset': addSpotToDataset,
      'authenticateUser': authenticateUser,
      'createDataset': createDataset,
      'createFeature': createFeature,
      'deleteAllDatasetSpots': deleteAllDatasetSpots,
      'deleteDataset': deleteDataset,
      'deleteImage': deleteImage,
      'deleteProject': deleteProject,
      'deleteSpot': deleteSpot,
      'deleteSpots': deleteSpots,
      'downloadImage': downloadImage,
      'getDataset': getDataset,
      'getDatasets': getDatasets,
      'getDatasetSpots': getDatasetSpots,
      'getDbUrl': getDbUrl,
      'getImage': getImage,
      'getImages': getImages,
      'getMyProjects': getMyProjects,
      'getProfile': getProfile,
      'getProfileImage': getProfileImage,
      'getProject': getProject,
      'getProjectDatasets': getProjectDatasets,
      'loadDbUrl': loadDbUrl,
      'setDbUrl': setDbUrl,
      'setProfile': setProfile,
      'setProfileImage': setProfileImage,
      'updateFeature': updateFeature,
      'updateProject': updateProject,
      'updateDataset': updateDataset,
      'updateDatasetSpots': updateDatasetSpots,
      'uploadImage': uploadImage,
      'uploadProjectDatasetSpot': uploadProjectDatasetSpot,
      'verifyImageExistance': verifyImageExistance
    };

    /**
     * Private Functions
     */

    function buildDeleteRequest(urlPart, login) {
      return $http({
        'method': 'delete',
        'url': baseUrl + urlPart,
        'headers': {
          'Authorization': 'Basic ' + login,
          'Content-Type': 'application/json'
        }
      });
    }

    function buildGetRequest(urlPart, login) {
      return $http({
        'method': 'get',
        'url': baseUrl + urlPart,
        'headers': {
          'Authorization': 'Basic ' + login,
          'Content-Type': 'application/json'
        }
      });
    }

    function buildPostRequest(urlPart, data, login) {
      return $http({
        'method': 'post',
        'url': baseUrl + urlPart,
        'headers': {
          'Authorization': 'Basic ' + login,
          'Content-Type': 'application/json'
        },
        'data': data
      });
    }

    function dataURItoBlob(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {'type': 'image/jpeg'});
    }

    // Transform the error response, unwrapping the application data from the API response payload
    function handleError(response) {
      //$log.error('Failure:', response);
      //return ($q.reject(response.data.Error));
      return ($q.reject(response));
    }

    // Transform the successful response, unwrapping the application data from the API response payload
    function handleSuccess(response) {
      //$log.log('Success:', response);
      //return (response.data);
      return (response);
    }

    function removeImages(spot) {
      var spotNoImages = angular.fromJson(angular.toJson(spot));  // Deep clone
      _.each(spotNoImages.properties.images, function (image, i) {
        spotNoImages.properties.images[i] = _.omit(image, 'src');
      });
      return spotNoImages;
    }

    /**
     * Public Functions
     */

    // Authenticate the user
    function authenticateUser(loginData) {
      var modifiedBaseUrl = baseUrl.slice(0, baseUrl.lastIndexOf('/'));
      var request = $http({
        'method': 'post',
        'url': modifiedBaseUrl + '/userAuthenticate',
        'data': {
          'email': loginData.email,
          'password': loginData.password
        }
      });
      return (request.then(handleSuccess, handleError));
    }

    // Create a new dataset for a user
    function createDataset(name, encodedLogin) {
      var request = $http({
        'method': 'post',
        'url': baseUrl + '/db/dataset',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': 'application/json'
        },
        'data': name
      });
      return (request.then(handleSuccess, handleError));
    }

// Create a new feature
    function createFeature(spot, encodedLogin) {
      var request = $http({
        'method': 'post',
        'url': baseUrl + '/feature',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': 'application/json'
        },
        'data': removeImages(spot)
      });
      return (request.then(handleSuccess, handleError));
    }

// Delete all spots in a dataset
    function deleteAllDatasetSpots(dataset_id, encodedLogin) {
      var request = $http({
        'method': 'delete',
        'url': baseUrl + '/datasetSpots/' + dataset_id,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': 'application/json'
        }
      });
      return (request.then(handleSuccess, handleError));
    }

// Delete a dataset
    function deleteDataset(self_url, encodedLogin) {
      var request = $http({
        'method': 'delete',
        'url': self_url,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': 'application/json'
        }
      });
      return (request.then(handleSuccess, handleError));
    }

// Delete Image
	function deleteImage(image_id,encodedLogin) {
	  var request = $http({
		'method': 'delete',
		'url': baseUrl + '/Image/' + image_id,
		'headers': {
		  'Authorization': 'Basic ' + encodedLogin,
		  'Content-Type': 'application/json'
		}
	  });
	  return (request.then(handleSuccess, handleError));
	}

    // Delete single Spot
        function deleteSpot(spotid,encodedLogin) {
          var request = $http({
            'method': 'delete',
            'url': baseUrl + '/Feature/' + spotid,
            'headers': {
              'Authorization': 'Basic ' + encodedLogin,
              'Content-Type': 'application/json'
            }
          });
          return (request.then(handleSuccess, handleError));
        }

// Delete ALL spots for a user
    function deleteSpots(encodedLogin) {
      var request = $http({
        'method': 'delete',
        'url': baseUrl + '/myFeatures',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': 'application/json'
        }
      });
      return (request.then(handleSuccess, handleError));
    }

// Download image for a feature
    function downloadImage(image_url, encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': image_url,
        'responseType': 'blob',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin + '\''
        }
      });
      return (request.then(handleSuccess, handleError));
    }

// Get dataset
    function getDataset(datasetId, encodedLogin) {
      var request = buildGetRequest('/dataset/' + datasetId, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

// Get all datasets for a user
    function getDatasets(encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/myDatasets',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin
        }
      });
      return (request.then(handleSuccess, handleError));
    }

// Get all spots for a dataset
    function getDatasetSpots(datasetId, encodedLogin) {
      var request = buildGetRequest('/datasetSpots/' + datasetId, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    function getDbUrl() {
      return baseUrl;
    }

    function getImage(imageId, encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/image/' + imageId,
        'responseType': 'blob',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin + '\''
        }
      });
      return (request.then(handleSuccess, handleError));
    }

// Get all images for a feature
    function getImages(datasetId, encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/featureImages/' + datasetId,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin + '\''
        }
      });
      return (request.then(handleSuccess, handleError));
    }

// Get all images for a feature
    function getMyProjects(encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/myProjects',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin + '\''
        }
      });
      return (request.then(handleSuccess, handleError));
    }

// Get user profile
    function getProfile(encodedLogin) {
      var request = buildGetRequest('/profile', encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

// Get user profile image
    function getProfileImage(encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/profileimage',
        'responseType': 'blob',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin
        }
      });
      return (request.then(handleSuccess, handleError));
    }

    function getProject(projectId, encodedLogin) {
      var request = buildGetRequest('/project/' + projectId, encodedLogin);
      $log.log('Getting project...');
      return (request.then(handleSuccess, handleError));
    }

    function getProjectDatasets(id, encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/projectDatasets/' + id,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin + '\''
        }
      });
      return (request.then(handleSuccess, handleError));
    }

    function loadDbUrl() {
      var deferred = $q.defer(); // init promise

      $log.log('Loading Databse URL ....');
      LocalStorageFactory.getDb().configDb.getItem('db_url').then(function (savedDbUrl) {
        if (savedDbUrl) baseUrl = savedDbUrl;
        $log.log('Database URL:', baseUrl);
        deferred.resolve();
      });
      return deferred.promise;
    }

    function setDbUrl(url) {
      if (baseUrl !== url) {
        baseUrl = url;
        LocalStorageFactory.getDb().configDb.setItem('db_url', url).then(function (savedData) {
          $log.log('Saved Database URL: ', savedData);
        });
      }
    }

// Create/Update user profile
    function setProfile(user, encodedLogin) {
      var request = buildPostRequest('/profile', user, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

// Create/Update user profile image
    function setProfileImage(image, encodedLogin) {
      // base64 encoded string needs to be a blob type in formdata
      var blob = dataURItoBlob(image);

      var formdata = new FormData();
      formdata.append('image_file', blob, 'image.jpeg');

      var request = $http({
        'method': 'post',
        'url': baseUrl + '/profileimage',
        'transformRequest': angular.identity,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': undefined
        },
        'data': formdata
      });
      return (request.then(handleSuccess, handleError));
    }

    function addDatasetToProject(projectId, datasetId, encodedLogin) {
      var request = buildPostRequest('/projectDatasets/' + projectId, {'id': datasetId}, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

// Add a spot to a dataset
    function addSpotToDataset(spotId, datasetId, encodedLogin) {
      var request = buildPostRequest('/datasetSpots/' + datasetId, {'id': spotId}, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    function deleteProject(projectId, encodedLogin) {
      var request = buildDeleteRequest('/project/' + projectId, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    function updateDataset(dataset, encodedLogin) {
      var request = buildPostRequest('/dataset', dataset, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    function updateDatasetSpots(datasetId, spotCollection, encodedLogin) {
      var request = buildPostRequest('/datasetspots/' + datasetId, spotCollection, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

// Update a feature
    function updateFeature(spot, encodedLogin) {
      var request = buildPostRequest('/feature', removeImages(spot), encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    function updateProject(project, encodedLogin) {
      var request = buildPostRequest('/project', project, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

// Upload load an image
    function uploadImage(imageId, src, encodedLogin) {
      // base64 encoded string needs to be a blob type in formdata
      var blob = dataURItoBlob(src);

      var formdata = new FormData();
      formdata.append('image_file', blob, 'image.jpeg');
      formdata.append('id', imageId);

      var request = $http({
        'method': 'post',
        'url': baseUrl + '/image',
        'transformRequest': angular.identity,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': undefined
        },
        'data': formdata
      });
      return (request.then(handleSuccess, handleError));
    }

    function verifyImageExistance(id, encodedLogin) {
      var request = buildGetRequest('/verifyimage/' + id, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

// Upload Project/Dataset/Spot for live DB connection
    function uploadProjectDatasetSpot(projectdatasetspot, encodedLogin) {
      var request = buildPostRequest('/projectdatasetspot', projectdatasetspot, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

  }
}());
