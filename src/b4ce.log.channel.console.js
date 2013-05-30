(function (root, factory) {
    'use strict';

    // https://github.com/umdjs/umd/blob/master/amdWeb.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', './b4ce.log.channel'], factory);
    } else {
        // Browser globals (root is window)
        if (!root.B4ce) { root.B4ce = {}; }
        if (!root.B4ce.Log) { root.B4ce.Log = {}; }
        if (!root.B4ce.Log.Channel) { root.B4ce.Log.Channel = {}; }
        root.B4ce.Log.Channel.Console = factory(root._, root.B4ce.Log.Channel);
    }
}(this, function (_, BaseChannel) {
'use strict';

/**
 * ConsoleChannels logs to browser console
 *
 * @param options
 * @constructor
 */
var Channel = BaseChannel.extend({
    filter: function (categories, level, args) {
        if (typeof console !== "object" || typeof console.log !== 'function') {
            return false;
        }
        return BaseChannel.prototype.filter.call(this, categories, level, args);
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

return Channel;

}));
