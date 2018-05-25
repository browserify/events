// sigh... life is hard
if (!global.console) {
    console = {}
}

var fns = ['log', 'error', 'trace'];
for (var i=0 ; i<fns.length ; ++i) {
    var fn = fns[i];
    if (!console[fn]) {
        console[fn] = function() {};
    }
}

if (!Array.isArray) {
    Array.isArray = require('isarray');
}

if (typeof navigator === 'object' && navigator.userAgent.indexOf('MSIE8.0') !== -1) {
    require('es5-shim');
    require('es5-shim/es5-sham');
}
