module.exports = {
  dist: {
    src: 'lib/<%= pkg.name %>.js',
    dest: 'dist/<%= pkg.name %>.js',
    template: 'umd',
    objectToExport: 'EnhancedRouter',
    indent: '  ',
    deps: {
      default: ['Backbone', 'Marionette', '_', 'RSVP'],
      amd: ['backbone', 'marionette', 'underscore', 'rsvp'],
      cjs: ['backbone', 'marionette', 'underscore', 'rsvp'],
      global: ['backbone', 'marionette', '_', 'RSVP']
    }
  }
};
