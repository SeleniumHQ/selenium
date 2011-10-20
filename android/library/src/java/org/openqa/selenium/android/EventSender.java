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
import android.view.KeyCharacterMap;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.webkit.WebView;

import org.openqa.selenium.WebDriverException;

import java.util.List;

class EventSender {

  private static MotionEvent lastSent;
  private static final Object syncObject = new Object();
  private static volatile boolean done;

  public static MotionEvent getLastEvent() {
    return lastSent;
  }

  public static void sendMotion(final List<MotionEvent> events,
      final WebView view, Activity activity) {

    long timeout = System.currentTimeMillis() + AndroidWebDriver.RESPONSE_TIMEOUT;

    synchronized (syncObject) {
      // We keep track of the last motion event sent, so the WebView.onTouchEvent() listener can
      // detect when the last Motion Event has been received, allowing new events to be triggered.
      lastSent = events.get(events.size() - 1);
      done = false;

      activity.runOnUiThread(new Runnable() {
        public void run() {
          float zoom = view.getScale();
          for (MotionEvent event : events) {
            event.setLocation(zoom * event.getX(), zoom * event.getY());
            view.dispatchTouchEvent(event);
            synchronized (syncObject) {
              done = true;
              syncObject.notify();
            }
          }
        }
      });
      waitForNotification(timeout, "Failed to send motion events.");
    }
  }

  private static void waitForNotification(long timeout, String errorMsg) {
    while (!done && (System.currentTimeMillis() < timeout)) {
      try {
        syncObject.wait(AndroidWebDriver.RESPONSE_TIMEOUT);
      } catch (InterruptedException e) {
        throw new WebDriverException(errorMsg, e);
      }
    }
  }

  /**
   * Sends key strokes to the given text to the element in focus within the webview.
   *
   * Note: This assumes that the focus has been set before on the element at sake.
   *
   * @param webview
   * @param text
   */
  public static void sendKeys(final WebView webview,
      Activity activity, final CharSequence... text) {
    final KeyCharacterMap characterMap =
        KeyCharacterMap.load(KeyCharacterMap.VIRTUAL_KEYBOARD);

    long timeout = System.currentTimeMillis() + AndroidWebDriver.RESPONSE_TIMEOUT;

    synchronized (syncObject) {
      done = false;

      activity.runOnUiThread(new Runnable() {
        public void run() {
          for (CharSequence sequence : text) {
            for (int i = 0; i < sequence.length(); i++) {
              char c = sequence.charAt(i);
              int code = AndroidKeys.getKeyEventFromUnicodeKey(c);
              if (code != -1) {
                webview.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, code));
                webview.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, code));
              } else {
                KeyEvent[] arr = characterMap.getEvents(new char[]{c});
                if (arr != null) {
                  for (int j = 0; j < arr.length; j++) {
                    if (Character.isLowerCase(c)) {
                      int n = arr[j].normalizeMetaState(0);
                    }
                    webview.dispatchKeyEvent(arr[j]);
                  }
                }
              }
            }
          }
        }
      });
      done = true;
      syncObject.notify();
    }
    waitForNotification(timeout, "Failed to send keys.");
  }

  /**
   * Add KeyEvents to the queue to move the cursor to the rightmost position in the text area.
   *
   * @param textAreaValue the already present in the editable area
   * @param webview the current webview
   */
 /* private static void moveCursorToRightMostPosition(String textAreaValue, WebView webview) {
    List<KeyEvent> events = Lists.newArrayListWithExpectedSize(2);
    long downTime = SystemClock.uptimeMillis();
    events.add(new KeyEvent(downTime, SystemClock.uptimeMillis(), KeyEvent.ACTION_DOWN,
        KeyEvent.KEYCODE_DPAD_RIGHT, 0));
    events.add(new KeyEvent(downTime, SystemClock.uptimeMillis(), KeyEvent.ACTION_UP,
        KeyEvent.KEYCODE_DPAD_RIGHT, textAreaValue.length()));
    dispatchEvents(webview, events);
  }*/
}
