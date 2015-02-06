module.exports = function(grunt) {

  grunt.initConfig({
    copy : {
      main: {
        files: [
          // includes files within path and its sub-directories
          {expand: true, src: ['average.html','radar.html','main.html'], dest: '../webapp/templates'},
          // makes all src relative to cwd
          {expand: true, src: ['static/**/*'], dest: '../webapp/'},
        ],
      },

    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['copy']);

};
