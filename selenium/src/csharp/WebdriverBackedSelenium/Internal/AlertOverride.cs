using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal
{
    internal class AlertOverride
    {
        public void ReplaceAlertMethod(IWebDriver driver)
        {
            ((IJavaScriptExecutor)driver).ExecuteScript(
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

        public string GetNextAlert(IWebDriver driver)
        {
            string result = (string)((IJavaScriptExecutor)driver).ExecuteScript(
              "if (!window.__webdriverAlerts) { return null }; " +
              "var t = window.__webdriverAlerts.shift();" +
              "if (t) { t = t.replace(/\\n/g, ' '); } " +
              "return t;"
            );

            if (result == null)
            {
                throw new SeleniumException("There were no alerts");
            }

            return result;
        }

        public bool IsAlertPresent(IWebDriver driver)
        {
            bool alertPresent = (bool)((IJavaScriptExecutor)driver).ExecuteScript(
              "return window.__webdriverAlerts && window.__webdriverAlerts.length > 0;"
            );

            return alertPresent;
        }

        public string GetNextConfirmation(IWebDriver driver)
        {
            string result = (string)((IJavaScriptExecutor)driver).ExecuteScript(
                "if (!window.__webdriverConfirms) { return null; } " +
                "return window.__webdriverConfirms.shift();"
            );

            if (result == null)
            {
                throw new SeleniumException("There were no confirmations");
            }

            return result;
        }

        public bool IsConfirmationPresent(IWebDriver driver)
        {
            bool confirmPresent = (bool)((IJavaScriptExecutor)driver).ExecuteScript(
              "return window.__webdriverConfirms && window.__webdriverConfirms.length > 0;"
            );

            return confirmPresent;
        }
    }
}
