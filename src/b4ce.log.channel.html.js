/*global $, B4ce */
(function (root, B4ce) {
'use strict';

var _template = $('<div class="log-entry"></div>');

/**
 * HtmlChannel logs to html element
 *
 * @param options
 * @constructor
 */

var Channel = B4ce.Log.Channel.extend({
    constructor: function (options) {
        B4ce.Log.Channel.call(this, options);
        this.$el = $(options.selector);
    },

    filter: function (categories, level, args) {
        if (!this.$el) {
            return false;
        }
        return B4ce.Log.Channel.prototype.filter.call(this, categories, level, args);
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

B4ce.Log.Channel.HTML = Channel;

}(this, B4ce));
