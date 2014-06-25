module.exports = {
  options: {
    editorconfig: '.editorconfig'
  },
  gruntfile: {
    src: ['Gruntfile.js', 'tasks/{,*/}*.js']
  },
  lib: {
    src: ['/scripts/**/*.js']
  },
  test: {
    src: ['test/spec/**/*.js']
  }
};
