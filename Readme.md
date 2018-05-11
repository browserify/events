# Status: [Maintainer Needed](https://github.com/Gozala/events/issues/43)

# events [![Build Status](https://travis-ci.org/Gozala/events.png?branch=master)](https://travis-ci.org/Gozala/events)

Node's event emitter for all engines.

## Install

```
npm install events
```

## Usage

```javascript
var EventEmitter = require('events')
```

Note that the `events` module uses ES5 features. If you need to support very old browsers like IE8, use a shim like [`es5-shim`](https://www.npmjs.com/package/es5-shim). You need both the shim and the sham versions of `es5-shim`.

## API

See the [Node.js EventEmitter docs](http://nodejs.org/api/events.html). `events` currently matches the Node.js 10.1 API.

## License

[MIT](./LICENSE)
