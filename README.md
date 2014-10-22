Strabo Mobile
==============

Strabo Mobile is a cross-platform mobile application for geologic field data acquisition.

Build Stack:
- Core Technology - [Cordova/PhoneGap](http://cordova.apache.org/)
- UI Framework (CSS & JS) - [Ionic](http://ionicframework.com/)
- MVC - [Angular JS](https://angularjs.org/)
- Map Library - [Leaflet](http://leafletjs.com/) 
- AngularJS Directive for Leaflet - [Angular-Leaflet-Directive](https://github.com/tombatossals/angular-leaflet-directive)
- AngularJS Extensions for Cordova API - [ngCordova](http://ngcordova.com/)

##Development Setup

### Prerequisites

- Install [node.js](http://nodejs.org/)

### Installation

    npm install -g cordova ionic
    ionic start strabo-mobile blank
    cd strabo-mobile
    del config.xml

### Add Cordova Plugins

    cordova plugin add org.apache.cordova.geolocation

### Add Project Files

    git clone https://github.com/StraboSpot/strabo-mobile.git

Replace all of the contents of `strabo-mobile/www` with the files that were just downloaded from GitHub.
    
###Run

In a web browser:

    ionic serve
    
In a usb connected Android device:

    ionic platform add android
    ionic run