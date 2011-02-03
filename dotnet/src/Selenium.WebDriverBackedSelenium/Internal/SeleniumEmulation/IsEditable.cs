using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the isEditable keyword.
    /// </summary>
    internal class IsEditable : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="IsEditable"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public IsEditable(ElementFinder elementFinder)
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
            IWebElement element = this.finder.FindElement(driver, locator);
            string tagName = element.TagName.ToUpperInvariant();
            bool acceptableTagName = tagName == "INPUT" || tagName == "SELECT";
            string readOnlyAttribute = string.Empty;
            if (tagName == "INPUT")
            {
                readOnlyAttribute = element.GetAttribute("readonly");
                if (readOnlyAttribute != null && readOnlyAttribute == "false")
                {
                    readOnlyAttribute = string.Empty;
                }
            }

            return element.Enabled && acceptableTagName && string.IsNullOrEmpty(readOnlyAttribute);
        }
    }
}
