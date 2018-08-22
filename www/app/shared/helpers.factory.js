(function () {
  'use strict';

  angular
    .module('app')
    .factory('HelpersFactory', HelpersFactory);

  HelpersFactory.$inject = ['$cordovaClipboard', '$cordovaDevice', '$cordovaFile', '$ionicPopup', '$log', '$q',
    '$window', 'IS_WEB'];

  function HelpersFactory($cordovaClipboard, $cordovaDevice, $cordovaFile, $ionicPopup, $log, $q, $window, IS_WEB) {
    var ids = [];

    return {
      'b64toBlob': b64toBlob,
      'blobToBase64': blobToBase64,
      'cleanObj': cleanObj,
      'convertToLargerUnit': convertToLargerUnit,
      'convertToSmallerUnit': convertToSmallerUnit,
      'csvToArray': csvToArray,
      'deepFindById': deepFindById,
      'getStereonet': getStereonet,
      'getNewId': getNewId,
      'hexToRgb': hexToRgb,
      'mod': mod,
      'roundToDecimalPlaces': roundToDecimalPlaces,
      'toDegrees': toDegrees,
      'toRadians': toRadians
    };

    /**
     * Public Functions
     */

    // Convert a base64 string to a Blob according to the data and contentType.
    function b64toBlob(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
      var byteArrays = [];

      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      return new Blob(byteArrays, {type: contentType});
    }

    // Converts blobs to base64
    function blobToBase64(blob) {
      var deferred = $q.defer(); // init promise
      var reader = new $window.FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        deferred.resolve(reader.result);
      };
      return deferred.promise;
    }

    // Remove nulls, undefined, empty strings and empty objects
    function cleanObj(obj) {
      _.each(obj, function (ele, i) {
        if (_.isObject(ele) && _.isEmpty(ele) && !_.isDate(ele)) delete obj[i];
        else if (_.isObject(ele) && !_.isEmpty(ele)) obj[i] = cleanObj(ele);
        else if (_.isString(ele) && ele.trim() === '') delete obj[i];
        else if (_.isUndefined(ele)) delete obj[i];
        else if (_.isNull(ele)) delete obj[i];
      });
      return obj;
    }

    function convertToLargerUnit(width, unit) {
      if (unit === 'm') return {'value': width / 1000, 'unit': 'km'};
      if (unit === 'cm') return {'value': width / 100, 'unit': 'm'};
      if (unit === 'mm') return {'value': width / 10, 'unit': 'cm'};
      if (unit === '_m') return {'value': width / 1000, 'unit': 'mm'};
      return {'value': width, 'unit': unit};
    }

    function convertToSmallerUnit(width, unit) {
      if (unit === 'km') return {'value': width * 1000, 'unit': 'm'};
      if (unit === 'm') return {'value': width * 100, 'unit': 'cm'};
      if (unit === 'cm') return {'value': width * 10, 'unit': 'mm'};
      if (unit === 'mm') return {'value': width * 1000, 'unit': '_m'};
      if (unit === '_m') return {'value': width * 1000, 'unit': 'nm'};
      return {'value': width, 'unit': unit};
    }

    // Parsing CSV Strings With Javascript Exec() Regular Expression Command
    // https://gist.github.com/bennadel/9753411#file-code-1-htm
    function csvToArray(strData, strDelimiter) {
      // Check to see if the delimiter is defined. If not,
      // then default to comma.
      strDelimiter = (strDelimiter || ',');
      // Create a regular expression to parse the CSV values.
      var objPattern = new RegExp(
          (
              // Delimiters.
              '(\\' + strDelimiter + '|\\r?\\n|\\r|^)' +

              // Quoted fields.
              '(?:"([^"]*(?:""[^"]*)*)"|' +

              // Standard fields.
              '([^"\\' + strDelimiter + '\\r\\n]*))'
          ),
          'gi'
          );
      // Create an array to hold our data. Give the array
      // a default empty first row.
      var arrData = [[]];
      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;
      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while (arrMatches = objPattern.exec(strData)) {
        $log.log('arrMatches', arrMatches);
          // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
          // Check to see if the given delimiter has a length
          // (is not the start of string) and if it matches
          // field delimiter. If id does not, then we know
          // that this delimiter is a row delimiter.
        if (
              strMatchedDelimiter.length &&
              strMatchedDelimiter !== strDelimiter
              ) {
              // Since we have reached a new row of data,
              // add an empty row to our data array.
          arrData.push([]);
        }
        var strMatchedValue;
          // Now that we have our delimiter out of the way,
          // let's check to see which kind of value we
          // captured (quoted or unquoted).
        if (arrMatches[2]) {
              // We found a quoted value. When we capture
              // this value, unescape any double quotes.
          strMatchedValue = arrMatches[2].replace(
                  new RegExp('""', 'g'),
                  '"'
                  );
        }
        else {
              // We found a non-quoted value.
          strMatchedValue = arrMatches[3];
        }
          // Now that we have our value string, let's add
          // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
      }
      // Return the parsed data.
      return (arrData);
    }

    // Find a deeply nested object by id
    function deepFindById(obj, id) {
      //Early return
      if( obj.id === id ) return obj;
      var result, p;
      for (p in obj) {
        if( obj.hasOwnProperty(p) && typeof obj[p] === 'object' ) {
          result = deepFindById(obj[p], id);
          if(result) return result;
        }
      }
      return result;
    }

    function hexToRgb(hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }

    // Correct a quirk in JS that doesn't mod negative number correctly
    function mod(a, n) {
      return ((a % n) + n) % n;
    }

    // Return id from the timestamp (in milliseconds) with a random 1 digit number appended (= 14 digit id)
    // "Integers (numbers without a period or exponent notation) are considered accurate up to 15 digits."
    function getNewId() {
      var newId = Math.floor((new Date().getTime() + Math.random()) * 10);
      if (_.contains(ids, newId)) {
        newId = Math.floor((new Date().getTime() + Math.random()) * 10);
        if (_.contains(ids, newId)) newId = Math.floor((new Date().getTime() + Math.random()) * 10);
      }
      ids.push(newId);
      return newId;
    }

    //Accepts object of spots and creates CSV string suitable for pasting into
    //Rick Allmendinger's Steronet App for iOS
    function getStereonet(spots) {

      var hasdata = false;

      //build data here
      var headers = ["No.",
        "Type",
        "Structure",
        "Color",
        "Trd/Strk",
        "Plg/Dip",
        "Longitude",
        "Latitude",
        "Horiz ± m",
        "Elevation",
        "Elev ± m",
        "Time",
        "Day",
        "Month",
        "Year",
        "Notes"
      ];

      var planes = [];
      var lines = [];
      var row = [];
      var out = [];

      _.each(spots, function (spot) {

        var longitude = 999;
        var latitude = 99;
        var trendstrike = "";
        var plungedip = "";
        var notes = "";
        var spotOrientations = [];

        if (spot.geometry.type == "Point") {
          longitude = spot.geometry.coordinates[0];
          latitude = spot.geometry.coordinates[1];
        }

        /*
        Gather orientation data. Sometimes (if spots are from map),
        orientations are in "orientation". Other times, orientations are
        in "orientation_data".
        */
        if (spot.properties.orientation) {
          spotOrientations.push(spot.properties.orientation);
        }
        else if (spot.properties.orientation_data) {
          _.each(spot.properties.orientation_data, function (od) {
            spotOrientations.push(od);
            if(od.associated_orientation){
              _.each(od.associated_orientation, function(ao){
                spotOrientations.push(ao);
              })
            }
          });
        }

        _.each(spotOrientations, function (od) {

          if (od.type == "planar_orientation") {
            if (od.strike && od.dip) {
              trendstrike = od.strike;
              plungedip = od.dip;
              if (od.notes) notes = od.notes;
              row = [
                "",
                "P",
                "Strabo Planes",
                "000000000",
                trendstrike,
                plungedip,
                longitude,
                latitude,
                "",
                "0",
                "",
                "",
                "0",
                "0",
                "0",
                notes
              ];
              planes.push(row);
            }
          }
          else if (od.type == "linear_orientation") {
            if (od.trend && od.plunge) {
              trendstrike = od.trend;
              plungedip = od.plunge;
              if (od.notes) notes = od.notes;
              row = [
                "",
                "L",
                "Strabo Lines",
                "000000000",
                trendstrike,
                plungedip,
                longitude,
                latitude,
                "",
                "0",
                "",
                "",
                "0",
                "0",
                "0",
                notes
              ];
              lines.push(row);
            }
          }
        });
      });

      if (lines.length > 0 || planes.length > 0) {
        var recordnum = 1;
        out.push(headers.join("\t"));
        if (planes.length > 0) {
          _.each(planes, function (plane) {
            plane[0] = recordnum;
            out.push(plane.join("\t"));
            recordnum++;
          })
        }
        if (lines.length > 0) {
          _.each(lines, function (line) {
            line[0] = recordnum;
            out.push(line.join("\t"));
            recordnum++;
          })
        }
        out = out.join("\n");
        out = out + "\n";
        hasdata = true;
      }

      //$log.log("out: ", out);

      if (hasdata) {
        if (IS_WEB) {
          out = out.replace(/\n/g, '<br>');
          var win = $window.open();
          win.document.body.innerHTML = out;
        }
        else {
          $cordovaClipboard.copy(out).then(function () {
            $ionicPopup.alert({
              'title': 'Success!',
              'template': 'Data has been copied to clipboard.'
            });
          });
        }
      }
      else {
        $ionicPopup.alert({
          'title': 'Error!',
          'template': 'Your selected spots contained no valid stereonet data.'
        });
      }
    }

    // Round value to the number of decimal places in the variable places
    function roundToDecimalPlaces(value, places) {
      var multiplier = Math.pow(10, places);
      return (Math.round(value * multiplier) / multiplier);
    }

    function toDegrees(radians) {
      return radians * 180 / Math.PI;
    }

    function toRadians(deg) {
      return deg * (Math.PI / 180);
    }
  }
}());
