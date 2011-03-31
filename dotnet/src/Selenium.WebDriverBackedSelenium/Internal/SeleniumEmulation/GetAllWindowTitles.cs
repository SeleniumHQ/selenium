using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getAllWindowTitles keyword.
    /// </summary>
    internal class GetAllWindowTitles : SeleneseCommand
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
            string current = driver.CurrentWindowHandle;

            List<string> attributes = new List<string>();
            foreach (string handle in driver.WindowHandles)
            {
                driver.SwitchTo().Window(handle);
                attributes.Add(driver.Title);
            }

            driver.SwitchTo().Window(current);

            return attributes.ToArray();
        }
    }
}
