var Airtap = require('airtap');
var fs = require('fs');
var clientPath = require.resolve('airtap/client/tape');
var clientSrc = fs.readFileSync(clientPath);

var oldTapeSrc = function () {
  var Reporter = require('./reporter')

  if (typeof global.console === 'undefined') {
    global.console = {}
  }

  var reporter = Reporter()
  var previousTest
  var assertions = 0
  var done = false
  var noMoreTests = false

  var parseStream = parser()

  function onfinish () {
    done = true
    reporter.done()
  }

  var originalLog = global.console.log
  global.console.log = function () {
    var msg = arguments[0]

    var m
    if ((m = /^(not )?ok (\d+) (.*?)$/.exec(msg))) {
      onassert({
        ok: m[1] === undefined,
        id: parseInt(m[2], 10),
        name: m[3]
      })
    } else if ((m = /^# (.*?)$/.exec(msg))) {
      oncomment(m[1])
    } else if ((m = /^(\d+)\.\.(\d+)$/.exec(msg))) {
      onplan()
    }

    // transfer log to original console,
    // this shows the tap output in console
    // and also let the user add console logs
    if (typeof originalLog === 'function') {
      return originalLog.apply(this, arguments)
    }
  }

  function oncomment (comment) {
    // if we received 'plan' then no need to go further
    if (noMoreTests) {
      return
    }

    endPreviousTestIfNeeded()

    previousTest = {
      name: comment
    }

    assertions = 0

    reporter.test({
      name: comment
    })
  }

  function onassert (assert) {
    if (!assert.ok) {
      assertions++
    }

    reporter.assertion({
      result: assert.ok,
      expected: undefined,
      actual: undefined,
      message: assert.name || 'unnamed assert',
      error: undefined,
      stack: undefined
    })
  }

  function onplan (plan) {
    // starting here, we know the full tape suite is finished
    endPreviousTestIfNeeded()
    noMoreTests = true
    onfinish()
  }

  function endPreviousTestIfNeeded () {
    if (previousTest) {
      reporter.test_end({
        passed: assertions === 0,
        name: previousTest.name
      })
    }
  }
};

process.on('exit', revert);
function revert () {
  fs.writeFileSync(clientPath, clientSrc);
}
fs.writeFileSync(clientPath, '(' + oldTapeSrc + ')();');

var airtap = Airtap({
  files: ['./tests/index.js'],
  sauce_connect: true,
  loopback: 'airtap.local',
  browsers: [
    { name: 'ie', version: '8..latest' }
  ],
  prj_dir: process.cwd()
});

airtap.browser({
  name: 'internet explorer',
  version: 8,
  platform: 'Windows 2008'
})

// Below copied from airtap/bin

var passedTestsCount = 0
var failedBrowsersCount = 0
var lastOutputName

airtap.on('browser', function (browser) {
  var name = browser.toString()
  var waitInterval

  browser.once('init', function () {
    console.log(` - queuing: ${name}`)
  })

  browser.on('start', function (reporter) {
    console.log(`- starting: ${name}`)

    clearInterval(waitInterval)
    waitInterval = setInterval(function () {
      console.log(`- waiting: ${name}`)
    }, 1000 * 30)

    var currentTest
    reporter.on('test', function (test) {
      currentTest = test
    })

    reporter.on('console', function (msg) {
      if (lastOutputName !== name) {
        lastOutputName = name
        console.log(`${name} console`)
      }

      // When testing with microsoft edge:
      // Adds length property to array-like object if not defined to execute console.log properly
      if (msg.args.length === undefined) {
        msg.args.length = Object.keys(msg.args).length
      }
      console.log.apply(console, msg.args)
    })

    reporter.on('assertion', function (assertion) {
      console.log()
      console.log(`${name} ${currentTest ? currentTest.name : 'undefined test'}`)
      console.log(`Error: ${assertion.message}`)

      // When testing with microsoft edge:
      // Adds length property to array-like object if not defined to execute forEach properly
      if (assertion.frames.length === undefined) {
        assertion.frames.length = Object.keys(assertion.frames).length
      }
      Array.prototype.forEach.call(assertion.frames, function (frame) {
        console.log()
        console.log(`${frame.func} ${frame.filename}:${frame.line}`)
      })
      console.log()
    })

    reporter.once('done', function () {
      clearInterval(waitInterval)
    })
  })

  browser.once('done', function (results) {
    passedTestsCount += results.passed

    if (results.failed > 0 || results.passed === 0) {
      console.log(`- failed: ${name}, (${results.failed}, ${results.passed})`)
      failedBrowsersCount++
      return
    }
    console.log(`- passed: ${name}`)
  })
})

airtap.on('restart', function (browser) {
  var name = browser.toString()
  console.log(`- restarting: ${name}`)
})

airtap.on('error', function (err) {
  throw err
})

airtap.run(function (err, passed) {
  if (err) throw err

  if (failedBrowsersCount > 0) {
    console.log(`${failedBrowsersCount} browser(s) failed`)
  } else if (passedTestsCount === 0) {
    console.log('No tests ran')
  } else {
    console.log('All browsers passed')
  }

  process.exit((passedTestsCount > 0 && failedBrowsersCount === 0) ? 0 : 1)
})
