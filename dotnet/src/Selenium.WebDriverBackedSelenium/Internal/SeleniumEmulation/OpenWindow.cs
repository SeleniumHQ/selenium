using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the openWindow keyword.
    /// </summary>
    internal class OpenWindow : SeleneseCommand
    {
        private GetEval opener;

        /// <summary>
        /// Initializes a new instance of the <see cref="OpenWindow"/> class.
        /// </summary>
        /// <param name="windowOpener">A <see cref="GetEval"/> object that opens the window.</param>
        public OpenWindow(GetEval windowOpener)
        {
            this.opener = windowOpener;
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
            string[] args = { string.Format(CultureInfo.InvariantCulture, "window.open('{0}', '{1}');", locator, value) };

            this.opener.Apply(driver, args);

            return null;
        }
    }
}
