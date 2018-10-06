module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js', 'lib/*.js', 'test/*.js']
    },
    vows: {
      all: {
        src: ['test/*.js'],
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-vows-runner');
  grunt.loadNpmTasks('grunt-vows');

  grunt.registerTask('default', ['jshint', 'vows']);
};
