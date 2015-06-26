angular.module('app')

.service(
  "SyncService",
  function($http, $q) {

    // Return public API.
    return({
      authenticateUser: authenticateUser,
      createFeature: createFeature,
      updateFeature: updateFeature,
      getDatasets: getDatasets,
      createDataset: createDataset,
      deleteDataset: deleteDataset,
      addSpotToDataset: addSpotToDataset,
      deleteAllDatasetSpots: deleteAllDatasetSpots,
      addDatasetSpot: addDatasetSpot,
      getDatasetSpots: getDatasetSpots,
      deleteSpots: deleteSpots
    });

    // ---
    // Public Methods
    // ---

    // Authenticate the user
    function authenticateUser(loginData) {
      var request = $http({
        method: "post",
        url: "http://strabospot.org/userAuthenticate",
        headers: {
          'Content-Type': 'application/json'
        },
        data:
          loginData
      });
      return(request.then(handleSuccess, handleError));
    }

    // Create a new feature
    function createFeature(spot, encodedLogin) {
      var request = $http({
        method: "post",
        url: "http://strabospot.org/db/feature",
        headers: {
          'Authorization': "Basic " + encodedLogin,
          'Content-Type': 'application/json'
        },
        data:
          spot
      });
      return(request.then(handleSuccess, handleError));
    }

    // Update a feature
    function updateFeature(spot, encodedLogin) {
      var request = $http({
        method: "post",
        url: spot.properties.self,
        headers: {
          'Authorization': "Basic " + encodedLogin,
          'Content-Type': 'application/json'
        },
        data:
          spot
      });
      return(request.then(handleSuccess, handleError));
    }

    // Get all datasets for a user
    function getDatasets(encodedLogin) {
      var request = $http({
        method: "get",
        url: "http://strabospot.org/db/myDatasets",
        headers: {
          'Authorization': "Basic " + encodedLogin
        }
      });
      return(request.then(handleSuccess, handleError));
    }

    // Create a new dataset for a user
    function createDataset(name, encodedLogin) {
      var request = $http({
        method: "post",
        url: "http://strabospot.org/db/dataset",
        headers: {
          'Authorization': "Basic " + encodedLogin,
          'Content-Type': 'application/json'
        },
        data:
          name
      });
      return(request.then(handleSuccess, handleError));
    }

    // Delete a dataset
    function deleteDataset(self_url, encodedLogin) {
      var request = $http({
        method: "delete",
        url: self_url,
        headers: {
          'Authorization': "Basic " + encodedLogin,
          'Content-Type': 'application/json'
        }
      });
      return(request.then(handleSuccess, handleError));
    }

    // Add a spot to a dataset
    function addSpotToDataset(id, dataset_id, encodedLogin) {
      var request = $http({
        method: "post",
        url: "http://strabospot.org/db/datasetSpots/" + dataset_id,
        headers: {
          'Authorization': "Basic " + encodedLogin,
          'Content-Type': 'application/json'
        },
        data: {
          "id": id
        }
      });
      return(request.then(handleSuccess, handleError));
    }

    // Delete all spots in a dataset
    function deleteAllDatasetSpots(dataset_id, encodedLogin) {
      var request = $http({
        method: "delete",
        url: "http://strabospot.org/db/datasetSpots/" + dataset_id,
        headers: {
          'Authorization': "Basic " + encodedLogin,
          'Content-Type': 'application/json'
        }
      });
      return(request.then(handleSuccess, handleError));
    }

    // Add a spot to a dataset
    function addDatasetSpot(spot, dataset_id, encodedLogin) {
      var request = $http({
        method: "post",
        url: "http://strabospot.org/db/datasetSpots/" + dataset_id,
        headers: {
          'Authorization': "Basic " + encodedLogin,
          'Content-Type': 'application/json'
        },
        data:
          spot
      });
      return(request.then(handleSuccess, handleError));
    }

    // Get all spots for a dataset
    function getDatasetSpots(dataset_id, encodedLogin) {
      var request = $http({
        method: "get",
        url: "http://www.strabospot.org/db/datasetSpots/" + dataset_id,
        headers: {
          'Authorization': "Basic " + encodedLogin
        }
      });
      return(request.then(handleSuccess, handleError));
    }

    // Delete ALL spots for a user
    function deleteSpots(encodedLogin) {
      var request = $http({
        method: "delete",
        url: "http://strabospot.org/db/myFeatures",
        headers: {
          'Authorization': "Basic " + encodedLogin,
          'Content-Type': 'application/json'
        }
      });
      return(request.then(handleSuccess, handleError));
    }

    // ---
    // Private Methods
    // ---

    // Transform the error response, unwrapping the application data from the API response payload
    function handleError(response) {
      return(response);
      /*if(!angular.isObject(response.data) || !response.data.Error) {
        var communicationError = "There was a failure communicating with the strabo server. " +
          "You are likely working in offline mode and cannot reach the server or the server is currently down. ";
        return($q.reject(communicationError));
      }
      // Otherwise, use expected error message.
      return($q.reject(response.data.Error));*/
    }

    // Transform the successful response, unwrapping the application data from the API response payload
    function handleSuccess(response) {
      return(response);
    }
  }
);
