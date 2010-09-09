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

package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class AlertOverride {
  public void replaceAlertMethod(WebDriver driver) {
    ((JavascriptExecutor) driver).executeScript(
      "if (window.__webdriverAlerts) { return; } " +
      "window.__webdriverAlerts = []; " +
      "window.alert = function(msg) { window.__webdriverAlerts.push(msg); }"
    );
  }

  public String getNextAlert(WebDriver driver) {
    return (String) ((JavascriptExecutor) driver).executeScript(
      "if (!window.__webdriverAlerts) { return null }; " +
      "var t = window.__webdriverAlerts.shift();" +
      "if (t) { t = t.replace(/\\n/g, ' '); } " +
      "return t;"
    );
  }

  public boolean isAlertPresent(WebDriver driver) {
    return Boolean.TRUE.equals(((JavascriptExecutor) driver).executeScript(
      "return window.__webdriverAlerts && window.__webdriverAlerts.length > 0;"
    ));
  }
}
