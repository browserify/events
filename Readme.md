# events #

Node's event emitter for all engines.

## Install ##

    npm install events

## Require ##

    var EventEmitter = require('https!raw.github.com/Gozala/events/v0.2.0/events.js').EventEmitter

## Usage ##

    var EventEmitter = require('https!raw.github.com/Gozala/events/v0.2.0/events.js').EventEmitter
    var Foo = EventEmitter.extend({
      name: 'foo'
    })
    var foo = new Foo()
    foo.on('test', function() {
      console.log(foo.name)
    })
    foo.emit('test')
