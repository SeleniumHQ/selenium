using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the isSomethingSelected keyword.
    /// </summary>
    internal class IsSomethingSelected : SeleneseCommand
    {
        private string script;

        /// <summary>
        /// Initializes a new instance of the <see cref="IsSomethingSelected"/> class.
        /// </summary>
        public IsSomethingSelected()
        {
            this.script = "return (" + JavaScriptLibrary.GetSeleniumScript("isSomethingSelected.js") + ").apply(null, arguments)";
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
            object returnValue = JavaScriptLibrary.ExecuteScript(driver, this.script, locator);
            return returnValue is bool && (bool)returnValue;
        }
    }
}
