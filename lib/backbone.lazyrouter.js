'use strict';

var LazyRouter = Backbone.Router.extend({
  constructor: function (options) {
    Backbone.Router.prototype.constructor.apply(this, arguments);

    this.options = options || {};
    this.controller = options ? options.controller : null;

    this.isStarted = false;

    var appRoutes = this.appRoutes || this.options.appRoutes || {};
    this.processAppRoutes(appRoutes);
    this.on('route', this._processOnRoute, this);
  },

  processAppRoutes: function (appRoutes) {
    if (!appRoutes) {
      return;
    }

    var routeNames = _.keys(appRoutes).reverse(); // Backbone requires reverted order of routes

    _.each(routeNames, function (route) {
      this._addAppRoute(route, appRoutes[route]);
    }, this);
  },

  _addAppRoute: function (route, methodName) {
    var method = function () {
      this.onBeforeRoute([route].concat(arguments));

      var controller = this.controller || this;
      var method = controller[methodName];

      if (method) {
        method.apply(controller, arguments);
      }
    };
    this.route(route, methodName, _.bind(method, this));
  },

  // process the route event and trigger the onRoute
  // method call, if it exists
  _processOnRoute: function (routeName, routeArgs) {
    // find the path that matched
    var routePath = _.invert(this.appRoutes)[routeName];

    // make sure an onRoute is there, and call it
    if (_.isFunction(this.onRoute)){
      this.onRoute(routeName, routePath, routeArgs);
    }

    this.onAfterRoute(routeName, routePath, routeArgs);
  },

  lazyStartup: function () {
    // to override
  },

  onBeforeRoute: function (routeName) {
    if (!this.isStarted) {
      this.isStarted = true;
      this.lazyStartup();
    }

    this.trigger('route:on:before', routeName);
  },

  onAfterRoute: function (routeName, routePath, routeArgs) {
    this.trigger('route:on:after', routeName, routePath, routeArgs);
  }
});

Backbone.LazyRouter = LazyRouter;
