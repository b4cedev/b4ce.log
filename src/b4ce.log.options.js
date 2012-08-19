/*jslint nomen: true, indent: 4 */

var options = {

    /**
     * default minimum log level messages must have to be delivered to channels
     */
//    defaultLevel: 'debug',

    /**
     * define custom logging categories.
     *
     * to use defaultLevel from above, map to undefined
     */
//    categories: {
//        foo: 'debug',
//        bar: 'error',
//        baz: undefined
//    },

    /**
     * Channel config: map channel names to channel config. you'll find all valid variants of
     * channel config in the examples below.
     *
     * If you don't give this option, only the predefined channel 'console' will be active
     * without any filtering.
     *
     * Predefined channels:
     * - alert      : Log emerg errors to alert popups
     * - console    : Log to the browser console if available
     *
     */
//    channels: {
//        /**
//         * simply (en/dis)able a channel by mapping it to true or false:
//         */
////                console: true,
////                console: false,
//
//        /**
//         * enable a channel by setting one or more of it's filter options (categories, level):
//         */
////                console: {
////                    categories: ['common', 'foo'],
////                    level: 'info'
////                },
//
//        /**
//         * you can also override the channel methods 'filter', 'prefix', 'format' & 'write'
//         * to further customize the channel. each of these has a signature of
//         * (categories, level, args) to give you full flexibility.
//         */
////                console: {
////                    filter: function (categories, level, args) {
////                        return true;
////                    },
////                    write: function (categories, level, args) {
////                        if (console !== undefined) {
////                            var args = Array.prototype.slice.call(arguments, arguments);
////                            console.log.apply(console, args);
////                        }
////                    }*/
////                }
//    }
};
