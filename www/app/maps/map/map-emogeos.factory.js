(function () {
  'use strict';

  angular
    .module('app')
    .factory('MapEmogeosFactory', MapEmogeos);

  MapEmogeos.$inject = ['$document', '$ionicPopup', '$log', '$rootScope', 'IS_WEB', 'SpotFactory'];

  function MapEmogeos($document, $ionicPopup, $log, $rootScope, IS_WEB, SpotFactory) {
    var emogeosControlElement = {};
    var emogeoControls = {};
    var emogeos = {};
    var emogeoSources = [];
    var emogeosThisMap = {};
    var mapType = undefined;
    var spot = {};

    // Variables for a long press event
    var longpress = false;
    var endTime;
    var startTime;

    activate();

    return {
      'clearSelectedSpot': clearSelectedSpot,
      'EmogeoControls': EmogeoControls,
      'getEmogeoImageSrc': getEmogeoImageSrc,
      'resetAllEmogeoButtons': resetAllEmogeoButtons,
      'setSelectedSpot': setSelectedSpot
    };

    /**
     * Private Functions
     */

    function activate() {
      emogeoSources = {
        'horizontal': "img/emogeos/sed/Horizontal.png",
        'hummocky': "img/emogeos/sed/HCS.png",
        'low_angle': "img/emogeos/sed/LowAngle.png",
        'massive_struct': "img/emogeos/sed/Massive.png",
        'mud_drape': "img/emogeos/sed/MudDrape2.png",
        'planar_tabular': "img/emogeos/sed/PlanarTabular.png",
        'ripple_laminat': "img/emogeos/sed/RippleLamination.png",
        'trough': "img/emogeos/sed/TCS.png"
      };

      emogeos = {
        'sed': {
          'lithologies': {
            'mud_silt_prin_struct': ['massive_struct', 'horizontal', 'ripple_laminat', 'mud_drape'],
            'sandstone_prin_struct': ['trough', 'hummocky', 'planar_tabular', 'low_angle', 'massive_struct', 'horizontal'],
            'conglomerate_prin_struct': ['trough', 'planar_tabular', 'massive_struct', 'horizontal'],
            'breccia_prin_struct': ['trough', 'planar_tabular', 'massive_struct', 'horizontal'],
            'limestone_dolostone_prin_struct': ['trough', 'hummocky', 'massive_struct', 'horizontal']
          },
          // Displayed on an interval but does not have it's own emogeo button on the side
          'structures': {
            'addl_mud_silt_struct': ['massive_struct', 'horizontal', 'ripple_laminat', 'mud_drape'],
            'addl_sandstone_struct': ['trough', 'hummocky', 'planar_tabular', 'low_angle', 'massive_struct', 'horizontal'],
            'addl_conglomerate_struct': ['trough', 'planar_tabular', 'massive_struct', 'horizontal'],
            'addl_breccia_struct': ['trough', 'planar_tabular', 'massive_struct', 'horizontal'],
            'addl_limestone_dolomite_struct': ['trough', 'hummocky', 'massive_struct', 'horizontal']
          }
        }
      };
    }

    // Helper function to set the value of an object given the path in string notation
    function setDeepValue(obj, value, path) {
      if (typeof path === "string") path = path.split('.');

      if (path.length > 1) {
        var p = path.shift();
        if (obj[p] == null || typeof obj[p] !== 'object') obj[p] = {};
        setDeepValue(obj[p], value, path);
      }
      else obj[path[0]] = value;
    }

    // Helper function to delete an object element given the path in string notation
    function deleteDeepValue(obj, path) {
      if (typeof path === "string") path = path.split('.');

      if (path.length > 1) {
        var p = path.shift();
        if (obj[p] == null || typeof obj[p] !== 'object') obj[p] = {};
        deleteDeepValue(obj[p], path);
      }
      else delete obj[path[0]];
    }

    // Create an emogeo button
    function createEmogeoButton(emogeosControlElement, key, value) {
      //var key = group ? group : value.value;
      emogeoControls[key] = $document[0].createElement('a');
      emogeoControls[key].id = key + 'Control';
      emogeoControls[key].name = value;
      emogeoControls[key].className = 'emogeo-icon';
      emogeoControls[key].style.backgroundColor = 'transparent';
      emogeoControls[key].style.backgroundImage = "url('" + emogeoSources[value] + "')";
      emogeoControls[key].style.backgroundSize = '26px 26px';
      if (IS_WEB) emogeoControls[key].addEventListener('click', handleEmogeoClick);
      if (IS_WEB) emogeoControls[key].addEventListener('dblclick', handleEmogeoDoubleClick);
      if (!IS_WEB) emogeoControls[key].addEventListener('touchstart', handleEmogeoTouchStart);
      if (!IS_WEB) emogeoControls[key].addEventListener('touchend', handleEmogeoTouchEnd);
      emogeosControlElement.appendChild(emogeoControls[key]);
    }

    // Handle a click/touch or double click/long press on an emogeo button
    function handleEmogeoButtonSelected(target) {
      if (!_.isEmpty(spot) && spot.properties) {
        var path = ['properties'];
        if (mapType === 'strat-section') path.push('sed');
        if (eval('spot.' + path.join('.'))) {

          // Get the emogeo properties for the selected emogeo
          var selectedEmogeoSectionKey = undefined;
          var selectedEmogeoKey = target.id.split('C')[0];
          var selectedEmogeo = {};
          _.each(emogeosThisMap, function (emogeosThisSection, key) {
            if (key !== 'structures') {
              selectedEmogeo = emogeosThisSection[selectedEmogeoKey];
              if (selectedEmogeo) {
                selectedEmogeoSectionKey = key;
                path.push(selectedEmogeoSectionKey);
              }
            }
          });

          if (selectedEmogeo && eval('spot.' + path.join('.'))) {
            path.push(selectedEmogeoKey);
            // Handle longpress/double click by switch to the next emogeo in a group
            if (longpress) {
              // Get next emogeo button
              var i = selectedEmogeo.indexOf(target.name);
              var nextI = i + 1 >= selectedEmogeo.length ? 0 : i + 1;
              switchEmogeoButton(selectedEmogeo[nextI], selectedEmogeoKey);
              if (emogeoControls[selectedEmogeoKey].style.backgroundColor !== 'transparent') {
                setDeepValue(spot, selectedEmogeo[nextI], path.join('.'));
                saveSpot();
              }
            }
            // Handle touch or click by setting or resetting emogeo
            else toggleEmogeo(target.name, selectedEmogeoKey, path);
          }
        }
        else {
          $ionicPopup.alert({
            'title': 'Spot Mismatch',
            'template': 'The selected property cannot be applied to the selected Spot.'
          });
        }
      }
      else {
        $ionicPopup.alert({
          'title': 'No Spot Selected',
          'template': 'Please select a Spot before adding a Spot property.'
        });
      }
    }

    function handleEmogeoClick(e) {
      longpress = false;
      handleEmogeoButtonSelected(e.target);
    }

    function handleEmogeoDoubleClick(e) {
      $log.log('double');
      longpress = true;
      handleEmogeoButtonSelected(e.target);
    }

    function handleEmogeoTouchEnd(e) {
      endTime = new Date().getTime();
      longpress = endTime - startTime >= 500;
      handleEmogeoButtonSelected(e.target);
    }

    function handleEmogeoTouchStart() {
      longpress = false;
      startTime = new Date().getTime();
    }

    function hideEmogeoButton(emogeoName) {
      emogeoControls[emogeoName].style.display = 'none';
    }

    // Clear the background of an emogeo
    function resetSelectedEmogeoButton(emogeoName) {
      emogeoControls[emogeoName].style.backgroundColor = 'transparent';
    }

    function saveSpot() {
      SpotFactory.save(spot).then(function () {
        if (IS_WEB) {
          $rootScope.$broadcast('updated-spot', {'spotId': spot.properties.id});
          $rootScope.$broadcast('clicked-mapped-spot', {'spotId': spot.properties.id});
        }
        $rootScope.$broadcast('updateStratSectionFeatureLayer');
      });
    }

    // Set the emogeos that should be selected initially based on the current selected Spot
    function setInitialSelectedEmogeos() {
      if (!_.isEmpty(spot) && spot.properties) {
        showRelevantEmogeoButtons();
        var path = ['spot', 'properties'];
        if (mapType === 'strat-section') path.push('sed');
        if (eval(path.join('.'))) {
          _.each(emogeosThisMap, function (fields, sectionKey) {
            if (sectionKey !== 'structures') {
              path.push(sectionKey);
              if (eval(path.join('.'))) {
                _.each(fields, function (values, key) {
                  path.push(key);
                  var fieldValue = eval(path.join('.'));
                  if (_.contains(values, fieldValue)) {
                    switchEmogeoButton(fieldValue, key);
                    setSelectedEmogeoButton(key);
                  }
                  else resetSelectedEmogeoButton(key);
                  path.pop();
                });
              }
              path.pop();
            }
          });
        }
      }
      emogeosControlElement.style.display = 'block';
    }

    // Set the background of an emogeo button as selected
    function setSelectedEmogeoButton(emogeoName) {
      emogeoControls[emogeoName].style.backgroundColor = '#DDDDDD';
    }

    function showEmogeoButton(emogeoName) {
      emogeoControls[emogeoName].style.display = 'block';
    }

    // For select emogeo buttons only show the emogeo buttons that meet certain conditions
    function showRelevantEmogeoButtons() {
      // First hide ALL emogeo buttons that have conditions to being shown
      hideEmogeoButton('mud_silt_prin_struct');
      hideEmogeoButton('sandstone_prin_struct');
      hideEmogeoButton('conglomerate_prin_struct');
      hideEmogeoButton('breccia_prin_struct');
      hideEmogeoButton('limestone_dolostone_prin_struct');

      // Then determine which emogeo buttons with conditions should be shown
      var n = 0;
      if (spot.properties.sed && spot.properties.sed.lithologies && spot.properties.sed.lithologies[n]) {
        if (spot.properties.sed.lithologies[n].siliciclastic_type) {
          if (spot.properties.sed.lithologies[n].siliciclastic_type === 'claystone' ||
            spot.properties.sed.lithologies[n].siliciclastic_type === 'mudstone' ||
            spot.properties.sed.lithologies[n].siliciclastic_type === 'shale' ||
            spot.properties.sed.lithologies[n].siliciclastic_type === 'siltstone') {
            showEmogeoButton('mud_silt_prin_struct');
          }
          if (spot.properties.sed.lithologies[n].siliciclastic_type === 'sandstone') {
            showEmogeoButton('sandstone_prin_struct');
          }
          if (spot.properties.sed.lithologies[n].siliciclastic_type === 'conglomerate') {
            showEmogeoButton('conglomerate_prin_struct');
          }
          if (spot.properties.sed.lithologies[n].siliciclastic_type === 'breccia') {
            showEmogeoButton('breccia_prin_struct');
          }
        }
        if (spot.properties.sed.lithologies[n].dunham_classification) {
          showEmogeoButton('limestone_dolostone_prin_struct');
        }
      }
    }

    // Switch an emogeo button to another emogeo button in a group
    function switchEmogeoButton(value, key) {
      emogeoControls[key].name = value;
      emogeoControls[key].style.backgroundImage = "url('" + emogeoSources[value] + "')";
    }

    // Set the value of a field associated with an emogeo then toggle an emogeo as selected or unselected and save Spot
    function toggleEmogeo(emogeo, controlName, path) {
      var setValue = eval('spot.' + path.join('.'));
      var defaultValue = emogeo ? emogeo : undefined;
      if (setValue === defaultValue) {
        deleteDeepValue(spot, path.join('.'));
        resetSelectedEmogeoButton(controlName);
      }
      else {
        setDeepValue(spot, defaultValue, path.join('.'));
        setSelectedEmogeoButton(controlName);
      }
      saveSpot();
    }

    /**
     * Public Functions
     */

    // Clear the selected Spot
    function clearSelectedSpot() {
      spot = {};
    }

    // Create the emogeo control buttons
    function EmogeoControls(inMapType) {
      mapType = inMapType;
      emogeosControlElement = $document[0].createElement('div');
      emogeosControlElement.className = 'emogeo-controls ol-unselectable';
      if (mapType === 'strat-section') emogeosThisMap = emogeos['sed'];
      _.each(emogeosThisMap, function (fields, sectionKey) {
        if (sectionKey !== 'structures') {
          _.each(fields, function (choices, field) {
            createEmogeoButton(emogeosControlElement, field, choices[0]);
          });
        }
      });

      ol.control.Control.call(this, {
        'element': emogeosControlElement
      });
      emogeosControlElement.style.display = 'none';
    }

    // Get the image source
    function getEmogeoImageSrc(properties) {
      var path = ['properties'];
      var icons = [];
      _.each(emogeos, function (field, key) {
        path.push(key);
        if (eval(path.join('.'))) {
          _.each(field, function (field2, key2) {
            path.push(key2);
            if (eval(path.join('.'))) {
              _.each(field2, function (field3, key3) {
                path.push(key3);
                if (eval(path.join('.'))) {
                  if (typeof eval(path.join('.')) !== 'object') {
                    if (emogeoSources[eval(path.join('.'))]) icons.push(emogeoSources[eval(path.join('.'))])
                  }
                  else {
                    _.each(eval(path.join('.')), function (value) {
                      if (emogeoSources[value]) icons.push(emogeoSources[value])
                    });
                  }
                }
                path.pop();
              });
            }
            path.pop();
          });
        }
        path.pop();
      });
      return _.uniq(icons);
    }

    // Reset the background color of all emogeos so none look selelcted
    function resetAllEmogeoButtons() {
      _.each(emogeoControls, function (value, key) {
        emogeoControls[key].style.backgroundColor = 'transparent';
        emogeoControls[key].style.display = 'block';
      });
      emogeosControlElement.style.display = 'none';
    }

    // Set the selected Spot and then any emogeos that should be set for this Spot
    function setSelectedSpot(inSpot) {
      spot = inSpot;
      //setInitialSelectedEmogeos();
    }
  }
}());
