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

import android.graphics.Bitmap;
import android.os.Message;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebStorage;
import android.webkit.WebView;

/**
 * Default implementation for WebDriver's chrome client. This chrome client
 * allows WebDriver to listen to interesting events on the page.
 *
 * Note that this class handles the creation and destruction of new windows.
 * onCreateWindow will create a new view using the ViewFactory provided
 * to WebDriver. onCloseWindow will destroy the view.
 */
public class DefaultChromeClient extends WebChromeClient implements DriverProvider, ViewProvider {
  private final WebChromeClient delegate;
  private WebDriverView wdView;

  private WebDriverChromeClient wdChromeClient;

  /**
   * Default chrome client. Use this if the WebView you are using does not
   * have custom settings in the WebChromeClient.
   */
  public DefaultChromeClient() {
    this(null);
  }

  /**
   * Use this constructor if the WebView you are using with WebDriver does
   * have custom setting defined in the WebChromeClient.
   *
   * @param client the WebChromeClient used by the WebView that WebDriver
   *     is driving.
   */
  public DefaultChromeClient(WebChromeClient client) {
    if (client == null) {
      delegate = new WebChromeClient();
    } else {
      delegate = client;
    }
  }

  public void setDriver(AndroidWebDriver driver) {
    this.wdChromeClient = new WebDriverChromeClient(driver);
  }

  public void setWebDriverView(WebDriverView view) {
    this.wdView = view;
  }

  @Override
  public void onCloseWindow(WebView window) {
    wdChromeClient.onCloseWindow(window);
    delegate.onCloseWindow(window);
  }

  @Override
  public boolean onCreateWindow(WebView view, boolean dialog, boolean userGesture,
      Message resultMsg) {
    ViewAdapter newView = wdView.create();
    WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
    transport.setWebView((WebView) newView.getUnderlyingView());
    resultMsg.sendToTarget();

    wdChromeClient.onCreateWindow(newView);
    return delegate.onCreateWindow(view, dialog, userGesture, resultMsg);
  }

  @Override
  public void onRequestFocus(WebView view) {
    delegate.onRequestFocus(view);
  }

  @Override
  public void onProgressChanged(WebView view, int newProgress) {
    wdChromeClient.onProgressChanged(view, newProgress);
    delegate.onProgressChanged(view, newProgress);
  }

  @Override
  public void onReceivedTitle(WebView view, String title) {
    delegate.onReceivedTitle(view, title);
  }

  @Override
  public void onReceivedIcon(WebView view, Bitmap icon) {
    delegate.onReceivedIcon(view, icon);
  }

  @Override
  public void onReceivedTouchIconUrl(WebView view, String url, boolean precomposed) {
    delegate.onReceivedTouchIconUrl(view, url, precomposed);
  }

  @Override
  public void onShowCustomView(View view, CustomViewCallback callback) {
    delegate.onShowCustomView(view, callback);
  }

  @Override
  public void onShowCustomView(View view, int requestedOrientation,
      CustomViewCallback callback) {
    delegate.onShowCustomView(view, requestedOrientation, callback);
  }

  @Override
  public void onHideCustomView() {
    delegate.onHideCustomView();
  }

  @Override
  public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
    wdChromeClient.onJsAlert(view, message, result);
    return delegate.onJsAlert(view, url, message, result);
  }

  @Override
  public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
    wdChromeClient.onJsConfirm(view, message, result);
    return delegate.onJsConfirm(view, url, message, result);
  }

  @Override
  public boolean onJsPrompt(WebView view, String url, String message, String defaultValue,
      JsPromptResult result) {
    wdChromeClient.onJsPrompt(view, message, defaultValue, result);
    return delegate.onJsPrompt(view, url, message, defaultValue, result);
  }

  @Override
  public boolean onJsBeforeUnload(WebView view, String url, String message, JsResult result) {
    return super.onJsBeforeUnload(view, url, message, result);
  }

  @Override
  public void onExceededDatabaseQuota(String url, String databaseIdentifier, long currentQuota,
      long estimatedSize, long totalUsedQuota, WebStorage.QuotaUpdater quotaUpdater) {
    delegate.onExceededDatabaseQuota(url, databaseIdentifier, currentQuota, estimatedSize,
        totalUsedQuota, quotaUpdater);
  }

  @Override
  public void onReachedMaxAppCacheSize(long spaceNeeded, long totalUsedQuota,
      WebStorage.QuotaUpdater quotaUpdater) {
    delegate.onReachedMaxAppCacheSize(spaceNeeded, totalUsedQuota, quotaUpdater);
  }

  @Override
  public void onGeolocationPermissionsShowPrompt(String origin,
      GeolocationPermissions.Callback callback) {
    wdChromeClient.onGeolocationPermissionsShowPrompt(origin, callback);
    delegate.onGeolocationPermissionsShowPrompt(origin, callback);
  }

  @Override
  public void onGeolocationPermissionsHidePrompt() {
    delegate.onGeolocationPermissionsHidePrompt();
  }

  @Override
  public boolean onJsTimeout() {
    return delegate.onJsTimeout();
  }

  @Override
  public void onConsoleMessage(String message, int lineNumber, String sourceID) {
    delegate.onConsoleMessage(message, lineNumber, sourceID);
  }

  @Override
  public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
    return delegate.onConsoleMessage(consoleMessage);
  }

  @Override
  public Bitmap getDefaultVideoPoster() {
    return delegate.getDefaultVideoPoster();
  }

  @Override
  public View getVideoLoadingProgressView() {
    return delegate.getVideoLoadingProgressView();
  }

  @Override
  public void getVisitedHistory(ValueCallback<String[]> callback) {
    delegate.getVisitedHistory(callback);
  }
}
