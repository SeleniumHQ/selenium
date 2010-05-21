using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class IsOrdered : SeleneseCommand
    {
        private ElementFinder finder;

        public IsOrdered(ElementFinder elementFinder)
        {
            this.finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement one = finder.FindElement(driver, locator);
            IWebElement two = finder.FindElement(driver, value);

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
