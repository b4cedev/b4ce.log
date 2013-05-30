(function () {
'use strict';

require.config({
    // cache bust in dev mode
    urlArgs: "bust=" + (new Date()).getTime(),

    // define shortcut paths for the application
    paths: {
        'jquery': 'js/jquery',
        'underscore': 'js/underscore',
        'src': '../lib'
    },
    shim: {
        jquery: {
            exports: 'jQuery',
            deps: []
        },
        underscore: {
            exports: '_',
            deps: []
        }
    }
});

require(['test.js']);

})(this);
