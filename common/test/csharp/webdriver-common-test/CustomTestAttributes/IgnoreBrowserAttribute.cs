using System;

namespace OpenQA.Selenium
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
    public class IgnoreBrowserAttribute : Attribute
    {
        private Browser browser;
        private string ignoreReason = string.Empty;

        public IgnoreBrowserAttribute(Browser browser)
        {
            this.browser = browser;
        }

        public IgnoreBrowserAttribute(Browser browser, string reason)
            : this(browser)
        {
            ignoreReason = reason;
        }
        
        public Browser Value
        {
            get { return browser; }
        }

        public string Reason
        {
            get { return ignoreReason; }
        }
    }
}
