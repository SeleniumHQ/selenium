using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class DoubleClick : SeleneseCommand
    {
        private ElementFinder finder;

        public DoubleClick(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override Object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            element.Click();
            element.Click();
            return null;
        }
    }
}
