using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the deleteAllVisibleCookies keyword.
    /// </summary>
    internal class DeleteAllVisibleCookies : SeleneseCommand
    {
        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="ignored">The first parameter to the command.</param>
        /// <param name="alsoIgnored">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string ignored, string alsoIgnored)
        {
            driver.Manage().Cookies.DeleteAllCookies();
            return null;
        }
    }
}
