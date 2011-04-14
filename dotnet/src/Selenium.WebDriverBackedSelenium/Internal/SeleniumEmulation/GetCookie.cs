using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getCookie keyword.
    /// </summary>
    internal class GetCookie : SeleneseCommand
    {
        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            StringBuilder builder = new StringBuilder();
            foreach (Cookie c in driver.Manage().Cookies.AllCookies)
            {
                builder.Append(c.ToString());
                builder.Append("; ");
            }
            
            return builder.ToString();
        }
    }
}
