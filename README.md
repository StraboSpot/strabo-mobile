Strabo Mobile
==============

Strabo Mobile is a cross-platform mobile application for Structural Geology and Tectonics (SG&T) data acquisition.

Build Stack:
- Core Technology - [Cordova/PhoneGap](http://cordova.apache.org/)
- UI Framework (CSS & JS) - [Ionic](http://ionicframework.com/)
- MVC - [Angular JS](https://angularjs.org/)
- Map Library - [OpenLayers 3](http://openlayers.org/)
- AngularJS Extensions for Cordova API - [ngCordova](http://ngcordova.com/)

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

    npm install -g jasmine
    npm install -g karma
    npm install -g karma-cli

To run tests:

    karma start
