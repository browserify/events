module.exports = function (EventEmitter) {
  return function getMaxListeners(that) {
    that = that || EventEmitter
    if (that._maxListeners === undefined)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }
}