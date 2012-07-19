using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the submit keyword.
    /// </summary>
    internal class Submit : SeleneseCommand
    {
        private ElementFinder finder;
        private AlertOverride alert;

        /// <summary>
        /// Initializes a new instance of the <see cref="Submit"/> class.
        /// </summary>
        /// <param name="alert">An <see cref="AlertOverride"/> object used to override alerts displayed in an onSubmit event handler.</param>
        /// <param name="finder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public Submit(AlertOverride alert, ElementFinder finder)
        {
            this.alert = alert;
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
            this.alert.ReplaceAlertMethod();
            this.finder.FindElement(driver, locator).Submit();
            return null;
        }
    }
}
