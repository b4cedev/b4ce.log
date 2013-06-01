/**
 * B4ce.Log - v0.0.3 - 2013-06-01
 * https://github.com/b4cedev/b4ce.log
 * Copyright (c) 2013 Stefan Bunse <s@b4ce.de>; Licensed MIT
 */
(function (root, factory) {
    'use strict';

    // https://github.com/umdjs/umd/blob/master/amdWeb.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'jquery',
            'underscore'
        ], factory);
    } else {
        // Browser globals (root is window)
        if (!root.B4ce) {
            root.B4ce = {};
        }
        root.B4ce.Log = factory(
            root.jQuery,
            root._,
            root.B4ce
        );
    }
}(this, function (
    $,
    _,
    B4ce
) {
'use strict';

if (!B4ce) {
    B4ce = {};
}
if (!B4ce.Log) {
    B4ce.Log = {};
}

/*global _, B4ce */
(function (root, B4ce) {
'use strict';

var Util = {
    /**
     * capitalizes the first char of the given string
     *
     * @param val
     * @return {String}
     */
    capitalize: function (val) {
        return val.charAt(0).toUpperCase() + val.slice(1);
    },

    /**
     * creates dynamic method
     * @param cat
     * @param lvl
     * @return {Function}
     */
    createMethod: function (cat, lvl) {
        var logCat = cat;

        if (cat === 'common') {
            return function () {
                var args = Array.prototype.slice.call(arguments, arguments);
                if (_.isArray(args[0]) || _.isNumber(args[0])) {
                    logCat = args.shift();
                } else {
                    logCat = [cat];
                }
                return this.logMessage(logCat, lvl, args);

            };
        } else {
            return function () {
                var args = Array.prototype.slice.call(arguments, arguments);
                return this.logMessage([logCat], lvl, args);
            };
        }
    },

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    extend: function (protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () { return parent.apply(this, arguments); };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) {
            _.extend(child.prototype, protoProps);
        }

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    },


    sanitizeBrowser: function () {
        // support Function.bind() for browsers missing native support
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== "function") {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    NoOp = function () {},
                    fBound = function () {
                        return fToBind.apply(this instanceof NoOp && oThis
                            ? this
                            : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                NoOp.prototype = this.prototype;
                fBound.prototype = new NoOp();

                return fBound;
            };
        }

        // support Array.forEach() in browsers missing native support
        // Production steps of ECMA-262, Edition 5, 15.4.4.18
        // Reference: http://es5.github.com/#x15.4.4.18
        if (!Array.prototype.forEach) {

            Array.prototype.forEach = function (callback, thisArg) {

                var T, k;

                if (this === null) {
                    throw new TypeError("this is null or not defined");
                }

                // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
                var O = Object(this);

                // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
                // 3. Let len be ToUint32(lenValue).
                var len = O.length >>> 0; // Hack to convert O.length to a UInt32

                // 4. If IsCallable(callback) is false, throw a TypeError exception.
                // See: http://es5.github.com/#x9.11
                if ( {}.toString.call(callback) !== "[object Function]" ) {
                    throw new TypeError( callback + " is not a function" );
                }

                // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if ( thisArg ) {
                    T = thisArg;
                }

                // 6. Let k be 0
                k = 0;

                // 7. Repeat, while k < len
                while( k < len ) {

                    var kValue;

                    // a. Let Pk be ToString(k).
                    //   This is implicit for LHS operands of the in operator
                    // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                    //   This step can be combined with c
                    // c. If kPresent is true, then
                    if ( k in O ) {

                        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                        kValue = O[ k ];

                        // ii. Call the Call internal method of callback with T as the this value and
                        // argument list containing kValue, k, and O.
                        callback.call( T, kValue, k, O );
                    }
                    // d. Increase k by 1.
                    k++;
                }
                // 8. return undefined
            };
        }

        if (Function.prototype.bind &&
            Array.prototype.forEach &&
            typeof console === "object" &&
            typeof console.log === "object") {
            [
                "log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"
            ].forEach(function (method) {
                    if (console[method]) {
                        console[method] = this.bind(console[method], console);
                    }
                }, Function.prototype.call);
        }
    }
};

B4ce.Log.Util = Util;

}(this, B4ce));

/*global _, B4ce */
(function (root, B4ce) {
'use strict';

/**
 * Channel is the base "class" for logging channels
 *
 * @param options
 * @constructor
 */

var Channel = function (options) {
    if (!options) {
        options = {};
    }
    if (options.level) {
        this.level = options.level;
    }
    if (options.timestampFormatter) {
        this.timestampFormatter = options.timestampFormatter;
    }
    if (options.log) {
        this.setLog(options.log);
    }
};
Channel.extend = B4ce.Log.Util.extend;
_.extend(Channel.prototype, {
    log: undefined,
    level: null,
    timestampFormatter: 'default',

    setLog: function (log) {
        this.log = log;
        this.setTimestampFormatter();
    },

    filter: function (categories, level/*, args*/) {
        // check level
        if (this.level && (this.log.levels[level] < this.log.levels[this.level])) {
            return false;
        }
        // check categories
        return !(this.categories && !(_.intersect(this.categories, categories).length));
    },

    timestamp: function (/*categories, level, args*/) {
        return this._stampFormatter(new Date());
    },

    setTimestampFormatter: function (key) {
        if (key) {
            this.timestampFormatter = key;
        }
        if (this.log) {
            this._stampFormatter = this.log.getTimestampFormatter(this.timestampFormatter);
        }
    },

    prefix: function (categories, level, args) {
        var prefixParts = [];
        var tmp;
        if ((tmp = this.timestamp(categories, level, args))) {
            prefixParts.push(tmp);
        }
        prefixParts.push(level.toUpperCase());
        tmp = _.without(categories, 'common');
        if (tmp.length) {
            prefixParts.push(' [' + tmp.join(',') + ']');
        }
        return prefixParts.join(' ') + ':';
    },

    format: function (categories, level, args) {
        return this.prefix(categories, level, args) + ' ' + args.join(' ');
    },

    write: function (/*categories, level, args*/) {
        throw 'Channel.write has to be overriden by actual channel implementation!';
    }

});

B4ce.Log.Channel = Channel;

}(this, B4ce));

/*global _, B4ce */
(function (root, B4ce) {
'use strict';

/**
 * Alert channel logs emerg errors into alert popups.
 *
 * @param options
 * @constructor
 */
B4ce.Log.Channel.Alert = B4ce.Log.Channel.extend({
    constructor: function (options) {
        options = _.extend({
            level: 'alert'
        }, options);
        B4ce.Log.Channel.call(this, options);
    },

    filter: function (categories, level, args) {
        if (window.alert === undefined) {
            return false;
        }
        return B4ce.Log.Channel.prototype.filter.call(this, categories, level, args);
    },

    timestamp: function (/*categories, level, args*/) {
        return null;
    },

    write: function (categories, level, args) {
        window.alert(this.format(categories, level, args));
    }
});

}(this, B4ce));

/*global B4ce */
(function (root, B4ce) {
'use strict';

/**
 * ConsoleChannels logs to browser console
 *
 * @param options
 * @constructor
 */
B4ce.Log.Channel.Console = B4ce.Log.Channel.extend({
    filter: function (categories, level, args) {
        if (typeof console !== "object" || typeof console.log !== 'function') {
            return false;
        }
        return B4ce.Log.Channel.prototype.filter.call(this, categories, level, args);
    },

    format: function (categories, level, args) {
        return [this.prefix(categories, level, args)].concat(args);
    },

    write: function (categories, level, args) {
        var levelVal = this.log.levels[level];
        var meth;
        if (levelVal >= this.log.levels.err) {
            meth = console.error;
        } else if (levelVal >= this.log.levels.warning) {
            meth = console.warn;
        } else  {
            meth = console.log;
        }
        meth.apply(console, this.format(categories, level, args));

        return this;
    }
});

}(this, B4ce));

/*global $, B4ce */
(function (root, B4ce) {
'use strict';

var _template = $('<div class="log-entry"></div>');

/**
 * HtmlChannel logs to html element
 *
 * @param options
 * @constructor
 */

B4ce.Log.Channel.HTML = B4ce.Log.Channel.extend({
    constructor: function (options) {
        if (!options.selector) {
            throw new Error('Required option "selector" missing!');
        }
        this.selector = options.selector;
        this.$el = $(options.selector);
        B4ce.Log.Channel.call(this, options);
    },

    filter: function (categories, level, args) {
        if (!this.$el) {
            return false;
        }

        return B4ce.Log.Channel.prototype.filter.call(this, categories, level, args);
    },

    write: function (categories, level, args) {
        this.$el.append(_template
            .clone()
            .addClass([level].concat(categories).join(' '))
            .text(this.format(categories, level, args))
        );

        return this;
    }
});

}(this, B4ce));

/*global _, B4ce */
(function (root, B4ce) {
'use strict';

// sanitize browser
B4ce.Log.Util.sanitizeBrowser();

var levels = [
    "debug",
    "info",
    "notice",
    "warning",
    "err",
    "crit",
    "alert",
    "emerg"
];
var levelValMax = 0;
var levelMap = {};
_.each(levels, function (name) {
    levelMap[name] = ++levelValMax;
});

var defaultChannels = {
    alert: B4ce.Log.Channel.Alert,
    console: B4ce.Log.Channel.Console
};

var hasOwn = Object.prototype.hasOwnProperty;

var Log = function (options) {
    // ensure options object
    if (_.isUndefined(options)) {
        options = {};
    } else if (!_.isObject(options)) {
        throw new Error('invalid options: ' + JSON.stringify(options));
    }

    if (options.autoLoad) {
        this.autoLoad = !!options.autoLoad;
    }

    if (options.defaultLevel) {
        // set default category level
        this.defaultLevel = this.sanitizeLevel(options.defaultLevel);
    }

    // setup categories
    this.categories = {
        common: 1
    };
    this.categoryLevel = {
        common: null
    };
    this.categoryValMax = this.categories.common;
    this.createCategoryMethods();
    if (options.categories) {
        this.addCategories(options.categories);
    }
//    console.log('Log(): categories, categoryLevel:', this.categories, this.categoryLevel);

    // setup instance log channels
    this.channels = {};
    if (!_.isUndefined(options.channels)) {
        this.addChannels(options.channels);
    } else {
        this.addChannels(defaultChannels);
    }
//    console.log('Log(): channels: ', this.channels);

    if (this.autoLoad) {
        this.loadSettings();
    }
};
_.each(levelMap, function (val, key) {
    Log[key.toUpperCase()] = val;
});

_.extend(Log.prototype, {
    /**
     * instance properties
     */

    persistencePrefix: 'b4ce.log',
    autoLoad: false,

    // define valid levels (borrowed by posix syslog standard)
    levels: levelMap,
    defaultLevel: 'debug',

    defaultTimeStampFormatter: 'short',
    timeStampFormatters: {
        'iso': 'formatTimestampISO',
        'short': 'formatTimestampShort',
        'utcshort': 'formatTimestampUTCShort'
    },
    
    addCategory: function (name, level) {
        if (!this.categories[name]) {
            // create custom category
            this.categoryValMax *= 2;
            this.categories[name] = this.categoryValMax;
        }
        this.categoryLevel[name] = this.sanitizeLevel(level);
        this.createCategoryMethods(name);

        return this;
    },

    addCategories: function (categories) {
        var log = this;
        if (_.isObject(categories)) {
            _.each(categories, function (level, name) {
                log.addCategory(name, level);
            });
        } else if (_.isArray(categories)) {
            _.each(categories, function (name) {
                log.addCategory(name);
            });
        } else {
            throw new Error("categories is neither object nor array!");
        }

        return this;
    },

    addChannel: function (name, ChannelOptions) {
        if (this.channels[name]) {
            throw new Error('Channel name already registered: ' + name);
        }
        if (ChannelOptions instanceof B4ce.Log.Channel) {
            // add prebuilt custom channel
            ChannelOptions.setLog(this);
            this.channels[name] = ChannelOptions;
        } else if (_.isFunction(ChannelOptions)) {
            this.channels[name] = new ChannelOptions({log: this});
        } else if (_.isFunction(defaultChannels[name])) {
            if (ChannelOptions === false) {
                return this;
            }
            var options = {
                log: this
            };
            if (_.isObject(ChannelOptions)) {
                _.extend(options, ChannelOptions);
            }
            this.channels[name] = new defaultChannels[name](options);
        }

        return this;
    },

    addChannels: function (channels) {
        var log = this;
        if (_.isObject(channels)) {
            _.each(channels, function (channel, name) {
                log.addChannel(name, channel);
            });
        } else {
            throw new Error("channels is neither object nor array!");
        }

        return this;
    },

    removeChannel: function (name) {
        if (!this.channels[name]) {
            throw new Error("Cannot remove non-existent channel: " + JSON.stringify(name));
        }
        delete this.channels[name];

        return this;
    },

    getLevel: function (category) {
        if (_.isUndefined(category)) {
            return this.defaultLevel;
        }
        var level = this.categoryLevel[category];
        if (_.isUndefined(level)) {
            throw new Error("Invalid category: " + JSON.stringify(category));
        }

        return level;
    },

    setLevel: function (level, category) {
        var catKey;

        level = this.sanitizeLevel(level);

        if (category === undefined) {
            if (level) {
                this.defaultLevel = level;
            } else {
                for (catKey in this.categoryLevel) {
                    if (this.categoryLevel.hasOwnProperty(catKey)) {
                        this.categoryLevel[catKey] = null;
                    }
                }
            }
        } else {
            if (!this.categoryLevel.hasOwnProperty(category)) {
                throw 'Invalid category: ' + category;
            }
            this.categoryLevel[category] = level;
        }

        return this;
    },

    getSettings: function () {
        return {
            defaultLevel: this.defaultLevel,
            categoryLevel: _.clone(this.categoryLevel)
        };
    },

    setSettings: function (settings) {
        if (!_.isObject(settings)) {
            throw new Error('Param "settings" is not an object!');
        }
        if (hasOwn.call(settings, 'defaultLevel')) {
            try {
                this.setLevel(settings.defaultLevel);
            } catch (err) {
                console.log('Error setting default level: ' + err);
            }
        }
        var levels = settings.categoryLevel;
        if (_.isObject(levels)) {
            var log = this;
            _.each(_.keys(this.categories), function (key) {
                if (hasOwn.call(levels, key)) {
                    try {
                        log.setLevel(levels[key], key);
                    } catch (err) {
                        console.log('Error setting level for category "' + key + '" to '
                            + JSON.stringify(levels[key]) + ':', err);
                    }
                }
            });
        }

        return this;
    },

    loadSettings: function () {
        if (typeof localStorage === 'undefined') {
            this.warning('Log.loadSettings(): No localStorage to load from!');

            return this;
        }

        var settings = localStorage.getItem(this.persistencePrefix + '.settings');
        if (settings !== null) {
            try {
                settings = JSON.parse(settings);
                this.info('Log.loadSettings(): Applying saved settings');
                this.setSettings(settings);
            } catch (err) {
                this.warning('Log.loadSettings(): Error applying saved settings:', err);
                this.deleteSettings();
            }
        }

        return this;
    },

    saveSettings: function () {
        if (typeof localStorage === 'undefined') {
            this.warning('Log.saveSettings(): No localStorage to save to');

            return this;
        }
        localStorage.setItem(this.persistencePrefix + '.settings', JSON.stringify(this.getSettings()));

        return this;
    },

    deleteSettings: function () {
        if (typeof localStorage === 'undefined') {
            console.warn('Log.deleteSettings(): No localStorage to delete from!');

            return this;
        }
        this.warning('Log.deleteSettings(): Deleting saved settings');
        localStorage.removeItem(this.persistencePrefix + '.settings');

        return this;
    },

    getFormattedTimestamp: function (format, date) {
        if (_.isUndefined(format)) {
        }
        if (_.isUndefined(date)) {
            date = new Date();
        }
    },

    getTimestampFormatter: function (key) {
        if (!key || key === 'default') {
            key = this.defaultTimeStampFormatter;
        }
        var res = this.timeStampFormatters[key];
        if (!res) {
            throw new Error('Invalid timestamp formatter name: ' + key);
        }
        if (_.isString(res)) {
            if (!_.isFunction(this[res])) {
                throw new Error('Invalid timestamp formatter method: ' + res);
            }
            res = this.timeStampFormatters[key] = this[res];
        }
        return res;
    },

    formatTimestampISO: function (date) {
        return date.toISOString();
    },

    formatTimestampShort: function (date) {
        return _.map(['getHours', 'getMinutes', 'getSeconds'], function (meth) {
            var val = date[meth]();
            return (val < 10 && '0' + val) || val;
//            if (val < 10) {
//                val = '0' + val
//            }
//            return val;
        }).join(':');
    },

    formatTimestampUTCShort: function (date) {
        return date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds();
    },

    createCategoryMethods: function (category) {
        var categoryNames;
        if (!_.isUndefined(category)) {
            if (!this.categories[category]) {
                throw new Error('invalid category: ' + JSON.stringify(category));
            }
            categoryNames = [category];
        } else {
            categoryNames = _.keys(this.categories);
        }
        // create dynamic convenience methods
        var log = this;
        _.each(categoryNames, function (curCat) {
            _.each(levelMap, function (curVal, curLvl) {
                var curMeth;
                if (curCat === 'common') {
                    curMeth = curLvl;
                } else {
                    curMeth = curCat + B4ce.Log.Util.capitalize(curLvl);
                }
                if (log[curMeth] !== undefined) {
                    log.logMessage(log.categories.common, log.levelMap.info, 'Cannot create log method "' + curMeth + '"');
                } else {
                    log[curMeth] = B4ce.Log.Util.createMethod(curCat, curLvl);
                }
            });
        });
        
        return this;
    },
    
    // sanitizes all acceptable forms of category specification into an array of
    // category names
    sanitizeCategories: function (categories) {
        var res = [],
            key,
            i,
            j;

        if (_.isArray(categories)) {
            for (i = 0, j = categories.length; i < j; i = i + 1) {
                if (!this.categories.hasOwnProperty(categories[i])) {
                    throw 'Invalid category: ' + categories[i];
                }
            }
            res = categories.slice();
        } else if (_.isNumber(categories)) {
            // interprete number as ORed category values
            for (key in this.categories) {
                if (this.categories.hasOwnProperty(key)) {
                    if (this.categories[key] & categories) {
                        res.push(key);
                        categories = categories - this.categories[key];
                    }
                }
            }
            if (categories > 0) {
                throw 'Invalid numeric category value: ' + categories;
            }
        } else {
            throw 'Invalid categories argument: ' + categories;
        }

        return res;
    },

    // sanitizes all acceptable forms of level specification into a level name
    sanitizeLevel: function (level) {
        if (!level) {
            return null;
        } 
        if (_.isString(level)) {
            if (!this.levels.hasOwnProperty(level)) {
                throw 'Invalid string level: ' + level;
            }
            return level;
        }
        if (_.isNumber(level)) {
            // interprete as numeric level
            var key;
            for (key in this.levels) {
                if (this.levels.hasOwnProperty(key)) {
                    if (level === this.levels[key]) {
                        return key;
                    }
                }
            }
            throw 'Invalid numeric level: ' + level;
        }
        throw 'Invalid level: ' + level;
    },

    // this is the main function for logging messages. all
    logMessage: function (categories, level, args) {
        var msgCategories = [],
            key,
            i,
            j,
            channel,
            channelOk,
            channelMsgCategories;

        categories = this.sanitizeCategories(categories);
        level = this.sanitizeLevel(level);

//        console.log('Log.logMessage(): categories, level, args:', categories, level, args);

        // iterate over all logging categories
        for (i = 0, j = categories.length; i < j; i = i + 1) {
            key = categories[i];
            // filter message categories by category level
            if (this.levels[level] >= this.levels[this.categoryLevel[key] || this.defaultLevel]) {
                msgCategories.push(key);
            }
        }
//        console.log('Log.logMessage(): msgCategories:', msgCategories);
        if (!msgCategories.length) {
            // message does not pass category / level filter => return
            return this;
        }

        // iterate over all channels to deliver the message
        for (key in this.channels) {
            if (this.channels.hasOwnProperty(key)) {
                channel = this.channels[key];
                channelOk = true;
                channelMsgCategories = msgCategories;
                // check if message passes channel filter, if so => deliver
                if (channel.filter(msgCategories, level, args)) {
//                    console.log('Log.logMessage(): writing to channel:', channel);
                    channel.write(msgCategories, level, args);
                }
            }
        }
//                console.log('Log.logMessage(): categories, level, args:', categories, level, args);
        return this;
    }

});

B4ce.Log = _.extend(Log, B4ce.Log);

}(this, B4ce));



return B4ce.Log;

}));
