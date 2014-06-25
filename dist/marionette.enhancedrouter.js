/*! marionette.enhancedrouter - v0.2.0
 *  Release on: 2014-06-25
 *  Copyright (c) 2014 Stéphane Bachelier
 *  Licensed MIT */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(["backbone"], function (backbone) {
      return (root.returnExportsGlobal = factory(backbone));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory(require("backbone"));
  } else {
    root['LazyRouter'] = factory(backbone);
  }
}(this, function (backbone) {

  'use strict';
  
  var LazyRouter = Backbone.Router.extend({
    constructor: function (options) {
      Backbone.Router.apply(this, arguments);
  
      this.options = options || {};
  
      if (this.options.setup) {
        this.setup();
      }
      this.isStarted = false;
    },
  
    // setup routes defined in appRoutes which enable the
    // initialization of routes after the addition of some event
    // listeners. It helps when application is started on a given
    // route
    setup: function () {
      var appRoutes = this.getOption('appRoutes');
      var controller = this._getController();
      this.processAppRoutes(controller, appRoutes);
      this.on('route', this._processOnRoute, this);
    },
  
    // Similar to route method on a Backbone Router but
    // method is called on the controller
    appRoute: function (route, methodName) {
      var controller = this._getController();
      this._addAppRoute(controller, route, methodName);
    },
  
    // process the route event and trigger the onRoute
    // method call, if it exists
    _processOnRoute: function (routeName, routeArgs) {
      // find the path that matched
      var routePath = _.invert(this.appRoutes)[routeName];
  
      // make sure an onRoute is there, and call it
      if (_.isFunction(this.onRoute)) {
        this.onRoute(routeName, routePath, routeArgs);
      }
    },
  
    // Internal method to process the `appRoutes` for the
    // router, and turn them in to routes that trigger the
    // specified method on the specified `controller`.
    processAppRoutes: function (controller, appRoutes) {
      if (!appRoutes) { return; }
  
      var routeNames = _.keys(appRoutes).reverse(); // Backbone requires reverted order of routes
  
      _.each(routeNames, function (route) {
        this._addAppRoute(controller, route, appRoutes[route]);
      }, this);
    },
  
    _getController: function () {
      return this.getOption('controller') || this;
    },
  
    _addAppRoute: function (controller, route, methodName) {
      var method = function () {
        this.triggerMethod('before:route', [route].concat(arguments));
  
        var controller = this._getController();
        var handler = controller[methodName];
        if (!handler) {
          throw new Error('Method "' + methodName + '" was not found on the controller');
        }
        if (handler) {
          handler.apply(controller, arguments);
        }
  
        this.triggerMethod('after:route', [route].concat(arguments));
      };
  
      this.route(route, methodName, _.bind(method, controller));
    },
  
    onBeforeRoute: function (name) {
      if (!this.isStarted) {
        this.isStarted = true;
        this.trigger('router:start', name);
      }
    },
  
    // Proxy `getOption` to enable getting options from this or this.options by name.
    getOption: function (optionName) {
      return Backbone.Marionette.getOption(this, optionName);
    },
  
    triggerMethod: Backbone.Marionette.triggerMethod
  });
  
  Backbone.LazyRouter = LazyRouter;
  

  return LazyRouter;


}));
