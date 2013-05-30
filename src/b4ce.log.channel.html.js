(function (root, factory) {
    'use strict';

    // https://github.com/umdjs/umd/blob/master/amdWeb.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', './b4ce.log.channel'], factory);
    } else {
        // Browser globals (root is window)
        if (!root.B4ce) { root.B4ce = {}; }
        if (!root.B4ce.Log) { root.B4ce.Log = {}; }
        if (!root.B4ce.Log.Channel) { root.B4ce.Log.Channel = {}; }
        root.B4ce.Log.Channel.HTML = factory(root.jQuery, root.B4ce.Log.Channel);
    }
}(this, function ($, BaseChannel) {
'use strict';

var _template = $('<div class="log-entry"></div>');

/**
 * HtmlChannel logs to html element
 *
 * @param options
 * @constructor
 */

var Channel = BaseChannel.extend({
    constructor: function (options) {
        BaseChannel.call(this, options);
        this.$el = $(options.selector);
    },

    filter: function (categories, level, args) {
        if (!this.$el) {
            return false;
        }
        return BaseChannel.prototype.filter.call(this, categories, level, args);
    },

    write: function (categories, level, args) {
        this.$el.append(_template
            .clone()
            .addClass([level].concat(categories).join(' '))
            .text(this.format(categories, level, args))
        );

        return this;
    }
});

return Channel;

}));



