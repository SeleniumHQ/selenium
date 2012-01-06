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

import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebSettings.LayoutAlgorithm;
import android.webkit.WebSettings.ZoomDensity;
import android.webkit.WebView;
import android.webkit.WebViewClient;

class WebDriverWebView {

  private static JavascriptInterface jsInterface =
      new JavascriptInterface(new JavascriptExecutor());

  public static WebView create(final AndroidWebDriver driver) {

    WebChromeClient chromeClient = new ChromeClient(driver);
    WebViewClient viewClient = new ViewClient(driver);

    WebView view = new WebView(driver.getActivity());
    view.setWebChromeClient(chromeClient);
    view.setWebViewClient(viewClient);

    view.setOnFocusChangeListener(new View.OnFocusChangeListener() {
      public void onFocusChange(View view, boolean focused) {
        // When a text area is focused, webview's focus is false
        if (!focused) {
          driver.setEditAreaHasFocus(true);
        }
      }
    });
    
    view.addJavascriptInterface(jsInterface, "webdriver");

    initWebViewSettings(view);
    
    return view;
  }

  private WebDriverWebView() {}

  private static void initWebViewSettings(WebView view) {
    // Clearing the view
    view.clearCache(true);
    view.clearFormData();
    view.clearHistory();
    view.clearView();

    view.requestFocus(View.FOCUS_DOWN);
    view.setFocusable(true);
    view.setFocusableInTouchMode(true);

    // Webview settings
    WebSettings settings = view.getSettings();
    settings.setJavaScriptCanOpenWindowsAutomatically(true);
    settings.setSupportMultipleWindows(true);
    settings.setBuiltInZoomControls(true);
    settings.setJavaScriptEnabled(true);
    /*settings.setAppCacheEnabled(true);
    settings.setAppCacheMaxSize(10*1024*1024);
    settings.setAppCachePath("");*/
    settings.setDatabaseEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setGeolocationEnabled(true);
    settings.setSaveFormData(true);
    settings.setRenderPriority(WebSettings.RenderPriority.HIGH);

    // Same as the browser settings
    settings.setLoadWithOverviewMode(true);
    settings.setLayoutAlgorithm(LayoutAlgorithm.NARROW_COLUMNS);
    settings.setDefaultZoom(ZoomDensity.valueOf("MEDIUM"));
    settings.setUseWideViewPort(true);
    settings.setMinimumFontSize(1);
    settings.setMinimumLogicalFontSize(1);
    settings.setDefaultFontSize(16);
    settings.setDefaultFixedFontSize(13);
    
    view.enablePlatformNotifications();
    view.setNetworkAvailable(true);
  }
}
