/*
Copyright 2011 Software Freedom Conservatory.

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

import static org.openqa.selenium.android.library.ReflexionHelper.invoke;

import android.graphics.Picture;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.WebSettings;

import org.openqa.selenium.WebDriverException;

/**
 * Adapter class to allow WebDriver to work with any View that has the same
 * API as WebView.
 *
 * This class implements the WebView methods used by WebDriver, with the
 * same signature as WebView's. Calls to those methods delegate to the
 * underlying view (which in turn must implement those methods).
 *
 * Note thae the underlying view must be part of the Android View hierarchy.
 */
public class ViewAdapter {
  private final Object view;
  private final String className;

  /**
   * Constructs an adapter for any View to work with WebDriver. Note that the
   * view must implement the same method as WebView's.
   *
   * Sample usage for custom WebViews:
   * WebView view = new WebView(acivity);
   * ViewAdapter adapter = new ViewAdapter("android.webkit.WebView", view);
   *
   * Sample usage for custom Views:
   * MyCustomView view = new MyCustomView();
   * ViewAdapter adapter = new ViewAdapter("custom.view.package.MyCustomView",
   *     view);
   *
   * @param className the fully qualified class name of the View. For instance:
   *     For WebView use "android.webkit.WebView".
   * @param view the view that will be used by the driver. The view must
   * fullfill those two criterion :
   *   - the view must belong to Android's View hierarchy
   *   - the view must implement the same methods as WebView's. If the view
   *   is a WebView, this is always true.
   */
  public ViewAdapter(String className, Object view) {
    this.view = view;
    this.className = className;
  }

  /* package */ Class getClassForUnderlyingView() {
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      throw new WebDriverException("Failed to get class for underlying View with class name: "
          + className, e);
    }
  }

  public void scrollBy(int x, int y) {
    Class[] argsType = {int.class, int.class};
    Object[] args = {x, y};
    invoke(view, "scrollBy", argsType, args);
  }

  public void flingScroll(int vx, int vy) {
    Class[] argsType = {int.class, int.class};
    Object[] args = {vx, vy};
    invoke(view, "flingScroll", argsType, args);
  }

  public void dispatchTouchEvent(MotionEvent ev) {
    Class[] argsType = {MotionEvent.class};
    Object[] args = {ev};
    invoke(view, "dispatchTouchEvent", argsType, args);
  }

  public float getScale() {
    Class[] argsType = {};
    Object[] args = {};
    return ((Float) invoke(view, "getScale", argsType, args)).floatValue();
  }

  public void dispatchKeyEvent(KeyEvent event) {
    Class[] argsType = {KeyEvent.class};
    Object[] args = {event};
    invoke(view, "dispatchKeyEvent", argsType, args);
  }

  public String getUrl() {
    Class[] argsType = {};
    Object[] args = {};
    return (String) invoke(view, "getUrl", argsType, args);
  }

  public String getTitle() {
    Class[] argsType = {};
    Object[] args = {};
    return (String) invoke(view, "getTitle", argsType, args);
  }

  public Picture capturePicture() {
    Class[] argsType = {};
    Object[] args = {};
    return (Picture) invoke(view, "capturePicture", argsType, args);
  }

  public void goBack() {
    Class[] argsType = {};
    Object[] args = {};
    invoke(view, "goBack", argsType, args);
  }

  public void goForward() {
    Class[] argsType = {};
    Object[] args = {};
    invoke(view, "goForward", argsType, args);
  }

  public void loadUrl(String url) {
    Class[] argsType = {String.class};
    Object[] args = {url};
    invoke(view, "loadUrl", argsType, args);
  }

  public void reload() {
    Class[] argsType = {};
    Object[] args = {};
    invoke(view, "reload", argsType, args);
  }

  public void setNetworkAvailable(boolean networkUp) {
    Class[] argsType = {boolean.class};
    Object[] args = {networkUp};
    invoke(view, "setNetworkAvailable", argsType, args);
  }

  public WebSettings getSettings() {
    Class[] argsType = {};
    Object[] args = {};
    return (WebSettings) invoke(view, "getSettings", argsType, args);
  }

  public void setWebChromeClient(ChromeClientWrapper client) {
    Class[] argsType = {client.getClassForUnderlyingClient()};
    Object[] args = {client.getUnderlyingClient()};
    invoke(view, "setWebChromeClient", argsType, args);
  }

  public void setWebViewClient(ViewClientWrapper client) {
    Class[] argsType = {client.getClassForUnderlyingClient()};
    Object[] args = {client.getUnderlyingClient()};
    invoke(view, "setWebViewClient", argsType, args);
  }

  public void setOnFocusChangeListener(View.OnFocusChangeListener l) {
    Class[] argsType = {View.OnFocusChangeListener.class};
    Object[] args = {l};
    invoke(view, "setOnFocusChangeListener", argsType, args);
  }

  public void addJavascriptInterface(Object obj, String interfaceName) {
    Class[] argsType = {Object.class, String.class};
    Object[] args = {obj, interfaceName};
    invoke(view, "addJavascriptInterface", argsType, args);
  }

  public void clearCache(boolean includeDiskFiles) {
    Class[] argsType = {boolean.class};
    Object[] args = {includeDiskFiles};
    invoke(view, "clearCache", argsType, args);
  }

  public void clearFormData() {
    Class[] argsType = {};
    Object[] args = {};
    invoke(view, "clearFormData", argsType, args);
  }

  public void clearHistory() {
    Class[] argsType = {};
    Object[] args = {};
    invoke(view, "clearHistory", argsType, args);
  }

  public void clearView() {
    Class[] argsType = {};
    Object[] args = {};
    invoke(view, "clearView", argsType, args);
  }

  public boolean requestFocus(int direction) {
    Class[] argsType = {int.class};
    Object[] args = {direction};
    return ((Boolean) invoke(view, "requestFocus", argsType, args)).booleanValue();
  }

  public void setFocusable(boolean focusable) {
    Class[] argsType = {boolean.class};
    Object[] args = {focusable};
    invoke(view, "setFocusable", argsType, args);
  }

  public void setFocusableInTouchMode(boolean focusableInTouchMode) {
    Class[] argsType = {boolean.class};
    Object[] args = {focusableInTouchMode};
    invoke(view, "setFocusableInTouchMode", argsType, args);
  }

  public Object getUnderlyingView() {
    return view;
  }

  public void removeAllViews() {
    Class[] argsType = {};
    Object[] args = {};
    invoke(view, "removeAllViews", argsType, args);
  }

  public void destroy() {
    Class[] argsType = {};
    Object[] args = {};
    invoke(view, "destroy", argsType, args);
  }
}
