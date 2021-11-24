var test = require('tape');

// we do this to easily wrap each file in a tape test
var orig_require = require;
var require = function(file) {
    test(file, function(t) {
        // Store the tape object so tests can access it.
        // t.on('end', function () { delete common.test; });
        // common.test = t;

        try {
          var exp = orig_require(file);
          if (exp && exp.then) {
            exp.then(function () { t.end(); }, t.fail);
            return;
          }
        } catch (err) {
          t.fail(err);
        }
        t.end();
    });
};

require('./add-listeners.js');
require('./check-listener-leaks.js');
require('./listener-count.js');
require('./listeners-side-effects.js');
require('./listeners.js');
require('./max-listeners.js');
require('./modify-in-emit.js');
require('./num-args.js');
require('./once.js');
require('./set-max-listeners-side-effects.js');
require('./subclass.js');
require('./remove-all-listeners.js');
require('./remove-listeners.js');
