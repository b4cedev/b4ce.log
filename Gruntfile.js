/*global module:false*/
module.exports = function (grunt) {

    grunt.initConfig({
        meta: {
            version: '0.0.1',
            banner: '// B4ce.Log, v<%= meta.version %>\n'
                + '// Copyright (c)<%= grunt.template.today("yyyy") %> Stefan Bunse, B4ce development\n'
                + '// Distributed under MIT license\n'
                + '// http://github.com/b4cedev/b4ce.log\n'
        },

        jshint: {
            options: {
                // enforcing options
                curly: true,
                eqeqeq: true,
                forin: true,
                immed: false,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                nonew: true,
                quotmark: 'single',
                undef: true,
                unused: true,
                trailing: true,
                nomen: true,
                globals: {
                    _: false,
                    define: false,
                    require: false,
                    module: false
                }
            },
            all: ['grunt.js', 'src/**/*.js']
        },

        rig: {
            all: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: {
                    'lib/b4ce.log.js': ['src/b4ce.log.js'],
                    'lib/amd/b4ce.log.js': ['src/amd.js']
                }
            }
        },

        uglify: {
            'lib/b4ce.log.min.js': 'lib/b4ce.log.js',
            'lib/amd/b4ce.log.min.js': 'lib/amd/b4ce.log.js'
        },

        watch: {
            js: {
                files: ['Gruntfile.js', 'src/**/*.js'],
                tasks: ['default']
            }
        }
    });

    // Default task.
//    grunt.registerTask('default', 'lint rig min');
    grunt.registerTask('default', ['jshint', 'rig', 'uglify']);

    grunt.loadNpmTasks('grunt-contrib');
    grunt.loadNpmTasks('grunt-rigger');

};
