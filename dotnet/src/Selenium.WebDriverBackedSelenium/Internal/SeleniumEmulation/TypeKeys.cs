using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the typeKeys keyword.
    /// </summary>
    internal class TypeKeys : SeleneseCommand
    {
        private ElementFinder finder;
        private AlertOverride alertOverride;

        /// <summary>
        /// Initializes a new instance of the <see cref="TypeKeys"/> class.
        /// </summary>
        /// <param name="alertOverride">An <see cref="AlertOverride"/> object used to handle JavaScript alerts.</param>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public TypeKeys(AlertOverride alertOverride, ElementFinder elementFinder)
        {
            this.alertOverride = alertOverride;
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
            this.alertOverride.ReplaceAlertMethod();

            value = value.Replace("\\10", Keys.Enter);
            value = value.Replace("\\13", Keys.Return);
            value = value.Replace("\\27", Keys.Escape);
            value = value.Replace("\\38", Keys.ArrowUp);
            value = value.Replace("\\40", Keys.ArrowDown);
            value = value.Replace("\\37", Keys.ArrowLeft);
            value = value.Replace("\\39", Keys.ArrowRight);

            this.finder.FindElement(driver, locator).SendKeys(value);

            return null;
        }
    }
}
