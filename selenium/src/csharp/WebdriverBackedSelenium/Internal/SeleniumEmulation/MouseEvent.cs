using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class MouseEvent : SeleneseCommand
    {
        private ElementFinder finder;
        private JavaScriptLibrary library;
        private string type;

        public MouseEvent(ElementFinder elementFinder, JavaScriptLibrary js, string eventType)
        {
            finder = elementFinder;
            library = js;
            type = eventType;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            library.CallEmbeddedSelenium(driver, "triggerMouseEvent", element, type, true);
            return null;
        }
    }
}
