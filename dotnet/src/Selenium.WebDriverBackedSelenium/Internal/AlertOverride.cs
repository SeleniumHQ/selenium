using System;
using System.Collections.Generic;
using System.Text;
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
              "};");
        }

        /// <summary>
        /// Gets the next JavaScript alert message.
        /// </summary>
        /// <returns>The text of the next alert message.</returns>
        public string GetNextAlert()
        {
            string result = (string)((IJavaScriptExecutor)this.driver).ExecuteScript(
              "if (!window.__webdriverAlerts) { return null }; " +
              "var t = window.__webdriverAlerts.shift();" +
              "if (t) { t = t.replace(/\\n/g, ' '); } " +
              "return t;");

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
              "return window.__webdriverAlerts && window.__webdriverAlerts.length > 0;");
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
                "if (!window.__webdriverConfirms) { return null; } " +
                "return window.__webdriverConfirms.shift();");

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
              "return window.__webdriverConfirms && window.__webdriverConfirms.length > 0;");
            if (confirmResult != null)
            {
                confirmPresent = (bool)confirmResult;
            }

            return confirmPresent;
        }
    }
}
