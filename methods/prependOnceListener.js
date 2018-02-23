var onceWrap = require('./onceWrap');

module.exports = function prependOnceListener(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.prependListener(type, onceWrap(this, type, listener));
  return this;
};