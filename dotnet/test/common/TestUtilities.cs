using System;

namespace OpenQA.Selenium
{
    public class TestUtilities
    {
        private static IJavaScriptExecutor GetExecutor(IWebDriver driver)
        {
            return driver as IJavaScriptExecutor;
        }

        private static string GetUserAgent(IWebDriver driver)
        {
            try
            {
                return (string)GetExecutor(driver).ExecuteScript("return navigator.userAgent;");
            }
            catch (Exception)
            {
                // Some drivers will only execute JS once a page has been loaded. Since those
                // drivers aren't Firefox or IE, we don't worry about that here.
                //
                // Non-javascript-enabled HtmlUnit throws an UnsupportedOperationException here.
                // Let's just ignore that.
                return "";
            }
        }

        public static bool IsChrome(IWebDriver driver)
        {
            return GetUserAgent(driver).Contains("Chrome");
        }

        public static bool IsFirefox(IWebDriver driver)
        {
            return GetUserAgent(driver).Contains("Firefox");
        }

        public static bool IsInternetExplorer(IWebDriver driver)
        {
            string userAgent = GetUserAgent(driver);
            return userAgent.Contains("MSIE") || userAgent.Contains("Trident");
        }

        public static bool IsIE6(IWebDriver driver)
        {
            return IsInternetExplorer(driver) && GetUserAgent(driver).Contains("MSIE 6");
        }

        public static bool IsIE10OrHigher(IWebDriver driver)
        {
            if (IsInternetExplorer(driver))
            {
                string jsToExecute = "return window.navigator.appVersion;";
                // IE9 is trident version 5.  IE9 is the start of new IE.
                string appVersionString = (string)GetExecutor(driver).ExecuteScript(jsToExecute);
                int tokenStart = appVersionString.IndexOf("MSIE ") + 5;
                int tokenEnd = appVersionString.IndexOf(";", tokenStart);
                if (tokenEnd - tokenStart > 0)
                {
                    string substring = appVersionString.Substring(tokenStart, tokenEnd - tokenStart);
                    double version = 0;
                    bool parsed = double.TryParse(substring, out version);
                    if (parsed)
                    {
                        return version >= 10;
                    }
                }
            }

            return false;
        }

        public static bool IsOldIE(IWebDriver driver)
        {
            try
            {
                string jsToExecute = "return parseInt(window.navigator.appVersion.split(' ')[0]);";
                // IE9 is trident version 5.  IE9 is the start of new IE.
                return (long)(GetExecutor(driver).ExecuteScript(jsToExecute)) < 5;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public static bool IsNativeEventsEnabled(IWebDriver driver)
        {
            IHasCapabilities hasCaps = driver as IHasCapabilities;
            if (hasCaps != null)
            {
                object cap = hasCaps.Capabilities.GetCapability(OpenQA.Selenium.CapabilityType.HasNativeEvents);
                if (cap != null && cap is bool)
                {
                    return (bool)cap;
                }
            }

            return false;
        }
    }
}
