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
        root.B4ce.Log.Channel.Alert = factory(root._, root.B4ce.Log.Channel);
    }
}(this, function (_, BaseChannel) {
'use strict';

/**
 * Alert channel logs emerg errors into alert popups.
 *
 * @param options
 * @constructor
 */
var Channel = BaseChannel.extend({
    constructor: function (options) {
        options = _.extend({
            level: 'alert'
        }, options);
        BaseChannel.call(this, options);
    },

    filter: function (categories, level, args) {
        if (window.alert === undefined) {
            return false;
        }
        return BaseChannel.prototype.filter.call(this, categories, level, args);
    },

    timestamp: function (/*categories, level, args*/) {
        return null;
    },

    write: function (categories, level, args) {
        window.alert(this.format(categories, level, args));
    }
});

return Channel;

}));
