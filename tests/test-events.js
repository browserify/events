/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint newcap: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true */

(typeof define !== "function" ? function($){ $(require, exports, module); } : define)(function(require, exports, module, undefined) {

"use strict";

var EventEmitter = require("implementation").EventEmitter;

exports['test:add listeners'] = function(assert) {
  var e = new EventEmitter();

  var events_new_listener_emited = [];
  var times_hello_emited = 0;

  e.on("newListener", function (event, listener) {
    events_new_listener_emited.push(event);
  });

  e.on("hello", function (a, b) {
    times_hello_emited += 1;
    assert.equal("a", a, "first argument was passed");
    assert.equal("b", b, "secrond argument was passed");
    assert.equal(this, e, '`this` pseudo-variable is bound to instance');
  });

  e.emit("hello", "a", "b");
};

exports['test:remove listeners'] = function(assert) {
  var count = 0;

  function listener1 () {
    count++;
  }
  function listener2 () {
    count++;
  }
  function listener3 () {
    count++;
  }

  var e1 = new EventEmitter();
  e1.on("hello", listener1);
  assert.equal(1, e1.listeners('hello').length, "one listener is registered");
  e1.removeListener("hello", listener1);
  assert.equal(0, e1.listeners('hello').length, "only listenere was removed");

  var e2 = new EventEmitter();
  e2.on("hello", listener1);
  assert.equal(1, e2.listeners('hello').length, "one listener was registered");
  e2.removeListener("hello", listener2);
  assert.equal(1, e2.listeners('hello').length, "anther listener registered");
  assert.equal(listener1, e2.listeners('hello')[0],
               "order of registration is preserved");

  var e3 = new EventEmitter();
  e3.on("hello", listener1);
  assert.equal(1, e3.listeners('hello').length, "only one listener registered");
  e3.on("hello", listener2);
  assert.equal(2, e3.listeners('hello').length, "one more listener added");
  e3.removeListener("hello", listener1);
  assert.equal(1, e3.listeners('hello').length, "one listener is removed");
  assert.equal(listener2, e3.listeners('hello')[0], "correct listener remains");
};

exports['test: modify in emit'] = function(assert) {
  var callbacks_called = [ ];
  var e = new EventEmitter();

  function callback2() {
    callbacks_called.push("callback2");
    e.removeListener("foo", callback2);
  }
  function callback3() {
    callbacks_called.push("callback3");
    e.removeListener("foo", callback3);
  }
  function callback1() {
    callbacks_called.push("callback1");
    e.on("foo", callback2);
    e.on("foo", callback3);
    e.removeListener("foo", callback1);
  }
  
  e.on("foo", callback1);
  assert.equal(1, e.listeners("foo").length, "one listener is registered");

  e.emit("foo");
  assert.equal(2, e.listeners("foo").length,
               "listener registered additional listener");
  assert.equal(1, callbacks_called.length, "listener was called only 1 time");
  assert.equal('callback1', callbacks_called[0],
               "callback1 listener was called");

  e.emit("foo");
  assert.equal(0, e.listeners("foo").length, "listeners removed themself");
  assert.equal(3, callbacks_called.length, "all of the listeners were called");
  assert.equal('callback1', callbacks_called[0],
               "callback1 was called first");
  assert.equal('callback2', callbacks_called[1],
               "callback2 was called second");
  assert.equal('callback3', callbacks_called[2],
               "callback3 was called third");

  e.emit("foo");
  assert.equal(0, e.listeners("foo").length, "no listener are registered");
  assert.equal(3, callbacks_called.length, "no listeners were called");
  assert.equal('callback1', callbacks_called[0], "callback1 is still #1");
  assert.equal('callback2', callbacks_called[1], "callback2 is still #2");
  assert.equal('callback3', callbacks_called[2], "callback3 is still #3");

  e.on("foo", callback1);
  e.on("foo", callback2);
  assert.equal(2, e.listeners("foo").length, "two listeners were added");
  e.removeAllListeners("foo");
  assert.equal(0, e.listeners("foo").length, "all listeners were removed");

  // Verify that removing callbacks while in emit allows emits to propagate to
  // all listeners
  callbacks_called = [ ];

  e.on("foo", callback2);
  e.on("foo", callback3);
  assert.equal(2, e.listeners("foo").length, "two liseners were added");
  e.emit("foo");
  assert.equal(2, callbacks_called.length, "two listeners were called");
  assert.equal('callback2', callbacks_called[0], "callback2 was called 1st");
  assert.equal('callback3', callbacks_called[1], "callback3 was called 2nd");
  assert.equal(0, e.listeners("foo").length, "listeners romeved themselfs");
};

exports['test:adding same listener'] = function(assert) {
  function foo() {}
  var e = new EventEmitter();
  e.on("foo", foo);
  e.on("foo", foo);
  assert.equal(
    1,
    e.listeners("foo").length,
    "listener reregistration is ignored"
 );
};

exports['test:errors are reported if listener throws'] = function(assert) {
  var e = new EventEmitter(),
      reported = false;
  e.on('error', function(e) { reported = true; });
  e.on('boom', function() { throw new Error('Boom!'); });
  e.emit('boom', 3);
  assert.ok(reported, 'error should be reported through event');
};

exports['test:once'] = function(assert) {
  var e = new EventEmitter();
  var called = false;

  e.once('foo', function(value) {
    assert.ok(!called, "listener called only once");
    assert.equal(value, "bar", "correct argument was passed");
  });

  e.emit('foo', 'bar');
  e.emit('foo', 'baz');
};

require("test").run(exports);

});
