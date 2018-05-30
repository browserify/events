var Test = require('./test')

var main = new Test(null, { root: true }, function (t) { t.end() })
var inited = false

function tape (name, opts, fn) {
  if (!inited) {
    init()
  }
  return main.test(name, opts, fn)
}

tape.onFinish = main.onFinish.bind(main)
tape.skip = function (name, fn) {
  if (typeof name === 'function') {
    fn = name
    name = undefined
  }
  return tape(name, { skip: true }, fn)
}

function init () {
  inited = true
  console.log('TAP version 13')
  process.nextTick(function () { main.run() })
  main.on('end', function () {
    if (main._count > main._passed) process.exitCode = 1
  })
}

module.exports = tape
