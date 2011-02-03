using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the isSomethingSelected keyword.
    /// </summary>
    internal class IsSomethingSelected : SeleneseCommand
    {
        private SeleniumOptionSelector selector;

        /// <summary>
        /// Initializes a new instance of the <see cref="IsSomethingSelected"/> class.
        /// </summary>
        /// <param name="optionSelector">A <see cref="SeleniumOptionSelector"/> used to get options in the select element.</param>
        public IsSomethingSelected(SeleniumOptionSelector optionSelector)
        {
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
            List<string> values = this.selector.GetOptions(driver, locator, SeleniumOptionSelector.Property.Text, false);
            return values.Count > 0;
        }
    }
}
