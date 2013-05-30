(function (root, factory) {
    'use strict';

    // https://github.com/umdjs/umd/blob/master/amdWeb.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore'], factory);
    } else {
        // Browser globals (root is window)
        if (!root.B4ce) { root.B4ce = {}; }
        if (!root.B4ce.Log) { root.B4ce.Log = {}; }
        root.B4ce.Log.Util = factory(root._);
    }
}(this, function (_) {
'use strict';

return {
    /**
     * capitalizes the first char of the given string
     *
     * @param val
     * @return {String}
     */
    capitalize: function (val) {
        return val.charAt(0).toUpperCase() + val.slice(1);
    },

    /**
     * creates dynamic method
     * @param cat
     * @param lvl
     * @return {Function}
     */
    createMethod: function (cat, lvl) {
        var logCat = cat;

        if (cat === 'common') {
            return function () {
                var args = Array.prototype.slice.call(arguments, arguments);
                if (_.isArray(args[0]) || _.isNumber(args[0])) {
                    logCat = args.shift();
                } else {
                    logCat = [cat];
                }
                return this.logMessage(logCat, lvl, args);

            };
        } else {
            return function () {
                var args = Array.prototype.slice.call(arguments, arguments);
                return this.logMessage([logCat], lvl, args);
            };
        }
    },

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    extend: function (protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () { return parent.apply(this, arguments); };
        }

        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) {
            _.extend(child.prototype, protoProps);
        }

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    },


    sanitizeBrowser: function () {
        // support Function.bind() for browsers missing native support
        if (!Function.prototype.bind) {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== "function") {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    NoOp = function () {},
                    fBound = function () {
                        return fToBind.apply(this instanceof NoOp && oThis
                            ? this
                            : oThis,
                            aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                NoOp.prototype = this.prototype;
                fBound.prototype = new NoOp();

                return fBound;
            };
        }

        // support Array.forEach() in browsers missing native support
        // Production steps of ECMA-262, Edition 5, 15.4.4.18
        // Reference: http://es5.github.com/#x15.4.4.18
        if (!Array.prototype.forEach) {

            Array.prototype.forEach = function (callback, thisArg) {

                var T, k;

                if (this === null) {
                    throw new TypeError("this is null or not defined");
                }

                // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
                var O = Object(this);

                // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
                // 3. Let len be ToUint32(lenValue).
                var len = O.length >>> 0; // Hack to convert O.length to a UInt32

                // 4. If IsCallable(callback) is false, throw a TypeError exception.
                // See: http://es5.github.com/#x9.11
                if ( {}.toString.call(callback) !== "[object Function]" ) {
                    throw new TypeError( callback + " is not a function" );
                }

                // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if ( thisArg ) {
                    T = thisArg;
                }

                // 6. Let k be 0
                k = 0;

                // 7. Repeat, while k < len
                while( k < len ) {

                    var kValue;

                    // a. Let Pk be ToString(k).
                    //   This is implicit for LHS operands of the in operator
                    // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                    //   This step can be combined with c
                    // c. If kPresent is true, then
                    if ( k in O ) {

                        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                        kValue = O[ k ];

                        // ii. Call the Call internal method of callback with T as the this value and
                        // argument list containing kValue, k, and O.
                        callback.call( T, kValue, k, O );
                    }
                    // d. Increase k by 1.
                    k++;
                }
                // 8. return undefined
            };
        }

        if (Function.prototype.bind &&
            Array.prototype.forEach &&
            typeof console === "object" &&
            typeof console.log === "object") {
            [
                "log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"
            ].forEach(function (method) {
                    if (console[method]) {
                        console[method] = this.bind(console[method], console);
                    }
                }, Function.prototype.call);
        }
    }
};


}));
