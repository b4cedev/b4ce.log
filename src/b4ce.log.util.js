/*jslint nomen: true, indent: 4 */

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
    if (cat === 'common') {
        return function () {
            var args = Array.prototype.slice.call(arguments, arguments);
            if (_.isArray(args[0]) || _.isNumber(args[0])) {
                cat = args.shift();
            } else {
                cat = [cat];
            }
            return this.logMessage(cat, lvl, args);

        };
    } else {
        return function () {
            var args = Array.prototype.slice.call(arguments, arguments);
            return this.logMessage([cat], lvl, args);
        };
    }
}
