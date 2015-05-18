angular.module('app')

  .controller('SettingsCtrl', function(
    $scope,
    $ionicPopup,
    SettingsFactory,
    LoginFactory,
    SyncService) {

    // Form data for the login modal
    $scope.loginData = {};

    // base64 encoded login
    $scope.encodedLogin = null;

    $scope.hideActionButtons = {
      login: false,
      logout: true
    };

    var hideLoginButton = function() {
      $scope.hideActionButtons.login = true;
      $scope.hideActionButtons.logout = false;
    };

    var hideLogoutButton = function() {
      $scope.hideActionButtons.login = false;
      $scope.hideActionButtons.logout = true;
    };

    // is the user logged in from before?
    LoginFactory.getLogin()
      .then(function(login) {
        if (login !== null) {
          // we do have a login -- lets set the authentication
          console.log("we have a login!", login);

          // Encode the login string
          $scope.encodedLogin = Base64.encode(login.email + ":" + login.password);

          // set the email to the login email
          $scope.loginData.email = login.email;

          $scope.$apply(function(){
            hideLoginButton();
          });

          console.log($scope.hideActionButtons);

          //$scope.getDatasets();

        } else {
          // nope, dont have a login
          console.log("no login!");

          $scope.$apply(function() {
            hideLogoutButton();
          });
        }
      });

    // Perform the login action when the user presses the login icon
    $scope.doLogin = function() {
      // Authenticate user login
      if (navigator.onLine) {
        SyncService.authenticateUser($scope.loginData)
          .then(function(response) {
            if (response.status === 200 && response.data.valid == "true") {
              console.log("Logged in successfully.");
              hideLoginButton();
              LoginFactory.setLogin($scope.loginData)
                .then(function(login) {
                  // Encode the login string
                  $scope.encodedLogin = Base64.encode($scope.loginData.email + ":" + $scope.loginData.password);
                  // Get the list of datasets for this user
                  //$scope.getDatasets($scope.encodedLogin);
                });
            } else {
              $ionicPopup.alert({
                title: 'Login Failure!',
                template: 'Incorrect username or password.'
              });
            }
          },
          function(errorMessage) {
            $ionicPopup.alert({
              title: 'Alert!',
              template: errorMessage
            });
          }
        );
      } else
        $ionicPopup.alert({
          title: 'Offline!',
          template: 'Can\'t login while offline.'
        });
    };

    // Perform the logout action when the user presses the logout icon
    $scope.doLogout = function() {
      console.log('Logged out');
      // we do have a login so we should destroy the login because the user wants to logout
      LoginFactory.destroyLogin();
      $scope.encodedLogin = null;
      $scope.loginData = {
        email: null,
        password: null
      };
      hideLogoutButton();
    };

    SettingsFactory.getNamePrefix().then(function (prefix){
      if (!prefix || prefix == "null")
        $scope.prefix_type = "None";
      else{
        if (isNaN(prefix)) {
          $scope.prefix_type = "Text";
          $scope.text_prefix = prefix;
        }
        else {
          $scope.prefix_type = "Counter";
          $scope.counter_prefix = prefix;
          SettingsFactory.getPrefixIncrement().then(function (prefix_increment){
             $scope.prefix_increment = prefix_increment;
          });
        }
      }
    });

    SettingsFactory.getNameRoot().then(function (root){
      $scope.text_root = root;
    });

    SettingsFactory.getNameSuffix().then(function (suffix){
      if (!suffix || suffix == "null")
        $scope.suffix_type = "None";
      else{
        if (isNaN(suffix)) {
          $scope.suffix_type = "Text";
          $scope.text_suffix = suffix;
        }
        else {
          $scope.suffix_type = "Counter";
          $scope.counter_suffix = suffix;
          SettingsFactory.getSuffixIncrement().then(function (suffix_increment){
            $scope.suffix_increment = suffix_increment;
          });
        }
      }
    });

    $scope.typeChange = function (part) {
      switch(part) {
        case "prefix":
          switch($scope.prefix_type ) {
            case "None":
              $scope.text_prefix = null;
              $scope.counter_prefix = null;
              $scope.prefix_increment = null;
              break;
            case "Text":
              $scope.counter_prefix = null;
              $scope.prefix_increment = null;
              break;
            case "Counter":
              $scope.text_prefix = null;
              $scope.counter_prefix = 1;
              $scope.prefix_increment = 1;
              break;
          }
          break;
        case "suffix":
          switch($scope.suffix_type ) {
            case "None":
              $scope.text_suffix = null;
              $scope.counter_suffix = null;
              $scope.suffix_increment = null;
              break;
            case "Text":
              $scope.counter_suffix = null;
              $scope.suffix_increment = null;
              break;
            case "Counter":
              $scope.text_suffix = null;
              $scope.counter_suffix = 1;
              $scope.suffix_increment = 1;
              break;
          }
          break;
      }
    };

    $scope.save = function () {
      var prefix = "";
      if ($scope.text_prefix)
        prefix = $scope.text_prefix;
      else if ($scope.counter_prefix)
        prefix = $scope.counter_prefix;

      var suffix = "";
      if ($scope.text_suffix)
        suffix = $scope.text_suffix;
      else if ($scope.counter_suffix)
        suffix = $scope.counter_suffix;

      SettingsFactory.setNamePrefix(prefix).then(function() {
        SettingsFactory.setNameRoot($scope.text_root).then(function() {
          SettingsFactory.setNameSuffix(suffix).then(function () {
            SettingsFactory.setPrefixIncrement($scope.prefix_increment).then(function () {
              SettingsFactory.setSuffixIncrement($scope.suffix_increment).then(function(){
                $ionicPopup.alert({
                  title: 'Settings!',
                  template: 'Saved Settings.<br>Prefix: ' + prefix + '<br>Root: ' + $scope.text_root + '<br>Suffix: ' + suffix
                });
              });
            });
          });
        });
      });
    };

    // Create Base64 Object
    var Base64 = {
      _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      encode: function(e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
          n = e.charCodeAt(f++);
          r = e.charCodeAt(f++);
          i = e.charCodeAt(f++);
          s = n >> 2;
          o = (n & 3) << 4 | r >> 4;
          u = (r & 15) << 2 | i >> 6;
          a = i & 63;
          if (isNaN(r)) {
            u = a = 64
          } else if (isNaN(i)) {
            a = 64
          }
          t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
        }
        return t
      },
      decode: function(e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (f < e.length) {
          s = this._keyStr.indexOf(e.charAt(f++));
          o = this._keyStr.indexOf(e.charAt(f++));
          u = this._keyStr.indexOf(e.charAt(f++));
          a = this._keyStr.indexOf(e.charAt(f++));
          n = s << 2 | o >> 4;
          r = (o & 15) << 4 | u >> 2;
          i = (u & 3) << 6 | a;
          t = t + String.fromCharCode(n);
          if (u != 64) {
            t = t + String.fromCharCode(r)
          }
          if (a != 64) {
            t = t + String.fromCharCode(i)
          }
        }
        t = Base64._utf8_decode(t);
        return t
      },
      _utf8_encode: function(e) {
        e = e.replace(/\r\n/g, "\n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
          var r = e.charCodeAt(n);
          if (r < 128) {
            t += String.fromCharCode(r)
          } else if (r > 127 && r < 2048) {
            t += String.fromCharCode(r >> 6 | 192);
            t += String.fromCharCode(r & 63 | 128)
          } else {
            t += String.fromCharCode(r >> 12 | 224);
            t += String.fromCharCode(r >> 6 & 63 | 128);
            t += String.fromCharCode(r & 63 | 128)
          }
        }
        return t
      },
      _utf8_decode: function(e) {
        var t = "";
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
          r = e.charCodeAt(n);
          if (r < 128) {
            t += String.fromCharCode(r);
            n++
          } else if (r > 191 && r < 224) {
            c2 = e.charCodeAt(n + 1);
            t += String.fromCharCode((r & 31) << 6 | c2 & 63);
            n += 2
          } else {
            c2 = e.charCodeAt(n + 1);
            c3 = e.charCodeAt(n + 2);
            t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
            n += 3
          }
        }
        return t
      }
    }
  });

