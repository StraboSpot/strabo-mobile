Strabo Mobile
==============

Strabo Mobile is a cross-platform mobile application for Structural Geology and Tectonics (SG&T) data acquisition.

Build Stack:
- Core Technology: [Cordova/PhoneGap](http://cordova.apache.org/)
- UI Framework (CSS & JS): [Ionic](http://ionicframework.com/)
- MVC: [Angular JS](https://angularjs.org/)
- Map Library: [OpenLayers 3](http://openlayers.org/)
- AngularJS Extensions for Cordova API: [ngCordova](http://ngcordova.com/)
- Local Storage: [localForage with Cordova SQLite Driver](https://github.com/thgreasi/localForage-cordovaSQLiteDriver)
- Testing Framework: [Jasmine](http://jasmine.github.io/)
- Test Runner: [Karma](karma-runner.github.io/)
- Linting Utility: [ESLint](http://eslint.org/)

## Development Setup

### Prerequisites

- [node.js](http://nodejs.org/)
- [git](http://git-scm.com/)
- Java SDK, Apache Ant, Android SDK for Windows users developing for Android. See the [Ionic notes](http://ionicframework.com/docs/guide/installation.html).

### Installation

    npm install -g cordova ionic
    ionic start ToDelete

### Get Project Files

    git clone https://github.com/StraboSpot/strabo-mobile.git
    cd strabo-mobile

- Move everything, **except `.gitignore`, `config.xml`, `ionic.project` and the `www` folder**, from the `ionic-sample` folder created above into the `strabo-mobile` folder.
- Delete the now mostly empty `ToDelete` folder.

### Tested Environment

    ionic library: 1.2.4
    ionic cli : 1.7.14
    cordova: 6.6.1
    ng-cordova: v0.1.23-alpha
    cordova-plugin-camera: 1.2.0
    cordova-plugin-console: 1.0.1
    cordova-plugin-device: 1.0.1
    cordova-plugin-file: 3.0.0
    cordova-plugin-geolocation: 1.0.1
    cordova-plugin-inappbrowser: 1.0.1
    cordova-plugin-network-information: 1.0.1
    cordova-plugin-whitelist: 1.0.0
    ionic-plugin-keyboard: 1.0.7
    nodejs: 5.0.0
    npm: 2.12.1
    bower: 1.7.2
    
### Run in a Web Browser    

    ionic serve

### Build App with Ionic
See [Ionic Package Help Docs](http://docs.ionic.io/docs/package-overview)

### Build App Locally
**Add Cordova Plugins**

In the `strabo-mobile` folder:

    cordova plugin add cordova-plugin-geolocation
    cordova plugin add cordova-plugin-network-information
    cordova plugin add cordova-plugin-camera
    cordova plugin add cordova-plugin-file
    cordova plugin add cordova-plugin-inappbrowser

Also need to install this plugin due to Cordova bug with Android and content schema

    cordova plugin add cordova-plugin-filepath
    
Install this plugin for the localForage dependencies

    cordova plugin add cordova-sqlite-storage@0.7.14

**Run on a Mobile Device**

To test as a native app see the Ionic [guide](http://ionicframework.com/docs/guide/testing.html).

For a USB connected Android device first copy `config.xml` from `strabo-moble/www` into the `strabo-mobile` root. Then:

    ionic platform add android
    ionic run

### Testing

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

### Updating

Ionic:

1. Download latest ionic: `npm install -g ionic`
2. In project root run: `ionic lib update`
3. Check the version of `angular.js` that is bundled within `www/lib/ionic/js/ionic.bundle.js` and make sure that `www/lib/angular-mocks.js` and `www/lib/angular-messages.js` have the same version number. Download updates from [here](https://code.angularjs.org/) if necessary. 


### Linting

Using [ESLint](http://eslint.org/) with an AngularJS plugin based on [John Papa's Guideline](https://github.com/johnpapa/angular-styleguide).

1) Install eslint as a dev-dependency:

    npm install --save-dev eslint

2) Install eslint-plugin-angular as a dev-dependency:

    npm install --save-dev eslint-plugin-angular

3) Install eslint-config-angular as a dev-dependency:

    npm install --save-dev eslint-config-angular
    
4) Use the config file in the project root: `.eslintrc`
