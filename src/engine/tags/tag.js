
var Utils = require('../utils');
var Injector = require('../injector');

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
    var node, result = false;

    if (this.canAppendContainer() === false) {
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


  /**
   * Check the `match` conditions for this container.
   *
   * @return Boolean
   */
  canAppendContainer() {
    var match_conditions = this.data.match,
      result = true,
      param, check_method_name, i, l;

    if (Utils.isArray(match_conditions) === false) {
      return result;
    }

    for (i = 0, l = match_conditions.length; i < l; i += 1) {
      if (result !== true) {
        break;
      }

      param = match_conditions[i].param;
      check_method_name = 'check' + param.charAt(0).toUpperCase();
      check_method_name += param.substr(1);

      if (typeof this[check_method_name] === 'function') {
        result = this[check_method_name](match_conditions[i]);
        if (match_conditions[i].not === true) {
          result = !result;
        }
      }
    }

    return result;
  }


  /**
   * Check the `date` conditions for this container.
   *
   * @param object The match object from data.
   *
   * @return Boolean
   */
  checkDate(match_condition) {
    var d, result = true;

    if (Utils.isObject(match_condition.values) === false) {
      return result;
    }

    d = new Date();
    if (match_condition.condition === 'daterange') {
      result = this.checkDateRange(match_condition.values);
    } else if (match_condition.condition === 'dow') {
      result = this.checkDayOfWeek(match_condition.values);
    }

    return result;
  }


  /**
   * Verify the date condition for daterange.
   *
   * @param object The match values object from data.
   *
   * @return Boolean
   */
  checkDateRange(match_values) {
    var d;

    if (Utils.isObject(match_values) === false) {
      return true;
    }

    d = new Date();

    if (match_values.min !== -1 && new Date(match_values.min) > d) {
      return false;
    }

    if (match_values.max !== -1 && new Date(match_values.max) < d) {
      return false;
    }

    return true;
  }


  /**
   * Verify the date condition for dow.
   *
   * @param object The match values object from data.
   *
   * @return Boolean
   */
  checkDayOfWeek(match_values) {
    var days, d, l, i;

    if (Utils.isObject(match_values) === false || !match_values.days) {
      return true;
    }

    days = match_values.days;
    if (Utils.isArray(match_values.days) === false) {
      days = [match_values.days];
    }

    d = new Date().getDay();

    for (i = 0, l = days.length; i < l; i += 1) {
      if (d === days[i]) {
        return true;
      }
    }

    return false;
  }


  /**
   * Check pathname.
   *
   * @param object The match values object from data.
   *
   * @return Boolean
   */
  checkPath(match_condition) {
    return this.checkUrlPart(match_condition, gc.location.pathname);
  }


  /**
   * Check hostname.
   *
   * @param object The match values object from data.
   *
   * @return Boolean
   */
  checkHost(match_condition) {
    return this.checkUrlPart(match_condition, gc.location.hostname);
  }


  /**
   * Check parts from browser `location` object.
   *
   * @param object The match values object from data.
   * @param mixed  The value to test.
   *
   * @return Boolean
   */
  checkUrlPart(match_condition, value) {
    var result = true;

    if (Utils.isObject(match_condition.values) === false) {
      return result;
    }

    result = this.testValueWithMatchCondition(
      match_condition,
      value
    );

    return result;
  }


  /**
   * Check the query params.
   *
   * @param object The match values object from data.
   *
   * @return Boolean
   */
  checkQuery(match_condition) {
    var query_obj = this.getQueryValues();
    return this.checkValueFromObject(match_condition, query_obj);
  }


  /**
   * Check the `cookie` conditions for this container.
   *
   * @param object The match object from data.
   *
   * @return Boolean
   */
  checkCookie(match_condition) {
    var cookie_obj = this.getRawValues(gc.document.cookie, ';', false);

    return this.checkValueFromObject(match_condition, cookie_obj);
  }


  /**
   * Check the match condition with a value from an object (for cookie, query).
   *
   * @param object The match object from data.
   * @param object The object from which the test value will be extracted.
   *
   * @return Boolean
   */
  checkValueFromObject(match_condition, obj) {
    var result = true;

    if (!match_condition.param_name ||
      Utils.isObject(match_condition.values) === false
    ) {
      return result;
    }

    if (!obj[match_condition.param_name]) {
      return false;
    }

    result = this.testValueWithMatchCondition(
      match_condition,
      obj[match_condition.param_name]
    );

    return result;
  }


  /**
   * Check the match condition against the test value provided
   *
   * @param object The match object from data.
   * @param mixed  The value that will be tested agains the match condition
   *               object.
   *
   * @return Boolean
   */
  testValueWithMatchCondition(match_condition, test_value) {
    var result = true,
      test_method, test_condition;

    if (match_condition.condition === 'regex') {
      test_method = this.getRegExpTestResult;
      test_condition = match_condition.values.pattern;
    } else if (match_condition.condition === 'contains') {
      test_method = this.getContainsTestResult;
      test_condition = match_condition.values.scalar;
    }

    if (test_method) {
      result = test_method(
        test_value,
        test_condition
      );
    }

    return result;
  }


  /**
   * Test a regexp.
   *
   * @param mixed  The value to test.
   * @param string The Regex string.
   *
   * @return Boolean
   */
  getRegExpTestResult(test_value, regexp_string) {
    var regexp = new RegExp(regexp_string, 'ig');
    return regexp.test(test_value);
  }


  /**
   * Test a that the value contains the provided search string.
   *
   * @param mixed  The value to test.
   * @param string The string to search.
   *
   * @return Boolean
   */
  getContainsTestResult(test_value, test_condition) {
    return test_value.indexOf(test_condition) !== -1;
  }


  /**
   * Returns an object containing the query values from the browser location
   * object.
   *
   * @return Object
   */
  getQueryValues() {
    var search = gc.location.search;

    if (search.length <= 1) {
      return {};
    }

    search = location.search.substr(1);
    return this.getRawValues(search, '&', true);
  }


  /**
   * Given an input string and a separator, it returns a key-value object.
   *
   * @param string  The string that should be split as key-value object.
   * @param string  The separator which should be used for the initial splitting.
   * @param boolean If the keys and values should be escaped or not.
   *
   * @return Object
   */
  getRawValues(input, separator, do_unescape) {
    var obj = {},
      unescape = decodeURIComponent,
      pairs, key_val, i, l;

    if (!separator) {
      return obj;
    }

    pairs = input.split(separator);

    for (i = 0, l = pairs.length; i < l; i += 1) {
      key_val = pairs[i].split('=');

      key_val[0] = Utils.trim(key_val[0]);
      key_val[1] = Utils.trim(key_val[1]);

      if (do_unescape === true) {
        key_val[0] = unescape(key_val[0]);
        key_val[1] = unescape(key_val[1]);
      }

      obj[key_val[0]] = '';
      if (key_val.length > 1) {
        obj[key_val[0]] = key_val[1];
      }
    }

    return obj;
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
