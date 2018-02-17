var test = require('tape');

require('./legacy-compat');

// we do this to easily wrap each file in a mocha test
// and also have browserify be able to statically analyze this file
var orig_require = require;
var require = function(file) {
    test(file, function(t) {
        try { orig_require(file); } catch (err) { t.fail(err); }
        t.end();
    });
};

require('./add-listeners.js');
require('./check-listener-leaks.js');
require('./errors.js');
require('./listener-count.js');
require('./listeners-side-effects.js');
require('./listeners.js');
require('./max-listeners.js');
require('./method-names.js');
require('./modify-in-emit.js');
require('./num-args.js');
require('./once.js');
require('./prepend.js');
require('./set-max-listeners-side-effects.js');
require('./subclass.js');
if (typeof Symbol === 'function') require('./symbols.js');
require('./remove-all-listeners.js');
require('./remove-listeners.js');
