/*jshint indent:4 */

(function (root, factory) {
    if (typeof exports === 'object') {

        var underscore = require('underscore');

        module.exports = factory(underscore);

    } else if (typeof define === 'function' && define.amd) {

        define(['underscore'], factory);

    }
}(this, function (_) {

    //= b4ce.log.js

    return Log;
}));
