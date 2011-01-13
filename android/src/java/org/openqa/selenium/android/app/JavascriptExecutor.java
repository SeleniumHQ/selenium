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

import android.util.Log;

import org.openqa.selenium.android.Logger;
import org.openqa.selenium.android.intents.Action;

/**
 * Class that wraps synchronization housekeeping of execution of JavaScript code within WebView.
 */
public class JavascriptExecutor {
  private String javascriptResult;
  private final WebDriverActivity context;
  private final WebDriverWebView webview;

  public JavascriptExecutor(WebDriverActivity context, WebDriverWebView webview) {
    this.context = context;
    this.webview = webview;
  }
  
  /**
   * Executes a given JavaScript code within WebView and returns execution result. <p/> Note:
   * execution is limited in time to AndroidDriver.INTENT_TIMEOUT to prevent "application
   * not responding" alerts.
   *
   * @param jsCode JavaScript code to execute.
   */
  public void executeJS(String jsCode) {
    javascriptResult = Action.NOT_DONE_INDICATOR;
    webview.loadUrl("javascript:" + jsCode);
  }
  
  /**
   * Callback to report results of JavaScript code execution.
   *
   * @param result Results (if returned) or an empty string.
   */
  public void resultAvailable(String result) {
    javascriptResult = result;
    context.sendIntent(Action.JAVASCRIPT_RESULT_AVAILABLE, result);
  }
  
  public String getResult() {
     return javascriptResult;
  }
}
