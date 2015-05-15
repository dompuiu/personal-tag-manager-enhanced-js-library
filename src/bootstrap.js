var PersonalTagManagerLoader = require('./engine/personal-tag-manager-loader');
var Utils = require('./engine/utils');
var Tag = require('./engine/tags/tag');

/**
 * This is the cvasi-public interface of TagManager. Every method from this
 * object could be called from the `call` method from the outro.js file.
 */
var TagManager = function () {
    var scope = this;

    this.loader = new PersonalTagManagerLoader(null, null, window);

    return {
        name: 'Personal Tag Manager',
        version: '1.0',

        /**
         * Shorcut for public methods of the TagManager instance.
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


TagManager.prototype = {

    /**
     * The config queue.
     *
     * @var TagManagerLoader
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
     * Returns a container based on the provided id.
     *
     * @param array Container configs that should be inserted by the loader.
     *
     * @return void
     */
    load: function (container_configs) {
        this.loader.addToQueue(container_configs);
        this.loader.loadNextContainer();
    },


    /**
     * Init the current ATM library. It will load the containers from the inside JSON.
     *
     * @return void
     */
    init: function () {
        this.load(Utils.jsonDecode('%s'));
    },


    /**
     * Returns a container based on the provided id.
     *
     * @param string The id of the container that should be returned.
     *
     * @return Object
     */
    getById: Utils.call(Tag.getById, Tag),


    /**
     * Returns a loader based on the provided id.
     *
     * @param string The id of the loader that should be returned.
     *
     * @return TagManagerLoader
     */
    getLoaderById: Utils.call(PersonalTagManagerLoader.getById, PersonalTagManagerLoader)
};

module.exports = new TagManager();
