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

var Log = function (options) {
    // ensure options object
    if (_.isUndefined(options)) {
        options = {};
    } else if (!_.isObject(options)) {
        throw new Error('invalid options: ' + JSON.stringify(options));
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
        common: undefined
    };
    this.categoryValMax = this.categories.common;
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

    this.createCategoryMethods();
};

//_.extend(Log, {
//    /**
//     * constructor properties ("static class properties")
//     */
//    Util: Util,
//    Channel: Channel
//});
_.each(levelMap, function (val, key) {
    Log[key.toUpperCase()] = val;
});

_.extend(Log.prototype, {
    /**
     * instance properties
     */

    // define valid levels (borrowed by posix syslog standard)
    levels: levelMap,
    defaultLevel: 'debug',
    
    addCategory: function (name, level) {
        if (!this.categories[name]) {
            // create custom category
            this.categoryValMax *= 2;
            this.categories[name] = this.categoryValMax;
        }
        this.categoryLevel[name] = this.sanitizeLevel(level);

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
            ChannelOptions.log = this;
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
        if (_.isUndefined(level)) {
            return level;
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

//                console.log('Log.logMessage(): categories, level, args:', categories, level, args);

        // iterate over all logging categories
        for (i = 0, j = categories.length; i < j; i = i + 1) {
            key = categories[i];
            // filter message categories by category level
            if (this.levels[level] >= this.levels[this.categoryLevel[key] || this.defaultLevel]) {
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
    }

});

B4ce.Log = _.extend(Log, B4ce.Log);

}(this, B4ce));

