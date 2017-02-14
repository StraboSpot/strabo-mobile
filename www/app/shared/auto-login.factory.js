(function () {
  'use strict';

  angular
    .module('app')
    .factory('AutoLoginFactory', AutoLoginFactory);

  AutoLoginFactory.$inject = ['$location', '$log', '$q', 'ImageFactory', 'OtherMapsFactory', 'ProjectFactory', 'RemoteServerFactory',
                              'SpotFactory', 'UserFactory', 'IS_WEB'];
  function AutoLoginFactory($location, $log, $q, ImageFactory, OtherMapsFactory,ProjectFactory, RemoteServerFactory,
                            SpotFactory, UserFactory, IS_WEB) {

    // Return public API
    return {
      'autoLogin': autoLogin
    };

    /**
     * Private Functions
     */


    /**
     * Public Functions
     */

    // Automatically login using credentials passed via GET
    function autoLogin() {
      var deferred = $q.defer(); // init promise
      if ( IS_WEB ) { //If this is the web app
        var GETlogin = {};
        var GETcredentials = $location.search()['credentials'];
        var GETproject = {};
        GETproject.id = $location.search()['projectid'];
        $log.log('Auto Login Here...');
        $log.log('First, force logout and destroy project');
        UserFactory.clearUser();
        ProjectFactory.destroyProject();
        SpotFactory.clearAllSpots();
        ImageFactory.deleteAllImages();
        OtherMapsFactory.destroyOtherMaps();
        $log.log('Credentials set, check for validity.');

        if (GETcredentials) {
        GETcredentials = atob(GETcredentials);
        $log.log('Credentials decoded: ',GETcredentials);
        GETlogin.email = GETcredentials.split("*****")[0];
        GETlogin.password = GETcredentials.split("*****")[1];
        GETlogin.encoded_login = btoa(GETlogin.email+':'+GETlogin.password);
        UserFactory.doLogin(GETlogin).then(function () {
          $log.log('Made it past doLogin.');
          if (UserFactory.getUser()){
            $log.log('GetUser: ', UserFactory.getUser());
            ProjectFactory.setUser(UserFactory.getUser());
            ProjectFactory.loadProjectRemote(GETproject).then(function () {
              ProjectFactory.prepProject().then(function () {
                deferred.resolve();
              });
            });
          }
          else {
            deferred.resolve();
          }
        });
        }
        else {
          deferred.resolve();
        }



      }
      else{
        deferred.resolve();
      }

      return deferred.promise;
    }


  }
}());
