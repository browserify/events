var objectCreate = require('./objectCreate');
var spliceOne = require('./spliceOne');

module.exports = function removeListener(type, listener) {
  var list, events, position, i, originalListener;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = this._events;
  if (!events)
    return this;

  list = events[type];
  if (!list)
    return this;

  if (list === listener || list.listener === listener) {
    if (--this._eventsCount === 0)
      this._events = objectCreate(null);
    else {
      delete events[type];
      if (events.removeListener)
        this.emit('removeListener', type, list.listener || listener);
    }
  } else if (typeof list !== 'function') {
    position = -1;

    for (i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || list[i].listener === listener) {
        originalListener = list[i].listener;
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (position === 0)
      list.shift();
    else
      spliceOne(list, position);

    if (list.length === 1)
      events[type] = list[0];

    if (events.removeListener)
      this.emit('removeListener', type, originalListener || listener);
  }

  return this;
};