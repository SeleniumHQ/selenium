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

import java.util.Set;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.android.app.WebDriverActivity;

import android.view.MotionEvent;

public class ActivityController {

  private WebDriverActivity activity;
  private static ActivityController instance;
  private static Object syncObject = new Object();
  private static volatile boolean done;
  private static volatile String result;
  private volatile boolean startedLoading;
  
  private ActivityController() {}
  
  public static ActivityController getInstance() {
    synchronized (syncObject) {
      if (instance == null) {
        instance = new ActivityController();
      }
      return instance;
    }
  }
  
  public void setActivity(WebDriverActivity ui) {
    synchronized (syncObject) {
      this.activity = ui;      
    }
  }
  
  public void waitUntilEditableAreaFocused() {
    synchronized (syncObject) {
      done = false;
      while (!done) {
        try {
          syncObject.wait(AndroidDriver.FOCUS_TIMEOUT);
        } catch (InterruptedException e) {
          throw new RuntimeException(e);
        }
      }
    }
  }
  
  public void notifyPageStartedLoading() {
    synchronized(syncObject) {
      startedLoading = true;
    }
  }
  
  public void blockIfPageIsLoading() {
    synchronized (syncObject) {
      if (startedLoading) {
        while (!done) {
          try {
            syncObject.wait(AndroidDriver.LOADING_TIMEOUT);
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        }
      }
    }
  }
  
  public static void done () {
    synchronized (syncObject) {
      done = true;
      syncObject.notify(); 
    }
  }
  
  public void get(final String url) {
    synchronized (syncObject) {
      done = false;
      activity.navigateTo(url);
      while (!done) {
        try {
          syncObject.wait(AndroidDriver.LOADING_TIMEOUT);
        } catch (InterruptedException e) {
          throw new RuntimeException(e);
        }
      }
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
      done = false;
      activity.injectScript(script);
      while (!done) {
        try {
          syncObject.wait(AndroidDriver.LOADING_TIMEOUT);
        } catch (InterruptedException e) {
          throw new RuntimeException(e);
        }
      }
    }
    return result;
  }
  
  public static void updateResult(String updated) {
    synchronized (syncObject) {
      result = updated;      
    }
  }
  
  public void quit() {
    synchronized(syncObject) {
      activity.finish();  
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
  
  public void navigateBackOrForward(int direction) {
    synchronized(syncObject) {
      activity.navigateBackOrForward(direction);
    }
  }
  
  public void refresh() {
    synchronized(syncObject) {
      activity.refresh();
    }
  }
  
  public void sendMotionEvent(MotionEvent down, MotionEvent up) {
    synchronized(syncObject) {
      activity.sendMotionToScreen(down, up);
    }
  }
  
  public void sendKeys(CharSequence[] inputKeys) {
    synchronized(syncObject) {
      activity.sendKeys(inputKeys);
    }
  }
  
}
