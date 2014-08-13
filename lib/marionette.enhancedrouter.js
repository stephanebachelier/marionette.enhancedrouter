'use strict';
// # EnhancedRouter

// This router is called EnhancedRouter because it adds logic on top of `Backbone.Router`.
// It is heavily inspired by the `Marionette.AppRouter` but it adds some interesting options:
//
// * can have multiple controllers, one for each route, or a *global* controller. The router
// can be itself a controller.
// * getting a controller is delegated to resolving a promise. The idea behind this is to have
// the ability to lazy start an application when a route handler is triggered.
var EnhancedRouter = Backbone.Router.extend({
  constructor: function (options) {
    Backbone.Router.apply(this, arguments);

    this.options = options || {};
    this._controllers = {};

    // if a controller options exists add it as a default controller
    // it will be compatible with Marionette.AppRouter
    if (this.options.controller) {
      this.addController(this.options.controller);
    }

    // call setup() unless a false `setup` property exists in options
    // most users will want this and on the contrario no error is throw
    // which may let the user think there is a bug.
    if (this.options.setup && this.options.setup === false) {
      return;
    }
    this.setup();
  },

  // ## setup
  // setup routes defined in appRoutes which enable the
  // initialization of routes after the addition of some event
  // listeners.
  setup: function () {
    this.processAppRoutes(this.getOption('appRoutes'));
    this.once('route', function () {
      // trigger a `router:start` when the first route is activated
      this.trigger('router:start', Array.prototype.splice.call(arguments, 0));
    });
    this.on('route', this._processOnRoute, this);
  },

  // ## _processOnRoute
  // process the route event and trigger the onRoute
  // method call, if it exists
  _processOnRoute: function (routeName, routeArgs) {
    // find the path that matched the route
    var routePath = _.invert(this.appRoutes)[routeName];

    // make sure an onRoute is there, and call it
    if (_.isFunction(this.onRoute)) {
      this.onRoute(routeName, routePath, routeArgs);
    }
  },

  // ## processAppRoutes
  // Internal method to process the `appRoutes` for the
  // router, and turn them in to routes that trigger the
  // specified method on a `controller`.
  processAppRoutes: function (appRoutes) {
    if (!appRoutes) { return; }

    // Backbone requires reverted order of routes
    var routeNames = _.keys(appRoutes).reverse();

    _.each(routeNames, function (route) {
      this._addAppRoute(route, appRoutes[route]);
    }, this);
  },

  // ## _getController
  // find a controller for the given `route`
  // also pass a resolve and reject function
  _getController: function (route, resolve, reject) {
    // record resolve and reject function for the given route
    this._addRouteResolver(route, resolve, reject);

    this._foo(route);
  },

  // ## addController
  // Add a `controller` to delegate the logic for the given `route`
  // or add a *global* controller by calling without giving a route
  // `router.addController(Controller)`
  addController: function (controller, route) {
    // add catch all route if needed
    route = route || '*';

    // add the `controller` under the `route` entry on `_controllers`
    if (!this._controllers[route]) {
      this._controllers[route] = {};
    }

    // add or update the current `controller` for the given `route`
    this._controllers[route].controller = controller;

    // check if any pending promises are waiting to be resolved
    this._foo(route);
  },

  _foo: function (route) {
    // resolve promise if controller is present for current route else call catchall route
    if (!this._resolveRoute(route)) {
      this._resolveCatchAllRoute();
    }
  },

  _resolveRoute: function (route) {
    // resolve promise if a resolver exists for the given `route`
    var isRouteDefined = this._isRouteDefined(route);
    if (isRouteDefined) {
      this._controllers[route].resolve(this._controllers[route].controller);
    }
    return isRouteDefined;
  },

  _resolveCatchAllRoute: function () {
    if (this._hasRouteController('*') && this.currentResolver) {
      this.currentResolver.resolve(this._controllers['*'].controller);
    }
  },

  _addRouteResolver: function (route, resolve, reject) {
    if (!this._controllers[route]) {
      this._controllers[route] = {};
    }

    this._controllers[route].resolve = resolve;
    this._controllers[route].reject = reject;

    // keep a reference on existing promise resolvers
    this.currentResolver = {
      resolve: resolve,
      reject: reject
    };
  },

  _isRouteDefined: function (route) {
    return this._hasRouteResolver(route) && this._hasRouteController(route);
  },

  _hasRouteResolver: function (route) {
    return undefined !== this._controllers[route] && undefined !== this._controllers[route].resolve;
  },

  _hasRouteController: function (route) {
    return undefined !== this._controllers[route] && undefined !== this._controllers[route].controller;
  },

  // ## _addAppRoute
  // this method is responsible for adding handlers for the given `route`.
  _addAppRoute: function (route, methodName) {
    var method = function () {
      var routeArgs = {
        route: route,
        params: arguments
      };
      // trigger the `before:route`
      this.triggerMethod('before:route', routeArgs);

      var self = this;
      // build a promise to wait for controller being defined
      var promise = new RSVP.Promise(function (resolve, reject) {
        _.bind(self._getController, self)(route, resolve, reject);
      });

      promise
        .then(function (controller) {
          // find a the method `methodName` on the `controller`.
          var handler = controller[methodName];
          if (!handler) {
            throw new Error('Method "' + methodName + '" was not found on the controller');
          }
          if (handler) {
            handler.apply(controller, routeArgs.params);
          }

          // trigger the `after:route`
          self.triggerMethod('after:route', routeArgs);
        })
        .catch(function (err) {
          self.errorHandler.call(self, err);
        });
    };

    // add a handler for the given `route`
    this.route(route, methodName, _.bind(method, this));
  },

  errorHandler: function (err) {
    console.log(err.stack);
  },

  // ## Helpers methods

  // Proxy `getOption` to enable getting options from this or this.options by name.
  getOption: function (optionName) {
    return Marionette.getOption(this, optionName);
  },

  // borrow the `triggerMethod` from Marionette
  triggerMethod: Marionette.triggerMethod
});

Backbone.EnhancedRouter = EnhancedRouter;
