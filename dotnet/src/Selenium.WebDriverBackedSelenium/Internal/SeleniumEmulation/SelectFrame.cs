using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the selectFrame keyword.
    /// </summary>
    internal class SelectFrame : SeleneseCommand
    {
        private WindowSelector windows;

        /// <summary>
        /// Initializes a new instance of the <see cref="SelectFrame"/> class.
        /// </summary>
        /// <param name="windowSelector">An <see cref="WindowSelector"/> object used to select windows.</param>
        public SelectFrame(WindowSelector windowSelector)
        {
            this.windows = windowSelector;
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
            this.windows.SelectFrame(driver, locator);
            return null;
        }
    }
}
