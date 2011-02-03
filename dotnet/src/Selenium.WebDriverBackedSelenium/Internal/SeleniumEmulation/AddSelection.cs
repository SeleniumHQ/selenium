using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the addSelection keyword.
    /// </summary>
    internal class AddSelection : SeleneseCommand
    {
        private ElementFinder finder;
        private SeleniumOptionSelector selector;

        /// <summary>
        /// Initializes a new instance of the <see cref="AddSelection"/> class.
        /// </summary>
        /// <param name="elementFinder">The <see cref="ElementFinder"/> to use in finding elements.</param>
        /// <param name="optionSelector">A <see cref="SeleniumOptionSelector"/> to use in selecting the option.</param>
        public AddSelection(ElementFinder elementFinder, SeleniumOptionSelector optionSelector)
        {
            this.finder = elementFinder;
            this.selector = optionSelector;
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
            if (!SeleniumOptionSelector.IsMultiSelect(element))
            {
                throw new SeleniumException("You may only add a selection to a select that supports multiple selections");
            }

            this.selector.Select(driver, locator, value, true, false);
            return null;
        }
    }
}
