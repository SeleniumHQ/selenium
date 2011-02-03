using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getAllLinks keyword.
    /// </summary>
    internal class GetAllLinks : SeleneseCommand
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
            ReadOnlyCollection<IWebElement> allInputs = driver.FindElements(By.XPath("//a"));
            List<string> ids = new List<string>();

            foreach (IWebElement input in allInputs)
            {
                string elementId = input.GetAttribute("id");
                if (string.IsNullOrEmpty(elementId))
                {
                    ids.Add(string.Empty);
                }
                else
                {
                    ids.Add(elementId);
                }
            }

            return ids.ToArray();
        }
    }
}
