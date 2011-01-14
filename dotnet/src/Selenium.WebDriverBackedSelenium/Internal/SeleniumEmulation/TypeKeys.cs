using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class TypeKeys : SeleneseCommand
    {
        private ElementFinder finder;

        public TypeKeys(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            value = value.Replace("\\38", Keys.ArrowUp);
            value = value.Replace("\\40", Keys.ArrowDown);
            value = value.Replace("\\37", Keys.ArrowLeft);
            value = value.Replace("\\39", Keys.ArrowRight);

            finder.FindElement(driver, locator).SendKeys(value);

            return null;
        }
    }
}
