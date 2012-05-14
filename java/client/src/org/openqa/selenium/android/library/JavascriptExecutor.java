/*
Copyright 2010 Selenium committers

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

/**
 * Class that wraps synchronization housekeeping of execution of JavaScript code within WebView.
 */
class JavascriptExecutor {
  private static JavascriptResultNotifier resNotifier;
  
  /**
   * Executes a given JavaScript code within WebView and returns execution result. <p/> Note:
   * execution is limited in time to AndroidWebDriver.INTENT_TIMEOUT to prevent "application
   * not responding" alerts.
   *
   * @param jsCode JavaScript code to execute.
   */
  /* package */ static void executeJs(final ViewAdapter webview,
      JavascriptResultNotifier notifier, final String jsCode) {
    resNotifier = notifier;
    if (webview.getUrl() == null) {
      return;
    }
    webview.loadUrl("javascript:" + jsCode);
  }

  /**
   * Callback to report results of JavaScript code execution.
   *
   * @param result Results (if returned) or an empty string.
   */
  /* package */ void resultAvailable(String result) {
    resNotifier.notifyResultReady(result);
  }
}
