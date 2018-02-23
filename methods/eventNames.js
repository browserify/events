module.exports = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};