// B4ce.Log, v0.0.1
// Copyright (c)2013 Stefan Bunse, B4ce development
// Distributed under MIT license
// http://github.com/b4cedev/b4ce.log
/*jshint indent:4 */

(function (root, factory) {
    'use strict';

    // ensure global B4ce object
    if (root.B4ce === undefined) {
        root.B4ce = {};
    }

    if (typeof exports === 'object') {

        var underscore = require('underscore');

        module.exports = factory(root.B4ce, underscore);

    } else if (typeof define === 'function' && define.amd) {

        define(['underscore'], function (_) {
            return factory(root.B4ce, _);
        });

    }
}(this, function (B4ce, _) {
/* jshint unused: false */

    /*global B4ce:true, Log */
    
    B4ce = B4ce || {};
    
    B4ce.Log = (function (B4ce, _) {
    /* jshint unused: false */
    //        console.log ('initializing b4ce.log...');
    
    /* jshint unused: false */
    
    /**
     * capitalizes the first char of the given string
     *
     * @param val
     * @return {String}
     */
    function capitalize(val) {
        return val.charAt(0).toUpperCase() + val.slice(1);
    }
    
    /**
     * creates dynamic method
     * @param cat
     * @param lvl
     * @return {Function}
     */
    function createMethod(cat, lvl) {
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
    }
    /*global capitalize, createMethod */
    var Log = function (options) {
        var optKey,
            optVal,
            curCat,
            curLvl,
            curMeth,
            channels = {},
            channelOptions;
    
        // sanitize browser
        this.sanitizeBrowser();
    
        // prepare / normalize options
        options = options ? _.clone(options) : {};
    
        // define valid levels (borrowed by posix syslog standard)
        this.levels = {
            emerg: 8,
            alert: 7,
            crit: 6,
            err: 5,
            warning: 4,
            notice: 3,
            info: 2,
            debug: 1
        };
    
        // define default level and category => level mapping
        this.defaultLevel = options.defaultLevel ? this.sanitizeLevel(options.defaultLevel) : 'debug';
        this.categoryLevel = {};
    
    
        // create / configure categories
    
        // default category
        this.categories = {
            common: 1
        };
    
        // process categories option
        if (options.categories) {
            optVal = 1;
            for (optKey in options.categories) {
                if (options.categories.hasOwnProperty(optKey)) {
                    if (!this.categories[optKey]) {
                        // create custom category
                        optVal = optVal * 2;
                        this.categories[optKey] = optVal;
                    }
                    // set category level
                    this.categoryLevel[optKey] = options.categories[optKey] ? this.sanitizeLevel(options.categories[optKey]) : undefined;
                }
            }
        }
    //            console.log('Log(): categories:', this.categories);
    
        // ensure level for all categories
        for (optKey in this.categories) {
            if (this.categories.hasOwnProperty(optKey)) {
                if (!this.categoryLevel[optKey]) {
                    this.categoryLevel[optKey] = this.defaultLevel;
                }
            }
        }
    //            console.log('Log(): categoryLevel:', this.categoryLevel);
    
        // configure channels
        if (!options.channels) {
            // enable default channels
            options.channels = {
                console: true,
                alert: true
            };
        }
    //            console.log('Log(): channels: ', this.channels);
    
        for (optKey in options.channels) {
            if (options.channels.hasOwnProperty(optKey)) {
                optVal = options.channels[optKey];
                if (optVal instanceof Log.Channel) {
                    // add prebuilt custom channel
                    channels[optKey] = optVal;
                } else {
                    // configure default channel
                    if (!this.channels[optKey]) {
                        throw 'Tried to configure invalid default channel: ' + optKey;
                    }
                    if (optVal !== false) {
                        channelOptions = {
                            log: this
                        };
                        if (_.isObject(optVal)) {
                            if (optVal.level) {
                                channelOptions.level = this.sanitizeLevel(optVal.level);
                            }
                            if (optVal.categories) {
                                channelOptions.categories = this.sanitizeCategories(optVal.categories);
                            }
                        } else if (optVal !== true) {
                            throw 'Invalid config for channel "' + optKey + '": ' + optVal;
                        }
                        channels[optKey] = new this.channels[optKey](channelOptions);
                    }
                }
            }
        }
        this.channels = channels;
    //            console.log('Log(): this.channels:', this.channels);
    
        // create dynamic convenience methods
        for (curCat in this.categories) {
            if (this.categories.hasOwnProperty(curCat)) {
                for (curLvl in this.levels) {
                    if (this.levels.hasOwnProperty(curLvl)) {
                        if (curCat === 'common') {
                            curMeth = curLvl;
                        } else {
                            curMeth = curCat + capitalize(curLvl);
                        }
                        if (this[curMeth] !== undefined) {
                            this.logMessage(this.categories.common, this.levels.info, 'Cannot create log method "' + curMeth + '"');
                        } else {
                            this[curMeth] = createMethod(curCat, curLvl);
                        }
                    }
                }
            }
        }
    
    };
    _.extend(Log.prototype, {
        /**
         * define "class" methods
         */
    
        // define default channels
        channels: {},
    
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
    
    //                console.log('Log.logMessage(): categories, level, args:', categories, level, args);
    
            // iterate over all logging categories
            for (i = 0, j = categories.length; i < j; i = i + 1) {
                key = categories[i];
                // filter message categories by category level
                if (this.levels[level] >= this.levels[this.categoryLevel[key]]) {
                    msgCategories.push(key);
                }
            }
    //                console.log('Log.logMessage(): msgCategories:', msgCategories);
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
                        channel.write(msgCategories, level, args);
                    }
                }
            }
    //                console.log('Log.logMessage(): categories, level, args:', categories, level, args);
            return this;
        },
    
        setLevel: function (level, category) {
            var catKey;
    
            if (!level || level === '') {
                level = undefined;
            } else {
                level = this.sanitizeLevel(level);
            }
    
            if (category === undefined) {
                if (level === undefined) {
                    level = this.defaultLevel;
                } else {
                    this.defaultLevel = level;
                }
                for (catKey in this.categoryLevel) {
                    if (this.categoryLevel.hasOwnProperty(catKey)) {
                        this.categoryLevel[catKey] = level;
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
            var key;
    
            if (_.isString(level)) {
                if (!this.levels.hasOwnProperty(level)) {
                    throw 'Invalid level: ' + level;
                }
                return level;
            } else if (_.isNumber(level)) {
                // interprete number as numeric level
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
                        fNOP = function () {},
                        fBound = function () {
                            return fToBind.apply(this instanceof fNOP && oThis
                                ? this
                                : oThis,
                                aArgs.concat(Array.prototype.slice.call(arguments)));
                        };
    
                    fNOP.prototype = this.prototype;
                    fBound.prototype = new fNOP();
    
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
                    if ( {}.toString.call(callback) != "[object Function]" ) {
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
    
    });
    /*global Log:false */
    /**
     * Channel is the base "class" for logging channels
     *
     * @param options
     * @constructor
     */
    Log.Channel = function (options) {
        _.extend(this, options);
    };
    _.extend(Log.Channel.prototype, {
    
        filter: function (categories, level/*, args*/) {
            // check level
            if (this.level && (this.log.levels[level] < this.log.levels[this.level])) {
                return false;
            }
            // check categories
            return !(this.categories && !(_.intersect(this.categories, categories).length));
        },
    
        prefix: function (categories, level/*, args*/) {
            var prefix = level.toUpperCase();
            categories = _.without(categories, 'common');
            if (categories.length) {
                prefix += ' [' + categories.join(',') + ']';
            }
            prefix += ':';
    
            return prefix;
        },
    
        format: function (categories, level, args) {
            return this.prefix(categories, level, args) + ' ' + args.join(' ');
        },
    
        write: function (/*categories, level, args*/) {
            throw 'Log.Channel.write has to be overriden by actual channel implementation!';
        }
    
    });
    /*global Log, window */
    /**
     * Alert channel logs emerg errors into alert popups.
     *
     * @param options
     * @constructor
     */
    Log.AlertChannel = function (options) {
        options = _.extend({
            level: 'alert'
        }, options);
        Log.Channel.call(this, options);
    };
    _.extend(Log.AlertChannel.prototype, Log.Channel.prototype, {
        filter: function (categories, level, args) {
            if (window.alert === undefined) {
                return false;
            }
            return Log.Channel.prototype.filter.call(this, categories, level, args);
        },
    
        write: function (categories, level, args) {
            window.alert(this.format(categories, level, args));
        }
    });
    // add to default channels
    Log.prototype.channels.alert = Log.AlertChannel;
    /*global Log, window, console */
    /**
     * ConsoleChannels logs to browser console
     *
     * @param options
     * @constructor
     */
    Log.ConsoleChannel = function (options) {
        Log.Channel.call(this, options);
    };
    _.extend(Log.ConsoleChannel.prototype, Log.Channel.prototype, {
        filter: function (categories, level, args) {
            if (typeof console !== "object" || typeof console.log !== 'function') {
                return false;
            }
            return Log.Channel.prototype.filter.call(this, categories, level, args);
        },
    
        format: function (categories, level, args) {
            return [this.prefix(categories, level, args)].concat(args);
        },
    
        write: function (categories, level, args) {
            console.log.apply(console, this.format(categories, level, args));
    
            return this;
        }
    });
    // add to default channels
    Log.prototype.channels.console = Log.ConsoleChannel;
    
        B4ce.Log = Log;
    
        return Log;
    }(B4ce, _));

    return B4ce.Log;
}));