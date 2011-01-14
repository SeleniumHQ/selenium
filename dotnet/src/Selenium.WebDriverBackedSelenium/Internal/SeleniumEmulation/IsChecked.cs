using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class IsChecked : SeleneseCommand
    {
        private ElementFinder finder;

        public IsChecked(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string ignored)
        {
            return finder.FindElement(driver, locator).Selected;
        }
    }
}
