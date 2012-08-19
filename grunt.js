/*global module:false*/
module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-rigger');

    grunt.initConfig({
        meta: {
            version: '0.0.1',
            banner: '// B4ce.Log, v<%= meta.version %>\n' +
                '// Copyright (c)<%= grunt.template.today("yyyy") %> Stefan Bunse, B4ce development\n' +
                '// Distributed under MIT license\n' +
                '// http://github.com/b4cedev/b4ce.log'
        },

        lint: {
//            files: ['src/b4ce.log.js']
//_            files: ['lib/b4ce.log.js']
//            files: [
//                'lib/b4ce.log.js',
//                'lib/amd/b4ce.log.js',
//            ]
            all: ['grunt.js', 'src/**/*.js']
        },

        jsHint: {
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
                nomen: true
            },
            globals: {
                _: true
            }
        },

        rig: {
            build: {
                src: ['<banner:meta.banner>', 'src/b4ce.log.js'],
                dest: 'lib/b4ce.log.js'
            },
            amd: {
                src: ['<banner:meta.banner>', 'src/amd.js'],
                dest: 'lib/amd/b4ce.log.js'
            }
        },

        min: {
            standard: {
                src: ['<banner:meta.banner>', '<config:rig.build.dest>'],
                dest: 'lib/b4ce.log.min.js'
            },
            amd: {
                src: ['<banner:meta.banner>', '<config:rig.amd.dest>'],
                dest: 'lib/amd/b4ce.log.min.js'
            }
        }

    });

    // Default task.
//    grunt.registerTask('default', 'lint rig min');
    grunt.registerTask('default', 'lint rig min');

};
