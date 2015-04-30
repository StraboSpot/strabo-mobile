angular.module('app')

.service(
  "SyncService",
  function($http, $q) {

    // Return public API.
    return({
      authenticateUser: authenticateUser,
      getProjects: getProjects,
      createProject: createProject,
      deleteProject: deleteProject,
      deleteProjectSpots: deleteProjectSpots,
      addProjectSpot: addProjectSpot,
      getProjectSpots: getProjectSpots
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

    // Get all projects for a user
    function getProjects(encodedLogin) {
      var request = $http({
        method: "get",
        url: "http://strabospot.org/db/myProjects",
        headers: {
          'Authorization': "Basic " + encodedLogin + "\""
        }
      });
      return(request.then(handleSuccess, handleError));
    }

    // Create a new project for a user
    function createProject(name, encodedLogin) {
      var request = $http({
        method: "post",
        url: "http://strabospot.org/db/project",
        headers: {
          'Authorization': "Basic " + encodedLogin + "\"",
          'Content-Type': 'application/json'
        },
        data:
          name
      });
      return(request.then(handleSuccess, handleError));
    }

    // Delete a project
    function deleteProject(self_url, encodedLogin) {
      var request = $http({
        method: "delete",
        url: self_url,
        headers: {
          'Authorization': "Basic " + encodedLogin + "\"",
          'Content-Type': 'application/json'
        }
      });
      return(request.then(handleSuccess, handleError));
    }

    // Delete all spots in a project
    function deleteProjectSpots(project_id, encodedLogin) {
      var request = $http({
        method: "delete",
        url: "http://strabospot.org/db/projectSpots/" + project_id,
        headers: {
          'Authorization': "Basic " + encodedLogin + "\"",
          'Content-Type': 'application/json'
        }
      });
      return(request.then(handleSuccess, handleError));
    }

    // Add a spot to a project
    function addProjectSpot(spot, project_id, encodedLogin) {
      var request = $http({
        method: "post",
        url: "http://strabospot.org/db/projectSpots/" + project_id,
        headers: {
          'Authorization': "Basic " + encodedLogin + "\"",
          'Content-Type': 'application/json'
        },
        data:
          spot
      });
      return(request.then(handleSuccess, handleError));
    }

    // Get all spots for a project
    function getProjectSpots(project_id, encodedLogin) {
      var request = $http({
        method: "get",
        url: "http://www.strabospot.org/db/projectSpots/" + project_id,
        headers: {
          'Authorization': "Basic " + encodedLogin + "\""
        }
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
      return(response);
    }
  }
);
