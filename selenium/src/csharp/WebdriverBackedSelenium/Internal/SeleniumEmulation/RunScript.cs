using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class RunScript : SeleneseCommand
    {
        private JavaScriptLibrary library;

        public RunScript(JavaScriptLibrary js)
        {
            library = js;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            library.ExecuteScript(driver, locator);
            return null;
        }
    }
}
