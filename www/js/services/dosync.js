angular.module('app')

.service(
  "SyncService",
  function($http, $q) {

    // Return public API.
    return({
      authenticateUser: authenticateUser,
      createFeature: createFeature,
      updateFeature: updateFeature,
      downloadSpot: downloadSpot,
      downloadSpots: downloadSpots,
      deleteMyFeatures: deleteMyFeatures,
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

    // Upload a new spot to the database
    function createFeature(spot, encodedLogin) {
      var request = $http({
        method: "post",
        url: "http://strabospot.org/db/feature",
        headers: {
          'Authorization': "Basic " + encodedLogin + "\"",
          'Content-Type': 'application/json'
        },
        data:
          spot
      });
      return(request.then(handleSuccess, handleError));
    }

    // Update an existing spot in the database
    function updateFeature(spot, encodedLogin, selfURL) {
      var request = $http({
        method: "post",
        url: selfURL,
        headers: {
          'Authorization': "Basic " + encodedLogin + "\"",
          'Content-Type': 'application/json'
        },
        data:
          spot
      });
      return(request.then(handleSuccess, handleError));
    }

    // Download a spot from the database
    function downloadSpot(id, encodedLogin) {
      var request = $http({
        method: "get",
        url: "http://strabospot.org/db/feature/" + id,
        headers: {
          'Authorization': "Basic " + encodedLogin + "\""
        },
      });
      return(request.then(handleSuccess, handleError));
    }

    // Download all of a user's spots from the database
    function downloadSpots(encodedLogin) {
      var request = $http({
        method: "get",
        url: "http://strabospot.org/db/myFeatures",
        headers: {
          'Authorization': "Basic " + encodedLogin + "\""
        },
      });
      return(request.then(handleSuccess, handleError));
    }
    
    // Delete all of the features associated with the logged in user
    function deleteMyFeatures(encodedLogin) {
      var request = $http({
        method: "delete",
        url: "http://strabospot.org/db/myFeatures",
        headers: {
          'Authorization': "Basic " + encodedLogin + "\""
        },
      });
      return(request.then(handleSuccess, handleError));
    }

    // ---
    // Private Methods
    // ---

    // Transform the error response, unwrapping the application data from the API response payload
    function handleError(response) {
      if(!angular.isObject(response.data) || !response.data.Error) {
        var communicationError = "There was a failure communicating with the strabo server. " +
          "You are likely working in offline mode and cannot reach the server or the server is currently down. ";
        return($q.reject(communicationError));
      }
      // Otherwise, use expected error message.
      return($q.reject(response.data.Error));
    }

    // Transform the successful response, unwrapping the application data from the API response payload
    function handleSuccess(response) {
      return(response.data);
    }
  }
);
