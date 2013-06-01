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

