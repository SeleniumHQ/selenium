using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the selectOption keyword.
    /// </summary>
    internal class SelectOption : SeleneseCommand
    {
        private ElementFinder finder;
        private AlertOverride alertOverride;

        /// <summary>
        /// Initializes a new instance of the <see cref="SelectOption"/> class.
        /// </summary>
        /// <param name="alertOverride">An <see cref="AlertOverride"/> object used to handle JavaScript alerts.</param>
        /// <param name="finder">The <see cref="ElementFinder"/> used in selecting the option.</param>
        public SelectOption(AlertOverride alertOverride, ElementFinder finder)
        {
            this.finder = finder;
            this.alertOverride = alertOverride;
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
            this.alertOverride.ReplaceAlertMethod();
            SeleniumSelect select = new SeleniumSelect(this.finder, driver, locator);
            select.SetSelected(value);
            return null;
        }
    }
}
