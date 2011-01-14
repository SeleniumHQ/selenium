using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class Highlight : SeleneseCommand
    {
        private ElementFinder finder;

        public Highlight(ElementFinder elementFinder)
        {
            this.finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            JavaScriptLibrary.CallEmbeddedHtmlUtils(driver, "highlight", finder.FindElement(driver, locator));

            return null;
        }
    }
}
