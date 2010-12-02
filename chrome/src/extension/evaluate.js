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
    window.removeEventListener('webdriver-evaluate', handleEvaluateEvent, true);

    var data = JSON.parse(e.data);
    var script = new Function(data['script']);
    var args = unwrap(data['args']);
    console.log('executing (' + script + ').apply(null, [' + data['args'].join(', ') + '])');

    var result = {'statusCode': 0};
    try {
      result['value'] = new Function(data['script']).apply(null, args);
      result['value'] = wrap(result['value']);
    } catch (e) {
      result['value'] = {
        message: e.toString()
      };
      result['statusCode'] = 17;  // "Unhandled JS error" == 17
    }

    result = JSON.stringify(result);
    console.info('returning from injected script: ' + result);
    dispatchMessage('webdriver-evaluate-response', result);
  }
  window.addEventListener('webdriver-evaluate', handleEvaluateEvent, true);

  console.info('Script evaluator ready; notifying extension');
  dispatchMessage('webdriver-evaluate-ready', '');
})();