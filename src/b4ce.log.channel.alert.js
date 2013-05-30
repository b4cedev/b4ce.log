/*global _, B4ce */
(function (root, B4ce) {
'use strict';

/**
 * Alert channel logs emerg errors into alert popups.
 *
 * @param options
 * @constructor
 */
B4ce.Log.Channel.Alert = B4ce.Log.Channel.extend({
    constructor: function (options) {
        options = _.extend({
            level: 'alert'
        }, options);
        B4ce.Log.Channel.call(this, options);
    },

    filter: function (categories, level, args) {
        if (window.alert === undefined) {
            return false;
        }
        return B4ce.Log.Channel.prototype.filter.call(this, categories, level, args);
    },

    timestamp: function (/*categories, level, args*/) {
        return null;
    },

    write: function (categories, level, args) {
        window.alert(this.format(categories, level, args));
    }
});

}(this, B4ce));
