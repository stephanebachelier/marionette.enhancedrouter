'use strict';

var LazyRouter = Backbone.Router.extend({
  constructor: function (options) {
    Backbone.Router.apply(this, arguments);

    this.options = options || {};
    this._controllers = {};

    if (this.options.setup) {
      this.setup();
    }
  },

  // setup routes defined in appRoutes which enable the
  // initialization of routes after the addition of some event
  // listeners. It helps when application is started on a given
  // route
  setup: function () {
    this.processAppRoutes(this.getOption('appRoutes'));
    this.on('route', this._processOnRoute, this);
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
  // specified method on a `controller`.
  processAppRoutes: function (appRoutes) {
    if (!appRoutes) { return; }

    var routeNames = _.keys(appRoutes).reverse(); // Backbone requires reverted order of routes

    _.each(routeNames, function (route) {
      this._addAppRoute(route, appRoutes[route]);
    }, this);
  },

  _getController: function (route, resolve, reject) {
    // resolve promise if controller is present for current route
    if (this._controllers[route] && this._controllers[route].controller) {
      resolve(this._controllers[route].controller);
    }
    else {
      // record resolve and reject function for later use
      this._controllers[route] = {
        resolve: resolve,
        reject: reject
      };

      // check if catch all router exists
      if (this._controllers['*']) {
        this._controllers[route].resolve(this._controllers['*'].controller);
      }
    }
  },

  addController: function (controller, route) {
    // add catch all route
    if (route === undefined) {
      route = '*';
    }

    if (!this._controllers[route]) {
      this._controllers[route] = {
        controller: controller
      };
    }

    this._controllers[route].controller = controller;

    // resolve promise if a resolver exists
    if (this._controllers[route].resolve) {
      this._controllers[route].resolve(controller);
    }
  },

  _addAppRoute: function (route, methodName) {
    var method = function () {
      this.triggerMethod('before:route', [route].concat(arguments));

      var self = this;
      // build a promise to wait for controller being defined
      var promise = new RSVP.Promise(function (resolve, reject) {
        _.bind(self._getController, self)(route, resolve, reject);
      });

      promise.then(function (controller) {
        var handler = controller[methodName];
        if (!handler) {
          throw new Error('Method "' + methodName + '" was not found on the controller');
        }
        if (handler) {
          handler.apply(controller, arguments);
        }

        this.triggerMethod('after:route', [route].concat(arguments));
      });
    };

    this.route(route, methodName, _.bind(method, this));
  },

  // Proxy `getOption` to enable getting options from this or this.options by name.
  getOption: function (optionName) {
    return Marionette.getOption(this, optionName);
  },

  triggerMethod: Marionette.triggerMethod
});

Backbone.LazyRouter = LazyRouter;
