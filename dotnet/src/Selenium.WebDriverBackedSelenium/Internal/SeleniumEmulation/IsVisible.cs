using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class IsVisible : SeleneseCommand
    {
        private ElementFinder finder;

        public IsVisible(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string ignored)
        {
            return ((IRenderedWebElement)finder.FindElement(driver, locator)).Displayed;
        }
    }
}
