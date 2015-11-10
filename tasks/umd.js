module.exports = {
  dist: {
    src: 'lib/<%= pkg.name %>.js',
    dest: 'dist/<%= pkg.name %>.js',
    template: 'umd',
    objectToExport: 'EnhancedRouter',
    indent: '  ',
    deps: {
      default: ['Backbone', 'Marionette', '_'],
      amd: ['backbone', 'marionette', 'underscore'],
      cjs: ['backbone', 'marionette', 'underscore'],
      global: ['backbone', 'marionette', '_']
    }
  }
};
