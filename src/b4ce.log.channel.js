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

    filter: function (categories, level, args) {
        // check level
        if (this.level && (this.log.levels[level] < this.log.levels[this.level])) {
            return false;
        }
        // check categories
        return !(this.categories && !(_.intersect(this.categories, categories).length));
    },

    prefix: function (categories, level, args) {
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

    write: function (categories, level, args) {
        throw 'Log.Channel.write has to be overriden by actual channel implementation!';
    }

});
