/*
Copyright 2010 Selenium committers

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

import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebSettings.LayoutAlgorithm;
import android.webkit.WebSettings.ZoomDensity;

import com.google.common.base.Preconditions;

/* package */ class WebDriverView {
  private static JavascriptInterface jsInterface =
      new JavascriptInterface(new JavascriptExecutor());
  private AndroidWebDriver driver;
  private ViewFactory factory;
  private ViewClientWrapper viewc;
  private ChromeClientWrapper chromec;
  private View.OnFocusChangeListener focusListener;

  /* package */ WebDriverView(final AndroidWebDriver driver,
      ViewFactory factory, ViewClientWrapper viewc,
      ChromeClientWrapper chromec, View.OnFocusChangeListener focusListener) {
    Preconditions.checkNotNull(driver);
    Preconditions.checkNotNull(factory);
    this.driver = driver;
    this.factory = factory;

    this.viewc = viewc;
    this.chromec = chromec;
    this.chromec.setWebDriverView(this);

    this.focusListener = focusListener == null ? new View.OnFocusChangeListener(){
      public void onFocusChange(View view, boolean b) {
      }
    } : focusListener;
  }

  /* package */ ViewAdapter create() {

    //WebChromeClient chromeClient = new WebDriverChromeClient(driver, this, chromec);
    //WebViewClient viewClient = new DefaultViewClient(driver, viewc);
    chromec.setDriver(driver);
    viewc.setDriver(driver);

    ViewAdapter view = factory.createNewView(driver.getActivity());

    view.setWebChromeClient(chromec);
    view.setWebViewClient(viewc);

    view.setOnFocusChangeListener(new View.OnFocusChangeListener() {
      public void onFocusChange(View view, boolean focused) {
        // When a text area is focused, webview's focus is false
        if (!focused) {
          driver.setEditAreaHasFocus(true);
        }
        focusListener.onFocusChange(view, focused);
      }
    });
    
    view.addJavascriptInterface(jsInterface, "webdriver");

    initWebViewSettings(view);
    
    return view;
  }

  private WebDriverView() {}

  private static void initWebViewSettings(ViewAdapter view) {
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
    settings.setAppCacheEnabled(true);
    settings.setAppCacheMaxSize(10*1024*1024);
    settings.setAppCachePath("");
    settings.setDatabaseEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setGeolocationEnabled(true);
    settings.setSaveFormData(true);
    settings.setSavePassword(false);
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

    // Flash settings
    settings.setPluginState(WebSettings.PluginState.ON);

    // Geo location settings
    settings.setGeolocationEnabled(true);
    settings.setGeolocationDatabasePath("/data/data/webdriver");

    view.setNetworkAvailable(true);
  }
}
