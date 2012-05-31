using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the createCookie keyword.
    /// </summary>
    internal class CreateCookie : SeleneseCommand
    {
        private readonly Regex nameValuePairRegex = new Regex("([^\\s=\\[\\]\\(\\),\"\\/\\?@:;]+)=([^=\\[\\]\\(\\),\"\\/\\?@:;]*)");
        private readonly Regex maxAgeRegex = new Regex("max_age=(\\d+)");
        private readonly Regex pathRegex = new Regex("path=([^\\s,]+)[,]?");

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            if (!this.nameValuePairRegex.IsMatch(locator))
            {
                throw new SeleniumException("Invalid parameter: " + locator);
            }

            Match nameValueMatch = this.nameValuePairRegex.Match(locator);
            string cookieName = nameValueMatch.Groups[1].Value;
            string cookieValue = nameValueMatch.Groups[2].Value;

            DateTime? maxAge = null;
            if (this.maxAgeRegex.IsMatch(value))
            {
                Match maxAgeMatch = this.maxAgeRegex.Match(value);
                maxAge = DateTime.Now.AddSeconds(int.Parse(maxAgeMatch.Groups[1].Value, CultureInfo.InvariantCulture));
            }

            string path = string.Empty;
            if (this.pathRegex.IsMatch(value))
            {
                Match pathMatch = this.pathRegex.Match(value);
                path = pathMatch.Groups[1].Value;
                try
                {
                    if (path.StartsWith("http", StringComparison.Ordinal))
                    {
                        path = new Uri(path).AbsolutePath;
                    }
                }
                catch (UriFormatException)
                {
                    // Fine.
                }
            }
            else
            {
                path = new Uri(driver.Url).AbsolutePath;
            }

            Cookie cookie = new Cookie(cookieName, cookieValue, path, maxAge);
            driver.Manage().Cookies.AddCookie(cookie);

            return null;
        }
    }
}
