module.exports = {
  dist: {
    src: 'lib/<%= pkg.name %>.js',
    dest: 'dist/<%= pkg.name %>.js',
    template: 'umd',
    objectToExport: 'LazyRouter',
    indent: '  ',
    deps: {
      default: ['Backbone', 'Marionette'],
      amd: ['backbone', 'marionette'],
      cjs: ['backbone', 'marionette'],
      global: ['backbone', 'marionette']
    }
  }
};
