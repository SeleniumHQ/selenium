using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class FireEvent : SeleneseCommand
    {
        private ElementFinder finder;

        public FireEvent(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            JavaScriptLibrary.CallEmbeddedSelenium(driver, "doFireEvent", element, value);

            return null;
        }
    }
}
