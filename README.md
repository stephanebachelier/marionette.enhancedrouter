# backbone.lazyrouter

[![Build Status](https://secure.travis-ci.org/stephanebachelier/backbone.lazyrouter.png?branch=master)](http://travis-ci.org/stephanebachelier/backbone.lazyrouter)

A Backbone extended Router with lazy load logic

This main router usage is to setup a Router to register all your routes, but to defer the logic.

It might help you if :
 - you want to have multiple routers attached, each one used for one or more routes. Only one controller will respond to a given route.
 - the router will wait for a controller to be defined when a route is triggered.


TODO:
 - documentation
 - tests

This is already used in some projects but use at your own risks!
