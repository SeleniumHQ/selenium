using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class FireEvent : SeleneseCommand
    {
        JavaScriptLibrary library;
        ElementFinder finder;

        public FireEvent(ElementFinder elementFinder, JavaScriptLibrary javascriptLibrary)
        {
            library = javascriptLibrary;
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            library.CallEmbeddedSelenium(driver, "doFireEvent", element, value);

            return null;
        }
    }
}
