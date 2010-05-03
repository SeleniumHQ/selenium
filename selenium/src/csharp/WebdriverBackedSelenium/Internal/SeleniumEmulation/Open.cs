using System;
using System.Collections.Generic;
using System.Text;
using Selenium.Internal.SeleniumEmulation;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class Open : SeleneseCommand
    {
        private string baseUrl;

        public Open(string baseUrl)
        {
            this.baseUrl = baseUrl;
        }

        protected override Object HandleSeleneseCommand(IWebDriver driver, string url, string ignored)
        {
            String urlToOpen = url.Contains("://") ?
                               url :
                               baseUrl + (!url.StartsWith("/") ? "/" : "") + url;

            driver.Url = urlToOpen;
            return null;
        }
    }
}
