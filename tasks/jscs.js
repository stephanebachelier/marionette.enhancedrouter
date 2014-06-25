module.exports = {
  options: {
    preset: 'google',
    config: '.jscs.json'
  },
  lib: ['lib/generator-jslib.js'],
  test: ['test/spec/{,*/}*.js'],
  grunt: ['Gruntfile.js', 'tasks/{,*/}*.js']
};
