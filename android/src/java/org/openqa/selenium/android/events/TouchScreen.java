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

package org.openqa.selenium.android.events;

import com.google.common.collect.Lists;

import android.os.SystemClock;
import android.view.MotionEvent;
import android.webkit.WebView;

import org.openqa.selenium.android.Platform;

import java.util.List;

/**
 * Class used to send touch events to the screen directed to the webview.
 */
public class TouchScreen {

  public static void sendMotion(WebView webview, List<MotionEvent> events) {

    if (Platform.sdk() <= Platform.DONUT) {
      webview.pauseTimers();
    }

    try {
      float zoom = webview.getScale();
      List<MotionEvent> eventsQueue = Lists.newLinkedList();

      for (MotionEvent event : events) {
        MotionEvent e = MotionEvent.obtain(event.getDownTime(),
            event.getEventTime(),
            event.getAction(),
            zoom * event.getX(),
            zoom * event.getY(),
            event.getMetaState());
        eventsQueue.add(e);
      }

      for (MotionEvent me : eventsQueue) {
        webview.dispatchTouchEvent(me);
      }
    } finally {
      if (Platform.sdk() <= Platform.DONUT) {
        webview.resumeTimers();
      }
    }
  }

}
