/*jshint indent:4 */

(function (root, factory) {

    // ensure global B4ce object
    root.B4ce = root.B4ce || {};

    if (typeof exports === 'object') {

        var underscore = require('underscore');

        module.exports = factory(B4ce, underscore);

    } else if (typeof define === 'function' && define.amd) {

        define(['underscore'], function (_) {
            return factory(B4ce, _);
        });

    }
}(this, function (B4ce, _) {

    //= b4ce.log.js

    return B4ce.Log;
}));
