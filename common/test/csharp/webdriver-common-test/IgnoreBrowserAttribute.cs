using System;

namespace OpenQa.Selenium
{

    [AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
    public class IgnoreBrowserAttribute : Attribute
    {

        private Browser browser;
        private string reason = "";

        public IgnoreBrowserAttribute(Browser browser)
        {
            this.browser = browser;
        }

        public IgnoreBrowserAttribute(Browser browser, String reason) : this(browser)
        {
            this.reason = reason;
        }
        
        public Browser Value
        {
            get { return browser; }
        }

        public String Reason
        {
            get { return Reason; }
        }
    }
}
