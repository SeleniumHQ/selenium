// <copyright file="AlertOverride.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using OpenQA.Selenium;

namespace Selenium.Internal
{
    /// <summary>
    /// Provides methods for overriding the JavaScript alert() and confirm() methods.
    /// </summary>
    internal class AlertOverride
    {
        private IWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the AlertOverride class.
        /// </summary>
        /// <param name="driver">The driver to use in overriding the JavaScript alert() and confirm() methods.</param>
        public AlertOverride(IWebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Replaces the JavaScript alert() and confirm() methods.
        /// </summary>
        public void ReplaceAlertMethod()
        {
            ((IJavaScriptExecutor)this.driver).ExecuteScript(
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
                "}"
              );
        }

        /// <summary>
        /// Gets the next JavaScript alert message.
        /// </summary>
        /// <returns>The text of the next alert message.</returns>
        public string GetNextAlert()
        {
            string result = (string)((IJavaScriptExecutor)this.driver).ExecuteScript(
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

            if (result == null)
            {
                throw new SeleniumException("There were no alerts");
            }

            return result;
        }

        /// <summary>
        /// Gets a value indicating whether a JavaScript alert is present.
        /// </summary>
        /// <returns><see langword="true"/> if an alert is present; otherwise <see langword="false"/>.</returns>
        public bool IsAlertPresent()
        {
            bool alertPresent = false;
            object alertResult = ((IJavaScriptExecutor)this.driver).ExecuteScript(
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
              );
            if (alertResult != null)
            {
                alertPresent = (bool)alertResult;
            }

            return alertPresent;
        }

        /// <summary>
        /// Gets the next JavaScript confirm message.
        /// </summary>
        /// <returns>The text of the next confirm message.</returns>
        public string GetNextConfirmation()
        {
            string result = (string)((IJavaScriptExecutor)this.driver).ExecuteScript(
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

            if (result == null)
            {
                throw new SeleniumException("There were no confirmations");
            }

            return result;
        }

        /// <summary>
        /// Gets a value indicating whether a JavaScript confirm is present.
        /// </summary>
        /// <returns><see langword="true"/> if an confirm is present; otherwise <see langword="false"/>.</returns>
        public bool IsConfirmationPresent()
        {
            bool confirmPresent = false;
            object confirmResult = ((IJavaScriptExecutor)this.driver).ExecuteScript(
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
              );
            if (confirmResult != null)
            {
                confirmPresent = (bool)confirmResult;
            }

            return confirmPresent;
        }
    }
}
