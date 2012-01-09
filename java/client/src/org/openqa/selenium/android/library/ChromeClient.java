/*
 * Copyright 2011 WebDriver committers
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;
import org.openqa.selenium.Alert;
import org.openqa.selenium.ElementNotVisibleException;

class ChromeClient extends WebChromeClient {
  private final AndroidWebDriver driver;
  private static BiMap<WebView, Alert> unhandledAlerts = HashBiMap.create();
  private final WebChromeClient delegate;
  private final WebDriverWebView wdview;

  public ChromeClient(AndroidWebDriver driver, WebDriverWebView wdview, WebChromeClient client) {
    this.driver = driver;
    this.wdview = wdview;
    if (client == null) {
      delegate = new WebChromeClient();
    } else {
      delegate = client;
    }
  }

  @Override
  public void onCloseWindow(WebView window) {
    // Dispose of unhandled alerts, if any.
    unhandledAlerts.remove(window);
    driver.getViewManager().removeView(window);
    delegate.onCloseWindow(window);
  }

  @Override
  public boolean onCreateWindow(WebView view, boolean dialog, boolean userGesture,
      Message resultMsg) {
    WebView newView = wdview.create();
    WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
    transport.setWebView(newView);
    resultMsg.sendToTarget();
    driver.getViewManager().addView(newView);
    return delegate.onCreateWindow(view, dialog, userGesture, resultMsg);
  }

  @Override
  public void onRequestFocus(WebView view) {
    delegate.onRequestFocus(view);
  }

  @Override
  public void onProgressChanged(WebView view, int newProgress) {
    if (newProgress == 100 && driver.getLastUrlLoaded() != null
        && driver.getLastUrlLoaded().equals(view.getUrl())) {
      driver.notifyPageDoneLoading();
    }
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
    unhandledAlerts.put(view, new AndroidAlert(message, result));
    return delegate.onJsAlert(view, url, message, result);
  }

  @Override
  public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
    unhandledAlerts.put(view, new AndroidAlert(message, result));
    return delegate.onJsConfirm(view, url, message, result);
  }

  @Override
  public boolean onJsPrompt(WebView view, String url, String message, String defaultValue,
      JsPromptResult result) {
    unhandledAlerts.put(view, new AndroidAlert(message, result, defaultValue));
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

  public static Alert getAlertForView(WebView view) {
    return unhandledAlerts.get(view);
  }

  public static void removeAllAlerts() {
    unhandledAlerts.clear();
  }

  public static void removeAlertForView(WebView view) {
    unhandledAlerts.remove(view);
  }

  private static void removeAlert(Alert alert) {
    unhandledAlerts.inverse().remove(alert);
  }

  private class AndroidAlert implements Alert {

    private final String message;
    private final JsResult result;
    private String textToSend = null;
    private final String defaultValue;

    public AndroidAlert(String message, JsResult result) {
      this(message, result, null);
    }

    public AndroidAlert(String message, JsResult result, String defaultValue) {
      this.message = message;
      this.result = result;
      this.defaultValue = defaultValue;
    }

    public void accept() {
      ChromeClient.removeAlert(this);
      if (isPrompt()) {
        JsPromptResult promptResult = (JsPromptResult) result;
        String result = textToSend == null ? defaultValue : textToSend;
        promptResult.confirm(result);
      } else {
        result.confirm();
      }
    }

    private boolean isPrompt() {
      return result instanceof JsPromptResult;
    }

    public void dismiss() {
      ChromeClient.removeAlert(this);
      result.cancel();
    }

    public String getText() {
      return message;
    }

    public void sendKeys(String keys) {
      if (!isPrompt()) {
        throw new ElementNotVisibleException("Alert did not have text field");
      }
      textToSend = (textToSend == null ? "" : textToSend) + keys;
    }
  }
}
