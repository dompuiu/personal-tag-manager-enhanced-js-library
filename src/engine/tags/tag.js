var Utils = require('../utils');
var Injector = require('../injector');
var ConditionsChecker = require('../conditions-checker');

/**
 * Internal UID counter.
 *
 * @var Number
 */
var last_uid = -1;

class Tag {
  /**
   * Base class for all loader containers.
   *
   * @param object           Loader config options.
   * @param TagManagerLoader The loader instance that has instantiated the container.
   *
   * @return void
   */
  constructor(data, loader_instance) {
    if (!this.data) {
      this.data = {};
    }

    this.data = Utils.mergeObject(this.data, {
      id: null,
      src: '',
      onload: '',
      inject: {
        tag: Injector.BODY,
        position: Injector.AT_END
      },
      match: []
    }, false);

    this.data = Utils.mergeObject(this.data, data);
    this.data.id = this.generateId(this.data);

    if (this.data !== data) {
      this.data = Utils.getSanitizedObject(this.data, Tag.properties);
    }

    this.loader_instance = loader_instance;
  }

  /**
   * Getting a container by its id.
   *
   * @param string The id of the container that should be returned.
   *
   * @return Tag
   */
  static getById(id) {
    var i, l;
    for (i = 0, l = Tag.containers.length; i < l; i += 1) {
      if (typeof Tag.containers[i].data === 'undefined') {
        continue;
      }

      if (Tag.containers[i].data.id === id) {
        return Tag.containers[i];
      }
    }

    return null;
  }

  /**
   *  Getting container's DOM node and sending it to the HtmlInjector.
   *
   * @return Boolean
   */
  append() {
    var node, result = false, checker = new ConditionsChecker(this.data.match);

    if (checker.conditionsAreFullfilled() === false) {
      this.loader_instance.publishSync('ontagignore.' + this.data.id, {
        tagid: this.data.id,
        tag: this
      });
      return result;
    }

    this.setOnloadEvent();
    node = this.getDomNode();

    if (node !== false) {
      result = Injector.inject(
        node,
        this.data.inject.tag,
        this.data.inject.position
      );
    }

    if (result !== false) {
      this.loader_instance.publishSync('ontagappend.' + this.data.id, {
        tagid: this.data.id,
        tag: this
      });
    } else {
      this.loader_instance.publishSync('ontagignore.' + this.data.id, {
        tagid: this.data.id,
        tag: this
      });
    }

    return result;
  }


  /**
   *  Getting the DOM node for this container.
   *
   * @return Boolean
   */
  getDomNode() {
    return false;
  }


  /**
   * Subscribe on the `ontagload` event of this container.
   *
   * @return void
   */
  setOnloadEvent() {
    var scope = this;

    if (this.data.onload.length > 0) {
      this.loader_instance.subscribe(
        'ontagload.' + scope.data.id,
        function(message, data) {
          if (data.id !== scope.data.id) {
            return false;
          }

          Utils.executeJavaScript(scope.data.onload);
        }
      );
    }
  }


  /**
   * If an id was provided in constructor, make sure that it is unique.
   * Otherwise generate one.
   *
   * @param object An object containing an id or not. If it contains an id,
   * make sure that one is unique.
   *
   * @return void
   */
  generateId(data) {
    var unique = false,
      counter = 0,
      id,
      container;

    if (!data || !data.id) {
      return 'tm_' + String(++last_uid);
    }

    id = data.id;

    while (unique !== true) {
      if (counter > 0) {
        id = data.id + '_' + counter;
      }

      container = Tag.getById(id);
      counter += 1;

      if (container === null) {
        unique = true;
      }
    }

    return id;
  }


  /**
   * Returns function that will be called when the container has been loaded
   * by the browser.
   *
   * @return String
   */
  getOnTagLoadPageCode(escape) {
    var text = '',
      escapeSequence = '\\\'';

    if (escape === false) {
      escapeSequence = '\'';
    }

    text += 'ptm.call(';
    text += escapeSequence + 'getLoaderById' + escapeSequence + ', ';
    text += this.loader_instance.getId();
    text += ').publish(';
    text += escapeSequence + 'ontagload.' + this.data.id + escapeSequence + ', {';
    text += 'id: ' + escapeSequence + this.data.id + escapeSequence + ',';
    text += 'tag: ptm.call(' + escapeSequence + 'getById' + escapeSequence;
    text += ', ' + escapeSequence + this.data.id + escapeSequence + ')';
    text += '})';

    return text;
  }

};

/**
 * List of all containers initialized. Used by the getById method.
 *
 * @var Array
 */
Tag.containers = [];

/**
 * List of all possible config properties.
 *
 * @var Object
 */
Tag.properties = {
  id: 'string',
  type: 'string',
  src: 'string',
  onload: 'string',
  inject: {
    tag: 'number',
    position: 'number'
  },
  attributes: {
    async: 'boolean',
    defer: 'boolean'
  },
  match: {
    param: 'string',
    param_name: 'string',
    condition: 'string',
    not: 'boolean',
    values: {
      scalar: 'string',
      pattern: 'string',
      min: 'date',
      max: 'date',
      days: 'number'
    }
  }
};

module.exports = Tag;
