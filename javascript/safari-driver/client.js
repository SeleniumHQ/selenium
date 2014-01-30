/**
 * @fileoverview A lightweight client used to establish a connection with the
 * SafariDriver when the browser is first launched.
 */

goog.provide('safaridriver.client');

goog.require('goog.Uri');
goog.require('goog.debug.DivConsole');
goog.require('goog.debug.Logger');
goog.require('safaridriver.message.Connect');


/**
 * Initializes the client.
 */
safaridriver.client.init = function() {
  var h2 = document.createElement('h2');
  h2.innerHTML = 'SafariDriver Client';
  document.body.appendChild(h2);

  var div = document.createElement('div');
  document.body.appendChild(div);

  var divConsole = new goog.debug.DivConsole(div);
  divConsole.setCapturing(true);

  var log = goog.debug.Logger.getLogger('safaridriver.client');

  var url = new goog.Uri(window.location).getQueryData().get('url');
  if (!url) {
    log.severe(
        'No url specified. Please reload this page with the url parameter set');
    return;
  }
  url = new goog.Uri(url);

  log.info('Requesting connection at ' + url + '...');
  var numAttempts = 0;
  var message = new safaridriver.message.Connect(url.toString());
  connect();

  function connect() {
    numAttempts += 1;
    var acknowledged = message.sendSync(window);
    if (acknowledged) {
      log.info('Request acknowledged; connecting...');
    } else if (numAttempts < 5) {
      var timeout = 250 * numAttempts;
      setTimeout(connect, timeout);
    } else {
      log.severe('Unable to establish a connection with the SafariDriver');
    }
  }
};
goog.exportSymbol('init', safaridriver.client.init);
