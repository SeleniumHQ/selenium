using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the findFirstSelectedOptionProperty keyword.
    /// </summary>
    internal class FindFirstSelectedOptionProperty : SeleneseCommand
    {
        private SeleniumOptionSelector selector;
        private SeleniumOptionSelector.Property property;

        /// <summary>
        /// Initializes a new instance of the <see cref="FindFirstSelectedOptionProperty"/> class.
        /// </summary>
        /// <param name="optionSelect">A <see cref="SeleniumOptionSelector"/> that gets options from the element.</param>
        /// <param name="property">The property on which to select the options.</param>
        public FindFirstSelectedOptionProperty(SeleniumOptionSelector optionSelect, SeleniumOptionSelector.Property property)
        {
            this.selector = optionSelect;
            this.property = property;
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
            List<string> options = this.selector.GetOptions(driver, locator, this.property, false);
            return options[0];
        }
    }
}
