// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

require('./common');
var assert = require('assert');
var events = require('../');
var util = require('util');

function listener() {}
function listener2() {}
function TestStream() {}
util.inherits(TestStream, events.EventEmitter);

{
  var ee = new events.EventEmitter();
  ee.on('foo', listener);
  var fooListeners = ee.listeners('foo');
  assert.deepStrictEqual(ee.listeners('foo'), [listener]);
  ee.removeAllListeners('foo');
  assert.deepStrictEqual(ee.listeners('foo'), []);
  assert.deepStrictEqual(fooListeners, [listener]);
}

{
  var ee = new events.EventEmitter();
  ee.on('foo', listener);
  var eeListenersCopy = ee.listeners('foo');
  assert.deepStrictEqual(eeListenersCopy, [listener]);
  assert.deepStrictEqual(ee.listeners('foo'), [listener]);
  eeListenersCopy.push(listener2);
  assert.deepStrictEqual(ee.listeners('foo'), [listener]);
  assert.deepStrictEqual(eeListenersCopy, [listener, listener2]);
}

{
  var ee = new events.EventEmitter();
  ee.on('foo', listener);
  var eeListenersCopy = ee.listeners('foo');
  ee.on('foo', listener2);
  assert.deepStrictEqual(ee.listeners('foo'), [listener, listener2]);
  assert.deepStrictEqual(eeListenersCopy, [listener]);
}

{
  var ee = new events.EventEmitter();
  ee.once('foo', listener);
  assert.deepStrictEqual(ee.listeners('foo'), [listener]);
}

{
  var ee = new events.EventEmitter();
  ee.on('foo', listener);
  ee.once('foo', listener2);
  assert.deepStrictEqual(ee.listeners('foo'), [listener, listener2]);
}

{
  var ee = new events.EventEmitter();
  ee._events = undefined;
  assert.deepStrictEqual(ee.listeners('foo'), []);
}

{
  var s = new TestStream();
  assert.deepStrictEqual(s.listeners('foo'), []);
}
