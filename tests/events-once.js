'use strict';

var common = require('./common');
var EventEmitter = require('../').EventEmitter;
var once = require('../').once;
var has = require('has');
var assert = require('assert');

function EventTargetMock() {
  this.events = {};

  this.addEventListener = common.mustCall(this.addEventListener);
  this.removeEventListener = common.mustCall(this.removeEventListener);
}

EventTargetMock.prototype.addEventListener = function (name, listener, options) {
  if (!(name in this.events)) {
    this.events[name] = { listeners: [], options: options || {} }
  }
  this.events[name].listeners.push(listener);
};

EventTargetMock.prototype.removeEventListener = function (name, callback) {
  if (!(name in this.events)) {
    return;
  }
  var event = this.events[name];
  var stack = event.listeners;

  for (var i = 0, l = stack.length; i < l; i++) {
    if (stack[i] === callback) {
      stack.splice(i, 1);
      if (stack.length === 0) {
        delete this.events[name];
      }
      return;
    }
  }
};

EventTargetMock.prototype.dispatchEvent = function (name) {
  if (!(name in this.events)) {
    return true;
  }

  var arg = [].slice.call(arguments, 1);

  var event = this.events[name];
  var stack = event.listeners.slice();

  for (var i = 0, l = stack.length; i < l; i++) {
    stack[i].apply(null, arg);
    if (event.options.once) {
      this.removeEventListener(name, stack[i]);
    }
  }
  return !name.defaultPrevented;
};

function onceAnEvent() {
  var ee = new EventEmitter();

  process.nextTick(function () {
    ee.emit('myevent', 42);
  });

  return once(ee, 'myevent').then(function (args) {
    var value = args[0]
    assert.strictEqual(value, 42);
    assert.strictEqual(ee.listenerCount('error'), 0);
    assert.strictEqual(ee.listenerCount('myevent'), 0);
  });
}

function onceAnEventWithTwoArgs() {
  var ee = new EventEmitter();

  process.nextTick(function () {
    ee.emit('myevent', 42, 24);
  });

  return once(ee, 'myevent').then(function (value) {
    assert.strictEqual(value.length, 2);
    assert.strictEqual(value[0], 42);
    assert.strictEqual(value[1], 24);
  });
}

function catchesErrors() {
  var ee = new EventEmitter();

  var expected = new Error('kaboom');
  var err;
  process.nextTick(function () {
    ee.emit('error', expected);
  });

  return once(ee, 'myevent').then(function () {
    throw new Error('should reject')
  }, function (err) {
    assert.strictEqual(err, expected);
    assert.strictEqual(ee.listenerCount('error'), 0);
    assert.strictEqual(ee.listenerCount('myevent'), 0);
  });
}

function stopListeningAfterCatchingError() {
  var ee = new EventEmitter();

  var expected = new Error('kaboom');
  var err;
  process.nextTick(function () {
    ee.emit('error', expected);
    ee.emit('myevent', 42, 24);
  });

  // process.on('multipleResolves', common.mustNotCall());

  return once(ee, 'myevent').then(common.mustNotCall, function (err) {
    // process.removeAllListeners('multipleResolves');
    assert.strictEqual(err, expected);
    assert.strictEqual(ee.listenerCount('error'), 0);
    assert.strictEqual(ee.listenerCount('myevent'), 0);
  });
}

function onceError() {
  var ee = new EventEmitter();

  var expected = new Error('kaboom');
  process.nextTick(function () {
    ee.emit('error', expected);
  });

  return once(ee, 'error').then(function (args) {
    var err = args[0]
    assert.strictEqual(err, expected);
    assert.strictEqual(ee.listenerCount('error'), 0);
    assert.strictEqual(ee.listenerCount('myevent'), 0);
  });
}

function onceWithEventTarget() {
  var et = new EventTargetMock();
  process.nextTick(function () {
    et.dispatchEvent('myevent', 42);
  });
  return once(et, 'myevent').then(function (args) {
    var value = args[0];
    assert.strictEqual(value, 42);
    assert.strictEqual(has(et.events, 'myevent'), false);
  });
}

function onceWithEventTargetTwoArgs() {
  var et = new EventTargetMock();
  process.nextTick(function () {
    et.dispatchEvent('myevent', 42, 24);
  });
  return once(et, 'myevent').then(function (value) {
    assert.deepStrictEqual(value, [42, 24]);
  });
}

function onceWithEventTargetError() {
  var et = new EventTargetMock();
  var expected = new Error('kaboom');
  process.nextTick(function () {
    et.dispatchEvent('error', expected);
  });
  return once(et, 'error').then(function (args) {
    var error = args[0];
    assert.deepStrictEqual(error, expected);
    assert.strictEqual(has(et.events, 'error'), false);
  });
}

module.exports = Promise.all([
  onceAnEvent(),
  onceAnEventWithTwoArgs(),
  catchesErrors(),
  stopListeningAfterCatchingError(),
  onceError(),
  onceWithEventTarget(),
  onceWithEventTargetTwoArgs(),
  onceWithEventTargetError()
]);
