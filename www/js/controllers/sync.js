angular.module('app')

.controller("SyncCtrl", function(
  $scope,
  SpotsFactory,
  SyncService) {
  
  // download Spots from database if in Internet mode
  $scope.downloadSpots = function() {
    if (navigator.onLine) {
      var id = "246";  // test spot
      SyncService.downloadSpot(id)
        .then(
          function(spot) {
            // save the spot -- if the id is defined, we overwrite existing id; otherwise create new id/spot
            SpotsFactory.save(spot, spot.properties.id.toString()).then(function(data){
              console.log("wrote", data);
              alert("Downloaded spot " + data.properties.id);
            });
          },
          function(errorMessage) {
            console.warn(errorMessage);
          }
        );
    } else
      alert("Spots can't be downloaded while offline.");
  };
  
  // upload Spots to database if in Internet mode
  $scope.uploadSpots = function() {
    if (navigator.onLine) {
      SpotsFactory.all().then(function(spots) {
          spots.forEach(function(spot, index) {
            try {
              SyncService.uploadSpots(spot);
              console.log("Uploaded spot " + spot.properties.id);
            } catch (err) {
              console.log("Upload Error");
            }
          });
          alert("Uploaded " + spots.length + " spots");
        });
    } else
      alert("Spots can't be uploaded while offline.");
  };
});
 