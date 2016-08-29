// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package com.thoughtworks.selenium.webdriven.commands;

import static com.google.common.base.Preconditions.checkState;

import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class AlertOverride {

  private final boolean enableOverrides;

  public AlertOverride(boolean enableOverrides) {
    this.enableOverrides = enableOverrides;
  }

  public void replaceAlertMethod(WebDriver driver) {
    if (!enableOverrides) {
      return;
    }

    ((JavascriptExecutor) driver).executeScript(
        "var canUseLocalStorage = false; " +
        "try { canUseLocalStorage = !!window.localStorage; } catch(ex) { /* probe failed */ } " +
        "var canUseJSON = false; " +
        "try { canUseJSON = !!JSON; } catch(ex) { /* probe failed */ } " +
        "if (canUseLocalStorage && canUseJSON) { " +
        "  window.localStorage.setItem('__webdriverAlerts', JSON.stringify([])); " +
        "  window.alert = function(msg) { " +
        "    var alerts = JSON.parse(window.localStorage.getItem('__webdriverAlerts')); " +
        "    alerts.push(msg); " +
        "    window.localStorage.setItem('__webdriverAlerts', JSON.stringify(alerts)); " +
        "  }; " +
        "  window.localStorage.setItem('__webdriverConfirms', JSON.stringify([])); " +
        "  if (!('__webdriverNextConfirm' in window.localStorage)) { " +
        "    window.localStorage.setItem('__webdriverNextConfirm', JSON.stringify(true)); " +
        "  } " +
        "  window.confirm = function(msg) { " +
        "    var confirms = JSON.parse(window.localStorage.getItem('__webdriverConfirms')); " +
        "    confirms.push(msg); " +
        "    window.localStorage.setItem('__webdriverConfirms', JSON.stringify(confirms)); " +
        "    var res = JSON.parse(window.localStorage.getItem('__webdriverNextConfirm')); " +
        "    window.localStorage.setItem('__webdriverNextConfirm', JSON.stringify(true)); " +
        "    return res; " +
        "  }; " +
        "  window.localStorage.setItem('__webdriverPrompts', JSON.stringify([])); " +
        "  if (!('__webdriverNextPrompt' in window.localStorage)) { " +
        "    window.localStorage.setItem('__webdriverNextPrompt', JSON.stringify(true)); " +
        "  } " +
        "  window.prompt = function(msg, def) { " +
        "    var prompts = JSON.parse(window.localStorage.getItem('__webdriverPrompts')); " +
        "    prompts.push(msg || def); " +
        "    window.localStorage.setItem('__webdriverPrompts', JSON.stringify(prompts)); " +
        "    var res = JSON.parse(window.localStorage.getItem('__webdriverNextPrompts')); " +
        "    window.localStorage.setItem('__webdriverNextPrompts', JSON.stringify(true)); " +
        "    return res; " +
        "  }; " +
        "} else { " +
        "  if (window.__webdriverAlerts) { return; } " +
        "  window.__webdriverAlerts = []; " +
        "  window.alert = function(msg) { window.__webdriverAlerts.push(msg); }; " +
        "  window.__webdriverConfirms = []; " +
        "  window.__webdriverNextConfirm = true; " +
        "  window.confirm = function(msg) { " +
        "    window.__webdriverConfirms.push(msg); " +
        "    var res = window.__webdriverNextConfirm; " +
        "    window.__webdriverNextConfirm = true; " +
        "    return res; " +
        "  }; " +
        "  window.__webdriverPrompts = []; " +
        "  window.__webdriverNextPrompts = true; " +
        "  window.prompt = function(msg, def) { " +
        "    window.__webdriverPrompt.push(msg || def); " +
        "    var res = window.__webdriverNextPrompt; " +
        "    window.__webdriverNextPrompt = true; " +
        "    return res; " +
        "  }; " +
        "}"
      );
  }

  private void checkOverridesEnabled() {
    checkState(enableOverrides,
          "Selenium alert overrides have been disabled; please use the underlying WebDriver API");
  }

  public String getNextAlert(WebDriver driver) {
    checkOverridesEnabled();
    String result = (String) ((JavascriptExecutor) driver).executeScript(
        "var canUseLocalStorage = false; " +
        "try { canUseLocalStorage = !!window.localStorage; } catch(ex) { /* probe failed */ } " +
        "var canUseJSON = false; " +
        "try { canUseJSON = !!JSON; } catch(ex) { /* probe failed */ } " +
        "if (canUseLocalStorage && canUseJSON) { " +
        "  if (!('__webdriverAlerts' in window.localStorage)) { return null } " +
        "  var alerts = JSON.parse(window.localStorage.getItem('__webdriverAlerts')); " +
        "  if (! alerts) { return null } " +
        "  var t = alerts.shift(); " +
        "  window.localStorage.setItem('__webdriverAlerts', JSON.stringify(alerts)); " +
        "  if (t) { t = t.replace(/\\n/g, ' '); } " +
        "  return t; " +
        "} else { " +
        "  if (!window.__webdriverAlerts) { return null } " +
        "  var t = window.__webdriverAlerts.shift(); " +
        "  if (t) { t = t.replace(/\\n/g, ' '); } " +
        "  return t; " +
        "}"
      );

    if (result == null) {
      throw new SeleniumException("There were no alerts");
    }

    return result;
  }

  public boolean isAlertPresent(WebDriver driver) {
    checkOverridesEnabled();
    return Boolean.TRUE.equals(((JavascriptExecutor) driver).executeScript(
        "var canUseLocalStorage = false; " +
        "try { canUseLocalStorage = !!window.localStorage; } catch(ex) { /* probe failed */ } " +
        "var canUseJSON = false; " +
        "try { canUseJSON = !!JSON; } catch(ex) { /* probe failed */ } " +
        "if (canUseLocalStorage && canUseJSON) { " +
        "  if (!('__webdriverAlerts' in window.localStorage)) { return false } " +
        "  var alerts = JSON.parse(window.localStorage.getItem('__webdriverAlerts')); " +
        "  return alerts && alerts.length > 0; " +
        "} else { " +
        "  return window.__webdriverAlerts && window.__webdriverAlerts.length > 0; " +
        "}"
      ));
  }

  public String getNextConfirmation(WebDriver driver) {
    checkOverridesEnabled();
    String result = (String) ((JavascriptExecutor) driver).executeScript(
        "var canUseLocalStorage = false; " +
        "try { canUseLocalStorage = !!window.localStorage; } catch(ex) { /* probe failed */ } " +
        "var canUseJSON = false; " +
        "try { canUseJSON = !!JSON; } catch(ex) { /* probe failed */ } " +
        "if (canUseLocalStorage && canUseJSON) { " +
        "  if (!('__webdriverConfirms' in window.localStorage)) { return null } " +
        "  var confirms = JSON.parse(window.localStorage.getItem('__webdriverConfirms')); " +
        "  if (! confirms) { return null } " +
        "  var t = confirms.shift(); " +
        "  window.localStorage.setItem('__webdriverConfirms', JSON.stringify(confirms)); " +
        "  if (t) { t = t.replace(/\\n/g, ' '); } " +
        "  return t; " +
        "} else { " +
        "  if (!window.__webdriverConfirms) { return null; } " +
        "  return window.__webdriverConfirms.shift(); " +
        "}"
      );

    if (result == null) {
      throw new SeleniumException("There were no confirmations");
    }

    return result;
  }

  public boolean isConfirmationPresent(WebDriver driver) {
    checkOverridesEnabled();
    return Boolean.TRUE.equals(((JavascriptExecutor) driver).executeScript(
        "var canUseLocalStorage = false; " +
        "try { canUseLocalStorage = !!window.localStorage; } catch(ex) { /* probe failed */ } " +
        "var canUseJSON = false; " +
        "try { canUseJSON = !!JSON; } catch(ex) { /* probe failed */ } " +
        "if (canUseLocalStorage && canUseJSON) { " +
        "  if (!('__webdriverConfirms' in window.localStorage)) { return false } " +
        "  var confirms = JSON.parse(window.localStorage.getItem('__webdriverConfirms')); " +
        "  return confirms && confirms.length > 0; " +
        "} else { " +
        "  return window.__webdriverConfirms && window.__webdriverConfirms.length > 0; " +
        "}"
      ));
  }

  public boolean isPromptPresent(WebDriver driver) {
    checkOverridesEnabled();
    return Boolean.TRUE.equals(((JavascriptExecutor) driver).executeScript(
      "var canUseLocalStorage = false; " +
      "try { canUseLocalStorage = !!window.localStorage; } catch(ex) { /* probe failed */ } " +
      "var canUseJSON = false; " +
      "try { canUseJSON = !!JSON; } catch(ex) { /* probe failed */ } " +
      "if (canUseLocalStorage && canUseJSON) { " +
      "  if (!('__webdriverPrompts' in window.localStorage)) { return false } " +
      "  var prompts = JSON.parse(window.localStorage.getItem('__webdriverPrompts')); " +
      "  return prompts && prompts.length > 0; " +
      "} else { " +
      "  return window.__webdriverPrompts && window.__webdriverPrompts.length > 0; " +
      "}"
    ));
  }
}
