using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class GetValue : SeleneseCommand
    {

        ElementFinder finder;

        public GetValue(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            return finder.FindElement(driver, locator).Value;
        }
    }
}
