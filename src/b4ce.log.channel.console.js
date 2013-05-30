/*global B4ce */
(function (root, B4ce) {
'use strict';

/**
 * ConsoleChannels logs to browser console
 *
 * @param options
 * @constructor
 */
var Channel = B4ce.Log.Channel.extend({
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

B4ce.Log.Channel.Console = Channel;

}(this, B4ce));
