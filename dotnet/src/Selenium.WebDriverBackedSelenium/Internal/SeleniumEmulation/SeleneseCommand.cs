using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the base class for a command.
    /// </summary>
    internal abstract class SeleneseCommand
    {
        /// <summary>
        /// Applies the arguments to the command.
        /// </summary>
        /// <param name="driver">The driver to use in executing the command.</param>
        /// <param name="args">The command arguments.</param>
        /// <returns>The result of the command.</returns>
        internal object Apply(IWebDriver driver, string[] args)
        {
            switch (args.Length)
            {
                case 0:
                    return this.HandleSeleneseCommand(driver, null, null);

                case 1:
                    return this.HandleSeleneseCommand(driver, args[0], null);

                case 2:
                    return this.HandleSeleneseCommand(driver, args[0], args[1]);

                default:
                    throw new SeleniumException("Too many arguments! " + args.Length);
            }
        }

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected abstract object HandleSeleneseCommand(IWebDriver driver, string locator, string value);
    }
}
