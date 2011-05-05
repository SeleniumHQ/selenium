using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the addLocationStrategy keyword.
    /// </summary>
    internal class AddLocationStrategy : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="AddLocationStrategy"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> object used to locate elements.</param>
        public AddLocationStrategy(ElementFinder elementFinder)
        {
            this.finder = elementFinder;
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
            string strategy = string.Format(CultureInfo.InvariantCulture, @"return (function(locator, inWindow, inDocument) {{ {0} }}).call(null, arguments[0], window, document)", value);

            this.finder.AddStrategy(locator, strategy);

            return null;
        }
    }
}
