angular.module('app')

.controller("SyncCtrl", function(
  $scope,
  SpotsFactory,
  SyncService) {
  
  // Form data for the login modal
  $scope.loginData = {};

  // Perform the login action when the user presses the login icon
  $scope.doLogin = function() {
    
    // Encode the login string
    $scope.encodedLogin = Base64.encode($scope.loginData.email + ":" + $scope.loginData.password);
    
    // Authenticate user login
    if (navigator.onLine) {
      SyncService.authenticateUser($scope.loginData)
        .then(
          function(response) {
            if(response.valid == "true")
              console.log("Logged in successfully.");
            else {
              $scope.encodedLogin = null;
              alert("Login failure. Incorrect username or password.");
            }
          },
          function(errorMessage) {
            $scope.encodedLogin = null;
            alert(errorMessage);
          }
        );
    } 
    else
      alert("Can't login while offline."); 
   };
   
  // Perform the logout action when the user presses the logout icon
  $scope.doLogout = function() {
    console.log('Logged out');
    $scope.encodedLogin = null;
    $scope.loginData = {
      email: null,
      password: null
    };
  }
  
  // Download Spots from database if in Internet mode
  $scope.downloadSpots = function() {
    if (navigator.onLine) {
      if ($scope.encodedLogin) {
        SyncService.downloadSpots($scope.encodedLogin)
          .then(
            function(spots) {
              if (spots != "null") {
                console.log("Downloaded", spots);
                spots.features.forEach(function(spot){
                  // save the spot -- if the id is defined, we overwrite existing id; otherwise create new id/spot
                  SpotsFactory.save(spot, spot.properties.id);
                });
              }
              else
                alert("No spots linked to this account to download.");
            },
            function(errorMessage) {
              console.warn(errorMessage);
            }
          );
      }
      else 
        alert("You must log in first.");
    } 
    else
      alert("Spots can't be downloaded while offline.");
  };
  
  // Upload Spots to database if in Internet mode
  $scope.uploadSpots = function() {
    if (navigator.onLine) {
      if ($scope.encodedLogin) {
        SpotsFactory.all().then(function(spots) {
          spots.forEach(function(spot, index) {
            try {
              $scope.curTempID = spot.properties.id;
              
              // If this is not a new spot 
              // a self URL in spot.properties.self has already been defined
              if (spot.properties.self){
                SyncService.updateFeature(spot, $scope.encodedLogin, spot.properties.self)
                  .then(
                    function(spot) {
                      // Replace local spot with spot in server response
                      SpotsFactory.destroy($scope.curTempID);
                      SpotsFactory.save(spot, spot.properties.id);
                      console.log("Updated spot", spot);
                    }
                  );
              }
              // If this is a new spot
              // a self URL is spot.properties.self has not been defined
              else {
                SyncService.createFeature(spot, $scope.encodedLogin)
                  .then(
                    function(spot) {
                      // Replace local spot with spot in server response
                      SpotsFactory.destroy($scope.curTempID);
                      SpotsFactory.save(spot, spot.properties.id);
                      console.log("Created new spot", spot);
                    }
                  );
              }
              //console.log("Uploaded spot " + spot.properties.id);
            } catch (err) {
              console.log("Upload Error");
            }
          });
        });
      }
      else 
        alert("You must log in first.");  
    }
    else
      alert("Spots can't be uploaded while offline.");
  };
  
  // Create Base64 Object
  var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
});
 