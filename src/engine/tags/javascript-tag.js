var Utils = require('../utils');
var Tag = require('./tag');
var ScriptTag = require('./script-tag');

/**
 * JavaScript tag class.
 *
 * This is the class that will generate all the inline script tags.
 *
 * @param string           The tag data.
 * @param TagLoader The loader instance that has instantiated the tag.
 *
 * @return void
 */
class JavaScriptTag extends ScriptTag {
  constructor(data = {}, loader_instance) {
    super(data, loader_instance);

    this.data = Utils.mergeObject(this.data, {
      attributes: {
        async: false,
        defer: false
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
    s.text = this.getDomNodeSource();

    return s;
  }


  /**
   * The DOM node will contain the source from the `src` key of the `data`
   * object. Also the amc.call will be appended to the source.
   *
   * @return string
   */
  getDomNodeSource() {
    var text = this.data.src;
    text += '; ';
    text += this.getOnTagLoadPageCode(false);
    return text;
  }

}

module.exports = JavaScriptTag;
