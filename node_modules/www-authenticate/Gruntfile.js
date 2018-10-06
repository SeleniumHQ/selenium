
'use strict';

module.exports = function( grunt )
{
  grunt.initConfig( {

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: [ 'index.js', 'lib/**/*.js' ]
      },
      test: {
        src: [ 'test/**/*.js' ]
      },
    },

    simplemocha: {
      all: {
        src: 'test/**/*.js',
        options: {
          globals: [ 'should' ],
          timeout: 10000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'dot'
        }
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: [ 'jshint:gruntfile' ]
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: [ 'jshint:lib', 'simplemocha' ]
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: [ 'jshint:test', 'simplemocha' ]
      }
    }
  } );

  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-simple-mocha' );
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask( 'default', [ 'jshint', 'simplemocha' ] );
};
