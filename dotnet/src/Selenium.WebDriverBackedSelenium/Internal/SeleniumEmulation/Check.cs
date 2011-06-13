using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the check keyword.
    /// </summary>
    internal class Check : SeleneseCommand
    {
        private ElementFinder finder;
        private AlertOverride alert;

        /// <summary>
        /// Initializes a new instance of the <see cref="Check"/> class.
        /// </summary>
        /// <param name="alert">An <see cref="AlertOverride"/> object used to handle JavaScript alerts.</param>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public Check(AlertOverride alert, ElementFinder elementFinder)
        {
            this.finder = elementFinder;
            this.alert = alert;
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
            IWebElement element = this.finder.FindElement(driver, locator);
            element.Click();
            return null;
        }
    }
}
