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

import android.graphics.Bitmap;
import android.net.http.SslError;
import android.os.Message;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.HttpAuthHandler;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.logging.Level;

/**
 * This class overrides WebView default behavior when loading new URL. It makes sure that the URL
 * is always loaded by the WebView and updates progress bar according to the page loading
 * progress.
 */
class ViewClient extends WebViewClient {
  private final AndroidWebDriver driver;
  private final String LOG_TAG = ViewClient.class.getName();
  private final WebViewClient delegate;
  private String tmpUrl;

  public ViewClient(AndroidWebDriver driver, WebViewClient client) {
    this.driver = driver;
    if (client == null) {
      delegate = new WebViewClient();
    } else {
      delegate = client;
    }
  }
  
  @Override
  public void onReceivedError(WebView view, int errorCode, String description,
      String failingUrl) {
    Logger.log(Level.WARNING, LOG_TAG, "onReceiveError", description
        + ", error code: " + errorCode);
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
    boolean shouldAcceptSslCerts = driver.getAcceptSslCerts();
    Logger.log(Level.WARNING, LOG_TAG, "onReceivedSslError", error.toString()
        + ", shouldAcceptSslCerts: " + shouldAcceptSslCerts);

    if (shouldAcceptSslCerts) {
      handler.proceed();
    } else {
      delegate.onReceivedSslError(view, handler, error);
    }
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
    driver.setLastUrlLoaded(url);
    tmpUrl = url;
    driver.notifyPageStartedLoading();
    delegate.onPageStarted(view, url, favicon);
  }

  @Override
  public void onPageFinished(WebView view, String url) {
    driver.setLastUrlLoaded(url);

    // If it is a html fragment or the current url loaded, the page is
    // not reloaded and the onProgessChanged function is not called.
    if (url.contains("#") && tmpUrl.equals(url.split("#")[0])) {
      driver.notifyPageDoneLoading();
    }
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
