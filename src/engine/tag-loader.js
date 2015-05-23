var TagFactory = require('./tags/factory');
var Utils = require('./utils');
var PubSub = require('./publish-subscribe');

/**
 * This is the entry point in TagLoader. Provide a config object that
 * is parsed and the resulting tag will be appended to the page.
 *
 * @param array The tags config objects.
 *
 * @return void
 */
var PersonalTagLoader = function(tag_configs, serializing_loading) {
  this.id = PersonalTagLoader.loaders.push(this) - 1;

  this.load_queue = [];
  this.onload_counter = 0;
  this.serializing_loading = serializing_loading;

  this.setupEvents();
  this.addToQueue(tag_configs);
};


/**
 * List of all tags initialized. Used by the getById method.
 *
 * @var Array
 */
PersonalTagLoader.loaders = [];


/**
 * Getting one of the registered loaders by its id.
 *
 * @param string The id of the loader that should be returned.
 *
 * @return TagLoader
 */
PersonalTagLoader.getById = function(id) {
  if (id >= this.loaders.length) {
    return null;
  }

  return this.loaders[id];
};


PersonalTagLoader.prototype = {

  /**
   * Loader internal id.
   *
   * @var Number
   */
  id: null,


  /**
   * Flag that will trigger the loading process in serial mode.
   *
   * @var boolean
   */
  serializing_loading: null,

  /**
   * The publish/subscribe instance.
   *
   * @var PubSub
   */
  messaging_queue: null,

  /**
   * The config queue.
   *
   * @var Array
   */
  load_queue: [],

  /**
   * Counter that helps triggering the `onload` event at the right time.
   *
   * @var Number
   */
  onload_counter: 0,

  /**
   * Flag that will block the loading of next tags until while is set to true.
   *
   * @var Boolean
   */
  pause_state: false,


  /**
   * Add the provided loaders config in the loaders queue.
   *
   * @param array   The loaders config.
   * @param boolean True is the loaders should be prepended at the beginning
   *                of the queue.
   *
   * @return boolean
   */
  addToQueue: function(tag_configs, prepend) {
    var i;

    if (Utils.isArray(tag_configs) === false ||
      tag_configs.length === 0
    ) {
      return false;
    }

    if (Utils.isArray(this.load_queue) === false) {
      this.load_queue = [];
    }

    if (prepend === true) {
      for (i = tag_configs.length - 1; i >= 0; i -= 1) {
        this.load_queue.unshift(tag_configs[i]);
      }
    } else {
      for (i = 0; i < tag_configs.length; i += 1) {
        this.load_queue.push(tag_configs[i]);
      }
    }

    this.onload_counter += tag_configs.length;

    return true;
  },


  /**
   * Loading the next tag in queue.
   *
   * @return void
   */
  loadNext: function() {
    var tag, tag_config;
    if (Utils.isArray(this.load_queue) === false ||
      this.load_queue.length === 0 ||
      this.pause_state === true
    ) {
      return;
    }

    tag_config = this.load_queue.shift();
    tag = TagFactory.create(tag_config, this);

    tag.append();
  },


  /**
   * Setup the events that will be listen by TagLoader.
   *
   * @return boolean
   */
  setupEvents: function() {
    var scope = this,
      on_tag_load_function = Utils.call(this.onTagLoad, this),
      on_load_next_tag_function = Utils.call(this.onLoadNextTag, this),
      load_next_tag_event = 'ontagappend',
      onloadcallback = function() {
        scope.messaging_queue.publish('onpageload');
      };

    this.messaging_queue = new PubSub();

    if (this.serializing_loading === true) {
      load_next_tag_event = 'ontagload';
    }

    // Watch for the event defined in load_next_tag_event variable. Every
    // time a tag is appended to the page, the next one will be loaded from
    // the queue.
    this.messaging_queue.subscribe(load_next_tag_event, on_load_next_tag_function);
    this.messaging_queue.subscribe('ontagignore', on_load_next_tag_function);

    // Subscribing to specific events in order to trigger the `onload` event
    // when there are no more tags to be appended to the page.
    this.messaging_queue.subscribe('ontagignore', on_tag_load_function);
    this.messaging_queue.subscribe('ontagload', on_tag_load_function);

    // Trigger the `ondomcontentloaded` when it has happened.
    Utils.onDomReady(function() {
      scope.messaging_queue.publish('ondomcontentloaded');
    }, window);

    // Trigger the `onload` event.
    if (window.addEventListener) {
      window.addEventListener('load', onloadcallback, false);
    } else {
      window.attachEvent('onload', onloadcallback);
    }

    return true;
  },


  /**
   * Method called after every tag is loaded or ignored.
   *
   * @return void
   */
  onTagLoad: function() {
    if (this.pause_state !== true) {
      this.onload_counter -= 1;
      if (this.onload_counter === 0) {
        this.messaging_queue.publish('onload');
      }
    }
  },


  /**
   * Method called after every tag is appended or ignored.
   *
   * @return void
   */
  onLoadNextTag: function() {
    this.loadNext();
  },


  /**
   * Reset the PubSub queue and the loaders.
   *
   * @return boolean
   */
  reset: function() {
    this.load_queue = [];
    this.messaging_queue.reset();

    // Rebind the default events of the loader.
    this.setupEvents();
    return true;
  },


  /**
   * Pause page tag appending process.
   *
   * @return void
   */
  pause: function() {
    this.pause_state = true;
  },


  /**
   * Resume page tag appending process.
   *
   * @return void
   */
  resume: function() {
    this.pause_state = false;
    this.loadNext();
  },


  /**
   * Get the loader ID.
   *
   * @return Number
   */
  getId: function() {
    return this.id;
  },


  /**
   * Subscribe an event
   *
   * @return String
   */
  subscribe: Utils.proxyMethodCall('subscribe', 'messaging_queue'),


  /**
   * Unsubscribe an event.
   *
   * @return Boolean
   */
  unsubscribe: Utils.proxyMethodCall('unsubscribe', 'messaging_queue'),


  /**
   * Publish an event.
   *
   * @return void
   */
  publish: Utils.proxyMethodCall('publish', 'messaging_queue'),


  /**
   * Publish an event.
   *
   * @return void
   */
  publishSync: Utils.proxyMethodCall('publishSync', 'messaging_queue')

};

module.exports = PersonalTagLoader;
