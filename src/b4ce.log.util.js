/* jshint unused: false */

/**
 * capitalizes the first char of the given string
 *
 * @param val
 * @return {String}
 */
function capitalize(val) {
    return val.charAt(0).toUpperCase() + val.slice(1);
}

/**
 * creates dynamic method
 * @param cat
 * @param lvl
 * @return {Function}
 */
function createMethod(cat, lvl) {
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
}
