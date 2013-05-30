'use strict';

require.config({
    // cache bust in dev mode
    urlArgs: "bust=" + (new Date()).getTime(),

    // define shortcut paths for the application
    paths: {
        'underscore': 'js/underscore',
        'src': '../src'
    },
    shim: {
        underscore: {
            exports: '_',
            deps: []
        }
    }
});

require(['test.js']);
