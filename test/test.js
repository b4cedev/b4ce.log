(function (root, factory) {
    // https://github.com/umdjs/umd/blob/master/amdWeb.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'underscore',
            'src/b4ce.log'/*,
            'b4ce.log.channel.console'*/
        ], factory);
    } else {
        // Browser globals (root is window)
        factory(_, B4ce.Log);
    }
}(this, function (_, Log) {

start();

// screw you, jshint!
var fails = window['throws'];

module('B4ce.Log');
test("Init", function() {
    expect(4);

    var log = new Log({
        categories: {
            'cat1': undefined,
            'cat2': 'err'
        }
    });
    ok(log instanceof Log, 'log is instance of Log');

    var realConsole = console;
    console = {
        error: function (msg) {
            var args = Array.prototype.slice.call(arguments);
            ok(args.indexOf('hi err') !== -1, 'Log level "err" reaches console.error()');
        },
        warn: function () {
            var args = Array.prototype.slice.call(arguments);
            ok(args.indexOf('hi warning') !== -1, 'Log level "warning" reaches console.warn()');
        },
        log: function (msg) {
            var args = Array.prototype.slice.call(arguments);
            ok(args.indexOf('hi debug') !== -1, 'Log level "debug" reaches console.log()');
        }
    }
    log.err('hi err');
    log.warning('hi warning');
    log.debug('hi debug');
    console = realConsole;
});

}));
