using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the isOrdered keyword.
    /// </summary>
    internal class IsOrdered : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="IsOrdered"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public IsOrdered(ElementFinder elementFinder)
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
            IWebElement one = this.finder.FindElement(driver, locator);
            IWebElement two = this.finder.FindElement(driver, value);

            string ordered =
              "    if (arguments[0] === arguments[1]) return false;\n" +
              "\n" +
              "    var previousSibling;\n" +
              "    while ((previousSibling = arguments[1].previousSibling) != null) {\n" +
              "        if (previousSibling === arguments[0]) {\n" +
              "            return true;\n" +
              "        }\n" +
              "        arguments[1] = previousSibling;\n" +
              "    }\n" +
              "    return false;\n";

            bool? result = (bool)JavaScriptLibrary.ExecuteScript(driver, ordered, one, two);
            return result != null && result.Value;
        }
    }
}
