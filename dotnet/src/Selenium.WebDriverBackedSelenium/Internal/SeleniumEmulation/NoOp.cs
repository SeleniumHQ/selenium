using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the noOp keyword.
    /// </summary>
    internal class NoOp : SeleneseCommand
    {
        private object returnValue;

        /// <summary>
        /// Initializes a new instance of the <see cref="NoOp"/> class.
        /// </summary>
        /// <param name="toReturn">An object to return as the result of the command.</param>
        public NoOp(object toReturn)
        {
            this.returnValue = toReturn;
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
            return this.returnValue;
        }
    }
}
