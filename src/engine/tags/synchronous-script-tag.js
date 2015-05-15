var ScriptTag = require('./script-tag');

/**
 * Script container class that is loaded in a synchronous way.
 *
 * This is the class that will generate script tags that will be appended to the
 * page using the document.write method.
 *
 * @param string           The container data.
 * @param TagManagerLoader The loader instance that has instantiated the container.
 *
 * @return void
 */
class SynchronousScriptTag extends ScriptTag {
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
    var s, data;

    if (!this.data.src) {
      return false;
    }

    if (Utils.isDomReady() === true) {
      data = Utils.mergeObject({}, this.data, false);
      data.type = 'script';
      this.loader_instance.addToQueue([data]);
      return false;
    }

    s = this.getScriptNode(false);
    s.text = this.getDomNodeSource(s);

    return s;
  }


  /**
   * Returns the JS code that will insert the script source using
   * document.write.
   *
   * @return string
   */
  getDomNodeSource(s) {
    var text;

    text = 'document.write(\'<script src="' + this.data.src + '"';
    text += ' id="' + this.data.id + '"';

    if (s.addEventListener) {
      text += ' onload="' + this.getOnTagLoadPageCode() + '"';
    } else {
      text += ' onreadystatechange="' + this.getIeOnLoadFunction() + '"';
    }
    text += '></scr' + 'ipt>\');';

    return text;
  }


  /**
   * Returns function that will be called only on older IE versions when the
   * container has been loaded by the browser.
   *
   * @return string
   */
  getIeOnLoadFunction() {
    var text = '';

    text += 'if (this.addEventListener || ';
    text += 'this.amc_load || ';
    text += '(this.readyState && ';
    text += 'this.readyState !== \\\'complete\\\')';
    text += ') { return; } ';
    text += 'this.amc_load = true; ';
    text += this.getOnTagLoadPageCode();

    return text;
  }
}

module.exports = SynchronousScriptTag;
