/*global module:false*/
module.exports = function (grunt) {
'use strict';

grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta:{
        banner:
            '/**\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %><%= pkg.author.email ? " <" + pkg.author.email + ">": "" %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n'
    },

    jshint: {
        options: {
            jshintrc: '.jshintrc',
            force: true
        },
        source: {
            src: [
                'Gruntfile.js',
                'src/**/*.js',
                '!src/umd-*fix.js'
            ]
        },
        test: {
            options: {
                jshintrc: 'test/.jshintrc'
            },
            src: [
                'test/*.js'
            ]
        }
    },

    concat: {
        options: {
            banner: '<%= meta.banner %>'
        },
        build: {
            src: [
                'src/umd-prefix.js',
                'src/b4ce.log.util.js',
                'src/b4ce.log.channel.js',
                'src/b4ce.log.channel.alert.js',
                'src/b4ce.log.channel.console.js',
                'src/b4ce.log.channel.html.js',
                'src/b4ce.log.js',
                'src/umd-suffix.js'
            ],
            dest: 'lib/<%= pkg.name %>.js'
        }
    },

    uglify: {
        options: {
            banner: '<%= meta.banner %>'
        },
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
        most: {
            files: [
                '<%= jshint.source.src %>',
                '<%= jshint.test.src %>'
            ],
            tasks: [
                'build',
                'test'
            ]
        },
        wrapper: {
            files: [
                'src/umd-*fix.js'
            ],
            tasks: [
                'build',
                'test'
            ]
        }
    }
});

grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-qunit');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-watch');

grunt.registerTask('test', ['jshint', 'qunit']);
grunt.registerTask('build', ['concat', 'uglify']);
grunt.registerTask('default', ['test', 'build']);


};
