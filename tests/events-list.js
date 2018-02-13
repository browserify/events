'use strict';

require('./common');
var EventEmitter = require('events');
var assert = require('assert');

var EE = new EventEmitter();
var m = function() {};
EE.on('foo', function() {});
assert.deepStrictEqual(['foo'], EE.eventNames());
EE.on('bar', m);
assert.deepStrictEqual(['foo', 'bar'], EE.eventNames());
EE.removeListener('bar', m);
assert.deepStrictEqual(['foo'], EE.eventNames());

if (typeof Symbol !== 'undefined') {
  var s = Symbol('s');
  EE.on(s, m);
  assert.deepStrictEqual(['foo', s], EE.eventNames());
  EE.removeListener(s, m);
  assert.deepStrictEqual(['foo'], EE.eventNames());
}
