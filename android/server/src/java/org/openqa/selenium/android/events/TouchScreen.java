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

import org.openqa.selenium.android.Platform;
import org.openqa.selenium.android.intents.WebViewAction;

import android.graphics.Point;
import android.os.SystemClock;
import android.util.Log;
import android.view.MotionEvent;
import android.webkit.WebView;

/**
 * Class used to send touch events to the screen directed to the webview.
 */
public class TouchScreen {
  private static final String LOG_TAG = TouchScreen.class.getName();
  
  public static void sendMotion(WebView webview, MotionEvent... events) {
    Log.d(LOG_TAG, "Sending touch event.");
    WebViewAction.clearTextEntry(webview);
    
    if (Platform.sdk() <= Platform.DONUT) {
      webview.pauseTimers();
    }
    try {
      scrollIfTargetNotVisible(webview, events[0]);
    
      long downTime = SystemClock.uptimeMillis();
      for (MotionEvent event : events) {
        Log.d(LOG_TAG, "Processing Motion Event: " + event.toString());
        long eventTime = SystemClock.uptimeMillis();
        MotionEvent e = MotionEvent.obtain(downTime, eventTime, event.getAction(),
          event.getX() - webview.getScrollX(), event.getY() - webview.getScrollY(),
          event.getPressure(), event.getSize(), event.getMetaState(), event.getXPrecision(),
          event.getYPrecision(), event.getDeviceId(), event.getEdgeFlags());
        webview.onTouchEvent(e);
      }
      webview.requestFocus();
    } finally {
      if (Platform.sdk() <= Platform.DONUT) {
        webview.resumeTimers();
      }
    }
  }

  private static void scrollIfTargetNotVisible(WebView webview, MotionEvent motion) {
    Point center = new Point((int) motion.getX(), (int) motion.getY());
    
    Log.d(LOG_TAG, String.format("X axis, down.x: %d, webview.getWidth: %d," +
    		"webview.getScrollX: %d.\nY axis, down.y: %d, webview.getHeight: %d," +
    		"webview.getScrollY: %d", center.x, webview.getWidth(), webview.getScrollX(), center.y,
    		webview.getHeight(), webview.getScrollY()));
    
    // Element should visible, scroll otherwise
    if (!isVisible(webview, center)) {
      try {
        // New top left screen position to scroll to
        Point scrollTo = getNewTopLeftScreenCorner(webview, center);
        webview.scrollBy(scrollTo.x, scrollTo.y);
        // TODO (berrada): Logging is an expensive operation especially when using string
        // concatenation cause at least 3 allocations occur: StringBuilder, buffer and a String.
        // Make all log messages as verbose so they are never compiled for non development apks.
        Log.d(LOG_TAG, String.format("Scrolling to (%d, %d)", scrollTo.x, scrollTo.y));
      } catch (Exception e) {
        Log.e(LOG_TAG, "Scrolling", e);
      }
    }
  }

  /**
   * Computes the coordinate of the top left screen corner to scroll to so that 
   * the point given is visible.
   * 
   * @param webview
   * @param point
   * @return a Point representing the coordinate of the point the webview needs to scroll to
   */
  private static Point getNewTopLeftScreenCorner(WebView webview, Point point) {
    int xScroll = 0;
    int yScroll = 0;
    if ((point.x > (webview.getScrollX() + webview.getWidth())
        || point.x < webview.getScrollX()) && point.x >= 20) {
      xScroll = point.x - 20;
    }
    if ((point.y > (webview.getScrollY() + webview.getHeight())
        || point.y < webview.getScrollY()) && point.y >= 20) {
      yScroll = point.y - 20;
    }
    return new Point(xScroll, yScroll);
  }
  
  /**
   * @param webview the current webview
   * @param point
   * @return true if the point is visible on the screen, false otherwise
   */
  private static boolean isVisible(WebView webview, Point point) {
    return point.x < (webview.getScrollX() + webview.getWidth()) && point.x > webview.getScrollX()
        && point.y < (webview.getScrollY() + webview.getHeight()) && point.y > webview.getScrollY();
  }
}
