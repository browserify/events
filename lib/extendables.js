/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true */

(typeof define !== "function" ? function($){ $(require, exports, module); } : define)(function(require, exports, module, undefined) {

"use strict";

function getOwnPropertyDescriptors(object) {
  var descriptors = {};
  Object.getOwnPropertyNames(object).forEach(function(name) {
    descriptors[name] = Object.getOwnPropertyDescriptor(object, name);
  });
  return descriptors;
}

function Constructor(base) {
  return function Extendable() {
    var value, extendable = this;
    if (!(extendable instanceof Extendable))
        extendable = Object.create(Extendable.prototype);

    value = base.apply(extendable, arguments);
    return value === undefined ? extendable : value;
  }
}
function Extendable() {
  return this instanceof Extendable ? this : Object.create(Extendable.prototype);
}

Object.defineProperties(Extendable, {
  extend: {
    value: function extend(source) {
      var constructor, descriptors = getOwnPropertyDescriptors(source);
      // If `constructor` is not defined by `source` then we generate a default
      // `constructor` that delegates to the `constructor` of the base class.
      if (typeof descriptors.constructor !== "object")
        descriptors.constructor = { value: new Constructor(this) };
      // Overriding `prototype` of the `constructor` and adding static `extend`
      // method to it.
      constructor = Object.defineProperties(descriptors.constructor.value, {
        extend: { value: extend, enumerable: true }
      });
      // TODO: Include `prototype` to the object passed to `defineProperties`
      // instead. Need to wait for bug fix in V8's behavior.
      constructor.prototype = Object.create(this.prototype, descriptors);
      return constructor;
    },
    enumerable: true
  }
});

exports.Extendable = Extendable;

});
