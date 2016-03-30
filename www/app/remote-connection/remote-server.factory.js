(function () {
  'use strict';

  angular
    .module('app')
    .factory('RemoteServerFactory', RemoteServerFactory);

  RemoteServerFactory.$inject = ['$http', '$log', '$q'];

  function RemoteServerFactory($http, $log, $q) {
    var baseUrl = 'http://strabospot.org';

    // Return public API
    return {
      'addDatasetToProject': addDatasetToProject,
      'addSpotToDataset': addSpotToDataset,
      'authenticateUser': authenticateUser,
      'createDataset': createDataset,
      'createFeature': createFeature,
      'deleteAllDatasetSpots': deleteAllDatasetSpots,
      'deleteDataset': deleteDataset,
      'deleteProject': deleteProject,
      'deleteSpots': deleteSpots,
      'downloadImage': downloadImage,
      'getDatasets': getDatasets,
      'getDatasetSpots': getDatasetSpots,
      'getImage': getImage,
      'getImages': getImages,
      'getMyProjects': getMyProjects,
      'getProfile': getProfile,
      'getProfileImage': getProfileImage,
      'getProject': getProject,
      'getProjectDatasets': getProjectDatasets,
      'setProfile': setProfile,
      'setProfileImage': setProfileImage,
      'updateFeature': updateFeature,
      'updateProject': updateProject,
      'updateDataset': updateDataset,
      'updateDatasetSpots': updateDatasetSpots,
      'uploadImage': uploadImage,
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
      var request = buildPostRequest('/userAuthenticate', {
        'email': loginData.email,
        'password': loginData.password
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
        'url': baseUrl + '/db/feature',
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
        'url': baseUrl + '/db/datasetSpots/' + dataset_id,
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

    // Delete ALL spots for a user
    function deleteSpots(encodedLogin) {
      var request = $http({
        'method': 'delete',
        'url': baseUrl + '/db/myFeatures',
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

    // Get all datasets for a user
    function getDatasets(encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/db/myDatasets',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin
        }
      });
      return (request.then(handleSuccess, handleError));
    }

    // Get all spots for a dataset
    function getDatasetSpots(datasetId, encodedLogin) {
      var request = buildGetRequest('/db/datasetSpots/' + datasetId, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    function getImage(imageId, encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/db/image/' + imageId,
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
        'url': baseUrl + '/db/featureImages/' + datasetId,
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
        'url': baseUrl + '/db/myProjects',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin + '\''
        }
      });
      return (request.then(handleSuccess, handleError));
    }

    // Get user profile
    function getProfile(encodedLogin) {
      var request = buildGetRequest('/db/profile', encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    // Get user profile image
    function getProfileImage(encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/db/profileimage',
        'responseType': 'blob',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin
        }
      });
      return (request.then(handleSuccess, handleError));
    }

    function getProject(projectId, encodedLogin) {
      var request = buildGetRequest('/db/project/' + projectId, encodedLogin);
      $log.log('Getting project...');
      return (request.then(handleSuccess, handleError));
    }

    function getProjectDatasets(id, encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/db/projectDatasets/' + id,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin + '\''
        }
      });
      return (request.then(handleSuccess, handleError));
    }

    // Create/Update user profile
    function setProfile(user, encodedLogin) {
      var request = buildPostRequest('/db/profile', user, encodedLogin);
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
        'url': baseUrl + '/db/profileimage',
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
      var request = buildPostRequest('/db/projectDatasets/' + projectId, {'id': datasetId}, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    // Add a spot to a dataset
    function addSpotToDataset(spotId, datasetId, encodedLogin) {
      var request = buildPostRequest('/db/datasetSpots/' + datasetId, {'id': spotId}, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    function deleteProject(projectId, encodedLogin) {
      var request = buildDeleteRequest('/db/project/' + projectId, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    function updateDataset(dataset, encodedLogin) {
      var request = buildPostRequest('/db/dataset', dataset, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    function updateDatasetSpots(datasetId, spotCollection, encodedLogin) {
      var request = buildPostRequest('/db/datasetspots/' + datasetId, spotCollection, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    // Update a feature
    function updateFeature(spot, encodedLogin) {
      var request = buildPostRequest('/db/feature', removeImages(spot), encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    function updateProject(project, encodedLogin) {
      var request = buildPostRequest('/db/project', project, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }

    // Upload load an image
    function uploadImage(image, encodedLogin) {
      // base64 encoded string needs to be a blob type in formdata
      var blob = dataURItoBlob(image.src);

      var formdata = new FormData();
      formdata.append('image_file', blob, 'image.jpeg');
      formdata.append('id', image.id);

      var request = $http({
        'method': 'post',
        'url': baseUrl + '/db/image',
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
      var request = buildGetRequest('/db/verifyimage/' + id, encodedLogin);
      return (request.then(handleSuccess, handleError));
    }
  }
}());
