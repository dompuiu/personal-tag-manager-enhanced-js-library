/*jshint strict: false */

var Utils;

/**
 * The Utils instance contains all the helper methods used by the TagManager.
 */
Utils = {

    /**
     * Run the javascript code (provided as string) in the global context.
     *
     * @param string The Javascript source.
     *
     * @return void
     */
    executeJavaScript: function (src) {
        try {
            if (window.execScript) {
                window.execScript(src);
            } else {
                eval.call(window, src);
            }
        } catch (e) {
        }
    },


    /**
     * Decode a JSON string.
     *
     * @param string The JSON string.
     *
     * @return mixed
     */
    jsonDecode: function (text) {
        var jsonDecodeFunction = eval;
        if (typeof JSON !== 'undefined' && JSON.parse) {
            jsonDecodeFunction = JSON.parse;
        }

        Utils.jsonDecode = function (text) {
            var result = null;
            try {
                if (jsonDecodeFunction === eval) {
                    text = '(' + text + ')';
                }
                result = jsonDecodeFunction(text);
            } catch (e) {
            }
            return result;
        };

        return Utils.jsonDecode(text);
    },


    /**
     * Finds whether the given variable is an array.
     *
     * @param mixed The variable being evaluated.
     *
     * @return boolean
     */
    isArray: function (arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    },


    /**
     * Finds whether the given variable is an object.
     *
     * @param mixed The variable being evaluated.
     *
     * @return boolean
     */
    isObject: function (obj) {
        if (obj === null) {
            return false;
        }

        return Object.prototype.toString.call(obj) === '[object Object]';
    },


    /**
     * Helper function that will merge the attributes of two objects.
     *
     * @param object  The destination object.
     * @param object  The source object.
     * @param boolean When not set to false, it will merge only the properties
     *                that exist in each objects.
     *
     * @return onject
     */
    mergeObject: function (obj1, obj2, safe) {
        var p, i, l;

        if (Utils.isArray(obj1) === true || Utils.isArray(obj2) === true) {
            if (Utils.isArray(obj1) === true && Utils.isArray(obj2) === true) {
                for (i = 0, l = obj2.length; i < l; i += 1) {
                    obj1.push(Utils.clone(obj2[i]));
                }
            }

            return obj1;
        }

        for (p in obj2) {
            if (obj2.hasOwnProperty(p) === true) {
                if (safe !== false && obj1.hasOwnProperty(p) !== true) {
                    continue;
                }

                try {
                    // When property in destination object set,
                    // update its value.
                    if (Utils.isObject(obj2[p]) === true) {
                        if (!obj1[p]) {
                            obj1[p] = {};
                        }

                        Utils.mergeObject(obj1[p], obj2[p], safe);
                    } else if (Utils.isArray(obj2[p]) === true) {
                        if (!obj1[p]) {
                            obj1[p] = [];
                        }

                        Utils.mergeObject(obj1[p], obj2[p], safe);
                    } else {
                        obj1[p] = obj2[p];
                    }
                } catch (e) {
                    // When property in destination object not set,
                    // create it and set its value.
                    obj1[p] = obj2[p];
                }
            }
        }

        return obj1;
    },


    /**
     * Helper function that will deep clone the provided arrays and objects.
     *
     * @param mixed  The source object.
     *
     * @return mixed
     */
    clone: function (obj) {
        var copy, i, l, attr;

        // Handle the 3 simple types, and null or undefined
        if (null === obj || "object" !== typeof obj) {
            return obj;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (i = 0, l = obj.length; i < l; i++) {
                copy[i] = Utils.clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = Utils.clone(obj[attr]);
                }
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    },


    /**
     * Helper function that will sanitize all the propertion from the object.
     *
     * @param object  The source object.
     * @param object  The validation object.
     *
     * @return onject
     */
    getSanitizedObject: function (obj, validation) {
        var p, v, i, l;

        if (typeof validation === 'undefined') {
            return {};
        }

        for (p in obj) {
            if (obj.hasOwnProperty(p) === true) {
                v = null;
                if (validation[p]) {
                    v = validation[p];
                }

                if (Utils.isObject(obj[p]) === true) {
                    obj[p] = Utils.getSanitizedObject(obj[p], v);
                } else if (Utils.isArray(obj[p]) === true) {
                    for (i = 0, l = obj[p].length; i < l; i += 1) {
                        if (Utils.isObject(obj[p][i]) === true) {
                            obj[p][i] = Utils.getSanitizedObject(obj[p][i], v);
                        } else {
                            obj[p][i] = Utils.getSanitizedValue(obj[p][i], v);
                        }
                    }
                } else {
                    obj[p] = Utils.getSanitizedValue(obj[p], v);
                }
            }
        }

        return obj;
    },


    /**
     * Helper function that will normalize the given value.
     *
     * @param mixed   The input value.
     * @param string  The sanitize filer to apply.
     *
     * @return mixed
     */
    getSanitizedValue: function (value, type) {
        var iv, re, pieces;

        if (!type) {
            return value;
        }

        switch (type) {
        case 'number':
            value = Number(value);
            break;

        case 'string':
            if (value === null) {
                value = '';
            } else {
                value = String(value);
            }
            break;

        case 'boolean':
            value = Boolean(value);
            break;

        case 'date':
            re = /^\d{4}\/(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])$/;

            if (isNaN(value) === true && value.match(re) !== null) {
                pieces = value.split('/', 3);
                iv = Date.UTC(pieces[0], pieces[1] - 1, pieces[2]);
                if (isNaN(iv) === false) {
                    value = iv;
                } else {
                    value = -1;
                }
            } else {
                value = -1;
            }
            break;
        }

        return value;
    },


    /**
     * Return a function that will call the specified method in a specific context.
     *
     * @param function  The method that should be called by the returned function.
     * @param object    The context of the call.
     *
     * @return function
     */
    call: function (method, context) {
        if (!context) {
            context = this;
        }

        return function () {
            return method.apply(context, Array.prototype.slice.call(arguments));
        };
    },


    /**
     * Returns a method that acts as a proxy for the provided context.
     *
     * @param string The method name that should be called.
     * @param object The context of the call.
     *
     * @return function
     */
    proxyMethodCall: function (method_name, instance_property) {
        return function () {
            if (!this[instance_property] || !this[instance_property][method_name]) {
                return false;
            }

            return this[instance_property][method_name].apply(
                this[instance_property],
                arguments
            );
        };
    },


    /**
     * The trim method returns the string stripped of whitespace from both ends.
     * trim does not affect the value of the string itself.
     *
     * @param string The string that should be trimmed.
     *
     * @return String
     */
    trim: function (str) {
        return str.replace(/^\s+|\s+$/g, '');
    },


    /**
     * Specify a function to execute when the DOM is fully loaded.
     *
     * @param function  A function to execute after the DOM is ready.
     * @param object    The window object to check when the DOM is ready.
     *
     * @return void
     */
    onDomReady: function (fn, w) {

        var win = w || window, done = false, top = true,

        doc = win.document, root = doc.documentElement,

        add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
        rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
        pre = doc.addEventListener ? '' : 'on',

        init = function (e) {
            if (e.type === 'readystatechange' && doc.readyState !== 'complete') {
                return;
            }

            (e.type === 'load' ? win : doc)[rem](pre + e.type, init, false);
            if (!done) {
                done = true;
                fn.call(win, e.type || e);
            }
        },

        poll = function () {
            try {
                root.doScroll('left');
            } catch (e) {
                setTimeout(poll, 50);
                return;
            }
            init('poll');
        };

        if (doc.readyState === 'complete') {
            fn.call(win, 'lazy');
        } else {
            if (doc.createEventObject && root.doScroll) {
                try {
                    top = !win.frameElement;
                } catch (e) {}
                if (top) {
                    poll();
                }
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    }
};


/**
 * Check if the DOM is ready.
 *
 * @return boolean
 */
Utils.isDomReady = (function () {
    var dom_ready_triggered = false;
    Utils.onDomReady(function () {
        dom_ready_triggered = true;
    });

    return function () {
        return dom_ready_triggered;
    };
})();
