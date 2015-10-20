Strabo Mobile
==============

Strabo Mobile is a cross-platform mobile application for Structural Geology and Tectonics (SG&T) data acquisition.

Build Stack:
- Core Technology: [Cordova/PhoneGap](http://cordova.apache.org/)
- UI Framework (CSS & JS): [Ionic](http://ionicframework.com/)
- MVC: [Angular JS](https://angularjs.org/)
- Map Library: [OpenLayers 3](http://openlayers.org/)
- AngularJS Extensions for Cordova API: [ngCordova](http://ngcordova.com/)
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
    ionic start ionic-sample blank

### Get Project Files

    git clone https://github.com/StraboSpot/strabo-mobile.git
    cd strabo-mobile

- Move everything, **except `.gitignore`, `config.xml` and the `www` folder**, from the `ionic-sample` folder created above into the `strabo-mobile` folder.
- Delete the now mostly empty ionic-sample folder.
- In `ionic.project` modify to `"app_id": "90b11d0a"`.

### Add Cordova Plugins

In the `strabo-mobile` folder:

    cordova plugin add cordova-plugin-geolocation
    cordova plugin add cordova-plugin-network-information
    cordova plugin add cordova-plugin-camera
    cordova plugin add cordova-plugin-file
    cordova plugin add cordova-plugin-inappbrowser

Also need to install this plugin due to Cordova bug with Android and content schema

    cordova plugin add cordova-plugin-filepath

### Tested Environment

    ionic library: 1.1.0
    ionic cli : 1.6.5
    cordova: 5.2.0
    cordova-plugin-camera: 1.2.0
    cordova-plugin-console: 1.0.1
    cordova-plugin-device: 1.0.1
    cordova-plugin-file: 3.0.0
    cordova-plugin-geolocation: 1.0.1
    cordova-plugin-inappbrowser: 1.0.1
    cordova-plugin-network-information: 1.0.1
    cordova-plugin-whitelist: 1.0.0
    ionic-plugin-keyboard: 1.0.7
    nodejs: 4.1.2
    npm: 3.3.5

### Run

In a web browser:

    ionic serve

To test as a native app see the Ionic [guide](http://ionicframework.com/docs/guide/testing.html).

For a USB connected Android device first copy `config.xml` from `strabo-moble/www` into the `strabo-mobile` root. (This copy can be deleted after but be sure the original remains in `strabo-moble/www`. PhoneGap Build needs `config.xml` in `strabo-moble/www`.) Then:

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
