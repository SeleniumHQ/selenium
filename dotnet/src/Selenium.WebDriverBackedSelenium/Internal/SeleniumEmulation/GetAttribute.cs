using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getAttribute keyword.
    /// </summary>
    internal class GetAttribute : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="GetAttribute"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public GetAttribute(ElementFinder elementFinder)
        {
            this.finder = elementFinder;
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
            int attributePos = locator.LastIndexOf("@", StringComparison.Ordinal);
            string elementLocator = locator.Substring(0, attributePos);
            string attributeName = locator.Substring(attributePos + 1);

            // Find the element.
            IWebElement element = this.finder.FindElement(driver, elementLocator);
            return element.GetAttribute(attributeName);
        }
    }
}
