(function (root, factory) {
    // https://github.com/umdjs/umd/blob/master/amdWeb.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'underscore',
            'b4ce.log'
        ], factory);
    } else {
        // Browser globals (root is window)
        factory(root._, root.B4ce.Log);
    }
}(this, function (_, Log) {

start();

// screw you, jshint!
var fails = window['throws'];

// test the facade -----------------------------------------
module('B4ce.Log');
test("Init", function() {
    var log = new Log();
    ok(log instanceof Log, 'log is instance of Log');

//    log.alert('hi alert');
    log.err('hi err');
    log.warning('hi warning');
    log.debug('hi debug');
});

}));
