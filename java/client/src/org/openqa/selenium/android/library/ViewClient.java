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
import android.util.Log;
import android.webkit.SslErrorHandler;
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
  
  public ViewClient(AndroidWebDriver driver) {
    this.driver = driver;
  }
  
  @Override
  public void onReceivedError(WebView view, int errorCode, String description,
      String failingUrl) {
    Logger.log(Level.WARNING, LOG_TAG, "onReceiveError", description
        + ", error code: " + errorCode);
  }

  @Override
  public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
    boolean shouldAcceptSslCerts = driver.getAcceptSslCerts();
    Logger.log(Level.WARNING, LOG_TAG, "onReceivedSslError", error.toString()
        + ", shouldAcceptSslCerts: " + shouldAcceptSslCerts);

    if (shouldAcceptSslCerts) {
      handler.proceed();
    } else {
      super.onReceivedSslError(view, handler, error);
    }
  }

  private String tmpUrl;

  @Override
  public void onPageStarted(WebView view, String url, Bitmap favicon) {
    driver.setLastUrlLoaded(url);
    tmpUrl = url;
    driver.notifyPageStartedLoading();
    super.onPageStarted(view, url, favicon);
  }

  @Override
  public void onPageFinished(WebView view, String url) {
    super.onPageFinished(view, url);
    driver.setLastUrlLoaded(url);
        
    // If it is a html fragment or the current url loaded, the page is
    // not reloaded and the onProgessChanged function is not called.
    if (url.contains("#") && tmpUrl.equals(url.split("#")[0])) {
      driver.notifyPageDoneLoading();
    }
  }
}
