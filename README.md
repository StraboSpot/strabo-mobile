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
    ionic start ionic-sample blank

### Get Project Files

    git clone https://github.com/StraboSpot/strabo-mobile.git
    cd strabo-mobile
    
Move everything, **except `.gitignore`, `config.xml` and the `www` folder**, from the `ionic-sample` folder created above into the `strabo-mobile` folder. Delete the now mostly empty ionic-sample folder.
    
### Add Cordova Plugins

In the `strabo-mobile` folder:

    cordova plugin add org.apache.cordova.geolocation
    
###Run

In a web browser:

    ionic serve
    
In a USB connected Android device:

    ionic platform add android
    ionic run