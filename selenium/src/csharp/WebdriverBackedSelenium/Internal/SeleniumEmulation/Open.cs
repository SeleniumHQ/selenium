using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class Open : SeleneseCommand
    {
        private string baseUrl;

        public Open(Uri baseUrl)
        {
            this.baseUrl = baseUrl.ToString();
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string url, string ignored)
        {
            string urlToOpen = url.Contains("://") ?
                               url :
                               baseUrl + (!url.StartsWith("/", StringComparison.Ordinal) ? "/" : string.Empty) + url;

            driver.Url = urlToOpen;
            return null;
        }
    }
}
