/*global console:true */

(function (root, factory) {
    'use strict';

    // https://github.com/umdjs/umd/blob/master/amdWeb.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'jquery',
            'underscore',
            'src/b4ce.log',
            'src/b4ce.log.channel.html'
        ], factory);
    } else {
        // Browser globals (root is window)
        factory(
            root.jQuery,
            root._,
            root.B4ce.Log,
            root.B4ce.Log.Channel.HTML
        );
    }
}(this, function (
    $,
    _,
    Log,
    HTMLChannel
) {
'use strict';

start();

//var fails = window.throws;

module('B4ce.Log');
test("Init", function() {
    expect(4);

    var log = window.log = new Log({
        categories: {
            'cat1': undefined,
            'cat2': 'err'
        }
    });
    ok(log instanceof Log, 'log is instance of Log');

    var realConsole = console;
    console = {
        error: function () {
            var args = Array.prototype.slice.call(arguments);
            ok(args.indexOf('hi err') !== -1, 'Log level "err" reaches console.error()');
        },
        warn: function () {
            var args = Array.prototype.slice.call(arguments);
            ok(args.indexOf('hi warning') !== -1, 'Log level "warning" reaches console.warn()');
        },
        log: function () {
            var args = Array.prototype.slice.call(arguments);
            ok(args.indexOf('hi debug') !== -1, 'Log level "debug" reaches console.log()');
        }
    };
    log.err('hi err');
    log.warning('hi warning');
    log.debug('hi debug');
    console = realConsole;
});

test("HTML Channel", function() {
    expect(2);

    var htmlChannel = new HTMLChannel({
        level: Log.DEBUG,
        selector: '#qunit-fixture'
    });
    ok(htmlChannel instanceof Log.Channel, 'htmlChannel is instance of Log.Channel');

    var log = new Log({
        channels: {
            html: htmlChannel
        }
    });

    var msg = 'HTML Test';
    log.debug(msg);
    ok($(htmlChannel.selector + ' .log-entry').text().indexOf(msg) !== -1, 'Found log message in HTML element.');

});

}));
