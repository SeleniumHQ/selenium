/**
 * @fileoverview ChromeDriver extension content script which must execute
 * before any scripts have a chance to execute so we can attach a MessageEvent
 * listener that will run before all others. This listener is used so various
 * frames can communicate with each other.
 */


(function() {
  // Fetch our extension ID from the background page so we can identify
  // messages from other ChromeDriver frames.
  var extensionId = null;
  console.debug('Requesting extension ID from the background page');
  chrome.extension.sendRequest('getExtensionId', function(response) {
    console.assert(typeof response == 'string',
        'Expected a string extension ID: ' + JSON.stringify(response));
    console.debug('Extension ID is: ' + response);
    extensionId = response;
  });

  window.addEventListener('message', function(e) {
    console.debug('MessageEvent', e);
    if (typeof e.data == 'object' &&
        e.data.extension == extensionId) {
      console.info('Received a message from another ChromeDriver frame:',
          e.data);

      // Make sure the message doesn't propagate to the page under test.
      // e.stopPropagation() and e.preventDefault() don't work, but this
      // does. If this ever stops working, the page under test will start
      // getting MessageEvent's from the ChromeDriver. This isn't the end
      // of the world, but it does mean we won't be invisible to the page.
      e.stopImmediatePropagation();

      if (typeof e.data.wrappedMessage != 'object') {
        console.warn('Ignoring malformed message');
      }

      switch (e.data.wrappedMessage.request) {
        case 'activatePort':
          console.debug('Activating frame: ', window.location.href);
          ChromeDriverContentScript.port.postMessage({
            sequenceNumber: e.data.wrappedMessage.sequenceNumber,
            response: {
              response: 'switchToFrame',
              value: {statusCode: 'no-op'}
            }
          });
          break;
        default:
          console.warn('Ignoring unsupported message');
          break;
      }
    }
  });

  /**
   * Sends a message to another frame using {@code window.postMessage}. The
   * message will be handled by the frame's MessageEvent listener.
   * @param {number} index The index of the frame to send the message to.
   * @param {*} message The JSON-friendly message to send.
   */
  window.sendFrameMessage = function(index, message) {
    message = JSON.stringify({
      extension: extensionId,
      wrappedMessage: message
    });

    console.info('Sending message to frame:', message);

    // We cannot access the window.frames array from this content script,
    // so we have to inject a script into the page for execution.
    var postMessage = function(index, message) {
      // Send the message to '*' since we don't know which domain the
      // frame is in.
      window.frames[index].postMessage(message, '*');

      // Clean up after ourselves and remove the injected script tag.
      var scriptTags = document.getElementsByTagName('script');
      var scriptTag = scriptTags[scriptTags.length - 1];
      scriptTag.parentNode.removeChild(scriptTag);
    }

    var scriptTag = document.createElement('script');
    scriptTag.innerHTML =
        ['(', postMessage, ')(', index, ',', message, ');'].join('');
    document.documentElement.appendChild(scriptTag);
  };
})();
