var onceWrap = require('./onceWrap');

module.exports = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, onceWrap(this, type, listener));
  return this;
};