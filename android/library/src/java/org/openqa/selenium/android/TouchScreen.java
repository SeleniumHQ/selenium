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

package org.openqa.selenium.android;

import android.view.MotionEvent;
import android.webkit.WebView;

import java.util.List;

/**
 * Class used to send touch events to the screen directed to the webview.
 */
class TouchScreen {
  public static void sendMotion(WebView webview, List<MotionEvent> events) {
    float zoom = webview.getScale();
    for (MotionEvent event : events) {
      event.setLocation(zoom * event.getX(), zoom * event.getY());
      webview.dispatchTouchEvent(event);
    }
    MotionEventSender.notifyDone();
  }
}
