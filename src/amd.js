/*jshint indent:4 */

(function (root, factory) {
    'use strict';

    // ensure global B4ce object
    if (root.B4ce === undefined) {
        root.B4ce = {};
    }

    if (typeof exports === 'object') {

        var underscore = require('underscore');

        module.exports = factory(root.B4ce, underscore);

    } else if (typeof define === 'function' && define.amd) {

        define(['underscore'], function (_) {
            return factory(root.B4ce, _);
        });

    }
}(this, function (B4ce, _) {
/* jshint unused: false */

    //= b4ce.log.js

    return B4ce.Log;
}));
