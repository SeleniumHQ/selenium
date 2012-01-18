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

package org.openqa.selenium.android.library;

import org.openqa.selenium.WebDriverException;

import com.google.common.collect.HashBiMap;

import java.util.Iterator;
import java.util.Set;
import java.util.UUID;

class WebDriverViewManager implements JavascriptResultNotifier {
  // Mapping from the ViewAdapter's handle (uuid) and the ViewAdapter
  private static HashBiMap<String, ViewAdapter> map = HashBiMap.create();
  // Keeps track of the views and their corresponding ViewAdapter
  private static HashBiMap<Object, ViewAdapter> views = HashBiMap.create();
  private volatile boolean done;
  private volatile String result;
  private Object syncObject = new Object();

  public static ViewAdapter getViewAdapterFor(Object view) {
    return views.get(view);
  }

  public ViewAdapter getView(String nameOrHandle) {
    synchronized (syncObject) {
      ViewAdapter toReturn = searchForViewByHandle(nameOrHandle);
      return toReturn == null ? searchForViewByWindowName(nameOrHandle) : toReturn;
    }
  }
  
  public void addView(ViewAdapter view) {
    synchronized (syncObject) {
      String u = UUID.randomUUID().toString();
      map.put(u, view);
      views.put(view.getUnderlyingView(), view);
    }
  }

  public ViewAdapter getNextView() {
    synchronized (syncObject) {
      String key = map.keySet().iterator().next();
      return map.get(key);
    }
  }

  public void removeView(String nameOrHandle) {
    synchronized (syncObject) {
      ViewAdapter toRemove = searchForViewByHandle(nameOrHandle);
      toRemove = toRemove != null ? toRemove : searchForViewByWindowName(nameOrHandle);
      removeView(toRemove);
    }
  }
  
  public void removeView(ViewAdapter view) {
    synchronized (syncObject) {
      map.inverse().remove(view);
      views.inverse().remove(view);
    }
  }

  public void removeView(Object viewImpl) {
    synchronized (syncObject) {
      for (ViewAdapter adapter : map.values()) {
        if (adapter.getClassForUnderlyingView().equals(viewImpl)) {
          removeView(adapter);
          break;
        }
      }
    }
  }
  
  public Set<String> getAllHandles() {
    synchronized (syncObject) {
      return map.keySet();
    }
  }

  private ViewAdapter searchForViewByHandle(String handle) {
    synchronized (syncObject) {
      return map.get(handle);
    }
  }

  private ViewAdapter searchForViewByWindowName(String windowName) {
    synchronized (syncObject) {
      for (ViewAdapter view : map.inverse().keySet()) {
        done = false;
        JavascriptExecutor.executeJs(
            view, this, "window.webdriver.resultMethod(window.name);");
        long timeout = System.currentTimeMillis() + AndroidWebDriver.RESPONSE_TIMEOUT;
        while (!done && (System.currentTimeMillis() < timeout)) {
          try {
            syncObject.wait(AndroidWebDriver.RESPONSE_TIMEOUT);
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

  public String getWindowHandle(ViewAdapter view) {
    synchronized (syncObject) {
      return map.inverse().get(view);
    }
  }

  public void closeAll() {
    String s;
    for (Iterator<String> it = map.keySet().iterator(); it.hasNext(); ) {
      s = it.next();
      ViewAdapter viewAdapter = map.get(s);
      viewAdapter.removeAllViews();
      viewAdapter.destroy();
      views.inverse().remove(viewAdapter);
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
