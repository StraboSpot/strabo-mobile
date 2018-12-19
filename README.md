StraboSpot
==============

StraboSpot is an application for Structural Geology and Tectonics (SG&T) data acquisition. There are two versions in this repository:
- Mobile/Field/Standalone/Disconnected Version (cross-platform)
- Web/Connected Version

**Build Stack:**
- Core Technology: [Cordova](http://cordova.apache.org/)
- UI Framework (CSS & JS): [Ionic](http://ionicframework.com/)
- MVC: [Angular JS](https://angularjs.org/)
- Map Library: [OpenLayers 4](http://openlayers.org/)
- Geospatial Analysis: [Turf](http://turfjs.org/) and [JSTS](http://bjornharrtell.github.io/jsts/)
- Helpers: [Underscore](http://underscorejs.org/)
- AngularJS Extensions for Cordova API: [ngCordova](http://ngcordova.com/)
- Local Storage: [localForage with Cordova SQLite Driver](https://github.com/thgreasi/localForage-cordovaSQLiteDriver)
- Testing Framework: [Jasmine](http://jasmine.github.io/)
- Test Runner: [Karma](karma-runner.github.io/)
- Linting Utility: [ESLint](http://eslint.org/)

**Additional Libraries/Plugins for Web Version:**
- [JQuery 3.3.1](https://jquery.com)
- [Bootstrap 3.3.7](http://getbootstrap.com/)
- [Boot Side Menu jQuery Plugin](http://www.jqueryscript.net/menu/Sliding-Side-Menu-Panel-with-jQuery-Bootstrap-BootSideMenu.html)

## Development Setup

### Prerequisites

- [node.js](http://nodejs.org/)
- [git](http://git-scm.com/)
- Java SDK, Apache Ant, Android SDK for Windows users developing for Android. See the [Ionic notes](http://ionicframework.com/docs/guide/installation.html).

### Installation

    npm install -g cordova ionic

### Get Project Files

    git clone https://github.com/StraboSpot/strabo-mobile.git
    cd strabo-mobile


### Ionic Cordova Commands

Restore the Plugins and Platforms from `package.json`:

    ionic cordova prepare

Other commands for plugins and platforms:

    ionic cordova platform save   | save existing installed platforms to config.xml
    ionic cordova plugin save     | save existing installed plugins to config.xml
    ionic cordova platform --help | view help page for managing Cordova platforms
    ionic cordova plugin --help   | view help page for managing Cordova plugins
    ionic cordova prepare         | install platforms and plugins listed in config.xml

*Note: These plugins were originally added with the command `ionic cordova plugin add` which adds the plugin to `package.json` whereas `cordova plugin add` does not.*

Generate Resources (icons and splash screens):

    ionic cordova resources

### Tested Environment - Plugins    
    cordova-plugin-camera 4.0.3 "Camera"
    cordova-plugin-device 2.0.2 "Device"
    cordova-plugin-device-motion 2.0.1 "Device Motion"
    cordova-plugin-device-orientation 2.0.1 "Device Orientation"
    cordova-plugin-file 6.0.1 "File"
    cordova-plugin-file-transfer 1.7.1 "File Transfer"
    cordova-plugin-filepath 1.4.2 "cordova-plugin-filepath"
    cordova-plugin-geolocation 4.0.1 "Geolocation"
    cordova-plugin-inappbrowser 3.0.0 "InAppBrowser"
    cordova-plugin-ionic-keyboard 2.1.3 "cordova-plugin-ionic-keyboard"
    cordova-plugin-ionic-webview 2.2.3 "cordova-plugin-ionic-webview"
    cordova-plugin-itunesfilesharing 0.0.2 "cordova-plugin-itunesfilesharing"
    cordova-plugin-network-information 2.0.1 "Network Information"
    cordova-plugin-splashscreen 5.0.2 "Splashscreen"
    cordova-plugin-statusbar 2.4.2 "StatusBar"
    cordova-plugin-whitelist 1.3.3 "Whitelist"
    cordova-plugin-zip 3.1.0 "cordova-plugin-zip"
    cordova-sqlite-evcore-extbuild-free 0.9.9 "Cordova sqlite storage - free enterprise version with Android performance/memory improvements and extra features for PhoneGap Build"
    cordova-sqlite-storage 2.6.0 "Cordova sqlite storage plugin"
    io.phasr.cordova.plugin.itunesfilesharing 0.0.1 "cordova-plugin-itunesfilesharing"
    org.strabospot.clipboard 0.1.0 "Clipboard"

*Notes:*
- When used with PhoneGap Build the plugin `cordova-sqlite-storage` must be substituted for the following:

    `cordova-sqlite-evcore-extbuild-free 0.9.7 "Cordova sqlite storage - free enterprise version with Android performance/memory improvements and extra features for PhoneGap Build`

- This list can be generated with `ionic cordova plugin list`.
- `cordova-plugin-filepath`: Added due to Cordova bug with Android and content schema
- `cordova-sqlite-storage`: Added for the localForage dependencies
- `cordova-plugin-itunesfilesharing`: Added to `config.ionic.xml` for Ionic build. PhoneGap build uses

### Tested Environment

    Ionic:

    ionic (Ionic CLI) : 4.3.1 (C:\Users\Nathan\AppData\Roaming\npm\node_modules\ionic)
    Ionic Framework   : ionic1 1.3.3
    @ionic/v1-toolkit : 1.0.12

    Cordova:

    cordova (Cordova CLI) : 8.1.2 (cordova-lib@8.1.1)
    Cordova Platforms     : android 7.1.2
    Cordova Plugins       : cordova-plugin-ionic-keyboard 2.1.3, cordova-plugin-ionic-webview 2.2.3, (and 17 other plugins)

    System:

    Android SDK Tools : 26.1.1 (C:\Users\Nathan\AppData\Local\Android\Sdk)
    NodeJS            : v10.13.0 (C:\Program Files\nodejs\node.exe)
    npm               : 6.4.1
    OS                : Windows 10

*Notes:*
- This list can be generated with `ionic info`.

### Tested Environment - Other Packages/Libraries

    bower: 1.8.0
    ng-cordova: 0.1.27-alpha
    openlayers: 5.2.0
    turfjs: 5.1.6
    jsts: 1.3.0
    underscore: 1.8.3
    localforage: 1.7.3
    localforage-cordovasqlitedriver: 1.7.0


### Tested Environment - Platforms

    Installed platforms:
    android 7.1.2
    Available platforms:
    browser ~5.0.1
    ios ~4.5.4
    osx ~4.0.1
    windows ~6.0.0

*Notes:*
- This list can be generated with `ionic cordova platform list`.

### Versioning

When updates to the app are made, edit the version number of the app in the following 5 files:
- `www/app/about/about-directive.html`
- `www/app/login/login.html`
- `config.xml`
- `config.ionic.xml`
- `package.json`

## Running/Testing the Standalone App

### In a Desktop Web Browser:  

    ionic serve browser

### For iTunes Store, App Built with Ionic
- Packages were built in the step above with `ionic state restore`.
- Resources built in the step above with `ionic resources`.
- Set up an [Ionic Security Profile](http://docs.ionic.io/docs/security-profiles), named straboproduction.
- Use [Ionic Package](http://docs.ionic.io/docs/package-overview) to build new packages for changes that require binary modifications.

```
    ionic package build ios --profile straboproduction
    ionic package list
    ionic package download <id>
```

The resulting .ipa file needs to be uploaded to iTunes Connect using Xcode

    Xcode -> Open Developer Tool -> Application Loader

Once the .ipa file has been accepted, it can be submitted via iTunes Connect.


### As a Native App, Built App with Ionic
- Packages were built in the step above with `ionic state restore`.
- Set up an [Ionic Security Profile](http://docs.ionic.io/docs/security-profiles), named strabodev.
- Use [Ionic Package](http://docs.ionic.io/docs/package-overview) to build new packages for changes that require binary modifications.

```
    ionic package build android --profile strabodev
    ionic package build ios --profile strabodev
```

- Changes to the HTML/CSS/JS/Images/Audio/Video files (basically anything inside `/www`) only need to be updated with [Ionic Deploy](http://docs.ionic.io/docs/deploy-overview).

To Deploy Updates:

    ionic upload --note "new version" --deploy=production

### As a Native App, Built App with PhoneGap Build

- `config.xml` must be within the `www` folder
- `config.xml` must include plugins
- `config.xml` must include `<preference name="phonegap-version" value="cli-5.2.0"/>`

See [PhoneGap Build](https://build.phonegap.com).

### As a Native App, Built Locally

To test as a native app see the Ionic [guide](http://ionicframework.com/docs/guide/testing.html).

For a USB connected Android device first copy `config.xml` from `strabo-moble/www` into the `strabo-mobile` root. Then:

    ionic cordova platform add android
    ionic cordova run android

Note: use `ionic cordova run android --livereload` tag to debug

## Running/Testing the Web App

Run `indexWeb.html` with a local server.

For example with [local-web-server](https://www.npmjs.com/package/local-web-server):

    npm install -g local-web-server
    ws --spa indexWeb.html


## Library Updates

**Ionic:**

1. Download latest ionic: `npm install -g ionic`
2. In project root run: `ionic lib update`
3. Check the version of `angular.js` that is bundled within `www/lib/ionic/js/ionic.bundle.js` and make sure that `www/lib/angular-mocks.js` and `www/lib/angular-messages.js` have the same version number. Download updates from [here](https://code.angularjs.org/) if necessary.


## Unit-Testing

Prerequisites:

    npm install karma --save-dev
    npm install karma-jasmine --save-dev
    npm install jasmine-core --save-dev
    npm install -g karma-cli

Add test browsers:

    npm install karma-chrome-launcher --save-dev

To run tests:

    karma start

Note: Make sure the version of `angular.js` that is bundled within `www/lib/ionic/js/ionic.bundle.js` matches the version of `angular-mocks.js`. Updated versions can be found [here](https://code.angularjs.org/).

## Linting

Using [ESLint](http://eslint.org/) with an AngularJS plugin based on [John Papa's Guideline](https://github.com/johnpapa/angular-styleguide).

1) Install eslint as a dev-dependency:

    npm install --save-dev eslint

2) Install eslint-plugin-angular as a dev-dependency:

    npm install --save-dev eslint-plugin-angular

3) Install eslint-config-angular as a dev-dependency:

    npm install --save-dev eslint-config-angular

4) Use the config file in the project root: `.eslintrc`
