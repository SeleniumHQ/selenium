using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using Selenium.Internal.SeleniumEmulation;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the setNextConfirmationState keyword.
    /// </summary>
    internal class SetNextConfirmationState : SeleneseCommand
    {
        private bool result;

        /// <summary>
        /// Initializes a new instance of the <see cref="SetNextConfirmationState"/> class.
        /// </summary>
        /// <param name="result"><see langword="true"/> to click OK the next confirmation; <see langword="false"/> to click Cancel.</param>
        public SetNextConfirmationState(bool result)
        {
            this.result = result;
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
            ((IJavaScriptExecutor)driver).ExecuteScript("window.__webdriverNextConfirm = arguments[0]", this.result);
            return null;
        }
    }
}
