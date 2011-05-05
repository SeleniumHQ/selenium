using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getValue keyword.
    /// </summary>
    internal class GetValue : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="GetValue"/> class.
        /// </summary>
        /// <param name="finder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public GetValue(ElementFinder finder)
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
            IWebElement element = this.finder.FindElement(driver, locator);

            // Special-case handling for checkboxes: The Selenium API returs "on" for
            // checked checkboxes and off for unchecked ones. WebDriver will return "null" for
            // the "checked" attribute if the checkbox is not-checked, "true" otherwise.
            if (element.TagName == "input" && element.GetAttribute("type") == "checkbox")
            {
                if (element.GetAttribute("checked") == null)
                {
                    return "off";
                }
                else
                {
                    return "on";
                }
            }

            return element.GetAttribute("value");
        }
    }
}
