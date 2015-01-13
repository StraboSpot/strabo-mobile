angular.module('app')

.service(
  "SyncService",
  function($http, $q) {

    // Return public API.
    return({
      uploadSpots: uploadSpots,
      downloadSpot: downloadSpot
    });

    // ---
    // Public Methods
    // ---

    // Upload a spot to the database
    function uploadSpots(spot, encodedLogin) {
      var request = $http({
        method: "post",
        url: "http://strabospot.org/db/feature",
        headers: {
         'Authorization': "Basic " + encodedLogin + "\""
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

    // ---
    // Private Methods
    // ---

    // Transform the error response, unwrapping the application data from the API response payload
    function handleError(response) {
      if(response.status) {
        if(response.status == "401")
          return($q.reject("Login failure. Incorrect username or password."));
      }
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