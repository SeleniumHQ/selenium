using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the isTextPresent keyword.
    /// </summary>
    internal class IsTextPresent : SeleneseCommand
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
            string script = JavaScriptLibrary.GetSeleniumScript("isTextPresent.js");

            object result = ((IJavaScriptExecutor)driver).ExecuteScript("return (" + script + ")(arguments[0]);", locator);

            // Handle the null case
            return result is bool && (bool)result;
        }
    }
}
