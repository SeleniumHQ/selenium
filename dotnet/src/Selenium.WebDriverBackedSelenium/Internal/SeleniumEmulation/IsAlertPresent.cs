using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the isAlertPresent keyword.
    /// </summary>
    internal class IsAlertPresent : SeleneseCommand
    {
        private AlertOverride alertOverride;

        /// <summary>
        /// Initializes a new instance of the <see cref="IsAlertPresent"/> class.
        /// </summary>
        /// <param name="alertOverride">An <see cref="AlertOverride"/> object used to handle JavaScript alerts.</param>
        public IsAlertPresent(AlertOverride alertOverride)
        {
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
            return this.alertOverride.IsAlertPresent();
        }
    }
}
