
function noop() {};

var DummyLogger = function() {};
DummyLogger.prototype = {
    show: noop,
    log: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    exception: noop
};

var LOG = new DummyLogger();