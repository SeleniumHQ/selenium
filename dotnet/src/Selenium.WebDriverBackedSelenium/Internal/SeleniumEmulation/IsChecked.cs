using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the isChecked keyword.
    /// </summary>
    internal class IsChecked : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="IsChecked"/> class.
        /// </summary>
        /// <param name="finder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public IsChecked(ElementFinder finder)
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
        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            return this.finder.FindElement(driver, locator).Selected;
        }
    }
}
