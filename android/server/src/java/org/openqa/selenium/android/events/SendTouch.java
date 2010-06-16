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

import org.openqa.selenium.android.RunnableWithArgs;

import java.lang.reflect.Method;

import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.webkit.WebView;

import static android.view.MotionEvent.ACTION_UP;
import static org.openqa.selenium.android.intents.DoNativeActionIntent.MOTION_EVENT_PARAM;

public class SendTouch implements RunnableWithArgs {
  private MotionEvent event;

  private static final String LOG_TAG = SendTouch.class.getName();

  public void init(Bundle bundle) {
    event = (MotionEvent) bundle.getParcelable(MOTION_EVENT_PARAM);
  }

  public void run(WebView webView) {
    Log.d(LOG_TAG, event.toString());
    // Android can be focused on another edit box, clear focus
    NativeUtil.clearFocus(webView);

    // Converting XY coordinate to screen coordinate
    try {
      Method pinScrollTo =
          webView.getClass().getDeclaredMethod("pinScrollTo",
              new Class[] {Integer.TYPE, Integer.TYPE, Boolean.TYPE, Integer.TYPE});
      pinScrollTo.setAccessible(true);
      // 50 is the offset where the webview starts on the screen
      pinScrollTo.invoke(webView, new Object[] {0, (int) (event.getY() - 50), false, 0});
      Log.d(LOG_TAG, "Scrolling - Done");
    } catch (Exception e) {
      Log.e(LOG_TAG, "Scrolling", e);
    }
    event.setLocation(event.getX(), event.getY() - webView.getScrollY());
    webView.onTouchEvent(event);
    MotionEvent up = MotionEvent.obtain(event);
    up.setAction(ACTION_UP);
    webView.onTouchEvent(up);
  }
}
