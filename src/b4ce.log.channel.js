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
    _.extend(this, options);
};
Channel.extend = B4ce.Log.Util.extend;
_.extend(Channel.prototype, {

    filter: function (categories, level/*, args*/) {
        // check level
        if (this.level && (this.log.levels[level] < this.log.levels[this.level])) {
            return false;
        }
        // check categories
        return !(this.categories && !(_.intersect(this.categories, categories).length));
    },

    timestamp: function (/*categories, level, args*/) {
        return new Date().toISOString();
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
