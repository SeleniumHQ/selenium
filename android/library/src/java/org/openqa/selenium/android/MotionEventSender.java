/*
 * Copyright 2011 WebDriver committers
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.openqa.selenium.android;

import android.app.Activity;
import android.view.MotionEvent;
import android.webkit.WebView;

import java.util.List;

class MotionEventSender {

  private static MotionEvent lastSent;
  private static final Object syncObject = new Object();
  private static volatile boolean done;

  public static MotionEvent getLastEvent() {
    return lastSent;
  }

  public static void send(final List<MotionEvent> events, final WebView view, Activity activity) {
    synchronized (syncObject) {
      // We keep track of the last motion event sent, so the WebView.onTouchEvent() listener can
      // detect when the last Motion Event has been received, allowing new events to be triggered.
      lastSent = events.get(events.size() - 1);
      done = false;

      activity.runOnUiThread(new Runnable() {
        public void run() {
          TouchScreen.sendMotion(view, events);
        }
      });

      long timeout = System.currentTimeMillis() + AndroidWebDriver.RESPONSE_TIMEOUT;
      while (!done && (System.currentTimeMillis() < timeout)) {
        try {
          syncObject.wait(AndroidWebDriver.RESPONSE_TIMEOUT);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    }
  }

  public static void notifyDone() {
    synchronized (syncObject) {
      done = true;
      syncObject.notify();
    }
  }
}
