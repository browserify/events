'use strict';
var common = require('./common');
var assert = require('assert');
var EventEmitter = require('../').EventEmitter;
var captureRejectionSymbol = require('../').captureRejectionSymbol;
var inherits = require('util').inherits;
var hasSymbols = require('has-symbols');

var majorVersion = parseInt(process.version.split('.')[0].replace(/^v/, ''), 10);
var hasGlobalUnhandledRejectionHandler = majorVersion >= 1;

var resolve;
var p = new Promise(function (_resolve) {
  resolve = _resolve;
});

// Inherits from EE without a call to the
// parent constructor.
function NoConstructor() {
}

inherits(NoConstructor, EventEmitter);

function captureRejections() {
  var ee = new EventEmitter({ captureRejections: true });
  var _err = new Error('kaboom');
  ee.on('something', common.mustCall(function (value) {
    return Promise.reject(_err);
  }));
  ee.on('error', common.mustCall(function (err) {
    assert.strictEqual(err, _err);
    process.nextTick(captureRejectionsTwoHandlers);
  }));
  ee.emit('something');
}

function captureRejectionsTwoHandlers() {
  var ee = new EventEmitter({ captureRejections: true });
  var _err = new Error('kaboom');

  ee.on('something', common.mustCall(function (value) {
    return Promise.reject(_err);
  }));
  ee.on('something', common.mustCall(function (value) {
    return Promise.reject(_err);
  }));

  var count = 0;
  ee.on('error', common.mustCall(function (err) {
    assert.strictEqual(err, _err);
    if (++count === 2) {
      process.nextTick(defaultValue);
    }
  }, 2));

  ee.emit('something');
}

function defaultValue() {
  // Browsers treat unhandled rejections differently from Node.js,
  // so we cannot test the Node.js behaviour there.
  if (process.browser || !hasGlobalUnhandledRejectionHandler) {
    process.nextTick(globalSetting);
    return;
  }

  var ee = new EventEmitter();
  var _err = new Error('kaboom');
  ee.on('something', common.mustCall(function (value) {
    return Promise.reject(_err);
  }));

  process.removeAllListeners('unhandledRejection');

  process.once('unhandledRejection', common.mustCall(function (err) {
    // restore default
    process.on('unhandledRejection', function (err) { throw err; });

    assert.strictEqual(err, _err);
    process.nextTick(globalSetting);
  }));

  ee.emit('something');
}

function globalSetting() {
  assert.strictEqual(EventEmitter.captureRejections, false);
  EventEmitter.captureRejections = true;
  var ee = new EventEmitter();
  var _err = new Error('kaboom');
  ee.on('something', common.mustCall(function (value) {
    return Promise.reject(_err);
  }));

  ee.on('error', common.mustCall(function (err) {
    assert.strictEqual(err, _err);

    // restore default
    EventEmitter.captureRejections = false;
    process.nextTick(configurable);
  }));

  ee.emit('something');
}

// We need to be able to configure this for streams, as we would
// like to call destro(err) there.
function configurable() {
  var ee = new EventEmitter({ captureRejections: true });
  var _err = new Error('kaboom');
  ee.on('something', common.mustCall(function (a, b) {
    assert.strictEqual(a, 42);
    assert.strictEqual(b, 'foobar');
    return Promise.reject(_err);
  }));

  if (hasSymbols()) {
    assert.strictEqual(captureRejectionSymbol, Symbol.for('nodejs.rejection'));
  }

  ee[captureRejectionSymbol] = common.mustCall(function (err, type, a, b) {
    assert.strictEqual(err, _err);
    assert.strictEqual(type, 'something');
    assert.strictEqual(a, 42);
    assert.strictEqual(b, 'foobar');
    process.nextTick(globalSettingNoConstructor);
  });

  ee.emit('something', 42, 'foobar');
}

function globalSettingNoConstructor() {
  assert.strictEqual(EventEmitter.captureRejections, false);
  EventEmitter.captureRejections = true;
  var ee = new NoConstructor();
  var _err = new Error('kaboom');
  ee.on('something', common.mustCall(function (value) {
    return Promise.reject(_err);
  }));

  ee.on('error', common.mustCall(function (err) {
    assert.strictEqual(err, _err);

    // restore default
    EventEmitter.captureRejections = false;
    process.nextTick(thenable);
  }));

  ee.emit('something');
}

function thenable() {
  var ee = new EventEmitter({ captureRejections: true });
  var _err = new Error('kaboom');
  ee.on('something', common.mustCall(function (value) {
    var obj = {};

    Object.defineProperty(obj, 'then', {
      get: common.mustCall(function () {
        return common.mustCall(function (resolved, rejected) {
          assert.strictEqual(resolved, undefined);
          rejected(_err);
        });
      }, 1) // Only 1 call for Promises/A+ compat.
    });

    return obj;
  }));

  ee.on('error', common.mustCall(function (err) {
    assert.strictEqual(err, _err);
    process.nextTick(avoidLoopOnRejection);
  }));

  ee.emit('something');
}

function avoidLoopOnRejection() {
  // Browsers treat unhandled rejections differently from Node.js,
  // so we cannot test the Node.js behaviour there.
  if (process.browser || !hasGlobalUnhandledRejectionHandler) {
    process.nextTick(avoidLoopOnError);
    return;
  }

  var ee = new EventEmitter({ captureRejections: true });
  var _err1 = new Error('kaboom');
  var _err2 = new Error('kaboom2');
  ee.on('something', common.mustCall(function (value) {
    return Promise.reject(_err1);
  }));

  ee[captureRejectionSymbol] = common.mustCall(function (err) {
    assert.strictEqual(err, _err1);
    return Promise.reject(_err2);
  });

  process.removeAllListeners('unhandledRejection');

  process.once('unhandledRejection', common.mustCall(function (err) {
    // restore default
    process.on('unhandledRejection', function (err) { throw err; });

    assert.strictEqual(err, _err2);
    process.nextTick(avoidLoopOnError);
  }));

  ee.emit('something');
}

function avoidLoopOnError() {
  // Browsers treat unhandled rejections differently from Node.js,
  // so we cannot test the Node.js behaviour there.
  if (process.browser || !hasGlobalUnhandledRejectionHandler) {
    process.nextTick(thenableThatThrows);
    return;
  }

  var ee = new EventEmitter({ captureRejections: true });
  var _err1 = new Error('kaboom');
  var _err2 = new Error('kaboom2');
  ee.on('something', common.mustCall(function (value) {
    return Promise.reject(_err1);
  }));

  ee.on('error', common.mustCall(function (err) {
    assert.strictEqual(err, _err1);
    return Promise.reject(_err2);
  }));

  process.removeAllListeners('unhandledRejection');

  process.once('unhandledRejection', common.mustCall(function (err) {
    // restore default
    process.on('unhandledRejection', function (err) { throw err; });

    assert.strictEqual(err, _err2);
    process.nextTick(thenableThatThrows);
  }));

  ee.emit('something');
}

function thenableThatThrows() {
  var ee = new EventEmitter({ captureRejections: true });
  var _err = new Error('kaboom');
  ee.on('something', common.mustCall(function (value) {
    var obj = {};

    Object.defineProperty(obj, 'then', {
      get: common.mustCall(function () {
        throw _err;
      }, 1) // Only 1 call for Promises/A+ compat.
    });

    return obj;
  }));

  ee.on('error', common.mustCall(function (err) {
    assert.strictEqual(err, _err);
    process.nextTick(resetCaptureOnThrowInError);
  }));

  ee.emit('something');
}

function resetCaptureOnThrowInError() {
  // Browsers treat unhandled rejections differently from Node.js,
  // so we cannot test the Node.js behaviour there.
  if (process.browser || !hasGlobalUnhandledRejectionHandler) {
    process.nextTick(argValidation);
    return;
  }

  var ee = new EventEmitter({ captureRejections: true });
  ee.on('something', common.mustCall(function (value) {
    return Promise.reject(new Error('kaboom'));
  }));

  ee.once('error', common.mustCall(function (err) {
    throw err;
  }));

  process.removeAllListeners('uncaughtException');

  process.once('uncaughtException', common.mustCall(function (err) {
    process.nextTick(next);
  }));

  ee.emit('something');

  function next() {
    process.on('uncaughtException', common.mustNotCall());

    var _err = new Error('kaboom2');
    ee.on('something2', common.mustCall(function (value) {
      return Promise.reject(_err);
    }));

    ee.on('error', common.mustCall(function (err) {
      assert.strictEqual(err, _err);

      process.removeAllListeners('uncaughtException');

      // restore default
      process.on('uncaughtException', function (err) { throw err; });

      process.nextTick(argValidation);
    }));

    ee.emit('something2');
  }
}

function argValidation() {
  resolve();
}

captureRejections();

module.exports = p;
