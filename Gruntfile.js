module.exports = function(grunt) {

  grunt.initConfig({
    copy : {
      main: {
        files: [
          // includes files within path and its sub-directories
          {expand: true, src: ['average.html','radar.html'], dest: '../api/templates'},
          // makes all src relative to cwd
          {expand: true, src: ['css/*','img/*','scripts/*'], dest: '../api/static'},
        ],
      },

    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['copy']);

};
