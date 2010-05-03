using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class Highlight : SeleneseCommand
    {
        private JavaScriptLibrary library;
        private ElementFinder finder;

        public Highlight(ElementFinder elementFinder, JavaScriptLibrary js)
        {
            this.library = js;
            this.finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            library.CallEmbeddedHtmlUtils(driver, "highlight", finder.FindElement(driver, locator));

            return null;
        }
    }
}
