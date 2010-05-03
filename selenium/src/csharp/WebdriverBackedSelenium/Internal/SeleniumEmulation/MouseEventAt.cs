using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class MouseEventAt : SeleneseCommand
    {
        private ElementFinder finder;
        private JavaScriptLibrary library;
        private string type;

        public MouseEventAt(ElementFinder elementFinder, JavaScriptLibrary js, string eventType)
        {
            finder = elementFinder;
            library = js;
            type = eventType;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            library.CallEmbeddedSelenium(driver, "triggerMouseEventAt", element, type, true, value);
            return null;
        }
    }
}
