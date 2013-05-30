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
            'test/*.js'
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

    uglify: {
        'lib/<%= pkg.name %>.min.js': 'lib/<%= pkg.name %>.js'/*,
        'lib/amd/b4ce.log.min.js': 'lib/amd/b4ce.log.js'*/
    },

    qunit: {
        options: {
            '--web-security': 'no',
            timeout: 40000
        },
        all: ['test/**/*.html']
    },

    /**
     * Watch task
     */
    watch: {
        jshint: {
            files: ['<%= jshint.all %>'],
            tasks: ['jshint']
        },
        qunit: {
            files: ['<%= jshint.all %>', '<%= qunit.all %>', ],
            tasks: ['qunit']
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

grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-qunit');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-watch');

// Default task.
//    grunt.registerTask('default', ['jshint', 'rig', 'uglify']);
grunt.registerTask('test', ['jshint', 'qunit']);
grunt.registerTask('default', ['test', 'concat', 'uglify']);


};
