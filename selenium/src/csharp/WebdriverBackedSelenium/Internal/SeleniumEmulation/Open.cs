using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using Selenium.Internal.SeleniumEmulation;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class Open : SeleneseCommand
    {
        private Uri baseUrl;

        public Open(Uri baseUrl)
        {
            this.baseUrl = baseUrl;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string url, string ignored)
        {
            string urlToOpen = ConstructUrl(baseUrl.ToString(), url);
            driver.Url = urlToOpen;
            return null;
        }

        private string ConstructUrl(string appUrl, string path)
        {
            string urlToOpen = appUrl.Contains("://") ?
                               appUrl :
                               baseUrl + (!appUrl.StartsWith("/", StringComparison.Ordinal) ? "/" : string.Empty) + path;

            return urlToOpen;
        }
    }
}
