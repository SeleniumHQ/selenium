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

import java.util.Set;

public class WebViewManager {
  private Set<WebDriverWebView> views = Sets.newHashSet();
  
  public WebDriverWebView getView(String nameOrHandle) {
    WebDriverWebView toReturn = searchForViewByHandle(nameOrHandle);
    if (toReturn != null) {
      return toReturn;
    }
    return searchForViewByWindowName(nameOrHandle);
  }
  
  public void addView(WebDriverWebView view) {
    views.add(view);
  }
  
  public void removeView(String nameOrHandle) {
    WebDriverWebView handleSearchResult = searchForViewByHandle(nameOrHandle);
    if (handleSearchResult != null) {
      removeView(handleSearchResult);
    } else {
      WebDriverWebView windowNameSearchResult = searchForViewByWindowName(nameOrHandle);
      if (windowNameSearchResult != null) {
        removeView(windowNameSearchResult);
      }
    }
  }
  
  public boolean removeView(WebDriverWebView view) {
    return views.remove(view);
  }
  
  public Set<String> getAllHandles() {
    Set<String> handles = Sets.newHashSetWithExpectedSize(views.size());
    for (WebDriverWebView view : views) {
      handles.add(view.getWindowHandle());
    }
    return handles;
  }

  private WebDriverWebView searchForViewByHandle(String handle) {
    for (WebDriverWebView view : views) {
      if (view.getWindowHandle().equals(handle)) {
        return view;
      }
    }
    return null;
  }
  
  private WebDriverWebView searchForViewByWindowName(String windowName) {
    for (final WebDriverWebView view : views) {
      String name = view.getWindowName();
      if (name != null && name.equals(windowName)) {
        return view;
      }
    }
    return null;
  }
}
