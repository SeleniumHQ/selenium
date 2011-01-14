using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class Submit : SeleneseCommand
    {
        private ElementFinder finder;

        public Submit(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            finder.FindElement(driver, locator).Submit();
            return null;
        }
    }
}
