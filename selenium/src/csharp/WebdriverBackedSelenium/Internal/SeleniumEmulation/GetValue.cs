using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetValue : SeleneseCommand
    {
        private ElementFinder finder;

        public GetValue(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            return finder.FindElement(driver, locator).Value;
        }
    }
}
