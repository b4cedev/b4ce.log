var Log = function (options) {
    var optKey,
        optVal,
        curCat,
        curLvl,
        curMeth,
        channels = {},
        channelOptions;

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
    }
});
