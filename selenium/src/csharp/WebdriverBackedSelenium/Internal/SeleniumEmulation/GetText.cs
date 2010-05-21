using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetText : SeleneseCommand
    {
        private ElementFinder finder;

        public GetText(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string ignored)
        {
            return finder.FindElement(driver, locator).Text;
        }
    }
}
