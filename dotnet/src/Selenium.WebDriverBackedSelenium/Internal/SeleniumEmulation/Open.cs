using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using Selenium.Internal.SeleniumEmulation;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the open keyword.
    /// </summary>
    internal class Open : SeleneseCommand
    {
        private Uri baseUrl;

        /// <summary>
        /// Initializes a new instance of the <see cref="Open"/> class.
        /// </summary>
        /// <param name="baseUrl">The base URL to open with the command.</param>
        public Open(Uri baseUrl)
        {
            this.baseUrl = baseUrl;
        }

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string urlToOpen = this.ConstructUrl(locator);
            driver.Url = urlToOpen;
            return null;
        }

        private string ConstructUrl(string path)
        {
            string urlToOpen = path.Contains("://") ?
                               path :
                               this.baseUrl.ToString() + (!path.StartsWith("/", StringComparison.Ordinal) ? "/" : string.Empty) + path;

            return urlToOpen;
        }
    }
}
