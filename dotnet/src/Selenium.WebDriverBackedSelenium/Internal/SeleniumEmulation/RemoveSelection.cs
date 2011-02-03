using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the removeSelection keyword.
    /// </summary>
    internal class RemoveSelection : SeleneseCommand
    {
        private ElementFinder finder;
        private SeleniumOptionSelector selector;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoveSelection"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        /// <param name="optionSelector">The <see cref="SeleniumOptionSelector"/> used to select the object.</param>
        public RemoveSelection(ElementFinder elementFinder, SeleniumOptionSelector optionSelector)
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
                throw new SeleniumException("You may only remove a selection to a select that supports multiple selections");
            }

            this.selector.Select(driver, locator, value, false, false);

            return null;
        }
    }
}
