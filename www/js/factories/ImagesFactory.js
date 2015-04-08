'use strict';

angular.module('app')
  .factory('ImagesFactory', function() {
    var images = {
      bedding_horizontal: 'img/geology/bedding_horizontal.png',
      bedding_inclined: 'img/geology/bedding_inclined.png',
      bedding_vertical: 'img/geology/bedding_vertical.png',
      cleavage_inclined: 'img/geology/cleavage_inclined.png',
      cleavage_vertical: 'img/geology/cleavage_vertical.png',
      contact_inclined: 'img/geology/contact_inclined.png',
      contact_NO_ORIENTATION: 'img/geology/contact_NO_ORIENTATION.png',
      contact_vertical: 'img/geology/contact_vertical.png',
      fault_location_NO_ORIENTATION: 'img/geology/fault_location_NO_ORIENTATION.png',
      fault_surface_inclined: 'img/geology/fault_surface_inclined.png',
      fault_surface_vertical: 'img/geology/fault_surface_vertical.png',
      fold_axis: 'img/geology/fold_axis.png',
      fold_NO_ORIENTATION: 'img/geology/fold_NO_ORIENTATION.png',
      foliation_general_inclined: 'img/geology/foliation_general_inclined.png',
      foliation_general_vertical: 'img/geology/foliation_general_vertical.png',
      foliation_horizontal: 'img/geology/foliation_horizontal.png',
      joint_surface_inclined: 'img/geology/joint_surface_inclined.png',
      joint_surface_vertical: 'img/geology/joint_surface_vertical.png',
      lineation_general: 'img/geology/lineation_general.png',
      MISC_note_or_description: 'img/geology/MISC_note_or_description.png',
      sample_locality: 'img/geology/sample_locality.png',
      shear_zone_inclined: 'img/geology/shear_zone_inclined.png',
      shear_zone_vertical: 'img/geology/shear_zone_vertical.png',
      striation: 'img/geology/striation.png'
    };

    var factory = {};
    factory.getImagePath = function(contentModel, rotation) {

      // TODO: rotation for those images that require it

      switch (contentModel) {
        case 'contact_outcrop':
          return images.contact_NO_ORIENTATION;
        case 'fault_outcrop':
          return images.fault_location_NO_ORIENTATION;
        case 'notes':
          return images.MISC_note_or_description;
        case 'orientation':
          return images.fault_surface_inclined;
        case 'sample':
          return images.sample_locality;
        default:

          // TODO: what's the default image if an unknown contentModel is passed?  How about a question mark?
          break;
      }
    };

    return factory;
  });
