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

package org.openqa.selenium.internal.seleniumemulation;

import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class AlertOverride {
  public void replaceAlertMethod(WebDriver driver) {
    ((JavascriptExecutor) driver).executeScript(
        "if (window.__webdriverAlerts) { return; } " +
            "window.__webdriverAlerts = []; " +
            "window.alert = function(msg) { window.__webdriverAlerts.push(msg); }; " +
            "window.__webdriverConfirms = []; " +
            "window.__webdriverNextConfirm = true; " +
            "window.confirm = function(msg) { " +
            "  window.__webdriverConfirms.push(msg); " +
            "  var res = window.__webdriverNextConfirm; " +
            "  window.__webdriverNextConfirm = true; " +
            "  return res; " +
            "};"
        );
  }

  public String getNextAlert(WebDriver driver) {
    String result = (String) ((JavascriptExecutor) driver).executeScript(
        "if (!window.__webdriverAlerts) { return null }; " +
            "var t = window.__webdriverAlerts.shift();" +
            "if (t) { t = t.replace(/\\n/g, ' '); } " +
            "return t;"
        );

    if (result == null) {
      throw new SeleniumException("There were no alerts");
    }

    return result;
  }

  public boolean isAlertPresent(WebDriver driver) {
    return Boolean.TRUE.equals(((JavascriptExecutor) driver).executeScript(
        "return window.__webdriverAlerts && window.__webdriverAlerts.length > 0;"
        ));
  }

  public String getNextConfirmation(WebDriver driver) {
    String result = (String) ((JavascriptExecutor) driver).executeScript(
        "if (!window.__webdriverConfirms) { return null; } " +
            "return window.__webdriverConfirms.shift();"
        );

    if (result == null) {
      throw new SeleniumException("There were no confirmations");
    }

    return result;
  }

  public boolean isConfirmationPresent(WebDriver driver) {
    return Boolean.TRUE.equals(((JavascriptExecutor) driver).executeScript(
        "return window.__webdriverConfirms && window.__webdriverConfirms.length > 0;"
        ));
  }
}
