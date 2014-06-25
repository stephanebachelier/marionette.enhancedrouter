'use strict';

var LazyRouter = Backbone.Router.extend({
  constructor: function (options) {
    Backbone.Router.apply(this, arguments);

    this.options = options || {};
    this.isStarted = false;

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
    return this.getOption('controller');
  },

  _addAppRoute: function (controller, route, methodName) {
    var handler = controller[methodName];
    if (!handler) {
      throw new Error('Method "' + methodName + '" was not found on the controller');
    }

    var method = function () {
      this.triggerMethod('before:route', [route].concat(arguments));

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
  getOption: Marionette.proxyGetOption,

  triggerMethod: Marionette.triggerMethod
});

Backbone.LazyRouter = LazyRouter;
