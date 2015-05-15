var Tag = require('./tag');
var Utils = require('../utils');

/**
 * Script container class.
 *
 * This is the class that will generate all the script tags that have
 * the `src` attribute.
 *
 * @param string           The container data.
 * @param TagManagerLoader The loader instance that has instantiated the container.
 *
 * @return void
 */
class ScriptTag extends Tag {
  constructor(data = {}, loader_instance) {
    super(data, loader_instance);

    this.data = Utils.mergeObject(this.data, {
        attributes: {
            async: true,
            defer: true
        }
    }, false);

    this.data = Utils.mergeObject(this.data, data);

    if (this.data !== data) {
        this.data = Utils.getSanitizedObject(this.data, Tag.properties);
    }
  }

/**
 * Returns the script node that will be appended to the DOM.
 *
 * @return HTMLElement
 */
getDomNode() {
    var s;

    if (!this.data.src) {
      return false;
    }

    s = this.getScriptNodeWithAttributes();
    s.src = this.data.src;

    this.addOnLoadEvents(s);

    return s;
  }


  /**
   * Returns a script tag.
   *
   * @param boolean If the `id` from the data object should be added on the node.
   *
   * @return HTMLElement
   */
  getScriptNode(withId) {
    var s = document.createElement('script');

    s.type = 'text/javascript';

    if (withId !== false) {
      s.id = this.data.id;
    }

    return s;
  }


  /**
   * Returns a script tag that has the attributes from the `data` object set
   * on it.
   *
   * @return HTMLElement
   */
  getScriptNodeWithAttributes() {
    var i, l, s,
      attr = this.data.attributes,
      attr_names = ['async', 'defer'];

    s = this.getScriptNode();

    for (i = 0, l = attr_names.length; i < l; i += 1) {
      if (attr[attr_names[i]] !== false) {
        s[attr_names[i]] = true;

        if (!s[attr_names[i]]) {
          s[attr_names[i]] = String(true);
        }
      }
    }

    return s;
  }


  /**
   * Returns function that will be called when the container has been loaded
   * by the browser.
   *
   * @param HTMLElement The node where this callback will be appended.
   *
   * @return void
   */
  addOnLoadEvents(s) {
    var loaded = false,
      scope = this,
      callback = function() {
        if (loaded === false &&
          (!this.readyState ||
            this.readyState === "loaded" ||
            this.readyState === "complete")
        ) {
          loaded = true;

          // Handle memory leak in IE.
          s.onload = s.onreadystatechange = null;

          scope.loader_instance.publish('ontagload.' + scope.data.id, {
            id: scope.data.id,
            tag: scope
          });
        }
      };

    // Attach handlers for all browsers.
    if (s.addEventListener) {
      s.addEventListener("load", callback, false);
    } else if (s.readyState) {
      s.onreadystatechange = callback;
    }
  }
}

module.exports = ScriptTag;
