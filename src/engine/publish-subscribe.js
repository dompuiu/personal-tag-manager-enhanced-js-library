var Utils = require('./utils');

var PubSub = function(immediateExceptions) {
  var scope = this;

  this.messages = {};
  this.archive = {};
  this.immediateExceptions = immediateExceptions;

  return {
    /**
     * Publishes the the message, passing the data to it's subscribers.
     *
     * @param string  The message to publish.
     * @param mixed   The data to pass to subscribers.
     * @param boolean Flag that will help determine if the message archive
     *                should be processed.
     *
     * @return boolean
     */
    publish: function(message, data, save_in_archive) {
      return scope.publish(
        message,
        data,
        false,
        scope.immediateExceptions,
        save_in_archive
      );
    },


    /**
     * Publishes the the message synchronously, passing the data to it's subscribers.
     *
     * @param string  The message to publish.
     * @param mixed   The data to pass to subscribers.
     * @param boolean Flag that will help determine if the message archive
     *                should be processed.
     *
     * @return boolean
     */
    publishSync: function(message, data, save_in_archive) {
      return scope.publish(
        message,
        data,
        true,
        scope.immediateExceptions,
        save_in_archive
      );
    },


    /**
     * Subscribes the passed function to the passed message. Every returned
     * token is unique and should be stored if you need to unsubscribe.
     *
     * @param string   The message to subscribe to.
     * @param function The function to call when a new message is published.
     *
     * @return string
     */
    subscribe: Utils.call(scope.subscribe, scope),


    /**
     * Unsubscribes a specific subscriber from a specific message using the
     * unique token or if using Function as argument, it will remove all
     * subscriptions with that function.
     *
     * @param string|function The token of the function to unsubscribe or func
     *                        passed in on subscribe
     *
     * @return string | boolean
     */
    unsubscribe: Utils.call(scope.unsubscribe, scope),


    reset: Utils.call(scope.reset, scope)

  };

};

PubSub.last_uid = -1;

PubSub.prototype = {

  /**
   * Returns a function that throws the passed exception, for use as argument
   * for setTimeout.
   *
   * @param Object An Error object
   *
   * @return function
   */
  throwException: function(ex) {
    return function reThrowException() {
      throw ex;
    };
  },


  callSubscriberWithDelayedExceptions: function(subscriber, message, data) {
    try {
      subscriber(message, data);
    } catch (ex) {
      setTimeout(this.throwException(ex), 0);
    }
  },


  callSubscriberWithImmediateExceptions: function(subscriber, message, data) {
    subscriber(message, data);
  },


  deliverMessage: function(originalMessage, matchedMessage, data, immediateExceptions, messages_pool) {
    var messages = messages_pool || this.messages,
      subscribers = messages[matchedMessage],
      callSubscriber,
      i, j;

    callSubscriber = this.callSubscriberWithDelayedExceptions;
    if (immediateExceptions) {
      callSubscriber = this.callSubscriberWithImmediateExceptions;
    }

    if (!messages.hasOwnProperty(matchedMessage)) {
      return;
    }

    for (i = 0, j = subscribers.length; i < j; i++) {
      callSubscriber.call(this, subscribers[i].func, originalMessage, data);
    }
  },


  createDeliveryFunction: function(message, data, immediateExceptions, messages_pool) {
    var scope = this;

    return function deliverNamespaced() {
      var topic = String(message),
        position = topic.lastIndexOf('.');

      // Deliver the message as it is now.
      scope.deliverMessage(
        message,
        message,
        data,
        immediateExceptions,
        messages_pool
      );

      // Trim the hierarchy and deliver message to each level.
      while (position !== -1) {
        topic = topic.substr(0, position);
        position = topic.lastIndexOf('.');
        scope.deliverMessage(message, topic, data, null, messages_pool);
      }
    };
  },


  messageHasSubscribers: function(message) {
    var topic = String(message),
      found = this.messages.hasOwnProperty(topic),
      position = topic.lastIndexOf('.');

    while (!found && position !== -1) {
      topic = topic.substr(0, position);
      position = topic.lastIndexOf('.');
      found = this.messages.hasOwnProperty(topic);
    }

    return found;
  },


  publish: function(message, data, sync, immediateExceptions, save_in_archive) {
    var deliver = this.createDeliveryFunction(
        message,
        data,
        immediateExceptions,
        Utils.clone(this.messages)
      ),
      hasSubscribers = this.messageHasSubscribers(message);

    if (save_in_archive !== false) {
      this.archiveMessage(message, data, sync, immediateExceptions);
    }

    if (!hasSubscribers) {
      return false;
    }

    if (sync === true) {
      deliver();
    } else {
      setTimeout(deliver, 0);
    }
    return true;
  },


  archiveMessage: function(message, data, sync, immediateExceptions) {
    // Message is not registered yet in archive.
    if (!this.archive.hasOwnProperty(message)) {
      this.archive[message] = [];
    }

    this.archive[message].push({
      message: message,
      data: data,
      sync: sync,
      immediateExceptions: immediateExceptions
    });
  },


  processArchive: function(message, func) {
    var m;

    // Trim the hierarchy and deliver message to each level.
    for (m in this.archive) {
      if (this.archive.hasOwnProperty(m) === true) {
        if (m.indexOf(message) === 0) {
          if (m.length > message.length &&
            m.charAt(message.length) !== '.'
          ) {
            continue;
          }
          this.deliverArchivedMessage(
            message,
            m,
            func,
            Utils.clone(this.archive)
          );
        }
      }
    }
  },


  createArchivedMessageDeliveryFunction: function(func, originalMessage, message_data) {
    var scope = this;

    return function deliverNamespaced() {
      var callSubscriber = scope.callSubscriberWithDelayedExceptions;
      if (message_data.immediateExceptions) {
        callSubscriber = scope.callSubscriberWithImmediateExceptions;
      }

      callSubscriber.call(scope, func, originalMessage, message_data.data);
    };
  },


  deliverArchivedMessage: function(originalMessage, matchedMessage, func, archive_pool) {
    var archive = archive_pool || this.archive,
      messages = archive[matchedMessage],
      deliver, i, j;

    if (!archive.hasOwnProperty(matchedMessage)) {
      return;
    }

    for (i = 0, j = messages.length; i < j; i++) {
      deliver = this.createArchivedMessageDeliveryFunction(
        func,
        matchedMessage,
        messages[i]
      );

      if (messages[i].sync === true) {
        deliver();
      } else {
        setTimeout(deliver, 0);
      }
    }
  },


  /**
   * Subscribes the passed function to the passed message. Every returned
   * token is unique and should be stored if you need to unsubscribe.
   *
   * @param string   The message to subscribe to.
   * @param function The function to call when a new message is published.
   *
   * @return string
   */
  subscribe: function(message, func, process_archive) {
    // Message is not registered yet.
    if (!this.messages.hasOwnProperty(message)) {
      this.messages[message] = [];
    }

    // forcing token as String, to allow for future expansions without
    // breaking usage and allow for easy use as key names for the 'messages'
    // object.
    var token = String(++PubSub.last_uid);
    this.messages[message].push({
      token: token,
      func: func
    });

    // Call the callback with messages from archive if they exist.
    if (process_archive !== false) {
      this.processArchive(message, func);
    }

    // Return token for unsubscribing.
    return token;
  },


  /**
   * Unsubscribes a specific subscriber from a specific message using the
   * unique token or if using Function as argument, it will remove all
   * subscriptions with that function.
   *
   * @param string|function The token of the function to unsubscribe or func
   *                        passed in on subscribe
   *
   * @return string | boolean
   */
  unsubscribe: function(tokenOrFunction) {
    var messages = this.messages,
      isToken = typeof tokenOrFunction === 'string',
      key = isToken ? 'token' : 'func',
      succesfulReturnValue = isToken ? tokenOrFunction : true,

      result = false,
      m, i;

    for (m in messages) {
      if (messages.hasOwnProperty(m)) {
        for (i = messages[m].length - 1; i >= 0; i--) {
          if (messages[m][i][key] === tokenOrFunction) {
            messages[m].splice(i, 1);
            result = succesfulReturnValue;

            // tokens are unique, so we can just return here
            if (isToken) {
              return result;
            }
          }
        }
      }
    }

    return result;
  },


  reset: function() {
    this.messages = {};
    this.archive = {};
  }
};

module.exports = PubSub;
