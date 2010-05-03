using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class IsElementPresent : SeleneseCommand
    {

        ElementFinder finder;

        public IsElementPresent(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            try
            {
                finder.FindElement(driver, locator);
                return true;
            }
            catch (SeleniumException)
            {
                return false;
            }
        }
    }
}
