// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



function isWindowFocused() {
  if (!goog.userAgent.GECKO) {
    return true;
  }

  var windowFocused = 0;

  var key = goog.events.listen(
      document.body, goog.events.EventType.BLUR, function() {
        windowFocused++;
      });
  // Need to fire the event twice, since the first one may actually get
  // processed
  document.body.blur();
  document.body.blur();

  goog.events.unlistenByKey(key);

  return windowFocused == 2;
}
