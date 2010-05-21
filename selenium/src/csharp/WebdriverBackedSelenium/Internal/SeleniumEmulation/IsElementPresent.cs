using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class IsElementPresent : SeleneseCommand
    {
        private ElementFinder finder;

        public IsElementPresent(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
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
