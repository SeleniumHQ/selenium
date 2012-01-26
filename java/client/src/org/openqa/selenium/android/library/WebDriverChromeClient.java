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

import static org.openqa.selenium.android.library.WebDriverViewManager.getViewAdapterFor;

import android.webkit.GeolocationPermissions;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;

import java.util.logging.Level;

/**
 * This class provides methods that must be called by a custom chrome client
 * if you decide not to use the DefaultChromeClient.
 *
 * If you are using this class you should really know what you are doing.
 */
public class WebDriverChromeClient {
  private AndroidWebDriver driver;

  public WebDriverChromeClient(AndroidWebDriver driver) {
    this.driver = driver;
  }

  public void onCloseWindow(Object window) {
    // Dispose of unhandled alerts, if any.
    AlertManager.removeAlertForView(getViewAdapterFor(window));
    driver.getViewManager().removeView(getViewAdapterFor(window));
  }

  
  public void onCreateWindow(ViewAdapter newView) {
    driver.getViewManager().addView(newView);
  }

  public void onProgressChanged(Object view, int newProgress) {
    if (newProgress == 100 && driver.getLastUrlLoaded() != null
        && driver.getLastUrlLoaded().equals(getViewAdapterFor(view).getUrl())) {
      driver.notifyPageDoneLoading();
    }
  }

  public void onJsAlert(Object view, String message, JsResult result) {
    AlertManager.addAlertForView(getViewAdapterFor(view), new AndroidAlert(message, result));
  }

  public void onJsConfirm(Object view, String message, JsResult result) {
    AlertManager.addAlertForView(getViewAdapterFor(view), new AndroidAlert(message, result));
  }

  public void onJsPrompt(Object view, String message, String defaultValue,
      JsPromptResult result) {
    AlertManager.addAlertForView(getViewAdapterFor(view),
        new AndroidAlert(message, result, defaultValue));
  }

  public void onGeolocationPermissionsShowPrompt(String origin,
      GeolocationPermissions.Callback callback) {
    callback.invoke(origin, true, true);
  }

  public void onJsTimeout() {
    Logger.log(Level.WARNING, WebDriverChromeClient.class.getName(), "onJsTimeout",
        "WARNING THE JAVASCRIPT EXECUTING TIMED OUT!");
  }
}
