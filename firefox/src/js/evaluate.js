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

    try {
      var result = eval(script);
      document.setUserData('webdriver-evaluate-result', result, null);
      document.setUserData('webdriver-evaluate-code', 0, null);
    } catch (e) {
      document.setUserData('webdriver-evaluate-result', e, null);
      // "Unhandled JS error" == 17
      document.setUserData('webdriver-evaluate-code', 17, null);
    }

    // Clear up
    document.setUserData('webdriver-evaluate-script', null, null);
    document.setUserData('webdriver-evaluate-args', null, null);

    // Respond
    var response = document.createEvent('Events');
    response.initEvent('webdriver-evaluate-response', true, false);
    document.dispatchEvent(response);
  };

  document.addEventListener('webdriver-evaluate', handleEvaluateEvent, true);

  // Make it clear that we're here.
  document.setUserData('webdriver-evaluate-attached', true, null);
})();
