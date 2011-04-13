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

import org.openqa.selenium.android.ActivityController;

import android.graphics.Bitmap;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * This class overrides WebView default behavior when loading new URL. It makes sure that the URL
 * is always loaded by the WebView and updates progress bar according to the page loading
 * progress.
 */
final class WebDriverWebViewClient extends WebViewClient {
  private final MainActivity context;
  private final ActivityController controller = ActivityController.getInstance();
  
  public WebDriverWebViewClient(MainActivity context) {
    this.context = context;
  }
  
  @Override
  public void onPageStarted(WebView view, String url, Bitmap favicon) {
    context.setLastUrlLoaded(url);
    context.setCurrentUrl(url);
    context.setProgressBarVisibility(true); // Showing progress bar in title
    context.setProgress(0);
    context.setPageHasStartedLoading(true);
    controller.notifyPageStartedLoading();
    super.onPageStarted(view, url, favicon);
  }

  @Override
  public void onPageFinished(WebView view, String url) {
    super.onPageFinished(view, url);
    context.setProgressBarVisibility(false); // Hiding progress bar in title
    context.setLastUrlLoaded(url);
        
    // If it is a html fragment or the current url loaded, the page is
    // not reloaded and the onProgessChanged function is not called.
    if (url.contains("#") && context.currentUrl().equals(url.split("#")[0])) {
      controller.notifyPageDoneLoading();
    }
  }

  @Override
  public boolean shouldOverrideUrlLoading(WebView view, String url) {
    view.loadUrl(url);
    return true;
  }
}
