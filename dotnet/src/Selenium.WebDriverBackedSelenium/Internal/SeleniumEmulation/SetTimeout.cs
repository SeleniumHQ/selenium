using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the setTimeout keyword.
    /// </summary>
    internal class SetTimeout : SeleneseCommand
    {
        private CommandTimer timer;

        /// <summary>
        /// Initializes a new instance of the <see cref="SetTimeout"/> class.
        /// </summary>
        /// <param name="timer">The <see cref="CommandTimer"/> object used to monitor timeouts for commands.</param>
        public SetTimeout(CommandTimer timer)
        {
            this.timer = timer;
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
            if (locator == "0")
            {
                this.timer.Timeout = int.MaxValue;
            }
            else
            {
                this.timer.Timeout = int.Parse(locator, CultureInfo.InvariantCulture);
            }

            return null;
        }
    }
}
