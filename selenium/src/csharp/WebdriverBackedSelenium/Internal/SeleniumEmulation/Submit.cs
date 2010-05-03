using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class Submit : SeleneseCommand
    {
        ElementFinder finder;

        public Submit(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            finder.FindElement(driver, locator).Submit();
            return null;
        }
    }
}
