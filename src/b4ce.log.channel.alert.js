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
