using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the assignId keyword.
    /// </summary>
    internal class AssignId : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="AssignId"/> class.
        /// </summary>
        /// <param name="finder">An <see cref="ElementFinder"/> used in finding the element to which to assign the ID.</param>
        public AssignId(ElementFinder finder)
        {
            this.finder = finder;
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
            JavaScriptLibrary.ExecuteScript(driver, "arguments[0].id = arguments[1]", this.finder.FindElement(driver, locator), value);
            return null;
        }
    }
}
