(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define(["openlayers"], factory);
  } else if(typeof module === "object" && module.exports) {
    module.exports = factory(require("openlayers"));
  } else {
    root.LayerSwitcher = factory(root.ol);
  }
}(this, function(ol) {
  // This section addded by Jessica to save the expand/collapse state
  var savedPanel = undefined;
  var savedClass = undefined;
  // End this section added by Jessica

  /**
   * OpenLayers v3/v4 Layer Switcher Control.
   * See [the examples](./examples) for usage.
   * @constructor
   * @extends {ol.control.Control}
   * @param {Object} opt_options Control options, extends olx.control.ControlOptions adding:
   *                              **`tipLabel`** `String` - the button tooltip.
   */
  ol.control.LayerSwitcher = function(opt_options) {

    var options = opt_options || {};

    var tipLabel = options.tipLabel ?
      options.tipLabel : 'Legend';

    this.mapListeners = [];

    this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
    if (ol.control.LayerSwitcher.isTouchDevice_()) {
      this.hiddenClassName += ' touch';
    }
    this.shownClassName = 'shown';

    var element = document.createElement('div');
    element.className = this.hiddenClassName;

    var button = document.createElement('button');
    button.setAttribute('title', tipLabel);
    element.appendChild(button);

    this.panel = document.createElement('div');
    this.panel.className = 'panel';
    element.appendChild(this.panel);
    ol.control.LayerSwitcher.enableTouchScroll_(this.panel);

    var this_ = this;

    button.onmouseover = function(e) {
      this_.showPanel();
    };

    button.onclick = function(e) {
      e = e || window.event;
      this_.showPanel();
      e.preventDefault();
    };

    this_.panel.onmouseout = function(e) {
      e = e || window.event;
      if (!this_.panel.contains(e.toElement || e.relatedTarget)) {
        this_.hidePanel();
      }
    };

    ol.control.Control.call(this, {
      element: element,
      target: options.target
    });

  };

  ol.inherits(ol.control.LayerSwitcher, ol.control.Control);

  /**
   * Show the layer panel.
   */
  ol.control.LayerSwitcher.prototype.showPanel = function() {
    if (!this.element.classList.contains(this.shownClassName)) {
      this.element.classList.add(this.shownClassName);
      this.renderPanel();
    }
  };

  /**
   * Hide the layer panel.
   */
  ol.control.LayerSwitcher.prototype.hidePanel = function() {
    if (this.element.classList.contains(this.shownClassName)) {
      this.element.classList.remove(this.shownClassName);
      // This section addded by Jessica to save the expand/collapse state
      savedPanel = angular.copy(this.panel);
      // End this part added by Jessica
    }
  };

  /**
   * Re-draw the layer panel to represent the current state of the layers.
   */
  ol.control.LayerSwitcher.prototype.renderPanel = function() {

    this.ensureTopVisibleBaseLayerShown_();

    while(this.panel.firstChild) {
      this.panel.removeChild(this.panel.firstChild);
    }

    var ul = document.createElement('ul');
    this.panel.appendChild(ul);
    this.renderLayers_(this.getMap(), ul);

  };

  /**
   * Set the map instance the control is associated with.
   * @param {ol.Map} map The map instance.
   */
  ol.control.LayerSwitcher.prototype.setMap = function(map) {
    // Clean up listeners associated with the previous map
    for (var i = 0, key; i < this.mapListeners.length; i++) {
      ol.Observable.unByKey(this.mapListeners[i]);
    }
    this.mapListeners.length = 0;
    // Wire up listeners etc. and store reference to new map
    ol.control.Control.prototype.setMap.call(this, map);
    if (map) {
      var this_ = this;
      this.mapListeners.push(map.on('pointerdown', function() {
        this_.hidePanel();
      }));
      this.renderPanel();
    }
  };

  /**
   * Ensure only the top-most base layer is visible if more than one is visible.
   * @private
   */
  ol.control.LayerSwitcher.prototype.ensureTopVisibleBaseLayerShown_ = function() {
    var lastVisibleBaseLyr;
    ol.control.LayerSwitcher.forEachRecursive(this.getMap(), function(l, idx, a) {
      if (l.get('type') === 'base' && l.getVisible()) {
        lastVisibleBaseLyr = l;
      }
    });
    if (lastVisibleBaseLyr) this.setVisible_(lastVisibleBaseLyr, true);
  };

  /**
   * Toggle the visible state of a layer.
   * Takes care of hiding other layers in the same exclusive group if the layer
   * is toggle to visible.
   * @private
   * @param {ol.layer.Base} The layer whos visibility will be toggled.
   */
  ol.control.LayerSwitcher.prototype.setVisible_ = function(lyr, visible) {
    var map = this.getMap();
    lyr.setVisible(visible);
    if (visible && lyr.get('type') === 'base') {
      // Hide all other base layers regardless of grouping
      ol.control.LayerSwitcher.forEachRecursive(map, function(l, idx, a) {
        if (l != lyr && l.get('type') === 'base') {
          l.setVisible(false);
        }
      });
    }
    // Added by Jessica to add checkmarks to parent grouped layers
    // From pull request by OlaKov in ol3-layerswitcher github
    if (lyr.getLayers && !lyr.get('combine')){
      var lyrs = lyr.getLayers().getArray().slice().reverse();
      for (var i = 0; i < lyrs.length; i++) {
        var lyr = lyrs[i];
        var lyrId = lyr.get('id');
        var subLyr = document.getElementById(lyrId);
        subLyr.disabled = !visible;
      }
    }
    // End added by Jessica
  };

  /**
   * Render all layers that are children of a group.
   * @private
   * @param {ol.layer.Base} lyr Layer to be rendered (should have a title property).
   * @param {Number} idx Position in parent group list.
   */
  ol.control.LayerSwitcher.prototype.renderLayer_ = function(lyr, idx) {

    var this_ = this;

    var li = document.createElement('li');

    var lyrTitle = lyr.get('title');
    var lyrId = lyr.get('id') ? lyr.get('id') : ol.control.LayerSwitcher.uuid(); // Modified by Jessica
    lyr.set('id', lyrId);    // Added by Jessica to add checkmarks to parent grouped layers

    var label = document.createElement('label');

    if (lyr.getLayers && !lyr.get('combine')) {

      // This section addded by Jessica to expand and collapse groups
      var toggleBtn = document.createElement('i');

      // Load the expand/collapse state
      if (savedPanel !== undefined) {
       var matchingEle = _.find(savedPanel.getElementsByClassName('group'), function (groupEle) {
          return groupEle.querySelector('label').innerText === lyrTitle;
        });
        if (matchingEle !== undefined) savedClass = matchingEle.querySelector('i').className;
        else savedClass = undefined;
      }
      else savedClass = undefined;

      toggleBtn.className = savedClass || 'icon ion-minus-round';
      toggleBtn.id = 'toggleButton';
      li.appendChild(toggleBtn);
      toggleBtn.addEventListener ('click', function() {
        toggleGroup(lyr);
        if (toggleBtn.className === 'icon ion-minus-round') toggleBtn.className = 'icon ion-plus-round';
        else toggleBtn.className = 'icon ion-minus-round';
      });
      // End this section added by Jessica

      var input = document.createElement('input');
      input.type = 'checkbox';
      input.id = lyrId;
      input.checked = lyr.get('visible');
      input.onchange = function(e) {
        this_.setVisible_(lyr, e.target.checked);
      };
      li.appendChild(input);

      li.className = 'group';
      label.innerHTML = lyrTitle;
      label.htmlFor = lyrId;
      li.appendChild(label);
      var ul = document.createElement('ul');
      li.appendChild(ul);

      this.renderLayers_(lyr, ul);

    } else {

      li.className = 'layer';
      li.id = 'layer' + lyrId;    // This addded by Jessica to expand and collapse groups
      var input = document.createElement('input');
      if (lyr.get('type') === 'base') {
        input.type = 'radio';
        input.name = 'base';
      } else {
        input.type = 'checkbox';
      }
      input.id = lyrId;
      input.checked = lyr.get('visible');
      input.onchange = function(e) {
        this_.setVisible_(lyr, e.target.checked);
      };
      li.appendChild(input);

      label.htmlFor = lyrId;
      label.innerHTML = lyrTitle;

      var rsl = this.getMap().getView().getResolution();
      if (rsl > lyr.getMaxResolution() || rsl < lyr.getMinResolution()){
        label.className += ' disabled';
      }

      // This section addded by Jessica to apply the expand/collapse state
      if (savedClass === 'icon ion-plus-round') li.style.display = 'none';
      // End this section added by Jessica
      li.appendChild(label);

    }

    return li;

  };

  /**
   * Render all layers that are children of a group.
   * @private
   * @param {ol.layer.Group} lyr Group layer whos children will be rendered.
   * @param {Element} elm DOM element that children will be appended to.
   */
  ol.control.LayerSwitcher.prototype.renderLayers_ = function(lyr, elm) {
    var lyrs = lyr.getLayers().getArray().slice().reverse();
    for (var i = 0, l; i < lyrs.length; i++) {
      l = lyrs[i];
      if (l.get('title')) {
        elm.appendChild(this.renderLayer_(l, i));
      }
    }
  };

  /**
   * **Static** Call the supplied function for each layer in the passed layer group
   * recursing nested groups.
   * @param {ol.layer.Group} lyr The layer group to start iterating from.
   * @param {Function} fn Callback which will be called for each `ol.layer.Base`
   * found under `lyr`. The signature for `fn` is the same as `ol.Collection#forEach`
   */
  ol.control.LayerSwitcher.forEachRecursive = function(lyr, fn) {
    lyr.getLayers().forEach(function(lyr, idx, a) {
      fn(lyr, idx, a);
      if (lyr.getLayers) {
        ol.control.LayerSwitcher.forEachRecursive(lyr, fn);
      }
    });
  };

  /**
   * Generate a UUID
   * @returns {String} UUID
   *
   * Adapted from http://stackoverflow.com/a/2117523/526860
   */
  ol.control.LayerSwitcher.uuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  /**
   * @private
   * @desc Apply workaround to enable scrolling of overflowing content within an
   * element. Adapted from https://gist.github.com/chrismbarr/4107472
   */
  ol.control.LayerSwitcher.enableTouchScroll_ = function(elm) {
    if(ol.control.LayerSwitcher.isTouchDevice_()){
      var scrollStartPos = 0;
      elm.addEventListener("touchstart", function(event) {
        scrollStartPos = this.scrollTop + event.touches[0].pageY;
      }, false);
      elm.addEventListener("touchmove", function(event) {
        this.scrollTop = scrollStartPos - event.touches[0].pageY;
      }, false);
    }
  };

  /**
   * @private
   * @desc Determine if the current browser supports touch events. Adapted from
   * https://gist.github.com/chrismbarr/4107472
   */
  ol.control.LayerSwitcher.isTouchDevice_ = function() {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch(e) {
      return false;
    }
  };

  // This section addded by Jessica to expand and collapse groups
  function toggleGroup(lyr, toggleBtn) {
    lyr.getLayersArray().forEach(function (layer) {
      var layerEle = document.getElementById('layer' + layer.get('id'));
      if (layerEle.style.display === '' || layerEle.style.display === 'table') layerEle.style.display = 'none';
      else layerEle.style.display = 'table';
    });
  }
  // End this section addded by Jessica

  var LayerSwitcher = ol.control.LayerSwitcher;
  return LayerSwitcher;
}));