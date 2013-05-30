(function (root, factory) {
    'use strict';

    // https://github.com/umdjs/umd/blob/master/amdWeb.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'jquery',
            'underscore'
        ], factory);
    } else {
        // Browser globals (root is window)
        if (!root.B4ce) {
            root.B4ce = {};
        }
        root.B4ce.Log = factory(
            root.jQuery,
            root._,
            root.B4ce
        );
    }
}(this, function (
    $,
    _,
    B4ce
) {
'use strict';

if (!B4ce) {
    B4ce = {};
}
if (!B4ce.Log) {
    B4ce.Log = {};
}
