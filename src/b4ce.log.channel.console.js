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
