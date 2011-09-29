using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the click keyword.
    /// </summary>
    internal class ClickAt : SeleneseCommand
    {
        private ElementFinder finder;
        private AlertOverride alert;

        /// <summary>
        /// Initializes a new instance of the <see cref="ClickAt"/> class.
        /// </summary>
        /// <param name="alert">An <see cref="AlertOverride"/> object used to handle JavaScript alerts.</param>
        /// <param name="finder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public ClickAt(AlertOverride alert, ElementFinder finder)
        {
            this.finder = finder;
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
            String[] parts = value.Split(new Char[] { ',' });
            int xOffset = Int32.Parse(parts[0]);
            int yOffset = Int32.Parse(parts[1]);
            new Actions(driver).MoveToElement(element, xOffset, yOffset).Click().Perform();
            return null;
        }
    }
}
