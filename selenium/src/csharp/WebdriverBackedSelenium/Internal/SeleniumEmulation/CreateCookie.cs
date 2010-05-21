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
        private readonly Regex NameValuePairRegex = new Regex("([^\\s=\\[\\]\\(\\),\"\\/\\?@:;]+)=([^=\\[\\]\\(\\),\"\\/\\?@:;]*)");
        private readonly Regex MaxAgeRegex = new Regex("max_age=(\\d+)");
        private readonly Regex PathRegex = new Regex("path=([^\\s,]+)[,]?");

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            if (!NameValuePairRegex.IsMatch(locator))
            {
                throw new SeleniumException("Invalid parameter: " + locator);
            }

            Match nameValueMatch = NameValuePairRegex.Match(locator);
            string cookieName = nameValueMatch.Groups[0].Value;
            string cookieValue = nameValueMatch.Groups[1].Value;

            DateTime? maxAge = null;
            if (MaxAgeRegex.IsMatch(value))
            {
                Match maxAgeMatch = MaxAgeRegex.Match(value);
                maxAge = DateTime.Now.AddSeconds(int.Parse(maxAgeMatch.Groups[0].Value, CultureInfo.InvariantCulture));
            }

            string path = string.Empty;
            if (PathRegex.IsMatch(value))
            {
                Match pathMatch = PathRegex.Match(value);
                path = pathMatch.Groups[0].Value;
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

            Cookie cookie = new Cookie(cookieName, value, path, maxAge);
            driver.Manage().AddCookie(cookie);

            return null;
        }
    }
}
