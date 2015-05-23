var Tag = require('./tag');
var HtmlTag = require('./html-tag');
var ScriptTag = require('./script-tag');
var JavaScriptTag = require('./javascript-tag');
var SynchronousScriptTag = require('./synchronous-script-tag');

class TagFactory {
  /**
   * Tag factory method.
   *
   * @param object    Loader config options.
   * @param TagLoader The loader instance that has instantiated the tag.
   *
   * @return tag
   */
  static create(data, loader_instance) {
    var tag;

    switch (data.type) {
      case 'block-script':
        tag = new SynchronousScriptTag(data, loader_instance);
      break;

      case 'script':
        tag = new ScriptTag(data, loader_instance);
      break;

      case 'js':
        tag = new JavaScriptTag(data, loader_instance);
      break;

      case 'html':
        tag = new HtmlTag(data, loader_instance);
      break;
      default:
        tag = new Tag(data, loader_instance);
    }

    Tag.tags.push(tag);
    return tag;
  }
}

module.exports =TagFactory
