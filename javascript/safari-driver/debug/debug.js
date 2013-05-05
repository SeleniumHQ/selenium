goog.provide('safaridriver.debug');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('safaridriver.console');
goog.require('safaridriver.message.Log');
goog.require('safaridriver.message.MessageTarget');
goog.require('webdriver.logging');


/**
 * @private {!goog.debug.Logger}
 * @const
 */
safaridriver.debug.LOG_ = goog.debug.Logger.getLogger('safaridriver.debug');


/**
 * Initializes the debug log window.
 */
safaridriver.debug.init = function() {
  safaridriver.console.init();

  var messageTarget = new safaridriver.message.MessageTarget(safari.self).
      on(safaridriver.message.Log.TYPE, safaridriver.debug.onLogEntry_);
  messageTarget.setLogger(safaridriver.debug.LOG_);
};


/**
 * @param {number} ms A timestamp, in milliseconds.
 * @return {string} The formatted timestamp.
 * @private
 */
safaridriver.debug.formatTimeStamp_ = function(ms) {
  var time = new Date(ms);
  return pad(time.getHours()) + ':' +
         pad(time.getMinutes()) + ':' +
         pad(time.getSeconds()) + '.' +
         pad(Math.floor(time.getMilliseconds() / 10));

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }
};


/**
 * @param {!safaridriver.message.Log} message The log message.
 * @private
 */
safaridriver.debug.onLogEntry_ = function(message) {
  var log = goog.dom.getElement('log');
  message.getEntries().forEach(function(entry) {
    var content =
        safaridriver.debug.formatTimeStamp_(entry.timestamp) +
        ' ' + entry.message.replace('<', '&lt;').replace('>', '&gt;');

    var className = ['msg'];
    switch (entry.level) {
      case webdriver.logging.Level.DEBUG:
        className.push('debug');
        break;
      case webdriver.logging.Level.WARNING:
        className.push('warning');
        break;
      case webdriver.logging.Level.SEVERE:
        className.push('severe');
        break;
    }

    if (entry.type === webdriver.logging.Type.BROWSER) {
      className.push('browser');
    }

    var div = goog.dom.createDom(
        goog.dom.TagName.DIV, className.join(' '),
        goog.dom.createDom(goog.dom.TagName.PRE, null, content));
    goog.dom.appendChild(log, div);
  });
};
