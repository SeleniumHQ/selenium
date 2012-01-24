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

import android.net.http.SslError;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;

import java.util.logging.Level;

/**
 * This class provides methods that must be called by a custom view client
 * if you decide not to use the DefaultViewClient.
 *
 * If you are using this class you should really know what you are doing.
 */
public class WebDriverViewClient {
  private final AndroidWebDriver driver;
  private final String LOG_TAG = WebDriverViewClient.class.getName();
  private String tmpUrl;

  public WebDriverViewClient(AndroidWebDriver driver) {
    this.driver = driver;
  }

  public void onReceivedError(WebView view, int errorCode, String description,
      String failingUrl) {
    Logger.log(Level.WARNING, LOG_TAG, "onReceiveError", description
                                                         + ", error code: " + errorCode);
  }

  public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
    boolean shouldAcceptSslCerts = driver.getAcceptSslCerts();
    Logger.log(Level.WARNING, LOG_TAG, "onReceivedSslError", error.toString()
        + ", shouldAcceptSslCerts: " + shouldAcceptSslCerts);

    if (shouldAcceptSslCerts) {
      handler.proceed();
    }
  }

  public void onPageStarted(WebView view, String url) {
    // To avoid blocking on background windows
    if (driver.getWebView().equals(view)) {
      driver.setLastUrlLoaded(url);
      tmpUrl = url;
      driver.notifyPageStartedLoading();
    }
  }


  public void onPageFinished(WebView view, String url) {
  // To avoid blocking on background windows
    if (driver.getWebView().equals(view)) {
      driver.setLastUrlLoaded(url);

      // If it is a html fragment or the current url loaded, the page is
      // not reloaded and the onProgessChanged function is not called.
      if (url != null && tmpUrl != null && url.contains("#") && tmpUrl.equals(url.split("#")[0])) {
        driver.notifyPageDoneLoading();
      }
    }
  }
}
