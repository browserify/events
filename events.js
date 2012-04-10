/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint newcap: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true */
(typeof define !== "function" ? function($){ $(require, exports, module); } : define)(function(require, exports, module, undefined) {

"use strict";

var Extendable = require('raw.github.com/Gozala/extendables/v0.2.0/extendables').Extendable;
var isArray = Array.isArray;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var MAX_LISTENERS = 10;
var ERROR_TYEPE = 'error';

exports.version = "0.2.0";
exports.EventEmitter = Extendable.extend({
  setMaxListeners: function setMaxListeners(n) {
    if (!this._events) this._events = {};
    this._events.maxListeners = n;
  },
  emit: function emit(type) {
    var args = Array.prototype.slice.call(arguments, 1);
    var listeners = this.listeners(type);
    if (type === ERROR_TYEPE && !listeners.length)
      console.error(args[0]);

    listeners.forEach(function(listener) {
      try {
        listener.apply(this, args);
      } catch (error) {
        // We emit `error` event if listener threw an exception. If there are
        // no listeners for `error` events or if listener for `error` event
        // threw then we dump error directly to the console.
        if (type !== ERROR_TYEPE && this.listeners(ERROR_TYEPE).length)
          this.emit(ERROR_TYEPE, error);
        else
          console.error(error);
      }
    }, this);
  },
  on: function on(type, listener) {
    if (!this._events)
      this._events = {};

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    var events = this._events[type];
    if (!events) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;

    // If listener is an array and if listener is not registered yet.
    } else if (isArray(events) && !~events.indexOf(listener)) {

      // Check for listener leak
      if (!events.warned) {
        var m = events.maxListeners !== undefined ? events.maxListeners :
                MAX_LISTENERS;

        if (m && m > 0 && events.length > m) {
          events.warned = true;
          console.error('warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
        }
      }

      events.push(listener);

    // If it's not the same listener adding it
    } else if (events !== listener) {
      // Adding the second element, need to change to array.
      this._events[type] = [events, listener];
    }

    return this;
  },
  once: function once(type, listener) {
    var self = this;
    function g() {
      self.removeListener(type, g);
      listener.apply(self, arguments);
    }

    g.listener = listener;
    self.on(type, g);
    return this;
  },
  removeListener: function removeListener(type, listener) {
    if ('function' !== typeof listener) {
      throw new Error('removeListener only takes instances of Function');
    }

    // does not use listeners(), so no side effect of creating _events[type]
    if (!this._events || !this._events[type]) return this;

    var list = this._events[type];

    if (isArray(list)) {
      var position = -1;
      for (var i = 0, length = list.length; i < length; i++) {
        if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener))
        {
          position = i;
          break;
        }
      }

      if (position < 0) return this;
      list.splice(position, 1);
      if (list.length === 0)
        delete this._events[type];
    } else if (list === listener ||
               (list.listener && list.listener === listener))
    {
      delete this._events[type];
    }

    return this;
  },
  removeAllListeners: function removeAllListeners(type) {
    // does not use listeners(), so no side effect of creating _events[type]
    if (type && this._events && this._events[type]) this._events[type] = null;
    return this;
  },
  listeners: function listeners(type) {
    if (!this._events) this._events = {};
    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type].slice(0);
  }
});

});
