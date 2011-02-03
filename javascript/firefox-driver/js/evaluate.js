/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

(function() {
  var handleEvaluateEvent = function(event) {
    var script = document.getUserData('webdriver-evaluate-script');
    var args = document.getUserData('webdriver-evaluate-args');
    var isAsync = document.getUserData('webdriver-evaluate-async');
    var timeout = document.getUserData('webdriver-evaluate-timeout');
    var timeoutId;

    function sendResponse(value, status) {
      if (isAsync) {
        window.clearTimeout(timeoutId);
        window.removeEventListener('unload', onunload, false);
      }

      document.setUserData('webdriver-evaluate-args', null, null);
      document.setUserData('webdriver-evaluate-async', null, null);
      document.setUserData('webdriver-evaluate-script', null, null);
      document.setUserData('webdriver-evaluate-timeout', null, null);

      // Respond
      document.setUserData('webdriver-evaluate-result', value, null);
      document.setUserData('webdriver-evaluate-code', status, null);

      var response = document.createEvent('Events');
      response.initEvent('webdriver-evaluate-response', true, false);
      document.dispatchEvent(response);
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

    var startTime = new Date().getTime();
    try {
      var result = new Function(script).apply(null, args);
      if (isAsync) {
        timeoutId = window.setTimeout(function() {
          sendResponse(
              Error('Timed out waiting for async script result after ' +
                  (new Date().getTime() - startTime) + 'ms'),
              28);  // "script timeout" == 28
        }, timeout);
      } else {
        sendResponse(result, 0);
      }
    } catch (e) {
      // "Unhandled JS error" == 17
      sendResponse(e, 17);
    }
  };

  document.addEventListener('webdriver-evaluate', handleEvaluateEvent, true);

  // Make it clear that we're here.
  document.setUserData('webdriver-evaluate-attached', true, null);
})();
