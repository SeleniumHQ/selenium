(function() {
  function unwrap(value) {
    if (!value || typeof value != 'object') {
      return value;
    }

    // Value is a DOM node specified by its fully qualified XPath.
    if (value['webdriverElementXPath']) {
      return document.evaluate(value['webdriverElementXPath'], document,
          null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    // Value is an array.
    if (typeof value.length === 'number' &&
        !(value.propertyIsEnumerable('length'))) {
      for (var i = 0; i < value.length; i++) {
        value[i] = unwrap(value[i]);
      }
    // Value is a generic JSON object.
    } else {
      for (var prop in value) {
        value[prop] = unwrap(value[prop]);
      }
    }
    return value;
  }

  function wrap(value) {
    switch (typeof value) {
      case 'boolean':
      case 'number':
      case 'string':
        return value;
      case 'undefined':
        return null;
      case 'object':
        if (value == null) {
          return value;
        }

        // Value is an array.
        if (typeof value.length === 'number' &&
            !(value.propertyIsEnumerable('length'))) {
          for (var i = 0; i < value.length; i++) {
            value[i] = wrap(value[i])
          }
          return value;
        }

        // Value is a DOM node; make sure it is an element.
        if (typeof value.nodeType == 'number') {
          if (value.nodeType != 1) {
            // Non-valid JSON value; we'll fail over when trying to stringify
            // this, so fail early.
            throw Error('Invalid script return type: value.nodeType == ' +
                        value.nodeType);
          }

          var path = '';
          for (; value && value.nodeType == 1; value = value.parentNode) {
            var index = 1;
            for (var sibling = value.previousSibling; sibling;
                sibling = sibling.previousSibling) {
              if (sibling.nodeType == 1 && sibling.tagName &&
                  sibling.tagName == value.tagName) {
                index++;
              }
            }
            path = '/' + value.tagName + '[' + index + ']' + path;
          }
          return {'webdriverElementXPath': path};
        }

        // Result is an object; convert each property.
        for (var prop in value) {
          value[prop] = wrap(value[prop]);
        }
        return value;

      case 'function':
      default:
        throw Error('Invalid script return type: ' + (typeof value));
    }  // switch
  }

  function dispatchMessage(type, data) {
    var e = document.createEvent('MessageEvent');
    e.initMessageEvent(type, /*bubbles=*/true, /*cancelable=*/false, data,
        /*origin=*/'', /*lastEventId=*/'', /*source=*/window, /*ports=*/null);
    window.dispatchEvent(e);
  }

  function handleEvaluateEvent(e) {
    console.info('webdriver-evaluate: ' + e.data);
    window.removeEventListener('webdriver-evaluate', handleEvaluateEvent, true);

    var data = JSON.parse(e.data);
    var scriptFn = new Function(data['script']);
    var args = unwrap(data['args']);
    var asyncTimeout = data['asyncTimeout'];
    var isAsync = asyncTimeout >= 0;

    var timeoutId;
    function sendResponse(value, status) {
      if (isAsync) {
        window.clearTimeout(timeoutId);
        window.removeEventListener('unload', onunload, false);
      }

      if (status) {
        value = {'message': value.toString()};
      }

      var result = JSON.stringify(wrap({'statusCode': status, 'value': value}));
      console.info('returning from injected script: ' + result);
      dispatchMessage('webdriver-evaluate-response', result);
    }

    function onunload() {
      // "Unhandled JS error" == 17
      sendResponse(Error('Detected a page unload event; async script execution ' +
                         'does not work across page loads'), 17);
    }

    if (isAsync) {
      args.push(function(value) {
        sendResponse(value, 0);
      });
      window.addEventListener('unload', onunload, false);
    }

    console.log('executing (' + scriptFn + ').apply(null, [' + args.join(', ') +
                ']) with timeout ' + asyncTimeout);

    var startTime = new Date().getTime();
    try {
      var result = scriptFn.apply(null, args);
      if (isAsync) {
        timeoutId = window.setTimeout(function() {
          sendResponse(
              Error('Timed out waiting for async script result after ' +
                  (new Date().getTime() - startTime) + 'ms'),
              28);  // "script timeout" == 28
        }, asyncTimeout);
      } else {
        sendResponse(result, 0);
      }
    } catch (e) {
      // "Unhandled JS error" == 17
      sendResponse(e, e.status || 17);
    }
  }
  window.addEventListener('webdriver-evaluate', handleEvaluateEvent, true);

  console.info('Script evaluator ready; notifying extension');
  dispatchMessage('webdriver-evaluate-ready', '');
})();