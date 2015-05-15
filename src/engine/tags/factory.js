var Tag = require('./tag');
var HtmlTag = require('./html-tag');
var ScriptTag = require('./script-tag');
var JavaScriptTag = require('./javascript-tag');
var SynchronousScriptTag = require('./synchronous-script-tag');

class TagFactory {
  /**
   * Tag factory method.
   *
   * @param object           Loader config options.
   * @param TagManagerLoader The loader instance that has instantiated the container.
   *
   * @return container
   */
  static create(data, loader_instance) {
    var container;

    switch (data.type) {
      case 'block-script':
        container = new SynchronousScriptTag(data, loader_instance);
      break;

      case 'script':
        container = new ScriptTag(data, loader_instance);
      break;

      case 'js':
        container = new JavaScriptTag(data, loader_instance);
      break;

      case 'html':
        container = new HtmlTag(data, loader_instance);
      break;
      default:
        container = new Tag(data, loader_instance);
    }

    Tag.containers.push(container);
    return container;
  }
}

module.exports =TagFactory
