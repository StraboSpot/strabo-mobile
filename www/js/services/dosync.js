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
    function uploadSpots(spot) {
      var request = $http({
        method: "post",
        url: "http://strabospot.org/db/feature",
        headers: {
         'Authorization': "AUTH GOES HERE"
        },
        data:
            spot
      });
      return(request.then(handleSuccess, handleError));
    }

    // Download a spot from the database
    function downloadSpot(id) {
      var request = $http({
        method: "get",
        url: "http://strabospot.org/db/feature/" + id,
        headers: {
         'Authorization': "AUTH GOES HERE"
        },
      });
      return(request.then(handleSuccess, handleError));
    }

    // ---
    // Private Methods
    // ---

    // Transform the error response, unwrapping the application data from the API response payload
    function handleError( response ) {
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