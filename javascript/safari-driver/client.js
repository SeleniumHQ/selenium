/**
 * @fileoverview A lightweight client used to establish a connection with the
 * SafariDriver when the browser is first launched.
 */

goog.provide('safaridriver.client');

goog.require('goog.Uri');
goog.require('goog.debug.DivConsole');
goog.require('goog.log');
goog.require('safaridriver.message.Connect');


/**
 * Initializes the client.
 */
safaridriver.client.init = function() {
  var h2 = document.createElement('h2');
  h2.innerHTML = 'SafariDriver Launcher';
  document.body.appendChild(h2);

  var div = document.createElement('div');
  document.body.appendChild(div);

  var divConsole = new goog.debug.DivConsole(div);
  divConsole.setCapturing(true);

  var log = goog.log.getLogger('safaridriver.client');

  var url = new goog.Uri(window.location).getQueryData().get('url');
  if (!url) {
    goog.log.error(log,
        'No url specified. Please reload this page with the url parameter set');
    return;
  }
  url = new goog.Uri(url);

  goog.log.info(log, 'Connecting to SafariDriver browser extension...');
  goog.log.info(log,
      'Extension logs may be viewed by clicking the Selenium [\u2713] ' +
      'button on the Safari toolbar');
  var numAttempts = 0;
  var message = new safaridriver.message.Connect(url.toString());
  connect();

  function connect() {
    numAttempts += 1;
    var acknowledged = message.sendSync(window);
    if (acknowledged) {
      goog.log.info(log, 'Connected to extension');
      goog.log.info(log, 'Requesting extension connect to client at ' + url);
    } else if (numAttempts < 5) {
      var timeout = 250 * numAttempts;
      setTimeout(connect, timeout);
    } else {
      goog.log.error(log,
          'Unable to establish a connection with the SafariDriver extension');
    }
  }
};
goog.exportSymbol('init', safaridriver.client.init);
