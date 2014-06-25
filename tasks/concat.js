module.exports = {
  options: {
    banner: '<%= banner %>',
    stripBanners: true
  },
  dist: {
    src: '<%= concat.dist.dest %>',
    dest: 'dist/<%= pkg.name %>.js'
  }
};
