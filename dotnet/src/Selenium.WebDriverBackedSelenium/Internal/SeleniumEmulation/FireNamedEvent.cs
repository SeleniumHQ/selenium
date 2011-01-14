using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class FireNamedEvent : SeleneseCommand
    {
        private ElementFinder finder;
        private string name;

        public FireNamedEvent(ElementFinder elementFinder, string eventName)
        {
            finder = elementFinder;
            name = eventName;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            JavaScriptLibrary.CallEmbeddedSelenium(driver, "doFireEvent", element, name);

            return null;
        }
    }
}
