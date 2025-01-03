window.workerTimers = (function() {
  const global = window;
  var TIMER_WORKER_SOURCE = [
    "var timerIds = {}, animationFrameIds = {}, _ = {};",
    "_.setInterval = function(args) {",
    "  timerIds[args.timerId] = setInterval(function() { postMessage(args.timerId); }, args.delay);",
    "};",
    "_.clearInterval = function(args) {",
    "  clearInterval(timerIds[args.timerId]);",
    "};",
    "_.setTimeout = function(args) {",
    "  timerIds[args.timerId] = setTimeout(function() { postMessage(args.timerId); }, args.delay);",
    "};",
    "_.clearTimeout = function(args) {",
    "  clearTimeout(timerIds[args.timerId]);",
    "};",
    "_.requestAnimationFrame = function(args) {",
    "  animationFrameIds[args.timerId] = requestAnimationFrame(function() { postMessage(args.timerId); });",
    "};",
    "_.cancelAnimationFrame = function(args) {",
    "  cancelAnimationFrame(animationFrameIds[args.timerId]);",
    "};",
    "onmessage = function(e) { _[e.data.type](e.data) };"
  ].join("");

  var _timerId = 0;
  var _callbacks = {};
  var _timer = new global.Worker(global.URL.createObjectURL(
    new global.Blob([ TIMER_WORKER_SOURCE ], { type: "text/javascript" })
  ));

  _timer.onmessage = function(e) {
    if (_callbacks[e.data]) {
      _callbacks[e.data].callback.apply(null, _callbacks[e.data].params);
    }
  };

  return {
    setInterval: function(callback, delay) {
      var params = Array.prototype.slice.call(arguments, 2);

      _timerId += 1;

      _timer.postMessage({ type: "setInterval", timerId: _timerId, delay: delay });
      _callbacks[_timerId] = { callback: callback, params: params };

      return _timerId;
    },
    setTimeout: function(callback, delay) {
      var params = Array.prototype.slice.call(arguments, 2);

      _timerId += 1;

      _timer.postMessage({ type: "setTimeout", timerId: _timerId, delay: delay });
      _callbacks[_timerId] = { callback: callback, params: params };

      return _timerId;
    },
    clearInterval: function(timerId) {
      _timer.postMessage({ type: "clearInterval", timerId: timerId });
      _callbacks[timerId] = null;
    },
    clearTimeout: function(timerId) {
      _timer.postMessage({ type: "clearTimeout", timerId: timerId });
      _callbacks[timerId] = null;
    },
    requestAnimationFrame: function(callback) {
      var params = Array.prototype.slice.call(arguments, 1);

      _timerId += 1;

      _timer.postMessage({ type: "requestAnimationFrame", timerId: _timerId });
      _callbacks[_timerId] = { callback: callback, params: params };

      return _timerId;
    },
    cancelAnimationFrame: function(timerId) {
      _timer.postMessage({ type: "cancelAnimationFrame", timerId: timerId });
      _callbacks[timerId] = null;
    }
  };
})();
