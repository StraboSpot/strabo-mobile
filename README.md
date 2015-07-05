Strabo Mobile
==============

Strabo Mobile is a cross-platform mobile application for geologic field data acquisition.

Build Stack:
- Core Technology - [Cordova/PhoneGap](http://cordova.apache.org/)
- UI Framework (CSS & JS) - [Ionic](http://ionicframework.com/)
- MVC - [Angular JS](https://angularjs.org/)
- Map Library - [OpenLayers 3](http://openlayers.org/)
- AngularJS Extensions for Cordova API - [ngCordova](http://ngcordova.com/)

##Development Setup

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

###Tested environment:
    cordova: 5.1.1
    ionic: 1.5.5
    cordova-plugin-camera: 1.2.0
    cordova-plugin-file: 2.1.0

###Run

In a web browser:

    ionic serve

To test as a native app see the Ionic [guide](http://ionicframework.com/docs/guide/testing.html).
For a USB connected Android device:

    ionic platform add android
    ionic run

###Testing

Prerequisites:

    npm install -g jasmine
    npm install -g karma
    npm install -g karma-cli

To run tests:

    karma start
