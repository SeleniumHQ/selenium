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

package org.openqa.selenium.android.app;

import com.google.common.collect.Sets;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.android.ActivityController;
import org.openqa.selenium.android.JavascriptResultNotifier;

import java.util.Iterator;
import java.util.Set;

public class WebViewManager implements JavascriptResultNotifier {
  private Set<WebDriverWebView> views = Sets.newHashSet();
  private volatile boolean done;
  private volatile String result;
  private Object syncObject = new Object();

  public WebDriverWebView getView(String nameOrHandle) {
    synchronized (syncObject) {
      WebDriverWebView toReturn = searchForViewByHandle(nameOrHandle);
      if (toReturn != null) {
        return toReturn;
      }
      return searchForViewByWindowName(nameOrHandle);
    }
  }
  
  public void addView(WebDriverWebView view) {
    synchronized (syncObject) {
    views.add(view);
    }
  }
  
  public void removeView(String nameOrHandle) {
    synchronized (syncObject) {
      WebDriverWebView toRemove = searchForViewByHandle(nameOrHandle);
      if (toRemove != null) {
        removeView(toRemove);
      } else {
        toRemove = searchForViewByWindowName(nameOrHandle);
        if (toRemove != null) {
          removeView(toRemove);
        }
      }
    }
  }
  
  public boolean removeView(WebDriverWebView view) {
    synchronized (syncObject) {
      return views.remove(view);
    }
  }
  
  public Set<String> getAllHandles() {
    synchronized (syncObject) {
      Set<String> handles = Sets.newHashSetWithExpectedSize(views.size());
      for (WebDriverWebView view : views) {
        handles.add(view.getWindowHandle());
      }
      return handles;
    }
  }

  private WebDriverWebView searchForViewByHandle(String handle) {
    synchronized (syncObject) {
      for (WebDriverWebView view : views) {
        if (view.getWindowHandle().equals(handle)) {
          return view;
        }
      }
      return null;
    }
  }

  private WebDriverWebView searchForViewByWindowName(String windowName) {
    synchronized (syncObject) {
      for (WebDriverWebView view : views) {
        done = false;
        view.executeJavascript("window.webdriver.resultMethod(window.name);", this);
        long timeout = System.currentTimeMillis() + ActivityController.RESPONSE_TIMEOUT;
        while (!done && (System.currentTimeMillis() < timeout)) {
          try {
            syncObject.wait(ActivityController.RESPONSE_TIMEOUT);
          } catch (InterruptedException e) {
            throw new WebDriverException(e);
          }
        }
        if (result != null && result.equals(windowName)) {
          return view;
        }
      }
      return null;
    }
  }

  public void closeAll() {
    Iterator<WebDriverWebView> it = views.iterator();
    WebDriverWebView tmp;
    while (it.hasNext()) {
      tmp = it.next();
      tmp.removeAllViews();
      tmp.destroy();
      it.remove();
    }
  }

  public void notifyResultReady(String result) {
    synchronized (syncObject) {
      this.result = result;
      done = true;
      syncObject.notify();
    }
  }
}
