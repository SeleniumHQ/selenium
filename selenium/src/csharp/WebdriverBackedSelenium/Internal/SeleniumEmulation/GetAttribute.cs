using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetAttribute : SeleneseCommand
    {
        private ElementFinder finder;

        public GetAttribute(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            int attributePos = locator.LastIndexOf("@", StringComparison.Ordinal);
            string elementLocator = locator.Substring(0, attributePos);
            string attributeName = locator.Substring(attributePos + 1);

            // Find the element.
            IWebElement element = finder.FindElement(driver, elementLocator);
            return element.GetAttribute(attributeName);
        }
    }
}
