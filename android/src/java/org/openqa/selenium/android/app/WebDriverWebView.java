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

import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.openqa.selenium.android.ActivityController;

import android.content.Context;
import android.graphics.Rect;
import android.os.Message;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class WebDriverWebView extends WebView {
  private final WebChromeClient chromeClient;
  private final WebViewClient viewClient;
  private final WebDriverActivity context;
  private final JavascriptExecutor javascriptExecutor;
  private final String WINDOW_HANDLE = UUID.randomUUID().toString();
  
  public WebDriverWebView(Context context) {
    super(context);
    this.context = (WebDriverActivity) context;
    chromeClient = new WebDriverWebChromeClient((WebDriverActivity) context);
    viewClient = new WebDriverWebViewClient((WebDriverActivity) context);
    javascriptExecutor = new JavascriptExecutor(this);
    initWebViewSettings();
  }
  
  public String getWindowHandle() {
    return WINDOW_HANDLE;
  }
  
  /**
   * Navigates WebView to a new URL.
   *
   * @param url URL to navigate to.
   */
  public void navigateTo(String url) {
     if (url == null) {
      ActivityController.done();
      return;
    }
    //use for redirect control
    context.setLastUrlLoaded(null);

    if (url.equals(context.currentUrl())) {
      this.reload();
    }
    else if (url.length() > 0) {
      if (url.startsWith("http") || url.startsWith("www")) {
        this.loadUrl(url); // This is a URL
      } else {
        this.loadData(url, "text/html", "utf-8"); // This is HTML
      }
    }
  }
  
  @Override
  protected void onFocusChanged(boolean focused, int direction,
      Rect previouslyFocusedRect) {
    super.onFocusChanged(focused, direction, previouslyFocusedRect);
    if (!focused) {  // When a text area is focused, webview's focus is false
      ActivityController.getInstance();
      ActivityController.done();
    }
  }
  
  public void executeJavascript(String javascript) {
    javascriptExecutor.executeJS(javascript);
  }
  
  private void initWebViewSettings() {
    // Clearing the view
    clearCache(true);
    clearFormData();
    clearHistory();
    clearView();

    // Sets custom webview behavior
    setWebViewClient(viewClient);
    setWebChromeClient(chromeClient);
    addJavascriptInterface(new JavascriptInterface(javascriptExecutor), "webdriver");

    // Webview settings
    WebSettings settings = getSettings();
    settings.setJavaScriptCanOpenWindowsAutomatically(true);
    settings.setSupportMultipleWindows(true);
    settings.setBuiltInZoomControls(true);
    settings.setJavaScriptEnabled(true);
/*    settings.setAppCacheEnabled(true);
    settings.setAppCacheMaxSize(10*1024*1024);
    settings.setAppCachePath("");*/
    settings.setDatabaseEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setGeolocationEnabled(true);
    settings.setSaveFormData(true);
    settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
  }
  
  /**
   * Subscriber class to be notified when the underlying WebView loads new content or changes
   * title.
   */
  final class WebDriverWebChromeClient extends WebChromeClient {
    private ExecutorService executor = Executors.newSingleThreadExecutor();
    private final WebDriverActivity context;
    
    public WebDriverWebChromeClient(WebDriverActivity context) {
      this.context = context;  
    }
    
    @Override
    public void onCloseWindow(WebView window) {
      context.viewManager().removeView((WebDriverWebView) window);
      super.onCloseWindow(window);
    }

    @Override
    public boolean onCreateWindow(
        WebView view, boolean dialog, boolean userGesture, Message resultMsg) {
      WebDriverWebView newView = new WebDriverWebView(context);
      WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
      transport.setWebView(newView);
      resultMsg.sendToTarget();
      context.viewManager().addView(newView);
      return true;
    }

    @Override
    public void onProgressChanged(WebView view, int newProgress) {
      context.setProgress(newProgress * 100);  
      if (newProgress == 100 && context.lastUrlLoaded() != null
          && context.lastUrlLoaded().equals(view.getUrl())) {
        ActivityController.done();
      }
    }
    
  }
}
