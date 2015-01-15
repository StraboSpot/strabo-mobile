angular.module('app')

.service(
  "SyncService",
  function($http, $q) {

    // Return public API.
    return({
      authenticateUser: authenticateUser,
      uploadSpots: uploadSpots,
      downloadSpot: downloadSpot,
      downloadSpots: downloadSpots
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
    
    // Upload a spot to the database
    function uploadSpots(spot, encodedLogin) {
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

    // ---
    // Private Methods
    // ---

    // Transform the error response, unwrapping the application data from the API response payload
    function handleError(response) {
      if(!angular.isObject(response.data) || !response.data.Error) {
        return($q.reject("An unknown error occurred."));
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