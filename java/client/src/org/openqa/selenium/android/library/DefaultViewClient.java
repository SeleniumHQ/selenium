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
import android.net.http.SslError;
import android.os.Message;
import android.view.KeyEvent;
import android.webkit.HttpAuthHandler;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * This class provides a default implementation for WebViewClient to be used
 * by WebDriver.
 *
 * This class overrides WebView default behavior when loading new URL. It makes sure that the URL
 * is always loaded by the WebView.
 */
class DefaultViewClient extends WebViewClient implements DriverProvider {
  private final WebViewClient delegate;
  private WebDriverViewClient wdViewClient;

  /**
   * Use this constructor if the WebView used does not have custom
   * bahvior defined in the WebViewClient.
   */
  public DefaultViewClient() {
    this(null);
  }

  /**
   * Use this constructor if the WebView used has custom behavior defined
   * in the WebViewClient.
   *
   * @param client the WebViewClient used by the WebView.
   */
  public DefaultViewClient(WebViewClient client) {
    if (client == null) {
      delegate = new WebViewClient();
    } else {
      delegate = client;
    }
  }

  public void setDriver(AndroidWebDriver driver) {
    this.wdViewClient = new WebDriverViewClient(driver);
  }
  
  @Override
  public void onReceivedError(WebView view, int errorCode, String description,
      String failingUrl) {
    wdViewClient.onReceivedError(view, errorCode, description, failingUrl);
    delegate.onReceivedError(view, errorCode, description, failingUrl);
  }

  @Override
  public void onFormResubmission(WebView view, Message dontResend, Message resend) {
    delegate.onFormResubmission(view, dontResend, resend);
  }

  @Override
  public void doUpdateVisitedHistory(WebView view, String url, boolean isReload) {
    delegate.doUpdateVisitedHistory(view, url, isReload);
  }

  @Override
  public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
    wdViewClient.onReceivedSslError(view, handler, error);
    delegate.onReceivedSslError(view, handler, error);
  }

  @Override
  public void onReceivedHttpAuthRequest(WebView view, HttpAuthHandler handler, String host,
      String realm) {
    delegate.onReceivedHttpAuthRequest(view, handler, host, realm);
  }

  @Override
  public boolean shouldOverrideKeyEvent(WebView view, KeyEvent event) {
    return delegate.shouldOverrideKeyEvent(view, event);
  }

  @Override
  public void onUnhandledKeyEvent(WebView view, KeyEvent event) {
    delegate.onUnhandledKeyEvent(view, event);
  }

  @Override
  public void onScaleChanged(WebView view, float oldScale, float newScale) {
    delegate.onScaleChanged(view, oldScale, newScale);
  }

  @Override
  public void onReceivedLoginRequest(WebView view, String realm, String account, String args) {
    delegate.onReceivedLoginRequest(view, realm, account, args);
  }

  @Override
  public boolean shouldOverrideUrlLoading(WebView view, String url) {
    return delegate.shouldOverrideUrlLoading(view, url);
  }

  @Override
  public void onPageStarted(WebView view, String url, Bitmap favicon) {
    wdViewClient.onPageStarted(view, url);
    delegate.onPageStarted(view, url, favicon);
  }

  @Override
  public void onPageFinished(WebView view, String url) {
    wdViewClient.onPageFinished(view, url);
    delegate.onPageFinished(view, url);
  }

  @Override
  public void onLoadResource(WebView view, String url) {
    delegate.onLoadResource(view, url);
  }

  @Override
  public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
    return delegate.shouldInterceptRequest(view, url);
  }

  @Override
  public void onTooManyRedirects(WebView view, Message cancelMsg, Message continueMsg) {
    delegate.onTooManyRedirects(view, cancelMsg, continueMsg);
  }
}
