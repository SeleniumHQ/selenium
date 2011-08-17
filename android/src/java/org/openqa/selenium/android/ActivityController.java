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

import org.openqa.selenium.Alert;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.android.app.MainActivity;
import org.openqa.selenium.android.app.WebDriverWebView;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.List;
import java.util.Set;

public class ActivityController {
  // Timeouts in milliseconds
  private static final long LOADING_TIMEOUT = 30000L;
  private static final long START_LOADING_TIMEOUT = 700L;
  private static final long RESPONSE_TIMEOUT = 5000L;
  private static final long FOCUS_TIMEOUT = 1000L;
  private static final long POLLING_INTERVAL = 50L;

  private MainActivity activity;
  private static ActivityController instance;
  private static Object syncObject = new Object();
  private volatile String result;
  private Object syncStartedLoading = new Object();
  private Object syncMotionEvent = new Object();
  private Object syncSendKeys = new Object();
  private volatile boolean resultReady;
  private volatile boolean pageDoneLoading = false;
  private volatile boolean motionEventDone = false;
  private volatile boolean pageStartedLoading = false;
  private volatile boolean sendKeysDone = false;

  private MotionEvent lastMotionEventSent;

  private ActivityController() {}

  public static ActivityController getInstance() {
    synchronized (syncObject) {
      if (instance == null) {
        instance = new ActivityController();
      }
      return instance;
    }
  }

  public void setActivity(MainActivity ui) {
    synchronized (syncObject) {
      this.activity = ui;
    }
  }

  public void newWebView() {
    synchronized (syncObject) {
      activity.newWebView();
    }
  }

  public void waitUntilEditableAreaFocused() {
    synchronized (syncObject) {
      long timeout = System.currentTimeMillis() + FOCUS_TIMEOUT;
      while (!WebDriverWebView.ediatbleAreaHasFocus() && (System.currentTimeMillis() < timeout)) {
        try {
          Thread.sleep(POLLING_INTERVAL);
        } catch (InterruptedException e) {
          throw new RuntimeException(e);
        }
      }
    }
  }

  public void notifyPageStartedLoading() {
    synchronized(syncStartedLoading) {
      pageStartedLoading = true;
      pageDoneLoading = false;
      syncStartedLoading.notify();
    }
  }

  public void notifyPageDoneLoading() {
    synchronized (syncObject) {
      pageDoneLoading = true;
      syncObject.notify();
    }
  }

  public void blockIfPageIsLoading(AndroidDriver driver) {
    synchronized (syncStartedLoading) {
      long timeout = System.currentTimeMillis() + START_LOADING_TIMEOUT;
      while (!pageStartedLoading && (System.currentTimeMillis() < timeout)) {
        try {
          syncStartedLoading.wait(POLLING_INTERVAL);
        } catch (InterruptedException e) {
          throw new RuntimeException();
        }
      }
    }
    synchronized (syncObject) {
      long end = System.currentTimeMillis() + LOADING_TIMEOUT;
      while (!pageDoneLoading && pageStartedLoading && (System.currentTimeMillis() < end)) {
        try {
          syncObject.wait(LOADING_TIMEOUT);
        } catch (InterruptedException e) {
          throw new RuntimeException(e);
        }
      }
    }
  }

  /**
   * This method is called by {@link WebDriverWebView.onTouchEvent} and notifies
   * sendMotionEvent, allowing new events to be triggered.
   */
  public void motionEventDone () {
    synchronized (syncMotionEvent) {
      motionEventDone = true;
      syncMotionEvent.notify();
    }
  }

  /**
   * Sends a MotionEvent to the UI thread and blocks until it's fully processed
   * by the UI. WebDriverWebView.onTouchEvent typically notifies this.
   */
  public void sendMotionEvent(List<MotionEvent> eventsToSendToScreen) {
    synchronized(syncMotionEvent) {
      // We keep track of the last motion event sent, so the WebView.onTouchEvent() listener can
      // detect when the last Motion Event has been received, allowing new events to be triggered.
      lastMotionEventSent = getLastEventInSequence(eventsToSendToScreen);
      pageStartedLoading = false;
      pageDoneLoading = false;
      motionEventDone = false;
      activity.sendMotionToScreen(eventsToSendToScreen);
      long timeout = System.currentTimeMillis() + RESPONSE_TIMEOUT;
      while (!motionEventDone && (System.currentTimeMillis() < timeout)) {
        try {
          syncMotionEvent.wait(RESPONSE_TIMEOUT);
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    }
  }

  private MotionEvent getLastEventInSequence(List<MotionEvent> eventsToSendToScreen) {
    return eventsToSendToScreen.get(eventsToSendToScreen.size() - 1);
  }

  private void waitForPageLoadToComplete() {
    long timeout = System.currentTimeMillis() + LOADING_TIMEOUT;
    while (!pageDoneLoading && (System.currentTimeMillis() < timeout)) {
      try {
        syncObject.wait(LOADING_TIMEOUT);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }
    }
  }

  public void refresh() {
    synchronized(syncObject) {
      pageDoneLoading = false;
      activity.refresh();
      waitForPageLoadToComplete();
    }
  }

  public void navigateBackOrForward(int direction) {
    synchronized(syncObject) {
      pageDoneLoading = false;
      activity.navigateBackOrForward(direction);
      waitForPageLoadToComplete();
    }
  }

  public void get(final String url) {
    synchronized (syncObject) {
      pageDoneLoading = false;
      activity.navigateTo(url);
      waitForPageLoadToComplete();
    }
  }

  public String getCurrentUrl() {
    synchronized (syncObject) {
      return activity.getCurrentUrl();
    }
  }

  public String getTitle() {
    synchronized (syncObject) {
      return activity.getPageTitle();
    }
  }

  public String executeJavascript(final String script) {
    synchronized (syncObject) {
      resultReady = false;
      activity.injectScript(script);
      long timeout = System.currentTimeMillis() + RESPONSE_TIMEOUT;
      while (!resultReady && (System.currentTimeMillis() < timeout)) {
        try {
          syncObject.wait(RESPONSE_TIMEOUT);
        } catch (InterruptedException e) {
          throw new RuntimeException(e);
        }
      }
    }
    return result;
  }

  public void updateResult(String updated) {
    synchronized (syncObject) {
      result = updated;
      resultReady = true;
      syncObject.notify();
    }
  }

  public void quit() {
    synchronized(syncObject) {
      activity.flushWebView();
    }
  }

  public Set<String> getAllWindowHandles() {
    synchronized(syncObject) {
      return activity.getAllWindowHandles();
    }
  }

  public String getWindowHandle() {
    synchronized(syncObject) {
      return activity.getWindowHandle();
    }
  }

  public void switchToWindow(final String name) {
    synchronized(syncObject) {
      activity.switchToWindow(name);
    }
  }

  public void addCookie(final String name, final String value, final String path) {
    synchronized(syncObject) {
      activity.addCookie(name, value, path);
    }
  }

  public void removeCookie(final String name) {
    synchronized(syncObject) {
      activity.removeCookie(name);
    }
  }

  public void removeAllCookies() {
    synchronized(syncObject) {
      activity.removeAllCookies();
    }
  }

  public Set<Cookie> getCookies() {
    synchronized(syncObject) {
      return activity.getCookies();
    }
  }

  public Cookie getCookie(final String name) {
    synchronized(syncObject) {
      return activity.getCookie(name);
    }
  }

  public byte[] takeScreenshot() {
    synchronized(syncObject) {
      return activity.takeScreenshot();
    }
  }

  public ScreenOrientation getScreenOrientation() {
    synchronized(syncObject) {
      return activity.getScreenOrientation();
    }
  }

  public void rotate(ScreenOrientation orientation) {
    synchronized(syncObject) {
      activity.rotate(orientation);
    }
  }

  public void notifySendKeysDone() {
    synchronized (syncSendKeys) {
      pageStartedLoading = false;
      pageDoneLoading = false;
      sendKeysDone = true;
      syncSendKeys.notify();
    }
  }

  public void sendKeys(CharSequence[] inputKeys) {
    synchronized(syncSendKeys) {
      sendKeysDone = false;
      activity.sendKeys(inputKeys);
      long timeout = System.currentTimeMillis() + RESPONSE_TIMEOUT;
      while(!sendKeysDone && (System.currentTimeMillis() < timeout)) {
        try {
          syncSendKeys.wait(RESPONSE_TIMEOUT);
        } catch (InterruptedException e) {
          throw new RuntimeException("Failed to send keys to activity.", e);
        }
      }
    }
  }

  public Alert getAlert() {
    synchronized(syncObject) {
      return activity.getAlert();
    }
  }

  public void setCapabilities(DesiredCapabilities caps) {
    MainActivity.setDesiredCapabilities(caps);
  }

  public boolean isConnected() {
    synchronized (syncObject) {
      return activity.isConnected();
    }
  }

  public void setConnected(boolean connected) {
    synchronized (syncObject) {
      activity.setConnected(connected);
    }
  }

  public MotionEvent getLastMotionEventSent() {
    synchronized (syncObject) {
      return lastMotionEventSent;
    }
  }

}