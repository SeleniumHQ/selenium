using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getSelectOptions keyword.
    /// </summary>
    internal class GetSelectOptions : SeleneseCommand
    {
        private SeleniumOptionSelector selector;

        /// <summary>
        /// Initializes a new instance of the <see cref="GetSelectOptions"/> class.
        /// </summary>
        /// <param name="optionsSelector">A <see cref="SeleniumOptionSelector"/> used in getting the select options.</param>
        public GetSelectOptions(SeleniumOptionSelector optionsSelector)
        {
            this.selector = optionsSelector;
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
            List<string> allOptions = this.selector.GetOptions(driver, locator, SeleniumOptionSelector.Property.Text, true);

            return allOptions.ToArray();
        }
    }
}
