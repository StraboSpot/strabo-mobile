(function () {
  'use strict';

  angular
    .module('app')
    .factory('RemoteServerFactory', RemoteServerFactory);

  RemoteServerFactory.$inject = ['$http'];

  function RemoteServerFactory($http) {
    var baseUrl = 'http://strabospot.org';

    // Return public API
    return {
      'addDatasetSpot': addDatasetSpot,
      'addSpotToDataset': addSpotToDataset,
      'authenticateUser': authenticateUser,
      'createDataset': createDataset,
      'createFeature': createFeature,
      'deleteAllDatasetSpots': deleteAllDatasetSpots,
      'deleteDataset': deleteDataset,
      'deleteSpots': deleteSpots,
      'downloadImage': downloadImage,
      'getDatasets': getDatasets,
      'getDatasetSpots': getDatasetSpots,
      'getImages': getImages,
      'updateFeature': updateFeature,
      'uploadImage': uploadImage
    };

    /**
     * Public Functions
     */

    // Add a spot to a dataset
    function addDatasetSpot(spot, dataset_id, encodedLogin) {
      var request = $http({
        'method': 'post',
        'url': baseUrl + '/db/datasetSpots/' + dataset_id,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': 'application/json'
        },
        'data': spot
      });
      return (request.then(handleSuccess, handleError));
    }

    // Add a spot to a dataset
    function addSpotToDataset(id, dataset_id, encodedLogin) {
      var request = $http({
        'method': 'post',
        'url': baseUrl + '/db/datasetSpots/' + dataset_id,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': 'application/json'
        },
        'data': {
          'id': id
        }
      });
      return (request.then(handleSuccess, handleError));
    }

    // Authenticate the user
    function authenticateUser(loginData) {
      var request = $http({
        'method': 'post',
        'url': baseUrl + '/userAuthenticate',
        'headers': {
          'Content-Type': 'application/json'
        },
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
        'url': baseUrl + '/db/feature',
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': 'application/json'
        },
        'data': spot
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
    function getDatasetSpots(dataset_id, encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/db/datasetSpots/' + dataset_id,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin
        }
      });
      return (request.then(handleSuccess, handleError));
    }

    // Get all images for a feature
    function getImages(dataset_id, encodedLogin) {
      var request = $http({
        'method': 'get',
        'url': baseUrl + '/db/featureImages/' + dataset_id,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin + '\''
        }
      });
      return (request.then(handleSuccess, handleError));
    }

    // Update a feature
    function updateFeature(spot, encodedLogin) {
      var request = $http({
        'method': 'post',
        'url': spot.properties.self,
        'headers': {
          'Authorization': 'Basic ' + encodedLogin,
          'Content-Type': 'application/json'
        },
        'data': spot
      });
      return (request.then(handleSuccess, handleError));
    }

    // Upload load an image
    function uploadImage(spot_id, image, encodedLogin) {
      function dataURItoBlob(dataURI) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {'type': 'image/jpeg'});
      }

      // base64 encoded string needs to be a blob type in formdata
      var blob = dataURItoBlob(image.src);

      var formdata = new FormData();
      formdata.append('feature_id', spot_id);
      formdata.append('image_file', blob, 'image.jpeg');
      formdata.append('id', image.id);
      formdata.append('height', image.height);
      formdata.append('width', image.width);
      formdata.append('annotated', image.annotated);
      if (image.title && image.title !== 'undefined') {
        formdata.append('title', image.title);
      }
      if (image.caption && image.caption !== 'undefined') {
        formdata.append('caption', image.caption);
      }

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

    /**
     * Private Functions
     */

    // Transform the error response, unwrapping the application data from the API response payload
    function handleError(response) {
      return (response);
      /* if(!angular.isObject(response.data) || !response.data.Error) {
       var communicationError = 'There was a failure communicating with the strabo server. ' +
       'You are likely working in offline mode and cannot reach the server or the server is currently down. ';
       return($q.reject(communicationError));
       }
       // Otherwise, use expected error message.
       return($q.reject(response.data.Error));*/
    }

    // Transform the successful response, unwrapping the application data from the API response payload
    function handleSuccess(response) {
      return (response);
    }
  }
}());
