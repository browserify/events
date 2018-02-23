module.exports = Object.create || function objectCreatePolyfill(proto) {
  var F = function () { };
  F.prototype = proto;
  return new F;
};