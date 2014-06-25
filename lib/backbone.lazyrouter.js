(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['backbone'], function (Backbone) {
      return factory(Backbone);
    });
  } else if (typeof exports !== 'undefined') {
    var Backbone = require('backbone');
    module.exports = factory(Backbone);
  } else {
    root.Backbone.LazyRouter = factory(root.Backbone);
  }

}(this, function () {
  'use strict';

  var LazyRouter = function (options) {

  };

  Backbone.LazyRouter = LazyRouter;

  return LazyRouter;
}));
