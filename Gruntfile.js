/*global module:false*/
module.exports = function (grunt) {
'use strict';

grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta:{
        banner:
            '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %><%= pkg.author.email ? " <" + pkg.author.email + ">": "" %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },

    jshint: {
        options: {
            jshintrc: '.jshintrc',
            force: true
        },
        all: [
            'Gruntfile.js',
            'src/**/*.js',
            '!src/amd.js',
            '!src/b4ce.log.js'
        ]
    },

    concat: {
        build: {
            src: [
                'src/b4ce.log.util.js',
                'src/b4ce.log.channel.js',
                'src/b4ce.log.channel.alert.js',
                'src/b4ce.log.channel.console.js',
                'src/b4ce.log.js'
            ],
            dest: 'lib/<%= pkg.name %>.js'
        }
    },

/*
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
*/

    uglify: {
        'lib/<%= pkg.name %>.min.js': 'lib/<%= pkg.name %>.js'/*,
        'lib/amd/b4ce.log.min.js': 'lib/amd/b4ce.log.js'*/
    },

    /**
     * Watch task
     */
    watch: {
        jshint: {
            files: ['<%= jshint.all %>'],
            tasks: ['jshint']
        },
        concat: {
            files: ['Gruntfile.js', '<%= concat.build.src %>'],
            tasks: ['concat']
        },
        uglify: {
            files: ['Gruntfile.js', 'lib/b4ce.log.js'],
            tasks: ['uglify']
        }
    }
});

// Default task.
//    grunt.registerTask('default', ['jshint', 'rig', 'uglify']);
grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

grunt.loadNpmTasks('grunt-contrib');
//    grunt.loadNpmTasks('grunt-rigger');


};
