using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the isElementPresent keyword.
    /// </summary>
    internal class IsElementPresent : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="IsElementPresent"/> class.
        /// </summary>
        /// <param name="finder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public IsElementPresent(ElementFinder finder)
        {
            this.finder = finder;
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
            try
            {
                this.finder.FindElement(driver, locator);
                return true;
            }
            catch (SeleniumException)
            {
                return false;
            }
        }
    }
}
