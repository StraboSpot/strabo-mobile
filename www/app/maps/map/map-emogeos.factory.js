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
      'resetAllEmogeoButtons': resetAllEmogeoButtons,
      'setSelectedSpot': setSelectedSpot
    };

    /**
     * Private Functions
     */

    function activate() {
      emogeos = {
        'sed': {
          'lithologies': {
            'mud_silt_stratification': [
              {'value': 'massive_struct', 'icon': 'url("../img/emogeos/sed/Massive.png")'},
              {'value': 'horizontal_lam', 'icon': 'url("../img/emogeos/sed/Horizontal.png")'},
              {'value': 'ripple_laminat', 'icon': 'url("../img/emogeos/sed/RippleLamination.png")'},
              {'value': 'mud_drape', 'icon': 'url("../img/emogeos/sed/MudDrape2.png")'}
            ],
            'sand_stratification': [
              {'value': 'trough_cross_s', 'icon': 'url("../img/emogeos/sed/TCS.png")'},
              {'value': 'hummocky', 'icon': 'url("../img/emogeos/sed/HCS.png")'},
              {'value': 'planar_cross_s', 'icon': 'url("../img/emogeos/sed/PlanarTabular.png")'},
              {'value': 'massive_struct', 'icon': 'url("../img/emogeos/sed/LowAngle.png")'},
              {'value': 'massive_struct_1', 'icon': 'url("../img/emogeos/sed/Massive.png")'},
              {'value': 'horizontal_lam', 'icon': 'url("../img/emogeos/sed/Horizontal.png")'}
            ],
            'congl_breccia_stratification': [
              {'value': 'massive_struct', 'icon': 'url("../img/emogeos/sed/TCS.png")'},
              {'value': 'normal_grading', 'icon': 'url("../img/emogeos/sed/PlanarTabular.png")'},
              {'value': 'planar_cross_s', 'icon': 'url("../img/emogeos/sed/Massive.png")'},
              {'value': 'horizontal_lam', 'icon': 'url("../img/emogeos/sed/Horizontal.png")'}
            ],
            'limestone_dolomite_stratificat': [
              {'value': 'trough', 'icon': 'url("../img/emogeos/sed/TCS.png")'},
              {'value': 'hummocky', 'icon': 'url("../img/emogeos/sed/HCS.png")'},
              {'value': 'massive_struct', 'icon': 'url("../img/emogeos/sed/Massive.png")'},
              {'value': 'horizontal_lam', 'icon': 'url("../img/emogeos/sed/Horizontal.png")'}
            ]
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
    function createEmogeoButton(emogeosControlElement, value, key) {
      //var key = group ? group : value.value;
      emogeoControls[key] = $document[0].createElement('a');
      emogeoControls[key].id = key + 'Control';
      emogeoControls[key].name = value.value;
      emogeoControls[key].className = 'emogeo-icon';
      emogeoControls[key].style.backgroundColor = 'transparent';
      emogeoControls[key].style.backgroundImage = value.icon;
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
            selectedEmogeo = emogeosThisSection[selectedEmogeoKey];
            if (selectedEmogeo) {
              selectedEmogeoSectionKey = key;
              path.push(selectedEmogeoSectionKey);
            }
          });

          if (selectedEmogeo && eval('spot.' + path.join('.'))) {
            path.push(selectedEmogeoKey);
            // Handle longpress/double click by switch to the next emogeo in a group
            if (longpress) {
              // Get next emogeo button
              var i = _.findIndex(selectedEmogeo, function (emogeo) {
                return emogeo.value === target.name;
              });
              var nextI = i + 1 >= selectedEmogeo.length ? 0 : i + 1;
              switchEmogeoButton(selectedEmogeo[nextI].value, selectedEmogeoKey);
              if (emogeoControls[selectedEmogeoKey].style.backgroundColor !== 'transparent') {
                setDeepValue(spot, selectedEmogeo[nextI].value, path.join('.'));
                saveSpot();
              }
            }
            // Handle touch or click by setting or resetting emogeo
            else {
              var emogeo = selectedEmogeo;
              if (_.isArray(emogeo)) emogeo = _.findWhere(selectedEmogeo, {'value': target.name});
              toggleEmogeo(emogeo, selectedEmogeoKey, path);
            }
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
      });
    }

    // Set the emogeos that should be selected initially based on the current selected Spot
    function setInitialSelectedEmogeos() {
      if (!_.isEmpty(spot) && spot.properties) {
        showRelevantEmogeoButtons();
        var path = ['spot', 'properties'];
        if (mapType === 'strat-section') path.push('sed');
        if (eval(path.join('.'))) {
          _.each(emogeosThisMap, function (section, sectionKey) {
            path.push(sectionKey);
            _.each(section, function (field, key) {
              path.push(key);
              if (_.isArray(field)) {
                var choices = _.pluck(field, 'value');
                var fieldValue = eval(path.join('.'));
                if (_.contains(choices, fieldValue)) {
                  switchEmogeoButton(fieldValue, key);
                  setSelectedEmogeoButton(key);
                }
                else resetSelectedEmogeoButton(key);
              }
              else {
                if (field.value) {
                  if (eval(path.join('.')) === field.value) setSelectedEmogeoButton(key);
                  else resetSelectedEmogeoButton(key);
                }
                else {
                  if (eval(path.join('.'))) setSelectedEmogeoButton(key);
                  else resetSelectedEmogeoButton(key);
                }
              }
              path.pop();
            });
            path.pop();
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
      hideEmogeoButton('mud_silt_stratification');
      hideEmogeoButton('sand_stratification');
      hideEmogeoButton('congl_breccia_stratification');
      hideEmogeoButton('limestone_dolomite_stratificat');

      // Then determine which emogeo buttons with conditions should be shown
      if (spot.properties.sed && spot.properties.sed.lithologies) {
        if (spot.properties.sed.lithologies.principal_siliciclastic_type) {
          if (spot.properties.sed.lithologies.principal_siliciclastic_type === 'claystone' ||
            spot.properties.sed.lithologies.principal_siliciclastic_type === 'mudstone' ||
            spot.properties.sed.lithologies.principal_siliciclastic_type === 'shale' ||
            spot.properties.sed.lithologies.principal_siliciclastic_type === 'siltstone') {
            showEmogeoButton('mud_silt_stratification');
          }
          if (spot.properties.sed.lithologies.principal_siliciclastic_type === 'sandstone') {
            showEmogeoButton('sand_stratification');
          }
          if (spot.properties.sed.lithologies.principal_siliciclastic_type === 'conglomerate' ||
            spot.properties.sed.lithologies.principal_siliciclastic_type === 'breccia') {
            showEmogeoButton('congl_breccia_stratification');
          }
        }
        if (spot.properties.sed.lithologies.principal_dunham_class) {
          showEmogeoButton('limestone_dolomite_stratificat');
        }
      }
    }

    // Switch an emogeo button to another emogeo button in a group
    function switchEmogeoButton(value, key) {
      var selectedEmogeo = {};
      _.each(emogeosThisMap, function (emogeosThisSection) {
        var found = _.findWhere(emogeosThisSection[key], {value: value});
        if (found) selectedEmogeo = found;
      });
      emogeoControls[key].name = selectedEmogeo.value;
      emogeoControls[key].style.backgroundImage = selectedEmogeo.icon;
    }

    // Set the value of a field associated with an emogeo then toggle an emogeo as selected or unselected and save Spot
    function toggleEmogeo(emogeo, controlName, path) {
      var setValue = eval('spot.' + path.join('.'));
      var defaultValue = emogeo.value ? emogeo.value : undefined;
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
      _.each(emogeosThisMap, function (section) {
        _.each(section, function (field, key) {
          if (_.isArray(field)) createEmogeoButton(emogeosControlElement, field[0], key);
          else createEmogeoButton(emogeosControlElement, field, key);

        });
      });

      ol.control.Control.call(this, {
        'element': emogeosControlElement
      });
      emogeosControlElement.style.display = 'none';
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
      setInitialSelectedEmogeos();
    }
  }
}());
