using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class MouseEvent : SeleneseCommand
    {
        private ElementFinder finder;
        private string type;

        public MouseEvent(ElementFinder elementFinder, string eventType)
        {
            finder = elementFinder;
            type = eventType;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            JavaScriptLibrary.CallEmbeddedSelenium(driver, "triggerMouseEvent", element, type, true);
            return null;
        }
    }
}
