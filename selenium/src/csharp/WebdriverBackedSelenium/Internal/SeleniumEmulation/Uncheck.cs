using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class Uncheck : SeleneseCommand
    {
        ElementFinder finder;

        public Uncheck(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string ignored)
        {
            IWebElement element = finder.FindElement(driver, locator);
            if (element.Selected == true)
            {
                element.Toggle();
            }
            return null;
        }
    }
}
