using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class FireNamedEvent : SeleneseCommand
    {
        private JavaScriptLibrary library;
        private ElementFinder finder;
        private string name;

        public FireNamedEvent(ElementFinder elementFinder, JavaScriptLibrary javascriptLibrary, string eventName)
        {
            library = javascriptLibrary;
            finder = elementFinder;
            name = eventName;
        }
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            library.CallEmbeddedSelenium(driver, "doFireEvent", element, name);

            return null;
        }
    }
}
