var TagLoader = require('./engine/tag-loader');
var Utils = require('./engine/utils');
var Tag = require('./engine/tags/tag');

/**
 * This is the cvasi-public interface of TagManager. Every method from this
 * object could be called from the `call` method from the outro.js file.
 */
var PersonalTagManager = function () {
    var scope = this;

    this.loader = new TagLoader();

    return {
        name: 'Personal Tag Manager',
        version: '1.0',

        /**
         * Shorcut for public methods of the PersonalTagManager instance.
         *
         * @return void
         */
        call: function () {
            var args = Array.prototype.slice.call(arguments),
                method = args.shift();

            if (scope[method]) {
                return scope[method].apply(scope, args);
            }
        },


        /**
         * Shorcut for the subscribe method.
         *
         * @return void
         */
        on: function () {
            var args = Array.prototype.slice.call(arguments),
                e = args[0];
            if (e.substr(0, 2) !== 'on') {
                e = 'on' + e;
                args[0] = e;
            }
            scope.subscribe.apply(scope, args);
        }


    };
};


PersonalTagManager.prototype = {

    /**
     * The config queue.
     *
     * @var TagLoader
     */
    loader: null,


    /**
     * Subscribe an event
     *
     * @return String
     */
    subscribe: Utils.proxyMethodCall('subscribe', 'loader'),


    /**
     * Unsubscribe an event.
     *
     * @return Boolean
     */
    unsubscribe: Utils.proxyMethodCall('unsubscribe', 'loader'),


    /**
     * Publish an event.
     *
     * @return void
     */
    publish: Utils.proxyMethodCall('publish', 'loader'),


    /**
     * Reset the PubSub queue and the loaders.
     *
     * @return Boolean
     */
    reset: Utils.proxyMethodCall('reset', 'loader'),


    /**
     * Returns a tag based on the provided id.
     *
     * @param array tag configs that should be inserted by the loader.
     *
     * @return void
     */
    load: function (tag_configs) {
        this.loader.addToQueue(tag_configs);
        this.loader.loadNext();
    },


    /**
     * Init the current ATM library. It will load the tags from the inside JSON.
     *
     * @return void
     */
    init: function () {
        this.load(Utils.jsonDecode('%s'));
    },


    /**
     * Returns a tag based on the provided id.
     *
     * @param string The id of the tag that should be returned.
     *
     * @return Object
     */
    getById: Utils.call(Tag.getById, Tag),


    /**
     * Returns a loader based on the provided id.
     *
     * @param string The id of the loader that should be returned.
     *
     * @return TagLoader
     */
    getLoaderById: Utils.call(TagLoader.getById, TagLoader)
};

module.exports = new PersonalTagManager();
